/* =====================================================================
   THẾ GIỚI 3D HỢP NHẤT · Khách sạn Vịnh Ā Bǎo (v7 · 06/11/2026)
   Một cảnh Three.js, một kiểu vẽ (khối bo tròn, tô hoạt hình, viền mực), 3 tầng nhìn liền mạch:
     · Toàn vịnh Hạ Long (kéo ra xa)  – bản đồ Hành trình: các chặng câu chuyện lịch sử, văn hoá, địa phương
     · Phố Bãi Cháy (mặc định)        – khách sạn, phố, biển, khách xếp hàng ở cửa
     · Bên trong (chạm vào khách sạn) – tường ngoài mờ dần, lộ sảnh ngay tại chỗ (không tải trang khác)
   Đồ mua trong sảnh + công trình ngoài phố + sao khách sạn → mặt tiền và sảnh cùng nâng cấp.
   Game chính (index.html) gọi window.BKWorld; thế giới gọi lại game qua hooks.
   ===================================================================== */
import * as THREE from 'three';
import { REDUCED, V3, clamp, lerp, sstep, easeIO, rng, ZH, UI, INK, toon, ownToon, OUTL, shellBegin, shellEnd, setSeg, rbox, cylG, sphG, coneG, planeG, put, M, rb, cyl, sph, cone, ol,
  canvasTex, signTex, stripeTex, TX, fxRoot, sprite, puff, sparkles, confetti, burst, stepFx, setCoinHook, chibi, pose, walk, faceTo, tickClock, bake, grad } from './w-kit.js';
import { buildLobby, ROOM, DESK_SPOT, GUEST_SPOT, DOOR_IN, DOOR_OUT, LIFT } from './w-lobby.js';
import { buildLife, roadY, roadSlope, BR, LANE, ROUTE, mini, lifePose, LOOK, vcMerge } from './w-life.js';

const LOBBY_H = 3.8, FLOOR_H = 3.0, DOOR_X = 9.25;
const SLOT = i => new V3(DOOR_X + .15 + i * 1.05, 0, 9.85 + (i % 2) * .32);
const pick = a => a[(Math.random() * a.length) | 0];
const rnd = (a, b) => a + Math.random() * (b - a);
const inH = (h, a, b) => a <= b ? (h >= a && h < b) : (h >= a || h < b);
const S_IN = 5.4, S_STREET = 15, S_BAY = 125;

let renderer, scene, cam, wrap, cv, hooks = {}, low = false, active = true, ready = false;
const world = new THREE.Group(), staticRoot = new THREE.Group(), dyn = new THREE.Group(), people = new THREE.Group();
const camDir = new V3(1, .95, 1).normalize();
const view = { at: new V3(8, .6, 10.5), S: S_STREET };
let fly = null, lastUser = -9e9, mode = 'street', dark = 0, hour = 12, T = 0;
const taps = [];        // { box: Box3 } | { obj } + key
const tapBox = (x0, y0, z0, x1, y1, z1, key) => taps.push({ box: new THREE.Box3(new V3(x0, y0, z0), new V3(x1, y1, z1)), key });
const lampGlows = [], nightMats = [], dayHide = [];
let lobby = null, hotel = null, shellMats = [], shellGlows = [], roomWins = {}, hotelBox = new THREE.Box3(), doorPanels = [], liftCab = null, liftTop = 6;
let ST = { star: 1, floors: 1, own: {}, furn: [], staff: 0, open: true };
let sig = '';

/* =====================================================================
   ĐỊA HÌNH: đất, phố, bãi biển, biển, đồi, các vùng quanh vịnh
   ===================================================================== */
let seaTex, seaMat, foam;
function slab(g, x0, x1, z0, z1, top, c, h = 1.2, r = .3) { g.add(rb(x1 - x0, h, z1 - z0, c, (x0 + x1) / 2, top - h / 2, (z0 + z1) / 2, r)); }
function rod(g, a, b, r, c, seg = 6) { const d = b.clone().sub(a), L = d.length(); const m = cyl(r, r, L, c, 0, 0, 0, seg); m.position.copy(a).addScaledVector(d, .5); m.quaternion.setFromUnitVectors(new V3(0, 1, 0), d.normalize()); g.add(m); return m; }
function tree(g, x, z, s = 1, y = 0, col) {
  g.add(cyl(.12 * s, .16 * s, 1.1 * s, '#9b6a43', x, y + .55 * s, z, 6));
  const c = col || pick(['#5fb36a', '#6fc27a', '#4fa35e']);
  g.add(ol(sph(.75 * s, c, x, y + 1.5 * s, z, 8), .05 * s)); g.add(sph(.5 * s, '#86d18a', x + .25 * s, y + 2.0 * s, z + .2 * s, 7));
}
function palm(g, x, z, s = 1) {
  const pts = [[0, 0], [.15, 1.2], [.45, 2.3], [.8, 3.2]];
  for (let i = 0; i < 3; i++) rod(g, new V3(x + pts[i][0] * s, pts[i][1] * s, z), new V3(x + pts[i + 1][0] * s, pts[i + 1][1] * s, z), (.16 - i * .03) * s, '#b0814f', 6);
  const tx = x + .8 * s, ty = 3.2 * s;
  for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283, l = M(sphG(.6 * s, 7), i % 2 ? '#3fa35a' : '#5cc070', tx + Math.cos(a) * .7 * s, ty - .1 * s, z + Math.sin(a) * .7 * s); l.scale.set(1.6, .22, .55); l.rotation.y = -a; l.rotation.z = -.35; g.add(l); }
  g.add(sph(.18 * s, '#7a5230', tx, ty - .2 * s, z, 6));
}
function karstGeo(seed) {
  const r = rng(seed), g = new THREE.CylinderGeometry(.62, 1, 2, 11, 6); g.translate(0, 1, 0);
  const p = g.attributes.position, n = p.count, col = new Float32Array(n * 3), v = new V3(), b = Array.from({ length: 6 }, () => r() * 6.283);
  const cTop = new THREE.Color('#4f9e5f'), cGr = new THREE.Color('#78b86c'), cRock = new THREE.Color('#c3c8ae'), cBase = new THREE.Color('#8e9b8a'), c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(p, i); const a = Math.atan2(v.z, v.x), y = v.y, rad = Math.hypot(v.x, v.z);
    const k = 1 + .2 * Math.sin(a * 3 + b[0]) + .13 * Math.sin(a * 5 + b[1]) + .09 * Math.sin(y * 3.1 + b[2]) - .12 * Math.sin(y * 1.6 + .5);
    v.x *= k; v.z *= k; if (y > 1.99) v.y += rad < .01 ? .55 : .18 + .14 * Math.sin(a * 2 + b[3]);
    p.setXYZ(i, v.x, v.y, v.z);
    const t = v.y / 2.4; if (t > .72) c.copy(cTop).lerp(cGr, Math.sin(a * 4 + b[4]) * .5 + .5); else if (t > .58) c.copy(cRock).lerp(cGr, (t - .58) / .14); else if (t > .1) c.copy(cRock).lerp(cBase, .25 + .25 * Math.sin(y * 5 + a)); else c.copy(cBase);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
}
const KARST = [11, 23, 37, 51].map(karstGeo);
const karstMat = new THREE.MeshToonMaterial({ color: '#ffffff', vertexColors: true, gradientMap: grad });
function karst(g, x, z, w, h, k = 0, rotY = 0, lean = 0) { const m = new THREE.Mesh(KARST[k % 4], karstMat); m.position.set(x, -.6, z); m.scale.set(w, h / 2, w * (.8 + (k % 3) * .12)); m.rotation.set(0, rotY, lean); m.castShadow = m.receiveShadow = true; g.add(m); const o = new THREE.Mesh(KARST[k % 4], OUTL); o.scale.set(1.045, 1.02, 1.045); o.userData.outline = 1; m.add(o); return m; }

function buildTerrain(g) {
  // biển: kết cấu sóng trôi
  seaTex = canvasTex(128, 128, c => { c.fillStyle = '#4fb6d6'; c.fillRect(0, 0, 128, 128); c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 14; i++) { const x = (i * 37) % 128, y = (i * 53) % 128; c.fillRect(x, y, 10 + (i % 3) * 6, 2); } c.fillStyle = 'rgba(20,80,130,.12)'; for (let i = 0; i < 8; i++) c.fillRect((i * 71) % 128, (i * 29) % 128, 18, 3); }, [140, 140]);
  seaMat = new THREE.MeshToonMaterial({ color: '#ffffff', map: seaTex, gradientMap: grad });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(1800, 1800, 48, 48), seaMat); sea.rotation.x = -Math.PI / 2; sea.position.set(60, -.32, 120); sea.receiveShadow = true; world.add(sea);
  const shallow = new THREE.Mesh(new THREE.PlaneGeometry(150, 16), new THREE.MeshBasicMaterial({ color: '#9fe8ee', transparent: true, opacity: .5, depthWrite: false })); shallow.rotation.x = -Math.PI / 2; shallow.position.set(-2, -.29, 34); world.add(shallow);
  foam = new THREE.Mesh(new THREE.PlaneGeometry(138, .9), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .7, depthWrite: false })); foam.rotation.x = -Math.PI / 2; foam.position.set(-2, -.27, 28.7); world.add(foam);
  // đất Bãi Cháy + phố
  slab(g, -70, 66, -150, 19.4, -.05, '#bfe0a0', 2, .6);
  slab(g, -64, 64, -7, 8.4, -.02, '#ece4d2', .2, .05);
  slab(g, -64, 64, 8.4, 11.3, .06, '#efe3c8', .3, .05);
  slab(g, -64, 64, 11.2, 11.45, .12, '#cdbf9f', .3, .04);
  slab(g, -64, 64, 11.45, 17, -.01, '#5d6372', .2, .02);
  const lane = new THREE.Mesh(planeG(128, .16), new THREE.MeshBasicMaterial({ map: canvasTex(64, 8, c => { c.fillStyle = '#fff6d0'; c.fillRect(0, 0, 36, 8); }, [64, 1]), transparent: true }));
  lane.rotation.x = -Math.PI / 2; lane.position.set(0, .0, 14.2); g.add(lane);
  for (const z of [11.9, 16.55]) { const l = new THREE.Mesh(planeG(128, .1), toon('#f2f2f2')); l.rotation.x = -Math.PI / 2; l.position.set(0, .0, z); g.add(l); }
  // vạch qua đường trước cửa khách sạn
  for (let i = 0; i < 7; i++) { const s = new THREE.Mesh(planeG(.5, 5.2), toon('#f5f5f0')); s.rotation.x = -Math.PI / 2; s.position.set(6.6 + i * 1.0, .005, 14.2); g.add(s); }
  slab(g, -64, 64, 17, 19.4, .1, '#f5e9cf', .4, .05);
  for (let x = -63; x <= 63; x += 2) g.add(cyl(.06, .06, .8, '#ffffff', x, .5, 19.25, 6));
  g.add(rb(128, .1, .1, '#ffffff', 0, .92, 19.25, .03)); g.add(rb(128, .06, .06, '#ffffff', 0, .58, 19.25, .02));
  slab(g, -66, 66, 19.4, 22.5, -.03, '#f7e0a3', .5, .1); slab(g, -66, 66, 22.5, 25.5, -.08, '#f3d894', .5, .1); slab(g, -66, 66, 25.5, 28.6, -.13, '#ecd08a', .5, .1);
  // đồi Ba Đèo sau phố + rặng núi phía bắc
  const hill = M(new THREE.SphereGeometry(30, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), '#8fcf7a', 30, -.5, -44); hill.scale.y = .62; g.add(hill);
  const hill2 = M(new THREE.SphereGeometry(22, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), '#9ad683', -38, -.5, -88); hill2.scale.y = .5; g.add(hill2);
  const r = rng(7);
  for (let i = 0; i < 26; i++) { const x = -330 + i * 28 + r() * 10, h = 24 + r() * 26, w = 34 + r() * 20; const m = M(new THREE.SphereGeometry(w, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2), i % 2 ? '#8cc47c' : '#9fd18a', x, -.5, -132 - r() * 14); m.scale.y = h / w; g.add(m); }
  for (let i = 0; i < 70; i++) { const a = r() * 6.283, d = r() * 26, x = 30 + Math.cos(a) * d, z = -44 + Math.sin(a) * d, y = Math.sqrt(Math.max(0, 900 - d * d)) * .62 - .5; if (z > -20) continue; tree(g, x, z, 1.6 + r(), y - .3); }
  for (const x of [-60, -52, -19, -15, -3, 2, 22, 30, 38, 46]) tree(g, x + r() * 2, -6.3, 1.1 + r() * .5);
  for (let i = 0; i < 26; i++) { const x = -16 + r() * 82, z = -24 - r() * 6; if (Math.hypot(x - 30, z + 44) < 27) continue; tree(g, x, z, 1.2 + r() * .7); }
  // bờ tây: đường ra Tuần Châu, Quảng Yên · sông Bạch Đằng cắt ngang
  slab(g, -170, -70, -150, 6, -.05, '#bfe0a0', 2, .6); slab(g, -73, -67, -150, 6, -.065, '#bfe0a0', 2, .1); slab(g, -330, -200, -150, 6, -.05, '#b5d996', 2, .6);
  slab(g, -170, -70, 3, 6.5, -.02, '#e3d8bf', .3, .1); slab(g, -330, -200, 3, 6.5, -.02, '#e3d8bf', .3, .1); g.add(rb(34, .5, 4, '#cfd8e3', -185, .3, 4.7, .1));
  for (let i = 0; i < 26; i++) tree(g, -165 + r() * 92, -10 - r() * 120, 2 + r() * 1.5);
  for (let i = 0; i < 20; i++) tree(g, -325 + r() * 120, -10 - r() * 120, 2 + r() * 1.5);
  // đảo Tuần Châu + đường nối
  g.add(cyl(24, 25, 1.2, '#bfe0a0', -113, -.65, 64, 28)); g.add(cyl(27, 28, 1, '#f3d894', -113, -.62, 64, 28));
  g.add(rb(5, .5, 34, '#e3d8bf', -113, -.2, 23, .2));
  for (let i = 0; i < 20; i++) { const a = r() * 6.283, d = r() * 18; if (Math.hypot(Math.cos(a) * d, Math.sin(a) * d * .8 - 10) < 9) continue; tree(g, -113 + Math.cos(a) * d, 60 + Math.sin(a) * d * .8, 1.8 + r()); }
  // Hòn Gai (bên kia cầu) + Cẩm Phả
  slab(g, 140, 262, -150, 22, -.05, '#bfe0a0', 2, .6); slab(g, 262, 380, -150, 8, -.05, '#c6cda9', 2, .6); slab(g, 195, 300, 21, 100, -.05, '#c6cda9', 2, .6);
  slab(g, 146, 258, -40, -16, -.02, '#e6decb', .2, .05);
  for (let i = 0; i < 20; i++) tree(g, 146 + r() * 110, -50 - r() * 90, 2 + r());
}

/* =====================================================================
   PHỐ BÃI CHÁY: dãy cửa hàng, toà cao tầng, đèn đường, ghế đá, trạm xe buýt
   ===================================================================== */
