"""Nền nhạc piano kể chuyện (84 BPM) cho video dài 60–180 giây, dùng nhạc cụ của story/music_story.py.
Mỗi mốc trong <mốc> (giây, cách nhau dấu phẩy) có một tiếng chuông nhẹ báo chuyển đoạn.
Chạy:  python3 series/music_bed.py <ra.wav> <DUR> <mốc1,mốc2,...>
"""
import os, sys, wave
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'story'))
import music_story as M

out, DUR = sys.argv[1], float(sys.argv[2])
marks = [float(x) for x in sys.argv[3].split(',') if x] if len(sys.argv) > 3 else []
M.DUR = DUR
M.N = int(M.SR * DUR)
M.mix = np.zeros((M.N, 2))
B, BAR = M.B, M.BAR
place = M.place

# mở: chuông + pad, hợp âm piano đảo chiều dồn vào ô nhịp đầu
place(M.pad([57, 64, 69, 72], 4.5, cutoff=1500), 0, 1.3)
place(M.bell(81, 3), 0.05, 0.8)
j = 0
while True:
    t0 = j * BAR
    if t0 >= DUR - 0.6:
        break
    c = j % 4
    last = t0 >= DUR - 2 * BAR
    chord = [48, 52, 55, 60] if last else M.CH[c]
    for i, n in enumerate(chord):
        place(M.piano(n, BAR * 1.1, 0.8), t0 + i * 0.012, 1.0, -0.2 + 0.15 * i)
    dens = 2 if j < 1 else 4
    for i in range(dens):
        place(M.piano(([72, 76, 79, 76] if last else M.ARP[c])[i % 4], 1.4, 0.5), t0 + i * BAR / dens, 1.0, 0.3)
    if j >= 1:
        place(M.pad([n + 12 for n in chord], BAR * 1.05, cutoff=1500), t0, 0.9)
        place(M.sub(36 if last else M.ROOT[c], BAR), t0, 0.9)
    if 2 <= j and not last:
        for i in range(4):
            if i in (0, 2):
                place(M.kick(0.7), t0 + i * B, 1.0)
            else:
                place(M.rim(), t0 + i * B, 0.9, 0.25)
        if j >= 4:
            for i in range(8):
                place(M.hat(), t0 + i * B / 2, 0.7 if i % 2 else 0.45, -0.35)
    j += 1
for k, t in enumerate(marks):
    place(M.bell([76, 79, 84][k % 3], 2.2), t, 0.55, 0.2 if k % 2 else -0.2)

y = M.mix.copy()
for ch in range(2):
    y[:, ch] = M.reverb(y[:, ch], 2.4, 0.26)
y = np.tanh(y)
y *= 0.89 / (np.max(np.abs(y)) + 1e-9)
y = np.tanh(y * 1.25) / np.tanh(1.25) * 0.86
fade = int(2.0 * M.SR)
y[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(M.SR)
    w.writeframes((y * 32767).astype(np.int16).tobytes())
print('đã ghi', out, DUR)
