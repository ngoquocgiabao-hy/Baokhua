// Xưởng video Bảo Khựa: dựng hàng loạt video dọc 9:16 bằng HyperFrames.
//   node tools/build.mjs              dựng tất cả
//   node tools/build.mjs tv01 hn-hotel-1   chỉ dựng các mã này
//   node tools/build.mjs --list       liệt kê mã video
//   node tools/build.mjs --no-render  chỉ sinh HTML (xem trước bằng: npx hyperframes preview out/build/<mã>)
// Dữ liệu: WORDS và QUESTIONS_RAW đọc thẳng từ ../khachsan.html (một nguồn chung với game).
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const V = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(V, '..');
const OUT = path.join(V, 'out');
const cfg = JSON.parse(fs.readFileSync(path.join(V, 'config.json'), 'utf8'));
const args = process.argv.slice(2);
const only = args.filter(a => !a.startsWith('--'));

/* ---------- đọc dữ liệu game ---------- */
const GAME = fs.readFileSync(path.join(ROOT, 'khachsan.html'), 'utf8');
function grab(name, open, close) {
  const head = `const ${name} = `; const j = GAME.indexOf(head) + head.length;
  if (j < head.length) throw new Error('Không thấy ' + name + ' trong khachsan.html');
  let d = 0;
  for (let k = j; k < GAME.length; k++) {
    if (GAME[k] === open) d++;
    else if (GAME[k] === close && --d === 0) return vm.runInNewContext('(' + GAME.slice(j, k + 1) + ')');
  }
}
const WORDS = grab('WORDS', '{', '}');
const QUESTIONS = grab('QUESTIONS_RAW', '[', ']');
const HAN = /[一-鿿]/;

/* Câu hỏi → thẻ "3 giây trả lời": cần câu Trung, pinyin, nghĩa Việt; bỏ câu điền chỗ trống */
function card(q) {
  const ans = q.dap_an[q.dung];
  const zh = HAN.test(ans) ? ans : q.zh;
  if (!zh || !q.pinyin || /_/.test(zh + q.pinyin)) return null;
  let vi = q.giai_thich || '';
  if (HAN.test(vi)) { const m = q.cau_hoi.match(/['‘“"]([^'’”"]+)['’”"]/); vi = m ? m[1] : ''; }
  if (!vi) return null;
  return { id: q.id, topic: q.topic, zh, py: q.pinyin, vi: vi.replace(/\.$/, '') };
}

/* ---------- khung trang chung ---------- */
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const CSS = `
@font-face{font-family:'Inter Display';src:local('Inter Display'),local('Inter Display Black'),local('Inter Display ExtraBold')}
@font-face{font-family:'Inter';src:local('Inter')}
@font-face{font-family:'WenQuanYi Zen Hei';src:local('WenQuanYi Zen Hei')}
@font-face{font-family:'Noto Sans CJK SC';src:local('Noto Sans CJK SC')}
:root{--deep:#0F3468;--denim:#1E5AA8;--sun:#FFD91F;--amber:#F2B200;--ink:#16171B;--cream:#FFF7D6;
  --vi:"Inter Display","Inter",sans-serif;--zh:"WenQuanYi Zen Hei","Noto Sans CJK SC",sans-serif}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:var(--deep)}
#root{position:relative;width:1080px;height:1920px;overflow:hidden;font-family:var(--vi);color:var(--cream)}
.bg{position:absolute;inset:0;background:radial-gradient(120% 70% at 50% 30%,#1E5AA8 0%,#0F3468 55%,#081a36 100%)}
.full{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 80px;text-align:center}
.brand{position:absolute;top:120px;left:0;right:0;display:flex;justify-content:center}
.brand span{font:800 40px var(--vi);letter-spacing:.12em;color:var(--ink);background:var(--sun);padding:12px 34px;border-radius:999px}
.brand span b{font-family:var(--zh);font-weight:400;letter-spacing:0}
.win{position:absolute;left:90px;width:900px;height:799px;border:8px solid var(--sun);border-radius:44px;overflow:hidden;box-shadow:0 30px 0 rgba(0,0,0,.35)}
.win video{width:100%;height:100%;object-fit:cover;display:block}
.bar{position:absolute;left:0;bottom:0;height:16px;width:1080px;background:var(--sun);transform-origin:left center}
.h1{font:900 92px/1.12 var(--vi);letter-spacing:-.02em;text-shadow:0 8px 0 rgba(0,0,0,.35)}
.kicker{font:800 44px var(--vi);color:var(--sun);letter-spacing:.06em;text-transform:uppercase;margin-bottom:26px}
.zh{font-family:var(--zh);color:#fff;text-shadow:0 12px 0 var(--ink)}
.py{font:700 italic 92px var(--vi);color:var(--sun);margin-top:34px}
.vi{display:inline-block;font:800 76px var(--vi);color:var(--ink);background:var(--cream);padding:14px 48px;border-radius:28px;margin-top:34px}
.cta1{font:900 80px/1.15 var(--vi)}
.cta2{font:700 50px/1.3 var(--vi);color:var(--sun);margin-top:34px}
.btn{margin-top:60px;font:800 50px var(--vi);color:var(--ink);background:var(--sun);padding:28px 60px;border-radius:999px;box-shadow:0 12px 0 var(--amber)}
`;

