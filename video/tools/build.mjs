// Xưởng video Bảo Khựa (v2 – 3D): dựng hàng loạt video dọc 9:16 bằng HyperFrames + three.js.
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

/* ================= NGÔN NGỮ HÌNH ẢNH v2 =================
   - Cảnh game là "thế giới": phủ kín khung, máy quay nghiêng, kéo, trôi; không khung nhỏ trên nền phẳng.
   - Chữ Hán là quân bài 3D thật (three.js, tools/engine3d.js): rơi, lật, xoay lên, đập vào; bị đánh bay khi đổi từ.
   - Pinyin, nghĩa, tiêu đề là "花字" (chữ phồng nhiều lớp viền) và băng dính vàng đen kiểu show tạp kỹ.
   - Mỗi nhịp một kiểu vào, chuyển cảnh có nguyên nhân, kết thúc bằng một hành động (máy thu thành điện thoại, quân 阿宝 đập xuống).
*/
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const r2 = x => +x.toFixed(2);
const FONT_VI = "'Inter Display','Inter',sans-serif", FONT_ZH = "'WenQuanYi Zen Hei','Noto Sans CJK SC',sans-serif";

function wrap(text, max) {
  const words = String(text).split(/\s+/), lines = []; let cur = '';
  for (const w of words) { if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }
  if (cur) lines.push(cur); return lines;
}

/* 花字: các lớp đùn nổi → viền màu → viền trắng → ruột tô chuyển sắc */
let gid = 0;
function hz(lines, o) {
  lines = [].concat(lines);
  const size = o.size, lh = size * (o.lh || 1.12), sw = 2 * ((o.white || 0) + (o.outerW || 0));
  const padY = sw / 2 + (o.ext || 0) + size * .12, Wd = o.w || 1040, Hd = Math.round(lh * lines.length + padY * 2);
  const id = 'hzg' + (++gid);
  const fam = o.zh ? FONT_ZH : FONT_VI, wt = o.zh ? 400 : (o.weight || 900);
  let s = `<svg class="hz" width="${Wd}" height="${Hd}" viewBox="0 0 ${Wd} ${Hd}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${o.fill[0]}"/><stop offset="1" stop-color="${o.fill[1]}"/></linearGradient></defs>`;
  lines.forEach((ln, i) => {
    const y = r2(padY + lh * i + lh / 2), t = esc(ln);
    const base = `x="${Wd / 2}" text-anchor="middle" dominant-baseline="central" font-family="${fam}" font-size="${size}" font-weight="${wt}" stroke-linejoin="round" paint-order="stroke"${o.italic ? ' font-style="italic"' : ''}${o.ls ? ` letter-spacing="${o.ls}"` : ''}`;
    if (o.ext) for (const d of [o.ext, o.ext * .5]) s += `<text ${base} y="${r2(y + d)}" fill="${o.extColor}" stroke="${o.extColor}" stroke-width="${sw}">${t}</text>`;
    if (o.outerW) s += `<text ${base} y="${y}" fill="${o.outer}" stroke="${o.outer}" stroke-width="${sw}">${t}</text>`;
    if (o.white) s += `<text ${base} y="${y}" fill="#fff" stroke="#fff" stroke-width="${2 * o.white}">${t}</text>`;
    s += `<text ${base} y="${y}" fill="url(#${id})">${t}</text>`;
  });
  return { svg: s + '</svg>', h: Hd, w: Wd };
}
const HZ = {
  title: (l, size = 122) => hz(l, { size, fill: ['#FFF7D6', '#FFD91F'], outer: '#1E5AA8', outerW: 13, white: 9, ext: 15, extColor: '#0F3468' }),
  cream: (l, size = 96) => hz(l, { size, fill: ['#FFFFFF', '#FFF7D6'], outer: '#1E5AA8', outerW: 11, white: 0, ext: 12, extColor: '#0F3468' }),
  py: (l, size = 112) => hz(l, { size, fill: ['#FFF15A', '#F2B200'], outer: '#16171B', outerW: 10, white: 8, ext: 12, extColor: '#0F3468', italic: true, weight: 800 }),
  zh: (l, size = 150) => hz(l, { size, zh: true, fill: ['#FFFFFF', '#FFF7D6'], outer: '#16171B', outerW: 12, white: 0, ext: 14, extColor: '#1E5AA8' }),
};
const tape = (txt, cls = '') => `<div class="tape ${cls}"><span>${esc(txt)}</span></div>`;

