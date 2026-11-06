/* Boss đánh nhử lúc chờ trả lời: máu tướng phải giữ nguyên. Dùng: node tools/test/feint.js [OUT] [trạm 0-4]
   Cần: máy chủ tĩnh ở thư mục repo (python3 -m http.server 8765 --bind 127.0.0.1) hoặc đặt BASE=... ; Playwright + Chromium. */
const BASE = process.env.BASE || 'http://127.0.0.1:8765';
const { chromium } = require('playwright');
const SP = process.argv[2] || require('path').join(__dirname, 'out'), si = +process.argv[3] || 2, O = `${SP}/m7/wait-${si}-`;
(async () => {
  try { for (const d of ['m7', 'm14', 'm15', 'm16', 'm17', 'm21']) require('fs').mkdirSync(require('path').join(process.argv[2] || require('path').join(__dirname, 'out'), d), { recursive: true }); } catch (e) {}
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(() => { window.__fightMode = 'quiz'; });   // đánh nhử chỉ có ở kiểu cũ
  await p.goto(BASE + '/game.html'); await p.waitForTimeout(400);
  await p.evaluate(si => { const B = window.__bao; B.prog.unlock = 4; B.prog.met._intro = true; B.startStage(si); }, si);
  // chờ tới lúc boss bắt đầu lao (đánh nhử)
  await p.waitForFunction(() => { const s = window.__bao.battle._state; return s.boss.act && s.press.on && s.boss.x < 260; }, null, { timeout: 15000 }).catch(() => {});
  const el = await p.$('#arena');
  for (let i = 0; i < 21; i++) { await el.screenshot({ path: O + String(i).padStart(2, '0') + '.png' }); await p.waitForTimeout(40); }
  console.log(JSON.stringify({ errs, hp: await p.evaluate(() => window.__bao.st.hero) }));
  await b.close();
})();