const winA = new THREE.MeshToonMaterial({ color: '#bfe2f5', gradientMap: grad, emissive: '#ffcf70', emissiveIntensity: 0 });
const winB = new THREE.MeshToonMaterial({ color: '#a9d2ea', gradientMap: grad, emissive: '#ffb86a', emissiveIntensity: 0 });
const glassMat = new THREE.MeshToonMaterial({ color: '#cdeaf7', gradientMap: grad, emissive: '#ffd890', emissiveIntensity: 0 });
nightMats.push([winA, .95], [winB, .25], [glassMat, .85]);
const SHOPS = [
  { x0: -19.5, x1: -12, h: 6.4, c: '#ff9f7a', key: 'cafe', zh: '咖啡馆', sub: 'kāfēiguǎn · Cà phê', aw: ['#ffffff', '#e8593c'] },
  { x0: -28, x1: -20.5, h: 5.2, c: '#8fd3c7', key: 'seafood', zh: '海鲜', sub: 'hǎixiān · Hải sản', aw: ['#ffffff', '#1E5AA8'] },
  { x0: -36.5, x1: -29, h: 7.6, c: '#ffd166', key: 'mart', zh: '便利店', sub: 'biànlìdiàn · Tạp hoá', aw: ['#2a9d8f', '#ffffff'] },
  { x0: -45, x1: -37.5, h: 6.2, c: '#c9a0ff', key: 'ktv', zh: '卡拉OK', sub: 'kǎlā OK · Karaoke', aw: ['#ff7fa0', '#ffffff'] },
  { x0: -53, x1: -46, h: 8.2, c: '#9fc5ff', key: 'rent', zh: '招租', sub: 'zhāozū · Cho thuê', aw: ['#ffffff', '#16171B'] },
  { x0: -61, x1: -54, h: 5.6, c: '#ffb38a', key: 'seafood', zh: '烧烤', sub: 'shāokǎo · Đồ nướng', aw: ['#ffd166', '#e8593c'] },
  { x0: 18, x1: 25.5, h: 6.8, c: '#7fd6c2', key: 'mart', zh: '药店', sub: 'yàodiàn · Hiệu thuốc', aw: ['#ffffff', '#2a9d8f'] },
  { x0: 26.5, x1: 33.5, h: 5.4, c: '#ff9fb4', key: 'cafe', zh: '奶茶', sub: 'nǎichá · Trà sữa', aw: ['#ffffff', '#ff6b8f'] },
  { x0: 47, x1: 54, h: 7.2, c: '#ffe08a', key: 'seafood', zh: '饭店', sub: 'fàndiàn · Quán ăn', aw: ['#e8593c', '#ffffff'] },
  { x0: 55, x1: 62.5, h: 6, c: '#b8e0a0', key: 'mart', zh: '超市', sub: 'chāoshì · Siêu thị', aw: ['#ffffff', '#3a86ff'] }
];
function buildShop(g, s) {
  const w = s.x1 - s.x0, cx = (s.x0 + s.x1) / 2, z0 = 1.2, z1 = 7.9, d = z1 - z0, cz = (z0 + z1) / 2;
  g.add(ol(rb(w, s.h, d, s.c, cx, s.h / 2, cz, .25), .08));
  g.add(rb(w + .3, .4, d + .3, '#fffaf0', cx, s.h + .2, cz, .1));
  g.add(rb(w - .8, 2.3, .12, '#3a2c3f', cx, 1.35, z1 + .02, .04));
  g.add(M(rbox(w - 1, 2.1, .08, .03), glassMat, cx, 1.35, z1 + .07));
  const aw = new THREE.Mesh(planeG(w - .4, 1.5), new THREE.MeshToonMaterial({ map: stripeTex(s.aw[0], s.aw[1], Math.round(w)), gradientMap: grad, side: THREE.DoubleSide }));
  aw.position.set(cx, 2.85, z1 + .62); aw.rotation.x = -1.0; g.add(aw);
  const sg = new THREE.Mesh(planeG(w * .8, w * .8 * .31), new THREE.MeshBasicMaterial({ map: signTex(s.zh, s.sub, { bg: '#fffaf0', fg: '#16171B', edge: '#16171B', sub: '#1E5AA8' }) }));
  sg.position.set(cx, 3.95, z1 + .03); g.add(sg);
  const fl = Math.max(1, Math.floor((s.h - 4.4) / 2.2) + 1);
  for (let k = 0; k < fl; k++) { const y = 5.0 + k * 2.2; if (y > s.h - .8) break; const n = Math.max(2, Math.floor(w / 2.4));
    for (let i = 0; i < n; i++) { const x = s.x0 + (i + .5) * w / n; g.add(M(rbox(1.3, 1.2, .1, .04), (i + k) % 3 ? winA : winB, x, y, z1 + .02)); g.add(rb(1.5, .12, .25, '#fffaf0', x, y - .66, z1 + .1, .04)); }
    for (let i = 0; i < 2; i++) g.add(M(rbox(.1, 1.2, 1.4, .04), (i + k) % 2 ? winA : winB, s.x1 + .02, y, z0 + 1.8 + i * 3)); }
  g.add(rb(1.2, .8, 1.0, '#d9dee6', cx - w / 4, s.h + .8, cz - 1, .1));
  tapBox(s.x0, 0, z0, s.x1, s.h, z1 + 1.4, s.key);
}
function buildTower(g) {
  const x0 = 35, x1 = 45.5, h = 21, cx = (x0 + x1) / 2;
  g.add(ol(rb(x1 - x0, h, 6.8, '#e5edf6', cx, h / 2, 4.5, .3), .1));
  for (let k = 0; k < 8; k++) { const y = 3 + k * 2.3; g.add(M(rbox(x1 - x0 - 1, 1.4, .1, .04), k % 3 ? winA : winB, cx, y, 7.95)); g.add(rb(x1 - x0 + .4, .2, .9, '#1f4e8c', cx, y - .85, 8.2, .05)); g.add(M(rbox(.1, 1.4, 5.5, .04), k % 2 ? winA : winB, x1 + .02, y, 4.5)); }
  g.add(rb(x1 - x0 - 3, 1.4, 4, '#cfd8e3', cx, h + .7, 4.5, .2)); g.add(cyl(.08, .08, 3, '#e8593c', cx + 2, h + 2.8, 4.5, 6));
  g.add(M(rbox(x1 - x0 - 1, 2.2, .1, .04), glassMat, cx, 1.3, 7.95));
  tapBox(x0, 0, 1, x1, h, 8.4, 'hotel');
}
const lampSpots = [];
function lampPost(g, x, z, y = 0) {
  g.add(cyl(.09, .12, 4.2, '#2b3a55', x, y + 2.1, z, 8)); g.add(rb(.9, .1, .1, '#2b3a55', x + .35, y + 4.1, z, .03));
  g.add(ol(sph(.22, '#fff6d8', x + .75, y + 3.95, z, 10, { emissive: '#ffe08a', emissiveIntensity: .4 }), .03));
  const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); gl.position.set(x + .75, y + 3.9, z); gl.scale.setScalar(4.2); dyn.add(gl); lampGlows.push(gl);
  lampSpots.push([x + .75, y, z]);
  tapBox(x - .3, y, z - .3, x + 1, y + 4.3, z + .3, 'lamp');
}
/** vũng sáng vàng dưới chân đèn đường (1 lệnh vẽ cho tất cả) */
let poolMesh = null;
function buildLightPools() {
  const n = lampSpots.length, pos = new Float32Array(n * 18), uv = new Float32Array(n * 12), Q = [[-1, -1, 0, 0], [1, -1, 1, 0], [1, 1, 1, 1], [-1, -1, 0, 0], [1, 1, 1, 1], [-1, 1, 0, 1]];
  lampSpots.forEach(([x, y, z], i) => Q.forEach(([a, b, u, v], k) => { pos.set([x + a * 2.6, y + .09, z + b * 2.6], i * 18 + k * 3); uv.set([u, v], i * 12 + k * 2); }));
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); geo.computeBoundingSphere();
  poolMesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: TX.glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, color: '#ffcf7a' }));
  poolMesh.renderOrder = 1; poolMesh.visible = false; dyn.add(poolMesh);
}
function bench(g, x, z) { g.add(rb(2.0, .12, .55, '#c98f5e', x, .55, z, .04)); g.add(rb(2.0, .5, .1, '#c98f5e', x, .85, z - .25, .04)); for (const s of [-.8, .8]) g.add(rb(.12, .5, .5, '#3a2c3f', x + s, .3, z, .03)); }
function busStop(g, x, z) {
  g.add(rb(4.2, .12, 1.6, '#1E5AA8', x, 2.7, z, .05)); for (const s of [-1.9, 1.9]) g.add(cyl(.06, .06, 2.6, '#cfd8e3', x + s, 1.35, z - .6, 6));
  g.add(M(rbox(4.0, 1.9, .06, .02), glassMat, x, 1.5, z - .7)); bench(g, x, z - .3);
  const sg = new THREE.Mesh(planeG(1.6, .6), new THREE.MeshBasicMaterial({ map: signTex('公交站', 'gōngjiāo zhàn · Xe buýt', { w: 256, h: 96, zs: 40, ss: 14 }) })); sg.position.set(x - 1.1, 3.25, z + .2); g.add(sg);
  g.add(cyl(.05, .05, 3.2, '#cfd8e3', x - 1.1, 1.6, z + .25, 6));
  tapBox(x - 2.1, 0, z - .8, x + 2.1, 2.8, z + .8, 'bus');
}
function buildCity(g) {
  SHOPS.forEach(s => buildShop(g, s)); buildTower(g);
  for (const x of [-58, -49, -40, -31, -22, 18, 27, 36, 45, 54]) lampPost(g, x, 11.0);
  for (const x of [-54, -42, -30, -18, -6, 6, 18, 30, 42, 54]) lampPost(g, x, 17.6);
  for (const x of [-48, -24, 0, 36, 58]) bench(g, x, 18.7);
  busStop(g, 26, 10.4);
  // bồn hoa trước khách sạn, cây xanh vỉa hè
  for (const x of [-4, 14, -26, 40]) { g.add(rb(1.6, .5, 1.0, '#c98f5e', x, .3, 9.0, .08)); for (let i = 0; i < 3; i++) g.add(sph(.32, pick(['#ff7fa0', '#FFD91F', '#ff9f7a']), x - .45 + i * .45, .7, 9.0, 8)); }
  for (const x of [-60, -33, 15.5, 31, 50]) tree(g, x, 9.4, 1.1);
}

/* =====================================================================
   THẮNG CẢNH QUANH VỊNH (để cả bản đồ Hành trình cũng là 1 phần của thế giới)
   ===================================================================== */
let cableCabs = [], cableA, cableB, chimneys = [], wheel = null;
function buildLandmarks(g) {
  // cầu Bãi Cháy: dựng trong w-life.js, mặt cầu nằm đúng trên tim đường (xe và người đi qua được sang Hòn Gai)
  // cáp treo từ phố lên đồi
  cableA = new V3(52, 4.5, 2.5); cableB = new V3(34, 20.5, -36);
  g.add(rb(4, 4.6, 3, '#e8593c', 52, 2.3, 2.5, .2)); g.add(rb(4.6, .5, 3.6, '#fffaf0', 52, 4.8, 2.5, .1));
  g.add(rb(4, 3, 3, '#e8593c', 34, 18.6, -36, .2));
  for (const t of [.33, .66]) { const p = cableA.clone().lerp(cableB, t); g.add(rb(.5, p.y + 1, .5, '#cfd8e3', p.x, (p.y + 1) / 2 - .5, p.z, .05)); }
  rod(g, cableA, cableB, .05, '#3a2c3f', 4);
  for (let i = 0; i < 3; i++) { const c = new THREE.Group(); c.add(ol(rb(1.1, .9, .9, i % 2 ? '#FFD91F' : '#e8593c', 0, -.9, 0, .2), .04)); c.add(M(rbox(.95, .4, .92, .05), winA, 0, -.8, 0)); c.add(cyl(.03, .03, .6, INK, 0, -.3, 0, 4)); dyn.add(c); cableCabs.push({ c, t: i / 3 }); }
  tapBox(30, 2, -40, 55, 22, 5, 'cablecar');
  // hòn Gà Chọi (Trống Mái) – 2 khối đá như đôi gà đứng đối nhau
  karst(g, 108, 140, 2.4, 13, 1, .3, .14); karst(g, 112.5, 141, 2.1, 11.5, 2, 2.1, -.17);
  tapBox(104, 0, 136, 116, 14, 145, 'rooster');
  // đàn đảo hình rồng (truyền thuyết Rồng hạ)
  const dragon = [[18, 74, 4.2, 9], [25, 71, 5, 12], [32, 69, 5.4, 14], [39, 68, 5, 12.5], [46, 67, 4.4, 10.5], [53, 66, 3.6, 8], [59, 66, 2.6, 6]];
  dragon.forEach(([x, z, w, h], i) => karst(g, x, z, w, h, i, i * .8));
  g.add(cone(.7, 3, '#8e9b8a', 16.6, 11, 73, 6)); g.add(cone(.7, 3, '#8e9b8a', 18.8, 11, 75, 6));
  tapBox(12, 0, 60, 64, 15, 80, 'island');
  // hang Sửng Sốt trên đảo lớn
  karst(g, 130, 232, 13, 30, 3, .4); karst(g, 140, 225, 8, 18, 0, 1.2);
  const cave = new THREE.Mesh(new THREE.CircleGeometry(4, 18, 0, Math.PI), toon('#2b2233')); cave.position.set(136.5, 7, 240.5); cave.rotation.y = Math.PI / 4; g.add(cave);
  for (let i = 0; i < 8; i++) g.add(rb(3, .4, 1.2, '#f5f0e6', 137 + i * .5, .4 + i * .85, 243.5 - i * .35, .05));
  g.add(rb(8, .6, 5, '#d9cfb8', 141, -.1, 247, .1));
  tapBox(118, 0, 220, 145, 32, 248, 'island');
  // đảo Ti Tốp: bãi cát vầng trăng + chòi ngắm cảnh trên đỉnh
  const tt = M(new THREE.SphereGeometry(12, 16, 9, 0, Math.PI * 2, 0, Math.PI / 2), '#6fb86a', 70, -.6, 200); tt.scale.y = 1.25; g.add(ol(tt, .3));
  const sand = cyl(14, 15, .8, '#f7e0a3', 73, -.5, 204, 24); sand.scale.z = .7; g.add(sand);
  g.add(cyl(1.6, 1.6, .4, '#fffaf0', 70, 14.6, 200, 10)); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; g.add(cyl(.12, .12, 2, '#e8593c', 70 + Math.cos(a) * 1.3, 15.8, 200 + Math.sin(a) * 1.3, 6)); }
  g.add(ol(cone(2.4, 1.6, '#e8343a', 70, 17.6, 200, 6), .1));
  for (let i = 0; i < 10; i++) g.add(rb(2, .3, 1, '#f5f0e6', 76 - i * .5, 1 + i * 1.3, 209 - i * .7, .05));
  tapBox(58, 0, 188, 86, 19, 215, 'beach');
  // làng chài Cửa Vạn: nhà nổi trên bè giữa các đảo
  const vr = rng(5);
  for (let i = 0; i < 12; i++) { const x = 222 + (i % 4) * 7 + vr() * 2, z = 194 + Math.floor(i / 4) * 7 + vr() * 2, c = pick(['#ff9f7a', '#8fd3c7', '#ffd166', '#9fc5ff', '#ffffff', '#ff9fb4']);
    g.add(rb(4, .4, 3.2, '#9b6a43', x, .05, z, .05)); g.add(ol(rb(3, 2, 2.4, c, x, 1.25, z, .12), .05)); g.add(rb(3.4, .3, 2.8, '#1E5AA8', x, 2.4, z, .06)); }
  karst(g, 214, 186, 7, 16, 2); karst(g, 252, 190, 6, 14, 1, 1); karst(g, 248, 222, 8, 18, 3, 2); karst(g, 216, 224, 5, 11, 0, .5);
  tapBox(218, 0, 190, 252, 4, 218, 'junk');
  // Tuần Châu: bến tàu du lịch
  g.add(rb(16, .5, 3, '#d9cfb8', -113, .05, 91, .1)); for (let i = 0; i < 3; i++) g.add(rb(3, .5, 9, '#d9cfb8', -119 + i * 6, .05, 96, .1));
  g.add(ol(rb(10, 4, 8, '#ffffff', -104, 2, 72, .3), .1)); g.add(rb(10.6, .5, 8.6, '#1E5AA8', -104, 4.2, 72, .1));
  { const sg = new THREE.Mesh(planeG(8, 2.4), new THREE.MeshBasicMaterial({ map: signTex('巡州港', 'Xúnzhōu gǎng · Cảng Tuần Châu') })); sg.position.set(-104, 2.6, 76.05); g.add(sg); }
  tapBox(-139, 0, 38, -87, 6, 100, 'cruise');
  // Hòn Gai: phố, chợ, bảo tàng, quảng trường → w-life.js
  // Cẩm Phả: nhà máy, ống khói, bãi than
  for (let i = 0; i < 3; i++) { g.add(ol(rb(24, 7, 12, i % 2 ? '#cfd8e3' : '#b8c4d2', 214 + i * 27, 3.5, 70, .3), .1)); g.add(rb(24.4, 1, 12.4, '#1E5AA8', 214 + i * 27, 7.4, 70, .1)); }
  for (let i = 0; i < 3; i++) { const x = 220 + i * 22; g.add(ol(cyl(1.4, 1.8, 26, '#f1f3f7', x, 13, 52, 12), .1)); for (let k = 0; k < 3; k++) g.add(cyl(1.5 - k * .05, 1.5 - k * .05, 1.6, '#e8343a', x, 8 + k * 7, 52, 12)); chimneys.push(new V3(x, 26.5, 52)); }
  for (let i = 0; i < 4; i++) g.add(ol(cone(7 + i, 6 + i * .6, '#3a3a44', 214 + i * 16, 3, 34, 9), .12));
  { const sg = new THREE.Mesh(planeG(10, 3), new THREE.MeshBasicMaterial({ map: signTex('工厂', 'gōngchǎng · Nhà máy Cẩm Phả') })); sg.position.set(241, 5, 76.1); g.add(sg); }
  tapBox(200, 0, 28, 290, 27, 82, 'factory');
  // sông Bạch Đằng: bãi cọc gỗ dưới lòng sông + đền bên bờ
  const br = rng(3);
  for (let i = 0; i < 46; i++) { const x = -193 + (i % 6) * 3.6 + br() * 1.2, z = -60 + Math.floor(i / 6) * 7 + br() * 2; const s = cyl(.35, .45, 4.5, '#5a3d22', x, .6, z, 6); s.rotation.set((br() - .5) * .5, 0, (br() - .5) * .5); g.add(s); }
  g.add(ol(rb(10, 3.4, 7, '#ffe9b0', -158, 1.7, -36, .2), .08)); { const roof = M(new THREE.ConeGeometry(8, 3, 4), '#b8413a', -158, 4.9, -36); roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, .75); g.add(ol(roof, .08)); }
  g.add(rb(1.4, 4.4, 1, '#cfc6b4', -150, 2.2, -28, .1));
  tapBox(-200, 0, -64, -170, 5, 0, 'river');
  // đảo đá vôi rải khắp vịnh (vẽ hàng loạt cho nhẹ)
  const ir = rng(21), spots = [];
  const avoid = [[40, 68, 30], [110, 140, 16], [130, 232, 26], [70, 200, 22], [235, 205, 26], [-113, 64, 40], [103, 4, 50], [0, 20, 70], [245, 60, 50], [-185, -10, 40]];
  for (let n = 0; spots.length < 90 && n < 1200; n++) {
    const x = -150 + ir() * 470, z = 40 + ir() * 300; if (x - z > 170 || z - x > 230) continue; if (avoid.some(([ax, az, r]) => Math.hypot(x - ax, z - az) < r)) continue;
    if (spots.some(s => Math.hypot(s[0] - x, s[1] - z) < 13)) continue; spots.push([x, z, 3 + ir() * 6, 7 + ir() * 18, ir() * 6.28]);
  }
  for (let k = 0; k < 4; k++) {
    const list = spots.filter((_, i) => i % 4 === k), im = new THREE.InstancedMesh(KARST[k], karstMat, list.length), om = new THREE.InstancedMesh(KARST[k], OUTL, list.length), mm = new THREE.Matrix4(), q = new THREE.Quaternion();
    list.forEach((s, i) => { q.setFromEuler(new THREE.Euler(0, s[4], 0)); mm.compose(new V3(s[0], -.6, s[1]), q, new V3(s[2], s[3] / 2, s[2] * .9)); im.setMatrixAt(i, mm); mm.compose(new V3(s[0], -.6, s[1]), q, new V3(s[2] * 1.045, s[3] / 2 * 1.02, s[2] * .9 * 1.045)); om.setMatrixAt(i, mm); });
    im.castShadow = im.receiveShadow = true; im.userData.key = 'island'; world.add(im, om); taps.push({ obj: im, key: 'island' });
  }
  // vài đảo gần bờ nhìn thấy từ phố
  karst(g, -40, 52, 5, 11, 1, .4); karst(g, -22, 60, 4, 8, 2); karst(g, 70, 48, 4.5, 10, 3, 1); karst(g, 82, 58, 6, 14, 0, 2);
}
/* VÒNG QUAY MẶT TRỜI trên đỉnh đồi Ba Đèo: luôn có, màu đỏ, quay chậm; tối lên đèn.
   Mua 摩天轮 thì có màn trình diễn đèn đổi màu, chạy đuổi quanh vành. */