const CSS = `
@font-face{font-family:'Inter Display';src:local('Inter Display'),local('Inter Display Black'),local('Inter Display ExtraBold')}
@font-face{font-family:'Inter';src:local('Inter')}
@font-face{font-family:'WenQuanYi Zen Hei';src:local('WenQuanYi Zen Hei')}
@font-face{font-family:'Noto Sans CJK SC';src:local('Noto Sans CJK SC')}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:#0F3468}
#root{position:relative;width:1080px;height:1920px;overflow:hidden;font-family:${FONT_VI};color:#FFF7D6;background:#0F3468}
.layer{position:absolute;inset:0}
#bgworld{position:absolute;inset:-60px;opacity:0}
#bgworld .vw{position:absolute;left:-480px;top:0;width:2164px;height:2040px;filter:blur(28px) brightness(.55) saturate(1.2)}
#stage{position:absolute;inset:0;perspective:1700px}
#plate{position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:hidden;transform-origin:50% 50%;will-change:transform,filter}
#pan{position:absolute;left:-542px;top:0;width:2164px;height:1920px}
#pan video,.vw video{width:100%;height:100%;object-fit:cover;display:block}
.vid2{position:absolute;inset:0;opacity:0}
#grade{background:linear-gradient(180deg,rgba(15,52,104,.0) 30%,rgba(15,52,104,.55) 75%,rgba(8,26,54,.85) 100%);opacity:0}
#glow{background:radial-gradient(60% 34% at 50% 40%,rgba(255,217,31,.42),rgba(255,217,31,0) 70%);opacity:0;mix-blend-mode:screen}
#flash{background:#FFF7D6;opacity:0}
#raysw{position:absolute;left:-460px;top:-60px;width:2000px;height:2000px;opacity:0;-webkit-mask:radial-gradient(closest-side,#000 25%,transparent 100%);mask:radial-gradient(closest-side,#000 25%,transparent 100%)}
#rays{width:100%;height:100%;border-radius:50%;background:repeating-conic-gradient(rgba(255,217,31,.55) 0 7deg,rgba(255,217,31,0) 7deg 15deg)}
#gl{position:absolute;inset:0;width:1080px;height:1920px}
.st{position:absolute;left:0;right:0;display:flex;justify-content:center;pointer-events:none}
.st .in{transform-origin:50% 60%;will-change:transform,filter,opacity}
.tape{display:inline-block;padding:13px;background:repeating-linear-gradient(-45deg,#FFD91F 0 24px,#16171B 24px 48px);border-radius:14px;box-shadow:0 18px 30px rgba(0,0,0,.35)}
.tape{max-width:1010px}
.tape span{display:block;background:#FFF7D6;color:#16171B;font:900 78px/1.1 ${FONT_VI};padding:14px 40px;border-radius:6px;text-align:center}
.tape.sm span{font-size:44px;padding:8px 26px}
.tape.md span{font-size:58px;padding:10px 30px}
.pill{display:inline-block;font:900 46px ${FONT_VI};color:#16171B;background:#FFD91F;padding:14px 38px;border-radius:999px;border:6px solid #16171B;box-shadow:0 10px 0 #16171B}
.brand{display:inline-block;font:900 40px ${FONT_VI};letter-spacing:.08em;color:#16171B;background:#FFD91F;padding:10px 26px;border-radius:16px;border:5px solid #16171B;box-shadow:0 8px 0 #16171B}
.brand b{font-family:${FONT_ZH};font-weight:400;letter-spacing:0}
.pyl{font:800 40px ${FONT_VI};color:#FFF7D6;background:rgba(22,23,27,.75);padding:6px 18px;border-radius:12px}
`;

/* bộ ghi: gom HTML, timeline GSAP, âm thanh, cảnh 3D */
function Film(dur) {
  const F = { dur, html: [], tl: [], au: [], g3: [], cam: [], bursts: [], glyphs: new Set(['阿', '宝']), n: 0 };
  F.uid = p => `${p}${++F.n}`;
  F.at = (sel, vars, t) => F.tl.push(`tl.to(${JSON.stringify(sel)}, ${vars}, ${r2(t)});`);
  F.from = (sel, vars, t) => F.tl.push(`tl.from(${JSON.stringify(sel)}, ${vars}, ${r2(t)});`);
  F.fromTo = (sel, a, b, t) => F.tl.push(`tl.fromTo(${JSON.stringify(sel)}, ${a}, ${b}, ${r2(t)});`);
  F.set = (sel, vars, t) => F.tl.push(`tl.set(${JSON.stringify(sel)}, ${vars}, ${r2(t)});`);
  F.sfx = (file, t, vol = .6) => F.au.push(`<audio id="${F.uid('a')}" src="${file}" data-start="${r2(Math.max(0, t))}" data-volume="${vol}"></audio>`);
  // sticker có hẹn giờ: vỏ .clip giữ thời gian, ruột .in mới chuyển động
  F.sticker = (inner, top, t0, t1, style = '') => { const id = F.uid('s'); F.html.push(`<div class="st clip" id="${id}" style="top:${top}px;${style}" data-start="${r2(t0)}" data-duration="${r2(t1 - t0)}"><div class="in">${inner}</div></div>`); return `#${id} .in`; };
  F.tiles = (G) => { [...G.chars].forEach(c => F.glyphs.add(c)); F.g3.push(G); };
  F.burst = (t, x = 0, y = .2, z = .4, n = 46) => F.bursts.push({ t: r2(t), x, y, z, n });
  F.camKey = (t, p, l, extra = {}) => F.cam.push({ t: r2(t), p, l, ...extra });
  return F;
}
/* máy quay 3D: z theo số quân bài để vừa khung; nhìn lệch xuống để quân bài nằm ở 1/3 trên */
const camZ = n => Math.max(8.4, (n * .92 + .5) / (.9 * .3014));
const lookY = (z, px = 220) => -px * 2 * z * .268 / 1920;   // dịch quân bài lên khỏi tâm khung px điểm ảnh

