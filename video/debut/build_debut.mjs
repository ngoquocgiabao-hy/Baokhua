// Trailer debut "BẢO KHỰA 阿宝" – 9:16, 46 s, 120 BPM. Tông vàng Minion + đen.
//   node debut/build_debut.mjs                → out/debut/index.html (+ tài nguyên)
//   node debut/build_debut.mjs --evergreen    → bản không ghi ngày (dùng lâu dài)
// Mọi dữ kiện về Bảo lấy từ trang chủ index_1.html (đã công khai); số liệu game lấy từ khachsan.html.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const V = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(V, '..');
const EVER = process.argv.includes('--evergreen');
const OUTDIR = path.join(V, 'out', EVER ? 'debut-evergreen' : 'debut');
const DUR = 46;

const Y = '#FCE029', K = '#0B0B0C', W = '#FFFBEA';
const FV = "'Inter Display','Inter',sans-serif", FZ = "'WenQuanYi Zen Hei',sans-serif", FM = "'JetBrains Mono',monospace";
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const r2 = x => +(+x).toFixed(3);

/* ---------- bộ ghi ---------- */
const H = [], TL = [], G3 = [], CAM = [], BURST = [], RING = [];
let n = 0;
const uid = p => `${p}${++n}`;
const to = (sel, v, t) => TL.push(`tl.to(${JSON.stringify(sel)}, ${v}, ${r2(t)});`);
const ft = (sel, a, b, t) => TL.push(`tl.fromTo(${JSON.stringify(sel)}, ${a}, ${b}, ${r2(t)});`);
const set = (sel, v, t) => TL.push(`tl.set(${JSON.stringify(sel)}, ${v}, ${r2(t)});`);
const raw = s => TL.push(s);
// sticker có hẹn giờ: vỏ .clip giữ thời gian, ruột .in mới chuyển động
function st(inner, top, t0, t1, style = '') { const id = uid('s'); H.push(`<div class="st clip" id="${id}" style="top:${top}px;${style}" data-start="${r2(t0)}" data-duration="${r2(t1 - t0)}"><div class="in">${inner}</div></div>`); return `#${id} .in`; }
const cam = (t, p, l = [0, 0, 0], extra = {}) => CAM.push({ t: r2(t), p, l, ...extra });
const shake = (t, amt = 18) => ft('#cam', `{ x: ${-amt}, y: ${amt * .6}, rotation: ${amt / 40} }`, `{ x: 0, y: 0, rotation: 0, duration: .45, ease: "elastic.out(1, 0.25)", immediateRender: false }`, t);
const flash = (t, color = W, a = .9) => { set('#flash', `{ backgroundColor: "${color}" }`, t); ft('#flash', `{ opacity: ${a} }`, `{ opacity: 0, duration: .28, ease: "power2.out", immediateRender: false }`, t); };
// chữ từng từ hiện ra (mờ → nét, không trượt)
function words(text, top, t, cls = 'big', t1 = DUR, gap = .07, style = '') {
  const ids = [];
  // hỗ trợ <mark>…</mark> trong câu: tô từng từ bên trong
  const toks = []; text.split(/(<mark[^>]*>.*?<\/mark>)/).forEach(seg => { const m = seg.match(/^<mark([^>]*)>(.*)<\/mark>$/); (m ? m[2] : seg).split(' ').filter(Boolean).forEach(w => toks.push(m ? `<mark${m[1]}>${w}</mark>` : w)); });
  const html = toks.map(w => { const id = uid('w'); ids.push(id); return `<span class="w" id="${id}">${w}</span>`; }).join(' ');
  const sel = st(`<div class="${cls}">${html}</div>`, top, t - .01, t1, style);
  ids.forEach((id, k) => ft(`#${id}`, '{ opacity: 0, filter: "blur(8px)" }', '{ opacity: 1, filter: "blur(0px)", duration: .13 }', t + k * gap));
  return sel;
}
// chữ từng chữ cái rơi xuống
function letters(text, top, t, cls, t1 = DUR, gap = .04) {
  const ids = [];
  const html = [...text].map(ch => { if (ch === ' ') return '<span class="sp"> </span>'; const id = uid('l'); ids.push(id); return `<span class="lt" id="${id}">${esc(ch)}</span>`; }).join('');
  const sel = st(`<div class="${cls}">${html}</div>`, top, t - .01, t1);
  ids.forEach((id, k) => ft(`#${id}`, `{ y: -180, rotation: ${k % 2 ? 14 : -14}, opacity: 0 }`, '{ y: 0, rotation: 0, opacity: 1, duration: .42, ease: "back.out(2.2)" }', t + k * gap));
  return sel;
}
const out = (sel, t, how = 'blur') => how === 'blur' ? to(sel, '{ opacity: 0, filter: "blur(10px)", duration: .18 }', t) : to(sel, `{ x: ${how}, opacity: 0, filter: "blur(10px)", duration: .22, ease: "power3.in" }`, t);
const pop = (sel, t, from = 1.8, rot = -6) => ft(sel, `{ scale: ${from}, rotation: ${rot * 2}, opacity: 0 }`, `{ scale: 1, rotation: ${rot}, opacity: 1, duration: .32, ease: "power4.out" }`, t);
const flipIn = (sel, t) => ft(sel, '{ rotationX: -100, opacity: 0, transformPerspective: 900 }', '{ rotationX: 0, opacity: 1, duration: .5, ease: "back.out(1.7)" }', t);
const tapeY = (txt, size = 64) => `<div class="tape"><span style="font-size:${size}px">${txt}</span></div>`;
const tapeK = (txt, size = 64) => `<div class="tapek"><span style="font-size:${size}px">${txt}</span></div>`;
// số cuộn kiểu máy đánh bạc (chỉ dùng chuyển động, không dùng callback)
function odo(value, t, dur = .6) {
  return String(value).split('').map((d, i) => { const id = uid('od'); ft(`#${id}`, '{ yPercent: 0 }', `{ yPercent: ${-(10 + +d) * 5}, duration: ${dur + i * .12}, ease: "power3.out", immediateRender: false }`, t); return `<span class="odc"><span class="ods" id="${id}">${'0123456789'.repeat(2).split('').join('<br>')}</span></span>`; }).join('');
}

