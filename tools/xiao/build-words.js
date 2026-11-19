/* Sinh hotel/xiao-words.js (bộ từ khởi đầu của Ā Bǎo 消消乐) từ đúng dữ liệu game Khách sạn (hotel/index.html):
   giáo trình COURSE (6 bài HSK0–HSK4) + từ cảnh Hạ Long (HALONG trong WORDS). Mã thẻ giữ y như Sổ ôn của game Khách sạn
   (thẻ bài học: id gốc · cảnh Hạ Long: 'w-<khoá>') để từ ôn ở mini-game đi thẳng vào Sổ ôn.
   Chạy lại mỗi khi sửa COURSE / WORDS: node tools/xiao/build-words.js   (kiểm thử tools/test/xiao-core.js báo nếu quên) */
'use strict';
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '../..'), src = fs.readFileSync(path.join(root, 'hotel/index.html'), 'utf8');
function block(name, open, close) {
  const i = src.indexOf(`const ${name} = ${open}`); if (i < 0) throw new Error('không thấy ' + name);
  let d = 0, j = i + `const ${name} = `.length;
  for (let k = j; k < src.length; k++) { const ch = src[k]; if (ch === "'" ) { k++; while (src[k] !== "'") { if (src[k] === '\\') k++; k++; } continue; } if (ch === open) d++; else if (ch === close) { d--; if (!d) return src.slice(j, k + 1); } }
  throw new Error('chưa đóng ' + name);
}
const COURSE = eval('(' + block('COURSE', '[', ']') + ')'), WORDS = eval('(' + block('WORDS', '{', '}') + ')'), HALONG = eval('(' + block('HALONG', '[', ']') + ')');
const out = [];
COURSE.forEach(u => { const lv = +String(u.lv).replace(/\D/g, '') || 0; u.cards.forEach(c => out.push([c.id, c.zh, c.py, c.vi, lv])); });
HALONG.forEach(k => { if (WORDS[k]) out.push(['w-' + k, WORDS[k][0], WORDS[k][1], WORDS[k][2], 0]); });
const body = `/* TỰ SINH bằng tools/xiao/build-words.js từ hotel/index.html – đừng sửa tay.
   Bộ từ khởi đầu của Ā Bǎo 消消乐 khi máy chưa mở game Khách sạn: [mã thẻ Sổ ôn, chữ Hán, pinyin, nghĩa, mức HSK]. */
self.XIAO_WORDS = ${JSON.stringify(out).replace(/\],\[/g, '],\n  [')};
`;
const file = path.join(root, 'hotel/xiao-words.js');
if (process.argv[2] === '--check') { const cur = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''; if (cur !== body) { console.log('hotel/xiao-words.js CŨ – chạy node tools/xiao/build-words.js'); process.exit(1); } console.log('xiao-words.js khớp game Khách sạn (' + out.length + ' từ)'); }
else { fs.writeFileSync(file, body); console.log('đã ghi hotel/xiao-words.js · ' + out.length + ' từ'); }
