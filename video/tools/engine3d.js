// Động cơ 3D cho xưởng video Bảo Khựa: quân bài chữ Hán (kiểu quân mạt chược), máy quay, pháo giấy.
// Mọi chuyển động là hàm của thời gian t (lò xo dạng đóng), nên HyperFrames tua tới khung nào cũng vẽ đúng khung đó.
// Dữ liệu cảnh: window.SCENE = { dur, groups:[...], cam:[...], bursts:[...] } do tools/build.mjs sinh ra.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const S = window.SCENE;
const W = 1080, H = 1920;
const C = { sun: '#FFD91F', amber: '#F2B200', denim: '#1E5AA8', deep: '#0F3468', ink: '#16171B', cream: '#FFF7D6', hot: '#FF5A36' };

/* ---------- toán ---------- */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const easeIO = k => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const easeIn = k => k * k * k;
const easeOut = k => 1 - Math.pow(1 - k, 3);
function spring(t, z = .5, w = 10) {           // lò xo tắt dần: 0 → 1, có nảy khi z < 1
  if (t <= 0) return 0;
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
}
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ---------- dựng cảnh ---------- */
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
const camera = new THREE.PerspectiveCamera(30, W / H, .1, 200);
scene.add(new THREE.HemisphereLight(0xfff7d6, 0x0f3468, 1.1));
const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(3, 6, 9); scene.add(key);
const rim = new THREE.DirectionalLight(0xffd91f, 1.6); rim.position.set(-5, 3, -6); scene.add(rim);

function faceTexture(ch, opt = {}) {
  const cw = 512, chh = 640, cv = document.createElement('canvas'); cv.width = cw; cv.height = chh;
  const g = cv.getContext('2d');
  g.fillStyle = opt.bg || C.cream; g.fillRect(0, 0, cw, chh);
  g.strokeStyle = opt.ring || 'rgba(30,90,168,.22)'; g.lineWidth = 14;
  g.beginPath(); g.roundRect(34, 34, cw - 68, chh - 68, 46); g.stroke();
  const latin = !/[一-鿿]/.test(ch);
  g.fillStyle = opt.ink || C.ink; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = latin ? `900 ${ch.length > 1 ? 250 : 360}px "Inter Display"` : '400 360px "WenQuanYi Zen Hei"';
  g.fillText(ch, cw / 2, chh / 2 + (latin ? 14 : 8));
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
  return tx;
}
function shadowTexture() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128;
  const g = cv.getContext('2d'), gr = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  gr.addColorStop(0, 'rgba(10,20,40,.75)'); gr.addColorStop(1, 'rgba(10,20,40,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(cv);
}

const TW = .8, TH = 1.0, TD = .38;
const geo = new RoundedBoxGeometry(TW, TH, TD, 6, .11);
const sideMat = { sun: new THREE.MeshStandardMaterial({ color: C.sun, roughness: .32, metalness: .05 }),
                  denim: new THREE.MeshStandardMaterial({ color: C.denim, roughness: .35, metalness: .08 }),
                  hot: new THREE.MeshStandardMaterial({ color: C.hot, roughness: .35, metalness: .05 }) };
const backMat = new THREE.MeshStandardMaterial({ color: C.deep, roughness: .4 });
const shTex = shadowTexture();
const groups = [];

function buildGroup(G) {
  const root = new THREE.Group(); scene.add(root);
  const chars = [...G.chars], n = chars.length, sp = G.spacing || .92;
  const tiles = chars.map((ch, i) => {
    const front = new THREE.MeshStandardMaterial({ map: faceTexture(ch, G.face || {}), roughness: .42 });
    const side = sideMat[G.side || 'sun'];
    const m = new THREE.Mesh(geo, [side, side, side, side, front, backMat]);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(1.25, .55), new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2;
    const holder = new THREE.Group(); holder.add(m); root.add(holder); root.add(sh);
    return { m, sh, holder, x0: (i - (n - 1) / 2) * sp };
  });
  groups.push({ G, root, tiles });
}

/* pháo giấy: mỗi đợt một InstancedMesh, quỹ đạo ném xiên tính theo t */
const bursts = [];
function buildBurst(B, k) {
  const N = B.n || 46, r = rng(1000 + k);
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(.11, .05, .012), new THREE.MeshStandardMaterial({ roughness: .5, metalness: .2 }), N);
  const cols = [C.sun, C.cream, C.denim, C.hot, C.amber].map(c => new THREE.Color(c));
  const parts = [];
  for (let i = 0; i < N; i++) {
    const a = r() * Math.PI * 2, up = .35 + r() * .9, sp = 2.6 + r() * 3.6;
    parts.push({ vx: Math.cos(a) * sp * .8, vy: up * sp + 1.5, vz: Math.sin(a) * sp * .5, rx: r() * 12, ry: r() * 12 });
    mesh.setColorAt(i, cols[i % cols.length]);
  }
  scene.add(mesh); bursts.push({ B, mesh, parts });
}

