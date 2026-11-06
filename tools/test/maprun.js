/* Quay Ā Bǎo chạy, nhảy trên bản đồ (ép bật khung xương). Dùng: node tools/test/maprun.js [OUT]
   Cần: máy chủ tĩnh ở thư mục repo (python3 -m http.server 8765 --bind 127.0.0.1) hoặc đặt BASE=... ; Playwright + Chromium. */
const BASE = process.env.BASE || 'http://127.0.0.1:8765';
const { chromium } = require('playwright');
const SP = process.argv[2] || require('path').join(__dirname, 'out');
(async () => {
  try { for (const d of ['m7', 'm14', 'm15', 'm16', 'm17', 'm21']) require('fs').mkdirSync(require('path').join(process.argv[2] || require('path').join(__dirname, 'out'), d), { recursive: true }); } catch (e) {}
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text().slice(0, 160)); });
  await p.addInitScript(() => { window.__forceGL = 1; }); await p.goto(BASE + '/game.html'); await p.waitForTimeout(500);
  await p.evaluate(() => { const B = window.__bao; B.prog.unlock = 4; B.prog.met = { _intro: true, wang: true, li: true, chen: true, mei: true, zhang: true }; B.prog.gk = { beach: true, hotel: true, factory: true, night: true }; B.openMap(); B.WorldMap._tp(1180); B.WorldMap._clearMons(); });
  await p.waitForTimeout(1200);
  await p.evaluate(() => window.__bao.WorldMap._clearMons());
  const w = await p.$('#world');
  await p.keyboard.down('ArrowRight'); await p.waitForTimeout(500);
  for (let i = 0; i < 10; i++) { await w.screenshot({ path: `${SP}/m17/run-${String(i).padStart(2, '0')}.png` }); }
  console.log('OV', await p.evaluate(() => [...document.querySelectorAll('.on')].map(e => e.id || e.className).join(' | ') + ' x=' + window.__bao.WorldMap.hero.x + ' duel=' + !!window.__bao.WorldMap.duel));
  await p.keyboard.press('ArrowUp');
  for (let i = 0; i < 6; i++) { await w.screenshot({ path: `${SP}/m17/jump-${String(i).padStart(2, '0')}.png` }); }
  await p.keyboard.up('ArrowRight'); await p.waitForTimeout(400);
  await p.evaluate(() => window.__bao.WorldMap._tp(4400 + 900)); await p.waitForTimeout(1500);
  await w.screenshot({ path: `${SP}/m17/gate.png` });
  await p.evaluate(() => window.__bao.WorldMap._tp(4400 + 450)); await p.waitForTimeout(1500);
  await w.screenshot({ path: `${SP}/m17/bong.png` });
  const fps = await p.evaluate(() => new Promise(r => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 1500) requestAnimationFrame(f); else r(Math.round(n / 1.5)); }; requestAnimationFrame(f); }));
  console.log(JSON.stringify({ errs, fps }));
  await b.close();
})();
