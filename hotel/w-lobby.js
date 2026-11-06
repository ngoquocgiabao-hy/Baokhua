/* =====================================================================
   SẢNH KHÁCH SẠN · nằm ngay trong toà nhà ở phố (cùng một cảnh 3D)
   Toạ độ phòng: x 0→10, z 0→8 (tường sau z=0, tường trái x=0, cửa ra phố ở góc x≈9.3 z=8.4).
   Chuyển từ inside.html (bản iframe cũ): không còn tải trang riêng → vào trong không giật.
   Sao khách sạn → sàn, tường, phào chỉ sảnh đẹp dần (đồng bộ với mặt tiền bên ngoài).
   ===================================================================== */
import * as THREE from 'three';
import { REDUCED, V3, clamp, toon, ownToon, grad, rbox, M, rb, cyl, sph, cone, coneG, put, ol, canvasTex, TX, sprite, puff, hearts, sparkles, confetti, coins3d, chibi, pose, walk, faceTo, ZH, UI, INK, setSeg } from './w-kit.js';

export const ROOM = { w: 10, d: 8 }, WALL_H = 3.2;
export const DESK_SPOT = new V3(7.4, 0, 1.0), GUEST_SPOT = new V3(7.4, 0, 2.6), DOOR_IN = new V3(9.25, 0, 7.7), DOOR_OUT = new V3(9.25, 0, 9.6), LIFT = new V3(.8, 0, 3.4);

