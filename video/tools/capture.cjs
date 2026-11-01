// Tự quay màn hình game Khách sạn (thay việc ghi màn hình bằng tay).
// Dùng đồng hồ giả của Playwright: mỗi khung hình tiến đúng 1/30 giây => video mượt, lặp lại y hệt mỗi lần chạy.
// Chạy: node video/tools/capture.cjs   → video/assets/clip_*.mp4
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const OUT = path.resolve(__dirname, '../assets');
const FPS = 30;

// Khách sạn 5★ đầy đủ công trình (chỉ nạp vào trình duyệt dùng để quay, không đụng tới game thật)
const FULL = { coins: 999, pts: 1300, star: 5, intro: true, clock: 'fast', muted: true,
  own: { floor: 5, desk: 1, palm: 1, umbrella: 1, lights: 1, sign: 1, lantern: 1, staff: 3, lift: 1, gym: 1,
         pool: 1, restaurant: 1, meeting: 1, garden: 1, boat: 1, wheel: 1, fireworks: 1 } };
const START = { intro: true, clock: 'fast', muted: true };

const CLIPS = [
  // tên, trạng thái, giờ bắt đầu, số giây, độ dài 1 ngày game (ms) khi quay
  { name: 'clip_5sao_ngaydem', save: FULL, hour: 6, sec: 15, dayMs: 18000 },   // 06:00 → khoảng 02:00 hôm sau
  { name: 'clip_1sao', save: START, hour: 9, sec: 4, dayMs: 12 * 60 * 1000 },
];

function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, rsp) => {
      const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rsp.writeHead(404); return rsp.end(); }
      rsp.end(fs.readFileSync(f));
    }).listen(0, '127.0.0.1', () => res(srv));
  });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serve(); const base = `http://127.0.0.1:${srv.address().port}`;
  const browser = await chromium.launch();
  for (const c of CLIPS) {
    const tmp = fs.mkdtempSync('/tmp/cap-');
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
    const errs = []; page.on('pageerror', e => errs.push(String(e)));
    await page.route('**/khachsan.html', async r => {
      const html = (await (await r.fetch()).text()).replace(/const GAME_DAY_MS = [^;]+;/, `const GAME_DAY_MS = ${c.dayMs}; window.__cap = { go(h) { S.clock = 'fast'; setHour(h); } };`);
      r.fulfill({ body: html, contentType: 'text/html; charset=utf-8' });
    });
    await page.clock.install({ time: new Date('2026-11-01T09:00:00+07:00') });
    await page.addInitScript(s => localStorage.setItem('baokhua_hotel_v1', s), JSON.stringify(c.save));
    await page.goto(base + '/khachsan.html');
    await page.clock.runFor(1500);
    // dừng hẳn đồng hồ: từ đây thời gian chỉ chạy khi gọi runFor (chụp hình chậm cũng không làm lệch)
    await page.clock.pauseAt(await page.evaluate(() => Date.now()) + 50);
    if (errs.length) throw new Error(errs.join(" | "));
    await page.evaluate(h => window.__cap.go(h), c.hour);   // móc chỉ có trong bản quay
    await page.clock.runFor(100);
    const scene = await page.$('#scene');
    const n = c.sec * FPS;
    for (let i = 0; i < n; i++) {
      await scene.screenshot({ path: `${tmp}/f${String(i).padStart(4, '0')}.png` });
      await page.clock.runFor(1000 / FPS);
    }
    const out = `${OUT}/${c.name}.mp4`;
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', String(FPS), '-i', `${tmp}/f%04d.png`,
      '-vf', 'scale=1080:-2:flags=lanczos', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
    fs.rmSync(tmp, { recursive: true });
    console.log(c.name, n, 'khung', errs.length ? 'LỖI: ' + errs.join(' | ') : 'không lỗi');
    await page.close();
  }
  await browser.close(); srv.close();
})();
