# Nhạc nền trailer "Bảo Khựa · Khách sạn Vịnh Ā Bǎo" – tự soạn bằng code (không dùng mẫu có bản quyền).
# 90 BPM, ngũ cung Rê (D E F# A B), 18 ô nhịp = 48 giây; mỗi ô nhịp = 80 khung hình ở 30 fps.
# Cắt cảnh rơi đúng đầu ô nhịp: 0, 2, 3, 6, 10, 13, 15 (ô nhịp).
import numpy as np, wave, sys
SR = 44100
BPM = 90; BEAT = 60 / BPM; BAR = 4 * BEAT; BARS = 18
N = int(BARS * BAR * SR) + SR
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N); VERB = np.zeros(N)

def at(t): return int(round(t * SR))
def add(buf, i, x, g=1.0):
    j = min(N, i + len(x)); buf[i:j] += x[:j - i] * g
def stereo(i, x, g=1.0, pan=0.0, send=0.0):
    add(L, i, x, g * np.sqrt(0.5 * (1 - pan))); add(R, i, x, g * np.sqrt(0.5 * (1 + pan)))
    if send: add(VERB, i, x, g * send)
def fft_filter(x, lo=None, hi=None):
    n = len(x); X = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1 / SR); m = np.ones_like(f)
    if lo: m *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi: m *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, n)

NOTE = {'D3': 146.83, 'E3': 164.81, 'F#3': 185.0, 'G3': 196.0, 'A3': 220.0, 'B3': 246.94,
        'D4': 293.66, 'E4': 329.63, 'F#4': 369.99, 'G4': 392.0, 'A4': 440.0, 'B4': 493.88,
        'D5': 587.33, 'E5': 659.26, 'F#5': 739.99, 'A5': 880.0, 'B5': 987.77,
        'D2': 73.42, 'E2': 82.41, 'F#2': 92.5, 'G2': 98.0, 'A2': 110.0, 'B2': 123.47}

def pluck(freq, dur=1.6, bright=0.5, bend=True, gain=1.9):
    """Karplus–Strong (gảy dây kiểu đàn tranh), có luyến nhẹ từ dưới lên đầu nốt."""
    n = int(dur * SR); P = max(2, int(SR / freq)); out = np.zeros(n)
    buf = rng.uniform(-1, 1, P); buf = fft_filter(buf, hi=2000 + 7000 * bright) if P > 64 else buf
    k = 0; decay = 0.996 - 0.002 * (freq > 600)
    while k < n:
        m = min(P, n - k); out[k:k + m] = buf[:m]
        nb = np.empty(P); nb[:-1] = 0.5 * (buf[:-1] + buf[1:]); nb[-1] = 0.5 * (buf[-1] + buf[0]); buf = nb * decay; k += P
    if bend:                                      # luyến: đọc lệch tốc độ trong 70 ms đầu
        t = np.arange(n); warp = t - 0.0042 * SR * (1 - np.exp(-t / (0.06 * SR)))   # bắt đầu non ~1 cung rồi lên đúng nốt
        out = np.interp(np.clip(warp, 0, n - 1), t, out)
    e = np.ones(n); a = int(0.004 * SR); e[:a] = np.linspace(0, 1, a)
    return out * e * 0.6 * gain

def pad(freqs, dur, att=0.6, rel=1.2):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for f in freqs:
        for det in (-0.004, 0.0, 0.005):
            ff = f * (1 + det)
            for h in range(1, 7): x += np.sin(2 * np.pi * ff * h * t + rng.uniform(0, 6)) / (h * 1.6) ** 1.3
    x = fft_filter(x, hi=1800)
    e = np.minimum(1, t / att) * np.minimum(1, np.maximum(0, (dur - t) / rel))
    return x * e / (len(freqs) * 2.6)

def bass(f, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t) + 0.08 * np.sin(6 * np.pi * f * t)
    e = np.minimum(1, t / 0.008) * np.exp(-t / 0.55) * np.minimum(1, (dur - t) / 0.03 + 0.0)
    return np.tanh(1.6 * x * e) * 0.5

def kick():
    n = int(0.5 * SR); t = np.arange(n) / SR
    f = 46 + 90 * np.exp(-t / 0.035); ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t / 0.28) + 0.4 * rng.uniform(-1, 1, n) * np.exp(-t / 0.004)
    return np.tanh(1.4 * x) * 0.62