/* ================= KỊCH BẢN ================= */

/* 0–4: MỒI */
set('#bgY', '{ clipPath: "circle(0% at 50% 45%)" }', 0);
const rec = st(`<div class="mono rec"><i></i>REC&nbsp;&nbsp;POV: ca sáng · quầy lễ tân</div>`, 150, 0, 3.95, 'justify-content:flex-start;padding-left:70px');
ft(rec, '{ opacity: 0 }', '{ opacity: 1, duration: .1 }', .05);
const h1 = words('Khách Trung đứng trước mặt.', 330, .35, 'big w100', 3.95, .09);
const bub = st(`<div class="bubble"><div class="zh">请出示一下您的护照。</div><div class="py">Qǐng chūshì yíxià nín de hùzhào.</div><div class="vi">(Anh chị cho em xem hộ chiếu ạ.)</div></div>`, 600, 1.4, 3.95);
ft(bub, '{ scale: .2, rotation: -8, opacity: 0, transformOrigin: "20% 100%" }', '{ scale: 1, rotation: -2, opacity: 1, duration: .45, ease: "elastic.out(1, 0.55)" }', 1.45);
const ld = st(`<div class="load"><div class="mono lt1">Não đang tải tiếng Trung…</div><div class="bar"><b id="ldfill"></b></div><div class="mono pct">${odo(3, 2.1, .5)}%</div></div>`, 960, 2.0, 3.95);
ft(ld, '{ opacity: 0, y: 30 }', '{ opacity: 1, y: 0, duration: .2 }', 2.0);
ft('#ldfill', '{ width: "0%" }', '{ width: "3%", duration: .5, ease: "power2.out" }', 2.1);
// nhiễu sóng đúng tiếng "glitch" của nhạc
[2.05, 3.05].forEach(t => { ft('#cam', '{ x: 16, filter: "contrast(1.6) hue-rotate(20deg)" }', '{ x: 0, filter: "contrast(1) hue-rotate(0deg)", duration: .12, ease: "steps(3)", immediateRender: false }', t); });
const freeze = words('…đứng hình.', 1240, 3.1, 'big w110 dim', 3.95, .12);
ft('#cam', '{ scale: 1 }', '{ scale: 1.07, duration: .8, ease: "power2.in", immediateRender: false }', 3.1);
to('#cam', '{ filter: "grayscale(1) brightness(.7)", duration: .3 }', 3.25);
set('#blk', '{ opacity: 1 }', 3.9);
set('#cam', '{ scale: 1, filter: "none" }', 3.99);
set('#blk', '{ opacity: 0 }', 4.0);

/* 4–6: BÙNG NỔ – màu vàng tràn, quân 阿宝 đập xuống */
to('#bgY', '{ clipPath: "circle(120% at 50% 45%)", duration: .32, ease: "power3.out" }', 4.0);
ft('#speed', '{ opacity: 0, scale: 1.6 }', '{ opacity: .7, scale: 1, duration: .25 }', 4.0);
ft('#speedr', '{ rotation: 0 }', '{ rotation: 30, duration: 2, ease: "none" }', 4.0);
to('#speed', '{ opacity: 0, duration: .3 }', 5.6);
shake(4.0, 26); flash(4.0, W, .8);
cam(0, [0, 0, 10]);
G3.push({ chars: '阿宝', t0: 4.0, enter: 'slam', t1: 5.72, exit: 'knock', exitDir: -1, side: 'black', back: 'black', face: { bg: Y, ink: K, ring: 'rgba(0,0,0,.25)' }, y: 1.15, scale: 1.25, stagger: .09, noShadow: true });
RING.push({ t: 4.02, y: 1.15, size: 7, color: K, d: .7 });
BURST.push({ t: 4.05, x: 0, y: 1.2, z: .5, n: 70, colors: [K, W, '#C9A800', K] });
const ab = st(`<div class="mono pyk">阿宝 · Ā Bǎo</div>`, 790, 4.1, 5.75);
ft(ab, '{ opacity: 0 }', '{ opacity: 1, duration: .2 }', 4.4);
const thoi = st(tapeY('Thôi, khỏi đứng hình.', 70), 150, 4.0, 5.75);
pop(thoi, 4.0, 1.6, -2);
const bk = letters('BẢO KHỰA', 880, 4.55, 'mega k');
const tg = st(tapeK('Tiếng Trung <u>để đi làm</u>.', 70), 1110, 4.5, 5.75);
pop(tg, 5.05, 1.7, -3);
[thoi, ab, tg].forEach(s => out(s, 5.72));
to(bk, '{ y: -260, opacity: 0, filter: "blur(10px)", duration: .22, ease: "power3.in" }', 5.72);
// chuyển: sọc cảnh báo quét chéo, dưới nó là nền đen
ft('#haz', '{ xPercent: -130 }', '{ xPercent: 130, duration: .55, ease: "power2.inOut", immediateRender: false }', 5.6);
set('#bgY', '{ clipPath: "circle(0% at 50% 45%)" }', 5.86);
set('#dots', '{ opacity: .55 }', 5.86);

