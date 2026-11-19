/* Kiểm thử lõi ghép 3 Ā Bǎo 消消乐 (hotel/xiao-core.js) – chạy bằng Node, không cần trình duyệt.
   node tools/test/xiao-core.js          → in kết quả, thoát 1 nếu có lỗi
   Kiểm: luật ghép (3, 4 → Sóng, L/T → Pháo hoa, 5 → Ngọc 宝), đòn ghép, cát/thùng/khoá/hành lý, rơi bù,
         bàn đầu không tự nổ và luôn có nước đi, bot qua được cả 20 phòng. */
'use strict';
const X = require('../../hotel/xiao-core.js');
let fail = 0, pass = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } };

/** bàn 8×8 nền 3 màu 3/4/5 xếp chéo (không có dãy nào), rồi đặt viên theo ý */
function board(set, map) {
  const L = { id: 0, colors: 6, time: 30, goals: [{ k: 'score', n: 1 }], map: map || Array(8).fill('........') };
  const G = new X.Game(L, 7);
  for (let r = 0; r < G.R; r++) for (let c = 0; c < G.C; c++) { const x = G.cells[r][c]; if (x.t && x.t.k !== 'l') { x.t.k = 'n'; x.t.c = 3 + ((c + 2 * r) % 3); } }
  for (const [r, c, col, k] of set) G.cells[r][c].t = { id: G.uid++, k: k || 'n', c: col };
  return G;
}
const kindAt = (G, r, c) => G.cells[r][c].t && G.cells[r][c].t.k;

/* 1. ghép 3 */
{ const G = board([[3, 0, 0], [3, 1, 0], [2, 2, 0]]);
  const s = G.swap([2, 2], [3, 2]); ok(s.ok, 'ghép 3 hợp lệ');
  const ev = G.resolve(s); ok(ev && ev.removed.length === 3, 'ghép 3 xoá đúng 3 viên (' + (ev && ev.removed.length) + ')'); ok(G.score > 0, 'có điểm'); }
/* 2. đổi chỗ không ghép → trả lại */
{ const G = board([]); const before = G.cells[0][0].t.c; const s = G.swap([0, 0], [0, 1]); ok(!s.ok, 'đổi chỗ không ghép bị từ chối'); ok(G.cells[0][0].t.c === before, 'bàn trả về như cũ'); }
/* 3. 4 viên hàng ngang → Sóng ngang ở ô vừa kéo tới */
{ const G = board([[3, 0, 0], [3, 1, 0], [3, 3, 0], [2, 2, 0]]);
  const s = G.swap([2, 2], [3, 2]); const ev = G.resolve(s); ok(ev.made.length === 1 && ev.made[0].k === 'h', '4 ngang → Sóng ngang'); ok(kindAt(G, 3, 2) === 'h', 'Sóng nằm ở ô vừa kéo tới'); }
/* 4. 4 viên hàng dọc → Sóng dọc */
{ const G = board([[0, 3, 1], [1, 3, 1], [3, 3, 1], [2, 2, 1]]);
  const s = G.swap([2, 2], [2, 3]); const ev = G.resolve(s); ok(ev.made.length === 1 && ev.made[0].k === 'v', '4 dọc → Sóng dọc'); }
/* 5. chữ L → Pháo hoa */
{ const G = board([[4, 1, 2], [4, 2, 2], [2, 3, 2], [3, 3, 2], [5, 3, 2]]);
  // kéo (5,3) lên (4,3): hàng 4 có 2,2,2 ở cột 1–3; cột 3 có 2,2,2 ở hàng 2–4
  const s = G.swap([5, 3], [4, 3]); ok(s.ok, 'L hợp lệ'); const ev = G.resolve(s); ok(ev.made.length === 1 && ev.made[0].k === 'f', 'L/T → Pháo hoa (' + (ev.made[0] && ev.made[0].k) + ')'); }
/* 6. 5 thẳng hàng → Ngọc 宝 */
{ const G = board([[3, 0, 1], [3, 1, 1], [3, 3, 1], [3, 4, 1], [2, 2, 1]]);
  const s = G.swap([2, 2], [3, 2]); const ev = G.resolve(s); ok(ev.made.length === 1 && ev.made[0].k === 'p', '5 thẳng → Ngọc 宝'); ok(kindAt(G, 3, 2) === 'p', 'Ngọc ở ô vừa kéo tới'); }
/* 7. Ngọc 宝 + viên thường → xoá hết màu đó */
{ const G = board([[0, 0, -1, 'p'], [0, 1, 1], [5, 5, 1], [7, 7, 1]]);
  const n1 = G.count(x => x.t && x.t.c === 1 ? 1 : 0);
  const s = G.swap([0, 0], [0, 1]); ok(s.ok && s.combo === 'pn', 'Ngọc + thường là đòn ghép'); const ev = G.resolve(s);
  ok(ev.removed.filter(e => e.t.c === 1).length === n1, `xoá hết ${n1} viên màu 1`); }
/* 8. Sóng + Sóng → xoá chữ thập */
{ const G = board([[4, 3, 0, 'h'], [4, 4, 1, 'v']]);
  const s = G.swap([4, 3], [4, 4]); ok(s.ok && s.combo === 'ss', 'Sóng + Sóng là đòn ghép'); const ev = G.resolve(s);
  ok(ev.removed.length >= 15, 'xoá cả hàng và cột (' + ev.removed.length + ' viên)'); }
