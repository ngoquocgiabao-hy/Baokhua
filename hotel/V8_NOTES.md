# Khách sạn Vịnh Ā Bǎo · v8 (06/11/2026)

Bản này làm thành phố sống động hơn, sửa cầu, nâng mặt tiền khách sạn đủ 5 hạng sao, thêm khoá thẻ học viên và làm lại nhạc nền.

## 1. Cầu Bãi Cháy và đường sang Hòn Gai
- Cầu cũ nằm lệch khỏi đường (z = 4). Cầu mới (`w-life.js`, `BR`, `roadY()`) nằm đúng trên tim đường phố (z = 14,2), có dốc lên xuống, 2 làn xe, 2 lối đi bộ, lan can, đèn, 2 trụ dây văng sáng nhẹ ban đêm.
- Xe chạy suốt tuyến Bãi Cháy → cầu → Hòn Gai, nghiêng theo dốc cầu. Người đi bộ dồn vào lối đi bộ sát lan can khi lên cầu và đi sang được bên kia.
- Hòn Gai có đường phố, vỉa hè, kè biển, chợ Hạ Long 下龙市场, bảo tàng Quảng Ninh 博物馆 (khối đen bóng), quảng trường 广场 có đài phun nước, nhóm nhảy, trẻ con chạy chơi.

## 2. Thành phố sống
- Dãy nhà thứ hai và phố sau ở Bãi Cháy (nhà nghỉ, karaoke, quán mì, hiệu sách, quán trà, đồ nướng, đồ ngọt…), mỗi biển hiệu có chữ Hán + pinyin + nghĩa.
- Chợ đêm 夜市 với 6 sạp (mực nướng, trà sữa, hải sản, hoa quả, kem, quà lưu niệm), đèn lồng sáng khi tối.
- Người dân sinh hoạt: ngồi quán ăn uống, trò chuyện, chờ xe buýt, tắm biển, đánh bóng chuyền, thả diều, bán kem, đi chợ. Nhà hàng của khách sạn có khách ăn khi đã mua 餐厅.
- Khu vui chơi 游乐园: tàu lượn, ngựa quay, tháp rơi, đu quay dây, khách tham quan.
- **Chạm vào người dân** để học từ theo việc họ đang làm (吃饭, 聊天, 跳舞, 排球, 风筝…), lần đầu +2 xu.
- Vòng quay Mặt Trời 摩天轮 đỏ trên đỉnh đồi Ba Đèo: luôn có, quay chậm, tối lên đèn đỏ ấm. Mua 摩天轮 thì có màn đèn 7 màu chạy đuổi quanh vành.
- Đồ hoạ: vũng sáng dưới chân đèn đường, nắng lấp lánh trên mặt biển, viền tối nhẹ quanh khung hình.

## 3. Mặt tiền khách sạn đủ 5 hạng sao
| Hạng | Bên ngoài |
|---|---|
| 1★ | Nhà nghỉ: mái hiên vải sọc, cục nóng điều hoà, dây phơi đồ trên mái, chậu cây |
| 2★ | Ban công, hoa ở cửa |
| 3★ | Mái kính, phào trụ trắng, bậc thềm đá, biển tên sáng đèn ban đêm |
| 4★ | Sảnh đón có mái lớn và cột vàng, đôi sư tử đá 石狮, phào vàng, cờ |
| 5★ | Viền đèn LED vàng, biển dọc 阿宝酒店, vách kính hông, vương miện 宝 + chóp đèn hiệu, đèn rọi trời ban đêm, sư tử vàng, thảm đỏ |

`World.preview(star)` chụp ảnh khách sạn ở hạng bất kỳ để hiện trong màn mở khoá thẻ.

## 4. Thao tác
- 📍 bay nhanh tới 9 khu: khách sạn, chợ đêm, khu vui chơi, vòng quay, bãi biển, cầu, chợ Hạ Long, bảo tàng, quảng trường.
- Nút ＋/－ để phóng; chạm đúp để phóng tại chỗ; máy tính dùng phím mũi tên/WASD và +/−.
- Chỉ zoom sát (vào sảnh) khi đang ở gần khách sạn, nên phóng to ở khu khác không bị kéo về sảnh.

