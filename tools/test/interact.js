/* Chụp cảnh tương tác: chào hỏi người đi đường, boss ở cổng khiêu chiến, quái thấy Ā Bǎo. Dùng: node tools/test/interact.js [OUT]
   Cần: máy chủ tĩnh ở thư mục repo (python3 -m http.server 8765 --bind 127.0.0.1) hoặc đặt BASE=... ; Playwright + Chromium. */
const BASE = process.env.BASE || 'http://127.0.0.1:8765';
const { chromium } = require('playwright');
const SP = process.argv[2] || require('path').join(__dirname, 'out');
(async () => {
  try { for (const d of ['m7', 'm14', 'm15', 'm16', 'm17', 'm21']) require('fs').mkdirSync(require('path').join(process.argv[2] || require('path').join(__dirname, 'out'), d), { recursive: true }); } catch (e) {}
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(() => { window.__forceGL = 1; });
  await p.goto(BASE + '/game.html'); await p.waitForTimeout(500);
  await p.evaluate(() => { const B = window.__bao; B.prog.unlock = 4; B.prog.met = { _intro: true, wang: true }; B.prog.gk = { beach: true, hotel: true }; B.openMap(); });
  await p.waitForTimeout(900);
  const w = await p.$('#world'), shot = n => w.screenshot({ path: `${SP}/m21/${n}.png` });
  const at = async (x, n, wait = 900) => { await p.evaluate(x => { window.__bao.WorldMap._tp(x); }, x); await p.waitForTimeout(wait); await shot(n); };
  await at(285, 'npc-met');             // ông Vương đã gặp: khen
  await at(1360, 'npc-new');            // cô Lý chưa gặp: hỏi đường
  await at(2060 - 70, 'gate-taunt');    // cổng HSK1
  await p.evaluate(() => window.__bao.WorldMap._tp(1100 + 1100 * .42 - 40)); await p.waitForTimeout(700); await shot('mon-near');
  await at(4400 + 300, 'bong-near', 900);
  await p.evaluate(() => window.__bao.WorldMap._tp(4400 + 150)); await p.waitForTimeout(4200); await shot('idle-long');
  console.log(JSON.stringify({ errs }));
  await b.close();
})();
