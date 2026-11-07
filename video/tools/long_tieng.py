"""Lồng giọng thật của Bảo vào video, tự cân âm lượng (miễn phí, chỉ dùng ffmpeg + numpy).
Làm sạch giọng (cắt ù, giảm ồn, bớt chói "s", nén nhẹ) → đưa giọng về −16 LUFS → đặt vào đúng mốc
→ nhạc nền tự hạ khi Bảo nói, tự lên lại khi ngừng → cả bài về −14 LUFS (mức TikTok, Reels, YouTube)
→ ghép vào video (giữ nguyên hình). Xuất thêm 2 lớp riêng để kéo vào CapCut, cả 2 để 100% là đúng mức.

Chạy (từ thư mục video/):
  # 1 tệp đọc liền, đặt từ giây 0 (hoặc --at 1.5):
  python3 tools/long_tieng.py --video out/X_master.mp4 --voice ghi_am/x.m4a --out out/X_long_tieng.mp4
  # đọc từng câu, nghỉ ~1 giây giữa các câu; máy tự tách câu và đặt vào các mốc:
  python3 tools/long_tieng.py --video ... --voice ... --split --marks 0,4.5,14,25.5 --out ...
  # chỉ đo độ dài từng câu (để dựng hình theo giọng):
  python3 tools/long_tieng.py --voice ghi_am/x.m4a --split --measure
  # thay nhạc nền bằng bài Bảo tự đàn hát:
  ... --music ghi_am/nhac/bai1.m4a
Tuỳ chỉnh: --duck 10 (hạ nhạc bao nhiêu dB khi nói), --bed -20 (mức nhạc khi không nói, LUFS).
"""
import argparse, json, os, re, subprocess, tempfile, wave
import numpy as np

SR = 48000
ap = argparse.ArgumentParser()
ap.add_argument('--video'); ap.add_argument('--voice', nargs='+', required=True); ap.add_argument('--music')
ap.add_argument('--out'); ap.add_argument('--at', type=float, default=0.0); ap.add_argument('--marks')
ap.add_argument('--split', action='store_true'); ap.add_argument('--measure', action='store_true')
ap.add_argument('--duck', type=float, default=10.0); ap.add_argument('--bed', type=float, default=-20.0)
ap.add_argument('--voice-lufs', type=float, default=-16.0); ap.add_argument('--final-lufs', type=float, default=-14.0)
A = ap.parse_args()
TMP = tempfile.mkdtemp(prefix='longtieng_')


def ff(*a):
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *a], check=True)


def read(p):
    with wave.open(p) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32) / 32768
        return x.reshape(-1, w.getnchannels()).mean(1)


def write(p, x, af=None):
    raw = os.path.join(TMP, 'w.f32'); x.astype('<f4').tofile(raw)
    ff('-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', raw, *(['-af', af] if af else []), '-c:a', 'pcm_s16le', p)


def lufs(p):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', p, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    j = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
    return float(j['input_i']), float(j['input_tp'])


def gain_to(x, cur, target):
    return x * 10 ** ((target - cur) / 20)


# 1. giọng: làm sạch → −16 LUFS
voices = []
for i, v in enumerate(A.voice):
    raw = os.path.join(TMP, f'raw{i}.wav'); cl = os.path.join(TMP, f'clean{i}.wav')
    ff('-i', v, '-vn', '-ac', '1', '-ar', str(SR), raw)
    x = read(raw); clip = float(np.mean(np.abs(x) > 0.98)) * 100
    lv, _ = lufs(raw)
    print(f'Giọng gốc {os.path.basename(v)}: {lv:.1f} LUFS, {len(x) / SR:.1f} s' + (f', VỠ TIẾNG {clip:.2f}% mẫu (ghi âm quá to)' if clip > 0.01 else ''))
    ff('-i', raw, '-af', 'highpass=f=85,lowpass=f=13000,afftdn=nr=10:nf=-42:tn=1,deesser=i=0.35,'
       'acompressor=threshold=-22dB:ratio=3:attack=6:release=140:makeup=2', '-ar', str(SR), cl)
    y = read(cl); c, _ = lufs(cl)
    voices.append(gain_to(y, c, A.voice_lufs))
voice = np.concatenate(voices) if len(voices) > 1 else voices[0]

# 2. tách câu theo khoảng lặng
chunks = [(0, len(voice))]
if A.split:
    p = os.path.join(TMP, 'v.wav'); write(p, voice)
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', p, '-af', 'silencedetect=noise=-40dB:d=0.55', '-f', 'null', '-'], capture_output=True, text=True).stderr
    ss = [float(m) for m in re.findall(r'silence_start: ([\d.]+)', r)]; se = [float(m) for m in re.findall(r'silence_end: ([\d.]+)', r)]
    edges, t = [], 0.0
    for a, b in zip(ss, se + [None] * (len(ss) - len(se))):
        if a - t > 0.25: edges.append((t, a))
        t = b if b is not None else len(voice) / SR
    if len(voice) / SR - t > 0.25: edges.append((t, len(voice) / SR))
    chunks = [(max(0, int((a - .08) * SR)), min(len(voice), int((b + .12) * SR))) for a, b in edges]
    print(f'Tách được {len(chunks)} câu:', ', '.join(f'{(b - a) / SR:.1f}s' for a, b in chunks))
    # cân đều: câu nói nhỏ được nâng, câu nói to được hạ (tối đa ±8 dB), đo trên phần có tiếng
    def act_db(x):
        f = np.pad(x, (0, (-len(x)) % 480)).reshape(-1, 480); r = 20 * np.log10(np.sqrt((f ** 2).mean(1)) + 1e-9)
        r = r[r > r.max() - 25]; return 10 * np.log10(np.mean(10 ** (r / 10)))
    lv = [act_db(voice[a:b]) for a, b in chunks]; ref = float(np.median(lv))
    for (a, b), l in zip(chunks, lv):
        voice[a:b] *= 10 ** (np.clip(ref - l, -8, 8) / 20)
