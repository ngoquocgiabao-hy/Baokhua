"""Nhạc vinahouse kiểu remix nhạc Hoa (140 BPM) cho "Hồ sơ thật" bản 4 – tự soạn bằng numpy/scipy, không dùng mẫu hay giai điệu có bản quyền.
Nhạc cụ Trung Hoa tổng hợp: kèn suona 唢呐 suǒnà (tiếng mũi, luyến, rung), sáo trúc 笛子 dízi (hơi thở, rung màng, láy), đàn tranh 古筝 gǔzhēng
(gảy, vuốt dây), cồng 锣 luó, mõ 木鱼 mùyú. Nền vinahouse: kick nện, bass ngắt "ùm-ba", vỗ tay, hi-hat mở, hợp âm nảy, bơm theo kick.
Hợp âm 4–5–3–6 (F – G – Em – Am, "vòng hợp âm vàng" của nhạc pop châu Á), giai điệu ngũ cung La thứ, câu hỏi – câu đáp lặp lại để dễ nhớ.
Bố cục theo markers.json (build_story4.mjs): acts[5], lines (để sáo chen vào khoảng nghỉ giữa các câu nói), drop2 (cảnh 消消乐), hits.
Chạy:  python3 story/music_cn.py <markers.json> <ra.wav>
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
rng = np.random.default_rng(2026)
BUS = {k: np.zeros((N, 2)) for k in ('kick', 'sc', 'lead', 'fx', 'air')}
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


def suona(events, length):
    """Kèn suona: nhiều hoạ âm, 2 vùng cộng hưởng (tiếng mũi), vào nốt vuốt lên, rung sâu."""
    n = int(length * SR)
    f, since, amp = pitch_curve(events, n, glide=0.03, scoop=0.9, vib=(6.2, 0.016), vib_delay=0.14, grace=(4 * S16, 2))
    bright = 1 + 0.5 * np.exp(-since / 0.08)
    env = lambda k, fk: (0.55 * np.exp(-((fk - 1250) / 520) ** 2) + 0.42 * np.exp(-((fk - 2700) / 750) ** 2) + 0.16 / k ** 0.4) * (bright if k > 3 else 1)
    s = additive(f, env, 24)
    s = np.tanh(s * 1.6) * amp
    breath = ff(rng.standard_normal(n), lo=2000, hi=7000) * amp * 0.035
    return (s + breath) * 0.42


def dizi(events, length):
    """Sáo trúc: gần sin, hơi thở, tiếng rung màng (dimo), láy, rung nhẹ."""
    n = int(length * SR)
    f, since, amp = pitch_curve(events, n, glide=0.025, scoop=0.4, vib=(5.2, 0.009), vib_delay=0.2, grace=(3 * S16, 1))
    env = lambda k, fk: (1.0, 0.32, 0.2, 0.09, 0.05, 0.03)[k - 1]
    s = additive(f, env, 6)
    ph = np.cumsum(f) / SR
    buzz = ff(rng.standard_normal(n), lo=2400, hi=6500) * ((0.5 + 0.5 * np.sin(2 * np.pi * ph)) ** 4) * 0.22
    breath = ff(rng.standard_normal(n), lo=900, hi=5000) * (0.05 + 0.25 * np.exp(-since / 0.06))
    tremolo = 1 + 0.06 * np.sin(2 * np.pi * 4.6 * np.arange(n) / SR) * np.clip((since - 0.2) / 0.2, 0, 1)
    return (s * 0.85 + buzz + breath) * amp * tremolo * 0.36


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


def kick():
    t = t_(0.42)
    f = 50 + 200 * np.exp(-t * 30)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5.8)
    click = ff(rng.standard_normal(len(t)), lo=1800, hi=9000) * np.exp(-t * 350) * 0.5
    return fade_edges(np.tanh((body * 1.2 + click) * 2.6) * 0.85, 0.0005, 0.03)


def bass(nt, L):
    t = t_(L)
    f = note(nt)
    s = sum(saw_ph(f * r * t + k * .31) for k, r in enumerate((0.996, 1.0, 1.005))) / 3
    sub = np.sin(2 * np.pi * f / 2 * t)
    bright = ff(s, hi=2400) * np.exp(-t * 24)
    dark = ff(s, hi=650)
    e = np.exp(-t * 2.5)
    return fade_edges(np.tanh((bright * 0.6 + dark * 0.75 + sub * 0.9) * e * 2.0) * 0.6, 0.002, 0.012)


def supersaw(notes, L, cutoff=3200, att=0.004, dec=None):
    t = t_(L)
    s = np.zeros(len(t))
    for nt in notes:
        for k, det in enumerate((-0.18, -0.1, -0.04, 0, 0.05, 0.11, 0.19)):
            s += saw_ph(note(nt + det) * t + k * 0.137)
    s = ff(s / (len(notes) * 7), hi=cutoff)
    e = np.clip(t / att, 0, 1) * (np.exp(-t / dec) if dec else 1)
    return fade_edges(s * e, 0.001, 0.03)


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


# ---------- hoà âm và giai điệu ----------
ROOT = [41, 43, 40, 45]                                 # F2 G2 E2 A2   (F – G – Em – Am)
CHORD = [[65, 69, 72], [67, 71, 74], [64, 67, 71], [69, 72, 76]]
PAD = [[53, 60, 65, 69], [55, 62, 67, 71], [52, 59, 64, 67], [57, 64, 69, 72]]
PENTA = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86, 88]   # ngũ cung La thứ (A C D E G)
# câu móc: 2 ô hỏi (F→G) – 2 ô đáp (Em→Am), ô 1 và ô 3 cùng tiết tấu để dễ nhớ
HOOK = [
    [(0, 76, 3), (3, 74, 1), (4, 72, 2), (6, 74, 2), (8, 76, 3), (11, 79, 1), (12, 81, 4)],
    [(0, 79, 2), (2, 76, 2), (4, 74, 3), (7, 76, 1), (8, 74, 2), (10, 72, 2), (12, 74, 4)],
    [(0, 76, 3), (3, 74, 1), (4, 72, 2), (6, 74, 2), (8, 76, 3), (11, 79, 1), (12, 79, 2), (14, 76, 2)],
    [(0, 81, 3), (3, 79, 1), (4, 76, 2), (6, 74, 2), (8, 72, 2), (10, 74, 1), (11, 72, 1), (12, 69, 4)],
]


def bars(t0, t1):
    k = 0
    while t0 + k * BAR < t1 - 1e-6:
        yield k, t0 + k * BAR
        k += 1


def nbar(t0, t1):
    return int(round((t1 - t0) / BAR))


def drums(t0, t1, cut_last=False, fills=True, wood=False, clap_g=0.85, hats=True):
    for k, bt in bars(t0, t1):
        last = cut_last and bt + BAR >= t1 - 1e-6
        for b in range(4):
            tb = bt + b * B
            if last and b == 3:
                continue
            put('kick', kick(), tb); KICKS.append(tb)
            if hats:
                put('sc', chat(), tb + S16, 0.3, -0.3); put('sc', chat(), tb + 3 * S16, 0.42, 0.3)
                put('fx', ohat(), tb + 2 * S16, 0.75, 0.2)
            if b in (1, 3):
                put('fx', M.clap(), tb, clap_g, -0.1); put('fx', M.snare(), tb, 0.22, 0.1)
            if wood:
                put('sc', muyu(1150 if b % 2 else 980), tb + (3 if b % 2 else 1) * S16, 0.75, -0.45)
        if fills and k % 4 == 3 and not last:
            for i, f0 in enumerate((230, 190, 160, 130)):
                put('fx', tom(f0), bt + 3 * B + i * S16, 0.7, 0.3 - 0.2 * i)


def bassline(t0, t1, g=1.0, cut_last=False):
    for k, bt in bars(t0, t1):
        r = ROOT[k % 4]
        last = cut_last and bt + BAR >= t1 - 1e-6
        for b in range(4):
            if last and b == 3:
                continue
            tb = bt + b * B
            up = 12 if (k % 2 == 1 and b == 3) else 0
            put('sc', bass(r + up, S16 * 1.7), tb + 2 * S16, 0.95 * g)
            put('sc', bass(r + up, S16 * 0.85), tb + 3 * S16, 0.5 * g)


def pads(t0, t1, g=0.25, cutoff=2000):
    for k, bt in bars(t0, t1):
        put('sc', supersaw(PAD[k % 4], BAR + 0.06, cutoff=cutoff, att=0.06), bt, g)


def stabs(t0, t1, g=0.26):
    for k, bt in bars(t0, t1):
        for b in range(4):
            put('sc', supersaw([x + 12 for x in CHORD[k % 4]], 0.16, cutoff=5200, dec=0.06), bt + b * B + 2 * S16, g, 0.15 * (-1) ** b)


def zheng_arp(t0, t1, g=0.5, dense=False):          # đàn tranh rải hợp âm (ngũ cung) – móc đơn hoặc móc kép
    for k, bt in bars(t0, t1):
        ch = CHORD[k % 4]
        pool = sorted({x for x in PENTA if any((x - c) % 12 == 0 for c in ch)} | {ch[0] + 12})
        pool = [x for x in pool if 64 <= x <= 88][:6]
        step = 1 if dense else 2
        for i in range(0, 16, step):
            nt = pool[(i // step) % len(pool)] if (i // step) % 8 < 4 else pool[-1 - (i // step) % 4]
            put('lead', zheng(nt, 0.7), bt + i * S16, g * (1 if i % 4 == 0 else 0.7), 0.35 * (-1) ** (i // step))


def phrase(inst, t0, t1, g=1.0, octave=0, start=0, bars_only=None):
    for k, bt in bars(t0, t1):
        if bars_only is not None and (k % 4) not in bars_only:
            continue
        ev = [(s * S16, nt + octave, d * S16 * 0.96) for s, nt, d in HOOK[(start + k) % 4]]
        sig = (suona if inst == 'suona' else dizi)(ev, BAR + 0.12)
        put('lead', sig, bt, g, -0.08 if inst == 'suona' else 0.12)


def lick(t0, gap, g=0.8, sec=A1):                    # sáo chen vào khoảng nghỉ giữa 2 câu nói
    k = int((t0 - sec) // BAR) % 4
    ch = CHORD[k]
    top = max(x for x in PENTA if x <= 81 and (x - ch[0]) % 12 in (0, 3, 4, 7))
    i = PENTA.index(top)
    notes = [PENTA[i - 2], PENTA[i - 1], top] if gap > 0.7 else [PENTA[i - 1], top]
    q = np.ceil((t0 - sec) / S16) * S16 + sec
    ev, t = [], 0.0
    for j, nt in enumerate(notes):
        d = S16 if j < len(notes) - 1 else max(S16 * 2, min(gap - t - 0.05, B * 1.5))
        ev.append((t, nt, d)); t += d
    put('lead', dizi(ev, t + 0.15), q, g, 0.35)


# ================= BỐ CỤC =================
# Phần 1 – sự thật trần trụi: cồng + đàn tranh vuốt dây mở màn, nhạc lọc kín rồi mở dần, sáo trúc thổi câu móc
put('air', gong(4.5, 80), 0.0, 0.5)
zheng_gliss(0.0, PENTA[3:12], 0.42, 0.7)
drums(A1, A2, fills=False, clap_g=0.55, hats=True)
bassline(A1, A2, g=0.75)
pads(A1, A2, g=0.2, cutoff=1500)
phrase('dizi', A1 + BAR * 0, A2, g=0.95, octave=0)
put('fx', M.riser(BAR), A2 - BAR, 0.5)
snroll(A2 - B * 2, B * 2, 0.06, 0.4)
# Phần 2 – 2 mẹo: groove vừa, mõ, đàn tranh rải; sáo chen vào khoảng nghỉ giữa câu nói; 2 ô cuối dồn → ngắt 1 phách
hit(A2, 0.55)
build = 2 * BAR if nbar(A2, A3) >= 6 else BAR
drums(A2, A3, cut_last=True, fills=False, wood=True)
bassline(A2, A3, g=0.75, cut_last=True)
pads(A2, A3, g=0.2, cutoff=1300)
zheng_arp(A2, A3 - build, g=0.42)
for a, b2 in zip(LINES, LINES[1:]):
    gap = b2['t0'] - a['t1']
    if A2 <= a['t1'] < A3 - build and gap >= 0.45:
        lick(a['t1'] + 0.04, gap, 0.8, A2)
snroll(A3 - build, build - B, 0.08, 0.75)
put('fx', M.riser(build, top=11000), A3 - build, 0.85)
zheng_gliss(A3 - B * 1.1, PENTA[2:14], B * 0.95, 0.85, 0.2)
put('fx', crash(1.0)[::-1].copy(), A3 - 1.0, 0.7)
# Phần 3 – giới thiệu: DROP 1 – cồng, kèn suona thổi câu móc; lượt 2: suona hỏi – sáo đáp
hit(A3, 1.1, gong_g=0.8)
drums(A3, A4)
bassline(A3, A4)
pads(A3, A4, g=0.2, cutoff=2400)
stabs(A3, A4)
nb3 = nbar(A3, A4)
phrase('suona', A3, A3 + 4 * BAR, g=1.0)
phrase('suona', A3 + 4 * BAR, A4, g=1.0, bars_only=(0, 1))
phrase('dizi', A3 + 4 * BAR, A4, g=1.0, octave=0, bars_only=(2, 3))
zheng_arp(A3, A4, g=0.3, dense=True)
put('fx', M.whoosh(0.5), A4 - 0.48, 0.7)
# Phần 4 – game: nửa đầu nhẹ (đàn tranh + sáo, nhường giọng), 1 ô dồn, DROP 2 đúng cảnh 消消乐
hit(A4, 0.8)
pre = D2 if A4 + 3 * BAR <= D2 <= A5 - 2 * BAR else A4 + 8 * BAR
drums(A4, pre, cut_last=True, fills=False, wood=True)
bassline(A4, pre, g=0.8, cut_last=True)
pads(A4, pre, g=0.2, cutoff=1800)
zheng_arp(A4, pre - BAR, g=0.42)
phrase('dizi', A4, pre - BAR, g=0.75, octave=0, bars_only=(0, 1))
for a, b2 in zip(LINES, LINES[1:]):
    gap = b2['t0'] - a['t1']
    if A4 <= a['t1'] < pre - BAR and gap >= 0.45:
        lick(a['t1'] + 0.04, gap, 0.7, A4)
snroll(pre - BAR, BAR - B, 0.1, 0.7)
put('fx', M.riser(BAR, top=10000), pre - BAR, 0.7)
zheng_gliss(pre - B * 1.1, PENTA[3:14], B * 0.95, 0.8, -0.2)
hit(pre, 1.0, gong_g=0.6)
drums(pre, A5, cut_last=True)
bassline(pre, A5, cut_last=True)
pads(pre, A5, g=0.2, cutoff=2600)
stabs(pre, A5)
phrase('suona', pre, A5, g=0.95)
phrase('dizi', pre, A5, g=0.35, octave=12, bars_only=(2, 3))
zheng_arp(pre, A5, g=0.28, dense=True)
snroll(A5 - B, B, 0.2, 0.6)
# Phần 5 – chơi thử: drop cuối, kết bằng cồng + suona ngân + đàn tranh vuốt xuống
hit(A5, 1.2, gong_g=0.7)
tail = BAR
drums(A5, END - tail)
bassline(A5, END - tail)
stabs(A5, END - tail)
pads(A5, END - tail, g=0.22, cutoff=2600)
phrase('suona', A5, END - tail, g=1.0)
hit(END - tail, 0.9, gong_g=0.9)
put('sc', bass(45, tail * 0.7), END - tail, 0.7)
put('fx', supersaw(PAD[3], tail, cutoff=2200, att=0.01), END - tail, 0.35)
put('lead', suona([(0, 81, tail - 0.5)], tail), END - tail, 0.9)
zheng_gliss(END - tail + B, PENTA[13:3:-1], B * 1.2, 0.6)

# ---------- vặn lọc kiểu DJ ----------
for bus in ('kick', 'sc'):
    sweep(bus, A1, A2, 260, 7000, 'lp', 1.1)          # phần 1 mở dần
    sweep(bus, A3 - build, A3, 30, 800, 'hp', 0.75)    # dồn: mỏng dần
    sweep(bus, pre - BAR, pre, 30, 600, 'hp', 0.75)

# ---------- trộn ----------
pump = np.ones(N)
for k in KICKS:
    i = int(k * SR); L = min(N - i, int(B * SR))
    if L > 0:
        tt = np.arange(L) / SR
        pump[i:i + L] = np.minimum(pump[i:i + L], 1 - 0.78 * np.exp(-tt / 0.09))
pump = lfilter([0.2], [1, -0.8], pump, zi=[0.8])[0]     # mượt, không gãy
lead = BUS['lead'].copy()
for c in range(2):
    lead[:, c] = M.reverb(lead[:, c], 1.7, 0.22)
air = BUS['air'].copy()
for c in range(2):
    air[:, c] = M.reverb(air[:, c], 2.6, 0.35)
for k_, v_ in BUS.items():
    w_ = v_[int(A3 * SR):int(A4 * SR)]
    print('mức', k_, round(20 * np.log10(np.sqrt((w_ ** 2).mean()) + 1e-9), 1), 'dB (drop 1)')
mix = BUS['kick'] * 0.8 + BUS['sc'] * pump[:, None] * 0.9 + lead * (0.7 + 0.3 * pump[:, None]) * 1.35 + BUS['fx'] * 0.75 + air * 0.8
for c in range(2):
    mix[:, c] = M.reverb(mix[:, c], 0.9, 0.05)
mix -= mix.mean(0)                                      # bỏ lệch DC
tt = np.arange(N) / SR
sec = np.interp(tt, [0, A2 - 0.01, A2, A3 - build, A3 - 0.01, A3, A4, pre - 0.01, pre, A5, END],
                [0.8, 0.88, 0.74, 0.74, 0.95, 1.0, 0.86, 0.9, 1.0, 1.0, 1.0])
mix *= sec[:, None]
# giới hạn đỉnh mượt (nhìn trước 3 ms, nhả 120 ms) thay cho méo tiếng
pk = np.max(np.abs(mix), 1)
thr = np.percentile(maximum_filter1d(pk, size=int(0.006 * SR)), 99.0)
hold = maximum_filter1d(pk, size=int(0.05 * SR))            # giữ đỉnh ±25 ms
g = uniform_filter1d(np.minimum(1, thr / (hold + 1e-9)), size=int(0.02 * SR))   # làm mượt ±10 ms → không méo
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
