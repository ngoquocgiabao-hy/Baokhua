// Thể loại F11 "NHẬT KÝ HÀNH TRÌNH": raw đời thật của Bảo → ảnh polaroid rơi theo nhịp trên giấy sổ tay,
// bản đồ vẽ đường bơi, nhãn chặng dán băng keo, câu nói thật của Bảo viết tay, thẻ chữ Hán lật 3D
// (chữ Hán + pinyin + nghĩa, giữ ≥ 2,5 s), ôn lại cuối video, kêu gọi. Cắt khung vuông giữa hình nên né được chữ in sẵn của raw.
//   node series/nhatky.mjs story/episodes/<tập>.json   → out/<id>/
// Tệp tập (ngoài git vì trỏ tới raw cá nhân):
//   { id, src:{khoá: đường dẫn}, map:{ from, to }, hook:{ dur, title, sub, quote?, shot },
//     legs:[{ dur, tag, shots:[{ src, a, d, speed?, cx?, cy?, cap? }], quote?:{ at, text }, cards:[{ at, dur, zh, py, vi }], map?:[p0,p1], pill? }],
//     finish:{ dur, shot, stamp, quote?, card }, recap:{ dur, title }, cta:{ dur, line, pill } }
// Thời lượng: hook + các chặng + finish + recap nên chia hết cho 0,5 s (120 BPM); music_series.py nhận HOOK, PER, NI.
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const V = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EP = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const OUTDIR = path.join(V, 'out', EP.id), CLIPS = path.join(OUTDIR, 'clips');
fs.mkdirSync(CLIPS, { recursive: true });
fs.mkdirSync(path.join(OUTDIR, 'fonts'), { recursive: true });
for (const f of fs.readdirSync(path.join(V, 'assets/fonts'))) if (f.endsWith('.woff2')) fs.copyFileSync(path.join(V, 'assets/fonts', f), path.join(OUTDIR, 'fonts', f));
const Y = '#FCE029', K = '#1B1A17', PAPER = '#F4ECDD', RED = '#D9442B', TEAL = '#1F8A8A';
const FV = "'Inter Display','Inter',sans-serif", FZ = "'WenQuanYi Zen Hei',sans-serif", FH = "'Patrick Hand','Inter',sans-serif";
const r2 = x => +(+x).toFixed(3);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<mark>$1</mark>');
const H = [], TL = [], KIT = [];
let n = 0;
const uid = p => `${p}${++n}`;
const to = (s, v, t) => TL.push(`tl.to(${JSON.stringify(s)}, ${v}, ${r2(t)});`);
const ft = (s, a, v, t) => TL.push(`tl.fromTo(${JSON.stringify(s)}, ${a}, ${v}, ${r2(t)});`);
const set = (s, v, t) => TL.push(`tl.set(${JSON.stringify(s)}, ${v}, ${r2(t)});`);
function st(inner, css, t0, t1, cls = '') { const id = uid('e'); H.push(`<div class="el ${cls}" id="${id}" style="${css}" data-start="${r2(t0)}" data-duration="${r2(t1 - t0)}">${inner}</div>`); return `#${id}`; }

/* cắt khung vuông giữa hình (né chữ in sẵn ở trên và dưới raw) */
const SQ = 720;
function cut(src, a, d, speed, cx, cy, out) {
  if (fs.existsSync(out) && !process.env.RECUT) return;
  const pr = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', src], { encoding: 'utf8' })).streams[0];
  const s = Math.min(pr.width, Math.round(pr.height * .46)), x = Math.round(Math.min(pr.width - s, Math.max(0, pr.width * cx - s / 2))), y = Math.round(Math.min(pr.height - s, Math.max(0, pr.height * cy - s / 2)));
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', String(a), '-t', String(r2(d * speed + .1)), '-i', src,
    '-vf', `crop=${s}:${s}:${x}:${y},scale=${SQ}:${SQ}:flags=lanczos,setpts=PTS/${speed},fps=30,unsharp=5:5:0.6,eq=contrast=1.06:saturation=1.15`, '-an', '-t', String(r2(d)),
    '-c:v', 'libx264', '-crf', '17', '-preset', 'fast', '-pix_fmt', 'yuv420p', '-g', '15', out]);
}

