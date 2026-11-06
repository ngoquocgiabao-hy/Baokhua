# Tổng kết game Đánh Boss "Hành trình HSK0 → HSK4" (v6 → v16)

Ngày: 06/11/2026. Tệp game: `game.html`. Trạng thái: **game nhánh**, chơi cho vui và quảng bá việc học tiếng Trung. Từ nay đóng băng tính năng, chỉ sửa lỗi; sức làm dồn cho game Khách sạn (`docs/khachsan/KE_HOACH_CHUYEN_MINH.md`).

Người tiếp nhận đọc theo thứ tự: tệp này → `docs/BAN_GIAO.md` (quy trình, kiểm thử) → `docs/KY_THUAT_GAME.md` (kiến trúc mã) → `CLAUDE.md` (luật bắt buộc).

## 1. Game làm được gì

### Bản đồ thành phố (5 khu)

- Bãi Cháy → Phố khách sạn → Nhà máy Cẩm Phả → Khu công nghiệp ca đêm → Đường lên đỉnh, mỗi khu 3 lớp cảnh trôi, chi tiết chuyển động (thuyền, vòng quay, khói, đèn neon, cáp treo), ngày và đêm theo khu.
- Ā Bǎo do người chơi điều khiển: ◀ ▶, nút nhảy, phím, hoặc chạm để đi tới. Giữ hướng 0,6 giây thì chạy nhanh.
- Chuyển động (v14–v16): bước nảy không uốn chân, nén giãn theo nhịp, phanh gấp, đẩy rào, lộn vòng khi nhảy lúc chạy nhanh, 5 kiểu đứng chờ (ngó quanh, vươn vai, tung phi tiêu, đấm gió, vẫy tay), giơ nắm đấm khi nhặt chữ vàng.
- Hiệu ứng: bụi bước chân theo khu, dấu chân trên cát và dấu chân phát sáng ở khu ca đêm, hạt bay theo khu, bóng mờ và vệt khí khi chạy nhanh, sóng bụi khi đáp đất.
- Người gặp trên đường (5 người, `STORY`): hội thoại có câu hỏi, từ vào Sổ từ; người quen cúi chào khi gặp lại; người đi đường vẫy tay.
- Quái trên đường: mỗi quái 1 câu hỏi; quái nhỏ nhảy qua được, "Đại …" giữ cổng phải hạ; quái dừng tuần tra và quay về phía Ā Bǎo khi tới gần.
- Chữ vàng: 4 đồng mỗi khu (2 đồng trên cao), nhặt hiện chữ Hán + pinyin + nghĩa; đủ 4 đồng một khu mở rương.

### Trận boss (đánh thật)

- 3 nút đánh: Phi tiêu, Chém (lướt, miễn đòn, chém lúc boss gồng là phá đòn), Né. Bộ đệm phím: bấm lúc đang ra đòn vẫn được tính.
- Boss báo trước rồi đánh thật; không né là mất máu. Độ khó tăng theo trạm (`ACT_DIFF`) và khi boss nổi giận (boss gầm lên).
- Tuyệt chiêu: nạp bằng đánh trúng và né đẹp; bấm thì hiện 1 câu hỏi, đúng tung chiêu lớn, sai bị phản đòn và xem đáp án.
- Chiêu chữ: boss hô 1 từ tiếng Trung, chọn đúng nghĩa trong vài giây để đỡ và phản đòn; đỡ hụt thì từ vào Sổ ôn.
- Chuỗi HIT tăng sát thương; đòn ngay sau né đẹp là phản đòn ×1,8; né đẹp thì lộn ngược ra sau.
- Giáp vàng ở nửa máu boss: đòn thường không hạ được, phải dùng tuyệt chiêu.
- Ā Bǎo khiêu khích "来吧！ (Lái ba! · Lại đây nào!)" khi người chơi ngừng bấm; boss cười đắc ý khi đánh trúng.
- 5 boss, mỗi boss một tuyệt chiêu riêng; nền sân đấu là video lặp dựng bằng Remotion.

### Học tập và giữ chân

- Ngân hàng câu theo cấp HSK0–HSK4 (luyện tập theo khung HSK, không phải đề thi chính thức), 5 dạng câu, có giọng đọc.
- Sổ từ, Sổ ôn (câu sai và từ đỡ hụt), chuỗi ngày học.
- Nhiệm vụ hằng ngày (3 cái), Tủ đồ đổi màu phi tiêu bằng ⭐. Mọi ⭐ chỉ dùng trong game.
- Sao trạm 1–3★ (đánh thật: tính cả chiêu chữ vào tỉ lệ đúng).

## 2. Lịch sử phiên bản

