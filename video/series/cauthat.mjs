// Thể loại "CHUYỆN THẬT · CÂU THẬT": video câu chuyện thật (raw của Bảo) + câu tiếng Trung trong chuyện
// + "điểm ăn tiền" (ngữ pháp, câu dùng ngay khi đi làm) + kêu gọi chơi game và học online. 60–90 giây.
// Kết cấu: GÂY HIT (4,5 s) → [CHUYỆN (5,5 s) → ĐIỂM ĂN TIỀN (7,5 s)] × n → KÊU GỌI (7 s).
// Bảng bài học phủ vùng dưới khung hình (che luôn phụ đề cũ in cứng trong raw).
//   node series/cauthat.mjs <tap.json>  → out/<id>/       (dữ liệu tập và raw nằm ngoài git: story/episodes, story/raw)
// tap.json: { id, raw, hook:{clip:[a,b], line, key, ask}, blocks:[{ clips:[[a,b],...], story, zh, py, vi,
//             tag, key, rule, ex:{zh,py,vi}, use:{zh,py,vi} }], cta:{ q, game, online } }
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const V = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EP = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const OUTDIR = path.join(V, 'out', EP.id);
const HOOK = 4.5, SA = 5.5, SB = 7.5, CTA = 7;
const NB = EP.blocks.length, DUR = +(HOOK + NB * (SA + SB) + CTA).toFixed(2);
const Y = '#FCE029', K = '#0B0B0C', W = '#FFFBEA';
const FV = "'Inter Display','Inter',sans-serif", FZ = "'WenQuanYi Zen Hei',sans-serif", FM = "'JetBrains Mono',monospace";
const r2 = x => +(+x).toFixed(3);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<mark>$1</mark>');   // **…** = tô vàng

const H = [], VIDS = [], TL = [], G3 = [];
let n = 0;
const uid = p => `${p}${++n}`;
const to = (s, v, t) => TL.push(`tl.to(${JSON.stringify(s)}, ${v}, ${r2(t)});`);
const ft = (s, a, v, t) => TL.push(`tl.fromTo(${JSON.stringify(s)}, ${a}, ${v}, ${r2(t)});`);
const set = (s, v, t) => TL.push(`tl.set(${JSON.stringify(s)}, ${v}, ${r2(t)});`);
function st(inner, top, t0, t1, style = '') { const id = uid('s'); H.push(`<div class="st clip" id="${id}" style="top:${top}px;${style}" data-start="${r2(t0)}" data-duration="${r2(t1 - t0)}"><div class="in">${inner}</div></div>`); return `#${id} .in`; }
const flash = (t, a = .45) => ft('#flash', `{ opacity: ${a} }`, '{ opacity: 0, duration: .25, ease: "power2.out", immediateRender: false }', t);
const fadeIn = (s, t, y = 24) => ft(s, `{ opacity: 0, y: ${y}, filter: "blur(8px)" }`, '{ opacity: 1, y: 0, filter: "blur(0px)", duration: .4, ease: "expo.out" }', t);
const out = (s, t) => to(s, '{ opacity: 0, filter: "blur(8px)", duration: .2 }', t);

/* các đoạn raw nối liền trong khoảng [t0, t1], chia đều thời gian, phóng nhẹ, cắt có chớp.
   Video không bao giờ chạy quá điểm b của đoạn: đoạn quá ngắn so với ô thời gian (cần chậm hơn 0,5×)
   thì dùng ảnh tĩnh lấy giữa đoạn, chạy Ken Burns. Raw dựng kiểu montage (mỗi cảnh 0,3–1 s) sẽ thành chuỗi ảnh động. */
