/* Ā Bǎo 消消乐 (xiāoxiāolè · trò ghép xoá) – LÕI LOGIC ghép 3, không vẽ, không âm thanh.
   Dùng chung cho trang chơi (hotel/xiao.html) và bộ kiểm thử Node (tools/test/xiao-core.js).
   Bàn: lưới ô (cells[r][c]) = { hole, sand, box, lock, t }.
     hole  ô trống ngoài bàn (không có gì đi qua)
     sand  lớp cát 沙 shā (0–2) dưới viên ngọc: xoá viên ngọc nằm trên là bớt 1 lớp
     box   thùng hàng 箱 xiāng (máu 0–2): đứng yên, vỡ khi ghép ngay cạnh hoặc trúng nổ
     lock  khoá 锁 suǒ: viên ngọc bị khoá không đổi chỗ, không rơi; ghép trúng hoặc nổ trúng thì mở khoá (viên ngọc ở lại)
     t     viên ngọc { id, k, c }: k = 'n' thường · 'h' sóng ngang · 'v' sóng dọc · 'f' pháo hoa · 'p' ngọc 宝 · 'l' hành lý
           c = màu 0..5 (ngọc 宝 và hành lý: -1)
   Luật đặc biệt (giống thể loại ghép 3 nói chung, tên và hình riêng của Bảo Khựa):
     4 viên thẳng hàng → Sóng 浪 làng (xoá cả hàng nếu hàng ngang, cả cột nếu hàng dọc)
     hình chữ L / T     → Pháo hoa 烟花 yānhuā (nổ 3×3)
     5 viên thẳng hàng → Ngọc 宝 bǎo (đổi chỗ với viên nào thì xoá hết màu đó)
   Đổi chỗ 2 viên đặc biệt với nhau là có đòn ghép (xem swap()). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.XiaoCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------- số ngẫu nhiên có hạt giống (để kiểm thử lặp lại được) ---------- */
  function Rng(seed) { this.s = (seed >>> 0) || 1; }
  Rng.prototype.next = function () { let t = (this.s = (this.s + 0x6D2B79F5) >>> 0); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  Rng.prototype.int = function (n) { return Math.floor(this.next() * n); };

  const K = (r, c) => r * 64 + c;
  const SPECIAL = { h: 1, v: 1, f: 1, p: 1 };

  /* ---------- bản đồ màn chơi ----------
     Ký tự: '.' ô thường · ' ' ô trống ngoài bàn · 's' cát 1 lớp · 'S' cát 2 lớp · 'b' thùng 1 máu · 'B' thùng 2 máu
            'k' viên ngọc bị khoá · 'q' khoá trên cát 1 lớp · 'L' hành lý ban đầu */
  function Game(L, seed) {
    this.L = L; this.map = L.map; this.R = L.map.length; this.C = L.map[0].length;
    this.ncol = L.colors || 5; this.rng = new Rng(seed || 1); this.uid = 1;
    this.score = 0; this.chain = 0; this.moves = 0;
    this.prog = { col: [0, 0, 0, 0, 0, 0], lug: 0, made: 0 };
    this.lugSpawned = 0;
    this.cells = [];
    for (let r = 0; r < this.R; r++) {
      const row = [];
      for (let c = 0; c < this.C; c++) {
        const ch = L.map[r][c] || ' ';
        row.push({ hole: ch === ' ', sand: ch === 's' || ch === 'q' ? 1 : ch === 'S' ? 2 : 0, box: ch === 'b' ? 1 : ch === 'B' ? 2 : 0, lock: ch === 'k' || ch === 'q' ? 1 : 0, t: null });
      }
      this.cells.push(row);
    }
    this.top = []; this.exit = [];
    for (let c = 0; c < this.C; c++) {
      let t = -1, e = -1; for (let r = 0; r < this.R; r++) if (!this.cells[r][c].hole) { if (t < 0) t = r; e = r; }
      this.top.push(t); this.exit.push(e);
    }
    this.sand0 = this.count(x => x.sand); this.box0 = this.count(x => x.box); this.lock0 = this.count(x => x.lock ? 1 : 0);
    this.fillInitial();
  }
  const P = Game.prototype;

  P.count = function (f) { let n = 0; for (const row of this.cells) for (const x of row) if (!x.hole) n += f(x) || 0; return n; };
  P.cell = function (r, c) { return r >= 0 && c >= 0 && r < this.R && c < this.C ? this.cells[r][c] : null; };
  P.tile = function (k, c) { return { id: this.uid++, k, c }; };
  P.newColor = function () { return this.rng.int(this.ncol); };
  /** ô có thể chứa viên rơi vào: trong bàn, không thùng, không khoá */
  P.open = function (x) { return x && !x.hole && !x.box && !x.lock; };
  /** viên ngọc rơi được / đổi chỗ được */
  P.movable = function (x) { return !!(x && !x.hole && !x.box && !x.lock && x.t); };
  P.colorAt = function (r, c) { const x = this.cell(r, c); if (!x || x.hole || x.box || !x.t) return -1; return x.t.c; };

  P.fillInitial = function () {
    for (let tries = 0; tries < 60; tries++) {
      for (let r = 0; r < this.R; r++) for (let c = 0; c < this.C; c++) {
        const x = this.cells[r][c], ch = this.map[r][c];
        if (x.hole || x.box) { x.t = null; continue; }
        if (ch === 'L') { x.t = this.tile('l', -1); continue; }
        let col, guard = 0;
        do { col = this.newColor(); guard++; }
        while (guard < 30 && ((c >= 2 && this.colorAt(r, c - 1) === col && this.colorAt(r, c - 2) === col) || (r >= 2 && this.colorAt(r - 1, c) === col && this.colorAt(r - 2, c) === col)));
        x.t = this.tile('n', col);
      }
      this.lugSpawned = this.count(x => x.t && x.t.k === 'l' ? 1 : 0);
      if (!this.findGroups().length && this.hasMoves()) return;
    }
    this.shuffle();
  };

  /* ---------- tìm nhóm ghép ---------- */
  P.findGroups = function () {
    const R = this.R, C = this.C, runs = [];
    for (let r = 0; r < R; r++) { let c = 0; while (c < C) { const k = this.colorAt(r, c); if (k < 0) { c++; continue; } let e = c + 1; while (e < C && this.colorAt(r, e) === k) e++; if (e - c >= 3) runs.push({ d: 'h', cells: Array.from({ length: e - c }, (_, i) => [r, c + i]), color: k }); c = e; } }
    for (let c = 0; c < C; c++) { let r = 0; while (r < R) { const k = this.colorAt(r, c); if (k < 0) { r++; continue; } let e = r + 1; while (e < R && this.colorAt(e, c) === k) e++; if (e - r >= 3) runs.push({ d: 'v', cells: Array.from({ length: e - r }, (_, i) => [r + i, c]), color: k }); r = e; } }
    if (!runs.length) return [];
    const par = runs.map((_, i) => i), find = i => par[i] === i ? i : (par[i] = find(par[i])), own = new Map();
    runs.forEach((run, i) => run.cells.forEach(([r, c]) => { const k = K(r, c); if (own.has(k)) par[find(i)] = find(own.get(k)); else own.set(k, i); }));
    const by = new Map();
    runs.forEach((run, i) => { const g = find(i); if (!by.has(g)) by.set(g, []); by.get(g).push(run); });
    const out = [];
    for (const rs of by.values()) {
      const seen = new Map(); rs.forEach(run => run.cells.forEach(([r, c]) => seen.set(K(r, c), [r, c])));
      const max = Math.max(...rs.map(x => x.cells.length)), hasH = rs.some(x => x.d === 'h'), hasV = rs.some(x => x.d === 'v');
      let kind = null, x = null;
      if (max >= 5) kind = 'p';
      else if (hasH && hasV) { kind = 'f'; const hk = new Set(); rs.filter(q => q.d === 'h').forEach(q => q.cells.forEach(([r, c]) => hk.add(K(r, c)))); rs.filter(q => q.d === 'v').forEach(q => q.cells.forEach(([r, c]) => { if (hk.has(K(r, c))) x = [r, c]; })); }
      else if (max === 4) kind = rs.find(q => q.cells.length === 4).d;
      out.push({ cells: [...seen.values()], color: rs[0].color, kind, x, size: seen.size, long: max });
    }
    return out;
  };

  /** ô (r,c) có nằm trong một dãy ≥ 3 cùng màu không (kiểm nhanh quanh 1 ô) */
  P.lineAt = function (r, c) {
    const k = this.colorAt(r, c); if (k < 0) return 0;
    let h = 1, v = 1;
    for (let i = c - 1; i >= 0 && this.colorAt(r, i) === k; i--) h++;
    for (let i = c + 1; i < this.C && this.colorAt(r, i) === k; i++) h++;
    for (let i = r - 1; i >= 0 && this.colorAt(i, c) === k; i--) v++;
    for (let i = r + 1; i < this.R && this.colorAt(i, c) === k; i++) v++;
    return (h >= 3 ? h : 0) + (v >= 3 ? v : 0);
  };

  /* ---------- đổi chỗ ---------- */
  P.adj = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
  P.canSwap = function (a, b) { return this.adj(a, b) && this.movable(this.cell(a[0], a[1])) && this.movable(this.cell(b[0], b[1])); };
  /** giá trị nhanh của một nước đi (0 = không hợp lệ). Dùng cho gợi ý và kiểm còn nước đi. */
  P.moveValue = function (a, b) {
    if (!this.canSwap(a, b)) return 0;
    const A = this.cells[a[0]][a[1]], B = this.cells[b[0]][b[1]], ta = A.t, tb = B.t;
    if (ta.k === 'p' || tb.k === 'p') return ta.k === 'p' && tb.k === 'p' ? 60 : 30;
    if (SPECIAL[ta.k] && SPECIAL[tb.k]) return 25;
    if (ta.k === 'l' && tb.k === 'l') return 0;
    A.t = tb; B.t = ta;
    const v = this.lineAt(a[0], a[1]) + this.lineAt(b[0], b[1]);
    A.t = ta; B.t = tb;
    return v;
  };
  P.findMoves = function () {
    const out = [];
    for (let r = 0; r < this.R; r++) for (let c = 0; c < this.C; c++) {
      for (const [dr, dc] of [[0, 1], [1, 0]]) { const a = [r, c], b = [r + dr, c + dc]; const v = this.moveValue(a, b); if (v) out.push({ a, b, v }); }
    }
    return out;
  };
  P.hasMoves = function () {
    for (let r = 0; r < this.R; r++) for (let c = 0; c < this.C; c++) {
      if (this.moveValue([r, c], [r, c + 1]) || this.moveValue([r, c], [r + 1, c])) return true;
    }
    return false;
  };
  P.hint = function () { const m = this.findMoves(); if (!m.length) return null; m.sort((x, y) => y.v - x.v); return m[0]; };

  P.allCells = function (f) { const o = []; for (let r = 0; r < this.R; r++) for (let c = 0; c < this.C; c++) { const x = this.cells[r][c]; if (!x.hole && (!f || f(x, r, c))) o.push([r, c]); } return o; };
  P.mostColor = function () { const n = [0, 0, 0, 0, 0, 0]; for (const row of this.cells) for (const x of row) if (x.t && x.t.c >= 0 && !x.hole) n[x.t.c]++; let b = 0; n.forEach((v, i) => { if (v > n[b]) b = i; }); return b; };
  P.rowCells = function (r) { return this.allCells((x, rr) => rr === r); };
  P.colCells = function (c) { return this.allCells((x, rr, cc) => cc === c); };
  P.areaCells = function (r, c, d) { return this.allCells((x, rr, cc) => Math.abs(rr - r) <= d && Math.abs(cc - c) <= d); };

  /** đổi chỗ a ↔ b (b = ô viên ngọc được kéo tới). Trả về { ok, combo, seed, consume } để resolve() dùng ở lượt đầu. */
  P.swap = function (a, b) {
    if (!this.canSwap(a, b)) return { ok: false };
    const A = this.cells[a[0]][a[1]], B = this.cells[b[0]][b[1]], ta = A.t, tb = B.t;
    A.t = tb; B.t = ta;                              // viên kéo (ta) giờ ở b
    const fx = [];
    if (ta.k === 'p' || tb.k === 'p') {
      const pPos = ta.k === 'p' ? b : a, oPos = ta.k === 'p' ? a : b, other = ta.k === 'p' ? tb : ta;
      if (other.k === 'p') { fx.push({ type: 'nova', r: b[0], c: b[1] }); return this.ok({ combo: 'pp', seed: this.allCells(), fx, consume: [a, b] }); }
      const col = other.c >= 0 ? other.c : this.mostColor();
      const targets = this.allCells(x => x.t && x.t.c === col && !x.box);
      if (other.k === 'h' || other.k === 'v' || other.k === 'f') {
        targets.forEach(([r, c]) => { const t = this.cells[r][c].t; if (t.k === 'n') t.k = other.k === 'f' ? 'f' : (this.rng.next() < .5 ? 'h' : 'v'); });
        fx.push({ type: 'pearl', r: pPos[0], c: pPos[1], col, targets, convert: other.k });
        return this.ok({ combo: 'p' + other.k, seed: targets, fx, consume: [pPos] });
      }
      fx.push({ type: 'pearl', r: pPos[0], c: pPos[1], col, targets });
      return this.ok({ combo: 'pn', seed: targets.concat(other.k === 'l' ? [] : [oPos]), fx, consume: [pPos] });
    }
    if (SPECIAL[ta.k] && SPECIAL[tb.k]) {
      const w = q => q.k === 'h' || q.k === 'v', [r, c] = b;
      let seed;
      if (w(ta) && w(tb)) { seed = this.rowCells(r).concat(this.colCells(c)); fx.push({ type: 'row', r, c, col: ta.c }, { type: 'col', r, c, col: tb.c }); }
      else if (ta.k === 'f' && tb.k === 'f') { seed = this.areaCells(r, c, 2); fx.push({ type: 'boom', r, c, rad: 2, col: ta.c }); }
      else { seed = []; for (let d = -1; d <= 1; d++) { seed = seed.concat(this.rowCells(r + d), this.colCells(c + d)); fx.push({ type: 'row', r: r + d, c, col: ta.c }, { type: 'col', r, c: c + d, col: tb.c }); } }
      return this.ok({ combo: 'ss', seed, fx, consume: [a, b] });
    }
    if (this.lineAt(a[0], a[1]) || this.lineAt(b[0], b[1])) return this.ok({ pref: [b, a] });
    A.t = ta; B.t = tb;                              // không ghép được → trả lại
    return { ok: false };
  };
  P.ok = function (o) { this.moves++; this.chain = 0; o.ok = true; return o; };

  /** vùng nổ của 1 viên đặc biệt khi bị kích hoạt */
  P.blastOf = function (t, r, c, fx) {
    if (t.k === 'h') { fx.push({ type: 'row', r, c, col: t.c }); return this.rowCells(r); }
    if (t.k === 'v') { fx.push({ type: 'col', r, c, col: t.c }); return this.colCells(c); }
    if (t.k === 'f') { fx.push({ type: 'boom', r, c, rad: 1, col: t.c }); return this.areaCells(r, c, 1); }
    if (t.k === 'p') { const col = this.mostColor(), targets = this.allCells(x => x.t && x.t.c === col && !x.box); fx.push({ type: 'pearl', r, c, col, targets }); return targets; }
    return [];
  };

  /* ---------- một lượt xoá (một tầng dây chuyền) ----------
     opt.seed     ô bị nổ sẵn (đòn ghép, bom, búa)   opt.fx  hiệu ứng kèm
     opt.consume  viên đặc biệt đã dùng trong đòn ghép (xoá, không tự nổ)
     opt.pref     ô ưu tiên đặt viên đặc biệt mới (ô người chơi vừa kéo tới)
     Trả về null nếu không có gì để xoá. */
  P.resolve = function (opt) {
    opt = opt || {};
    this.chain++;
    const clear = new Map(), fx = (opt.fx || []).slice(), make = [], createAt = new Set();
    const groups = this.findGroups(), pref = opt.pref || [];
    let pts = 0;
    for (const g of groups) {
      pts += g.long >= 5 ? 200 : g.kind === 'f' ? 150 : g.long === 4 ? 120 : 60 + (g.size - 3) * 20;
      if (g.kind) {
        const cand = g.cells.filter(([r, c]) => { const x = this.cells[r][c]; return x.t && x.t.k === 'n' && !x.lock; });
        const hit = p => cand.find(([r, c]) => r === p[0] && c === p[1]);
        let pos = null; for (const p of pref) { pos = hit(p); if (pos) break; }
        if (!pos && g.x) pos = hit(g.x);
        if (!pos) pos = cand[Math.floor(cand.length / 2)];
        if (pos) { make.push({ r: pos[0], c: pos[1], k: g.kind, col: g.kind === 'p' ? -1 : g.color }); createAt.add(K(pos[0], pos[1])); }
      }
      for (const [r, c] of g.cells) if (!createAt.has(K(r, c))) clear.set(K(r, c), { r, c, how: 'm' });
    }
    const used = new Set();
    for (const [r, c] of opt.consume || []) { const x = this.cells[r][c]; if (x.t) used.add(x.t.id); clear.set(K(r, c), { r, c, how: 'u' }); }
    for (const [r, c] of opt.seed || []) { const k = K(r, c); if (!clear.has(k) && !createAt.has(k)) clear.set(k, { r, c, how: 'b' }); }
    if (!clear.size && !make.length) { this.chain--; return null; }
    /* dây chuyền: viên đặc biệt bị xoá thì tự nổ */
    const queue = [...clear.values()], done = new Set();
    while (queue.length) {
      const e = queue.shift(), x = this.cells[e.r][e.c], t = x.t;
      if (!t || x.lock || x.box || used.has(t.id) || done.has(t.id) || !SPECIAL[t.k] || createAt.has(K(e.r, e.c))) continue;
      done.add(t.id);
      for (const [r, c] of this.blastOf(t, e.r, e.c, fx)) { const k = K(r, c); if (!clear.has(k) && !createAt.has(k)) { const ne = { r, c, how: 'b' }; clear.set(k, ne); queue.push(ne); } }
    }
    /* áp dụng */
    const removed = [], sand = [], box = [], unlock = [], boxHit = new Set();
    for (const e of clear.values()) {
      const x = this.cells[e.r][e.c];
      if (x.hole) continue;
      if (x.box) { if (e.how !== 'm') boxHit.add(K(e.r, e.c)); continue; }
      if (x.lock) { x.lock = 0; unlock.push([e.r, e.c]); pts += 40; continue; }
      const t = x.t; if (!t || t.k === 'l') continue;
      removed.push({ r: e.r, c: e.c, t, how: e.how });
      if (t.c >= 0) this.prog.col[t.c]++;
      x.t = null;
      if (x.sand) { x.sand--; sand.push([e.r, e.c, x.sand]); pts += 100; }
      if (e.how === 'b') pts += 30;
      if (e.how === 'm') for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const y = this.cell(e.r + dr, e.c + dc); if (y && y.box) boxHit.add(K(e.r + dr, e.c + dc)); }
    }
    for (const k of boxHit) { const r = Math.floor(k / 64), c = k % 64, x = this.cells[r][c]; if (x.box > 0) { x.box--; box.push([r, c, x.box]); pts += 50; } }
    for (const m of make) { const x = this.cells[m.r][m.c]; if (x.t) { x.t.k = m.k; x.t.c = m.col; this.prog.made++; } }
    const mult = Math.min(this.chain, 6);
    pts *= mult; this.score += pts;
    return { removed, made: make, fx, sand, box, unlock, pts, chain: this.chain, groups: groups.length };
  };

  /* ---------- rơi và bù viên mới ----------
     Mỗi viên đi qua ô nào thì ghi vào t.path (để trang chơi vẽ rơi mượt, kể cả trượt chéo qua thùng/ô trống). */
  P.fall = function () {
    const R = this.R, C = this.C, spawned = new Array(C).fill(0), touched = [];
    for (const row of this.cells) for (const x of row) if (x.t) x.t.path = null;
    const move = (r0, c0, r1, c1) => { const t = this.cells[r0][c0].t; this.cells[r0][c0].t = null; this.cells[r1][c1].t = t; if (!t.path) { t.path = [[r0, c0]]; touched.push(t); } t.path.push([r1, c1]); };
    const feeds = (r, c) => { for (let y = r - 1; y >= -1; y--) { if (y < this.top[c]) return true; const x = this.cells[y][c]; if (x.hole || x.box || x.lock) return false; if (x.t) return true; } return true; };
    let any = true, guard = 0;
    while (any && guard++ < 600) {
      any = false;
      for (let r = R - 1; r >= 0; r--) for (let c = 0; c < C; c++) {
        const x = this.cells[r][c]; if (!this.open(x) || x.t) continue;
        const up = r > 0 ? this.cells[r - 1][c] : null;
        if (this.movable(up)) { move(r - 1, c, r, c); any = true; continue; }
        if (r === this.top[c]) {
          const t = this.spawnTile(); t.path = [[r - 1 - spawned[c]++, c], [r, c]]; t.born = 1; x.t = t; touched.push(t); any = true;
        }
      }
      if (any) continue;
      outer: for (let r = R - 1; r >= 1; r--) for (let c = 0; c < C; c++) {
        const x = this.cells[r][c]; if (!this.open(x) || x.t || feeds(r, c)) continue;
        for (const dc of this.rng.next() < .5 ? [-1, 1] : [1, -1]) {
          const cc = c + dc; if (cc < 0 || cc >= C) continue;
          if (this.movable(this.cells[r - 1][cc])) { move(r - 1, cc, r, c); any = true; break outer; }
        }
      }
    }
    return touched;
  };
  P.spawnTile = function () {
    const n = this.L.lug || 0, on = this.count(x => x.t && x.t.k === 'l' ? 1 : 0);
    if (n && this.lugSpawned < n && on < 2 && (on === 0 || this.rng.next() < .15) && this.prog.lug + on < n) { this.lugSpawned++; return this.tile('l', -1); }
    return this.tile('n', this.newColor());
  };
  /** hành lý chạm đáy cột thì giao cho khách. Trả về danh sách ô đã giao. */
  P.collect = function () {
    const got = [];
    for (let c = 0; c < this.C; c++) { const r = this.exit[c]; if (r < 0) continue; const x = this.cells[r][c]; if (x.t && x.t.k === 'l') { got.push({ r, c, t: x.t }); x.t = null; this.prog.lug++; this.score += 1000; } }
    return got;
  };

  /** xáo bàn khi hết nước đi (hoặc dùng quyền 洗牌 xǐpái) */
  P.shuffle = function () {
    const pos = this.allCells(x => this.movable(x) && x.t.k !== 'l');
    for (let tries = 0; tries < 200; tries++) {
      const ts = pos.map(([r, c]) => this.cells[r][c].t);
      for (let i = ts.length - 1; i > 0; i--) { const j = this.rng.int(i + 1); [ts[i], ts[j]] = [ts[j], ts[i]]; }
      pos.forEach(([r, c], i) => { this.cells[r][c].t = ts[i]; });
      if (!this.findGroups().length && this.hasMoves()) return true;
      if (tries > 120) pos.forEach(([r, c]) => { const t = this.cells[r][c].t; if (t.k === 'n') t.c = this.newColor(); });
    }
    return false;
  };

  /* ---------- quyền trợ giúp (trang chơi hỏi 1 câu trước khi cho dùng) ---------- */
  P.bombSeed = function (r, c) { const fx = [{ type: 'boom', r, c, rad: 1, col: -1, bomb: 1 }]; return { seed: this.areaCells(r, c, 1), fx }; };
  P.hammerSeed = function (r, c) { return { seed: [[r, c]], fx: [{ type: 'hammer', r, c }] }; };

  /* ---------- mục tiêu ---------- */
  P.goals = function () {
    return (this.L.goals || []).map(g => {
      let have = 0, need = g.n || 0;
      if (g.k === 'score') have = this.score;
      else if (g.k === 'col') have = this.prog.col[g.c];
      else if (g.k === 'sand') { need = this.sand0; have = this.sand0 - this.count(x => x.sand); }
      else if (g.k === 'box') { need = this.box0; have = this.box0 - this.count(x => x.box ? 1 : 0); }
      else if (g.k === 'lock') { need = this.lock0; have = this.lock0 - this.count(x => x.lock ? 1 : 0); }
      else if (g.k === 'lug') have = this.prog.lug;
      return { k: g.k, c: g.c, have: Math.min(have, need), need, done: have >= need };
    });
  };
  P.won = function () { return this.goals().every(g => g.done); };
  P.stars = function () { const s = this.L.stars || [0, 1e9, 1e9]; return this.score >= s[2] ? 3 : this.score >= s[1] ? 2 : 1; };

  /* ---------- chơi trọn 1 nước (dùng cho bot kiểm thử và mô phỏng; trang chơi tự chạy từng bước để vẽ) ---------- */
  P.play = function (a, b, pre) {
    const s = pre || this.swap(a, b); if (!s.ok) return null;
    let o = { seed: s.seed, fx: s.fx, consume: s.consume, pref: s.pref }, rounds = 0;
    for (;;) { const ev = this.resolve(o); o = null; if (!ev) break; rounds++; this.fall(); while (this.collect().length) this.fall(); }
    if (!this.hasMoves()) this.shuffle();
    return rounds;
  };
  P.clone = function () {
    const g = Object.create(P);
    for (const k of Object.keys(this)) g[k] = this[k];
    g.rng = new Rng(this.rng.s);
    g.prog = { col: this.prog.col.slice(), lug: this.prog.lug, made: this.prog.made };
    g.cells = this.cells.map(row => row.map(x => ({ hole: x.hole, sand: x.sand, box: x.box, lock: x.lock, t: x.t ? { id: x.t.id, k: x.t.k, c: x.t.c } : null })));
    return g;
  };
  /** điểm "có ích cho mục tiêu" của trạng thái (bot dùng để chọn nước) */
  P.utility = function () {
    let u = this.score * .02;
    const gs = this.L.goals || [];
    for (const g of gs) {
      if (g.k === 'col') u += Math.min(this.prog.col[g.c], g.n) * 6;
      else if (g.k === 'sand') u -= this.count(x => x.sand) * 14;
      else if (g.k === 'box') u -= this.count(x => x.box) * 12;
      else if (g.k === 'lock') u -= this.count(x => x.lock) * 12;
      else if (g.k === 'lug') { u += this.prog.lug * 200; for (let r = 0; r < this.R; r++) for (let c = 0; c < this.C; c++) { const x = this.cells[r][c]; if (x.t && x.t.k === 'l') u += r * 6; } }
    }
    if (gs.some(g => g.k === 'sand' || g.k === 'box' || g.k === 'lock')) u += this.prog.made * 2;
    return u;
  };
  /** nước đi tốt nhất theo 1 bước nhìn trước (bot kiểm thử; không dùng trong trang chơi) */
  P.bestMove = function () {
    let best = null, bu = -Infinity;
    for (const m of this.findMoves()) {
      const g = this.clone(); g.rng = new Rng(this.rng.s ^ 0x5bd1e995); const rounds = g.play(m.a, m.b); if (rounds == null) continue;   // không cho bot biết trước viên rơi xuống
      const u = g.utility() + rounds * .5;
      if (u > bu) { bu = u; best = { a: m.a, b: m.b, rounds }; }
    }
    return best;
  };

  /** nước đi kiểu người chơi bình thường: nhìn nhanh, chọn 1 trong vài nước "trông được" (kiểm thử độ khó) */
  P.casualMove = function () {
    const m = this.findMoves(); if (!m.length) return null;
    m.sort((x, y) => y.v - x.v + (this.rng.next() - .5) * 3);
    return m[Math.min(m.length - 1, this.rng.int(3))];
  };

  /* ---------- 20 phòng (4 tầng × 5 phòng) ----------
     time   giây ban đầu (đồng hồ chạy nhanh: hết giờ thì trả lời câu hỏi để có thêm giây)
     colors số màu ngọc (ít màu = nhiều dây chuyền)
     goals  score · col (gom c màu) · sand (dọn hết cát) · box (phá hết thùng) · lock (mở hết khoá) · lug (giao hành lý)
     stars  mốc điểm 1★ · 2★ · 3★
     hsk    mức từ vựng của câu hỏi (0 = HSK0 …) */
  const F = '........';
  const LEVELS = [
    // Tầng 1 · Sảnh đón 大堂 dàtáng · HSK0
    { id: 1, name: 'Phòng 101', colors: 4, time: 30, hsk: 0, goals: [{ k: 'score', n: 3000 }], stars: [3000, 6000, 9000], map: [F, F, F, F, F, F, F, F], tip: 'Kéo 1 viên sang ô bên cạnh để xếp 3 viên cùng màu.' },
    { id: 2, name: 'Phòng 102', colors: 4, time: 20, hsk: 0, goals: [{ k: 'col', c: 0, n: 18 }, { k: 'col', c: 1, n: 18 }], stars: [2500, 5000, 8000], map: [F, F, F, F, F, F, F, F], tip: 'Xếp 4 viên thẳng hàng được Sóng 浪 làng: xoá cả hàng.' },
    { id: 3, name: 'Phòng 103', colors: 4, time: 20, hsk: 0, goals: [{ k: 'sand' }], stars: [3000, 6000, 9500], map: [F, F, '..ssss..', '..ssss..', '..ssss..', '..ssss..', F, F], tip: 'Cát 沙 shā: ghép ngay trên ô cát để dọn.' },
    { id: 4, name: 'Phòng 104', colors: 5, time: 20, hsk: 0, goals: [{ k: 'col', c: 3, n: 20 }, { k: 'score', n: 4000 }], stars: [4000, 7500, 11000], map: [' ...... ', F, F, F, F, F, F, ' ...... '], tip: 'Hình chữ L hoặc T được Pháo hoa 烟花 yānhuā: nổ 3×3.' },
    { id: 5, name: 'Phòng 105', colors: 4, time: 25, hsk: 0, lug: 2, goals: [{ k: 'lug', n: 2 }], stars: [3500, 7000, 10500], map: ['...L....', F, F, F, F, F, F, F], tip: 'Đưa hành lý 行李 xíngli xuống đáy bàn để giao cho khách.' },
    // Tầng 2 · Nhà hàng 餐厅 cāntīng · HSK1
    { id: 6, name: 'Phòng 201', colors: 5, time: 30, hsk: 1, goals: [{ k: 'sand' }], stars: [5000, 9000, 13000], map: [F, F, '.ssssss.', '.sSSSSs.', '.sSSSSs.', '.ssssss.', F, F], tip: 'Cát 2 lớp phải ghép 2 lần.' },
    { id: 7, name: 'Phòng 202', colors: 5, time: 20, hsk: 1, goals: [{ k: 'box' }], stars: [4000, 8000, 12000], map: [F, F, F, 'bbb..bbb', F, F, F, F], tip: 'Thùng hàng 箱 xiāng vỡ khi ghép ngay bên cạnh.' },
    { id: 8, name: 'Phòng 203', colors: 5, time: 25, hsk: 1, goals: [{ k: 'lock' }, { k: 'col', c: 4, n: 12 }], stars: [4500, 8500, 12500], map: [F, '.k....k.', F, '...kk...', F, F, '.k....k.', F], tip: 'Khoá 锁 suǒ: ghép trúng viên bị khoá để mở.' },
    { id: 9, name: 'Phòng 204', colors: 5, time: 35, hsk: 1, lug: 2, goals: [{ k: 'lug', n: 2 }, { k: 'box' }], stars: [5000, 9500, 14000], map: [F, '...bb...', F, '..L..L..', F, F, F, F], tip: 'Phá thùng mở đường cho hành lý rơi xuống.' },
    { id: 10, name: 'Phòng 205', colors: 5, time: 25, hsk: 1, goals: [{ k: 'sand' }, { k: 'box' }], stars: [6000, 11000, 16000], map: ['  ....  ', ' ...... ', '..sbbs..', '.ss..ss.', '.ss..ss.', '..sbbs..', ' ...... ', '  ....  '], tip: 'Phòng tổng thống: dọn cát và phá thùng.' },
    // Tầng 3 · Phòng nghỉ 客房 kèfáng · HSK2 (thẻ tự học)
    { id: 11, name: 'Phòng 301', colors: 6, time: 40, hsk: 2, goals: [{ k: 'col', c: 2, n: 22 }, { k: 'col', c: 5, n: 22 }], stars: [5000, 9500, 14000], map: [F, F, F, F, F, F, F, F, F] },
    { id: 12, name: 'Phòng 302', colors: 5, time: 30, hsk: 2, goals: [{ k: 'sand' }], stars: [7000, 12000, 17000], map: [F, '.ssssss.', '.s....s.', '.s.ss.s.', '.s.ss.s.', '.s....s.', '.ssssss.', F] },
    { id: 13, name: 'Phòng 303', colors: 5, time: 25, hsk: 2, goals: [{ k: 'box' }, { k: 'lock' }], stars: [6000, 11000, 16000], map: [F, F, '.BB..BB.', '.k....k.', '..kbbk..', F, F, F] },
    { id: 14, name: 'Phòng 304', colors: 5, time: 45, hsk: 2, lug: 2, goals: [{ k: 'lug', n: 2 }], stars: [5000, 9000, 14000], map: [F, '..bbbb..', F, '..L..L..', F, F, F, '  ....  '] },
    { id: 15, name: 'Phòng 305', colors: 6, time: 30, hsk: 2, goals: [{ k: 'sand' }, { k: 'box' }], stars: [8000, 13000, 19000], map: [F, '..bbbb..', '.s....s.', '.ss..ss.', '.ss..ss.', '.s....s.', F, F] },
    // Tầng 4 · Sân thượng ngắm vịnh 天台 tiāntái · HSK3 (thẻ tự học)
    { id: 16, name: 'Phòng 401', colors: 6, time: 40, hsk: 3, goals: [{ k: 'lock' }, { k: 'col', c: 0, n: 18 }], stars: [6000, 11000, 16000], map: [F, '.k....k.', F, '...kk...', F, F, '.k....k.', F] },
    { id: 17, name: 'Phòng 402', colors: 6, time: 45, hsk: 3, goals: [{ k: 'sand' }, { k: 'lock' }], stars: [8000, 14000, 20000], map: [' ...... ', '..q..q..', F, '..s..s..', '..s..s..', F, '..q..q..', ' ...... '] },
    { id: 18, name: 'Phòng 403', colors: 6, time: 60, hsk: 3, lug: 2, goals: [{ k: 'lug', n: 2 }, { k: 'box' }], stars: [7000, 12000, 18000], map: ['.b....b.', F, '...bb...', F, '..L..L..', F, F, F] },
    { id: 19, name: 'Phòng 404', colors: 6, time: 40, hsk: 3, goals: [{ k: 'box' }, { k: 'sand' }], stars: [9000, 15000, 22000], map: [F, '..BBBB..', '.s....s.', '...ss...', '...ss...', '.s....s.', '..bbbb..', F] },
    { id: 20, name: 'Phòng 405', colors: 6, time: 70, hsk: 3, lug: 2, goals: [{ k: 'lug', n: 2 }, { k: 'sand' }], stars: [9000, 15000, 22000], map: [F, F, '.s....s.', '..L..L..', '..ssss..', '.s....s.', F, F] },
  ];

  return { Game, Rng, LEVELS, SPECIAL };
});
