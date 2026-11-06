// Thể loại "CHỮ THẬT · ẢNH THẬT": phóng kính lúp vào chữ Hán có thật trong ảnh thật, dựng chữ thành quân bài 3D,
// kèm pinyin + nghĩa + nơi chụp. 9:16, 120 BPM, mỗi chữ 8 phách (4 giây).
//   node series/chuthat.mjs <tap.json>  → out/<id>/   (dữ liệu tập nằm ngoài git: story/episodes/*.json)
// tap.json: { id, ep, hookA, items:[{ photo, box:[x0,y0,x1,y1], zh, py, vi, note, place }], cta }
//   photo: tên tệp trong story/photos ; box: khung chữ tính theo điểm ảnh của ảnh đó.
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const V = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EP = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const PH = path.join(V, 'story', 'photos');
const OUTDIR = path.join(V, 'out', EP.id);
const B = .5, T = k => +(k * B).toFixed(3);
const HOOK = 8, PER = 8, NI = EP.items.length, OUT = 8;
const DUR = T(HOOK + PER * NI + OUT);
const Y = '#FCE029', K = '#0B0B0C', W = '#FFFBEA';
const FV = "'Inter Display','Inter',sans-serif", FZ = "'WenQuanYi Zen Hei',sans-serif", FM = "'JetBrains Mono',monospace";
const r2 = x => +(+x).toFixed(3);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const H = [], PHS = [], TL = [], G3 = [];
let n = 0;
const uid = p => `${p}${++n}`;
const to = (s, v, t) => TL.push(`tl.to(${JSON.stringify(s)}, ${v}, ${r2(t)});`);
const ft = (s, a, v, t) => TL.push(`tl.fromTo(${JSON.stringify(s)}, ${a}, ${v}, ${r2(t)});`);
const set = (s, v, t) => TL.push(`tl.set(${JSON.stringify(s)}, ${v}, ${r2(t)});`);
function st(inner, top, t0, t1, style = '') { const id = uid('s'); H.push(`<div class="st clip" id="${id}" style="top:${top}px;${style}" data-start="${r2(t0)}" data-duration="${r2(t1 - t0)}"><div class="in">${inner}</div></div>`); return `#${id} .in`; }
const flash = (t, a = .5) => ft('#flash', `{ opacity: ${a} }`, '{ opacity: 0, duration: .25, ease: "power2.out", immediateRender: false }', t);
const size = f => execFileSync('identify', ['-format', '%w %h', path.join(PH, f)]).toString().split(' ').map(Number);

/* ánh xạ: ảnh phủ kín 1080×1920 (cover), chọn vị trí để khung chữ nằm gần giữa; trả về khung trên màn hình */
function place(file, box) {
  const [Wp, Hp] = size(file), s = Math.max(1080 / Wp, 1920 / Hp), w = Wp * s, h = Hp * s;
  const cx = (box[0] + box[2]) / 2, cy = (box[1] + box[3]) / 2;
  const ox = Math.min(0, Math.max(1080 - w, 540 - cx * s)), oy = Math.min(0, Math.max(1920 - h, 860 - cy * s));
  const pos = `${w > 1080 ? (ox / (1080 - w) * 100).toFixed(2) : 50}% ${h > 1920 ? (oy / (1920 - h) * 100).toFixed(2) : 50}%`;
  return { Wp, Hp, s, pos, sx: cx * s + ox, sy: cy * s + oy, sw: (box[2] - box[0]) * s, sh: (box[3] - box[1]) * s, cx, cy, bw: box[2] - box[0], bh: box[3] - box[1] };
}
function photo(file, pos, origin, t0, t1, s0 = 1.0, s1 = 1.07) {
  const id = uid('ph');
  PHS.push(`<div class="ph" id="${id}" style="transform-origin:${origin}"><img src="${file}" alt="" style="object-position:${pos}"></div>`);
  set(`#${id}`, '{ opacity: 1 }', t0);
  ft(`#${id}`, `{ scale: ${s0} }`, `{ scale: ${s1}, duration: ${r2(t1 - t0 + .3)}, ease: "sine.inOut", immediateRender: false }`, t0);
  set(`#${id}`, '{ opacity: 0 }', t1);
  return `#${id}`;
}
function scanner(m, t0, t1) {   // khung ngắm 4 góc khoá vào chữ
  const pad = 18, w = Math.max(90, m.sw + 2 * pad), h = Math.max(70, m.sh + 2 * pad);
  const id = uid('sc');
  H.push(`<div class="scan clip" id="${id}" style="left:${r2(m.sx - w / 2)}px;top:${r2(m.sy - h / 2)}px;width:${r2(w)}px;height:${r2(h)}px" data-start="${r2(t0)}" data-duration="${r2(t1 - t0)}"><i class="a"></i><i class="b"></i><i class="c"></i><i class="d"></i></div>`);
  ft(`#${id}`, '{ scale: 2.4, opacity: 0 }', '{ scale: 1, opacity: 1, duration: .3, ease: "power3.out" }', t0);
  return `#${id}`;
}

