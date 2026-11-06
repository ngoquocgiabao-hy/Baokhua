// Thể loại F10 "REEL COMIC" (mode A của skill AI Reel Prompt Edit): raw đời thật của Bảo → cắt theo nhịp 120 BPM,
// đoạn có thoại bật lọc truyện tranh (viền đen, màu pop-art, chấm halftone) + bong bóng tiếng Trung · pinyin · Việt (giữ ≥ 2,5 s),
// đoạn đồ ăn/cảnh đẹp để màu thật, kết bằng ôn lại các câu + kêu gọi. Xuất kèm bộ nguyên liệu CapCut để Bảo tự sửa.
//   node series/comic_reel.mjs story/episodes/<tập>.json      → out/<id>/ (trang HyperFrames) + out/<id>/capcut_kit/
// Tệp tập (ngoài git vì trỏ tới raw cá nhân):
//   { id, title, src:{khoá: đường dẫn raw}, segs:[{ dur, shots:[{ src, a, d?, speed?, comic? }], bubble?:{ zh, py, vi, side },
//     sfx?, hook? }], recap:{ title, items:[[zh,py,vi]] }, cta:{ line, pill } }
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const V = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EP = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const OUTDIR = path.join(V, 'out', EP.id), CLIPS = path.join(OUTDIR, 'clips');
fs.mkdirSync(CLIPS, { recursive: true });
const Y = '#FCE029', K = '#0B0B0C', W = '#FFFBEA';
const FV = "'Inter Display','Inter',sans-serif", FZ = "'WenQuanYi Zen Hei',sans-serif", FM = "'JetBrains Mono',monospace";
const r2 = x => +(+x).toFixed(3);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<mark>$1</mark>');
const H = [], VIDS = [], TL = [], KIT = [];
let n = 0;
const uid = p => `${p}${++n}`;
const to = (s, v, t) => TL.push(`tl.to(${JSON.stringify(s)}, ${v}, ${r2(t)});`);
const ft = (s, a, v, t) => TL.push(`tl.fromTo(${JSON.stringify(s)}, ${a}, ${v}, ${r2(t)});`);
const set = (s, v, t) => TL.push(`tl.set(${JSON.stringify(s)}, ${v}, ${r2(t)});`);
function st(inner, top, t0, t1, cls = '') { const id = uid('s'); H.push(`<div class="st clip ${cls}" id="${id}" style="top:${top}px" data-start="${r2(t0)}" data-duration="${r2(t1 - t0)}"><div class="in" style="position:relative">${inner}</div></div>`); return `#${id} .in`; }
const flash = (t, a = .4) => ft('#flash', `{ opacity: ${a} }`, '{ opacity: 0, duration: .2, ease: "power2.out", immediateRender: false }', t);

/* lọc truyện tranh: màu giảm bậc + viền đen dày từ ảnh thu nhỏ đã khử nhiễu */
const COMIC = "split[a][b];[a]hqdn3d=3:3,eq=contrast=1.22:saturation=1.75:brightness=0.03,lutrgb=r='trunc(val/52)*52+26':g='trunc(val/52)*52+26':b='trunc(val/52)*52+26',gblur=sigma=1.2[p];[b]scale=540:960,hqdn3d=8:8,edgedetect=low=0.10:high=0.26,negate,erosion,scale=1080:1920,eq=contrast=1.8[e];[p][e]blend=all_mode=multiply";
const CLEAN = 'eq=contrast=1.08:saturation=1.18';
function cut(src, a, d, speed, comic, out) {
  if (fs.existsSync(out) && !process.env.RECUT) return;
  const base = `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setpts=PTS/${speed},fps=30`;
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', String(a), '-t', String(r2(d * speed + .1)), '-i', src,
    '-filter_complex', `[0:v]${base},${comic ? COMIC : CLEAN}[o]`, '-map', '[o]', '-an', '-t', String(r2(d)),
    '-c:v', 'libx264', '-crf', '17', '-preset', 'fast', '-pix_fmt', 'yuv420p', '-g', '15', out]);
}

