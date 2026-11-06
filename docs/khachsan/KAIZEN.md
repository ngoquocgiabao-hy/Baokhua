# Kế hoạch cải tiến không ngừng (Kaizen) cho dự án Bảo Khựa

Phiên bản: 1.0 (06/11/2026). Áp dụng cho: game Khách sạn (dự án chính), game Đánh Boss (game nhánh), trang baokhua.com.
Đọc kèm: `docs/khachsan/KE_HOACH_CHUYEN_MINH.md`, `CLAUDE.md`.

## 1. Mục tiêu

Mỗi tuần sản phẩm tốt hơn tuần trước một chút, có số đo chứng minh, và lỗi đã sửa không quay lại. Kaizen ở đây không phải một đợt cải tổ mà là cách làm việc hằng ngày: thay đổi nhỏ, thử nhanh, đo, giữ cái tốt thành chuẩn, bỏ cái không hiệu quả.

Ba kết quả cần đạt sau 90 ngày áp dụng:

- Mọi lỗi người dùng báo đều có phân tích nguyên nhân gốc và một kiểm tra tự động chặn nó lặp lại.
- Có bảng số liệu tuần (chất lượng, người chơi, học tập) cập nhật đều.
- Mỗi 2 tuần có một bản thử nội bộ và một buổi nhìn lại.

## 2. Nguyên tắc nền

| Nguyên tắc | Nghĩa trong dự án |
|---|---|
| Kaizen (cải tiến nhỏ, liên tục) | Mỗi thay đổi đủ nhỏ để làm xong và thử trong 1–3 ngày. Việc lớn chia nhỏ trước khi làm. |
| PDCA (Lập kế hoạch – Làm – Kiểm tra – Chuẩn hoá) | Mọi thay đổi đi qua 4 bước ở mục 4. Không bỏ bước Kiểm tra. |
| Gemba (đến tận nơi) | Xem người chơi thật chơi trên điện thoại thật, không chỉ đọc báo cáo (mục 5). |
| 5 Whys (hỏi "tại sao" 5 lần) | Mỗi lỗi lặp lại hoặc lỗi người dùng báo đều được truy đến nguyên nhân gốc (mục 11). |
| Jidoka (dừng chuyền khi có lỗi) | Kiểm thử tự động đỏ thì không đăng, không báo xong (mục 6). |
| Poka-yoke (chống sai từ gốc) | Thay lời nhắc bằng kiểm tra tự động: bộ kiểm tra phông, dáng nhân vật, dữ liệu nội dung. |
| Công việc chuẩn | Các danh sách kiểm tra ở mục 7 là cách làm hiện tốt nhất; cải tiến thì sửa danh sách. |
| 5S | Giữ mã nguồn, tài sản, tài liệu gọn và dễ tìm (mục 8). |
| Loại bỏ lãng phí (Muda) | Nhận diện 7 loại lãng phí trong làm phần mềm và game (mục 2.1). |
| Hansei (tự nhìn lại) và Yokoten (lan truyền bài học) | Bài học từ một game được ghi lại và áp dụng sang game khác. |

### 2.1 Bảy loại lãng phí trong làm game

| Lãng phí | Ví dụ trong dự án | Cách giảm |
|---|---|---|
| Làm thừa | Tính năng không phục vụ trụ cột nào | Mỗi việc ghi rõ trụ cột phục vụ (kế hoạch, mục 3) |
| Chờ đợi | Chờ duyệt nội dung, chờ hình | Gom câu hỏi cho Bảo vào 1 lần mỗi ngày; làm việc khác trong lúc chờ |
| Chuyển giao | Giải thích lại nhiều lần vì thiếu tài liệu | Tài liệu bàn giao, BÀN GIAO cuối mỗi lượt |
| Xử lý thừa | Đánh bóng thứ người chơi không nhận ra | Thử với người chơi trước khi đánh bóng |
| Tồn kho | Nhánh dở dang lâu ngày, tài sản làm xong chưa dùng | Giới hạn việc đang làm (mục 9) |
| Di chuyển thừa | Tìm file, tìm số liệu | 5S, đặt tên chuẩn |
| Lỗi | Sửa đi sửa lại cùng một lỗi | 5 Whys + kiểm thử chặn |

## 3. Nhịp vận hành

