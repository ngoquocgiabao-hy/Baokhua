// "CÂU THẬT" khuôn mới (22/11) – thay series/cauthat.mjs. 40–50 giây, Bảo tự lồng tiếng, nhạc vinahouse chất Thái Hoàng trộn nhạc Hoa (story/music_th.py).
// Bảo góp ý bản cũ: hình nhỏ giữa 2 dải đen, chữ nhỏ, 4 khối ngữ pháp → ngợp; bản dài 63 giây quá lâu, bản short 24 giây quá nhanh.
// Khuôn mới: mỗi câu thoại = 1 cảnh; ảnh/clip raw cắt bỏ phần chữ in sẵn (dưới dòng `cut`) rồi đặt thành thẻ ảnh trên nền mờ của chính nó;
// 1 thẻ chữ Hán lớn (chữ + pinyin + nghĩa) mỗi cảnh; 1 điểm giảng chính (explain); 1 câu "đi làm nói luôn"; kết: chơi thử game ở baokhua.com.
// Câu thoại khoảng 4 chữ/giây, câu đầu mỗi phần vào đúng đầu ô nhịp; cảnh đổi đúng phách; hình đập theo phách ở đoạn drop.
//   node series/cauthat2.mjs story/episodes/<tập>.json   → out/<id>/ (index.html, music.wav, markers.json, loi_thoai.md)
//   cd out/<id> && npx hyperframes render -o ../BAOKHUA_CAU_THAT_<ID>_9x16.mp4
// Tập (ngoài git, story/episodes): { id, ep, raw, cut, tag, lines:[{ id, act 1–5, say, show, tip, x?, clips:[[a,b]...],
//   hook?:{z,py,ask}, card?:{z,py,vi}, explain?:[{z,py,vi,dir}], tagline? }] }   (act 5 = câu kêu gọi, màn kết)
import fs from 'fs';
import path from 'path';
import { execFileSync, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const V = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EP = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const OUTDIR = path.join(V, 'out', EP.id), RAW = path.join(V, 'story', 'raw', EP.raw), CUT = EP.cut || 1360;
const BPM = 140, BEAT = 60 / BPM, BAR = 4 * BEAT, SPS = 4.0, PAD = .35, GAP = .2;
const Y = '#FCE029', K = '#0B0B0C', W = '#FFFBEA';
const FV = "'Inter Display','Inter',sans-serif", FZ = "'WenQuanYi Zen Hei',sans-serif";
const r2 = x => +(+x).toFixed(3);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const zw = s => esc(s).replace(/([㐀-鿿，。？！]+)/g, '<span lang="zh-CN">$1</span>');
const md = s => zw(s).replace(/\*\*(.+?)\*\*/g, '<mark>$1</mark>');
fs.mkdirSync(OUTDIR, { recursive: true });

/* ---------- thời gian ---------- */
const LINES = EP.lines;
const syl = s => s.replace(/[.,:;!?–—"“”]/g, ' ').split(/\s+/).filter(Boolean).reduce((a, w) => a + (/[㐀-鿿]/.test(w) ? [...w].length : 1), 0);
const snap = t => Math.ceil(t / BEAT - 1e-6) * BEAT;
{ let t = BEAT, act = 1;
  for (const L of LINES) {
    if (L.act !== act) { t = Math.ceil((t + .3) / BAR - 1e-6) * BAR; act = L.act; }
    L.t0 = r2(snap(t)); L.n = syl(L.say) + (L.x || 0); L.dur = r2(L.n / SPS + PAD); L.t1 = r2(L.t0 + L.dur); t = L.t1 + GAP;
  } }
const actStart = a => (LINES.find(l => l.act === a) || {}).t0;
const LAST = LINES[LINES.length - 1];
const DUR = r2(Math.ceil((LAST.t1 + 2.6) / BAR) * BAR);
LINES.forEach((L, i) => { L.s0 = i ? L.t0 - .1 : 0; L.s1 = i < LINES.length - 1 ? LINES[i + 1].t0 - .1 : DUR; });   // cảnh phủ từ câu này tới câu sau

/* ---------- cắt cảnh raw: bỏ viền đen + phần chữ in sẵn, kéo chậm cho vừa ô (đổi cảnh đúng phách) ---------- */
function cropDetect(a, b) {   // đo vùng ảnh từng khung, lấy phần chung ổn định (bỏ khung chuyển cảnh)
  const r = spawnSync('ffmpeg', ['-hide_banner', '-ss', String(a), '-t', String(Math.max(.1, b - a)), '-i', RAW, '-vf', 'cropdetect=limit=24:round=2:reset=1', '-f', 'null', '-'], { encoding: 'utf8' });
  const F = [...String(r.stderr || '').matchAll(/crop=(\d+):(\d+):(\d+):(\d+)/g)].map(m => m.slice(1).map(Number)).filter(([w, h]) => w > 200 && h > 200);
  if (!F.length) return { w: 1080, h: 1920, x: 0, y: 0 };
  const q = (arr, p) => { const s = [...arr].sort((u, v) => u - v); return s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))]; };
  const x0 = q(F.map(f => f[2]), .75), y0 = q(F.map(f => f[3]), .75), x1 = q(F.map(f => f[2] + f[0]), .25), y1 = q(F.map(f => f[3] + f[1]), .25);
  return { w: x1 - x0, h: y1 - y0, x: x0, y: y0 };
}
let nclip = 0;
function makeClip(a, b, slot) {
  const c = cropDetect(a, b);
  const y0 = c.y, y1 = Math.min(c.y + c.h, CUT);
  const h = Math.max(2, Math.floor((y1 - y0) / 2) * 2), w = Math.floor(c.w / 2) * 2;
  const k = Math.max(1, slot / (b - a));
  const f = `c${String(++nclip).padStart(2, '0')}.mp4`;
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', String(a), '-t', String(b - a), '-i', RAW, '-vf', `crop=${w}:${h}:${c.x}:${y0},setpts=${k.toFixed(4)}*PTS,fps=30,format=yuv420p`, '-an', '-c:v', 'libx264', '-crf', '15', '-preset', 'fast', '-t', String(slot + .2), path.join(OUTDIR, f)]);
  return { f, w, h };
}