/* polaroid: khung trắng, băng keo, chú thích viết tay */
let k = 0, pz = 10;
function polaroid(sh, t0, t1, i) {
  const f = `c${String(++k).padStart(2, '0')}.mp4`;
  cut(path.resolve(V, EP.src[sh.src]), sh.a, sh.d, sh.speed || 1, sh.cx ?? .5, sh.cy ?? .55, path.join(CLIPS, f));
  KIT.push({ file: f, start: r2(t0), dur: r2(sh.d), src: sh.src, a: sh.a, cap: sh.cap || '' });
  const id = uid('p'), rot = [-3.5, 2.8, -1.6, 3.4][i % 4];
  H.push(`<div class="pol" id="${id}" style="z-index:${pz++}" data-start="${r2(t0)}" data-duration="${r2(t1 - t0)}"><div class="tape a"></div><div class="tape b"></div><div class="ph"><video src="clips/${f}" muted data-start="${r2(t0)}" data-duration="${r2(sh.d)}" data-media-start="0"></video><div class="shut"></div></div><div class="cap">${esc(sh.cap || '')}</div></div>`);
  const fromX = i % 2 ? 900 : -900;
  ft(`#${id}`, `{ x: ${fromX}, y: 260, rotation: ${rot * 6}, opacity: 1 }`, `{ x: 0, y: 0, rotation: ${rot}, duration: .45, ease: "back.out(1.4)" }`, t0);
  ft(`#${id} .ph video`, '{ scale: 1.0 }', `{ scale: 1.07, duration: ${r2(sh.d)}, ease: "none", immediateRender: false }`, t0);
  ft(`#${id} .shut`, '{ opacity: .9 }', '{ opacity: 0, duration: .3, ease: "power2.out", immediateRender: false }', t0 + .38);
  return id;
}
function card(c, t0, t1) {
  const long = [...c.zh].length > 6 ? ' long' : '';
  const s = st(`<div class="card${long}"><div class="zh">${esc(c.zh)}</div><div class="pv"><span class="py">${esc(c.py)}</span><span class="vi">${esc(c.vi)}</span></div></div>`, 'top:1296px', t0, t1, 'c3d');
  ft(`${s} .card`, '{ rotationX: -95, opacity: 0, y: 40 }', '{ rotationX: 0, opacity: 1, y: 0, duration: .55, ease: "back.out(1.6)" }', t0);
  to(`${s} .card`, '{ rotationX: 90, opacity: 0, duration: .25, ease: "power2.in" }', t1 - .27);
  KIT.push({ card: c, start: r2(t0), dur: r2(t1 - t0) });
}
function quote(text, t0, t1, top = 480) {
  const s = st(`<div class="quote">${esc(text)}</div>`, `top:${top}px`, t0, t1);
  ft(`${s} .quote`, '{ scale: 0, rotation: -14 }', '{ scale: 1, rotation: -4, duration: .4, ease: "back.out(2)" }', t0);
  to(`${s} .quote`, '{ scale: .8, opacity: 0, duration: .2 }', t1 - .22);
}
function tag(text, t0, t1) {
  const s = st(`<div class="tag">${md(text)}</div>`, 'top:240px;left:70px', t0, t1);
  ft(`${s} .tag`, '{ x: -700 }', '{ x: 0, duration: .4, ease: "expo.out" }', t0);
}

