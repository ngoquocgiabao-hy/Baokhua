// Quay cảnh thật trong game Khách sạn Vịnh Ā Bǎo để dựng video (khung điện thoại 390×844 × 2,5 = 975×2110, đặt vào khung máy trong video).
//   node tools/game_shots.cjs <thư mục ra>      (máy chủ tĩnh ở gốc repo: http://127.0.0.1:8765)
// Ra: ảnh tĩnh hotel-*.png, review-*.png, mkt.png, boss.png, xiao-map/intro/win.png. Phim chơi 消消乐: tools/xiao_film.cjs.
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const OUT = path.resolve(process.argv[2] || 'out/game_shots');
const BASE = 'http://127.0.0.1:8765/';
fs.mkdirSync(OUT, { recursive: true });
const DAY = 864e5;
// người chơi đã có tiến độ: khách sạn 3★, vài thẻ đến hạn ôn trong Sổ ôn (để câu hỏi lấy từ Sổ ôn)
const SEED = () => ({ lv: 1, tut: 'done', intro: true, coins: 860, pts: 240, star: 3, served: 40, answered: 52, correct: 47, cardV: 1, muted: true,
  story: { done: { c1: 2, c2: 2, c3: 2, c4: 1 } },
  cards: Object.fromEntries(['nihao', 'xiexie', 'huanying', 'fangka', 'huzhao', 'zaocan'].map((id, i) => [id, { ivl: 1 + i, ease: 2.5, reps: 2, lapses: 0, due: Date.now() - 6e4 * (i + 1), seen: Date.now() - 4 * DAY }])) });

async function screencast(page, file, ms, during, slow = 1) {   // slow < 1: game chạy chậm khi quay, phim tua nhanh lại cho mượt
  const cdp = await page.context().newCDPSession(page), frames = [], dir = file + '_f';
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
  cdp.on('Page.screencastFrame', async f => { frames.push({ t: f.metadata.timestamp, d: f.data }); try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch (e) {} });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 975, maxHeight: 2110, everyNthFrame: 1 });
  const t0 = Date.now(); const job = during ? during() : null;
  while (Date.now() - t0 < ms) await page.waitForTimeout(50);
  await job; await cdp.send('Page.stopScreencast'); await cdp.detach();
  // ghép theo đúng thời điểm từng khung (concat có thời lượng) → 30 khung/giây
  const lst = []; frames.forEach((f, i) => { const p = path.join(dir, `f${String(i).padStart(4, '0')}.jpg`); fs.writeFileSync(p, Buffer.from(f.d, 'base64')); const d = (i + 1 < frames.length ? frames[i + 1].t - f.t : 1 / 30) * slow; lst.push(`file '${p}'\nduration ${Math.max(.001, d).toFixed(4)}`); });
  lst.push(`file '${path.join(dir, `f${String(frames.length - 1).padStart(4, '0')}.jpg`)}'`);
  fs.writeFileSync(dir + '.txt', lst.join('\n'));
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', dir + '.txt', '-vf', 'scale=976:2112:flags=lanczos,fps=30,format=yuv420p', '-c:v', 'libx264', '-crf', '15', '-preset', 'fast', '-g', '15', file]);
  fs.rmSync(dir, { recursive: true, force: true }); fs.rmSync(dir + '.txt', { force: true });
  return frames.length;
}

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2.5, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  const shot = n => p.screenshot({ path: path.join(OUT, n + '.png') });
  const clear = () => p.evaluate(() => document.querySelectorAll('.ov.on').forEach(o => o.classList.remove('on')));
  await p.goto(BASE + '404.html'); await p.evaluate(s => { localStorage.clear(); localStorage.setItem('bk_hotel_v3', JSON.stringify(s)); }, SEED());

  /* ---- game Khách sạn ---- */
  await p.goto(BASE + 'hotel/'); await p.waitForFunction(() => !document.getElementById('boot') || document.getElementById('boot').classList.contains('done'), null, { timeout: 60000 });
  await p.waitForTimeout(2500); await clear(); await p.waitForTimeout(800);
  await shot('hotel-street');
  for (let i = 0; i < 3; i++) {   // phục vụ khách: câu hỏi → đúng → xu
    await clear(); await p.evaluate(() => document.getElementById('serveBtn').click()); await p.waitForTimeout(1300);
    if (i === 0) await shot('hotel-ask');
    await p.evaluate(() => __hotel.answer(true)); await p.waitForTimeout(350);
    if (i === 0) await shot('hotel-right');
    await p.waitForTimeout(1600);
  }
  await clear(); await shot('hotel-after');
  // tab Ôn tập: mặt trước, lật thẻ, nút chấm (Lại · Khó · Được · Dễ kèm lịch ôn)
  await p.evaluate(() => { const t = document.querySelector('.dk-btn[data-tab=review]'); t && t.click(); }); await p.waitForTimeout(900);
  await shot('review-front');
  await p.evaluate(() => { const f = document.getElementById('flip'); f && f.click(); }); await p.waitForTimeout(900);
  await shot('review-back');
  await p.evaluate(() => { const r = document.querySelector('.card.review'); r && r.scrollIntoView({ block: 'center' }); }); await p.waitForTimeout(500);
  await shot('review-card');
  const rc = await p.$('.card.review'); if (rc) await rc.screenshot({ path: path.join(OUT, 'review-card-el.png') });
  await p.keyboard.press('Escape'); await p.evaluate(() => { const c = document.querySelector('.drawer .close, #drawerClose, .drawer [aria-label="Đóng"]'); c && c.click(); }); await p.waitForTimeout(500);
  // mini-game đi chợ và thử thách boss
  await clear(); await p.evaluate(() => { try { __hotel.Mkt.run(__hotel.FURN[1] || __hotel.FURN[0], () => {}); } catch (e) { console.log(e); } }); await p.waitForTimeout(2600); await shot('mkt');
  await p.reload(); await p.waitForFunction(() => !document.getElementById('boot') || document.getElementById('boot').classList.contains('done'), null, { timeout: 60000 }); await p.waitForTimeout(1500);
  await clear(); await p.evaluate(() => { try { __hotel.BossQ.run(__hotel.BOSSES[0], () => {}); } catch (e) { console.log(e); } }); await p.waitForTimeout(2200); await shot('boss');

  /* ---- Ā Bǎo 消消乐 chơi riêng ---- */
  await p.goto(BASE + 'hotel/xiao.html'); await p.waitForFunction(() => window.__xiao, null, { timeout: 20000 }); await p.waitForTimeout(1200);
  await shot('xiao-map');
  await p.evaluate(() => __xiao.start(6)); await p.waitForTimeout(900); await shot('xiao-intro');
  // phim chơi 消消乐 quay riêng bằng tools/xiao_film.cjs (từng khung, mượt hơn)
  await p.evaluate(() => { __xiao.go(); __xiao.speed(3); });
  for (let i = 0; i < 700; i++) {
    const st = await p.evaluate(() => ({ s: __xiao.state, busy: __xiao.busy, paused: __xiao.paused, q: !!document.querySelector('.opt:not([disabled])') }));
    if (st.s !== 'play') break;
    if (st.q) { await p.evaluate(() => __xiao.answer(true)); await p.waitForTimeout(400); continue; }
    if (!st.busy && !st.paused) await p.evaluate(() => { __xiao.move(); return 0; });
    await p.waitForTimeout(60);
  }
  await p.waitForTimeout(2500); await shot('xiao-win');
  console.log(JSON.stringify({ out: OUT, errs }));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
