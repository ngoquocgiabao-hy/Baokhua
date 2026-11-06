# Kế hoạch chuyển mình game Khách sạn Bảo Khựa

Phiên bản kế hoạch: 1.2 (06/11/2026; 1.1 ghi quyết định của Bảo ở mục 15, nguồn hình 3D và video không tốn thêm chi phí ở mục 8.2–8.3; 1.2 thêm giáo trình, thẻ từ, ôn kiểu Anki, nhắc ôn ở mục 6.17 và phát hành web, PWA, chợ ứng dụng ở mục 9.5). Chủ dự án: Bảo. Người soạn: Xưởng Game và Web.
Đọc kèm: `docs/khachsan/KAIZEN.md` (cách cải tiến liên tục), `docs/BAN_GIAO.md` (quy trình chung), `CLAUDE.md` (luật bắt buộc).

## 1. Tóm tắt

Game chính của Bảo Khựa sẽ là **game mô phỏng xây và quản lý khách sạn, góc nhìn 3D nghiêng (isometric), chơi trên điện thoại**. Người chơi nhận một nhà nghỉ cũ ở Bãi Cháy, tự tay đón khách, dọn phòng, thu tiền, rồi tuyển nhân viên, mở khu mới, lên sao và mở chi nhánh ở nhiều thành phố trong và ngoài nước. Điểm khác biệt so với các game cùng thể loại: **khách nói tiếng của họ**. Phục vụ đúng bằng tiếng Trung (về sau thêm tiếng Anh, Hàn, Nhật) là cơ chế chơi chính, nên người chơi học ngoại ngữ trong lúc chơi.

Đề xuất:

- Làm bản mới ở thư mục riêng, **giữ `khachsan.html` v5 chạy trên baokhua.com** cho đến khi bản mới qua tiêu chí ở mục 10 và Bảo gõ "duyệt đăng".
- Dùng **Three.js tự lưu trên repo** (không gọi máy chủ ngoài), mô hình 3D low-poly định dạng GLB, dữ liệu game tách ra file cấu hình.
- Đi theo **5 giai đoạn, khoảng 30–34 tuần** đến bản chính thức. Mỗi 2 tuần có một bản thử nội bộ, cải tiến theo chu trình Kaizen (PDCA).
- Giai đoạn 0 (2 tuần) trả lời 3 câu hỏi trước khi dồn sức: điện thoại tầm trung có chạy 3D mượt không, vòng chơi 3 phút có vui không, quy trình làm hình 3D có theo kịp không.

Việc cần Bảo quyết định nằm ở mục 15.

## 2. Hiện trạng: game Khách sạn v5

`khachsan.html` hiện là một tệp khoảng 2.500 dòng, vẽ bằng Canvas 2D, nhìn mặt tiền khách sạn trên phố biển Bãi Cháy.

| Phần | Đang có | Giữ lại cho bản mới |
|---|---|---|
| Phục vụ khách | Khách xếp hàng ở cửa, có thanh kiên nhẫn; trả lời câu tiếng Trung để phục vụ; 1–3 yêu cầu mỗi khách; boa khi trả lời nhanh | Giữ ý tưởng, chuyển thành hội thoại tại quầy và trong phòng |
| Ngân hàng câu hỏi | `QUESTIONS_RAW` (dùng chung với game Đánh Boss), 5 dạng: trắc nghiệm, nghe, sắp xếp, điền, tình huống | Giữ nguyên, chuyển sang file dữ liệu riêng, gắn thêm ngữ cảnh khách sạn |
| Xây dựng | 17 món (`ITEMS`): tầng, quầy, cây dừa, bể bơi, nhà hàng, du thuyền, pháo hoa…; mua phải chọn đúng tên tiếng Trung | Giữ danh sách làm gốc cho cây mở khoá |
| Sao | Thang 10★ (`STAR_PTS`), bản hiện tại tối đa 5★, 6–10★ hiện xem trước | Giữ thang sao, 6–10★ chỉ mở khi Bảo chốt |
| Thế giới | Ngày đêm, xe cộ, người đi đường, chạm vào đồ vật để học từ (`WORDS`) | Giữ cơ chế "chạm để học từ" |
| Giữ chân | Chuỗi ngày học, thu nhập khi vắng mặt (trần 60 phút), Sổ ôn | Giữ, mở rộng thành nhiệm vụ ngày và lịch sự kiện |
| Hướng dẫn | `Tut` 9 bước có tay chỉ | Làm lại cho 3D, giữ cách dẫn từng bước |
| Liên kết khoá học | Nhắc thẻ hội viên sau 12 khách mỗi ngày, Google Form có UTM | Giữ, đặt ở các mốc tự nhiên (lên sao) |

Hạn chế của bản v5 (lý do làm lại):

- Nhìn từ một phía, không đi vào bên trong khách sạn được, không có nhân vật do người chơi điều khiển.
- Phần "quản lý" mỏng: không có nhân viên làm việc thật, không có dọn phòng, không có luồng khách bên trong.
- Một tệp lớn, dữ liệu và mã trộn lẫn, khó cho nhiều người cùng làm.
- Hình vẽ tay 2D không cử động tự nhiên được. Game Đánh Boss đã cho thấy uốn một bức tranh để làm động tác thì dễ xé hình (xem `docs/TONG_KET_GAME_DANH_BOSS.md`). Nhân vật 3D có khung xương là cách giải quyết gốc.
- Hằng số `SVIP_PRICE` vẫn còn trong mã dù không hiện ra màn hình; bản mới bỏ hẳn (luật nội dung: không nhắc S-VIP).

## 3. Tầm nhìn và trụ cột thiết kế

Tầm nhìn: một game quản lý khách sạn đủ đẹp để người chơi ở bất kỳ nước nào cũng muốn chơi, và đủ "thật" để học viên Bảo Khựa luyện được câu giao tiếp dùng ngay ở chỗ làm.

Trụ cột (mọi tính năng mới phải phục vụ ít nhất một trụ cột):

1. **Xây từ con số 0, tiến bộ thấy rõ.** Mỗi phiên chơi để lại một thay đổi nhìn thấy được: phòng mới, quầy mới, sao mới.
2. **Phục vụ khách bằng ngôn ngữ thật.** Câu nói trong game là câu người làm khách sạn dùng thật; mọi chữ Hán có pinyin có dấu và nghĩa tiếng Việt.
3. **Quốc tế.** Khách đến từ nhiều nước, giao diện ba thứ tiếng (Việt, Anh, Trung), chi nhánh ở nhiều thành phố.
4. **Chơi một tay, phiên ngắn.** Một phiên 3–10 phút; tắt máy thì khách sạn vẫn chạy (có giới hạn).
5. **Sướng tay.** Mỗi thao tác có phản hồi: tiếng, hạt sáng, số tiền bay, nhân vật phản ứng.

Người chơi mục tiêu:

| Nhóm | Mô tả | Giai đoạn |
|---|---|---|
| Học viên Bảo Khựa | Người làm khách sạn, du lịch, nhà máy ở Quảng Ninh học tiếng Trung giao tiếp | Từ giai đoạn 1 |
| Người Việt học ngoại ngữ | Học tiếng Trung, sau là tiếng Anh, Hàn, Nhật cho nghề dịch vụ | Từ giai đoạn 3 |
| Người chơi quốc tế | Thích game mô phỏng quản lý, giao diện tiếng Anh, học tiếng Trung hoặc tiếng Việt | Giai đoạn 4 |

## 4. Nguyên tắc bản quyền và khác biệt

Thể loại "mô phỏng quản lý khách sạn" (đi lại phục vụ khách, đặt tiền mở ô xây dựng, thuê nhân viên tự động hoá) không thuộc quyền riêng của ai. Tên game, nhân vật, hình ảnh, âm nhạc, màn chơi, bố cục giao diện của từng game cụ thể thì có bản quyền. Quy tắc cho dự án:

