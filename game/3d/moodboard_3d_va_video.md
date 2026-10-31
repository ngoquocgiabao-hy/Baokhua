# Moodboard 3D + Session video gameplay — Bảo Khựa 阿宝

*IP · game web mobile 1 file HTML · học Trung/Anh · trả lời đúng → nhân vật mạnh lên đánh boss · bản đồ dọc ven biển Hạ Long–Cẩm Phả*  
*Ngày: 30/10/2026 Asia/Saigon · Media nộp · Hạn TGĐ: 11:00 30/10*  
*GIẢ ĐỊNH: Thiết Vệ = thợ xưởng dệt (khiên trục vải + cuộn chỉ) theo art v6 đã sửa; không dùng khiên mũ hàn cũ.*  
*0đ · chỉ asset CC0 / MIT CDN · không đề xuất trả phí.*

---

## 1) Moodboard 3D

### 1.1 Phong cách
- **Low-poly / stylized nhẹ** (Kenney–Quaternius vibe): cạnh mềm, màu phẳng + 1 lớp ambient occlusion nhẹ.
- Tỉ lệ chibi vừa (đầu ~1/4–1/5 thân) để đọc rõ trên màn mobile dọc.
- 1–2 material/nhân vật; texture ≤ 512px; GLB mục tiêu &lt; 800KB/nhân vật (Draco nếu &gt; 1MB).
- Không photoreal, không PBR nặng, không shadow map trên máy yếu.

### 1.2 Bảng màu (hex)

| Vai trò | Màu | Hex | Ghi chú |
|---------|-----|-----|---------|
| Biển vịnh (nước nông) | Xanh ngọc | `#3DB8C5` | mặt nước gần bờ |
| Biển sâu / trời xa | Xanh hải湾 | `#1E90C6` | khớp Kiếm Khách |
| Đá vôi Hạ Long | Xám đá | `#8A9A8E` → `#5C6B73` | gradient nhẹ |
| Cỏ đỉnh đảo | Xanh dầu | `#2F4F4F` | đỉnh karst |
| Giờ vàng (ánh sáng) | Cam vàng | `#FFB347` | key light chiều |
| Sương vịnh | Trắng xanh | `#E8F4F8` @ alpha 0.25–0.4 | fog gần mặt nước |
| Brand vàng | Vàng tour | `#FFD91F` | UI / cờ HL |
| Mực viền | Đen ấm | `#16171B` | outline nhẹ |
| **Linh Hồ** | Hồng đào / kem / tóc nâu-đỏ | `#FF8FB8` / `#FFF5EE` / `#8B4513` | |
| **Kiếm Khách** | Xanh HL / vàng / đỏ đai | `#1E90C6` / `#FFD91F` / `#E63946` | |
| **Thiết Vệ** | Xám thép / cam xưởng / chỉ | `#5C6B73` / `#FF7A18` / `#C0C8CE` | |

### 1.3 Ánh sáng
- **Giờ vàng (chiều Hạ Long):** 1 Directional `#FFB347` góc ~35° từ phải; intensity vừa; không shadow.
- **Hemisphere:** sky `#87CEEB` + ground `#8A9A8E` (đá/cát).
- **Sương vịnh:** fog linear gần mặt nước (`#E8F4F8`), density thấp — đọc silhouette nhân vật vẫn rõ.
- **HDRI tham chiếu (CC0):** Poly Haven Signal Hill Sunrise — chỉ lấy hướng màu/ánh sáng, hoặc embed 1K nếu máy chịu được.
- Fallback máy yếu: chỉ hemisphere + directional; tắt fog.

### 1.4 Cảnh vịnh Hạ Long / Cẩm Phả
- **Bản đồ dọc:** đường ven biển đá → cầu/cảng nhỏ → đảo đá vôi → đoạn Cẩm Phả (nhà máy/xưởng dệt xa, silhouette).
- **Layer cảnh (từ gần → xa):**
  1. Đường/cát + cỏ thấp
  2. Đá lớn / vách karst
  3. Mặt nước low-poly + foam mép
  4. Thuyền nhỏ neo / chạy xa
  5. Đảo đá chồng lớp (parallax scroll dọc)
  6. Trời + sương