/* bản đồ sơ đồ: Hòn Gai (phải) → cầu Bãi Cháy (trái) */
const ROUTE = 'M 860 1150 C 760 1060, 640 1130, 540 1040 S 330 900, 240 820';
function mapSvg(big) {
  return `<svg viewBox="0 0 1080 1920" class="map${big ? ' big' : ''}">
  <defs><pattern id="wv${big ? 1 : 0}" width="60" height="30" patternUnits="userSpaceOnUse"><path d="M0 15 Q15 5 30 15 T60 15" fill="none" stroke="rgba(31,138,138,.25)" stroke-width="3"/></pattern></defs>
  <rect x="0" y="0" width="1080" height="1920" fill="#BFE3DF"/><rect x="0" y="0" width="1080" height="1920" fill="url(#wv${big ? 1 : 0})"/>
  <path d="M0 0 H1080 V560 C 900 640, 760 560, 600 640 C 470 700, 330 640, 180 700 C 100 730, 40 690, 0 720 Z" fill="#E9DDBF" stroke="${K}" stroke-width="6"/>
  <path d="M1080 1920 H0 V1500 C 160 1420, 300 1500, 470 1430 C 640 1360, 800 1440, 1080 1360 Z" fill="#E9DDBF" stroke="${K}" stroke-width="6"/>
  ${[[700, 860, 46], [380, 1200, 38], [930, 900, 30], [150, 1080, 34], [600, 1300, 26]].map(([x, y, r]) => `<path d="M${x - r} ${y} Q${x - r * .6} ${y - r * 1.6} ${x} ${y - r * 1.2} Q${x + r * .7} ${y - r * 1.5} ${x + r} ${y} Z" fill="#7FB069" stroke="${K}" stroke-width="5"/>`).join('')}
  <g transform="translate(240 820)"><line x1="-170" y1="-150" x2="120" y2="140" stroke="${K}" stroke-width="16" stroke-linecap="round"/><line x1="-30" y1="-10" x2="-30" y2="-150" stroke="${K}" stroke-width="10"/>${[-130, -100, -70, -40].map(o => `<line x1="-30" y1="-150" x2="${o + 30}" y2="${o + 40}" stroke="${K}" stroke-width="3"/>`).join('')}</g>
  <path id="rt${big ? 1 : 0}" d="${ROUTE}" fill="none" stroke="${RED}" stroke-width="12" stroke-dasharray="26 18" stroke-linecap="round" pathLength="1000"/>
  <circle cx="860" cy="1150" r="22" fill="${Y}" stroke="${K}" stroke-width="6"/>
  <text x="880" y="1225" font-family="Patrick Hand" font-size="64" fill="${K}" text-anchor="middle">${esc(EP.map?.from || '')}</text>
  <text x="250" y="680" font-family="Patrick Hand" font-size="64" fill="${K}" text-anchor="middle">${esc(EP.map?.to || '')}</text>
  <circle id="sw${big ? 1 : 0}" cx="860" cy="1150" r="26" fill="${RED}" stroke="#fff" stroke-width="8"/>
</svg>`;
}

