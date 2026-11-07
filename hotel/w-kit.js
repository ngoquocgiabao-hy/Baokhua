/* =====================================================================
   BỘ ĐỒ NGHỀ 3D DÙNG CHUNG · Khách sạn Vịnh Ā Bǎo (v7)
   Một kiểu vẽ cho mọi thứ (phố, toà nhà, sảnh, nhân vật): khối bo tròn,
   tô hoạt hình 3 tông + viền đậm màu mực. Tách ra để world.js và w-lobby.js dùng chung.
   ===================================================================== */
import * as THREE from 'three';

export const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const V3 = THREE.Vector3;
export const clamp = THREE.MathUtils.clamp, lerp = THREE.MathUtils.lerp;
export const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
export const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
export const ZH = '"PingFang SC","Hiragino Sans GB","Noto Sans CJK SC","Noto Sans SC","Microsoft YaHei",sans-serif';
export const UI = 'system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif';
export const INK = '#3a2c3f';

/* ---------- vật liệu hoạt hình ---------- */
export const grad = (() => { const t = new THREE.DataTexture(new Uint8Array([120, 120, 120, 255, 190, 190, 190, 255, 255, 255, 255, 255]), 3, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const MATS = {};
export const OUTL = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });
/** Chế độ "vỏ": vật liệu riêng, trong suốt được (để tường ngoài khách sạn mờ dần khi zoom vào trong) */
let SHELL = null;
export function shellBegin() { SHELL = { cache: {}, list: [], outl: new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide, transparent: true }) }; SHELL.list.push(SHELL.outl); return SHELL; }
export function shellEnd() { const s = SHELL; SHELL = null; return s; }
export function toon(c, o = {}) {
  const k = c + JSON.stringify(o);
  if (SHELL) return SHELL.cache[k] || (SHELL.list.push(SHELL.cache[k] = new THREE.MeshToonMaterial(Object.assign({ color: c, gradientMap: grad, transparent: true }, o))), SHELL.cache[k]);
  return MATS[k] || (MATS[k] = new THREE.MeshToonMaterial(Object.assign({ color: c, gradientMap: grad }, o)));
}
/** vật liệu riêng (không dùng chung bộ nhớ đệm) – cho cửa sổ phòng đổi sáng/tối, tường sảnh đổi màu theo sao */
export function ownToon(c, o = {}) { const m = new THREE.MeshToonMaterial(Object.assign({ color: c, gradientMap: grad }, o, SHELL ? { transparent: true } : {})); if (SHELL) SHELL.list.push(m); return m; }
const outl = () => SHELL ? SHELL.outl : OUTL;