/* ---------- ráp các đoạn ---------- */
let t = 0, k = 0;
const marks = [];
const recapItems = [];
for (const sg of EP.segs) {
  const te = t + sg.dur, N = sg.shots.length;
  sg.shots.forEach((sh, i) => {
    const d = sh.d ?? sg.dur / N, s0 = t + sg.shots.slice(0, i).reduce((x, y) => x + (y.d ?? sg.dur / N), 0);
    const f = `c${String(++k).padStart(2, '0')}.mp4`;
    cut(path.resolve(V, EP.src[sh.src]), sh.a, d, sh.speed || 1, !!sh.comic, path.join(CLIPS, f));
    KIT.push({ file: f, start: r2(s0), dur: r2(d), comic: !!sh.comic, src: sh.src, a: sh.a });
    const id = uid('v');
    VIDS.push(`<div class="fv" id="${id}"><video src="clips/${f}" muted data-start="${r2(s0)}" data-duration="${r2(d)}" data-media-start="0"></video></div>`);
    set(`#${id}`, '{ opacity: 1 }', s0);
    ft(`#${id}`, `{ scale: ${sh.kb === 'out' ? 1.12 : 1.0} }`, `{ scale: ${sh.kb === 'out' ? 1.0 : 1.09}, duration: ${r2(d)}, ease: "none", immediateRender: false }`, s0);
    set(`#${id}`, '{ opacity: 0 }', s0 + d);
    set('#ht', `{ opacity: ${sh.comic ? .2 : 0} }`, s0);
    set('#panel', `{ opacity: ${sh.comic ? 1 : 0} }`, s0);
    if (s0 > 0) flash(s0, sh.comic ? .5 : .25);
  });
  if (t > 0) marks.push(t);
  if (sg.hook) {
    const h = st(`<div class="burst"><svg viewBox="0 0 200 200"><polygon points="${Array.from({ length: 24 }, (_, j) => { const r = j % 2 ? 62 : 98, a = j / 24 * Math.PI * 2; return `${100 + r * Math.cos(a)},${100 + r * Math.sin(a)}`; }).join(' ')}" fill="${Y}" stroke="${K}" stroke-width="7"/></svg></div><div class="hookT">${md(sg.hook)}</div>`, 420, t + .1, te - .05);
    ft(h, '{ scale: 0, rotation: -25 }', '{ scale: 1, rotation: -4, duration: .45, ease: "back.out(2.2)" }', t + .15);
    ft(`${h} .burst`, '{ rotation: 0 }', `{ rotation: 40, duration: ${r2(sg.dur)}, ease: "none" }`, t + .15);
  }
  if (sg.bubble) {
    const b = sg.bubble, side = b.side || 'left';
    const bs = st(`<div class="bub ${side}${[...b.zh].length > 8 ? ' long' : ''}"><div class="zh">${esc(b.zh)}</div><div class="py">${esc(b.py)}</div><div class="vi">${esc(b.vi)}</div></div>`, b.top ?? 300, t + .25, te - .05);
    ft(bs, '{ scale: 0, rotation: -8, opacity: 1 }', '{ scale: 1, rotation: -2, duration: .4, ease: "back.out(2.4)" }', t + .25);
    to(bs, '{ scale: .85, opacity: 0, duration: .15 }', te - .2);
    recapItems.push([b.zh, b.py, b.vi]);
    KIT.push({ bubble: b, start: r2(t + .25), dur: r2(sg.dur - .3) });
  }
  if (sg.sfx) {
    const s = st(`<div class="sfx">${esc(sg.sfx)}</div>`, 760, t + .3, t + 1.4);
    ft(s, '{ scale: 2.4, rotation: 12, opacity: 0 }', '{ scale: 1, rotation: 8, opacity: 1, duration: .25, ease: "power4.out" }', t + .3);
    to(s, '{ opacity: 0, duration: .2 }', t + 1.15);
  }
  t = te;
}
/* ôn lại + kêu gọi */
const tr = t, RD = EP.recap.dur || 3.5, CD = EP.cta.dur || 3;
set('#dark', '{ opacity: .82 }', tr); flash(tr, .5); marks.push(tr);
const rt = st(`<div class="rtitle">${md(EP.recap.title)}</div>`, 250, tr, tr + RD);
ft(rt, '{ y: -40, opacity: 0 }', '{ y: 0, opacity: 1, duration: .3, ease: "expo.out" }', tr);
(EP.recap.items || recapItems).forEach(([zh, py, vi], i) => {
  const c = st(`<div class="ri"><b>${i + 1}</b><div><span class="z">${esc(zh)}</span><span class="p">${esc(py)}</span><span class="v">${esc(vi)}</span></div></div>`, 420 + i * 205, tr + .2 + i * .22, tr + RD);
  ft(c, `{ x: ${i % 2 ? 300 : -300}, opacity: 0 }`, '{ x: 0, opacity: 1, duration: .3, ease: "expo.out" }', tr + .2 + i * .22);
});
const tc = tr + RD; marks.push(tc); flash(tc, .4);
const cl = st(`<div class="ctaL">${md(EP.cta.line)}</div>`, 560, tc, tc + CD);
ft(cl, '{ scale: 1.3, opacity: .35 }', '{ scale: 1, opacity: 1, duration: .35, ease: "back.out(1.8)" }', tc);
const pl = st(`<div class="pill">${esc(EP.cta.pill)}</div>`, 1060, tc + .5, tc + CD);
ft(pl, '{ scale: .6, opacity: 0 }', '{ scale: 1, opacity: 1, duration: .35, ease: "back.out(2)" }', tc + .5);
const DUR = r2(tc + CD);

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
.fv{position:absolute;inset:0;opacity:0;overflow:hidden;transform-origin:50% 45%}
.fv video{width:100%;height:100%;object-fit:cover;display:block}
#ht{opacity:0;mix-blend-mode:multiply;background-image:radial-gradient(rgba(0,0,0,.55) 28%,transparent 31%);background-size:14px 14px}
#panel{opacity:0;border:22px solid #fff;box-shadow:inset 0 0 0 9px ${K}}
#dark{opacity:0;background:radial-gradient(90% 60% at 50% 40%,#2a2410 0%,#121108 55%,#050505 100%)}
#flash{background:#fff;opacity:0}
.st{position:absolute;left:0;right:0;display:flex;justify-content:center;pointer-events:none;padding:0 60px}
.st .in{transform-origin:50% 50%;display:flex;flex-direction:column;align-items:center}
mark{background:${Y};color:${K};padding:0 .12em;border-radius:6px}
.burst{position:absolute;width:980px;height:980px;left:50%;top:50%;margin:-490px 0 0 -490px;z-index:-1}
.burst svg{width:100%;height:100%}
.hookT{font:900 76px/1.05 ${FV};color:${K};text-align:center;letter-spacing:-.02em;text-transform:uppercase;width:600px;text-wrap:balance}
.hookT mark{background:${K};color:${Y}}
.bub{position:relative;background:#fff;color:${K};border:9px solid ${K};border-radius:60px;padding:30px 46px 28px;min-width:600px;max-width:980px;text-align:center;box-shadow:12px 14px 0 rgba(0,0,0,.85)}
.bub::after{content:"";position:absolute;bottom:-62px;width:0;height:0;border-left:34px solid transparent;border-right:34px solid transparent;border-top:66px solid ${K}}
.bub::before{content:"";position:absolute;bottom:-44px;width:0;height:0;border-left:22px solid transparent;border-right:22px solid transparent;border-top:46px solid #fff;z-index:2}
.bub.left::after{left:110px}.bub.left::before{left:122px}
.bub.right::after{right:110px}.bub.right::before{right:122px}
.bub .zh{font:400 82px/1.2 ${FZ};white-space:nowrap}
.bub.long .zh{font-size:62px}
.bub.long .py{font-size:32px}
.bub .py{font:800 40px ${FM};color:#c2410c;margin-top:8px}
.bub .vi{font:800 44px/1.2 ${FV};margin-top:10px;text-wrap:balance}
.sfx{font:900 150px ${FV};color:${Y};-webkit-text-stroke:10px ${K};paint-order:stroke fill;letter-spacing:.02em;text-shadow:10px 12px 0 ${K}}
.rtitle{font:900 66px ${FV};color:${K};background:${Y};padding:10px 28px;border-radius:12px;transform:rotate(-2deg)}
.ri{display:flex;align-items:center;gap:26px;width:920px;background:rgba(255,255,255,.07);border:4px solid ${Y};border-radius:24px;padding:16px 26px}
.ri b{font:900 56px ${FV};color:${K};background:${Y};width:76px;height:76px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:none}
.ri .z{display:block;font:400 54px ${FZ};color:#fff}
.ri .p{display:block;font:800 30px ${FM};color:${Y}}
.ri .v{display:block;font:700 32px ${FV};color:#ddd}
.ctaL{font:900 84px/1.1 ${FV};text-align:center;color:#fff;text-wrap:balance;letter-spacing:-.02em}
.pill{display:inline-block;white-space:nowrap;font:900 46px ${FV};color:${K};background:${Y};padding:18px 40px;border-radius:999px;border:6px solid ${K};box-shadow:0 10px 0 ${K}}
`;
const html = `<!doctype html>
<html lang="vi" data-resolution="portrait">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<script src="./gsap.min.js"></script><style>${CSS}</style></head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="1080" data-height="1920">
  ${VIDS.join('\n  ')}
  <div class="layer" id="ht"></div>
  <div class="layer" id="panel"></div>
  <div class="layer" id="dark"></div>
  ${H.join('\n  ')}
  <div class="layer" id="flash"></div>
  <audio id="music" src="music.wav" data-start="0" data-duration="${DUR}" data-volume="1"></audio>
</div>
<script>
const tl = gsap.timeline({ paused: true });
${TL.join('\n')}
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
const beats = Math.round(DUR * 2);
execFileSync('python3', [path.join(V, 'series/music_series.py'), path.join(OUTDIR, 'music.wav'), String(DUR), String(Math.round(EP.segs[0].dur * 2)), '6', String(Math.max(1, Math.round((beats - EP.segs[0].dur * 2 - 8) / 6)))], { stdio: 'ignore' });
fs.writeFileSync(path.join(OUTDIR, 'kit.json'), JSON.stringify({ id: EP.id, dur: DUR, tail: r2(tr), items: KIT, recap: EP.recap.items || recapItems, cta: EP.cta }, null, 1));
console.log('Đã sinh', OUTDIR, DUR + 's', k, 'cảnh');
