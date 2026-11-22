/* =====================================================================
   BỘ ĐỒ NGHỀ CHUNG CHO MINI-GAME · Khu trò chơi Suối nóng 温泉电玩城 (v8.4 · 22/11/2026)
   Dùng cho arcade.html (khu trò chơi) và chill.html (Ngâm chill 泡温泉). 消消乐 (xiao.html) có bản riêng tương đương.
   - Store  : đọc/ghi localStorage an toàn
   - Bridge : nối game Khách sạn. Trong khung #evt → postMessage {type:'bk-xiao', kind:'learn'|'done'|'close'|'ready'};
              mở riêng → hộp thư bk_xiao_inbox (game Khách sạn nhận khi mở lại). Mini-game CHỈ ĐỌC bk_hotel_v3.
   - Words  : danh mục thẻ (bk_words_v1 do game Khách sạn ghi, hoặc bộ khởi đầu xiao-words.js), thẻ đến hạn trong Sổ ôn
   - Voice  : giọng đọc tiếng Trung có sẵn trên máy (không gọi máy chủ ngoài)
   - Tasks  : 3 nhiệm vụ suối nóng mỗi ngày (bk_arcade_v1), xong cả 3 nhận thưởng xu trong game
   ===================================================================== */
(function (root) {
  'use strict';
  const HOTEL_KEY = 'bk_hotel_v3', INBOX_KEY = 'bk_xiao_inbox', WORDS_KEY = 'bk_words_v1', ARC_KEY = 'bk_arcade_v1';
  const QS = new URLSearchParams(location.search);
  const IN_FRAME = (() => { try { return window.parent !== window && QS.has('in'); } catch (e) { return true; } })();
  const Store = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };
  let HS = Store.get(HOTEL_KEY, null);
  const hotel = () => (HS = Store.get(HOTEL_KEY, null));
  const Bridge = {
    post(o) { try { window.parent.postMessage(Object.assign({ type: 'bk-xiao' }, o), location.origin); } catch (e) {} },
    inbox(f) { const b = Store.get(INBOX_KEY, null) || { coins: 0, pts: 0, learn: [], rooms: 0 }; f(b); b.at = Date.now(); Store.set(INBOX_KEY, b); },
    learn(id, ok) { if (!id) return; if (IN_FRAME) this.post({ kind: 'learn', id, ok }); else this.inbox(b => { b.learn.push([id, ok ? 1 : 0, Date.now()]); if (b.learn.length > 400) b.learn = b.learn.slice(-400); }); },
    /** thưởng xu trong game (không đổi ra tiền); rooms: số "lượt" để game Khách sạn giới hạn xu nhận từ hộp thư */
    reward(coins, pts, tag) { if (IN_FRAME) this.post({ kind: 'done', coins, pts, room: tag || 'mini' }); else this.inbox(b => { b.coins += coins; b.pts += pts; b.rooms++; b.last = { room: tag || 'mini', coins }; }); },
    coins() { const h = hotel(); return (h ? h.coins || 0 : 0) + (IN_FRAME ? 0 : ((Store.get(INBOX_KEY, null) || {}).coins || 0)); },
    close() { if (IN_FRAME) this.post({ kind: 'close' }); else location.href = './'; },
  };
  addEventListener('message', e => { if (e.origin !== location.origin || !e.data || e.data.type !== 'bk-xiao-state') return; HS = Object.assign(HS || {}, e.data.hs || {}); if (root.onHotelState) root.onHotelState(); });

  const Words = (() => {
    let CAT = [];
    function load() {
      const ex = Store.get(WORDS_KEY, null), src = ex && Array.isArray(ex.cards) && ex.cards.length >= 20 ? ex.cards : (root.XIAO_WORDS || []);
      const viNorm = v => { const w = String(v).split(' '); return w.length > 1 && /^\p{Lu}/u.test(w[1]) ? v : v.charAt(0).toLowerCase() + v.slice(1); };
      const seen = new Set(); CAT = [];
      src.forEach(w => { if (!w || !w[0] || !w[1] || !w[3] || seen.has(w[0])) return; seen.add(w[0]); CAT.push({ id: w[0], zh: w[1], py: w[2] || '', vi: viNorm(w[3]), lv: +w[4] || 0 }); });
    }
    load();
    const byId = id => CAT.find(c => c.id === id);
    function dueIds() { const cs = (HS && HS.cards) || {}, now = Date.now(); return Object.keys(cs).filter(id => cs[id] && cs[id].due <= now && byId(id)).sort((a, b) => cs[a].due - cs[b].due); }
    let recent = [];
    /** chọn 1 thẻ: thẻ đến hạn trước, rồi thẻ đã học, rồi từ mới mức ≤ hsk */
    function pick(hsk = 1) {
      const fresh = c => c && !recent.includes(c.id);
      let c = null;
      const due = dueIds().map(byId).filter(fresh); if (due.length && Math.random() < .55) c = due[0];
      if (!c) { const seen = Object.keys((HS && HS.cards) || {}).map(byId).filter(fresh); if (seen.length && Math.random() < .35) c = seen[(Math.random() * seen.length) | 0]; }
      if (!c) { let pool = CAT.filter(x => x.lv <= hsk && fresh(x)); if (!pool.length) pool = CAT.filter(fresh); if (!pool.length) pool = CAT; c = pool[(Math.random() * pool.length) | 0]; }
      recent.push(c.id); if (recent.length > 8) recent.shift();
      return c;
    }
    /** n thẻ khác nghĩa, khác chữ với c (làm phương án nhiễu) */
    function others(c, n) { const out = []; const pool = CAT.filter(x => x.id !== c.id && x.vi !== c.vi && x.zh !== c.zh).sort(() => Math.random() - .5); for (const x of pool) { if (out.length >= n) break; if (!out.some(o => o.vi === x.vi || o.zh === x.zh)) out.push(x); } return out; }
    return { load, pick, others, dueIds, byId, get size() { return CAT.length; } };
  })();

  const Voice = (() => {
    const ss = window.speechSynthesis; let v = null, mute = false;
    function pickV() { if (!ss) return; const vs = ss.getVoices() || []; v = vs.find(x => /zh[-_]CN/i.test(x.lang)) || vs.find(x => /^zh/i.test(x.lang)) || null; }
    if (ss) { pickV(); try { ss.addEventListener('voiceschanged', pickV); } catch (e) {} }
    return { get ok() { return !!(ss && v); }, set mute(m) { mute = m; }, say(t) { if (mute || !ss || !v) return; try { ss.cancel(); const u = new SpeechSynthesisUtterance(t); u.voice = v; u.lang = v.lang; u.rate = .85; ss.speak(u); } catch (e) {} } };
  })();

  /** nhiệm vụ suối nóng mỗi ngày: chơi 消消乐 1 phòng, ngâm chill 10 bong bóng, trả lời đúng 5 câu ở bất kỳ trò nào */
  const Tasks = (() => {
    const today = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
    const LIST = [{ k: 'xiao', n: 1, t: 'Dọn xong 1 phòng 消消乐' }, { k: 'chill', n: 10, t: 'Ngâm chill: chạm đúng 10 bong bóng' }, { k: 'ok', n: 5, t: 'Trả lời đúng 5 câu ở bất kỳ trò nào' }];
    const REWARD = 30;
    function get() { let a = Store.get(ARC_KEY, null); if (!a || a.day !== today()) a = { day: today(), got: {}, claimed: false }; return a; }
    function bump(k, n = 1) { const a = get(); a.got[k] = (a.got[k] || 0) + n; Store.set(ARC_KEY, a); }
    function state() { const a = get(); const items = LIST.map(x => ({ ...x, have: Math.min(x.n, a.got[x.k] || 0), done: (a.got[x.k] || 0) >= x.n })); return { items, all: items.every(i => i.done), claimed: a.claimed, reward: REWARD }; }
    function claim() { const a = get(); if (a.claimed || !state().all) return 0; a.claimed = true; Store.set(ARC_KEY, a); return REWARD; }
    return { bump, state, claim, LIST };
  })();

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const vib = p => { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} };
  root.BKMini = { Store, Bridge, Words, Voice, Tasks, IN_FRAME, QS, esc, vib, hotel, get HS() { return HS; }, HOTEL_KEY };
})(typeof self !== 'undefined' ? self : this);
