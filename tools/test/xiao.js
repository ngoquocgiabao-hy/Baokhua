/* Kiểm thử đầu-cuối mini-game Ā Bǎo 消消乐 (hotel/xiao.html) và đường nối với game Khách sạn (hotel/index.html).
   node tools/test/xiao.js <thư mục ảnh> <rộng> <cao>     (cần máy chủ tĩnh ở http://127.0.0.1:8765, như run-all.sh)
   A. Chơi trong game Khách sạn: menu 📍 → ✨ 消消乐 mở trong khung → hết giờ → trả lời câu hỏi → thắng phòng 101
      → bấm "Về khách sạn" → khung đóng, xu khách sạn tăng, thẻ vừa ôn vào Sổ ôn.
   B. Chơi riêng xiao.html: thắng phòng → "Mang xu về khách sạn" → game Khách sạn nhận hộp thư, xu tăng, hộp thư rỗng.
   Kèm: 0 lỗi console, 0 gọi máy chủ ngoài, không tràn ngang, ảnh từng bước. In JSON kết quả, thoát 1 nếu hỏng. */
'use strict';
const { chromium } = require('playwright');
const OUT = process.argv[2] || 'tools/test/out', W = +process.argv[3] || 390, H = +process.argv[4] || 844;
const BASE = 'http://127.0.0.1:8765/hotel/';
const SEED = () => ({ lv: 1, tut: 'done', intro: true, coins: 100, pts: 60, star: 2, served: 5, answered: 5, correct: 5, cardV: 1, muted: true,
  cards: { nihao: { ivl: 0, ease: 2.5, reps: 1, lapses: 0, due: Date.now() - 60000, seen: Date.now() - 864e5 } } });

async function playRoom(fr, page, tag, shots) {
  // fr: frame (khung) hoặc page; chơi tới khi thắng, hết giờ thì trả lời đúng
  await fr.waitForFunction(() => window.__xiao && document.getElementById('goPlay'), null, { timeout: 15000 });
  if (shots) await page.screenshot({ path: `${OUT}/xiao-${tag}-intro-${W}.png` });
  await fr.evaluate(() => { __xiao.go(); __xiao.speed(3); });
  await page.waitForTimeout(500);
  await fr.evaluate(() => __xiao.setTime(0.05));
  await fr.waitForSelector('.opt:not([disabled])', { timeout: 8000 });
  if (shots) await page.screenshot({ path: `${OUT}/xiao-${tag}-ask-${W}.png` });
  let asked = 0, shot = false;
  for (let i = 0; i < 600; i++) {
    const st = await fr.evaluate(() => ({ s: __xiao.state, busy: __xiao.busy, paused: __xiao.paused, q: !!document.querySelector('.opt:not([disabled])') }));
    if (st.s !== 'play') break;
    if (st.q) { await fr.evaluate(() => __xiao.answer(true)); asked++; await page.waitForTimeout(450); continue; }
    if (!st.busy && !st.paused) { await fr.evaluate(() => __xiao.move()); if (shots && !shot) { shot = true; await page.waitForTimeout(150); await page.screenshot({ path: `${OUT}/xiao-${tag}-play-${W}.png` }); } }
    await page.waitForTimeout(40);
  }
  await fr.waitForSelector('#toHotel', { timeout: 20000 });
  await page.waitForTimeout(1200);
  if (shots) await page.screenshot({ path: `${OUT}/xiao-${tag}-win-${W}.png` });
  return asked;
}

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const errs = [], ext = [];
  ctx.on('request', r => { const u = r.url(); if (!/^(http:\/\/127\.0\.0\.1|data:|blob:|about:)/.test(u)) ext.push(u); });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGE ' + e.message));
  const res = { size: `${W}x${H}` };

  /* ---------- A. trong game Khách sạn ---------- */
  // ghi dữ liệu mẫu từ trang khác cùng tên miền (mở game Khách sạn trước sẽ tự lưu đè khi rời trang)
  await page.goto('http://127.0.0.1:8765/404.html');
  await page.evaluate(s => { localStorage.clear(); localStorage.setItem('bk_hotel_v3', JSON.stringify(s)); }, SEED());
  await page.goto(BASE + 'index.html'); await page.waitForTimeout(3500);
  res.catalog = await page.evaluate(() => { const c = JSON.parse(localStorage.getItem('bk_words_v1') || 'null'); return c ? c.cards.length : 0; });
  const coins0 = await page.evaluate(() => __hotel.S.coins);
  await page.evaluate(() => { document.querySelectorAll('.ov.on').forEach(o => o.classList.remove('on')); });
  await page.click('#placeBtn'); await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/xiao-A-menu-${W}.png` });
  await page.click('#pmXiao');
  await page.waitForTimeout(800);
  const fr = page.frames().find(f => f.url().includes('xiao.html'));
  res.frameOpen = !!fr && await page.evaluate(() => !document.getElementById('evt').hidden);
  res.askedA = await playRoom(fr, page, 'A', true);
  const mid = await page.evaluate(() => __hotel.S.coins);
  await fr.click('#toHotel'); await page.waitForTimeout(900);
  res.frameClosed = await page.evaluate(() => document.getElementById('evt').hidden);
  const S1 = await page.evaluate(() => ({ coins: __hotel.S.coins, cards: Object.keys(__hotel.S.cards).length, xiao: __hotel.S.xiao }));
  res.coinsA = [coins0, mid, S1.coins]; res.cardsA = S1.cards; res.xiaoA = S1.xiao;
  await page.screenshot({ path: `${OUT}/xiao-A-back-${W}.png` });

  /* ---------- B. chơi riêng rồi quay về ---------- */
  await page.goto(BASE + 'xiao.html'); await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/xiao-B-map-${W}.png` });
  res.hscroll = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  await page.click('#goBtn'); await page.waitForTimeout(500);
  res.askedB = await playRoom(page.mainFrame(), page, 'B', true);
  res.inbox = await page.evaluate(() => JSON.parse(localStorage.getItem('bk_xiao_inbox') || 'null'));
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('bk_hotel_v3')).coins);
  await page.click('#toHotel'); await page.waitForURL(/hotel\/(index\.html)?$/, { timeout: 10000 }); await page.waitForTimeout(3500);
  res.coinsB = [before, await page.evaluate(() => __hotel.S.coins)];
  res.inboxAfter = await page.evaluate(() => localStorage.getItem('bk_xiao_inbox'));
  await page.screenshot({ path: `${OUT}/xiao-B-back-${W}.png` });

  /* ---------- C. tab Ôn tập có nút ôn bằng ghép 3 ---------- */
  await page.evaluate(() => document.querySelectorAll('.ov.on').forEach(o => o.classList.remove('on')));
  await page.click('.dk-btn[data-tab=review]').catch(() => {}); await page.waitForTimeout(400);
  res.reviewBtn = await page.evaluate(() => !!document.getElementById('xiaoRv'));

  res.errs = errs; res.ext = ext;
  res.ok = res.catalog > 40 && res.frameOpen && res.frameClosed && res.askedA >= 1 && res.coinsA[2] > res.coinsA[0] && res.xiaoA && res.xiaoA.rooms >= 1
    && res.inbox && res.inbox.coins > 0 && res.coinsB[1] >= res.coinsB[0] + res.inbox.coins && !res.inboxAfter && res.reviewBtn && !res.hscroll && !errs.length && !ext.length;
  console.log(JSON.stringify(res));
  await b.close();
  process.exit(res.ok ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
