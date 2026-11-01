"""Nhạc trailer debut Bảo Khựa – viết hoàn toàn bằng code (numpy), không mẫu âm thanh có bản quyền.
120 BPM (1 phách = 0,5 s, 1 ô nhịp = 2 s), Rê thứ. Kiểu trap/phonk: kick + 808 + snare/clap + hi-hat cuộn + cowbell.
Mốc hình (giây): 0 mồi · 4 BÙNG NỔ · 14 game · 22 boss · 28 lớp (hạ lực) · 34–36 dồn · 36 CTA · 42.5 logo · 46 hết.
Chạy:  python3 music.py <ra.wav> [--evergreen]
"""
import sys, wave
import numpy as np

SR = 44100
BPM = 120
BEAT = 60 / BPM
DUR = 46.0
GAIN = 0.53
N = int(SR * DUR)
rng = np.random.default_rng(7)
mix = np.zeros((N, 2))


def t_(d):
    return np.arange(int(SR * d)) / SR


def place(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N or i + len(sig) <= 0:
        return
    s = sig[: max(0, N - i)] * gain
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    mix[i:i + len(s), 0] += s * l * 1.414
    mix[i:i + len(s), 1] += s * r * 1.414


def fft_filter(x, lo=None, hi=None):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.ones_like(f)
    if lo:
        m *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi:
        m *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, len(x))


def env(n, a=0.002, d=0.2, curve=6.0):
    t = np.arange(n) / SR
    e = np.exp(-t / max(d, 1e-4) * (curve / 6))
    att = np.clip(t / a, 0, 1) if a > 0 else 1
    return e * att


def note(n):  # số MIDI → Hz
    return 440 * 2 ** ((n - 69) / 12)


# ---------- nhạc cụ ----------
def kick(punch=1.0):
    t = t_(0.45)
    f = 45 + 130 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 7.5)
    click = rng.standard_normal(len(t)) * np.exp(-t * 400) * 0.35
    return np.tanh((s + click) * 2.2 * punch) * 0.9


def b808(n, length, glide_from=None):
    t = t_(length)
    f0 = note(n)
    f = f0 if glide_from is None else f0 + (note(glide_from) - f0) * np.exp(-t * 18)
    ph = 2 * np.pi * np.cumsum(np.full(len(t), 1.0) * f) / SR
    s = np.sin(ph) * np.exp(-t * 1.6) * np.clip(t / 0.004, 0, 1)
    s = np.tanh(s * 2.6) * 0.75
    rel = int(0.03 * SR)
    s[-rel:] *= np.linspace(1, 0, rel)
    return s


def snare():
    t = t_(0.32)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.6
    nz = fft_filter(rng.standard_normal(len(t)), lo=1500) * np.exp(-t * 16) * 0.9
    return np.tanh((tone + nz) * 1.6) * 0.7


def clap():
    t = t_(0.35)
    nz = fft_filter(rng.standard_normal(len(t)), lo=900, hi=6000)
    e = np.zeros(len(t))
    for k, off in enumerate([0, 0.011, 0.022, 0.034]):
        i = int(off * SR)
        e[i:] += np.exp(-(t[: len(t) - i]) * (90 if k < 3 else 14))
    return nz * e * 0.55


def hat(open_=False):
    t = t_(0.28 if open_ else 0.06)
    nz = fft_filter(rng.standard_normal(len(t)), lo=7000)
    return nz * np.exp(-t * (11 if open_ else 70)) * (0.32 if open_ else 0.26)


def cowbell(n, length=0.22):
    t = t_(length)
    f = note(n)
    sq = np.sign(np.sin(2 * np.pi * f * t)) * 0.5 + np.sign(np.sin(2 * np.pi * f * 1.48 * t)) * 0.5
    s = fft_filter(sq, lo=400, hi=5200) * np.exp(-t * 13) * np.clip(t / 0.002, 0, 1)
    return s * 0.28