const STILLS = [];
function footage(clips, t0, t1) {
  const seg = (t1 - t0) / clips.length;
  clips.forEach(([a, b], i) => {
    const s0 = t0 + i * seg, s1 = s0 + seg, need = (b - a) / seg;
    const id = uid('fv');
    if (need >= .5) {
      const rate = Math.min(1.6, need);
      VIDS.push(`<div class="fv" id="${id}"><video id="${uid('v')}" src="raw.mp4" muted data-start="${r2(s0)}" data-duration="${r2(seg)}" data-media-start="${a}" data-playback-rate="${r2(rate)}"></video></div>`);
      ft(`#${id}`, '{ scale: 1.08 }', `{ scale: 1.0, duration: ${r2(seg)}, ease: "sine.out", immediateRender: false }`, s0);
    } else {
      const f = `st_${STILLS.length}.jpg`;
      STILLS.push({ t: (a + b) / 2, f });
      VIDS.push(`<div class="fv" id="${id}"><img src="${f}" alt=""></div>`);
      const dx = (i % 2 ? -1 : 1) * 24;
      ft(`#${id}`, `{ scale: 1.16, x: ${-dx} }`, `{ scale: 1.02, x: ${dx}, duration: ${r2(seg)}, ease: "none", immediateRender: false }`, s0);
    }
    set(`#${id}`, '{ opacity: 1 }', s0);
    set(`#${id}`, '{ opacity: 0 }', s1);
    if (i) flash(s0, .25);
  });
}
const tiles = (chars, t0, t1, y = -1.2, i = 0) => {
  const nc = [...chars].length, sc = nc >= 4 ? .66 : nc === 3 ? .72 : nc === 2 ? .78 : .82, sp = nc >= 4 ? .7 : nc === 3 ? .78 : .84;
  G3.push({ chars, t0, enter: ['slam', 'drop', 'flip', 'rise'][i % 4], t1, exit: 'knock', exitDir: i % 2 ? -1 : 1, side: 'black', back: 'black', face: { bg: Y, ink: K, ring: 'rgba(0,0,0,.2)' }, y, scale: sc, spacing: sp, stagger: .09, noShadow: true });
};

/* ---------- GÂY HIT ---------- */
footage(EP.hook.clips, 0, HOOK);
const sr = st(`<div class="stamp">CHUYỆN THẬT · CÂU THẬT · ${esc(EP.ep)}</div>`, 140, 0, HOOK - .05, 'justify-content:flex-start;padding-left:60px');
ft(sr, '{ rotationX: -90, opacity: 0, transformPerspective: 800 }', '{ rotationX: 0, rotation: -2, opacity: 1, duration: .35, ease: "back.out(2)" }', .05);
const hl = st(`<div class="hk">${md(EP.hook.line)}</div>`, 230, .1, HOOK - .05);
fadeIn(hl, .15);
set('#panel', '{ yPercent: 0 }', 0);
ft('#panel', '{ yPercent: 100 }', '{ yPercent: 0, duration: .45, ease: "expo.out", immediateRender: false }', 1.1);
tiles(EP.hook.key, 1.3, HOOK - .3, -1.25, 0);
const ha = st(`<div class="ask">${md(EP.hook.ask)}</div>`, 1500, 1.7, HOOK - .05);
ft(ha, '{ scale: 1.6, opacity: 0 }', '{ scale: 1, opacity: 1, duration: .35, ease: "power4.out" }', 1.75);

/* ---------- MỖI KHỐI ---------- */
EP.blocks.forEach((b, i) => {
  const t = HOOK + i * (SA + SB), tB = t + SA, te = tB + SB;
  footage(b.clips, t, te);
  flash(t, .4);
  st(`<div class="cnt">${i + 1}/${NB}</div>`, 136, t, te - .05, 'justify-content:flex-end;padding-right:60px');
  const sl = st(`<div class="story">${md(b.story)}</div>`, 230, t + .05, te - .05);
  fadeIn(sl, t + .1);
  // A: câu thật trong chuyện
  const za = st(`<div class="zhA">${esc(b.zh)}</div><div class="pyA">${esc(b.py)}</div><div class="viA">${esc(b.vi)}</div>`, 1210, t + .3, tB);
  fadeIn(`${za}`, t + .4);
  out(za, tB - .25);
  // B: điểm ăn tiền
  const tg = st(`<div class="tag">ĐIỂM ĂN TIỀN · ${esc(b.tag)}</div>`, 1170, tB - .05, te - .05);
  ft(tg, '{ rotationX: -90, opacity: 0, transformPerspective: 800 }', '{ rotationX: 0, rotation: -1.5, opacity: 1, duration: .35, ease: "back.out(2)" }', tB);
  tiles(b.key, tB + .1, te - .35, -1.36, i + 1);
  // quy tắc + ví dụ + câu đi làm: một cột tự xếp, không chồng chữ
  const id = uid('col');
  H.push(`<div class="st clip" id="${id}" style="top:1455px" data-start="${r2(tB + .5)}" data-duration="${r2(te - .05 - tB - .5)}"><div class="in col">`
    + `<div class="rule">${md(b.rule)}</div>`
    + `<div class="ex"><span class="z">${esc(b.ex.zh)}</span> <span class="p">${esc(b.ex.py)}</span><span class="v">${esc(b.ex.vi)}</span></div>`
    + `<div class="use"><b>Đi làm nói luôn:</b> <span class="z">${esc(b.use.zh)}</span> <span class="p">${esc(b.use.py)}</span><span class="v">${esc(b.use.vi)}</span></div></div></div>`);
  const ru = `#${id} .rule`, ex = `#${id} .ex`, us = `#${id} .use`;
  fadeIn(ru, tB + .6);
  fadeIn(ex, tB + 1.45, 16);
  ft(us, '{ x: -300, opacity: 0 }', '{ x: 0, opacity: 1, duration: .4, ease: "expo.out" }', tB + 2.65);
  [sl, tg, `#${id} .in`].forEach(s => out(s, te - .3));
});