| Nhịp | Hoạt động | Ai | Kết quả | Nơi lưu |
|---|---|---|---|---|
| Hằng ngày | Đọc lệnh trong ngày; cập nhật bảng việc; làm; khối BÀN GIAO cuối lượt | Xưởng + Bảo | Việc xong, việc vướng, việc chờ duyệt | Drive `01_LENH_HANG_NGAY`, GitHub Projects |
| Mỗi tuần | Chu kỳ Kaizen: chọn 1–3 cải tiến từ số liệu và góp ý, làm, đo | Xưởng + Bảo | Thẻ Kaizen đóng, số liệu tuần | Nhật ký Kaizen (Sheets) |
| Mỗi 2 tuần | Bản thử nội bộ; 1 buổi chơi thử với học viên (Gemba); họp nhìn lại (KPT) | Xưởng + Bảo + 3–5 học viên | Bản thử, ghi chép buổi thử, danh sách Giữ / Vấn đề / Thử | Drive `02_BAO_CAO` |
| Mỗi tháng | Xem bảng số liệu tháng, cập nhật chuẩn (danh sách kiểm tra, kiểm thử), chọn chủ đề cải tiến tháng sau | Bảo | Báo cáo tháng | Drive `02_BAO_CAO` |
| Mỗi quý | Xem lại mục tiêu lớn và lộ trình (giai đoạn, ưu tiên) | Bảo | Lộ trình quý | Kế hoạch chuyển mình (bản mới) |

## 4. Chu trình PDCA cho mỗi thay đổi

1. **Lập kế hoạch:** viết vấn đề bằng số đo ("38% người thử bỏ ở bước dọn phòng"), nguyên nhân giả định, thay đổi đề xuất, cách đo kết quả. Ghi vào thẻ Kaizen (mục 12.1).
2. **Làm:** thay đổi nhỏ nhất đủ để kiểm chứng, trên nhánh làm việc.
3. **Kiểm tra:** chạy kiểm thử tự động; thử trên điện thoại thật; nếu là thay đổi về trải nghiệm, thử với ít nhất 3 người chơi; so số đo trước và sau.
4. **Chuẩn hoá hoặc bỏ:** nếu tốt hơn, giữ lại và cập nhật chuẩn (thêm kiểm thử, sửa danh sách kiểm tra, ghi vào tài liệu). Nếu không tốt hơn, bỏ thay đổi và ghi lại lý do để không thử lại cùng ý đó.

Quy tắc: không gộp nhiều thay đổi trải nghiệm vào cùng một lần thử, vì sẽ không biết thay đổi nào có tác dụng.

## 5. Gemba: xem người chơi thật

Quy trình một buổi chơi thử (30 phút, 1 người chơi):

1. Người chơi dùng điện thoại của chính họ. Không hướng dẫn trước.
2. Người quan sát không gợi ý, chỉ ghi: chỗ dừng lâu, chỗ bấm sai, câu hỏi họ nói ra, biểu cảm.
3. Sau 15 phút chơi, hỏi 4 câu: Bạn đang cố làm gì? Chỗ nào khó hiểu? Chỗ nào vui nhất? Mai bạn có muốn chơi tiếp không, vì sao?
4. Ghi vào mẫu ở mục 12.4. Không ghi tên thật vào repo; trên Drive chỉ ghi mã người thử.
5. Quay màn hình chỉ khi người chơi đồng ý.

Mục tiêu: mỗi 2 tuần 3–5 người, ưu tiên người chưa chơi bản trước.

## 6. Jidoka và Poka-yoke: dừng chuyền khi có lỗi

Bộ kiểm thử tự động là "dây dừng chuyền". Quy tắc:

- Kiểm thử đỏ thì không đăng lên `main`, không báo xong.
- Mỗi lỗi người dùng báo lần thứ hai phải có một kiểm thử tự động chặn nó trước khi sửa xong.
- Kiểm thử phải chạy được trên máy không có card đồ hoạ (như máy chủ hiện tại) và trên GitHub Actions.

Kiểm thử đang có (game Đánh Boss, `tools/test/`), đều sinh ra từ lỗi thật:

| Kiểm thử | Chặn lỗi |
|---|---|
| `fonts.js` | Chữ Việt bị vẽ bằng phông Trung, chữ Hán thiếu `lang`, ký tự hiếm hiện ô vuông |
| `gait.js` | Chân bị bẻ khi đi (xé hình), tư thế vượt giới hạn uốn, nhân vật ngả ngược hướng |
| `poses.js` | Bảng tư thế để soi bằng mắt trước khi chỉnh giới hạn |
| `campaign.js` | Kẹt màn, không qua được 5 trạm |
| `fight.js` | Trận đánh không thắng được, boss không gây sát thương |
| `perf.js` | Tụt khung hình, lỗi console |

