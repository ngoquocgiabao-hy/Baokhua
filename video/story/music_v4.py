"""Nhạc "Hồ sơ thật" bản 4 – kiểu vinahouse (132 BPM, La thứ ngũ cung), viết hoàn toàn bằng numpy, không dùng mẫu âm thanh có bản quyền.
Kick 4/4 nện, bass lăn 3 nốt sau mỗi kick, hi-hat mở ở phách lẻ, pad và hợp âm "bơm" theo kick (sidechain),
giai điệu sáo ngũ cung (chất Trung Hoa, hợp chủ đề học tiếng Trung) chồng với lead pluck.
Bố cục theo mốc hình (out/story4/markers.json do build_story4.mjs sinh):
  phần 1 (sự thật trần trụi): kick lọc trầm + sáo móc tai  → phần 2 (mẹo): groove vừa, chừa chỗ cho giọng nói
  → dồn 1 ô nhịp → phần 3 (giới thiệu): DROP  → phần 4 (game): drop biến tấu, nhấn ở mốc 消消乐 → phần 5: drop cuối + đuôi ngân.
Chạy:  python3 story/music_v4.py <markers.json> <ra.wav>
"""
import json, os, subprocess, sys, wave
import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'debut'))
import music as M   # dùng lại: fft_filter, reverb, riser, whoosh, impact, hat, clap, snare, note

mk = json.load(open(sys.argv[1]))
OUT = sys.argv[2]
SR = M.SR
BPM = mk['bpm']; B = 60 / BPM; BAR = 4 * B; S16 = B / 4
DUR = mk['dur']; N = int(SR * DUR)
ACT = [a['t'] for a in mk['acts']] + [DUR]
rng = np.random.default_rng(132)
BUS = {k: np.zeros((N, 2)) for k in ('kick', 'sc', 'lead', 'fx')}
KICKS = []


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


note = M.note
ff = M.fft_filter


def saw(f, t, ph=0.0):
    return 2 * ((t * f + ph) % 1) - 1


# ---------------- nhạc cụ ----------------
def kick(lp=None):
    t = t_(0.42)
    f = 48 + 190 * np.exp(-t * 38)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.5)
    click = ff(rng.standard_normal(len(t)), lo=2500) * np.exp(-t * 500) * 0.5
    k = np.tanh((s * 1.15 + click) * 3.2) * 0.85
    return ff(k, hi=lp) if lp else k


def sub(n, L):
    t = t_(L)
    s = np.sin(2 * np.pi * note(n) * t)
    s = np.tanh(s * 1.8) * 0.7                      # bão hoà nhẹ → có bồi âm, loa điện thoại vẫn nghe ra
    a = np.clip(t / 0.006, 0, 1) * np.clip((L - t) / 0.02, 0, 1)
    return s * a


def rbass(n, L=None, bright=1.0):                   # nốt bass lăn: răng cưa lọc + sub, tắt nhanh
    L = L or S16 * 0.92
    t = t_(L)
    s = saw(note(n), t) * 0.55 + np.sin(2 * np.pi * note(n) * t)
    s = ff(s, hi=420 + 900 * bright)
    e = np.exp(-t * 9) * np.clip(t / 0.003, 0, 1) * np.clip((L - t) / 0.008, 0, 1)
    return np.tanh(s * e * 2.4) * 0.6


def supersaw(notes, L, cutoff=3200, att=0.004, dec=None):
    t = t_(L)
    s = np.zeros(len(t))
    for n in notes:
        for k, det in enumerate((-0.19, -0.11, -0.04, 0, 0.05, 0.12, 0.2)):
            s += saw(note(n + det), t, k * 0.137)
    s = ff(s / (len(notes) * 7), hi=cutoff)
    e = np.clip(t / att, 0, 1) * (np.exp(-t / dec) if dec else 1) * np.clip((L - t) / 0.03, 0, 1)
    return s * e


def pluck(n, L):
    t = t_(L)
    s = saw(note(n), t) + 0.5 * np.sign(np.sin(2 * np.pi * note(n) * 1.003 * t))
    bright = ff(s, hi=5200) * np.exp(-t * 16)
    body = ff(s, hi=1500) * np.exp(-t * 4.5)
    return (bright * 0.6 + body * 0.5) * np.clip(t / 0.002, 0, 1) * np.clip((L - t) / 0.02, 0, 1) * 0.42