- **Arena combat:** sàn đá phẳng + nền vịnh mờ; camera 3/4 cố định (không orbit khi đánh).

### 1.5 Hiệu ứng chiêu (từng nhân vật)

| Nhân vật | Chiêu | Visual 3D (mobile) |
|----------|-------|---------------------|
| **Linh Hồ** 灵狐 Línghú | Hồi xuân quán | Vòng sóng mint `#98D8C8` từ chân → particle lá trà / hơi ấm; số `+HP` bay lên |
| Linh Hồ | Đình ngôn | Quạt lụa xoè → vòng vàng `#FFD91F` quanh boss; icon 🔇 / chữ mờ 3s |
| **Kiếm Khách** 剑客 Jiànkè | Liên cú thuyết minh | 3 vệt slash chữ Z xanh `#1E90C6`; screen-shake nhẹ; chữ `COMBO` |
| Kiếm Khách | Đột kích Bãi Cháy | Dash blur ngang ~120ms + flash trắng 1 frame; hit lớn |
| **Thiết Vệ** 铁卫 Tiěwèi | Giáp xưởng | Aura xám `#5C6B73` + sợi chỉ quanh hero 4s; sát thương hiện `−` bị gạch |
| Thiết Vệ | Phản âm | Khiên trục vải rung → sóng xung cam `#FF7A18`; chữ `PHẢN`; `navigator.vibrate` nếu có |

Particle tối đa ~30–40/chiêu; tắt khi `prefers-reduced-motion`.

### 1.6 Cách quay màn hình & dựng (CapCut)

**Quay (trên điện thoại / emulator):**
- Game mở full màn, thanh địa chỉ ẩn nếu PWA/fullscreen.
- Ghi màn hình **9:16**, khuyến nghị **60fps** (hoặc 30fps nếu máy nóng — ghi rõ trong metadata session).
- Tắt thông báo; độ sáng cao; không hiện notch/app chồng.
- Mỗi session = 1 lần chơi liên tục (không cắt giữa trận nếu có thể); để Editor/CapCut cắt sau.

**Dựng CapCut (Media giao pack chữ; Editor dựng):**
- Canvas **9:16** · export **60fps** (hoặc khớp footage) · bitrate đủ rõ chữ Hán.
- Overlay chữ tối đa **3 dòng**: Hán · pinyin có dấu · nghĩa VI.
- Hook 3s đầu: chữ to + zoom nhẹ vào nhân vật/chiêu; không effect nặng “quê”.
- CTA cuối: “Link game trong bio” (không tự đăng — chờ CHỦ DUYỆT).
- Nhạc: chỉ track free/CC0 hoặc im tiếng + SFX game; không dùng beat trả phí.

---

## 2) Danh sách session quay video gameplay (TikTok)

*8 session · chữ hook tiếng Việt; câu Trung kèm pinyin + nghĩa.*

| # | Cảnh quay | Dài | Hook 3 giây đầu |
|---|-----------|-----|-----------------|
| 1 | Chọn tướng: 3 nhân vật xoay nhẹ / idle | 15–20s | «Đoàn nào đi Hạ Long với bạn?» + chữ 欢迎光临！ **Huānyíng guānglín!** *(Xin chào quý khách!)* hiện khi chạm Linh Hồ |
| 2 | Câu đúng → Linh Hồ hồi máu (Hồi xuân quán) | 20–25s | «Trả lời đúng = máu đầy!» · 加油！ **Jiāyóu!** *(Cố lên!)* |
| 3 | Kiếm Khách combo 3 hit (Liên cú) | 20–25s | «Combo ×3 trong 1 câu» · 跟我来！ **Gēn wǒ lái!** *(Theo tôi nào!)* |
| 4 | Thiết Vệ đỡ đòn + Phản âm | 20–25s | «Đứng sau thợ xưởng» · 有我在。 **Yǒu wǒ zài.** *(Có tôi ở đây.)* |
| 5 | Scroll bản đồ ven biển Hạ Long → Cẩm Phả | 15–20s | «Đường biển mở khi trả lời đúng» · 海边。 **Hǎibiān.** *(Bờ biển.)* |
| 6 | Boss fight đầy đủ (1 vòng hỏi–đánh) | 25–30s | «Boss vịnh không tha sai 1 chữ» · 加油！ **Jiāyóu!** *(Cố lên!)* |
| 7 | Level-up / nhân vật mạnh lên sau chuỗi đúng | 15–20s | «Học 1 câu = mạnh 1 bậc» · 谢谢！ **Xièxie!** *(Cảm ơn!)* |
| 8 | Win screen + CTA bio (không hiện giá/membership “miễn phí”) | 12–18s | «Chơi thử — link trong bio» · 再见！ **Zàijiàn!** *(Tạm biệt!)* |

