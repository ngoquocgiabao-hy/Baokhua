"""Nhạc "Đêm Vịnh Drill" – drill × vinahouse × nhạc Hoa (140 BPM, Son thứ), tự soạn bằng numpy/scipy, không dùng mẫu hay giai điệu có bản quyền.
Bảo góp ý 22/11 (bản music_th.py): bớt còi, chưa ưng giai điệu, pha drill, lấy cảm hứng nhạc đang viral (drill Việt từ 2025, không khí GTA VI).
- Đoạn có lời đọc: nhịp DRILL nửa nhịp – kick lệch phách, snare/vỗ tay ở phách 3, hi-hat cuộn chùm 3, 808 trượt cao độ theo hợp âm;
  chuông FM tối thổi câu móc, pad ấm kiểu thành phố đêm, tỳ bà gảy lệch phách, mõ; nhị chen vào khoảng nghỉ giữa câu nói.
- Drop: VINAHOUSE 4/4 bass nảy nặng + sub bơm theo kick + vỗ tay vang, vẫn giữ hi-hat cuộn drill; lead "tíu" thổi câu móc, nhị đáp; cồng mỗi drop.
- Đoạn dồn: trống dồn, riser, đàn tranh vuốt, ngắt 1 phách (bỏ còi hú).
Hợp âm Gm – Eb – Cm – D (Son thứ hoà âm, có Fa#). Câu móc mới tiết tấu 2-1-1-2-2 | 3-1-4 lặp mỗi ô, ô 4 vút lên Son để quay vòng.
Bố cục theo markers.json: acts[5], lines, drop2.   Chạy:  python3 story/music_dr.py <markers.json> <ra.wav>
"""
import json, os, subprocess, sys, wave
import numpy as np
from scipy.signal import lfilter
from scipy.ndimage import maximum_filter1d, uniform_filter1d

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'debut'))
import music as M   # fft_filter, reverb, riser, impact, whoosh, clap, snare, note

mk = json.load(open(sys.argv[1]))
OUT = sys.argv[2]
SR = M.SR
BPM = mk['bpm']; B = 60 / BPM; BAR = 4 * B; S16 = B / 4
DUR = mk['dur']; N = int(SR * DUR)
A1, A2, A3, A4, A5 = [a['t'] for a in mk['acts']]
END = DUR
D2 = mk.get('drop2', A4 + 8 * BAR)
LINES = mk['lines']
rng = np.random.default_rng(2211)
BUS = {k: np.zeros((N, 2)) for k in ('kick', 'sc', 'lead', 'fx', 'air', 'room', 'b808')}
KICKS = []
note, ff = M.note, M.fft_filter


def t_(d):
    return np.arange(max(1, int(SR * d))) / SR


def put(bus, sig, at, g=1.0, pan=0.0):
    i = int(round(at * SR))
    if i >= N or i + len(sig) <= 0:
        return
    if i < 0:
        sig, i = sig[-i:], 0
    s = sig[: N - i] * g
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    BUS[bus][i:i + len(s), 0] += s * l
    BUS[bus][i:i + len(s), 1] += s * r


def saw_ph(ph):
    return 2 * (ph % 1) - 1


def fade_edges(s, a=0.004, r=0.02):
    n = len(s); ia, ir = max(1, int(a * SR)), max(1, int(r * SR))
    s[:ia] *= np.linspace(0, 1, ia); s[-ir:] *= np.linspace(1, 0, ir)
    return s


# ---------- lọc thay đổi theo thời gian ----------
def biquad(fc, q, kind):
    w = 2 * np.pi * min(max(fc, 20), SR * 0.45) / SR
    a = np.sin(w) / (2 * q); c = np.cos(w)
    b = [(1 - c) / 2, 1 - c, (1 - c) / 2] if kind == 'lp' else [(1 + c) / 2, -(1 + c), (1 + c) / 2]
    A = [1 + a, -2 * c, 1 - a]
    return np.array(b) / A[0], np.array(A) / A[0]


def tv_filter(x, fc, kind='lp', q=0.9, blk=64):
    y = np.zeros_like(x)
    xv = x if x.ndim == 2 else x[:, None]; yv = y if y.ndim == 2 else y[:, None]
    for c in range(xv.shape[1]):
        zi = np.zeros(2)
        for i in range(0, len(x), blk):
            b, a = biquad(float(np.mean(fc[i:i + blk])), q, kind)
            yv[i:i + blk, c], zi = lfilter(b, a, xv[i:i + blk, c], zi=zi)
    return y


def sweep(bus, t0, t1, f0, f1, kind='lp', q=0.8):
    i0, i1 = int(t0 * SR), min(N, int(t1 * SR))
    if i1 > i0:
        fc = f0 * (f1 / f0) ** (np.arange(i1 - i0) / (i1 - i0))
        BUS[bus][i0:i1] = tv_filter(BUS[bus][i0:i1], fc, kind, q)


