# Kế hoạch nhân vật 3D trên web mobile (0đ) — Bảo Khựa 阿宝

**Mục tiêu:** đưa tướng ninja + boss lễ tân lên game HTML chạy mượt trên điện thoại, **không tốn tiền**, không bắt buộc backend.

**Hiện trạng:** `game_v2.html` dùng emoji + CSS/canvas (FX hạt, rung màn, thanh máu trail). Đủ chơi nhanh. Bước 3D là nâng cấp hình ảnh sau khi Media có asset.

---

## 1. Các phương án miễn phí (đã kiểm tra link mở được)

| Phương án | Phù hợp | Link đã verify (HTTP 200) | Ghi chú |
|-----------|---------|---------------------------|---------|
| **A. three.js (CDN) + GLB** | Game combat, animation | https://threejs.org/ · https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js | Chuẩn web, điều khiển đầy đủ, cần code thêm |
| **B. `<model-viewer>`** | Xoay xem nhân vật / màn chọn tướng | https://modelviewer.dev/ · https://cdn.jsdelivr.net/npm/@google/model-viewer@4.0.0/dist/model-viewer.min.js | Ít code, tốt cho showcase; combat phức tạp hơn A |
| **C. Model miễn phí GLB/GLTF** | Asset | https://poly.pizza/ · https://poly.pizza/search?q=ninja · https://kenney.nl/ · https://kenney.nl/assets/series:Characters · https://quaternius.com/ · https://github.com/quaternius · https://github.com/KhronosGroup/glTF-Sample-Models · https://sketchfab.com/ (lọc Downloadable / CC) | Ưu tiên CC0 / CC-BY ghi nguồn |
| **D. Mixamo (animation)** | Gắn idle / punch / hit | https://www.mixamo.com/ · https://www.mixamo.com/#/ | Tài khoản Adobe miễn phí; xuất FBX rồi convert GLB (Blender miễn phí) |
| **E. Draco nén mesh** | Giảm dung lượng GLB | https://google.github.io/draco/ · decoder CDN: https://www.gstatic.com/draco/versioned/decoders/1.5.7/draco_decoder.js | Nên bật khi GLB > ~1MB |

**Ready Player Me:** trang avatar thường dùng cho nhân vật dạng người dùng tự tạo. Từ máy build hiện tại **không mở được** (`readyplayer.me` timeout/ERR). Có thể thử lại sau trên máy anh; **không phụ thuộc** phương án này vì đã có Poly Pizza / Kenney / Quaternius.

---

## 2. Phương án đề xuất (0đ) — làm theo thứ tự

### Bước 1 — Media thiết kế (2D trước, 3D sau)
- Character sheet **Tướng ninja Bảo Khựa** (front / side / 3/4): trang phục gợi Hạ Long / biển, có thể có chi tiết “宝”, tỉ lệ chibi hoặc low-poly game.
- Character sheet **Boss Lễ Tân Khó Tính**: đồng phục lễ tân khách sạn Bãi Cháy, biểu cảm khó tính, props (chuông quầy / sổ / thẻ phòng).
- Palette khớp brand: vàng `#FFD91F`, denim `#1E5AA8`, mực `#16171B`.
- Export thêm sprite sheet 2D (idle, attack, hit) để dùng ngay nếu 3D chưa kịp.

### Bước 2 — Lấy model / animation miễn phí
1. Tìm base low-poly trên [Poly Pizza](https://poly.pizza/search?q=ninja) hoặc [Kenney Characters](https://kenney.nl/assets/series:Characters) / [Quaternius](https://quaternius.com/).
2. (Tuỳ chọn) Rig + clip trên [Mixamo](https://www.mixamo.com/): Idle, Punch, Hit React, Victory.
3. Blender (miễn phí): gộp mesh, giảm poly, xuất **GLB < 2MB**, bật Draco nếu cần.

### Bước 3 — Đưa vào web mobile
- **Khuyến nghị chính:** three.js module từ jsDelivr + `GLTFLoader` (+ `DRACOLoader` nếu nén).
- Giữ logic game như `game_v2.html` (câu hỏi, localStorage, upgrade); chỉ thay lớp `arena` emoji bằng canvas WebGL nhỏ (cao ~180–220px).
- Fallback: nếu máy yếu / WebGL lỗi → giữ emoji/sprite 2D (feature detect).

### Bước 4 — Không làm (tránh tốn tiền / nặng máy)
- Không mua asset store trả phí.
- Không stream model lớn từ server nặng.
- Không dùng engine đầy đủ (Unity/Unreal) cho MVP mobile web này.

---

## 3. Tip hiệu năng mobile

- **Low-poly:** < 5–8k triangles / nhân vật; 1–2 material; texture ≤ 512px (hoặc 256px).
- **GLB < 2MB** (lí tưởng < 800KB/nhân vật); Draco khi cần.
- Một đèn hemisphere + một directional; **không** shadow map trên điện thoại yếu.
- Pixel ratio: `Math.min(devicePixelRatio, 2)`; pause render khi tab ẩn / overlay nâng cấp mở.
- Animation: 2–4 clip ngắn; không blend phức tạp.
- Prefers-reduced-motion: tắt shake / particle / giảm animation (đã có hướng này ở v2 CSS).
- Test thật trên Chrome Android + Safari iOS; tránh autoplay sound nặng.

---

## 4. Việc cần Media làm (checklist giao việc)

1. Character sheet tướng ninja (tỉ lệ, màu, chi tiết nhận diện Bảo Khựa).
2. Character sheet boss lễ tân khách sạn Bãi Cháy.
3. Pose tối thiểu: idle, tấn (phi tiêu / chém), hit, win — sketch hoặc sprite.
4. Nếu làm 3D: file nguồn Blender + GLB final đã tối ưu; ghi rõ licence nếu dùng base Kenney/Quaternius/Poly Pizza.
5. Icon chiêu cho UI: Phi tiêu · Chém gió · Long Hạ (có thể 2D).

---

## 5. Kết luận ngắn

**Đường 0đ nên chọn:** Media vẽ sheet → lấy/điều chỉnh model CC0 (Kenney / Quaternius / Poly Pizza) → (tuỳ chọn) Mixamo → GLB nhẹ → three.js CDN trong arena game, có fallback 2D.  
`model-viewer` dùng cho trang giới thiệu nhân vật; combat giữ three.js hoặc sprite.

Demo hiện tại (chưa 3D): `/workspace/game/game_v2.html` — chỉ local, **chưa đẩy** GitHub Pages.
