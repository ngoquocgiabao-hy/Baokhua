"""Nhạc vinahouse cổ điển kiểu Hải Phòng (nhanh 140 BPM, bass ngắt nặng, kèn synth chói, trống dồn, laser) cho video có lồng tiếng.
Viết hoàn toàn bằng numpy/scipy, không dùng mẫu âm thanh hay giai điệu có bản quyền. Giai điệu ngũ cung La thứ tự soạn.
Bố cục theo mốc hình (markers.json do build_story4.mjs sinh: bpm, dur, acts[5], hits):
  phần 1: cả dàn trống + bass bị lọc kín rồi mở dần (kiểu DJ vặn filter), sáo ngũ cung móc tai
  phần 2: groove vừa (bass lọc tối, conga, shaker), chừa chỗ cho giọng; 2 ô nhịp cuối dồn: trống dồn lên cao, lọc mỏng dần, ngắt 1 phách
  phần 3: DROP – kick nện, bass ngắt "ùm-ba", kèn synth lượn, tít tít rải hợp âm, tom dồn cuối mỗi 4 ô nhịp, laser
  phần 4: drop biến tấu (nửa đầu sáo + tít, nửa sau kèn lên), nhấn ở các mốc hình
  phần 5: drop cuối rồi kèn ngân.
Chạy:  python3 story/music_vina.py <markers.json> <ra.wav>
"""
import json, os, subprocess, sys, wave
import numpy as np
from scipy.signal import lfilter

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'debut'))
import music as M   # fft_filter, reverb, riser, impact, whoosh, clap, snare, note

mk = json.load(open(sys.argv[1]))
OUT = sys.argv[2]
SR = M.SR
BPM = mk['bpm']; B = 60 / BPM; BAR = 4 * B; S16 = B / 4
DUR = mk['dur']; N = int(SR * DUR)
A1, A2, A3, A4, A5 = [a['t'] for a in mk['acts']]
END = DUR
rng = np.random.default_rng(140)
BUS = {k: np.zeros((N, 2)) for k in ('kick', 'sc', 'lead', 'fx')}
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


# ---------- bộ lọc thay đổi theo thời gian (vặn filter) ----------
def biquad(fc, q, kind):
    w = 2 * np.pi * min(fc, SR * 0.45) / SR
    a = np.sin(w) / (2 * q); c = np.cos(w)
    if kind == 'lp':
        b = [(1 - c) / 2, 1 - c, (1 - c) / 2]
    else:
        b = [(1 + c) / 2, -(1 + c), (1 + c) / 2]
    A = [1 + a, -2 * c, 1 - a]
    return np.array(b) / A[0], np.array(A) / A[0]


def tv_filter(x, fc, kind='lp', q=0.9, blk=128):
    """x: (n,) hoặc (n,2); fc: mảng tần số cắt theo mẫu."""
    y = np.zeros_like(x)
    chans = x if x.ndim == 2 else x[:, None]
    yv = y if y.ndim == 2 else y[:, None]
    for c in range(chans.shape[1]):
        zi = np.zeros(2)
        for i in range(0, len(x), blk):
            b, a = biquad(float(np.mean(fc[i:i + blk])), q, kind)
            yv[i:i + blk, c], zi = lfilter(b, a, chans[i:i + blk, c], zi=zi)
    return y


def sweep(bus, t0, t1, f0, f1, kind='lp', q=0.9):
    i0, i1 = int(t0 * SR), min(N, int(t1 * SR))
    if i1 <= i0:
        return
    fc = f0 * (f1 / f0) ** (np.arange(i1 - i0) / (i1 - i0))
    BUS[bus][i0:i1] = tv_filter(BUS[bus][i0:i1], fc, kind, q)


# ---------------- nhạc cụ ----------------
def kick():
    t = t_(0.5)
    f = 52 + 210 * np.exp(-t * 32)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5.2)
    click = ff(rng.standard_normal(len(t)), lo=1800, hi=9000) * np.exp(-t * 350) * 0.6
    return np.tanh((body * 1.2 + click) * 3.6) * 0.82