def flute(n, L):                                    # sáo trúc giả lập: sin + bồi âm, rung sau 0,15 giây, hơi thở
    t = t_(L + 0.12)
    vib = 1 + 0.0045 * np.sin(2 * np.pi * 5.6 * t) * np.clip((t - 0.15) / 0.2, 0, 1)
    ph = 2 * np.pi * np.cumsum(note(n) * vib) / SR
    s = np.sin(ph) + 0.28 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph) + 0.05 * np.sin(4 * ph)
    breath = ff(rng.standard_normal(len(t)), lo=note(n) * 1.5, hi=note(n) * 5) * 0.09
    a = np.clip(t / 0.035, 0, 1) * np.clip((L + 0.12 - t) / 0.12, 0, 1)
    bend = np.clip(t / 0.05, 0, 1)                  # luyến nhẹ vào nốt
    return (s * (0.85 + 0.15 * bend) + breath * (1.4 - bend)) * a * 0.3


def vox(n, L, vowel='a'):                           # tiếng hát cắt (formant), không phải giọng thật
    F = {'a': (800, 1200, 2600), 'e': (450, 1900, 2600), 'o': (500, 900, 2400)}[vowel]
    t = t_(L)
    vib = 1 + 0.004 * np.sin(2 * np.pi * 6 * t)
    s = 2 * ((np.cumsum(note(n) * vib) / SR) % 1) - 1
    X = np.fft.rfft(s); f = np.fft.rfftfreq(len(s), 1 / SR)
    m = sum(g * np.exp(-((f - fc) / (fc * 0.09)) ** 2) for fc, g in zip(F, (1.0, 0.7, 0.35)))
    y = np.fft.irfft(X * m, len(s))
    y /= np.max(np.abs(y)) + 1e-9
    return y * np.clip(t / 0.01, 0, 1) * np.clip((L - t) / 0.05, 0, 1) * 0.32


def ohat():
    t = t_(0.2)
    return ff(rng.standard_normal(len(t)), lo=7500) * np.exp(-t * 18) * 0.3


def chat():
    t = t_(0.05)
    return ff(rng.standard_normal(len(t)), lo=8000) * np.exp(-t * 80) * 0.22


def crash(L=2.2):
    t = t_(L)
    return ff(rng.standard_normal(len(t)), lo=4000) * np.exp(-t * 1.8) * 0.32


def down(L=1.2):                                    # tiếng vút xuống sau cú drop
    t = t_(L)
    nz = rng.standard_normal(len(t)); out = np.zeros(len(t)); ch = int(0.05 * SR)
    for i in range(0, len(t), ch):
        k = i / len(t)
        out[i:i + ch] = ff(nz[i:i + ch], lo=300, hi=9000 - 8000 * k)
    return out * (1 - t / L) ** 2 * 0.35


def snroll(t0, L, g0=0.15, g1=0.6):                 # trống dồn: 8 → 16 → 32
    t, k = t0, 0
    while t < t0 + L - 1e-6:
        p = (t - t0) / L
        step = S16 * 2 if p < 0.5 else (S16 if p < 0.85 else S16 / 2)
        put('fx', M.snare(), t, g0 + (g1 - g0) * p, 0.1 * (-1) ** k)
        t += step; k += 1


# ---------------- hoà âm, giai điệu ----------------
ROOT = [45, 41, 43, 40]                              # A2 F2 G2 E2  (Am – F – G – Em)
CHORD = [[69, 72, 76], [69, 72, 77], [67, 71, 74], [67, 71, 76]]
PAD = [[57, 64, 69, 72], [53, 60, 65, 69], [55, 62, 67, 71], [52, 59, 64, 67]]
HOOK = [   # ngũ cung La thứ (A C D E G), 4 ô nhịp, (vị trí móc kép, nốt, độ dài)
    [(0, 76, 2), (2, 74, 1), (3, 76, 1), (4, 79, 2), (6, 76, 2), (8, 74, 2), (10, 72, 2), (12, 69, 4)],
    [(0, 72, 2), (2, 74, 2), (4, 76, 2), (6, 74, 1), (7, 72, 1), (8, 69, 2), (10, 67, 2), (12, 69, 4)],
    [(0, 76, 2), (2, 74, 1), (3, 76, 1), (4, 79, 2), (6, 81, 2), (8, 79, 2), (10, 76, 2), (12, 74, 4)],
    [(0, 76, 2), (2, 79, 2), (4, 76, 2), (6, 74, 2), (8, 72, 2), (10, 74, 2), (12, 69, 4)],
]


def bars(t0, t1):
    k = 0
    while t0 + k * BAR < t1 - 1e-6:
        yield k, t0 + k * BAR
        k += 1