**Ghi chú quay:** mỗi session 1 take sạch; Media chỉ giao script + chữ trên màn; Editor dựng CapCut theo mục 1.6.

---

## 3) Mô hình 3D giấy phép CC0 (ưu tiên glTF/GLB)

*Đã mở trang nguồn (WebFetch/WebSearch) · ghi rõ CC0 · 0đ.*

### 3.1 Nhân vật (base → Dev IT/Media chỉnh màu/props theo sheet v6)

| Dùng cho | Pack / model | Format | License | Link nguồn (đã xác minh trang tồn tại) |
|----------|--------------|--------|---------|----------------------------------------|
| Base **Linh Hồ** (nữ modular) | Quaternius Ultimate Modular Women Pack | FBX + **GLB** | **CC0** (Poly Pizza: Public Domain CC0) | https://poly.pizza/bundle/Ultimate-Modular-Women-Pack-aCBDXDdTNN · gốc https://quaternius.com/packs/ultimatemodularwomen.html |
| Tai cáo / tham chiếu cáo | Quaternius Fox (Poly Pizza) | FBX/**GLTF** | **CC0** | https://poly.pizza/m/Bc97C66HKi |
| Base **Kiếm Khách** / **Thiết Vệ** (nam modular) | Quaternius Ultimate Modular Men Pack | FBX + **GLB** | **CC0** | https://poly.pizza/bundle/Ultimate-Modular-Men-Pack-ZiH8muWqwQ · gốc https://quaternius.com/packs/ultimatemodularcharacters.html |
| Nhân vật mini dự phòng (nhẹ mobile) | Kenney Mini Characters | **GLB**/FBX/OBJ | **CC0** (Kenney toàn site asset = CC0) | https://kenney.nl/assets/mini-characters |

*Props tự làm bằng primitive three.js / Blender free: quạt lụa, kiếm gấp, khiên trục vải, cuộn chỉ — không mua pack.*

### 3.2 Cảnh vịnh / biển / đá / thuyền / cây

| Thành phần | Pack / asset | Format | License | Link |
|------------|--------------|--------|---------|------|
| Cây, đá, địa hình low-poly | Kenney Nature Kit | glTF/OBJ/FBX (trong zip) | **CC0** | https://kenney.nl/assets/nature-kit |
| Thuyền / tàu | Kenney Watercraft Kit | glTF/FBX/Blend | **CC0** | https://kenney.nl/assets/watercraft-kit |
| Đá vôi / vách biển (hero prop; giảm poly trước khi gắn web) | Poly Haven Coastal Cliff 01 | **glTF**/FBX/Blend | **CC0** (polyhaven.com/license) | https://polyhaven.com/a/coastal_cliff_01 |
| Thiên nhiên stylized + glTF sẵn | Quaternius Ultimate Stylized Nature Pack | FBX/OBJ/**glTF**/Blend | Free commercial (Quaternius CC0 dòng pack) | https://quaternius.com/packs/ultimatestylizednature.html |

### 3.3 Ánh sáng / texture hiệu ứng (không phải mesh bắt buộc)

| Thành phần | Asset | Format | License | Link |
|------------|-------|--------|---------|------|
| HDRI giờ vàng | Poly Haven Signal Hill Sunrise | HDR/EXR | **CC0** | https://polyhaven.com/a/signal_hill_sunrise |
| HDRI trời sạch (fallback) | Poly Haven Quarry 01 Pure Sky | HDR/EXR | **CC0** | https://polyhaven.com/a/quarry_01_puresky |
| Foam mép sóng | ambientCG Foam 003 | PBR maps | **CC0** | https://ambientcg.com/view?id=Foam003 · license https://ambientcg.com/license |
| Đá / mặt đất tô màu karst | ambientCG Rock 001 · Ground 001 | PBR maps | **CC0** | https://ambientcg.com/view?id=Rock001 · https://ambientcg.com/view?id=Ground001 |