Kiểm thử cần có cho game Khách sạn mới (làm cùng giai đoạn 0–1):

| Kiểm thử | Chặn lỗi |
|---|---|
| Kiểm tra dữ liệu | Thiếu pinyin hoặc nghĩa, giá âm, mở khoá vòng tròn, chữ cấm ("miễn phí", "hoàn tiền", "S-VIP") |
| Vòng tân thủ | 10 phút đầu không chơi qua được |
| Lưu và tải lại | Mất tiến độ khi cấu trúc lưu thay đổi |
| Mô phỏng kinh tế 30 ngày | Nhịp lên sao lệch quá 20% so với mục tiêu |
| Hiệu năng | Khung hình dưới 50 trên cấu hình thử, dung lượng tải quá 8 MB |
| Phông và vừa màn hình | Chữ tràn, phải cuộn khi có đồng hồ đếm ngược |

## 7. Công việc chuẩn

### 7.1 Trước khi báo xong một việc

- Chạy kiểm thử tự động liên quan; đạt ở 360×640 và 390×844.
- Không lỗi console, không gọi máy chủ ngoài ngoài các link đã có.
- Tự chơi lại đúng đoạn vừa sửa trên khung điện thoại; với chuyển động thì quay từng khung (bước tay đúng 1/30 giây), không dựa vào ảnh chụp liên tiếp.
- Cập nhật tài liệu nếu cách làm thay đổi.
- Khối BÀN GIAO: đã xong (link, commit), đang vướng, việc cần Bảo duyệt.

### 7.2 Nội dung

- Chữ Hán kèm pinyin có dấu và nghĩa Việt.
- Không ghi "miễn phí", không nhắc hoàn tiền, không nhắc S-VIP, không hứa ngày mở 6–10★.
- Câu hỏi HSK ghi là luyện tập theo khung HSK, không phải đề thi chính thức.
- Câu mới do giáo viên duyệt trước khi lên bản thử công khai.

### 7.3 Phát hành

- Chỉ đưa lên `main` khi Bảo gõ "duyệt đăng" cho đúng việc đó.
- Ghi chú phát hành: thay đổi gì, vì sao, số đo trước và sau.
- Báo cáo trên Drive `02_BAO_CAO`.
- Mở trang thật trên điện thoại kiểm tra lại sau khi đăng.

### 7.4 Định nghĩa "Xong" cho một tính năng

Một tính năng chỉ là "Xong" khi: chạy đúng trên điện thoại thật, có kiểm thử tự động cho đường chính, đã thử với ít nhất 3 người chơi (nếu ảnh hưởng trải nghiệm), có trong tài liệu, không làm tụt số đo hiệu năng.

## 8. 5S cho mã nguồn, tài sản và tài liệu

| Bước | Áp dụng |
|---|---|
| Sàng lọc | Mỗi tháng xoá mã chết, hằng số không dùng (ví dụ `SVIP_PRICE` trong `khachsan.html`), nhánh cũ đã gộp |
| Sắp xếp | Thư mục theo chức năng (kế hoạch, mục 9.2); tên file theo quy ước; tài sản có `LICENSES.md` |
| Sạch sẽ | Mã đọc được: hàm ngắn, chú thích vì sao chứ không chỉ làm gì; dữ liệu tách khỏi mã |
| Săn sóc | Danh sách kiểm tra ở mục 7 là chuẩn chung; bộ kiểm tra dữ liệu chạy tự động |
| Sẵn sàng | Buổi nhìn lại mỗi 2 tuần có 5 phút xem lại 5S |

## 9. Bảng việc và ưu tiên

- Bảng GitHub Projects với các cột: Ý tưởng → Sẵn sàng → Đang làm → Chờ duyệt → Xong.
- Giới hạn việc đang làm: tối đa 3 việc ở cột Đang làm cùng lúc. Xong một việc mới kéo việc tiếp theo.
- Chấm điểm ưu tiên ICE cho mỗi ý tưởng cải tiến: Tác động (1–10) × Độ chắc chắn (1–10) × Độ dễ (1–10). Làm điểm cao trước; điểm bằng nhau thì ưu tiên việc sửa lỗi người dùng báo.
- Mỗi thẻ ghi: trụ cột phục vụ, số đo trước, số đo mong muốn, người làm.

## 10. Đo lường

