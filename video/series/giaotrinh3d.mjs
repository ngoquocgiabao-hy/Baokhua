// Thể loại F9 "GIÁO TRÌNH 3D · PHÂN TÍCH SÂU": mỗi tập ≤ 60 giây mổ xẻ một điểm của giáo trình HSK0 → HSK4
// (giáo trình trong game Khách sạn Vịnh Ā Bǎo). Kết cấu: GÂY HIT → các phần phân tích (biểu đồ thanh điệu,
// luật biến điệu, ví dụ đi làm, bí quyết) → ĐI LÀM NÓI LUÔN → KÊU GỌI game mới + học online.
//   node series/giaotrinh3d.mjs giaotrinh/gt01.json   → out/<id>/  rồi  cd out/<id> && npx hyperframes render -o ../<TÊN>.mp4
// Các phần (beats) trong tệp tập, mỗi phần có dur (giây):
//   hook   { stamp, line, key, py, ask }
//   tones  { tag, title, items:[{zh,py,vi,c:[mức 1–5...],lab}], note }      biểu đồ cao độ dưới từng quân bài
//   morph  { tag, title, chars, idx, from:[..], to:[..], rest:[[..]], formula, written, spoken, note }
//   words  { tag, title, items:[{zh, written, spoken, vi}] }                 viết một kiểu, đọc một kiểu
//   half   { tag, title, full:[..], half:[..], items:[{zh,py,vi}], note }
//   use    { tag, zh, written, spoken, vi }
//   cta    { q, game:[a,b], online:[a,b] }
// Chỗ lồng tiếng: mỗi phần in ra mốc giây trong vo.md để Bảo đọc mẫu (giọng thật, không dùng giọng máy cho bài phát âm).
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const V = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EP = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const OUTDIR = path.join(V, 'out', EP.id);
const DUR = +EP.beats.reduce((s, b) => s + b.dur, 0).toFixed(2);
const Y = '#FCE029', K = '#0B0B0C', W = '#FFFBEA';
const TONE = ['#FCE029', '#FF8A3D', '#5BD1FF', '#FF5C8A'];
const FV = "'Inter Display','Inter',sans-serif", FZ = "'WenQuanYi Zen Hei',sans-serif", FM = "'JetBrains Mono',monospace";
const r2 = x => +(+x).toFixed(3);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<mark>$1</mark>');
const PX = 275.6;                                    // 1 đơn vị 3D = 275,6 px (máy quay z = 13, fov 30)
const tileX = (i, n, sp) => 540 + (i - (n - 1) / 2) * sp * PX;
const tileY = y => 960 - y * PX;

const H = [], TL = [], G3 = [], RING = [], BURST = [], VO = [];
let n = 0;
const uid = p => `${p}${++n}`;
const to = (s, v, t) => TL.push(`tl.to(${JSON.stringify(s)}, ${v}, ${r2(t)});`);
const ft = (s, a, v, t) => TL.push(`tl.fromTo(${JSON.stringify(s)}, ${a}, ${v}, ${r2(t)});`);
const set = (s, v, t) => TL.push(`tl.set(${JSON.stringify(s)}, ${v}, ${r2(t)});`);
function st(inner, top, t0, t1, style = '', cls = '') { const id = uid('s'); H.push(`<div class="st clip ${cls}" id="${id}" style="top:${top}px;${style}" data-start="${r2(t0)}" data-duration="${r2(t1 - t0)}"><div class="in">${inner}</div></div>`); return `#${id} .in`; }
function box(inner, left, top, w, t0, t1) { const id = uid('b'); H.push(`<div class="bx clip" id="${id}" style="left:${left}px;top:${top}px;width:${w}px" data-start="${r2(t0)}" data-duration="${r2(t1 - t0)}">${inner}</div>`); return `#${id}`; }
const flash = (t, a = .4) => ft('#flash', `{ opacity: ${a} }`, '{ opacity: 0, duration: .25, ease: "power2.out", immediateRender: false }', t);
const fadeIn = (s, t, y = 24) => ft(s, `{ opacity: 0, y: ${y}, filter: "blur(8px)" }`, '{ opacity: 1, y: 0, filter: "blur(0px)", duration: .4, ease: "expo.out" }', t);
const out = (s, t) => to(s, '{ opacity: 0, filter: "blur(8px)", duration: .2 }', t);
const draw = (s, t, d = .8) => ft(s, '{ strokeDashoffset: 1 }', `{ strokeDashoffset: 0, duration: ${d}, ease: "power2.inOut", immediateRender: false }`, t);
const tiles = (chars, t0, t1, y, o = {}) => {
  const nc = [...chars].length;
  const sc = o.scale ?? (nc >= 4 ? .66 : nc === 3 ? .72 : nc === 2 ? .78 : .82), sp = o.spacing ?? (nc >= 4 ? .7 : nc === 3 ? .78 : .84);
  G3.push({ chars, t0, t1, enter: o.enter || 'slam', exit: o.exit || 'knock', exitDir: o.dir || 1, side: 'black', back: 'black', face: { bg: Y, ink: K, ring: 'rgba(0,0,0,.2)' }, y, scale: sc, spacing: sp, stagger: o.stagger ?? .09, noShadow: true });
  return sp;
};