- Không dùng tên, logo, nhân vật, hình, nhạc, tiếng động, bố cục màn chơi hay giao diện của bất kỳ game nào khác, kể cả khi đổi tên.
- Mọi tài sản do đội tự làm hoặc có giấy phép rõ ràng (ghi trong `assets/LICENSES.md`).
- Hình tham khảo chỉ dùng để thống nhất phong cách nội bộ, không đưa vào game.
- Khác biệt cốt lõi phải nhìn thấy trong 1 phút đầu: bối cảnh vịnh Hạ Long, nhân vật Ā Bǎo, khách nói tiếng Trung có pinyin và nghĩa.

Tên làm việc đề xuất (Bảo chọn một, mục 15):

| Phương án | Tiếng Việt | Tiếng Anh | Tiếng Trung |
|---|---|---|---|
| A | Khách sạn Vịnh Ā Bǎo | Ā Bǎo Bay Hotel | 阿宝海湾酒店 (Ā Bǎo hǎiwān jiǔdiàn · Khách sạn vịnh A Bảo) |
| B | Ā Bǎo mở khách sạn | Bao's Hotel Story | 阿宝开酒店 (Ā Bǎo kāi jiǔdiàn · A Bảo mở khách sạn) |
| C | Khách sạn Bảo Khựa | Bao Khua Hotel | 阿宝酒店 (Ā Bǎo jiǔdiàn · Khách sạn A Bảo) |

Đề xuất phương án A: có địa danh (vịnh), dễ nhớ bằng cả ba thứ tiếng, không trùng tên game phổ biến (cần kiểm tra lại trên kho ứng dụng trước khi chốt).

## 5. Vòng chơi

### 5.1 Vòng lõi (30–90 giây)

1. Khách đến cửa, xếp hàng ở quầy lễ tân. Trên đầu khách có lá cờ quốc tịch và thanh kiên nhẫn.
2. Người chơi (nhân vật quản lý) đi tới quầy. Khách nói một câu bằng tiếng của họ; người chơi chọn câu đáp đúng (có pinyin, có nghe lại). Đúng: khách vui, nhận chìa khoá. Sai: khách bớt vui, hiện câu đúng để học.
3. Khách tự đi lên phòng (hoặc nhân viên hành lý dẫn). Trong lúc ở, khách có thể gọi yêu cầu: khăn tắm, đồ ăn, sửa điều hoà. Người chơi mang đồ tới, hoặc nhân viên làm thay.
4. Khách trả phòng, để lại tiền trên quầy. Người chơi đi qua nhặt tiền (tiền bay vào túi, có tiếng).
5. Phòng bẩn cần dọn trước khi khách mới vào ở.
6. Dùng tiền mở ô xây dựng: đặt tiền vào ô có giá, ô đầy thì công trình hiện lên.

### 5.2 Vòng giữa (5–20 phút)

- Mở thêm phòng, quầy, tiện ích theo thứ tự trên bản thiết kế khách sạn.
- Tuyển nhân viên để tự động hoá việc lặp lại (lễ tân, buồng phòng, hành lý, đầu bếp).
- Nâng cấp tốc độ, sức mang của người chơi và nhân viên.
- Hoàn thành nhiệm vụ trong ngày, nhận thưởng.
- Gặp sự kiện ngẫu nhiên: đoàn khách lớn, khách VIP khó tính, mất điện, bão.

### 5.3 Vòng dài (ngày, tuần)

- Lên sao 1★ → 5★ (6–10★ chỉ mở khi Bảo chốt). Mỗi sao mở khu mới, loại khách mới, câu giao tiếp khó hơn (bám khung HSK).
- Mở chi nhánh ở thành phố khác. Mỗi nơi có kiến trúc, món ăn, khách và ngôn ngữ riêng.
- Sự kiện theo mùa 7–14 ngày, đồ trang trí giới hạn.
- Sưu tầm: sổ khách quốc tế, sổ món ăn, Sổ từ.

## 6. Hệ thống chi tiết

### 6.1 Nhân vật người chơi

- Nhân vật quản lý do người chơi điều khiển bằng cần điều khiển ảo (giữ và kéo) hoặc chạm vào nơi muốn tới.
- Mặc định là Ā Bǎo (nối với game Đánh Boss). Về sau cho chọn nhân vật nam/nữ và trang phục.
- Mang đồ theo chồng trên tay (khăn, khay đồ ăn); sức mang nâng cấp được.
- Hoạt ảnh tối thiểu: đứng, đi, chạy, mang đồ khi đi, đưa đồ, nhặt tiền, vẫy tay, ăn mừng, ngạc nhiên. Nhân vật 3D có khung xương nên tay chân cử động thật, không gặp lỗi xé hình như tranh 2D.

### 6.2 Xây dựng và mở rộng

- Khách sạn đặt trên lưới. Mỗi công trình mới là một "ô xây" có giá; người chơi đứng trên ô để đổ tiền vào dần (thanh tiến độ), đủ tiền thì công trình dựng lên với hoạt ảnh.
- Thứ tự mở theo bản thiết kế từng chi nhánh (không cho đặt tự do ở giai đoạn đầu để giữ nhịp chơi và giảm lỗi bố cục). Giai đoạn 4 cân nhắc chế độ trang trí tự do.
- Mỗi tầng mới mở rộng toà nhà lên trên; camera tự lùi để thấy toàn cảnh.

### 6.3 Phòng và tiện nghi

| Loại phòng | Mở khi | Ghi chú |
|---|---|---|
| Phòng đơn tiêu chuẩn | 1★ | Phòng đầu tiên của nhà nghỉ |
| Phòng đôi | 1★ | Cặp đôi, bạn bè |
| Phòng gia đình | 2★ | Khách gia đình có trẻ em, yêu cầu nôi, đồ chơi |
| Phòng hướng biển | 3★ | Giá cao, khách hỏi về cảnh vịnh |
| Phòng hạng sang (suite) | 4★ | Khách VIP, yêu cầu riêng |
| Phòng tổng thống | 6★+ | Chỉ mở khi Bảo chốt 6–10★ |

Mỗi phòng có cấp nội thất (giường, TV, điều hoà, phòng tắm, trang trí). Cấp càng cao, giá phòng và điểm hài lòng càng cao.

### 6.4 Khách

- Thuộc tính: quốc tịch, ngôn ngữ, kiểu khách (du lịch, công tác, gia đình, đoàn, VIP), ngân sách, độ kiên nhẫn, sở thích (ăn uống, bơi, spa), số yêu cầu trong lúc ở.
- Quốc tịch theo giai đoạn: Trung Quốc (giai đoạn 1), Việt Nam, Hàn Quốc, Nhật Bản, Âu–Mỹ (giai đoạn 3 trở đi). Chi tiết ở Phụ lục B.
- Khách đặc biệt: khách VIP (yêu cầu cao, boa lớn), đoàn khách (nhiều người cùng lúc), khách khó tính (phàn nàn, cần xử lý bằng câu xin lỗi chuyên nghiệp), khách quen (quay lại, nhớ tên).

### 6.5 Nhân viên

| Vị trí | Việc tự động | Mở khi |
|---|---|---|
| Lễ tân | Đón khách, giao chìa khoá | 1★ |
| Buồng phòng | Dọn phòng | 1★ |
| Hành lý | Dẫn khách lên phòng | 2★ |
| Đầu bếp, phục vụ | Nấu và mang đồ ăn | 2★ (nhà hàng) |
| Kỹ thuật | Sửa đồ hỏng | 3★ |
| Cứu hộ bể bơi, nhân viên spa | Phục vụ tiện ích | 3–4★ |

Mỗi nhân viên có cấp tốc độ, sức mang, và **kỹ năng ngôn ngữ**. Nhân viên biết tiếng Trung phục vụ khách Trung Quốc nhanh hơn và được boa nhiều hơn. Muốn nâng kỹ năng ngôn ngữ cho nhân viên, người chơi phải hoàn thành bài luyện tương ứng: đây là chỗ nối việc học với việc quản lý.

### 6.6 Ngôn ngữ (lõi học tập)

