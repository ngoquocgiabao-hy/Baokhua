/* Kiểm thử Khu trò chơi Suối nóng 温泉电玩城 (hotel/arcade.html) + Ngâm chill 泡温泉 (hotel/chill.html) + tính năng mới của 消消乐.
   node tools/test/arcade.js <thư mục ảnh> <rộng> <cao>       (máy chủ tĩnh ở http://127.0.0.1:8765)
   A. Chơi riêng: khu trò chơi → Ngâm chill chạm đúng 12 bong bóng (chạm nhầm 1 lần) → về khu trò chơi → nhiệm vụ chill xong.
   B. 消消乐 từ khu trò chơi: tầng 4 có hiệu ứng tầng 4, sôi sục 沸腾 (đồng hồ đứng, điểm ×2), thắng → nút "♨️ Khu trò chơi" → nhiệm vụ 消消乐 xong.
   C. Phòng VIP hôm nay: cùng một bàn cho 2 lần mở trong ngày, thắng lần đầu xu ×2.
   D. Trong game Khách sạn: nút ♨️ Khu trò chơi → máy quay bay tới toà 温泉电玩城 → khu trò chơi mở trong khung → đóng khung.
   Kèm: 0 lỗi console, 0 gọi máy chủ ngoài, không tràn ngang. In JSON, thoát 1 nếu hỏng. */