function page({ dur, css = '', body, tl }) {
  return `<!doctype html>
<html lang="vi" data-resolution="portrait">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<script src="./gsap.min.js"></script>
<style>${CSS}${css}</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${dur}" data-width="1080" data-height="1920">
<div class="bg"></div>
${body}
<div class="brand"><span>${esc(cfg.brand).replace(/([一-鿿]+)/, '<b>$1</b>')}</span></div>
<div class="bar" id="bar"></div>
</div>
<script>
const tl = gsap.timeline({ paused: true });
tl.fromTo("#bar", { scaleX: 0 }, { scaleX: 1, duration: ${dur}, ease: "none" }, 0);
${tl}
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;
tl.seek(0);
</script>
</body>
</html>
`;
}

/* âm thanh: nhạc nền lặp từ v4/audio, tiếng "ting" khi lật đáp án, tiếng thắng ở cuối */
let sfxN = 0;
const sfx = (file, t, vol = 0.6) => `<audio id="sfx${++sfxN}" src="${file}" data-start="${t.toFixed(2)}" data-volume="${vol}"></audio>`;
const music = dur => `<audio id="bgm" src="bgm.m4a" data-start="0" data-duration="${dur}" data-volume="0.22" data-fade-out="1"></audio>`;

/* màn kêu gọi cuối, dùng chung */
const OUTRO = 3;
function outro(t0) {
  return {
    body: `<div class="full clip" id="outro" data-start="${t0}" data-duration="${OUTRO}">
  <div class="cta1">${esc(cfg.cta.line1)}</div>
  <div class="cta2">${esc(cfg.cta.line2)}</div>
  <div class="btn">${esc(cfg.cta.button)}</div>
</div>
${sfx('win.ogg', t0 + 0.1, 0.5)}`,
    tl: `tl.from("#outro .cta1", { y: 70, opacity: 0, duration: .5, ease: "back.out(1.6)" }, ${t0 + 0.1});
tl.from("#outro .cta2", { opacity: 0, duration: .4 }, ${t0 + 0.5});
tl.from("#outro .btn", { scale: 0, duration: .45, ease: "back.out(2)" }, ${t0 + 0.8});`
  };
}

