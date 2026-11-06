/* Service worker cho game Khách sạn Vịnh Ā Bǎo hợp nhất (hotel/, PWA).
   - Lưu sẵn tệp chính để mở nhanh, chơi được khi mạng yếu (HTML: lấy mạng trước, tệp tĩnh: lấy bộ nhớ trước).
   - Nhắc ôn khi app đóng: đọc lịch ôn trang gửi vào Cache 'bk-srs' (./__srs), đến giờ nhắc mà còn thẻ đến hạn thì hiện thông báo
     "Hôm nay có N thẻ cần ôn" (mỗi ngày 1 lần). Chạy qua periodicsync (Chrome Android đã cài app) hoặc khi trang vừa ẩn. */
const V = 'bk-hub-v1';
const SHELL = ['./', './index.html', './inside.html', './lib/three.module.min.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', '../v4/sprites/hero1.webp', '../v4/staff/letan-tapsu.webp', '../v4/staff/letan-truong.webp'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('bk-hub-') && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.endsWith('.mp4') || u.pathname.endsWith('/__srs')) return;
  if (r.mode === 'navigate') { e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(V).then(x => x.put('./index.html', c)); return res; }).catch(() => caches.match('./index.html'))); return; }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => hit || fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); } return res; })));
});
const DAY = 864e5;
function dayStart(t) { const d = new Date(t); d.setHours(4, 0, 0, 0); if (t < d.getTime()) d.setDate(d.getDate() - 1); return d.getTime(); }
async function remind() {
  const cache = await caches.open('bk-srs'), hit = await cache.match('./__srs'); if (!hit) return;
  const s = await hit.json(); if (!s || !s.on) return;
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
