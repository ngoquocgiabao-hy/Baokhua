# tools/film – quay phim thật từ thế giới 3D của game Khách sạn

Dựng từng khung hình bằng chính `hotel/world.js` (không quay màn hình, nên hình mượt, đều 30 khung/giây).

- `film.html`: chỉ có thế giới 3D (không giao diện game). `?star=1..5` = hạng sao khách sạn.
- `path.js`: đường bay máy quay `[giây, x, z, S (độ phóng), giờ trong game, nhãn khu]`. Nhãn khu khớp `PLACES` trong `world.js`.
- `render.js`: `node tools/film/render.js <thư mục ra> 1920 30` → `f0000.jpg…` (khung vuông 1920², cắt sau ra 16:9 / 9:16).
- `stars.js`: `AY=7 node tools/film/stars.js <thư mục ra> 15 18.3` → `star1..5.jpg` 1080×1920 (khách sạn từ 1★ tới 5★, cùng góc máy).

Cần: máy chủ tĩnh ở gốc repo cổng 8766, có hỗ trợ Range (GitHub Pages có sẵn; khi thử ở máy dùng `npx http-server -p 8766` hoặc tương đương), Playwright + Chromium. Chạy WebGL phần mềm: `--use-angle=swiftshader`.
Hook quay phim trong `world.js`: `World._film(true)` dừng vòng lặp tự chạy; `World._frame(dt, at, S, { hour, view, skip })` bước 1 khung.

Phim trên trang chủ (`v4/home/city-tour-*`): khung 1920² → cắt
- 16:9: `crop=1920:1080:0:420,scale=1600:900`, h264 `-crf 28 -g 10` (khoá hình dày để tua theo cuộn mượt) + webm VP9 `-crf 41 -g 10` dự phòng (khoảng 7 MB);
- 9:16: `crop=1080:1920:420:0,scale=810:1440`, h264 `-crf 28` + webm VP9 `-crf 40` (khoảng 3,3 MB).
- Ảnh chờ: khung đầu, cắt như trên, jpg chất lượng 82.
(08/11: tăng từ 1152×648 / 540×960 vì trên máy tính và điện thoại màn nét bị mờ.)