- Tình huống giao tiếp theo khu: nhận phòng, trả phòng, chỉ đường, gọi món, xử lý phàn nàn, giới thiệu tiện ích, đặt tour, gọi taxi.
- Dạng bài: chọn câu đáp, nghe và chọn nghĩa, sắp xếp câu, điền từ, tình huống (đã có trong `QUESTIONS_RAW`). Thêm dạng mới: nói theo mẫu (ghi âm và so khớp đơn giản), chỉ làm khi đã thử trên điện thoại thật.
- Độ khó bám khung HSK0 → HSK4 theo sao khách sạn. Câu hỏi là luyện tập theo khung HSK, không phải đề thi chính thức.
- Ôn lặp lại ngắt quãng kiểu Anki, gắn với giáo trình và thẻ từ: xem mục 6.17 (đã làm trong bản thử v0.2).
- Giọng đọc: ưu tiên file giọng tạo sẵn (dây chuyền `tools/voice`, cần khoá Gemini), dự phòng giọng máy.
- Ngôn ngữ thứ hai trở đi (tiếng Anh nghề khách sạn, tiếng Hàn, tiếng Nhật): giai đoạn 3–4, mỗi ngôn ngữ cần người duyệt nội dung là người dạy ngôn ngữ đó.
- Luật nội dung: chữ Hán luôn kèm pinyin có dấu và nghĩa Việt; tiếng Hàn, Nhật kèm phiên âm và nghĩa; không ghi "miễn phí", không nhắc hoàn tiền, không nhắc S-VIP.

### 6.7 Kinh tế trong game

| Loại | Kiếm từ | Dùng cho |
|---|---|---|
| Xu | Tiền phòng, boa, nhiệm vụ | Mở ô xây, nâng cấp, tuyển nhân viên |
| Ngọc (hiếm) | Lên sao, thành tích, nhiệm vụ tuần, sự kiện | Đồ trang trí đặc biệt, tăng tốc thời gian xây |
| Điểm sự kiện | Nhiệm vụ trong sự kiện | Phần thưởng của sự kiện đó, hết sự kiện thì quy đổi sang xu |

Quy tắc:

- Mọi loại tiền chỉ dùng trong game, **không đổi ra tiền thật hay quà có giá trị bên ngoài** (Nghị định 147/2024, Điều 57). Không bán xu, ngọc hay vật phẩm bằng tiền thật ở giai đoạn 1–3. Nếu sau này muốn bán, phải có ý kiến chuyên gia pháp lý trước (giấy phép phát hành, phân loại độ tuổi).
- Không có hộp quà ngẫu nhiên mua bằng tiền thật.
- Thu nhập khi vắng mặt có trần (bắt đầu 2 giờ, nâng được tới 8 giờ) để người chơi quay lại nhưng không bị phạt khi bận.
- Cân bằng bằng bảng tính (Google Sheets) và một bản mô phỏng chạy không giao diện: giả lập 30 ngày chơi với 3 kiểu người chơi (5, 15, 40 phút/ngày) để xem lúc nào lên sao. Mục tiêu nhịp: 1★→2★ trong phiên đầu, 3★ trong 3 ngày, 5★ trong 3–4 tuần với người chơi 15 phút/ngày.

### 6.8 Cấp độ và mở khoá

- Hai trục: **cấp người chơi** (XP từ phục vụ, học, nhiệm vụ) và **sao khách sạn** (điểm từ công trình, hài lòng của khách).
- Sao mở khu và loại khách; cấp mở tính năng (sự kiện, tủ đồ, chi nhánh).
- Bảng mở khoá chi tiết ở Phụ lục A.

### 6.9 Nhiệm vụ và thành tích

- Nhiệm vụ chính theo câu chuyện: từ "dọn sạch nhà nghỉ cũ" đến "khai trương chi nhánh đầu tiên ở nước ngoài".
- Nhiệm vụ ngày (3 cái, giống game Đánh Boss đã làm) và nhiệm vụ tuần.
- Thành tích, huy hiệu; sổ sưu tầm: khách quốc tế đã phục vụ, món ăn đã nấu, từ vựng đã học.

### 6.10 Sự kiện

- Lịch sự kiện năm ở Phụ lục C (Tết, Trung thu, Tuần lễ vàng của khách Trung Quốc, Giáng sinh, 11.11…).
- Sự kiện ngẫu nhiên trong ngày: đoàn khách lớn, tiệc cưới, hội nghị, mất điện, bão, khách VIP.
- Cấu trúc một sự kiện mùa: 7–14 ngày, nhiệm vụ riêng, điểm sự kiện, 1 bộ trang trí giới hạn, 1 bộ câu giao tiếp theo chủ đề (ví dụ Tết: chúc mừng năm mới bằng tiếng Trung).
- Sự kiện được viết bằng file cấu hình, không cần sửa mã (đội nội dung tự thêm được).

### 6.11 Cửa hàng và vật phẩm

- Trang trí (cây, tranh, đèn, thảm), chủ đề phòng (hiện đại, Đông Dương, Trung Hoa, biển), đồng phục nhân viên, xe đưa đón, linh vật khách sạn.
- Mua bằng xu hoặc ngọc trong game. Đồ trang trí cộng điểm hài lòng và điểm sao.
- Mỗi món có tên tiếng Trung, pinyin, nghĩa Việt (giữ cách v5: mua phải chọn đúng tên tiếng Trung, có thể bật/tắt).

### 6.12 Nâng cấp

| Nhóm | Ví dụ nâng cấp |
|---|---|
| Khách sạn | Giá phòng, sức chứa sảnh, tốc độ xây |
| Nhân viên | Tốc độ đi, sức mang, kỹ năng ngôn ngữ |
| Người chơi | Tốc độ đi, sức mang, bán kính nhặt tiền |
| Tiện ích | Nhà hàng nấu nhanh hơn, bể bơi nhận nhiều khách hơn |

### 6.13 Chi nhánh quốc tế

| Thứ tự | Nơi | Khách chính | Ngôn ngữ học | Nét riêng |
|---|---|---|---|---|
| 1 | Bãi Cháy, Hạ Long | Trung Quốc | Tiếng Trung | Vịnh, du thuyền, hải sản |
| 2 | Hà Nội | Trung Quốc, Âu–Mỹ | Tiếng Trung, tiếng Anh | Phố cổ, phở, xích lô |
| 3 | Hội An – Đà Nẵng | Hàn Quốc | Tiếng Hàn | Đèn lồng, biển |
| 4 | Phú Quốc | Đa quốc gia | Tiếng Anh | Resort, bãi biển riêng |
| 5 | Quảng Châu hoặc Thượng Hải | Doanh nhân | Tiếng Trung nâng cao | Khách công tác, hội nghị |
| 6 | Seoul, Tokyo, Singapore… | Theo nơi | Theo nơi | Mở dần ở giai đoạn vận hành |

Chi nhánh 2–4 dùng chung bộ nhân vật và phần lớn đồ vật, chỉ thay kiến trúc và trang trí, để giữ chi phí làm hình.

### 6.14 Hướng dẫn tân thủ (10 phút đầu)

| Phút | Người chơi làm | Học được |
|---|---|---|
| 0–1 | Đến nhà nghỉ cũ, dọn rác ở cửa (đi lại, nhặt) | Điều khiển nhân vật |
| 1–2 | Mở quầy lễ tân (đổ tiền vào ô xây) | Cách xây |
| 2–4 | Đón khách đầu tiên: 你好 (nǐ hǎo · xin chào), 入住 (rùzhù · nhận phòng) | Hội thoại tại quầy |
| 4–5 | Nhặt tiền, dọn phòng | Vòng lõi |
| 5–7 | Mở phòng thứ 2 và 3 | Mở rộng |
| 7–9 | Tuyển lễ tân đầu tiên | Tự động hoá |
| 9–10 | Lên 1★, nhận nhiệm vụ ngày | Mục tiêu dài |

Tiêu chí: 80% người chơi thử hoàn thành 10 phút đầu không cần hỏi ai.

### 6.15 Chia sẻ và cộng đồng

