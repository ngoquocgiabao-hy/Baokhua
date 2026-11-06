# Khách sạn Vịnh Ā Bǎo · v7 (06/11/2026)

Bản này làm lại toàn bộ phần hình 3D, cách vào game và lộ trình học.

## 1. Một thế giới 3D, ba tầng nhìn liền mạch
- `world.js` + `w-kit.js` + `w-lobby.js` (Three.js r170, có sẵn ở `lib/`).
- Phố 2D cũ (canvas) và sảnh trong khung riêng (`inside.html`) được thay bằng **một cảnh 3D duy nhất**, cùng kiểu vẽ: khối bo tròn, tô hoạt hình 3 tông, viền mực.
  - **Toàn vịnh** (kéo ra xa / nút 🗺️): bản đồ Hành trình, các ghim chương, cầu Bãi Cháy, Hòn Gai, Tuần Châu, Cẩm Phả, sông Bạch Đằng, đảo đá vôi.
  - **Phố Bãi Cháy** (mặc định): khách sạn, dãy quán, đường, bãi biển, xe, người, thuyền.
  - **Bên trong**: chạm khách sạn hoặc nút 🛋️ là máy quay bay vào; tường ngoài mờ dần, lộ sảnh ngay trong toà nhà. Không tải trang khác nên không còn giật. Mọi vật liệu được biên dịch sẵn lúc mở game.
- Chụm 2 ngón / cuộn chuột để phóng to, thu nhỏ liên tục; kéo để đi.
- Khách xếp hàng ngoài cửa, được phục vụ thì **đi bộ qua cửa kính vào sảnh**, tới quầy, rồi lên thang máy; cửa sổ phòng sáng đèn khi có khách ở.
- `inside.html` giữ lại cho bản cũ đang mở dở, game mới không dùng nữa.

## 2. Nâng cấp theo sao, trong và ngoài đồng bộ
- Mặt tiền: 1★ nhà nghỉ đơn giản → 2★ ban công → 3★ mái kính, hoa ban công → 4★ phào vàng, cờ, đèn hắt → 5★ vương miện 宝, thảm đỏ.
- Sảnh: sàn gỗ → đá → cẩm thạch viền vàng, tường và phào chỉ đổi theo sao.
- Công trình ngoài phố (tầng, biển neon, đèn lồng, dây đèn, thang máy kính, bể bơi và vườn trên mái, nhà hàng, dừa, ô, du thuyền, vòng quay, pháo hoa) hiện đúng chỗ trong cảnh 3D.

## 3. Chọn trình độ khi vào game
- 🌱 Chưa biết gì · 🌿 HSK1 · 🌳 HSK2–3 · 🏆 HSK4+, hoặc làm bài thử 8 câu.
- Người mới: đi **Hành trình** trước, nhà nghỉ đóng cửa tới khi xong chặng 1, chưa có boss.
- Câu khách hỏi theo đúng trình độ: thêm 14 câu HSK0 rất ngắn và 10 câu HSK1; mỗi câu cũ được gắn cấp.
- Người chơi bản cũ giữ nguyên sao, nhận màn "Có gì mới" và có thể chọn lại trình độ.

## 4. Hành trình Hạ Long (HSK0 → HSK3)
12 chương / 4 chặng, mỗi chương một địa danh, một câu chuyện, 6 từ có câu mẫu, 4 câu thử thách (cần 3/4). Tiếng Trung luôn kèm pinyin có dấu và nghĩa Việt.

| Chặng | Chương |
|---|---|
| 1 · HSK0 · Trở về Bãi Cháy | Bến xe Bãi Cháy · Truyền thuyết Rồng hạ · Hòn Gà Chọi |
| 2 · HSK1 · Ra khơi | Đảo Ti Tốp · Hang Sửng Sốt · Làng chài Cửa Vạn |
| 3 · HSK2 · Ngày xưa, bây giờ | Cẩm Phả · Chợ Hạ Long · Cầu Bãi Cháy |
| 4 · HSK3 · Làm nghề ở Quảng Ninh | Cảng Tuần Châu · Sông Bạch Đằng · Khách sạn Vịnh Ā Bǎo |

Xong một chặng thì khách sạn mở thêm một hạng sao (`S.lv`: chặng 1 → 1★, chặng 2 → 2★, chặng 3 → 3★, chặng 4 → 5★ và boss). Từ của chương vào Sổ ôn tập.

## 5. Boss chỉ còn HSK3–HSK4
Sự kiện "quái lạc vào khách sạn" chỉ đến khi đã xong Hành trình và khách sạn đạt 4★ (Quản lý ca đêm, HSK3) hoặc 5★ (Hắc Ninja, HSK4). Phần HSK0–HSK2 đã chuyển sang Hành trình.