/* ---------- MỞ ---------- */
const P = EP.items.map(it => ({ ...it, m: place(it.photo, it.box) }));
const series = st(`<div class="stamp">CHỮ THẬT · ẢNH THẬT · ${esc(EP.ep)}</div>`, 150, 0, T(HOOK) - .05, 'justify-content:flex-start;padding-left:70px');
ft(series, '{ rotationX: -90, opacity: 0, transformPerspective: 800 }', '{ rotationX: 0, rotation: -2, opacity: 1, duration: .35, ease: "back.out(2)" }', .05);
P.forEach((p, i) => {
  const t0 = i * (T(4) / NI), t1 = (i + 1) * (T(4) / NI);
  photo(p.photo, p.m.pos, `${(p.m.sx / 10.8).toFixed(2)}% ${(p.m.sy / 19.2).toFixed(2)}%`, t0, t1, 1.25, 1.1);
  scanner({ ...p.m, sw: p.m.sw * 1.15, sh: p.m.sh * 1.15 }, t0 + .05, t1);
  if (i) flash(t0, .3);
});
const hA = st(`<div class="cap">${esc(EP.hookA)}</div>`, 1300, .1, T(4) - .05);
ft(hA, '{ opacity: 0, y: 30 }', '{ opacity: 1, y: 0, duration: .35, ease: "expo.out" }', .12);
set('#dark', '{ opacity: 1 }', T(4));
const hB = st(`<div class="big">Bạn đọc được<br><mark>mấy chữ?</mark></div>`, 520, T(4), T(HOOK) - .05);
ft(hB, '{ scale: 1.8, opacity: 0, filter: "blur(10px)" }', '{ scale: 1, opacity: 1, filter: "blur(0px)", duration: .4, ease: "expo.out" }', T(4) + .02);
G3.push({ chars: '???', t0: T(4.5), enter: 'drop', t1: T(HOOK) - .3, exit: 'knock', side: 'black', back: 'black', face: { bg: Y, ink: K, ring: 'rgba(0,0,0,.2)' }, y: -1.05, spacing: .95, stagger: .12, noShadow: true });
set('#dark', '{ opacity: 0 }', T(HOOK));

