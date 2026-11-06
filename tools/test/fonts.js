/* Kiểm phông chữ: chữ Việt không được vẽ bằng phông Trung (iPhone/Android sẽ trộn phông, mất dấu),
   chữ Hán phải nằm trong phần tử lang="zh-CN" (đúng nét giản thể), không dùng ký tự hiếm dễ hiện ô vuông.
   Đi qua: màn bắt đầu, lời dẫn, bản đồ, hội thoại người đi đường, đấu quái, câu hỏi tuyệt chiêu, đáp án, Sổ ôn, Sổ từ.
   Dùng: node tools/test/fonts.js [rộng] [cao]   (cần máy chủ tĩnh 127.0.0.1:8765 hoặc BASE=...) */
const BASE = process.env.BASE || 'http://127.0.0.1:8765';
const { chromium } = require('playwright');
const W = +process.argv[2] || 390, H = +process.argv[3] || 844;
const CJK_FONT = /PingFang|Hiragino|Noto Sans (CJK|SC)|Source Han|YaHei|SimHei|SimSun|Heiti/i;
const RARE = /[⤀-⥿⟰-⟿∘\u{1F977}]/u;
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); const errs = [];
  await p.addInitScript(() => { try { localStorage.clear(); } catch (e) {} });
  p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
  const audit = async label => p.evaluate(label => {
    const bad = [], VI = /[ăâđêôơưĂÂĐÊÔƠƯàảãáạằẳẵắặầẩẫấậèẻẽéẹềểễếệìỉĩíịòỏõóọồổỗốộờởỡớợùủũúụừửữứựỳỷỹýỵ]/i, HAN = /[㐀-鿿]/;
    const vis = e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false; const cs = getComputedStyle(e); return cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0; };
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const t = n.nodeValue, el = n.parentElement; if (!t.trim() || !el || !vis(el)) continue;
      if (el.closest('script,style')) continue;
      const fam = getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim();
      if (VI.test(t) && /PingFang|Hiragino|Noto Sans (CJK|SC)|Source Han|YaHei/i.test(fam)) bad.push(['vi-in-cjk-font', fam, t.slice(0, 50)]);
      if (HAN.test(t) && !el.closest('[lang^="zh"]')) bad.push(['han-no-lang', el.tagName + (el.id ? '#' + el.id : ''), t.slice(0, 50)]);
      if (/[⤀-⥿⟰-⟿∘]|\u{1F977}/u.test(t)) bad.push(['rare-glyph', t.slice(0, 40)]);
    }
    return { label, bad };
  }, label);
  const res = [];
  const go = async (label, fn, wait = 700) => { try { await fn(); } catch (e) { res.push({ label, bad: [['step-error', e.message.slice(0, 120)]] }); return; } await p.waitForTimeout(wait); res.push(await audit(label)); };
  await p.goto(BASE + '/game.html'); await p.waitForTimeout(700);
  await go('start', async () => {});
  await go('intro', () => p.tap('#btnStart'), 1300);
  await go('map', () => p.evaluate(() => document.getElementById('talkNext').click()), 900);
  await go('npc-talk', async () => { await p.evaluate(() => { const M = window.__bao.WorldMap; M._tp(M.NPC_X.wang - 14); }); await p.waitForTimeout(300); await p.keyboard.press('Enter'); await p.waitForTimeout(900);
    if (!(await p.evaluate(() => !!document.querySelector('#talkOverlay.on')))) throw new Error('không mở được hội thoại'); }, 300);
  await go('npc-answer', () => p.evaluate(() => { const n = document.getElementById('talkNext'); if (n && n.offsetParent) n.click(); }), 900);
  // đóng hội thoại đúng cách (bấm Tiếp tới khi tắt) rồi mở Sổ từ
  for (let i = 0; i < 6 && await p.evaluate(() => !!document.querySelector('#talkOverlay.on')); i++) {
    await p.evaluate(() => { const B = window.__bao, bs = [...document.querySelectorAll('#talkOpts button')].filter(x => !x.disabled && x.offsetParent), n = document.getElementById('talkNext');
      const npc = B.STORY.find(q => document.getElementById('talkName').textContent.startsWith(q.who)), ok = npc ? npc.opts[npc.ok][0] : null;
      if (bs.length) (bs.find(x => x.querySelector('b') && x.querySelector('b').textContent === ok) || bs[0]).click(); else if (n && n.offsetParent) n.click(); }); await p.waitForTimeout(700);
  }
  await go('words', () => p.evaluate(() => document.getElementById('wordBtn').click()), 600);
  await go('quests', () => p.evaluate(() => { document.getElementById('wordsClose').click(); document.getElementById('questBtn').click(); }), 500);
  await go('shop', () => p.evaluate(() => { document.getElementById('questClose').click(); document.getElementById('shopBtn').click(); }), 500);
  await p.evaluate(() => { document.getElementById('shopClose').click(); document.getElementById('wordBtn').click(); }); await p.waitForTimeout(300);
  await go('duel', async () => {
    await p.evaluate(() => document.getElementById('wordsClose').click()); await p.waitForTimeout(300);
    await p.evaluate(() => { const M = window.__bao.WorldMap, m = M.mons.find(x => !x.dead && x.d === M.cur); if (m) M._tp(m.x - 40); });
    await p.keyboard.down('ArrowRight'); await p.waitForTimeout(1500); await p.keyboard.up('ArrowRight'); await p.waitForTimeout(800);
    if (!(await p.evaluate(() => !!document.querySelector('#duelOverlay.on')))) throw new Error('không mở được thẻ đấu quái'); }, 300);
  await go('duel-result', () => p.evaluate(() => { const bs = [...document.querySelectorAll('#duelOpts button')]; if (bs[1]) bs[1].click(); }), 900);
  for (const si of [0, 1, 3]) {
    await go('battle-' + si, () => p.evaluate(si => { document.querySelectorAll('.overlay.on').forEach(o => o.classList.remove('on')); const B = window.__bao; B.prog.unlock = Math.max(B.prog.unlock || 0, si); B.startStage(si); }, si), 3000);
    for (let k = 0; k < 3; k++) {
      await go(`ult-${si}-${k}`, () => p.evaluate(() => { const B = window.__bao; B.st.energy = 100; document.getElementById('abU').click(); }), 700);
      await go(`explain-${si}-${k}`, () => p.evaluate(() => { const B = window.__bao, q = B.st.list[B.st.i]; const bs = [...document.querySelectorAll('#opts .opt')]; const w = bs.find(x => x.dataset.orig != String(q.answer)); if (w) w.click(); else B.forceCorrect(); }), 800);
      await p.evaluate(() => { const n = document.getElementById('exNext'); if (n) n.click(); }); await p.waitForTimeout(1800);
    }
    await go('end-' + si, () => p.evaluate(() => window.__bao.end(false)), 1500);
  }
  const fails = res.filter(r => r.bad.length);
  fails.forEach(r => console.log(r.label, JSON.stringify(r.bad.slice(0, 8))));
  console.log(JSON.stringify({ W, H, checked: res.length, failed: fails.length, errs }));
  console.log(fails.length || errs.length ? 'PHÔNG: CHƯA ĐẠT' : 'PHÔNG: ĐẠT');
  await b.close();
  process.exit(fails.length || errs.length ? 1 : 0);
})();
