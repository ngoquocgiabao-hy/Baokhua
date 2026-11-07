// Quay chuỗi đoạn 3D nối liền (kỹ thuật "nối cảnh"): khung cuối đoạn i = khung đầu đoạn i+1.
// Mỗi đoạn máy chỉ làm MỘT động tác với tốc độ đều (đường cong tốc độ áp sau khi dựng).
// node tools/film/chain.js <thư mục ra> <tệp keys.json> [giây/đoạn=4] [fps=30] [rộng=1080] [cao=1920]
// keys.json: [{ "at":[x,y,z], "S":zoom, "yaw":radian, "tilt":radian, "hour":giờ trong game }, …]  (n khung khoá → n-1 đoạn)
const { chromium } = require('playwright');
const fs = require('fs');
const [out, keysPath] = [process.argv[2], process.argv[3]];
const SEC = +(process.argv[4] || 4), FPS = +(process.argv[5] || 30), W = +(process.argv[6] || 1080), H = +(process.argv[7] || 1920);
const K = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
const lerp = (a, b, t) => a + (b - a) * t;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8766/tools/film/film.html?star=' + (K[0].star || 5)); await p.waitForFunction(() => window.__ready, null, { timeout: 90000 });
  const k0 = K[0]; await p.evaluate(k => { for (let i = 0; i < 150; i++) W._frame(1 / 30, k.at, k.S, { hour: k.hour, dn: true, skip: true }); }, k0);   // làm ấm: người, xe ra phố
  const N = Math.round(SEC * FPS);
  for (let c = 0; c < K.length - 1; c++) {
    const A = K[c], B = K[c + 1], dir = `${out}/c${String(c + 1).padStart(2, '0')}`; fs.mkdirSync(dir, { recursive: true });
    for (let f = 0; f <= N; f++) {
      const t = f / N;    // tốc độ đều
      const at = [0, 1, 2].map(i => lerp(A.at[i], B.at[i], t)), S = Math.exp(lerp(Math.log(A.S), Math.log(B.S), t));
      const o = { hour: lerp(A.hour, B.hour, t), dn: true, yaw: lerp(A.yaw || 0, B.yaw || 0, t), tilt: lerp(A.tilt || 0, B.tilt || 0, t), view: { at, S } };
      if (f === 0 && c > 0) continue;   // khung đầu = khung cuối đoạn trước (đã chụp) → chép lại cho liền
      await p.evaluate(([at, S, o]) => W._frame(1 / 30, at, S, o), [at, S, o]);
      await p.screenshot({ path: `${dir}/f${String(f).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 92 });
    }
    if (c > 0) fs.copyFileSync(`${out}/c${String(c).padStart(2, '0')}/f${String(N).padStart(4, '0')}.jpg`, `${dir}/f0000.jpg`);
    console.log('đoạn', c + 1, 'xong', errs.length ? errs : '');
  }
  await b.close();
})();