- Giai đoạn 1–3: ảnh chụp khách sạn để chia sẻ (đã có cách làm thẻ chia sẻ trong game Đánh Boss), nút vào nhóm Zalo.
- Giai đoạn 4: thăm khách sạn bạn bè, bảng xếp hạng. Cần máy chủ, tức là phải Bảo duyệt thêm dịch vụ ngoài (luật "không gọi máy chủ ngoài").

### 6.16 Nối với khoá học

- Giữ nhắc thẻ hội viên ở mốc tự nhiên (lên sao, xong chương), tối đa 1 lần mỗi ngày, không chặn chơi.
- Link Google Form và Zalo có UTM để đo nguồn.
- Không gắn quyền lợi trong game với việc mua thẻ khi chưa có ý kiến pháp lý.

### 6.17 Giáo trình, thẻ từ và ôn tập kiểu Anki (v1.2, đã có trong bản thử v0.2)

Học và chơi là một vòng: lên sao thì mở bài, khách nói câu của bài, đúng thì có thẻ từ, thẻ từ được ôn đúng lịch, ôn đều thì nhớ và chơi giỏi hơn.

| Thành phần | Cách làm |
|---|---|
| Giáo trình | 6 bài theo lộ trình HSK0 → HSK4 của Bảo Khựa, mỗi bài gắn 1 khu khách sạn và 1 mức sao: Chào hỏi (HSK0, 0★), Nhận phòng (HSK1, 1★), Giờ giấc và tiện ích (HSK1, 2★), Phục vụ phòng (HSK2, 3★), Xử lý sự cố (HSK3, 4★), Trả phòng và tiễn khách (HSK4, 5★). Bản chính thức mở rộng mỗi bài 15–25 thẻ, giáo viên duyệt |
| Thẻ từ | Chữ Hán, pinyin có dấu, nghĩa Việt, câu mẫu (Hán, pinyin, nghĩa) luôn chứa từ của thẻ, nút nghe. Thẻ lật 3D |
| Trong game | Mỗi khách nói câu mẫu của bài đang mở; người chơi chọn nghĩa đúng. Đúng: khách vui, boa xu (chỉ dùng trong game), thẻ vào Bộ thẻ. Sai: hiện đáp án, thẻ hẹn ôn lại sau 10 phút. Khách cũng hỏi lại đúng từ đang đến hạn ôn |
| Ôn hôm nay | Lịch ôn SM-2 rút gọn như Anki, ngày mới tính từ 4 giờ sáng. 4 nút: Lại (10 phút), Khó, Được, Dễ, hiện trước khoảng ngày hẹn. Thẻ vừa quên chỉ hiện lại khi tới giờ |
| Nhắc ôn | Mở game: banner "Hôm nay có N thẻ cần ôn" + số đỏ trên nút Thẻ từ và trên biểu tượng app (đã cài). App đóng: Android (Chrome, đã cài app) thông báo lúc giờ người chơi chọn, mỗi ngày 1 lần (sw.js đọc lịch ôn). iPhone và máy khác: tệp lịch .ics nhắc hằng ngày, mở thẳng vào màn ôn |
| Nối với lớp học | Màn Giáo trình có nút "Học online với Bảo" tới trang thẻ hội viên; bài trong game trùng tên bài trong thẻ tự học (thẻ không gồm lớp Zoom, lớp Zoom đang hoãn) |

Giới hạn hiện tại: thông báo đẩy thật (máy chủ gửi tới iPhone khi app đóng) cần một máy chủ gửi thông báo, đó là dịch vụ ngoài nên phải trình Bảo duyệt trước. Tiến độ và lịch ôn lưu trên máy người chơi; đồng bộ nhiều máy cần tài khoản, để giai đoạn 4.

## 7. Yếu tố quốc tế

- **Giao diện ba thứ tiếng** (Việt, Anh, Trung) từ giai đoạn 2: mọi chữ trên giao diện nằm trong file ngôn ngữ, không viết cứng trong mã. Người chơi chọn ngôn ngữ giao diện và ngôn ngữ học riêng.
- **Nội dung văn hoá chính xác:** câu nói, món ăn, phong tục của từng nước do người bản ngữ hoặc giáo viên duyệt trước khi đưa vào.
- **Phông chữ:** dùng phông hệ thống cho chữ Việt, phông Trung cho chữ Hán (bài học từ game Đánh Boss: không gắn phông Trung vào chữ Việt), thêm phông cho Hàn, Nhật khi mở ngôn ngữ đó.
- **Giờ và lịch:** sự kiện tính theo giờ máy người chơi; lịch sự kiện có cả lễ của Việt Nam và các nước có khách.
- **Phát hành:** web và cài như app (PWA) trước; App Store và CH Play để sau, xem mục 9.5.
- **Quyền riêng tư:** không thu dữ liệu cá nhân khi chưa có chính sách quyền riêng tư được Bảo duyệt; lưu tiến độ trên máy người chơi.

## 8. Mỹ thuật và âm thanh

### 8.1 Phong cách

- 3D low-poly bo tròn, màu tươi, góc nhìn nghiêng khoảng 35° (isometric), camera trực giao.
- Bảng màu thương hiệu: vàng `#FFD91F`, đen `#16171B`, xanh vịnh, cát trắng.
- Nhân vật tỉ lệ chibi (khoảng 2,5 đầu), mặt to, dễ đọc cảm xúc ở màn hình nhỏ.
- Ngày và đêm có ánh sáng khác nhau; đêm bật đèn phòng, biển hiệu.

### 8.2 Quy trình làm hình (v1.1, 06/11/2026: không tốn thêm chi phí)

Bảo hỏi có làm được hình 3D bằng các công cụ AI hiện có mà không tốn thêm tiền không. Trả lời: **được**, theo 4 tầng dưới đây, không thuê ngoài ở giai đoạn 0–1. Bằng chứng: bản thử `hotel/proto/` (sảnh, quầy, sofa, cây, xe hành lý, 2 nhân vật chibi đi lại, nhận phòng) dựng 100% bằng code trong vài giờ, chạy 0 lỗi ở 360×640 và 390×844.

| Tầng | Cách làm | Dùng cho | Chi phí |
|---|---|---|---|
| 1. Dựng bằng code | Claude Code viết khối hình học Three.js (hộp, trụ, cầu, khối tròn), màu theo bảng màu thương hiệu, ánh sáng và bóng đổ | Phòng, tường, sàn, đồ nội thất, nhân vật chibi có khớp (hông, vai, cổ), hiệu ứng | 0 đồng |
| 2. Blender chạy bằng script | Blender (mã nguồn mở, không mất phí) chạy không màn hình, Claude Code viết script Python dựng mô hình cong, chi tiết hơn, khung xương và hoạt ảnh, xuất GLB | Mặt tiền khách sạn, du thuyền, bể bơi, nhân vật cần dáng mềm hơn | 0 đồng (cần cài Blender vào môi trường) |
| 3. Bộ mô hình giấy phép CC0 | Kenney, KayKit (CC0, dùng thương mại không cần ghi tên), Quaternius (kiểm giấy phép từng gói); đổi màu theo thương hiệu, ghép lại | Đồ vật phụ (đèn, chậu cây, hành lý, bếp) để đỡ công | 0 đồng; ghi từng gói vào `assets/LICENSES.md` |
| 4. AI tạo mô hình từ ảnh (tuỳ chọn) | Mô hình mở như TRELLIS, Hunyuan3D chạy trên máy có card đồ hoạ mạnh của Bảo (nếu có); dịch vụ trực tuyến ở gói không trả tiền thường giới hạn lượt và ràng buộc giấy phép nên không dùng cho hình chính | Thử nhanh ý tưởng | 0 đồng nếu có máy phù hợp |

Không dùng: mô hình, nhân vật, tên, giao diện lấy từ game khác (mục 4).

Các bước cho mỗi món hình:

1. Phác thảo ý tưởng (có thể dùng công cụ tạo ảnh để tìm hướng, chỉ dùng nội bộ).
2. Dựng theo tầng phù hợp ở bảng trên, theo bảng quy chuẩn (số đa giác, kích thước, tên).
3. Nhân vật: khớp thật (hông, vai, cổ, gối khi cần) và hoạt ảnh đi, chạy, mang đồ, dọn, ăn, ngủ, vẫy tay, phàn nàn, vui. Không uốn tranh 2D (bài học game Đánh Boss).
4. Hình làm bằng code để thẳng trong mã; hình từ Blender hoặc bộ CC0 xuất GLB, nén (Meshopt hoặc Draco, ảnh KTX2), kiểm tra bằng trình xem trước trong repo.
5. Ghi nguồn và giấy phép vào `assets/LICENSES.md`.

Quy chuẩn kỹ thuật (mục tiêu, chỉnh sau giai đoạn 0):

| Loại | Đa giác | Ảnh |
|---|---|---|
| Nhân vật | ≤ 3.000 tam giác | 1 ảnh 512×512 dùng chung bảng màu |
| Đồ vật nhỏ | ≤ 500 | Bảng màu chung |
| Công trình | ≤ 5.000 | Bảng màu chung + 1 ảnh chi tiết nếu cần |

### 8.3 Video quảng bá (không tốn thêm chi phí)

Một nguồn hình dùng chung cho cả game và video: cảnh 3D của game cũng là trường quay.

| Công cụ | Giấy phép | Dùng cho | Ghi chú |
|---|---|---|---|
| `tools/hotel/capture.js` (đã có) | Của dự án | Quay thẳng cảnh game thành MP4 9:16 cho TikTok, Reels | Bước tay từng khung 1/30 giây rồi ghép bằng FFmpeg; 11 giây video quay trong khoảng 35 giây trên máy chủ không card đồ hoạ |
| HyperFrames (HeyGen) | Apache 2.0, dùng thương mại không tính phí | Video ghép chữ, hiệu ứng, cảnh Three.js viết bằng HTML | Có kỹ năng cho Claude Code; cần Node 22 và FFmpeg (môi trường đã có). bản Studio thường không tính phí, gói Pro trả phí thì không dùng |
| Remotion | Không tính phí cho nhóm tối đa 3 người | Video dựng bằng React (đã dùng cho nền sân đấu game Đánh Boss) | Nhóm lớn hơn 3 người thì phải mua giấy phép công ty |
| OpenMontage | AGPL-3.0 | Quy trình làm video có kịch bản, lồng tiếng, phụ đề | Dùng như công cụ riêng, đặt ngoài repo; video làm ra được dùng tự do. **Không chép mã hay tệp kỹ năng của nó vào repo Bảo Khựa** (sẽ kéo theo nghĩa vụ AGPL). Đường không cần khoá API: Piper TTS đọc offline, Remotion, HyperFrames, FFmpeg, kho ảnh và video mở (không tính phí). Nhà cung cấp tạo video trên mây tính phí thì không bật |
| Google Flow / Veo | Theo gói Google của Bảo | Cảnh quay điện ảnh ngắn | Chỉ dùng trong lượt có sẵn của gói hiện tại |

Giọng đọc: Gemini (khi có khoá, mục 6.6) hoặc Piper TTS chạy offline (kiểm giấy phép từng giọng trước khi dùng).

### 8.4 Âm thanh

- Nhạc nền theo chi nhánh (Hạ Long nhẹ nhàng, Hà Nội đàn dân tộc pha nhạc hiện đại…), nhạc sự kiện.
- Tiếng môi trường: sóng biển, phố, tiếng khách.
- Tiếng giao diện và phản hồi: nhặt tiền, xây xong, lên sao, trả lời đúng/sai.
- Giọng đọc câu giao tiếp (mục 6.6).

## 9. Công nghệ và kiến trúc

### 9.1 Chọn công cụ

| Tiêu chí | Three.js | Babylon.js | PixiJS (2.5D sprite) | Unity / Godot xuất web |
|---|---|---|---|---|
| Tải nhanh trên điện thoại | Tốt (thư viện khoảng 0,6 MB chưa nén) | Trung bình | Rất tốt | Kém (nhiều MB, khởi động lâu) |
| 3D thật, nhân vật có khung xương | Có | Có | Không (phải dựng sẵn thành ảnh) | Có |
| Chạy trên GitHub Pages, tự lưu thư viện | Có | Có | Có | Có nhưng nặng |
| Kinh nghiệm sẵn có trong repo | `v4/` đã tự lưu thư viện 3D cho game cũ | Không | Không | Không |
| Đưa lên kho ứng dụng sau này | Qua Capacitor | Qua Capacitor | Qua Capacitor | Xuất thẳng |

Đề xuất: **Three.js**, viết bằng JavaScript có kiểu (TypeScript) và đóng gói bằng Vite thành các tệp tĩnh. Vẫn đăng bằng GitHub Pages, không cần máy chủ. Giai đoạn 0 làm thử để xác nhận (mục 10).

### 9.2 Cấu trúc thư mục đề xuất

```
hotel/                    mã nguồn game mới (Vite + TypeScript)
  proto/                  bản thử giai đoạn 0 (một tệp HTML + three.module.min.js, chưa đóng gói), video teaser.mp4
  src/
    core/                 vòng lặp, thời gian, lưu tiến độ, sự kiện nội bộ
    world/                cảnh 3D, camera, ánh sáng, lưới xây dựng
    actors/               người chơi, khách, nhân viên (máy trạng thái + tìm đường)
    systems/              kinh tế, xây dựng, nhiệm vụ, sự kiện, ngôn ngữ, sao
    ui/                   giao diện 2D (HTML/CSS phủ lên canvas)
    i18n/                 vi.json, en.json, zh.json
  data/                   cấu hình: phòng, đồ, khách, nhân viên, mở khoá, sự kiện, câu hỏi
  assets/                 GLB, âm thanh, ảnh (kèm LICENSES.md)
  tests/                  kiểm thử Playwright + kiểm thử kinh tế
tools/hotel/              quay video từ cảnh game (capture.js, đã có), mô phỏng cân bằng, kiểm tra dữ liệu, xem trước mô hình
```

Bản đã đóng gói đặt ở `/hotel/` trên baokhua.com để thử. Khi Bảo duyệt đăng thì `khachsan.html` chuyển hướng sang bản mới (giống cách `index_1.html` đang chuyển về trang chủ).

### 9.3 Nguyên tắc kiến trúc

- **Dữ liệu tách khỏi mã:** giá, thời gian, mở khoá, sự kiện, câu hỏi đều nằm trong `data/`. Có bộ kiểm tra dữ liệu tự động (thiếu pinyin, thiếu nghĩa, giá âm, mở khoá vòng tròn).
- **Máy trạng thái cho nhân vật:** mỗi khách và nhân viên có trạng thái rõ (đến, chờ, lên phòng, ở, gọi yêu cầu, trả phòng, rời đi). Dễ kiểm thử, dễ tìm lỗi.
- **Lưu tiến độ có số phiên bản** và hàm chuyển đổi khi cấu trúc thay đổi. Có xuất/nhập mã lưu để đổi máy.
- **Thời gian game độc lập khung hình:** cho phép chạy nhanh trong kiểm thử, bước tay từng khung (bài học từ game Đánh Boss).
- **Hiệu năng là yêu cầu:** đo trên điện thoại thật mỗi 2 tuần.

| Chỉ số | Mục tiêu |
|---|---|
| Khung hình | ≥ 50 khung/giây trên Android tầm trung 3–4 năm tuổi |
| Dung lượng tải lần đầu | ≤ 8 MB |
| Thời gian tới lúc chạm được | ≤ 4 giây trên 4G |
| Lệnh vẽ mỗi khung | ≤ 120 |
| Bộ nhớ | ≤ 250 MB |

### 9.4 Kiểm thử và phát hành