### 3.4 Runtime web (không phải model; MIT, CDN free)
- three.js + GLTFLoader: xem `/workspace/game/FREE_RESOURCES.md` (đã pin CDN).
- **Không** đề xuất Mixamo bắt buộc cho MVP; animation có sẵn trong pack Quaternius/Kenney trước.

---

## PHẦN TIẾP THỊ

# PHẦN TIẾP THỊ — Định hướng hình ảnh 3D Bảo Khựa 阿宝

**Người viết:** Tiếp thị  
**Hạn ghép chung với Media:** 09:30 30/10 (Asia/Saigon)  
**File Media ghép (không sửa từ phía Tiếp thị):** `/workspace/game/3d/moodboard_3d_va_video.md`

**Bối cảnh sản phẩm:** game học tiếng Trung/Anh trên mobile web; trả lời đúng → nhân vật mạnh lên đánh boss; bản đồ đường ven biển Hạ Long–Cẩm Phả; chủ đề tu tiên (tú xiān, tu tiên). Bảo chê đồ họa sơ đẳng; muốn cảm giác 3D xoay 360° và điều khiển bằng chạm.

**Ràng buộc nội dung:** không bán vật phẩm bằng tiền thật, không gacha, không đề xuất chi phí. Mọi câu tiếng Trung kèm pinyin có dấu thanh + nghĩa Việt. Số liệu có link hoặc ghi «chưa kiểm chứng».

---

## 1) Năm mẫu 3D mobile tu tiên / anime (link đã mở được)

Mỗi mẫu: 1 link video thật (HTTP 200, kiểm tra 30/10) + điều đáng học cho hình ảnh Bảo Khựa.

| # | Mẫu | Link video | Học gì cho mình |
|---|-----|------------|-----------------|
| 1 | **Genshin Impact** — Official Launch Trailer (IGN) | https://www.youtube.com/watch?v=HLUY1nICQRY | Thế giới mở đọc được ngay từ xa: silhouette nhân vật rõ, biển–núi–ánh sáng ấm; cảm giác «muốn xoay camera» chứ không phải ảnh phẳng. |
| 2 | **Nhất Niệm Tiêu Dao / Overmortal** — Gameplay Android | https://www.youtube.com/watch?v=98mux7QmYmI | Tu tiên màn hình dọc: UI lớn, hiệu ứng đột phá cảnh giới (突破 tūpò, đột phá) dễ cắt TikTok; vòng lặp «tu luyện → mạnh hơn» hiện rõ. |
| 3 | **Overmortal** — First Look gameplay dài hơn | https://www.youtube.com/watch?v=_THusvN5iGI | Cách show nhân vật 3D + skill theo nhịp; dùng làm tham chiếu nhịp cắt khi quay session học–đánh boss. |
| 4 | **Honkai: Star Rail** — Official Extended Gameplay Trailer | https://www.youtube.com/watch?v=MIjs41aHBpE | Anime 3D sạch, màu bão hòa, boss/skill «đập» mạnh trong vài giây — hợp hook TikTok. |
| 5 | **Wuthering Waves** — Official Release Trailer | https://www.youtube.com/watch?v=R8htow_6tRc | Camera bay + chạm điều khiển khám phá; cảm giác 3D thật khi chạy/đấu. Gameplay beta: https://www.youtube.com/watch?v=8SWEnKO9RMI |

**Phụ (tuỳ chọn khi Media cần thêm 1 clip hành động):** Tower of Fantasy — Creative Gameplay Trailer https://www.youtube.com/watch?v=1K8hBYPiojM (combat + khám phá gọn ~55s).

**GIẢ ĐỊNH:** Bảo Khựa không bắt chước UI AAA; chỉ học: silhouette rõ, màu ven biển Hạ Long, payoff ngay sau đúng câu hỏi (nhân vật mạnh lên / boss gục).

---