def bass(n, L):                                       # bass ngắt "căng": 3 răng cưa lệch + dao động phụ quãng tám dưới
    t = t_(L)
    f = note(n)
    s = sum(saw_ph(f * r * t + k * .31) for k, r in enumerate((0.995, 1.0, 1.006))) / 3
    sub = np.sin(2 * np.pi * f / 2 * t) * 0.9
    bright = ff(s, hi=2600) * np.exp(-t * 22)        # đầu nốt sáng, đuôi tối (giả bao lọc)
    dark = ff(s, hi=700)
    e = np.clip(t / 0.002, 0, 1) * np.clip((L - t) / 0.01, 0, 1) * np.exp(-t * 3)
    return np.tanh((bright * 0.7 + dark * 0.8 + sub) * e * 2.2) * 0.62


def supersaw(notes, L, cutoff=3200, att=0.004, dec=None):
    t = t_(L)
    s = np.zeros(len(t))
    for n in notes:
        for k, det in enumerate((-0.19, -0.11, -0.04, 0, 0.05, 0.12, 0.2)):
            s += saw_ph(note(n + det) * t + k * 0.137)
    s = ff(s / (len(notes) * 7), hi=cutoff)
    e = np.clip(t / att, 0, 1) * (np.exp(-t / dec) if dec else 1) * np.clip((L - t) / 0.03, 0, 1)
    return s * e


def brass_phrase(events, length):
    """Kèn synth đơn âm có luyến (portamento), rung, mở lọc "bwah" đầu mỗi nốt. events: [(t, nốt, dài)]."""
    n = int(length * SR)
    tgt = np.full(n, np.nan); since = np.full(n, 9.0); amp = np.zeros(n)
    for t0, nt, d in events:
        i0, i1 = int(t0 * SR), min(n, int((t0 + d) * SR))
        tgt[i0:i1] = np.log(note(nt))
        since[i0:i1] = np.arange(i1 - i0) / SR
        k = np.arange(i1 - i0) / SR
        amp[i0:i1] = np.maximum(amp[i0:i1], np.clip(k / 0.008, 0, 1) * np.clip((d - k) / 0.04, 0, 1))
    # nốt nghỉ: giữ cao độ trước đó
    idx = np.where(~np.isnan(tgt), np.arange(n), 0); np.maximum.accumulate(idx, out=idx)
    first = np.argmax(~np.isnan(tgt)); tgt[:first] = tgt[first]; tgt = tgt[idx]
    al = 1 - np.exp(-1 / (0.028 * SR))                # luyến 28 ms
    lf = lfilter([al], [1, al - 1], tgt, zi=[tgt[0] * (1 - al)])[0]
    vib = 0.007 * np.sin(2 * np.pi * 5.8 * np.arange(n) / SR) * np.clip((since - 0.18) / 0.15, 0, 1)
    f = np.exp(lf) * (1 + vib)
    s = np.zeros(n)
    for k, r in enumerate((0.988, 0.994, 0.998, 1.0, 1.003, 1.007, 1.012)):
        s += saw_ph(np.cumsum(f * r) / SR + k * 0.21)
    s /= 7
    fc = 900 + 4200 * np.clip(since / 0.05, 0, 1) * np.exp(-since * 3) + 1800
    y = tv_filter(s, fc, 'lp', 1.1, 64)
    return np.tanh(y * amp * 1.9) * 0.42


def tit(n, L=None):                                  # "tít": vuông cao, tắt nhanh
    L = L or S16 * 0.9
    t = t_(L)
    s = np.sign(np.sin(2 * np.pi * note(n) * t)) * 0.6 + saw_ph(note(n) * 2.001 * t) * 0.3
    return ff(s, lo=500, hi=7000) * np.exp(-t * 26) * np.clip(t / 0.001, 0, 1) * 0.26


def flute(n, L):
    t = t_(L + 0.12)
    vib = 1 + 0.0045 * np.sin(2 * np.pi * 5.6 * t) * np.clip((t - 0.15) / 0.2, 0, 1)
    ph = 2 * np.pi * np.cumsum(note(n) * vib) / SR
    s = np.sin(ph) + 0.28 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph) + 0.05 * np.sin(4 * ph)
    breath = ff(rng.standard_normal(len(t)), lo=note(n) * 1.5, hi=note(n) * 5) * 0.09
    a = np.clip(t / 0.03, 0, 1) * np.clip((L + 0.12 - t) / 0.12, 0, 1)
    return (s + breath) * a * 0.3


def chat():
    t = t_(0.045)
    return ff(rng.standard_normal(len(t)), lo=8000) * np.exp(-t * 90) * 0.22


def ohat():
    t = t_(0.17)
    return ff(rng.standard_normal(len(t)), lo=7000) * np.exp(-t * 20) * 0.32


