# Xưởng video Bảo Khựa (HyperFrames)

Dựng hàng loạt video dọc 9:16 (1080×1920, 30 khung hình/giây) cho TikTok. Bảo không phải quay màn hình.

## Ngôn ngữ hình ảnh (v2 – 3D)
- **Cảnh game là thế giới**: quay ở độ nét gấp 6, phủ kín khung dọc. Máy quay nghiêng, kéo lùi, trôi ngang.
- **Chữ Hán là quân bài 3D thật**: three.js, động cơ `tools/engine3d.js`. Quân bài rơi, lật, xoay lên, đập vào, rồi bị đánh bay khi đổi từ. Có ánh sáng môi trường, bóng mềm và pháo giấy.
- **Pinyin, nghĩa, tiêu đề**: chữ phồng nhiều lớp viền kiểu show tạp kỹ, cùng băng dính vàng đen. Mỗi thứ vào một kiểu, không lặp.
- **Kết bằng hành động**: thế giới thu lại thành màn hình điện thoại nghiêng 3D, sau đó quân 阿宝 đập xuống.
- Học từ các repo mg-styles-15 (Hanazi, Isometric), huashu-art-motion (luật dùng ống kính, 6 cách làm hỏng) và từ tài liệu chuyển động của HyperFrames.

## Ba mẫu video

| Mã | Mẫu | Nội dung | Dài |
|---|---|---|---|
| `tv01`–`tv14` | Từ vựng | Quân bài 3D cho mỗi từ; pinyin là chữ phồng, nghĩa nằm trên băng dính; máy quay đổi góc mỗi từ | 16–20 giây |
| `hn-hotel-*`, `hn-factory-*` | 3 giây trả lời | Câu Việt, đếm ngược bằng quân bài 3D 3-2-1, chớp sáng rồi lật câu Trung, pháo giấy | 26 giây |
| `kg01` | Khai giảng | 1★ vụt sang 5★, quân bài lịch 3D "04/11", thông tin lớp, kết bằng điện thoại 3D | 19 giây |

Mọi video kết bằng câu kêu gọi trong `config.json` → `cta`.

## Dữ liệu lấy từ đâu
- Từ vựng: `WORDS` trong `../khachsan.html`.
- Câu hỏi: `QUESTIONS_RAW` trong `../khachsan.html`.

Game và video dùng chung một nguồn, nên sửa câu trong game là video tự đúng theo. `config.json` chỉ giữ tiêu đề, cách chia nhóm từ, câu kêu gọi và thông tin lớp.

## Chạy
```bash
cd video
npm i                      # cài HyperFrames, GSAP, three.js (một lần)
npm run capture            # máy tự quay game → assets/clip_*.mp4 (khoảng 8 phút, cần Playwright)
npm run list               # xem danh sách mã video
node tools/build.mjs       # dựng tất cả → out/*.mp4 và out/CAPTIONS.md
node tools/build.mjs tv04 kg01   # chỉ dựng vài video
```
Mỗi video mất khoảng 5–9 phút để dựng (3D vẽ bằng CPU). Xem trước và sửa tay: `node tools/build.mjs tv04 --no-render`, sau đó `npx hyperframes preview out/build/tv04`.

## Thêm video mới (ít token nhất)
- Thêm một nhóm từ: thêm một dòng vào `config.json` → `tuvung`, với các khoá trong `WORDS` (ví dụ `"moto"`).
- Thêm câu hỏi: thêm vào `QUESTIONS_RAW` trong game. Công cụ tự chia thành video 3 câu.
- Sau ngày 04/11: sửa `cta.line2` và `khaigiang`, rồi dựng lại.

## Luật
- Không commit MP4: `out/` và `assets/*.mp4` đã được bỏ qua. Video xong thì cất lên Drive `03_VIDEO`.
- Câu Trung mới phải qua Gemini kiểm trước khi Bảo đăng. Bot không tự đăng.
- Không ghi "miễn phí", không nhắc S-VIP, không hứa ngày mở 6–10★.
- Âm thanh lấy từ `../v4/audio`, là đồ của dự án. Muốn dùng nhạc thịnh hành thì Bảo thêm trong TikTok/CapCut.

## Trailer debut (`debut/`)
Trailer 46 giây, tông vàng Minion và đen, nhạc 120 BPM tự tổng hợp bằng code (`debut/music.py`, không dính bản quyền, −14 LUFS).
```bash
node debut/build_debut.mjs                 # bản có ngày khai giảng → out/debut/
node debut/build_debut.mjs --evergreen     # bản không ghi ngày → out/debut-evergreen/
cd out/debut && npx hyperframes render -o ../BAOKHUA_DEBUT_9x16_master.mp4    # khoảng 9 phút
node debut/platforms.cjs [--evergreen]     # 16:9, 4:5, ảnh bìa (cần bản 9:16 đã nén ở out/)
```
Chú thích từng nền tảng: `debut/CAPTIONS_DEBUT.md`. Mọi dữ kiện về Bảo lấy từ trang chủ đã công khai.
