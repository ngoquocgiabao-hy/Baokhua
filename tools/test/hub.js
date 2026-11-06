/* Kiểm thử game hợp nhất hotel/ (06/11/2026). Dùng: node tools/test/hub.js [OUT] [rộng] [cao]
   1) Hướng dẫn người mới đi trọn các bước (có bước mua 桌子 và bước "bên trong khách sạn")
   2) Mua cái bàn → sảnh 3D mở, món mới hiện ra, thẻ từ f-table vào Bộ thẻ
   3) Sự kiện khách cần đồ gấp → bản đồ đi chợ (game.html?ev=errand) → mua đúng món, bê về → cộng xu
   4) Thử thách đánh boss HSK0 (game.html?ev=boss) → thắng → về khách sạn nhận thưởng
   Không lỗi console, không gọi máy chủ ngoài (trừ phông Google đã có). Cần máy chủ tĩnh 127.0.0.1:8765 (hoặc BASE=...). */
const BASE = process.env.BASE || 'http://127.0.0.1:8765';
const { chromium } = require('playwright');
const path = require('path'), OUT = process.argv[2] || path.join(__dirname, 'out'), W = +process.argv[3] || 390, H = +process.argv[4] || 844;
(async () => {
  require('fs').mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
  const p = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();
  const errs = [], ext = new Set(), bad = [];
  p.on('pageerror', e => errs.push('PAGE ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0, 160)); });
  p.on('response', r => { if (r.status() >= 400) errs.push('HTTP ' + r.status() + ' ' + r.url()); });
  p.on('request', r => { const u = new URL(r.url()); if (!/^(data|blob|about):/.test(u.protocol) && u.host !== new URL(BASE).host && !/fonts\.(googleapis|gstatic)\.com$/.test(u.host)) ext.add(u.host); });
  const click = sel => p.evaluate(s => document.querySelector(s).click(), sel);
  await p.goto(BASE + '/hotel/'); await p.waitForTimeout(1200);
  // 1) hướng dẫn
  await click('#ovBtn');
  const step = () => p.evaluate(() => __hotel.Tut.step);
  for (let k = 0; k < 60 && !(await step()); k++) await p.waitForTimeout(500);
  const seen = [];
  for (let k = 0; k < 40; k++) {
    const st = await step(); if (!st) break; if (seen[seen.length - 1] !== st) seen.push(st);
    if (['queue', 'sat', 'req', 'star', 'scene'].includes(st)) { await click('#coachNext'); await p.waitForTimeout(400); }
    else if (st === 'serve') { await click('#serveBtn'); await p.waitForTimeout(900); }
    else if (st === 'answer' || st === 'buyAns') { await p.evaluate(() => __hotel.answer(true)); await p.waitForTimeout(st === 'answer' ? 2600 : 3600); }
    else if (st === 'buy') { await click('[data-fbuy="table"]'); await p.waitForTimeout(900); }
    else if (st === 'inside') { await p.waitForTimeout(2500); await p.screenshot({ path: path.join(OUT, `hub-inside-${W}.png`) }); await click('#inBack'); await p.waitForTimeout(600); }
    else await p.waitForTimeout(600);
  }
  const t1 = await p.evaluate(() => ({ tut: __hotel.S.tut, table: !!__hotel.S.furn.table, card: !!__hotel.S.cards['f-table'] }));
  if (seen.join('>') !== 'queue>serve>answer>sat>req>buy>buyAns>inside>star>scene') bad.push('các bước hướng dẫn: ' + seen.join('>'));
  if (t1.tut !== 'done' || !t1.table || !t1.card) bad.push('sau hướng dẫn: ' + JSON.stringify(t1));
  // 2) mua tiếp: đủ xu → hoa (đi chợ) bị hoãn, mua ghế không cần đi chợ? (ghế cần hoa trước) → kiểm khoá thứ tự
  const lock = await p.evaluate(() => __hotel.furnLock(__hotel.FURN.find(f => f.id === 'chair')));
  if (!/花/.test(lock || '')) bad.push('ghế phải chờ mua hoa trước, đang là: ' + lock);
  // 3) đi chợ (sự kiện khách cần đồ gấp)
  const c0 = await p.evaluate(() => { __hotel.Ev.need({ id: 'maojin', zh: '毛巾', py: 'máojīn', vi: 'khăn tắm', who: 'Khách phòng 102' }); return __hotel.S.coins; });
  await p.waitForTimeout(3000);
  const fr = p.frames().find(f => f.url().includes('ev=errand'));
  if (!fr) bad.push('không mở được bản đồ đi chợ');
  else {
    await fr.evaluate(() => { const M = window.__bao.WorldMap; M._clearMons(); M._tp(M.errand.shop - 8); }); await p.waitForTimeout(2500);
    const o = await fr.$$eval('#duelOpts button', bs => bs.map(x => x.querySelector('b').textContent));
    if (o.indexOf('毛巾') < 0) bad.push('sạp hàng không có món 毛巾: ' + o.join(','));
    else { await fr.evaluate(i => document.querySelectorAll('#duelOpts button')[i].click(), o.indexOf('毛巾')); await p.waitForTimeout(300); await fr.evaluate(() => document.getElementById('duelNext').click()); }
    for (let i = 0; i < 25; i++) { await p.waitForTimeout(400); const e = await fr.evaluate(() => window.__bao.WorldMap.errand); if (e && e.st === 'back') break; }
    await fr.evaluate(() => { const M = window.__bao.WorldMap; M._tp(M.errand.door + 30); M._key(-1); }); await p.waitForTimeout(5000);
  }
  const t3 = await p.evaluate(() => ({ coins: __hotel.S.coins, evt: !document.getElementById('evt').hidden }));
  if (t3.evt || t3.coins <= c0) bad.push('đi chợ chưa xong / chưa cộng xu: ' + JSON.stringify(t3) + ' trước ' + c0);
  await p.evaluate(() => { document.getElementById('ov').classList.remove('on'); });
  // 4) thử thách đánh boss HSK0
  await click('#challengeBtn'); await p.waitForTimeout(400); await click('[data-boss="0"]'); await p.waitForTimeout(4500);
  const fb = p.frames().find(f => f.url().includes('ev=boss'));
  if (!fb) bad.push('không mở được trận thử thách');
  else {
    await fb.evaluate(() => window.__bao.end(true)); await p.waitForTimeout(4500);
    await fb.evaluate(() => document.getElementById('clearBtn').click()); await p.waitForTimeout(900);
    await fb.evaluate(() => document.getElementById('btnNextMap').click()); await p.waitForTimeout(1500);
  }
  const t4 = await p.evaluate(() => ({ boss: __hotel.S.ev.boss[0] || 0, ov: document.getElementById('ov').classList.contains('on') ? document.getElementById('ovTitle').textContent : '' }));
  if (!t4.boss || !/Cua/.test(t4.ov)) bad.push('thử thách boss: ' + JSON.stringify(t4));
  await p.screenshot({ path: path.join(OUT, `hub-boss-${W}.png`) });
  if (errs.length) bad.push('lỗi: ' + errs.slice(0, 5).join(' | '));
  if (ext.size) bad.push('gọi máy chủ ngoài: ' + [...ext].join(','));
  console.log(JSON.stringify({ size: `${W}x${H}`, steps: seen.join('>'), bad }, null, 1));
  console.log(bad.length ? 'Game hợp nhất: KHÔNG ĐẠT' : 'Game hợp nhất: ĐẠT');
  await b.close();
  process.exit(bad.length ? 1 : 0);
})();