/* ---------- dựng trang ---------- */
const H = [], HS = [], TL = [];
let n = 0;
const uid = p => `${p}${++n}`;
const to = (s, v, t) => TL.push(`tl.to(${JSON.stringify(s)}, ${v}, ${r2(t)});`);
const ft = (s, a, v, t) => TL.push(`tl.fromTo(${JSON.stringify(s)}, ${a}, ${v}, ${r2(t)});`);
const set = (s, v, t) => TL.push(`tl.set(${JSON.stringify(s)}, ${v}, ${r2(t)});`);
const flash = (t, a = .5) => ft('#flash', `{ opacity: ${a} }`, '{ opacity: 0, duration: .3, ease: "power2.out", immediateRender: false }', t);
function st(inner, top, t0, t1, style = '', into = H) { const id = uid('s'); into.push(`<div class="st clip" id="${id}" style="top:${top}px;${style}" data-start="${r2(t0)}" data-duration="${r2(t1 - t0)}"><div class="in">${inner}</div></div>`); return `#${id} .in`; }
function layer(inner, t0, t1, cls = '') { const id = uid('l'); H.push(`<div class="lay clip ${cls}" id="${id}" data-start="${r2(t0)}" data-duration="${r2(t1 - t0)}">${inner}</div>`); return `#${id}`; }
// thẻ ảnh: clip đã cắt, nền là chính clip đó phóng to + làm mờ; vào bằng lướt ngang có nhoè
const BOX = { w: 940, h: 700, top: 290 };
function card(c, t0, t1, i) {
  const sc = Math.min(BOX.w / c.w, BOX.h / c.h), cw = Math.round(c.w * sc), ch = Math.round(c.h * sc);
  const id = uid('fc'), rot = i % 2 ? 1.6 : -1.6, dur = r2(t1 - t0);
  H.push(`<div class="fc clip" id="${id}" data-start="${r2(t0)}" data-duration="${dur}"><video class="bg" src="${c.f}" muted data-start="${r2(t0)}" data-duration="${dur}"></video>`
    + `<div class="cd" id="${id}c" style="left:${540 - cw / 2}px;top:${BOX.top + (BOX.h - ch) / 2}px;width:${cw}px;height:${ch}px"><video src="${c.f}" muted data-start="${r2(t0)}" data-duration="${dur}"></video></div></div>`);
  ft(`#${id}c`, `{ xPercent: ${i % 2 ? -120 : 120}, rotation: ${rot * 4}, filter: "blur(16px)" }`, `{ xPercent: 0, rotation: ${rot}, filter: "blur(0px)", duration: .32, ease: "expo.out", immediateRender: false }`, t0);
  ft(`#${id}c video`, '{ scale: 1.0 }', `{ scale: 1.07, duration: ${dur}, ease: "sine.inOut", immediateRender: false }`, t0);
}
function scenes(L, i) {
  const cl = L.clips || [];
  if (!cl.length) return;
  const T = L.s1 - L.s0, nb = Math.max(1, Math.round(T / BEAT));
  // chia ô theo phách: mỗi cảnh ít nhất 2 phách
  const per = Math.max(2, Math.floor(nb / cl.length));
  let t = L.s0, k = 0;
  while (t < L.s1 - 1e-3) {
    const [a, b] = cl[k % cl.length];
    let end = Math.min(L.s1, snapBeat(t + per * BEAT));
    if (L.s1 - end < BEAT * 1.5) end = L.s1;
    const c = makeClip(a, b, end - t);
    card(c, t, end, i * 7 + k);
    t = end; k++;
  }
}
const snapBeat = t => Math.round(t / BEAT) * BEAT;
function sub(L, top = 1290) {
  const toks = []; L.show.split(/(\*\*.+?\*\*)/).forEach(seg => { const hl = /^\*\*/.test(seg); (hl ? seg.slice(2, -2) : seg).split(' ').filter(Boolean).forEach(w => toks.push({ h: hl ? `<mark>${zw(w)}</mark>` : zw(w), k: hl })); });
  const ids = toks.map(() => uid('w'));
  const s = st(`<div class="sub">${toks.map((w, i) => `<span class="w" id="${ids[i]}">${w.h}</span>`).join(' ')}</div>`, top, L.t0 - .12, L.t1 + .2, '', HS);
  ft(`${s} .sub`, '{ opacity: 0, y: 18, scale: .96 }', '{ opacity: 1, y: 0, scale: 1, duration: .18, ease: "power2.out" }', L.t0 - .12);
  const span = Math.max(.5, L.dur - PAD - .1);
  ids.forEach((id, k) => { const t = L.t0 + k * span / ids.length;
    if (toks[k].k) ft(`#${id}`, '{ opacity: .3, scale: .8 }', '{ opacity: 1, scale: 1, duration: .2, ease: "back.out(3)" }', t);
    else ft(`#${id}`, '{ opacity: .3 }', '{ opacity: 1, duration: .12 }', t); });
}
const tag = (txt, t0, t1, top = 200) => { const s = st(`<div class="tag">${md(txt)}</div>`, top, t0, t1, 'justify-content:flex-start;padding-left:70px'); ft(s, '{ x: -90, opacity: 0 }', '{ x: 0, opacity: 1, duration: .3, ease: "expo.out" }', t0); return s; };
function zhCard(c, t0, t1) {
  const len = [...c.z].length, fz = len <= 6 ? 96 : len <= 9 ? 80 : 66;
  const s = st(`<div class="zc"><div class="z" lang="zh-CN" style="font-size:${fz}px">${esc(c.z)}</div><div class="p">${esc(c.py)}</div><div class="v">${esc(c.vi)}</div></div>`, 1010, t0, t1);
  ft(`${s} .zc`, '{ y: 80, opacity: 0, rotationX: -50, transformPerspective: 900 }', '{ y: 0, opacity: 1, rotationX: 0, duration: .4, ease: "back.out(1.6)" }', t0);
  return s;
}
function pulse(t0, t1, strong = 1.035, weak = 1.012) {
  for (let k = 0; t0 + k * BEAT < t1 - 1e-6; k++) { const s = k % 4 === 0 ? strong : weak; if (s > 1) ft('#cam', `{ scale: ${s} }`, '{ scale: 1, duration: .22, ease: "power2.out", immediateRender: false }', t0 + k * BEAT); }
}
function drop(t, k = 1) {
  to('#cam', `{ keyframes: [{ x: ${-16 * k}, y: ${10 * k}, duration: .04 }, { x: ${14 * k}, y: ${-12 * k}, duration: .04 }, { x: ${-10 * k}, y: ${6 * k}, duration: .04 }, { x: ${6 * k}, y: ${-4 * k}, duration: .05 }, { x: 0, y: 0, duration: .06 }] }`, t);
  ft('#cam', `{ filter: "drop-shadow(${12 * k}px 0 0 rgba(255,0,80,.65)) drop-shadow(${-12 * k}px 0 0 rgba(0,220,255,.65))" }`, '{ filter: "drop-shadow(0px 0 0 rgba(255,0,80,0)) drop-shadow(0px 0 0 rgba(0,220,255,0))", duration: .28, ease: "power2.out", immediateRender: false }', t);
  set('#cam', '{ filter: "none" }', t + .3);
  flash(t, .5 * k);
}