/* đường cao độ: mức 1–5 → đường cong mượt (Catmull-Rom sang Bezier) trong khung w×h */
function contour(pts, w, h, pad = 22) {
  const P = pts.map((L, i) => [pad + (w - 2 * pad) * (pts.length === 1 ? .5 : i / (pts.length - 1)), pad + (5 - L) / 4 * (h - 2 * pad)]);
  if (P.length === 2) return `M${P[0][0].toFixed(1)},${P[0][1].toFixed(1)} L${P[1][0].toFixed(1)},${P[1][1].toFixed(1)}`;
  let d = `M${P[0][0].toFixed(1)},${P[0][1].toFixed(1)}`;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1.map(v => v.toFixed(1)).join(',')} ${c2.map(v => v.toFixed(1)).join(',')} ${p2.map(v => v.toFixed(1)).join(',')}`;
  }
  return d;
}
/* khung biểu đồ: 5 vạch mức, các đường (id riêng để vẽ dần) */
function graph(w, h, lines, opt = {}) {
  const pad = 22;
  let g = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
  for (let L = 1; L <= 5; L++) {
    const y = pad + (5 - L) / 4 * (h - 2 * pad);
    g += `<line x1="${pad}" x2="${w - pad}" y1="${y}" y2="${y}" stroke="rgba(255,255,255,${L === 1 || L === 5 ? .28 : .13})" stroke-width="2" stroke-dasharray="${L === 1 || L === 5 ? '0' : '6 8'}"/>`;
    if (opt.axis) g += `<text x="4" y="${y + 7}" class="ax">${L}</text>`;
  }
  lines.forEach(l => { g += `<path id="${l.id}" d="${contour(l.pts, w, h, pad)}" pathLength="1" fill="none" stroke="${l.color}" stroke-width="${l.width || 11}" stroke-linecap="round" stroke-linejoin="round" ${l.dash ? 'stroke-dasharray="0.03 0.035" style="stroke-dashoffset:0"' : 'stroke-dasharray="1" style="stroke-dashoffset:1"'}/>`; });
  return g + '</svg>';
}
const header = (b, t, te) => {
  const tg = st(`<div class="tag">${esc(b.tag)}</div>`, 140, t, te - .05, '', 'l');
  ft(tg, '{ rotationX: -90, opacity: 0, transformPerspective: 800 }', '{ rotationX: 0, rotation: -1.5, opacity: 1, duration: .35, ease: "back.out(2)" }', t + .02);
  st(`<div class="cnt">${esc(EP.level)}</div>`, 136, t, te - .05, '', 'r');
  if (b.title) { const ti = st(`<div class="ttl">${md(b.title)}</div>`, 236, t + .05, te - .05); fadeIn(ti, t + .1); out(ti, te - .3); }
  out(tg, te - .3);
};
const vo = (t, text) => VO.push(`| ${t.toFixed(1)} s | ${text} |`);

/* ---------- các phần ---------- */
let t = 0;
const marks = [];
for (const b of EP.beats) {
  const te = t + b.dur;
  if (t > 0) { flash(t, .35); marks.push(t); }
  if (b.type === 'hook') {
    const sr = st(`<div class="stamp">${esc(b.stamp)}</div>`, 140, 0, te - .05, '', 'l');
    ft(sr, '{ rotationX: -90, opacity: 0, transformPerspective: 800 }', '{ rotationX: 0, rotation: -2, opacity: 1, duration: .35, ease: "back.out(2)" }', .05);
    const hl = st(`<div class="hk">${md(b.line)}</div>`, 250, .1, te - .05);
    fadeIn(hl, .15);
    tiles(b.key, .5, te - .3, .95, { scale: 1.05, spacing: 1.12 });
    RING.push({ t: .75, y: .95, size: 5 });
    const py = st(`<div class="pyBig"><span class="s1">${esc(b.py.split(' ')[0])}</span> ${esc(b.py.split(' ').slice(1).join(' '))}</div>`, 1050, 1.2, te - .05);
    ft(py, '{ y: 40, opacity: 0 }', '{ y: 0, opacity: 1, duration: .4, ease: "expo.out" }', 1.2);
    ft(`${py} .s1`, '{ "--strike": 0 }', '{ "--strike": 1, duration: .35, ease: "power2.out", immediateRender: false }', 2.2);
    const ha = st(`<div class="ask">${md(b.ask)}</div>`, 1330, 2.6, te - .05);
    ft(ha, '{ scale: 1.6, opacity: 0 }', '{ scale: 1, opacity: 1, duration: .35, ease: "power4.out" }', 2.65);
    vo(.3, `${b.key}: đọc tự nhiên một lần (${b.py} → đúng như người Trung nói)`);
  }
  if (b.type === 'tones') {
    header(b, t, te);
    const N = b.items.length, sp = .84, gw = 210, gh = 300;
    tiles(b.items.map(i => i.zh).join(''), t + .3, te - .35, 1.42, { scale: .66, spacing: sp, enter: 'drop', stagger: .45 });
    b.items.forEach((it, i) => {
      const cx = tileX(i, N, sp), id = uid('tn');
      const gsel = box(`${graph(gw, gh, [{ id, pts: it.c, color: TONE[i % 4] }])}<div class="lab" style="color:${TONE[i % 4]}">${esc(it.lab)}</div><div class="gpy">${esc(it.py)}</div><div class="gvi">${esc(it.vi)}</div>`, cx - gw / 2, 690, gw, t + .4, te - .05);
      const tt = t + .5 + i * .45;
      fadeIn(gsel, tt, 18);
      draw(`#${id}`, tt + .25, .9);
      out(gsel, te - .3);
      vo(tt + .25, `${it.zh} ${it.py}`);
    });
    const nt = st(`<div class="note">${md(b.note)}</div>`, 1300, t + 3.4, te - .05);
    fadeIn(nt, t + 3.5);
    out(nt, te - .3);
  }
  if (b.type === 'morph') {
    header(b, t, te);
    const ch = [...b.chars], N = ch.length, sp = 1.0, gw = 230, gh = 250;
    tiles(b.chars, t + .2, te - .35, 1.5, { scale: .88, spacing: sp });
    const tm = t + 3.6;                                // lúc chữ đầu đổi thanh
    ch.forEach((c, i) => {
      const cx = tileX(i, N, sp);
      const lines = [];
      const a = uid('mf'), z = uid('mt');
      if (i === b.idx) { lines.push({ id: a, pts: b.from, color: '#8a8a8a' }); lines.push({ id: z, pts: b.to, color: Y, width: 13 }); }
      else lines.push({ id: a, pts: b.rest[i] || b.from, color: TONE[2] });
      const gsel = box(`${graph(gw, gh, lines)}<div class="lab" id="${a}l">${i === b.idx ? '2 → 1 → 4' : '2 → 1 → 4'}</div>`, cx - gw / 2, 760, gw, t + .5, te - .05);
      fadeIn(gsel, t + .6, 18);
      draw(`#${a}`, t + .9 + i * .5, .8);
      if (i === b.idx) {
        to(`#${a}`, '{ opacity: .35, duration: .3 }', tm);
        draw(`#${z}`, tm + .1, .7);
        ft(`#${a}l`, '{ opacity: 1 }', '{ opacity: 0, duration: .15, immediateRender: false }', tm);
        set(`#${a}l`, `{ textContent: "3 → 5", color: "${Y}" }`, tm + .16);
        to(`#${a}l`, '{ opacity: 1, duration: .2 }', tm + .17);
        RING.push({ t: tm + .1, x: (cx - 540) / PX, y: 1.5, size: 1.6, d: .5 });
      }
      out(gsel, te - .3);
    });
    const fo = st(`<div class="formula">${md(b.formula)}</div>`, 1050, tm + .2, te - .05);
    ft(fo, '{ scale: 1.5, opacity: 0 }', '{ scale: 1, opacity: 1, duration: .4, ease: "back.out(2)" }', tm + .25);
    const ws = st(`<div class="ws"><div><span class="k">Viết</span> <span class="p dim">${esc(b.written)}</span></div><div><span class="k">Đọc</span> <span class="p">${md(b.spoken)}</span></div></div>`, 1210, tm + .9, te - .05);
    fadeIn(ws, tm + 1);
    const nt = st(`<div class="note">${md(b.note)}</div>`, 1460, tm + 2.2, te - .05);
    fadeIn(nt, tm + 2.3);
    [fo, ws, nt].forEach(s => out(s, te - .3));
    vo(tm + .1, `${b.chars}: đọc chậm ${b.spoken.replace(/\*/g, '')}, nhấn chữ đầu đi lên`);
  }
  if (b.type === 'words') {
    header(b, t, te);
    const N = b.items.length, d = (b.dur - .5) / N;
    b.items.forEach((it, i) => {
      const t0 = t + .4 + i * d, t1 = t0 + d;
      tiles(it.zh, t0, t1 - .3, 1.15, { enter: ['slam', 'drop', 'flip', 'rise'][i % 4], dir: i % 2 ? -1 : 1 });
      const c = st(`<div class="wcnt">${i + 1}/${N}</div><div class="ws"><div><span class="k">Viết</span> <span class="p dim">${esc(it.written)}</span></div><div><span class="k">Đọc</span> <span class="p">${md(it.spoken)}</span></div></div><div class="wvi">${esc(it.vi)}</div>`, 930, t0 + .25, t1 - .05);
      fadeIn(c, t0 + .3, 16);
      out(c, t1 - .25);
      vo(t0 + .3, `${it.zh}: ${it.spoken.replace(/\*/g, '')}`);
    });
  }
  if (b.type === 'half') {
    header(b, t, te);
    const gw = 760, gh = 330, f = uid('hf'), h = uid('hh');
    const gsel = box(`${graph(gw, gh, [{ id: f, pts: b.full, color: '#8a8a8a' }, { id: h, pts: b.half, color: Y, width: 13 }], { axis: true })}<div class="leg"><span style="color:#aaa">— đọc đủ 2 → 1 → 4</span><span style="color:${Y}">— nửa thanh 3: 2 → 1</span></div>`, 160, 470, gw, t + .3, te - .05);
    fadeIn(gsel, t + .35, 18);
    draw(`#${f}`, t + .6, .8);
    draw(`#${h}`, t + 1.6, .7);
    out(gsel, te - .3);
    const N = b.items.length, d = (b.dur - 3.4) / N;
    b.items.forEach((it, i) => {
      const t0 = t + 2.6 + i * d, t1 = t0 + d;
      tiles(it.zh, t0, t1 - .3, -.55, { scale: .7, spacing: .78, enter: i % 2 ? 'flip' : 'drop', dir: i % 2 ? -1 : 1 });
      const c = st(`<div class="hpy">${esc(it.py)}</div><div class="wvi">${esc(it.vi)}</div>`, 1310, t0 + .2, t1 - .05);
      fadeIn(c, t0 + .25, 14);
      out(c, t1 - .25);
      vo(t0 + .25, `${it.zh} ${it.py}`);
    });
    const nt = st(`<div class="note">${md(b.note)}</div>`, 1560, t + 3, te - .05);
    fadeIn(nt, t + 3.1);
    out(nt, te - .3);
  }
  if (b.type === 'use') {
    header(b, t, te);
    tiles('你好', t + .2, te - .35, 2.15, { scale: .62, spacing: .7, enter: 'pop' });
    const u = st(`<div class="useZh">${esc(b.zh)}</div><div class="ws big"><div><span class="k">Viết</span> <span class="p dim">${esc(b.written)}</span></div><div><span class="k">Đọc</span> <span class="p">${md(b.spoken)}</span></div></div><div class="wvi">${esc(b.vi)}</div>`, 760, t + .5, te - .05);
    fadeIn(u, t + .55);
    out(u, te - .3);
    BURST.push({ t: t + .6, y: 2.2, n: 40 });
    vo(t + .6, `${b.zh} (đọc như lễ tân thật, tươi, rõ)`);
  }
  if (b.type === 'cta') {
    set('#dark', '{ opacity: 1 }', t);
    const q = st(`<div class="big">${md(b.q)}</div>`, 300, t, DUR);
    ft(q, '{ scale: 1.6, opacity: 0, filter: "blur(10px)" }', '{ scale: 1, opacity: 1, filter: "blur(0px)", duration: .45, ease: "expo.out" }', t + .05);
    G3.push({ chars: '阿宝', t0: t + .5, enter: 'slam', side: 'black', back: 'black', face: { bg: Y, ink: K, ring: 'rgba(0,0,0,.2)' }, y: .55, scale: .9, spacing: .95, stagger: .1, noShadow: true });
    const c1 = st(`<div class="opt"><i>🎮</i><div><b>${esc(b.game[0])}</b><span>${esc(b.game[1])}</span></div></div>`, 1150, t + 1.2, DUR);
    ft(c1, '{ x: -400, opacity: 0 }', '{ x: 0, opacity: 1, duration: .45, ease: "expo.out" }', t + 1.2);
    const c2 = st(`<div class="opt"><i>💬</i><div><b>${esc(b.online[0])}</b><span>${esc(b.online[1])}</span></div></div>`, 1330, t + 1.7, DUR);
    ft(c2, '{ x: 400, opacity: 0 }', '{ x: 0, opacity: 1, duration: .45, ease: "expo.out" }', t + 1.7);
    const pl = st(`<div class="pill">Link game + nhóm Zalo ở bio 👆</div>`, 1560, t + 2.4, DUR);
    ft(pl, '{ scale: .7, opacity: 0 }', '{ scale: 1, opacity: 1, duration: .4, ease: "back.out(2)" }', t + 2.4);
  }
  t = te;
}