const WHEEL = { x: 26, z: -48, y: 17.2, H: 24, R: 15, N: 24 };
function buildWheel(g) {
  const { x, z, y, H, R, N } = WHEEL, ry = Math.PI / 4;
  // phần đứng yên (gộp chung khối tĩnh): 4 chân chữ A, giằng ngang, nhà ga
  const base = new THREE.Group(); base.position.set(x, y, z); base.rotation.y = ry; g.add(base);
  for (const s of [-1, 1]) {
    rod(base, new V3(-8, 0, s * 2.6), new V3(0, H, s * .9), .5, '#e8343a', 8); rod(base, new V3(8, 0, s * 2.6), new V3(0, H, s * .9), .5, '#e8343a', 8);
    rod(base, new V3(-4.6, H * .42, s * 1.85), new V3(4.6, H * .42, s * 1.85), .22, '#fffaf0', 6); rod(base, new V3(-2.4, H * .7, s * 1.35), new V3(2.4, H * .7, s * 1.35), .18, '#fffaf0', 6);
  }
  base.add(ol(rb(11, 2.8, 5, '#fffaf0', 0, 1.4, 5.2, .3), .06)); base.add(rb(11.6, .45, 5.6, '#e8343a', 0, 3.0, 5.2, .1));
  base.add(M(rbox(9, 1.6, .08, .03), glassMat, 0, 1.3, 7.72));
  { const sg = new THREE.Mesh(planeG(6.4, 2), new THREE.MeshBasicMaterial({ map: signTex('摩天轮', 'mótiānlún · Vòng quay Mặt Trời', { bg: '#e8343a', fg: '#FFD91F', edge: '#FFD91F' }) })); sg.position.set(0, 4.4, 7.6); base.add(sg); base.add(rb(6.8, 2.3, .2, '#e8343a', 0, 4.4, 7.45, .06)); }
  base.add(rb(16, .5, 9, '#e8e2d2', 0, -.1, 2.5, .1));
  tapBox(x - 13, y - 1, z - 13, x + 13, y + H + R + 1, z + 13, 'wheel');
  // phần quay
  const gr = new THREE.Group(); gr.position.set(x, y, z); gr.rotation.y = ry; dyn.add(gr);
  const rot = new THREE.Group(); rot.position.y = H; gr.add(rot);
  const ringMat = new THREE.MeshToonMaterial({ color: '#e8343a', gradientMap: grad, emissive: '#ff3030', emissiveIntensity: 0 });
  const spokeMat = new THREE.MeshToonMaterial({ color: '#fffaf0', gradientMap: grad, emissive: '#ffd0d0', emissiveIntensity: 0 });
  const tmp = new THREE.Group();
  for (const zz of [-.8, .8]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(R, .34, 6, 64), ringMat); ring.position.z = zz; tmp.add(ring); const inner = new THREE.Mesh(new THREE.TorusGeometry(R * .42, .2, 5, 36), ringMat); inner.position.z = zz; tmp.add(inner); }
  for (let i = 0; i < N; i++) { const a = i / N * 6.283, c = Math.cos(a), sn = Math.sin(a);
    for (const zz of [-.8, .8]) { const sp = rod(tmp, new V3(c * 1.2, sn * 1.2, zz * .6), new V3(c * R, sn * R, zz), .07, '#fffaf0', 4); sp.material = spokeMat; }
    const br = rod(tmp, new V3(c * R, sn * R, -.8), new V3(c * R, sn * R, .8), .1, '#e8343a', 4); br.material = ringMat; }
  { const hub = cyl(1.5, 1.5, 2.4, '#fffaf0', 0, 0, 0, 16); hub.rotation.x = Math.PI / 2; tmp.add(hub); const cap = cyl(.9, .9, 2.6, '#FFD91F', 0, 0, 0, 12); cap.rotation.x = Math.PI / 2; tmp.add(cap); }
  bake(tmp, rot, { cast: false });
  // cabin: vẽ hàng loạt (InstancedMesh), luôn giữ thẳng đứng
  const cabGeo = rbox(1.5, 1.4, 1.5, .35, 2), roofGeo = coneG(1.0, .55, 8), winGeo = rbox(1.56, .5, 1.56, .12, 1);
  const cabMat = new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: grad }), winMat = new THREE.MeshToonMaterial({ color: '#bfe6ff', gradientMap: grad, emissive: '#ffe2a0', emissiveIntensity: 0 });
  const cabs = new THREE.InstancedMesh(cabGeo, cabMat, N), roofs = new THREE.InstancedMesh(roofGeo, toon('#e8343a'), N), wins = new THREE.InstancedMesh(winGeo, winMat, N), outl = new THREE.InstancedMesh(cabGeo, OUTL, N);
  const COL = ['#FFD91F', '#fffaf0', '#7fd6c2', '#fffaf0', '#ff9fb4', '#fffaf0', '#8fb8ff', '#fffaf0'];
  for (let i = 0; i < N; i++) cabs.setColorAt(i, new THREE.Color(COL[i % COL.length]));
  [cabs, roofs, wins, outl].forEach(m => { m.frustumCulled = false; m.castShadow = false; gr.add(m); });
  // bóng đèn quanh vành: 1 đám điểm sáng (1 lệnh vẽ)
  const NB = 72, bp = new Float32Array(NB * 3), bc = new Float32Array(NB * 3);
  for (let i = 0; i < NB; i++) { const a = i / NB * 6.283; bp.set([Math.cos(a) * (R + .45), Math.sin(a) * (R + .45), i % 2 ? .85 : -.85], i * 3); }
  const bgeo = new THREE.BufferGeometry(); bgeo.setAttribute('position', new THREE.BufferAttribute(bp, 3)); bgeo.setAttribute('color', new THREE.BufferAttribute(bc, 3));
  const bulbs = new THREE.Points(bgeo, new THREE.PointsMaterial({ map: TX.glow, size: 10, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true, opacity: 0 }));
  bulbs.frustumCulled = false; rot.add(bulbs);
  wheel = { gr, rot, cabs, roofs, wins, outl, ringMat, spokeMat, winMat, bulbs, bc, show: false, m: new THREE.Matrix4(), q: new THREE.Quaternion(), v: new V3(), one: new V3(1, 1, 1) };
  wheelPose(0);
}
function wheelPose(dt) {
  const w = wheel; if (!w) return;
  w.rot.rotation.z += dt * .045;
  const a0 = w.rot.rotation.z, { H, R, N } = WHEEL;
  for (let i = 0; i < N; i++) { const a = a0 + i / N * 6.283, x = Math.cos(a) * R, y = H + Math.sin(a) * R - 1.25, sw = Math.sin(T * .8 + i) * .04;
    w.q.setFromAxisAngle(new V3(0, 0, 1), sw);
    w.m.compose(w.v.set(x, y, 0), w.q, w.one); w.cabs.setMatrixAt(i, w.m); w.outl.setMatrixAt(i, w.m.clone().scale(new V3(1.06, 1.06, 1.06)));
    w.m.compose(w.v.set(x, y + .95, 0), w.q, w.one); w.roofs.setMatrixAt(i, w.m);
    w.m.compose(w.v.set(x, y + .12, 0), w.q, w.one); w.wins.setMatrixAt(i, w.m); }
  w.cabs.instanceMatrix.needsUpdate = w.roofs.instanceMatrix.needsUpdate = w.wins.instanceMatrix.needsUpdate = w.outl.instanceMatrix.needsUpdate = true;
}
function wheelLights(lit) {
  const w = wheel; if (!w) return;
  w.ringMat.emissiveIntensity = lit * (w.show ? .75 : .55); w.spokeMat.emissiveIntensity = lit * .35; w.winMat.emissiveIntensity = lit * .8;
  w.bulbs.visible = lit > .02; w.bulbs.material.opacity = lit;
  if (!w.bulbs.visible) return;
  const ppu = (wrap.clientHeight || 640) / Math.max(1, cam.top - cam.bottom); w.bulbs.material.size = clamp(1.6 * ppu, 3, 40);
  const n = w.bc.length / 3, c = tmpC;
  for (let i = 0; i < n; i++) {
    if (w.show) { const k = .5 + .5 * Math.sin(T * 5 - i * .55); c.setHSL(((T * .06) + i / n) % 1, .9, .45 + .25 * k); w.bc[i * 3] = c.r * (.4 + .6 * k); w.bc[i * 3 + 1] = c.g * (.4 + .6 * k); w.bc[i * 3 + 2] = c.b * (.4 + .6 * k); }
    else { const k = .8 + .2 * Math.sin(T * 2 + i); w.bc[i * 3] = 1 * k; w.bc[i * 3 + 1] = .55 * k; w.bc[i * 3 + 2] = .35 * k; }
  }
  w.bulbs.geometry.attributes.color.needsUpdate = true;
  if (w.show) w.ringMat.emissive.setHSL((T * .05) % 1, .85, .5); else w.ringMat.emissive.set('#ff3030');
}

/* =====================================================================
   KHÁCH SẠN – vỏ ngoài (mờ dần khi zoom vào) dựng lại theo sao, số tầng, đồ đã mua
   ===================================================================== */
