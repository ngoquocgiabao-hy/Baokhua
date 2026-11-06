// Bộ CapCut cho một reel đã sinh bằng series/comic_reel.mjs: Bảo tự mở và sửa trong CapCut, không cần máy ảo.
//   node tools/capcut_kit.cjs out/<id>          → out/<id>/capcut_kit/ và out/<id>/<TÊN>_CapCut.zip
// Trong bộ: clips/ (các cảnh đã cắt, đã lọc comic), bong_bong/ (PNG nền trong suốt), phu_de_{zh,pinyin,vi}.srt, music.wav,
// và thư mục dự án CapCut dựng bằng capcut-cli (video, 3 lớp chữ, lớp bong bóng, nhạc).
// Cần capcut-cli: npm i capcut-cli (đường dẫn qua biến CAPCUT_BIN, mặc định npx capcut).
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const dir = path.resolve(process.argv[2]), kit = JSON.parse(fs.readFileSync(path.join(dir, 'kit.json'), 'utf8'));
const OUT = path.join(dir, 'capcut_kit'), name = process.env.DRAFT_NAME || `BaoKhua_${kit.id}_comic`;
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(path.join(OUT, 'bong_bong'), { recursive: true });
const CAP = process.env.CAPCUT_BIN ? [process.env.CAPCUT_BIN] : ['npx', '--prefix', '/tmp/ccli', 'capcut'];
const cap = (...a) => JSON.parse(execFileSync(CAP[0], [...CAP.slice(1), ...a], { encoding: 'utf8' }) || '{}');
const ts = s => { const ms = Math.round(s * 1000), h = ms / 3600000 | 0, m = ms / 60000 % 60 | 0, se = ms / 1000 % 60 | 0; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(se).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };

(async () => {
  const clips = kit.items.filter(i => i.file), bubs = kit.items.filter(i => i.bubble);
  // 1. ảnh bong bóng nền trong suốt (cùng kiểu với video)
  const css = fs.readFileSync(path.join(dir, 'index.html'), 'utf8').match(/<style>([\s\S]*?)<\/style>/)[1];
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const [i, it] of bubs.entries()) {
    const x = it.bubble, long = [...x.zh].length > 8 ? ' long' : '';
    await p.setContent(`<style>${css} html,body{background:transparent!important;width:1080px;height:1920px;overflow:hidden}</style><div style="position:absolute;left:0;right:0;top:${x.top ?? 300}px;display:flex;justify-content:center;transform:rotate(-2deg)"><div class="bub ${x.side || 'left'}${long}"><div class="zh">${x.zh}</div><div class="py">${x.py}</div><div class="vi">${x.vi}</div></div></div>`);
    await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(OUT, 'bong_bong', `bb${i + 1}.png`), omitBackground: true });
  }
  await b.close();
  // 2. phụ đề 3 lớp
  for (const [k, f] of [['zh', 'zh'], ['py', 'pinyin'], ['vi', 'vi']])
    fs.writeFileSync(path.join(OUT, `phu_de_${f}.srt`), bubs.map((it, i) => `${i + 1}\n${ts(it.start)} --> ${ts(it.start + it.dur)}\n${it.bubble[k]}\n`).join('\n'));
  // 3. cảnh + nhạc
  fs.mkdirSync(path.join(OUT, 'clips'), { recursive: true });
  for (const c of clips) fs.copyFileSync(path.join(dir, 'clips', c.file), path.join(OUT, 'clips', c.file));
  fs.copyFileSync(path.join(dir, 'music.wav'), path.join(OUT, 'music.wav'));
  // 4. dự án CapCut
  const drafts = path.join(OUT, 'du_an_capcut'); fs.mkdirSync(drafts, { recursive: true });
  cap('init', name, '--drafts', drafts, '--ratio', '9:16', '-q');
  const D = path.join(drafts, name);
  for (const c of clips) cap('add-video', D, path.join(OUT, 'clips', c.file), `${c.start}s`, `${c.dur}s`, '--track-name', 'Canh quay', '-q');
  bubs.forEach((it, i) => {
    cap('add-video', D, path.join(OUT, 'bong_bong', `bb${i + 1}.png`), `${it.start}s`, `${it.dur}s`, '--track-name', 'Bong bong (anh)', '-q');
    cap('add-text', D, `${it.start}s`, `${it.dur}s`, it.bubble.zh, '--track-name', 'Chu Han', '--font-size', '13', '--color', '#111111', '--y', '0.62', '-q');
    cap('add-text', D, `${it.start}s`, `${it.dur}s`, it.bubble.py, '--track-name', 'Pinyin', '--font-size', '7', '--color', '#C2410C', '--y', '0.52', '-q');
    cap('add-text', D, `${it.start}s`, `${it.dur}s`, it.bubble.vi, '--track-name', 'Tieng Viet', '--font-size', '8', '--color', '#111111', '--y', '0.44', '-q');
  });
  const tail = path.join(dir, 'tail.mp4');
  if (fs.existsSync(tail)) { fs.copyFileSync(tail, path.join(OUT, 'clips', 'z_on_tap_keu_goi.mp4')); cap('add-video', D, path.join(OUT, 'clips', 'z_on_tap_keu_goi.mp4'), `${kit.tail}s`, `${(kit.dur - kit.tail).toFixed(3)}s`, '--track-name', 'Canh quay', '-q'); }
  // lớp chữ để sửa: ẩn sẵn (cờ attribute = 1 trên track), lớp ảnh bong bóng hiện
  for (const f of ['draft_content.json', 'draft_info.json']) { const q = path.join(D, f); if (!fs.existsSync(q)) continue; const j = JSON.parse(fs.readFileSync(q, 'utf8')); (j.tracks || []).forEach(t => { if (t.type === 'text') t.attribute = 1; }); fs.writeFileSync(q, JSON.stringify(j)); }
  cap('add-audio', D, path.join(OUT, 'music.wav'), '0s', `${kit.dur}s`, '--volume', '0.9', '--track-name', 'Nhac', '-q');
  let lint; try { lint = execFileSync(CAP[0], [...CAP.slice(1), 'lint', D, '--no-check-paths'], { encoding: 'utf8' }); } catch (e) { lint = e.stdout; }
  fs.writeFileSync(path.join(OUT, 'lint.json'), lint || '');
  console.log('Bộ CapCut:', OUT, '| bong bóng', bubs.length, '| cảnh', clips.length);
})();
