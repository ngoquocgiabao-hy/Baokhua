/* Kiểm nhanh toàn bộ game Khách sạn (hotel/index.html) trên khung điện thoại: không lỗi console, không gọi máy chủ ngoài, không tràn ngang.
   node tools/test/hotel-smoke.js <thư mục ảnh> <rộng> <cao>       (máy chủ tĩnh ở http://127.0.0.1:8765)
   Người chơi có sẵn tiến độ: phục vụ 6 khách, mở từng tab, vào trong sảnh, menu 📍 Đi tới, sự kiện 🧹 dọn phòng (消消乐),
   đóng khung giữa chừng; người mới: màn chào chọn trình độ. In JSON, thoát 1 nếu hỏng. */
'use strict';
const { chromium } = require('playwright');
const OUT = process.argv[2] || 'tools/test/out', W = +process.argv[3] || 390, H = +process.argv[4] || 844;
const SEED = { lv: 1, tut: 'done', intro: true, coins: 300, pts: 60, star: 2, served: 5, answered: 5, correct: 5, cardV: 1, muted: true, story: { done: { c1: 2, c2: 2, c3: 2 } } };
(async () => {
  const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: W, height: H } }), p = await ctx.newPage();
  const errs = [], ext = [], res = { size: `${W}x${H}` };
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGE ' + e.message));
  ctx.on('request', r => { const u = r.url(); if (!/^(http:\/\/127\.0\.0\.1|data:|blob:|about:)/.test(u)) ext.push(u); });
  const clear = () => p.evaluate(() => { document.querySelectorAll('.ov.on').forEach(o => o.classList.remove('on')); });
  await p.goto('http://127.0.0.1:8765/404.html'); await p.evaluate(s => { localStorage.clear(); localStorage.setItem('bk_hotel_v3', JSON.stringify(s)); }, SEED);
  await p.goto('http://127.0.0.1:8765/hotel/'); await p.waitForFunction(() => !document.getElementById('boot') || document.getElementById('boot').classList.contains('done'), null, { timeout: 40000 });
  await p.waitForTimeout(1200); await clear();
  res.world = await p.evaluate(() => !!(window.BKWorld && window.BKWorld.ready));
  /* phục vụ khách */
  const c0 = await p.evaluate(() => __hotel.S.coins); let served = 0;
  for (let i = 0; i < 6; i++) { await clear(); await p.evaluate(() => document.getElementById('serveBtn').click()); await p.waitForTimeout(700); if (await p.evaluate(() => __hotel.answer(true))) served++; await p.waitForTimeout(1600); }
  res.served = served; res.coins = [c0, await p.evaluate(() => __hotel.S.coins)];
  await p.screenshot({ path: `${OUT}/hotel-serve-${W}.png` });
  /* các tab */
  for (const t of ['build', 'review', 'me']) { await clear(); await p.evaluate(t => { const b = document.querySelector(`.dk-btn[data-tab=${t}]`); b && b.click(); }, t); await p.waitForTimeout(500); }
  res.hscroll = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  await p.screenshot({ path: `${OUT}/hotel-tabs-${W}.png` });
  await p.keyboard.press('Escape'); await p.evaluate(() => { const c = document.querySelector('.drawer .close, #drawerClose, .drawer [aria-label="Đóng"]'); c && c.click(); });
  /* vào trong sảnh rồi ra */
  await clear(); await p.evaluate(() => document.getElementById('insideBtn').click()); await p.waitForTimeout(1500); await p.evaluate(() => document.getElementById('insideBtn').click()); await p.waitForTimeout(800);
  /* menu Đi tới */
  await clear(); await p.evaluate(() => document.getElementById('placeBtn').click()); await p.waitForTimeout(300);
  res.menu = await p.evaluate(() => [...document.querySelectorAll('#placeMenu [data-pl], #placeMenu #pmXiao, #placeMenu a')].map(e => e.id || e.dataset.pl || e.getAttribute('href')));
  await p.evaluate(() => { const b = document.querySelector('#placeMenu [data-pl]'); b && b.click(); }); await p.waitForTimeout(1500);
  /* sự kiện dọn phòng → khung 消消乐 → đóng giữa chừng */
  await clear(); await p.evaluate(() => __hotel.Ev.fire('xiao')); await p.waitForTimeout(400);
  res.evTitle = await p.evaluate(() => document.getElementById('ovTitle').textContent);
  await p.evaluate(() => document.getElementById('ovBtn').click()); await p.waitForTimeout(1500);
  res.xiaoOpen = await p.evaluate(() => !document.getElementById('evt').hidden);
  await p.evaluate(() => document.getElementById('evtClose').click()); await p.waitForTimeout(600);
  res.xiaoClosed = await p.evaluate(() => document.getElementById('evt').hidden && !__hotel.Xiao.open);
  /* người mới: màn chào */
  await p.goto('http://127.0.0.1:8765/404.html'); await p.evaluate(() => localStorage.clear());
  await p.goto('http://127.0.0.1:8765/hotel/'); await p.waitForTimeout(6000);
  res.newUser = await p.evaluate(() => !!document.querySelector('#onb:not([hidden]) #obGo'));
  await p.screenshot({ path: `${OUT}/hotel-new-${W}.png` });
  res.errs = errs; res.ext = ext;
  res.ok = res.served >= 4 && res.coins[1] > res.coins[0] && !res.hscroll && res.menu.includes('pmXiao') && !res.menu.includes('../tone10s.html') && /bừa bộn/.test(res.evTitle) && res.xiaoOpen && res.xiaoClosed && res.newUser && !errs.length && !ext.length;
  console.log(JSON.stringify(res)); await b.close(); process.exit(res.ok ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
