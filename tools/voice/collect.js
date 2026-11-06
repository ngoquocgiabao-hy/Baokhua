/* Gom mọi câu tiếng Trung mà game.html đọc thành tiếng → tools/voice/lines.json
   Chạy từ thư mục repo:  node tools/voice/collect.js
   Cần Playwright (npm i playwright, hoặc máy đã có sẵn). Không gọi mạng ngoài: tự mở máy chủ tĩnh tạm trên 127.0.0.1. */
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..', '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.woff2': 'font/woff2' };

const srv = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const f = path.join(ROOT, u === '/' ? 'index.html' : u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});

srv.listen(0, '127.0.0.1', async () => {
  const port = srv.address().port;
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto(`http://127.0.0.1:${port}/game.html`);
  await p.waitForFunction(() => window.__bao && window.__bao.fullZh);
  const lines = await p.evaluate(() => {
    const B = window.__bao, out = new Map();
    const HAN = /[㐀-鿿]/;
    const norm = t => String(t || '').replace(/…/g, '').trim();
    const add = (t, role, py, vi) => { const k = norm(t); if (k && HAN.test(k) && !out.has(k)) out.set(k, { text: k, role, py: py || '', vi: vi || '' }); };
    // mọi bộ ba [chữ Hán, pinyin, nghĩa Việt] trong STAGES / STORY / STORY_INTRO
    const walk = (o, role) => {
      if (Array.isArray(o)) {
        if (o.length >= 2 && typeof o[0] === 'string' && typeof o[1] === 'string' && HAN.test(o[0])) add(o[0], role, o[1], o[2]);
        o.forEach(x => walk(x, role));
      } else if (o && typeof o === 'object') Object.keys(o).forEach(k => walk(o[k], k === 'taunt' ? 'boss' : role));
    };
    walk(B.STAGES, 'learn');
    walk(B.STORY, 'npc');
    walk(STORY_INTRO, 'npc');
    add('看招！', 'hero', 'Kàn zhāo!', 'Đỡ chiêu!');
    // câu hỏi: câu nghe + câu hoàn chỉnh đọc khi lộ đáp án
    B.QUESTIONS.forEach(q => {
      if (q.speak) add(q.speak, 'question', q.py, q.vi);
      add(B.fullZh(q), 'question', q.py, q.vi);
    });
    return [...out.values()];
  });
  const file = path.join(__dirname, 'lines.json');
  fs.writeFileSync(file, JSON.stringify(lines, null, 1));
  const by = lines.reduce((m, l) => (m[l.role] = (m[l.role] || 0) + 1, m), {});
  console.log(`Đã gom ${lines.length} câu →`, path.relative(ROOT, file), by);
  await b.close(); srv.close();
});
