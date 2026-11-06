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
const tiles = (chars, t0, t1, y, o = {}) => {
  const nc = [...chars].length;
  const sc = o.scale ?? (nc >= 4 ? .66 : nc === 3 ? .72 : nc === 2 ? .78 : .82), sp = o.spacing ?? (nc >= 4 ? .7 : nc === 3 ? .78 : .84);
  G3.push({ chars, t0, t1, enter: o.enter || 'slam', exit: o.exit || 'knock', exitDir: o.dir || 1, side: 'black', back: 'black', face: { bg: Y, ink: K, ring: 'rgba(0,0,0,.2)' }, y, scale: sc, spacing: sp, stagger: o.stagger ?? .09, noShadow: true });
  return sp;
};

/* đường cao độ: pts là mức 1–5 cách đều, hoặc cặp [x 0–1, mức]. Trả về đường SVG + điểm mẫu đều theo độ dài (để chấm sáng chạy) */
function curve(pts, w, h, pad = 22) {
  const P = pts.map((p, i) => {
    const [x, L] = Array.isArray(p) ? p : [pts.length === 1 ? .5 : i / (pts.length - 1), p];
    return [pad + (w - 2 * pad) * x, pad + (5 - L) / 4 * (h - 2 * pad)];
  });
  const segs = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
    const straight = P.length === 2;
    const c1 = straight ? p1 : [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = straight ? p2 : [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    segs.push([p1, c1, c2, p2]);
  }
  const f = v => v.toFixed(1);
  const d = `M${f(P[0][0])},${f(P[0][1])}` + segs.map(([, c1, c2, p2]) => ` C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`).join('');
  const raw = [];
  segs.forEach(([a, b, c, e]) => { for (let k = 0; k <= 40; k++) { const s = k / 40, m = 1 - s; raw.push([m * m * m * a[0] + 3 * m * m * s * b[0] + 3 * m * s * s * c[0] + s * s * s * e[0], m * m * m * a[1] + 3 * m * m * s * b[1] + 3 * m * s * s * c[1] + s * s * s * e[1]]); } });
  const cum = [0]; for (let i = 1; i < raw.length; i++) cum.push(cum[i - 1] + Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]));
  const L = cum[cum.length - 1], S = [];
  for (let k = 0, j = 0; k <= 24; k++) { const want = L * k / 24; while (j < cum.length - 2 && cum[j + 1] < want) j++; const u = (want - cum[j]) / ((cum[j + 1] - cum[j]) || 1); S.push([raw[j][0] + (raw[j + 1][0] - raw[j][0]) * u, raw[j][1] + (raw[j + 1][1] - raw[j][1]) * u]); }
  return { d, S };
}
/* khung biểu đồ: 5 vạch mức; mỗi đường có id riêng (vẽ dần) và chấm sáng `${id}d` chạy theo */
const SAMPLES = {};
function graph(w, h, lines, opt = {}) {
  const pad = 22;
  let g = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" overflow="visible">`;
  for (let L = 1; L <= 5; L++) {
    const y = pad + (5 - L) / 4 * (h - 2 * pad);
    g += `<line x1="${pad}" x2="${w - pad}" y1="${y}" y2="${y}" stroke="rgba(255,255,255,${L === 1 || L === 5 ? .28 : .13})" stroke-width="2" stroke-dasharray="${L === 1 || L === 5 ? '0' : '6 8'}"/>`;
    if (opt.axis) g += `<text x="-6" y="${y + 7}" class="ax" text-anchor="end">${L}</text>`;
  }
  (opt.split || []).forEach(x => { g += `<line x1="${pad + (w - 2 * pad) * x}" x2="${pad + (w - 2 * pad) * x}" y1="${pad - 10}" y2="${h - pad + 10}" stroke="rgba(255,255,255,.35)" stroke-width="2" stroke-dasharray="4 8"/>`; });
  (opt.labels || []).forEach(([x, s]) => { g += `<text x="${pad + (w - 2 * pad) * x}" y="${h + 42}" class="glab" text-anchor="middle">${esc(s)}</text>`; });
  lines.forEach(l => {
    const { d, S } = curve(l.pts, w, h, pad); SAMPLES[l.id] = S;
    g += `<path id="${l.id}" d="${d}" pathLength="1" fill="none" stroke="${l.color}" stroke-width="${l.width || 11}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1" style="stroke-dashoffset:1"/>`;
    if (l.dot !== false) g += `<circle id="${l.id}d" cx="${S[0][0].toFixed(1)}" cy="${S[0][1].toFixed(1)}" r="${l.r || 15}" fill="#fff" stroke="${l.color}" stroke-width="6" style="opacity:0;filter:drop-shadow(0 0 14px ${l.color})"/>`;
  });
  return g + '</svg>';
}
/* vẽ đường đều tay + chấm sáng chạy đúng theo đường */
function trace(id, t, d = .9, keepDot = true) {
  ft(`#${id}`, '{ strokeDashoffset: 1 }', `{ strokeDashoffset: 0, duration: ${d}, ease: "none", immediateRender: false }`, t);
  const S = SAMPLES[id]; if (!S) return;
  set(`#${id}d`, '{ opacity: 1 }', t);
  const kf = S.slice(1).map(p => `{ attr: { cx: ${p[0].toFixed(1)}, cy: ${p[1].toFixed(1)} }, duration: ${r2(d / (S.length - 1))}, ease: "none" }`).join(', ');
  to(`#${id}d`, `{ keyframes: [${kf}] }`, t);
  if (!keepDot) to(`#${id}d`, '{ opacity: 0, duration: .2 }', t + d + .15);
}
const header = (b, t, te) => {
  const tg = st(`<div class="tag">${esc(b.tag)}</div>`, 140, t, te - .05, '', 'l');
  ft(tg, '{ rotationX: -90, opacity: 0, transformPerspective: 800 }', '{ rotationX: 0, rotation: -1.5, opacity: 1, duration: .35, ease: "back.out(2)" }', t + .02);
  st(`<div class="cnt">${esc(EP.level)}</div>`, 136, t, te - .05, '', 'r');
  if (b.title) { const ti = st(`<div class="ttl">${md(b.title)}</div>`, 236, t + .05, te - .05); fadeIn(ti, t + .1); out(ti, te - .3); }
  out(tg, te - .3);
};
const vo = (t, text) => VO.push(`| ${t.toFixed(1)} s | ${text} |`);
const wsRows = (written, spoken, cls = '') => `<div class="ws ${cls}"><div><span class="k">Viết</span> <span class="p dim">${esc(written)}</span></div><div><span class="k">Đọc</span> <span class="p">${md(spoken)}</span></div></div>`;
const pulse = (s, t) => ft(s, '{ scale: 1 }', '{ scale: 1.22, duration: .16, yoyo: true, repeat: 3, ease: "power1.inOut", immediateRender: false }', t);