Cây chỉ số (từ trên xuống):

- **Mục tiêu:** nhiều người học được tiếng Trung giao tiếp qua game và đăng ký học thật.
  - Người chơi quay lại (ngày 1, 7, 30), thời gian chơi mỗi ngày.
    - Hoàn thành hướng dẫn tân thủ, thời gian đến 1★, 3★.
  - Học tập: câu mới mỗi ngày, tỉ lệ đúng khi ôn.
  - Kinh doanh: lượt bấm đăng ký thẻ từ game (UTM), lượt vào nhóm Zalo.
  - Chất lượng: lỗi lọt ra bản thử, lỗi người dùng báo, thời gian sửa lỗi.
  - Kỹ thuật: khung hình, thời gian tải, lỗi console.

Bảng số liệu tuần (Google Sheets, mỗi tuần một dòng): ngày, phiên bản, số người thử, hoàn thành tân thủ, quay lại ngày 1, phút chơi, câu học, lỗi lọt ra, khung hình đo trên máy thật, ghi chú.

Khi chưa có công cụ thống kê (cần Bảo duyệt dịch vụ ngoài), số liệu người chơi lấy từ các buổi chơi thử và câu hỏi khảo sát ngắn qua Google Form đã có.

## 11. Học từ lỗi: 5 Whys và A3

Cách làm: với mỗi lỗi người dùng báo, viết một trang A3 ngắn (mục 12.2): hiện tượng, số đo, chuỗi 5 câu "tại sao", biện pháp tạm, biện pháp gốc, cách chuẩn hoá. Dưới đây là 5 ca thật từ game Đánh Boss, dùng làm mẫu.

### Ca 1. "Dáng nhân vật lỗi" lặp lại 4 lần (v11 → v14)

- Hiện tượng: Bảo báo nhiều lần nhân vật đi bị ngược chân, gập gối sai, xé hình.
- Tại sao 1: tranh bị uốn quá mức khi đi và ra đòn.
- Tại sao 2: góc khớp không có giới hạn, mỗi lần sửa chỉ chỉnh dáng đi theo cảm tính.
- Tại sao 3: không có cách nhìn tất cả tư thế cùng lúc; ảnh chụp liên tiếp bị lệch nhịp nên đánh giá sai.
- Tại sao 4: không có kiểm thử đo độ uốn.
- Tại sao 5: tranh vẽ chính diện vốn không uốn được nhiều; giới hạn này chưa được đo và ghi thành chuẩn.
- Biện pháp gốc: đo giới hạn uốn từng khớp bằng bảng tư thế, khoá trong `LIM`; dáng đi chuyển sang bước nảy; kiểm thử `gait.js` và công cụ `poses.js`.
- Chuẩn hoá: không nới `LIM` khi chưa chạy `gait.js` và xem bảng tư thế. Game Khách sạn dùng nhân vật 3D có khung xương ngay từ đầu.

### Ca 2. Nhân vật ngả ngược hướng khi chạy (v11 → v15)

- Hiện tượng: chạy tới mà người ngả ra sau, trúng đòn lại chúi tới.
- Nguyên nhân gốc: quy ước dấu góc cho thân và đầu (hướng lên) dùng chung với tay chân (hướng xuống); quy ước không được viết ra nên không ai kiểm.
- Biện pháp gốc: sửa dấu, ghi quy ước vào `CLAUDE.md` và tài liệu kỹ thuật; thêm điều kiện "ngả tới phải đúng hướng mặt" vào `gait.js`.
- Bài học chung: quy ước toán học (dấu, đơn vị, hệ toạ độ) phải được ghi ra và có kiểm thử.

### Ca 3. Lỗi phông chữ tiếng Việt trên iPhone (v13)

- Hiện tượng: chữ có dấu trong đáp án bị trộn hai phông.
- Nguyên nhân gốc: phông Trung gắn vào một class dùng chung cho cả chữ Việt; máy thử không có phông đó nên không thấy lỗi.
- Biện pháp gốc: phông Trung chỉ gắn qua `lang`, tự gắn `lang="zh-CN"` cho chữ Hán; kiểm thử `fonts.js` đi qua 34 màn.
- Bài học chung: lỗi chỉ xuất hiện trên thiết bị khác phải được kiểm bằng quy tắc (kiểm tra phông được khai báo), không chỉ bằng ảnh chụp.

### Ca 4. Câu hỏi tuyệt chiêu tràn màn hình (v13)

