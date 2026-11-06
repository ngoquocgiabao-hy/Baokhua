/* Quay video 9:16 từ chính cảnh 3D của game Khách sạn (bản thử hotel/proto) – không tốn phí, không gọi dịch vụ ngoài.
   Cách làm giống HyperFrames: mở trang ở chế độ ?capture=1, bước tay đúng 1/30 giây mỗi khung (window.__step), chụp từng khung, ghép bằng FFmpeg.
   Dùng: node tools/hotel/capture.js [giây=11] [ra=hotel/proto/teaser.mp4]
   Cần: máy chủ tĩnh ở thư mục repo (python3 -m http.server 8765 --bind 127.0.0.1) hoặc đặt BASE=... ; Playwright + Chromium; ffmpeg. */
const BASE = process.env.BASE || 'http://127.0.0.1:8765';
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
const SEC = +process.argv[2] || 11, OUT = process.argv[3] || 'hotel/proto/teaser.mp4', FPS = 30;
(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hotel-cap-'));
  const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
  const p = await b.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  await p.goto(BASE + '/hotel/proto/index.html?capture=1');
  await p.waitForFunction(() => window.__ready === true);
  const n = Math.round(SEC * FPS), t0 = Date.now();
  for (let i = 0; i < n; i++) {
    await p.evaluate(() => window.__step(1 / 30));
    await p.screenshot({ path: path.join(dir, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 });
    if (i % 60 === 0) process.stderr.write(`khung ${i}/${n} · ${((Date.now() - t0) / 1000).toFixed(0)} giây\n`);
  }
  await b.close();
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(dir, 'f%04d.jpg'),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT]);
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(JSON.stringify({ out: OUT, frames: n, seconds: SEC, bytes: fs.statSync(OUT).size, errs }));
  process.exitCode = errs.length ? 1 : 0;
})();
