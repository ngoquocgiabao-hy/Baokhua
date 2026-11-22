/* Kiểm trang chủ (index.html): không lỗi console, chỉ gọi máy chủ ngoài đã có (Google Fonts), không tràn ngang,
   thẻ Khu trò chơi Suối nóng 温泉电玩城 hiện và bấm vào mở đúng trang khu trò chơi, trang tự tải trước game khi rảnh.
   node tools/test/home.js <thư mục ảnh> <rộng> <cao>        (máy chủ tĩnh ở http://127.0.0.1:8765) */
'use strict';
const { chromium } = require('playwright');
const OUT = process.argv[2] || 'tools/test/out', W = +process.argv[3] || 390, H = +process.argv[4] || 844;
const OK_HOSTS = /^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com)\//;
(async () => {
  const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: W, height: H } }), p = await ctx.newPage();
  const errs = [], ext = [], got = new Set(), res = { size: `${W}x${H}` };
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGE ' + e.message));
  ctx.on('request', r => { const u = r.url(); got.add(u.replace('http://127.0.0.1:8765/', '')); if (!/^(http:\/\/127\.0\.0\.1|data:|blob:|about:)/.test(u) && !OK_HOSTS.test(u)) ext.push(u); });
  await p.goto('http://127.0.0.1:8765/'); await p.waitForTimeout(1500);
  for (let y = 0; y < 40; y++) { await p.mouse.wheel(0, H * .8); await p.waitForTimeout(120); }
  await p.waitForTimeout(4500);
  res.hscroll = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  res.warm = ['hotel/lib/three.module.min.js', 'hotel/xiao.html', 'hotel/arcade.html'].every(u => got.has(u));
  const card = p.locator('a.xcard'); await card.scrollIntoViewIfNeeded(); await p.waitForTimeout(900);
  res.card = await card.isVisible(); await card.screenshot({ path: `${OUT}/home-xcard-${W}.png` });
  await card.click(); await p.waitForURL(/arcade\.html/, { timeout: 10000 }); await p.waitForFunction(() => window.__arcade && document.querySelector('.game.g-x'), null, { timeout: 15000 });
  res.xiao = true; res.errs = errs; res.ext = ext;
  res.ok = !res.hscroll && res.warm && res.card && res.xiao && !errs.length && !ext.length;
  console.log(JSON.stringify(res)); await b.close(); process.exit(res.ok ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