/* các khối chung */
function plateSetup(F, clips) {
  // clips: [{src, start, dur, rate, mediaStart}] ; clip đầu tiên hiện sẵn, các clip sau trong .vid2 (bật bằng opacity)
  const vids = clips.map((c, i) => `<div class="${i ? 'vid2' : 'layer'}" id="pv${i}"><video id="${F.uid('v')}" src="${c.src}" muted data-start="${r2(c.start)}" data-duration="${r2(c.dur)}"${c.rate ? ` data-playback-rate="${c.rate}"` : ''}${c.mediaStart ? ` data-media-start="${c.mediaStart}"` : ''}></video></div>`).join('');
  const last = clips[clips.length - 1];
  F.html.unshift(`<div id="bgworld"><div class="vw"><video id="${F.uid('v')}" src="${last.src}" muted data-start="0" data-duration="${r2(F.dur)}"${last.rate ? ` data-playback-rate="${last.rate}"` : ''}></video></div></div>
<div id="stage"><div id="plate"><div id="pan">${vids}</div></div></div>
<div class="layer" id="grade"></div><div class="layer" id="glow"></div>
<div id="raysw"><div id="rays"></div></div>
<canvas id="gl" width="1080" height="1920"></canvas>`);
  F.set('#plate', '{ filter: "blur(0px) brightness(1) saturate(1)" }', 0);
  F.fromTo('#rays', '{ rotation: 0 }', `{ rotation: ${r2(F.dur * 6)}, duration: ${r2(F.dur)}, ease: "none" }`, 0);
}
function hookOpen(F, kicker, titleLines, T) {
  // máy quay từ trên nghiêng xuống phố, kéo lùi để lộ cả khách sạn
  F.fromTo('#plate', '{ scale: 1.7, rotationX: 24, rotationZ: -4, y: 260 }', `{ scale: 1.06, rotationX: 0, rotationZ: 0, y: 0, duration: ${T - .2}, ease: "power2.inOut" }`, 0);
  F.fromTo('#grade', '{ opacity: 0 }', '{ opacity: 1, duration: .6 }', .2);
  F.fromTo('#raysw', '{ opacity: 0, scale: .6 }', '{ opacity: .9, scale: 1, duration: .7, ease: "power2.out" }', .25);
  F.set('#raysw', '{ y: 440 }', 0);
  const b = F.sticker(`<div class="brand">BẢO KHỰA <b>阿宝</b></div>`, 120, 0, T);
  F.fromTo(b, '{ rotation: -30, scale: 0 }', '{ rotation: -6, scale: 1, duration: .5, ease: "back.out(2)" }', .1);
  const tt = HZ.title(titleLines, titleLines.length > 2 ? 104 : 122);
  const top = 1180 - tt.h / 2;
  const k = F.sticker(tape(kicker, 'md'), top - 120, 0, T);
  F.fromTo(k, '{ rotationX: -100, opacity: 0, transformPerspective: 900 }', '{ rotationX: 0, rotation: -3, opacity: 1, duration: .45, ease: "back.out(1.8)" }', .35);
  const ti = F.sticker(tt.svg, top, 0, T);
  F.fromTo(ti, '{ scale: 2.4, opacity: 0, filter: "blur(14px)" }', '{ scale: 1, opacity: 1, filter: "blur(0px)", duration: .55, ease: "expo.out" }', .55);
  F.sfx('hit.ogg', .55, .7);
  // rời: tiêu đề vụt lên trên, nền bị kéo nhoè (chuyển cảnh "zoom xuyên")
  F.at([k, ti].join(','), '{ y: -260, opacity: 0, filter: "blur(10px)", duration: .25, ease: "power3.in" }', T - .28);
  F.at(b, '{ scale: 0, duration: .2, ease: "power3.in" }', T - .25);
  F.at('#raysw', '{ opacity: 0, duration: .3 }', T - .3);
}
function worldDim(F, t, x = 0) {   // nền thành "thế giới nhoè" phía sau quân bài
  F.at('#plate', `{ scale: 1.22, x: ${x}, filter: "blur(13px) brightness(.5) saturate(1.25)", duration: .45, ease: "power3.in" }`, t - .3);
  F.at('#glow', '{ opacity: 1, duration: .5 }', t - .1);
  F.at('#grade', '{ opacity: .6, duration: .5 }', t - .1);
}
function outroPhone(F, t0) {
  const cfg = F.cfg;
  // thế giới thu lại thành màn hình điện thoại nghiêng 3D; phía sau là cùng cảnh đó nhoè lớn
  F.at('#bgworld', '{ opacity: 1, duration: .5 }', t0);
  F.at('#glow', '{ opacity: 0, duration: .4 }', t0);
  F.at('#grade', '{ opacity: 0, duration: .4 }', t0);
  F.at('#plate', '{ scale: .46, x: -20, y: -360, rotationY: -16, rotationX: 8, borderRadius: 110, filter: "blur(0px) brightness(1) saturate(1)", boxShadow: "0 0 0 16px #FFD91F, 0 0 0 26px #16171B, 0 80px 90px rgba(0,0,0,.55)", duration: .8, ease: "power3.inOut" }', t0);
  F.set('#plate', '{ boxShadow: "0 0 0 0px #FFD91F, 0 0 0 0px #16171B, 0 0 0 rgba(0,0,0,0)" }', 0);
  F.at('#raysw', '{ opacity: .55, y: 90, duration: .6 }', t0 + .2);
  F.at('#pan', '{ x: 0, duration: .8, ease: "power3.inOut" }', t0);
  const c1 = HZ.cream(wrap(cfg.cta.line1, 18), 84);
  const s1 = F.sticker(c1.svg, 1075, t0, F.dur);
  F.fromTo(s1, '{ rotationX: -95, opacity: 0, transformPerspective: 900 }', '{ rotationX: 0, opacity: 1, duration: .55, ease: "back.out(1.6)" }', t0 + .55);
  const s2 = F.sticker(tape(cfg.cta.line2, 'sm'), 1075 + c1.h + 6, t0, F.dur);
  F.fromTo(s2, '{ scale: 1.6, rotation: -12, opacity: 0 }', '{ scale: 1, rotation: -2, opacity: 1, duration: .35, ease: "power4.out" }', t0 + .95);
  F.sfx('ui.ogg', t0 + .95, .6);
  const s3 = F.sticker(`<div class="pill">${esc(cfg.cta.button)}</div>`, 1075 + c1.h + 110, t0, F.dur);
  F.fromTo(s3, '{ y: 80, opacity: 0 }', '{ y: 0, opacity: 1, duration: .45, ease: "expo.out" }', t0 + 1.25);
  // hành động cuối: quân 阿宝 đập xuống góc điện thoại + pháo giấy
  const z = 19, ly = lookY(z);
  F.camKey(t0, [0, .4, z], [0, ly, 0], { cut: true });
  F.camKey(F.dur, [.25, .5, z - .6], [0, ly, 0]);
  F.tiles({ chars: '阿宝', t0: t0 + 1.55, enter: 'slam', x: 1.05, y: 2.15, side: 'sun', stagger: .12 });
  F.burst(t0 + 1.75, 1.05, 2.3, .6, 40);
  F.sfx('win.ogg', t0 + 1.7, .55);
  const pl = F.sticker(`<div class="pyl">阿宝 · Ā Bǎo</div>`, 420, t0, F.dur, 'padding-left:500px');
  F.fromTo(pl, '{ opacity: 0, y: 20 }', '{ opacity: 1, y: 0, duration: .3 }', t0 + 2.0);
}

