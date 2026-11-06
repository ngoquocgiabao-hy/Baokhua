#!/usr/bin/env python3
"""Biến video nhân vật (tạo bằng Google Flow / Veo, nền xanh lá) thành dải khung hình động cho game.html.

Dùng:
  python3 tools/art/video2sheet.py <video.mp4> <tên_hoạt_cảnh> [--fps 12] [--from 0.5] [--to 2.5]
                                    [--height 520] [--key green|rembg] [--loop] [--out v4/anim]
Ví dụ:
  python3 tools/art/video2sheet.py hotel_attack.mp4 hotel-atk --fps 12 --from 0.4 --to 1.6

Kết quả:
  v4/anim/<tên>.webp   một dải ngang các khung (cùng cỡ ô), nền trong suốt
  v4/anim/<tên>.json   {"fw","fh","n","fps","ax","gy","loop"}  — ax/gy: điểm neo giữa chân, đáy chân (khớp bảng SPRITE)

Cách tách nền:
  --key green  (mặc định) tách phông xanh lá theo màu — nhanh, sạch nếu video quay nền xanh đều (#00FF00)
  --key rembg  dùng mô hình rembg isnet-anime cho từng khung — chậm hơn, dùng khi nền không phải xanh
Tỉ lệ nhân vật giữ cố định theo khung đầu (chân chạm đất ở cùng một dòng), để ghép vào sân đấu không bị nhảy cỡ.
"""
import argparse, json, os, subprocess, sys, tempfile
import numpy as np, cv2
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))


def frames_from(video, fps, t0, t1, tmp):
    cmd = ['ffmpeg', '-v', 'error', '-y']
    if t0:
        cmd += ['-ss', str(t0)]
    cmd += ['-i', video]
    if t1:
        cmd += ['-t', str(max(0.05, t1 - (t0 or 0)))]
    cmd += ['-vf', f'fps={fps}', os.path.join(tmp, 'f%04d.png')]
    subprocess.run(cmd, check=True)
    return sorted(os.path.join(tmp, f) for f in os.listdir(tmp) if f.endswith('.png'))


def key_green(rgb):
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
    h, s, v = hsv[..., 0].astype(np.int16), hsv[..., 1].astype(np.int16), hsv[..., 2].astype(np.int16)
    g = ((h > 35) & (h < 90) & (s > 70) & (v > 50)).astype(np.uint8)
    alpha = (1 - g) * 255
    alpha = cv2.morphologyEx(alpha.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    alpha = cv2.GaussianBlur(cv2.erode(alpha, np.ones((3, 3), np.uint8)), (3, 3), 0)
    # khử ánh xanh hắt lên viền (despill)
    out = rgb.astype(np.int16)
    lim = np.maximum(out[..., 0], out[..., 2])
    out[..., 1] = np.minimum(out[..., 1], lim + 12)
    return out.clip(0, 255).astype(np.uint8), alpha


def key_rembg(rgb, sess):
    from rembg import remove
    m = remove(Image.fromarray(rgb), session=sess, only_mask=True)
    return rgb, np.asarray(m)


def keep_main(alpha):
    a = alpha.copy()
    n, lab, st, _ = cv2.connectedComponentsWithStats((a > 40).astype(np.uint8), 8)
    if n > 2:
        big = st[1:, cv2.CC_STAT_AREA].max()
        for i in range(1, n):
            if st[i, cv2.CC_STAT_AREA] < big * .02:
                a[lab == i] = 0
    return a


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('video'); ap.add_argument('name')
    ap.add_argument('--fps', type=float, default=12); ap.add_argument('--from', dest='t0', type=float, default=0)
    ap.add_argument('--to', dest='t1', type=float, default=0); ap.add_argument('--height', type=int, default=520)
    ap.add_argument('--key', choices=['green', 'rembg'], default='green'); ap.add_argument('--loop', action='store_true')
    ap.add_argument('--out', default=os.path.join(ROOT, 'v4', 'anim'))
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    sess = None
    if a.key == 'rembg':
        from rembg import new_session
        sess = new_session('isnet-anime')
    with tempfile.TemporaryDirectory() as tmp:
        files = frames_from(a.video, a.fps, a.t0, a.t1, tmp)
        if not files:
            sys.exit('Không lấy được khung nào từ video.')
        cut = []
        for f in files:
            rgb = np.asarray(Image.open(f).convert('RGB'))
            rgb, al = key_green(rgb) if a.key == 'green' else key_rembg(rgb, sess)
            cut.append((rgb, keep_main(al)))
    # khung bao chung của mọi khung + tỉ lệ theo chiều cao nhân vật ở khung đầu
    boxes = [cv2.boundingRect((al > 40).astype(np.uint8)) for _, al in cut]
    boxes = [b for b in boxes if b[2] > 0 and b[3] > 0]
    if not boxes:
        sys.exit('Tách nền không ra nhân vật — thử --key rembg.')
    x0 = min(b[0] for b in boxes); y0 = min(b[1] for b in boxes)
    x1 = max(b[0] + b[2] for b in boxes); y1 = max(b[1] + b[3] for b in boxes)
    first = boxes[0]
    f = a.height / first[3]
    ground = first[1] + first[3]                 # đáy chân ở khung đầu = mặt đất
    ax_src = first[0] + first[2] / 2             # giữa thân ở khung đầu = điểm neo
    fw, fh = max(1, round((x1 - x0) * f)), max(1, round((y1 - y0) * f))
    sheet = Image.new('RGBA', (fw * len(cut), fh), (0, 0, 0, 0))
    for i, (rgb, al) in enumerate(cut):
        im = Image.fromarray(np.dstack([rgb, al]).astype(np.uint8), 'RGBA').crop((x0, y0, x1, y1))
        sheet.paste(im.resize((fw, fh), Image.LANCZOS), (i * fw, 0))
    dst = os.path.join(a.out, a.name)
    sheet.save(dst + '.webp', 'WEBP', quality=82, method=6)
    meta = {'fw': fw, 'fh': fh, 'n': len(cut), 'fps': a.fps, 'ax': round((ax_src - x0) * f), 'gy': round((ground - y0) * f), 'loop': a.loop}
    json.dump(meta, open(dst + '.json', 'w'), indent=1)
    kb = os.path.getsize(dst + '.webp') // 1024
    print(f'{os.path.relpath(dst, ROOT)}.webp  {len(cut)} khung {fw}×{fh}  {kb} KB  meta={meta}')
    if kb > 900:
        print('  ⚠ file nặng: giảm --fps, rút ngắn --from/--to hoặc --height 420')


if __name__ == '__main__':
    main()