## 2) Ba điểm khán giả Việt thích

1. **Đồ họa anime / tu tiên «đẹp – dễ đọc» trên điện thoại**  
   Thị trường VN liên tục đón MMORPG/idle tu tiên 3D (ví dụ loạt tin về game tu tiên trên KenhGameVN: https://kenhgamevn.com/game-mobile/top-6-game-mobile-tu-tien-cuc-hot-vua-duoc-ra-mat-tai-viet-nam/).  
   → Học: nhân vật to, màu rõ, không texture bẩn.

2. **Video ngắn native TikTok + nhiều creative, không intro logo**  
   Case VNG VLTK1M trên TikTok: >40 creative, creator địa phương, >46k installs tuần đầu (case TikTok/VNG: https://www.nuoae.com/tiktok-marketing/tiktok-game/30.html). Brands Vietnam cũng ghi Funtap/VNG/Amanotes/Fidget Dev tối ưu video ngắn trên TikTok: https://www.brandsvietnam.com/23051-better-performance-5-dau-la-giai-phap-toi-uu-chien-luoc-game-marketing-tren-nen-tang-video-ngan.  
   → Học: quay màn hình dọc 9:16, cắt nhiều hook khác nhau cho cùng 1 cảnh gameplay.

3. **Màu sáng + mặt người / phản ứng thật giữ mắt trong 3 giây đầu**  
   Best practice TikTok ads casual games: bright colours + human face tăng khả năng dừng kéo (https://www.wearebooster.com/blog/https-wearebooster-com-tiktok-best-practices-for-casual-games-ad-creatives). Số «X% giữ người xem VN» cho đúng game học ngôn ngữ: **chưa kiểm chứng**.  
   → Học: 1–2 giây đầu cần flash màu biển Hạ Long hoặc mặt phản ứng + chữ lớn; tránh logo/intro.

---

## 3) Màu sắc & phong cách 3D đang hút view

| Hướng | Đặc điểm | Nguồn / ghi chú |
|-------|----------|-----------------|
| **Cel-shaded / anime 3D** | Bóng cứng 1–3 bậc, viền rõ, ít gradient bẩn; silhouette đọc được trên mobile | Phong cách phổ biến ở Genshin-class; mô tả kỹ thuật cel-shade: https://gameartstyle.loopyhop.com/styles/anime-cel-3d/ ; Creative Bloq nhắc Genshin như chuẩn anime cel-shade: http://www.creativeharmony.org/crafting-the-environment-design-of-hyper-light-breaker.html |
| **Palette bão hòa, tương phản cao** | Xanh biển/cyan làm base, accent cam–đỏ ấm, highlight gần trắng | Palette tham chiếu anime cel: base #428DDA, shadow #0B5DA5 / #003877, accent #FF7B55, highlight #EAEDF1 — https://markermuse.app/palettes/anime-cel-r3 |
| **Màu «Hạ Long–Cẩm Phả» (brand)** | Biển ngọc–xanh đá vôi, trời sáng, đèn vàng ấm buổi tối | **GIẢ ĐỊNH / chưa kiểm chứng A/B** — khớp địa danh sản phẩm; dùng để khác Genshin (núi–cỏ) và Overmortal (tím–vàng tiên khí). |
| **Bright colours trên TikTok** | Màu sáng + cảnh động giữ scroll | https://www.wearebooster.com/blog/https-wearebooster-com-tiktok-best-practices-for-casual-games-ad-creatives |

**Tránh (tiếp thị):** xám–nâu tối, UI chữ nhỏ, góc nhìn isometric phẳng nhìn như ảnh 2D (đúng điều Bảo chê).

---

## 4) Ba–năm kiểu hook 3 giây đầu (hiệu quả)

Nguồn khung chung: short-form mobile ads phải hook 1–2s, gameplay trong frame đầu (https://monalica.com/blog/short-form-video-ads/); fail/challenge/satisfying (https://clicksflyer.com/blog/posts/hypercasual-game-marketing.html); khảo sát 30 ad TikTok game (https://www.sanlo.io/resources/i-studied-30-mobile-game-ads-on-tiktok-this-is-what-i-learned).

| # | Kiểu hook | 2 giây mở đầu gợi ý (chữ trên màn) | Ví dụ tham chiếu |
|---|-----------|-------------------------------------|------------------|
| A | **Fail / suýt thua** | Boss còn 1 máu → nhân vật gục → chữ «Sai 1 chữ = thua» | Fail compilations phổ biến trong creative hypercasual — https://clicksflyer.com/blog/posts/hypercasual-game-marketing.html |
| B | **Thách thức / câu hỏi** | «Đọc đúng 你好 (nǐ hǎo, xin chào) trong 3 giây?» | Challenge format — cùng nguồn ClicksFlyer; Monalica «Can you beat this level?» |
| C | **Biến hình / mạnh lên** | Trả lời đúng → aura sáng → đánh 1 đòn boss | Transformation hook — https://monalica.com/blog/short-form-video-ads/ |
| D | **Satisfying loop** | Chạm xoay 360° nhân vật / combo chữ đúng liên tiếp | Satisfying loops — ClicksFlyer |
| E | **UGC mặt phản ứng** | Quay mặt người chơi (hoặc Bảo) + màn hình phụ: «Ủa đồ họa mới?» | Face + bright colour — Booster; UGC FTW — https://lancaric.me/creative-framework-in-the-post-idfa-world/ |

**Tỷ lệ giữ 3s cụ thể của @baokhuaa:** chưa kiểm chứng — đo Hook Rate sau khi đăng.

---

## 5) Gợi ý cảnh / phiên quay TikTok @baokhuaa (ngắn)

Khung chung: dọc **9:16**, **15–21s**, 2s đầu = 1 hook ở mục 4; không logo mở đầu; CTA cuối: link game / Zalo (chưa đăng đến khi v6 + Bảo duyệt).

1. **Xoay 360° nhân vật** (~12s) — hook D; chữ «Chạm xoay được rồi».  
2. **Đúng 1 chữ → đánh boss** (~15s) — hook C; chữ + pinyin lớn.  
3. **Sai 1 chữ → thua** (~12s) — hook A; đối chiếu với clip 2.  
4. **Chạy bản đồ ven biển Hạ Long–Cẩm Phả** (~15s) — hook B «Đoán đây là đâu?»; màu biển làm điểm nhận diện.  
5. **Chuỗi 3 câu đúng liên tiếp** (~18s) — hook D satisfying; hiện thanh 修士 (xiūshì, tu sĩ) lên cấp.  
6. **UGC: mặt + màn hình** (~15s) — hook E; caption «Học Trung mà như đánh boss».  
7. **So sánh trước/sau đồ họa** (~10s) — hook C biến thể; chỉ đăng khi v6 sẵn (không chê công khai bản cũ).  
8. **Boss cuối màn + CTA Zalo** (~20s) — hook B; «Muốn stage 2? Vào Zalo» (không viết «miễn phí»).

**Caption gợi ý chung:** ngắn ≤80 ký tự; luôn kèm 1 từ Hán + pinyin + nghĩa; hashtag gợi ý: `#Baokhua #TuTien #HocTiengTrung #HaLong` (hiệu quả hashtag: chưa kiểm chứng).

---

## Việc Tiếp thị bàn cho Media / TGĐ

- Media ghép moodboard vào `/workspace/game/3d/moodboard_3d_va_video.md` (Tiếp thị **không** sửa file đó).  
- Ưu tiên visual: cel-shade + palette biển Hạ Long + payoff «đúng → mạnh».  
- Khi có bản dựng 3D chơi được: Tiếp thị cắt 8 hook trên, A/B 2 hook/ngày trên @baokhuaa (chưa đăng đến khi Bảo duyệt + v6).

> Ghi chú Media: Tiếp thị đề xuất cel-shade anime, Media đề xuất low-poly. GIẢ ĐỊNH chốt: low-poly + shader toon (cel) — nhẹ cho mobile, vẫn ra màu anime.


=== BÀN GIAO ===
Gửi: Tổng giám đốc
Nội dung: File chung 3D (moodboard, 8 session gameplay + hook 3s, CC0 glTF, PHẦN TIẾP THỊ đã ghép)
Hạn: 11:00 30/10

=== CHỦ DUYỆT ===
Không