/* 6–14: AI DẠY? – 5 thẻ lý lịch xếp chồng như bộ bài */
const who = words('Ai dạy? 👀', 150, 6.0, 'mono h2', 11.5);
const who2 = words('Người thật. Nghề thật.', 225, 6.15, 'big w80', 11.5, .08);
const CARDS = [
  { a: '5 NĂM', b: 'sống & đi làm ở Trung Quốc', bg: Y, c: K },
  { a: 'RESORT 5★', b: 'quản lý tiếp đón · Senbo Resort', bg: K, c: Y, ring: Y },
  { a: 'TCL', b: 'kỹ sư chất lượng (QE)', bg: Y, c: K, stripes: K },
  { a: 'Á QUÂN 2025', b: 'Đại sứ Du lịch Trung – Việt', bg: K, c: Y, stripes: Y },
  { a: 'THẺ HDV QUỐC TẾ', b: '+ chứng chỉ sư phạm', bg: Y, c: K, ring: K },
];
const cardT = [6.5, 7.5, 8.5, 9.5, 10.5];
CARDS.forEach((c, i) => {
  G3.push({ kind: 'panel', w: 2.55, h: 1.5, d: .14, t0: cardT[i], enter: 'flipY', t1: 11.45, exit: 'knock', exitDir: i % 2 ? 1 : -1, side: c.bg === Y ? 'minion' : 'black', back: c.bg === Y ? 'black' : 'minion', y: -.15,
    push: cardT.slice(i + 1), pushY: .3, pushZ: .7, rot: [0, 0, i % 2 ? .035 : -.035], noShadow: true,
    panel: { bg: c.bg, stripes: c.stripes, ring: c.ring, lines: [{ t: c.a, s: c.a.length > 10 ? 150 : 210, y: .43, c: c.c }, { t: c.b, s: 64, w: 800, y: .78, c: c.c }] } });
  BURST.push({ t: cardT[i] + .12, x: 0, y: .3, z: .6, n: 26, colors: [Y, W, Y, '#C9A800'] });
});
cam(5.9, [-1.3, .7, 11.2], [0, -.15, 0], { cut: true });
cam(11.4, [1.2, .1, 10], [0, -.15, 0]);
[who, who2].forEach(s => out(s, 11.4));
// câu của Bảo (nguyên văn trên trang chủ)
const q1 = words('“Tiếng Trung đã cho mình <mark>một cái nghề.</mark>', 560, 11.75, 'big w90 quote', 13.9, .08);
const q2 = words('Giờ mình chỉ lại cho bạn.”', 900, 12.55, 'big w90 quote', 13.9, .08);
const q3 = st(`<div class="mono sig">— Bảo · 阿宝 (Ā Bǎo)</div>`, 1130, 13.1, 13.9);
ft(q3, '{ opacity: 0, x: -40 }', '{ opacity: 1, x: 0, duration: .3, ease: "expo.out" }', 13.15);
[q1, q2, q3].forEach(s => out(s, 13.82));

/* 14–22: CHƠI GAME – khách sạn 1★ → 5★, điện thoại 3D, số đếm */
set('#dots', '{ opacity: 0 }', 13.95);
const hk = words('Học kiểu gì?', 300, 14.0, 'big w100', 15.0);
const hg = st(`<div class="mega y" style="font-size:150px">CHƠI GAME.</div>`, 470, 14.45, 15.0);
pop(hg, 14.5, 2.2, -3); shake(14.5, 16);
[hk, hg].forEach(s => out(s, 14.93));
// sân khấu game: mở bằng vòng tròn từ tâm (iris)
set('#stage', '{ opacity: 1, clipPath: "circle(0% at 50% 50%)" }', 14.95);
to('#stage', '{ clipPath: "circle(110% at 50% 50%)", duration: .3, ease: "power3.out" }', 15.0);
ft('#plate', '{ scale: 1.45, rotationX: 18, y: 160 }', '{ scale: 1.08, rotationX: 0, y: 0, duration: 1, ease: "power2.out", immediateRender: false }', 15.0);
const t1s = st(tapeK('Nhận khách sạn <b>1★</b> · 3 phòng', 62), 1240, 15.0, 16.0);
pop(t1s, 15.2, 1.6, -3);
out(t1s, 15.92, -400);
set('#pv1', '{ opacity: 1 }', 16.0); flash(16.0, Y, .7); shake(16.0, 14);
ft('#plate', '{ scale: 1.3 }', '{ scale: 1.08, duration: .6, ease: "expo.out", immediateRender: false }', 16.0);
G3.push({ chars: '★★★★★', t0: 16.0, enter: 'drop', t1: 17.85, exit: 'spin', side: 'minion', back: 'black', face: { bg: K, ink: Y, ring: 'rgba(252,224,41,.4)', font: '400 330px "DejaVu Sans"' }, y: 1.9, spacing: .62, scale: .66, stagger: .25 });
const t5 = words('Trả lời khách bằng tiếng Trung → lên <mark>5★</mark>', 1180, 16.3, 'big w80 shadow', 17.9, .07);
out(t5, 17.85);
// thu thành điện thoại 3D, số đếm bên dưới
to('#plate', '{ scale: .47, y: -400, rotationY: -14, rotationX: 6, borderRadius: 110, boxShadow: "0 0 0 16px #FCE029, 0 0 0 26px #0B0B0C, 0 70px 90px rgba(0,0,0,.6)", duration: .7, ease: "power3.inOut" }', 17.95);
set('#plate', '{ boxShadow: "0 0 0 0px #FCE029, 0 0 0 0px #0B0B0C, 0 0 0 rgba(0,0,0,0)" }', 0);
set('#dots', '{ opacity: .55 }', 17.95);
const nums = [['43', 'từ ngay trên phố · <b>chạm là học</b>'], ['46', 'câu tình huống thật'], ['17', 'công trình để xây']];
nums.forEach(([v, lab], i) => {
  const t = 18.5 + i * .5;
  const s = st(`<div class="stat"><div class="num">${odo(v, t)}</div><div class="lab">${lab}</div></div>`, 1050 + i * 140, t - .01, 21.9);
  ft(s, '{ x: -260, opacity: 0 }', '{ x: 0, opacity: 1, duration: .35, ease: "expo.out" }', t);
  out(s, 21.85);
});
const web = st(`<div class="pill">Chơi luôn trên web · khỏi cài app</div>`, 1480, 20.2, 21.9);
pop(web, 20.25, 1.4, 2);
out(web, 21.85);
to('#stage', '{ opacity: 0, duration: .2 }', 21.85);