def shaker():
    t = t_(0.07)
    return ff(rng.standard_normal(len(t)), lo=5000, hi=11000) * np.sin(np.pi * np.clip(t / 0.07, 0, 1)) ** 2 * 0.16


def tom(f0, L=0.3):
    t = t_(L)
    f = f0 * (1 + 0.7 * np.exp(-t * 28))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    nz = ff(rng.standard_normal(len(t)), lo=1500) * np.exp(-t * 60) * 0.25
    return np.tanh((s + nz) * 1.6) * 0.55


def conga(f0):
    t = t_(0.16)
    s = np.sin(2 * np.pi * f0 * (1 + 0.15 * np.exp(-t * 60)) * t) * np.exp(-t * 26)
    return s * 0.3


def crash(L=2.4):
    t = t_(L)
    return ff(rng.standard_normal(len(t)), lo=3500) * np.exp(-t * 1.6) * 0.34


def laser(f0=3200, f1=180, L=0.22):                  # tiếng "piu"
    t = t_(L)
    f = f1 + (f0 - f1) * np.exp(-t * 18)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR + 1.5 * np.sin(2 * np.pi * 90 * t))
    return s * np.exp(-t * 7) * 0.28


def down(L=1.4):
    t = t_(L)
    nz = rng.standard_normal(len(t)); out = np.zeros(len(t)); ch = int(0.05 * SR)
    for i in range(0, len(t), ch):
        k = i / len(t)
        out[i:i + ch] = ff(nz[i:i + ch], lo=300, hi=9000 - 8000 * k)
    return out * (1 - t / L) ** 2 * 0.35


def snroll(t0, L, g0=0.12, g1=0.75, pitch=True):     # trống dồn 8 → 16 → 32, cao dần
    t, k = t0, 0
    while t < t0 + L - 1e-6:
        p = (t - t0) / L
        step = S16 * 2 if p < 0.4 else (S16 if p < 0.8 else S16 / 2)
        sn = M.snare()
        if pitch:   # nâng cao độ: lấy mẫu thưa hơn
            r = 1 + 0.9 * p
            sn = np.interp(np.arange(0, len(sn), r), np.arange(len(sn)), sn)
        put('fx', sn, t, g0 + (g1 - g0) * p, 0.12 * (-1) ** k)
        t += step; k += 1


def hit(t, size=1.0, zap=True):
    put('fx', M.impact(size), t, 0.65 * size)
    put('fx', crash(), t, 0.95)
    put('fx', down(), t + 0.05, 0.55)
    if zap:
        for k in range(3):
            put('fx', laser(3600 - 600 * k, 160, 0.2), t + S16 * 2 * k + B, 0.5, 0.4 * (-1) ** k)


# ---------------- hoà âm, giai điệu ----------------
ROOT = [45, 41, 43, 40]                               # A2 F2 G2 E2 (Am – F – G – Em)
CHORD = [[69, 72, 76], [65, 69, 72], [67, 71, 74], [64, 67, 71]]
PAD = [[57, 64, 69, 72], [53, 60, 65, 69], [55, 62, 67, 71], [52, 59, 64, 67]]
HOOK = [   # ngũ cung La thứ (A C D E G), (vị trí móc kép, nốt, độ dài móc kép)
    [(0, 81, 2), (2, 79, 1), (3, 76, 1), (4, 79, 2), (6, 81, 1), (7, 84, 1), (8, 81, 3), (11, 79, 1), (12, 76, 2), (14, 74, 2)],
    [(0, 76, 2), (2, 74, 1), (3, 72, 1), (4, 74, 2), (6, 76, 2), (8, 72, 3), (11, 69, 1), (12, 72, 4)],
    [(0, 81, 2), (2, 79, 1), (3, 76, 1), (4, 79, 2), (6, 81, 1), (7, 84, 1), (8, 86, 3), (11, 84, 1), (12, 81, 2), (14, 79, 2)],
    [(0, 79, 2), (2, 76, 1), (3, 74, 1), (4, 76, 2), (6, 79, 2), (8, 76, 6), (14, 74, 1), (15, 72, 1)],
]


def bars(t0, t1):
    k = 0
    while t0 + k * BAR < t1 - 1e-6:
        yield k, t0 + k * BAR
        k += 1