/* ---------- ráp ---------- */
let t = 0;
const marks = [];
// mở: bản đồ lớn + tiêu đề + polaroid nhỏ
const hk = EP.hook;
H.push(`<div class="bigmap" id="bigmap" data-start="0" data-duration="${r2(hk.dur + .5)}">${mapSvg(true)}</div>`);
ft('#rt1', '{ attr: { "stroke-dashoffset": 1000 }, strokeDasharray: "1000 1000" }', `{ attr: { "stroke-dashoffset": 0 }, duration: ${r2(hk.dur * .6)}, ease: "power1.inOut" }`, .2);
const ttl = st(`<div class="hookT">${md(hk.title)}</div><div class="hookS">${esc(hk.sub)}</div>`, 'top:250px', 0, hk.dur, 'center');
ft(`${ttl} .hookT`, '{ y: -60, opacity: 0 }', '{ y: 0, opacity: 1, duration: .5, ease: "back.out(2)" }', .1);
ft(`${ttl} .hookS`, '{ scale: 0, rotation: -10 }', '{ scale: 1, rotation: -3, duration: .4, ease: "back.out(2.5)" }', .6);
if (hk.shot) {
  const f = `c${String(++k).padStart(2, '0')}.mp4`;
  cut(path.resolve(V, EP.src[hk.shot.src]), hk.shot.a, hk.shot.d, hk.shot.speed || 1, hk.shot.cx ?? .5, hk.shot.cy ?? .55, path.join(CLIPS, f));
  KIT.push({ file: f, start: 1.2, dur: r2(hk.dur - 1.2), src: hk.shot.src, a: hk.shot.a, cap: '' });
  const s = st(`<div class="mini-pol"><div class="ph"><video src="clips/${f}" muted data-start="1.2" data-duration="${r2(hk.dur - 1.2)}" data-media-start="0"></video></div></div>`, 'top:1000px;left:90px', 1.2, hk.dur);
  ft(`${s} .mini-pol`, '{ y: 900, rotation: 30 }', '{ y: 0, rotation: 6, duration: .5, ease: "back.out(1.5)" }', 1.2);
}
if (hk.quote) quote(hk.quote, 2.0, hk.dur, 700);
t = hk.dur;
// nền giấy (hiện từ chặng 1)
set('#paper', '{ opacity: 1 }', t - .01);
set('#minimap', '{ opacity: 0 }', 0);
EP.legs.forEach((L, li) => {
  const t0 = t, t1 = t + L.dur;
  marks.push(t0);
  tag(L.tag, t0, t1);
  let s0 = t0;
  L.shots.forEach((sh, i) => { polaroid(sh, s0, (i === L.shots.length - 1 ? t1 : s0 + sh.d + .45), i + li); s0 += sh.d; });
  if (L.quote) quote(L.quote.text, t0 + L.quote.at, Math.min(t1, t0 + L.quote.at + (L.quote.dur || 3)));
  (L.cards || []).forEach(c => card(c, t0 + c.at, t0 + c.at + c.dur));
  if (L.map) {
    set('#minimap', '{ opacity: 1 }', t0);
    ft('#mm-prog', `{ attr: { "stroke-dashoffset": ${1000 - L.map[0] * 1000} } }`, `{ attr: { "stroke-dashoffset": ${1000 - L.map[1] * 1000} }, duration: ${r2(L.dur)}, ease: "sine.inOut", immediateRender: false }`, t0);
  }
  if (L.pill) { const p = st(`<div class="dist">${esc(L.pill.text)}</div>`, 'top:250px;right:60px', t0 + L.pill.at, t1); ft(`${p} .dist`, '{ scale: 0 }', '{ scale: 1, duration: .35, ease: "back.out(2.5)" }', t0 + L.pill.at); }
  t = t1;
});
// về đích
const F = EP.finish, tf = t;
marks.push(tf);
tag(F.tag || '**VỀ ĐÍCH**', tf, tf + F.dur);
polaroid(F.shot, tf, tf + F.dur, 3);
const stp = st(`<div class="stamp">${esc(F.stamp)}</div>`, 'top:900px', tf + .5, tf + F.dur, 'center');
ft(`${stp} .stamp`, '{ scale: 3, rotation: -30, opacity: 0 }', '{ scale: 1, rotation: -12, opacity: 1, duration: .3, ease: "power4.in" }', tf + .5);
if (F.quote) quote(F.quote, tf + .9, tf + F.dur);
card(F.card, tf + .3, tf + F.dur - .02);
if (F.map) { ft('#mm-prog', `{ attr: { "stroke-dashoffset": ${1000 - F.map[0] * 1000} } }`, `{ attr: { "stroke-dashoffset": ${1000 - F.map[1] * 1000} }, duration: .8, ease: "power2.out", immediateRender: false }`, tf); }
set('#minimap', '{ opacity: 0 }', tf + F.dur);
t = tf + F.dur;
// ôn lại
const tr = t, RD = EP.recap.dur;
marks.push(tr);
set('#notebook', '{ opacity: 1 }', tr);
ft('#notebook', '{ y: 1920 }', '{ y: 0, duration: .4, ease: "expo.out" }', tr);
const items = KIT.filter(x => x.card).map(x => x.card);
const rt = st(`<div class="rtitle">${md(EP.recap.title)}</div>`, 'top:250px', tr, tr + RD, 'center');
ft(`${rt} .rtitle`, '{ y: -40, opacity: 0 }', '{ y: 0, opacity: 1, duration: .3, ease: "expo.out" }', tr + .2);
items.forEach((c, i) => {
  const s = st(`<div class="ri"><b>${i + 1}</b><div><span class="z">${esc(c.zh)}</span><span class="p">${esc(c.py)}</span><span class="v">${esc(c.vi)}</span></div></div>`, `top:${410 + i * 196}px`, tr + .3 + i * .2, tr + RD, 'center');
  ft(`${s} .ri`, `{ x: ${i % 2 ? 260 : -260}, opacity: 0 }`, '{ x: 0, opacity: 1, duration: .3, ease: "expo.out" }', tr + .3 + i * .2);
});
// kêu gọi
const tc = tr + RD, CD = EP.cta.dur;
marks.push(tc);
const cl = st(`<div class="ctaL">${md(EP.cta.line)}</div>`, 'top:640px', tc, tc + CD, 'center');
ft(`${cl} .ctaL`, '{ scale: 1.3, opacity: .3 }', '{ scale: 1, opacity: 1, duration: .35, ease: "back.out(1.8)" }', tc);
const pl = st(`<div class="pill">${esc(EP.cta.pill)}</div>`, 'top:1120px', tc + .5, tc + CD, 'center');
ft(`${pl} .pill`, '{ scale: .6, opacity: 0 }', '{ scale: 1, opacity: 1, duration: .35, ease: "back.out(2)" }', tc + .5);
const DUR = r2(tc + CD);
marks.forEach(m => ft('#flash', '{ opacity: .35 }', '{ opacity: 0, duration: .2, ease: "power2.out", immediateRender: false }', m));

