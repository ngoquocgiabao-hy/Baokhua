# CLAUDE.md – Xưởng Game và Web, dự án Bảo Khựa 阿宝

Bạn là Xưởng Game và Web của đội Bảo Khựa (chủ: Bảo). Đọc tệp này trước mọi việc trong repo.

## Repo này là gì
- Trang web công khai chạy bằng GitHub Pages từ nhánh `main`, tên miền riêng **baokhua.com** (tệp `CNAME`):
  - `index.html` – trang chủ baokhua.com (CONFIG ở đầu script: link Zalo, TikTok, `saleEnd` = hạn ưu đãi 11.11; lịch học chưa chốt nên trang KHÔNG ghi ngày khai giảng; mục `#hsk` lộ trình HSK0 → HSK4; game Khách sạn chơi ngay trong khung điện thoại).
  - `index_1.html` – chỉ còn là trang chuyển về `/` để link cũ (bio TikTok, bài cũ) vẫn chạy.
  - `404.html` – trang báo không tìm thấy.
  - `membership.html` – trang thẻ hội viên.
  - `khachsan.html` – game Khách sạn Bảo Khựa (Canvas 2.5D, một file, không thư viện ngoài).
  - `game.html` – game Đánh Boss v7 "Hành trình HSK0 → HSK4": Ā Bǎo đi bộ trên bản đồ, gặp người trên đường (hội thoại + Sổ từ), qua 5 trạm, mỗi trạm hạ 1 boss. Nhân vật có khớp vẽ bằng canvas (`Chibi`), sân đấu chuyển động thật (`createArena`), không thư viện ngoài. Tranh minh hoạ ở `v4/art/` chỉ dùng cho màn VS mở trận và màn bắt đầu.
  - `v4/` – ảnh, âm thanh, thư viện 3D tự host; `og-home.jpg` ảnh chia sẻ trang chủ, `game-poster.jpg` ảnh bìa khung game.
    - `v4/sprites/*.webp` – hình nhân vật đã tách nền cho trận đánh (game.html v8): `hero1..3` (tướng theo cấp), `<kiểu boss>-idle|atk|ko` (đứng / ra đòn / gục). Kiểu boss: trainee, hotel, factory, night, shadow.
    - `v4/vs/*.jpg` – tranh boss có nền cho màn VS và thẻ trạm; `v4/bg/*.jpg` – phông nền sân đấu (đã làm mờ chiều sâu).
    - Ảnh gốc ở Drive `04_GAME/ANH_BOSS_04-11`. Có ảnh mới thì chạy `tools/art/cut.py` rồi `tools/art/build.py`, dán bảng `SPRITE` mới vào game.html (trong `createArena`).
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

## Thông số hay chỉnh trong game.html (Đánh Boss)
`STAGES` (5 trạm HSK0–HSK4: `time` mốc lộ trình gợi ý, `n` số câu, `sec` giây/câu, `hit` sức đánh boss, `pyHelp` hiện pinyin ở đáp án, `learn` câu mẫu học trước trận, `look` kiểu boss), `QUESTIONS_RAW` (câu mới có trường `level: "hsk0"…"hsk4"`; câu cũ không có `level` thì khách sạn → HSK1, nhà máy → HSK2, nhà máy độ khó 3 → HSK3), `STORY` (người gặp trên đường: `at` vị trí, lời chào, câu hỏi, từ vào Sổ từ; câu `s*-01` trong `QUESTIONS_RAW` có trường `story` chỉ hỏi sau khi đã gặp), `STORY_INTRO` (lời dẫn lần đầu), `taunt` trong `STAGES` (câu boss chào khi mở trận), `Chibi.SPECS` (trang phục từng nhân vật), `INVITE_BLURB`, `INVITE_SHARE_LINE`, `OFFER_HOLD`, `OFFER_REFERRAL`, `SALE_END` (hạn ưu đãi 11.11).
Câu hỏi HSK là luyện tập theo khung HSK, không phải đề thi chính thức. Mốc thời gian trạm là lộ trình gợi ý, không phải lịch khai giảng.

## Nơi nhận lệnh
Google Drive "BAO KHUA - SO CAI/01_LENH_HANG_NGAY" – tệp LENH của ngày; báo cáo ghi vào "02_BAO_CAO".