| Bản | Nội dung chính |
|---|---|
| v6 | 5 trạm HSK0–HSK4, ngân hàng câu theo cấp |
| v7 | Đánh nhau có chuyển động, người gặp trên đường, Sổ từ |
| v8 | Nhân vật theo tranh minh hoạ |
| v9 | Thành phố tự điều khiển, quái, boss đánh nhử, giọng đọc |
| v10 | Chiêu thức điện ảnh, bản đồ vẽ lại 3 lớp |
| v11, v11.1 | Khung xương WebGL cho tranh; sửa dáng đi lần 1 |
| v12 | Đánh thật, tuyệt chiêu bằng câu hỏi, nền Remotion |
| v13 | Sửa phông tiếng Việt, bố cục trận vừa màn nhỏ; chiêu chữ, chuỗi HIT, chữ vàng |
| v14 | Khoá biên độ khớp, bước nảy (hết xé hình); nhiệm vụ ngày, tủ đồ, rương |
| v15 | Sửa dấu góc thân (hết ngả ngược hướng); đi mượt; hiệu ứng bước chân, hạt bay |
| v16 | Chuyển động đa dạng (đứng chờ, phanh, đẩy rào, lộn vòng, cúi chào, vẫy tay, khiêu khích, boss gầm và cười); rà soát tổng thể và sửa 14 lỗi (bảng dưới) |

### Rà soát tổng thể v16 (06/11/2026)

Một lượt rà toàn game (chơi thử như người mới, ở 360×640 và 390×844) tìm ra và đã sửa:

| Lỗi | Sửa |
|---|---|
| Bấm liên tục nút đánh lúc bảng lên cấp hoặc khay chiêu chữ vừa hiện thì chọn nhầm | Bảng và khay mới hiện bỏ qua chạm trong 0,7 giây (lên cấp) và 0,45 giây (chiêu chữ), nút mờ đi trong lúc chờ |
| Máy không có giọng tiếng Trung vẫn ra câu nghe | Không ra câu nghe khi chưa có giọng (đấu quái và tuyệt chiêu) |
| Mở Sổ từ, Nhiệm vụ, Tủ đồ mà Ā Bǎo vẫn tự đi, người đi đường vẫn bắt chuyện | Có bảng đang mở thì Ā Bǎo đứng lại, không ai bắt chuyện, không vào trận đấu quái |
| Thua trận chỉ có link nhỏ "Đánh lại" ở cuối trang | Nút lớn "↻ Đánh lại trạm này" đứng đầu, "Về bản đồ" lùi thành nút phụ |
| Màn kết quả ghi "Đúng 0/0 câu" khi đánh thật không trả lời câu nào | Ghi số câu đúng (nếu có) và số lần đỡ chiêu chữ |
| Nền trang lộ đường nối mỗi chiều cao màn hình khi cuộn | Dải màu nền trải hết trang |
| Thẻ đấu quái ở 360×640: nút "Tiếp" nằm khuất dưới đáy | Hiện nút thì thẻ tự cuộn tới nút |
| Câu dạng Tình huống hứa "đáp án có pinyin và nghĩa" nhưng không có | Sửa lời dẫn đúng với cách hiện thật |
| Tên boss dài bị cắt trên thanh máu ("Quản lý ca…") | Số máu nằm trong thanh máu, tên hiện đủ |
| Ảnh chia sẻ có chữ viết tắt "(NH 106)", "đúng 0/10", link biểu mẫu tràn khung; bấm huỷ chia sẻ vẫn tự tải ảnh | Bỏ chữ viết tắt, ghi đúng số liệu, thay link dài bằng "Đăng ký thẻ hội viên tại baokhua.com"; huỷ chia sẻ thì thôi |
| Sổ ôn hứa "hỏi lại" nhưng từ đỡ hụt không được lưu | Từ đỡ hụt lưu lại (`prog.wmiss`), lượt sau boss hô lại trước, đỡ đúng thì xoá khỏi sổ |
| Màn bắt đầu: nút "VÀO HÀNH TRÌNH" nằm dưới màn đầu tiên, nút loa nổi đè chữ hướng dẫn | Nút vào game ngay dưới tranh mở đầu; nút loa nằm ở góc tranh |
| Đếm từ trong Sổ từ tính 你好 (nǐ hǎo · xin chào) hai lần | Đếm từ không trùng |
| Chữ hướng dẫn ở màn bắt đầu, thẻ trạm, nâng cấp vẫn tả kiểu trả lời liên tục cũ | Viết lại theo kiểu đánh thật |

## 3. Chất lượng