/* 22–28: ĐÁNH BOSS – màn đối đầu kiểu game đối kháng */
set('#dots', '{ opacity: 0 }', 21.95);
ft('#vsTop', '{ xPercent: -110 }', '{ xPercent: 0, duration: .32, ease: "expo.out", immediateRender: false }', 22.0);
ft('#vsBot', '{ xPercent: 110 }', '{ xPercent: 0, duration: .32, ease: "expo.out", immediateRender: false }', 22.0);
set('#vs', '{ opacity: 1 }', 22.0);
ft('#vsTxt', '{ scale: 4, opacity: 0, rotation: -20 }', '{ scale: 1, opacity: 1, rotation: -8, duration: .3, ease: "power4.out", immediateRender: false }', 22.25);
shake(22.25, 24); flash(22.25, Y, .6);
ft('#hpBossFill', '{ width: "100%" }', '{ width: "38%", duration: .25, ease: "power3.out", immediateRender: false }', 23.5);
[23.5, 24.5 - .5].forEach(t => { ft('#bossImg', '{ x: 30, filter: "brightness(2.2)" }', '{ x: 0, filter: "brightness(1)", duration: .25, ease: "power2.out", immediateRender: false }', t); });
shake(23.5, 20);
const hit = st(tapeY('Trả lời đúng = <b>ra đòn</b> 💥', 66), 1180, 23.45, 24.0);
pop(hit, 23.5, 2, -4);
out(hit, 23.95);
to('#vsTop', '{ xPercent: -110, duration: .25, ease: "power3.in" }', 23.95);
to('#vsBot', '{ xPercent: 110, duration: .25, ease: "power3.in" }', 23.95);
to('#vsTxt', '{ opacity: 0, scale: 2, duration: .2 }', 23.95);
set('#vs', '{ opacity: 0 }', 24.2);
set('#dots', '{ opacity: .55 }', 24.0);
const TIERS = [['ninja_tier1_phi_tieu.jpg', 'CẤP 1 · PHI TIÊU'], ['ninja_tier2_chem_gio.jpg', 'CẤP 2 · CHÉM GIÓ'], ['ninja_tier3_long_ha.jpg', 'CẤP 3 · LONG HẠ']];
const tierT = [24.0, 25.0, 26.0];
TIERS.forEach(([img, lab], i) => {
  G3.push({ kind: 'image', img, label: lab, w: 1.75, h: 2.33, d: .1, t0: tierT[i], enter: i === 2 ? 'slam' : 'flipY', t1: 27.5, exit: 'knock', exitDir: i % 2 ? -1 : 1, side: 'minion', back: 'black', y: .05,
    push: tierT.slice(i + 1), pushY: .28, pushZ: .9, rot: [0, 0, [-.06, .05, 0][i]], noShadow: true });
});
RING.push({ t: 26.02, y: .05, size: 6, color: Y, d: .6 });
BURST.push({ t: 26.05, x: 0, y: .3, z: .7, n: 60, colors: [Y, W, Y, K] });
cam(23.9, [-.9, .5, 10.4], [0, 0, 0], { cut: true });
cam(27.4, [.9, -.1, 9.4], [0, 0, 0]);
const lv = words('Lên cấp mỗi lần trả lời đúng', 245, 24.1, 'big w80', 27.5, .07);
const pt = st(`<div class="mono h2">Phi tiêu → Chém gió → Long hạ</div>`, 1430, 24.4, 27.5);
ft(pt, '{ opacity: 0 }', '{ opacity: 1, duration: .2 }', 24.5);
[lv, pt].forEach(s => out(s, 27.45));