def clap():
    n = int(0.35 * SR); t = np.arange(n) / SR; x = rng.uniform(-1, 1, n)
    x = fft_filter(x, lo=900, hi=3800); e = np.exp(-t / 0.09)
    for d in (0.0, 0.011, 0.023): e += 0.6 * np.exp(-np.maximum(0, t - d) / 0.006) * (t >= d)
    return x * e * 0.42

def hat(open_=False):
    n = int((0.25 if open_ else 0.07) * SR); t = np.arange(n) / SR
    x = fft_filter(rng.uniform(-1, 1, n), lo=7000); return x * np.exp(-t / (0.08 if open_ else 0.018)) * 0.32

def boom():
    n = int(2.5 * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * (38 + 30 * np.exp(-t / 0.2)) * t) * np.exp(-t / 0.9) + fft_filter(rng.uniform(-1, 1, n), hi=900) * np.exp(-t / 0.25) * 0.5
    return np.tanh(1.2 * x) * 0.8

def whoosh(dur=0.7):
    n = int(dur * SR); t = np.arange(n) / SR; x = fft_filter(rng.uniform(-1, 1, n), lo=500, hi=6000)
    return x * (t / dur) ** 2.2 * 0.35

def riser(dur):
    n = int(dur * SR); t = np.arange(n) / SR; k = t / dur
    x = fft_filter(rng.uniform(-1, 1, n), lo=1500) * k ** 2 * 0.35
    f = 220 * 2 ** (2.5 * k); x += np.sin(2 * np.pi * np.cumsum(f) / SR) * k ** 2 * 0.12
    return x

def bell(f, dur=2.5):
    n = int(dur * SR); t = np.arange(n) / SR
    x = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t / (dur * d)) for m, a, d in ((1, 1, .5), (2.76, .5, .25), (5.4, .25, .12), (8.9, .12, .06)))
    return x * 0.25

B = lambda bar, beat=0.0: at(bar * BAR + beat * BEAT)
CH = [('D3', 'F#3', 'A3', 'E4'), ('B2', 'D3', 'F#3', 'A3'), ('G2', 'B2', 'D3', 'F#3'), ('A2', 'E3', 'A3', 'B3')]   # D – Bm – G – A(sus)
ROOT = ['D2', 'B2', 'G2', 'A2']
K, CL = kick(), clap()

# ---- pad suốt bài (nghỉ ở ô cuối để còn đuôi) ----
for b in range(BARS - 1):
    c = CH[b % 4]; stereo(B(b), pad([NOTE[x] for x in c], BAR + 0.9, att=0.5 if b else 1.4), 0.42 if 13 <= b < 15 else 0.3, 0, 0.35)
stereo(B(17), pad([NOTE[x] for x in ('D3', 'A3', 'D4', 'F#4', 'E4')], 3.8, att=0.05, rel=2.8), 0.42, 0, 0.5)

# ---- trống ----
def groove(b, full=True, half=False):
    for beat in ((0, 2) if half else (0, 1.5, 2) if full else (0, 2)): stereo(B(b, beat), K, 0.85)
    if not half:
        for beat in (1, 3): stereo(B(b, beat), CL, 0.5, 0.1, 0.25)
    for e in range(8):
        if full or e % 2: stereo(B(b, e * 0.5), hat(e == 7), 0.55 if e % 2 else 0.3, -0.35 + 0.1 * (e % 3))
for e in range(8): stereo(B(1, e * 0.5), hat(), 0.5 if e % 2 else 0.25, 0.3)   # ô 2: lắc nhẹ cho bớt trống
stereo(B(2) - at(0.7), whoosh(0.7), 0.8, 0)
for b in range(2, 3): groove(b, full=False)
for b in range(3, 13): groove(b, full=True)
for b in range(13, 15): groove(b, full=False, half=True)
for b in range(15, 17): groove(b, full=True)
stereo(B(17), K, 0.9)

# ---- bass 8 phách ----
for b in list(range(3, 13)) + [15, 16]:
    r = NOTE[ROOT[b % 4]]
    for beat, mul in ((0, 1), (0.75, 1), (1.5, 2), (2, 1), (2.75, 1), (3.5, 1.5 if b % 4 == 3 else 2)):
        stereo(B(b, beat), bass(r * mul, 0.42), 0.55)
stereo(B(17), bass(NOTE['D2'], 2.2), 0.6)