const TIER = [
  { fac: '#ffe9a6', trim: '#5b8fd6', top: '#cfd8e3' },
  { fac: '#ffe27a', trim: '#2c5aa0', top: '#c9d3de' },
  { fac: '#ffdc5c', trim: '#1f4e8c', top: '#bfcad8' },
  { fac: '#ffd84a', trim: '#16365f', top: '#16365f' },
  { fac: '#fff0a6', trim: '#1f4e8c', top: '#1f4e8c' }
];
const extras = {};
function buildHotel(st) {
  if (hotel) { world.remove(hotel); shellMats.forEach(m => { if (m.map && m.map.userData.own) m.map.dispose(); m.dispose(); }); }
  nightMatsShell.length = 0; shellMatsExtra.length = 0;
  shellBegin(); const oldSeg = setSeg(1);
  const tier = TIER[clamp(st.star, 1, 5) - 1], s = st.star, F = clamp(st.floors | 0, 1, 5), open = st.open !== false;
  const tmp = new THREE.Group(), live = new THREE.Group();
  hotel = new THREE.Group(); hotel.name = 'hotel'; shellGlows = []; roomWins = {}; doorPanels = []; beams = []; blinkGlow = null;
  const glowAt = (p, x, y, z, sc, col) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, color: col || 0xffffff })); sp.position.set(x, y, z); sp.scale.setScalar(sc); p.add(sp); shellGlows.push(sp); return sp; };
  // bệ + tầng trệt (sảnh) với vách kính lớn nhìn ra phố
  tmp.add(rb(11.4, .35, 9.4, '#d9cfb8', 5, -.1, 4, .08));
  for (const [x, z] of [[-.35, 8.35], [10.35, 8.35], [10.35, -.35], [-.35, -.35]]) tmp.add(ol(rb(.6, LOBBY_H, .6, tier.trim, x, LOBBY_H / 2, z, .08), .04));
  tmp.add(rb(10.6, .5, .3, tier.trim, 5, .25, 8.25, .05)); tmp.add(rb(.3, .5, 8.6, tier.trim, 10.25, .25, 4, .05));
  const lobbyGlass = ownToon('#cfe9f7', { emissive: '#ffd890', emissiveIntensity: 0 }); nightMatsShell.push([lobbyGlass, open ? .8 : .05]);
  tmp.add(M(rbox(8.1, 2.6, .1, .02), lobbyGlass, 4.2, 1.8, 8.3)); tmp.add(M(rbox(.1, 2.6, 7.6, .02), lobbyGlass, 10.3, 1.8, 4));
  for (let i = 0; i <= 5; i++) tmp.add(rb(.12, 2.7, .16, '#fffaf0', .2 + i * 1.6, 1.8, 8.34, .03));
  for (let i = 0; i <= 4; i++) tmp.add(rb(.16, 2.7, .12, '#fffaf0', 10.34, 1.8, .2 + i * 1.9, .03));
  tmp.add(rb(10.6, LOBBY_H - 3.1, .3, tier.fac, 5, (3.1 + LOBBY_H) / 2, 8.25, .05)); tmp.add(rb(.3, LOBBY_H - 3.1, 8.6, tier.fac, 10.25, (3.1 + LOBBY_H) / 2, 4, .05));
  tmp.add(rb(.4, 3.1, .3, tier.fac, 8.42, 1.55, 8.25, .04));
  // cửa kính trượt
  for (const sx of [-1, 1]) { const d = new THREE.Group(); d.position.set(DOOR_X + sx * .4, 0, 8.3); d.add(M(rbox(.78, 2.9, .08, .02), lobbyGlass, 0, 1.5, 0)); d.add(rb(.82, .1, .12, '#d4a72c', 0, 2.96, 0, .02)); d.add(rb(.06, 2.9, .12, '#d4a72c', -sx * .38, 1.5, 0, .02)); d.userData.x0 = d.position.x; d.userData.sx = sx; live.add(d); doorPanels.push(d); }
  const nameT = signTex('阿宝酒店', 'Ā Bǎo Jiǔdiàn · Khách sạn Vịnh', { w: 512, h: 150, bg: tier.trim, ss: 24 });
  { const nm = new THREE.MeshToonMaterial({ map: nameT, gradientMap: grad, transparent: true, emissive: '#ffffff', emissiveMap: nameT, emissiveIntensity: 0 }); if (s >= 3) nightMatsShell.push([nm, .55]);
    put(tmp, new THREE.Mesh(planeG(4.2, 1.23), nm)).position.set(4.4, 3.45, 8.42); }
  shellMatsExtra.push(tmp.children[tmp.children.length - 1].material);
  // mái hiên trước cửa: vải sọc (1–2★) · mái kính viền vàng (3★+)
  if (s === 3) { tmp.add(M(rbox(3.2, .12, 2.2, .04), ownToon('#e9f6ff', { opacity: .85 }), DOOR_X, 3.25, 9.3)); tmp.add(rb(3.3, .16, .14, '#d4a72c', DOOR_X, 3.3, 10.4, .03)); for (const sx of [-1.5, 1.5]) tmp.add(cyl(.07, .07, 3.25, '#d4a72c', DOOR_X + sx, 1.62, 10.3, 8)); }
  else if (s < 3) { const aw = new THREE.Mesh(planeG(3.0, 1.7), new THREE.MeshToonMaterial({ map: stripeTex('#ffffff', tier.trim, 8), gradientMap: grad, side: THREE.DoubleSide, transparent: true })); aw.position.set(DOOR_X, 3.05, 9.05); aw.rotation.x = -1.0; tmp.add(aw); shellMatsExtra.push(aw.material); }
  if (!open) { // nhà nghỉ đang đóng cửa (chưa xong chặng 1)
    for (const r of [.5, -.5]) { const p = rb(1.9, .22, .1, '#b0814f', DOOR_X, 1.6, 8.5, .03); p.rotation.z = r; tmp.add(p); }
    const cl = new THREE.Mesh(planeG(1.9, .6), new THREE.MeshBasicMaterial({ map: signTex('暂停营业', 'zàntíng yíngyè · Tạm đóng cửa', { w: 384, h: 120, bg: '#fffaf0', fg: '#b8413a', edge: '#b8413a', sub: '#3a2c3f', zs: 46, ss: 17 }), transparent: true }));
    cl.position.set(DOOR_X, 2.35, 8.56); tmp.add(cl); shellMatsExtra.push(cl.material);
  }
  // các tầng phòng
  for (let k = 1; k <= F; k++) {
    const y0 = LOBBY_H + (k - 1) * FLOOR_H;
    tmp.add(rb(11.0, .3, 9.0, tier.trim, 5, y0 + .15, 4, .06));
    tmp.add(rb(10.6, FLOOR_H - .3, .3, tier.fac, 5, y0 + .3 + (FLOOR_H - .3) / 2, 8.25, .04));
    tmp.add(rb(.3, FLOOR_H - .3, 8.6, tier.fac, 10.25, y0 + .3 + (FLOOR_H - .3) / 2, 4, .04));
    for (let j = 0; j < 3; j++) {
      const x = 1.75 + j * 3.25, y = y0 + 1.65, idx = k * 3 + j;
      const wm = ownToon('#bfe6ff', { emissive: '#ffcf6a', emissiveIntensity: 0 }); roomWins[idx] = wm;
      tmp.add(M(rbox(2.1, 1.55, .08, .02), wm, x, y, 8.43)); tmp.add(rb(2.4, .14, .2, '#fffaf0', x, y + .85, 8.45, .03)); tmp.add(rb(2.4, .16, .3, '#fffaf0', x, y - .85, 8.48, .03)); tmp.add(rb(.1, 1.6, .14, '#fffaf0', x, y, 8.47, .02));
      if (s >= 2) { tmp.add(rb(2.6, .14, .8, '#fffaf0', x, y0 + .45, 8.8, .04)); if (s >= 3) tmp.add(M(rbox(2.6, .6, .06, .02), ownToon('#d7f0ff', { opacity: .7 }), x, y0 + .82, 9.18)); else for (let b = 0; b < 6; b++) tmp.add(rb(.05, .6, .05, '#fffaf0', x - 1.2 + b * .48, y0 + .82, 9.16, .01)); tmp.add(rb(2.6, .07, .08, s >= 4 ? '#d4a72c' : '#fffaf0', x, y0 + 1.13, 9.18, .02)); }
      if (s >= 3) { tmp.add(rb(1.8, .3, .35, '#c98f5e', x, y - 1.05, 8.68, .05)); for (let f = 0; f < 4; f++) tmp.add(sph(.15, ['#ff7fa0', '#FFD91F', '#ffffff', '#ff9f7a'][f], x - .6 + f * .4, y - .82, 8.7, 6)); }
      const plaque = (st.own.gym && k === 1 && j === 0) ? ['健身房', 'jiànshēnfáng · Phòng gym'] : (st.own.meeting && k === 2 && j === 2) ? ['会议室', 'huìyìshì · Phòng họp'] : null;
      if (plaque) { const pl = new THREE.Mesh(planeG(1.8, .52), new THREE.MeshToonMaterial({ map: signTex(plaque[0], plaque[1], { w: 320, h: 92, zs: 36, ss: 14 }), gradientMap: grad, transparent: true })); pl.position.set(x, y + 1.15, 8.5); tmp.add(pl); shellMatsExtra.push(pl.material); }
    }
    if (s >= 5) { tmp.add(M(rbox(.08, FLOOR_H - .75, 7.6, .02), lobbyGlass, 10.43, y0 + 1.68, 4)); for (let i = 0; i < 5; i++) tmp.add(rb(.12, FLOOR_H - .7, .1, '#d4a72c', 10.46, y0 + 1.68, .3 + i * 1.85, .02)); }
    else for (const zz of [2.2, 5.8]) { tmp.add(M(rbox(.08, 1.3, 1.6, .02), lobbyGlass, 10.42, y0 + 1.65, zz)); tmp.add(rb(.2, .14, 1.9, '#fffaf0', 10.46, y0 + .9, zz, .03)); }
    if (s <= 2) for (const x of [3.37, 6.62]) { tmp.add(rb(.78, .5, .36, '#f4f4f0', x, y0 + .66, 8.62, .06)); const fan = cyl(.17, .17, .05, '#9aa3ab', x - .12, y0 + .66, 8.81, 10); fan.rotation.x = Math.PI / 2; tmp.add(fan); }
    if (st.own.lights) for (let i = 0; i < 12; i++) { const b = sph(.07, ['#ff7fa0', '#FFD91F', '#7fd6c2', '#8fb8ff'][i % 4], .2 + i * .9, y0 + .1, 8.55, 6, { emissive: ['#ff7fa0', '#FFD91F', '#7fd6c2', '#8fb8ff'][i % 4], emissiveIntensity: .8 }); tmp.add(b); }
  }
  // mái
  const yr = LOBBY_H + F * FLOOR_H; liftTop = yr;
  tmp.add(rb(11.2, .4, 9.2, tier.top, 5, yr + .2, 4, .08));
  tmp.add(rb(10.8, .6, .25, tier.fac, 5, yr + .7, 8.3, .05)); tmp.add(rb(.25, .6, 8.8, tier.fac, 10.3, yr + .7, 4, .05)); tmp.add(rb(10.8, .6, .25, tier.fac, 5, yr + .7, -.3, .05)); tmp.add(rb(.25, .6, 8.8, tier.fac, -.3, yr + .7, 4, .05));
  if (s >= 4) { tmp.add(rb(11.0, .16, .4, '#d4a72c', 5, yr + 1.05, 8.32, .04)); tmp.add(rb(.4, .16, 9.0, '#d4a72c', 10.32, yr + 1.05, 4, .04)); for (let k = 1; k <= F; k++) tmp.add(rb(11.1, .08, .1, '#d4a72c', 5, LOBBY_H + (k - 1) * FLOOR_H + .32, 8.45, .02)); }
  if (!st.own.pool && s <= 2) { tmp.add(ol(cyl(.9, .9, 1.6, '#e8eef5', 2, yr + 1.2, 2, 12), .04)); tmp.add(rb(1.4, .8, 1, '#d9dee6', 4.5, yr + .8, 1.6, .1)); }
  if (st.own.pool) { tmp.add(rb(5.6, .5, 4, '#e8eef5', 6.6, yr + .6, 5.4, .1)); tmp.add(M(rbox(5.0, .1, 3.4, .04), ownToon('#4fc3f7', { emissive: '#2a9fd0', emissiveIntensity: .25 }), 6.6, yr + .86, 5.4));
    for (let i = 0; i < 2; i++) { tmp.add(rb(.6, .15, 1.6, '#ffffff', 2.6 + i * .9, yr + .55, 6.6, .05)); } tmp.add(cyl(.05, .05, 2, '#ffffff', 2.4, yr + 1.4, 4.6, 6)); tmp.add(ol(cone(1.1, .5, '#ff7fa0', 2.4, yr + 2.4, 4.6, 8), .04)); }
  if (st.own.garden) { for (let i = 0; i < 4; i++) { tmp.add(rb(1.3, .5, 1.3, '#c98f5e', 1.2 + (i % 2) * 1.7, yr + .65, 1.2 + Math.floor(i / 2) * 1.7, .08)); tree(tmp, 1.2 + (i % 2) * 1.7, 1.2 + Math.floor(i / 2) * 1.7, .7, yr + .9); }
    for (let i = 0; i < 8; i++) tmp.add(sph(.07, '#fff3a6', .4 + i * .5, yr + 1.6 + Math.sin(i) * .12, 3.9, 6, { emissive: '#fff3a6', emissiveIntensity: .9 })); }
  if (st.own.sign) { tmp.add(rb(.18, 2.3, .18, '#3a2c3f', 2.2, yr + 1.6, 7.4, .03)); tmp.add(rb(.18, 2.3, .18, '#3a2c3f', 7.8, yr + 1.6, 7.4, .03));
    const nt = signTex('阿宝酒店' + ' ★'.repeat(Math.min(5, s)).replace(/ /g, ''), 'Ā BǍO HOTEL · Vịnh Hạ Long', { w: 640, h: 170, bg: '#16171B', fg: '#FFD91F', edge: '#FFD91F', zs: 70 });
    const nm = ownToon('#ffffff', { map: nt, emissive: '#ffffff', emissiveMap: nt, emissiveIntensity: .15 }); nightMatsShell.push([nm, 1.1]);
    tmp.add(M(rbox(6.4, 1.7, .14, .05), nm, 5, yr + 2.4, 7.45)); glowAt(live, 5, yr + 2.4, 8.4, 9, '#ffd27a'); }
  if (s >= 4) for (const x of [.6, 9.4]) { tmp.add(cyl(.05, .05, 3.2, '#fffaf0', x, yr + 2.2, 7.9, 6)); const f = rb(1.2, .7, .04, x < 5 ? '#FFD91F' : '#1E5AA8', x + .62, yr + 3.4, 7.9, .02); tmp.add(f); }
  if (s >= 5) { const cx = 7.7, cz = 1.9; tmp.add(ol(cyl(1.25, 1.55, 2.2, '#d4a72c', cx, yr + 1.5, cz, 10, { emissive: '#8a6a10', emissiveIntensity: .2 }), .05)); tmp.add(ol(sph(1.05, '#f2c94c', cx, yr + 3.25, cz, 14, { emissive: '#8a6a10', emissiveIntensity: .3 }), .05));
    const bt = new THREE.Mesh(planeG(1.25, 1.25), new THREE.MeshBasicMaterial({ map: canvasTex(128, 128, c => { c.fillStyle = '#8a5a00'; c.font = 'bold 96px ' + ZH; c.textAlign = 'center'; c.fillText('宝', 64, 98); }), transparent: true })); bt.position.set(cx + .74, yr + 3.3, cz + .74); bt.rotation.y = Math.PI / 4; tmp.add(bt); shellMatsExtra.push(bt.material);
    tmp.add(cone(.16, 2.4, '#d4a72c', cx, yr + 5.4, cz, 8)); tmp.add(sph(.15, '#ff3b3b', cx, yr + 6.65, cz, 8, { emissive: '#ff3b3b', emissiveIntensity: .6 }));
    blinkGlow = glowAt(live, cx, yr + 6.65, cz, 2.2, '#ff5050');
    glowAt(live, cx, yr + 3.3, cz, 7, '#ffe08a'); }
  if (st.own.lights) for (let i = 0; i < 14; i++) tmp.add(sph(.09, ['#ff7fa0', '#FFD91F', '#7fd6c2', '#8fb8ff'][i % 4], .1 + i * .77, yr + 1.05, 8.45, 6, { emissive: ['#ff7fa0', '#FFD91F', '#7fd6c2', '#8fb8ff'][i % 4], emissiveIntensity: .9 }));
  if (st.own.lantern) for (const sx of [-1.7, 1.7]) { tmp.add(cyl(.02, .02, .5, INK, DOOR_X + sx, 3.0, 9.4, 4)); const l = ol(sph(.32, '#e8343a', DOOR_X + sx, 2.55, 9.4, 12, { emissive: '#e8343a', emissiveIntensity: .3 }), .04); l.scale.y = .85; tmp.add(l); glowAt(live, DOOR_X + sx, 2.55, 9.6, 2.4, '#ff8a6a'); }
  if (s >= 4) for (const x of [.6, 3.6, 6.6, 10.6]) glowAt(live, x, .6, 8.9, 3.2, '#fff1c0');
  if (s >= 5) { const cp = rb(1.4, .04, 2.8, '#d62839', DOOR_X, .1, 10.0, .01); tmp.add(cp); tmp.add(rb(.08, .05, 2.8, '#FFD91F', DOOR_X - .66, .11, 10.0, .01)); tmp.add(rb(.08, .05, 2.8, '#FFD91F', DOOR_X + .66, .11, 10.0, .01)); }
  // ===== v8 · mặt tiền đủ 5 hạng sao =====
  if (s === 1) { // nhà nghỉ: dây phơi đồ trên mái
    for (const x of [.9, 4.6]) tmp.add(cyl(.04, .04, 1.5, '#9aa3ab', x, yr + 1.15, 6.9, 5));
    tmp.add(rb(3.7, .03, .03, '#ffffff', 2.75, yr + 1.85, 6.9, .01));
    [['#ff9fb4', 1.5], ['#7fd6c2', 2.4], ['#FFD91F', 3.3], ['#9fc5ff', 4.0]].forEach(([c, x]) => tmp.add(rb(.55, .7, .04, c, x, yr + 1.5, 6.9, .02)));
  }
  if (s <= 3) for (const sx of [-1.4, 1.4]) { tmp.add(ol(cyl(.28, .22, .45, '#c98f5e', DOOR_X + sx, .28, 8.85, 10), .03)); tmp.add(sph(.4, '#5fb36a', DOOR_X + sx, .82, 8.85, 9)); if (s >= 2) tmp.add(sph(.12, '#ff7fa0', DOOR_X + sx + .15, 1.05, 9.1, 6)); }
  if (s >= 3) { // phào trụ trắng giữa các ô cửa, bậc thềm đá
    for (const x of [.15, 3.38, 6.62, 9.85]) tmp.add(rb(.22, yr - LOBBY_H, .16, s >= 4 ? '#fffaf0' : '#fff8e6', x, (LOBBY_H + yr) / 2, 8.47, .03));
    tmp.add(rb(2.8, .1, .55, '#e8e2d2', DOOR_X, .1, 8.68, .03)); tmp.add(rb(2.4, .1, .3, '#f2ede2', DOOR_X, .2, 8.52, .03));
  }
  if (s >= 4) { // sảnh đón có mái lớn, cột vàng, đôi sư tử đá 石狮
    const roofC = s >= 5 ? '#16365f' : tier.trim;
    tmp.add(ol(rb(4.9, .34, 3.0, roofC, DOOR_X, 3.45, 9.8, .08), .04)); tmp.add(rb(5.0, .16, .1, '#d4a72c', DOOR_X, 3.36, 11.32, .02)); for (const sx of [-1, 1]) tmp.add(rb(.1, .16, 3.0, '#d4a72c', DOOR_X + sx * 2.48, 3.36, 9.8, .02));
    for (const sx of [-2.2, 2.2]) tmp.add(ol(cyl(.13, .15, 3.3, '#d4a72c', DOOR_X + sx, 1.65, 11.0, 10), .03));
    const pm = ownToon('#fff6d8', { emissive: '#ffe2a0', emissiveIntensity: 0 }); nightMatsShell.push([pm, .9]); tmp.add(M(rbox(4.2, .05, 2.3, .02), pm, DOOR_X, 3.26, 9.8)); glowAt(live, DOOR_X, 2.9, 10.2, 5, '#fff1c0');
    const lc = s >= 5 ? '#e2b53e' : '#d9d2c3', lo = s >= 5 ? { emissive: '#8a6a10', emissiveIntensity: .25 } : {};
    for (const sx of [-1, 1]) { const x = DOOR_X + sx * 1.22, z = 8.78;
      tmp.add(rb(.72, .34, .72, '#cfc6b4', x, .23, z, .05)); tmp.add(ol(sph(.3, lc, x, .66, z - .04, 10, lo), .03)); tmp.add(ol(sph(.33, lc, x, 1.0, z + .02, 10, lo), .03)); tmp.add(sph(.24, lc, x, 1.02, z + .2, 10, lo));
      tmp.add(sph(.05, INK, x - .09, 1.08, z + .42, 6)); tmp.add(sph(.05, INK, x + .09, 1.08, z + .42, 6)); tmp.add(sph(.11, '#d4a72c', x - sx * .14, .48, z + .3, 8)); }
  }
  if (s >= 5) { // viền đèn LED vàng, biển dọc 阿宝, đèn rọi trời
    const led = ownToon('#ffe7a0', { emissive: '#ffcf4a', emissiveIntensity: .1 }); led.userData.e0 = .1; nightMatsShell.push([led, 1.2]);
    for (const x of [-.53, 10.53]) tmp.add(M(rbox(.1, yr + 1, .1, .03), led, x, (yr + 1) / 2, 8.53));
    tmp.add(M(rbox(11.2, .1, .1, .03), led, 5, yr + 1.04, 8.53)); tmp.add(M(rbox(.1, .1, 9.2, .03), led, 10.53, yr + 1.04, 4));
    const vt = canvasTex(128, 512, c => { c.fillStyle = '#16365f'; c.beginPath(); c.roundRect(4, 4, 120, 504, 22); c.fill(); c.strokeStyle = '#FFD91F'; c.lineWidth = 8; c.stroke(); c.fillStyle = '#FFD91F'; c.font = `900 92px ${ZH}`; c.textAlign = 'center'; ['阿', '宝', '酒', '店'].forEach((ch, i) => c.fillText(ch, 64, 104 + i * 112)); });
    const vm = ownToon('#ffffff', { map: vt, emissive: '#ffffff', emissiveMap: vt, emissiveIntensity: .1 }); vm.userData.e0 = .1; nightMatsShell.push([vm, 1.0]);
    const blade = M(new THREE.BoxGeometry(.14, 4.6, 1.2), vm, 10.7, LOBBY_H + F * FLOOR_H * .5 + .4, 7.6); tmp.add(blade);
    const beamTex = canvasTex(8, 128, c => { const gr = c.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgba(255,240,200,0)'); gr.addColorStop(1, 'rgba(255,240,200,.9)'); c.fillStyle = gr; c.fillRect(0, 0, 8, 128); });
    beams = [];
    for (const [x, ph] of [[1.4, 0], [8.8, 2.1]]) { const piv = new THREE.Group(); piv.position.set(x, yr + .9, 7.2); live.add(piv);
      const bm = new THREE.Mesh(new THREE.CylinderGeometry(2.6, .25, 30, 14, 1, true), new THREE.MeshBasicMaterial({ map: beamTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, opacity: .3 }));
      bm.position.y = 15; piv.add(bm); piv.userData.ph = ph; piv.visible = false; beams.push(piv); }
  }
  // thang máy kính bên hông (mua 电梯)
  liftCab = null;
  if (st.own.lift) { tmp.add(rb(1.4, yr + 1, .12, tier.trim, 11.1, (yr + 1) / 2, .3, .03)); tmp.add(rb(1.4, yr + 1, .12, tier.trim, 11.1, (yr + 1) / 2, 1.9, .03)); tmp.add(M(rbox(.08, yr + 1, 1.5, .02), ownToon('#d7f0ff', { opacity: .55 }), 11.78, (yr + 1) / 2, 1.1));
    liftCab = new THREE.Group(); liftCab.add(ol(rb(1.2, 1.8, 1.4, '#FFD91F', 0, .9, 0, .1), .03)); liftCab.position.set(11.1, 0, 1.1); live.add(liftCab); }
  const shellVC = new THREE.MeshToonMaterial({ color: '#ffffff', vertexColors: true, gradientMap: grad, transparent: true });
  bake(tmp, hotel, { vc: true, vcMat: shellVC }); hotel.add(live);
  shellMats = shellEnd().list.concat(shellMatsExtra.splice(0), [shellVC]);
  live.traverse(m => { if (m.isMesh && shellMats.indexOf(m.material) < 0) shellMats.push(m.material); });
  shellMats.forEach(m => { m.transparent = true; m.userData.op0 = m.opacity != null ? m.opacity : 1; });
  world.add(hotel); setSeg(oldSeg);
  hotelBox.set(new V3(-.6, 0, -.6), new V3(10.6, yr + 2.5, 8.8));
  // khu vực ngoài toà nhà
  extras.palms.visible = !!st.own.palm; extras.umb.visible = !!st.own.umbrella; extras.rest.visible = !!st.own.restaurant; extras.boat.visible = !!st.own.boat; if (wheel) wheel.show = !!st.own.wheel;
  shellOpacity(-1);
}
const nightMatsShell = [], shellMatsExtra = [];
let beams = [], blinkGlow = null;
function buildExtras() {
  const pg = new THREE.Group(); for (const x of [-48, -36, -12, 2, 16, 30, 46, 60]) palm(pg, x, 18.3, 1.1); extras.palms = pg;
  const ug = new THREE.Group(); for (let i = 0; i < 6; i++) { const x = -20 + i * 7, z = 23.5 + (i % 2) * 1.6; ug.add(cyl(.05, .05, 2.4, '#ffffff', x, 1.1, z, 6)); ug.add(ol(cone(1.4, .6, i % 2 ? '#ff7fa0' : '#FFD91F', x, 2.5, z, 10), .04)); ug.add(rb(.6, .12, 1.7, '#ffffff', x + 1, .2, z + .3, .04)); } extras.umb = ug;
  const rg = new THREE.Group(); rg.add(ol(rb(7.6, 4.2, 6.6, '#ff9f7a', -5.6, 2.1, 4.9, .2), .06)); rg.add(M(rbox(6.6, 2.4, .1, .03), glassMat, -5.6, 1.6, 8.25)); rg.add(rb(8, .3, 7, '#fffaf0', -5.6, 4.35, 4.9, .06));
  { const sg = new THREE.Mesh(planeG(4, 1.25), new THREE.MeshBasicMaterial({ map: signTex('餐厅', 'cāntīng · Nhà hàng') })); sg.position.set(-5.6, 3.4, 8.27); rg.add(sg); }
  for (let i = 0; i < 3; i++) { const x = -8.6 + i * 2.6; rg.add(cyl(.5, .5, .08, '#ffffff', x, .8, 9.9, 12)); rg.add(cyl(.05, .05, .8, '#3a2c3f', x, .4, 9.9, 6)); rg.add(cyl(.04, .04, 2.2, '#ffffff', x, 1.3, 9.9, 6)); rg.add(ol(cone(1.0, .45, '#1E5AA8', x, 2.35, 9.9, 8), .03)); }
  extras.rest = rg; tapBox(-9.5, 0, 1.5, -1.6, 4.5, 10.5, 'eat');
  const bk = g => { const o = new THREE.Group(); bake(g, o, { vc: true }); return o; };   // gộp khối: dừa, ô, nhà hàng = vài lệnh vẽ
  extras.palms = bk(extras.palms); extras.umb = bk(extras.umb); extras.rest = bk(extras.rest);
  const bg = new THREE.Group(); bg.add(rb(2.4, .3, 14, '#c98f5e', 14, .05, 27, .05)); for (let i = 0; i < 6; i++) bg.add(cyl(.12, .12, 2, '#9b6a43', 13 + (i % 2) * 2, -.5, 21 + Math.floor(i / 2) * 5, 6));
  const yacht = new THREE.Group(); yacht.position.set(17.6, 0, 31); yacht.add(ol(rb(2.4, .9, 7, '#ffffff', 0, .3, 0, .4), .06)); yacht.add(rb(2.0, .9, 3.4, '#e5edf6', 0, 1.2, -.4, .2)); yacht.add(M(rbox(2.04, .4, 3, .05), winA, 0, 1.3, -.4)); yacht.add(rb(2.5, .1, 7.1, '#1E5AA8', 0, .55, 0, .03)); bg.add(yacht); extras.yacht = yacht;
  extras.boat = bg;
  for (const k in extras) if (k !== 'yacht') { extras[k].visible = false; dyn.add(extras[k]); }
}
let lastOp = -1;
function shellOpacity(force) {
  const o = sstep(7.2, 11.5, view.S);
  if (force !== -1 && Math.abs(o - lastOp) < .002) return; lastOp = o;
  for (const m of shellMats) { m.opacity = (m.userData.op0 || 1) * o; m.depthWrite = o > .97; }
  if (hotel) hotel.visible = o > .01;
  if (lobby) lobby.room.visible = o < .995;
}

/* =====================================================================
   NGƯỜI: khách xếp hàng · vào sảnh lên phòng · bỏ đi · trả phòng · người đi đường · xe · thuyền
   ===================================================================== */
const GLOOKS = [
  { skin: '#ffe6cf', hair: '#5a3a28', shirt: '#ff7fa0', pants: '#4a4060', bun: true, hat: '#fff3c4' },
  { skin: '#f6cfab', hair: '#2b2233', shirt: '#7fd6c2', pants: '#3a3a52', glasses: true, tie: '#e8593c' },
  { skin: '#ffe9d6', hair: '#8a5a34', shirt: '#c9a0ff', pants: '#2f3d5c', twin: true },
  { skin: '#f2c9a0', hair: INK, shirt: '#ffb38a', pants: '#40506a', hat: '#7fd6c2', hatBand: '#FFD91F' },
  { skin: '#f6d8c0', hair: '#1b1b1b', shirt: '#3a86ff', pants: '#2b2d42', glasses: true },
  { skin: '#e7bb92', hair: '#3b2a1f', shirt: '#e9c46a', pants: '#3d405b', bun: true }
];
let gli = 0;
const walkers = [];   // khách đang đi vào / bỏ đi / trả phòng
let queueRef = [];
let doorman = null;
function guestVis(g) {
  const look = Object.assign({}, GLOOKS[gli++ % GLOOKS.length], { suitcase: g.bagC || '#ff9a3d' });
  const c = chibi(look, people); c.root.position.set(DOOR_X + 7 + Math.random() * 3 + queueRef.indexOf(g) * 1.05, .06, 10.6); c.face = -Math.PI / 2; c.root.rotation.y = c.face; g._v = c; c.g = g; c.st = 'q';
  return c;
}
function removeVis(c) { people.remove(c.root); }
function syncQueue(dt) {
  const q = queueRef;
  q.forEach((g, i) => {
    const v = g._v || guestVis(g);
    if (v.st !== 'q') return;
    const s = SLOT(i);
    if (v.slot !== i) { v.slot = i; v.path = []; v.target = s; }
    const idle = walk(v, dt, 3.1, false);
    if (idle) { if (!g.here) { g.here = true; v.wave = i === 0 ? 1.2 : 0; } faceTo(v, -Math.PI / 2 + (i ? .3 : 0), dt); }
    const f = g.pat ? g.wait / g.pat : 0; if (f > .6 && Math.random() < dt * .6) v.sad = .5;
    pose(v, dt);
  });
}
function walkerTick(dt) {
  for (let i = walkers.length - 1; i >= 0; i--) {
    const w = walkers[i], v = w.v; w.t += dt;
    const idle = walk(v, dt, w.spd || 2.2, false);
    if (idle && v.done) { const f = v.done; v.done = null; f(); }
    if (w.st === 'desk') { faceTo(v, Math.PI, dt); if (w.t > 1.5) { w.st = 'up'; v.joy = .8; lobby.go(v, lobby.hasLift ? LIFT : new V3(.9, 0, 7.3), () => { w.st = 'out'; if (lobby.hasLift) lobby.openLift(); }); } }
    if (w.st === 'out') { v.root.scale.multiplyScalar(Math.max(.01, 1 - dt * 4)); if (v.root.scale.x < .05) { removeVis(v); walkers.splice(i, 1); if (w.cb) try { w.cb(); } catch (e) {} continue; } }
    pose(v, dt);
  }
}
function serveVis(g, cb) {
  const v = g._v; if (!v) { setTimeout(cb, 1500); return; }
  g._v = null; v.st = 'w'; const w = { v, t: 0, st: 'in', cb, spd: 2.3 }; walkers.push(w);
  v.joy = .9; v.path = [new V3(DOOR_X, 0, 9.8), DOOR_IN.clone()]; v.target = null;
  v.done = () => { if (lobby.hasDesk) lobby.go(v, GUEST_SPOT, () => { w.st = 'desk'; w.t = 0; lobby.deskHello(); }); else lobby.go(v, new V3(7.4, 0, 4.6), () => { w.st = 'desk'; w.t = .4; }); };
}
function leaveVis(g) {
  const v = g._v; if (!v) return; g._v = null; v.st = 'w'; v.sad = 3;
  sprite(TX.sweat, v.root.position.x + .3, 1.9, v.root.position.z, .3, 1.2, new V3(0, -.2, 0));
  const w = { v, t: 0, st: 'leave', spd: 3.2 }; walkers.push(w);
  v.path = [new V3(DOOR_X + 24, 0, 10.9)]; v.target = null; v.done = () => { w.st = 'out'; };
}
function checkoutVis(cb) {
  const c = chibi(Object.assign({}, GLOOKS[gli++ % GLOOKS.length], { suitcase: pick(['#ff9a3d', '#3a86ff', '#e63946', '#2a9d8f']) }), people);
  const from = lobby.hasLift ? LIFT : new V3(.9, 0, 7.3); c.root.position.copy(from); if (lobby.hasLift) lobby.openLift();
  const w = { v: c, t: 0, st: 'co', spd: 2.4 }; walkers.push(w);
  lobby.go(c, DOOR_IN, () => { c.path = [DOOR_OUT.clone(), new V3(DOOR_X - 24, 0, 10.9)]; c.target = null; c.wave = 1.4; if (cb) try { cb(); } catch (e) {} c.done = () => { w.st = 'out'; }; });
}
// người đi đường (bản nhẹ)
const peds = [], PED_LOOK = () => ({ skin: pick(['#f1c9a5', '#e7bb92', '#d29b72', '#f6d8c0']), hair: pick(['#1b1b1b', '#3b2a1f', '#5a3d22']), shirt: pick(['#e63946', '#2a9d8f', '#e9c46a', '#8e7dbe', '#f4a261', '#3a86ff', '#ff006e', '#06d6a0', '#ffffff']), pants: pick(['#2b2d42', '#3d405b', '#1d3557', '#495057']) });
const SIDE_Z = 10.55, PROM_Z = 18.1;
/** z của vỉa hè: lên cầu thì dồn vào lối đi bộ sát lan can */
const sideZ = (x, z0) => { const a = BR.a - 3, d = BR.d + 3; const k = x <= a || x >= d ? 0 : x >= BR.a && x <= BR.d ? 1 : x < BR.a ? (x - a) / 3 : (d - x) / 3; return lerp(z0, LANE.walkBridge, k); };
const walkY = x => x > BR.a - 1 && x < BR.d + 1 ? roadY(x) + .14 : .06;
function spawnPed(init) {
  const dir = Math.random() < .5 ? 1 : -1, hg = view.at.x > 105;
  const prom = Math.random() < .42 && (hg || view.at.x < 75);
  const lo = prom ? (hg ? 147 : -63) : ROUTE.x0 + 2, hi = prom ? (hg ? 260 : 63) : ROUTE.x1 - 2;
  const x0 = clamp(view.at.x + (init ? rnd(-30, 30) : -dir * rnd(42, 62)), lo, hi);
  let kind = 'walk'; const r = Math.random();
  if (inH(hour, 5, 8) && r < .5) kind = 'jog'; else if (inH(hour, 6, 18) && r < .14) kind = 'vendor'; else if (inH(hour, 8, 18) && r < .32 && prom) kind = 'selfie';
  const o = Object.assign({}, LOOK()); if (kind === 'vendor') { o.non = true; o.hat = null; }
  const c = mini(o, people, { legs: true, armL: true, armR: true }); if (kind === 'selfie') c.act = null;
  c.dir = dir; c.prom = prom; c.lo = lo; c.hi = hi; c.z0 = prom ? PROM_Z + rnd(-.3, .3) : SIDE_Z + rnd(-.25, .3);
  c.root.position.set(x0, prom ? .1 : walkY(x0), prom ? c.z0 : sideZ(x0, c.z0)); c.face = dir > 0 ? Math.PI / 2 : -Math.PI / 2; c.root.rotation.y = c.face;
  c.kind = kind; c.spd = kind === 'jog' ? 3.6 : rnd(1.3, 1.8); c.stopAt = kind === 'selfie' ? x0 + dir * rnd(6, 24) : null; c.stopT = 0;
  peds.push(c); taps.push({ obj: c.root, key: kind, dyn: c });
}
// xe cộ
const cars = [];
const CARCOL = ['#e63946', '#f4f1e8', '#2a2d34', '#3a86ff', '#9aa3ab', '#e9c46a', '#2a9d8f'];
function spawnCar(init) {
  const dir = Math.random() < .5 ? 1 : -1, r = Math.random(), type = r < .5 ? 'moto' : r < .75 ? 'car' : r < .88 ? 'taxi' : r < .96 ? 'bus' : 'bike';
  const g = new THREE.Group(), src = new THREE.Group(), col = type === 'taxi' ? '#FFD91F' : pick(CARCOL), wheels = [];
  const wheel = (x, rad) => { const w = cyl(rad, rad, .22, '#2b2233', x, rad, 0, 10); w.rotation.x = Math.PI / 2; src.add(w); };
  if (type === 'moto' || type === 'bike') { src.add(ol(rb(1.3, .35, .3, type === 'bike' ? '#3a86ff' : col, 0, .55, 0, .1), .03)); wheel(-.55, .28); wheel(.55, .28); if (type === 'moto') src.add(rb(.6, .2, .34, '#2b2233', -.15, .8, 0, .06));
    const rd = mini(Object.assign({}, LOOK(), { non: false, hat: null }, type === 'moto' ? { helm: pick(['#e63946', '#FFD91F', '#3a86ff']) } : {}), g, { sit: true }); rd.root.position.set(-.1, .35, 0); rd.root.rotation.y = Math.PI / 2; }
  else if (type === 'bus') { src.add(ol(rb(6.4, 2.4, 2.1, '#2a9d8f', 0, 1.55, 0, .3), .05)); src.add(rb(5.6, .8, 2.14, '#bfe2f5', .2, 2.0, 0, .05)); src.add(rb(6.5, .25, 2.2, '#ffffff', 0, .95, 0, .06)); wheel(-2.2, .42); wheel(2.2, .42); }
  else { src.add(ol(rb(3.0, .8, 1.6, col, 0, .75, 0, .25), .04)); src.add(ol(rb(1.7, .7, 1.45, col, -.15, 1.45, 0, .22), .03)); src.add(rb(1.75, .45, 1.5, '#bfe2f5', -.15, 1.48, 0, .05)); wheel(-1, .34); wheel(1, .34);
    if (type === 'taxi') { src.add(rb(.7, .25, .4, '#ffffff', -.15, 1.9, 0, .05)); } }
  g.add(vcMerge(src, type + col));
  const x0 = clamp(view.at.x + (init ? rnd(-40, 40) : -dir * rnd(62, 84)), ROUTE.x0, ROUTE.x1);
  g.rotation.y = dir > 0 ? 0 : Math.PI; g.position.set(x0, roadY(x0), dir > 0 ? LANE.east : LANE.west);
  const sp = { moto: rnd(5, 7), car: rnd(5.5, 7.5), taxi: rnd(5.5, 7), bus: 4, bike: 2.2 }[type];
  dyn.add(g); const o = { g, dir, sp, wheels, type }; cars.push(o); taps.push({ obj: g, key: type, dyn: o });
}
// thuyền buồm, du thuyền
const boats = [];
function spawnBoat(init) {
  const dir = Math.random() < .5 ? 1 : -1, cruise = Math.random() < .35, g = new THREE.Group(), out = g;
  if (cruise) { g.add(ol(rb(10, 1.4, 3, '#ffffff', 0, .4, 0, .5), .06)); g.add(rb(7, 1.2, 2.6, '#e5edf6', -.5, 1.6, 0, .2)); g.add(M(rbox(6.8, .5, 2.64, .05), winA, -.5, 1.7, 0)); g.add(rb(4, 1, 2.2, '#ffffff', -1, 2.7, 0, .2)); g.add(rb(10.1, .2, 3.1, '#1E5AA8', 0, .7, 0, .05)); }
  else { const hull = rb(6, 1, 2, '#9b5a34', 0, .3, 0, .4); g.add(ol(hull, .06)); g.add(rb(4.5, .8, 1.7, '#c9874f', -.4, 1.1, 0, .15));
    for (const [x, h] of [[-1.4, 5], [1.2, 6.2]]) { g.add(cyl(.08, .08, h, '#5a3d22', x, h / 2 + .8, 0, 6)); const sail = rb(2.4, h * .8, .05, '#e8593c', x + .1, h * .55 + .9, 0, .02); sail.rotation.y = .2; g.add(sail); for (let k = 1; k < 4; k++) g.add(rb(2.5, .06, .1, '#8a3a24', x + .1, h * .2 + .9 + k * h * .2, 0, .02)); } }
  const z = rnd(36, 70);
  { const m = vcMerge(g, cruise ? 'cruise' : 'junk'); g.clear(); g.add(m); }
  g.position.set(init ? rnd(-60, 70) : dir > 0 ? -80 : 90, -.1, z); g.rotation.y = dir > 0 ? 0 : Math.PI; g.scale.setScalar(z > 55 ? 1.2 : 1);
  dyn.add(g); const o = { g, dir, sp: rnd(1.2, 2), ph: Math.random() * 6, key: cruise ? 'cruise' : 'junk' }; boats.push(o); taps.push({ obj: g, key: o.key, dyn: o });
}
function dropTap(o) { const i = taps.findIndex(t => t.dyn === o); if (i >= 0) taps.splice(i, 1); }
// hải âu, mây, khói
const gulls = [], clouds = [], smoke = [];
function buildSkyBits() {
  for (let i = 0; i < 5; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.gull, transparent: true, depthWrite: false })); s.scale.setScalar(1.3); dyn.add(s); gulls.push({ s, cx: rnd(-30, 40), cz: rnd(24, 40), r: rnd(4, 9), y: rnd(6, 10), ph: Math.random() * 6, sp: rnd(.25, .45) }); taps.push({ obj: s, key: 'gull' }); }
  for (let i = 0; i < 9; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.cloud, transparent: true, depthWrite: false, opacity: 0 })); const sc = rnd(30, 60); s.scale.set(sc, sc / 2, 1); s.position.set(rnd(-250, 330), rnd(55, 75), rnd(-60, 300)); dyn.add(s); clouds.push({ s, v: rnd(1, 3) }); }
}