/* ---------- KÊU GỌI ---------- */
const tc = HOOK + NB * (SA + SB);
to('#panel', '{ yPercent: 100, duration: .35, ease: "power3.in" }', tc - .35);
set('#dark', '{ opacity: 1 }', tc);
flash(tc, .5);
const q = st(`<div class="big">${md(EP.cta.q)}</div>`, 300, tc, DUR);
ft(q, '{ scale: 1.6, opacity: 0, filter: "blur(10px)" }', '{ scale: 1, opacity: 1, filter: "blur(0px)", duration: .45, ease: "expo.out" }', tc + .05);
G3.push({ chars: '阿宝', t0: tc + .5, enter: 'slam', side: 'black', back: 'black', face: { bg: Y, ink: K, ring: 'rgba(0,0,0,.2)' }, y: .55, scale: .9, spacing: .95, stagger: .1, noShadow: true });
const c1 = st(`<div class="opt"><i>🎮</i><div><b>${esc(EP.cta.game[0])}</b><span>${esc(EP.cta.game[1])}</span></div></div>`, 1150, tc + 1.2, DUR);
ft(c1, '{ x: -400, opacity: 0 }', '{ x: 0, opacity: 1, duration: .45, ease: "expo.out" }', tc + 1.2);
const c2 = st(`<div class="opt"><i>💬</i><div><b>${esc(EP.cta.online[0])}</b><span>${esc(EP.cta.online[1])}</span></div></div>`, 1330, tc + 1.7, DUR);
ft(c2, '{ x: 400, opacity: 0 }', '{ x: 0, opacity: 1, duration: .45, ease: "expo.out" }', tc + 1.7);
const pl = st(`<div class="pill">Link game + nhóm Zalo ở bio 👆</div>`, 1560, tc + 2.4, DUR);
ft(pl, '{ scale: .7, opacity: 0 }', '{ scale: 1, opacity: 1, duration: .4, ease: "back.out(2)" }', tc + 2.4);

