/* =====================================================================
   SỨC SỐNG THÀNH PHỐ (v8) · cầu Bãi Cháy nối đường phố · dãy phố thứ hai · chợ đêm ·
   quán xá có người ăn uống · bãi biển · khu vui chơi · Hòn Gai: bảo tàng, quảng trường, chợ
   Người dân ở đây là bản "mini": thân + đầu gộp 1 khối tô màu theo đỉnh, chỉ tay/chân cần cử động mới tách
   → mỗi người 3–6 lệnh vẽ. Mỗi khu chỉ cập nhật và vẽ khi máy quay đang nhìn gần đó.
   ===================================================================== */
import * as THREE from 'three';
import { V3, clamp, lerp, rng, ZH, UI, INK, toon, OUTL, grad, rbox, cylG, sphG, coneG, planeG, put, M, rb, cyl, sph, cone, ol,
  canvasTex, signTex, stripeTex, TX, sprite, puff, walk, faceTo, bake } from './w-kit.js';

/* ---------- đường: cao độ mặt đường theo x (cầu Bãi Cháy vồng lên giữa) ---------- */
export const BR = { a: 58, b: 76, c: 128, d: 146, h: 6.5, z: 14.2 };
export function roadY(x) { if (x <= BR.a || x >= BR.d) return 0; if (x < BR.b) return (x - BR.a) / (BR.b - BR.a) * BR.h; if (x <= BR.c) return BR.h; return (BR.d - x) / (BR.d - BR.c) * BR.h; }
export const roadSlope = x => x > BR.a && x < BR.b ? BR.h / (BR.b - BR.a) : x > BR.c && x < BR.d ? -BR.h / (BR.d - BR.c) : 0;
export const LANE = { east: 15.65, west: 12.75, walkN: 10.75, walkBridge: 11.17 };
export const ROUTE = { x0: -66, x1: 258 };

/* ---------- người dân mini ---------- */
const vcMat = new THREE.MeshToonMaterial({ color: '#ffffff', vertexColors: true, gradientMap: grad });
const G = {
  torso: new THREE.CapsuleGeometry(.2, .14, 2, 8), leg: new THREE.CapsuleGeometry(.085, .14, 1, 5), arm: new THREE.CapsuleGeometry(.065, .14, 1, 5),
  head: new THREE.SphereGeometry(.37, 11, 8), hair: new THREE.SphereGeometry(.395, 11, 5, 0, Math.PI * 2, 0, Math.PI * .5), eye: new THREE.SphereGeometry(.055, 5, 4),
  hand: new THREE.SphereGeometry(.07, 5, 4), shoe: new THREE.BoxGeometry(.17, .1, .25), hatB: new THREE.CylinderGeometry(.48, .48, .04, 14), hatT: new THREE.SphereGeometry(.3, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2),
  non: new THREE.ConeGeometry(.62, .34, 14), bun: new THREE.SphereGeometry(.15, 8, 6), helm: new THREE.SphereGeometry(.42, 12, 8, 0, Math.PI * 2, 0, Math.PI * .55), bag: new THREE.BoxGeometry(.3, .38, .2)
};
const _q = new THREE.Quaternion(), _e = new THREE.Euler();
function P(list, geo, col, x, y, z, rx = 0, s = null, o = false) { _e.set(rx, 0, 0); _q.setFromEuler(_e); list.push({ geo, col, m: new THREE.Matrix4().compose(new V3(x, y, z), _q.clone(), s ? new V3(s[0], s[1], s[2]) : new V3(1, 1, 1)), o }); }
function merged(list, outline) {
  const src = outline ? list.filter(p => p.o) : list; if (!src.length) return null;
  const parts = src.map(p => { const g = p.geo.index ? p.geo.toNonIndexed() : p.geo.clone(); if (outline) { g.computeBoundingSphere(); const k = 1 + .03 / Math.max(.06, g.boundingSphere.radius); g.scale(k, k, k); } g.applyMatrix4(p.m); return { g, c: new THREE.Color(p.col) }; });
  let n = 0; parts.forEach(p => { n += p.g.attributes.position.count; });
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = outline ? null : new Float32Array(n * 3); let k = 0;
  for (const { g, c } of parts) { const cnt = g.attributes.position.count; pos.set(g.attributes.position.array, k * 3); nor.set(g.attributes.normal.array, k * 3); if (col) for (let i = 0; i < cnt; i++) { col[(k + i) * 3] = c.r; col[(k + i) * 3 + 1] = c.g; col[(k + i) * 3 + 2] = c.b; } k += cnt; g.dispose(); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); if (col) geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeBoundingSphere(); return geo;
}
const pk = a => a[(Math.random() * a.length) | 0];
/** gộp cả một nhóm khối (xe, đồ vật) thành 1 lưới tô màu theo đỉnh + 1 lưới viền → 2 lệnh vẽ; dùng chung theo key */
const VCACHE = new Map(), _inv = new THREE.Matrix4();
function mergeGeo(parts, color) {
  let n = 0; const gs = parts.map(p => { const g = p.geo.index ? p.geo.toNonIndexed() : p.geo.clone(); g.applyMatrix4(p.m); n += g.attributes.position.count; return { g, c: p.c }; });
  if (!n) return null;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = color ? new Float32Array(n * 3) : null; let k = 0;
  for (const { g, c } of gs) { const cnt = g.attributes.position.count; pos.set(g.attributes.position.array, k * 3); nor.set(g.attributes.normal.array, k * 3); if (col) for (let i = 0; i < cnt; i++) { col[(k + i) * 3] = c.r; col[(k + i) * 3 + 1] = c.g; col[(k + i) * 3 + 2] = c.b; } k += cnt; g.dispose(); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); if (col) geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeBoundingSphere(); return geo;
}
export function vcMerge(src, key) {
  let r = key && VCACHE.get(key);
  if (!r) {
    src.updateMatrixWorld(true); _inv.copy(src.matrixWorld).invert(); const body = [], line = [];
    src.traverse(m => { if (!m.isMesh) return; const mm = new THREE.Matrix4().multiplyMatrices(_inv, m.matrixWorld); (m.userData.outline ? line : body).push({ geo: m.geometry, m: mm, c: m.material.color ? m.material.color.clone() : new THREE.Color('#fff') }); });
    r = { b: mergeGeo(body, true), o: mergeGeo(line, false) }; if (key) VCACHE.set(key, r);
  }
  const g = new THREE.Group(); g.add(new THREE.Mesh(r.b, vcMat)); if (r.o) g.add(new THREE.Mesh(r.o, OUTL)); return g;
}
/* 18 kiểu người dựng sẵn → khối gộp dùng chung (ít bộ nhớ, máy yếu vẫn nhẹ) */
const LOOKS = (() => { const r = rng(17), a = l => l[(r() * l.length) | 0], out = [];
  for (let i = 0; i < 18; i++) out.push({ skin: a(['#f1c9a5', '#e7bb92', '#d29b72', '#f6d8c0', '#ffe0c7']), hair: a(['#1b1b1b', '#3b2a1f', '#5a3d22', '#2b2233']),
    shirt: ['#e63946', '#2a9d8f', '#e9c46a', '#8e7dbe', '#f4a261', '#3a86ff', '#ff6b9a', '#06d6a0', '#ffffff', '#ffb4a2', '#7fd6c2', '#1E5AA8', '#FFD91F', '#c9a0ff', '#ff9f7a', '#b8e0a0', '#e8343a', '#9fc5ff'][i],
    pants: a(['#2b2d42', '#3d405b', '#1d3557', '#495057', '#6d597a', '#e9edc9']), bun: i % 5 === 1, non: i % 9 === 4, hat: i % 7 === 3 ? a(['#fff3c4', '#7fd6c2', '#ffffff']) : null }); return out; })();