/* ---------- hình khối (có bộ nhớ đệm để dùng lại) ---------- */
let SEG = 3;
export function setSeg(s) { const o = SEG; SEG = s; return o; }
const GEO = {};
export function rbox(w, h, d, r = .06, seg = SEG) {
  r = Math.max(0, Math.min(r, w / 2 - .001, h / 2 - .001, d / 2 - .001));
  const k = `b${w.toFixed(3)},${h.toFixed(3)},${d.toFixed(3)},${r.toFixed(3)},${seg}`; if (GEO[k]) return GEO[k];
  if (r < .004) return GEO[k] = new THREE.BoxGeometry(w, h, d);
  const g = new THREE.BoxGeometry(w, h, d, seg * 2, seg * 2, seg * 2), p = g.attributes.position, n = g.attributes.normal, v = new V3(), c = new V3(), hw = w / 2 - r, hh = h / 2 - r, hd = d / 2 - r;
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); c.set(clamp(v.x, -hw, hw), clamp(v.y, -hh, hh), clamp(v.z, -hd, hd));
    const dv = v.clone().sub(c); if (dv.lengthSq() > 1e-12) { dv.normalize(); v.copy(c).addScaledVector(dv, r); p.setXYZ(i, v.x, v.y, v.z); n.setXYZ(i, dv.x, dv.y, dv.z); } }
  return GEO[k] = g;
}
const gk = (n, a) => n + a.map(x => typeof x === 'number' ? x.toFixed(3) : x).join(',');
export function cylG(rt, rbm, h, seg = 18, open = false) { const k = gk('c', [rt, rbm, h, seg, open ? 1 : 0]); return GEO[k] || (GEO[k] = new THREE.CylinderGeometry(rt, rbm, h, seg, 1, open)); }
export function sphG(r, seg = 18) { const k = gk('s', [r, seg]); return GEO[k] || (GEO[k] = new THREE.SphereGeometry(r, seg, Math.max(8, seg * .7 | 0))); }
export function coneG(r, h, seg = 12) { const k = gk('k', [r, h, seg]); return GEO[k] || (GEO[k] = new THREE.ConeGeometry(r, h, seg)); }
export function planeG(w, h) { const k = gk('p', [w, h]); return GEO[k] || (GEO[k] = new THREE.PlaneGeometry(w, h)); }
export const put = (p, c) => (p.add(c), c);
export function M(geo, color, x = 0, y = 0, z = 0, o) { const m = new THREE.Mesh(geo, typeof color === 'string' ? toon(color, o) : color); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; }
export const rb = (w, h, d, c, x, y, z, r, o) => M(rbox(w, h, d, r === undefined ? Math.min(w, h, d) * .18 : r), c, x, y, z, o);
export const cyl = (rt, rbm, h, c, x, y, z, seg = 18, o) => M(cylG(rt, rbm, h, seg), c, x, y, z, o);
export const sph = (r, c, x, y, z, seg = 18, o) => M(sphG(r, seg), c, x, y, z, o);
export const cone = (r, h, c, x, y, z, seg = 12, o) => M(coneG(r, h, seg), c, x, y, z, o);
/** viền mực: bản sao mặt sau phóng to một chút */
export function ol(m, s = .035) {
  const o = new THREE.Mesh(m.geometry, outl()); const sc = m.geometry.boundingSphere || (m.geometry.computeBoundingSphere(), m.geometry.boundingSphere);
  o.scale.setScalar(1 + s / Math.max(.05, sc.radius)); o.castShadow = false; o.receiveShadow = false; o.userData.outline = 1; m.add(o); return m;
}
export function canvasTex(w, h, draw, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } t.userData.canvas = c; return t;
}
/** bảng chữ (biển hiệu): chữ Hán to + dòng pinyin/nghĩa nhỏ */
export function signTex(zh, sub, o = {}) {
  const w = o.w || 512, h = o.h || 160;
  return canvasTex(w, h, g => {
    g.fillStyle = o.bg || '#1E5AA8'; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, o.r != null ? o.r : 30); g.fill();
    g.strokeStyle = o.edge || '#FFD91F'; g.lineWidth = 8; g.stroke();
    g.fillStyle = o.fg || '#FFD91F'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `900 ${o.zs || (sub ? 62 : 84)}px ${ZH}`; g.fillText(zh, w / 2, sub ? h * .4 : h / 2 + 4);
    if (sub) { g.fillStyle = o.sub || '#ffffff'; g.font = `800 ${o.ss || 26}px ${UI}`; g.fillText(sub, w / 2, h * .79); }
  });
}
export function stripeTex(a, b, n = 8) { return canvasTex(128, 32, g => { for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect(i * 128 / n, 0, 128 / n + 1, 32); } g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, 26, 128, 6); }); }