# ---- giai điệu đàn gảy (ngũ cung) ----
PH = [['A4', '.', 'D5', '.', 'E5', 'F#5', 'E5', '.'],
      ['D5', '.', 'B4', '.', 'A4', '.', 'B4', 'D5'],
      ['E5', '.', 'D5', 'B4', '.', 'A4', 'B4', '.'],
      ['A4', '.', '.', 'E4', 'F#4', 'A4', '.', '.']]
PH2 = [['F#5', '.', 'E5', 'D5', '.', 'B4', 'D5', '.'],
       ['B4', '.', 'A4', '.', 'F#4', '.', 'A4', 'B4'],
       ['D5', '.', 'E5', '.', 'F#5', 'A5', 'F#5', '.'],
       ['E5', '.', '.', 'D5', 'B4', 'A4', '.', '.']]
def play(b0, ph, g=0.5, send=0.4):
    for i, bar in enumerate(ph):
        for e, n in enumerate(bar):
            if n != '.': stereo(B(b0 + i, e * 0.5), pluck(NOTE[n], 1.5, 0.55), g, -0.25 + 0.5 * ((e + i) % 2), send)
# mở đầu: chuông + vài nốt thưa
stereo(0, boom(), 0.5, 0, 0.3); stereo(0, bell(NOTE['D5']), 0.6, 0.2, 0.6)
for beat, n in ((1, 'A4'), (2, 'D5'), (2.5, 'E5'), (3, 'F#5')): stereo(B(0, beat), pluck(NOTE[n], 1.8, 0.4), 0.42, 0.3, 0.6)
for beat, n in ((0, 'E5'), (1.5, 'D5'), (2, 'B4'), (2.5, 'A4'), (3, 'B4'), (3.5, 'D5')): stereo(B(1, beat), pluck(NOTE[n], 1.8, 0.45), 0.55, -0.3, 0.6)
play(3, PH[:3], 0.36)
play(6, PH, 0.55); play(10, PH2[:3], 0.48)
# khoảng lặng HSK: rải hợp âm đi lên
for i, n in enumerate(['D4', 'F#4', 'A4', 'B4', 'D5', 'E5', 'F#5', 'A5', 'D4', 'E4', 'A4', 'B4', 'D5', 'F#5', 'A5', 'B5']):
    stereo(B(13, i * 0.5), pluck(NOTE[n], 1.2, 0.35), 0.38, -0.4 + 0.8 * (i % 2), 0.6)
play(15, PH2[:2], 0.55)
stereo(B(17), pluck(NOTE['D5'], 3.0, 0.4), 0.5, 0.2, 0.7); stereo(B(17, 0.02), pluck(NOTE['A4'], 3.0, 0.4), 0.45, -0.2, 0.7)
stereo(B(17), bell(NOTE['A5'], 3.0), 0.35, 0, 0.7)

# ---- hiệu ứng chuyển cảnh ----
for b in (3, 6, 10, 13): stereo(B(b) - at(0.7), whoosh(0.7), 0.9, 0)
stereo(B(15) - at(BAR), riser(BAR), 0.9, 0); stereo(B(15), boom(), 0.75, 0, 0.3)
stereo(B(6), bell(NOTE['A5'], 1.8), 0.3, -0.3, 0.6)

# ---- vang (tích chập với đuôi nhiễu tắt dần) ----
irn = int(1.8 * SR); ti = np.arange(irn) / SR; ir = rng.uniform(-1, 1, irn) * np.exp(-ti / 0.45); ir = fft_filter(ir, hi=5000); ir /= np.sqrt(np.sum(ir ** 2))
M = 1 << int(np.ceil(np.log2(N + irn))); wet = np.fft.irfft(np.fft.rfft(VERB, M) * np.fft.rfft(ir, M), M)[:N]
L += wet * 0.22; R += np.roll(wet, 331) * 0.22

# ---- tổng ----
st = np.stack([L, R], 1); st = fft_filter(st[:, 0], lo=28)[:, None] * [1, 0] + fft_filter(st[:, 1], lo=28)[:, None] * [0, 1]
st = st / np.percentile(np.abs(st), 99.7); st = np.tanh(st * 0.9) ; end = int(BARS * BAR * SR)
st = st[:end]; fade = int(1.2 * SR); st[-fade:] *= np.linspace(1, 0, fade)[:, None]
st *= 0.89 / np.max(np.abs(st))
out = sys.argv[1] if len(sys.argv) > 1 else 'music.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
print('ok', out, len(st) / SR, 's')
