/* Chụp từng khu của thành phố + đo khung hình/giây. Dùng: node tools/test/districts.js [OUT] [rộng] [cao]
   Cần: máy chủ tĩnh ở thư mục repo (python3 -m http.server 8765 --bind 127.0.0.1) hoặc đặt BASE=... ; Playwright + Chromium. */
const BASE = process.env.BASE || 'http://127.0.0.1:8765';
const { chromium } = require('playwright');
const SP = process.argv[2] || require('path').join(__dirname, 'out'), W = +process.argv[3] || 390, H = +process.argv[4] || 844;
(async () => {
  try { for (const d of ['m7', 'm14', 'm15', 'm16', 'm17', 'm21']) require('fs').mkdirSync(require('path').join(process.argv[2] || require('path').join(__dirname, 'out'), d), { recursive: true }); } catch (e) {}
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text().slice(0, 200)); });
  await p.goto(BASE + '/game.html'); await p.waitForTimeout(500);
  await p.evaluate(() => { const B = window.__bao; B.prog.unlock = 2; B.prog.met = { _intro: true, wang: true, li: true }; B.prog.gk = { beach: true }; B.openMap(); });
  await p.waitForTimeout(800);
  const spots = [[200, 'beach'], [700, 'beach2'], [1300, 'hotel'], [2040, 'hotel-gate'], [2350, 'factory'], [3300, 'night'], [3700, 'night2'], [4500, 'peak'], [5200, 'peak2']];
  const res = [];
  for (const [x, n] of spots) {
    await p.evaluate(x => { const B = window.__bao; if (x > 2200) B.prog.unlock = 4; B.WorldMap._tp(x); }, x);
    await p.waitForTimeout(900);
    const w = await p.$('#world'); await w.screenshot({ path: `${SP}/m15/${W}-${n}.png` });
    res.push(n);
  }
  const fps = await p.evaluate(() => new Promise(r => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 1500) requestAnimationFrame(f); else r(Math.round(n / 1.5)); }; requestAnimationFrame(f); }));
  console.log(JSON.stringify({ errs, fps, res }));
  await b.close();
})();