## 5. Thẻ học viên (khoá chế độ)
- Bản thường: khách sạn tới 2★, Hành trình chặng 1–2 (HSK0–HSK1).
- Cần thẻ: khách sạn 3★ → 5★, Hành trình chặng 3–4 (HSK2–HSK3), Thử thách Boss HSK3–HSK4. Thẻ 3 tháng 99.000đ, thẻ 1 năm 299.000đ.
- Nhắc thẻ ở cuối mỗi lần lên sao (kèm ảnh khách sạn hạng kế tiếp), khi hết phần Hành trình mở sẵn, khi chạm sao đã đủ điểm, khi chạm món mua có nhãn 🎫.
- Mã riêng từng người: 150 mã `BK3M-XXXX-XXXX` (92 ngày) + 150 mã `BK1Y-XXXX-XXXX` (366 ngày). Game chỉ giữ dấu băm SHA-256 có muối (16 ký tự đầu), không giữ mã gốc. Danh sách mã gốc ở Google Sheet riêng trong Drive "BAO KHUA - SO CAI" (không nằm trong repo).
- Nhập mã ở màn mở khoá hoặc tab "Của tôi". Nhập thêm mã mới thì cộng dồn hạn.
- Người chơi bản cũ đã quá 2★ giữ nguyên hạng sao đang có (`S.legacyStar`).
- Giới hạn: kiểm tra mã chạy trên máy người chơi, không có máy chủ, nên một mã có thể dùng trên nhiều máy và người rành kỹ thuật vẫn sửa được dữ liệu lưu. Muốn chặt hơn cần máy chủ kích hoạt.

## 6. Nhạc nền
- 3 bài lofi tự soạn, giai điệu riêng theo ngũ cung kiểu Việt: "Sóng Bãi Cháy" 海浪 (72 BPM, đàn tranh), "Chiều Hòn Gai" 黄昏 (80 BPM, sáo trúc), "Đêm Tuần Châu" 夜晚 (64 BPM). Mỗi bài 4 vòng rồi chuyển bài; có tiếng sóng và tiếng đĩa than rất nhỏ.
- To rõ hơn bản cũ, báo tên bài khi phát, nút ⏭️ đổi bài trong "Của tôi".
- Bài có giấy phép: đặt tệp vào `hotel/music/` và khai báo trong `MUSIC_FILES` (index.html), game sẽ phát các tệp đó thay cho nhạc tự soạn.

## 7. Hiệu năng
- Khối tĩnh tô màu trơn gộp thành 1 lưới tô màu theo đỉnh; xe, thuyền, người dân dùng khối gộp dùng chung; khu sinh hoạt chỉ cập nhật và vẽ khi nằm trong khung hình. Phố mặc định khoảng 330 lệnh vẽ (bản v7 khoảng 310 dù thành phố nhỏ hơn nhiều).

## 8. Bản 8.1 (06/11/2026, lúc đăng lên baokhua.com)
- **Đi chợ đêm và Thử thách Boss chạy ngay trong game.** Bản cũ mở `game.html` trong khung và chờ kết quả, nhưng `game.html` v16 không gửi kết quả về nên các món phải đi chợ (hoa, chìa khoá, trà, cây cảnh, đèn lồng, mèo thần tài) không mua được. Nay: máy quay bay tới chợ đêm, chủ sạp hỏi 你要买什么？ (nǐ yào mǎi shénme? · Bạn muốn mua gì?), chọn đúng tên món (2 lần thử). Boss: 6 câu, đúng 4 câu trước khi hết 3 tim là thắng.
- Tên sản phẩm thống nhất với trang thẻ: **thẻ tự học** (game + tài liệu + nhóm Zalo bài giảng, không gồm Zoom).
- Đường dẫn sâu: `hotel/#the` mở ô nhập mã; `hotel/#market`, `#park`, `#wheel`, `#bridge`… bay tới khu đó.
- `sw.js`: lấy mạng trước (cập nhật là người chơi nhận ngay), lưu sẵn tệp chính để chơi khi mạng yếu, nhắc ôn thẻ.
- Chuyển trang mượt giữa trang chủ, game và trang thẻ (View Transitions).