/* ---------- mẫu 1: TỪ VỰNG (cảnh game + 3–4 từ) ---------- */
function tuvung(pack) {
  const words = pack.words.map(k => { const w = WORDS[k]; if (!w) throw new Error(pack.id + ': không có từ ' + k); return { zh: w[0], py: w[1], vi: w[2] }; });
  const INTRO = 2.2, PER = 3.2, t1 = INTRO + PER * words.length, dur = +(t1 + OUTRO).toFixed(2);
  const css = `.win{top:220px}
#intro{top:1060px;bottom:auto;height:520px}
.wcard{top:1090px;bottom:auto;height:560px;justify-content:flex-start}
.wcard .zh{font-size:220px;line-height:1}
.num{position:absolute;top:990px;left:0;right:0;margin:0 auto;width:max-content;font:900 52px var(--vi);color:var(--ink);background:var(--sun);padding:6px 26px;border-radius:999px}`;
  let body = `<div class="win" id="win"><video id="game" src="clip.mp4" muted data-start="0" data-duration="${t1}"></video></div>
<div class="full clip" id="intro" data-start="0" data-duration="${INTRO}"><div class="kicker">${words.length} từ tiếng Trung</div><div class="h1">${esc(pack.title)}</div></div>`;
  let tl = `tl.from("#intro .kicker", { y: -30, opacity: 0, duration: .35 }, .1);
tl.from("#intro .h1", { y: 80, opacity: 0, duration: .6, ease: "back.out(1.7)" }, .25);
tl.to("#win", { opacity: 0, duration: .25 }, ${t1});`;
  words.forEach((w, i) => {
    const t = +(INTRO + i * PER).toFixed(2), s = `#w${i}`;
    body += `
<div class="full clip wcard" id="w${i}" data-start="${t}" data-duration="${PER}">
  <div class="zh">${esc(w.zh)}</div><div class="py">${esc(w.py)}</div><div class="vi">${esc(w.vi)}</div>
</div>
<div class="clip" id="n${i}" data-start="${t}" data-duration="${PER}"><div class="num">${i + 1}/${words.length}</div></div>
${sfx('ui.ogg', t + 0.05, 0.7)}${sfx('ui.ogg', t + 1.1, 0.5)}`;
    tl += `
tl.from("${s} .zh", { scale: 1.9, opacity: 0, duration: .45, ease: "power4.out" }, ${t + 0.05});
tl.from("${s} .py", { y: 40, opacity: 0, duration: .35, ease: "power2.out" }, ${t + 0.6});
tl.from("${s} .vi", { scale: .3, opacity: 0, duration: .4, ease: "back.out(2)" }, ${t + 1.1});
tl.from("#n${i} .num", { scale: 0, duration: .3, ease: "back.out(2)" }, ${t});`;
  });
  const o = outro(t1);
  return {
    id: pack.id, dur, html: page({ dur, css, body: body + music(dur) + o.body, tl: tl + '\n' + o.tl }),
    caption: `${pack.title} 🏨\n` + words.map(w => `${w.zh} (${w.py}) – ${w.vi}`).join('\n')
  };
}