export const LOOK = () => LOOKS[(Math.random() * LOOKS.length) | 0];
const GCACHE = new Map();
const cached = (key, mk) => GCACHE.get(key) || (GCACHE.set(key, mk()), GCACHE.get(key));
/** o: màu · f: { legs, armL, armR (tách để cử động), sit, scale } */
export function mini(o, parent, f = {}) {
  const root = new THREE.Group(), hips = new THREE.Group(); root.add(hips); hips.position.y = f.sit ? .26 : .4;
  const b = [];
  P(b, G.torso, o.shirt, 0, .22, 0, 0, null, true); P(b, G.head, o.skin, 0, .85, 0, 0, null, true); P(b, G.hair, o.hair, 0, .87, -.02, -.32);
  for (const sx of [-.13, .13]) P(b, G.eye, '#2b2233', sx, .84, .33, 0, [1, 1.3, .55]);
  if (o.hat) { P(b, G.hatB, o.hat, 0, 1.15, 0); P(b, G.hatT, o.hat, 0, 1.15, 0); }
  if (o.non) P(b, G.non, '#f1d79a', 0, 1.33, 0);
  if (o.helm) P(b, G.helm, o.helm, 0, .89, 0);
  if (o.bun) P(b, G.bun, o.hair, 0, 1.27, -.14);
  if (o.bag) P(b, G.bag, o.bag, .3, -.08, -.12);
  const armAt = (sx, list) => { P(list, G.arm, o.shirt, sx, .24, 0); P(list, G.hand, o.skin, sx, .09, 0); };
  if (!f.armL) armAt(-.27, b); if (!f.armR) armAt(.27, b);
  const legAt = (sx, list, ox = 0) => { if (f.sit) { P(list, G.leg, o.pants, sx + ox, -.037, .166, -1.35); P(list, G.shoe, '#3a2c3f', sx + ox, -.037, .35, -1.35); } else { P(list, G.leg, o.pants, sx + ox, -.17, 0); P(list, G.shoe, '#3a2c3f', sx + ox, -.35, .04); } };
  if (!f.legs) { legAt(-.11, b); legAt(.11, b); }
  const key = JSON.stringify(o) + '|' + ['legs', 'armL', 'armR', 'sit'].map(k => f[k] ? 1 : 0).join('');
  const body = new THREE.Mesh(cached('b' + key, () => merged(b)), vcMat); hips.add(body);
  const olm = new THREE.Mesh(cached('o' + key, () => merged(b, true)), OUTL); hips.add(olm);
  const head = new THREE.Object3D(); head.position.y = .75; hips.add(head);
  const c = { root, hips, body, head, armL: null, armR: null, legL: null, legR: null, act: f.act || null, sit: !!f.sit, ph: Math.random() * 9, speed: 0, face: 0, path: [], target: null, react: 0 };
  const limb = (sx, y, k, mk) => { const g = new THREE.Group(); g.position.set(sx, y, 0); g.add(new THREE.Mesh(cached(k, () => { const l = []; mk(l); return merged(l); }), vcMat)); hips.add(g); return g; };
  const arm = l => { P(l, G.arm, o.shirt, 0, -.12, 0); P(l, G.hand, o.skin, 0, -.27, 0); }, leg = l => { P(l, G.leg, o.pants, 0, -.17, 0); P(l, G.shoe, '#3a2c3f', 0, -.35, .04); };
  if (f.armL) c.armL = limb(-.27, .36, 'a' + o.shirt + o.skin, arm);
  if (f.armR) c.armR = limb(.27, .36, 'a' + o.shirt + o.skin, arm);
  if (f.legs) { c.legL = limb(-.11, 0, 'l' + o.pants, leg); c.legR = limb(.11, 0, 'l' + o.pants, leg); }
  if (f.scale) root.scale.setScalar(f.scale);
  root.traverse(m => { if (m.isMesh) { m.castShadow = false; m.receiveShadow = false; } });
  if (parent) parent.add(root);
  return c;
}
export function lifePose(c, dt, T) {
  const t = T + c.ph, mv = Math.min(1, (c.speed || 0) / 1.6);
  let y = c.sit ? .26 : .4, rl = 0, rr = 0, zl = 0, zr = 0;
  if (c.legL) { const s = Math.sin(t * 10) * .75 * mv; c.legL.rotation.x = s; c.legR.rotation.x = -s; }
  if (mv > .05) { y += Math.abs(Math.cos(t * 10)) * .06 * mv; rl = -Math.sin(t * 10) * .6 * mv; rr = -rl; }
  if (c.react > 0) c.react -= dt;
  const A = c.react > 0 ? (c.sit || c.bob ? 'cheer' : 'wave') : c.act;
  if (A === 'eat') rr = -1.5 - .4 * (.5 + .5 * Math.sin(t * 4.2));
  else if (A === 'drink') rr = -.6 - 1.4 * Math.max(0, Math.sin(t * .9));
  else if (A === 'talk' || A === 'sell') { rr = -.5 + .35 * Math.sin(t * 3); zr = .2; c.hips.rotation.y = Math.sin(t * .7) * .25; }
  else if (A === 'dance') { const b = Math.sin(t * 4); zl = -1.3 - .9 * b; zr = 1.3 + .9 * b; y += Math.abs(Math.sin(t * 8)) * .07; c.hips.rotation.y = Math.sin(t * 2) * .45; }
  else if (A === 'cheer') { zl = -2.5; zr = 2.5; y += Math.abs(Math.sin(t * 6)) * .05; }
  else if (A === 'phone') { rr = -2.2; zr = .5; }
  else if (A === 'swim') { rl = -2.6 + Math.sin(t * 3) * .8; rr = -2.6 - Math.sin(t * 3) * .8; }
  else if (A === 'wave') { zr = 2.4; rr = Math.sin(t * 12) * .3; }
  else if (A === 'clap') { zl = -.5; zr = .5; rl = rr = -1.25 + Math.abs(Math.sin(t * 8)) * .25; }
  else if (A === 'hit') { const k = Math.max(0, Math.sin(t * 2.2)); zl = -2.3 * k; zr = 2.3 * k; y += k * .15; }
  else if (A === 'kite') { rr = -2.4; rl = -2.0; zr = .3 + Math.sin(t) * .1; }
  if (c.armL) { c.armL.rotation.x = rl; c.armL.rotation.z = zl; }
  if (c.armR) { c.armR.rotation.x = rr; c.armR.rotation.z = zr; }
  c.hips.position.y = y + (c.bob ? Math.sin(t * 1.6) * c.bob : 0);
}