def drums(t0, t1, cut_last=False, perc=True, fills=True, clap_g=0.9):
    for k, bt in bars(t0, t1):
        last = cut_last and bt + BAR >= t1 - 1e-6
        for b in range(4):
            tb = bt + b * B
            if last and b == 3:
                continue
            put('kick', kick(), tb)
            KICKS.append(tb)
            put('sc', chat(), tb + S16, 0.35, -0.3); put('sc', chat(), tb + 3 * S16, 0.45, 0.3)
            put('fx', ohat(), tb + 2 * S16, 0.85, 0.2)
            if b in (1, 3):
                put('fx', M.clap(), tb, clap_g, -0.1)
                put('fx', M.snare(), tb, 0.28, 0.1)
            if perc:
                for s in range(4):
                    put('sc', shaker(), tb + s * S16, (0.5, 0.8, 0.6, 1.0)[s], 0.45)
                if b in (0, 2):
                    put('sc', conga(330), tb + 3 * S16, 0.8, -0.4)
                else:
                    put('sc', conga(250), tb + 2 * S16 + S16 * 0.5, 0.6, -0.4)
        if fills and k % 4 == 3 and not last:            # tom dồn cuối mỗi 4 ô nhịp
            for i, f0 in enumerate((240, 200, 165, 135)):
                put('fx', tom(f0), bt + 3 * B + i * S16, 0.75, 0.3 - 0.2 * i)


def bassline(t0, t1, g=1.0, start=0, end_cut=False):
    for k, bt in bars(t0, t1):
        r = ROOT[(start + k) % 4]
        last = end_cut and bt + BAR >= t1 - 1e-6
        for b in range(4):
            if last and b == 3:
                continue
            tb = bt + b * B
            up = 12 if (k % 2 == 1 and b == 3) else 0
            put('sc', bass(r + up, S16 * 1.6), tb + 2 * S16, 0.95 * g)      # "ùm" ở phách lẻ
            put('sc', bass(r + up, S16 * 0.8), tb + 3 * S16, 0.55 * g)      # "ba" móc kép theo sau


def pads(t0, t1, g=0.3, cutoff=2000, start=0):
    for k, bt in bars(t0, t1):
        put('sc', supersaw(PAD[(start + k) % 4], BAR + 0.05, cutoff=cutoff, att=0.06), bt, g)


def stabs(t0, t1, g=0.32, start=0):
    for k, bt in bars(t0, t1):
        ch = CHORD[(start + k) % 4]
        for b in range(4):
            put('sc', supersaw([n + 12 for n in ch], 0.16, cutoff=5000, dec=0.06), bt + b * B + 2 * S16, g, 0.15 * (-1) ** b)


def tits(t0, t1, g=0.6, start=0):                   # rải hợp âm tít tít + vọng ping-pong
    pat = [0, 2, 1, 2]
    for k, bt in bars(t0, t1):
        ch = CHORD[(start + k) % 4]
        for i in range(16):
            if i % 4 == 0:
                continue
            n = ch[pat[i % 4]] + 12
            put('lead', tit(n), bt + i * S16, g, 0.5 * (-1) ** i)
            put('lead', tit(n), bt + i * S16 + 3 * S16, g * 0.3, -0.5 * (-1) ** i)


def hook(t0, t1, inst='brass', g=1.0, octave=0, start=0):
    if inst == 'brass':
        for k, bt in bars(t0, t1):
            ev = [(s * S16, n + octave, d * S16 * 0.97) for s, n, d in HOOK[(start + k) % 4]]
            put('lead', brass_phrase(ev, BAR + 0.1), bt, g, 0.0)
    else:
        for k, bt in bars(t0, t1):
            for s, n, d in HOOK[(start + k) % 4]:
                put('lead', flute(n + octave - 12, d * S16 * 0.95), bt + s * S16, 0.9 * g, -0.1)


def bars_n(t0, t1):
    return int(round((t1 - t0) / BAR))


