const { chromium } = require('playwright');
const OUT = process.argv[2], S = +(process.argv[3] || 13), HR = +(process.argv[4] || 18.3), only = process.argv[5];
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (let star = 1; star <= 5; star++) {
    if (only && +only !== star) continue;
    const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
    p.on('pageerror', e => console.log('PE', e.message));
    await p.goto(`http://localhost:8766/tools/film/film.html?star=${star}`); await p.waitForFunction(() => window.__ready, null, { timeout: 60000 });
    const at = [8.5, +(process.env.AY || 6), 9.5];
    for (let i = 0; i < 90; i++) await p.evaluate(([at, S, h]) => W._frame(1 / 30, at, S, { hour: h, dn: true, skip: true, view: { at, S } }), [at, S, HR]);
    await p.evaluate(([at, S, h]) => W._frame(1 / 30, at, S, { hour: h, dn: true, view: { at, S } }), [at, S, HR]);
    await p.screenshot({ path: `${OUT}/star${star}.jpg`, type: 'jpeg', quality: 92 });
    console.log('star', star); await p.close();
  }
  await b.close();
})();