def pad(notes, length, cutoff=1400):
    t = t_(length)
    s = np.zeros(len(t))
    for n in notes:
        for det in (-0.12, 0.0, 0.11):
            f = note(n + det)
            s += 2 * ((t * f) % 1) - 1   # răng cưa
    s = fft_filter(s / (len(notes) * 3), hi=cutoff)
    a = np.clip(t / 0.4, 0, 1) * np.clip((length - t) / 0.5, 0, 1)
    return s * a * 0.22


def riser(length, top=8000):
    t = t_(length)
    nz = rng.standard_normal(len(t))
    out = np.zeros(len(t))
    chunk = int(0.05 * SR)
    for i in range(0, len(t), chunk):
        k = i / len(t)
        out[i:i + chunk] = fft_filter(nz[i:i + chunk], lo=200 + k * 2000, hi=600 + k * top)
    sweep = np.sin(2 * np.pi * np.cumsum(220 + 1400 * (t / length) ** 2) / SR) * 0.18
    return (out * 0.5 + sweep) * (t / length) ** 2.2


def whoosh(length=0.6):
    t = t_(length)
    nz = fft_filter(rng.standard_normal(len(t)), lo=500, hi=7000)
    e = np.sin(np.pi * np.clip(t / length, 0, 1)) ** 2
    return nz * e * 0.45


def impact(size=1.0):
    t = t_(2.4)
    boom = np.sin(2 * np.pi * (38 + 60 * np.exp(-t * 9)) * t) * np.exp(-t * 2.2)
    nz = fft_filter(rng.standard_normal(len(t)), hi=3500) * np.exp(-t * 3.5) * 0.5
    crack = fft_filter(rng.standard_normal(len(t)), lo=2500) * np.exp(-t * 18) * 0.5
    return np.tanh((boom * 1.4 + nz + crack) * 1.5 * size) * 0.85


def tick():
    t = t_(0.03)
    return np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 220) * 0.35


def glitch(length=0.25):
    t = t_(length)
    sq = np.sign(np.sin(2 * np.pi * 70 * t)) * (rng.standard_normal(len(t)) > 0.6)
    return fft_filter(sq.astype(float), lo=300) * 0.25


def reverb(x, secs=1.6, wet=0.25):
    ir_t = t_(secs)
    ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 4.2)
    ir[0] = 1.0
    L = len(x) + len(ir)
    y = np.fft.irfft(np.fft.rfft(x, L) * np.fft.rfft(ir, L), L)[: len(x)]
    y /= np.max(np.abs(y)) + 1e-9
    return x * (1 - wet) + y * wet * np.max(np.abs(x))


# ---------- sắp xếp ----------
PROG = [50, 46, 41, 48]     # 808: D2, Bb1, F2, C2 (Dm – Bb – F – C)
CHORDS = [[62, 65, 69], [58, 62, 65], [65, 69, 72], [60, 64, 67]]
RIFF = [(0, 74), (3, 77), (6, 81), (8, 79), (11, 77), (14, 74)]   # cowbell trên 16 nốt móc kép của ô nhịp