- Kiểm thử tự động bằng Playwright ở 360×640 và 390×844 (như game Đánh Boss): vòng chơi tân thủ, lưu và tải lại, không lỗi console, không gọi máy chủ ngoài, phông chữ.
- Kiểm thử kinh tế: mô phỏng 30 ngày, báo lỗi khi nhịp lên sao lệch quá 20% so với mục tiêu.
- Chạy kiểm thử tự động trên GitHub Actions cho mọi thay đổi (thêm sau giai đoạn 0).
- Đăng theo luật hiện có: làm trên nhánh, chỉ đưa lên `main` khi Bảo gõ "duyệt đăng".

### 9.5 Phát hành: web, cài như app, chợ ứng dụng (v1.2)

Bảo hỏi về app thật trên App Store và CH Play: nếu chi phí quá cao thì bỏ qua, tập trung web cho mượt.

| Cách | Chi phí | Thủ tục, rủi ro | Kết luận |
|---|---|---|---|
| Web baokhua.com | 0 đồng (GitHub Pages) | Không | Làm ngay |
| Cài như app (PWA) | 0 đồng | Không qua chợ. Có biểu tượng trên màn hình chính, mở toàn màn hình, chạy được khi mạng yếu, số đỏ trên biểu tượng. Android cài bằng một nút; iPhone vào Safari, Chia sẻ, "Thêm vào MH chính" | Làm ngay (bản thử đã có manifest, sw.js, biểu tượng) |
| CH Play (Google Play), gói PWA bằng Trusted Web Activity hoặc Capacitor | Phí đăng ký 25 USD một lần (khoảng 650 nghìn đồng) | Tài khoản cá nhân mới phải có 12 người thử liên tục 14 ngày trước khi đăng chính thức; cần chính sách quyền riêng tư; game phát hành ở Việt Nam phải làm thủ tục thông báo phát hành (Nghị định 147/2024); người dưới 18 tuổi bị giới hạn giờ chơi | Để giai đoạn 4, sau khi hỏi pháp lý về thủ tục game hay ứng dụng giáo dục |
| App Store (iPhone) | 99 USD mỗi năm (khoảng 2,6 triệu đồng mỗi năm) | Apple hay từ chối ứng dụng chỉ bọc trang web, phải có thêm tính năng của máy; cần máy Mac hoặc dịch vụ dựng trên mây; cùng thủ tục pháp lý như trên | Để sau CH Play, khi có doanh thu |

Đề xuất: **chưa lên chợ ứng dụng**. Tập trung web và PWA cho mượt từ lúc vào trang tới lúc chơi. Chi phí CH Play không cao, nhưng thủ tục (12 người thử, thông báo phát hành game, quyền riêng tư) tốn công hơn tiền. Mở lại câu hỏi ở giai đoạn 4.

Đường vào game trên baokhua.com (đã làm trên nhánh làm việc, chờ duyệt đăng):

- Màn đầu trang chủ có 2 nút 3D lớn: Chơi game (cam đỏ, nhãn MỚI 3D) và Học online (xanh, tới trang thẻ hội viên). Thanh dưới trên điện thoại có sẵn 2 nút này ngay từ màn đầu.
- Bấm Chơi game mở bảng chọn 3 game ngay trong trang (không tải lại), đồng thời tải trước game để vào nhanh. Chọn game thì có chuyển cảnh vòng tròn vàng rồi vào game.
- Hiệu ứng 3D chỉ dùng biến đổi hình (transform) và độ mờ, card đồ hoạ xử lý nên không lag; dừng khi khuất màn hình; máy bật giảm chuyển động thì tắt.

## 10. Lộ trình

| Giai đoạn | Thời gian | Mục tiêu | Kết quả bàn giao |
|---|---|---|---|
| 0. Chuẩn bị và thử kỹ thuật | 2 tuần | Trả lời: 3D có mượt trên điện thoại không, vòng chơi có vui không, làm hình có kịp không | Bản thử 1 phòng + 1 quầy + nhân vật đi lại; bảng kinh tế đầu tiên; quy chuẩn hình; quyết định công nghệ |
| 1. Lát cắt dọc "Nhà nghỉ Bãi Cháy" | 6 tuần | Vòng lõi hoàn chỉnh trong 15 phút chơi | 1 tầng, 4 phòng, quầy, dọn phòng, nhặt tiền, 2 loại nhân viên, hội thoại nhận phòng, hướng dẫn tân thủ, lưu tiến độ |
| 2. Khách sạn 1★ → 3★ | 8 tuần | Đủ nội dung cho 1 tuần chơi | Nhà hàng, nâng cấp, nhiệm vụ ngày và chính, khung sự kiện, cửa hàng, giao diện 3 thứ tiếng, âm thanh |
| 3. Khách sạn 4★ → 5★ và chi nhánh 2 | 8 tuần | Bản thử công khai trên baokhua.com | Bể bơi, spa, phòng họp, sự kiện Tết, chi nhánh Hà Nội, thành tích, đánh bóng; thay `khachsan.html` khi Bảo duyệt đăng |
| 4. Vận hành và mở rộng | Liên tục | Giữ người chơi, mở thị trường | Sự kiện mỗi tháng, chi nhánh mới, ngôn ngữ mới, cân nhắc kho ứng dụng, máy chủ lưu tiến độ |

Tổng đến hết giai đoạn 3: khoảng 24 tuần làm việc cộng 6–10 tuần dự phòng, tuỳ nguồn lực làm hình.

### 10.1 Giai đoạn 0 chi tiết (2 tuần)

| Việc | Người làm | Xong khi |
|---|---|---|
| Dựng khung dự án Vite + TypeScript + Three.js tự lưu, đăng thử ở `/hotel/` | Lập trình | Trang mở được trên 2 điện thoại thật |
| Cảnh thử: 1 phòng, 1 quầy, ánh sáng ngày đêm, camera nghiêng | Lập trình + hình | Đo khung hình trên Android tầm trung (bản đầu đã có ở `hotel/proto/`, chưa có ngày đêm) |
| Nhân vật thử có khung xương: đi, chạy, mang đồ | Hình | Chạy trong cảnh thử, không lỗi hình (bản đầu: chibi có khớp đi, vẫy tay ở `hotel/proto/`) |
| Điều khiển: cần ảo và chạm để đi | Lập trình | 5 người thử điều khiển không cần hướng dẫn |
| Bảng kinh tế đầu tiên (Sheets) + bản mô phỏng 30 ngày | Thiết kế | Nhịp 1★→3★ khớp mục tiêu ±20% |
| Quy chuẩn hình (mục 8.2), bảng màu, 3 bản phác thảo nhân vật | Hình | Bảo chọn phong cách |
| Chuyển `QUESTIONS_RAW` sang `data/questions.json` + bộ kiểm tra nội dung | Lập trình | Kiểm tra báo 0 lỗi |
| Chốt tên game và tên miền phụ (nếu cần) | Bảo | Có quyết định |

Tiêu chí qua giai đoạn 0: khung hình ≥ 50 trên máy thử, 4/5 người thử nói "muốn chơi tiếp", làm xong 1 nhân vật đủ hoạt ảnh trong ≤ 5 ngày công.

### 10.2 Giai đoạn 1 chi tiết (6 tuần, 3 vòng 2 tuần)

| Vòng | Nội dung | Thử với người chơi |
|---|---|---|
| 1 (tuần 1–2) | Lưới xây dựng, ô xây đổ tiền, 2 phòng, quầy; khách đến, nhận phòng (hội thoại), trả phòng, để tiền; người chơi nhặt tiền | 3 học viên chơi 10 phút, quan sát tại chỗ |
| 2 (tuần 3–4) | Dọn phòng, yêu cầu trong phòng (khăn, nước), tuyển lễ tân và buồng phòng, nâng cấp tốc độ, lưu tiến độ | 5 học viên, đo thời gian lên 1★ |
| 3 (tuần 5–6) | Hướng dẫn tân thủ, âm thanh, hiệu ứng phản hồi, thu nhập khi vắng mặt, nhiệm vụ đầu, đánh bóng | 10 học viên chơi 3 ngày, đo quay lại ngày 2 |

Tiêu chí qua giai đoạn 1 (Definition of Done):

