// Quay mini-game Ā Bǎo 消消乐 từng khung (đồng hồ trang do Playwright điều khiển → đúng 30 khung/giây, mượt dù máy chậm).
//   node tools/xiao_film.cjs <thư mục ra>     (máy chủ tĩnh ở gốc repo: http://127.0.0.1:8765)
// Ra: xiao-play.mp4 (ghép 3 nổ dây chuyền, lời khen tiếng Trung), xiao-ask.mp4 (hết giờ → câu hỏi từ Sổ ôn → trả lời đúng +giây),
//     khung điện thoại 390×844 × 2,5 (976×2112).
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const OUT = path.resolve(process.argv[2] || 'out/game_shots'), BASE = 'http://127.0.0.1:8765/';
const DAY = 864e5, F = 1000 / 30;
fs.mkdirSync(OUT, { recursive: true });
const SEED = () => ({ lv: 1, tut: 'done', intro: true, coins: 860, pts: 240, star: 3, served: 40, answered: 52, correct: 47, cardV: 1, muted: true,
  cards: Object.fromEntries(['nihao', 'xiexie', 'huanying', 'fangka', 'huzhao', 'zaocan'].map((id, i) => [id, { ivl: 1 + i, ease: 2.5, reps: 2, lapses: 0, due: Date.now() - 6e4 * (i + 1), seen: Date.now() - 4 * DAY }])) });

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2.5, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE + '404.html'); await p.evaluate(s => { localStorage.clear(); localStorage.setItem('bk_hotel_v3', JSON.stringify(s)); }, SEED());
  await p.clock.install({ time: Date.now() });
  await p.goto(BASE + 'hotel/xiao.html');
  await p.clock.pauseAt(Date.now() + 500);   // đồng hồ đứng yên, chỉ chạy khi runFor
  for (let i = 0; i < 60 && !(await p.evaluate(() => !!window.__xiao)); i++) await p.clock.runFor(100);
  await p.clock.runFor(800);
  await p.evaluate(() => __xiao.start(6)); await p.clock.runFor(600);
  await p.evaluate(() => __xiao.go()); await p.clock.runFor(1600);    // viên rơi xuống xong rồi mới quay

  async function film(name, seconds, step) {
    const dir = path.join(OUT, name + '_f'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
    const n = Math.round(seconds * 30);
    for (let i = 0; i < n; i++) {
      if (step) await step(i);
      await p.clock.runFor(F);
      await p.screenshot({ path: path.join(dir, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 });
    }
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', '30', '-i', path.join(dir, 'f%04d.jpg'), '-vf', 'scale=976:2112:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-crf', '15', '-preset', 'fast', '-g', '15', path.join(OUT, name + '.mp4')]);
    fs.rmSync(dir, { recursive: true, force: true });
  }
  // ghép liên tục: rảnh tay là đi nước tiếp (bot của trò chơi chọn nước có nổ dây chuyền)
  await film('xiao-play', 10, async () => {
    const st = await p.evaluate(() => ({ s: __xiao.state, busy: __xiao.busy, paused: __xiao.paused }));
    if (st.s === 'play' && !st.busy && !st.paused) await p.evaluate(() => { __xiao.move(); return 0; });   // không chờ: hoạt cảnh chạy theo đồng hồ
  });
  // hết giờ → câu hỏi → chờ 2,5 giây → trả lời đúng → +giây
  await p.evaluate(() => __xiao.setTime(0.3));
  let asked = false, answered = -1;
  await film('xiao-ask', 6, async i => {
    const q = await p.evaluate(() => !!document.querySelector('.opt:not([disabled])'));
    if (q && !asked) { asked = true; answered = i + 75; }
    if (asked && i === answered) await p.evaluate(() => { __xiao.answer(true); return 0; });
  });
  console.log(JSON.stringify({ out: OUT, asked, errs }));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