/* ---------- mẫu 2: 3 GIÂY TRẢ LỜI ---------- */
function hoinhanh(id, label, cards) {
  const INTRO = 2, PER = 6.6, t1 = INTRO + PER * cards.length, dur = +(t1 + OUTRO).toFixed(2);
  const css = `.bgv{position:absolute;inset:-40px;filter:blur(14px) brightness(.45)}
.bgv video{width:100%;height:100%;object-fit:cover}
.q .kicker{margin-bottom:40px}
.q .ask{font:900 84px/1.15 var(--vi)}
.q .ring{position:relative;width:260px;height:260px;margin:70px auto 0}
.q .ring svg{position:absolute;inset:0;transform:rotate(-90deg)}
.q .cd{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:900 150px var(--vi);color:var(--sun)}
.q .ans{position:absolute;left:0;right:0;top:1040px;text-align:center;padding:0 60px}
.q .ans .zh{font-size:120px;line-height:1.2}
.q .ans .py{font-size:64px;margin-top:22px}
.q .top{position:absolute;left:0;right:0;top:330px;padding:0 70px;text-align:center}`;
  let body = `<div class="bgv" id="bgv"><video id="game" src="clip.mp4" muted data-start="0" data-duration="${dur}" data-playback-rate="0.6"></video></div>
<div class="full clip" id="intro" data-start="0" data-duration="${INTRO}"><div class="kicker">3 giây trả lời</div><div class="h1">Tiếng Trung ${esc(label.toLowerCase())}</div><div class="cta2">Bạn trả lời kịp không?</div></div>`;
  let tl = `tl.from("#intro .kicker", { y: -30, opacity: 0, duration: .35 }, .1);
tl.from("#intro .h1", { scale: .6, opacity: 0, duration: .5, ease: "back.out(1.7)" }, .25);
tl.from("#intro .cta2", { opacity: 0, duration: .35 }, .8);`;
  const C = 2 * Math.PI * 115;
  cards.forEach((c, i) => {
    const t = +(INTRO + i * PER).toFixed(2), s = `#q${i}`;
    // 0–1: câu hỏi hiện; 1–4: đếm 3-2-1; 4: lật đáp án
    body += `
<div class="clip q" id="q${i}" data-start="${t}" data-duration="${PER}" style="position:absolute;inset:0">
  <div class="top">
    <div class="kicker">Câu ${i + 1}/${cards.length} · Tiếng Trung nói sao?</div>
    <div class="ask">“${esc(c.vi)}”</div>
    <div class="ring"><svg viewBox="0 0 260 260"><circle cx="130" cy="130" r="115" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="18"/><circle class="arc" cx="130" cy="130" r="115" fill="none" stroke="#FFD91F" stroke-width="18" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="0"/></svg>
      <div class="cd"><span class="d3">3</span></div><div class="cd"><span class="d2">2</span></div><div class="cd"><span class="d1">1</span></div></div>
  </div>
  <div class="ans"><div class="zh">${esc(c.zh)}</div><div class="py">${esc(c.py)}</div></div>
</div>
${[1, 2, 3].map(k => sfx('ui.ogg', t + k, 0.45)).join('')}${sfx('hit.ogg', t + 4, 0.6)}`;
    tl += `
tl.from("${s} .kicker", { opacity: 0, y: -20, duration: .3 }, ${t});
tl.from("${s} .ask", { scale: .7, opacity: 0, duration: .45, ease: "back.out(1.8)" }, ${t + 0.1});
tl.from("${s} .ring", { opacity: 0, scale: .5, duration: .3 }, ${t + 0.7});
tl.fromTo("${s} .arc", { attr: { "stroke-dashoffset": 0 } }, { attr: { "stroke-dashoffset": ${C.toFixed(1)} }, duration: 3, ease: "none" }, ${t + 1});
${[3, 2, 1].map((d, k) => `tl.fromTo("${s} .d${d}", { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: .25, ease: "power3.out" }, ${t + 1 + k});
tl.to("${s} .d${d}", { opacity: 0, duration: .1 }, ${t + 1.9 + k});`).join('\n')}
tl.set("${s} .d3, ${s} .d2, ${s} .d1", { opacity: 0 }, ${t});
tl.to("${s} .ring", { opacity: 0, duration: .2 }, ${t + 4});
tl.from("${s} .ans .zh", { scale: 1.8, opacity: 0, duration: .45, ease: "power4.out" }, ${t + 4});
tl.from("${s} .ans .py", { y: 30, opacity: 0, duration: .35 }, ${t + 4.45});`;
  });
  const o = outro(t1);
  return {
    id, dur, html: page({ dur, css, body: body + music(dur) + o.body, tl: tl + '\n' + o.tl }),
    caption: `3 giây trả lời · ${label} ⏱️ Bạn trả lời kịp mấy câu?\n` + cards.map(c => `${c.zh} (${c.py}) – ${c.vi}`).join('\n')
  };
}