- 80% người thử hoàn thành 10 phút đầu không cần trợ giúp.
- Ít nhất 40% người thử quay lại chơi ngày hôm sau.
- Mỗi người học được trung bình ≥ 8 câu mới trong 15 phút đầu.
- Kiểm thử tự động đạt ở 360×640 và 390×844; không lỗi console; không gọi máy chủ ngoài.
- Khung hình ≥ 50 trên Android tầm trung.

## 11. Tổ chức và nguồn lực

| Vai trò | Việc chính | Ai |
|---|---|---|
| Chủ sản phẩm | Quyết định ưu tiên, duyệt đăng, duyệt nội dung khoá học | Bảo |
| Thiết kế game | Vòng chơi, kinh tế, nhiệm vụ, sự kiện | Xưởng Game và Web (Claude) + Bảo |
| Lập trình | Mã game, kiểm thử, công cụ | Xưởng Game và Web (Claude), có thể thêm 1 lập trình viên |
| Hình 3D | Mô hình, khung xương, hoạt ảnh | Xưởng Game và Web (Claude Code) dựng bằng code, Blender chạy bằng script và bộ CC0 (mục 8.2); chưa thuê ngoài |
| Nội dung ngôn ngữ | Câu giao tiếp, duyệt pinyin, nghĩa, văn hoá | Giáo viên Bảo Khựa; người bản ngữ cho từng ngôn ngữ mới |
| Thử nghiệm | Chơi thử, góp ý | Học viên, đại sứ (không ghi tên vào repo) |

Nơi làm việc:

- Lệnh hằng ngày: Drive `01_LENH_HANG_NGAY`. Báo cáo: `02_BAO_CAO`.
- Việc và tiến độ: GitHub Issues + bảng GitHub Projects (cột: Ý tưởng, Sẵn sàng, Đang làm, Chờ duyệt, Xong).
- Bảng cân bằng kinh tế, nhật ký Kaizen: Google Sheets trên Drive.

## 12. Chỉ số đo

Các mục tiêu dưới đây là giả thuyết ban đầu, sẽ chỉnh theo dữ liệu thật qua các vòng Kaizen.

| Nhóm | Chỉ số | Mục tiêu bản thử |
|---|---|---|
| Trải nghiệm | Hoàn thành hướng dẫn tân thủ | ≥ 80% |
| Giữ chân | Quay lại ngày 1 / ngày 7 / ngày 30 | ≥ 40% / ≥ 15% / ≥ 6% |
| Thời lượng | Phút chơi trung bình mỗi ngày | ≥ 12 phút |
| Học tập | Câu mới học mỗi ngày; tỉ lệ đúng ở lần ôn | ≥ 10 câu; ≥ 75% |
| Kinh doanh | Tỉ lệ bấm đăng ký thẻ từ game (theo UTM) | Đo nền ở giai đoạn 1, đặt mục tiêu sau |
| Kỹ thuật | Khung hình, thời gian tải, lỗi console | ≥ 50; ≤ 4 giây; 0 |
| Chất lượng | Lỗi lọt ra bản thử mỗi vòng | Giảm qua từng vòng |

Muốn đo các chỉ số giữ chân trên nhiều máy cần một công cụ thống kê bên ngoài. Theo luật "không gọi máy chủ ngoài", việc này cần Bảo duyệt công cụ cụ thể (mục 15). Trước khi có công cụ, đo bằng buổi thử trực tiếp và bảng ghi tay.

## 13. Rủi ro

| Rủi ro | Mức | Cách giảm |
|---|---|---|
| 3D chạy chậm trên điện thoại cũ | Cao | Thử ngay giai đoạn 0; chế độ đồ hoạ thấp; giới hạn số nhân vật cùng lúc |
| Làm hình 3D chậm, tốn công | Cao | Bộ đồ vật dùng chung, quy chuẩn đa giác; dựng bằng code và bộ CC0 (mục 8.2); ưu tiên ít mô hình đẹp hơn nhiều mô hình xấu |
| Hình dựng bằng code trông đơn giản, thiếu chất riêng | Trung bình | Bảng màu và ánh sáng thống nhất, nhân vật chủ chốt (Ā Bǎo, khách quốc tế) làm kỹ nhất; Bảo duyệt phong cách hết giai đoạn 0; nếu chưa đạt mới cân nhắc thuê ngoài vài món điểm nhấn |
| Phạm vi phình to | Cao | Mọi tính năng mới phải ghi trụ cột phục vụ; giữ lộ trình, việc mới vào giai đoạn sau |
| Học và chơi lệch nhau (câu hỏi làm chậm nhịp) | Trung bình | Câu hỏi ngắn, đúng ngữ cảnh; nhân viên làm thay những việc lặp lại; đo bằng buổi thử |
| Giống game khác quá mức | Trung bình | Mục 4; người duyệt kiểm tra trước mỗi lần đăng |
| Sai nội dung tiếng Trung, văn hoá | Trung bình | Giáo viên duyệt; bộ kiểm tra dữ liệu tự động |
| Pháp lý (phát hành game, tiền ảo, dữ liệu cá nhân) | Trung bình | Không bán vật phẩm bằng tiền thật, không thu dữ liệu cá nhân khi chưa có tư vấn |
| Phụ thuộc một người | Trung bình | Tài liệu bàn giao, kiểm thử tự động, quy trình chuẩn |

## 14. Pháp lý và luật nội dung

- Tiền và vật phẩm trong game chỉ dùng trong game, không đổi ra tiền thật hay quà có giá trị (Nghị định 147/2024, Điều 57).
- Trước khi bán vật phẩm bằng tiền thật, đưa lên kho ứng dụng, hoặc phát hành cho người chơi nước ngoài: hỏi chuyên gia về giấy phép phát hành trò chơi điện tử, phân loại độ tuổi và quy định của từng kho ứng dụng.
- Trước khi thu bất kỳ dữ liệu cá nhân nào (tài khoản, email, số điện thoại): có chính sách quyền riêng tư theo quy định bảo vệ dữ liệu cá nhân hiện hành, Bảo duyệt.
- Hoa hồng giới thiệu tính riêng bằng tiền đồng, gắn với giao dịch mua thẻ thật, chỉ một cấp; không gắn vào tiền trong game.
- Luật nội dung của `CLAUDE.md` áp dụng cho mọi chữ trong game.
- Repo công khai: không đưa sổ sách, giá vốn, dữ liệu khách hàng, danh sách học viên vào repo. Chi phí dự án ghi trên Drive.

## 15. Quyết định của Bảo

Bảo trả lời ngày 06/11/2026: duyệt các đề xuất, riêng nguồn hình 3D hỏi có làm được bằng công cụ AI hiện có, không tốn thêm tiền không (trả lời ở mục 8.2: được).

| Câu hỏi | Kết quả |
|---|---|
| Hướng đi: game mô phỏng 3D, làm lại hoàn toàn, giữ v5 đến khi bản mới đạt chuẩn | Đã duyệt 06/11 |
| Tên game | Đã duyệt phương án A, Khách sạn Vịnh Ā Bǎo |
| Công nghệ Three.js + Vite, đăng ở `/hotel/` | Đã duyệt 06/11 |
| Nguồn làm hình 3D | Không thuê ngoài: dựng bằng code, Blender chạy bằng script, bộ CC0 (mục 8.2). Bảo duyệt phong cách hết giai đoạn 0 |
| Video quảng bá | Quay từ chính cảnh game, HyperFrames, Remotion; OpenMontage dùng ngoài repo (mục 8.3) |
| Công cụ đo số liệu người chơi (dịch vụ ngoài) | Đồng ý nguyên tắc chọn công cụ không thu dữ liệu cá nhân; công cụ cụ thể trình Bảo trước giai đoạn 1 |
| Thời điểm mở 6–10★ | Chưa mở, chỉ hiện xem trước |
| Có bán vật phẩm bằng tiền thật về sau không | Không ở giai đoạn 1–3; xem lại ở giai đoạn 4 sau tư vấn pháp lý |

## 16. Bản 2.0: game hợp nhất `hotel/` (06/11/2026, tối)

