/* =====================================================================
   TOÀ SUỐI NÓNG & QUÁN GAME · 温泉电玩城 wēnquán diànwánchéng (v8.4 · 22/11/2026)
   Cuối bãi biển Bãi Cháy, sát chân cầu: bể suối nước nóng có chòi mái đỏ, hơi nước bốc lên, 2 vị khách đang ngâm,
   cạnh đó là quán game mái tím, biển đèn neon "电玩城" (diànwánchéng · khu trò chơi) đổi màu, đèn lồng đỏ.
   Chạm vào toà (khoá 'spa') → game mở Khu trò chơi (arcade.html): 消消乐, Ngâm chill, Đánh Boss, Thanh điệu 10 giây.
   Quảng Ninh có suối khoáng nóng Quang Hanh (Cẩm Phả) nên khu này hợp chuyện địa phương.
   ===================================================================== */
import * as THREE from 'three';
import { REDUCED, V3, toon, M, rb, cyl, sph, cone, ol, rbox, canvasTex, signTex, stripeTex, TX, ZH, bake, planeG } from './w-kit.js';

export const SPA = { x: 54, z: 24 };

/** biển neon chữ Hán (nền trong suốt, chữ phát sáng) */
function neonTex(zh, sub) {
  return canvasTex(768, 220, g => {
    g.clearRect(0, 0, 768, 220);
    g.fillStyle = 'rgba(30,12,60,.82)'; g.beginPath(); g.roundRect(8, 8, 752, 204, 40); g.fill();
    g.lineWidth = 10; g.strokeStyle = '#ff6fb0'; g.shadowColor = '#ff6fb0'; g.shadowBlur = 26; g.stroke();
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `900 112px ${ZH}`; g.fillStyle = '#fff4fb'; g.shadowColor = '#3df2ff'; g.shadowBlur = 34; g.fillText(zh, 384, 92);
    g.shadowBlur = 0; g.font = '800 27px system-ui,sans-serif'; g.fillStyle = '#ffe97a'; g.fillText(sub, 384, 178, 720);
  });
}
/** ô cửa sổ quán game: bóng máy chơi game */
function cabinetTex() {
  return canvasTex(256, 160, g => {
    const gr = g.createLinearGradient(0, 0, 0, 160); gr.addColorStop(0, '#3df2ff'); gr.addColorStop(1, '#ff6fb0'); g.fillStyle = gr; g.fillRect(0, 0, 256, 160);
    g.fillStyle = 'rgba(20,10,50,.85)'; for (let i = 0; i < 3; i++) { const x = 20 + i * 80; g.fillRect(x, 40, 56, 120); g.fillStyle = '#ffe97a'; g.fillRect(x + 8, 52, 40, 30); g.fillStyle = 'rgba(20,10,50,.85)'; }
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(0, 0, 256, 14);
  });
}

