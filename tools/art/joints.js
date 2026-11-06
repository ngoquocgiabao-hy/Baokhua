/* Ước lượng khớp xương cho tranh nhân vật bằng MediaPipe Pose (chạy trong Chromium không giao diện), ghi vào tools/art/rig_joints.json.
   Chuẩn bị 1 lần (trong thư mục tools/art):
     npm i @mediapipe/tasks-vision playwright
     curl -o pose_heavy.task https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task
   Chạy:  node tools/art/joints.js hero1 factory-idle ...    rồi   python3 tools/art/rig.py <tên…>
   (node_modules và pose_heavy.task không commit — đã có trong .gitignore) */
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const HERE = __dirname, ROOT = path.resolve(HERE, '..', '..');
const names = process.argv.slice(2);
if (!names.length) { console.log('Dùng: node tools/art/joints.js <tên tranh trong v4/sprites> ...'); process.exit(1); }
const PAD = 80;
const TYPES = { '.html': 'text/html', '.mjs': 'text/javascript', '.js': 'text/javascript', '.wasm': 'application/wasm', '.webp': 'image/webp', '.task': 'application/octet-stream' };
const PAGE = `<!doctype html><meta charset="utf-8"><body><script type="module">
import { PoseLandmarker, FilesetResolver } from '/mp/vision_bundle.mjs';
window.run = async (names, pad) => {
  const fsr = await FilesetResolver.forVisionTasks('/mp/wasm');
  const pl = await PoseLandmarker.createFromOptions(fsr, { baseOptions: { modelAssetPath: '/pose_heavy.task', delegate: 'CPU' }, runningMode: 'IMAGE', numPoses: 1, minPoseDetectionConfidence: .1, minPosePresenceConfidence: .1 });
  const out = {};
  for (const n of names) {
    const im = new Image(); im.src = '/spr/' + n + '.webp'; await im.decode();
    const c = document.createElement('canvas'); c.width = im.width + pad * 2; c.height = im.height + pad * 2;
    const x = c.getContext('2d'); x.fillStyle = '#ebebeb'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, pad, pad);
    const r = pl.detect(c);
    out[n] = r.landmarks && r.landmarks[0] ? r.landmarks[0].map(p => [Math.round(p.x * c.width - pad), Math.round(p.y * c.height - pad)]) : null;
  }
  return out;
};
window.ready = true;
</script></body>`;
const srv = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  let f = null;
  if (u === '/') { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end(PAGE); }
  if (u.startsWith('/mp/')) f = path.join(HERE, 'node_modules/@mediapipe/tasks-vision', u.slice(4));
  else if (u.startsWith('/spr/')) f = path.join(ROOT, 'v4/sprites', u.slice(5));
  else if (u === '/pose_heavy.task') f = path.join(HERE, 'pose_heavy.task');
  if (!f || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
srv.listen(0, '127.0.0.1', async () => {
  const b = await chromium.launch(), p = await b.newPage();
  await p.goto(`http://127.0.0.1:${srv.address().port}/`); await p.waitForFunction(() => window.ready);
  const r = await p.evaluate(([n, pad]) => window.run(n, pad), [names, PAD]);
  const file = path.join(HERE, 'rig_joints.json'), J = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  const KEEP = [0, 7, 8, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28, 31, 32];
  for (const [n, L] of Object.entries(r)) {
    if (!L) { console.log(n, ': không nhận ra tư thế'); continue; }
    J[n] = Object.fromEntries(KEEP.map(i => [String(i), L[i]])); console.log(n, ': ok');
  }
  fs.writeFileSync(file, JSON.stringify(J));
  await b.close(); srv.close();
});
