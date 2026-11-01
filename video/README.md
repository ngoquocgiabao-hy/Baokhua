# Xưởng video Bảo Khựa (HyperFrames)

Dựng hàng loạt video dọc 9:16 (1080×1920, 30 khung hình/giây) cho TikTok. Bảo không phải quay màn hình.

## Ba mẫu video

| Mã | Mẫu | Nội dung | Dài |
|---|---|---|---|
| `tv01`–`tv14` | Từ vựng | Cảnh game Khách sạn 5★ chạy ngày sang đêm, 3–4 từ trên phố Bãi Cháy | 15–18 giây |
| `hn-hotel-*`, `hn-factory-*` | 3 giây trả lời | Câu Việt, đếm ngược 3-2-1, lật câu Trung kèm pinyin | 25 giây |
| `kg01` | Khai giảng | Khách sạn 1★ lên 5★, rồi thông tin lớp Zoom | 17,5 giây |

Mọi video kết bằng câu kêu gọi trong `config.json` → `cta`.

## Dữ liệu lấy từ đâu
- Từ vựng: `WORDS` trong `../khachsan.html`.
- Câu hỏi: `QUESTIONS_RAW` trong `../khachsan.html`.

Game và video dùng chung một nguồn, nên sửa câu trong game là video tự đúng theo. `config.json` chỉ giữ tiêu đề, cách chia nhóm từ, câu kêu gọi và thông tin lớp.

## Chạy
```bash
cd video
npm i                      # cài HyperFrames và GSAP (một lần)
npm run capture            # máy tự quay game → assets/clip_*.mp4 (khoảng 4 phút, cần Playwright)
npm run list               # xem danh sách mã video
node tools/build.mjs       # dựng tất cả → out/*.mp4 và out/CAPTIONS.md
node tools/build.mjs tv04 kg01   # chỉ dựng vài video
```
Mỗi video mất khoảng 40–70 giây để dựng. Xem trước và sửa tay: `node tools/build.mjs tv04 --no-render`, sau đó `npx hyperframes preview out/build/tv04`.

## Thêm video mới (ít token nhất)
- Thêm một nhóm từ: thêm một dòng vào `config.json` → `tuvung`, với các khoá trong `WORDS` (ví dụ `"moto"`).
- Thêm câu hỏi: thêm vào `QUESTIONS_RAW` trong game. Công cụ tự chia thành video 3 câu.
- Sau ngày 04/11: sửa `cta.line2` và `khaigiang`, rồi dựng lại.

## Luật
- Không commit MP4: `out/` và `assets/*.mp4` đã được bỏ qua. Video xong thì cất lên Drive `03_VIDEO`.
- Câu Trung mới phải qua Gemini kiểm trước khi Bảo đăng. Bot không tự đăng.
- Không ghi "miễn phí", không nhắc S-VIP, không hứa ngày mở 6–10★.
- Âm thanh lấy từ `../v4/audio`, là đồ của dự án. Muốn dùng nhạc thịnh hành thì Bảo thêm trong TikTok/CapCut.
