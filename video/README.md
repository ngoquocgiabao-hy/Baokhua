# Xưởng video Bảo Khựa 阿宝

Máy tự dựng video dọc 9:16 (1080×1920, 30 khung hình/giây) bằng HyperFrames: mỗi video là một trang HTML, chữ Hán là quân bài 3D thật (three.js), nhạc viết bằng code nên không dính bản quyền.
Đọc **`HANDOFF.md`** trước (thể loại, lịch đăng, luật). Luật chung của repo ở `../CLAUDE.md`.

## Cấu trúc thư mục
| Thư mục | Có gì | Trong git |
|---|---|---|
| `assets/fonts/` | Phông viết tay Patrick Hand (OFL) cho F11 | Có |
| `tools/` | `engine3d.js` (quân bài, tấm ảnh 3D, pháo giấy, vòng sáng), `gemini_check.py` (Gemini kiểm pinyin và nghĩa), `capcut_kit.cjs`, `capcut_cutkit.py` (xuất dự án CapCut để Bảo tự sửa), `capcut_mac.py` (tệp bấm đúp mở dự án trên Mac), `long_tieng.py` (lồng giọng thật, nhạc tự hạ khi nói, cân về −14 LUFS) | Có |
| `series/` | Khuôn dựng từng thể loại: `giaotrinh3d.mjs` (F9), `comic_reel.mjs` (F10), `nhatky.mjs` (F11), `cauthat.mjs` (F8), `chuthat.mjs` (F2), nhạc `music_bed.py`, `music_series.py` | Có |
| `giaotrinh/` | Dữ liệu tập F9 lấy từ giáo trình HSK0 → HSK4 của game mới (`gt01.json`…) | Có |
| `debut/` | Trailer thương hiệu, nhạc, bản 16:9 / 4:5 (`platforms.cjs`) | Có |
| `story/` | Nhạc piano kể chuyện (trong git); ảnh, raw, kịch bản, chú thích đời tư (ngoài git) | Một phần |
| `_luu_tru/game-cu/` | Bộ dựng video từ game cũ `khachsan.html` (F3, F4). Đã bỏ 06/11/2026 | Có |
| `out/`, `assets/*.mp4` | Video dựng ra, cảnh quay | Không |

## Chạy
```bash
cd video
npm i                                              # một lần: HyperFrames, GSAP, three.js
node series/giaotrinh3d.mjs giaotrinh/gt01.json    # sinh trang → out/gt01/
cd out/gt01 && npx hyperframes snapshot --at 3,12,24 --no-end -o /tmp/snap .   # xem nhanh vài khung
npx hyperframes render -o ../BAOKHUA_GIAO_TRINH_3D_GT01_master.mp4              # dựng thật, khoảng 10 phút cho 60 giây
```
Nén bản đăng: `ffmpeg -i X_master.mp4 -c:v libx264 -crf 20 -preset slow -maxrate 18M -bufsize 36M -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart X_9x16.mp4`.
Kiểm chữ Trung trước khi đăng: `GEMINI_API_KEY=... python3 tools/gemini_check.py . out/KIEM.json giaotrinh/gt01.json` (khoá chỉ đặt trong biến môi trường).
Máy dựng chạy lâu: chạy tách hẳn khỏi phiên bằng `HYPERFRAMES_RENDER_DETACHED=1 setsid nohup ... &`.

## Thể loại đang dùng
| Mã | Tên | Khuôn | Ghi chú |
|---|---|---|---|
| F9 | Giáo trình 3D · phân tích sâu (≤ 60 giây) | `series/giaotrinh3d.mjs` | Thay toàn bộ video game cũ. Bảo lồng tiếng theo `out/<mã>/vo.md` |
| F11 | Nhật ký hành trình (30–40 giây) | `series/nhatky.mjs` + `tools/capcut_cutkit.py` | Polaroid trên giấy sổ tay, bản đồ đường đi, thẻ chữ Hán lật 3D, câu nói thật viết tay |
| F10 | Reel comic từ raw (20–35 giây) | `series/comic_reel.mjs` + `tools/capcut_kit.cjs` | Bong bóng truyện tranh chữ Hán + pinyin + nghĩa, kèm bộ CapCut để Bảo tự sửa |
| F8 | Chuyện thật · Câu thật | `series/cauthat.mjs` | Raw đời thật của Bảo |
| F2 | Chữ thật · ảnh thật | `series/chuthat.mjs` | Ảnh có chữ Hán thật |
| F1 | Chuyện thật (hành trình) | `story/build_story*.mjs` (ngoài git) | |
| F5 | Trailer | `debut/build_debut.mjs` | Đoạn 14–22 giây đang dùng game cũ, phải quay lại bằng game mới |

## Luật
- Không commit video, ảnh cá nhân, khoá API. Video xong cất lên Drive `BAO KHUA - SO CAI/03_VIDEO`.
- Không ghi "miễn phí", không nhắc S-VIP, hoàn tiền, không hứa ngày mở 6–10★. Tiếng Trung luôn kèm pinyin có dấu và nghĩa Việt.
- Bot không tự đăng. Bảo đăng bằng tài khoản của mình.