/* ---------- TRANG ---------- */
const CSS = `
@font-face{font-family:'Inter Display';src:local('Inter Display'),local('Inter Display Black')}
@font-face{font-family:'Inter';src:local('Inter')}
@font-face{font-family:'WenQuanYi Zen Hei';src:local('WenQuanYi Zen Hei')}
@font-face{font-family:'JetBrains Mono';src:local('JetBrains Mono'),local('JetBrains Mono ExtraBold')}
@font-face{font-family:'Noto Color Emoji';src:local('Noto Color Emoji')}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:${K}}
#root{position:relative;width:1080px;height:1920px;overflow:hidden;background:${K};color:${W};font-family:${FV}}
.layer{position:absolute;inset:0}
.fv{position:absolute;inset:0;opacity:0;overflow:hidden;transform-origin:50% 35%}
.fv video{width:100%;height:100%;object-fit:cover;display:block}
.fv img{width:100%;height:100%;object-fit:cover;display:block}
#topshade{background:linear-gradient(180deg,rgba(0,0,0,.6) 0%,rgba(0,0,0,0) 26%)}
#panel{position:absolute;left:0;right:0;top:1080px;height:840px;background:linear-gradient(180deg,rgba(11,11,12,0) 0px,rgba(11,11,12,.93) 70px,${K} 120px);border-top:0}
#panel::after{content:"";position:absolute;left:60px;right:60px;top:84px;height:6px;border-radius:3px;background:repeating-linear-gradient(-45deg,${Y} 0 14px,${K} 14px 28px)}
#dark{opacity:0;background:radial-gradient(90% 60% at 50% 40%,#2a2410 0%,#121108 55%,#050505 100%)}
#gl{position:absolute;inset:0;width:1080px;height:1920px}
#grain{opacity:.1;mix-blend-mode:overlay;background:url(grain.png);background-size:256px 256px}
#flash{background:${W};opacity:0}
.st{position:absolute;left:0;right:0;display:flex;justify-content:center;pointer-events:none;padding:0 60px}
.st .in{transform-origin:50% 60%;width:100%;display:flex;flex-direction:column;align-items:center}
.stamp{font:700 30px ${FM};letter-spacing:.05em;color:${K};background:${Y};padding:7px 16px;border-radius:6px;box-shadow:0 8px 24px rgba(0,0,0,.45)}
.cnt{font:900 36px ${FV};color:${K};background:${Y};padding:5px 20px;border-radius:999px;border:5px solid ${K}}
.hk,.story{font:800 58px/1.2 ${FV};text-align:center;text-wrap:balance;color:#fff;text-shadow:0 4px 24px rgba(0,0,0,.95),0 0 3px #000}
.story{font-size:50px}
mark{background:${Y};color:${K};padding:0 .12em;border-radius:6px;text-shadow:none;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.ask{font:900 58px/1.2 ${FV};text-align:center;color:#fff}
.zhA{font:400 60px/1.35 ${FZ};color:#fff;text-align:center;text-wrap:balance}
.pyA{font:700 32px/1.35 ${FM};color:${Y};text-align:center;margin-top:16px}
.viA{font:700 40px/1.3 ${FV};color:#e8e8e8;text-align:center;margin-top:14px}
.tag{font:700 30px ${FM};letter-spacing:.04em;color:${K};background:${Y};padding:7px 16px;border-radius:6px}
.col{gap:16px}
.rule{font:800 40px/1.22 ${FV};color:#fff;text-align:center;text-wrap:balance}
.ex,.use{font:700 34px/1.35 ${FV};text-align:center;color:#ddd}
.ex .z,.use .z{font:400 42px ${FZ};color:#fff}
.ex .p,.use .p{font:700 28px ${FM};color:${Y}}
.ex .v,.use .v{display:block;font-size:32px;color:#cfcfcf}
.use{background:rgba(252,224,41,.08);border:3px solid rgba(252,224,41,.5);border-radius:18px;padding:12px 22px}
.use b{color:${Y}}
.big{font:900 92px/1.05 ${FV};letter-spacing:-.03em;text-align:center;color:#fff;text-wrap:balance}
.opt{display:flex;align-items:center;gap:26px;width:900px;background:rgba(255,255,255,.06);border:4px solid ${Y};border-radius:26px;padding:22px 30px}
.opt i{font-style:normal;font-size:80px;font-family:'Noto Color Emoji'}
.opt b{display:block;font:900 50px/1.1 ${FV};color:${Y}}
.opt span{display:block;font:700 34px/1.25 ${FV};color:#eee;margin-top:6px}
.pill{display:inline-block;white-space:nowrap;font:900 44px ${FV};color:${K};background:${Y};padding:16px 38px;border-radius:999px;border:6px solid ${K};box-shadow:0 10px 0 ${K}}
`;
const glyphs = [EP.hook.key, ...EP.blocks.map(b => b.key)].join('') + '阿宝';
const scene = { dur: DUR, groups: G3, cam: [{ t: 0, p: [0, 0, 13], l: [0, 0, 0] }, { t: DUR, p: [0, 0, 13], l: [0, 0, 0] }], bursts: [], rings: [], glyphs };
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
  ${VIDS.join('\n  ')}
  <div class="layer" id="topshade"></div>
  <div id="panel"></div>
  <div class="layer" id="dark"></div>
  <canvas id="gl" width="1080" height="1920"></canvas>
  ${H.join('\n  ')}
  <div class="layer" id="grain"></div>
  <div class="layer" id="flash"></div>
  <audio id="music" src="music.wav" data-start="0" data-duration="${DUR}" data-volume="1"></audio>
</div>
<script>window.SCENE = ${JSON.stringify(scene)};</script>
<script type="module" src="./engine3d.js"></script>
<script>
const tl = gsap.timeline({ paused: true });
gsap.set("#panel", { yPercent: 100 });
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
cp(path.join(V, 'story/raw', EP.raw), 'raw.mp4');
for (const { t, f } of STILLS) execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', String(t), '-i', path.join(OUTDIR, 'raw.mp4'), '-frames:v', '1', '-q:v', '2', path.join(OUTDIR, f)]);
if (!fs.existsSync(path.join(OUTDIR, 'grain.png'))) execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=gray:s=256x256,noise=alls=90:allf=u', '-frames:v', '1', path.join(OUTDIR, 'grain.png')]);
const marks = [HOOK, ...EP.blocks.map((_, i) => HOOK + i * (SA + SB) + SA), ...EP.blocks.map((_, i) => HOOK + (i + 1) * (SA + SB))].map(x => x.toFixed(2)).join(',');
execFileSync('python3', [path.join(V, 'series/music_bed.py'), path.join(OUTDIR, 'music.wav'), String(DUR), marks], { stdio: 'ignore' });
console.log('Đã sinh', OUTDIR, DUR + 's');