def drums(t0, t1, kick_lp=None, kick_g=1.0, hats=True, clap=True, ohats=True, fill_last=False):
    for k, bt in bars(t0, t1):
        last = fill_last and bt + BAR >= t1 - 1e-6
        for b in range(4):
            tb = bt + b * B
            if last and b == 3:
                continue
            put('kick', kick(kick_lp), tb, kick_g)
            KICKS.append(tb)
            if hats:
                for s in range(4):
                    if s != 2:
                        put('sc', chat(), tb + s * S16, (0.5, 0.0, 0, 0.35)[s] + 0.25 * (s == 0), 0.35 * (-1) ** s)
            if ohats:
                put('fx', ohat(), tb + 2 * S16, 0.8, 0.25)
            if clap and b in (1, 3):
                put('fx', M.clap(), tb, 0.85, -0.1)
                put('fx', M.snare(), tb, 0.3, 0.1)


def bassline(t0, t1, bright=1.0, sub_g=0.5, roll_g=0.8, start_chord=0):
    for k, bt in bars(t0, t1):
        c = (start_chord + k) % 4
        r = ROOT[c]
        put('sc', sub(r - 12, BAR - 0.02), bt, sub_g)
        for b in range(4):
            tb = bt + b * B
            for s, oc, g in ((1, 0, 0.85), (2, 0, 0.65), (3, 12 if b % 2 else 0, 0.9)):
                put('sc', rbass(r + oc, bright=bright), tb + s * S16, g * roll_g)


def pads(t0, t1, g=0.35, cutoff=1800, start_chord=0):
    for k, bt in bars(t0, t1):
        put('sc', supersaw(PAD[(start_chord + k) % 4], BAR + 0.05, cutoff=cutoff, att=0.08), bt, g)


def stabs(t0, t1, g=0.4, start_chord=0):
    for k, bt in bars(t0, t1):
        ch = CHORD[(start_chord + k) % 4]
        for b in range(4):
            put('sc', supersaw(ch, 0.2, cutoff=4200, dec=0.07), bt + b * B + 2 * S16, g, 0.15 * (-1) ** b)


def hook(t0, t1, inst='both', g=1.0, octave=0, start=0):
    for k, bt in bars(t0, t1):
        for s, n, d in HOOK[(start + k) % 4]:
            L = d * S16
            if inst in ('flute', 'both'):
                put('lead', flute(n + octave, L * 0.95), bt + s * S16, 0.95 * g, -0.12)
            if inst in ('pluck', 'both'):
                put('lead', pluck(n + octave, L + 0.12), bt + s * S16, 0.75 * g, 0.12)


def arp(t0, t1, g=0.35, start_chord=0):            # rải hợp âm nhẹ cho phần có giọng nói
    pat = [0, 1, 2, 1, 0, 2, 1, 2]
    for k, bt in bars(t0, t1):
        ch = CHORD[(start_chord + k) % 4]
        for i, p in enumerate(pat):
            if i % 2 == 1:
                put('lead', pluck(ch[p] + 12, S16 * 1.8), bt + i * 2 * S16 + S16 * 2 * 0, g * (0.7 + 0.3 * (i % 4 == 1)), 0.3 * (-1) ** i)


def vox_chops(t0, t1, g=0.5, start_chord=0):
    for k, bt in bars(t0, t1):
        ch = CHORD[(start_chord + k) % 4]
        put('lead', vox(ch[2], S16 * 1.5, 'o'), bt + B * 1.5, g, -0.2)
        put('lead', vox(ch[1], S16 * 1.0, 'e'), bt + B * 2.75, g * 0.8, 0.2)
        put('lead', vox(ch[2] + 3 if k % 2 else ch[2], S16 * 2.5, 'a'), bt + B * 3.5, g * 0.9, 0)


def hit(t, size=0.8, cr=True):
    put('fx', M.impact(size), t, 0.7 * size)
    if cr:
        put('fx', crash(), t, 0.9)
    put('fx', down(), t + 0.05, 0.6)


# ---------------- bố cục ----------------
A1, A2, A3, A4, A5, END = ACT
# Phần 1 – sự thật trần trụi: kick lọc trầm như tim đập, sub, sáo móc tai, đồng hồ tích tắc
drums(A1, A2, kick_lp=260, kick_g=0.85, hats=False, clap=False, ohats=False)
for k, bt in bars(A1, A2):
    put('sc', sub(ROOT[k % 4] - 12, BAR - 0.02), bt, 0.42)
    for b in range(8):
        put('fx', M.tick(), bt + b * B / 2, 0.5 if b % 2 else 0.8, 0.3 * (-1) ** b)