/* 28–36: VÀO LỚP – nền vàng, chữ đen (đảo màu) */
ft('#haz', '{ xPercent: -130 }', '{ xPercent: 130, duration: .55, ease: "power2.inOut", immediateRender: false }', 27.55);
set('#dots', '{ opacity: 0 }', 27.8);
set('#bgY', '{ clipPath: "circle(150% at 50% 45%)" }', 27.8);
const mv = words('Muốn nói được thật?', 190, 28.0, 'big w90 k', 31.3, .08);
const vl = st(`<div class="mega k">VÀO LỚP.</div>`, 300, 28.55, 31.3);
pop(vl, 28.6, 2.2, -3); shake(28.6, 14);
const LANES = [['旅', 'lǚ', 'Du lịch'], ['厂', 'chǎng', 'Nhà máy'], ['商', 'shāng', 'Buôn bán'], ['考', 'kǎo', 'Thi HSK']];
LANES.forEach(([z, p, l], i) => {
  G3.push({ kind: 'panel', w: 1.02, h: 1.5, d: .1, t0: 29.2 + i * .25, enter: 'fly', t1: 31.3, exit: 'knock', exitDir: i < 2 ? -1 : 1, side: 'black', back: 'minion',
    x: [-1.36, -.455, .455, 1.36][i], y: [-.22, -.05, -.05, -.22][i], rot: [0, 0, [.16, .05, -.05, -.16][i]], noShadow: true,
    panel: { bg: K, ring: Y, lines: [{ t: z, f: 'zh', s: 440, y: .37, c: Y }, { t: p, f: 'mono', s: 120, w: 700, y: .68, c: W }, { t: l, s: 120, w: 900, y: .85, c: Y }] } });
});
cam(28.9, [0, .4, 14.2], [0, -.3, 0], { cut: true });
cam(31.25, [0, .1, 13.4], [0, -.3, 0]);
const lab4 = st(`<div class="mono h2 k">Học đúng câu của nghề bạn</div>`, 1460, 29.9, 31.3);
ft(lab4, '{ opacity: 0 }', '{ opacity: 1, duration: .2 }', 29.95);
[mv, vl, lab4].forEach(s => out(s, 31.25));
G3.push({ chars: '听说读写', t0: 31.45, enter: 'drop', t1: 32.95, exit: 'spin', side: 'black', back: 'black', face: { bg: K, ink: Y, ring: 'rgba(252,224,41,.35)' }, y: .75, spacing: .86, stagger: .12 });
cam(31.35, [0, .7, 12.6], [0, 0, 0], { cut: true });
cam(32.95, [0, .2, 11.9], [0, 0, 0]);
const ts = st(`<div class="mono tsdx k">tīng · shuō · dú · xiě</div><div class="big w70 k" style="margin-top:6px">Nghe · Nói · Đọc · Viết</div>`, 940, 31.6, 33.0);
ft(ts, '{ opacity: 0, y: 20 }', '{ opacity: 1, y: 0, duration: .3 }', 31.85);
const mo = st(tapeK('Buổi nào cũng phải <u>mở miệng</u>.', 58), 1180, 32.2, 33.0);
pop(mo, 32.25, 1.6, -2);
[ts, mo].forEach(s => out(s, 32.95));
// giá
const zm = st(tapeK('Zoom · 20:00 · Thứ 2 – 4 – 6 · nhóm nhỏ', 54), 260, 33.0, 35.95);
pop(zm, 33.05, 1.5, -2);
const pr = st(`<div class="price k"><span class="pl">THẺ NĂM</span><span class="pv">${odo(299, 33.3, .6)}K</span></div>`, 480, 33.25, 35.95);
ft(pr, '{ scale: .6, opacity: 0 }', '{ scale: 1, opacity: 1, duration: .35, ease: "back.out(2)" }', 33.3);
shake(33.9, 12);
const ng = st(`<div class="big w90 k">= chưa tới <mark class="k">1K/ngày</mark></div>`, 930, 34.0, 35.95);
pop(ng, 34.0, 1.7, 2);
const ts2 = st(`<div class="mono h2 k">(rẻ hơn 1 ly trà sữa mỗi tháng 🧋)</div>`, 1080, 34.5, 35.95);
ft(ts2, '{ opacity: 0 }', '{ opacity: 1, duration: .2 }', 34.55);
// dồn trước CTA: nháy theo tiếng snare cuộn
[34.5, 35.0, 35.25, 35.5, 35.625, 35.75, 35.875].forEach((t, k) => flash(t, K, .12 + k * .05));
[zm, pr, ng, ts2].forEach(s => out(s, 35.9));