- Hiện tượng: ở màn 360×640, 10/20 câu phải cuộn mới thấy hết đáp án khi đồng hồ đang chạy.
- Nguyên nhân gốc: bố cục chỉ được xem ở màn lớn; không có kiểm thử đo vị trí đáp án cuối.
- Biện pháp gốc: sân đấu tự thu cho vừa (`fitAsk`), đáp án ngắn xếp 2 cột; bài đo vị trí đáp án ở cả 2 cỡ màn.
- Bài học chung: mọi màn có đếm giờ phải vừa một màn hình nhỏ nhất, có kiểm thử.

### Ca 5. Đánh giá chuyển động sai vì ảnh chụp lệch nhịp (v13)

- Hiện tượng: nhìn ảnh chụp tưởng chân đứng yên hoặc chạy quá nhanh.
- Nguyên nhân gốc: mỗi lần chụp mất khoảng 0,25 giây, game vẫn chạy giữa các lần chụp.
- Biện pháp gốc: móc kiểm thử dừng vòng lặp và bước tay đúng 1/30 giây (`_hold`, `_step`).
- Bài học chung: công cụ đo phải đáng tin trước khi dùng nó để kết luận.

## 12. Mẫu biểu

### 12.1 Thẻ Kaizen

| Mục | Nội dung |
|---|---|
| Mã thẻ | KZ-năm-tuần-số (ví dụ KZ-2026-46-01) |
| Vấn đề (có số đo) | |
| Trụ cột phục vụ | |
| Nguyên nhân giả định | |
| Thay đổi đề xuất (nhỏ nhất) | |
| Cách đo | |
| Số đo trước / sau | |
| Kết luận | Giữ và chuẩn hoá / Bỏ |
| Chuẩn hoá ở đâu | Kiểm thử, danh sách kiểm tra, tài liệu |

### 12.2 Báo cáo A3 (1 trang)

1. Bối cảnh và hiện tượng (có ảnh hoặc số đo).
2. Hiện trạng: lỗi xảy ra ở đâu, bao nhiêu lần.
3. Mục tiêu.
4. Phân tích nguyên nhân gốc (5 Whys).
5. Biện pháp tạm và biện pháp gốc.
6. Kế hoạch thực hiện (ai, khi nào).
7. Kiểm tra kết quả.
8. Chuẩn hoá và lan truyền sang dự án khác.

### 12.3 Họp nhìn lại (KPT), 30 phút mỗi 2 tuần

- **Giữ (Keep):** điều gì làm tốt, cần giữ.
- **Vấn đề (Problem):** điều gì cản trở, có số đo nếu được.
- **Thử (Try):** 1–3 thay đổi cho 2 tuần tới, mỗi thay đổi thành một thẻ Kaizen.

### 12.4 Phiếu chơi thử

| Mục | Ghi |
|---|---|
| Mã người thử, thiết bị, phiên bản | |
| Thời gian đến từng mốc (hoàn thành tân thủ, 1★) | |
| Chỗ dừng lâu hoặc bấm sai | |
| Câu người chơi nói ra | |
| 4 câu hỏi sau buổi thử | |
| Lỗi phát hiện | |

### 12.5 Nhật ký Kaizen (Google Sheets)

Cột: mã thẻ, ngày mở, vấn đề, số đo trước, thay đổi, số đo sau, kết luận, chuẩn hoá ở đâu, người làm, ngày đóng.

## 13. Áp dụng trong 90 ngày đầu

| Tuần | Việc |
|---|---|
| 1–2 | Tạo bảng GitHub Projects, nhật ký Kaizen trên Drive, bảng số liệu tuần; viết A3 cho 5 ca ở mục 11 vào Drive |
| 3–4 | Thêm GitHub Actions chạy `tools/test/run-all.sh` cho mọi thay đổi; buổi chơi thử đầu tiên của bản thử game Khách sạn |
| 5–8 | Chạy đều chu kỳ 2 tuần (bản thử, chơi thử, KPT); bộ kiểm tra dữ liệu cho game Khách sạn |
| 9–12 | Báo cáo tháng đầu tiên theo cây chỉ số; cập nhật danh sách kiểm tra theo các bài học; xem lại nhịp họp có cần chỉnh không |

Dấu hiệu Kaizen đang chạy đúng: số lỗi lọt ra bản thử giảm qua từng vòng, không có lỗi nào bị báo lần thứ ba, mỗi buổi KPT có ít nhất 1 thay đổi được chuẩn hoá.
