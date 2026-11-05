"""Nhạc bản 2 cho "Chuyện thật của 阿宝" (59 s, 84 BPM), dùng lại nhạc cụ trong music_story.py.
Mở bằng cao trào: màn trập máy ảnh, tiếng nổ trầm khi hiện "Á QUÂN" (phách 2), tua băng ngược (phách 6–8),
piano vào ở phách 8. Cao trào ở phách 44, lắng ở phách 56, kết ở phách 68, chuông khi quân 阿宝 đặt xuống (phách 72).
Chạy:  python3 story/music_story2.py <ra.wav>
"""
import sys, wave
import numpy as np
import music_story as M

DUR = 59.0
M.DUR = DUR
M.N = int(M.SR * DUR)
M.mix = np.zeros((M.N, 2))
SR, B, BAR = M.SR, M.B, M.BAR
T = lambda k: k * B
place, t_, ff, rng = M.place, M.t_, M.fft_filter, M.rng


def shutter():
    out = np.zeros(int(0.16 * SR))
    for off, g in ((0.0, 1.0), (0.055, 0.7)):
        t = t_(0.06)
        c = ff(rng.standard_normal(len(t)), lo=1800, hi=9000) * np.exp(-t * 140) * g
        i = int(off * SR)
        out[i:i + len(c)] += c
    return out * 0.5


def boom():
    t = t_(2.6)
    s = np.sin(2 * np.pi * (36 + 50 * np.exp(-t * 7)) * t) * np.exp(-t * 1.8)
    n = ff(rng.standard_normal(len(t)), hi=2500) * np.exp(-t * 3) * 0.35
    return np.tanh((s * 1.3 + n) * 1.4) * 0.6


def rewind(length):
    """băng tua ngược: tiếng ríu cao lắc nhanh + nhiễu dải hẹp"""
    t = t_(length)
    f = 900 + 1500 * (t / length) + 260 * np.sin(2 * np.pi * 13 * t)
    chirp = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.12
    nz = ff(rng.standard_normal(len(t)), lo=1200, hi=6000) * 0.18
    gate = 0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 9 * t))
    return (chirp + nz) * gate * np.clip(t / 0.05, 0, 1)


def main(out):
    # mở: pad tối, chuông, màn trập
    place(M.pad([57, 64, 69, 72], T(6.2), cutoff=1600), 0, 1.4)
    place(M.bell(81, 3), 0.0, 0.8)
    for k in (0, 0.5, 1.0, 1.5):
        place(shutter(), T(k), 1.0, 0.2 if k % 1 else -0.2)
    # phách 2: "Á QUÂN"
    place(boom(), T(2), 1.0)
    for k, n in enumerate([69, 72, 76, 81]):
        place(M.bell(n, 3.2), T(2) + k * 0.06, 1.1, -0.2 + 0.13 * k)
        place(M.piano(n - 12, 3.0, 0.9), T(2), 1.0)
    # phách 6–8: tua ngược + hợp âm piano đảo chiều dồn vào phách 8
    place(rewind(T(2) - 0.05), T(6), 1.0)
    rev = sum(M.piano(n, T(2), 0.9) for n in (57, 60, 64, 69))[::-1]
    place(rev, T(8) - len(rev) / SR, 0.9)

    j = 0
    while True:
        k = 8 + 4 * j
        t0 = T(k)
        if t0 >= DUR - 0.5:
            break
        c = j % 4
        last = k >= 68
        chord = [48, 52, 55, 60] if last else M.CH[c]
        for i, n in enumerate(chord):
            place(M.piano(n, BAR * 1.1, 0.85), t0 + i * 0.012, 1.0, -0.2 + 0.15 * i)
        climax = 44 <= k < 56
        dens = 2 if (k < 16 or last) else (8 if climax else 4)
        arp = [72, 76, 79, 76] if last else M.ARP[c]
        for i in range(dens):
            n = arp[i % 4] + (12 if climax and i >= 4 else 0)
            place(M.piano(n, 1.4, 0.55), t0 + i * BAR / dens, 1.0, 0.3)
        if k >= 16:
            place(M.pad([n + 12 for n in chord], BAR * 1.05, cutoff=2600 if climax else 1400), t0, 1.0)
            place(M.sub(36 if last else M.ROOT[c], BAR), t0, 1.0)
        if 16 <= k < 68:
            for i in range(4):
                if i in (0, 2):
                    place(M.kick(1.0 if climax else 0.8), t0 + i * B, 1.0)
                else:
                    place(M.rim(), t0 + i * B, 1.0, 0.25)
            if 32 <= k < 56:
                for i in range(8):
                    place(M.hat(), t0 + i * B / 2, 0.9 if i % 2 else 0.6, -0.35)
        j += 1
    # dồn vào cao trào + chuông
    place(M.swell(2.6), T(44) - 2.6, 1.0)
    for i, n in enumerate([76, 79, 84]):
        place(M.bell(n, 3.0), T(44) + i * B / 2, 1.0, 0.2)
    for i, n in enumerate([79, 84]):
        place(M.bell(n, 2.6), T(52) + i * B / 2, 0.8, -0.2)
    for i, n in enumerate([72, 76, 79, 84]):
        place(M.bell(n, 3.5), T(72) + i * B / 2, 1.0, -0.1 + 0.1 * i)

    y = M.mix.copy()
    for ch in range(2):
        y[:, ch] = M.reverb(y[:, ch], 2.4, 0.28)
    y = np.tanh(y)
    y *= 0.89 / (np.max(np.abs(y)) + 1e-9)
    y = np.tanh(y * 1.25) / np.tanh(1.25) * 0.86
    fade = int(2.5 * SR)
    y[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
    with wave.open(out, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((y * 32767).astype(np.int16).tobytes())
    print('đã ghi', out, f'{DUR}s')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'music_story2.wav')
