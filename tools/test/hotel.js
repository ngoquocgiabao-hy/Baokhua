/* Kiểm thử bản thử game Khách sạn mới (hotel/proto). Dùng: node tools/test/hotel.js [OUT]
   Kiểm ở 360×640 và 390×844: không lỗi console, không gọi máy chủ ngoài; khách vào → câu hỏi → trả lời đúng → thẻ vào Bộ thẻ;
   lịch ôn kiểu Anki (khoảng cách ôn đúng, thẻ đến hạn hiện số đỏ, ôn xong thì giảm); 3 bảng Thẻ từ; lên sao mở bài + đồ mới; chữ cấm.
   Cần: máy chủ tĩnh ở thư mục repo (python3 -m http.server 8765 --bind 127.0.0.1) hoặc đặt BASE=... ; Playwright + Chromium. */
const BASE = process.env.BASE || 'http://127.0.0.1:8765';
const { chromium } = require('playwright');
const OUT = process.argv[2] || require('path').join(__dirname, 'out'); require('fs').mkdirSync(OUT, { recursive: true });
const BAD = /miễn phí|hoàn tiền|S-VIP/i;
(async () => {
  const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
  let fail = 0; const ck = (ok, msg) => { console.log((ok ? '  đạt  ' : '  LỖI  ') + msg); if (!ok) fail++; };
  for (const [W, H] of [[360, 640], [390, 844]]) {
    console.log(`== ${W}×${H}`);
    const ctx = await b.newContext({ viewport: { width: W, height: H }, isMobile: true, hasTouch: true });
    const p = await ctx.newPage(); const errs = [], ext = new Set();
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
    p.on('request', r => { const u = new URL(r.url()); if (u.host !== new URL(BASE).host && !/^(data|blob):/.test(u.protocol)) ext.add(u.host); });
    await p.goto(BASE + '/hotel/proto/index.html'); await p.waitForTimeout(800);
    // 1) đón khách: chạm sàn gần quầy để Ā Bǎo ra quầy, chờ câu hỏi
    const t0 = Date.now(); let ph = '';
    while (Date.now() - t0 < 25000) { ph = await p.evaluate(() => __proto.phase); if (ph === 'ask') break; await p.waitForTimeout(250); }
    ck(ph === 'ask', 'khách tới quầy, hiện câu hỏi (' + ph + ')');
    await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/hotel-${W}-ask.png` });
    const box = await p.evaluate(() => { const a = document.getElementById('ask').getBoundingClientRect(); return { top: a.top, bottom: a.bottom }; });
    ck(box.bottom <= H + 1, 'bảng câu hỏi nằm trọn trong màn (đáy ' + Math.round(box.bottom) + ')');
    const r = await p.evaluate(() => { const P = __proto, c = P.cur, i = [...document.querySelectorAll('#askOpts button')].findIndex(b => b.textContent === c.ex[2]); P.answer(i); return { id: c.id, has: !!P.S.cards[c.id], ex: c.ex[0], includes: c.ex[0].includes(c.zh) }; });
    ck(r.has, 'trả lời đúng → thẻ ' + r.id + ' vào Bộ thẻ'); ck(r.includes, 'câu khách nói có chứa từ của thẻ');
    await p.waitForTimeout(700); await p.screenshot({ path: `${OUT}/hotel-${W}-reply.png` });
    // 2) lịch ôn kiểu Anki
    const srs = await p.evaluate(() => { const P = __proto, S = P.S, DAY = 864e5, now = Date.now();
      const iv = g => P.nextIvl(null, g); const out = { newG: [0, 1, 2, 3].map(iv) };
      const c = { ivl: 3, ease: 2.5, reps: 2, lapses: 0, due: now }; out.rev = [0, 1, 2, 3].map(g => P.nextIvl(c, g));
      S.cards.xiexie = { ivl: 2, ease: 2.5, reps: 2, lapses: 0, due: now - 3600e3, seen: now }; S.cards.zaijian = { ivl: 5, ease: 2.5, reps: 3, lapses: 0, due: now + 9 * DAY, seen: now };
      P.hud(); out.due = P.dueList(); out.badge = document.getElementById('dueBadge').textContent; out.badgeHidden = document.getElementById('dueBadge').hidden;
      P.grade('xiexie', 2); out.afterDue = P.dueList().includes('xiexie'); out.ivl = S.cards.xiexie.ivl; out.dueDays = Math.round((S.cards.xiexie.due - P.dayStart()) / DAY);
      P.grade('zaijian', 0); out.lapse = { reps: S.cards.zaijian.reps, mins: Math.round((S.cards.zaijian.due - Date.now()) / 6e4), now: P.dueNow().includes('zaijian'), today: P.dueList().includes('zaijian') };
      out.nihaoTomorrow = !P.dueList().includes('nihao');
      S.cards.duibuqi = { ivl: 1, ease: 2.5, reps: 1, lapses: 0, due: now - 60e3, seen: now }; P.hud(); return out; });
    ck(JSON.stringify(srs.newG) === JSON.stringify([[0, 1], [0, 10], [1], [4]]), 'thẻ mới: Lại 1 phút, Khó 10 phút, Được 1 ngày, Dễ 4 ngày');
    ck(srs.rev[0][0] === 0 && srs.rev[1][0] === 4 && srs.rev[2][0] === 8 && srs.rev[3][0] === 10, 'thẻ đang ôn (3 ngày): Lại 10 phút, Khó 4, Được 8, Dễ 10 ngày (' + JSON.stringify(srs.rev) + ')');
    ck(srs.due.includes('xiexie') && !srs.due.includes('zaijian') && srs.badge !== '0' && !srs.badgeHidden, 'thẻ đến hạn hiện trong "hôm nay cần ôn" + số đỏ trên nút 📚');
    ck(!srs.afterDue && srs.ivl === 5 && srs.dueDays === 5, 'ôn "Được" → hết hạn hôm nay, hẹn 5 ngày sau');
    ck(srs.lapse.reps === 0 && srs.lapse.mins >= 9 && srs.lapse.mins <= 10 && !srs.lapse.now && srs.lapse.today, 'quên ("Lại") → học lại sau 10 phút (vẫn tính trong hôm nay, chưa hiện ngay)');
    ck(srs.nihaoTomorrow, 'thẻ hẹn 1 ngày không bị tính là đến hạn hôm nay');
    // 3) bảng Thẻ từ: ôn hôm nay (lật thẻ, chấm), bộ thẻ, giáo trình
    await p.evaluate(() => __proto.openSheet('review')); await p.waitForTimeout(600);
    const rv = await p.evaluate(() => ({ flip: !!document.getElementById('flip'), grades: document.getElementById('grades') && document.getElementById('grades').hidden }));
    ck(rv.flip && rv.grades === true, 'Ôn hôm nay: có thẻ lật, nút chấm ẩn trước khi lật');
    await p.click('#flip'); await p.waitForTimeout(700); await p.screenshot({ path: `${OUT}/hotel-${W}-review.png` });
    const g = await p.evaluate(() => { const before = __proto.dueNow().length; const bt = document.querySelector('#grades [data-g="2"]'); const vis = !document.getElementById('grades').hidden; bt.click(); return { vis, before, after: __proto.dueNow().length }; });
    ck(g.vis && g.after === g.before - 1, `lật thẻ → hiện 4 nút chấm; chấm "Được" → còn ${g.after}/${g.before} thẻ cần ôn`);
    for (const t of ['deck', 'course']) { await p.click(`.tabs button[data-tab="${t}"]`); await p.waitForTimeout(400); await p.screenshot({ path: `${OUT}/hotel-${W}-${t}.png` }); }
    const crs = await p.evaluate(() => ({ units: document.querySelectorAll('.unit').length, link: !!document.querySelector('a[href$="membership.html"]'), txt: document.body.innerText }));
    ck(crs.units === 6 && crs.link, 'Giáo trình: 6 bài HSK0 → HSK4 + nút Học online');
    await p.evaluate(() => __proto.closeSheet());
    // 4) lên sao → mở bài + đồ mới
    await p.evaluate(() => { __proto.S.pts = 80; __proto.hud(); }); await p.waitForTimeout(3600);
    const up = await p.evaluate(() => ({ star: __proto.starLv(), tank: __proto.UNLOCK[1].g.visible, lamp: __proto.UNLOCK[2].g.visible, toast: document.getElementById('toast').textContent }));
    ck(up.star === 2 && up.tank && up.lamp, 'lên 2★ → hiện bể cá + đèn chùm');
    await p.waitForTimeout(2600); await p.screenshot({ path: `${OUT}/hotel-${W}-upgrade.png` });
    // 5) chữ cấm, lỗi, gọi ngoài
    const allText = await p.evaluate(() => document.body.innerText + JSON.stringify(__proto.COURSE, (k, v) => k === 'unit' ? undefined : v));
    ck(!BAD.test(allText), 'không có chữ cấm (miễn phí, hoàn tiền, S-VIP)');
    ck(!errs.length, 'không lỗi console' + (errs.length ? ': ' + errs.join(' | ') : ''));
    ck(!ext.size, 'không gọi máy chủ ngoài' + (ext.size ? ': ' + [...ext].join(',') : ''));
    await ctx.close();
  }
  await b.close();
  console.log(fail ? `Game Khách sạn mới: KHÔNG ĐẠT (${fail} lỗi)` : 'Game Khách sạn mới: ĐẠT');
  process.exitCode = fail ? 1 : 0;
})();
