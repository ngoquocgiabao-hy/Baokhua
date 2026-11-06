#!/usr/bin/env python3
"""Dựng khung xương (rig) cho tranh nhân vật để game.html cử động tay chân tự nhiên.

Đầu vào:
  v4/sprites/<tên>.webp          tranh đã tách nền
  tools/art/rig_joints.json      khớp xương ước lượng (MediaPipe Pose, chỉ số điểm theo chuẩn BlazePose 33 điểm)
Đầu ra:
  v4/rig/<tên>.json              lưới tam giác phủ tranh + 11 xương + trọng số mỗi đỉnh

Cách tính trọng số: khoảng cách "đi bộ" bên trong hình nhân vật từ mỗi đỉnh tới từng xương (geodesic),
đi qua đường viền/chỗ đổi màu mạnh thì tốn hơn → cánh tay đặt trước ngực không kéo theo thân khi giơ tay.
Dùng: python3 tools/art/rig.py [tên ...]   (mặc định: hero1..3 và 5 boss dáng đứng)
"""
import base64, json, os, sys
import numpy as np, cv2
from PIL import Image
from skimage.graph import MCP_Geometric

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
STEP = 13          # cạnh ô lưới (px trên tranh gốc cao ~520px)
DS = 2             # thu nhỏ khi tính khoảng cách
BONES = ['root', 'chest', 'head', 'uaF', 'faF', 'uaB', 'faB', 'thF', 'shF', 'thB', 'shB']
PARENT = [-1, 0, 1, 1, 3, 1, 5, 0, 7, 0, 9]
DEFAULT = ['hero1', 'hero2', 'hero3', 'factory-idle', 'night-idle', 'shadow-idle']  # 06/11: trainee, hotel là quái vẽ bằng code (không rig)
LM = {'nose': 0, 'earL': 7, 'earR': 8, 'shL': 11, 'shR': 12, 'elL': 13, 'elR': 14, 'wrL': 15, 'wrR': 16,
      'hipL': 23, 'hipR': 24, 'knL': 25, 'knR': 26, 'anL': 27, 'anR': 28, 'ftL': 31, 'ftR': 32}


def b64(arr):
    return base64.b64encode(np.ascontiguousarray(arr).tobytes()).decode()