/* ---------- cảnh ---------- */
const A2 = actStart(2), A3 = actStart(3), A4 = actStart(4), A5 = actStart(5);
const END = LINES.find(l => l.act === 5);
layer('', 0, DUR, 'bgDark');
LINES.forEach((L, i) => {
  if (L.act === 5) return;
  scenes(L, i);
  if (L.hook) {
    const s = st(`<div class="hk"><div class="tile" lang="zh-CN">${esc(L.hook.z)}</div><div class="hp">${esc(L.hook.py)}</div></div>`, 470, L.t0 + L.dur * .55, L.s1);
    ft(`${s} .hk`, '{ scale: 2.6, opacity: 0, filter: "blur(18px)" }', '{ scale: 1, opacity: 1, filter: "blur(0px)", duration: .35, ease: "expo.out" }', L.t0 + L.dur * .55);
    flash(L.t0 + L.dur * .55, .4);
    const q = st(`<div class="chip y">${md(L.hook.ask)}</div>`, 1060, L.t0 + L.dur * .7, L.s1);
    ft(`${q} .chip`, '{ scale: 0 }', '{ scale: 1, duration: .3, ease: "back.out(2.5)" }', L.t0 + L.dur * .7);
  }
  if (L.card) zhCard(L.card, L.t0 + .15, L.s1);
  if (L.explain) {
    const rows = L.explain.map((e, j) => `<div class="er" id="er${i}_${j}"><b lang="zh-CN">${esc(e.z)}</b><span class="d">${esc(e.dir)}</span><div><i>${esc(e.py)}</i><em>${esc(e.vi)}</em></div></div>`).join('');
    const s = st(`<div class="ex"><div class="eh">MẸO · <span lang="zh-CN">借</span> có 2 chiều</div>${rows}</div>`, 330, L.t0, L.s1);
    ft(`${s} .ex`, '{ y: 60, opacity: 0 }', '{ y: 0, opacity: 1, duration: .35, ease: "expo.out" }', L.t0);
    L.explain.forEach((e, j) => ft(`#er${i}_${j}`, '{ x: 160, opacity: 0 }', '{ x: 0, opacity: 1, duration: .35, ease: "back.out(1.6)", immediateRender: false }', L.t0 + L.dur * (.38 + .3 * j)));
  }
  if (L.tagline) tag(L.tagline, L.t0, L.s1, 1140 - 200);
});
tag(EP.tag, 0, END ? END.t0 : DUR);
// nhịp hình: drop ở đầu phần 3, 4, 5; đập theo phách trong phần 3–5
drop(A3, 1); pulse(A3, A4); if (A4) { drop(A4, .7); pulse(A4, A5 || DUR); }
pulse(A2, A3, 1.012, 1);
// màn kết
if (END) {
  const te = END.t0;
  layer('', te, DUR, 'endbg');
  drop(te, .8);
  const e1 = st(`<div class="end1"><span>LUYỆN CÂU THẬT</span><b>GAME 3D</b></div>`, 250, te + .05, DUR);
  ft(`${e1} b`, '{ scale: 1.8, opacity: 0, filter: "blur(12px)" }', '{ scale: 1, opacity: 1, filter: "blur(0px)", duration: .4, ease: "expo.out" }', te + .1);
  const ph = st(`<div class="phone"><img src="poster.jpg" alt=""><i></i></div>`, 560, te + .2, DUR);
  ft(`${ph} .phone`, '{ y: 500, rotation: 12, opacity: 0 }', '{ y: 0, rotation: -4, opacity: 1, duration: .5, ease: "back.out(1.4)" }', te + .2);
  ft(`${ph} .phone i`, '{ x: -420 }', '{ x: 520, duration: .8, ease: "sine.inOut", immediateRender: false }', te + .9);
  const url = st(`<div class="url">baokhua.com</div>`, 1190, te + .6, DUR);
  ft(url, '{ opacity: 0, y: 30, letterSpacing: "0.2em" }', '{ opacity: 1, y: 0, letterSpacing: "-0.02em", duration: .45, ease: "expo.out" }', te + .6);
  const pill = st(`<div class="pill">▶ Chơi ngay trên web</div>`, 1345, te + 1.0, DUR);
  ft(pill, '{ opacity: 0, scale: .7 }', '{ opacity: 1, scale: 1, duration: .4, ease: "back.out(2.2)" }', te + 1.0);
  st(`<div class="brand">Bảo Khựa <b lang="zh-CN">阿宝</b> Ā Bǎo · Tiếng Trung để đi làm</div>`, 1455, te + 1.4, DUR);
  pulse(te, DUR - BAR, 1.03, 1.01);
}
LINES.filter(L => L.act !== 5).forEach(L => sub(L));