/* ---------- trang ---------- */
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
#bg{background:radial-gradient(80% 50% at 50% 32%,#2b260f 0%,#15140b 50%,#070707 100%)}
#bgrid{opacity:.5;background-image:linear-gradient(rgba(252,224,41,.07) 2px,transparent 2px),linear-gradient(90deg,rgba(252,224,41,.07) 2px,transparent 2px);background-size:90px 90px;mask-image:radial-gradient(70% 55% at 50% 40%,#000 30%,transparent 80%)}
#dark{opacity:0;background:radial-gradient(90% 60% at 50% 40%,#2a2410 0%,#121108 55%,#050505 100%)}
#gl{position:absolute;inset:0;width:1080px;height:1920px}
#grain{opacity:.09;mix-blend-mode:overlay;background:url(grain.png);background-size:256px 256px}
#flash{background:${W};opacity:0}
.st{position:absolute;left:0;right:0;display:flex;justify-content:center;pointer-events:none;padding:0 60px}
.st .in{transform-origin:50% 60%;width:100%;display:flex;flex-direction:column;align-items:center}
.st.l .in{align-items:flex-start;transform-origin:0 50%}
.st.r .in{align-items:flex-end;transform-origin:100% 50%}
.bx{position:absolute;display:flex;flex-direction:column;align-items:center}
.stamp,.tag{font:900 30px ${FV};letter-spacing:.06em;color:${K};background:${Y};padding:7px 16px;border-radius:6px;box-shadow:0 8px 24px rgba(0,0,0,.45)}
.cnt{font:900 32px ${FV};color:${Y};border:4px solid ${Y};padding:3px 18px;border-radius:999px}
.hk{font:900 64px/1.15 ${FV};text-align:center;text-wrap:balance;color:#fff;letter-spacing:-.02em}
.ttl{font:800 54px/1.18 ${FV};text-align:center;text-wrap:balance;color:#fff;letter-spacing:-.015em}
mark{background:${Y};color:${K};padding:0 .12em;border-radius:6px;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.pyBig{font:800 96px ${FM};color:${Y};letter-spacing:.02em}
.pyBig .s1{position:relative;--strike:0}
.pyBig .s1::after{content:"";position:absolute;left:-6%;top:52%;height:12px;width:calc(112% * var(--strike));background:#ff3b3b;border-radius:6px;transform:rotate(-8deg)}
.ask{font:900 60px/1.2 ${FV};text-align:center;color:#fff}
.lab{font:800 30px ${FM};margin-top:6px}
.gpy{font:800 46px ${FM};color:#fff;margin-top:2px}
.gvi{font:700 32px ${FV};color:#cfcfcf;margin-top:2px;text-align:center}
.ax{font:700 22px ${FM};fill:rgba(255,255,255,.5)}
.note{font:800 44px/1.25 ${FV};color:#fff;text-align:center;text-wrap:balance;background:rgba(252,224,41,.07);border:3px solid rgba(252,224,41,.45);border-radius:22px;padding:18px 26px}
.formula{font:900 110px ${FV};color:#fff;letter-spacing:-.02em}
.ws{display:flex;flex-direction:column;gap:6px;align-items:flex-start}
.ws .k{display:inline-block;width:150px;font:800 36px ${FV};color:#9a9a9a}
.ws .p{font:800 60px ${FM};color:${Y}}
.ws .p.dim{color:#9a9a9a;text-decoration:none}
.ws.big .p{font-size:46px}
.wcnt{font:900 30px ${FV};color:${K};background:${Y};padding:3px 16px;border-radius:999px;margin-bottom:22px}
.wvi{font:700 44px ${FV};color:#eee;margin-top:16px;text-align:center}
.hpy{font:800 64px ${FM};color:${Y}}
.leg{display:flex;gap:36px;font:700 30px ${FV};margin-top:8px}
.useZh{font:400 86px ${FZ};color:#fff;margin-bottom:28px}
.big{font:900 92px/1.05 ${FV};letter-spacing:-.03em;text-align:center;color:#fff;text-wrap:balance}
.opt{display:flex;align-items:center;gap:26px;width:900px;background:rgba(255,255,255,.06);border:4px solid ${Y};border-radius:26px;padding:22px 30px}
.opt i{font-style:normal;font-size:80px;font-family:'Noto Color Emoji'}
.opt b{display:block;font:900 50px/1.1 ${FV};color:${Y}}
.opt span{display:block;font:700 34px/1.25 ${FV};color:#eee;margin-top:6px}
.pill{display:inline-block;white-space:nowrap;font:900 44px ${FV};color:${K};background:${Y};padding:16px 38px;border-radius:999px;border:6px solid ${K};box-shadow:0 10px 0 ${K}}
`;
const glyphs = [...new Set(G3.map(g => g.chars).join(''))].join('');
const scene = { dur: DUR, groups: G3, cam: [{ t: 0, p: [0, 0, 13], l: [0, 0, 0] }, { t: DUR, p: [0, 0, 13], l: [0, 0, 0] }], bursts: BURST, rings: RING, glyphs };
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
  <div class="layer" id="bg"></div>
  <div class="layer" id="bgrid"></div>
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
tl.fromTo("#grain", { backgroundPosition: "0px 0px" }, { backgroundPosition: "${256 * 41}px ${256 * 29}px", duration: ${DUR}, ease: "steps(${Math.round(DUR * 30)})" }, 0);
tl.fromTo("#bgrid", { backgroundPosition: "0px 0px" }, { backgroundPosition: "0px 540px", duration: ${DUR}, ease: "none" }, 0);
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
if (!fs.existsSync(path.join(OUTDIR, 'grain.png'))) execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=gray:s=256x256,noise=alls=90:allf=u', '-frames:v', '1', path.join(OUTDIR, 'grain.png')]);
execFileSync('python3', [path.join(V, 'series/music_bed.py'), path.join(OUTDIR, 'music.wav'), String(DUR), marks.map(x => x.toFixed(2)).join(',')], { stdio: 'ignore' });
fs.writeFileSync(path.join(OUTDIR, 'vo.md'), `# Lồng tiếng ${EP.id} (Bảo đọc mẫu, ghi âm điện thoại, ghép trong CapCut)\n\n| Mốc | Đọc |\n|---|---|\n${VO.join('\n')}\n`);
console.log('Đã sinh', OUTDIR, DUR + 's');