/* thanh chương: mỗi phần có thẻ (tag) là một chương, ô sáng dần theo thời gian */
const CH = []; { let tt = 0; for (const b of EP.beats) { if (b.tag) CH.push([tt, b.dur]); tt += b.dur; } }
if (CH.length) {
  const c0 = CH[0][0], c1 = CH[CH.length - 1][0] + CH[CH.length - 1][1];
  const id = uid('bar');
  H.push(`<div class="bar clip" id="${id}" data-start="${r2(c0)}" data-duration="${r2(c1 - c0)}">${CH.map((_, i) => `<div class="seg"><i id="${id}_${i}"></i></div>`).join('')}</div>`);
  CH.forEach(([a, d], i) => ft(`#${id}_${i}`, '{ scaleX: 0 }', `{ scaleX: 1, duration: ${r2(d)}, ease: "none", immediateRender: false }`, a));
  ft(`#${id}`, '{ opacity: 0, y: -20 }', '{ opacity: 1, y: 0, duration: .3 }', c0);
}

/* ---------- các phần ---------- */
let t = 0;
const marks = [];
for (const b of EP.beats) {
  const te = t + b.dur;
  if (t > 0) { flash(t, .35); marks.push(t); }
  if (b.vo) VO.push(`| ${t.toFixed(1)}–${te.toFixed(1)} s | **Lời dẫn:** ${b.vo} |`);
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
    tiles(b.items.map(i => i.zh).join(''), t + .3, te - .35, 1.42, { scale: .66, spacing: sp, enter: 'drop', stagger: .9 });
    b.items.forEach((it, i) => {
      const cx = tileX(i, N, sp), id = uid('tn');
      const gsel = box(`${graph(gw, gh, [{ id, pts: it.c, color: TONE[i % 4] }])}<div class="lab" style="color:${TONE[i % 4]}">${esc(it.lab)}</div><div class="gpy">${esc(it.py)}</div><div class="gvi">${esc(it.vi)}</div>`, cx - gw / 2, 690, gw, t + .4, te - .05);
      const tt = t + .5 + i * .9;
      fadeIn(gsel, tt, 18);
      trace(id, tt + .2, .75);
      RING.push({ t: tt + .1, x: (cx - 540) / PX, y: 1.42, size: .7, d: .4, color: TONE[i % 4] });
      out(gsel, te - .3);
      vo(tt + .2, `${it.zh} ${it.py}`);
    });
    const nt = st(`<div class="note">${md(b.note)}</div>`, 1300, t + 4.6, te - .05);
    fadeIn(nt, t + 4.7);
    out(nt, te - .3);
  }
  if (b.type === 'morph') {
    header(b, t, te);
    tiles(b.chars, t + .2, te - .35, 1.78, { scale: .8, spacing: .95 });
    const gw = 860, gh = 290, A = uid('fa'), B2 = uid('fb'), Z = uid('fz');
    const [s1, s2] = b.full, xs = (p, a, z) => p.map((L, i) => [a + (z - a) * i / (p.length - 1), L]);
    const gsel = box(graph(gw, gh, [
      { id: A, pts: xs(s1, .03, .45), color: '#9a9a9a' },
      { id: B2, pts: xs(s2, .55, .97), color: TONE[2] },
      { id: Z, pts: xs(b.to, .03, .45), color: Y, width: 13 },
    ], { split: [.5], labels: [[.24, b.labels[0]], [.76, b.labels[1]]] }), 110, 640, gw, t + .6, te - .05);
    fadeIn(gsel, t + .65, 18);
    trace(A, t + 1.0, .8); trace(B2, t + 1.85, .8);
    const bad = st(`<div class="bad">${md(b.bad)}</div>`, 1035, t + 2.75, t + 3.95);
    ft(bad, '{ x: -30, opacity: 0 }', '{ x: 0, opacity: 1, duration: .25, ease: "power2.out" }', t + 2.75);
    ft(`${bad}`, '{ x: -10 }', '{ x: 10, duration: .06, repeat: 5, yoyo: true, ease: "none", immediateRender: false }', t + 3.0);
    out(bad, t + 3.75);
    const tm = t + 4.0;
    to(`#${A}`, '{ opacity: .22, duration: .3 }', tm); to(`#${A}d`, '{ opacity: 0, duration: .2 }', tm);
    trace(Z, tm + .1, .7);
    RING.push({ t: tm + .15, x: (110 + 22 + (gw - 44) * .24 - 540) / PX, y: (960 - 640 - 120) / PX, size: 2, d: .55 });
    const good = st(`<div class="good">${md(b.good)}</div>`, 1035, tm + .9, te - .05);
    fadeIn(good, tm + .9, 14);
    const fo = st(`<div class="formula">${md(b.formula)}</div>`, 1150, tm + 1.7, te - .05);
    ft(fo, '{ scale: 1.5, opacity: 0 }', '{ scale: 1, opacity: 1, duration: .4, ease: "back.out(2)" }', tm + 1.75);
    const ws = st(wsRows(b.written, b.spoken), 1310, tm + 2.8, te - .05);
    fadeIn(ws, tm + 2.85);
    pulse(`${ws} mark`, tm + 3.4);
    const nt = st(`<div class="note">${md(b.note)}</div>`, 1530, tm + 4.3, te - .05);
    fadeIn(nt, tm + 4.35);
    [good, fo, ws, nt].forEach(s => out(s, te - .3));
    vo(t + 1.0, `${b.chars}: đọc đủ hai thanh 3 (nǐ hǎo, cố ý chậm, nghe nặng)`);
    vo(tm + .1, `${b.chars}: đọc đúng ${b.spoken.replace(/\*/g, '')}, chữ đầu đi lên`);
  }
  if (b.type === 'words') {
    header(b, t, te);
    const N = b.items.length, d = (b.dur - .5) / N;
    b.items.forEach((it, i) => {
      const t0 = t + .4 + i * d, t1 = t0 + d, nc = [...it.zh].length;
      const sp = tiles(it.zh, t0, t1 - .3, 1.32, { enter: ['slam', 'drop', 'flip', 'rise'][i % 4], dir: i % 2 ? -1 : 1 });
      it.c.forEach((p, k) => {
        const cx = tileX(k, nc, sp), gw = 170, gh = 120, a = uid('wa'), z = uid('wz');
        const lines = [{ id: a, pts: p, color: k === it.m ? '#9a9a9a' : TONE[2], width: 9, r: 10 }];
        if (k === it.m) lines.push({ id: z, pts: [3, 5], color: Y, width: 10, r: 11 });
        const gsel = box(graph(gw, gh, lines), cx - gw / 2, 790, gw, t0 + .2, t1 - .05);
        fadeIn(gsel, t0 + .2, 10);
        trace(a, t0 + .3, .45, false);
        if (k === it.m) { to(`#${a}`, '{ opacity: .22, duration: .2 }', t0 + .9); trace(z, t0 + .95, .4); }
        out(gsel, t1 - .25);
      });
      const c = st(`<div class="wcnt">${i + 1}/${N}</div>${wsRows(it.written, it.spoken)}<div class="wvi">${esc(it.vi)}</div>`, 960, t0 + .35, t1 - .05);
      fadeIn(c, t0 + .4, 16);
      pulse(`${c} mark`, t0 + 1.1);
      out(c, t1 - .25);
      vo(t0 + .4, `${it.zh}: ${it.spoken.replace(/\*/g, '')}`);
    });
  }
  if (b.type === 'half') {
    header(b, t, te);
    const gw = 760, gh = 330, f = uid('hf'), h = uid('hh');
    const gsel = box(`${graph(gw, gh, [{ id: f, pts: b.full, color: '#9a9a9a' }, { id: h, pts: b.half, color: Y, width: 13 }], { axis: true })}<div class="leg"><span style="color:#aaa">— đọc đủ 2 → 1 → 4</span><span style="color:${Y}">— nửa thanh 3: 2 → 1</span></div>`, 160, 470, gw, t + .3, te - .05);
    fadeIn(gsel, t + .35, 18);
    trace(f, t + .6, .8);
    to(`#${f}`, '{ opacity: .3, duration: .3 }', t + 1.5); to(`#${f}d`, '{ opacity: 0, duration: .2 }', t + 1.5);
    trace(h, t + 1.6, .7);
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
    ft(`${nt} mark`, '{ x: -4, skewX: -12 }', '{ x: 4, skewX: 12, duration: .05, repeat: 9, yoyo: true, ease: "steps(1)", immediateRender: false }', t + 3.6);
    out(nt, te - .3);
  }
  if (b.type === 'quiz') {
    header(b, t, te);
    tiles(b.zh, t + .2, te - .35, 1.45, { scale: .95, spacing: 1.05, enter: 'flip' });
    const q = st(`<div class="qz">${md(b.ask)}</div>`, 840, t + .4, te - .05);
    fadeIn(q, t + .45);
    ['3', '2', '1'].forEach((n, k) => {
      const c = st(`<div class="cd">${n}</div>`, 1060, t + 1.2 + k * .5, t + 1.2 + k * .5 + .48);
      ft(c, '{ scale: 2.2, opacity: 0 }', '{ scale: 1, opacity: 1, duration: .2, ease: "power3.out" }', t + 1.2 + k * .5);
    });
    const tr = t + 2.75;
    const a = st(`<div class="ans">${md(b.spoken)}</div><div class="wvi">${esc(b.vi)}</div><div class="qrule">${md(b.rule)}</div>`, 1040, tr, te - .05);
    ft(a, '{ scale: 1.8, opacity: 0, filter: "blur(10px)" }', '{ scale: 1, opacity: 1, filter: "blur(0px)", duration: .35, ease: "back.out(1.6)" }', tr);
    BURST.push({ t: tr, y: -.6, n: 60 }); RING.push({ t: tr, y: -.5, size: 4 });
    flash(tr, .3);
    [q, a].forEach(s => out(s, te - .3));
    vo(tr, `${b.zh}: ${b.spoken.replace(/\*/g, '')}`);
  }
  if (b.type === 'use') {
    header(b, t, te);
    tiles('你好', t + .2, te - .35, 2.15, { scale: .62, spacing: .7, enter: 'pop' });
    const u = st(`<div class="useZh">${esc(b.zh)}</div>${wsRows(b.written, b.spoken, 'big')}<div class="wvi">${esc(b.vi)}</div>`, 760, t + .5, te - .05);
    fadeIn(u, t + .55);
    pulse(`${u} mark`, t + 1.4);
    out(u, te - .3);
    BURST.push({ t: t + .6, y: 2.2, n: 40 });
    vo(t + .6, `${b.zh} (đọc như lễ tân thật, tươi, rõ)`);
  }
  if (b.type === 'cta') {
    set('#dark', '{ opacity: 1 }', t);
    const q = st(`<div class="big">${md(b.q)}</div>`, 300, t, DUR);
    ft(q, '{ scale: 1.6, opacity: 0, filter: "blur(10px)" }', '{ scale: 1, opacity: 1, filter: "blur(0px)", duration: .45, ease: "expo.out" }', t + .05);
    G3.push({ chars: '阿宝', t0: t + .5, enter: 'slam', side: 'black', back: 'black', face: { bg: Y, ink: K, ring: 'rgba(0,0,0,.2)' }, y: .55, scale: .9, spacing: .95, stagger: .1, noShadow: true });
    b.cards.forEach(([ic, ti, sub], k) => {
      const c = st(`<div class="opt"><i>${ic}</i><div><b>${esc(ti)}</b><span>${md(sub)}</span></div></div>`, 1150 + k * 180, t + 1.2 + k * .5, DUR);
      ft(c, `{ x: ${k % 2 ? 400 : -400}, opacity: 0 }`, '{ x: 0, opacity: 1, duration: .45, ease: "expo.out" }', t + 1.2 + k * .5);
    });
    const pl = st(`<div class="pill">${esc(b.pill)}</div>`, 1560, t + 2.4, DUR);
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
.bar{position:absolute;left:60px;right:60px;top:96px;height:12px;display:flex;gap:10px}
.bar .seg{flex:1;background:rgba(255,255,255,.16);border-radius:6px;overflow:hidden}
.bar .seg i{display:block;height:100%;background:${Y};transform-origin:0 50%;transform:scaleX(0)}
.glab{font:400 40px ${FZ};fill:#fff}
.bad{font:900 50px/1.2 ${FV};color:#ff6b6b;text-align:center}
.good{font:900 50px/1.2 ${FV};color:#fff;text-align:center;text-wrap:balance}
.ws .p mark{display:inline-block}
.note mark{display:inline-block}
.qz{font:800 52px/1.25 ${FV};color:#fff;text-align:center;text-wrap:balance}
.cd{font:900 200px ${FV};color:${Y};text-shadow:0 0 40px rgba(252,224,41,.5)}
.ans{font:800 120px ${FM};color:${Y}}
.ans mark{display:inline-block}
.qrule{font:800 40px ${FV};color:#fff;margin-top:18px;background:rgba(252,224,41,.08);border:3px solid rgba(252,224,41,.45);border-radius:18px;padding:10px 22px}
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