/* ---------- MỖI CHỮ ---------- */
P.forEach((p, i) => {
  const t = T(HOOK + i * PER), te = T(HOOK + (i + 1) * PER), m = p.m;
  const ph = photo(p.photo, m.pos, `${(m.sx / 10.8).toFixed(2)}% ${(m.sy / 19.2).toFixed(2)}%`, t, te);
  flash(t, .35);
  const sc = scanner(m, t + .1, t + .65);
  to(sc, '{ opacity: 0, duration: .15 }', t + .5);
  // kính lúp: vùng chữ phóng to, bay từ vị trí chữ lên giữa khung
  const Z = Math.min(7, Math.max(.5, Math.min(560 / m.bw, 440 / m.bh)));   // chữ to thì thu nhỏ, chữ bé thì phóng
  const id = uid('lens');
  H.push(`<div class="lens" id="${id}"><div class="li" style="background-image:url(${p.photo});background-size:${r2(m.Wp * Z)}px ${r2(m.Hp * Z)}px;background-position:${r2(380 - m.cx * Z)}px ${r2(380 - m.cy * Z)}px"></div><div class="glare"></div></div>`);
  ft(`#${id}`, `{ opacity: 1, x: ${r2(m.sx - 540)}, y: ${r2(m.sy - 640)}, scale: ${r2(Math.max(.1, Math.max(m.sw, m.sh) / 760))} }`, '{ x: 0, y: 0, scale: 1, duration: .5, ease: "expo.out", immediateRender: false }', t + .55);
  set(`#${id}`, '{ opacity: 0 }', 0);
  set(`#${id}`, '{ opacity: 1 }', t + .55);
  to(ph, '{ filter: "blur(7px) brightness(.45)", duration: .4 }', t + .55);
  to(`#${id}`, '{ scale: .2, y: -900, opacity: 0, duration: .3, ease: "power3.in" }', te - .32);
  // quân bài 3D
  const nc = [...p.zh].length, sc3 = nc >= 5 ? .62 : nc === 4 ? .8 : nc === 3 ? .9 : 1, sp = nc >= 5 ? .66 : nc === 4 ? .84 : nc === 3 ? .95 : 1.02;
  G3.push({ chars: p.zh, t0: t + .9, enter: ['drop', 'flip', 'slam', 'rise'][i % 4], t1: te - .35, exit: 'knock', exitDir: i % 2 ? -1 : 1, side: 'black', back: 'black', face: { bg: Y, ink: K, ring: 'rgba(0,0,0,.2)' }, y: -.78, scale: sc3, spacing: sp, stagger: .09, noShadow: true });
  const py = st(`<div class="py">${esc(p.py)}</div>`, 1330, t + .9, te - .05);
  ft(py, '{ rotationX: -95, opacity: 0, transformPerspective: 900 }', '{ rotationX: 0, opacity: 1, duration: .4, ease: "back.out(1.7)" }', t + 1.5);
  const vi = st(`<div class="tape"><span>${esc(p.vi)}</span></div>`, 1440, t + .9, te - .05);
  ft(vi, '{ scale: 1.7, rotation: -10, opacity: 0 }', '{ scale: 1, rotation: -2, opacity: 1, duration: .3, ease: "power4.out" }', t + 1.9);
  const nt = st(`<div class="note">${esc(p.note)}</div>`, 1590, t + .9, te - .05);
  ft(nt, '{ opacity: 0 }', '{ opacity: 1, duration: .3 }', t + 2.3);
  const pl = st(`<div class="stamp">${esc(p.place)}</div>`, 150, t, te - .05, 'justify-content:flex-start;padding-left:70px');
  ft(pl, '{ rotationX: -90, opacity: 0, transformPerspective: 800 }', '{ rotationX: 0, rotation: -2, opacity: 1, duration: .35, ease: "back.out(2)" }', t + .1);
  st(`<div class="cnt">${i + 1}/${NI}</div>`, 146, t, te - .05, 'justify-content:flex-end;padding-right:70px');
  [py, vi, nt].forEach(s => to(s, '{ opacity: 0, filter: "blur(8px)", duration: .2 }', te - .3));
});

/* ---------- KẾT ---------- */
const to0 = T(HOOK + PER * NI);
set('#dark', '{ opacity: 1 }', to0);
flash(to0, .5);
G3.push({ chars: Array.from({ length: NI }, (_, k) => String(k + 1)).join(''), t0: to0 + .1, enter: 'drop', side: 'black', back: 'black', face: { bg: Y, ink: K, ring: 'rgba(0,0,0,.2)' }, y: .55, scale: .64, spacing: .7, stagger: .1, noShadow: true });
const q = st(`<div class="big" style="font-size:96px">Bạn đọc được<br>mấy/${NI} chữ?</div>`, 330, to0, DUR);
ft(q, '{ opacity: 0, y: -30 }', '{ opacity: 1, y: 0, duration: .4, ease: "expo.out" }', to0 + .05);
const cm = st(`<div class="tape"><span style="font-size:50px">Comment số chữ đọc được 👇</span></div>`, 1130, to0 + .8, DUR);
ft(cm, '{ scale: 1.6, rotation: -10, opacity: 0 }', '{ scale: 1, rotation: -2, opacity: 1, duration: .3, ease: "power4.out" }', to0 + .8);
const lg = st(`<div class="logo">BẢO KHỰA <b>阿宝</b> <i>Ā Bǎo</i></div>`, 1330, to0 + 1.4, DUR);
ft(lg, '{ opacity: 0, y: 30 }', '{ opacity: 1, y: 0, duration: .4, ease: "expo.out" }', to0 + 1.4);
const cta = st(`<div class="pill">${esc(EP.cta || 'Nhóm Zalo học cùng Bảo · link ở bio')}</div>`, 1440, to0 + 1.8, DUR);
ft(cta, '{ opacity: 0, scale: .8 }', '{ opacity: 1, scale: 1, duration: .4, ease: "back.out(2)" }', to0 + 1.8);