# ---------- đường cao độ cho nhạc cụ đơn âm (luyến, láy, rung) ----------
def pitch_curve(events, n, glide=0.035, scoop=0.6, vib=(5.8, 0.012), vib_delay=0.16, grace=None):
    """events: [(t, nốt, dài)] → (tần số theo mẫu, thời gian từ đầu nốt, độ to)."""
    lg = np.full(n, np.nan); since = np.full(n, 9.0); amp = np.zeros(n); dur = np.full(n, 1.0)
    for j, (t0, nt, d) in enumerate(events):
        i0, i1 = int(t0 * SR), min(n, int((t0 + d) * SR))
        if i1 <= i0:
            continue
        k = np.arange(i1 - i0) / SR
        lg[i0:i1] = np.log(note(nt))
        # láy: nốt hoa mỹ ngắn ở trên (cao hơn 2 cung) trước nốt dài
        if grace and d >= grace[0] and j % grace[1] == 0:
            gi = min(i1 - i0, int(0.045 * SR))
            lg[i0:i0 + gi] = np.log(note(nt + 2))
        since[i0:i1] = k; dur[i0:i1] = d
        a = np.clip(k / 0.012, 0, 1) * np.clip((d - k) / 0.035, 0, 1)
        amp[i0:i1] = np.maximum(amp[i0:i1], a)
    first = int(np.argmax(~np.isnan(lg)))
    idx = np.where(~np.isnan(lg), np.arange(n), first); np.maximum.accumulate(idx, out=idx)
    lg[:first] = lg[first]; lg = lg[idx]
    al = 1 - np.exp(-1 / (glide * SR))
    lf = lfilter([al], [1, al - 1], lg, zi=[lg[0] * (1 - al)])[0]
    lf += -scoop / 12 * np.log(2) * np.exp(-since / 0.05)          # vuốt lên vào nốt
    tt = np.arange(n) / SR
    v = vib[1] * np.sin(2 * np.pi * vib[0] * tt) * np.clip((since - vib_delay) / 0.2, 0, 1) * (dur > 0.25)
    f = np.exp(lf) * (1 + v + 0.0015 * np.sin(2 * np.pi * 0.7 * tt))
    return f, since, amp


def additive(f, amps_fn, nh):
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.zeros(len(f))
    for k in range(1, nh + 1):
        fk = f * k
        a = amps_fn(k, fk) * (fk < 15000)
        s += a * np.sin(k * ph)
    return s




def zheng(nt, L=1.6, bend=False):
    """Đàn tranh: dây gảy (hoạ âm tắt dần, hơi lệch), có thể nhấn rung."""
    t = t_(L)
    f0 = note(nt) * (1 + (0.012 * np.sin(2 * np.pi * 5 * t) * np.clip((t - 0.25) / 0.2, 0, 1) if bend else 0))
    ph = 2 * np.pi * np.cumsum(f0) / SR
    s = np.zeros(len(t))
    for k in range(1, 13):
        if note(nt) * k > 14000:
            break
        a = abs(np.sin(np.pi * k * 0.18)) / k ** 0.9
        s += a * np.sin(k * ph * np.sqrt(1 + 0.0003 * k * k)) * np.exp(-t * (1.3 + 0.55 * k))
    pick = ff(rng.standard_normal(len(t)), lo=1500, hi=8000) * np.exp(-t * 180) * 0.25
    return fade_edges((s * 0.5 + pick) * np.clip(t / 0.002, 0, 1), 0.001, 0.05) * 0.5


def zheng_gliss(t0, notes_up, span, g=0.8, pan=0.0):
    for i, nt in enumerate(notes_up):
        put('lead', zheng(nt, 1.2), t0 + i * span / len(notes_up), g * (0.6 + 0.4 * i / len(notes_up)), pan + 0.5 * (i / len(notes_up) - 0.5))


def gong(L=4.0, f=88, g=1.0):
    t = t_(L)
    rise = 1 + 0.06 * (1 - np.exp(-t * 3))                          # cồng kinh kịch: cao độ nhích lên
    s = np.zeros(len(t))
    for r, a, d in ((1, 1.0, 0.7), (1.47, 0.6, 0.9), (2.09, 0.5, 1.1), (2.56, 0.35, 1.4), (3.18, 0.3, 1.8), (4.1, 0.2, 2.4), (5.3, 0.12, 3.0)):
        s += a * np.sin(2 * np.pi * np.cumsum(f * r * rise) / SR) * np.exp(-t * d)
    wash = ff(rng.standard_normal(len(t)), lo=2500, hi=9000) * np.exp(-t * 1.6) * 0.18
    return fade_edges((np.tanh(s * 0.9) * 0.6 + wash) * np.clip(t / 0.004, 0, 1), 0.002, 0.3) * g


def muyu(f=1100):
    t = t_(0.06)
    return (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.58 * t)) * np.exp(-t * 70) * 0.25




def chat():
    t = t_(0.045)
    return ff(rng.standard_normal(len(t)), lo=8000) * np.exp(-t * 90) * 0.2


