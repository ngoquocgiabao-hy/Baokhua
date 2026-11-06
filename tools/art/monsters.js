/* Vẽ 2 boss quái thay cho 2 boss lễ tân (06/11/2026): HSK0 "Cua Thanh Điệu" (khoá trainee), HSK1 "Vali Khổng Lồ" (khoá hotel).
   Lý do: 2/5 boss là nữ lễ tân, nhân viên khách sạn sẽ thấy nghề mình là con boss bị đánh gục (DANH_GIA Tiêu Hà 06/11).
   Vẽ hoàn toàn bằng code (không mua hình), cùng nét viền đậm + tô chuyển màu như tranh hiện có.
   Ra: v4/sprites/{trainee,hotel}-{idle,atk,ko}.webp (mặt quay sang trái, phía tướng), v4/vs/{trainee,hotel}.jpg (600×800, nền sảnh mờ v4/bg).
   In bảng SPRITE mới (rộng, cao, neo x, mặt đất y) để dán vào game.html.
   Dùng: node tools/art/monsters.js   (cần Playwright + Chromium; chạy từ thư mục repo) */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const bg = n => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(ROOT, 'v4/bg/' + n + '.jpg')).toString('base64');
  await p.setContent('<body></body>');
  const out = await p.evaluate(async ({ bgT, bgH }) => {
    const OL = '#2a1716';
    const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
    const lin = (g, x0, y0, x1, y1, st) => { const r = g.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, c]) => r.addColorStop(o, c)); return r; };
    const rad = (g, x, y, r0, r1, st) => { const r = g.createRadialGradient(x, y, r0, x, y, r1); st.forEach(([o, c]) => r.addColorStop(o, c)); return r; };
    const stroke = (g, w = 9, c = OL) => { g.lineWidth = w; g.strokeStyle = c; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); };
    const ell = (g, x, y, rx, ry, rot = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); };
    const shadow = (g, x, y, rx, a = .28) => { g.save(); g.fillStyle = `rgba(0,0,0,${a})`; ell(g, x, y, rx, rx * .16); g.fill(); g.restore(); };
    function eye(g, x, y, r, o = {}) {
      ell(g, x, y, r, r * 1.08); g.fillStyle = '#fff'; g.fill(); stroke(g, 7);
      if (o.ko) { g.save(); g.strokeStyle = OL; g.lineWidth = 6; g.beginPath(); for (let a = 0; a < 12.5; a += .25) { const rr = a / 12.5 * r * .78; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.stroke(); g.restore(); return; }
      const px = x + (o.lx || -.22) * r, py = y + (o.ly || .1) * r;
      ell(g, px, py, r * .58, r * .64); g.fillStyle = '#1b1416'; g.fill();
      ell(g, px - r * .2, py - r * .24, r * .2, r * .2); g.fillStyle = '#fff'; g.fill();
      ell(g, px + r * .18, py + r * .2, r * .08, r * .08); g.fill();
      if (o.angry) { g.save(); g.beginPath(); g.moveTo(x - r * 1.1, y - r * (o.side > 0 ? 1.25 : .7)); g.lineTo(x + r * 1.1, y - r * (o.side > 0 ? .7 : 1.25)); stroke(g, 13); g.restore(); }
    }
    /* ================= CUA THANH ĐIỆU (HSK0) ================= */
    function crab(pose) {
      const W = pose === 'atk' ? 830 : pose === 'ko' ? 660 : 640, H = pose === 'ko' ? 380 : pose === 'atk' ? 500 : 520;
      const c = mk(W, H), g = c.getContext('2d');
      const cx = pose === 'atk' ? 490 : W / 2, gy = H - 14;
      shadow(g, cx, gy, pose === 'ko' ? 250 : 230);
      g.save();
      if (pose === 'ko') { g.translate(cx, gy - 150); g.rotate(Math.PI); g.translate(-cx, -(gy - 150)); }
      const by = pose === 'ko' ? gy - 150 : gy - 175;
      // chân (3 mỗi bên)
      // chân xoè ra hai bên, gập gối như chân cua thật (đùi chéo lên, cẳng chéo xuống đất)
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
        const x0 = cx + s * (95 + i * 45), y0 = by + 55 - i * 8, kx = cx + s * (205 + i * 30), ky = by - 5 - i * 18, fx = cx + s * (262 + i * 22), fy = pose === 'ko' ? by + 60 - i * 10 : gy - 4;
        g.beginPath(); g.moveTo(x0, y0); g.lineTo(kx, ky); g.lineTo(fx, fy); g.lineWidth = 30; g.strokeStyle = OL; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke();
        g.lineWidth = 17; g.strokeStyle = i % 2 ? '#c8352a' : '#d8432f'; g.stroke();
        g.beginPath(); g.arc(kx, ky, 7, 0, Math.PI * 2); g.fillStyle = '#ff9b6a'; g.fill();
      }
      // càng (claws)
      function claw(s, raise, open, reach) {
        const ax = cx + s * 150, ay = by - 30, ex = cx + s * (215 + reach), ey = by - 90 - raise, hx = cx + s * (240 + reach * 1.6), hy = by - 170 - raise * 1.3;
        g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo(ex, ey + 20, hx, hy + 30); g.lineWidth = 42; g.strokeStyle = OL; g.stroke(); g.lineWidth = 27; g.strokeStyle = '#e04a33'; g.stroke();
        g.save(); g.translate(hx, hy); g.rotate(s * (.35 + (reach > 60 ? .9 : 0)) - (reach > 60 ? Math.PI / 2 * s : 0));
        // má kìm dưới (cố định) + má kìm trên (mở theo open)
        const R = 62 + (reach > 60 ? 12 : 0);
        g.beginPath(); g.moveTo(-R * .55, R * .35); g.quadraticCurveTo(-R * .9, -R * .5, -R * .1, -R * 1.25); g.quadraticCurveTo(R * .15, -R * .55, R * .25, R * .1); g.quadraticCurveTo(0, R * .45, -R * .55, R * .35); g.closePath();
        g.fillStyle = lin(g, 0, -R, 0, R * .4, [[0, '#ff8a5c'], [1, '#d63a2a']]); g.fill(); stroke(g, 9);
        g.save(); g.rotate(open);
        g.beginPath(); g.moveTo(R * .15, R * .2); g.quadraticCurveTo(R * .9, -R * .2, R * .55, -R * 1.05); g.quadraticCurveTo(R * .35, -R * .45, -R * .05, -R * .1); g.closePath();
        g.fillStyle = lin(g, 0, -R, 0, R * .2, [[0, '#ffa071'], [1, '#e04a33']]); g.fill(); stroke(g, 9);
        g.restore();
        g.fillStyle = 'rgba(255,255,255,.55)'; ell(g, -R * .35, -R * .55, R * .12, R * .28, -.4); g.fill();
        g.restore();
      }
      if (pose === 'atk') { claw(1, 40, .2, 0); claw(-1, -40, .75, 95); }   // càng trái (phía tướng) vươn ra kẹp, càng phải giơ cao
      else if (pose === 'ko') { claw(-1, -60, .05, 0); claw(1, -60, .05, 0); }
      else { claw(-1, 30, .45, 0); claw(1, 30, .45, 0); }
      // thân
      ell(g, cx, by, 205, 128); g.fillStyle = rad(g, cx - 40, by - 60, 20, 230, [[0, '#ff9b6a'], [.55, '#ef5a3c'], [1, '#bf2f24']]); g.fill(); stroke(g, 11);
      g.fillStyle = 'rgba(255,255,255,.28)'; ell(g, cx - 70, by - 62, 70, 28, -.25); g.fill();
      // 4 dấu thanh điệu trên mai (ˉ ˊ ˇ ˋ)
      g.save(); g.strokeStyle = '#fff6d6'; g.lineWidth = 12; g.lineCap = 'round';
      const tx = [-108, -40, 32, 100].map(d => cx + d), ty = by - 52;
      g.beginPath(); g.moveTo(tx[0] - 22, ty); g.lineTo(tx[0] + 22, ty); g.stroke();
      g.beginPath(); g.moveTo(tx[1] - 18, ty + 16); g.lineTo(tx[1] + 18, ty - 16); g.stroke();
      g.beginPath(); g.moveTo(tx[2] - 20, ty - 14); g.lineTo(tx[2], ty + 12); g.lineTo(tx[2] + 20, ty - 14); g.stroke();
      g.beginPath(); g.moveTo(tx[3] - 18, ty - 16); g.lineTo(tx[3] + 18, ty + 16); g.stroke();
      g.restore();
      // mắt trên cuống
      for (const s of [-1, 1]) {
        const ex = cx + s * 62, ey = by - 150;
        g.beginPath(); g.moveTo(cx + s * 45, by - 95); g.lineTo(ex, ey + 30); g.lineWidth = 26; g.strokeStyle = OL; g.stroke(); g.lineWidth = 14; g.strokeStyle = '#e65238'; g.stroke();
        eye(g, ex, ey, 40, { ko: pose === 'ko', angry: pose === 'atk', side: s, lx: pose === 'atk' ? -.35 : -.2 });
      }
      // má hồng + miệng
      g.fillStyle = 'rgba(255,170,170,.75)'; ell(g, cx - 120, by + 8, 26, 14); g.fill(); ell(g, cx + 120, by + 8, 26, 14); g.fill();
      g.beginPath();
      if (pose === 'atk') { ell(g, cx - 30, by + 30, 34, 26); g.fillStyle = '#5a1418'; g.fill(); stroke(g, 8); g.fillStyle = '#ff7b8f'; ell(g, cx - 30, by + 44, 18, 9); g.fill(); }
      else if (pose === 'ko') { g.moveTo(cx - 40, by + 34); g.quadraticCurveTo(cx, by + 10, cx + 40, by + 34); stroke(g, 9); }
      else { g.moveTo(cx - 42, by + 22); g.quadraticCurveTo(cx - 21, by + 44, cx, by + 24); g.quadraticCurveTo(cx + 21, by + 44, cx + 42, by + 22); stroke(g, 9); }
      g.restore();
      if (pose === 'ko') { g.save(); g.fillStyle = '#ffd91f'; g.strokeStyle = OL; g.lineWidth = 5; for (const [sx, sy] of [[cx - 90, 50], [cx + 20, 30], [cx + 120, 60]]) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 9 : 22; g.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke(); } g.restore(); }
      if (pose === 'atk') { g.save(); g.fillStyle = 'rgba(190,235,255,.85)'; g.strokeStyle = 'rgba(40,90,130,.8)'; g.lineWidth = 4; for (const [bx, byy, r] of [[cx - 120, by + 20, 18], [cx - 175, by - 10, 13], [cx - 220, by + 30, 22], [cx - 270, by - 30, 11]]) { ell(g, bx, byy, r, r); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.9)'; ell(g, bx - r * .35, byy - r * .35, r * .25, r * .25); g.fill(); g.fillStyle = 'rgba(190,235,255,.85)'; } g.restore(); }
      return { c, ax: cx, gy };
    }
    /* ================= VALI KHỔNG LỒ (HSK1) ================= */
    function vali(pose) {
      const W = pose === 'ko' ? 620 : pose === 'atk' ? 470 : 380, H = pose === 'ko' ? 340 : 520;
      const c = mk(W, H), g = c.getContext('2d');
      const cx = pose === 'atk' ? 250 : W / 2, gy = H - 12;
      shadow(g, cx, gy, pose === 'ko' ? 250 : 150);
      g.save();
      let bw = 280, bh = 360;
      if (pose === 'ko') { g.translate(cx, gy - 140); g.rotate(-Math.PI / 2 + .06); g.translate(-cx, -(gy - 140)); }
      if (pose === 'atk') { g.translate(cx, gy - 30); g.rotate(-.16); g.translate(-cx, -(gy - 30)); }
      const x0 = cx - bw / 2, y0 = (pose === 'ko' ? gy - 140 : gy - 40) - bh;
      // bánh xe
      if (pose !== 'ko') for (const s of [-1, 1]) { ell(g, cx + s * 95, gy - 22, 22, 22); g.fillStyle = '#2b2f3a'; g.fill(); stroke(g, 7); ell(g, cx + s * 95, gy - 22, 8, 8); g.fillStyle = '#9aa3b2'; g.fill(); }
      // tay kéo
      g.save(); g.lineWidth = 16; g.strokeStyle = OL; g.lineCap = 'round';
      g.beginPath(); g.moveTo(cx - 55, y0 + 4); g.lineTo(cx - 55, y0 - 90); g.lineTo(cx + 55, y0 - 90); g.lineTo(cx + 55, y0 + 4); g.stroke();
      g.lineWidth = 8; g.strokeStyle = '#c9ced8'; g.stroke(); g.restore();
      g.beginPath(); g.roundRect(cx - 62, y0 - 104, 124, 30, 15); g.fillStyle = '#16171B'; g.fill(); stroke(g, 6);
      // thân vali
      g.beginPath(); g.roundRect(x0, y0, bw, bh, 38); g.fillStyle = lin(g, x0, 0, x0 + bw, 0, [[0, '#2f5fae'], [.5, '#3f78d0'], [1, '#244c90']]); g.fill(); stroke(g, 11);
      for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(x0 + bw * i / 5, y0 + 26); g.lineTo(x0 + bw * i / 5, y0 + bh - 26); g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 8; g.stroke(); }
      for (const [gx2, gy2] of [[x0, y0], [x0 + bw, y0], [x0, y0 + bh], [x0 + bw, y0 + bh]]) { ell(g, gx2 + (gx2 > cx ? -14 : 14), gy2 + (gy2 > y0 + 10 ? -14 : 14), 20, 20); g.fillStyle = '#c9a227'; g.fill(); stroke(g, 6); }
      g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.roundRect(x0 + 22, y0 + 20, 40, bh - 60, 20); g.fill();
      // nhãn dán du lịch
      g.save(); g.translate(x0 + bw - 70, y0 + bh - 92); g.rotate(-.18); g.beginPath(); g.roundRect(-46, -22, 92, 44, 10); g.fillStyle = '#FFD91F'; g.fill(); stroke(g, 5); g.fillStyle = OL; g.font = '900 20px system-ui,sans-serif'; g.textAlign = 'center'; g.fillText('HẠ LONG', 0, 7); g.restore();
      g.save(); g.translate(x0 + 70, y0 + bh - 70); g.rotate(.2); ell(g, 0, 0, 30, 30); g.fillStyle = '#ff6b8f'; g.fill(); stroke(g, 5); g.fillStyle = '#fff'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 7 : 16; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.fill(); g.restore();
      // thẻ hành lý treo ở tay kéo
      g.save(); g.translate(cx + 58, y0 - 40); g.rotate(.35); g.beginPath(); g.moveTo(0, -30); g.lineTo(0, 0); g.strokeStyle = OL; g.lineWidth = 4; g.stroke(); g.beginPath(); g.roundRect(-18, 0, 36, 52, 6); g.fillStyle = '#7fd6c2'; g.fill(); stroke(g, 5); g.restore();
      // mặt: mắt + miệng là đường khoá kéo
      const ey = y0 + 120;
      for (const s of [-1, 1]) eye(g, cx + s * 62, ey, 44, { ko: pose === 'ko', angry: pose !== 'ko', side: s, lx: pose === 'atk' ? -.4 : -.15 });
      g.fillStyle = 'rgba(255,160,170,.6)'; ell(g, cx - 100, ey + 60, 22, 12); g.fill(); ell(g, cx + 100, ey + 60, 22, 12); g.fill();
      const my = y0 + 230;
      if (pose === 'atk') {
        // miệng (nắp) mở to, quần áo bay ra
        g.beginPath(); g.moveTo(x0 + 26, my - 10); g.quadraticCurveTo(cx, my + 130, x0 + bw - 26, my - 10); g.quadraticCurveTo(cx, my + 20, x0 + 26, my - 10); g.closePath();
        g.fillStyle = '#5a1418'; g.fill(); stroke(g, 9);
        g.beginPath(); g.moveTo(cx - 60, my + 60); g.quadraticCurveTo(cx - 140, my + 90, cx - 170, my + 40); g.lineWidth = 24; g.strokeStyle = '#ff6b8f'; g.lineCap = 'round'; g.stroke();
        for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(x0 + 40 + i * 25, my - 4); g.lineTo(x0 + 52 + i * 25, my + 10); g.lineWidth = 6; g.strokeStyle = '#d6dbe4'; g.stroke(); }
      } else {
        g.beginPath(); g.moveTo(x0 + 30, my); g.quadraticCurveTo(cx, my + (pose === 'ko' ? -30 : 28), x0 + bw - 30, my); g.lineWidth = 12; g.strokeStyle = OL; g.stroke();
        for (let i = 0; i < 10; i++) { const tx = x0 + 42 + i * 22, ty = my + Math.sin(i / 9 * Math.PI) * (pose === 'ko' ? -24 : 22); g.beginPath(); g.moveTo(tx, ty - 7); g.lineTo(tx, ty + 7); g.lineWidth = 5; g.strokeStyle = '#d6dbe4'; g.stroke(); }
        ell(g, x0 + bw - 32, my + 4, 12, 18); g.fillStyle = '#c9ced8'; g.fill(); stroke(g, 5);
      }
      g.restore();
      if (pose === 'ko') {
        g.save(); // đồ rơi ra: tất, áo
        g.fillStyle = '#ff6b8f'; g.beginPath(); g.roundRect(cx + 150, gy - 46, 60, 26, 12); g.fill(); stroke(g, 5);
        g.fillStyle = '#FFD91F'; g.beginPath(); g.moveTo(cx - 230, gy - 10); g.lineTo(cx - 200, gy - 60); g.lineTo(cx - 160, gy - 50); g.lineTo(cx - 150, gy - 10); g.closePath(); g.fill(); stroke(g, 5);
        g.fillStyle = '#ffd91f'; g.strokeStyle = OL; g.lineWidth = 5; for (const [sx, sy] of [[cx - 60, 40], [cx + 40, 22], [cx + 130, 48]]) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 9 : 22; g.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke(); }
        g.restore();
      }
      return { c, ax: cx, gy };
    }
    const save = (o, type) => ({ data: o.c.toDataURL(type, type === 'image/webp' ? .9 : .88), w: o.c.width, h: o.c.height, ax: Math.round(o.ax), gy: Math.round(o.gy) });
    const res = {};
    for (const pose of ['idle', 'atk', 'ko']) { res['trainee-' + pose] = save(crab(pose), 'image/webp'); res['hotel-' + pose] = save(vali(pose), 'image/webp'); }
    // tranh VS 600×800: nền sảnh mờ (v4/bg) + quái đứng trước, quầng sáng sau lưng
    const load = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = src; });
    async function vs(bgSrc, draw, col) {
      const c = mk(600, 800), g = c.getContext('2d'), im = await load(bgSrc);
      const s = 800 / im.height; g.drawImage(im, (600 - im.width * s) / 2, 0, im.width * s, 800);
      g.fillStyle = lin(g, 0, 0, 0, 800, [[0, 'rgba(10,8,20,.05)'], [.6, 'rgba(10,8,20,.1)'], [1, 'rgba(10,8,20,.55)']]); g.fillRect(0, 0, 600, 800);
      g.fillStyle = rad(g, 300, 470, 10, 330, [[0, col], [1, 'rgba(0,0,0,0)']]); g.fillRect(0, 0, 600, 800);
      const o = draw('idle'), sc = Math.min(560 / o.c.width, 640 / o.c.height);
      g.drawImage(o.c, 300 - o.ax * sc, 770 - o.gy * sc, o.c.width * sc, o.c.height * sc);
      return c.toDataURL('image/jpeg', .88);
    }
    res.vsT = await vs(bgT, crab, 'rgba(255,170,120,.55)');
    res.vsH = await vs(bgH, vali, 'rgba(140,190,255,.55)');
    return res;
  }, { bgT: bg('trainee'), bgH: bg('hotel') });
  const wr = (f, d) => fs.writeFileSync(path.join(ROOT, f), Buffer.from(d.split(',')[1], 'base64'));
  const table = {};
  for (const k of Object.keys(out)) {
    if (k === 'vsT') wr('v4/vs/trainee.jpg', out[k]); else if (k === 'vsH') wr('v4/vs/hotel.jpg', out[k]);
    else { wr('v4/sprites/' + k + '.webp', out[k].data); table[k] = [out[k].w, out[k].h, out[k].ax, out[k].gy]; }
  }
  console.log(JSON.stringify(table));
  await b.close();
})();