const CSS = `
@font-face{font-family:'Inter Display';src:local('Inter Display'),local('Inter Display Black')}
@font-face{font-family:'Inter';src:local('Inter')}
@font-face{font-family:'WenQuanYi Zen Hei';src:local('WenQuanYi Zen Hei')}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:${K}}
#root{position:relative;width:1080px;height:1920px;overflow:hidden;background:${K};color:${W};font-family:${FV}}
#cam{position:absolute;inset:0;overflow:hidden;transform-origin:50% 45%}
[lang="zh-CN"]{font-family:${FZ};font-weight:400}
.lay{position:absolute;inset:0;overflow:hidden}
.bgDark{background:radial-gradient(70% 45% at 50% 40%,#1b2a44 0%,#0c1220 60%,#06080d 100%)}
.endbg{background:radial-gradient(60% 40% at 50% 42%,rgba(252,224,41,.22),rgba(252,224,41,0) 70%),radial-gradient(rgba(252,224,41,.12) 3px,transparent 3.6px) 0 0/34px 34px,linear-gradient(170deg,#0e2a44 0%,#0a1626 55%,#06090f 100%)}
.fc{position:absolute;inset:0;overflow:hidden}
.fc .bg{position:absolute;inset:-80px;width:calc(100% + 160px);height:calc(100% + 160px);object-fit:cover;filter:blur(38px) brightness(.55) saturate(1.2)}
.fc .cd{position:absolute;border-radius:26px;overflow:hidden;border:8px solid #fffdf4;box-shadow:0 40px 90px rgba(0,0,0,.6)}
.fc .cd video{width:100%;height:100%;object-fit:cover;display:block}
.st{position:absolute;left:0;right:0;display:flex;justify-content:center;pointer-events:none;padding:0 60px}
.st .in{transform-origin:50% 50%}
mark{background:${Y};color:${K};padding:0 .12em;border-radius:6px;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.sub{max-width:960px;padding:14px 26px 18px;border-radius:24px;background:rgba(6,9,16,.78);font:800 46px/1.22 ${FV};text-align:center;text-wrap:balance;color:#fff;box-shadow:0 14px 40px rgba(0,0,0,.4)}
.sub .w{display:inline-block;transform-origin:50% 70%}
.tag{font:900 34px/1.15 ${FV};letter-spacing:.02em;color:${K};background:${Y};padding:10px 20px 12px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.5)}
.tag mark{background:${K};color:${Y}}
.zc{display:flex;flex-direction:column;align-items:center;gap:4px;max-width:980px;padding:20px 40px 24px;border-radius:28px;background:#fffdf4;color:${K};box-shadow:0 26px 70px rgba(0,0,0,.6);border:5px solid ${Y};text-align:center}
.zc .z{line-height:1.12}
.zc .p{font:800 40px ${FV};color:#c2410c}
.zc .v{font:800 38px ${FV}}
.hk{display:flex;flex-direction:column;align-items:center}
.tile{width:330px;height:330px;border-radius:44px;background:${Y};color:${K};font-size:250px;line-height:330px;text-align:center;border:10px solid ${K};box-shadow:0 18px 0 ${K},0 40px 80px rgba(0,0,0,.6)}
.hp{margin-top:34px;font:900 64px ${FV};color:#fff;text-shadow:0 6px 24px rgba(0,0,0,.8)}
.chip{display:inline-flex;align-items:center;gap:12px;padding:16px 30px;border-radius:999px;font:900 44px ${FV};white-space:nowrap}
.chip.y{background:${Y};color:${K};border:5px solid ${K}}
.ex{width:960px;padding:30px 34px 34px;border-radius:32px;background:#fffdf4;color:${K};border:6px solid ${Y};box-shadow:0 30px 80px rgba(0,0,0,.6)}
.ex .eh{font:900 40px ${FV};margin-bottom:18px}
.ex .er{display:flex;align-items:center;gap:22px;padding:18px 0;border-top:3px dashed rgba(0,0,0,.15)}
.ex .er b{font-size:108px;line-height:1.1;font-weight:400}
.ex .er .d{font:900 72px ${FV};color:#c2410c}
.ex .er div{display:flex;flex-direction:column}
.ex .er i{font:800 40px ${FV};font-style:normal;color:#c2410c}
.ex .er em{font:900 46px ${FV};font-style:normal}
.end1{display:flex;flex-direction:column;align-items:center}
.end1 span{font:800 46px ${FV};letter-spacing:.2em;color:#fff;margin-right:-.2em}
.end1 b{font:900 172px/.95 ${FV};letter-spacing:-.045em;color:${Y};text-shadow:0 10px 50px rgba(252,224,41,.35)}
.phone{position:relative;width:300px;height:596px;border-radius:46px;border:11px solid #0d0d0f;overflow:hidden;background:#000;box-shadow:0 0 0 3px rgba(255,255,255,.28),0 40px 90px rgba(0,0,0,.85)}
.phone img{width:100%;height:100%;object-fit:cover;display:block}
.phone i{position:absolute;top:-10%;left:0;width:150px;height:120%;background:linear-gradient(100deg,rgba(255,255,255,0),rgba(255,255,255,.42),rgba(255,255,255,0));transform:skewX(-14deg)}
.url{font:900 120px/1 ${FV};letter-spacing:-.02em;color:#fff;padding-bottom:16px;background:linear-gradient(${Y},${Y}) 0 100%/100% 12px no-repeat}
.pill{display:inline-block;white-space:nowrap;font:900 44px ${FV};color:${K};background:${Y};padding:18px 40px;border-radius:999px;border:6px solid ${K};box-shadow:0 10px 0 ${K}}
.brand{font:700 30px ${FV};color:rgba(255,255,255,.82);white-space:nowrap}
.brand b{color:${Y}}
#vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 85% at 50% 50%,transparent 60%,rgba(0,0,0,.45) 100%)}
#flash{position:absolute;inset:0;background:#fff;opacity:0}
`;
const html = `<!doctype html>
<html lang="vi" data-resolution="portrait">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<script src="./gsap.min.js"></script><style>${CSS}</style></head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="1080" data-height="1920">
  <div id="cam">
  ${H.join('\n  ')}
  </div>
  ${HS.join('\n  ')}
  <div id="vig"></div>
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
const POSTER = path.join(V, 'out', 'story4', 'poster.jpg');
if (fs.existsSync(POSTER)) fs.copyFileSync(POSTER, path.join(OUTDIR, 'poster.jpg'));
// mốc nhạc: 5 phần; drop2 = đầu phần 4 (phần 4 ngắn thì drop luôn)
const acts = [1, 2, 3, 4, 5].map(a => ({ act: a, t: a === 1 ? 0 : (actStart(a) ?? DUR) }));
fs.writeFileSync(path.join(OUTDIR, 'markers.json'), JSON.stringify({ bpm: BPM, dur: DUR, acts, lines: LINES.map(l => ({ id: l.id, act: l.act, t0: l.t0, t1: l.t1 })), hits: [A3, A4, END ? END.t0 : DUR], drop2: A4 }, null, 1));
const mmss = t => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;
fs.writeFileSync(path.join(OUTDIR, 'loi_thoai.md'), ['# Lời thoại Câu thật ' + EP.ep + ' – Bảo tự đọc', '',
  `Video dài ${DUR.toFixed(1)} giây, nhạc ${BPM} BPM. Tốc độ khoảng ${SPS} chữ mỗi giây (như nói chuyện thong thả). Đọc từng câu, nghỉ khoảng 1 giây giữa các câu; máy tự cắt và đặt vào đúng mốc.`, '',
  '| Câu | Từ giây | Đến giây | Đọc | Cách đọc |', '|---|---|---|---|---|', ...LINES.map(l => `| ${l.id} | ${mmss(l.t0)} | ${mmss(l.t1)} | ${l.say} | ${l.tip || ''} |`), '',
  'Ghép giọng: `python3 tools/long_tieng.py --video out/BAOKHUA_CAU_THAT_' + EP.id.toUpperCase() + '_9x16.mp4 --voice <ghi âm> --split --marks ' + LINES.map(l => l.t0).join(',') + ' --out out/BAOKHUA_CAU_THAT_' + EP.id.toUpperCase() + '_LONG_TIENG_9x16.mp4`', ''].join('\n'));
execFileSync('python3', [path.join(V, 'story/music_th.py'), path.join(OUTDIR, 'markers.json'), path.join(OUTDIR, 'music.wav')], { stdio: 'inherit' });
console.log('Đã sinh', OUTDIR, 'dài', DUR, 's,', nclip, 'cảnh');
console.log(LINES.map(l => `${l.id} ${l.t0}-${l.t1} (${l.n} âm tiết)`).join('\n'));
