# tools/trailer – trailer 9:16 "Bảo Khựa 阿宝 · Khách sạn Vịnh Ā Bǎo"

48 giây, 1080×1920, 30 fps, nhạc tự soạn bằng code (`music.py`, 90 BPM, ngũ cung Rê; cắt cảnh đúng đầu ô nhịp = mỗi 80 khung).

| Khung | Cảnh | Tư liệu (`public/`) |
|---|---|---|
| 0–240 | Bơi giữa vịnh: "Khách Trung đến vịnh mỗi ngày" → 你好！欢迎来到下龙湾 | `swim-a/b/c.mp4`: cắt từ raw `swim_tap1_cau_bai_chay.mp4` giây 70.2–73.8, 75.4–78.8, 67.2–69.4 (đoạn không phụ đề dính, không trẻ em) |
| 240–480 | Bảo là ai: lý lịch, Á quân 2025 | `portrait.jpg` (nửa phải ảnh bìa YouTube "Chuyện thật V2"), `stage.jpg` (= `v4/home/bao-stage.jpg`) |
| 480–800 | Bay qua phố 3D, ghim từng khu (chữ Hán + pinyin + nghĩa) | `tour.mp4`: khung `tools/film/render.js` cắt `crop=1080:1920:420:0`, phát nhanh 1,6 lần |
| 800–1040 | Chơi thế nào: câu hỏi thật trong game → xu → khách sạn 1★ → 5★ | `ui-ask.jpg` (chụp game 360×640 ×3), `star1..5.jpg` (`tools/film/stars.js`) |
| 1040–1200 | Bậc thang HSK0 → HSK4 với câu mẫu | — |
| 1200–1440 | Lời mời: baokhua.com/hotel, nhóm Zalo, TikTok @baokhuaa | `star5.jpg` |

Phông: `public/fonts` (Be Vietnam Pro, Playfair Display, Noto Serif SC rút gọn đúng chữ Hán trong phim; giấy phép OFL). Thêm chữ Hán mới thì tải lại `zh700/zh900.woff2` với tham số `text=` của Google Fonts.
Chữ Trung luôn kèm pinyin và nghĩa Việt; không ghi "miễn phí"; xu chỉ dùng trong game.