/* 36–46: KÊU GỌI */
set('#bgY', '{ clipPath: "circle(0% at 50% 45%)" }', 36.0);
set('#dots', '{ opacity: .55 }', 36.0);
shake(36.0, 26); flash(36.0, Y, .85);
ft('#speed', '{ opacity: 0, scale: 1.6 }', '{ opacity: .7, scale: 1, duration: .25, immediateRender: false }', 36.0);
set('#speed', '{ filter: "invert(1)" }', 36.0);
to('#speed', '{ opacity: 0, duration: .4 }', 37.2);
cam(35.95, [0, 0, 16], [0, 0, 0], { cut: true });
cam(41.9, [0, -.3, 15], [0, 0, 0]);
if (!EVER) {
  const ld1 = st(tapeY('LỚP ĐẦU TIÊN', 62), 230, 36.0, 41.95);
  pop(ld1, 36.05, 1.8, -3);
  G3.push({ chars: '04/11', t0: 36.0, enter: 'slam', t1: 41.85, exit: 'knock', exitDir: 1, side: 'black', back: 'black', face: { bg: Y, ink: K, ring: 'rgba(0,0,0,.2)' }, y: 2.0, spacing: .8, scale: .9, stagger: .08, noShadow: true });
  RING.push({ t: 36.05, y: 2.0, size: 9, color: Y, d: .7 });
  const hh = words('20:00 · THỨ TƯ · ZOOM', 680, 36.9, 'big w110 y', 41.95, .1);
  const off = st(`<div class="offer"><div class="big w80">Đăng ký sớm <mark>960K</mark></div><div class="mono h2">hạn 20:00 thứ Ba 03/11</div></div>`, 980, 38.4, 41.95);
  flipIn(off, 38.45);
  [ld1, hh, off].forEach(s => out(s, 41.9));
} else {
  const ld1 = st(tapeY('LỚP ZOOM · NHÓM NHỎ', 62), 230, 36.0, 41.95);
  pop(ld1, 36.05, 1.8, -3);
  G3.push({ chars: '加油', t0: 36.0, enter: 'slam', t1: 41.85, exit: 'knock', exitDir: 1, side: 'black', back: 'black', face: { bg: Y, ink: K, ring: 'rgba(0,0,0,.2)' }, y: 2.0, spacing: .95, scale: 1.25, stagger: .1, noShadow: true });
  RING.push({ t: 36.05, y: 2.0, size: 9, color: Y, d: .7 });
  const jy = st(`<div class="mono pyk">加油 · jiāyóu · cố lên</div>`, 690, 36.4, 41.95);
  ft(jy, '{ opacity: 0 }', '{ opacity: 1, duration: .2 }', 36.45);
  const hh = words('Học thử cùng Bảo trong nhóm Zalo', 820, 37.0, 'big w90 y', 41.95, .08);
  [ld1, jy, hh].forEach(s => out(s, 41.9));
}
const lz = words('Lười đọc? Chơi game trước 🎮', 1200, 40.0, 'big w80', 41.95, .07);
const lb = st(`<div class="pill big2">Link game + nhóm Zalo ở bio 👆</div>`, 1400, 40.75, 41.95);
pop(lb, 40.8, 1.5, -2);
[lz, lb].forEach(s => out(s, 41.9));
// 42.5: logo – kết bằng hành động (quân 阿宝 đập xuống), giữ đến hết
to('#bgY', '{ clipPath: "circle(150% at 50% 45%)", duration: .3, ease: "power3.out" }', 42.5);
set('#dots', '{ opacity: 0 }', 42.5);
shake(42.5, 28); flash(42.5, W, .9);
cam(42.4, [0, 0, 10], [0, 0, 0], { cut: true });
G3.push({ chars: '阿宝', t0: 42.5, enter: 'slam', side: 'black', back: 'black', face: { bg: Y, ink: K, ring: 'rgba(0,0,0,.25)' }, y: .95, scale: 1.3, stagger: .1, noShadow: true });
RING.push({ t: 42.52, y: .95, size: 8, color: K, d: .75 });
BURST.push({ t: 42.55, x: 0, y: 1.0, z: .6, n: 80, colors: [K, W, K, '#C9A800'] });
const lg = letters('BẢO KHỰA', 900, 42.95, 'mega k', DUR, .035);
const lg2 = st(`<div class="mono h2 k">阿宝 · Ā Bǎo · China-ready</div>`, 1110, 43.4, DUR);
ft(lg2, '{ opacity: 0 }', '{ opacity: 1, duration: .25 }', 43.45);
const lg3 = st(tapeK('Hẹn bạn ở lớp 👋', 60), 1200, 43.7, DUR);
pop(lg3, 43.75, 1.6, -2);
const url = st(`<div class="mono url k">🎮 ngoquocgiabao-hy.github.io/Baokhua</div>`, 1345, 44.1, DUR);
ft(url, '{ opacity: 0 }', '{ opacity: 1, duration: .25 }', 44.15);

