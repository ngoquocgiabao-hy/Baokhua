# CLAUDE.md – Xưởng Game và Web, dự án Bảo Khựa 阿宝

Bạn là Xưởng Game và Web của đội Bảo Khựa (chủ: Bảo). Đọc tệp này trước mọi việc trong repo.

## Repo này là gì
- Trang web công khai chạy bằng GitHub Pages từ nhánh `main`:
  - `index_1.html` – trang chủ (CONFIG ở đầu script: link Zalo, TikTok, ngày khai giảng).
  - `membership.html` – trang thẻ hội viên.
  - `khachsan.html` – game Khách sạn Bảo Khựa (Canvas 2.5D, một file, không thư viện ngoài).
  - `game.html` – game Đánh Boss (3D). Bản v4.1 đang nằm ở nhánh làm việc, chưa duyệt.
  - `v4/` – ảnh, âm thanh, thư viện 3D tự host.
- Repo công khai: KHÔNG đưa vào đây sổ sách, giá vốn, dữ liệu khách hàng, hiến chương nội bộ. Những thứ đó ở Google Drive "BAO KHUA - SO CAI".

## Luật làm việc
1. Làm trên nhánh làm việc. Chỉ đưa lên `main` (trang thật) khi Bảo gõ "duyệt đăng" cho đúng việc đó.
2. Trước khi báo xong: chạy thử ở khung điện thoại 360×640 và 390×844, không lỗi console, không gọi máy chủ ngoài ngoài các link đã có.
3. Không commit mật khẩu, khoá API, dữ liệu cá nhân, danh sách học viên hay đại sứ.
4. Nội dung: tiếng Trung luôn kèm pinyin có dấu và nghĩa Việt; không ghi "miễn phí"; không nhắc hoàn tiền; không nhắc S-VIP; không hứa ngày mở 6–10★ khi chưa chốt.
5. Xu, điểm trong game chỉ dùng trong game. Không làm tính năng đổi xu ra tiền thật hay quà có giá trị bên ngoài game (Nghị định 147/2024, Điều 57). Hoa hồng giới thiệu tính riêng bằng tiền đồng, gắn với giao dịch mua thật, chỉ một cấp.
6. Kết thúc mỗi lượt bằng khối BÀN GIAO: đã xong (kèm link/commit), đang vướng, việc cần Bảo duyệt.

## Thông số hay chỉnh trong khachsan.html
`FREE_MAX_STAR`, `STAR_PTS`, `MEMBER_PRICE`, `MEMBER_3M`, `PITCH_AFTER_SERVES`, `GAME_DAY_MS`, `ZALO_LINK`, `GOOGLE_FORM_LINK`, `ITEMS`, `VIP_ITEMS`, `WORDS`.
Nhịp chơi: `FAST_SECONDS` (giây trả lời để được boa nhanh), `PATIENCE_BASE` / `PATIENCE_PER_STAR` / `PATIENCE_STAFF` / `PATIENCE_DESK` (khách chịu chờ bao lâu), `WRONG_MOOD` (trả lời sai khách bớt vui bao nhiêu), `HAPPY_AT` (mức tâm trạng tính là hài lòng), `SAT_START` (độ hài lòng ban đầu), `MUSIC_VOL` (âm lượng nhạc nền).
Hướng dẫn người mới: mảng `STEPS` trong khối `Tut`; câu hỏi dễ cho khách đầu tiên là `bc-02`.
Ngân hàng câu hỏi: mảng `QUESTIONS_RAW` (định dạng 9 trường, dùng chung với game.html).

## Nơi nhận lệnh
Google Drive "BAO KHUA - SO CAI/01_LENH_HANG_NGAY" – tệp LENH của ngày; báo cáo ghi vào "02_BAO_CAO".