/* bản đồ nhỏ góc trên: đường đỏ chạy theo tiến độ */
const MINI = `<div id="minimap"><svg viewBox="140 600 820 640"><rect x="140" y="600" width="820" height="640" fill="#BFE3DF"/>
<path d="${ROUTE}" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="14" stroke-dasharray="26 18" pathLength="1000"/>
<path id="mm-prog" d="${ROUTE}" fill="none" stroke="${RED}" stroke-width="18" stroke-linecap="round" pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000"/>
<circle cx="860" cy="1150" r="24" fill="${Y}" stroke="${K}" stroke-width="6"/><circle cx="240" cy="820" r="24" fill="${RED}" stroke="${K}" stroke-width="6"/>
<text x="860" y="1225" font-family="Patrick Hand" font-size="70" text-anchor="middle" fill="${K}">${esc(EP.map?.from || '')}</text>
<text x="330" y="720" font-family="Patrick Hand" font-size="70" text-anchor="middle" fill="${K}">${esc(EP.map?.to || '')}</text></svg></div>`;

const CSS = `
@font-face{font-family:'Patrick Hand';src:url(fonts/patrick-hand-vietnamese-400-normal.woff2) format('woff2');unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB}
@font-face{font-family:'Patrick Hand';src:url(fonts/patrick-hand-latin-ext-400-normal.woff2) format('woff2');unicode-range:U+0100-02AF,U+0304,U+0308,U+0329,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:'Patrick Hand';src:url(fonts/patrick-hand-latin-400-normal.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'Inter Display';src:local('Inter Display'),local('Inter Display Black')}
@font-face{font-family:'Inter';src:local('Inter')}
@font-face{font-family:'WenQuanYi Zen Hei';src:local('WenQuanYi Zen Hei')}
@font-face{font-family:'Noto Color Emoji';src:local('Noto Color Emoji')}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:${PAPER}}
#root{position:relative;width:1080px;height:1920px;overflow:hidden;background:${PAPER};color:${K};font-family:${FV}}
#paper{position:absolute;inset:0;opacity:0;background:${PAPER};background-image:linear-gradient(rgba(27,26,23,.07) 2px,transparent 2px),linear-gradient(90deg,rgba(27,26,23,.07) 2px,transparent 2px);background-size:60px 60px}
#paper::after{content:"";position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 45%,rgba(0,0,0,0) 60%,rgba(80,50,10,.18) 100%)}
.bigmap{position:absolute;inset:0}
.map{position:absolute;inset:0;width:1080px;height:1920px}
.el{position:absolute;left:0;right:0;display:flex;pointer-events:none}
.el.center{justify-content:center}
.c3d{justify-content:center;perspective:1400px}
.pol{position:absolute;left:140px;top:430px;width:800px;padding:36px 40px 0;height:868px;background:#fffdf8;box-shadow:0 18px 40px rgba(0,0,0,.28),0 2px 0 rgba(0,0,0,.08);opacity:0}
.pol .ph{position:relative;width:720px;height:720px;overflow:hidden;background:#222}
.pol .ph video,.mini-pol video{width:100%;height:100%;object-fit:cover;display:block;transform-origin:50% 50%}
.pol .shut{position:absolute;inset:0;background:#fff;opacity:0}
.pol .cap{font:400 58px/92px ${FH};text-align:center;color:${K};white-space:nowrap}
.tape{position:absolute;width:190px;height:54px;background:rgba(252,224,41,.78);box-shadow:0 2px 4px rgba(0,0,0,.12)}
.tape.a{left:-40px;top:-14px;transform:rotate(-32deg)}.tape.b{right:-40px;top:-14px;transform:rotate(30deg)}
.mini-pol{width:420px;height:470px;padding:22px 22px 0;background:#fffdf8;box-shadow:0 14px 30px rgba(0,0,0,.3)}
.mini-pol .ph{width:376px;height:376px;overflow:hidden}
mark{background:${Y};color:${K};padding:0 .14em;border-radius:6px;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.hookT{font:900 104px/1.02 ${FV};text-align:center;letter-spacing:-.03em;text-transform:uppercase;width:940px;text-wrap:balance;color:${K};text-shadow:0 4px 0 #fff}
.hookS{display:inline-block;margin:26px auto 0;font:400 76px ${FH};color:#fff;background:${RED};padding:4px 34px 10px;border-radius:12px;box-shadow:6px 8px 0 ${K}}
.el.center{flex-direction:column;align-items:center}
.tag{font:900 46px ${FV};letter-spacing:.01em;background:${Y};padding:12px 26px;border:5px solid ${K};border-radius:10px;transform:rotate(-2.5deg);box-shadow:6px 7px 0 ${K};white-space:nowrap}
.tag mark{background:${K};color:${Y}}
.quote{margin:0 auto;max-width:900px;font:400 66px/1.08 ${FH};color:${K};background:#FFF6A8;padding:18px 34px 22px;box-shadow:5px 8px 0 rgba(0,0,0,.25);text-align:center;transform:rotate(-4deg)}
.card{width:960px;background:#fff;border:6px solid ${K};border-radius:28px;padding:14px 30px 18px;box-shadow:0 12px 0 ${K};text-align:center;transform-origin:50% 0%}
.card .zh{font:400 92px/1.15 ${FZ};color:${K}}
.card.long .zh{font-size:74px}
.card .pv{margin-top:6px;display:flex;justify-content:center;gap:22px;align-items:baseline;flex-wrap:wrap}
.card .py{font:800 40px ${FV};color:${RED}}
.card .vi{font:800 40px ${FV};color:${K}}
.card .vi::before{content:"·";margin-right:22px;color:#999}
.stamp{font:900 120px ${FV};color:${RED};border:12px solid ${RED};border-radius:26px;padding:6px 36px;letter-spacing:.04em;mix-blend-mode:multiply;opacity:.92;background:rgba(255,255,255,.15)}
.dist{font:900 50px ${FV};color:#fff;background:${RED};padding:10px 28px;border-radius:999px;border:5px solid ${K};box-shadow:0 6px 0 ${K};white-space:nowrap}
#minimap{position:absolute;right:56px;top:226px;width:300px;height:234px;border:6px solid ${K};border-radius:18px;overflow:hidden;opacity:0;box-shadow:6px 8px 0 ${K};transform:rotate(2deg);z-index:300}
#minimap svg{width:100%;height:100%}
#notebook{position:absolute;inset:0;opacity:0;z-index:400;background:#FFFDF6;background-image:linear-gradient(rgba(31,138,138,.18) 2px,transparent 2px);background-size:100% 64px}
#notebook::before{content:"";position:absolute;left:110px;top:0;bottom:0;width:4px;background:rgba(217,68,43,.45)}
.rtitle{font:400 84px ${FH};color:${K};background:${Y};padding:0 30px 8px;border-radius:10px;transform:rotate(-2deg)}
.ri{display:flex;align-items:center;gap:26px;width:930px;background:#fff;border:5px solid ${K};border-radius:24px;padding:14px 26px;box-shadow:0 7px 0 ${K}}
.ri b{font:900 52px ${FV};color:${K};background:${Y};width:76px;height:76px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:none;border:4px solid ${K}}
.ri .z{display:block;font:400 54px ${FZ}}
.ri .p{display:block;font:800 30px ${FV};color:${RED}}
.ri .v{display:block;font:700 32px ${FV};color:#444}
.ctaL{font:900 86px/1.1 ${FV};text-align:center;color:${K};width:940px;text-wrap:balance;letter-spacing:-.02em}
.pill{display:inline-block;white-space:nowrap;font:900 46px ${FV};color:${K};background:${Y};padding:18px 40px;border-radius:999px;border:6px solid ${K};box-shadow:0 10px 0 ${K}}
#flash{position:absolute;inset:0;background:#fff;opacity:0;z-index:900}
.el{z-index:500}
`;
const html = `<!doctype html>
<html lang="vi" data-resolution="portrait">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<script src="./gsap.min.js"></script><style>${CSS}</style></head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="1080" data-height="1920">
  <div id="paper"></div>
  ${MINI}
  <div id="notebook"></div>
  ${H.join('\n  ')}
  <div id="flash"></div>
  <audio id="music" src="music.wav" data-start="0" data-duration="${DUR}" data-volume="1"></audio>
</div>
<script>
const tl = gsap.timeline({ paused: true });
${TL.join('\n')}
tl.set({}, {}, ${DUR});
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;
tl.seek(0);
</script>
</body></html>
`;
fs.writeFileSync(path.join(OUTDIR, 'index.html'), html);
fs.writeFileSync(path.join(OUTDIR, 'hyperframes.json'), JSON.stringify({ paths: { blocks: 'compositions', components: 'compositions/components', assets: 'assets' }, media: { autoProxy: true } }));
fs.writeFileSync(path.join(OUTDIR, 'meta.json'), JSON.stringify({ id: EP.id, name: EP.id }));
fs.copyFileSync(path.join(V, 'node_modules/gsap/dist/gsap.min.js'), path.join(OUTDIR, 'gsap.min.js'));
const HOOKB = Math.round(hk.dur * 2), PER = Math.round(EP.legs[0].dur * 2), NI = EP.legs.length + 1;
execFileSync('python3', [path.join(V, 'series/music_series.py'), path.join(OUTDIR, 'music.wav'), String(DUR), String(HOOKB), String(PER), String(NI)], { stdio: 'ignore' });
fs.writeFileSync(path.join(OUTDIR, 'kit.json'), JSON.stringify({ id: EP.id, dur: DUR, items: KIT }, null, 1));
console.log('Đã sinh', OUTDIR, DUR + 's', k, 'cảnh');