def ohat():
    t = t_(0.16)
    return fade_edges(ff(rng.standard_normal(len(t)), lo=7000) * np.exp(-t * 20) * 0.3, 0.0005, 0.02)


def tom(f0):
    t = t_(0.28)
    f = f0 * (1 + 0.6 * np.exp(-t * 28))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 10)
    return fade_edges(np.tanh(s * 1.5) * 0.55, 0.0005, 0.03)


def crash(L=2.4):
    t = t_(L)
    return fade_edges(ff(rng.standard_normal(len(t)), lo=3500) * np.exp(-t * 1.6) * 0.3, 0.001, 0.2)


def down(L=1.4):
    t = t_(L)
    nz = rng.standard_normal(len(t)); out = np.zeros(len(t)); ch = int(0.05 * SR)
    for i in range(0, len(t), ch):
        out[i:i + ch] = ff(nz[i:i + ch], lo=300, hi=9000 - 8000 * i / len(t))
    return fade_edges(out * (1 - t / L) ** 2 * 0.32, 0.005, 0.05)


def snroll(t0, L, g0=0.1, g1=0.7):
    t, k = t0, 0
    while t < t0 + L - 1e-6:
        p = (t - t0) / L
        step = S16 * 2 if p < 0.4 else (S16 if p < 0.8 else S16 / 2)
        sn = M.snare(); r = 1 + 0.8 * p
        sn = np.interp(np.arange(0, len(sn), r), np.arange(len(sn)), sn)
        put('fx', fade_edges(sn, 0.0005, 0.02), t, g0 + (g1 - g0) * p, 0.12 * (-1) ** k)
        t += step; k += 1


def hit(t, size=1.0, gong_g=0.0):
    put('fx', M.impact(size), t, 0.55 * size)
    put('fx', crash(), t, 0.85)
    put('fx', down(), t + 0.05, 0.45)
    if gong_g:
        put('air', gong(), t, gong_g)





# ================= NHẠC CỤ MỚI =================
_CACHE = {}


def cached(key, fn):
    if key not in _CACHE:
        _CACHE[key] = fn()
    return _CACHE[key]


def kick():                                           # kick vinahouse: thân dày, méo mạnh, "đập"
    t = t_(0.45)
    f = 46 + 260 * np.exp(-t * 38) + 40 * np.exp(-t * 8)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.2)
    click = ff(rng.standard_normal(len(t)), lo=2000, hi=10000) * np.exp(-t * 420) * 0.55
    k = np.tanh((body * 1.25 + click) * 4.0) * 0.8
    return fade_edges(ff(k, hi=12000), 0.0005, 0.04)


def bbass(nt, L, bright=1.0, slide=0):
    """Bass nảy: vuông + răng cưa + sub, đầu nốt vuốt lên 1,5 cung ("buôi"), lọc mở rồi đóng, bão hoà mạnh; slide: trượt xuống cuối câu."""
    def make():
        t = t_(L); f = note(nt)
        semis = -1.5 * np.exp(-t / 0.018) + (slide * np.clip((t - L * 0.35) / (L * 0.65), 0, 1) ** 1.5 if slide else 0)
        ph = np.cumsum(f * 2 ** (semis / 12)) / SR
        s = 0.6 * np.sign(np.sin(2 * np.pi * ph)) + 0.6 * saw_ph(ph * 1.003) + 1.1 * np.sin(np.pi * ph)
        fc = 280 + 1900 * bright * np.exp(-t / 0.05)
        y = tv_filter(s, fc, 'lp', 1.4, 32)
        e = np.exp(-t * (1.2 if slide else 2.2))
        return fade_edges(np.tanh(y * e * 3.2) * 0.62, 0.0015, 0.015)
    return cached(('b', nt, round(L, 4), bright, slide), make)


def sub(nt, L):
    def make():
        t = t_(L)
        return fade_edges(np.tanh(np.sin(2 * np.pi * note(nt) * t) * 1.5) * 0.6, 0.01, 0.03)
    return cached(('s', nt, round(L, 4)), make)


def supersaw(notes, L, cutoff=3200, att=0.004, dec=None):
    def make():
        t = t_(L); s = np.zeros(len(t))
        for nt in notes:
            for k, det in enumerate((-0.18, -0.1, -0.04, 0, 0.05, 0.11, 0.19)):
                s += saw_ph(note(nt + det) * t + k * 0.137)
        s = ff(s / (len(notes) * 7), hi=cutoff)
        e = np.clip(t / att, 0, 1) * (np.exp(-t / dec) if dec else 1)
        return fade_edges(s * e, 0.001, 0.03)
    return cached(('ss', tuple(notes), round(L, 4), cutoff, att, dec), make)