const dummy = new THREE.Object3D();
function poseGroup(g, t) {
  const { G, tiles } = g;
  const vis = t >= G.t0 - .02 && t <= (G.t1 ?? 1e9) + 1.2;
  g.root.visible = vis; if (!vis) return;
  g.root.position.set(G.x || 0, G.y || 0, G.z || 0);
  tiles.forEach((T, i) => {
    const tl = t - G.t0 - i * (G.stagger ?? .1);
    let x = T.x0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1;
    const sg = i % 2 ? 1 : -1;
    if (G.enter === 'drop') { const k = spring(tl, .42, 11); y += (1 - k) * 7; rx += (1 - k) * -1.3; rz += (1 - k) * .45 * sg; }
    else if (G.enter === 'flip') { const k = spring(tl, .55, 9); ry += (1 - k) * Math.PI; z += (1 - k) * -2.5; s *= lerp(.55, 1, clamp(k)); }
    else if (G.enter === 'rise') { const k = spring(tl, .5, 8); y += (1 - k) * -5; ry += (1 - k) * Math.PI * 2.5; }
    else if (G.enter === 'slam') { const k = spring(tl, .38, 13); z += (1 - k) * 9; rx += (1 - k) * .6; s *= lerp(1.8, 1, clamp(k)); }
    if (tl < 0) s = 0;
    if (G.t1 != null) {
      const e = easeIn(clamp((t - G.t1 - i * .05) / .45));
      const dir = G.exitDir || 1;
      if (G.exit === 'knock') { x += e * (9 + i * 1.5) * dir; y += e * 2.2; rz -= e * 3.2 * dir; rx += e * 2; }
      else if (G.exit === 'spin') { ry += e * Math.PI * 3; s *= 1 - e; }
      else if (G.exit === 'sink') { y -= e * 7; rx -= e * 1.5; }
      else { s *= 1 - e; }
    }
    T.holder.position.set(x, y, z); T.holder.rotation.set(rx, ry, rz); T.holder.scale.setScalar(Math.max(s, .0001));
    const h = Math.max(0, y);
    T.sh.position.set(x, -TH / 2 - .02, z); T.sh.material.opacity = (s > .01 ? 1 : 0) * clamp(1 - h / 4) * .9; T.sh.scale.setScalar(1 + h * .15);
  });
}
function poseBurst(b, t) {
  const tl = t - b.B.t, vis = tl >= 0 && tl <= 1.8; b.mesh.visible = vis; if (!vis) return;
  b.parts.forEach((p, i) => {
    const dr = 1 - tl * .22;
    dummy.position.set((b.B.x || 0) + p.vx * tl * dr, (b.B.y || 0) + p.vy * tl - 4.2 * tl * tl, (b.B.z || 0) + p.vz * tl);
    dummy.rotation.set(p.rx * tl, p.ry * tl, 0); dummy.scale.setScalar(1 - clamp((tl - 1.2) / .6));
    dummy.updateMatrix(); b.mesh.setMatrixAt(i, dummy.matrix);
  });
  b.mesh.instanceMatrix.needsUpdate = true;
}
function poseCamera(t) {
  const K = S.cam; let a = K[0], b = K[0];
  for (let i = 0; i < K.length; i++) { if (K[i].t <= t) { a = K[i]; b = K[i + 1] || K[i]; } }
  const k = b === a ? 0 : (b.cut ? (t >= b.t ? 1 : 0) : easeIO(clamp((t - a.t) / (b.t - a.t))));
  camera.position.set(lerp(a.p[0], b.p[0], k), lerp(a.p[1], b.p[1], k), lerp(a.p[2], b.p[2], k));
  camera.lookAt(lerp(a.l[0], b.l[0], k), lerp(a.l[1], b.l[1], k), lerp(a.l[2], b.l[2], k));
  camera.rotation.z += lerp(a.roll || 0, b.roll || 0, k);
}
function renderAt(t) {
  poseCamera(t); groups.forEach(g => poseGroup(g, t)); bursts.forEach(b => poseBurst(b, t));
  renderer.render(scene, camera);
}

const ready = (async () => {
  await Promise.all([document.fonts.load('400 120px "WenQuanYi Zen Hei"', S.glyphs || '宝'), document.fonts.load('900 120px "Inter Display"', '0123456789★')]);
  S.groups.forEach(buildGroup); (S.bursts || []).forEach(buildBurst);
  renderAt(0);
})();
window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady.three = ready;
window.addEventListener('hf-seek', e => { const t = e.detail.time; if (e.detail.waitUntil) e.detail.waitUntil(ready.then(() => renderAt(t))); else ready.then(() => renderAt(t)); });
window.renderAt3d = t => ready.then(() => renderAt(t));