function page(F) {
  const scene = { dur: F.dur, groups: F.g3, cam: F.cam.sort((a, b) => a.t - b.t), bursts: F.bursts, glyphs: [...F.glyphs].join('') };
  return `<!doctype html>
<html lang="vi" data-resolution="portrait">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<script src="./gsap.min.js"></script>
<script type="importmap">{"imports":{"three":"./three.module.js","three/addons/":"./addons/"}}</script>
<style>${CSS}</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${F.dur}" data-width="1080" data-height="1920">
${F.html.join('\n')}
<div class="layer" id="flash"></div>
<audio id="bgm" src="bgm.m4a" data-start="0" data-duration="${F.dur}" data-volume="0.22" data-fade-out="1"></audio>
${F.au.join('\n')}
</div>
<script>window.SCENE = ${JSON.stringify(scene)};</script>
<script type="module" src="./engine3d.js"></script>
<script>
const tl = gsap.timeline({ paused: true });
${F.tl.join('\n')}
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;
tl.seek(0);
</script>
</body>
</html>
`;
}

/* ---------- mẫu 1: TỪ VỰNG 3D ---------- */
const ENTERS = ['drop', 'flip', 'rise', 'slam'];
function tuvung(pack) {
  const words = pack.words.map(k => { const w = WORDS[k]; if (!w) throw new Error(pack.id + ': không có từ ' + k); return { zh: w[0], py: w[1], vi: w[2] }; });
  const HOOK = 2.6, PER = 3.4, OUT = 3.8, t1 = HOOK + PER * words.length, dur = r2(t1 + OUT);
  const F = Film(dur); F.cfg = cfg;
  plateSetup(F, [{ src: 'clip.mp4', start: 0, dur, rate: r2(Math.min(1, 15 / dur * .98)) }]);
  hookOpen(F, `${words.length} từ tiếng Trung`, wrap(pack.title, 15), HOOK);
  F.camKey(0, [0, .5, 12], [0, lookY(12), 0]);
  words.forEach((w, i) => {
    const ts = HOOK + i * PER, n = [...w.zh].length, z = camZ(n), ly = lookY(z), last = i === words.length - 1;
    worldDim(F, ts, i % 2 ? 60 : -60);
    F.at('#pan', `{ x: ${i % 2 ? -90 : 90}, duration: ${PER}, ease: "sine.inOut" }`, ts);
    // máy quay: mỗi từ một góc, trôi chậm trong nhịp, vụt nhanh sang góc của từ sau
    const A = [[[-2.4, 2.6, z + 1.4], [-.5, 1.0, z]], [[2.6, -1.2, z + 1.2], [.6, -.1, z]], [[0, 4.4, z * .86], [0, 1.6, z]], [[-1.4, .2, z + 3], [-.2, .5, z]]][i % 4];
    F.camKey(ts - .15, A[0], [0, ly, 0], { cut: i === 0 });
    F.camKey(ts + PER - .4, A[1], [0, ly, 0]);
    F.tiles({ chars: w.zh, t0: ts + .05, enter: ENTERS[i % 4], t1: last ? t1 - .1 : ts + PER - .3, exit: last ? 'spin' : 'knock', exitDir: i % 2 ? -1 : 1, side: i % 3 === 1 ? 'denim' : 'sun', stagger: .1 });
    F.burst(ts + .55, 0, .3, .4);
    F.sfx('hit.ogg', ts + .3, .6); F.sfx('crit.ogg', ts + .55, .35);
    const cnt = F.sticker(tape(`TỪ ${i + 1}/${words.length}`, 'sm'), 150, ts, ts + PER - .2, 'justify-content:flex-end;padding-right:70px');
    F.fromTo(cnt, '{ rotationY: -90, opacity: 0, transformPerspective: 800 }', '{ rotationY: 0, rotation: 4, opacity: 1, duration: .4, ease: "back.out(2)" }', ts + .1);
    const py = HZ.py(w.py, w.py.length > 14 ? 96 : 116);
    const sp = F.sticker(py.svg, 975, ts, ts + PER - .1);
    F.fromTo(sp, '{ rotationX: -95, y: 50, opacity: 0, transformPerspective: 900 }', '{ rotationX: 0, y: 0, opacity: 1, duration: .5, ease: "back.out(1.7)" }', ts + .75);
    const sv = F.sticker(tape(w.vi), 975 + py.h + 10, ts, ts + PER - .1);
    F.fromTo(sv, '{ scale: 1.7, rotation: -14, opacity: 0 }', '{ scale: 1, rotation: -3, opacity: 1, duration: .32, ease: "power4.out" }', ts + 1.35);
    F.sfx('ui.ogg', ts + 1.35, .6);
    const dx = i % 2 ? 380 : -380;
    F.at([cnt, sp].join(','), '{ opacity: 0, filter: "blur(8px)", duration: .2 }', ts + PER - .32);
    F.at(sv, `{ x: ${dx}, opacity: 0, filter: "blur(10px)", duration: .22, ease: "power3.in" }`, ts + PER - .3);
  });
  outroPhone(F, t1);
  return { id: pack.id, dur, html: page(F), caption: `${pack.title} 🏨\n` + words.map(w => `${w.zh} (${w.py}) – ${w.vi}`).join('\n') };
}