Chạy `bash tools/test/run-all.sh` (cần máy chủ tĩnh `127.0.0.1:8765` và Playwright):

| Kiểm thử | Kiểm gì |
|---|---|
| `city.js` | Bản đồ: gặp người, đấu quái, nhảy, tới cổng, vào trận |
| `campaign.js` | Máy tự chơi trọn 5 trạm ở 360×640 và 390×844 |
| `fight.js` | Đánh thật HSK0 và HSK4 |
| `perf.js` | Khung hình, lỗi console |
| `gait.js` | Dáng nhân vật: không uốn chân khi đi, có nảy, tư thế trong giới hạn, ngả tới đúng hướng |
| `fonts.js` | Phông chữ Việt/Trung ở 34 màn |

Kết quả lần chạy cuối ghi trong báo cáo Drive `BAO_CAO_06-11_GAME_DANH_BOSS_V16`.

## 4. Giới hạn đã biết

- Nhân vật là 1 bức tranh vẽ chính diện, uốn bằng khung xương trong giới hạn nhỏ. Chân không bước từng bước; muốn bước thật cần vẽ thêm khung hình (dây chuyền `tools/art/video2sheet.py`, thư mục `v4/anim/`).
- Cân bằng độ khó mới đo bằng máy tự chơi, chưa đo với học viên thật trên điện thoại.
- Giọng đọc phụ thuộc giọng tiếng Trung có trên máy cho đến khi có khoá Gemini để tạo file giọng.
- Tiến độ lưu trên máy người chơi (`localStorage`, khoá `baokhua_game_v4`), đổi máy là mất.
- Trong bản xem thử trên claude.ai, nút lưu ảnh thành tích không tải được (khung xem chặn tải tệp); trên trang thật vẫn chạy.

## 5. Bài học mang sang game Khách sạn

| Bài học | Áp dụng |
|---|---|
| Uốn tranh 2D để làm động tác dễ xé hình | Dùng nhân vật 3D có khung xương từ đầu |
| Quy ước toán học không ghi ra thì sai lâu không ai biết | Ghi quy ước (dấu, toạ độ, đơn vị) và có kiểm thử |
| Lỗi chỉ hiện trên máy khác (phông iPhone) | Kiểm bằng quy tắc khai báo, không chỉ bằng ảnh chụp |
| Màn có đếm giờ tràn màn hình nhỏ | Kiểm thử vừa màn 360×640 cho mọi màn có giờ |
| Ảnh chụp liên tiếp đánh giá sai chuyển động | Móc bước tay từng khung trong game mới |
| Mỗi lỗi người dùng báo lần 2 | Thêm kiểm thử chặn trước khi báo sửa xong (xem `docs/khachsan/KAIZEN.md`) |

## 6. Nếu muốn làm tiếp (không ưu tiên)

1. Khung hình bước chân vẽ tay cho Ā Bǎo (đi, chạy) khi có video Veo hoặc hoạ sĩ.
2. File giọng đọc Gemini (`VOICE_FILES = true`) khi có khoá.
3. Cân bằng `ACT_DIFF`, `WORD_EVERY`, `WORD_SEC` sau buổi chơi thử với học viên.
4. Dùng lại Ā Bǎo làm nhân vật quản lý trong game Khách sạn để hai game nối với nhau.

## Bổ sung v17 (06/11/2026, tối): thành sự kiện của game hợp nhất `hotel/`
- **Bỏ boss lễ tân.** HSK0: **Cua Thanh Điệu** (phun bong bóng mang 4 thanh ā á ǎ à, kẹp càng "CẮP!"). HSK1: **Vali Khổng Lồ** (nhảy đè "RẦM!", tung quần áo). Vẽ bằng code (`tools/art/monsters.js`), không khung xương, cỡ theo bề ngang sân để không đè tướng trên màn dọc. Tranh lễ tân cũ chuyển sang `v4/staff/` làm nhân viên thuê trong khách sạn.
- **Chế độ sự kiện** (`EV` đầu script): `?ev=errand&id&zh&py&vi&d` = đi chợ (cửa khách sạn → sạp tạp hoá → nói đúng tên món → trả tiền → ôm thùng hàng về); `?ev=boss&stage=N` = vào thẳng trận. Kết quả gửi `postMessage({type:'bk-event'…})` cho khung cha và lưu `localStorage.bk_event_result`.
- **Đi map tự nhiên hơn:** nhún lấy đà khi bắt đầu bước, tăng tốc mềm, ngả người theo gia tốc, đi bộ nảy thấp hơn chạy, đầu giữ thăng bằng; thao tác mới: trả tiền, cúi nhặt / đặt hàng, ôm thùng hàng.
