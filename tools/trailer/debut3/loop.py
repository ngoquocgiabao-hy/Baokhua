# ghép các đoạn thành vòng lặp liền (chéo mờ giữa các đoạn và ở mối cuối→đầu)
# python3 loop.py <ra không đuôi> <W> <H> <crf_mp4> <crf_webm> 'nguồn|bắt đầu|dài|y0' ...   (y0 = -1: không cắt dải ngang)
import sys, subprocess
out, W, H, cm, cw = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4], sys.argv[5]
segs = [s.split('|') for s in sys.argv[6:]]
X = 0.5   # giây chéo mờ
inp, fl = [], []
for i, (src, ss, d, y0) in enumerate(segs):
    inp += ['-ss', ss, '-t', d, '-i', src]
    crop = f'crop=1440:810:0:{y0},' if int(y0) >= 0 else ''
    fl.append(f'[{i}:v]{crop}scale={W}:{H}:flags=lanczos,fps=30,format=yuv420p,setpts=PTS-STARTPTS[v{i}]')
cur, t = 'v0', float(segs[0][2])
for i in range(1, len(segs)):
    t -= X; fl.append(f'[{cur}][v{i}]xfade=transition=fade:duration={X}:offset={t:.3f}[x{i}]'); cur = f'x{i}'; t += float(segs[i][2])
L = t
fl.append(f'[{cur}]split[a][b];[a]trim=0:{L - X:.3f},setpts=PTS-STARTPTS[m];[b]trim={L - X:.3f}:{L:.3f},setpts=PTS-STARTPTS[e];[e][m]xfade=transition=fade:duration={X}:offset=0[out]')
fc = ';'.join(fl)
base = ['ffmpeg', '-v', 'error', '-y'] + inp + ['-filter_complex', fc, '-map', '[out]', '-an']
subprocess.run(base + ['-c:v', 'libx264', '-preset', 'slow', '-crf', cm, '-g', '60', '-movflags', '+faststart', out + '.mp4'], check=True)
subprocess.run(base + ['-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', cw, '-row-mt', '1', out + '.webm'], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', out + '.mp4', '-frames:v', '1', '-q:v', '3', out + '.jpg'], check=True)
print(out, f'{L - X:.2f}s')
