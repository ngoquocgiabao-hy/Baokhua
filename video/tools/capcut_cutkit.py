"""Bộ CapCut từ một video đã dựng xong: cắt video thành từng cảnh theo mốc giây, thêm nhạc,
3 lớp chữ (chữ Hán / pinyin / tiếng Việt, đang ẩn) cho các thẻ chữ trong kit.json, phụ đề SRT,
rồi làm cho mở được trên Mac bằng tools/capcut_mac.py (bấm đúp MO_TRONG_CAPCUT.command).
Chạy (từ thư mục video/):
  python3 tools/capcut_cutkit.py <video_master.mp4> <out/<id>> <tên dự án> <mốc1,mốc2,...>
Cần capcut-cli (npm i -g capcut-cli, hoặc biến CAPCUT_BIN="npx --prefix /tmp/ccli capcut").
"""
import json, os, shlex, shutil, subprocess, sys

MASTER, DIR, NAME, CUTS = sys.argv[1], sys.argv[2], sys.argv[3], [float(x) for x in sys.argv[4].split(',')]
CAP = shlex.split(os.environ.get('CAPCUT_BIN', 'capcut'))
kit = json.load(open(os.path.join(DIR, 'kit.json'), encoding='utf-8'))
DUR = float(kit['dur'])
cuts = sorted(set([0.0] + CUTS + [DUR]))
KIT = os.path.join(DIR, f'{NAME}_CapCut')
shutil.rmtree(KIT, ignore_errors=True)
os.makedirs(os.path.join(KIT, '_canh'), exist_ok=True)


def cap(*a):
    subprocess.run(CAP + [str(x) for x in a] + ['-q'], check=True, stdout=subprocess.DEVNULL)


def ts(s):
    ms = round(s * 1000)
    return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}'


# 1. cắt cảnh
scenes = []
for i in range(len(cuts) - 1):
    a, b = cuts[i], cuts[i + 1]
    f = os.path.join(KIT, '_canh', f'canh_{i + 1:02d}.mp4')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', str(a), '-to', str(b), '-i', MASTER, '-an', '-c:v', 'libx264', '-crf', '17',
                    '-preset', 'fast', '-pix_fmt', 'yuv420p', f], check=True)
    scenes.append((f, a, round(b - a, 3)))
# 2. nhạc (lấy từ video, đúng mức âm lượng bản đăng)
music = os.path.join(KIT, 'nhac_nen.wav')
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', MASTER, '-vn', '-ac', '2', '-ar', '44100', music], check=True)
# 3. phụ đề SRT cho các thẻ chữ
cards = [x for x in kit['items'] if x.get('card')]
for key, name in (('zh', 'zh'), ('py', 'pinyin'), ('vi', 'vi')):
    with open(os.path.join(KIT, f'phu_de_{name}.srt'), 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(f"{i + 1}\n{ts(c['start'])} --> {ts(c['start'] + c['dur'])}\n{c['card'][key]}\n" for i, c in enumerate(cards)))
# 4. dự án CapCut
drafts = os.path.join(KIT, 'du_an_capcut')
os.makedirs(drafts, exist_ok=True)
cap('init', NAME, '--drafts', drafts, '--ratio', '9:16')
D = os.path.join(drafts, NAME)
for f, a, d in scenes:
    cap('add-video', D, f, f'{a}s', f'{d}s', '--track-name', 'Canh quay')
for c in cards:
    for key, tn, size, col, y in (('zh', 'Chu Han', 13, '#111111', '-0.40'), ('py', 'Pinyin', 7, '#D9442B', '-0.50'), ('vi', 'Tieng Viet', 8, '#111111', '-0.57')):
        cap('add-text', D, f"{c['start']}s", f"{c['dur']}s", c['card'][key], '--track-name', tn, '--font-size', size, '--color', col, '--y', y)
for fn in ('draft_content.json', 'draft_info.json'):
    p = os.path.join(D, fn)
    if os.path.exists(p):
        j = json.load(open(p, encoding='utf-8'))
        for t in j.get('tracks', []):
            if t.get('type') == 'text':
                t['attribute'] = 1      # ẩn sẵn: chữ đã có trong hình, bật lên khi muốn sửa
        json.dump(j, open(p, 'w', encoding='utf-8'), ensure_ascii=False)
cap('add-audio', D, music, '0s', f'{DUR}s', '--track-name', 'Nhac nen')
shutil.rmtree(os.path.join(KIT, '_canh'))
subprocess.run([sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'capcut_mac.py'), KIT, drafts, NAME], check=True)
print('Bộ CapCut:', KIT, '| cảnh', len(scenes), '| thẻ chữ', len(cards))