if A.measure:
    raise SystemExit(0)

# 3. đặt giọng lên dòng thời gian của video
vd = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', A.video], capture_output=True, text=True).stdout)
N = int(vd * SR); track = np.zeros(N, np.float32)
marks = [float(m) for m in A.marks.split(',')] if A.marks else [A.at]
if len(chunks) != len(marks) and A.split:
    print(f'CHÚ Ý: {len(chunks)} câu nhưng {len(marks)} mốc. Đặt theo thứ tự, phần thừa bỏ qua.')
for (a, b), m in zip(chunks, marks):
    s = voice[a:b]; i = int(m * SR)
    if i >= N: continue
    s = s[: N - i]; track[i:i + len(s)] += s
for k in range(len(marks) - 1):
    if k < len(chunks) and marks[k] + (chunks[k][1] - chunks[k][0]) / SR > marks[k + 1] + .05:
        print(f'CHÚ Ý: câu {k + 1} dài {(chunks[k][1] - chunks[k][0]) / SR:.1f}s, đè lên câu sau (mốc {marks[k + 1]}s). Đọc nhanh hơn hoặc dời mốc.')

# 4. nhạc nền: từ video, hoặc bài của Bảo (tự cắt vừa video, mờ đầu cuối)
mp = os.path.join(TMP, 'music.wav')
if A.music:
    ff('-stream_loop', '-1', '-i', A.music, '-t', str(vd), '-vn', '-ac', '1', '-ar', str(SR),
       '-af', f'afade=t=in:d=0.6,afade=t=out:st={max(0, vd - 2):.2f}:d=2', mp)
else:
    ff('-i', A.video, '-vn', '-ac', '1', '-ar', str(SR), mp)
music = read(mp)[:N]; music = np.pad(music, (0, N - len(music)))
cm, _ = lufs(mp); music = gain_to(music, cm, A.bed)
# hạ nhạc khi có giọng: đường bao giọng (50 ms), lên nhanh 40 ms, xuống chậm 400 ms
R = 1000; hop = SR // R                                   # tính đường bao ở 1 kHz cho nhanh
pw = np.pad(track, (0, (-len(track)) % hop)).reshape(-1, hop)
env = np.sqrt(np.convolve((pw ** 2).mean(1), np.ones(50) / 50, 'same') + 1e-12)
act = np.clip((20 * np.log10(env) + 48) / 10, 0, 1)
sm = np.empty_like(act); g = 0.0; ka, kr = 1 - np.exp(-1 / (.04 * R)), 1 - np.exp(-1 / (.4 * R))
for j in range(len(act)):
    g += (act[j] - g) * (ka if act[j] > g else kr); sm[j] = g
sm = np.interp(np.arange(N) / hop, np.arange(len(sm)), sm)
music_d = music * 10 ** (-A.duck * sm / 20)

# 5. trộn → −14 LUFS, chặn đỉnh −1,5 dBTP
mix = track + music_d
pm = os.path.join(TMP, 'mix.wav'); write(pm, mix * .5)
cmx, _ = lufs(pm); gl = 10 ** ((A.final_lufs - cmx) / 20) * .5
track, music_d = track * gl, music_d * gl
out = A.out or A.video.replace('.mp4', '_long_tieng.mp4')
base = out[:-4]
LIM = 'alimiter=limit=0.89:attack=3:release=60:level=disabled'
for lap in range(2):
    write(base + '_giong.wav', track, LIM); write(base + '_nhac.wav', music_d, LIM)
    ff('-i', base + '_giong.wav', '-i', base + '_nhac.wav', '-filter_complex', '[0][1]amix=inputs=2:normalize=0,alimiter=limit=0.79:attack=3:release=60:level=disabled[a]',
       '-map', '[a]', '-ar', str(SR), base + '_tron.wav')
    li, _ = lufs(base + '_tron.wav')
    if abs(A.final_lufs - li) < 0.3: break
    k = 10 ** ((A.final_lufs - li) / 20); track, music_d = track * k, music_d * k
ff('-i', A.video, '-i', base + '_tron.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out)
fi, ft = lufs(out); vi_, _ = lufs(base + '_giong.wav') if np.any(track) else (float('nan'), 0)
print(f'Xong: {out}\n  cả bài {fi:.1f} LUFS, đỉnh {ft:.1f} dBTP · giọng {vi_:.1f} LUFS · nhạc hạ {A.duck:.0f} dB khi nói')
print(f'  Lớp cho CapCut (để 100%): {base}_giong.wav, {base}_nhac.wav')