/* ---------- mẫu 3: KHAI GIẢNG (1★ → 5★ → thông tin lớp) ---------- */
function khaigiang(k) {
  const A = 3, B = 5, C = 6.5, dur = +(A + B + C + OUTRO).toFixed(2);
  const css = `.win{top:330px}
.cap{position:absolute;left:0;right:0;top:1250px;text-align:center;padding:0 70px}
.cap .h1{font-size:80px}
.tag{position:absolute;top:360px;left:96px;font:900 48px var(--vi);color:var(--ink);background:var(--sun);padding:8px 28px;border-radius:999px;z-index:2}
#info .h1{font-size:84px;margin-bottom:50px}
#info .ln{font:700 54px/1.25 var(--vi);background:rgba(255,255,255,.08);border-left:12px solid var(--sun);border-radius:18px;padding:22px 34px;margin:14px 0;text-align:left;width:900px}
#info .ln b{color:var(--sun)}`;
  const body = `
<div class="win" id="win1"><video id="v1" src="clip1.mp4" muted data-start="0" data-duration="${A}"></video></div>
<div class="clip" id="s1" data-start="0" data-duration="${A}"><div class="tag">1★</div><div class="cap"><div class="h1">${esc(k.hook)}</div></div></div>
<div class="win" id="win2"><video id="v2" src="clip.mp4" muted data-start="${A}" data-duration="${B}" data-media-start="4" data-playback-rate="2"></video></div>
<div class="clip" id="s2" data-start="${A}" data-duration="${B}"><div class="tag">5★</div><div class="cap"><div class="h1">${esc(k.turn)}</div></div></div>
<div class="full clip" id="info" data-start="${A + B}" data-duration="${C}">
  <div class="h1">${esc(k.title)}</div>
  ${k.lines.map((l, i) => `<div class="ln" id="l${i}">${esc(l).replace(/(\d[\d.:/]*(đ|\/\d+)?)/g, '<b>$1</b>')}</div>`).join('\n  ')}
</div>
${sfx('ui.ogg', 0.2, 0.6)}${sfx('hit.ogg', A, 0.7)}${k.lines.map((_, i) => sfx('ui.ogg', A + B + 0.6 + i * 0.45, 0.45)).join('')}`;
  const tl = `tl.set("#win2", { opacity: 0 }, 0);
tl.set("#win1", { opacity: 0 }, ${A});
tl.set("#win2", { opacity: 1 }, ${A});
tl.to("#win2", { opacity: 0, duration: .25 }, ${A + B});
tl.from("#s1 .h1", { y: 60, opacity: 0, duration: .5, ease: "back.out(1.7)" }, .2);
tl.from("#s1 .tag", { scale: 0, duration: .35, ease: "back.out(2)" }, .1);
tl.from("#s2 .tag", { scale: 2.4, opacity: 0, duration: .45, ease: "power4.out" }, ${A});
tl.from("#s2 .h1", { y: 60, opacity: 0, duration: .5, ease: "back.out(1.7)" }, ${A + 0.3});
tl.from("#info .h1", { y: -40, opacity: 0, duration: .45 }, ${A + B + 0.1});
${k.lines.map((_, i) => `tl.from("#l${i}", { x: -120, opacity: 0, duration: .4, ease: "power3.out" }, ${(A + B + 0.6 + i * 0.45).toFixed(2)});`).join('\n')}`;
  const o = outro(A + B + C);
  return {
    id: k.id, dur, html: page({ dur, css, body: body + music(dur) + o.body, tl: tl + '\n' + o.tl }),
    caption: `${k.title} 🏨\n` + k.lines.join('\n')
  };
}

