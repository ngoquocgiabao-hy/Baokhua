/* Quay chậm một chiêu trong trận. Dùng: node tools/test/slowmo.js [OUT] <tam|phong|anh|tram|long|boss|intro> [trạm] [độ chậm] [số khung]
   Cần: máy chủ tĩnh ở thư mục repo (python3 -m http.server 8765 --bind 127.0.0.1) hoặc đặt BASE=... ; Playwright + Chromium. */
const BASE = process.env.BASE || 'http://127.0.0.1:8765';
const { chromium } = require('playwright');
const SP = process.argv[2] || require('path').join(__dirname, 'out'), which = process.argv[3], si = +(process.argv[4] || 2), K = +(process.argv[5] || 6), N = +(process.argv[6] || 16);
(async () => {
  try { for (const d of ['m7', 'm14', 'm15', 'm16', 'm17', 'm21']) require('fs').mkdirSync(require('path').join(process.argv[2] || require('path').join(__dirname, 'out'), d), { recursive: true }); } catch (e) {}
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(() => { window.__forceGL = 1; }); await p.goto(BASE + '/game.html'); await p.waitForTimeout(500);
  await p.evaluate(si => { const B = window.__bao; B.prog.unlock = 4; B.prog.met._intro = true; B.startStage(si); }, si);
  if (which === 'intro') { await p.evaluate(K => window.__bao.battle._slow(1 / K), K); }
  else { await p.waitForTimeout(3300); await p.evaluate(() => window.__bao.battle.pressure(false)); await p.waitForTimeout(400); await p.evaluate(() => window.__bao.battle.setVisual({ skillLv: 2, atk: 2 })); }
  const force = r => { const o = Math.random; let n = 0; Math.random = () => { if (++n <= 3) { if (n === 3) Math.random = o; return r; } return o(); }; };
  if (which !== 'intro') await p.evaluate(([w, K]) => {
    const B = window.__bao.battle; B._slow(1 / K);
    const f = r => { const o = Math.random; let n = 0; Math.random = () => { if (++n <= 3) { if (n === 3) Math.random = o; return r; } return o(); }; };
    if (w === 'tam') { f(.9); B.playHeroAttack('phi_tieu', { combo: 0 }); }
    else if (w === 'phong') { f(.1); B.playHeroAttack('phi_tieu', { combo: 3 }); }
    else if (w === 'anh') { f(.1); B.playHeroAttack('phi_tieu', { fast: true }); }
    else if (w === 'tram') B.playHeroAttack('chem_gio');
    else if (w === 'long') B.playHeroAttack('long_ha');
    else if (w === 'boss') B.playBossAttack();
  }, [which, K]);
  const el = await p.$('#arena');
  for (let i = 0; i < N; i++) { await el.screenshot({ path: `${SP}/m16/${which}${si}-${String(i).padStart(2, '0')}.png` }); }
  console.log(JSON.stringify({ errs, st: await p.evaluate(() => ({ h: window.__bao.battle._state.hero, rigOn: true })) }));
  await b.close();
})();