def vlead(events, length):
    """Lead vinahouse: 5 răng cưa lệch + vuông quãng 8 dưới, vuốt lên đầu nốt ("tíu"), lọc mở nhanh rồi khép (pluck)."""
    n = int(length * SR)
    f, since, amp = pitch_curve(events, n, glide=0.012, scoop=1.6, vib=(6.5, 0.006), vib_delay=0.2)
    s = np.zeros(n)
    for k, r in enumerate((0.991, 0.996, 1.0, 1.004, 1.009)):
        s += saw_ph(np.cumsum(f * r) / SR + k * 0.23)
    s += 0.5 * np.sign(np.sin(np.pi * np.cumsum(f) / SR))
    s /= 5.5
    y = tv_filter(s, 1200 + 6500 * np.exp(-since / 0.09), 'lp', 1.3, 64)
    env = amp * (0.35 + 0.65 * np.exp(-since / 0.22))
    return np.tanh(y * env * 2.0) * 0.75


def erhu(events, length):
    """Nhị 二胡 èrhú: vĩ vào chậm, luyến dài giữa các nốt, rung sâu, tiếng mũi của bầu đàn."""
    n = int(length * SR)
    f, since, amp = pitch_curve(events, n, glide=0.075, scoop=1.2, vib=(6.0, 0.022), vib_delay=0.12, grace=(6 * S16, 3))
    bow = np.clip(since / 0.07, 0, 1)
    env = lambda k, fk: (1 / k ** 0.85) * (0.6 + 0.9 * np.exp(-((fk - 900) / 380) ** 2) + 0.6 * np.exp(-((fk - 2600) / 700) ** 2)) * (fk > 180)
    s = additive(f, env, 26) * amp * (0.5 + 0.5 * bow)
    hair = ff(rng.standard_normal(n), lo=1500, hi=6000) * amp * 0.03 * (1 + 2 * np.exp(-since / 0.05))
    return np.tanh((s + hair) * 1.1) * 0.36


def _pluck(nt, L):
    def make():
        t = t_(L); f0 = note(nt); ph = 2 * np.pi * f0 * t
        s = sum(abs(np.sin(np.pi * k * 0.12)) / k * np.sin(k * ph) * np.exp(-t * (6 + 2.2 * k)) for k in range(1, 14) if f0 * k < 15000)
        pick = ff(rng.standard_normal(len(t)), lo=2500, hi=9000) * np.exp(-t * 260) * 0.3
        return fade_edges((s * 0.6 + pick) * np.clip(t / 0.0015, 0, 1), 0.001, 0.02) * 0.45
    return cached(('p', nt, round(L, 4)), make)


def pipa_trem(nt, L, g=1.0):                         # tỳ bà 琵琶 pípá vê (tremolo): gảy liên tục nốt móc kép chấm ba
    out = np.zeros(int(L * SR)); step = B / 6; k = 0
    while k * step < L - 0.03:
        p = _pluck(nt, min(0.22, L - k * step)); i = int(k * step * SR)
        out[i:i + len(p)] += p[:len(out) - i] * (0.75 + 0.25 * (k % 2))
        k += 1
    return fade_edges(out, 0.001, 0.03) * g


def aah(notes, L):                                    # hợp xướng "a~" (formant) cho đoạn mở / lặng
    t = t_(L); s = np.zeros(len(t))
    for nt in notes:
        vib = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * t + nt)
        s += saw_ph(np.cumsum(note(nt) * vib) / SR)
    X = np.fft.rfft(s); fr = np.fft.rfftfreq(len(s), 1 / SR)
    m = sum(g * np.exp(-((fr - fc) / (fc * 0.1)) ** 2) for fc, g in ((800, 1.0), (1150, 0.7), (2900, 0.25)))
    y = np.fft.irfft(X * m, len(s)); y /= np.max(np.abs(y)) + 1e-9
    return fade_edges(y * np.clip(t / 0.5, 0, 1) * 0.22, 0.01, 0.5)


def laser(f0=3400, f1=160, L=0.2):
    t = t_(L)
    f = f1 + (f0 - f1) * np.exp(-t * 18)
    return fade_edges(np.sin(2 * np.pi * np.cumsum(f) / SR + 1.5 * np.sin(2 * np.pi * 90 * t)) * np.exp(-t * 7) * 0.26, 0.001, 0.02)


def clapbig():
    return cached(('clap',), lambda: M.clap())



def bass808(events, length):
    """808 kiểu drill: sin bão hoà, trượt cao độ giữa các nốt (portamento), ngân dài rồi tắt dần."""
    n = int(length * SR)
    f, since, amp = pitch_curve(events, n, glide=0.07, scoop=0.0, vib=(5.0, 0.0), vib_delay=9)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph)
    env = amp * np.exp(-since * 0.7) * np.clip(since / 0.003, 0, 1)
    return np.tanh(s * env * 2.6) * 0.62


def bell(nt, L=1.2):
    """Chuông/piano tối kiểu drill: FM (điều biến tần số), chỉ số tắt nhanh, thêm quãng 8 dưới mềm."""
    def make():
        t = t_(L); f = note(nt)
        I = 2.4 * np.exp(-t * 7)
        s = np.sin(2 * np.pi * f * t + I * np.sin(2 * np.pi * 3.5 * f * t)) * np.exp(-t * 2.6)
        s += 0.35 * np.sin(np.pi * f * t) * np.exp(-t * 2.0)
        return fade_edges(s * np.clip(t / 0.002, 0, 1) * 0.3, 0.001, 0.05)
    return cached(('bell', nt, round(L, 3)), make)