/* ---------- mẫu 2: 3 GIÂY TRẢ LỜI 3D ---------- */
function hoinhanh(id, label, cards) {
  const HOOK = 2.6, PER = 6.6, OUT = 3.8, t1 = HOOK + PER * cards.length, dur = r2(t1 + OUT);
  const F = Film(dur); F.cfg = cfg;
  plateSetup(F, [{ src: 'clip.mp4', start: 0, dur, rate: r2(Math.min(1, 15 / dur * .98)) }]);
  hookOpen(F, '3 giây trả lời', wrap(`Tiếng Trung ${label.toLowerCase()}`, 14), HOOK);
  F.camKey(0, [0, .3, 11], [0, .1, 0]);
  cards.forEach((c, i) => {
    const ts = HOOK + i * PER;
    worldDim(F, ts, i % 2 ? 50 : -50);
    F.at('#pan', `{ x: ${i % 2 ? -80 : 80}, duration: ${PER}, ease: "sine.inOut" }`, ts);
    const cnt = F.sticker(tape(`CÂU ${i + 1}/${cards.length}`, 'sm'), 150, ts, ts + PER - .2, 'justify-content:flex-end;padding-right:70px');
    F.fromTo(cnt, '{ rotationY: -90, opacity: 0, transformPerspective: 800 }', '{ rotationY: 0, rotation: 4, opacity: 1, duration: .4, ease: "back.out(2)" }', ts + .05);
    const ask = F.sticker(`<div style="font:900 44px ${FONT_VI};color:#FFD91F;letter-spacing:.06em;text-align:center;margin-bottom:6px">TIẾNG TRUNG NÓI SAO?</div>` + HZ.cream(wrap(`“${c.vi}”`, 18), 84).svg, 290, ts, ts + PER - .1);
    F.fromTo(ask, '{ scale: .6, opacity: 0, filter: "blur(10px)" }', '{ scale: 1, opacity: 1, filter: "blur(0px)", duration: .45, ease: "expo.out" }', ts + .1);
    // đếm ngược bằng quân bài 3D: 3 đập vào, 2 rơi xuống, 1 lật; mỗi số bị số sau đánh bay
    [['3', 'slam', 'sun', 1], ['2', 'drop', 'sun', -1], ['1', 'flip', 'hot', 1]].forEach(([d, en, side, dir], k) => {
      const a = ts + 1 + k;
      F.tiles({ chars: d, t0: a, enter: en, t1: a + (k === 2 ? .62 : .82), exit: k === 2 ? 'spin' : 'knock', exitDir: dir, side, y: -.15 });
      F.sfx('ui.ogg', a + .05, .5);
      F.camKey(a, [k === 1 ? 1.1 : -1.1, .5 + k * .3, 9.8 - k * .5], [0, .15, 0]);
    });
    F.camKey(ts + 3.95, [0, .3, 9.2], [0, .15, 0]);
    // lật đáp án: chớp sáng, chữ Hán phồng đập vào, pháo giấy
    const zc = [...c.zh], nl = Math.ceil(zc.length / 7), per = Math.ceil(zc.length / nl);
    const zlines = Array.from({ length: nl }, (_, k) => zc.slice(k * per, (k + 1) * per).join(''));
    const zh = HZ.zh(zlines, Math.min(160, Math.floor(900 / per)));
    const ans = F.sticker(zh.svg, 860, ts + 4, ts + PER - .1);
    F.fromTo('#flash', '{ opacity: .85 }', '{ opacity: 0, duration: .35, ease: "power2.out", immediateRender: false }', ts + 4);
    F.fromTo(ans, '{ scale: 2.3, opacity: 0, filter: "blur(12px)" }', '{ scale: 1, opacity: 1, filter: "blur(0px)", duration: .45, ease: "expo.out" }', ts + 4);
    F.burst(ts + 4.05, 0, .4, .5, 60);
    F.sfx('hit.ogg', ts + 4, .75); F.sfx('win.ogg', ts + 4.1, .35);
    const py = HZ.py(wrap(c.py, 22), c.py.length > 22 ? 70 : 88);
    const sp = F.sticker(py.svg, 860 + zh.h + 6, ts + 4, ts + PER - .1);
    F.fromTo(sp, '{ rotationX: -95, opacity: 0, transformPerspective: 900 }', '{ rotationX: 0, opacity: 1, duration: .45, ease: "back.out(1.7)" }', ts + 4.4);
    const dx = i % 2 ? 420 : -420;
    F.at([cnt, ask].join(','), '{ opacity: 0, filter: "blur(8px)", duration: .2 }', ts + PER - .3);
    F.at([ans, sp].join(','), `{ x: ${dx}, opacity: 0, filter: "blur(10px)", duration: .24, ease: "power3.in" }`, ts + PER - .3);
  });
  outroPhone(F, t1);
  return { id, dur, html: page(F), caption: `3 giây trả lời · ${label} ⏱️ Bạn trả lời kịp mấy câu?\n` + cards.map(c => `${c.zh} (${c.py}) – ${c.vi}`).join('\n') };
}

