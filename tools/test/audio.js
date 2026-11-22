/* Kiểm thử âm thanh chung hotel/bk-audio.js bằng OfflineAudioContext (dựng ngoại tuyến, không cần loa).
   node tools/test/audio.js [thư mục ra] [--demo]      (máy chủ tĩnh ở http://127.0.0.1:8765)
   - Mỗi bài lofi (5 bài) dựng 20 giây ở đoạn dày nhất (vòng 2 có bè): không NaN, không vỡ tiếng (đỉnh < 0,99, không mẫu nào chạm trần),
     mức to vừa (RMS −34…−12 dBFS), không xì: tỉ lệ năng lượng tần cao (sai phân bậc 1) thấp.
   - Bộ hiệu ứng dùng chung (E.fx) dựng liền nhau: không vỡ tiếng.
   - Không còn sóng vuông/răng cưa, không còn tiếng đĩa than trong mã âm thanh của game Khách sạn, 消消乐, Ngâm chill.
   - Chạy thật trong trình duyệt (khung 390×844): game Khách sạn bật nhạc + mọi hiệu ứng Snd; 消消乐 bật nhạc khi bấm chơi, tắt khi bấm 🔇,
     không còn tiếng "bíp" mỗi lần chạm (wake ≠ unlock); Ngâm chill bật nhạc. 0 lỗi console, 0 gọi máy chủ ngoài.
   --demo: xuất thêm <ra>/bk-audio-demo.mp3 (nghe thử 5 bài + hiệu ứng) bằng ffmpeg. In JSON, thoát 1 nếu hỏng. */
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const OUT = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'tools/test/out', DEMO = process.argv.includes('--demo');
const ROOT = path.join(__dirname, '../..');
fs.mkdirSync(OUT, { recursive: true });
function wav(file, L, Rr, sr) {
  const n = L.length, b = Buffer.alloc(44 + n * 4);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 4, 4); b.write('WAVE', 8); b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) { b.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(L[i] * 32767))), 44 + i * 4); b.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(Rr[i] * 32767))), 46 + i * 4); }
  fs.writeFileSync(file, b);
}
(async () => {
  const r = { tracks: [], errs: [] };
  /* 1. mã nguồn: không còn sóng gắt, không còn đĩa than */
  const src = {
    'bk-audio.js': fs.readFileSync(path.join(ROOT, 'hotel/bk-audio.js'), 'utf8'),
    'xiao.html': fs.readFileSync(path.join(ROOT, 'hotel/xiao.html'), 'utf8'),
    'chill.html': fs.readFileSync(path.join(ROOT, 'hotel/chill.html'), 'utf8'),
    'index.html': fs.readFileSync(path.join(ROOT, 'hotel/index.html'), 'utf8').split('/* ===== âm thanh')[1].split('/* =====')[0]
  };
  r.harsh = Object.entries(src).filter(([, s]) => /'square'|'sawtooth'|vinyl|crackle/.test(s)).map(([k]) => k);
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }), p = await b.newPage();
  p.on('pageerror', e => r.errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') r.errs.push(m.text()); });
  await p.goto('http://127.0.0.1:8765/404.html'); await p.addScriptTag({ url: '/hotel/bk-audio.js' });
  const render = (id, secs, loop, mood, sea, keep) => p.evaluate(async ([id, secs, loop, mood, sea, keep]) => {
    const sr = 44100, ctx = new OfflineAudioContext(2, sr * secs, sr), E = BKAudio.engine(ctx, ctx.destination);
    const M = E.music({ ids: [id], vol: .7, mood: () => mood, sea }); M.render(0, secs - 1.5, loop);
    const buf = await ctx.startRendering(), L = buf.getChannelData(0), R = buf.getChannelData(1);
    let pk = 0, ss = 0, clip = 0, nan = 0, hd = 0;
    for (let i = 0; i < L.length; i++) { const a = L[i], c = R[i]; if (a !== a || c !== c) { nan++; continue; } const m = Math.max(Math.abs(a), Math.abs(c)); if (m > pk) pk = m; if (m >= .999) clip++; ss += a * a + c * c; if (i) { const d = a - L[i - 1]; hd += d * d; } }
    const rms = Math.sqrt(ss / (2 * L.length)), hf = hd / Math.max(1e-9, ss / 2);
    const res = { id, peak: +pk.toFixed(3), rmsDb: +(20 * Math.log10(rms || 1e-9)).toFixed(1), clip, nan, hf: +hf.toFixed(4) };
    if (keep) { res.L = Array.from(L, x => Math.round(x * 32767)); res.R = Array.from(R, x => Math.round(x * 32767)); }
    return res;
  }, [id, secs, loop, mood, sea, keep]);
  for (const id of ['song', 'chieu', 'dem', 'trang', 'tra']) {
    const x = await render(id, 20, 1, 'day', true); delete x.L; delete x.R; r.tracks.push(x);
  }
  /* 1b. trọn 5 bài × 3 tâm trạng (đủ 4 vòng, kể cả vòng ứng tác): xếp lịch không lỗi */
  r.schedErrors = await p.evaluate(() => {
    let n = 0;
    for (const mood of ['day', 'eve', 'late']) { const ctx = new OfflineAudioContext(2, 44100, 44100), E = BKAudio.engine(ctx, ctx.destination), M = E.music({ mood: () => mood, track: 0, sea: true }); M.render(0, 560); n += M.errors; }
    return n;
  });
  /* 2. hiệu ứng */
  r.fx = await p.evaluate(async keep => {
    const sr = 44100, ctx = new OfflineAudioContext(2, sr * 14, sr), E = BKAudio.engine(ctx, ctx.destination);
    // dựng lần lượt bằng cách dời thời gian: dùng bus sfx và nhạc cụ trực tiếp
    const o = E.sfx, at = [];
    const S = (t, f) => at.push([t, f]);
    S(.2, t => E.mo(o, t, .045, 1500)); S(.8, t => { E.chime(o, 96, t, .055, .7); E.chime(o, 101, t + .07, .05, 1); });
    S(1.6, t => { E.tranh(o, 79, t, .09, .5); E.tranh(o, 84, t + .09, .09, .7); E.chime(o, 91, t + .18, .035, 1.2); });
    S(2.8, t => E.bau(o, 62, t, .4, .085, { from: 66, uon: false }));
    S(3.6, t => { E.gliss(o, [72, 74, 76, 79, 81, 84, 86, 88], t, .07, .055, 1.3); [91, 96, 100].forEach((m, i) => E.chime(o, m, t + .5 + i * .12, .04, 2)); });
    S(6, t => { E.thump(o, t, .2, 110, 38, .55); E.whoosh(o, t, .45, .06, 900, 140, .7); });
    S(7, t => { E.whoosh(o, t, .34, .09, 500, 3800, 1.4); E.chime(o, 91, t + .05, .04, .5); });
    S(8, t => [69, 67, 64, 62].forEach((m, i) => E.tieu(o, m, t + i * .26, .3, .09)));
    S(9.5, t => { E.mo(o, t, .07, 620); E.mo(o, t + .15, .07, 700); [72, 76, 79, 84].forEach((m, i) => E.tranh(o, m, t + .32 + i * .08, .07, .55)); });
    S(11, t => { E.pipa(o, 76, t, 1, .085); E.nhi(o, 79, t + 1.1, 1.2, .07); });
    at.forEach(([t, f]) => f(t));
    const buf = await ctx.startRendering(), L = buf.getChannelData(0), R = buf.getChannelData(1); let pk = 0, nan = 0;
    for (let i = 0; i < L.length; i++) { const m = Math.max(Math.abs(L[i]), Math.abs(R[i])); if (m !== m) nan++; else if (m > pk) pk = m; }
    return keep ? { peak: +pk.toFixed(3), nan, L: Array.from(L, x => Math.round(x * 32767)), R: Array.from(R, x => Math.round(x * 32767)) } : { peak: +pk.toFixed(3), nan };
  }, DEMO);
  if (DEMO) {
    const parts = [], tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'bka-'));
    const plan = [['song', 0, 'day'], ['chieu', 3, 'day'], ['trang', 0, 'eve'], ['tra', 0, 'day'], ['dem', 3, 'late']];
    for (const [id, loop, mood] of plan) {
      const x = await render(id, 22, loop, mood, true, true), f = path.join(tmp, id + '.wav');
      wav(f, Float32Array.from(x.L, v => v / 32767), Float32Array.from(x.R, v => v / 32767), 44100); parts.push(f);
    }
    const ff = path.join(tmp, 'fx.wav'); wav(ff, Float32Array.from(r.fx.L, v => v / 32767), Float32Array.from(r.fx.R, v => v / 32767), 44100); parts.push(ff);
    const inputs = parts.flatMap(f => ['-i', f]), n = parts.length;
    let fc = '', prev = '[0:a]';
    for (let i = 1; i < n; i++) { const o = i === n - 1 ? '[out]' : `[a${i}]`; fc += `${prev}[${i}:a]acrossfade=d=2:c1=tri:c2=tri${o};`; prev = o; }
    const mp3 = path.join(OUT, 'bk-audio-demo.mp3');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', fc.replace(/;$/, ''), '-map', '[out]', '-c:a', 'libmp3lame', '-b:a', '160k', mp3]);
    r.demo = mp3;
  }
  delete r.fx.L; delete r.fx.R;
  /* 3. chạy thật */
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }), q = await ctx.newPage(), ext = [];
  q.on('pageerror', e => r.errs.push('PAGE ' + e.message)); q.on('console', m => { if (m.type() === 'error') r.errs.push(m.text()); });
  ctx.on('request', x => { const u = x.url(); if (!/^(http:\/\/127\.0\.0\.1|data:|blob:|about:)/.test(u)) ext.push(u); });
  await q.goto('http://127.0.0.1:8765/404.html');
  await q.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_hotel_v3', JSON.stringify({ lv: 1, tut: 'done', intro: true, coins: 200, pts: 60, star: 2, served: 5, answered: 5, correct: 5, cardV: 1, muted: false, music: true, story: { done: { c1: 2, c2: 2, c3: 2 } } })); });
  await q.goto('http://127.0.0.1:8765/hotel/');
  await q.waitForFunction(() => !document.getElementById('boot') || document.getElementById('boot').classList.contains('done'), null, { timeout: 40000 });
  await q.evaluate(() => document.querySelectorAll('.ov.on').forEach(o => o.classList.remove('on')));
  await q.mouse.click(200, 400); await q.waitForTimeout(800);
  r.hotel = await q.evaluate(async () => {
    const S = __hotel.Snd; S.unlock(); await new Promise(f => setTimeout(f, 600));
    S.play('ui'); S.play('hit', 1.2); S.play('hurt'); S.play('win'); S.coin(3); S.build(); S.starUp(); S.discover(); S.click(); S.boom();
    const t1 = S.track.name; S.nextTrack(); S.duck(true); S.duck(false);
    return { music: S.musicOn, t1, t2: S.track.name, ins: S.track.ins };
  });
  await q.waitForTimeout(1500);
  await q.goto('http://127.0.0.1:8765/hotel/xiao.html'); await q.waitForTimeout(500);
  await q.click('#goBtn'); await q.waitForTimeout(400);
  r.xiao = await q.evaluate(() => ({ music: __xiao.Sfx.musicOn, state: __xiao.Sfx.state }));
  await q.evaluate(() => { const X = __xiao.Sfx; ['swap', 'bad', 'made', 'beam', 'boom', 'pearl', 'nova', 'sand', 'crate', 'unlock', 'lug', 'timeup', 'ok', 'no', 'coin', 'win', 'lose', 'ui', 'fever', 'cut'].forEach(k => X[k]()); X.match(3, true); X.tick(2); });
  r.xiao.wakeIsNotUnlock = await q.evaluate(() => __xiao.Sfx.wake !== __xiao.Sfx.unlock);
  await q.evaluate(() => document.getElementById('muteP').click()); await q.waitForTimeout(300);
  r.xiao.afterMute = await q.evaluate(() => __xiao.Sfx.musicOn);
  await q.evaluate(() => document.getElementById('muteP').click());
  await q.goto('http://127.0.0.1:8765/hotel/chill.html'); await q.waitForTimeout(400); await q.click('#go'); await q.waitForTimeout(800);
  r.chill = await q.evaluate(() => { __chill.Sfx.pop(2); __chill.Sfx.soft(); __chill.Sfx.drip(); __chill.Sfx.fin(); return { music: __chill.Sfx.musicOn, state: __chill.Sfx.state }; });
  await q.waitForTimeout(800); r.ext = ext;
  await b.close();
  r.ok = !r.harsh.length && !r.errs.length && r.schedErrors === 0 && !r.ext.length && r.hotel.music && r.hotel.t1 !== r.hotel.t2 && r.xiao.music && r.xiao.wakeIsNotUnlock && !r.xiao.afterMute && r.chill.music && r.fx.peak < .99 && !r.fx.nan && r.tracks.every(x => !x.nan && !x.clip && x.peak < .99 && x.rmsDb > -34 && x.rmsDb < -12 && x.hf < .05);
  console.log(JSON.stringify(r)); process.exit(r.ok ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