# ================= HOÀ ÂM · GIAI ĐIỆU (Son thứ: Gm – Eb – Cm – D, có nốt Fa# của Son thứ hoà âm) =================
ROOT = [31, 27, 24, 26]                               # G1 Eb1 C1 D1 (bass nảy chơi quãng 8 trên: G2 Eb2 C2 D2)
CHORD = [[67, 70, 74], [63, 67, 70], [60, 63, 67], [62, 66, 69]]
PAD = [[55, 62, 67, 70], [51, 58, 63, 67], [48, 55, 60, 63], [50, 57, 62, 66]]
GLISS = [55, 58, 60, 62, 66, 67, 70, 72, 74, 78, 79, 82, 84, 86, 90, 91]   # ngũ cung Son + Fa# (vuốt đàn tranh)
HOOK = [   # câu móc mới: tiết tấu 2-1-1-2-2 | 3-1-4 lặp mỗi ô, ô 4 vút lên Son để quay vòng
    [(0, 74, 2), (2, 74, 1), (3, 70, 1), (4, 72, 2), (6, 74, 2), (8, 79, 3), (11, 77, 1), (12, 74, 4)],
    [(0, 70, 2), (2, 70, 1), (3, 67, 1), (4, 70, 2), (6, 72, 2), (8, 74, 3), (11, 72, 1), (12, 70, 4)],
    [(0, 72, 2), (2, 72, 1), (3, 67, 1), (4, 70, 2), (6, 72, 2), (8, 75, 3), (11, 74, 1), (12, 72, 4)],
    [(0, 69, 2), (2, 69, 1), (3, 66, 1), (4, 69, 2), (6, 72, 2), (8, 74, 2), (10, 78, 2), (12, 79, 4)],
]
ERHU = [   # nhị đáp, trữ tình
    [(0, 74, 4), (4, 72, 2), (6, 70, 2), (8, 67, 6), (14, 70, 2)],
    [(0, 70, 4), (4, 72, 2), (6, 74, 2), (8, 75, 4), (12, 74, 4)],
    [(0, 72, 4), (4, 70, 2), (6, 67, 2), (8, 63, 4), (12, 67, 4)],
    [(0, 66, 3), (3, 67, 1), (4, 69, 4), (8, 74, 6), (14, 72, 1), (15, 70, 1)],
]
DRILL808 = [   # 808 nhịp drill theo hợp âm (vị trí móc kép, quãng so với gốc, độ dài) – có cú trượt quãng 8
    [(0, 0, 6), (6, 0, 4), (10, 12, 2), (12, 0, 4)],
    [(0, 0, 7), (7, 0, 3), (10, 0, 6)],
    [(0, 0, 6), (6, 0, 4), (10, 7, 2), (12, 0, 4)],
    [(0, 0, 6), (6, 0, 5), (11, 12, 2), (13, 0, 3)],
]


def bars(t0, t1):
    k = 0
    while t0 + k * BAR < t1 - 1e-6:
        yield k, t0 + k * BAR
        k += 1


def nbar(t0, t1):
    return int(round((t1 - t0) / BAR))


def rolls(bt, k, g=0.9):                             # hi-hat cuộn kiểu drill: chùm 3 (móc kép chấm ba) và móc tam
    if k % 2 == 1:
        for j in range(6):
            put('fx', chat(), bt + 3 * B + j * B / 6, g * (1.0 + 0.15 * j), 0.3)
    else:
        for j in range(4):
            put('fx', chat(), bt + 6 * S16 + j * S16 / 2, g * 1.1, -0.3)


def drums(t0, t1, cut_last=False, fills=True, clap_g=0.9, drill_rolls=True):   # vinahouse 4/4 (drop)
    KK = cached(('kick',), kick)
    for k, bt in bars(t0, t1):
        last = cut_last and bt + BAR >= t1 - 1e-6
        for b in range(4):
            tb = bt + b * B
            if last and b == 3:
                continue
            put('kick', KK, tb); KICKS.append(tb)
            put('sc', chat(), tb + S16, 0.26, -0.3); put('sc', chat(), tb + 3 * S16, 0.36, 0.3)
            put('fx', ohat(), tb + 2 * S16, 0.75, 0.2)
            if b in (1, 3):
                put('room', clapbig(), tb, clap_g, -0.08); put('fx', M.snare(), tb, 0.25, 0.08)
        if drill_rolls and not last and not (fills and k % 4 == 3):
            rolls(bt, k, 0.8)
        if fills and k % 4 == 3 and not last:
            for i, f0 in enumerate((250, 210, 175, 140)):
                put('fx', tom(f0), bt + 3 * B + i * S16, 0.65, 0.35 - 0.23 * i)