# ---------------- bố cục ----------------
# Phần 1: dàn trống + bass lọc kín rồi mở dần, sáo ngũ cung (chất Hoa) móc tai
drums(A1, A2, fills=False, clap_g=0.6)
bassline(A1, A2, g=0.8)
pads(A1, A2, g=0.25, cutoff=1500)
hook(A1, A2, inst='flute', g=1.0)
put('fx', M.riser(BAR), A2 - BAR, 0.6)
snroll(A2 - B * 2, B * 2, 0.08, 0.45)
# Phần 2: groove, bass lọc tối, tít nhẹ; dồn 2 ô nhịp cuối → ngắt 1 phách → DROP
hit(A2, 0.6, zap=False)
nb2 = bars_n(A2, A3)
build = 2 * BAR if nb2 >= 6 else BAR
drums(A2, A3, cut_last=True, fills=False)
bassline(A2, A3, g=0.8, end_cut=True)
pads(A2, A3, g=0.22, cutoff=1300)
tits(A2, A3 - build, g=0.35)
snroll(A3 - build, build - B, 0.1, 0.8)
put('fx', M.riser(build, top=11000), A3 - build, 1.0)
put('fx', crash(1.0)[::-1] * 0.9, A3 - 1.0, 0.8)     # crash ngược hút vào drop
# Phần 3: DROP – kèn synth, bass ngắt, tít tít, hợp âm nảy, tom dồn, laser
hit(A3, 1.15)
drums(A3, A4)
bassline(A3, A4)
pads(A3, A4, g=0.24, cutoff=2600)
stabs(A3, A4, g=0.28)
tits(A3, A4, g=0.45)
hook(A3, A4, inst='brass', g=0.95)
put('fx', M.whoosh(0.5), A4 - 0.48, 0.8)
# Phần 4: game – nửa đầu sáo + tít (nhường giọng), nửa sau kèn lên lại
hit(A4, 0.9)
half = A4 + bars_n(A4, A5) // 2 * BAR
drums(A4, A5, cut_last=True)
bassline(A4, A5, end_cut=True)
pads(A4, A5, g=0.22, cutoff=2600)
stabs(A4, A5, g=0.24)
tits(A4, A5, g=0.42)
hook(A4, half, inst='flute', g=0.95, octave=12)
hook(half, A5, inst='brass', g=0.85)
for h in mk['hits']:
    if A4 + 0.5 < h < A5 - 0.5:
        put('fx', M.riser(B * 2), h - B * 2, 0.45)
        hit(h, 0.6)
snroll(A5 - B, B, 0.25, 0.7)
# Phần 5: drop cuối, kèn ngân
hit(A5, 1.25)
tail = BAR
drums(A5, END - tail)
bassline(A5, END - tail)
stabs(A5, END - tail, g=0.3)
tits(A5, END - tail, g=0.45)
pads(A5, END - tail, g=0.26, cutoff=2600)
hook(A5, END - tail, inst='brass', g=1.0)
hit(END - tail, 1.0)
put('sc', bass(33 + 12, tail * 0.8), END - tail, 0.7)
put('fx', supersaw(PAD[0], tail, cutoff=2200, att=0.01), END - tail, 0.4)
put('lead', brass_phrase([(0, 81, tail - 0.4)], tail), END - tail + B * 0.5, 0.9)

# ---------------- vặn lọc kiểu DJ ----------------
for bus in ('kick', 'sc'):
    sweep(bus, A1, A2, 280, 6000, 'lp', 1.2)        # phần 1: mở dần từ trầm kín
    sweep(bus, A3 - build, A3, 30, 900, 'hp', 0.8)    # dồn: mỏng dần trước drop

# ---------------- trộn ----------------
pump = np.ones(N)
for k in KICKS:
    i = int(k * SR); L = min(N - i, int(B * SR))
    if L > 0:
        tt = np.arange(L) / SR
        pump[i:i + L] = np.minimum(pump[i:i + L], 1 - 0.8 * np.exp(-tt / 0.09))
lead = BUS['lead'].copy()
for c in range(2):
    lead[:, c] = M.reverb(lead[:, c], 1.6, 0.24)
sc = BUS['sc'] * pump[:, None]
mix = BUS['kick'] * 1.05 + sc * 0.95 + lead * (0.6 + 0.4 * pump[:, None]) + BUS['fx'] * 0.8
for c in range(2):
    mix[:, c] = M.reverb(mix[:, c], 1.0, 0.07)
tt = np.arange(N) / SR                                 # phần 1–2 nhỏ hơn để drop bật lên
sec = np.interp(tt, [0, A2 - 0.01, A2, A3 - build, A3 - 0.01, A3, A4, A5 - 0.01, A5, END],
                [0.78, 0.86, 0.72, 0.72, 0.95, 1.0, 0.95, 0.95, 1.0, 1.0])
mix *= sec[:, None]
mix = np.tanh(mix * 1.15)
mix *= 0.9 / (np.max(np.abs(mix)) + 1e-9)
fade = int(1.5 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
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
print('đã ghi', OUT, f'{DUR:.2f}s', BPM, 'BPM, phần:', [round(a, 2) for a in (A1, A2, A3, A4, A5)])
