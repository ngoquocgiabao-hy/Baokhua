/* Kiểm dáng nhân vật (v14). Dùng: node tools/test/gait.js
   1) Đi/chạy (Rig.gait): chân KHÔNG bị uốn (giữ nguyên hình vẽ) và người có NẢY theo bước (không trượt).
   3) Ngả tới (lean > 0) phải đưa đầu về phía mặt nhìn (v15: trước đây bị ngược, nhân vật ngả ra sau khi chạy).
   2) Mọi tư thế game dùng, với hệ số tay chân thật của từng nhân vật: góc uốn từng khớp so với tư thế gốc
      nằm trong giới hạn an toàn (vượt quá là tranh bị xé: rách áo, tay rời thân, đũng quần kéo dài).
   Cần: máy chủ tĩnh ở thư mục repo (python3 -m http.server 8765 --bind 127.0.0.1) hoặc đặt BASE=... ; Playwright + Chromium. */
const BASE = process.env.BASE || 'http://127.0.0.1:8765';
const { chromium } = require('playwright');
const CH = ['hero1', 'hero2', 'hero3', 'factory-idle', 'night-idle', 'shadow-idle'];   // 06/11: cua + vali (trainee, hotel) là quái vẽ bằng code, không có khung xương
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto(BASE + '/game.html'); await p.waitForTimeout(400);
  const r = await p.evaluate(async CH => {
    const { Rig, Chibi } = window.__bao, P = Chibi.POSES;
    CH.forEach(n => Rig.load(n)); await new Promise(r => setTimeout(r, 1200));
    const GAIN = { hero: { arm: 1, leg: 1 }, trainee: { arm: .35, leg: .9 }, hotel: { arm: .2, leg: .9 }, factory: { arm: .45, leg: 1 }, night: { arm: .45, leg: 1 }, shadow: { arm: .25, leg: 1 } };
    const rot = (M, i) => Math.atan2(M[i * 6 + 3], M[i * 6]);
    const PAR = [-1, 0, 1, 1, 3, 1, 5, 0, 7, 0, 9];
    const local = (M, i) => { const a = rot(M, i) - (PAR[i] < 0 ? 0 : rot(M, PAR[i])); return Math.atan2(Math.sin(a), Math.cos(a)); };
    const scl = (M, i) => Math.hypot(M[i * 6], M[i * 6 + 3]) * Math.hypot(M[i * 6 + 1], M[i * 6 + 4]);
    const out = {};
    for (const n of CH) {
      const R = Rig.get(n); if (!R) { out[n] = { err: 'chưa tải' }; continue; }
      const look = n.split('-')[0], key = n.startsWith('hero') ? 'hero' : look;
      const ref = key === 'hero' ? P.stance : look === 'hotel' ? P.cross : look === 'trainee' ? P.stand : P.stance;
      Rig.pose(R, ref, ref, GAIN[key], 1); const base = Array.from(R.M);
      // 1) đi / chạy
      let legBend = 0, legScale = 0, yMin = 1e9, yMax = -1e9;
      for (const run of [false, true]) for (let i = 0; i < 24; i++) {
        Rig.pose(R, Rig.gait(ref, i / 24, run, 1), ref, GAIN[key], 1);
        for (const j of [7, 8, 9, 10]) { legBend = Math.max(legBend, Math.abs(local(R.M, j) - local(base, j))); legScale = Math.max(legScale, Math.abs(scl(R.M, j) - scl(base, j))); }
        const hip = Rig.xf(R, 0, R.d.bones[0].j)[1]; yMin = Math.min(yMin, hip); yMax = Math.max(yMax, hip);
      }
      // 2) mọi tư thế
      let worst = 0, worstAt = '';
      for (const nm of ['stance', 'stand', 'wave', 'windup', 'release', 'raise', 'chop', 'sweep', 'crouch', 'jump', 'kick', 'hurt', 'victory', 'cross']) {
        Rig.pose(R, P[nm], ref, GAIN[key], 1);
        for (let j = 1; j < 11; j++) { const d = Math.abs(local(R.M, j) - local(base, j)); if (d > worst) { worst = d; worstAt = nm + '#' + j; } }
      }
      // 3) v15: ngả tới (lean > 0) thì đầu phải chạy về phía mặt nhìn (fs), không được ngả ra sau
      Rig.pose(R, ref, ref, GAIN[key], 1); const h0 = Rig.xf(R, 2, R.d.pts.head)[0];
      Rig.pose(R, Object.assign({}, ref, { lean: (ref.lean || 0) + .2 }), ref, GAIN[key], 1); const leanFwd = Math.sign(Rig.xf(R, 2, R.d.pts.head)[0] - h0) === R.d.fs;
      out[n] = { legBend: +legBend.toFixed(3), legScale: +legScale.toFixed(3), bouncePx: Math.round(yMax - yMin), worstJoint: +worst.toFixed(2), worstAt, leanFwd };
    }
    return out;
  }, CH);
  console.log(JSON.stringify(r));
  const bad = Object.entries(r).filter(([n, v]) => v.err || v.legBend > .02 || v.legScale > .02 || v.bouncePx < 10 || v.worstJoint > .65 || !v.leanFwd);
  bad.forEach(([n, v]) => console.log('  KHÔNG ĐẠT', n, JSON.stringify(v)));
  console.log(bad.length ? 'Dáng nhân vật: KHÔNG ĐẠT' : 'Dáng nhân vật: ĐẠT (đi/chạy không uốn chân, có nảy; mọi tư thế trong giới hạn an toàn; ngả tới đúng hướng mặt)');
  await b.close();
  process.exitCode = bad.length ? 1 : 0;
})();
