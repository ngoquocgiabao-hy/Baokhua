// Từ bản gốc 9:16 làm ra bản 16:9 (YouTube, Facebook) và 4:5 (bảng tin Instagram/Facebook),
// cộng ảnh bìa YouTube 1280×720. Khung hai bên là bảng thiết kế riêng (HTML → PNG), không phải viền mờ.
//   node debut/platforms.cjs [--evergreen]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');

const V = path.resolve(__dirname, '..'), ROOT = path.resolve(V, '..');
const EVER = process.argv.includes('--evergreen');
const OUT = path.join(V, 'out');
const TAG = EVER ? 'DEBUT_EVERGREEN' : 'DEBUT';
const MASTER = path.join(OUT, `BAOKHUA_${TAG}_9x16.mp4`);
const Y = '#FCE029', K = '#0B0B0C', W = '#FFFBEA';
const URL_GAME = 'ngoquocgiabao-hy.github.io/Baokhua';

const BASE = `
@font-face{font-family:'Inter Display';src:local('Inter Display'),local('Inter Display Black')}
@font-face{font-family:'JetBrains Mono';src:local('JetBrains Mono')}
@font-face{font-family:'WenQuanYi Zen Hei';src:local('WenQuanYi Zen Hei')}
*{margin:0;padding:0;box-sizing:border-box}
body{background:${K};color:${W};font-family:'Inter Display',sans-serif;overflow:hidden}
.dots{position:absolute;inset:0;background-image:radial-gradient(rgba(252,224,41,.14) 3px,transparent 3.6px);background-size:30px 30px}
.haz{background:repeating-linear-gradient(-45deg,${Y} 0 34px,${K} 34px 68px)}
.tiles{display:flex;gap:18px}
.tile{width:150px;height:184px;border-radius:26px;background:${Y};color:${K};font:400 128px/184px 'WenQuanYi Zen Hei';text-align:center;box-shadow:0 14px 0 #121212,0 30px 40px rgba(0,0,0,.6);border:5px solid #121212}
.mega{font:900 132px/.92 'Inter Display';letter-spacing:-.045em;color:${Y}}
.mono{font:700 34px 'JetBrains Mono'}
.tape{display:inline-block;padding:10px;background:repeating-linear-gradient(-45deg,${Y} 0 22px,${K} 22px 44px);border-radius:12px}
.tape span{display:block;background:${K};color:${Y};font:900 44px/1.1 'Inter Display';padding:10px 26px;border-radius:5px}
.big{font:900 76px/1.02 'Inter Display';letter-spacing:-.02em}
.y{color:${Y}}
mark{background:${Y};color:${K};padding:0 .12em;border-radius:6px}
`;

