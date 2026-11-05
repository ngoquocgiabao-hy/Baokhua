/* Đo khung hình/giây bản đồ + trận, gom lỗi/cảnh báo console. Dùng: node tools/test/perf.js
   Cần: máy chủ tĩnh ở thư mục repo (python3 -m http.server 8765 --bind 127.0.0.1) hoặc đặt BASE=... ; Playwright + Chromium. */
const BASE = process.env.BASE || 'http://127.0.0.1:8765';
const { chromium } = require('playwright');
(async () => {
  try { for (const d of ['m7', 'm14', 'm15', 'm16', 'm17', 'm21']) require('fs').mkdirSync(require('path').join(process.argv[2] || require('path').join(__dirname, 'out'), d), { recursive: true }); } catch (e) {}
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ':' + m.text().slice(0, 120)); });
  await p.goto(BASE + '/game.html'); await p.waitForTimeout(500);
  const fps = () => p.evaluate(() => new Promise(r => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else r(Math.round(n / 2)); }; requestAnimationFrame(f); }));
  await p.evaluate(() => { const B = window.__bao; B.prog.unlock = 4; B.prog.met = { _intro: true, wang: true, li: true }; B.prog.gk = { beach: true }; B.openMap(); B.WorldMap._tp(1180); });
  await p.waitForTimeout(1000); await p.keyboard.down('ArrowRight');
  const mapFps = await fps(); await p.keyboard.up('ArrowRight');
  await p.evaluate(() => window.__bao.startStage(2)); await p.waitForTimeout(3000);
  const batFps = await fps();
  console.log(JSON.stringify({ mapFps, batFps, errs }));
  await b.close();
})();