def build(name, J):
    im = np.asarray(Image.open(f'{ROOT}/v4/sprites/{name}.webp').convert('RGBA')).astype(np.float32)
    H, W = im.shape[:2]
    alpha = im[..., 3]
    pts = J[name]
    P = lambda k: np.array(pts[str(LM[k])], float)
    fs = 1 if name.startswith('hero') else -1           # hướng mặt của tranh: tướng nhìn phải, boss nhìn trái
    F, B = ('L', 'R') if fs > 0 else ('R', 'L')          # tay/chân "trước" = phía nhân vật nhìn tới
    shF, elF, wrF, shB, elB, wrB = (P('sh' + F), P('el' + F), P('wr' + F), P('sh' + B), P('el' + B), P('wr' + B))
    hipF, knF, anF, ftF, hipB, knB, anB, ftB = (P('hip' + F), P('kn' + F), P('an' + F), P('ft' + F), P('hip' + B), P('kn' + B), P('an' + B), P('ft' + B))
    pelvis = (hipF + hipB) / 2
    neck = (shF + shB) / 2
    neck[1] -= .05 * (pelvis[1] - neck[1])
    waist = pelvis + (neck - pelvis) * .42
    nose = P('nose')
    col = alpha[:, int(np.clip(nose[0], 0, W - 1))]
    ys = np.where(col[:int(nose[1])] > 30)[0]
    head_top = np.array([nose[0], ys[0] if len(ys) else max(0, nose[1] - (neck[1] - nose[1]) * 2.2)])
    handF, handB = wrF + (wrF - elF) * .35, wrB + (wrB - elB) * .35
    joints = [pelvis, waist, neck, shF, elF, shB, elB, hipF, knF, hipB, knB]
    segs = [
        [[pelvis, waist], [hipF, hipB]],
        [[waist, neck], [shF, shB]],
        [[neck, head_top], [P('earL'), P('earR')]],
        [[shF, elF]], [[elF, wrF, handF]],
        [[shB, elB]], [[elB, wrB, handB]],
        [[hipF, knF]], [[knF, anF, ftF]],
        [[hipB, knB]], [[knB, anB, ftB]],
    ]
    # --- khoảng cách đi trong hình (geodesic), tốn thêm khi băng qua đường viền ---
    small = cv2.resize(im, (W // DS, H // DS), interpolation=cv2.INTER_AREA)
    m = small[..., 3] > 24
    lum = cv2.GaussianBlur(small[..., :3].mean(axis=2), (3, 3), 0)
    gx, gy = cv2.Sobel(lum, cv2.CV_32F, 1, 0), cv2.Sobel(lum, cv2.CV_32F, 0, 1)
    grad = np.sqrt(gx * gx + gy * gy); grad /= (np.percentile(grad[m], 95) + 1e-6)
    cost = 1 + 5 * np.clip(grad, 0, 1.5)
    cost[~m] = 60.0                                   # đi ra ngoài hình rất tốn (nhưng không cấm hẳn)
    hS, wS = m.shape
    D = np.zeros((len(BONES), hS, wS), np.float32)
    for bi, polys in enumerate(segs):
        seeds = []
        for poly in polys:
            for a, b in zip(poly[:-1], poly[1:]):
                n = int(max(2, np.linalg.norm(b - a) / DS))
                for t in np.linspace(0, 1, n):
                    x, y = (a + (b - a) * t) / DS
                    xi, yi = int(np.clip(round(x), 0, wS - 1)), int(np.clip(round(y), 0, hS - 1))
                    seeds.append((yi, xi))
        mcp = MCP_Geometric(cost)
        dist, _ = mcp.find_costs(list(set(seeds)))
        D[bi] = dist
    # --- lưới tam giác phủ hình (nới rộng một chút để không cắt mép) ---
    full = (alpha > 10).astype(np.uint8)
    dil = cv2.dilate(full, np.ones((9, 9), np.uint8))
    ys_, xs_ = np.where(dil > 0)
    x0, x1, y0, y1 = xs_.min(), xs_.max(), ys_.min(), ys_.max()
    gxs = np.arange(x0 - STEP, x1 + STEP + 1, STEP)
    gys = np.arange(y0 - STEP, y1 + STEP + 1, STEP)
    cell = np.zeros((len(gys) - 1, len(gxs) - 1), bool)
    for j in range(len(gys) - 1):
        for i in range(len(gxs) - 1):
            ya, yb = max(0, gys[j]), min(H, gys[j + 1] + 1); xa, xb = max(0, gxs[i]), min(W, gxs[i + 1] + 1)
            if yb > ya and xb > xa and dil[ya:yb, xa:xb].any(): cell[j, i] = True
    vid = -np.ones((len(gys), len(gxs)), int); verts = []
    tris = []
    for j in range(cell.shape[0]):
        for i in range(cell.shape[1]):
            if not cell[j, i]: continue
            for (jj, ii) in ((j, i), (j, i + 1), (j + 1, i), (j + 1, i + 1)):
                if vid[jj, ii] < 0: vid[jj, ii] = len(verts); verts.append((gxs[ii], gys[jj]))
            a, b, c, d = vid[j, i], vid[j, i + 1], vid[j + 1, i], vid[j + 1, i + 1]
            tris += [a, b, d, a, d, c]
    V = np.array(verts, float)
    # trọng số: lấy khoảng cách tại điểm gần nhất nằm trong hình
    edt_in = (~m).astype(np.uint8)
    _, lab = cv2.distanceTransformWithLabels(edt_in, cv2.DIST_L2, 5, labelType=cv2.DIST_LABEL_PIXEL)
    inside = np.argwhere(edt_in == 0)              # toạ độ (y,x) theo thứ tự nhãn
    lut = np.zeros(lab.max() + 1, int)
    zl = lab[edt_in == 0]; lut[zl] = np.arange(len(zl))
    BI = np.zeros((len(V), 4), np.uint8); BW = np.zeros((len(V), 4), np.uint8)
    for k, (x, y) in enumerate(V):
        xs2, ys2 = int(np.clip(x / DS, 0, wS - 1)), int(np.clip(y / DS, 0, hS - 1))
        yy, xx = inside[lut[lab[ys2, xs2]]]
        d = D[:, yy, xx].astype(float)
        w = 1.0 / (d + 1.5) ** 4
        order = np.argsort(-w)[:4]
        ws = w[order] / w[order].sum()
        q = np.round(ws * 255).astype(int); q[0] += 255 - q.sum()
        BI[k] = order; BW[k] = q
    rest = {}
    ang = lambda a, b: float(np.arctan2(b[0] - a[0], b[1] - a[1]))   # góc so với phương thẳng đứng hướng xuống, dương = sang +x
    for k, (a, b) in {'uaF': (shF, elF), 'faF': (elF, wrF), 'uaB': (shB, elB), 'faB': (elB, wrB), 'thF': (hipF, knF), 'shF': (knF, anF), 'thB': (hipB, knB), 'shB': (knB, anB), 'torso': (pelvis, neck)}.items():
        rest[k] = round(ang(a, b), 3)
    return {
        'name': name, 'w': W, 'h': H, 'fs': fs, 'step': STEP,
        'bones': [{'n': n, 'p': PARENT[i], 'j': [round(float(joints[i][0]), 1), round(float(joints[i][1]), 1)]} for i, n in enumerate(BONES)],
        'pts': {'hand': [round(float(v), 1) for v in handF], 'head': [round(float(v), 1) for v in head_top], 'neck': [round(float(v), 1) for v in neck],
                'ankF': [round(float(v), 1) for v in anF], 'ankB': [round(float(v), 1) for v in anB], 'ftF': [round(float(v), 1) for v in ftF], 'ftB': [round(float(v), 1) for v in ftB]},
        'rest': rest,
        'nv': len(V), 'nt': len(tris) // 3,
        'v': b64(np.round(V).astype(np.int16)), 't': b64(np.array(tris, np.uint16)), 'bi': b64(BI), 'bw': b64(BW),
    }


def main():
    J = json.load(open(f'{ROOT}/tools/art/rig_joints.json'))
    names = sys.argv[1:] or DEFAULT
    os.makedirs(f'{ROOT}/v4/rig', exist_ok=True)
    for n in names:
        r = build(n, J)
        path = f'{ROOT}/v4/rig/{n}.json'
        json.dump(r, open(path, 'w'), separators=(',', ':'))
        print(f'{n}: {r["nv"]} đỉnh, {r["nt"]} tam giác, {os.path.getsize(path) // 1024} KB')


if __name__ == '__main__':
    main()
