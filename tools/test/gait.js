/* Kiểm tra pha chân khi chạy: chân chạm đất phải lùi về sau. Dùng: node tools/test/gait.js
   Cần: máy chủ tĩnh ở thư mục repo (python3 -m http.server 8765 --bind 127.0.0.1) hoặc đặt BASE=... ; Playwright + Chromium. */
const BASE = process.env.BASE || 'http://127.0.0.1:8765';
const { chromium } = require('playwright');
(async () => {
  try { for (const d of ['m7', 'm14', 'm15', 'm16', 'm17', 'm21']) require('fs').mkdirSync(require('path').join(process.argv[2] || require('path').join(__dirname, 'out'), d), { recursive: true }); } catch (e) {}
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto(BASE + '/game.html'); await p.waitForTimeout(400);
  const r = await p.evaluate(async () => {
    const { Rig, Chibi } = window.__bao; Rig.load('hero1'); Rig.load('trainee-idle');
    await new Promise(r => setTimeout(r, 800));
    const out = {};
    for (const [name, ref] of [['hero1', Chibi.POSES.stand], ['trainee-idle', Chibi.POSES.stand]]) {
      const R = Rig.get(name), rows = [];
      let prev = null;
      for (let i = 0; i <= 20; i++) {
        const ph = i / 20, pz = Rig.gait(ref, ph, true, 1);
        Rig.pose(R, pz, ref, { arm: 1, leg: 1 }, 1);
        const aF = Rig.xf(R, 8, R.d.pts.ankF), aB = Rig.xf(R, 10, R.d.pts.ankB), hip = Rig.xf(R, 0, R.d.bones[0].j);
        const low = aF[1] > aB[1] ? 'F' : 'B', lx = (low === 'F' ? aF[0] : aB[0]) - hip[0];
        if (prev && prev.low === low) rows.push(Math.sign(lx - prev.lx) * R.d.fs);
        prev = { low, lx };
      }
      out[name] = { fs: Rig.get(name).d.fs, plantedMovesForward: rows.filter(v => v > 0).length, plantedMovesBack: rows.filter(v => v < 0).length };
    }
    return out;
  });
  console.log(JSON.stringify(r));
  const ok = Object.values(r).every(v => v.plantedMovesBack > v.plantedMovesForward * 1.5);
  console.log(ok ? 'Pha chân: ĐẠT' : 'Pha chân: KHÔNG ĐẠT (chân chạm đất đi tới → dáng đi ngược)');
  await b.close();
  process.exitCode = ok ? 0 : 1;
})();