def bar_beat(t0, t1, half=False, rolls=True, cow=True, cow_gain=1.0, b808_gain=1.0, kick_gain=1.0):
    bars = int(round((t1 - t0) / (4 * BEAT)))
    for b in range(bars):
        bt = t0 + b * 4 * BEAT
        root = PROG[(int(round((bt - 4.0) / 2))) % 4]
        # kick + 808 (kiểu trap)
        for st in ([0, 6, 10] if not half else [0, 10]):
            place(kick(), bt + st * BEAT / 4, 0.95 * kick_gain)
        place(b808(root, 1.15), bt, 0.9 * b808_gain)
        place(b808(root + 12 if b % 2 else root, 0.6, glide_from=root + 7), bt + 10 * BEAT / 4, 0.75 * b808_gain)
        # snare/clap ở phách 2 và 4 (nửa nhịp: chỉ phách 3)
        for st in ([4, 12] if not half else [8]):
            place(snare(), bt + st * BEAT / 4, 0.75)
            place(clap(), bt + st * BEAT / 4, 0.6, 0.15)
        # hi-hat móc đơn, cuộn tam liên cuối ô
        for st in range(0, 16, 2):
            place(hat(), bt + st * BEAT / 4, 0.8, -0.3 + 0.6 * ((st // 2) % 2))
        if rolls and b % 2 == 1:
            for k in range(6):
                place(hat(), bt + 3 * BEAT + k * BEAT / 6, 0.55 + k * 0.05, 0.25)
        place(hat(True), bt + 2 * BEAT + BEAT / 2, 0.5, 0.4)
        if cow:
            for st, n in RIFF:
                place(cowbell(n + (0 if b % 4 < 2 else -2)), bt + st * BEAT / 4, cow_gain, 0.2)


def main(out, evergreen=False):
    # 0–4: mồi – tim đập, tiếng đồng hồ, pad tối, dồn lên, im lặng trước khi nổ
    place(pad([50, 57, 62], 4.2, cutoff=600), 0, 1.0)
    for i in range(8):
        place(tick(), i * BEAT, 0.6 if i % 2 else 0.9)
    for i, at in enumerate([0.0, 1.0, 2.0, 2.5, 3.0, 3.25]):
        place(kick(0.6), at, 0.35 + i * 0.07)
    place(glitch(), 2.05, 0.8)
    place(glitch(0.4), 3.05, 0.9)
    place(riser(1.85), 2.0, 0.85)
    # 4: BÙNG NỔ
    place(impact(1.1), 4.0, 1.0)
    bar_beat(4.0, 14.0)
    place(pad([62, 65, 69], 10, cutoff=2200), 4.0, 0.5)
    # 14: game
    place(whoosh(), 13.6, 0.9)
    place(impact(0.7), 14.0, 0.6)
    bar_beat(14.0, 22.0, cow_gain=1.1)
    # 22: boss – mạnh hơn
    place(whoosh(0.5), 21.6, 0.9)
    place(impact(0.9), 22.0, 0.8)
    bar_beat(22.0, 28.0, cow_gain=1.25, b808_gain=1.15, kick_gain=1.1)
    for k in range(4):
        place(glitch(0.12), 22.0 + 1.75 + k * 2, 0.6)
    # 28: lớp học – nửa nhịp, nhẹ lại
    place(whoosh(), 27.6, 0.8)
    bar_beat(28.0, 34.0, half=True, rolls=False, cow=True, cow_gain=0.6)
    place(pad([62, 65, 69, 72], 6, cutoff=3000), 28.0, 0.7)
    # 34–36: dồn – snare cuộn, riser
    for k in range(16):
        place(snare(), 34.0 + k * BEAT / 4, 0.25 + k * 0.035)
    place(riser(1.95, top=10000), 34.0, 1.0)
    # 36: CTA
    place(impact(1.15), 36.0, 1.0)
    bar_beat(36.0, 42.0, cow_gain=1.2)
    place(pad([62, 65, 69], 6, cutoff=2600), 36.0, 0.5)
    # 42.5: logo – cú nổ cuối, đuôi ngân
    place(whoosh(0.45), 42.05, 0.9)
    place(impact(1.2), 42.5, 1.0)
    place(pad([50, 57, 62, 65], 3.5, cutoff=1800), 42.5, 0.8)
    for k in range(3):
        place(cowbell([74, 77, 81][k], 0.5), 42.5 + k * BEAT / 2, 0.9)

    y = mix.copy()
    for c in range(2):
        y[:, c] = reverb(y[:, c], 1.4, 0.16)
    y = np.tanh(y * 1.0)                       # nén nhẹ / bão hoà
    y *= 0.89 / (np.max(np.abs(y)) + 1e-9) * GAIN   # GAIN chỉnh để tích phân khoảng −14 LUFS
    fade = int(1.2 * SR)
    y[-fade:] *= np.linspace(1, 0, fade)[:, None]
    pcm = (y * 32767).astype(np.int16)
    with wave.open(out, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print('đã ghi', out, f'{DUR}s')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'music.wav', '--evergreen' in sys.argv)