export function buildLobby(hooks) {
  const old = setSeg(3);
  const room = new THREE.Group(); room.name = 'lobby';
  const say = (c, txt, s) => hooks.say && hooks.say(c, txt, s);

  /* ---------- sàn theo sao: gỗ (1–2★) · đá sáng (3★) · cẩm thạch viền vàng (4–5★) ---------- */
  const FLOORS = [
    canvasTex(256, 256, g => { for (let i = 0; i < 4; i++) { g.fillStyle = ['#f7e3c4', '#f2dbb8', '#f5e0bf', '#efd6b0'][i]; g.fillRect(0, i * 64, 256, 64);
      g.strokeStyle = 'rgba(176,128,78,.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, i * 64 + 1); g.lineTo(256, i * 64 + 1); g.stroke();
      const off = i % 2 ? 64 : 0; for (let x = off; x < 256; x += 128) { g.beginPath(); g.moveTo(x, i * 64); g.lineTo(x, i * 64 + 64); g.stroke(); }
      g.strokeStyle = 'rgba(176,128,78,.12)'; g.lineWidth = 2; for (let k = 0; k < 3; k++) { g.beginPath(); const y = i * 64 + 14 + k * 16; g.moveTo(0, y); g.bezierCurveTo(80, y + 6, 170, y - 6, 256, y + 2); g.stroke(); } } }, [ROOM.w / 3, ROOM.d / 3]),
    canvasTex(256, 256, g => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#f4efe6' : '#e3ddd2'; g.fillRect(x * 64, y * 64, 64, 64); }
      g.strokeStyle = 'rgba(140,120,100,.25)'; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 256); g.moveTo(0, i * 64); g.lineTo(256, i * 64); g.stroke(); } }, [ROOM.w / 2.5, ROOM.d / 2.5]),
    canvasTex(256, 256, g => { g.fillStyle = '#f7f3ec'; g.fillRect(0, 0, 256, 256); g.strokeStyle = 'rgba(160,150,140,.28)'; g.lineWidth = 1.5;
      for (let i = 0; i < 9; i++) { g.beginPath(); const y = i * 30 + 6; g.moveTo(0, y); g.bezierCurveTo(70, y + 18, 160, y - 14, 256, y + 8); g.stroke(); }
      g.strokeStyle = '#d4a72c'; g.lineWidth = 5; g.strokeRect(2.5, 2.5, 251, 251); g.fillStyle = '#d4a72c'; for (const [x, y] of [[0, 0], [256, 0], [0, 256], [256, 256]]) { g.beginPath(); g.arc(x, y, 14, 0, 7); g.fill(); } }, [ROOM.w / 2, ROOM.d / 2])
  ];
  const floorMat = new THREE.MeshToonMaterial({ map: FLOORS[0], gradientMap: grad });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.d), floorMat);
  floor.rotation.x = -Math.PI / 2; floor.position.set(ROOM.w / 2, 0, ROOM.d / 2); floor.receiveShadow = true; room.add(floor);
  room.add(rb(ROOM.w + .4, .34, ROOM.d + .4, '#c98f5e', ROOM.w / 2, -.18, ROOM.d / 2, .12));
  // tường sau + trái (vật liệu riêng để đổi màu theo sao)
  const wallA = ownToon('#fff2b0'), wallB = ownToon('#ffe98f'), wains = ownToon('#3f78c6'), trimM = ownToon('#2c66b0'), railM = ownToon('#fffaf0');
  room.add(M(rbox(ROOM.w, WALL_H, .24, .05), wallA, ROOM.w / 2, WALL_H / 2, -.12));
  room.add(M(rbox(.24, WALL_H, ROOM.d, .05), wallB, -.12, WALL_H / 2, ROOM.d / 2));
  room.add(M(rbox(ROOM.w, 1.0, .1, .03), wains, ROOM.w / 2, .5, .02)); room.add(M(rbox(.1, 1.0, ROOM.d, .03), wains, .02, .5, ROOM.d / 2));
  room.add(M(rbox(ROOM.w, .1, .16, .04), railM, ROOM.w / 2, 1.02, .06)); room.add(M(rbox(.16, .1, ROOM.d, .04), railM, .06, 1.02, ROOM.d / 2));
  room.add(M(rbox(ROOM.w, .16, .22, .06), trimM, ROOM.w / 2, WALL_H - .08, .05)); room.add(M(rbox(.22, .16, ROOM.d, .06), trimM, .05, WALL_H - .08, ROOM.d / 2));
  // phào chỉ vàng + đèn hắt trần (mở ở 4★)
  const lux = new THREE.Group(); room.add(lux); lux.visible = false;
  lux.add(rb(ROOM.w, .08, .14, '#d4a72c', ROOM.w / 2, WALL_H - .24, .1, .03)); lux.add(rb(.14, .08, ROOM.d, '#d4a72c', .1, WALL_H - .24, ROOM.d / 2, .03));
  lux.add(rb(ROOM.w, .06, .12, '#d4a72c', ROOM.w / 2, 1.1, .09, .02)); lux.add(rb(.12, .06, ROOM.d, '#d4a72c', .09, 1.1, ROOM.d / 2, .02));
  for (let i = 0; i < 5; i++) lux.add(rb(.16, 2.0, .1, '#fffaf0', .9 + i * 2.1, 2.1, .06, .04));

  // cửa sổ nhìn ra vịnh: vẽ lại liên tục (mây trôi, sóng, thuyền nhấp nhô)
  const bay = canvasTex(256, 160, () => {});
  function drawBay(t) {
    const g = bay.userData.canvas.getContext('2d'), w = 256, h = 160, sea = h * .58;
    let gr = g.createLinearGradient(0, 0, 0, sea); gr.addColorStop(0, '#8ed3f7'); gr.addColorStop(1, '#ffe9c9'); g.fillStyle = gr; g.fillRect(0, 0, w, sea);
    g.fillStyle = '#fff3b0'; g.beginPath(); g.arc(200, 34, 14, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.9)'; for (const [x0, y, s] of [[30, 26, 1], [150, 44, .8], [240, 18, .7]]) { const x = ((x0 + t * 6 * s) % (w + 80)) - 40; g.beginPath(); g.ellipse(x, y, 20 * s, 7 * s, 0, 0, 7); g.ellipse(x + 12 * s, y - 5 * s, 12 * s, 7 * s, 0, 0, 7); g.fill(); }
    const k = (x, bw, bh, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(x - bw / 2, sea + 1); g.bezierCurveTo(x - bw * .6, sea - bh * .7, x - bw * .3, sea - bh * 1.05, x, sea - bh); g.bezierCurveTo(x + bw * .35, sea - bh * 1.02, x + bw * .55, sea - bh * .6, x + bw / 2, sea + 1); g.fill(); };
    k(34, 50, 40, '#9cc3c0'); k(104, 40, 56, '#86b2b0'); k(168, 62, 36, '#9cc3c0'); k(226, 46, 62, '#79a6a4'); k(70, 34, 24, '#5f908e'); k(196, 30, 28, '#5f908e');
    gr = g.createLinearGradient(0, sea, 0, h); gr.addColorStop(0, '#53b9d6'); gr.addColorStop(1, '#2a88a8'); g.fillStyle = gr; g.fillRect(0, sea, w, h - sea);
    g.fillStyle = 'rgba(255,255,255,.65)'; for (let i = 0; i < 18; i++) { const y = sea + 6 + (i * 37 % 60), x = ((i * 53 + t * (8 + i % 4 * 3)) % (w + 30)) - 15; g.fillRect(x, y + Math.sin(t * 2 + i) * 1.5, 8 + i % 3 * 5, 2); }
    const bx = ((t * 7) % (w + 60)) - 30, by = sea + 22 + Math.sin(t * 2.2) * 2;
    g.fillStyle = '#9b5a34'; g.beginPath(); g.moveTo(bx - 16, by); g.lineTo(bx + 16, by); g.lineTo(bx + 11, by + 7); g.lineTo(bx - 11, by + 7); g.fill();
    g.fillStyle = '#e8593c'; g.beginPath(); g.moveTo(bx - 2, by); g.lineTo(bx - 2, by - 24); g.quadraticCurveTo(bx + 12, by - 14, bx + 10, by - 2); g.fill();
    bay.needsUpdate = true;
  }
  drawBay(0);
  const winMat = new THREE.MeshBasicMaterial({ map: bay });
  for (const x of [2.3, 4.55]) {
    put(room, new THREE.Mesh(new THREE.PlaneGeometry(1.86, 1.72), winMat)).position.set(x, 1.95, .02);
    const fr = new THREE.Group(); fr.position.set(x, 1.95, .05); room.add(fr);
    fr.add(rb(2.06, .14, .14, '#ffffff', 0, .93, 0, .05)); fr.add(rb(2.06, .16, .2, '#ffffff', 0, -.93, .02, .05)); fr.add(rb(.14, 2.0, .14, '#ffffff', -.98, 0, 0, .05)); fr.add(rb(.14, 2.0, .14, '#ffffff', .98, 0, 0, .05)); fr.add(rb(.07, 1.8, .08, '#ffffff', 0, 0, 0, .03));
    for (const s of [-1, 1]) { fr.add(rb(.34, 2.2, .12, '#2c66b0', s * 1.18, .05, .08, .06)); for (let i = 0; i < 3; i++) fr.add(rb(.06, 2.1, .14, '#1f4e8c', s * 1.18 + (i - 1) * .1, .05, .1, .03)); }
    put(fr, cyl(.035, .035, 2.9, '#c98f5e', 0, 1.1, .08, 8)).rotation.z = Math.PI / 2;
  }
  // tia nắng + bụi sáng
  const beamTex = canvasTex(64, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,240,190,.55)'); gr.addColorStop(1, 'rgba(255,240,190,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const beams = [];
  for (const x of [2.3, 4.55]) { const b = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 3.4), new THREE.MeshBasicMaterial({ map: beamTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .55, side: THREE.DoubleSide }));
    b.position.set(x + .5, 1.3, 1.25); b.rotation.set(-.75, .35, 0); room.add(b); beams.push(b); }
  const MOTE_N = 40, moteGeo = new THREE.BufferGeometry(), motePos = new Float32Array(MOTE_N * 3), moteSeed = [];
  for (let i = 0; i < MOTE_N; i++) moteSeed.push([1.6 + Math.random() * 4, .3 + Math.random() * 2.4, .4 + Math.random() * 2.6, Math.random() * 9]);
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
  const motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({ map: TX.dot, size: 4 * Math.min(2, devicePixelRatio || 1), sizeAttenuation: false, transparent: true, depthWrite: false, opacity: .8, color: '#fff3c4', blending: THREE.AdditiveBlending }));
  motes.frustumCulled = false; room.add(motes);
  // biển hiệu sau quầy
  const signT = canvasTex(512, 140, (g, w, h) => { g.fillStyle = '#1E5AA8'; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 34); g.fill(); g.strokeStyle = '#FFD91F'; g.lineWidth = 7; g.stroke();
    g.fillStyle = '#FFD91F'; g.textAlign = 'center'; g.font = 'bold 56px ' + ZH; g.fillText('阿宝海湾酒店', w / 2, 72); g.fillStyle = '#fff'; g.font = 'bold 22px ' + UI; g.fillText('Ā Bǎo hǎiwān jiǔdiàn · Khách sạn Vịnh Ā Bǎo', w / 2, 112); });
  put(room, new THREE.Mesh(new THREE.PlaneGeometry(3.3, .9), new THREE.MeshBasicMaterial({ map: signT, transparent: true }))).position.set(7.5, 2.55, .06);
  const keys = new THREE.Group(); keys.position.set(7.5, 1.72, .08); room.add(keys);
  keys.add(rb(1.5, .5, .06, '#c98f5e', 0, 0, 0, .04));
  for (let i = 0; i < 6; i++) { keys.add(sph(.025, '#d4a72c', -.6 + i * .24, .12, .05, 8)); keys.add(rb(.07, .14, .03, ['#ff7fa0', '#7fd6c2', '#FFD91F', '#8fb8ff', '#ffb38a', '#c9a0ff'][i], -.6 + i * .24, -.03, .06, .02)); }
  const clock = new THREE.Group(); clock.position.set(.07, 2.35, 1.65); clock.rotation.y = Math.PI / 2; room.add(clock);
  put(clock, ol(cyl(.32, .32, .08, '#ffffff', 0, 0, 0, 28))).rotation.x = Math.PI / 2;
  put(clock, cyl(.34, .34, .06, '#ff9f7a', 0, 0, -.03, 28)).rotation.x = Math.PI / 2;
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; clock.add(sph(.02, INK, Math.sin(a) * .25, Math.cos(a) * .25, .05, 6)); }
  const hHand = new THREE.Group(), mHand = new THREE.Group(); hHand.position.z = mHand.position.z = .06; clock.add(hHand, mHand);
  hHand.add(rb(.04, .15, .02, INK, 0, .07, 0, .01)); mHand.add(rb(.03, .22, .02, '#e8593c', 0, .1, .01, .01)); clock.add(sph(.03, INK, 0, 0, .07, 8));
  const lift = new THREE.Group(); lift.position.set(.06, 0, 3.4); room.add(lift);
  lift.add(rb(.14, 2.5, 1.9, '#f6c98e', 0, 1.25, 0, .05));
  const doorL = rb(.06, 2.2, .78, '#d9dee8', .08, 1.12, -.4, .03), doorR = rb(.06, 2.2, .78, '#d9dee8', .08, 1.12, .4, .03); lift.add(doorL, doorR);
  lift.add(rb(.06, .3, .6, INK, .08, 2.6, 0, .05)); const liftLamp = M(new THREE.CircleGeometry(.06, 12), new THREE.MeshBasicMaterial({ color: '#7fffb0' }), .12, 2.6, -.15); liftLamp.rotation.y = Math.PI / 2; lift.add(liftLamp);
  const artTex = canvasTex(256, 192, g => { g.fillStyle = '#ffe6c7'; g.fillRect(0, 0, 256, 192); g.fillStyle = '#ff9f7a'; g.beginPath(); g.arc(178, 62, 30, 0, 7); g.fill(); g.fillStyle = '#7fd6c2'; g.fillRect(0, 122, 256, 70); g.fillStyle = '#4f9d94'; g.beginPath(); g.moveTo(14, 126); g.quadraticCurveTo(58, 26, 104, 126); g.fill(); g.beginPath(); g.moveTo(92, 126); g.quadraticCurveTo(124, 64, 156, 126); g.fill(); });
  const art = new THREE.Group(); art.position.set(.08, 1.9, 5.7); art.rotation.y = Math.PI / 2; art.rotation.z = .03; room.add(art);
  art.add(rb(1.4, 1.05, .06, '#c98f5e', 0, 0, 0, .04)); put(art, new THREE.Mesh(new THREE.PlaneGeometry(1.2, .86), new THREE.MeshBasicMaterial({ map: artTex }))).position.z = .04;

  /* ---------- đồ đạc ---------- */
  const desk = new THREE.Group(); desk.position.set(7.4, 0, 1.75); room.add(desk);
  const deskBody = new THREE.Group(); desk.add(deskBody);
  deskBody.add(ol(rb(3.3, 1.0, .82, '#FFD91F', 0, .5, 0, .14)));
  deskBody.add(ol(rb(3.5, .12, 1.0, '#fff7e8', 0, 1.06, 0, .05)));
  deskBody.add(rb(3.0, .62, .04, '#1f4e8c', 0, .5, .42, .03));
  for (let i = 0; i < 5; i++) deskBody.add(rb(.05, .62, .05, '#ffe97a', -1.2 + i * .6, .5, .44, .02));
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .28), new THREE.MeshBasicMaterial({ map: canvasTex(256, 64, (g, w, h) => { g.fillStyle = '#FFD91F'; g.beginPath(); g.roundRect(2, 2, w - 4, h - 4, 18); g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); g.fillStyle = INK; g.textAlign = 'center'; g.font = 'bold 30px ' + ZH; g.fillText('前台 qiántái · Lễ tân', w / 2, 43); }), transparent: true }));
  plate.position.set(0, .66, .47); deskBody.add(plate);
  const bell = new THREE.Group(); bell.position.set(-.8, 1.12, .2); desk.add(bell);
  bell.add(cyl(.12, .14, .04, '#d4a72c', 0, .02, 0, 20)); bell.add(M(new THREE.SphereGeometry(.11, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), '#f2c94c', 0, .04, 0)); bell.add(sph(.025, '#d4a72c', 0, .16, 0, 8));
  const computer = new THREE.Group(); desk.add(computer);
  computer.add(ol(rb(.56, .36, .05, INK, .7, 1.38, -.22, .04))); computer.add(rb(.5, .3, .01, '#9fe3ff', .7, 1.38, -.19, .02, { emissive: '#4aa8c9', emissiveIntensity: .35 })); computer.add(cyl(.04, .07, .2, INK, .7, 1.2, -.24, 10));
  deskBody.add(rb(.4, .05, .3, '#e8593c', -.1, 1.14, .1, .02)); deskBody.add(rb(.38, .02, .28, '#fffaf0', -.1, 1.17, .1, .01));
  const deskPlant = new THREE.Group(); deskPlant.position.set(-1.35, 1.12, -.1); desk.add(deskPlant);
  deskPlant.add(cyl(.12, .09, .2, '#ffffff', 0, .1, 0, 14)); for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28; deskPlant.add(sph(.09, '#5fc27a', Math.cos(a) * .08, .3 + (i % 2) * .05, Math.sin(a) * .08, 10)); }
  const rugTex = canvasTex(256, 256, g => { g.fillStyle = '#3f78c6'; g.beginPath(); g.arc(128, 128, 126, 0, 7); g.fill(); g.strokeStyle = '#fff2c4'; g.lineWidth = 12; g.beginPath(); g.arc(128, 128, 104, 0, 7); g.stroke(); g.lineWidth = 5; g.beginPath(); g.arc(128, 128, 76, 0, 7); g.stroke(); g.fillStyle = '#fff2c4'; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; g.beginPath(); g.arc(128 + Math.cos(a) * 90, 128 + Math.sin(a) * 90, 6, 0, 7); g.fill(); } });
  const rug = new THREE.Mesh(new THREE.CircleGeometry(1.45, 40), new THREE.MeshToonMaterial({ map: rugTex, transparent: true, gradientMap: grad }));
  rug.rotation.x = -Math.PI / 2; rug.position.set(2.2, .012, 5.7); rug.receiveShadow = true; room.add(rug);
  const sofa = new THREE.Group(); sofa.position.set(.95, 0, 5.7); room.add(sofa);
  sofa.add(ol(rb(.95, .46, 2.3, '#2c66b0', 0, .27, 0, .16))); sofa.add(ol(rb(.36, .86, 2.3, '#1f4e8c', -.32, .55, 0, .16)));
  sofa.add(ol(rb(.95, .66, .3, '#1f4e8c', 0, .36, 1.18, .14))); sofa.add(ol(rb(.95, .66, .3, '#1f4e8c', 0, .36, -1.18, .14)));
  sofa.add(rb(.66, .18, .98, '#5e95e0', .08, .56, .5, .08)); sofa.add(rb(.66, .18, .98, '#5e95e0', .08, .56, -.5, .08));
  sofa.add(ol(rb(.16, .44, .44, '#FFD91F', -.08, .82, .5, .12))); sofa.add(ol(rb(.16, .44, .44, '#ff9fb4', -.08, .82, -.5, .12)));
  for (const z of [-1.0, 1.0]) for (const x of [-.35, .35]) sofa.add(cyl(.04, .03, .08, '#c98f5e', x, .04, z, 8));
  const table = new THREE.Group(); table.position.set(2.5, 0, 5.7); room.add(table);
  table.add(ol(cyl(.58, .58, .1, '#fff7e8', 0, .5, 0, 28))); table.add(cyl(.07, .12, .45, '#c98f5e', 0, .25, 0, 12)); table.add(cyl(.32, .32, .04, '#c98f5e', 0, .02, 0, 20));
  const teaset = new THREE.Group(); table.add(teaset);
  const pot = new THREE.Group(); pot.position.set(-.12, .55, -.05); teaset.add(pot);
  pot.add(sph(.13, '#ffffff', 0, .1, 0, 16)); put(pot, cyl(.02, .03, .14, '#ffffff', .15, .14, 0, 6)).rotation.z = -.9; pot.add(sph(.03, '#ff9f7a', 0, .23, 0, 8));
  const cups = [[.25, .15], [.18, -.25]].map(([x, z]) => { const c = cyl(.06, .045, .08, '#ffffff', x, .6, z, 14); teaset.add(c); return c; });
  const plants = [];
  function plant(x, z, s = 1, kind = 0) { const p = new THREE.Group(); p.position.set(x, 0, z); p.scale.setScalar(s);
    p.add(ol(cyl(.27, .2, .48, ['#ff9f7a', '#ffffff', '#8fb8ff'][kind % 3], 0, .24, 0, 16))); p.add(cyl(.28, .28, .06, '#c98f5e', 0, .47, 0, 16));
    const top = new THREE.Group(); top.position.y = .5; p.add(top);
    if (kind === 1) { for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28, r = .14 + (i % 3) * .05; top.add(ol(sph(.15 + (i % 2) * .04, i % 2 ? '#6fd08a' : '#4fb870', Math.cos(a) * r, .35 + (i % 3) * .14, Math.sin(a) * r, 12), .02)); } }
    else { for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28, l = M(new THREE.SphereGeometry(.2, 12, 8), i % 2 ? '#6fd08a' : '#4fb870'); l.scale.set(.5, 1.25, .25); l.position.set(Math.cos(a) * .17, .45, Math.sin(a) * .17); l.rotation.set(-Math.sin(a) * .7, 0, Math.cos(a) * .7); top.add(l); }
      put(top, M(new THREE.SphereGeometry(.17, 12, 8), '#5fc27a', 0, .6, 0)).scale.set(.5, 1.4, .3); }
    room.add(p); plants.push({ top, ph: Math.random() * 6 }); return p; }
  const plantGroups = [plant(9.45, .6, 1.05, 0), plant(.6, .6, 1.0, 1), plant(.62, 7.35, .9, 2), plant(9.5, 7.3, .85, 1)];
  const glows = [];
  function glow(parent, x, y, z, s) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .8 })); sp.position.set(x, y, z); sp.scale.setScalar(s); parent.add(sp); glows.push(sp); return sp; }
  const lamp = new THREE.Group(); lamp.position.set(.6, 0, 4.35); room.add(lamp);
  lamp.add(cyl(.2, .24, .06, INK, 0, .03, 0)); lamp.add(cyl(.03, .03, 1.65, INK, 0, .86, 0, 8)); lamp.add(ol(cyl(.2, .32, .36, '#fff3c4', 0, 1.8, 0, 18, { emissive: '#ffd27a', emissiveIntensity: .6 })));
  glow(lamp, 0, 1.75, 0, 1.6);
  for (const [x, z] of [[6.4, 2.7], [8.4, 2.7]]) { const pl = new THREE.Group(); pl.position.set(x, 0, z); room.add(pl);
    pl.add(cyl(.012, .012, .9, INK, 0, 3.15, 0, 6)); pl.add(ol(M(new THREE.ConeGeometry(.24, .26, 18, 1, true), '#FFD91F', 0, 2.62, 0, { side: THREE.DoubleSide }))); pl.add(sph(.08, '#fff8d8', 0, 2.51, 0, 10, { emissive: '#ffe08a', emissiveIntensity: .8 })); glow(pl, 0, 2.46, 0, 1.2); }
  const cart = new THREE.Group(); cart.position.set(7.4, 0, 7.0); cart.rotation.y = .5; room.add(cart);
  cart.add(ol(rb(1.05, .08, .62, '#d4a72c', 0, .2, 0, .03, { emissive: '#7a5a10', emissiveIntensity: .15 })));
  for (const sx of [-.47, .47]) cart.add(cyl(.032, .032, 1.5, '#d4a72c', sx, .95, 0, 10));
  { const bar = cyl(.032, .032, .98, '#d4a72c', 0, 1.7, 0, 10); bar.rotation.z = Math.PI / 2; cart.add(bar); }
  cart.add(ol(rb(.56, .62, .34, '#e8593c', -.18, .55, 0, .07))); cart.add(ol(rb(.42, .44, .3, '#8fb8ff', .25, .46, .04, .07))); cart.add(ol(rb(.36, .32, .26, '#FFD91F', .2, .99, 0, .07)));
  for (const [x, z] of [[-.42, -.26], [.42, -.26], [-.42, .26], [.42, .26]]) cart.add(sph(.07, INK, x, .08, z, 10));
  room.add(rb(1.5, .03, 1.0, '#1f4e8c', 9.2, .015, 7.35, .015)); room.add(rb(1.2, .035, .7, '#FFD91F', 9.2, .02, 7.35, .015));

  const UNLOCK = {}, fishes = [];
  function unlockable(n, build) { const g = new THREE.Group(); build(g); g.visible = false; room.add(g); UNLOCK[n] = g; }
  unlockable(1, g => { g.position.set(.38, 0, 1.75);
    g.add(ol(rb(.6, .6, 1.2, '#c98f5e', 0, .3, 0, .06)));
    const glass = new THREE.Mesh(rbox(.56, .62, 1.14, .05), new THREE.MeshPhysicalMaterial({ color: '#9fe3ff', transparent: true, opacity: .35, roughness: .05 })); glass.position.y = .92; g.add(glass);
    g.add(rb(.5, .1, 1.06, '#f7e3c4', 0, .66, 0, .03)); for (let i = 0; i < 4; i++) g.add(M(coneG(.04, .3, 5), '#4fb870', (i % 2 - .5) * .2, .82, -.4 + i * .26));
    for (let i = 0; i < 3; i++) { const f = new THREE.Group(); f.add(sph(.06, ['#ff9f43', '#ff6b8f', '#FFD91F'][i], 0, 0, 0, 10)); put(f, M(coneG(.04, .07, 4), ['#ff9f43', '#ff6b8f', '#FFD91F'][i], 0, 0, -.08)).rotation.x = -Math.PI / 2; g.add(f); fishes.push({ f, ph: i * 2.1, y: .82 + i * .1 }); }
  });
  unlockable(2, g => { g.position.set(2.4, 0, 5.6);
    g.add(cyl(.015, .015, .7, '#d4a72c', 0, 2.85, 0, 6)); g.add(ol(cyl(.42, .28, .14, '#f2c94c', 0, 2.48, 0, 20))); put(g, M(new THREE.TorusGeometry(.5, .03, 8, 28), '#d4a72c', 0, 2.41, 0)).rotation.x = Math.PI / 2;
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; g.add(sph(.06, '#fff8d8', Math.cos(a) * .5, 2.35, Math.sin(a) * .5, 10, { emissive: '#ffe08a', emissiveIntensity: .9 })); }
    glow(g, 0, 2.33, 0, 2.4);
  });
  unlockable(3, g => { g.position.set(1.0, 0, .28);
    g.add(ol(rb(1.3, 2.0, .42, '#c98f5e', 0, 1.0, 0, .06))); for (let s = 0; s < 3; s++) { g.add(rb(1.16, .05, .36, '#a8714a', 0, .45 + s * .55, .02, .02));
      for (let i = 0; i < 6; i++) g.add(rb(.12, .32 + (i % 3) * .05, .26, ['#ff7fa0', '#7fd6c2', '#FFD91F', '#8fb8ff', '#ffb38a', '#c9a0ff'][(i + s) % 6], -.42 + i * .17, .64 + s * .55 + (i % 3) * .025, .05, .02)); }
  });
  unlockable(4, g => { g.position.set(9.0, 0, 6.6);
    for (const dz of [-.7, .7]) { g.add(cyl(.012, .012, .7, INK, 0, 2.95, dz, 6)); const l = ol(sph(.26, '#e8343a', 0, 2.45, dz, 18)); l.scale.y = .85; g.add(l); g.add(cyl(.12, .12, .06, '#d4a72c', 0, 2.7, dz, 12)); g.add(cyl(.12, .12, .06, '#d4a72c', 0, 2.22, dz, 12)); g.add(cyl(.01, .01, .25, '#d4a72c', 0, 2.05, dz, 6)); glow(g, 0, 2.45, dz, 1.1); }
  });
  unlockable(5, g => { g.position.set(6.0, 0, 6.6);
    g.add(ol(cyl(.42, .5, .3, '#fff7e8', 0, .15, 0, 24))); g.add(ol(sph(.36, '#f2c94c', 0, .68, 0, 20, { emissive: '#8a6a10', emissiveIntensity: .2 })));
    const t = new THREE.Mesh(new THREE.PlaneGeometry(.5, .5), new THREE.MeshBasicMaterial({ map: canvasTex(128, 128, c => { c.fillStyle = '#8a5a00'; c.font = 'bold 96px ' + ZH; c.textAlign = 'center'; c.fillText('宝', 64, 98); }), transparent: true })); t.position.set(0, .68, .37); g.add(t);
  });
  const chairs = new THREE.Group(); room.add(chairs);
  for (const z of [5.0, 6.4]) { const c = new THREE.Group(); c.position.set(3.75, 0, z); c.rotation.y = -Math.PI / 2; chairs.add(c);
    c.add(ol(rb(.74, .26, .7, '#FFD91F', 0, .42, 0, .1))); c.add(ol(rb(.74, .62, .18, '#f2c200', 0, .72, -.3, .08)));
    for (const s of [-1, 1]) c.add(ol(rb(.14, .34, .66, '#2c66b0', s * .36, .6, 0, .06)));
    c.add(rb(.56, .1, .5, '#fff3c4', 0, .58, .04, .05));
    for (const [x, zz] of [[-.28, -.26], [.28, -.26], [-.28, .26], [.28, .26]]) c.add(cyl(.035, .03, .3, '#c98f5e', x, .15, zz, 8)); }
  const vase = new THREE.Group(); vase.position.set(-.28, .55, .26); table.add(vase);
  vase.add(ol(cyl(.09, .07, .2, '#8fb8ff', 0, .1, 0, 14), .015)); vase.add(cyl(.05, .09, .06, '#8fb8ff', 0, .22, 0, 12));
  const petals = [];
  for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28, st = cyl(.008, .008, .26, '#4fb870', Math.cos(a) * .05, .36, Math.sin(a) * .05, 5); st.rotation.set(Math.sin(a) * .3, 0, -Math.cos(a) * .3); vase.add(st);
    const f = sph(.055, ['#ff7fa0', '#FFD91F', '#ffffff', '#ff9f7a', '#c9a0ff'][i], Math.cos(a) * .1, .5, Math.sin(a) * .1, 10); vase.add(f); petals.push({ f, ph: i }); }
  const piano = new THREE.Group(); piano.position.set(5.85, 0, .45); room.add(piano);
  piano.add(ol(rb(1.5, 1.15, .55, '#2b2233', 0, .58, 0, .06))); piano.add(rb(1.42, .06, .62, INK, 0, 1.18, .02, .03));
  piano.add(rb(1.32, .07, .28, '#fffaf0', 0, .78, .38, .02)); for (let i = 0; i < 9; i++) piano.add(rb(.05, .04, .16, '#2b2233', -.56 + i * .14, .83, .33, .01));
  piano.add(rb(.5, .3, .03, '#fff7e8', 0, 1.0, .29, .01)); piano.add(ol(rb(.9, .42, .38, '#c98f5e', 0, .21, .95, .06))); piano.add(rb(.8, .08, .34, '#ff7fa0', 0, .44, .95, .04));
  const fountain = new THREE.Group(); fountain.position.set(4.4, 0, 6.9); room.add(fountain);
  fountain.add(ol(cyl(.62, .7, .3, '#e8eef5', 0, .15, 0, 28))); const water = cyl(.55, .55, .03, '#7fd0ff', 0, .3, 0, 28, { emissive: '#4ab0e0', emissiveIntensity: .25 }); fountain.add(water);
  fountain.add(cyl(.08, .1, .7, '#e8eef5', 0, .6, 0, 12)); fountain.add(ol(cyl(.28, .14, .1, '#e8eef5', 0, .98, 0, 20))); fountain.add(cyl(.24, .24, .02, '#7fd0ff', 0, 1.03, 0, 20, { emissive: '#4ab0e0', emissiveIntensity: .3 }));
  const carpet = new THREE.Group(); room.add(carpet);
  { const a = new V3(9.15, 0, 7.6), b = new V3(7.6, 0, 2.75), mid = a.clone().add(b).multiplyScalar(.5), len = a.distanceTo(b);
    carpet.position.set(mid.x, 0, mid.z); carpet.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
    carpet.add(rb(1.0, .03, len, '#d62839', 0, .018, 0, .012)); for (const s of [-1, 1]) carpet.add(rb(.07, .035, len, '#FFD91F', s * .47, .02, 0, .01)); }
  const mirror = new THREE.Group(); mirror.position.set(4.0, 2.0, .08); room.add(mirror);
  { const fr = ol(M(new THREE.TorusGeometry(.42, .06, 10, 32), '#d4a72c'), .015); fr.scale.y = 1.25; mirror.add(fr);
    const glassTex = canvasTex(128, 160, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#e9f7ff'); gr.addColorStop(.5, '#bfe3f5'); gr.addColorStop(1, '#9fd0ea'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.moveTo(18, 40); g.lineTo(46, 18); g.lineTo(58, 26); g.lineTo(28, 54); g.fill(); });
    const gl = new THREE.Mesh(new THREE.CircleGeometry(.4, 32), new THREE.MeshBasicMaterial({ map: glassTex })); gl.scale.y = 1.25; gl.position.z = .01; mirror.add(gl); }
  const cat = new THREE.Group(); cat.position.set(1.25, 1.12, .12); desk.add(cat);
  cat.add(ol(sph(.15, '#ffffff', 0, .14, 0, 14), .015)); cat.add(ol(sph(.13, '#ffffff', 0, .36, .02, 14), .015));
  for (const s of [-1, 1]) { cat.add(M(coneG(.05, .09, 4), '#ffffff', s * .08, .48, 0)); cat.add(sph(.016, '#2b2233', s * .05, .38, .13, 6)); }
  cat.add(cyl(.13, .13, .03, '#e8343a', 0, .26, .02, 16)); cat.add(sph(.03, '#FFD91F', 0, .25, .14, 8));
  const catPaw = new THREE.Group(); catPaw.position.set(.12, .3, .05); cat.add(catPaw); catPaw.add(sph(.045, '#ffffff', 0, .08, 0, 8));
  const liftWall = rb(.1, 2.5, 1.9, '#ffe7d1', .08, 1.25, 3.4, .04); room.add(liftWall);

  /* ---------- danh mục đồ → vật 3D (id trùng FURN của game chính) ---------- */
  const ITEM3D = {
    table: [table], flower: [vase], chair: [chairs], rug: [rug], sofa: [sofa],
    desk: [deskBody], computer: [computer], bell: [bell], keys: [keys], clock: [clock],
    tea: [teaset], lamp: [lamp], painting: [art], plants: [...plantGroups, deskPlant], cart: [cart],
    fishtank: [UNLOCK[1]], bookshelf: [UNLOCK[3]], chandelier: [UNLOCK[2]], lanterns: [UNLOCK[4]], mirror: [mirror], lift: [lift],
    statue: [UNLOCK[5]], piano: [piano], fountain: [fountain], carpet: [carpet], luckycat: [cat]
  };
  const ON_DESK = { computer: 1, bell: 1, luckycat: 1 }, ON_TABLE = { flower: 1, tea: 1 };
  let own = new Set(), staffN = 0, tier = 1;
  const pops = [];
  function applyOwn() {
    for (const id in ITEM3D) {
      let on = own.has(id);
      if (ON_DESK[id] && !own.has('desk')) on = false;
      if (ON_TABLE[id] && !own.has('table')) on = false;
      ITEM3D[id].forEach(g => { if (!pops.some(p => p.g === g)) { g.visible = on; if (on) g.scale.setScalar(1); } });
    }
    if (own.has('bookshelf')) plantGroups[1].visible = false;
    liftWall.visible = !own.has('lift');
    syncStaff();
  }
  function centerOf(id) { const g = (ITEM3D[id] || [])[0]; if (!g) return new V3(5, 0, 4); const b = new THREE.Box3().setFromObject(g); return b.isEmpty() ? g.getWorldPosition(new V3()) : b.getCenter(new V3()); }
  let focusAt = null, focusT = 0;
  function place(id) {
    if (!ITEM3D[id]) return;
    own.add(id); applyOwn();
    ITEM3D[id].forEach((g, i) => { if (!g.visible) return; g.scale.setScalar(.001); pops.push({ g, t: -i * .08 - .35 }); });
    const c = centerOf(id);
    setTimeout(() => { sparkles(c.x, Math.max(.6, c.y + .4), c.z, 20, .5); confetti(c.x, Math.max(1.2, c.y + 1), c.z, 50); puff(c.x, .1, c.z, .9); }, 450);
    focusAt = c; focusT = 2.8;
    go(hero, new V3(clamp(c.x + 1.05, .8, 9.3), 0, clamp(c.z - .95, 1.2, 7.4)), () => { faceTo(hero, Math.atan2(c.x - hero.root.position.x, c.z - hero.root.position.z), 1); hero.joy = 1.4; hearts(hero.root.position.x, 1.9, hero.root.position.z, 3); });
    plan.t = 4;
  }
  function stepPops(dt) {
    for (let i = pops.length - 1; i >= 0; i--) { const p = pops[i]; p.t += dt; if (p.t < 0) continue;
      const t = Math.min(1, p.t / .75), e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t) * Math.cos(t * 10.5);
      p.g.scale.setScalar(Math.max(.001, e)); if (t === 1) { p.g.scale.setScalar(1); pops.splice(i, 1); } }
  }
  /** sao khách sạn → sàn, tường, phào chỉ */
  function setTier(s) {
    tier = s;
    floorMat.map = FLOORS[s >= 4 ? 2 : s >= 3 ? 1 : 0]; floorMat.needsUpdate = true;
    wallA.color.set(s >= 4 ? '#fff6d6' : s >= 3 ? '#fff3c4' : '#fff2b0'); wallB.color.set(s >= 4 ? '#ffeeb8' : s >= 3 ? '#ffe9a6' : '#ffe98f');
    wains.color.set(s >= 4 ? '#16365f' : s >= 2 ? '#2c5aa0' : '#3f78c6'); trimM.color.set(s >= 4 ? '#d4a72c' : '#2c66b0');
    lux.visible = s >= 4;
  }

  /* ---------- nhân vật ---------- */
  const hero = chibi({ skin: '#ffe0c7', hair: '#2b2233', shirt: '#1E5AA8', pants: INK, band: '#FFD91F', vest: '#FFD91F', ahoge: true }, room);
  hero.root.position.set(5.0, 0, 4.2); hero.face = .8; hero.root.rotation.y = .8;
  const behind = p => p.z < 1.4 && p.x > 5.6;
  function go(c, to, cb) {
    c.path = []; c.target = null; const p = c.root.position;
    if (own.has('desk') && behind(p) !== behind(to)) c.path = behind(to) ? [new V3(5.2, 0, 2.6), new V3(5.2, 0, 1.0)] : [new V3(5.2, 0, 1.0), new V3(5.2, 0, 2.6)];
    c.path.push(to.clone()); c.done = cb || null; c.sit = 0;
  }
  const staff = [];
  function syncStaff() {
    const n = own.has('desk') ? Math.min(2, staffN) : 0;
    while (staff.length < n) { const s = chibi({ skin: '#f6d2b0', hair: '#22242e', shirt: '#2c4a86', pants: '#2c4a86', bun: true, tie: '#59d68a' }, room); s.root.position.set(staff.length ? 8.4 : 6.5, 0, .95); s.face = 0; s.root.rotation.y = 0; staff.push(s); }
    while (staff.length > n) { const s = staff.pop(); room.remove(s.root); }
  }
  const LOOKS = [
    { skin: '#ffe6cf', hair: '#5a3a28', shirt: '#ff7fa0', pants: '#4a4060', bun: true, hat: '#fff3c4', bag: '#FFD91F' },
    { skin: '#f6cfab', hair: '#2b2233', shirt: '#7fd6c2', pants: '#3a3a52', glasses: true, bag: '#8fb8ff', tie: '#e8593c' },
    { skin: '#ffe9d6', hair: '#8a5a34', shirt: '#c9a0ff', pants: '#2f3d5c', twin: true, bag: '#ff9f7a' },
    { skin: '#f2c9a0', hair: INK, shirt: '#ffb38a', pants: '#40506a', hat: '#7fd6c2', hatBand: '#FFD91F', bag: '#e8593c' },
  ];
  // khách ngồi chơi trong sảnh (chỉ khi đang xem bên trong)
  const guests = []; let gi = 0, spawnT = 4;
  function seats() {
    const s = [];
    if (own.has('sofa')) s.push({ p: new V3(1.25, 0, 5.2), f: Math.PI / 2 }, { p: new V3(1.25, 0, 6.2), f: Math.PI / 2 });
    if (own.has('chair')) s.push({ p: new V3(3.75, 0, 5.0), f: -Math.PI / 2 }, { p: new V3(3.75, 0, 6.4), f: -Math.PI / 2 });
    return s.filter(x => !guests.some(g => g.seat === x.p.x + ',' + x.p.z));
  }
  function newGuest() {
    const g = chibi(LOOKS[gi++ % LOOKS.length], room); g.root.position.copy(DOOR_IN); g.face = Math.PI; g.root.rotation.y = Math.PI;
    g.st = 'walk'; g.t = 0; g.seat = null; guests.push(g);
    const s = seats()[0];
    if (s) { g.seat = s.p.x + ',' + s.p.z; go(g, s.p, () => { g.st = 'sit'; g.t = 0; g.sit = 1; g.sf = s.f; }); }
    else go(g, new V3(7.6 + Math.random(), 0, 4.6 + Math.random()), () => { g.st = 'look'; g.t = 0; });
  }
  function guestTick(g, dt) {
    g.t += dt; const idle = walk(g, dt, 1.8); if (idle && g.done) { const f = g.done; g.done = null; f(); }
    if (g.st === 'look') { g.face += Math.sin(g.t * 2) * dt; g.root.rotation.y = g.face; if (g.t > 2.5) leave(g); }
    if (g.st === 'sit') { faceTo(g, g.sf, dt); if (g.t > 9 && Math.random() < dt) { if (own.has('tea') || own.has('flower')) hearts(g.root.position.x, 1.6, g.root.position.z, 2); leave(g); } }
    if (g.st === 'out') { g.root.scale.setScalar(Math.max(.01, g.root.scale.x - dt * 2.2)); if (g.root.scale.x <= .02) { room.remove(g.root); guests.splice(guests.indexOf(g), 1); } }
  }
  function leave(g) { g.seat = null; g.sit = 0; g.st = 'walk'; const viaLift = own.has('lift') && Math.random() < .6; go(g, viaLift ? LIFT : DOOR_IN, () => { g.st = 'out'; g.wave = 1.2; if (viaLift) liftOpen = 1; }); }
  let liftOpen = 0, deskBusy = 0;
  /** khách thật (từ hàng chờ ngoài phố) vừa tới quầy: nhân viên cúi chào, chuông kêu, Ā Bǎo nhận xu */
  function deskHello() {
    deskBusy = 2.5; bell.scale.y = .6;
    staff.forEach(s => { s.bow = 1.2; });
    if (!staff.length) { plan.cur = ACTS[0]; plan.phase = 'go'; go(hero, DESK_SPOT, () => { plan.phase = 'do'; plan.t = 2.5; hero.wave = 1.4; }); }
    coins3d(GUEST_SPOT.x, 1.3, 1.85, 2);
  }
  const ACTS = [
    { need: 'desk', at: [7.4, 1.0], f: 0, a: 'stand', t: [6, 10] },
    { need: 'plants', at: [8.85, 1.25], f: .75, a: 'bow', t: [2.5, 3.5], say: '浇花 jiāo huā · tưới cây' },
    { need: 'tea', at: [3.25, 5.75], f: -Math.PI / 2, a: 'bow', t: [3, 4], say: '倒茶 dào chá · rót trà' },
    { need: 'fishtank', at: [1.05, 1.9], f: -Math.PI / 2, a: 'look', t: [3, 4.5], say: '喂鱼 wèi yú · cho cá ăn' },
    { need: 'bookshelf', at: [1.0, 1.05], f: Math.PI, a: 'look', t: [3, 4], say: '看书 kàn shū · đọc sách' },
    { need: 'sofa', at: [1.7, 5.7], f: -Math.PI / 2, a: 'bow', t: [2, 3], say: '整理 zhěnglǐ · dọn gọn' },
    { need: 'piano', at: [5.85, 1.25], f: Math.PI, a: 'play', t: [4, 5.5], say: '弹琴 tán qín · chơi đàn' },
    { need: 'cart', at: [6.9, 6.6], f: .5, a: 'push', t: [2.5, 3.5], say: '搬行李 bān xíngli · chuyển hành lý' },
    { need: null, at: [5.0, 4.4], f: .8, a: 'wave', t: [2, 3], say: '欢迎光临 huānyíng guānglín · chào mừng' },
    { need: null, at: [3.0, 3.0], f: .8, a: 'stretch', t: [2, 3] }
  ];
  const plan = { cur: null, t: 2, phase: 'idle' };
  function nextAct() {
    const ok = ACTS.filter(a => (!a.need || own.has(a.need)) && a !== plan.cur);
    const deskA = ok.find(a => a.need === 'desk');
    const pickA = deskA && (deskBusy > 0 || Math.random() < .35) ? deskA : ok[Math.floor(Math.random() * ok.length)];
    plan.cur = pickA; plan.phase = 'go';
    go(hero, new V3(pickA.at[0], 0, pickA.at[1]), () => { plan.phase = 'do'; plan.t = pickA.t[0] + Math.random() * (pickA.t[1] - pickA.t[0]);
      if (pickA.a === 'wave') hero.wave = 1.6; if (pickA.say && hooks.visible()) say(hero, pickA.say, 2.2); });
  }
  function heroTick(dt) {
    const idle = walk(hero, dt, 2.6); if (idle && hero.done) { const f = hero.done; hero.done = null; f(); }
    const a = plan.cur;
    hero.act = plan.phase === 'do' && a ? a.a : null; hero.actT = plan.t; hero.actD = a ? a.t[1] : 1;
    if (plan.phase === 'do' && a) { faceTo(hero, a.f, dt); plan.t -= dt;
      if (a.a === 'bow') hero.bow = Math.max(hero.bow || 0, .5 + .5 * Math.sin(T * 3));
      if (a.a === 'play' && Math.random() < dt * 3) sprite(TX.spark, hero.root.position.x + (Math.random() - .5), 2.0, hero.root.position.z - .3, .2, 1.1, new V3((Math.random() - .5) * .3, .7, 0), { add: true });
      if (plan.t <= 0) { plan.phase = 'idle'; plan.t = .6 + Math.random(); } }
    else if (plan.phase === 'idle') { plan.t -= dt; if (plan.t <= 0) nextAct(); }
    hero.bow = Math.max(0, (hero.bow || 0) - dt * 2);
  }

  /* ---------- chạm ---------- */
  function tapTest(ray) {
    let best = null;
    for (const id in ITEM3D) for (const g of ITEM3D[id]) { if (!g.visible) continue; const h = ray.intersectObject(g, true)[0]; if (h && (!best || h.distance < best.d)) best = { id, d: h.distance, p: h.point }; }
    const fl = ray.intersectObject(floor)[0];
    if (best && (!fl || best.d < fl.distance + .01)) { sparkles(best.p.x, best.p.y, best.p.z, 8, .3); return { furn: best.id }; }
    if (!fl) return null;
    const p = fl.point; p.x = clamp(p.x, .7, ROOM.w - .5); p.z = clamp(p.z, .7, ROOM.d - .4);
    if (own.has('desk') && p.x > 5.5 && p.x < 9.3 && p.z > 1.15 && p.z < 2.35) p.z = p.z < 1.75 ? 1.0 : 2.55;
    plan.cur = null; plan.phase = 'tap'; go(hero, p, () => { plan.phase = 'idle'; plan.t = 5; });
    sprite(TX.spark, p.x, .1, p.z, .35, .5, new V3(0, .5, 0), { add: true });
    return { floor: true };
  }

  /* ---------- cập nhật ---------- */
  let T = 0, bayT = 0;
  function update(dt, active) {
    T += dt; deskBusy = Math.max(0, deskBusy - dt);
    heroTick(dt); pose(hero, dt);
    staff.forEach(s => { faceTo(s, 0, dt); s.bow = Math.max(0, (s.bow || 0) - dt * 1.5); pose(s, dt); });
    bell.scale.y += (1 - bell.scale.y) * Math.min(1, dt * 10);
    liftOpen = Math.max(0, liftOpen - dt); const lk = Math.sin(Math.min(1, (1 - liftOpen)) * Math.PI) * (liftOpen > 0 ? 1 : 0); doorL.position.z = -.4 - .35 * lk; doorR.position.z = .4 + .35 * lk; liftLamp.material.color.set(liftOpen > 0 ? '#ffd27a' : '#7fffb0');
    stepPops(dt); focusT = Math.max(0, focusT - dt);
    if (!active) return;
    spawnT -= dt; const cap = Math.min(3, Math.floor(own.size / 5));
    if (spawnT <= 0 && guests.length < cap && seats().length) { newGuest(); spawnT = 6 + Math.random() * 6; }
    for (let i = guests.length - 1; i >= 0; i--) { guestTick(guests[i], dt); if (guests[i]) pose(guests[i], dt); }
    plants.forEach(p => { p.top.rotation.z = Math.sin(T * 1.3 + p.ph) * .05; p.top.rotation.x = Math.cos(T * 1.1 + p.ph) * .04; });
    petals.forEach(p => { p.f.position.y = .5 + Math.sin(T * 2 + p.ph) * .012; });
    fishes.forEach(f => { const a = T * .8 + f.ph; f.f.position.set(Math.sin(a * 1.3) * .14, f.y + Math.sin(a * 2) * .05, Math.sin(a) * .42); f.f.rotation.y = Math.cos(a) > 0 ? 0 : Math.PI; });
    if (teaset.visible && Math.random() < dt * 2.2 && !REDUCED) cups.forEach(c => { const p = c.getWorldPosition(new V3()); sprite(TX.puff, p.x, p.y + .08, p.z, .1, 1.2, new V3(.03, .25, 0), { grow: 1.6 }); });
    if (fountain.visible && !REDUCED && Math.random() < dt * 9) { const a = Math.random() * 6.28; sprite(TX.dot, 4.4 + Math.cos(a) * .2, 1.1, 6.9 + Math.sin(a) * .2, .12, .7, new V3(Math.cos(a) * .5, 1.0, Math.sin(a) * .5), { grav: 3.2, add: true }); }
    water.scale.setScalar(1 + Math.sin(T * 3) * .01);
    catPaw.rotation.x = Math.sin(T * 4) * .6;
    for (let i = 0; i < MOTE_N; i++) { const s = moteSeed[i]; motePos[i * 3] = s[0] + Math.sin(T * .3 + s[3]) * .2; motePos[i * 3 + 1] = s[1] + Math.sin(T * .2 + s[3] * 2) * .25; motePos[i * 3 + 2] = s[2] + Math.cos(T * .25 + s[3]) * .2; }
    moteGeo.attributes.position.needsUpdate = true;
    beams.forEach((b, i) => b.material.opacity = (.45 + Math.sin(T * .7 + i) * .1) * (1 - dark * .85));
    glows.forEach((g, i) => g.material.opacity = .7 + Math.sin(T * 2 + i) * .08 + dark * .2);
    const now = new Date(); hHand.rotation.z = -((now.getHours() % 12) + now.getMinutes() / 60) / 12 * Math.PI * 2; mHand.rotation.z = -(now.getMinutes() + now.getSeconds() / 60) / 60 * Math.PI * 2;
    bayT += dt; if (bayT > .12) { drawBay(T); bayT = 0; }
  }
  let dark = 0;
  for (const id in ITEM3D) ITEM3D[id].forEach(g => { g.visible = false; });
  applyOwn(); setSeg(old);
  return {
    room, floor, hero, ITEM3D, update, tapTest, place, centerOf, setTier, deskHello, go,
    set own(v) { own = new Set(v); applyOwn(); }, get own() { return own; },
    set staff(n) { staffN = n | 0; syncStaff(); },
    set dark(v) { dark = v; },
    openLift() { liftOpen = 1; },
    cheer() { hero.joy = 1.6; confetti(hero.root.position.x, 2.4, hero.root.position.z, 60); },
    get focus() { return focusT > 0 ? focusAt : null; },
    get hasDesk() { return own.has('desk'); }, get hasLift() { return own.has('lift'); }
  };
}
