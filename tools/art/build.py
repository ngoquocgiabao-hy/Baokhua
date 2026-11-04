# Dựng hình cắt (v4/sprites/*.webp), ảnh VS (v4/vs) và phông nền mờ (v4/bg) từ ảnh boss + mặt nạ.
# Dùng: python3 build.py <thư_mục_làm_việc> (cần dl_boss/ ảnh gốc, cut/ mặt nạ). In ra bảng SPRITE để dán vào game.html.
import sys, json, numpy as np, cv2
from PIL import Image, ImageFilter, ImageEnhance
sp = sys.argv[1]
OUT = f'{sp}/out'
KEYS = {'le-tan-tap-su': 'trainee', 'le-tan-kho-tinh': 'hotel', 'to-truong': 'factory', 'quan-ly-ca-dem': 'night', 'hac-ninja': 'shadow'}
meta = {}
PREFER_GENERAL = {'ANH_boss-le-tan-kho-tinh-defeat_04-11'}
def clean_mask(m):
    a = np.asarray(m).astype(np.uint8)
    a[a < 18] = 0
    # bỏ mảnh vụn: giữ các mảng lớn (≥ 2% mảng lớn nhất)
    n, lab, stats, _ = cv2.connectedComponentsWithStats((a > 0).astype(np.uint8), 8)
    if n > 2:
        big = stats[1:, cv2.CC_STAT_AREA].max()
        for i in range(1, n):
            top, hh = stats[i, cv2.CC_STAT_TOP], stats[i, cv2.CC_STAT_HEIGHT]
            # mảnh vụn, hoặc vật nằm hẳn trên trời (mặt trăng) → bỏ
            if stats[i, cv2.CC_STAT_AREA] < big * .02 or (top + hh) < a.shape[0] * .3: a[lab == i] = 0
    # co viền 1px để mất quầng nền
    er = cv2.erode(a, np.ones((3, 3), np.uint8))
    a = np.minimum(a, cv2.GaussianBlur(er, (3, 3), 0))
    return Image.fromarray(a)
def load(src, maskp):
    im = Image.open(src).convert('RGB'); m = clean_mask(Image.open(maskp).convert('L'))
    bb = m.point(lambda v: 255 if v > 30 else 0).getbbox()
    return im, m, bb
def group(items, H=520):
    """items: [(name, src, maskp)] — cùng tỉ lệ theo ảnh đầu (dáng đứng); neo = giữa chân, đáy dáng đứng"""
    base = load(items[0][1], items[0][2]); bb0 = base[2]
    f = H / (bb0[3] - bb0[1]); ax0 = (bb0[0] + bb0[2]) / 2; gy0 = bb0[3]
    for name, src, mp in items:
        im, m, bb = load(src, mp)
        rgba = im.copy(); rgba.putalpha(m); c = rgba.crop(bb)
        w, h = max(1, round(c.width * f)), max(1, round(c.height * f))
        c = c.resize((w, h), Image.LANCZOS)
        c.save(f'{OUT}/sprites/{name}.webp', 'WEBP', quality=84, method=6)
        meta[name] = {'w': w, 'h': h, 'ax': round((ax0 - bb[0]) * f), 'gy': round((gy0 - bb[1]) * f), 'H': H}
for b, k in KEYS.items():
    items = []
    for suf, pose in [('', 'idle'), ('-attack', 'atk'), ('-defeat', 'ko')]:
        n = f'ANH_boss-{b}{suf}_04-11'
        mp = f'{sp}/cut/{n}__isnet-anime.png'
        if np.asarray(Image.open(mp)).mean() < 5 or n in PREFER_GENERAL: mp = f'{sp}/cut/{n}__isnet-general-use.png'
        items.append((f'{k}-{pose}', f'{sp}/dl_boss/{n}.png', mp))
    group(items)
    Image.open(f'{sp}/dl_boss/ANH_boss-{b}_04-11.png').convert('RGB').save(f'{OUT}/vs/{k}.jpg', 'JPEG', quality=80, optimize=True, progressive=True)
group([(f'hero{i}', f'{sp}/dl_boss/HERO_{i}.jpg', f'{sp}/cut/HERO_{i}__isnet-anime.png') for i in (1, 2, 3)])
# phông nền: ghép 3 ảnh, tô chỗ trống, cắt dải ngang, làm mờ chiều sâu
for b, k in KEYS.items():
    ims, ms = [], []
    sufs = ['', '-defeat'] if k == 'shadow' else ['', '-attack', '-defeat']
    for suf in sufs:
        n = f'ANH_boss-{b}{suf}_04-11'
        im = np.asarray(Image.open(f'{sp}/dl_boss/{n}.png').convert('RGB'))
        mp = f'{sp}/cut/{n}__isnet-anime.png'
        m = np.asarray(Image.open(mp).convert('L')) > 12
        if m.mean() < .02: m = np.asarray(Image.open(f'{sp}/cut/{n}__isnet-general-use.png').convert('L')) > 12
        m = cv2.dilate(m.astype(np.uint8), np.ones((25, 25), np.uint8)) > 0
        m2 = m.copy(); m2[30:] |= m[:-30]
        ims.append(im); ms.append(m2)
    comp = ims[0].copy(); hole = ms[0].copy()
    for i in range(1, len(ims)):
        take = hole & ~ms[i]; comp[take] = ims[i][take]; hole &= ms[i]
    comp = cv2.inpaint(comp, hole.astype(np.uint8) * 255, 9, cv2.INPAINT_TELEA)
    bg = Image.fromarray(comp)
    W = 900; s = W / bg.width; bgs = bg.resize((W, round(bg.height * s)), Image.LANCZOS)
    y0 = round(bgs.height * .34); band = bgs.crop((0, y0, W, y0 + 640))
    band = band.filter(ImageFilter.GaussianBlur(6))
    band = ImageEnhance.Brightness(band).enhance(.9)
    band.save(f'{OUT}/bg/{k}.jpg', 'JPEG', quality=78, optimize=True, progressive=True)
json.dump(meta, open(f'{OUT}/meta.json', 'w'))
print(json.dumps(meta))
