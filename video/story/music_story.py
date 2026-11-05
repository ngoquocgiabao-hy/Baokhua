"""Nhạc cho video "Chuyện thật của 阿宝" – viết bằng code (numpy), không mẫu có bản quyền.
84 BPM (1 phách = 0,714 s, 1 ô nhịp = 2,857 s), La thứ → Đô trưởng. Piano + pad, trống nhẹ vào dần.
Mốc: 0 mở · 7,14 nhịp vào · 20 dồn · 24,29 thành tích · 30 cao trào "Ngôn ngữ tốt" · 35,71 lắng · 44,29 kết · 50 hết.
Chạy:  python3 music_story.py <ra.wav>
"""
import sys, wave
import numpy as np

SR = 44100
BPM = 84
B = 60 / BPM
BAR = 4 * B
DUR = 50.0
N = int(SR * DUR)
GAIN = 1.0
rng = np.random.default_rng(11)
mix = np.zeros((N, 2))


def t_(d):
    return np.arange(int(SR * d)) / SR


def place(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N:
        return
    s = sig[: N - i] * gain
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


def note(n):
    return 440 * 2 ** ((n - 69) / 12)


def piano(n, length=2.6, vel=1.0):
    t = t_(length)
    f = note(n)
    s = np.zeros(len(t))
    for k in range(1, 8):
        fk = f * k * (1 + 0.0004 * k * k)          # hơi lệch như dây đàn thật
        if fk > 12000:
            break
        decay = 1.6 + 0.9 * k + f / 500
        s += np.sin(2 * np.pi * fk * t) * np.exp(-t * decay) / k ** 1.4
    hammer = fft_filter(rng.standard_normal(len(t)), lo=1500, hi=6000) * np.exp(-t * 90) * 0.06
    att = np.clip(t / 0.004, 0, 1)
    rel = np.clip((length - t) / 0.15, 0, 1)
    return (s * 0.32 + hammer) * att * rel * vel


def pad(notes, length, cutoff=1800):
    t = t_(length)
    s = np.zeros(len(t))
    for n in notes:
        for det in (-0.07, 0.0, 0.08):
            f = note(n + det)
            s += np.sin(2 * np.pi * f * t + np.sin(2 * np.pi * 0.3 * t) * 0.4)
            s += 0.3 * (2 * ((t * f) % 1) - 1)
    s = fft_filter(s / (len(notes) * 3), hi=cutoff)
    a = np.clip(t / 0.8, 0, 1) * np.clip((length - t) / 0.9, 0, 1)
    return s * a * 0.10


def sub(n, length):
    t = t_(length)
    s = np.sin(2 * np.pi * note(n) * t) * np.clip(t / 0.02, 0, 1) * np.exp(-t * 0.9)
    rel = np.clip((length - t) / 0.08, 0, 1)
    return s * rel * 0.32


def kick(v=1.0):
    t = t_(0.4)
    f = 48 + 90 * np.exp(-t * 30)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8)
    return np.tanh(s * 1.6) * 0.55 * v


def rim():
    t = t_(0.12)
    s = fft_filter(rng.standard_normal(len(t)), lo=1800, hi=7000) * np.exp(-t * 60)
    return s * 0.18 + np.sin(2 * np.pi * 820 * t) * np.exp(-t * 80) * 0.08


def hat():
    t = t_(0.05)
    return fft_filter(rng.standard_normal(len(t)), lo=8000) * np.exp(-t * 80) * 0.10


def swell(length):
    t = t_(length)
    nz = fft_filter(rng.standard_normal(len(t)), lo=2500, hi=11000)
    return nz * (t / length) ** 3 * 0.35


def bell(n, length=2.5):
    t = t_(length)
    f = note(n)
    s = (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) + 0.2 * np.sin(2 * np.pi * f * 5.4 * t)) * np.exp(-t * 2.2)
    return s * np.clip(t / 0.002, 0, 1) * 0.16


def reverb(x, secs=2.4, wet=0.3):
    ir_t = t_(secs)
    ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 2.6)
    ir[0] = 1.0
    L = len(x) + len(ir)
    y = np.fft.irfft(np.fft.rfft(x, L) * np.fft.rfft(ir, L), L)[: len(x)]
    y /= np.max(np.abs(y)) + 1e-9
    return x * (1 - wet) + y * wet * np.max(np.abs(x))


# Am – F – C – G, rồi kết C
CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
ROOT = [45, 41, 48, 43]
ARP = [[69, 72, 76, 72], [69, 72, 77, 72], [67, 72, 76, 72], [67, 71, 74, 71]]


def main(out):
    nbars = int(np.ceil(DUR / BAR))
    for b in range(nbars):
        t0 = b * BAR
        if t0 >= DUR - 0.5:
            break
        c = b % 4
        last = t0 >= 44.29 - 0.01
        chord = [48, 52, 55, 60] if last else CH[c]
        # piano: hợp âm ở phách 1, nốt rải
        for k, n in enumerate(chord):
            place(piano(n, BAR * 1.1, 0.85), t0 + k * 0.012, 1.0, -0.2 + 0.15 * k)
        dens = 2 if t0 < 7.1 else (4 if t0 < 24.2 else 8)
        if 35.7 <= t0 < 44.2:
            dens = 4
        arp = [72, 76, 79, 76] if last else ARP[c]
        for k in range(dens):
            place(piano(arp[k % 4] if dens < 8 else arp[k % 4] + (12 if k >= 4 and 24.2 <= t0 < 35.7 else 0), 1.4, 0.55), t0 + k * BAR / dens, 1.0, 0.3)
        # pad + bass từ 7,14
        if t0 >= 7.1:
            place(pad([n + 12 for n in chord], BAR * 1.05, cutoff=1400 if t0 < 30 else 2600), t0, 1.0)
            place(sub(36 if last else ROOT[c] - 12 + 12, BAR), t0, 1.0)
        # trống nhẹ
        if 7.1 <= t0 < 44.2:
            for k in range(4):
                if k in (0, 2):
                    place(kick(0.8 if t0 < 24.2 else 1.0), t0 + k * B, 1.0)
                else:
                    place(rim(), t0 + k * B, 1.0, 0.25)
            if t0 >= 20.0:
                for k in range(8):
                    place(hat(), t0 + k * B / 2, 0.9 if k % 2 else 0.6, -0.35)
    # cao trào 30: nền dồn + chuông
    place(swell(2.6), 30.0 - 2.6, 1.0)
    for k, n in enumerate([76, 79, 84]):
        place(bell(n, 3.0), 30.0 + k * B / 2, 1.0, 0.2)
    # kết: chuông khi quân 阿宝 đặt xuống
    for k, n in enumerate([72, 76, 79, 84]):
        place(bell(n, 3.5), 47.14 + k * B / 2, 1.0, -0.1 + 0.1 * k)

    y = mix.copy()
    for c in range(2):
        y[:, c] = reverb(y[:, c], 2.4, 0.28)
    y = np.tanh(y * 1.0)
    y *= 0.89 / (np.max(np.abs(y)) + 1e-9) * GAIN
    y = np.tanh(y * 1.25) / np.tanh(1.25) * 0.86        # giới hạn mềm, đỉnh dưới −1 dB
    fade = int(2.5 * SR)
    y[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
    pcm = (y * 32767).astype(np.int16)
    with wave.open(out, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print('đã ghi', out, f'{DUR}s')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'music_story.wav')