/* =====================================================================
   NGÀY ĐÊM
   ===================================================================== */
const hemi = new THREE.HemisphereLight('#fff8ec', '#c9b6d9', 1.55);
const sun = new THREE.DirectionalLight('#fff0d6', 2.0), fill = new THREE.DirectionalLight('#d6ecff', .55);
const lobbyLamp = new THREE.PointLight('#ffd8a0', 0, 15, 0);
function darkness(h) { if (h >= 7 && h < 17) return 0; if (h >= 17 && h < 19.5) return (h - 17) / 2.5; if (h >= 19.5 || h < 4.5) return 1; return 1 - (h - 4.5) / 2.5; }
const C = (a) => new THREE.Color(a);
const DAY = { hs: C('#fff8ec'), hg: C('#c9b6d9'), su: C('#fff0d6'), sea: C('#ffffff'), bg: C('#9fd8f0') }, DUSK = { hs: C('#ffd2b0'), hg: C('#8a7ab0'), su: C('#ffad70'), sea: C('#ffd6c0'), bg: C('#f6b48a') }, NIGHT = { hs: C('#7f94d0'), hg: C('#2a2450'), su: C('#9fb4ff'), sea: C('#6f83b8'), bg: C('#1b2550') };
const tmpC = new THREE.Color();
function dayNight() {
  const d = darkness(hour), dusk = (inH(hour, 16.5, 20) || inH(hour, 4.5, 7.5)) ? Math.sin(Math.PI * clamp(d, 0, 1)) : 0;
  dark = d;
  const mix3 = (k) => tmpC.copy(DAY[k]).lerp(NIGHT[k], d).lerp(DUSK[k], dusk * .7);
  hemi.color.copy(mix3('hs')); hemi.groundColor.copy(mix3('hg')); hemi.intensity = lerp(1.55, .62, d);
  sun.color.copy(mix3('su')); sun.intensity = lerp(2.0, .35, d); fill.intensity = lerp(.55, .2, d);
  seaMat.color.copy(mix3('sea')); scene.background.copy(mix3('bg'));
  lobbyLamp.intensity = d * 1.5;
  const lit = sstep(.25, .6, d);
  nightMats.forEach(([m, k]) => { m.emissiveIntensity = lit * k; });
  nightMatsShell.forEach(([m, k]) => { m.emissiveIntensity = Math.max(m.userData.e0 || 0, lit * k); });
  lampGlows.forEach(g => { g.material.opacity = lit * .85; g.visible = lit > .02 && view.S < 70; });
  shellGlows.forEach(g => { g.material.opacity = lit * .9 * sstep(7.2, 11.5, view.S); g.visible = lit > .02; });
  if (poolMesh) { poolMesh.material.opacity = lit * .6; poolMesh.visible = lit > .02 && view.S < 70; }
  if (lobby) lobby.dark = d;
}
let rooms = [];
function paintRooms() {
  const night = dark > .45;
  for (const idx in roomWins) { const m = roomWins[idx], r = rooms.find(x => x.idx == idx);
    let col = '#bfe6ff', em = 0;
    if (r && r.kind === 'gym') { col = '#ffe08a'; em = night ? .6 : 0; }
    else if (r && r.kind === 'meeting') { col = '#d4f0ff'; em = night ? .5 : 0; }
    else if (r && r.occ) { if (r.sleep) { col = night ? '#2a3a6a' : '#ffd9a0'; em = 0; } else { col = '#ffe2a8'; em = night ? .95 : 0; } }
    else if (night) col = '#3a4f7a';
    m.color.set(col); m.emissiveIntensity = em; }
}