/* ---------- dựng tĩnh (gộp khối) ---------- */
function rod(g, a, b, r, c, seg = 6, mat) { const d = b.clone().sub(a), L = d.length(); const m = mat ? M(cylG(r, r, L, seg), mat) : cyl(r, r, L, c, 0, 0, 0, seg); m.position.copy(a).addScaledVector(d, .5); m.quaternion.setFromUnitVectors(new V3(0, 1, 0), d.normalize()); g.add(m); return m; }
function tree(g, x, z, s = 1, y = 0) { g.add(cyl(.12 * s, .16 * s, 1.1 * s, '#9b6a43', x, y + .55 * s, z, 6)); g.add(ol(sph(.75 * s, pk(['#5fb36a', '#6fc27a', '#4fa35e']), x, y + 1.5 * s, z, 8), .05 * s)); g.add(sph(.5 * s, '#86d18a', x + .25 * s, y + 2.0 * s, z + .2 * s, 7)); }
function sign(g, zh, sub, x, y, z, w, o) { const m = new THREE.Mesh(planeG(w, w * .31), new THREE.MeshBasicMaterial({ map: signTex(zh, sub, o || { bg: '#fffaf0', fg: '#16171B', edge: '#16171B', sub: '#1E5AA8' }) })); m.position.set(x, y, z); g.add(m); return m; }
/** nhà phố mặt quay ra +z: [x0,x1] · z0..z1 (z1 = mặt tiền) */
function house(g, C, s, z0, z1) {
  const w = s.x1 - s.x0, cx = (s.x0 + s.x1) / 2, d = z1 - z0, cz = (z0 + z1) / 2;
  g.add(ol(rb(w, s.h, d, s.c, cx, s.h / 2, cz, .25), .08)); g.add(rb(w + .3, .4, d + .3, '#fffaf0', cx, s.h + .2, cz, .1));
  g.add(rb(w - .8, 2.3, .12, INK, cx, 1.35, z1 + .02, .04)); g.add(M(rbox(w - 1, 2.1, .08, .03), C.glassMat, cx, 1.35, z1 + .07));
  const aw = new THREE.Mesh(planeG(w - .4, 1.4), new THREE.MeshToonMaterial({ map: stripeTex(s.aw[0], s.aw[1], Math.round(w)), gradientMap: grad, side: THREE.DoubleSide })); aw.position.set(cx, 2.85, z1 + .6); aw.rotation.x = -1.0; g.add(aw);
  sign(g, s.zh, s.sub, cx, 3.95, z1 + .03, w * .8);
  for (let k = 0; k < 3; k++) { const y = 5.0 + k * 2.2; if (y > s.h - .8) break; const n = Math.max(2, Math.floor(w / 2.4));
    for (let i = 0; i < n; i++) { const x = s.x0 + (i + .5) * w / n; g.add(M(rbox(1.3, 1.2, .1, .04), (i + k) % 3 ? C.winA : C.winB, x, y, z1 + .02)); g.add(rb(1.5, .12, .5, '#fffaf0', x, y - .66, z1 + .2, .04)); if ((i + k) % 2) g.add(rb(1.4, .5, .05, s.c, x, y - .38, z1 + .43, .02)); } }
  C.tapBox(s.x0, 0, z0, s.x1, s.h, z1 + 1.2, s.key);
}
function table(g, x, z, top = '#ffffff', y = .78) { g.add(ol(cyl(.55, .55, .08, top, x, y, z, 14), .02)); g.add(cyl(.06, .06, y, INK, x, y / 2, z, 6)); }
function stool(g, x, z, c = '#e8593c') { g.add(cyl(.22, .22, .08, c, x, .46, z, 10)); g.add(cyl(.04, .04, .44, INK, x, .22, z, 5)); }
function parasol(g, x, z, c) { g.add(cyl(.04, .04, 2.2, '#ffffff', x, 1.1, z, 6)); g.add(ol(cone(1.2, .5, c, x, 2.35, z, 10), .03)); }

/* ---------- đường cong tàu lượn ---------- */
const COAST = { cx: -33, cz: -43, rx: 11, rz: 6.5 };
const coastAt = t => { const a = t * Math.PI * 2; return new V3(COAST.cx + Math.cos(a) * COAST.rx, 1.6 + 3.2 * (.5 + .5 * Math.sin(a * 2 + .6)) + 2.2 * Math.max(0, Math.sin(a)), COAST.cz + Math.sin(a) * COAST.rz); };