/* ================= TRANG ================= */
const CSS = `
@font-face{font-family:'Inter Display';src:local('Inter Display'),local('Inter Display Black')}
@font-face{font-family:'Inter';src:local('Inter')}
@font-face{font-family:'WenQuanYi Zen Hei';src:local('WenQuanYi Zen Hei')}
@font-face{font-family:'JetBrains Mono';src:local('JetBrains Mono'),local('JetBrains Mono ExtraBold')}
@font-face{font-family:'DejaVu Sans';src:local('DejaVu Sans')}
@font-face{font-family:'Noto Color Emoji';src:local('Noto Color Emoji')}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:${K}}
#root{position:relative;width:1080px;height:1920px;overflow:hidden;background:${K};color:${W};font-family:${FV}}
#cam{position:absolute;inset:0;transform-origin:50% 50%}
.layer{position:absolute;inset:0}
#bgY{background:${Y}}
#dots{opacity:0;background-image:radial-gradient(rgba(252,224,41,.16) 3px,transparent 3.6px);background-size:30px 30px}
#speed{opacity:0;display:flex;align-items:center;justify-content:center}
#speedr{width:2600px;height:2600px;flex:none;background:repeating-conic-gradient(rgba(11,11,12,.92) 0 1.1deg,transparent 1.1deg 7deg);-webkit-mask:radial-gradient(closest-side,transparent 26%,#000 60%);mask:radial-gradient(closest-side,transparent 26%,#000 60%)}
#haz{position:absolute;left:-200px;top:-200px;width:1480px;height:2320px;transform:rotate(-12deg);background:repeating-linear-gradient(45deg,${Y} 0 70px,${K} 70px 140px);box-shadow:0 0 0 30px ${K}}
#hazw{position:absolute;inset:0;overflow:hidden;pointer-events:none}
#stage{position:absolute;inset:0;perspective:1700px;opacity:0}
#plate{position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:hidden;transform-origin:50% 50%}
#pan{position:absolute;left:-542px;top:0;width:2164px;height:1920px}
#pan video{width:100%;height:100%;object-fit:cover;display:block}
.vid2{position:absolute;inset:0;opacity:0}
#vs{opacity:0}
.vsh{position:absolute;left:0;width:1080px;height:1000px;overflow:hidden}
#vsTop{top:0;background:${Y};clip-path:polygon(0 0,100% 0,100% 86%,0 100%)}
#vsBot{bottom:0;background:${K};clip-path:polygon(0 14%,100% 0,100% 100%,0 100%)}
#vsTop img{position:absolute;left:-40px;top:120px;height:900px}
#bossImg{position:absolute;right:-30px;bottom:-20px;height:900px}
.who{position:absolute;font:900 64px ${FV};letter-spacing:-.01em}
#vsTop .who{right:60px;top:260px;color:${K};text-align:right}
#vsBot .who{left:60px;bottom:520px;color:${Y}}
.who small{display:block;font:700 34px ${FM};letter-spacing:.04em;opacity:.8}
.hp{position:absolute;height:34px;width:520px;border:6px solid ${K};background:${K};border-radius:8px;overflow:hidden}
#vsTop .hp{right:60px;top:180px}
#vsBot .hp{left:60px;bottom:460px;border-color:${Y}}
.hp b{display:block;height:100%;width:100%;background:${Y}}
#vsTop .hp b{background:${K};border:4px solid ${Y}}
#vsTxt{position:absolute;left:0;right:0;top:820px;text-align:center;font:900 italic 300px/1 ${FV};color:${Y};-webkit-text-stroke:14px ${K};paint-order:stroke fill;text-shadow:12px 14px 0 ${K}}
#gl{position:absolute;inset:0;width:1080px;height:1920px}
#flash{background:${W};opacity:0}
#blk{background:#000;opacity:0}
#grain{opacity:.13;mix-blend-mode:overlay;background:url(grain.png);background-size:256px 256px}
#vig{background:radial-gradient(120% 80% at 50% 50%,transparent 60%,rgba(0,0,0,.45) 100%)}
.st{position:absolute;left:0;right:0;display:flex;justify-content:center;pointer-events:none;padding:0 70px}
.st .in{transform-origin:50% 60%}
.big{font:900 84px/1.05 ${FV};letter-spacing:-.025em;text-align:center;text-wrap:balance}
.w70{font-size:70px}.w80{font-size:80px}.w90{font-size:92px}.w100{font-size:104px}.w110{font-size:116px}
.big .w{display:inline-block}
.k{color:${K}}.y{color:${Y}}
.dim{color:#d8d8d8}
.shadow{text-shadow:0 6px 24px rgba(0,0,0,.85),0 0 4px #000}
mark{background:${Y};color:${K};padding:0 .14em;border-radius:6px;box-decoration-break:clone;-webkit-box-decoration-break:clone}
mark.k{background:${K};color:${Y}}
.mega{font:900 168px/0.95 ${FV};letter-spacing:-.045em;text-align:center}
.mega.y{color:${Y};-webkit-text-stroke:10px ${K};paint-order:stroke fill;text-shadow:10px 12px 0 ${K}}
.mega .lt{display:inline-block}.mega .sp{display:inline-block;width:.25em}
.mono{font:700 40px ${FM};letter-spacing:.02em}
.h2{font-size:42px;text-align:center}
.rec{display:flex;align-items:center;gap:6px;font-size:40px;color:${W};opacity:.9}
.rec i{display:inline-block;width:22px;height:22px;border-radius:50%;background:#ff3b30;margin-right:10px}
.bubble{background:${W};color:${K};border:7px solid ${K};border-radius:40px 40px 40px 8px;padding:34px 46px;box-shadow:12px 14px 0 ${Y};text-align:center}
.bubble .zh{font:400 72px/1.2 ${FZ};white-space:nowrap}
.bubble .py{font:700 40px ${FM};margin-top:10px}
.bubble .vi{font:800 40px ${FV};margin-top:8px;opacity:.75}
.load{width:880px}
.load .lt1{font-size:38px;color:${W}}
.load .bar{margin-top:16px;height:44px;border:6px solid ${Y};border-radius:10px;padding:5px}
.load .bar b{display:block;height:100%;width:0;background:${Y};border-radius:3px}
.load .pct{margin-top:10px;font-size:64px;color:${Y};text-align:right}
.pyk{font-size:46px;color:${K};background:rgba(255,255,255,.55);padding:6px 20px;border-radius:12px}
.tape{display:inline-block;padding:12px;background:repeating-linear-gradient(-45deg,${Y} 0 24px,${K} 24px 48px);border-radius:14px;box-shadow:0 16px 30px rgba(0,0,0,.4)}
.tape span{display:block;background:${K};color:${Y};font:900 64px/1.1 ${FV};padding:12px 34px;border-radius:6px;text-align:center}
.tapek{display:inline-block;padding:12px;background:repeating-linear-gradient(-45deg,${K} 0 24px,${Y} 24px 48px);border-radius:14px;box-shadow:0 16px 30px rgba(0,0,0,.35)}
.tapek span{display:block;background:${Y};color:${K};font:900 64px/1.1 ${FV};padding:12px 34px;border-radius:6px;text-align:center}
.tape u,.tapek u{text-decoration:none;background:${K};color:${Y};padding:0 .12em;border-radius:4px}
.quote{color:${W}}
.sig{font-size:40px;color:${Y}}
.stat{display:flex;align-items:center;gap:30px;width:900px}
.stat .num{font:900 130px/1 ${FV};color:${Y};min-width:250px;text-align:right;letter-spacing:-.04em;-webkit-text-stroke:6px ${K};paint-order:stroke fill;text-shadow:8px 10px 0 ${K}}
.stat .lab{font:800 46px/1.15 ${FV};color:${W};text-shadow:0 4px 18px #000}
.stat .lab b{color:${Y}}
.pill{display:inline-block;font:900 46px ${FV};color:${K};background:${Y};padding:16px 40px;border-radius:999px;border:6px solid ${K};box-shadow:0 10px 0 ${K}}
.pill.big2{font-size:54px}
.price{display:flex;flex-direction:column;align-items:center}
.price .pl{font:900 70px ${FV};letter-spacing:.06em}
.price .pv{font:900 330px/0.95 ${FV};letter-spacing:-.06em}
.tsdx{font-size:52px;text-align:center}
.offer{text-align:center}
.odc{display:inline-block;height:1em;line-height:1em;overflow:hidden;vertical-align:top}
.ods{display:block}
.url{font-size:32px;opacity:.85}
.offer .h2{color:${Y};margin-top:14px}
`;