Bảo yêu cầu: "tôi cần 1 game thôi", gộp cả 3 bản đang có (game Khách sạn 2.5D, bản thử 3D, game Đánh Boss), giữ nguyên nhân vật vẽ của game Đánh Boss, bỏ boss lễ tân, đi map khi có sự kiện bất ngờ phải đi mua đồ, mua đồ từng bước từ cái bàn trang trí.

**Cấu trúc 3 tầng (đã làm, nhánh làm việc, chưa đăng):**

| Tầng | Tệp | Vai trò |
|---|---|---|
| Bên ngoài | `hotel/index.html` (tách từ `khachsan.html` v5) | Phố Bãi Cháy 2.5D, đón khách, công trình bên ngoài, HUD, các tab Mua đồ / Ôn tập / Thành tích |
| Bên trong | `hotel/inside.html` (từ `hotel/proto`) | Sảnh 3D, tải khi bấm "Vào trong", nhận danh sách đồ đã mua qua postMessage |
| Sự kiện | `game.html?ev=errand` · `game.html?ev=boss&stage=N` | Đi chợ trên bản đồ phố; Thử thách đánh boss; trả kết quả qua postMessage `bk-event` |

**Mua đồ tầng tầng lớp lớp:** 5 khu × 5 món (Góc chờ → Quầy lễ tân → Góc trà & ánh sáng → Sảnh sang trọng → Sảnh 5 sao). Trong khu mua theo thứ tự, xong khu mới mở khu sau, khu sau còn cần đủ sao. Món đầu tiên là 桌子 (zhuōzi, cái bàn). Mua món nào trả lời tên tiếng Trung món đó; tên món vào Bộ thẻ ôn. Một số món lần đầu mua thì nhà cung cấp hết hàng → Ā Bǎo ra chợ mua (mặc cả được hoàn 30% xu).

**Sao = cấp HSK:** 1★ HSK0 · 2★ HSK1 · 3★ HSK2 · 4★ HSK3 · 5★ HSK4. Lên sao mở bài học mới, khu nội thất mới, boss thử thách mới.

**Boss theo HSK (không còn lễ tân):** HSK0 Cua Thanh Điệu · HSK1 Vali Khổng Lồ · HSK2 Tổ trưởng · HSK3 Quản lý ca đêm · HSK4 Hắc Ninja. Tranh lễ tân cũ thành nhân viên thuê.

**Việc tiếp theo (đề xuất):** khu 6+ là tầng phòng ngủ (cảnh 3D riêng), thêm kiểu sự kiện, bản đồ đi chợ theo khu của cấp HSK, đo trên điện thoại thật, Gemini kiểm câu tiếng Trung mới (danh sách trong báo cáo Drive 06/11).

## Phụ lục A. Mở khoá theo sao (chi nhánh Bãi Cháy)

| Sao | Điểm sao cần | Khu mở | Khách mới | Nhân viên mới | Chủ đề giao tiếp (mức HSK) |
|---|---|---|---|---|---|
| 0★ | 0 | Sảnh, quầy lễ tân, 2 phòng đơn | Khách du lịch Trung Quốc | Không | Chào hỏi, nhận phòng (HSK0–1) |
| 1★ | 50 | Phòng đôi, phòng giặt | Cặp đôi | Lễ tân, buồng phòng | Hỏi giá, giờ ăn sáng, mật khẩu WiFi (HSK1) |
| 2★ | 160 | Tầng 2, nhà hàng, thang máy | Gia đình, khách công tác | Hành lý, đầu bếp | Gọi món, chỉ đường (HSK1–2) |
| 3★ | 400 | Bể bơi, phòng hướng biển, phòng gym | Đoàn khách | Kỹ thuật, cứu hộ | Báo hỏng, giới thiệu tiện ích (HSK2–3) |
| 4★ | 750 | Spa, phòng họp, vườn trên mái | Doanh nhân, khách VIP | Nhân viên spa, thư ký hội nghị | Phàn nàn, đặt hội nghị (HSK3) |
| 5★ | 1.200 | Suite, du thuyền, sảnh tiệc | Tiệc cưới, đoàn đối tác | Quản lý ca | Đàm phán, sự cố, xin lỗi chuyên nghiệp (HSK4) |
| 6–10★ | Theo `STAR_PTS` | Chỉ hiện xem trước | Chưa mở | Chưa mở | Chưa mở khi Bảo chưa chốt |

Điểm sao lấy theo thang hiện có của v5 để người chơi cũ quen. Số liệu chính thức chốt trong bảng cân bằng ở giai đoạn 0.

## Phụ lục B. Khách quốc tế

| Nhóm khách | Mở ở | Ngôn ngữ | Nhu cầu đặc trưng | Câu mẫu |
|---|---|---|---|---|
| Du lịch Trung Quốc | Bãi Cháy 0★ | Tiếng Trung | Du thuyền vịnh, hải sản, đổi tiền | 我想订船游下龙湾 (Wǒ xiǎng dìng chuán yóu Xiàlóng Wān · Tôi muốn đặt thuyền đi vịnh Hạ Long) |
| Doanh nhân Trung Quốc | Bãi Cháy 4★ | Tiếng Trung | Phòng họp, hoá đơn, đón sân bay | 请帮我开发票 (Qǐng bāng wǒ kāi fāpiào · Làm ơn xuất hoá đơn cho tôi) |
| Khách Việt | Bãi Cháy 1★ | Tiếng Việt | Gia đình, cuối tuần | Không cần học, dùng để cân bằng nhịp |
| Hàn Quốc | Hội An | Tiếng Hàn | Đồ ăn Hàn, chụp ảnh | Có phiên âm và nghĩa khi mở |
| Nhật Bản | Hội An, Hà Nội | Tiếng Nhật | Yên tĩnh, đúng giờ | Có phiên âm và nghĩa khi mở |
| Âu–Mỹ | Hà Nội, Phú Quốc | Tiếng Anh | Tour, cà phê, hỏi đường | Câu tiếng Anh kèm nghĩa |

## Phụ lục C. Lịch sự kiện năm (đề xuất)

| Thời gian | Sự kiện | Nội dung |
|---|---|---|
| Tết Nguyên đán (tháng 1–2) | Tết sum vầy | Trang trí đào mai, đèn lồng; câu chúc Tết tiếng Trung: 新年快乐 (xīnnián kuàilè · chúc mừng năm mới) |
| Tháng 2 | Lễ tình nhân | Khách cặp đôi, phòng trang trí hoa |
| 30/4–1/5 | Kỳ nghỉ lễ | Khách Việt đông, đặt phòng gấp |
| Tháng 6–8 | Mùa hè biển | Bể bơi, du thuyền, khách gia đình |
| Rằm tháng 8 âm lịch | Trung thu | Bánh trung thu, đèn ông sao; 中秋节快乐 (Zhōngqiū jié kuàilè · Trung thu vui vẻ) |
| 1–7/10 | Tuần lễ vàng của khách Trung Quốc | Lượng khách Trung Quốc tăng mạnh, nhiệm vụ phục vụ đoàn |
| 31/10 | Halloween | Trang trí, khách hoá trang |
| 11/11 | Ngày hội mua sắm | Cửa hàng trong game giảm giá bằng xu |
| 24–25/12 | Giáng sinh | Cây thông, khách Âu–Mỹ |

## Phụ lục D. Danh sách kiểm tra trước mỗi bản thử

- Kiểm thử tự động đạt ở 360×640 và 390×844; không lỗi console; không gọi máy chủ ngoài.
- Bộ kiểm tra dữ liệu báo 0 lỗi (pinyin, nghĩa, giá, mở khoá).
- Luật nội dung `CLAUDE.md` (không "miễn phí", không hoàn tiền, không S-VIP, không hứa ngày mở 6–10★).
- Đo khung hình trên 1 điện thoại Android thật.
- Có ghi chú phát hành và báo cáo trên Drive `02_BAO_CAO`.
- Khối BÀN GIAO: đã xong, đang vướng, việc cần Bảo duyệt.