/* ---------- mẫu 3: KHAI GIẢNG 3D ---------- */
function khaigiang(k) {
  const A = 3, B = 5.4, C = 7, OUT = 3.8, t1 = A + B + C, dur = r2(t1 + OUT);
  const F = Film(dur); F.cfg = cfg;
  plateSetup(F, [{ src: 'clip1.mp4', start: 0, dur: A }, { src: 'clip.mp4', start: A, dur: dur - A, rate: .72, mediaStart: 3 }]);
  // cảnh 1: khách sạn 1★ nhỏ
  F.fromTo('#plate', '{ scale: 1.7, rotationX: 24, rotationZ: -4, y: 260 }', `{ scale: 1.06, rotationX: 0, rotationZ: 0, y: 0, duration: ${A - .2}, ease: "power3.out" }`, 0);
  F.fromTo('#grade', '{ opacity: 0 }', '{ opacity: 1, duration: .6 }', .2);
  const b = F.sticker(`<div class="brand">BẢO KHỰA <b>阿宝</b></div>`, 120, 0, A + B);
  F.fromTo(b, '{ rotation: -30, scale: 0 }', '{ rotation: -6, scale: 1, duration: .5, ease: "back.out(2)" }', .1);
  const h1 = HZ.title(wrap(k.hook, 14), 116);
  const s1 = F.sticker(h1.svg, 1180 - h1.h / 2, 0, A);
  F.fromTo(s1, '{ scale: 2.3, opacity: 0, filter: "blur(14px)" }', '{ scale: 1, opacity: 1, filter: "blur(0px)", duration: .55, ease: "expo.out" }', .5);
  F.sfx('hit.ogg', .5, .7);
  F.at(s1, '{ y: -260, opacity: 0, filter: "blur(10px)", duration: .25, ease: "power3.in" }', A - .28);
  // chuyển: vụt ngang sang khách sạn 5★ (đổi clip ở điểm nhanh nhất của cú vụt)
  F.at('#plate', '{ x: -700, filter: "blur(18px)", duration: .25, ease: "power3.in" }', A - .25);
  F.set('#pv1', '{ opacity: 1 }', A);
  F.set('#plate', '{ x: 700 }', A);
  F.at('#plate', '{ x: 0, scale: 1.12, filter: "blur(0px)", duration: .45, ease: "expo.out" }', A);
  F.at('#plate', `{ scale: 1.32, duration: ${B - .6}, ease: "sine.inOut" }`, A + .45);
  F.camKey(0, [0, .5, 12], [0, lookY(12, 380), 0]);
  F.camKey(A, [-1.6, 1.4, 12.5], [0, lookY(12, 380), 0], { cut: true });
  F.camKey(A + B - .4, [.8, .4, 11], [0, lookY(11, 380), 0]);
  F.tiles({ chars: '5★', t0: A + .35, enter: 'slam', t1: A + B - .35, exit: 'knock', exitDir: 1, side: 'hot', stagger: .14 });
  F.burst(A + .6, 0, .5, .4, 70);
  F.sfx('hit.ogg', A + .35, .8); F.sfx('win.ogg', A + .6, .45);
  const h2 = HZ.cream(wrap(k.turn, 16), 88);
  const s2 = F.sticker(h2.svg, 1080, A, A + B);
  F.fromTo(s2, '{ rotationX: -95, opacity: 0, transformPerspective: 900 }', '{ rotationX: 0, opacity: 1, duration: .55, ease: "back.out(1.6)" }', A + 1.1);
  F.at(s2, '{ x: -420, opacity: 0, filter: "blur(10px)", duration: .24, ease: "power3.in" }', A + B - .3);
  F.at(b, '{ scale: 0, duration: .2 }', A + B - .25);
  // cảnh 3: thông tin lớp; ngày khai giảng là các quân bài lịch 3D
  const t3 = A + B;
  worldDim(F, t3, 0);
  const date = (k.lines.find(l => /\d{2}\/\d{2}/.test(l)) || '').match(/\d{2}\/\d{2}/);
  const dz = camZ(date ? date[0].length : 3);
  F.camKey(t3 - .1, [0, 2.6, dz + 2], [0, lookY(dz, 640), 0], { cut: true });
  F.camKey(t1 - .3, [0, .9, dz], [0, lookY(dz, 640), 0]);
  if (date) { F.tiles({ chars: date[0], t0: t3 + .1, enter: 'drop', t1: t1 - .1, exit: 'spin', side: 'denim', stagger: .08 }); F.burst(t3 + .7, 0, .3, .4); F.sfx('hit.ogg', t3 + .4, .7); }
  const ti = HZ.title(wrap(k.title, 16), 92);
  const st = F.sticker(ti.svg, 500, t3, t1);
  F.fromTo(st, '{ scale: 2, opacity: 0, filter: "blur(12px)" }', '{ scale: 1, opacity: 1, filter: "blur(0px)", duration: .5, ease: "expo.out" }', t3 + .7);
  let y = 500 + ti.h + 10;
  k.lines.forEach((ln, i) => {
    const s = F.sticker(tape(ln, ln.length > 30 ? 'sm' : 'md'), y, t3, t1);
    F.fromTo(s, `{ x: ${i % 2 ? 500 : -500}, rotation: ${i % 2 ? 8 : -8}, opacity: 0 }`, `{ x: 0, rotation: ${i % 2 ? 1.5 : -1.5}, opacity: 1, duration: .38, ease: "power4.out" }`, t3 + 1.3 + i * .42);
    F.sfx('ui.ogg', t3 + 1.3 + i * .42, .5);
    F.at(s, '{ opacity: 0, filter: "blur(8px)", duration: .2 }', t1 - .3);
    y += 112;
  });
  F.at(st, '{ opacity: 0, filter: "blur(8px)", duration: .2 }', t1 - .3);
  outroPhone(F, t1);
  return { id: k.id, dur, html: page(F), caption: `${k.title} 🏨\n` + k.lines.join('\n') };
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

const all = jobs.map(f => f());
const built = all.filter(j => !only.length || only.includes(j.id));
if (args.includes('--list')) { built.forEach(j => console.log(j.id.padEnd(16), j.dur + 's')); process.exit(0); }

/* ---------- sinh dự án + dựng ---------- */
const ASSETS = path.join(V, 'assets');
for (const f of ['clip_5sao_ngaydem.mp4', 'clip_1sao.mp4'])
  if (!fs.existsSync(path.join(ASSETS, f))) { console.error(`Thiếu assets/${f}. Chạy trước: npm run capture`); process.exit(1); }
fs.mkdirSync(path.join(OUT, 'build'), { recursive: true });
const bgmSrc = path.join(ROOT, 'v4/audio/bgm_loop.ogg');
const HF = path.join(V, 'node_modules/.bin/hyperframes');
const capLines = ['# Chú thích đăng TikTok (tự sinh, Bảo đọc lại trước khi đăng)', ''];
for (const j of all) {
  capLines.push(`## ${j.id} (${j.dur}s)`, '', j.caption, '', `👉 ${cfg.cta.line1} · ${cfg.cta.line2}`, (j.id.includes('factory') ? cfg.hashtags.map(h => h === '#tiengtrungletan' ? '#tiengtrungnhamay' : h) : cfg.hashtags).join(' '), '');
}

for (const j of built) {
  const dir = path.join(OUT, 'build', j.id);
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), j.html);
  fs.writeFileSync(path.join(dir, 'hyperframes.json'), JSON.stringify({ paths: { blocks: 'compositions', components: 'compositions/components', assets: 'assets' }, media: { autoProxy: true } }));
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({ id: j.id, name: j.id }));
  fs.copyFileSync(path.join(V, 'node_modules/gsap/dist/gsap.min.js'), path.join(dir, 'gsap.min.js'));
  fs.copyFileSync(path.join(ASSETS, 'clip_5sao_ngaydem.mp4'), path.join(dir, 'clip.mp4'));
  fs.copyFileSync(path.join(ASSETS, 'clip_1sao.mp4'), path.join(dir, 'clip1.mp4'));
  for (const s of ['ui.ogg', 'hit.ogg', 'win.ogg', 'crit.ogg']) fs.copyFileSync(path.join(ROOT, 'v4/audio', s), path.join(dir, s));
  const T3 = path.join(V, 'node_modules/three');
  for (const f of ['three.module.js', 'three.core.js']) fs.copyFileSync(path.join(T3, 'build', f), path.join(dir, f));
  for (const f of ['geometries/RoundedBoxGeometry.js', 'environments/RoomEnvironment.js']) { fs.mkdirSync(path.join(dir, 'addons', path.dirname(f)), { recursive: true }); fs.copyFileSync(path.join(T3, 'examples/jsm', f), path.join(dir, 'addons', f)); }
  fs.copyFileSync(path.join(V, 'tools/engine3d.js'), path.join(dir, 'engine3d.js'));
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-stream_loop', '-1', '-i', bgmSrc, '-t', String(j.dur), '-c:a', 'aac', '-b:a', '128k', path.join(dir, 'bgm.m4a')]);
  if (args.includes('--no-render')) { console.log('Đã sinh', dir); continue; }
  const t0 = Date.now();
  // dựng; lỗi thoáng qua thì thử lại một lần; vẫn lỗi thì ghi lại và làm video kế tiếp
  let ok = false;
  for (let k = 0; k < 2 && !ok; k++) {
    try { execFileSync(HF, ['render', '-o', path.join(OUT, j.id + '.mp4')], { cwd: dir, stdio: ['ignore', fs.openSync(path.join(dir, 'render.log'), 'w'), 'pipe'], env: { ...process.env, HYPERFRAMES_SKIP_SKILLS: '1' } }); ok = true; }
    catch (e) { console.error(`! ${j.id} lỗi lần ${k + 1}: ${String(e.stderr || e.message).split('\n').filter(Boolean).slice(-3).join(' | ')}`); }
  }
  if (!ok) { console.error(`✗ ${j.id} bỏ qua (xem ${path.join(dir, 'render.log')})`); continue; }
  // ảnh bìa: khung hình lúc tiêu đề đã hiện đủ
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', '1.6', '-i', path.join(OUT, j.id + '.mp4'), '-frames:v', '1', '-q:v', '3', path.join(OUT, j.id + '_bia.jpg')]);
  console.log(`✓ ${j.id}.mp4  ${j.dur}s  (dựng ${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
fs.writeFileSync(path.join(OUT, 'CAPTIONS.md'), capLines.join('\n'));
