/* Kịch bản bản đồ: gặp ông Vương, đấu quái, nhảy qua quái nhỏ, đấu Đại quái (sai rồi đúng), tới cổng, vào trận. Dùng: node tools/test/city.js [OUT] [rộng] [cao]
   Cần: máy chủ tĩnh ở thư mục repo (python3 -m http.server 8765 --bind 127.0.0.1) hoặc đặt BASE=... ; Playwright + Chromium. */
const BASE = process.env.BASE || 'http://127.0.0.1:8765';
const { chromium } = require('playwright');
const SP = process.argv[2] || require('path').join(__dirname, 'out'), W = +process.argv[3] || 390, H = +process.argv[4] || 844, O = `${SP}/m7/${W}-city-`;
(async () => {
  try { for (const d of ['m7', 'm14', 'm15', 'm16', 'm17', 'm21']) require('fs').mkdirSync(require('path').join(process.argv[2] || require('path').join(__dirname, 'out'), d), { recursive: true }); } catch (e) {}
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); const errs = [], ext = new Set(), log = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text().slice(0, 200)); });
  p.on('request', r => { const u = new URL(r.url()); if (u.host !== new URL(BASE).host && !/^(data|blob):/.test(u.protocol)) ext.add(u.host); });
  await p.addInitScript(() => { try { if (!sessionStorage.getItem('k')) { localStorage.clear(); sessionStorage.setItem('k', '1'); } } catch (e) {} });
  await p.goto(BASE + '/game.html'); await p.waitForTimeout(500);
  const M = () => p.evaluate(() => ({ h: window.__bao.WorldMap.hero, duel: window.__bao.WorldMap.duel, talking: window.__bao.WorldMap.talking, cur: window.__bao.WorldMap.cur }));
  const shot = n => p.screenshot({ path: O + n + '.png' });
  const walkUntil = async (cond, ms = 9000) => { await p.keyboard.down('ArrowRight'); const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await p.evaluate(cond)) break; await p.waitForTimeout(80); } await p.keyboard.up('ArrowRight'); };
  await p.tap('#btnStart'); await p.waitForTimeout(800);
  await shot('01prologue');
  await p.evaluate(() => document.getElementById('talkNext').click()); await p.waitForTimeout(500);
  await shot('02start');
  await walkUntil(() => window.__bao.WorldMap.talking, 6000); await p.waitForTimeout(500);
  await shot('03wang'); log.push('at wang ' + JSON.stringify(await M()));
  // trả lời ông Vương
  await p.evaluate(() => document.getElementById('talkNext').click()); await p.waitForTimeout(200);
  await p.evaluate(() => { const n = window.__bao.STORY[0]; [...document.querySelectorAll('#talkOpts button')].find(b => b.querySelector('b').textContent === n.opts[n.ok][0]).click(); }); await p.waitForTimeout(900);
  await p.evaluate(() => document.getElementById('talkNext').click()); await p.waitForTimeout(300);
  // đi tiếp tới quái đầu tiên
  await walkUntil(() => !!window.__bao.WorldMap.duel, 6000); await p.waitForTimeout(700);
  await shot('04duel'); log.push('duel1 ' + JSON.stringify(await M()));
  // trả lời đúng
  await p.evaluate(() => { const B = window.__bao, d = B.WorldMap.duel, q = B.QUESTIONS.find(x => x.id === d.q); const ok = q.options[q.answer]; [...document.querySelectorAll('#duelOpts button')].find(b => b.querySelector('b').textContent === ok).click(); }); await p.waitForTimeout(500);
  await shot('05duel-ok');
  await p.evaluate(() => document.getElementById('duelNext').click()); await p.waitForTimeout(250);
  await shot('06attack'); await p.waitForTimeout(900);
  log.push('mons ' + JSON.stringify((await p.evaluate(() => window.__bao.WorldMap.mons)).filter(m => m.d === 0)));
  // nhảy qua quái nhỏ thứ hai: đi tới gần rồi nhảy
  await p.evaluate(() => { const B = window.__bao; const m = B.WorldMap.mons.find(x => x.d === 0 && !x.dead && !x.big); window.__mx = m ? m.x : 0; });
  await p.keyboard.down('ArrowRight');
  for (let i = 0; i < 80; i++) { const st = await p.evaluate(() => ({ x: window.__bao.WorldMap.hero.x, mx: window.__mx, duel: !!window.__bao.WorldMap.duel })); if (st.duel) break; if (st.mx && st.mx - st.x < 46) { await p.keyboard.press('ArrowUp'); await p.waitForTimeout(150); await shot('07jump'); await p.waitForTimeout(500); break; } await p.waitForTimeout(60); }
  await p.keyboard.up('ArrowRight');
  log.push('after jump ' + JSON.stringify(await M()));
  if ((await M()).duel) { await p.evaluate(() => { const B = window.__bao, d = B.WorldMap.duel, q = B.QUESTIONS.find(x => x.id === d.q); [...document.querySelectorAll('#duelOpts button')].find(b => b.querySelector('b').textContent === q.options[q.answer]).click(); }); await p.waitForTimeout(400); await p.evaluate(() => document.getElementById('duelNext').click()); await p.waitForTimeout(1200); }
  // đại quái chặn đường: trả lời sai trước
  await walkUntil(() => !!window.__bao.WorldMap.duel, 8000); await p.waitForTimeout(700);
  log.push('big duel ' + JSON.stringify(await M()));
  await p.evaluate(() => { const B = window.__bao, d = B.WorldMap.duel, q = B.QUESTIONS.find(x => x.id === d.q); [...document.querySelectorAll('#duelOpts button')].find(b => b.querySelector('b').textContent !== q.options[q.answer]).click(); }); await p.waitForTimeout(500);
  await shot('08duel-wrong');
  await p.evaluate(() => document.getElementById('duelNext').click()); await p.waitForTimeout(300);
  await shot('09knockback'); await p.waitForTimeout(1600);
  await walkUntil(() => !!window.__bao.WorldMap.duel, 6000); await p.waitForTimeout(700);
  await p.evaluate(() => { const B = window.__bao, d = B.WorldMap.duel, q = B.QUESTIONS.find(x => x.id === d.q); [...document.querySelectorAll('#duelOpts button')].find(b => b.querySelector('b').textContent === q.options[q.answer]).click(); }); await p.waitForTimeout(400);
  log.push('big2 ' + JSON.stringify(await M()));
  await p.evaluate(() => document.getElementById('duelNext').click()); await p.waitForTimeout(1300);
  log.push('after big2 ' + JSON.stringify(await M()) + ' ' + JSON.stringify((await p.evaluate(() => window.__bao.WorldMap.mons)).filter(m => m.d === 0)));
  // tới cổng trạm
  await walkUntil(() => Math.abs(window.__bao.WorldMap.hero.x - window.__bao.WorldMap.gateX(0)) < 20, 6000); await p.waitForTimeout(500);
  await shot('10gate'); log.push('gate ' + JSON.stringify(await M()) + ' btn=' + await p.evaluate(() => document.getElementById('btnEnterStage').textContent));
  // thử đi tiếp: bị rào chắn
  await walkUntil(() => false, 1800); await p.waitForTimeout(200);
  await shot('11wall'); log.push('wall ' + JSON.stringify(await M()));
  await p.evaluate(() => document.getElementById('btnEnterStage').click());
  await p.waitForFunction(() => !window.__bao.WorldMap.walking && Math.abs(window.__bao.WorldMap.hero.x - window.__bao.WorldMap.gateX(0)) < 30, null, { timeout: 8000 }); await p.waitForTimeout(400);
  log.push('auto-walked: ' + JSON.stringify(await M()) + ' btn=' + await p.evaluate(() => document.getElementById('btnEnterStage').textContent) + ' padA hidden=' + await p.evaluate(() => document.getElementById('padA').hidden));
  await p.evaluate(() => document.getElementById('padA').click()); await p.waitForTimeout(2200);
  log.push('in battle: ' + await p.evaluate(() => document.getElementById('sGame').classList.contains('on') + ' stage=' + window.__bao.stageIdx));
  await shot('12battle');
  console.log(JSON.stringify({ W, H, errs, ext: [...ext], log }, null, 1));
  await b.close();
})();
