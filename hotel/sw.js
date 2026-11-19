/* Service worker · game Khách sạn Vịnh Ā Bǎo (hotel/, PWA)
   v8.3 · tải nhanh khi mạng yếu:
   - Thư viện 3D (lib/) và biểu tượng: lấy BỘ NHỚ TRƯỚC (không đổi giữa các bản) → lần sau mở game không phải tải lại 675 KB.
   - Trang và mã game: lấy MẠNG TRƯỚC để người chơi nhận bản mới ngay, nhưng mạng chậm quá 3 giây thì dùng bản đã lưu
     (bản mới vẫn tải tiếp và lưu cho lần sau). Mất mạng thì dùng bản đã lưu.
   - Mỗi trang lưu theo đúng đường dẫn (trước v8.3 mọi trang lưu chung khoá index.html → mở xiao.html có thể ghi đè trang game).
   - Nhắc ôn khi app đóng: trang ghi lịch ôn vào Cache 'bk-srs' (./__srs); đến giờ nhắc mà còn thẻ đến hạn thì hiện thông báo
     "Hôm nay có N thẻ cần ôn" (mỗi ngày 1 lần). Chạy qua periodicsync (Chrome Android đã cài app) hoặc khi trang gửi 'remind'.
   Đổi V khi muốn xoá bộ nhớ đệm cũ. */
const V = 'bk-hotel-v8-3b', SLOW_MS = 3000;
const SHELL = ['./', './index.html', './world.js', './w-kit.js', './w-life.js', './w-lobby.js', './lib/three.module.min.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './xiao.html', './xiao-core.js', './xiao-words.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => (k.startsWith('bk-hotel-') || k.startsWith('bk-hub-')) && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
/** khoá lưu: đường dẫn không kèm ?…#… ; thư mục → index.html */
const keyOf = u => new Request(u.origin + (u.pathname.endsWith('/') ? u.pathname + 'index.html' : u.pathname));
function put(key, res) { if (res && res.ok && res.type === 'basic') { const c = res.clone(); caches.open(V).then(x => x.put(key, c)).catch(() => {}); } return res; }
function cacheFirst(r, key) { return caches.match(key).then(hit => hit || fetch(r).then(res => put(key, res))); }
function netFirst(r, key) {
  const net = fetch(r).then(res => put(key, res)), cached = caches.match(key);
  return new Promise(resolve => {
    let done = false; const fin = v => { if (!done && v) { done = true; resolve(v); } };
    net.then(fin, () => cached.then(hit => fin(hit || Response.error())));
    setTimeout(() => cached.then(hit => fin(hit)), SLOW_MS);   // mạng chậm: dùng bản đã lưu, bản mới tải tiếp ở nền
  });
}
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || /\.(mp4|webm)$/.test(u.pathname) || u.pathname.endsWith('/__srs')) return;
  const key = keyOf(u);
  e.respondWith(/\/lib\/|\/icon-\d+\.png$/.test(u.pathname) ? cacheFirst(r, key) : netFirst(r, key));
});
const DAY = 864e5;
function dayStart(t) { const d = new Date(t); d.setHours(4, 0, 0, 0); if (t < d.getTime()) d.setDate(d.getDate() - 1); return d.getTime(); }
async function remind() {
  const cache = await caches.open('bk-srs'), hit = await cache.match('./__srs'); if (!hit) return;
  const s = await hit.json().catch(() => null); if (!s || !s.on) return;
  const now = Date.now(), d = new Date(dayStart(now)), today = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  if (s.notified === today || new Date(now).getHours() < (s.hour || 20)) return;
  const n = (s.due || []).filter(t => t < dayStart(now) + DAY).length; if (!n) return;
  await self.registration.showNotification('Khách sạn Vịnh Ā Bǎo', { body: `Hôm nay có ${n} thẻ từ cần ôn. 5 phút là xong!`, icon: 'icon-192.png', badge: 'icon-192.png', tag: 'bk-review', data: { url: './#on-tap' } });
  s.notified = today; await cache.put('./__srs', new Response(JSON.stringify(s)));
  try { if (self.navigator.setAppBadge) await self.navigator.setAppBadge(n); } catch (e) {}
}
self.addEventListener('periodicsync', e => { if (e.tag === 'bk-review') e.waitUntil(remind()); });
self.addEventListener('message', e => { if (e.data === 'remind') e.waitUntil(remind()); });
self.addEventListener('notificationclick', e => {
  e.notification.close(); const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => { for (const w of ws) { if ('focus' in w) { if (w.navigate) w.navigate(url).catch(() => {}); return w.focus(); } } return self.clients.openWindow(url); }));
});