function wide() {
  const right = EVER
    ? `<div class="tape"><span>LỚP ZOOM · NHÓM NHỎ</span></div>
       <div class="big" style="margin-top:28px">Học thử cùng Bảo<br>trong <mark>nhóm Zalo</mark></div>`
    : `<div class="tape"><span>LỚP ĐẦU TIÊN</span></div>
       <div class="big" style="margin-top:28px"><span class="y">20:00</span><br>Thứ Tư <mark>04/11</mark></div>
       <div class="mono" style="margin-top:18px;opacity:.85">Zoom · 8 buổi · nhóm nhỏ</div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
  body{width:1920px;height:1080px;position:relative}
  .hole{position:absolute;left:656px;top:0;width:608px;height:1080px;background:#000}
  .edge{position:absolute;top:0;width:26px;height:1080px}
  .L{position:absolute;left:0;top:0;width:656px;height:1080px;padding:90px 70px;display:flex;flex-direction:column;justify-content:center;gap:34px}
  .R{position:absolute;right:0;top:0;width:656px;height:1080px;padding:90px 70px;display:flex;flex-direction:column;justify-content:center}
  .link{margin-top:56px;padding-top:34px;border-top:4px solid rgba(252,224,41,.35)}
  </style></head><body><div class="dots"></div>
  <div class="L"><div class="tiles"><div class="tile">阿</div><div class="tile">宝</div></div>
    <div class="mega">BẢO<br>KHỰA</div>
    <div class="mono y" style="font-size:28px">阿宝 · Ā Bǎo · China-ready</div>
    <div class="big" style="font-size:58px">Tiếng Trung<br><mark>để đi làm.</mark></div></div>
  <div class="hole"></div><div class="edge haz" style="left:630px"></div><div class="edge haz" style="left:1264px"></div>
  <div class="R">${right}
    <div class="link"><div class="mono">🎮 Chơi thử game</div><div class="mono y" style="font-size:25px;margin-top:8px">${URL_GAME}</div>
    <div class="mono" style="margin-top:22px">💬 Nhóm Zalo: link trong mô tả</div></div></div>
  </body></html>`;
}
function feed() {   // 4:5, 1080×1350: video 760×1350 ở giữa, hai dải chữ dọc
  return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
  body{width:1080px;height:1350px;position:relative}
  .side{position:absolute;top:0;width:160px;height:1350px;display:flex;align-items:center;justify-content:center;overflow:hidden}
  .side .v{transform:rotate(-90deg);white-space:nowrap;font:900 92px 'Inter Display';letter-spacing:.02em}
  .hole{position:absolute;left:160px;top:0;width:760px;height:1350px;background:#000}
  </style></head><body>
  <div class="side haz" style="left:0"><div class="v" style="background:${K};color:${Y};padding:6px 30px;border-radius:10px">BẢO KHỰA <span style="font-family:'WenQuanYi Zen Hei';font-weight:400">阿宝</span></div></div>
  <div class="hole"></div>
  <div class="side" style="right:0;background:${K}"><div class="dots"></div><div class="v" style="color:${Y};font-size:70px;position:relative">TIẾNG TRUNG ĐỂ ĐI LÀM</div></div>
  </body></html>`;
}
function thumb(img) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
  body{width:1280px;height:720px;position:relative;background:${Y}}
  .k{position:absolute;inset:0;background:${K};clip-path:polygon(52% 0,100% 0,100% 100%,40% 100%)}
  .img{position:absolute;right:-30px;bottom:-40px;height:780px}
  .txt{position:absolute;left:56px;top:70px;width:640px}
  .t1{font:900 100px/1.1 'Inter Display';letter-spacing:-.04em;color:${K}}
  .t2{margin-top:22px;display:inline-block;background:${K};color:${Y};font:900 58px/1.1 'Inter Display';padding:10px 24px;border-radius:12px;transform:rotate(-2deg)}
  .tiles{position:absolute;left:60px;bottom:52px}
  .tile{width:118px;height:146px;font-size:100px;line-height:146px;background:${K};color:${Y};border-color:${K};box-shadow:0 10px 0 rgba(0,0,0,.35)}
  .py{position:absolute;left:330px;bottom:96px;font:700 34px 'JetBrains Mono';color:${K}}
  </style></head><body><div class="k"></div><img class="img" src="file://${img}">
  <div class="txt"><div class="t1">TIẾNG TRUNG<br>ĐỂ ĐI LÀM</div><div class="t2">học bằng game?!</div></div>
  <div class="tiles"><div class="tile">阿</div><div class="tile">宝</div></div><div class="py">Ā Bǎo</div>
  </body></html>`;
}

(async () => {
  const b = await chromium.launch();
  const shot = async (html, w, h, file) => {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const f = path.join('/tmp', `panel_${Date.now()}.html`); fs.writeFileSync(f, html);
    await p.goto('file://' + f); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    await p.screenshot({ path: file }); await p.close(); fs.unlinkSync(f);
  };
  const pw = path.join(OUT, `panel_wide_${TAG}.png`), pf = path.join(OUT, `panel_feed.png`);
  await shot(wide(), 1920, 1080, pw);
  await shot(feed(), 1080, 1350, pf);
  if (!EVER) await shot(thumb(path.join(ROOT, 'v4/ninja_tier3_long_ha.jpg')), 1280, 720, path.join(OUT, 'BAOKHUA_DEBUT_YOUTUBE_THUMB.jpg'));
  await b.close();
  if (!fs.existsSync(MASTER)) { console.log('Chưa có', MASTER, '(mới làm bảng)'); return; }
  const enc = ['-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart'];
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-loop', '1', '-i', pw, '-i', MASTER, '-filter_complex',
    '[1:v]scale=608:1080:flags=lanczos[v];[0:v][v]overlay=656:0:shortest=1,format=yuv420p[o]', '-map', '[o]', '-map', '1:a', ...enc, path.join(OUT, `BAOKHUA_${TAG}_16x9.mp4`)]);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-loop', '1', '-i', pf, '-i', MASTER, '-filter_complex',
    '[1:v]scale=760:1350:flags=lanczos[v];[0:v][v]overlay=160:0:shortest=1,format=yuv420p[o]', '-map', '[o]', '-map', '1:a', ...enc, path.join(OUT, `BAOKHUA_${TAG}_4x5.mp4`)]);
  // ảnh bìa dọc: khung logo cuối
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', '45.2', '-i', MASTER, '-frames:v', '1', '-q:v', '2', path.join(OUT, `BAOKHUA_${TAG}_COVER_9x16.jpg`)]);
  console.log('Đã làm 16:9, 4:5, ảnh bìa cho', TAG);
})();
