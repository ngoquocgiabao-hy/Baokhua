/* Đường phát file giọng Gemini (giả lập manifest). Dùng: node tools/test/voicefiles.js [OUT] (cần OUT/t.mp3)
   Cần: máy chủ tĩnh ở thư mục repo (python3 -m http.server 8765 --bind 127.0.0.1) hoặc đặt BASE=... ; Playwright + Chromium. */
const BASE = process.env.BASE || 'http://127.0.0.1:8765';
const { chromium } = require('playwright'); const fs = require('fs');
const SP = process.argv[2] || require('path').join(__dirname, 'out');
(async () => {
  try { for (const d of ['m7', 'm14', 'm15', 'm16', 'm17', 'm21']) require('fs').mkdirSync(require('path').join(process.argv[2] || require('path').join(__dirname, 'out'), d), { recursive: true }); } catch (e) {}
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  for (const vw of [[360, 640], [390, 844]]) {
    const p = await b.newPage({ viewport: { width: vw[0], height: vw[1] }, isMobile: true, hasTouch: true });
    const errs = [], hosts = new Set(), got = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    p.on('request', r => { const u = new URL(r.url()); if (u.hostname !== new URL(BASE).hostname) hosts.add(u.hostname); if (/voice/.test(u.pathname)) got.push(u.pathname); });
    await p.route('**/game.html', async rt => { const r = await rt.fetch(); let t = await r.text(); t = t.replace('const VOICE_FILES = false;', 'const VOICE_FILES = true;'); rt.fulfill({ response: r, body: t }); });
    await p.route('**/v4/voice/manifest.json', rt => rt.fulfill({ contentType: 'application/json', body: JSON.stringify({ '你好！我是新来的。': 't.mp3' }) }));
    await p.route('**/v4/voice/t.mp3', rt => rt.fulfill({ contentType: 'audio/mpeg', body: fs.readFileSync(SP + '/t.mp3') }));
    await p.goto(BASE + '/game.html'); await p.waitForTimeout(600);
    const r1 = await p.evaluate(() => ({ ready: window.__bao.Voice.ready, voice: window.__bao.Voice.voice }));
    // mở trận trạm 0 → boss nói câu chào (có file) 
    await p.evaluate(() => { const B = window.__bao; B.prog.unlock = 4; B.prog.met._intro = true; B.startStage(0); });
    await p.waitForTimeout(2600);
    const r2 = await p.evaluate(() => window.__bao.Voice.say('谢谢'));
    await p.waitForTimeout(300);
    console.log(vw.join('x'), JSON.stringify({ r1, got, sayFallback: r2, errs, hosts: [...hosts] }));
    await p.close();
  }
  await b.close();
})();