/* =====================================================================
   CAMERA: kéo để đi, chụm/cuộn để zoom liên tục từ sảnh → phố → toàn vịnh
   ===================================================================== */
function applyCam() {
  const w = wrap.clientWidth || 360, h = wrap.clientHeight || 640, a = w / h, S = view.S;
  const hw = a < 1 ? S : S * 1.36 * a, hh = a < 1 ? S / a : S * 1.36;
  cam.left = -hw; cam.right = hw; cam.top = hh; cam.bottom = -hh;
  cam.position.copy(view.at).addScaledVector(camDir, 500); cam.lookAt(view.at); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
}
function clampView() {
  const S = view.S, a = view.at;
  if (S < 9) { a.x = clamp(a.x, 1.5, 10); a.z = clamp(a.z, 1, 10.5); a.y = .8; }
  else if (S < 55) { a.x = clamp(a.x, -95, 268); a.z = clamp(a.z, -64, 90); a.y = lerp(.8, 0, sstep(9, 20, S)); }
  else { a.x = clamp(a.x, -300, 380); a.z = clamp(a.z, -150, 340); a.y = 0; }
}
const modeOf = S => S < 9 ? 'inside' : S < 50 ? 'street' : 'bay';
const PLACES = [
  { id: 'hotel', ico: '🏨', name: 'Khách sạn', zh: '酒店', py: 'jiǔdiàn', x: 8, z: 10.5, S: 15 },
  { id: 'market', ico: '🏮', name: 'Chợ đêm', zh: '夜市', py: 'yèshì', x: -35, z: -3, S: 14 },
  { id: 'park', ico: '🎢', name: 'Khu vui chơi', zh: '游乐园', py: 'yóulèyuán', x: -40, z: -37, S: 21 },
  { id: 'wheel', ico: '🎡', name: 'Vòng quay', zh: '摩天轮', py: 'mótiānlún', x: 26, z: -46, S: 38 },
  { id: 'beach', ico: '🏖️', name: 'Bãi biển', zh: '海滩', py: 'hǎitān', x: 0, z: 24, S: 15 },
  { id: 'bridge', ico: '🌉', name: 'Cầu Bãi Cháy', zh: '大桥', py: 'dàqiáo', x: 102, z: 13, S: 34 },
  { id: 'hgmarket', ico: '🐟', name: 'Chợ Hạ Long', zh: '市场', py: 'shìchǎng', x: 158, z: 2, S: 15 },
  { id: 'museum', ico: '🏛️', name: 'Bảo tàng', zh: '博物馆', py: 'bówùguǎn', x: 201, z: 0, S: 17 },
  { id: 'square', ico: '⛲', name: 'Quảng trường', zh: '广场', py: 'guǎngchǎng', x: 229, z: -1, S: 17 }
];
function setModeFromS() { const m = modeOf(view.S); if (m !== mode) { mode = m; if (hooks.onMode) hooks.onMode(m); } }
/** khung bản đồ: mọi ghim chương nằm gọn trên thẻ Hành trình (màn dọc lẫn ngang) */
function bayView() {
  const n = story.nodes; if (!n.length) return { at: new V3(51, 0, 62), S: S_BAY };
  const Wd = wrap.clientWidth || 390, H = wrap.clientHeight || 800, a = Wd / H, K = .558;
  const us = n.map(p => (p.x - p.z) / Math.SQRT2), vs = n.map(p => (p.x + p.z) / Math.SQRT2 * K);
  const u0 = Math.min(...us), u1 = Math.max(...us), v0 = Math.min(...vs), v1 = Math.max(...vs);
  const top = 96, bot = H - (a < 1 ? 300 : 200), side = a < 1 ? 64 : 140;
  const p = Math.min((Wd - 2 * side) / (u1 - u0), Math.max(120, bot - top) / (v1 - v0));
  const S = clamp(a < 1 ? (Wd / 2) / p : (H / 2) / (1.36 * p), 60, 260);
  const pp = a < 1 ? (Wd / 2) / S : (H / 2) / (1.36 * S), uc = (u0 + u1) / 2, vc = ((v0 + v1) / 2 - ((top + bot) / 2 - H / 2) / pp) / K;
  return { at: new V3((vc + uc) / Math.SQRT2, 0, (vc - uc) / Math.SQRT2), S };
}
function flyTo(at, S, d = 1.15, cb) { fly = { a0: view.at.clone(), a1: at.clone(), s0: Math.log(view.S), s1: Math.log(S), t: 0, d: REDUCED ? .01 : d, cb }; }
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), ground = new THREE.Plane(new V3(0, 1, 0), 0), hit = new V3();
function rayAt(cx, cy) { const r = cv.getBoundingClientRect(); ndc.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, cam); ray.camera = cam; return ray; }
function groundAt(cx, cy, y = 0) { rayAt(cx, cy); ground.constant = -y; return ray.ray.intersectPlane(ground, new V3()) || view.at.clone(); }
const ptrs = new Map(); let gest = null, vel = new V3(), lastMove = 0, lastTapT = 0, lastTapX = 0, lastTapY = 0;
const minS = (p = view.at) => Math.hypot(p.x - 5, p.z - 6.5) < 16 ? 3.8 : 9.6;
function startGesture() {
  const ps = [...ptrs.values()];
  if (ps.length === 1) gest = { k: 1, anchor: groundAt(ps[0].x, ps[0].y, view.at.y), moved: ps[0].moved || 0 };
  else if (ps.length >= 2) { const mx = (ps[0].x + ps[1].x) / 2, my = (ps[0].y + ps[1].y) / 2; gest = { k: 2, d0: Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y) || 1, S0: view.S, anchor: groundAt(mx, my, view.at.y), moved: 99 }; }
  else gest = null;
}
function bindInput() {
  cv.addEventListener('pointerdown', e => {
    try { cv.setPointerCapture(e.pointerId); } catch (er) {}
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t0: performance.now(), moved: 0 });
    vel.set(0, 0, 0); lastUser = performance.now(); startGesture();
  });
  cv.addEventListener('pointermove', e => {
    const p = ptrs.get(e.pointerId); if (!p) return;
    p.moved += Math.abs(e.clientX - p.x) + Math.abs(e.clientY - p.y); p.x = e.clientX; p.y = e.clientY; lastUser = performance.now();
    if (!gest) return;
    if (gest.k === 1) {
      if (p.moved < 7) return; if (fly) fly = null;
      const prev = view.at.clone(), g = groundAt(p.x, p.y, view.at.y); view.at.add(gest.anchor.clone().sub(g)); clampView(); applyCam();
      const now = performance.now(), dt = Math.max(.008, (now - lastMove) / 1000); lastMove = now; vel.copy(view.at).sub(prev).divideScalar(dt);
      if (hooks.onPan) hooks.onPan();
    } else {
      if (fly) fly = null;
      const ps = [...ptrs.values()]; if (ps.length < 2) return;
      const d = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y) || 1, mx = (ps[0].x + ps[1].x) / 2, my = (ps[0].y + ps[1].y) / 2;
      view.S = clamp(gest.S0 * gest.d0 / d, minS(), 280); applyCam();
      const g = groundAt(mx, my, view.at.y); view.at.add(gest.anchor.clone().sub(g)); clampView(); applyCam(); vel.set(0, 0, 0);
    }
  });
  const up = e => {
    const p = ptrs.get(e.pointerId); if (!p) return; ptrs.delete(e.pointerId);
    const tap = gest && gest.k === 1 && p.moved < 10 && performance.now() - p.t0 < 500 && !ptrs.size;
    if (tap) {
      const now = performance.now();
      if (now - lastTapT < 330 && Math.hypot(e.clientX - lastTapX, e.clientY - lastTapY) < 40) { lastTapT = 0; const g = groundAt(e.clientX, e.clientY, 0); g.y = view.at.y; flyTo(g, clamp(view.S * .55, minS(g), 280), .45); }
      else { lastTapT = now; lastTapX = e.clientX; lastTapY = e.clientY; onTap(e.clientX, e.clientY); }
    }
    if (ptrs.size) startGesture(); else gest = null;
    if (performance.now() - lastMove > 90) vel.set(0, 0, 0);
  };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', e => { ptrs.delete(e.pointerId); gest = null; vel.set(0, 0, 0); });
  cv.addEventListener('wheel', e => { e.preventDefault(); if (fly) fly = null; lastUser = performance.now(); const a = groundAt(e.clientX, e.clientY, view.at.y); view.S = clamp(view.S * Math.exp(e.deltaY * .0016), minS(a), 280); applyCam(); const g = groundAt(e.clientX, e.clientY, view.at.y); view.at.add(a.sub(g)); clampView(); applyCam(); }, { passive: false });
  let rt = 0; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 120); });
  addEventListener('keydown', e => {
    if (!active || !ready || e.altKey || e.ctrlKey || e.metaKey || sheetOn) return;
    const t = e.target; if (t && t.closest && t.closest('input,textarea,select,button,[contenteditable]')) return;
    if (document.querySelector('#ov.on,.sheet-bg.on,#gate.on,#ob.on,.drawer:not([hidden])')) return;
    const k = e.key.toLowerCase(), st = view.S * .14 * .7071; let dx = 0, dz = 0;
    if (k === 'arrowup' || k === 'w') { dx = -st; dz = -st; } else if (k === 'arrowdown' || k === 's') { dx = st; dz = st; }
    else if (k === 'arrowleft' || k === 'a') { dx = -st; dz = st; } else if (k === 'arrowright' || k === 'd') { dx = st; dz = -st; }
    else if (k === '+' || k === '=') { e.preventDefault(); World.zoomBy(.75); return; } else if (k === '-' || k === '_') { e.preventDefault(); World.zoomBy(1.33); return; }
    else return;
    e.preventDefault(); fly = null; vel.set(0, 0, 0); lastUser = performance.now(); view.at.x += dx; view.at.z += dz; clampView(); applyCam(); if (hooks.onPan) hooks.onPan();
  });
}
function resize() { const w = wrap.clientWidth, h = wrap.clientHeight; renderer.setSize(w, h, false); ov.svg.setAttribute('viewBox', `0 0 ${w} ${h}`); applyCam(); }
function onTap(cx, cy) {
  rayAt(cx, cy);
  if (view.S < 9 && lobby) { const r = lobby.tapTest(ray); if (r && r.furn) { hooks.onFurn && hooks.onFurn(r.furn, cx, cy); return; } if (r && r.floor) return; }
  let best = null; const cand = (d, key, extra) => { if (d != null && (!best || d < best.d)) best = Object.assign({ d, key }, extra); };
  if (view.S >= 9 && hotel && hotel.visible) { const p = ray.ray.intersectBox(hotelBox, hit); if (p) cand(p.distanceTo(ray.ray.origin) - .5, '__hotel'); }
  for (const t of taps) {
    if (t.box) { const p = ray.ray.intersectBox(t.box, hit); if (p) cand(p.distanceTo(ray.ray.origin), t.key); }
    else if (t.obj && t.obj.visible !== false && (!t.obj.parent || t.obj.parent.visible !== false)) { const h = ray.intersectObject(t.obj, true)[0]; if (h) cand(h.distance - .3, t.key); }
  }
  for (const q of queueRef) if (q._v) { const h = ray.intersectObject(q._v.root, true)[0]; if (h) cand(h.distance - .6, 'guest'); }
  if (life && view.S < 45) { const np = life.pick(ray); if (np) cand(np.d - .5, np.key); }
  const g = groundAt(cx, cy, 0), gd = g.distanceTo(ray.ray.origin);
  if (!best || best.d > gd + .2) {
    if (g.x > -64 && g.x < 64) { if (g.z > 28.6) best = { key: 'bay' }; else if (g.z > 19.4) best = { key: 'beach' }; else if ((g.z > 11.45 && g.z < 17) || (g.z > -11.2 && g.z < -7.2)) best = { key: 'road' }; else if (g.z < -24 && Math.hypot(g.x - 30, g.z + 44) < 30) best = { key: 'mountain' }; }
    else if (g.x > 146 && g.x < 262 && g.z > 11.45 && g.z < 17) best = { key: 'road' };
    else if (!best) best = { key: g.z > 20 || (g.x > 66 && g.x < 140) ? 'bay' : 'mountain' };
  }
  if (!best) return;
  if (best.key === '__hotel') { hooks.onHotel && hooks.onHotel(); return; }
  hooks.onWord && hooks.onWord(best.key, cx, cy);
}

