"""Nhạc chung cho các series ngắn (120 BPM, trap/phonk nhẹ), dùng lại nhạc cụ của debut/music.py.
Cấu trúc theo phách: [mở HOOK phách][NI đoạn × PER phách][kết 8 phách]. Mỗi đoạn mở bằng tiếng vút + nổ nhẹ.
Chạy:  python3 series/music_series.py <ra.wav> <DUR> <HOOK> <PER> <NI>
"""
import os, sys, wave
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'debut'))
import music as M

out, DUR, HOOK, PER, NI = sys.argv[1], float(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
M.DUR = DUR
M.N = int(M.SR * DUR)
M.mix = np.zeros((M.N, 2))
B = M.BEAT
T = lambda k: k * B
place = M.place

# mở: tích tắc + kéo lên + nổ ở giữa đoạn mở
for i in range(HOOK // 2):
    place(M.tick(), T(i), 0.8 if i % 2 else 1.0)
place(M.pad([50, 57, 62], T(HOOK), cutoff=700), 0, 1.0)
for k in range(HOOK // 2):
    place(M.cowbell([74, 77, 81, 79][k % 4], 0.2), T(k * .5), 0.5)
place(M.riser(T(HOOK // 2) - 0.1), 0.05, 0.7)
place(M.impact(0.9), T(HOOK // 2), 0.9)
M.bar_beat(T(HOOK // 2), T(HOOK), half=True, rolls=False, cow=False)
# các đoạn
t1 = T(HOOK + PER * NI)
for i in range(NI):
    t = T(HOOK + i * PER)
    place(M.whoosh(0.45), t - 0.4, 0.8)
    place(M.impact(0.55), t, 0.55)
    place(M.tick(), t + 0.1, 0.9)
M.bar_beat(T(HOOK), t1, cow_gain=1.0)
place(M.pad([62, 65, 69], t1 - T(HOOK), cutoff=2000), T(HOOK), 0.45)
# kết
place(M.riser(1.5), t1 - 1.5, 0.8)
place(M.impact(1.1), t1, 1.0)
M.bar_beat(t1, DUR - 0.5, half=True, rolls=False, cow=True, cow_gain=0.8)
place(M.pad([50, 57, 62, 65], DUR - t1, cutoff=1800), t1, 0.8)

y = M.mix.copy()
for c in range(2):
    y[:, c] = M.reverb(y[:, c], 1.4, 0.16)
y = np.tanh(y)
y *= 0.89 / (np.max(np.abs(y)) + 1e-9) * 0.53
fade = int(1.0 * M.SR)
y[-fade:] *= np.linspace(1, 0, fade)[:, None]
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(M.SR)
    w.writeframes((y * 32767).astype(np.int16).tobytes())
print('đã ghi', out, DUR)