'use strict';
const { chromium } = require('playwright');
const OUT = process.argv[2] || 'tools/test/out', W = +process.argv[3] || 390, H = +process.argv[4] || 844;
const B = 'http://127.0.0.1:8765/hotel/';
async function playXiao(fr, page) {
  for (let i = 0; i < 400; i++) {
    const st = await fr.evaluate(() => __xiao.state); if (st !== 'play') break;
    if (await fr.evaluate(() => !!document.querySelector('.opt:not([disabled])'))) await fr.evaluate(() => __xiao.answer(true));
    else if (!(await fr.evaluate(() => __xiao.busy))) await fr.evaluate(() => __xiao.move());
    await page.waitForTimeout(50);
  }
  await fr.waitForSelector('#toHotel', { timeout: 20000 });
}
(async () => {
  const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: W, height: H } }), p = await ctx.newPage();
  const errs = [], ext = [], r = { size: `${W}x${H}` };
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGE ' + e.message));
  ctx.on('request', q => { const u = q.url(); if (!/^(http:\/\/127\.0\.0\.1|data:|blob:|about:)/.test(u)) ext.push(u); });
  await p.goto('http://127.0.0.1:8765/404.html'); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_hotel_v3', JSON.stringify({ lv: 1, tut: 'done', intro: true, coins: 200, pts: 60, star: 2, served: 5, answered: 5, correct: 5, cardV: 1, muted: true, story: { done: { c1: 2, c2: 2, c3: 2 } } })); });
  /* A */
  await p.goto(B + 'arcade.html'); await p.waitForTimeout(500);
  r.games = await p.evaluate(() => [...document.querySelectorAll('.game h3')].map(e => e.textContent));
  r.hscroll = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  await p.screenshot({ path: `${OUT}/arcade-${W}.png` });
  await p.click('.game.g-c'); await p.waitForURL(/chill\.html/); await p.click('#go'); await p.waitForTimeout(1500);
  await p.evaluate(() => __chill.hitWrong()); await p.waitForTimeout(300);
  for (let i = 0; i < 12; i++) { for (let k = 0; k < 40 && !(await p.evaluate(() => __chill.hitRight())); k++) await p.waitForTimeout(150); await p.waitForTimeout(1150); }
  await p.waitForSelector('#toArc', { timeout: 10000 }); r.chill = await p.evaluate(() => __chill.found);
  await p.screenshot({ path: `${OUT}/chill-${W}.png` });
  await p.click('#toArc'); await p.waitForURL(/arcade\.html/); await p.waitForTimeout(400);
  r.tasksA = await p.evaluate(() => [...document.querySelectorAll('.task .n')].map(e => e.textContent));
  /* B */
  await p.goto(B + 'xiao.html?from=arcade'); await p.waitForTimeout(400);
  await p.evaluate(() => __xiao.start(17)); await p.waitForTimeout(300); await p.evaluate(() => { __xiao.go(); __xiao.speed(3); }); await p.waitForTimeout(600);
  r.tier = await p.evaluate(() => __xiao.tier);
  await p.evaluate(() => __xiao.feverNow()); const t0 = await p.evaluate(() => __xiao.time); await p.waitForTimeout(1500); const t1 = await p.evaluate(() => __xiao.time);
  r.feverFreeze = Math.abs(t1 - t0) < .05; r.feverOn = (await p.evaluate(() => __xiao.fever)).on > 0;
  await p.screenshot({ path: `${OUT}/xiao-fever-${W}.png` });
  await playXiao(p.mainFrame(), p);
  r.backLabel = await p.evaluate(() => document.getElementById('toHotel').textContent);
  await p.click('#toHotel'); await p.waitForURL(/arcade\.html/); await p.waitForTimeout(400);
  r.tasksB = await p.evaluate(() => [...document.querySelectorAll('.task .n')].map(e => e.textContent));
  /* C */
  const boardOf = () => p.evaluate(() => __xiao.G.cells.map(row => row.map(x => x.t ? x.t.c : 'x').join('')).join('/'));
  await p.goto(B + 'xiao.html?vip=1'); await p.waitForTimeout(500); const v1 = await boardOf();
  await p.goto(B + 'xiao.html?vip=1'); await p.waitForTimeout(500); const v2 = await boardOf();
  r.vipSame = v1 === v2;
  const inbox0 = await p.evaluate(() => (JSON.parse(localStorage.getItem('bk_xiao_inbox') || '{}').coins) || 0);
  await p.evaluate(() => { __xiao.go(); __xiao.speed(3); }); await playXiao(p.mainFrame(), p);
  r.vipGift = await p.evaluate(() => document.querySelector('.gain').textContent.includes('VIP'));
  r.vipCoins = (await p.evaluate(() => (JSON.parse(localStorage.getItem('bk_xiao_inbox') || '{}').coins) || 0)) - inbox0;
  /* D */
  await p.goto(B); await p.waitForFunction(() => !document.getElementById('boot') || document.getElementById('boot').classList.contains('done'), null, { timeout: 40000 }); await p.waitForTimeout(1500);
  await p.evaluate(() => document.querySelectorAll('.ov.on').forEach(o => o.classList.remove('on')));
  r.chip = await p.evaluate(() => { const c = document.getElementById('spaChip'); return !!c && getComputedStyle(c).display !== 'none'; });
  await p.evaluate(() => document.getElementById('spaChip').click()); await p.waitForTimeout(2600);
  r.frame = p.frames().some(f => f.url().includes('arcade.html')) && await p.evaluate(() => !document.getElementById('evt').hidden);
  r.spaPlace = await p.evaluate(() => !!(__hotel.Scene.W && __hotel.Scene.W.places.find(x => x.id === 'spa')));
  await p.screenshot({ path: `${OUT}/hotel-arcade-${W}.png` });
  await p.evaluate(() => document.getElementById('evtClose').click()); await p.waitForTimeout(600);
  r.closed = await p.evaluate(() => document.getElementById('evt').hidden);
  r.errs = errs; r.ext = ext;
  r.ok = r.games.length >= 3 && !r.hscroll && r.chill === 12 && r.tasksA[1] === '10/10' && r.tier === 4 && r.feverFreeze && r.feverOn && /Khu trò chơi/.test(r.backLabel) && r.tasksB[0] === '1/1'
    && r.vipSame && r.vipGift && r.vipCoins > 0 && r.chip && r.frame && r.spaPlace && r.closed && !errs.length && !ext.length;
  console.log(JSON.stringify(r)); await b.close(); process.exit(r.ok ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