const scene = { dur: DUR, groups: G3, cam: CAM.sort((a, b) => a.t - b.t), bursts: BURST, rings: RING, glyphs: '阿宝听说读写旅厂商考加油★' };
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
<div id="cam">
  <div class="layer" id="bgY"></div>
  <div class="layer" id="dots"></div>
  <div class="layer" id="speed"><div id="speedr"></div></div>
  <div id="stage"><div id="plate"><div id="pan">
    <div class="layer" id="pv0"><video id="v1" src="clip1.mp4" muted data-start="15" data-duration="1"></video></div>
    <div class="vid2" id="pv1"><video id="v2" src="clip.mp4" muted data-start="16" data-duration="6" data-media-start="2" data-playback-rate="1.6"></video></div>
  </div></div></div>
  <div class="layer" id="vs">
    <div class="vsh" id="vsTop"><img src="ninja_tier1_phi_tieu.jpg" alt=""><div class="hp"><b></b></div><div class="who">Ā BǍO 阿宝<small>NGƯỜI CHƠI</small></div></div>
    <div class="vsh" id="vsBot"><img id="bossImg" src="boss_le_tan_kho_tinh.jpg" alt=""><div class="hp"><b id="hpBossFill"></b></div><div class="who">LỄ TÂN KHÓ TÍNH<small>BOSS</small></div></div>
    <div id="vsTxt">VS</div>
  </div>
  <canvas id="gl" width="1080" height="1920"></canvas>
  ${H.join('\n  ')}
  <div id="hazw"><div id="haz"></div></div>
  <div class="layer" id="vig"></div>
  <div class="layer" id="grain"></div>
  <div class="layer" id="flash"></div>
</div>
<div class="layer" id="blk"></div>
<audio id="music" src="music.wav" data-start="0" data-duration="${DUR}" data-volume="1"></audio>
</div>
<script>window.SCENE = ${JSON.stringify(scene)};</script>
<script type="module" src="./engine3d.js"></script>
<script>
const tl = gsap.timeline({ paused: true });
gsap.set("#haz", { xPercent: -130 });
tl.fromTo("#grain", { backgroundPosition: "0px 0px" }, { backgroundPosition: "${256 * 37}px ${256 * 23}px", duration: ${DUR}, ease: "steps(${DUR * 30})" }, 0);
${TL.join('\n')}
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;
tl.seek(0);
</script>
</body>
</html>
`;

/* ---------- ghi dự án ---------- */
import { execFileSync } from 'child_process';
fs.mkdirSync(OUTDIR, { recursive: true });
fs.writeFileSync(path.join(OUTDIR, 'index.html'), html);
fs.writeFileSync(path.join(OUTDIR, 'hyperframes.json'), JSON.stringify({ paths: { blocks: 'compositions', components: 'compositions/components', assets: 'assets' }, media: { autoProxy: true } }));
fs.writeFileSync(path.join(OUTDIR, 'meta.json'), JSON.stringify({ id: 'debut', name: 'debut' }));
const T3 = path.join(V, 'node_modules/three');
const cp = (a, b) => fs.copyFileSync(a, path.join(OUTDIR, b));
cp(path.join(V, 'node_modules/gsap/dist/gsap.min.js'), 'gsap.min.js');
for (const f of ['three.module.js', 'three.core.js']) cp(path.join(T3, 'build', f), f);
for (const f of ['geometries/RoundedBoxGeometry.js', 'environments/RoomEnvironment.js']) { fs.mkdirSync(path.join(OUTDIR, 'addons', path.dirname(f)), { recursive: true }); fs.copyFileSync(path.join(T3, 'examples/jsm', f), path.join(OUTDIR, 'addons', f)); }
cp(path.join(V, 'tools/engine3d.js'), 'engine3d.js');
cp(path.join(V, 'assets/clip_5sao_ngaydem.mp4'), 'clip.mp4');
cp(path.join(V, 'assets/clip_1sao.mp4'), 'clip1.mp4');
for (const f of ['boss_le_tan_kho_tinh.jpg', 'ninja_tier1_phi_tieu.jpg', 'ninja_tier2_chem_gio.jpg', 'ninja_tier3_long_ha.jpg']) cp(path.join(ROOT, 'v4', f), f);
if (!fs.existsSync(path.join(OUTDIR, 'grain.png'))) execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=gray:s=256x256,noise=alls=90:allf=u', '-frames:v', '1', path.join(OUTDIR, 'grain.png')]);
execFileSync('python3', [path.join(V, 'debut/music.py'), path.join(OUTDIR, 'music.wav')].concat(EVER ? ['--evergreen'] : []), { stdio: 'ignore' });
console.log('Đã sinh', OUTDIR);