def drill_drums(t0, t1, cut_last=False, wood=True, g=1.0):   # drill nửa nhịp: kick lệch, snare ở phách 3, hi-hat cuộn
    KK = cached(('kick',), kick)
    for k, bt in bars(t0, t1):
        last = cut_last and bt + BAR >= t1 - 1e-6
        for s in ([0, 10] if k % 2 == 0 else [0, 6, 11]):
            if last and s >= 12:
                continue
            put('kick', KK, bt + s * S16, 0.85 * g); KICKS.append(bt + s * S16)
        put('room', clapbig(), bt + 8 * S16, 0.95 * g, -0.05); put('fx', M.snare(), bt + 8 * S16, 0.38 * g, 0.05)
        if k % 2 == 1 and not last:
            put('fx', M.snare(), bt + 14 * S16, 0.16 * g, 0.1)
        for s in range(0, 16, 2):
            if last and s >= 12:
                continue
            put('fx', chat(), bt + s * S16, (1.6 if s % 4 == 0 else 1.2) * g, 0.25)
        if not last:
            rolls(bt, k, g)
        if wood:
            put('sc', muyu(1300), bt + 3 * S16, 0.6 * g, -0.45); put('sc', muyu(1050), bt + 11 * S16, 0.55 * g, -0.45)


def line808(t0, t1, g=1.0, cut_last=False):          # 808 nhịp drill theo hợp âm, trượt giữa các nốt
    ev = []
    for k, bt in bars(t0, t1):
        last = cut_last and bt + BAR >= t1 - 1e-6
        for s, iv, d in DRILL808[k % 4]:
            if last and s >= 12:
                continue
            ev.append((bt - t0 + s * S16, ROOT[k % 4] + 12 + iv, d * S16 * 0.97))
    if ev:
        put('b808', bass808(ev, t1 - t0 + 0.3), t0, g)


def bassline(t0, t1, g=1.0, cut_last=False, bright=1.0, subg=0.3):   # bass nảy vinahouse (drop)
    for k, bt in bars(t0, t1):
        r = ROOT[k % 4]
        last = cut_last and bt + BAR >= t1 - 1e-6
        for b in range(4):
            if last and b == 3:
                continue
            tb = bt + b * B
            end_phrase = (k % 4 == 3 and b == 3)
            up = 12 if (k % 2 == 1 and b == 2) else 0
            put('sc', bbass(r + 12 + up, S16 * (2.6 if end_phrase else 1.8), bright, slide=-12 if end_phrase else 0), tb + 2 * S16, 1.0 * g)
            if b in (1, 3) and not end_phrase:
                put('sc', bbass(r + 12, S16 * 0.8, bright * 0.8), tb + 3 * S16, 0.55 * g)
        if subg:
            put('sc', sub(r + 12, BAR - 0.01), bt, subg * g)


def pads(t0, t1, g=0.2, cutoff=1800, att=0.08):
    for k, bt in bars(t0, t1):
        put('sc', supersaw(PAD[k % 4], BAR + 0.06, cutoff=cutoff, att=att), bt, g)


def stabs(t0, t1, g=0.2):
    for k, bt in bars(t0, t1):
        for b in (0, 2):
            put('sc', supersaw([x + 12 for x in CHORD[k % 4]], 0.14, cutoff=5200, dec=0.05), bt + b * B + 2 * S16, g, 0.2 * (-1) ** b)


def pipa_pluck(t0, t1, g=0.4):                        # tỳ bà gảy nốt hợp âm theo nhịp drill (lệch phách)
    for k, bt in bars(t0, t1):
        ch = CHORD[k % 4]
        for s, j in ((3, 2), (6, 1), (11, 2), (14, 0)):
            put('lead', _pluck(ch[j] + 12, 0.5), bt + s * S16, g, 0.35 * (-1) ** s)


def bells(t0, t1, g=1.0, bars_only=None):
    for k, bt in bars(t0, t1):
        if bars_only is not None and (k % 4) not in bars_only:
            continue
        for s, nt, d in HOOK[k % 4]:
            put('lead', bell(nt, max(0.5, d * S16 + 0.4)), bt + s * S16, g, -0.1)


def phrase(inst, t0, t1, g=1.0, octave=0, bars_only=None, pan=0.0):
    tab = HOOK if inst == 'lead' else ERHU
    for k, bt in bars(t0, t1):
        if bars_only is not None and (k % 4) not in bars_only:
            continue
        ev = [(s * S16, nt + octave, d * S16 * (0.9 if inst == 'lead' else 0.98)) for s, nt, d in tab[k % 4]]
        sig = (vlead if inst == 'lead' else erhu)(ev, BAR + 0.15)
        put('lead', sig, bt, g, pan)
        if inst == 'lead':
            put('lead', sig * 0.26, bt + 3 * S16, 1.0, -0.6)
            put('lead', sig * 0.14, bt + 6 * S16, 1.0, 0.6)