pads(A1, A2, g=0.28, cutoff=900)
hook(A1, A2, inst='flute', g=0.9)
put('fx', M.riser(BAR * 0.5), A2 - BAR * 0.5, 0.6)
snroll(A2 - B, B, 0.1, 0.4)
# Phần 2 – mẹo: groove vừa, bass lăn, rải hợp âm nhẹ (chừa tần số cho giọng nói); ô nhịp cuối dồn lên drop
hit(A2, 0.55)
build = BAR if A3 - A2 >= 3 * BAR else B * 2
drums(A2, A3, fill_last=True)
bassline(A2, A3 - build, bright=0.5, roll_g=0.7)
pads(A2, A3, g=0.24, cutoff=1400)
arp(A2, A3 - build, g=0.3)
nb = int(round((A3 - build - A2) / BAR))
for k, bt in bars(A3 - build, A3):                  # ô nhịp dồn: bass lọc tối, trống dồn, riser
    c = (nb + k) % 4
    for b in range(4):
        for s in (1, 2, 3):
            put('sc', rbass(ROOT[c], bright=0.15 + 0.25 * b / 4), bt + b * B + s * S16, 0.5)
snroll(A3 - build, build, 0.12, 0.75)
put('fx', M.riser(build + 0.05, top=10000), A3 - build - 0.05, 0.95)
# Phần 3 – giới thiệu: DROP đầy đủ, sáo + pluck chồng, hợp âm nảy
hit(A3, 1.1)
drums(A3, A4)
bassline(A3, A4, bright=1.0)
pads(A3, A4, g=0.3, cutoff=2400)
stabs(A3, A4, g=0.38)
hook(A3, A4, inst='both', g=0.85)
put('fx', M.whoosh(0.5), A4 - 0.48, 0.8)
# Phần 4 – game: drop biến tấu, tiếng hát cắt, nửa sau lên quãng tám; nhấn mạnh ở mốc hình
hit(A4, 0.9)
drums(A4, A5, fill_last=True)
bassline(A4, A5 - B, bright=0.9)
pads(A4, A5, g=0.26, cutoff=2600)
stabs(A4, A5, g=0.3)
half = A4 + int((A5 - A4) / BAR / 2) * BAR
hook(A4, half, inst='pluck', g=0.7)
vox_chops(A4, half, g=0.42)
hook(half, A5 - B, inst='both', g=0.8, octave=0)
for h in mk['hits']:
    if A4 + 0.5 < h < A5 - 0.5:
        put('fx', M.riser(B), h - B, 0.5)
        hit(h, 0.6)
snroll(A5 - B, B, 0.2, 0.7)
# Phần 5 – chơi thử: drop cuối rồi ngân
hit(A5, 1.2)
tail = BAR
drums(A5, END - tail)
bassline(A5, END - tail, bright=1.0)
stabs(A5, END - tail, g=0.38)
pads(A5, END - tail, g=0.3, cutoff=2600)
hook(A5, END - tail, inst='both', g=0.9)
hit(END - tail, 1.0)
put('sc', sub(33, tail), END - tail, 0.6)
put('fx', supersaw(PAD[0], tail, cutoff=2000, att=0.01), END - tail, 0.4)
put('lead', flute(81, tail - 0.4), END - tail + B * 0.5, 0.9)
put('lead', flute(76, tail * 0.5), END - tail, 0.6)

# ---------------- trộn ----------------
pump = np.ones(N)
for k in KICKS:
    i = int(k * SR); L = min(N - i, int(B * SR))
    if L > 0:
        tt = np.arange(L) / SR
        pump[i:i + L] = np.minimum(pump[i:i + L], 1 - 0.72 * np.exp(-tt / 0.1))
lead = BUS['lead'].copy()
for c in range(2):
    lead[:, c] = M.reverb(lead[:, c], 1.8, 0.28)
sc = BUS['sc'] * pump[:, None]
mix = BUS['kick'] * 1.0 + sc * 0.9 + lead * (0.55 + 0.45 * pump[:, None]) + BUS['fx'] * 0.8
for c in range(2):
    mix[:, c] = M.reverb(mix[:, c], 1.1, 0.08)
tt = np.arange(N) / SR                              # phần 1–2 nhỏ hơn để drop nổi lên rõ
sec = np.interp(tt, [0, A2 - 0.01, A2, A3 - build, A3 - 0.01, A3, A4, A5 - 0.01, A5, END],
                [0.8, 0.8, 0.72, 0.72, 0.95, 1.0, 0.95, 0.95, 1.0, 1.0])
mix *= sec[:, None]
mix = np.tanh(mix * 1.1)
mix *= 0.9 / (np.max(np.abs(mix)) + 1e-9)
fade = int(1.5 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
raw = OUT + '.raw.wav'
with wave.open(raw, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
# chuẩn âm lượng −14 LUFS (2 lượt) như mọi video của kênh
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
js = json.loads(r.stderr[r.stderr.rindex('{'):r.stderr.rindex('}') + 1])
af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
      f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', raw, '-af', af, '-ar', str(SR), '-c:a', 'pcm_s16le', OUT], check=True)
os.remove(raw)
print('đã ghi', OUT, f'{DUR:.2f}s', 'phần:', [round(a, 2) for a in ACT])
