// dựng chuỗi khung: node render.js <thư mục ra> <cỡ> <fps> [từ khung] [tới khung]
const { chromium } = require('playwright');
const { at, DUR } = require('./path.js');
const [out, size, fps, from, to] = [process.argv[2], +process.argv[3] || 1920, +process.argv[4] || 30, +process.argv[5] || 0, +process.argv[6] || 1e9];
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8766/tools/film/film.html'); await p.waitForFunction(() => window.__ready, null, { timeout: 60000 }); await p.waitForTimeout(800);
  // làm ấm: cho người, xe, thuyền ra phố trước khi quay
  const c0 = at(0); await p.evaluate(c => { for (let i = 0; i < 150; i++) W._frame(1 / 30, [8, 0, 10.5], 18, { hour: c.h, dn: true, skip: true }); }, c0);
  const N = Math.round(DUR * fps);
  for (let f = from; f <= Math.min(N, to); f++) {
    const c = at(f / fps);
    await p.evaluate(c => W._frame(1 / 30, [c.x, 0, c.z], c.S, { hour: c.h, dn: true, view: { at: [c.x, 0, c.z], S: c.S } }), c);
    await p.screenshot({ path: `${out}/f${String(f).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 92 });
    if (f % 60 === 0) console.log('frame', f, '/', N, errs.length ? errs : '');
  }
  console.log('done', N, errs);
  await b.close();
})();