/* =====================================================================
   LỚP CHỮ NỔI: nhãn khách chờ, câu nói, ghim Hành trình, tên vùng
   ===================================================================== */
const ov = {};
function buildOverlay() {
  const st = document.createElement('style');
  st.textContent = `.w-ov{position:absolute;inset:0;pointer-events:none;z-index:2;overflow:hidden}
.w-ov svg{position:absolute;inset:0;width:100%;height:100%}
.w-ov::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 75% 70% at 50% 46%,rgba(0,0,0,0) 62%,rgba(18,22,48,.22) 100%)}
.w-qt{position:absolute;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;gap:2px;transition:opacity .25s}
.w-qt b{font:800 13px/1.2 system-ui,sans-serif;background:#fff;color:#2b2233;border:2px solid #2b2233;border-radius:10px;padding:1px 6px;white-space:nowrap}
.w-qt b:empty,.w-qt b[data-t=""]{display:none}
.w-qt b small{display:block;font-size:9.5px;color:#1E5AA8;font-weight:800}
.w-qt i{display:block;width:34px;height:6px;border-radius:5px;background:rgba(0,0,0,.35);border:1.5px solid #fff;overflow:hidden}
.w-qt i u{display:block;height:100%;width:100%;transform-origin:0 50%}
.w-say{position:absolute;transform:translate(-50%,-100%);background:#fff;border:2.5px solid #2b2233;border-radius:12px;padding:3px 8px;box-shadow:0 3px 0 #2b2233;font:800 12px/1.25 system-ui,sans-serif;color:#2b2233;text-align:center;white-space:nowrap;opacity:0;transition:opacity .2s}
.w-say.on{opacity:1}.w-say .zh{display:block;font-size:17px}.w-say em{font-style:normal;color:#1E5AA8;font-size:11px}
.w-pin{position:absolute;transform:translate(-50%,-100%);pointer-events:auto;border:0;background:none;padding:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;font:inherit;transition:opacity .3s}
.w-pin .n{width:38px;height:38px;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);display:grid;place-items:center;background:#fff;border:3px solid #2b2233;box-shadow:0 3px 0 #2b2233}
.w-pin .n span{transform:rotate(45deg);font:900 15px/1 system-ui,sans-serif;color:#2b2233}
.w-pin.done .n{background:#7fe3a8}.w-pin.cur .n{background:#FFD91F;animation:wpin 1.2s ease-in-out infinite}.w-pin.lock .n{background:#c9d3de;opacity:.85}
.w-pin small{margin-top:4px;background:rgba(22,23,27,.82);color:#fff;border-radius:9px;padding:2px 7px;font:800 11px/1.25 system-ui,sans-serif;white-space:nowrap;text-align:center}
.w-pin small i{display:block;font-style:normal;color:#FFD91F;font-size:12px}
.nolab .w-pin:not(.cur) small{display:none}.nolab .w-pin:not(.cur) .n{transform:rotate(-45deg) scale(.82)}
@keyframes wpin{50%{transform:rotate(-45deg) translate(3px,-3px) scale(1.08)}}
.w-lab{position:absolute;transform:translate(-50%,-50%);font:900 12px/1.2 system-ui,sans-serif;color:#fff;text-shadow:0 2px 0 rgba(22,23,27,.7),0 0 6px rgba(22,23,27,.6);white-space:nowrap;text-align:center;transition:opacity .3s}
.w-lab span{display:block;font-size:11px;color:#FFE97A}`;
  document.head.appendChild(st);
  const d = document.createElement('div'); d.className = 'w-ov'; wrap.appendChild(d); ov.root = d;
  ov.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); d.appendChild(ov.svg);
  ov.pathA = document.createElementNS('http://www.w3.org/2000/svg', 'polyline'); ov.pathB = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  for (const [p, c, dash] of [[ov.pathB, 'rgba(255,255,255,.85)', '2 10'], [ov.pathA, '#FFD91F', '']]) { p.setAttribute('fill', 'none'); p.setAttribute('stroke', c); p.setAttribute('stroke-width', '5'); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round'); if (dash) p.setAttribute('stroke-dasharray', dash); ov.svg.appendChild(p); }
  ov.labs = document.createElement('div'); d.appendChild(ov.labs); ov.pins = document.createElement('div'); d.appendChild(ov.pins); ov.q = document.createElement('div'); d.appendChild(ov.q);
  ov.say = document.createElement('div'); ov.say.className = 'w-say'; d.appendChild(ov.say);
  ov.qEls = []; ov.pinEls = []; ov.labEls = [];
  for (const L of [['Hòn Gai', '鸿基 Hóngjī', 200, -48], ['Vịnh Hạ Long', '下龙湾 Xiàlóng Wān', 175, 150], ['Quảng Yên', '广安 Guǎng\'ān', -250, -60]]) {
    const e = document.createElement('div'); e.className = 'w-lab'; e.innerHTML = `${L[0]}<span>${L[1]}</span>`; ov.labs.appendChild(e); ov.labEls.push({ e, p: new V3(L[2], 2, L[3]) });
  }
}
const pv = new V3();
function toScr(p, up = 0) { pv.copy(p); pv.y += up; pv.project(cam); return { x: (pv.x + 1) / 2 * wrap.clientWidth, y: (1 - pv.y) / 2 * wrap.clientHeight, vis: pv.z < 1 && pv.x > -1.1 && pv.x < 1.1 && pv.y > -1.1 && pv.y < 1.1 }; }
let sayOf = null, sayT = 0;
function say(c, txt, s) { const i = txt.indexOf(' '), zh = i > 0 ? txt.slice(0, i) : txt, rest = i > 0 ? txt.slice(i + 1) : ''; ov.say.innerHTML = `<span class="zh" lang="zh-CN">${esc(zh)}</span><em>${esc(rest)}</em>`; sayOf = c; sayT = s; ov.say.classList.add('on'); }
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let story = { nodes: [], cur: -1 }, mapHero = null, heroWalk = null;
function overlayTick(dt) {
  const S = view.S;
  // khách chờ: bong bóng + thanh kiên nhẫn
  const showQ = S < 40;
  while (ov.qEls.length < queueRef.length) { const e = document.createElement('div'); e.className = 'w-qt'; e.innerHTML = '<b></b><i><u></u></i>'; ov.q.appendChild(e); ov.qEls.push(e); }
  ov.qEls.forEach((e, i) => {
    const g = queueRef[i]; if (!g || !g._v || !showQ) { e.style.opacity = 0; return; }
    const sp = toScr(g._v.root.position, 2.15); e.style.opacity = sp.vis ? 1 : 0; e.style.left = sp.x + 'px'; e.style.top = sp.y + 'px';
    const f = clamp(1 - (g.wait || 0) / (g.pat || 1), 0, 1), u = e.lastChild.firstChild;
    u.style.transform = `scaleX(${f})`; u.style.background = f > .5 ? '#3dd17a' : f > .25 ? '#ffd34d' : '#ff5a5a';
    const b = e.firstChild, bb = g.bub || ''; if (b.dataset.t !== bb) { b.dataset.t = bb; const [z, rest] = bb.split('|'); b.innerHTML = rest ? `<span lang="zh-CN">${esc(z)}</span><small>${esc(rest)}</small>` : esc(z); }
  });
  if (sayT > 0) { sayT -= dt; const sp = toScr(sayOf.head.getWorldPosition(new V3()), .95); ov.say.style.left = sp.x + 'px'; ov.say.style.top = sp.y + 'px'; if (sayT <= 0 || S > 30) { ov.say.classList.remove('on'); sayT = 0; } }
  // bản đồ: ghim chặng, đường đi, tên vùng
  const mapK = sstep(38, 60, S);
  ov.pins.style.opacity = mapK; ov.pins.classList.toggle('nolab', S > 105); ov.pins.style.pointerEvents = mapK > .5 ? 'auto' : 'none'; ov.svg.style.opacity = mapK; ov.labs.style.opacity = sstep(45, 70, S);
  if (mapK > .01) {
    const pts = story.nodes.map(n => toScr(new V3(n.x, 1, n.z)));
    const done = Math.max(0, story.cur < 0 ? story.nodes.length : story.cur);
    ov.pathA.setAttribute('points', pts.slice(0, done + 1).map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
    ov.pathB.setAttribute('points', pts.slice(Math.max(0, done)).map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
    ov.pinEls.forEach((e, i) => { const p = pts[i]; if (!p) return; e.style.left = p.x + 'px'; e.style.top = (p.y - 4) + 'px'; });
    if (ov.labs.style.opacity > .01) ov.labEls.forEach(L => { const p = toScr(L.p); L.e.style.left = p.x + 'px'; L.e.style.top = p.y + 'px'; });
  }
  if (mapHero) {
    mapHero.root.visible = mapK > .05; const k = clamp(S / 9, 1, 22); mapHero.root.scale.setScalar(k);
    if (heroWalk) { heroWalk.t += rdt / heroWalk.d; const t = easeIO(Math.min(1, heroWalk.t)); mapHero.root.position.lerpVectors(heroWalk.a, heroWalk.b, t); mapHero.speed = heroWalk.t < 1 ? 2 : 0; mapHero.face = Math.atan2(heroWalk.b.x - heroWalk.a.x, heroWalk.b.z - heroWalk.a.z); mapHero.root.rotation.y = mapHero.face; if (heroWalk.t >= 1) { const cb = heroWalk.cb; heroWalk = null; mapHero.joy = 1.2; if (cb) cb(); } }
    else { mapHero.speed = 0; faceTo(mapHero, .78, dt); }
    if (mapHero.root.visible) pose(mapHero, dt);
  }
}

/* =====================================================================
   VÒNG CẬP NHẬT
   ===================================================================== */
let life = null, seeded = false;
/* nắng lấp lánh trên mặt biển ban ngày (vài đốm sáng nhấp nháy quanh máy quay) */
const glint = [];
function glints(dt, S) {
  if (!glint.length) for (let i = 0; i < 14; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.spark, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); s.userData.t = Math.random() * 3; dyn.add(s); glint.push(s); }
  const on = !REDUCED && dark < .3 && S < 60;
  for (const s of glint) { s.visible = on; if (!on) continue; s.userData.t -= dt;
    if (s.userData.t <= 0) { s.userData.t = 1.4 + Math.random() * 2; s.userData.a = 0; s.position.set(view.at.x + rnd(-1, 1) * S * 1.6, -.2, Math.max(30, view.at.z + rnd(4, 24) + S * .4)); const k = S / 15; s.scale.setScalar((.5 + Math.random() * .5) * Math.max(1, k)); }
    s.userData.a += dt; s.material.opacity = Math.sin(Math.min(1, s.userData.a / 1.2) * Math.PI) * .85 * (1 - dark / .3); }
}
let rdt = .016, lastDN = 0, lastF = 0, raf = 0, nextFw = 0, pedT = 0, carT = 0, boatT = 0, perfAcc = 0, perfN = 0, perfBad = 0, fpsCap = 60, sheetOn = false, roomT = 0;
function frame(now) {
  raf = 0; if (!active || document.hidden) return;
  raf = requestAnimationFrame(frame);
  const cap = sheetOn ? Math.min(30, fpsCap) : fpsCap;
  if (lastF && now - lastF < 1000 / cap - 2) return;
  const raw = lastF ? (now - lastF) / 1000 : .016, dt = Math.min(.05, raw); lastF = now; rdt = Math.min(.25, raw);
  perfAcc += dt; perfN++;
  if (perfN >= 90) { const avg = perfAcc / perfN; perfAcc = 0; perfN = 0; if (!low && !sheetOn && avg > .03) { if (++perfBad >= 2 && hooks.onSlow) hooks.onSlow(); } else perfBad = 0; }
  update(dt, now); renderer.render(scene, cam);
}
function update(dt, now) {
  T += dt; tickClock(dt);
  hour = hooks.hour ? hooks.hour() : 12;
  // camera bay mượt
  if (fly) { fly.t += rdt / fly.d; const t = easeIO(Math.min(1, fly.t)); view.at.lerpVectors(fly.a0, fly.a1, t); view.S = Math.exp(lerp(fly.s0, fly.s1, t)); if (fly.t >= 1) { const cb = fly.cb; fly = null; if (cb) cb(); } }
  else if (!ptrs.size && vel.lengthSq() > .01) { view.at.addScaledVector(vel, dt); vel.multiplyScalar(Math.pow(.02, dt)); }
  else if (view.S < 9 && lobby && now - lastUser > 2600) {   // trong sảnh: máy quay đi theo Ā Bǎo / món vừa mua
    const f = lobby.focus, hp = lobby.hero.root.position, tx = clamp(f ? f.x : hp.x * .6 + 5 * .4, 2.6, 8), tz = clamp(f ? f.z : hp.z * .6 + 4.6 * .4, 2.4, 7.2);
    view.at.x += (tx - view.at.x) * Math.min(1, dt * 2); view.at.z += (tz - view.at.z) * Math.min(1, dt * 2);
  }
  clampView(); applyCam(); setModeFromS(); shellOpacity();
  const S = view.S, near = S < 45;
  // nắng & bóng đổ đi theo máy quay (xa quá thì thôi vẽ bóng)
  sun.target.position.copy(view.at); sun.position.copy(view.at).add(new V3(8, 14, 11));
  if (sun.castShadow) { const e = clamp(S * 1.5, 8, 40); const sc = sun.shadow.camera; if (Math.abs(sc.right - e) > .5) { sc.left = -e; sc.right = e; sc.top = e; sc.bottom = -e; sc.updateProjectionMatrix(); } renderer.shadowMap.autoUpdate = S < 32; if (S >= 32) renderer.shadowMap.needsUpdate = false; }
  if (now - lastDN > 400) { lastDN = now; dayNight(); }
  if (now - roomT > 600) { roomT = now; paintRooms(); }
  if (hooks.tick) hooks.tick(dt);
  // khách
  syncQueue(dt); walkerTick(dt);
  if (lobby) lobby.update(dt, S < 12);
  if (doorman) { faceTo(doorman, .3, dt); if (queueRef[0] && queueRef[0].here && Math.random() < dt * .3) doorman.bow = 1; doorman.bow = Math.max(0, doorman.bow - dt * 1.4); pose(doorman, dt); }
  // cửa kính tự mở khi có người
  let near2 = 0; const dp = new V3(DOOR_X, 0, 8.3);
  for (const w of walkers) if (w.v.root.position.distanceTo(dp) < 1.7) near2 = 1;
  if (queueRef[0] && queueRef[0]._v && queueRef[0]._v.root.position.distanceTo(dp) < 1.4) near2 = 1;
  doorPanels.forEach(d => { const goal = d.userData.x0 + d.userData.sx * .7 * near2; d.position.x += (goal - d.position.x) * Math.min(1, dt * 6); });
  if (beams.length) { const on = dark > .45 && view.S > 9; beams.forEach(b => { b.visible = on; if (on) { b.rotation.z = Math.sin(T * .35 + b.userData.ph) * .45; b.rotation.x = -.25 + Math.cos(T * .27 + b.userData.ph) * .2; } }); }
  if (blinkGlow) blinkGlow.material.opacity = (Math.sin(T * 3.2) > .55 ? 1 : .08) * Math.max(.25, sstep(.25, .6, dark)) * sstep(7.2, 11.5, view.S);
  if (liftCab) { const goal = (Math.sin(T * .35) * .5 + .5) * (liftTop - 2); liftCab.position.y += (goal - liftCab.position.y) * Math.min(1, dt * 2); }
  // phố
  people.visible = S < 60;
  pedT -= dt; carT -= dt; boatT -= dt;
  const pedCap = low ? 4 : 9, carCap = low ? 3 : 7, rate = inH(hour, 22.5, 5) ? .25 : 1;
  if (near && pedT <= 0 && peds.length < pedCap) { pedT = rnd(1.5, 4) / rate; spawnPed(); }
  if (near && carT <= 0 && cars.length < carCap) { carT = rnd(1.6, 4.2) / rate; spawnCar(); }
  if (boatT <= 0 && boats.length < (low ? 2 : 4)) { boatT = rnd(14, 30); spawnBoat(false); }
  for (let i = peds.length - 1; i >= 0; i--) { const c = peds[i], p = c.root.position;
    if (c.stopAt != null && c.stopT === 0 && (p.x - c.stopAt) * c.dir >= 0) { c.stopT = 3; c.act = 'phone'; }
    if (c.stopT > 0) { c.stopT -= dt; c.speed *= .8; if (c.stopT <= 0) { c.stopT = -1; c.act = null; } }
    else { p.x += c.dir * c.spd * dt; c.speed = c.spd; if (!c.prom) { p.z = sideZ(p.x, c.z0); p.y = walkY(p.x); } }
    if (p.x < c.lo || p.x > c.hi || Math.abs(p.x - view.at.x) > 110 || (!near && Math.abs(p.x - view.at.x) > 40)) { people.remove(c.root); peds.splice(i, 1); dropTap(c); continue; }
    if (near) lifePose(c, dt, T); }
  for (let i = cars.length - 1; i >= 0; i--) { const c = cars[i], x = c.g.position.x += c.dir * c.sp * dt;
    c.g.position.y = roadY(x); c.g.rotation.z = c.dir * Math.atan(roadSlope(x));
    if (x < ROUTE.x0 - 2 || x > ROUTE.x1 + 2 || Math.abs(x - view.at.x) > 120) { dyn.remove(c.g); cars.splice(i, 1); dropTap(c); } }
  if (life) life.update(dt, T, view, dark, cam);
  if (near && !seeded) { seeded = true; for (let i = 0; i < (low ? 2 : 4); i++) { spawnPed(true); spawnCar(true); } }
  for (let i = boats.length - 1; i >= 0; i--) { const b = boats[i]; b.g.position.x += b.dir * b.sp * dt; b.g.position.y = -.22 + Math.sin(T * 1.4 + b.ph) * .08; b.g.rotation.z = Math.sin(T * 1.1 + b.ph) * .03; if (b.g.position.x < -95 || b.g.position.x > 105) { dyn.remove(b.g); boats.splice(i, 1); dropTap(b); } }
  gulls.forEach(g => { g.ph += dt * g.sp; g.s.position.set(g.cx + Math.cos(g.ph) * g.r, g.y + Math.sin(g.ph * 2) * .6, g.cz + Math.sin(g.ph) * g.r * .6); g.s.visible = S < 50 && dark < .6; });
  const ck = sstep(30, 70, S); clouds.forEach(c => { c.s.position.x += c.v * dt; if (c.s.position.x > 360) c.s.position.x = -280; c.s.material.opacity = ck * .85 * (1 - dark * .6); c.s.visible = ck > .01; });
  cableCabs.forEach(c => { c.t = (c.t + dt * .03) % 1; const t = c.t < .5 ? c.t * 2 : 2 - c.t * 2; c.c.position.lerpVectors(cableA, cableB, t); });
  if (wheel) { const vis = S > 9 && Math.hypot(view.at.x - WHEEL.x, view.at.z - WHEEL.z) < S * 3.4 + 60; wheel.gr.visible = vis; if (vis) { wheelPose(dt); wheelLights(sstep(.25, .6, dark)); } }
  glints(dt, S);
  if (!REDUCED && Math.random() < dt * 2) chimneys.forEach(p => sprite(TX.puff, p.x, p.y, p.z, 4, 5, new V3(1.2, 1.6, .4), { grow: 2 }));
  seaTex.offset.x = (seaTex.offset.x + dt * .003) % 1; seaTex.offset.y = (seaTex.offset.y + dt * .0015) % 1; foam.material.opacity = .45 + Math.sin(T * 1.3) * .25; foam.position.z = 28.7 + Math.sin(T * 1.3) * .25;
  if (extras.yacht && extras.boat.visible) { extras.yacht.position.y = Math.sin(T * 1.2) * .08; extras.yacht.rotation.z = Math.sin(T * .9) * .03; }
  // pháo hoa trên vịnh 20:00–21:30
  if (ST.own.fireworks && inH(hour, 20, 21.5) && now > nextFw && S < 80) { nextFw = now + rnd(900, 1700); const col = pick(['#ff7fa0', '#FFD91F', '#7fd6ff', '#7fffb0', '#ff5a5a', '#ffffff']); burst(rnd(-25, 40), rnd(18, 28), rnd(38, 54), col, low ? 18 : 34, 6); if (hooks.onBoom && !sheetOn) hooks.onBoom(); }
  stepFx(dt); overlayTick(dt);
}

/* =====================================================================
   API cho game chính
   ===================================================================== */
const World = {
  get ready() { return ready; },
  init(o) {
    cv = o.canvas; wrap = o.wrap; hooks = o.hooks || {}; low = !!o.low;
    renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: !low, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(low ? 1 : 2, devicePixelRatio || 1));
    renderer.shadowMap.enabled = !low; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.NoToneMapping;
    scene = new THREE.Scene(); scene.background = new THREE.Color('#9fd8f0');
    cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1400);
    scene.add(world); world.add(staticRoot, dyn, people, fxRoot);
    scene.add(hemi, sun, sun.target, fill, lobbyLamp); fill.position.set(-6, 6, 8); lobbyLamp.position.set(5, 3, 4.2);
    if (!low) { sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 80 }); sun.shadow.bias = -.0008; sun.shadow.normalBias = .04; sun.shadow.radius = 3; }
    setCoinHook(() => hooks.onCoin && hooks.onCoin());
    const tmp = new THREE.Group(); const old = setSeg(1);
    buildTerrain(tmp); buildCity(tmp); buildLandmarks(tmp); buildWheel(tmp);
    life = buildLife({ world: dyn, tapBox, lamp: lampPost, winA, winB, glassMat, nightMats, owned: id => !!ST.own[id], hour: () => hour });
    tmp.add(life.static); setSeg(old);
    bake(tmp, staticRoot, { vc: true }); buildLightPools();
    buildExtras(); buildSkyBits();
    lobby = buildLobby({ say, visible: () => view.S < 12 }); world.add(lobby.room);
    buildOverlay(); bindInput(); resize();
    for (let i = 0; i < 3; i++) spawnBoat(true);
    buildHotel(ST); dayNight();
    // biên dịch sẵn mọi vật liệu (kể cả sảnh, đồ chưa mua) → lần đầu vào trong không bị khựng
    try { const hid = []; scene.traverse(m => { if (!m.visible) { hid.push(m); m.visible = true; } }); renderer.compile(scene, cam); hid.forEach(m => { m.visible = false; }); } catch (e) {}
    shellOpacity(-1);
    ready = true; World.setActive(true);
    return true;
  },
  /** trạng thái khách sạn: sao, tầng, công trình, nội thất, nhân viên, mở cửa chưa */
  setState(st) {
    ST = Object.assign({}, ST, st);
    const k = [ST.star, ST.floors, ST.open ? 1 : 0, Object.keys(ST.own).filter(x => ST.own[x]).sort().join(',')].join('|');
    if (k !== sig) { sig = k; buildHotel(ST); dayNight(); }
    if (lobby) { lobby.own = (ST.furn || []).concat(ST.own.lift ? ['lift'] : []); lobby.staff = ST.staff || 0; lobby.setTier(ST.star); }
    const wantDoorman = (ST.staff || 0) >= 1 && ST.open;
    if (wantDoorman && !doorman) { doorman = chibi({ skin: '#f6d2b0', hair: '#22242e', shirt: '#2c4a86', pants: '#2c4a86', hat: '#2c4a86', hatBand: '#FFD91F', tie: '#FFD91F' }, people); doorman.root.position.set(DOOR_X - 2.05, .06, 9.4); }
    if (!wantDoorman && doorman) { people.remove(doorman.root); doorman = null; }
  },
  setRooms(list) { rooms = list || []; },
  set queue(q) { queueRef = q; },
  set sheet(v) { sheetOn = !!v; },
  place(id) { const go = () => lobby && lobby.place(id); if (view.S > 9) World.flyTo('inside', go); else go(); },
  cheer() { if (lobby) lobby.cheer(); confetti(DOOR_X, 4, 9.5, 40); },
  serve: serveVis, leave: leaveVis, checkout: checkoutVis,
  arrive(idx) { const k = Math.floor(idx / 3), j = idx % 3, x = 1.75 + j * 3.25, y = LOBBY_H + (k - 1) * FLOOR_H + 1.65; if (view.S > 7) sparkles(x, y, 8.8, 10, .4, .4); },
  /** bay tới: 'inside' · 'street' · 'bay' · {x,z,S} */
  flyTo(where, cb) {
    if (where === 'inside') flyTo(new V3(5.4, .8, 4.8), S_IN, 1.15, cb);
    else if (where === 'street') flyTo(new V3(8, .6, 10.5), S_STREET, 1.15, cb);
    else if (where === 'bay') { const b = bayView(); flyTo(b.at, b.S, 1.5, cb); }
    else flyTo(new V3(where.x, 0, where.z), where.S || 70, where.d || 1.3, cb);
  },
  jump(where) { if (where === 'bay') { const b = bayView(); view.at.copy(b.at); view.S = b.S; } else if (where === 'inside') { view.at.set(5.4, .8, 4.8); view.S = S_IN; } else { view.at.set(8, .6, 10.5); view.S = S_STREET; } fly = null; clampView(); applyCam(); setModeFromS(); shellOpacity(-1); },
  get mode() { return mode; }, get S() { return view.S; }, get flying() { return !!fly; },
  setActive(v) { active = v; if (v && ready && !raf) { lastF = 0; raf = requestAnimationFrame(frame); } },
  setLow(v) { low = !!v; fpsCap = low ? 30 : 60; renderer.setPixelRatio(Math.min(low ? 1 : 2, devicePixelRatio || 1)); resize(); },
  toScreen(what) { const p = what === 'door' ? new V3(DOOR_X, 0, 9.6) : what === 'hotel' ? new V3(5, LOBBY_H + ST.floors * FLOOR_H, 8) : new V3(what.x, what.y || 0, what.z); const r = cv.getBoundingClientRect(), s = toScr(p, what === 'door' ? 2.4 : 0); return { x: r.left + s.x, y: r.top + s.y, vis: s.vis }; },
  queueRect() { const r = cv.getBoundingClientRect(); const a = toScr(SLOT(0), 2.8), b = toScr(SLOT(3), -.2), c = toScr(SLOT(0), -.2), d = toScr(SLOT(3), 2.8); const xs = [a.x, b.x, c.x, d.x], ys = [a.y, b.y, c.y, d.y]; return { x: r.left + Math.min(...xs) - 14, y: r.top + Math.min(...ys) - 8, w: Math.max(...xs) - Math.min(...xs) + 28, h: Math.max(...ys) - Math.min(...ys) + 16 }; },
  /** Hành trình: nodes = [{id,n,x,z,title,zh,state}] · cur = chỉ số chặng đang mở */
  setStory(nodes, cur, onPin) {
    story = { nodes, cur };
    ov.pins.innerHTML = ''; ov.pinEls = nodes.map((n, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'w-pin ' + n.state; b.innerHTML = `<span class="n"><span>${n.state === 'done' ? '✓' : n.state === 'lock' ? '🔒' : n.n}</span></span><small>${esc(n.title)}<i lang="zh-CN">${esc(n.zh || '')}</i></small>`; b.onclick = e => { e.stopPropagation(); onPin && onPin(n.id); }; ov.pins.appendChild(b); return b; });
    if (!mapHero) { mapHero = chibi({ skin: '#ffe0c7', hair: '#2b2233', shirt: '#1E5AA8', pants: INK, band: '#FFD91F', vest: '#FFD91F', ahoge: true }, dyn); mapHero.root.castShadow = false; }
    const at = nodes[Math.max(0, cur < 0 ? nodes.length - 1 : cur)]; if (at && !heroWalk) mapHero.root.position.set(at.x, 1, at.z + 2);
  },
  walkHero(i0, i1, cb) { const a = story.nodes[i0], b = story.nodes[i1]; if (!a || !b || !mapHero) { if (cb) cb(); return; } heroWalk = { a: new V3(a.x, 1, a.z + 2), b: new V3(b.x, 1, b.z + 2), t: 0, d: clamp(Math.hypot(b.x - a.x, b.z - a.z) / 90, 1.4, 3.2), cb }; },
  nodeScreen(i) { const n = story.nodes[i]; if (!n) return null; const r = cv.getBoundingClientRect(), s = toScr(new V3(n.x, 1, n.z)); return { x: r.left + s.x, y: r.top + s.y, vis: s.vis }; },
  /** các khu để bay nhanh tới (nút 📍) */
  places: PLACES,
  goPlace(id) { const p = PLACES.find(q => q.id === id); if (!p) return; vel.set(0, 0, 0); flyTo(new V3(p.x, 0, p.z), p.S, 1.25); },
  zoomBy(f) { vel.set(0, 0, 0); flyTo(view.at.clone(), clamp(view.S * f, minS(), 280), .35); },
  /** ảnh chụp khách sạn ở hạng sao bất kỳ (cho màn nhắc mở thẻ: "khách sạn 3★ của bạn sẽ như thế này") */
  preview(star) {
    if (!ready) return null;
    const at0 = view.at.clone(), S0 = view.S, fly0 = fly; fly = null; let url = null;
    const F = Math.max(ST.floors || 1, Math.min(5, star)), port = (wrap.clientWidth || 1) < (wrap.clientHeight || 1);
    try {
      const own = Object.assign({}, ST.own, star >= 4 ? { sign: 1, lantern: 1 } : {}, star >= 5 ? { lights: 1, palm: 1, pool: 1 } : {});
      buildHotel(Object.assign({}, ST, { star, floors: F, open: true, own }));
      view.at.set(5.2, (LOBBY_H + F * FLOOR_H + (star >= 5 ? 5 : 2)) * .5, 4.8); view.S = port ? Math.max(10.5, 5.6 + F * 2.3) : Math.max(8.6, 4.2 + F * 1.75); applyCam();
      for (const m of shellMats) { m.opacity = m.userData.op0 || 1; m.depthWrite = true; } hotel.visible = true; if (lobby) lobby.room.visible = false; lastOp = -1;
      dayNight(); renderer.render(scene, cam);
      const W = cv.width, H = cv.height, cw = port ? W : Math.min(W, H * 1.3), ch = port ? Math.min(H, W / 1.3) : H, c2 = document.createElement('canvas');
      c2.width = 520; c2.height = 400; c2.getContext('2d').drawImage(cv, (W - cw) / 2, (H - ch) / 2, cw, ch, 0, 0, 520, 400); url = c2.toDataURL('image/jpeg', .84);
    } catch (e) { url = null; }
    buildHotel(ST); view.at.copy(at0); view.S = S0; fly = fly0; applyCam(); shellOpacity(-1); dayNight(); renderer.render(scene, cam);
    return url;
  },
  get _scene() { return scene; }, say, debug: () => ({ S: view.S, at: view.at.toArray().map(v => +v.toFixed(2)), mode, calls: renderer.info.render.calls, tris: renderer.info.render.triangles, peds: peds.length, cars: cars.length, boats: boats.length, walkers: walkers.length, fps: perfN })
};
window.BKWorld = World;
window.dispatchEvent(new Event('bkworld'));
