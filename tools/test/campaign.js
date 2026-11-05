/* Chơi trọn 5 trạm bằng phím (đi bộ, gặp người, đấu quái, vào cổng, đánh boss). Dùng: node tools/test/campaign.js [OUT] [rộng] [cao] (thêm GL=1 để ép bật khung xương WebGL)
   Cần: máy chủ tĩnh ở thư mục repo (python3 -m http.server 8765 --bind 127.0.0.1) hoặc đặt BASE=... ; Playwright + Chromium. */
const BASE = process.env.BASE || 'http://127.0.0.1:8765';
const { chromium } = require('playwright');
const SP = process.argv[2] || require('path').join(__dirname, 'out'), W = +process.argv[3] || 390, H = +process.argv[4] || 844, O = `${SP}/m7/${W}-camp-`;
(async () => {
  try { for (const d of ['m7', 'm14', 'm15', 'm16', 'm17', 'm21']) require('fs').mkdirSync(require('path').join(process.argv[2] || require('path').join(__dirname, 'out'), d), { recursive: true }); } catch (e) {}
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  if (process.env.GL) await p.addInitScript(() => { window.__forceGL = 1; }); const errs = [], ext = new Set(), log = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text().slice(0, 200)); });
  p.on('request', r => { const u = new URL(r.url()); if (u.host !== new URL(BASE).host && !/^(data|blob):/.test(u.protocol)) ext.add(u.host); });
  await p.addInitScript(() => { try { if (!sessionStorage.getItem('k')) { localStorage.clear(); sessionStorage.setItem('k', '1'); } } catch (e) {} });
  await p.goto(BASE + '/game.html'); await p.waitForTimeout(500);
  await p.tap('#btnStart'); await p.waitForTimeout(800);
  let walking = false, cleared = 0, counts = {}, t0 = Date.now(), lastStage = -1;
  for (let step = 0; step < 4000 && cleared < 5 && Date.now() - t0 < 420000; step++) {
    const s = await p.evaluate(() => {
      const B = window.__bao, vis = id => { const e = document.getElementById(id); return e && !e.hidden && e.offsetParent !== null; };
      const up = document.querySelector('#upOverlay.on'); if (up) { up.querySelector('#upOpts button').click(); return 'up'; }
      if (document.querySelector('#clearOverlay.on')) return 'clear';
      if (document.getElementById('sGame').classList.contains('on')) {
        const st = B.st; if (!st || st._ended) return 'ended';
        if (document.getElementById('exNext')) { document.getElementById('exNext').click(); return 'next'; }
        B.forceCorrect(); return 'battle';
      }
      if (document.querySelector('#talkOverlay.on')) {
        const bs = [...document.querySelectorAll('#talkOpts button')].filter(x => x.offsetParent !== null);
        if (bs.length && !bs.some(x => x.disabled)) {
          const name = document.getElementById('talkName').textContent; const n = B.STORY.find(q => name.startsWith(q.who));
          const ok = n ? n.opts[n.ok][0] : null; const t = bs.find(x => x.querySelector('b') && x.querySelector('b').textContent === ok) || bs[0]; t.click(); return 'talk-ans';
        }
        if (vis('talkNext')) { document.getElementById('talkNext').click(); return 'talk'; }
        return 'talk-wait';
      }
      const d = B.WorldMap.duel;
      if (d) {
        if (vis('duelNext')) { document.getElementById('duelNext').click(); return 'duel-next'; }
        const q = B.QUESTIONS.find(x => x.id === d.q); const bs = [...document.querySelectorAll('#duelOpts button')];
        const t = bs.find(x => x.querySelector('b') && x.querySelector('b').textContent === q.options[q.answer]); if (t && !t.disabled) { t.click(); return 'duel-ans'; }
        return 'duel-wait';
      }
      if (document.getElementById('sMap').classList.contains('on')) {
        const h = B.WorldMap.hero, g = B.WorldMap.gateX(B.WorldMap.cur);
        if (h.x > g - 45) {
          if (Math.abs(h.x - g) < 30 && !B.WorldMap.walking && vis('padA')) { document.getElementById('padA').click(); return 'gate'; }
          return B.WorldMap.walking ? 'near-walking' : 'near';
        }
        return 'walk';
      }
      return 'other:' + [...document.querySelectorAll('.screen.on,section.on')].map(e => e.id).join(',');
    });
    const k = s.split(':')[0]; counts[k] = (counts[k] || 0) + 1;
    if (s === 'walk' && !walking) { await p.keyboard.down('ArrowRight'); walking = true; }
    if (s !== 'walk' && walking) { await p.keyboard.up('ArrowRight'); walking = false; }
    if (s === 'gate') { await p.waitForTimeout(2200); const si = await p.evaluate(() => window.__bao.stageIdx); log.push('stage ' + si + ' at ' + ((Date.now() - t0) / 1000 | 0) + 's'); if (si !== lastStage) { lastStage = si; await p.screenshot({ path: O + 'b' + si + '.png' }); } }
    if (s === 'clear') {
      cleared++; await p.waitForTimeout(1200); await p.screenshot({ path: O + 'clear' + cleared + '.png' });
      await p.evaluate(() => document.getElementById('clearBtn').click()); await p.waitForTimeout(500);
      const nx = await p.evaluate(() => { const e = document.getElementById('btnNextMap'); if (e && e.offsetParent !== null) { e.click(); return true; } return false; });
      log.push('cleared ' + cleared + ' next=' + nx + ' prog=' + JSON.stringify(await p.evaluate(() => ({ u: window.__bao.prog.unlock, gk: window.__bao.prog.gk, xp: window.__bao.prog.xp }))));
      await p.waitForTimeout(800); if (cleared === 1 || cleared === 3) await p.screenshot({ path: O + 'map' + cleared + '.png' });
    }
    if (s === 'near') { await p.evaluate(() => document.getElementById('btnEnterStage').click()); await p.waitForTimeout(600); }
    if (s.startsWith('other')) { log.push(s); await p.waitForTimeout(500); }
    await p.waitForTimeout(s === 'battle' ? 1400 : s === 'walk' ? 120 : s.startsWith('duel') || s.startsWith('talk') ? 450 : 700);
  }
  await p.screenshot({ path: O + 'end.png' });
  const fin = await p.evaluate(() => ({ prog: { u: window.__bao.prog.unlock, met: Object.keys(window.__bao.prog.met), gk: window.__bao.prog.gk, xp: window.__bao.prog.xp }, screens: [...document.querySelectorAll('.on')].map(e => e.id).filter(Boolean) }));
  console.log(JSON.stringify({ W, H, secs: (Date.now() - t0) / 1000 | 0, cleared, counts, errs, ext: [...ext], log, fin }, null, 1));
  await b.close();
})();