def lick(t0, gap, g=0.75, sec=A1):                    # nhị chen vào khoảng nghỉ giữa 2 câu nói: chỉ nốt trong hợp âm
    k = int((t0 - sec) // BAR) % 4
    ch = CHORD[k]
    notes = [ch[2], ch[1]] if gap < 0.8 else [ch[0] + 12, ch[2], ch[1]]
    q = np.ceil((t0 - sec) / S16) * S16 + sec
    ev, t = [], 0.0
    for j, nt in enumerate(notes):
        d = S16 * 1.5 if j < len(notes) - 1 else max(S16 * 2, min(gap - t - 0.05, B * 1.6))
        ev.append((t, nt, d)); t += d
    put('lead', erhu(ev, t + 0.2), q, g, 0.3)


def hitx(t, size=1.0, gong_g=0.0, zap=True):
    hit(t, size, gong_g)
    if zap:
        put('fx', laser(3400), t + B, 0.4, 0.4)


def build_up(t0, t1):                                 # đoạn dồn: trống dồn, riser, đàn tranh vuốt, ngắt 1 phách (không còi)
    L = t1 - t0
    snroll(t0, L - B, 0.08, 0.8)
    put('fx', M.riser(L, top=11000), t0, 0.8)
    zheng_gliss(t1 - B * 1.15, GLISS[2:16], B * 0.95, 0.8, -0.2)
    put('fx', crash(1.0)[::-1].copy(), t1 - 1.0, 0.6)


# ================= BỐ CỤC =================
# Phần 1: không khí thành phố đêm (pad cổ điển ấm) + chuông drill thổi câu móc, 808 trượt, nhịp drill lọc dần mở; nhị đáp ô 4
put('air', gong(4.0, 70), 0.0, 0.4)
zheng_gliss(0.0, GLISS[4:14], 0.42, 0.6)
pads(A1, A2, g=0.22, cutoff=2200, att=0.35)
drill_drums(A1, A2, wood=False, g=0.85)
line808(A1, A2, g=0.85)
bells(A1, A2, g=1.0)
phrase('erhu', A1, A2, g=0.7, bars_only=(3,))
snroll(A2 - B * 2, B * 2, 0.05, 0.35)
put('fx', crash(0.9)[::-1].copy(), A2 - 0.9, 0.45)
# Phần 2: groove drill (chừa chỗ cho giọng) – 808, tỳ bà gảy lệch phách, mõ; nhị chen vào khoảng nghỉ; 2 ô cuối dồn → ngắt 1 phách → DROP
build = 2 * BAR if nbar(A2, A3) >= 6 else BAR
drill_drums(A2, A3, cut_last=True, wood=True)
line808(A2, A3, g=1.0, cut_last=True)
pads(A2, A3, g=0.14, cutoff=1500, att=0.3)
pipa_pluck(A2, A3 - build, g=0.5)
for a, b2 in zip(LINES, LINES[1:]):
    gap = b2['t0'] - a['t1']
    if A2 <= a['t1'] < A3 - build and gap >= 0.45:
        lick(a['t1'] + 0.04, gap, 0.75, A2)
build_up(A3 - build, A3)
# Phần 3: DROP 1 – vinahouse 4/4 bass nặng + hi-hat cuộn drill, lead thổi câu móc, nhị đáp ô 4, cồng
hitx(A3, 1.15, gong_g=0.7)
drums(A3, A4)
bassline(A3, A4)
pads(A3, A4, g=0.15, cutoff=2400)
stabs(A3, A4)
phrase('lead', A3, A4, g=1.0, octave=12)
phrase('erhu', A3, A4, g=0.45, octave=0, bars_only=(3,))
put('fx', M.whoosh(0.5), A4 - 0.48, 0.7)
# Phần 4: phần dài thì về nhịp drill (chuông + nhị) rồi dồn vào DROP 2; phần ngắn thì drop luôn
if A4 + 3 * BAR <= D2 <= A5 - 2 * BAR:
    pre = D2
elif A5 - A4 >= 10 * BAR:
    pre = A4 + 8 * BAR
else:
    pre = A4
if pre > A4:
    drill_drums(A4, pre, cut_last=True, wood=True)
    line808(A4, pre - BAR, g=1.0)
    pads(A4, pre, g=0.16, cutoff=1600, att=0.3)
    bells(A4, pre - BAR, g=0.8, bars_only=(0, 1))
    phrase('erhu', A4, pre - BAR, g=0.7, bars_only=(2, 3))
    for a, b2 in zip(LINES, LINES[1:]):
        gap = b2['t0'] - a['t1']
        if A4 <= a['t1'] < pre - BAR and gap >= 0.45:
            lick(a['t1'] + 0.04, gap, 0.7, A4)
    build_up(pre - BAR, pre)
hitx(pre, 1.05, gong_g=0.55)
drums(pre, A5, cut_last=True)
bassline(pre, A5, cut_last=True)
pads(pre, A5, g=0.15, cutoff=2600)
stabs(pre, A5)
phrase('lead', pre, A5, g=0.95, octave=12)
phrase('erhu', pre, A5, g=0.5, octave=0)
snroll(A5 - B, B, 0.2, 0.6)
# Phần 5: drop cuối, kết bằng cồng + nhị ngân + 808 trượt xuống + đàn tranh vuốt
hitx(A5, 1.2, gong_g=0.6)
tail = BAR
drums(A5, END - tail)
bassline(A5, END - tail)
stabs(A5, END - tail)
pads(A5, END - tail, g=0.16, cutoff=2600)
phrase('lead', A5, END - tail, g=1.0, octave=12)
hitx(END - tail, 0.9, gong_g=0.8, zap=False)
put('b808', bass808([(0, 43, tail * 0.3), (tail * 0.3, 31, tail * 0.6)], tail), END - tail, 0.9)
put('fx', supersaw(PAD[0], tail, cutoff=2200, att=0.01), END - tail, 0.3)
put('lead', erhu([(0, 79, tail * 0.45), (tail * 0.45, 74, tail * 0.5)], tail), END - tail, 0.85)
zheng_gliss(END - tail + B, GLISS[15:5:-1], B * 1.2, 0.6)

# ---------- vặn lọc kiểu DJ ----------
for bus in ('kick', 'sc', 'b808'):
    sweep(bus, A1, A2, 320, 9000, 'lp', 1.0)
    sweep(bus, A3 - build, A3, 30, 800, 'hp', 0.75)
    if pre > A4:
        sweep(bus, pre - BAR, pre, 30, 650, 'hp', 0.75)

# ---------- trộn ----------
pump = np.ones(N)
for k in KICKS:
    i = int(k * SR); L = min(N - i, int(B * SR))
    if L > 0:
        tt = np.arange(L) / SR
        pump[i:i + L] = np.minimum(pump[i:i + L], 1 - 0.9 * np.exp(-tt / 0.11))
pump = lfilter([0.25], [1, -0.75], pump, zi=[0.75])[0]
duck = 1 - 0.35 * (1 - pump)                                  # 808 chỉ né kick nhẹ
lead = BUS['lead'].copy()
for c in range(2):
    lead[:, c] = M.reverb(lead[:, c], 1.8, 0.24)
room = BUS['room'].copy()
for c in range(2):
    room[:, c] = M.reverb(room[:, c], 1.3, 0.38)
air = BUS['air'].copy()
for c in range(2):
    air[:, c] = M.reverb(air[:, c], 2.6, 0.35)
for k_, v_ in BUS.items():
    w_ = v_[int(A2 * SR):int(A3 * SR)]; w3 = v_[int(A3 * SR):int(A4 * SR)]
    print('mức', k_, round(20 * np.log10(np.sqrt((w_ ** 2).mean()) + 1e-9), 1), 'dB (drill)', round(20 * np.log10(np.sqrt((w3 ** 2).mean()) + 1e-9), 1), 'dB (drop 1)')
mix = (BUS['kick'] * 0.85 + BUS['sc'] * pump[:, None] * 0.95 + BUS['b808'] * duck[:, None] * 1.0
       + lead * (0.72 + 0.28 * pump[:, None]) * 1.6 + BUS['fx'] * 0.72 + room * 1.4 + air * 0.8)
for c in range(2):
    band = lfilter(*biquad(170, 0.7, 'lp'), lfilter(*biquad(65, 0.7, 'hp'), mix[:, c]))
    mix[:, c] += 0.5 * band
mix -= mix.mean(0)
tt = np.arange(N) / SR
xs_, ys_ = [0, A2 - 0.01, A2, A3 - build, A3 - 0.01, A3], [0.85, 0.9, 0.8, 0.8, 0.95, 1.0]
if pre > A4:
    xs_ += [A4, pre - 0.01, pre]; ys_ += [0.85, 0.9, 1.0]
xs_ += [END]; ys_ += [1.0]
mix *= np.interp(tt, xs_, ys_)[:, None]
pk = np.max(np.abs(mix), 1)
thr = np.percentile(maximum_filter1d(pk, size=int(0.006 * SR)), 99.0)
hold = maximum_filter1d(pk, size=int(0.05 * SR))
g = uniform_filter1d(np.minimum(1, thr / (hold + 1e-9)), size=int(0.02 * SR))
mix *= g[:, None]
print('giới hạn đỉnh: hạ tối đa', round(20 * np.log10(g.min()), 1), 'dB')
mix *= 0.89 / (np.max(np.abs(mix)) + 1e-9)
fade = int(1.5 * SR)
mix[-fade:] *= (np.linspace(1, 0, fade) ** 1.5)[:, None]
mix[: int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR))[:, None]
assert np.isfinite(mix).all()
raw = OUT + '.raw.wav'
with wave.open(raw, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
js = json.loads(r.stderr[r.stderr.rindex('{'):r.stderr.rindex('}') + 1])
af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
      f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', raw, '-af', af, '-ar', str(SR), '-c:a', 'pcm_s16le', OUT], check=True)
os.remove(raw)
print('đã ghi', OUT, f'{DUR:.2f}s', BPM, 'BPM · phần', [round(a, 2) for a in (A1, A2, A3, A4, A5)], '· drop 2', round(pre, 2))
