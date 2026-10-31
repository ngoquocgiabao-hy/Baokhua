# SPEC v7 3D – HẠ LONG NGỮ TIÊN (QA/Thiết kế, 30/10/2026)
Kế thừa v6 (cốt truyện, 3 nhân vật, BALANCE v6). v6 HOÃN deploy.

## 1. Câu hỏi (đổi luật)
- Màn hỏi chỉ hiện: chữ Hán + pinyin, HOẶC chỉ âm thanh (speechSynthesis zh-CN/en-US, 0đ). KHÔNG hiện nghĩa tiếng Việt ở câu hỏi.
- Đáp án là 4 nghĩa tiếng Việt (hoặc 4 chữ Hán khi hỏi bằng âm thanh). Nghĩa đúng + pinyin + ví dụ chỉ hiện SAU khi chọn (hiện 1,2s, chạm để bỏ qua).
- Đáp án nhiễu cùng loại: cùng chủ đề (khách sạn/nhà máy/du lịch), cùng từ loại, cùng độ dài ±1 chữ; ưu tiên từ gần âm/gần hình (vd 房间 fángjiān "phòng" – 房卡 fángkǎ "thẻ phòng" – 前台 qiántái "lễ tân" – 退房 tuìfáng "trả phòng").
- JSON thêm trường: "type":"text|audio", "distractor_group":"<chủ đề>". Biên Tập Viên điền.
- Tỷ lệ: màn 1 có 70% text, 30% audio; màn 3 có 50/50.

## 2. Công nghệ
- 1 file HTML + Three.js r160+ (MIT) tải qua CDN jsDelivr, chỉ dùng module cần thiết. Không bundler.
- Mô hình glTF/GLB nén (Draco hoặc meshopt), tổng tải ≤ 2,5 MB.
- Chất lượng tự hạ: nếu FPS < 30 trong 3s thì giảm pixelRatio xuống 1, tắt bóng đổ, giảm sương.

## 3. Điều khiển (mobile)
- Joystick ảo nửa trái màn hình (bán kính 60px, vùng chết 10%).
- Vuốt nửa phải để xoay camera 360° (ngang), dọc giới hạn 10–60°. Hai ngón để zoom 4–12m.
- Chạm vào vật/NPC/boss trong 3m thì tương tác (mở câu hỏi). Nút chiêu 64px ở góc phải dưới.
- Chống chạm nhanh: khóa input 300ms sau mỗi lần trả lời; chỉ nhận 1 lần chọn.

## 4. Cảnh vịnh Hạ Long
- Nước: Three.js Water (normal map) ở chế độ thấp: plane 64x64 segment, sóng bằng shader.
- Núi đá vôi: 6–10 khối dùng instancing (≤ 3 mesh gốc), vertex color, không texture lớn.
- Sương: FogExp2 density 0,015. Trời: Sky shader hoặc gradient. Ánh sáng: 1 DirectionalLight + HemisphereLight. Bóng chỉ cho nhân vật.
- Chiêu thức: particle Points ≤ 300 hạt (Linh Hồ màu xanh lá hồi máu, Kiếm Khách vệt kiếm đỏ, Thiết Vệ khiên vàng).
- Boss: kêu báo trước 1s (vòng đỏ dưới đất) rồi mới đánh (10 HP / 8s như v6).

## 5. Nguồn mô hình 3D CC0 (miễn phí, không ghi công bắt buộc)
- Nhân vật: Quaternius "Ultimate Animated Character Pack"/"RPG Character Pack" – https://quaternius.com (CC0).
- Boss/quái: Quaternius "Ultimate Monsters" (CC0).
- Đá, cây, thuyền: Kenney "Nature Kit", "Pirate Kit" – https://kenney.nl/assets (CC0).
- Texture/HDRI: Poly Haven – https://polyhaven.com (CC0).
- Dev ghi file nguồn + link vào CREDITS.md. Mô hình không ghi CC0 thì KHÔNG dùng (Tiêu Hà duyệt bản quyền).

## 6. BALANCE (giữ v6)
Boss màn 1 có 500 HP, boss hướng dẫn 180 HP, người chơi 100 HP. Trả lời đúng gây 50 sát thương, sai mất 20 HP. Trả lời trong 3s cộng 10 sát thương. Combo 3 câu đúng x1,5, 5 câu đúng x2. Mỗi câu 10s. Thua lần 1 thì boss còn 0,9 HP, thua lần 2 còn 0,8.
GIẢ ĐỊNH: khi bỏ nghĩa tiếng Việt, người mới đúng ít hơn (ước tính khoảng 50%), nên màn 1 giảm boss còn 450 HP. QA sẽ chạy Monte Carlo lại.

## 7. Tiêu chí nghiệm thu (số)
1. 0 câu hỏi hiện nghĩa tiếng Việt trước khi trả lời (QA quét 100% JSON + DOM).
2. 100% câu có pinyin dấu thanh; nghĩa hiện ≤ 200ms sau khi chọn.
3. ≥ 30 fps trung bình, p5 ≥ 24 fps trong 60s ở 360x640, CPU throttle 4x (giả lập máy tầm trung).
4. Slow 3G: chơi được ≤ 8s; tổng tải ≤ 3 MB.
5. Joystick + xoay camera chạy đồng thời 2 ngón, không kẹt; 50 lần chạm nhanh không lỗi.
6. Chạy trên màn 320x568: nút ≥ 44px, không che nhau.
7. Monte Carlo 1000 ván/nhân vật ở độ chính xác 50%: thắng trong 3 lần thử từ 72–85%.
8. 0 lỗi console; mất mạng giữa chừng không trắng màn.
9. 100% mô hình có trong CREDITS.md với link CC0.
10. Vòng chơi đầu: vào trận ≤ 30s từ lúc mở game.

## 8. Thứ tự làm (Dev IT)
B1 cảnh + joystick + camera (đo FPS trước) → B2 nhân vật/boss GLB → B3 câu hỏi kiểu mới → B4 hiệu ứng → gửi QA.