/* ---------- danh sách việc ---------- */
const jobs = [];
for (const p of cfg.tuvung) jobs.push(() => tuvung(p));
const seen = new Set();
const cards = QUESTIONS.map(card).filter(c => c && !seen.has(c.zh.replace(/[。？！，\s]/g, '')) && seen.add(c.zh.replace(/[。？！，\s]/g, '')));
for (const [topic, label] of Object.entries(cfg.hoinhanh.topics)) {
  const list = cards.filter(c => c.topic === topic), n = cfg.hoinhanh.per_video;
  for (let i = 0; i + n <= list.length; i += n) {
    const id = `hn-${topic}-${i / n + 1}`;
    jobs.push(() => hoinhanh(id, label, list.slice(i, i + n)));
  }
}
jobs.push(() => khaigiang(cfg.khaigiang));

const built = jobs.map(f => f()).filter(j => !only.length || only.includes(j.id));
if (args.includes('--list')) { built.forEach(j => console.log(j.id.padEnd(16), j.dur + 's')); process.exit(0); }

/* ---------- sinh dự án + dựng ---------- */
const ASSETS = path.join(V, 'assets');
for (const f of ['clip_5sao_ngaydem.mp4', 'clip_1sao.mp4'])
  if (!fs.existsSync(path.join(ASSETS, f))) { console.error(`Thiếu assets/${f}. Chạy trước: npm run capture`); process.exit(1); }
fs.mkdirSync(path.join(OUT, 'build'), { recursive: true });
const bgmSrc = path.join(ROOT, 'v4/audio/bgm_loop.ogg');
const HF = path.join(V, 'node_modules/.bin/hyperframes');
const capLines = ['# Chú thích đăng TikTok (tự sinh, Bảo đọc lại trước khi đăng)', ''];

for (const j of built) {
  const dir = path.join(OUT, 'build', j.id);
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), j.html);
  fs.writeFileSync(path.join(dir, 'hyperframes.json'), JSON.stringify({ paths: { blocks: 'compositions', components: 'compositions/components', assets: 'assets' }, media: { autoProxy: true } }));
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({ id: j.id, name: j.id }));
  fs.copyFileSync(path.join(V, 'node_modules/gsap/dist/gsap.min.js'), path.join(dir, 'gsap.min.js'));
  fs.copyFileSync(path.join(ASSETS, 'clip_5sao_ngaydem.mp4'), path.join(dir, 'clip.mp4'));
  fs.copyFileSync(path.join(ASSETS, 'clip_1sao.mp4'), path.join(dir, 'clip1.mp4'));
  for (const s of ['ui.ogg', 'hit.ogg', 'win.ogg']) fs.copyFileSync(path.join(ROOT, 'v4/audio', s), path.join(dir, s));
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-stream_loop', '-1', '-i', bgmSrc, '-t', String(j.dur), '-c:a', 'aac', '-b:a', '128k', path.join(dir, 'bgm.m4a')]);
  capLines.push(`## ${j.id} (${j.dur}s)`, '', j.caption, '', `👉 ${cfg.cta.line1} · ${cfg.cta.line2}`, (j.id.includes('factory') ? cfg.hashtags.map(h => h === '#tiengtrungletan' ? '#tiengtrungnhamay' : h) : cfg.hashtags).join(' '), '');
  if (args.includes('--no-render')) { console.log('Đã sinh', dir); continue; }
  const t0 = Date.now();
  execFileSync(HF, ['render', '-o', path.join(OUT, j.id + '.mp4'), '--quiet'], { cwd: dir, stdio: ['ignore', 'ignore', 'inherit'], env: { ...process.env, HYPERFRAMES_SKIP_SKILLS: '1' } });
  // ảnh bìa: khung hình lúc tiêu đề đã hiện đủ
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', '1.6', '-i', path.join(OUT, j.id + '.mp4'), '-frames:v', '1', '-q:v', '3', path.join(OUT, j.id + '_bia.jpg')]);
  console.log(`✓ ${j.id}.mp4  ${j.dur}s  (dựng ${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
fs.writeFileSync(path.join(OUT, 'CAPTIONS.md'), capLines.join('\n'));