export function buildLife(C) {
  // C: { world, tapBox, taps, lamp(g,x,z,y), winA, winB, glassMat, nightMats, owned(id), hour(), say }
  const st = new THREE.Group();   // khối tĩnh: world sẽ gộp
  const zones = [];
  const zone = (cx, cz, r, o = {}) => { const g = new THREE.Group(); C.world.add(g); const z = Object.assign({ g, cx, cz, r, npcs: [], walkers: [], tick: null, maxS: 42 }, o); zones.push(z); return z; };
  const glows = [];
  const bulb = (parent, x, y, z, s, col) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, color: col || 0xffe6a0 })); sp.position.set(x, y, z); sp.scale.setScalar(s); parent.add(sp); glows.push(sp); return sp; };
  const lantern = (g, x, y, z, parent) => { g.add(ol(sph(.22, '#e8343a', x, y, z, 10, { emissive: '#e8343a', emissiveIntensity: .35 }), .03)); bulb(parent || dynG, x, y, z + .1, 1.4, '#ff8a6a'); };
  const dynG = new THREE.Group(); C.world.add(dynG);

  /* ===== CẦU BÃI CHÁY: mặt cầu nằm đúng trên tim đường, có làn xe, lối đi bộ, đèn ===== */
  {
    const z = BR.z, zN = 10.9, zS = 17.5, W = zS - zN, roadC = '#5d6372', walkC = '#e8e2d2';
    const cableMat = new THREE.MeshToonMaterial({ color: '#f7f7f7', gradientMap: grad, emissive: '#bfe6ff', emissiveIntensity: 0 }); C.nightMats.push([cableMat, .7]);
    const seg = (x0, x1, y0, y1) => { const L = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(y1 - y0, x1 - x0), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      const add = (h, d, c, zz, dy) => { const m = rb(L, h, d, c, cx, cy + dy - h / 2, zz, .04); m.rotation.z = a; st.add(m); return m; };
      add(.8, W, roadC, z, 0); add(.14, .55, walkC, zN + .27, .14); add(.14, .55, walkC, zS - .27, .14);
      for (const zz of [zN + .05, zS - .05]) { add(.08, .08, '#ffffff', zz, 1.05); add(.06, .06, '#ffffff', zz, .7); }
      add(.03, .14, '#FFD91F', z - .5, .02); add(.03, .14, '#FFD91F', z + .5, .02); };
    seg(BR.a, BR.b, 0, BR.h); seg(BR.b, BR.c, BR.h, BR.h); seg(BR.c, BR.d, BR.h, 0);
    for (let x = BR.a + 2; x < BR.d - 1; x += 2.2) { const y = roadY(x); for (const zz of [zN + .05, zS - .05]) st.add(cyl(.04, .04, 1.05, '#ffffff', x, y + .52, zz, 4)); }
    for (const xp of [92, 112]) {
      st.add(ol(rb(.8, 24, 1.1, '#ffffff', xp, BR.h + 12, z, .2), .06)); st.add(rb(1.4, BR.h + 3, 2.2, '#dfe5ee', xp, (BR.h + 3) / 2 - 3, z, .2)); st.add(rb(5, 2, 5, '#cfd8e3', xp, -1.4, z, .3));
      st.add(rb(1.2, .5, 1.4, '#FFD91F', xp, BR.h + 24.2, z, .1));
      for (let i = 1; i <= 8; i++) for (const s of [-1, 1]) rod(st, new V3(xp, BR.h + 15 + i * 1.05, z), new V3(xp + s * (2.2 + i * 2.2), BR.h + .5, z), .045, null, 4, cableMat);
    }
    for (const xp of [66, 71, 84, 100, 120, 136, 141]) { const y = roadY(xp); st.add(rb(1.4, y + 2.6, 3.2, '#dfe5ee', xp, (y + 2.6) / 2 - 3, z, .15)); }
    for (let x = BR.a + 4; x < BR.d - 2; x += 9) for (const zz of [zN - .1, zS + .1]) C.lamp(st, x, zz, roadY(x) + .12);
    C.tapBox(BR.a, 0, zN - .5, BR.d, 31, zS + .5, 'bridge');
  }

  /* ===== HÒN GAI: đường nối cầu, chợ, bảo tàng "hộp đen", quảng trường, phố ===== */
  {
    const slab = (x0, x1, z0, z1, top, c, h = .3) => st.add(rb(x1 - x0, h, z1 - z0, c, (x0 + x1) / 2, top - h / 2, (z0 + z1) / 2, .04));
    slab(146, 262, 11.45, 17, -.01, '#5d6372', .2); slab(146, 262, 8.4, 11.3, .06, '#efe3c8'); slab(146, 262, 11.2, 11.45, .12, '#cdbf9f'); slab(146, 262, 17, 19.4, .1, '#f5e9cf', .4); slab(146, 262, -16, 8.4, -.02, '#e6decb', .2);
    const lane = new THREE.Mesh(planeG(116, .16), new THREE.MeshBasicMaterial({ map: canvasTex(64, 8, c => { c.fillStyle = '#fff6d0'; c.fillRect(0, 0, 36, 8); }, [58, 1]), transparent: true })); lane.rotation.x = -Math.PI / 2; lane.position.set(204, .0, 14.2); st.add(lane);
    for (let x = 147; x <= 261; x += 2) st.add(cyl(.06, .06, .8, '#ffffff', x, .5, 19.3, 6)); st.add(rb(116, .1, .1, '#ffffff', 204, .92, 19.3, .03));
    for (const x of [150, 162, 174, 186, 198, 210, 222, 234, 246, 258]) { C.lamp(st, x, 11.0, 0); C.lamp(st, x - 6, 17.6, 0); }
    // chợ Hạ Long
    st.add(ol(rb(18, 5, 12, '#fff3c4', 158, 2.5, -3, .3), .1)); { const roof = M(new THREE.ConeGeometry(12, 4, 4), '#e8593c', 158, 7, -3); roof.rotation.y = Math.PI / 4; roof.scale.set(1.05, 1, .72); st.add(ol(roof, .1)); }
    sign(st, '下龙市场', 'Xiàlóng shìchǎng · Chợ Hạ Long', 158, 3.4, 3.06, 10, null);
    for (let i = 0; i < 4; i++) { st.add(rb(2.6, .9, 1.4, '#c98f5e', 151.5 + i * 4.3, .45, 5.2, .06)); for (let k = 0; k < 4; k++) st.add(sph(.2, pk(['#e8593c', '#ffb38a', '#7fd6c2', '#ffd166']), 150.7 + i * 4.3 + k * .5, 1.0, 5.2, 6)); parasol(st, 151.5 + i * 4.3, 6.3, i % 2 ? '#1E5AA8' : '#e8593c'); }
    C.tapBox(149, 0, -9, 167, 9, 7, 'seafood');
    // phố trước
    const HG = [{ x0: 169, x1: 176, h: 7, c: '#ffe08a', key: 'mart', zh: '超市', sub: 'chāoshì · Siêu thị', aw: ['#ffffff', '#3a86ff'] }, { x0: 177, x1: 184, h: 9, c: '#9fc5ff', key: 'hotel', zh: '酒店', sub: 'jiǔdiàn · Khách sạn', aw: ['#ffffff', '#1E5AA8'] }, { x0: 185, x1: 190.5, h: 6, c: '#ffb38a', key: 'cafe', zh: '咖啡', sub: 'kāfēi · Cà phê', aw: ['#ffffff', '#e8593c'] }, { x0: 252, x1: 261, h: 8, c: '#b8e0a0', key: 'seafood', zh: '饭店', sub: 'fàndiàn · Quán ăn', aw: ['#ffd166', '#e8593c'] }];
    HG.forEach(s => house(st, C, s, 0.5, 7.9));
    // bảo tàng Quảng Ninh: khối đen bóng như gương
    const mus = new THREE.MeshToonMaterial({ color: '#1d2230', gradientMap: grad, emissive: '#3a4a6a', emissiveIntensity: 0 }); C.nightMats.push([mus, .25]);
    const museumTex = canvasTex(256, 128, g2 => { g2.fillStyle = '#1d2230'; g2.fillRect(0, 0, 256, 128); g2.strokeStyle = 'rgba(160,190,230,.35)'; g2.lineWidth = 2; for (let i = 0; i < 9; i++) { g2.beginPath(); g2.moveTo(i * 32, 0); g2.lineTo(i * 32 - 40, 128); g2.stroke(); } g2.fillStyle = 'rgba(160,200,255,.12)'; g2.fillRect(0, 0, 256, 50); });
    st.add(ol(M(rbox(18, 12, 14, .2), mus, 201, 6, -4), .1));
    for (const [w, x, z, ry] of [[17.6, 201, 3.05, 0], [13.6, 210.05, -4, Math.PI / 2]]) { const p = new THREE.Mesh(planeG(w, 11.6), new THREE.MeshToonMaterial({ map: museumTex, gradientMap: grad })); p.position.set(x, 6, z); p.rotation.y = ry; st.add(p); }
    st.add(M(rbox(6, 3, .1, .03), C.glassMat, 201, 1.5, 3.12)); st.add(rb(8, .3, 3, '#e8e2d2', 201, .15, 5, .05));
    for (let i = 0; i < 4; i++) st.add(rb(8 - i * .6, .18, .6, '#e8e2d2', 201, .09 + i * .0, 6.6 + i * .6, .02));
    sign(st, '博物馆', 'bówùguǎn · Bảo tàng Quảng Ninh', 201, 3.8, 3.14, 7.5, { bg: '#16171B', fg: '#FFD91F', edge: '#FFD91F', sub: '#ffffff' });
    C.tapBox(192, 0, -11, 210, 12, 4, 'museum');
    // quảng trường: lát gạch hoa, đài phun nước, ghế đá, cây
    const sq = new THREE.Mesh(planeG(36, 22), new THREE.MeshToonMaterial({ map: canvasTex(128, 128, g2 => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g2.fillStyle = (x + y) % 2 ? '#f2e7cf' : '#e4d6b8'; g2.fillRect(x * 16, y * 16, 16, 16); } g2.strokeStyle = '#c9a66b'; g2.lineWidth = 3; g2.beginPath(); g2.arc(64, 64, 40, 0, 7); g2.stroke(); }, [3, 2]), gradientMap: grad }));
    sq.rotation.x = -Math.PI / 2; sq.position.set(232, .02, -3); st.add(sq);
    st.add(ol(cyl(3.6, 3.9, .6, '#e8eef5', 232, .3, -3, 24), .05)); st.add(cyl(3.3, 3.3, .05, '#7fd0ff', 232, .58, -3, 24, { emissive: '#4ab0e0', emissiveIntensity: .25 }));
    st.add(cyl(.3, .4, 2, '#e8eef5', 232, 1.4, -3, 10)); st.add(ol(cyl(1.4, .8, .3, '#e8eef5', 232, 2.4, -3, 16), .04)); st.add(cyl(1.2, 1.2, .04, '#7fd0ff', 232, 2.56, -3, 16, { emissive: '#4ab0e0', emissiveIntensity: .3 }));
    for (const [x, z] of [[217, -12], [247, -12], [217, 6], [247, 6], [224, -13], [240, -13]]) tree(st, x, z, 1.5);
    for (const x of [222, 242]) for (const z of [-9, 3]) { st.add(rb(2.0, .12, .55, '#c98f5e', x, .55, z, .04)); st.add(rb(2.0, .5, .1, '#c98f5e', x, .85, z - .25, .04)); }
    sign(st, '广场', 'guǎngchǎng · Quảng trường', 232, 1.2, 7.6, 4.6, null);
    C.tapBox(214, 0, -14, 250, 4, 8.2, 'square');
    // các dãy phố phía sau
    const hr = rng(9);
    for (let i = 0; i < 27; i++) { const x = 150 + (i % 9) * 13 + hr() * 3, z = -22 - Math.floor(i / 9) * 12 + hr() * 2, h = 4 + hr() * 13; const c = pk(['#ffe08a', '#9fc5ff', '#ffb38a', '#e5edf6', '#b8e0a0', '#ff9fb4']);
      st.add(ol(rb(8, h, 7, c, x, h / 2, z, .2), .08)); st.add(rb(8.3, .3, 7.3, '#fffaf0', x, h + .15, z, .08)); for (let k = 0; k < Math.floor(h / 3); k++) st.add(M(rbox(6, 1, .1, .03), k % 2 ? C.winA : C.winB, x, 2 + k * 3, z + 3.55)); }
  }

  /* ===== BÃI CHÁY: phố sau, dãy nhà thứ hai, chợ đêm, đường vào khu vui chơi ===== */
  {
    st.add(rb(128, .2, 4, '#6a7080', 0, -.11, -9.2, .02)); st.add(rb(128, .3, 1.4, '#efe3c8', 0, -.1, -11.9, .04));
    const lane = new THREE.Mesh(planeG(126, .12), new THREE.MeshBasicMaterial({ map: canvasTex(64, 8, c => { c.fillStyle = '#fff6d0'; c.fillRect(0, 0, 30, 8); }, [60, 1]), transparent: true })); lane.rotation.x = -Math.PI / 2; lane.position.set(0, .0, -9.2); st.add(lane);
    const ROW2 = [
      { x0: -62, x1: -55.5, h: 7, c: '#ffd6a5', key: 'rent', zh: '民宿', sub: 'mínsù · Nhà nghỉ', aw: ['#ffffff', '#e8593c'] },
      { x0: -54.5, x1: -48, h: 8.5, c: '#cde7ff', key: 'hotel', zh: '宾馆', sub: 'bīnguǎn · Khách sạn nhỏ', aw: ['#ffffff', '#1E5AA8'] },
      { x0: -47, x1: -41.5, h: 6, c: '#ffc8dd', key: 'cafe', zh: '咖啡', sub: 'kāfēi · Cà phê', aw: ['#ffffff', '#ff6b8f'] },
      { x0: -35, x1: -28.5, h: 9, c: '#d8f3dc', key: 'ktv', zh: '卡拉OK', sub: 'kǎlā OK · Karaoke', aw: ['#c9a0ff', '#ffffff'] },
      { x0: -27.5, x1: -21, h: 6.5, c: '#fde68a', key: 'noodle', zh: '面馆', sub: 'miànguǎn · Quán mì', aw: ['#e8593c', '#ffffff'] },
      { x0: -20, x1: -13.5, h: 7.5, c: '#e0c3fc', key: 'book', zh: '书店', sub: 'shūdiàn · Hiệu sách', aw: ['#ffffff', '#6d597a'] },
      { x0: -12.5, x1: -6, h: 6, c: '#bde0fe', key: 'tea2', zh: '茶馆', sub: 'cháguǎn · Quán trà', aw: ['#2a9d8f', '#ffffff'] },
      { x0: 6, x1: 12.5, h: 6.5, c: '#ffd6a5', key: 'bbq', zh: '烧烤', sub: 'shāokǎo · Đồ nướng', aw: ['#ffd166', '#e8593c'] },
      { x0: 13.5, x1: 20, h: 8, c: '#cdb4db', key: 'rent', zh: '公寓', sub: 'gōngyù · Căn hộ', aw: ['#ffffff', '#6d597a'] },
      { x0: 50, x1: 56.5, h: 6, c: '#ffafcc', key: 'icecream', zh: '甜品', sub: 'tiánpǐn · Đồ ngọt', aw: ['#ffffff', '#ff6b8f'] },
      { x0: 57.5, x1: 63.5, h: 7, c: '#caffbf', key: 'mart', zh: '药店', sub: 'yàodiàn · Hiệu thuốc', aw: ['#ffffff', '#2a9d8f'] }
    ];
    ROW2.forEach(s => house(st, C, s, -22, -12.6));
    for (const x of [-58, -44, -26, -10, 10, 54]) C.lamp(st, x, -11.6, 0);
    st.add(rb(6, .2, 10.6, '#e8dcc0', -38, -.08, -17.4, .04));
    // chợ đêm: sạp có mái sọc, biển chữ, đèn lồng giăng
    const STALLS = [['烤鱿鱼', 'kǎo yóuyú · Mực nướng', '#e8593c'], ['珍珠奶茶', 'zhēnzhū nǎichá · Trà sữa', '#c9a0ff'], ['海鲜', 'hǎixiān · Hải sản', '#1E5AA8'], ['水果', 'shuǐguǒ · Hoa quả', '#2a9d8f'], ['冰淇淋', 'bīngqílín · Kem', '#ff6b8f'], ['纪念品', 'jìniànpǐn · Quà lưu niệm', '#d4a72c']];
    STALLS.forEach(([zh, sub, col], i) => { const x = -46 + i * 4.6, z = -4.6;
      for (const [dx, dz] of [[-1.4, -.9], [1.4, -.9], [-1.4, .9], [1.4, .9]]) st.add(cyl(.05, .05, 2.4, '#3a2c3f', x + dx, 1.2, z + dz, 5));
      const roof = new THREE.Mesh(planeG(3.2, 2.4), new THREE.MeshToonMaterial({ map: stripeTex('#ffffff', col, 6), gradientMap: grad, side: THREE.DoubleSide })); roof.position.set(x, 2.5, z); roof.rotation.x = -1.35; st.add(roof);
      st.add(ol(rb(2.8, .9, .9, '#c98f5e', x, .45, z + .7, .06), .03)); for (let k = 0; k < 5; k++) st.add(sph(.16, pk(['#e8593c', '#ffd166', '#7fd6c2', '#ff9fb4', '#ffffff']), x - 1 + k * .5, 1.0, z + .7, 6));
      sign(st, zh, sub, x, 2.15, z + 1.25, 2.6, { bg: '#16171B', fg: '#FFD91F', edge: col, sub: '#ffffff', zs: 64, ss: 24 });
      lantern(st, x - 1.6, 2.6, z + 1.1); lantern(st, x + 1.6, 2.6, z + 1.1); });
    st.add(rb(.3, 3.6, .3, '#b8413a', -49.2, 1.8, -2.4, .05)); st.add(rb(.3, 3.6, .3, '#b8413a', -49.2, 1.8, -7.2, .05)); st.add(rb(.4, .5, 5.2, '#b8413a', -49.2, 3.7, -4.8, .05));
    { const s2 = sign(st, '夜市', 'yèshì · Chợ đêm', -49, 3.7, -4.8, 3.6, { bg: '#b8413a', fg: '#FFD91F', edge: '#FFD91F', sub: '#ffffff' }); s2.rotation.y = Math.PI / 2; s2.position.x = -48.95; }
    C.tapBox(-49, 0, -6, -20, 3, -2, 'market');
    // bàn ghế trước quán trên phố chính
    for (const x of [-17.6, -14]) { table(st, x, 9.75); stool(st, x - .85, 9.75, '#e8593c'); stool(st, x + .85, 9.75, '#e8593c'); parasol(st, x, 9.75, '#e8593c'); }
    for (const x of [-26.2, -22.6]) { table(st, x, 9.75, '#fffaf0'); stool(st, x - .85, 9.75, '#1E5AA8'); stool(st, x + .85, 9.75, '#1E5AA8'); st.add(ol(cyl(.28, .24, .22, '#3a2c3f', x, .93, 9.75, 10), .02)); }
    st.add(rb(1.6, 1.0, .5, '#ffffff', 31.5, .5, 9.6, .06)); st.add(rb(1.7, .06, .6, '#ff9fb4', 31.5, 1.03, 9.6, .02));
    for (const x of [-45.5, -43]) { table(st, x, -11.9); stool(st, x - .85, -11.9, '#ff6b8f'); stool(st, x + .85, -11.9, '#ff6b8f'); }
  }

  /* ===== KHU VUI CHƠI (sau dãy nhà thứ hai, phía tây) ===== */
  {
    st.add(rb(46, .2, 32, '#f1e3c8', -41, -.04, -40, .04));
    for (let x = -63.5; x <= -18.5; x += 1.5) { st.add(cyl(.05, .05, 1, '#ffffff', x, .5, -55.8, 4)); }
    for (let z = -55.5; z <= -24.5; z += 1.5) { st.add(cyl(.05, .05, 1, '#ffffff', -63.8, .5, z, 4)); st.add(cyl(.05, .05, 1, '#ffffff', -18.2, .5, z, 4)); }
    st.add(rb(45.6, .08, .08, '#ffffff', -41, 1, -55.8, .02)); st.add(rb(.08, .08, 31.4, '#ffffff', -63.8, 1, -40, .02)); st.add(rb(.08, .08, 31.4, '#ffffff', -18.2, 1, -40, .02));
    for (const x of [-63, -42]) st.add(rb(21, .08, .08, '#ffffff', x + 10.5 - (x === -42 ? -2.5 : 0), 1, -24.2, .02));
    for (const sx of [-3.2, 3.2]) st.add(ol(rb(.6, 4.6, .6, '#FFD91F', -38 + sx, 2.3, -24.2, .1), .04));
    st.add(ol(rb(7.4, 1.2, .6, '#e8343a', -38, 4.6, -24.2, .1), .04));
    sign(st, '游乐园', 'yóulèyuán · Khu vui chơi', -38, 4.6, -23.85, 6.4, { bg: '#e8343a', fg: '#FFD91F', edge: '#FFD91F', sub: '#ffffff' });
    st.add(ol(rb(2.4, 2.4, 2, '#7fd6c2', -33, 1.2, -26.8, .2), .04)); st.add(ol(cone(1.7, 1.2, '#e8343a', -33, 3, -26.8, 4), .04));
    for (const [x, z] of [[-62, -27], [-20, -27], [-62, -54], [-20, -54], [-42, -54], [-52, -26]]) tree(st, x, z, 1.3);
    // tàu lượn: đường ray đỏ + cột đỡ
    const N = 64; for (let i = 0; i < N; i++) { const a = coastAt(i / N), b = coastAt((i + 1) / N); rod(st, a, b, .14, '#e8343a', 5); const off = new V3(0, -.25, 0); rod(st, a.clone().add(off), b.clone().add(off), .07, '#ffffff', 4); if (i % 4 === 0) rod(st, new V3(a.x, 0, a.z), a, .1, '#cfd8e3', 5); }
    C.tapBox(COAST.cx - COAST.rx - 1, 0, COAST.cz - COAST.rz - 1, COAST.cx + COAST.rx + 1, 10, COAST.cz + COAST.rz + 1, 'coaster');
    // ngựa quay (phần đế), tháp rơi, đu quay dây (phần trụ)
    st.add(ol(cyl(3.6, 3.8, .4, '#ff9fb4', -52, .2, -32, 24), .04));
    st.add(ol(cyl(.7, .9, 22, '#e5edf6', -57, 11, -48, 10), .06)); st.add(rb(2, .6, 2, '#e8343a', -57, 22.3, -48, .2));
    st.add(ol(cyl(.35, .5, 7, '#e5edf6', -25, 3.5, -34, 10), .05)); st.add(cyl(2.2, 2.4, .4, '#7fd6c2', -25, .2, -34, 16));
    C.tapBox(-56, 0, -36, -48, 5, -28, 'carousel'); C.tapBox(-59, 0, -50, -55, 23, -46, 'park'); C.tapBox(-29, 0, -38, -21, 8, -30, 'park');
  }

  /* ===== BÃI BIỂN: lưới bóng chuyền ===== */
  { for (const x of [-10.8, -5.2]) st.add(cyl(.06, .06, 2.4, '#ffffff', x, 1.2, 23.4, 5)); const net = new THREE.Mesh(planeG(5.6, .9), new THREE.MeshBasicMaterial({ map: canvasTex(64, 16, g2 => { g2.strokeStyle = '#ffffff'; g2.lineWidth = 1.5; for (let i = 0; i <= 64; i += 6) { g2.beginPath(); g2.moveTo(i, 0); g2.lineTo(i, 16); g2.stroke(); } for (let j = 0; j <= 16; j += 5) { g2.beginPath(); g2.moveTo(0, j); g2.lineTo(64, j); g2.stroke(); } }), transparent: true, side: THREE.DoubleSide })); net.position.set(-8, 1.9, 23.4); st.add(net); C.tapBox(-11, 0, 21, -5, 2.5, 26, 'volleyball'); }

  /* ---------- KHU NGƯỜI SINH HOẠT (động) ---------- */
  const sitAt = (z, x, zz, face, act, f = {}) => { const c = mini(LOOK(), z.g, Object.assign({ sit: true, armR: true }, f)); c.root.position.set(x, 0, zz); c.root.rotation.y = face; c.act = act; z.npcs.push(c); return c; };
  const standAt = (z, x, zz, face, act, f = {}, look) => { const c = mini(look || LOOK(), z.g, Object.assign({ armR: true }, f)); c.root.position.set(x, f.y || 0, zz); c.root.rotation.y = face; c.act = act; z.npcs.push(c); return c; };
  const wander = (z, pts, spd = 1.3, look, f = {}) => { const c = mini(look || LOOK(), z.g, Object.assign({ legs: true, armL: true, armR: true }, f)); const p = pts[(Math.random() * pts.length) | 0]; c.root.position.set(p[0], 0, p[1]); c.wp = pts; c.spd = spd; c.wait = Math.random() * 3; z.walkers.push(c); z.npcs.push(c); return c; };
  const E = Math.PI / 2, Wd = -Math.PI / 2;
  // quán cà phê, hải sản, trà sữa trên phố chính
  { const z = zone(-20, 9.8, 8); for (const x of [-17.6, -14]) { sitAt(z, x - .85, 9.75, E, pk(['drink', 'talk'])); sitAt(z, x + .85, 9.75, Wd, pk(['drink', 'talk'])); } }
  { const z = zone(-24.4, 9.8, 6); for (const x of [-26.2, -22.6]) { sitAt(z, x - .85, 9.75, E, 'eat'); sitAt(z, x + .85, 9.75, Wd, 'eat'); }
    z.tick = (dt) => { if (Math.random() < dt * 3) for (const x of [-26.2, -22.6]) sprite(TX.puff, x + (Math.random() - .5) * .2, 1.15, 9.75, .3, 1.4, new V3(.05, .5, 0), { grow: 1.8 }); }; }
  { const z = zone(31.5, 9.6, 4); standAt(z, 30.7, 9.0, Math.PI * .1, 'drink'); standAt(z, 32.3, 9.1, -Math.PI * .1, 'talk'); }
  // trạm xe buýt: người ngồi chờ
  { const z = zone(26, 10.1, 4); sitAt(z, 25.4, 10.1, 0, 'phone'); sitAt(z, 26.6, 10.1, 0, null, { armR: false }); }
  // nhà hàng của khách sạn (mua 餐厅 mới có khách ăn)
  { const z = zone(-6, 9.9, 6, { cond: () => C.owned('restaurant') }); for (const x of [-8.6, -6, -3.4]) sitAt(z, x, 10.75, Math.PI, 'eat'); }
  // chợ đêm: người bán + người đi chợ
  { const z = zone(-35, -4, 16, { maxS: 40 }); for (let i = 0; i < 6; i++) standAt(z, -46 + i * 4.6, -5.5, 0, 'sell');
    const pts = []; for (let x = -47; x <= -22; x += 2.5) pts.push([x, -2.4 + Math.random() * .6]);
    for (let i = 0; i < 6; i++) wander(z, pts, 1.1);
    z.tick = (dt, T, dark) => { z.walkers.forEach((c, i) => { c.root.visible = i < 3 || dark > .3 || C.hour() > 15; }); }; }
  // quán cà phê phố sau
  { const z = zone(-44, -11.9, 4); for (const x of [-45.5, -43]) sitAt(z, x - .85, -11.9, E, 'talk'); }
  // bãi biển: người tắm, bóng chuyền, thả diều, xe kem
  { const z = zone(-2, 26, 18, { cond: () => { const h = C.hour(); return h > 6 && h < 18.5; } });
    for (const [x, zz] of [[-20, 31.5], [-14, 32.5], [4, 31], [12, 32.2], [22, 31.4]]) { const c = standAt(z, x, zz, Math.random() * 6, 'swim', { armL: true, y: -1.0 }); c.bob = .12; }
    const p1 = standAt(z, -8, 21.9, 0, 'hit', { armL: true }), p2 = standAt(z, -8, 24.9, Math.PI, 'hit', { armL: true }); p2.ph = p1.ph + Math.PI / 2.2;
    const ball = new THREE.Mesh(sphG(.22, 10), toon('#ffffff')); z.g.add(ball); ol(ball, .02);
    const kiter = standAt(z, 26, 22, Math.PI * .9, 'kite');
    const kite = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(64, 64, g2 => { g2.fillStyle = '#e8343a'; g2.beginPath(); g2.moveTo(32, 2); g2.lineTo(60, 30); g2.lineTo(32, 62); g2.lineTo(4, 30); g2.fill(); g2.fillStyle = '#FFD91F'; g2.beginPath(); g2.arc(32, 30, 9, 0, 7); g2.fill(); }), transparent: true })); kite.scale.setScalar(1.6); z.g.add(kite);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new V3(), new V3()]), new THREE.LineBasicMaterial({ color: '#ffffff' })); z.g.add(line);
    z.tick = (dt, T) => { const k = (Math.sin(T * 2.2) + 1) / 2; ball.position.set(-8, 1.8 + Math.sin(k * Math.PI) * 2.6, lerp(22.2, 24.6, k)); const kp = new V3(22 + Math.sin(T * .4) * 2, 11 + Math.sin(T * .9), 28 + Math.cos(T * .5)); kite.position.copy(kp); line.geometry.setFromPoints([new V3(26, 1.7, 22), kp]); };
    standAt(z, 8, 18.4, Math.PI, 'sell'); standAt(z, 8.9, 18.9, -Math.PI * .8, 'drink');
    st.add(ol(rb(1.4, .9, .8, '#ffffff', 8, .55, 17.7, .1), .03)); parasol(st, 8, 17.7, '#ff9fb4'); }
  // khu vui chơi: ngựa quay, tàu lượn, tháp rơi, đu quay dây, khách tham quan
  { const z = zone(-41, -40, 26, { maxS: 48 });
    const car = new THREE.Group(); car.position.set(-52, .4, -32); z.g.add(car);
    const carS = new THREE.Group();
    carS.add(cyl(.2, .2, 3.4, '#FFD91F', 0, 1.7, 0, 8)); carS.add(ol(cone(3.9, 1.4, '#e8343a', 0, 3.9, 0, 16), .05)); carS.add(cyl(3.9, 3.9, .3, '#ffffff', 0, 3.25, 0, 16));
    const horses = [];
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283, hg = new THREE.Group(); hg.position.set(Math.cos(a) * 2.6, 0, Math.sin(a) * 2.6); hg.rotation.y = -a; car.add(hg);
      carS.add(cyl(.04, .04, 3.1, '#d4a72c', Math.cos(a) * 2.6, 1.6, Math.sin(a) * 2.6, 5)); const h = new THREE.Group(); hg.add(h); const hc = ['#ffffff', '#ffd6a5', '#cde7ff', '#ffc8dd'][i % 4], hs = new THREE.Group(); hs.add(ol(rb(.3, .45, 1.0, hc, 0, 1.1, 0, .12), .02)); hs.add(rb(.24, .5, .28, '#ffffff', 0, 1.45, .45, .08)); hs.add(rb(.08, .3, .3, '#d4a72c', 0, 1.62, .3, .02)); h.add(vcMerge(hs, 'horse' + hc));
      if (i % 3 === 0) { const kid = mini(LOOK(), h, { sit: true, scale: .6 }); kid.root.position.set(0, .95, -.05); kid.root.rotation.y = 0; }
      horses.push({ h, ph: i }); bulb(car, Math.cos(a) * 3.8, 3.3, Math.sin(a) * 3.8, 1.1, '#fff1a0'); }
    bake(carS, car, { vc: true, cast: false });
    const train = []; for (let i = 0; i < 3; i++) { const g = new THREE.Group(); z.g.add(g); g.add(ol(rb(1.1, .5, .8, ['#FFD91F', '#1E5AA8', '#7fd6c2'][i], 0, .25, 0, .12), .02)); for (const dx of [-.25, .25]) { const r = mini(LOOK(), g, { sit: true, armL: true, armR: true, scale: .55 }); r.root.position.set(dx, .2, 0); r.root.rotation.y = Math.PI / 2; r.act = 'cheer'; z.npcs.push(r); } train.push(g); }
    let ct = 0;
    const ring = new THREE.Group(); ring.position.set(-57, 2, -48); z.g.add(ring); ring.add(ol(M(new THREE.TorusGeometry(1.5, .25, 6, 18), '#FFD91F'), .03)); ring.children[0].rotation.x = Math.PI / 2;
    for (let i = 0; i < 4; i++) { const a = i / 4 * 6.283, r = mini(LOOK(), ring, { sit: true, armL: true, armR: true, scale: .55 }); r.root.position.set(Math.cos(a) * 1.7, -.3, Math.sin(a) * 1.7); r.root.rotation.y = Math.atan2(Math.cos(a), Math.sin(a)); r.act = 'cheer'; z.npcs.push(r); }
    let dropT = 0;
    const sw = new THREE.Group(); sw.position.set(-25, 6.6, -34); z.g.add(sw); const swS = new THREE.Group(); swS.add(ol(cyl(2.4, 1.6, .5, '#e8343a', 0, .3, 0, 16), .04)); const seats = [];
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283, mk = () => { const g = new THREE.Group(); g.position.set(Math.cos(a) * 2.2, 0, Math.sin(a) * 2.2); g.rotation.set(0, -a, -.55, 'YXZ'); return g; };
      const armS = mk(); swS.add(armS); armS.add(cyl(.02, .02, 3, '#3a2c3f', 0, -1.5, 0, 4)); armS.add(rb(.4, .08, .4, '#FFD91F', 0, -3, 0, .03));
      if (i % 2) { const arm = mk(); sw.add(arm); const r = mini(LOOK(), arm, { sit: true, scale: .5 }); r.root.position.set(0, -3, 0); r.root.rotation.y = Math.PI / 2; }
      bulb(sw, Math.cos(a) * 2.4, .5, Math.sin(a) * 2.4, 1, '#ffe08a'); }
    bake(swS, sw, { vc: true, cast: false });
    const pts = [[-40, -27], [-36, -28], [-44, -30], [-30, -30], [-46, -38], [-40, -36], [-22, -40], [-30, -52], [-48, -50], [-60, -38], [-56, -28]];
    for (let i = 0; i < 5; i++) wander(z, pts, 1.2);
    standAt(z, -33, -25.6, 0, 'sell');
    z.tick = (dt, T) => {
      car.rotation.y += dt * .6; horses.forEach(o => { o.h.position.y = Math.sin(T * 2.4 + o.ph) * .25; });
      const sp = .045 + .05 * Math.max(0, Math.sin(ct * 6.283 * 2 - .9)); ct = (ct + dt * sp) % 1;
      train.forEach((g, i) => { const t = (ct - i * .018 + 1) % 1, p = coastAt(t), q = coastAt((t + .004) % 1); g.position.copy(p).y += .25; g.lookAt(q.x, q.y + .25, q.z); g.rotateY(-Math.PI / 2); });
      dropT += dt; const cyc = dropT % 9; ring.position.y = cyc < 5 ? 2 + cyc / 5 * 17 : cyc < 6.5 ? 19 : cyc < 7.2 ? 19 - (cyc - 6.5) / .7 * 17 : 2;
      sw.rotation.y += dt * 1.1;
    }; }
  // Hòn Gai: nhóm nhảy ở quảng trường, trẻ con chạy quanh đài phun, khách vào bảo tàng
  { const z = zone(228, -2, 18, { maxS: 44 });
    for (let i = 0; i < 8; i++) { const c = standAt(z, 224 + (i % 4) * 1.4, 2.4 + Math.floor(i / 4) * 1.5, Math.PI * .1, 'dance', { armL: true }); c.ph = 0; }
    standAt(z, 229, 5.4, Math.PI, 'clap', { armL: true });
    const kids = []; for (let i = 0; i < 3; i++) { const c = mini(LOOK(), z.g, { legs: true, armL: true, armR: true, scale: .7 }); c.k = i * 2.1; c.key = 'play'; kids.push(c); z.npcs.push(c); }
    const mpts = [[201, 6], [197, 8], [206, 8], [214, 6], [220, 0], [201, 4]]; for (let i = 0; i < 4; i++) wander(z, mpts, 1.2);
    z.tick = (dt, T) => { kids.forEach(c => { const a = T * .9 + c.k, x = 232 + Math.cos(a) * 5.4, zz = -3 + Math.sin(a) * 5.4; c.root.position.set(x, 0, zz); c.root.rotation.y = a + Math.PI; c.speed = 1.6; });
      if (Math.random() < dt * 12) { const a = Math.random() * 6.28; sprite(TX.dot, 232 + Math.cos(a) * .3, 2.9, -3 + Math.sin(a) * .3, .35, .9, new V3(Math.cos(a) * 1.2, 2.2, Math.sin(a) * 1.2), { grav: 4, add: true }); } }; }
  // Hòn Gai: chợ
  { const z = zone(158, 5.5, 10); for (let i = 0; i < 4; i++) standAt(z, 151.5 + i * 4.3, 4.3, 0, 'sell'); const pts = [[150, 7.2], [155, 7.4], [160, 7.2], [166, 7.4]]; for (let i = 0; i < 3; i++) wander(z, pts, 1); }

  /* ---------- cập nhật ---------- */
  let cull = 0; const fr = new THREE.Frustum(), pm = new THREE.Matrix4(), bsph = new THREE.Sphere();
  function update(dt, T, view, dark, cam) {
    cull -= dt;
    if (cull <= 0) { cull = .25; if (cam) fr.setFromProjectionMatrix(pm.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
      for (const z of zones) { let ok = (!z.cond || z.cond()) && view.S < z.maxS; if (ok) ok = cam ? fr.intersectsSphere(bsph.set(new V3(z.cx, 2, z.cz), z.r + 3)) : Math.hypot(view.at.x - z.cx, view.at.z - z.cz) < view.S * 2.3 + z.r; z.g.visible = ok; } }
    const lit = clamp((dark - .25) / .35, 0, 1);
    glows.forEach(g => { g.material.opacity = lit * .9; g.visible = lit > .02 && view.S < 60; });
    for (const z of zones) {
      if (!z.g.visible) continue;
      if (z.tick) z.tick(dt, T, dark);
      for (const c of z.walkers) {
        if (c.wait > 0) { c.wait -= dt; c.speed *= .8; }
        else { const idle = walk(c, dt, c.spd, false); if (idle) { c.wait = 1 + Math.random() * 4; const p = c.wp[(Math.random() * c.wp.length) | 0]; c.target = new V3(p[0], 0, p[1]); c.act = Math.random() < .3 ? pk(['phone', 'talk', null]) : null; } }
      }
      for (const c of z.npcs) lifePose(c, dt, T);
    }
  }
  const ACT_WORD = { eat: 'eat', drink: 'drink', talk: 'talk', sell: 'vendor', dance: 'dance', cheer: 'cheer', phone: 'phone', swim: 'swim', clap: 'clap', hit: 'volleyball', kite: 'kite' };
  /** chạm vào người dân: trả về người gần nhất + từ khoá cho thẻ từ */
  function pick(ray) {
    let best = null;
    for (const z of zones) { if (!z.g.visible) continue;
      for (const c of z.npcs) { const h = ray.intersectObject(c.root, true)[0]; if (h && (!best || h.distance < best.d)) best = { d: h.distance, c }; } }
    if (!best) return null;
    const c = best.c; c.react = 1.6;
    return { d: best.d, c, key: c.key || ACT_WORD[c.act] || 'walk' };
  }
  return { static: st, update, zones, pick };
}