/* ---------- sprite hiệu ứng ---------- */
const spriteTex = draw => canvasTex(64, 64, draw);
export const TX = {
  dot: spriteTex(g => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 30); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }),
  heart: spriteTex(g => { g.fillStyle = '#ff6b8f'; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(32, 54); g.bezierCurveTo(4, 34, 8, 8, 32, 20); g.bezierCurveTo(56, 8, 60, 34, 32, 54); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(22, 24, 5, 0, 7); g.fill(); }),
  spark: spriteTex(g => { g.fillStyle = '#fff3a6'; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 7 : 28; g.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } g.fill(); }),
  puff: spriteTex(g => { const r = g.createRadialGradient(32, 32, 4, 32, 32, 30); r.addColorStop(0, 'rgba(255,255,255,.95)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.beginPath(); g.arc(32, 32, 30, 0, 7); g.fill(); }),
  sweat: spriteTex(g => { g.fillStyle = '#7cc6ff'; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(32, 6); g.quadraticCurveTo(54, 40, 32, 56); g.quadraticCurveTo(10, 40, 32, 6); g.fill(); g.stroke(); }),
  bang: spriteTex(g => { g.fillStyle = '#FFD91F'; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(32, 30, 24, 0, 7); g.fill(); g.stroke(); g.fillStyle = INK; g.font = 'bold 34px ' + UI; g.textAlign = 'center'; g.fillText('!', 32, 42); }),
  glow: spriteTex(g => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,224,150,.9)'); r.addColorStop(.4, 'rgba(255,214,120,.35)'); r.addColorStop(1, 'rgba(255,214,120,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }),
  zzz: spriteTex(g => { g.fillStyle = '#ffffff'; g.strokeStyle = INK; g.lineWidth = 5; g.font = '900 40px ' + UI; g.textAlign = 'center'; g.strokeText('Z', 32, 46); g.fillText('Z', 32, 46); }),
  gull: spriteTex(g => { g.strokeStyle = '#ffffff'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(8, 30); g.quadraticCurveTo(20, 18, 32, 32); g.quadraticCurveTo(44, 18, 56, 30); g.stroke(); }),
  cloud: canvasTex(128, 64, g => { g.fillStyle = 'rgba(255,255,255,.95)'; for (const [x, y, r] of [[34, 40, 20], [58, 30, 26], [86, 38, 22], [104, 44, 14], [20, 46, 12]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } g.fillStyle = 'rgba(200,220,240,.55)'; g.fillRect(14, 50, 100, 8); })
};

/* ---------- hệ hạt (sprite bay, giấy màu, xu 3D) ---------- */
export const fxRoot = new THREE.Group();
const fx = [], coinFx = [];
let onCoin = null;
export function setCoinHook(f) { onCoin = f; }
export function sprite(tex, x, y, z, s, life, vel, o = {}) {
  const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, color: o.color || 0xffffff, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending }));
  m.position.set(x, y, z); m.scale.setScalar(s); fxRoot.add(m);
  fx.push({ m, life, max: life, vel: vel || new V3(), s, grav: o.grav || 0, grow: o.grow || 0, drag: o.drag || 0 }); return m;
}
export const puff = (x, y, z, s = .3) => { if (!REDUCED) sprite(TX.puff, x + (Math.random() - .5) * .1, y, z + (Math.random() - .5) * .1, s * .6, .5, new V3(0, .25, 0), { grow: .8 }); };
export const hearts = (x, y, z, n = 4) => { for (let i = 0; i < n; i++) sprite(TX.heart, x + (Math.random() - .5) * .5, y, z + (Math.random() - .5) * .3, .26, 1.3 + i * .1, new V3((Math.random() - .5) * .4, .9 + Math.random() * .4, 0)); };
export const sparkles = (x, y, z, n = 8, r = .6, s = .22) => { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28; sprite(TX.spark, x, y, z, s, .7 + Math.random() * .4, new V3(Math.cos(a) * r * 2, .6 + Math.random() * 1.2, Math.sin(a) * r * 2), { add: true, grav: 2.2 }); } };
const CONF = ['#ff7fa0', '#7fd6c2', '#FFD91F', '#8fb8ff', '#ffb38a', '#c9a0ff'].map(c => new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
const confGeo = new THREE.PlaneGeometry(.09, .14);
export function confetti(x, y, z, n = 60, sp0 = 1) { if (REDUCED) return; for (let i = 0; i < n; i++) { const m = new THREE.Mesh(confGeo, CONF[i % CONF.length]); m.position.set(x, y, z); m.scale.setScalar(sp0); fxRoot.add(m); const a = Math.random() * 6.28, sp = (1.5 + Math.random() * 2.5) * sp0; fx.push({ m, life: 2.2, max: 2.2, vel: new V3(Math.cos(a) * sp, (3 + Math.random() * 3) * sp0, Math.sin(a) * sp), s: sp0, grav: 6 * sp0, spin: 8 + Math.random() * 8, conf: true, floor: y - 3 * sp0 }); } }
export function coins3d(x, y, z, n = 3) { for (let i = 0; i < n; i++) { const c = cyl(.12, .12, .045, '#f2c94c', x - .3 + i * .22, y, z, 18, { emissive: '#8a6a10', emissiveIntensity: .25 }); c.rotation.x = Math.PI / 2; ol(c, .015); fxRoot.add(c); coinFx.push({ c, vy: 2.6 + i * .25, t: 0 }); } }
/** pháo hoa: 1 chùm hạt cộng sáng */
export function burst(x, y, z, col, n = 34, v = 6) { for (let i = 0; i < n; i++) { const a = i / n * 6.283, b = (Math.random() - .5) * 1.2; sprite(TX.dot, x, y, z, .9, 1.3 + Math.random() * .5, new V3(Math.cos(a) * v * Math.cos(b), Math.sin(b) * v + 1, Math.sin(a) * v * Math.cos(b)), { add: true, grav: 2.6, color: col, drag: .8 }); } }
export function stepFx(dt) {
  for (let i = fx.length - 1; i >= 0; i--) { const p = fx[i]; p.life -= dt; if (p.life <= 0) { fxRoot.remove(p.m); if (p.m.material && !p.conf) p.m.material.dispose(); fx.splice(i, 1); continue; }
    p.vel.y -= p.grav * dt; if (p.drag) p.vel.multiplyScalar(Math.max(0, 1 - p.drag * dt)); p.m.position.addScaledVector(p.vel, dt); const k = p.life / p.max;
    if (p.conf) { p.m.rotation.x += p.spin * dt; p.m.rotation.y += p.spin * .7 * dt; if (p.m.position.y < p.floor) { p.m.position.y = p.floor; p.vel.set(0, 0, 0); p.grav = 0; } p.m.scale.setScalar(p.s * Math.min(1, k * 3)); }
    else { p.m.material.opacity = Math.min(1, k * 2.2); p.m.scale.setScalar(p.s * (1 + p.grow * (1 - k))); } }
  for (let i = coinFx.length - 1; i >= 0; i--) { const o = coinFx[i]; o.t += dt; o.vy -= 6 * dt; o.c.position.y += o.vy * dt; o.c.rotation.z += dt * 9;
    if (Math.random() < dt * 14) sprite(TX.spark, o.c.position.x, o.c.position.y, o.c.position.z, .14, .4, new V3(0, .2, 0), { add: true });
    if (o.t > .8) { fxRoot.remove(o.c); coinFx.splice(i, 1); if (onCoin) onCoin(); } }
}

/* =====================================================================
   NHÂN VẬT CHIBI (khớp thật, viền, chớp mắt) · lite = bản nhẹ cho người đi đường
   ===================================================================== */
export function chibi(o, parent, lite) {
  const root = new THREE.Group(), hips = new THREE.Group(); root.add(hips); hips.position.y = .4;
  const O = lite ? (m => m) : ol;
  const legL = new THREE.Group(), legR = new THREE.Group();
  for (const [lg, sx] of [[legL, -.11], [legR, .11]]) { lg.position.set(sx, 0, 0); hips.add(lg); lg.add(O(M(new THREE.CapsuleGeometry(.085, .14, 3, lite ? 6 : 10), o.pants, 0, -.17, 0), .025)); if (!lite) lg.add(ol(rb(.17, .1, .25, o.shoes || INK, 0, -.35, .04, .045), .02)); }
  const torso = new THREE.Group(); hips.add(torso);
  torso.add(ol(M(new THREE.CapsuleGeometry(.2, .14, lite ? 4 : 6, lite ? 10 : 14), o.shirt, 0, .22, 0), .03));
  if (o.vest) torso.add(rb(.26, .26, .06, o.vest, 0, .24, .17, .05));
  if (o.tie && !lite) put(torso, M(coneG(.04, .14, 4), o.tie, 0, .3, .2)).rotation.x = Math.PI;
  const armL = new THREE.Group(), armR = new THREE.Group();
  for (const [ar, sx] of [[armL, -.27], [armR, .27]]) { ar.position.set(sx, .36, 0); torso.add(ar); ar.add(O(M(new THREE.CapsuleGeometry(.065, .14, 3, lite ? 6 : 10), o.shirt, 0, -.12, 0), .025)); if (!lite) ar.add(ol(sph(.07, o.skin, 0, -.27, 0, 12), .02)); }
  const head = new THREE.Group(); head.position.y = .55; torso.add(head);
  head.add(ol(sph(.37, o.skin, 0, .3, 0, lite ? 14 : 24), .03));
  const hair = M(new THREE.SphereGeometry(.395, lite ? 14 : 24, lite ? 8 : 14, 0, Math.PI * 2, 0, Math.PI * .5), o.hair, 0, .32, -.02); hair.rotation.x = -.32; head.add(O(hair, .02));
  if (!lite) for (let i = -1; i <= 1; i++) head.add(sph(.11, o.hair, i * .14, .55, .26 - Math.abs(i) * .05, 12));
  if (o.bun) head.add(O(sph(.15, o.hair, 0, .72, -.14, lite ? 8 : 14), .02));
  if (o.twin && !lite) for (const s of [-1, 1]) head.add(ol(sph(.12, o.hair, s * .36, .42, -.1, 12), .02));
  let ahoge = null; if (o.ahoge) { ahoge = new THREE.Group(); ahoge.position.set(.02, .66, .04); head.add(ahoge); const a = M(coneG(.05, .26, 6), o.hair, 0, .12, 0); a.rotation.z = -.5; ahoge.add(a); }
  if (o.band) { const b = M(new THREE.TorusGeometry(.375, .04, 8, 30), o.band, 0, .42, 0); b.rotation.x = Math.PI / 2 - .22; head.add(b);
    const tails = new THREE.Group(); tails.position.set(.12, .48, -.36); head.add(tails); put(tails, rb(.06, .22, .04, o.band, .03, -.1, -.02, .02)).rotation.z = .4; put(tails, rb(.06, .2, .04, o.band, -.04, -.1, -.03, .02)).rotation.z = -.25; o._tails = tails; }
  if (o.hat) { head.add(O(cyl(.48, .48, .04, o.hat, 0, .6, 0, lite ? 14 : 28), .02)); head.add(O(M(new THREE.SphereGeometry(.3, lite ? 10 : 20, lite ? 6 : 10, 0, Math.PI * 2, 0, Math.PI / 2), o.hat, 0, .6, 0), .02)); if (!lite) head.add(cyl(.305, .305, .06, o.hatBand || '#ff7fa0', 0, .64, 0, 24)); }
  if (o.helm) { head.add(O(M(new THREE.SphereGeometry(.42, 14, 8, 0, Math.PI * 2, 0, Math.PI * .55), o.helm, 0, .34, 0), .02)); }
  if (o.non) { head.add(O(cone(.62, .34, '#f1d79a', 0, .78, 0, 14), .02)); }
  const eyes = [];
  for (const sx of [-.13, .13]) { const e = new THREE.Group(); e.position.set(sx, .29, .33); head.add(e); const pupil = M(sphG(.055, lite ? 8 : 12), '#2b2233', 0, 0, 0); pupil.scale.set(1, 1.3, .55); e.add(pupil); if (!lite) e.add(sph(.02, '#ffffff', .018, .03, .03, 8)); eyes.push(e); }
  if (o.glasses && !lite) for (const sx of [-.13, .13]) head.add(M(new THREE.TorusGeometry(.085, .012, 6, 18), INK, sx, .29, .36));
  const mouth = M(new THREE.TorusGeometry(.05, .014, 6, 12, Math.PI), '#7a2a2a', 0, .15, .35); mouth.rotation.z = Math.PI; head.add(mouth);
  if (!lite) for (const sx of [-.22, .22]) { const bl = M(sphG(.05, 10), '#ff9fb4', sx, .19, .29); bl.scale.set(1, .6, .3); head.add(bl); }
  if (o.bag) { const bag = O(rb(.3, .38, .2, o.bag, .3, -.08, -.12, .07), .02); torso.add(bag); }
  if (o.suitcase) { const sc = new THREE.Group(); sc.position.set(.42, 0, -.05); root.add(sc); sc.add(O(rb(.34, .5, .2, o.suitcase, 0, .3, 0, .06), .02)); sc.add(cyl(.015, .015, .32, INK, 0, .7, 0, 6)); sc.add(rb(.14, .03, .03, INK, 0, .86, 0, .01)); o._sc = sc; }
  if (parent) parent.add(root);
  root.traverse(m => { if (m.isMesh && lite) m.castShadow = false; });
  return { root, hips, legL, legR, armL, armR, torso, head, eyes, mouth, ahoge, tails: o._tails, suitcase: o._sc, ph: 0, speed: 0, target: null, path: [], face: 0, wave: 0, idle: Math.random() * 9, blink: 2 + Math.random() * 3, joy: 0, sad: 0, hop: 0, bow: 0 };
}
let T = 0;
export function tickClock(dt) { T += dt; return T; }
export function pose(c, dt) {
  c.ph += dt * (c.speed > .1 ? 10 : 0);
  const mv = Math.min(1, c.speed / 1.6), s = Math.sin(c.ph), bob = Math.abs(Math.cos(c.ph));
  c.legL.rotation.x = s * .75 * mv; c.legR.rotation.x = -s * .75 * mv;
  c.armL.rotation.x = -s * .7 * mv; c.armR.rotation.x = s * .7 * mv;
  c.idle += dt;
  let y = .4 + bob * .07 * mv; const sq = 1 - (1 - bob) * .06 * mv;
  c.torso.scale.set(1 + (1 - sq) * .8, sq, 1 + (1 - sq) * .8);
  c.torso.rotation.x = .1 * mv; c.torso.rotation.z = Math.sin(c.ph) * .05 * mv;
  const br = Math.sin(c.idle * 2.4) * .018 * (1 - mv); c.torso.scale.y *= 1 - br; c.torso.scale.x *= 1 + br;
  c.head.rotation.y = (1 - mv) * Math.sin(c.idle * .7) * .22; c.head.rotation.z = (1 - mv) * Math.sin(c.idle * .9) * .06;
  if (c.joy > 0) { c.joy = Math.max(0, c.joy - dt); const k = Math.min(1, c.joy * 3); y += Math.abs(Math.sin(c.joy * 9)) * .22 * k; c.armL.rotation.z = -2.4 * k; c.armR.rotation.z = 2.4 * k; c.mouth.scale.set(1.3, 1.4, 1); }
  else if (c.wave > 0) { c.wave = Math.max(0, c.wave - dt); const k = Math.min(1, c.wave * 3, (1.6 - c.wave) * 3); c.armR.rotation.z = 2.5 * k; c.armR.rotation.x = Math.sin(c.idle * 14) * .35 * k; c.armL.rotation.z = 0; c.mouth.scale.set(1.1, 1.1, 1); }
  else { c.armL.rotation.z = 0; c.armR.rotation.z = 0; c.mouth.scale.set(1, 1, 1); }
  if (c.sad > 0) { c.sad = Math.max(0, c.sad - dt); c.head.rotation.x = .35 * Math.min(1, c.sad * 3); c.mouth.rotation.z = 0; } else { c.head.rotation.x = 0; c.mouth.rotation.z = Math.PI; }
  c.hips.position.y = y;
  c.blink -= dt; const closed = c.blink < .12 && c.blink > 0; if (c.blink <= 0) c.blink = 2.2 + Math.random() * 3.5;
  c.eyes.forEach(e => e.scale.y = closed ? .12 : 1);
  if (c.ahoge) c.ahoge.rotation.z = Math.sin(c.idle * 6 + c.ph) * .25 * (.4 + mv);
  if (c.tails) c.tails.rotation.x = -.3 - mv * .5 + Math.sin(c.idle * 8) * .15 * mv;
  // tư thế thêm: ngồi, cúi chào, thao tác
  if (c.sit) { c.hips.position.y = .26; c.legL.rotation.x = c.legR.rotation.x = -1.35; c.torso.rotation.x = -.05; }
  if (c.bow > 0) { c.torso.rotation.x = .55 * Math.min(1, c.bow); c.head.rotation.x = .2 * Math.min(1, c.bow); }
  if (c.act === 'play') { c.armL.rotation.x = -1.1 + Math.sin(T * 14) * .15; c.armR.rotation.x = -1.1 + Math.cos(T * 13) * .15; c.head.rotation.x = .12; }
  else if (c.act === 'push') { c.armL.rotation.x = -1.25; c.armR.rotation.x = -1.25; c.torso.rotation.x = .25; }
  else if (c.act === 'stretch') { const k = Math.sin(Math.min(1, Math.max(0, (c.actD - c.actT) / 1.2)) * Math.PI); c.armL.rotation.z = -2.6 * k; c.armR.rotation.z = 2.6 * k; }
  else if (c.act === 'look') c.head.rotation.y = Math.sin(T * 1.6) * .35;
  else if (c.act === 'phone') { c.armR.rotation.x = -2.2; c.armR.rotation.z = .5; c.head.rotation.x = .15; }
}
export function walk(c, dt, spd = 2.2, dust = true) {
  if (!c.target && c.path.length) c.target = c.path.shift();
  if (!c.target) { c.speed += (0 - c.speed) * Math.min(1, dt * 10); return true; }
  const p = c.root.position, dx = c.target.x - p.x, dz = c.target.z - p.z, d = Math.hypot(dx, dz);
  if (d < (c.path.length ? .3 : .05)) { c.target = null; return !c.path.length; }
  c.speed += (spd - c.speed) * Math.min(1, dt * 6);
  const want = Math.atan2(dx, dz); let df = want - c.face; df = Math.atan2(Math.sin(df), Math.cos(df)); c.face += df * Math.min(1, dt * 9); c.root.rotation.y = c.face;
  const st = Math.min(d, c.speed * dt * Math.max(.35, Math.cos(df))); p.x += Math.sin(c.face) * st; p.z += Math.cos(c.face) * st;
  if (dust && Math.random() < dt * 6) puff(p.x, p.y + .05, p.z, .25);
  return false;
}
export const faceTo = (c, ang, dt) => { let df = ang - c.face; df = Math.atan2(Math.sin(df), Math.cos(df)); c.face += df * Math.min(1, dt * 8); c.root.rotation.y = c.face; };
export function disposeTree(o) { o.traverse(m => { if (m.material && m.material.map && m.material.map.userData && m.material.map.userData.own) m.material.map.dispose(); }); }

/* ---------- gộp khối tĩnh: mọi lưới cùng vật liệu → 1 lưới (ít lệnh vẽ, nhẹ máy) ---------- */
const VC_MAT = new THREE.MeshToonMaterial({ color: '#ffffff', vertexColors: true, gradientMap: grad });
export function bake(src, dst, o = {}) {
  src.updateMatrixWorld(true);
  const buckets = new Map();
  // o.vc: mọi vật liệu tô màu trơn (không ảnh, không phát sáng, không trong suốt) gộp thành 1 lưới tô màu theo đỉnh → 1 lệnh vẽ
  const VCM = o.vcMat || VC_MAT;
  const plain = m => o.vc && m.isMeshToonMaterial && !m.map && !m.vertexColors && (o.vcMat ? m.opacity === 1 : !m.transparent) && m.side === THREE.FrontSide && m.emissive.r + m.emissive.g + m.emissive.b === 0;
  src.traverse(m => { if (!m.isMesh || m.isInstancedMesh) return; let v = true; for (let p = m; p; p = p.parent) if (!p.visible) { v = false; break; } if (!v) return; const key = plain(m.material) ? VCM : m.material; if (!buckets.has(key)) buckets.set(key, []); buckets.get(key).push(m); });
  const out = [];
  for (const [mat, list] of buckets) {
    const useUv = !!mat.map, useCol = !!mat.vertexColors, tint = mat === VCM;
    const parts = list.map(m => { let g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone(); g.applyMatrix4(m.matrixWorld); if (tint) g.userData.tint = m.material.color; return g; });
    let n = 0; parts.forEach(g => { n += g.attributes.position.count; });
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = useUv ? new Float32Array(n * 2) : null, col = useCol ? new Float32Array(n * 3) : null;
    let k = 0;
    for (const g of parts) { const c = g.attributes.position.count; if (tint) { const t = g.userData.tint; for (let i = 0; i < c; i++) { col[(k + i) * 3] = t.r; col[(k + i) * 3 + 1] = t.g; col[(k + i) * 3 + 2] = t.b; } } pos.set(g.attributes.position.array, k * 3); if (g.attributes.normal) nor.set(g.attributes.normal.array, k * 3); if (uv && g.attributes.uv) uv.set(g.attributes.uv.array, k * 2); if (col && !tint && g.attributes.color) col.set(g.attributes.color.array, k * 3); k += c; g.dispose(); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    if (uv) geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); if (col) geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.computeBoundingSphere();
    const mesh = new THREE.Mesh(geo, mat); const isOl = mat.side === THREE.BackSide && mat.isMeshBasicMaterial;
    mesh.castShadow = !isOl && o.cast !== false; mesh.receiveShadow = !isOl; mesh.matrixAutoUpdate = false; dst.add(mesh); out.push(mesh);
  }
  return out;
}