/* ---------- TRANG ---------- */
const CSS = `
@font-face{font-family:'Inter Display';src:local('Inter Display'),local('Inter Display Black')}
@font-face{font-family:'Inter';src:local('Inter')}
@font-face{font-family:'WenQuanYi Zen Hei';src:local('WenQuanYi Zen Hei')}
@font-face{font-family:'JetBrains Mono';src:local('JetBrains Mono'),local('JetBrains Mono ExtraBold')}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:${K}}
#root{position:relative;width:1080px;height:1920px;overflow:hidden;background:${K};color:${W};font-family:${FV}}
.layer{position:absolute;inset:0}
.ph{position:absolute;inset:0;opacity:0;overflow:hidden}
.ph img{width:100%;height:100%;object-fit:cover;display:block}
#dark{opacity:0;background:radial-gradient(90% 60% at 50% 40%,#2a2410 0%,#121108 55%,#050505 100%)}
#dots{background-image:radial-gradient(rgba(252,224,41,.13) 3px,transparent 3.6px);background-size:30px 30px;opacity:.7}
#shade{background:linear-gradient(180deg,rgba(0,0,0,.45) 0%,rgba(0,0,0,0) 20%,rgba(0,0,0,0) 55%,rgba(0,0,0,.8) 85%)}
.scan{position:absolute;pointer-events:none}
.scan i{position:absolute;width:38px;height:38px;border:7px solid ${Y};filter:drop-shadow(0 0 6px rgba(0,0,0,.8))}
.scan .a{left:0;top:0;border-right:0;border-bottom:0}.scan .b{right:0;top:0;border-left:0;border-bottom:0}
.scan .c{left:0;bottom:0;border-right:0;border-top:0}.scan .d{right:0;bottom:0;border-left:0;border-top:0}
.lens{position:absolute;left:160px;top:260px;width:760px;height:760px;border-radius:50%;overflow:hidden;opacity:0;box-shadow:0 0 0 14px ${Y},0 0 0 26px ${K},0 40px 90px rgba(0,0,0,.65);transform-origin:50% 50%}
.lens .li{position:absolute;inset:0;background-repeat:no-repeat}
.lens .glare{position:absolute;inset:0;background:radial-gradient(60% 45% at 32% 22%,rgba(255,255,255,.28),rgba(255,255,255,0) 60%)}
#gl{position:absolute;inset:0;width:1080px;height:1920px}
#vig{background:radial-gradient(120% 85% at 50% 50%,transparent 58%,rgba(0,0,0,.5) 100%)}
#grain{opacity:.11;mix-blend-mode:overlay;background:url(grain.png);background-size:256px 256px}
#flash{background:${W};opacity:0}
.st{position:absolute;left:0;right:0;display:flex;justify-content:center;pointer-events:none;padding:0 70px}
.st .in{transform-origin:50% 60%}
.cap{font:800 62px/1.18 ${FV};text-align:center;text-wrap:balance;color:#fff;text-shadow:0 4px 22px rgba(0,0,0,.9)}
.big{font:900 118px/1.02 ${FV};letter-spacing:-.035em;text-align:center;color:#fff;text-shadow:0 8px 34px rgba(0,0,0,.8)}
mark{background:${Y};color:${K};padding:0 .14em;border-radius:10px;text-shadow:none}
.stamp{font:700 32px ${FM};letter-spacing:.06em;color:${K};background:${Y};padding:8px 18px;border-radius:6px;box-shadow:0 8px 24px rgba(0,0,0,.45)}
.cnt{font:900 40px ${FV};color:${K};background:${Y};padding:6px 22px;border-radius:999px;border:5px solid ${K}}
.py{font:800 76px ${FM};color:${Y};text-shadow:0 4px 20px rgba(0,0,0,.9)}
.tape{display:inline-block;padding:11px;background:repeating-linear-gradient(-45deg,${Y} 0 22px,${K} 22px 44px);border-radius:12px;box-shadow:0 14px 28px rgba(0,0,0,.4)}
.tape span{display:block;background:${K};color:${Y};font:900 60px/1.1 ${FV};padding:10px 30px;border-radius:5px;text-align:center}
.note{font:700 36px/1.3 ${FV};color:#eee;text-align:center;text-shadow:0 3px 16px rgba(0,0,0,.9)}
.logo{font:900 74px ${FV};letter-spacing:-.02em;color:#fff}
.logo b{font-family:${FZ};font-weight:400;color:${Y}}
.logo i{font:700 34px ${FM};font-style:normal;color:${Y};vertical-align:middle}
.pill{display:inline-block;white-space:nowrap;font:900 40px ${FV};color:${K};background:${Y};padding:16px 36px;border-radius:999px;border:6px solid ${K};box-shadow:0 10px 0 ${K}}
`;
const scene = { dur: DUR, groups: G3, cam: [{ t: 0, p: [0, 0, 13], l: [0, 0, 0] }, { t: DUR, p: [0, -.1, 12.6], l: [0, 0, 0] }], bursts: [], rings: [], glyphs: EP.items.map(i => i.zh).join('') + '?' };
const html = `<!doctype html>
<html lang="vi" data-resolution="portrait">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<script src="./gsap.min.js"></script>
<script type="importmap">{"imports":{"three":"./three.module.js","three/addons/":"./addons/"}}</script>
<style>${CSS}</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="1080" data-height="1920">
  ${PHS.join('\n  ')}
  <div class="layer" id="dark"><div class="layer" id="dots"></div></div>
  <div class="layer" id="shade"></div>
  ${H.filter(h => h.includes('class="lens"')).join('\n  ')}
  <canvas id="gl" width="1080" height="1920"></canvas>
  ${H.filter(h => !h.includes('class="lens"')).join('\n  ')}
  <div class="layer" id="vig"></div>
  <div class="layer" id="grain"></div>
  <div class="layer" id="flash"></div>
  <audio id="music" src="music.wav" data-start="0" data-duration="${DUR}" data-volume="1"></audio>
</div>
<script>window.SCENE = ${JSON.stringify(scene)};</script>
<script type="module" src="./engine3d.js"></script>
<script>
const tl = gsap.timeline({ paused: true });
tl.fromTo("#grain", { backgroundPosition: "0px 0px" }, { backgroundPosition: "${256 * 41}px ${256 * 29}px", duration: ${DUR}, ease: "steps(${Math.round(DUR * 30)})" }, 0);
${TL.join('\n')}
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;
tl.seek(0);
</script>
</body>
</html>
`;
fs.mkdirSync(OUTDIR, { recursive: true });
fs.writeFileSync(path.join(OUTDIR, 'index.html'), html);
fs.writeFileSync(path.join(OUTDIR, 'hyperframes.json'), JSON.stringify({ paths: { blocks: 'compositions', components: 'compositions/components', assets: 'assets' }, media: { autoProxy: true } }));
fs.writeFileSync(path.join(OUTDIR, 'meta.json'), JSON.stringify({ id: EP.id, name: EP.id }));
const T3 = path.join(V, 'node_modules/three');
const cp = (a, d) => fs.copyFileSync(a, path.join(OUTDIR, d));
cp(path.join(V, 'node_modules/gsap/dist/gsap.min.js'), 'gsap.min.js');
for (const f of ['three.module.js', 'three.core.js']) cp(path.join(T3, 'build', f), f);
for (const f of ['geometries/RoundedBoxGeometry.js', 'environments/RoomEnvironment.js']) { fs.mkdirSync(path.join(OUTDIR, 'addons', path.dirname(f)), { recursive: true }); fs.copyFileSync(path.join(T3, 'examples/jsm', f), path.join(OUTDIR, 'addons', f)); }
cp(path.join(V, 'tools/engine3d.js'), 'engine3d.js');
for (const f of new Set(EP.items.map(i => i.photo))) cp(path.join(PH, f), f);
if (!fs.existsSync(path.join(OUTDIR, 'grain.png'))) execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=gray:s=256x256,noise=alls=90:allf=u', '-frames:v', '1', path.join(OUTDIR, 'grain.png')]);
execFileSync('python3', [path.join(V, 'series/music_series.py'), path.join(OUTDIR, 'music.wav'), String(DUR), String(HOOK), String(PER), String(NI)], { stdio: 'ignore' });
console.log('Đã sinh', OUTDIR, DUR + 's');