export function buildSpa(C) {
  const X = SPA.x, Z = SPA.z;
  const root = new THREE.Group(), st = new THREE.Group(), live = new THREE.Group();
  /* --- sàn gỗ + lối vào từ phố --- */
  st.add(rb(17.5, .22, 8.2, '#e3c79c', X - .4, .11, Z + .1, .06));
  for (let i = 0; i < 12; i++) st.add(rb(.08, .02, 8.1, '#c9a576', X - 8.9 + i * 1.5, .23, Z + .1, .01));
  st.add(rb(3, .16, 1.4, '#e3c79c', X + 4.5, .08, Z - 4.4, .04));
  /* --- quán game (phía cầu) --- */
  const AX = X + 4.4, AZ = Z - .7, AW = 6.6, AH = 5.8, AD = 5.6;
  st.add(ol(rb(AW, AH, AD, '#5a37a8', AX, AH / 2 + .2, AZ, .3), .08));
  st.add(rb(AW + .5, .45, AD + .5, '#ffd91f', AX, AH + .4, AZ, .12));
  st.add(rb(AW - 1.4, .9, AD - 1.4, '#7b56c8', AX, AH + 1.05, AZ, .2));
  st.add(rb(1.9, 2.6, .14, '#2a1a52', AX - 1.6, 1.5, AZ + AD / 2 + .02, .05));   // cửa
  /* --- bể suối nước nóng + chòi (phía biển) --- */
  const PX = X - 3.9, PZ = Z + .5;
  st.add(ol(cyl(3.25, 3.4, .5, '#a3abb5', PX, .3, PZ, 22), .06));
  const R = (s => () => (s = (s * 9301 + 49297) % 233280) / 233280)(7);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + R() * .2, r = 3.3 + R() * .2, s = .45 + R() * .35; const m = M(new THREE.DodecahedronGeometry(s, 0), i % 3 ? '#8d95a0' : '#7a828c', PX + Math.cos(a) * r, .45 + s * .4, PZ + Math.sin(a) * r); m.rotation.set(R() * 3, R() * 3, R() * 3); st.add(m); }
  for (const [dx, dz] of [[-2.4, -2.4], [2.4, -2.4], [-2.4, 2.4], [2.4, 2.4]]) st.add(cyl(.13, .15, 3.4, '#8b3b2b', PX + dx, 1.9, PZ + dz, 8));
  { const roof = M(new THREE.ConeGeometry(4.1, 1.7, 4), '#d9443a', PX, 4.4, PZ); roof.rotation.y = Math.PI / 4; ol(roof, .06); st.add(roof); }
  st.add(sph(.28, '#ffd91f', PX, 5.4, PZ, 10));
  /* gộp các khối tô màu trơn thành vài lệnh vẽ */
  bake(st, root, { vc: true });

  /* --- phần sống: nước, hơi nước, neon, đèn lồng, khách ngâm --- */
  const waterMat = new THREE.MeshToonMaterial({ color: '#7fe3e6', emissive: '#2ab8c4', emissiveIntensity: .25, transparent: true, opacity: .92 });
  const water = new THREE.Mesh(new THREE.CylinderGeometry(2.9, 2.9, .06, 24), waterMat); water.position.set(PX, .58, PZ); live.add(water);
  const heads = [];
  for (const [dx, dz, c] of [[-.9, .4, '#f6d2b0'], [.8, -.5, '#e9b98f']]) {
    const h = sph(.36, c, PX + dx, .72, PZ + dz, 12); const towel = rb(.42, .14, .32, '#ffffff', 0, .36, 0, .05); h.add(towel); live.add(h); heads.push(h);
  }
  const neon = new THREE.Mesh(planeG(6.6, 1.9), new THREE.MeshBasicMaterial({ map: neonTex('温泉电玩城', 'wēnquán diànwánchéng · Suối nóng & quán game'), transparent: true, toneMapped: false }));
  neon.position.set(AX, AH + 2.7, AZ + 1.4); neon.rotation.y = Math.PI / 4; live.add(neon);
  const glowMat = new THREE.SpriteMaterial({ map: TX.puff, color: '#ff6fb0', transparent: true, opacity: .45, depthWrite: false, blending: THREE.AdditiveBlending });
  const glow = new THREE.Sprite(glowMat); glow.scale.set(9, 3.2, 1); glow.position.set(AX, AH + 2.7, AZ + 1.2); live.add(glow);
  const winMat = new THREE.MeshBasicMaterial({ map: cabinetTex(), toneMapped: false });
  for (const dx of [.5, 2.2]) { const w = new THREE.Mesh(planeG(1.5, 1.9), winMat); w.position.set(AX + dx, 2.1, AZ + AD / 2 + .03); live.add(w); }
  for (const dz of [-1.6, .4, 2]) { const w = new THREE.Mesh(planeG(1.4, 1.7), winMat); w.position.set(AX + AW / 2 + .03, 3.6, AZ + dz); w.rotation.y = Math.PI / 2; live.add(w); }
  const aw = new THREE.Mesh(planeG(AW - .3, 1.3), new THREE.MeshToonMaterial({ map: stripeTex('#ff6fb0', '#ffffff', 7), side: THREE.DoubleSide }));
  aw.position.set(AX, 3.15, AZ + AD / 2 + .55); aw.rotation.x = -1.0; live.add(aw);
  const stripMat = new THREE.MeshBasicMaterial({ color: '#3df2ff', toneMapped: false });
  for (const [w, d, x, z] of [[AW + .55, .12, AX, AZ + AD / 2 + .27], [.12, AD + .55, AX + AW / 2 + .27, AZ]]) { const m = new THREE.Mesh(rbox(w, .12, d, .03), stripMat); m.position.set(x, AH + .64, z); live.add(m); }
  { const sg = new THREE.Mesh(planeG(1.3, 3.4), new THREE.MeshBasicMaterial({ map: canvasTex(128, 336, g => {
      g.fillStyle = '#c8102e'; g.beginPath(); g.roundRect(4, 4, 120, 328, 16); g.fill(); g.strokeStyle = '#FFE9A8'; g.lineWidth = 6; g.stroke();
      g.fillStyle = '#FFE9A8'; g.textAlign = 'center'; g.font = `900 86px ${ZH}`; g.fillText('温', 64, 110); g.fillText('泉', 64, 210); g.font = '800 22px system-ui,sans-serif'; g.fillText('wēnquán', 64, 290); }) }));
    sg.position.set(PX + 2.6, 2.5, PZ + 2.75); live.add(sg); }
  const lanterns = [];
  for (const [x, y, z] of [[AX - 2.7, 3.7, AZ + AD / 2 + 1], [AX + 1.2, 3.7, AZ + AD / 2 + 1], [PX - 2.4, 3.2, PZ + 2.4], [PX + 2.4, 3.2, PZ + 2.4]]) {
    const l = new THREE.Group(); l.position.set(x, y, z);
    const b = sph(.32, '#e8343a', 0, -.45, 0, 10, { emissive: '#ff5a3a', emissiveIntensity: .35 }); b.scale.y = 1.25; l.add(b);
    l.add(cyl(.01, .01, .45, '#3a2c3f', 0, -.12, 0, 4)); live.add(l); lanterns.push(l);
  }
  const steam = [];
  for (let i = 0; i < (REDUCED ? 0 : 12); i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.puff, color: '#ffffff', transparent: true, opacity: 0, depthWrite: false }));
    s.userData = { t: i / 12 * 3.2, ox: (Math.random() - .5) * 4, oz: (Math.random() - .5) * 4 }; live.add(s); steam.push(s);
  }
  root.add(live);
  C.tapBox(X - 8.8, 0, Z - 5.2, X + 8.2, 9, Z + 4.4, 'spa');

  let hue = 0;
  function update(dt, t, dark) {
    if (!root.visible) return;
    hue = (hue + dt * .12) % 1;
    stripMat.color.setHSL(hue, .95, .6);
    glowMat.color.setHSL((hue + .45) % 1, .9, .6); glowMat.opacity = .3 + dark * .45 + Math.sin(t * 3) * .06;
    winMat.color.setHSL(0, 0, .82 + dark * .18 + Math.sin(t * 7) * .04);
    water.scale.set(1 + Math.sin(t * 1.3) * .012, 1, 1 + Math.cos(t * 1.1) * .012); waterMat.emissiveIntensity = .2 + dark * .5;
    heads.forEach((h, i) => { h.position.y = .72 + Math.sin(t * 1.4 + i * 2) * .05; h.rotation.y = Math.sin(t * .4 + i) * .5; });
    lanterns.forEach((l, i) => { l.rotation.z = Math.sin(t * 1.6 + i) * .12; });
    for (const s of steam) {
      const u = s.userData; u.t += dt; const k = (u.t % 3.2) / 3.2;
      if (u.t % 3.2 < dt * 1.5) { u.ox = (Math.random() - .5) * 4; u.oz = (Math.random() - .5) * 4; }
      s.position.set(PX + u.ox + Math.sin(t + u.oz) * .3 * k, .7 + k * 3.4, PZ + u.oz);
      const sc = 1.2 + k * 2.6; s.scale.set(sc, sc, 1); s.material.opacity = Math.sin(k * Math.PI) * (.6 + dark * .25);
    }
  }
  return { root, update };
}
