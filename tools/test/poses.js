/* Bảng tư thế (v14): vẽ khung xương 8 nhân vật, mỗi nhân vật 1 hàng 14 tư thế (sân đấu) hoặc 14 pha bước nảy, để soi bằng mắt
   có chỗ nào bị xé hình (rách áo, tay rời thân, vệt sáng) trước khi nới LIM / GAIN trong game.html.
   Dùng: node tools/test/poses.js [poses|walk|run] [ảnh ra.png]   (cần máy chủ 127.0.0.1:8765 hoặc BASE=...)
   GAIN dưới đây phải giống GAIN trong createArena. */
const BASE = process.env.BASE || 'http://127.0.0.1:8765';
const { chromium } = require('playwright');
const MODE = process.argv[2] || 'poses', OUT = process.argv[3] || require('path').join(__dirname, 'out', 'poses-' + (process.argv[2] || 'poses') + '.png');
const CH = ['hero1', 'hero2', 'hero3', 'trainee-idle', 'hotel-idle', 'factory-idle', 'night-idle', 'shadow-idle'];
(async () => {
  const b = await chromium.launch();
  const W = 1820, RH = 230, H = RH * CH.length;
  const p = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__forceGL = 1; });
  require('fs').mkdirSync(require('path').dirname(OUT), { recursive: true });
  await p.goto(BASE + '/game.html'); await p.waitForTimeout(600);
  await p.evaluate(async ([CH, MODE, W, RH]) => {
    const { Rig, Chibi } = window.__bao, P = Chibi.POSES;
    CH.forEach(n => Rig.load(n)); await new Promise(r => setTimeout(r, 1200));
    const GAIN = { hero: { arm: 1, leg: 1 }, trainee: { arm: .35, leg: .9 }, hotel: { arm: .2, leg: .9 }, factory: { arm: .45, leg: 1 }, night: { arm: .45, leg: 1 }, shadow: { arm: .25, leg: 1 } };
    const rr = Rig.renderer(); const H = RH * CH.length; rr.size(W, H);
    Object.assign(rr.cv.style, { position: 'fixed', left: 0, top: 0, width: W + 'px', height: H + 'px', zIndex: 99999, background: '#f4f1ea' });
    document.body.appendChild(rr.cv); rr.clearAll();
    const names = ['stance', 'wave', 'windup', 'release', 'raise', 'chop', 'sweep', 'crouch', 'jump', 'kick', 'hurt', 'victory', 'cross', 'stand'];
    const IM = {}; for (const n of CH) { const i = new Image(); i.src = 'v4/sprites/' + n + '.webp'; await i.decode(); IM[n] = i; }
    for (let r = 0; r < CH.length; r++) {
      const n = CH[r], c = Rig.get(n); if (!c) continue;
      const img = IM[n];
      const look = n.split('-')[0], key = n.startsWith('hero') ? 'hero' : look;
      const ref = key === 'hero' ? P.stance : look === 'hotel' ? P.cross : look === 'trainee' ? P.stand : P.stance;
      const items = MODE === 'poses' ? names.map(x => P[x]) : Array.from({ length: 14 }, (_, i) => Rig.gait(ref, i / 14, MODE === 'run', 1));
      const cw = W / 14, hh = RH * .86;
      items.forEach((pose, i) => {
        Rig.pose(c, pose, ref, GAIN[key], 1, null, null, 0);
        const k = hh / 520, x = i * cw + cw / 2, y = r * RH + RH * .96;
        const X = Rig.modelX(x, y, 0, 1, 1, -hh * .45, k, 1, c.d.w / 2, 520, 1);
        rr.draw(c, img, c.M, X, null, 1);
      });
    }
  }, [CH, MODE, W, RH]);
  await p.waitForTimeout(200); await p.screenshot({ path: OUT });
  console.log(JSON.stringify(errs)); await b.close();
})();
