/* Đánh thật (v12): máy tự đánh từng trạm — bấm phi tiêu/chém, né khi boss báo "!", tung tuyệt chiêu + trả lời đúng.
   Ghi: thắng/thua, máu mất, số câu hỏi, thời gian. Dùng: node tools/test/fight.js [OUT] [trạm 0-4|all] [kiểu: gioi|kem]
   "kem" = không bao giờ né (để xem boss có gây mất máu thật và độ khó tăng dần). */
const BASE = process.env.BASE || 'http://127.0.0.1:8765';
const { chromium } = require('playwright');
const OUT = process.argv[2] || require('path').join(__dirname, 'out'), which = process.argv[3] || 'all', style = process.argv[4] || 'gioi';
(async () => {
  require('fs').mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const res = [];
  for (const si of which === 'all' ? [0, 1, 2, 3, 4] : [+which]) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 150)); });
    await p.goto(BASE + '/game.html'); await p.waitForTimeout(400);
    await p.evaluate(si => { const B = window.__bao; B.prog.unlock = 4; B.prog.met._intro = true; B.startStage(si); }, si);
    await p.waitForTimeout(2700);
    const t0 = Date.now(); let out = null, k = 0, shot = 0;
    while (Date.now() - t0 < 150000) {
      const s = await p.evaluate(style => {
        const B = window.__bao, st = B.st, bt = B.battle._state;
        if (!st || st._ended) return { end: true };
        const up = document.querySelector('#upOverlay.on'); if (up) { up.querySelector('#upOpts button').click(); return { a: 'up' }; }
        if (document.getElementById('exNext')) { document.getElementById('exNext').click(); return { a: 'next' }; }
        if (document.getElementById('sGame').classList.contains('asking')) { B.forceCorrect(); return { a: 'answer' }; }
        // v13 chiêu chữ: giỏi chọn đúng nghĩa, kém chọn bừa
        if (st.word) { const bs = [...document.querySelectorAll('#parryOpts button')]; const i = style === 'gioi' ? st.word.ok : Math.floor(Math.random() * bs.length); if (bs[i]) bs[i].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); return { a: 'parry' }; }
        if (style === 'gioi' && bt.act.hitIn > 0 && bt.act.hitIn < .4) { document.getElementById('abD').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); return { a: 'dodge' }; }
        if (st.energy >= 100) { document.getElementById('abU').click(); return { a: 'ult' }; }
        const id = Math.random() < .55 ? 'abA' : 'abB';
        document.getElementById(id).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        return { a: id, boss: Math.round(st.boss), hero: Math.round(st.hero) };
      }, style);
      if (s.end) break;
      if (s.a === 'ult' && shot < 1) { shot++; await p.waitForTimeout(300); await p.screenshot({ path: `${OUT}/fight-${si}-ultq.png` }); }
      if (k++ === 25) await (await p.$('#sGame')).screenshot({ path: `${OUT}/fight-${si}-pad.png` });
      await p.waitForTimeout(s.a === 'answer' ? 2600 : 160);
    }
    out = await p.evaluate(() => { const st = window.__bao.st; return { win: st.boss <= 0, heroLeft: Math.round(st.hero), heroMax: st.heroMax, asked: st.answered, correct: st.correct, parry: st.parryOk + '/' + st.parryN, hitMax: st.hitMax, ended: !!st._ended }; });
    res.push(Object.assign({ stage: si, secs: Math.round((Date.now() - t0) / 1000), errs }, out));
    await p.close();
  }
  console.log(JSON.stringify(res, null, 1));
  await b.close();
})();