/* 9. Pháo hoa bị Sóng quét trúng thì nổ dây chuyền */
{ const G = board([[3, 0, 0], [3, 1, 0, 'h'], [2, 2, 0], [3, 5, 1, 'f']]);
  const s = G.swap([2, 2], [3, 2]); const ev = G.resolve(s); ok(ev.fx.some(f => f.type === 'boom'), 'Pháo hoa nổ dây chuyền'); ok(ev.fx.some(f => f.type === 'row'), 'Sóng ngang quét hàng'); }
/* 10. cát, thùng, khoá */
{ const G = board([[3, 0, 0], [3, 1, 0], [2, 2, 0]], ['........', '........', '........', 'ss......', '..b.....', '........', '........', '........']);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const x = G.cells[r][c]; if (x.box) x.t = null; }
  G.cells[3][0].t = { id: 900, k: 'n', c: 0 }; G.cells[3][1].t = { id: 901, k: 'n', c: 0 };
  const s = G.swap([2, 2], [3, 2]); const ev = G.resolve(s);
  ok(ev.sand.length === 2 && G.cells[3][0].sand === 0, 'ghép trên cát thì dọn cát'); ok(ev.box.length === 1 && G.cells[4][2].box === 0, 'ghép cạnh thùng thì vỡ thùng'); }
{ const G = board([[3, 0, 0], [3, 1, 0], [2, 2, 0]], ['........', '........', '........', '.k......', '........', '........', '........', '........']);
  G.cells[3][1].t = { id: 902, k: 'n', c: 0 };
  ok(!G.canSwap([3, 1], [2, 1]), 'viên bị khoá không đổi chỗ được');
  const s = G.swap([2, 2], [3, 2]); const ev = G.resolve(s); ok(ev.unlock.length === 1 && G.cells[3][1].lock === 0 && G.cells[3][1].t, 'ghép trúng thì mở khoá, viên ở lại'); }
/* 11. rơi bù: không còn ô trống, ô ngoài bàn vẫn trống; trượt chéo qua thùng */
{ const L = { id: 0, colors: 5, time: 30, goals: [{ k: 'box' }], map: ['........', '........', '...b....', '........', '........', ' ...... ', '........', '........'] };
  const G = new X.Game(L, 3);
  for (let r = 3; r < 8; r++) G.cells[r][3].t = G.cells[r][3].hole ? null : null;
  G.fall();
  let empty = 0; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const x = G.cells[r][c]; if (G.open(x) && !x.t) empty++; if (x.hole && x.t) empty += 100; }
  ok(empty === 0, 'sau khi rơi không còn ô trống (kể cả dưới thùng)'); }
/* 12. hành lý chạm đáy được giao */
{ const L = { id: 0, colors: 5, time: 30, lug: 1, goals: [{ k: 'lug', n: 1 }], map: Array(8).fill('........') };
  const G = new X.Game(L, 5); G.cells[7][4].t = { id: 999, k: 'l', c: -1 };
  const got = G.collect(); ok(got.length === 1 && G.prog.lug === 1 && G.won(), 'hành lý chạm đáy → giao khách, đạt mục tiêu'); }
/* 13. bàn đầu của 20 phòng: không tự nổ, luôn có nước đi; bot qua được */
for (const L of X.LEVELS) {
  let bad = 0; for (let s = 1; s <= 25; s++) { const G = new X.Game(L, s); if (G.findGroups().length || !G.hasMoves()) bad++; }
  ok(!bad, `phòng ${L.id}: ${bad}/25 bàn đầu lỗi`);
  let won = 0; for (let s = 1; s <= 4; s++) { const G = new X.Game(L, s * 31 + 7); let mv = 0; while (!G.won() && mv < 250) { const m = G.bestMove(); if (!m) { G.shuffle(); mv++; continue; } G.play(m.a, m.b); mv++; } if (G.won()) won++; }
  ok(won === 4, `phòng ${L.id}: bot qua ${won}/4 ván`);
  ok(L.goals.length && L.time >= 20 && L.stars && L.stars.length === 3, `phòng ${L.id}: thiếu mục tiêu / giờ / mốc sao`);
}
/* 14. xáo bàn luôn ra bàn có nước đi */
{ const G = new X.Game(X.LEVELS[10], 9); for (let i = 0; i < 20; i++) { G.shuffle(); if (!G.hasMoves() || G.findGroups().length) { ok(false, 'xáo bàn ra bàn hỏng'); break; } } pass++; }

/* 15. bộ từ khởi đầu khớp game Khách sạn (quên chạy tools/xiao/build-words.js là báo) */
{ const r = require('child_process').spawnSync(process.execPath, [require('path').join(__dirname, '../xiao/build-words.js'), '--check'], { encoding: 'utf8' }); ok(r.status === 0, 'hotel/xiao-words.js chưa sinh lại: ' + (r.stdout || r.stderr).trim()); }

console.log(`Lõi ghép 3: ${pass} đạt, ${fail} lỗi`);
process.exit(fail ? 1 : 0);
