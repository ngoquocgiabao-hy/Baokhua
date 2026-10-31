# QA Report — Proto3D B1 + game_v6_1 (v7 §7)

*Thiết kế & Kiểm thử · 30/10/2026 ~07:38 Asia/Saigon · **Không sửa code Dev***  
*File: `/workspace/game/proto3d.html` · MD5 `4d0ee488e55524ad5db4a97dfb648593` (**khớp**) · `game_v6_1.html` MD5 `8dc208f8c3f6fbf83330c3b7e72815f5`*  
*Playwright headless Chromium + SwiftShader · viewport **360×640** & **320×568** · CPU throttle 4× · Slow 3G*  
*Shots: `/workspace/game/qa_shots/v7_b1/` · Raw: `/tmp/qa-pw/qa_v7_b1.json`*  
*Phạm vi B1 (theo spec §8): cảnh + joystick/camera + đo FPS. §7.7 Monte Carlo & §7.10 vòng combat đầy đủ = **N/A B1** (đợi B3).*

---

## Verdict tổng

**B1 ĐẠT có điều kiện** — cảnh/điều khiển/FPS/layout/Slow3G/CREDITS ổn. Còn **3 bug** (1 khó chịu + 2 nhỏ liên quan câu hỏi audio / 404 texture). Không chặn B2.

`game_v6_1.html`: **ĐẠT** ẩn nghĩa VI trước khi trả lời (`.vi-ans{display:none}` → `.opts.revealed .vi-ans{display:block}`).

---

## Tiêu chí §7 (số)

| # | Tiêu chí | B1 | Số liệu |
|---|----------|----|---------|
| MD5 | Khớp file Dev gửi | **ĐẠT** | `4d0ee488e55524ad5db4a97dfb648593` |
| 1 | 0 câu hiện nghĩa VI trước trả lời (JSON+DOM) | **ĐẠT** *(có ghi chú audio)* | Quét 30/30: `nghia`/`giai_thich` **không** nằm trong `#qZh`/`#qPy`. Đáp án text = 4 nghĩa VI (đúng luật). **Bug #2:** câu `audio` vẫn hiện pinyin trước khi chọn. |
| 2 | 100% pinyin có thanh; nghĩa ≤200ms sau chọn | **ĐẠT** | 30/30 pinyin có dấu thanh. Reveal thật qua `__PROTO3D.openQuestion`: **~0,6–87ms** ≪200ms. |
| 3 | ≥30 fps TB, p5≥24 / 60s @360×640 CPU 4× | **ĐẠT** *(ghi chú môi trường)* | Cửa sổ cuối: **avg 50,9 · p5 40**. Mean avg cả phiên **47,4**. Auto-quality hạ **HQ→LOW** (level 0). *Headless+SwiftShader+CPU4×*; Dev B1 báo 41,6/34,4 @720×1280 không throttle. minP5 tức thời lúc đầu/khi hạ chất lượng từng thấy **20** — không lấy làm fail vì cửa sổ ổn định ≥30/24. |
| 4 | Slow 3G chơi được ≤8s; tổng tải ≤3MB | **ĐẠT** | Playable (**`__PROTO3D.ready` + fps>0**) **7,04s**. Tổng đo **0,326 MB** (HTML+modules+JSON). **CDN jsDelivr** 13 URL three@0.170 — cần mạng lần đầu. |
| 5 | Joystick+camera 2 ngón; pinch; 50 tap nhanh | **ĐẠT** | CDP dual-touch trái+phải OK · pinch OK · 50 tap `#skillBtn` · **0** pageerror. |
| 6 | 320×568: nút ≥44px, không che | **ĐẠT** | Skill **64×64**. 4 nút đáp án **134×48**. Không overlap. Shots `320x568_*.png`. |
| 7 | Monte Carlo 72–85% @50% | **N/A B1** | Chưa có combat loop balance đủ — đợi B3. |
| 8 | 0 lỗi console; offline giữa chừng không trắng | **CHƯA ĐẠT** *(nhẹ)* | **1 URL 404 lặp:** `waternormals.jpg` trên jsDelivr (xem bug #1). Offline: canvas còn, bg `#0a1628`, **không trắng** (fps~20). |
| 9 | CREDITS.md 100% nguồn CC0/MIT + link | **ĐẠT** | three.js MIT + Quaternius/Kenney/Poly Haven CC0 (B2 planned). B1 procedural ghi rõ. |
| 10 | Vào trận ≤30s | **N/A B1** | Proto sẵn sàng <8s Slow3G; chưa có vòng combat đầy đủ. |

### `game_v6_1.html` — ẩn nghĩa

| Check | Kết quả |
|-------|---------|
| CSS `.vi-ans` trước reveal | `display:none` |
| CSS `.opts.revealed .vi-ans` | `display:block` |
| Runtime Q1 | zh=`你好` · py=`nǐ hǎo` · `#qVi` text=`Xin chào` nhưng **display:none** |
| Shots | `v61_before_ans.png` / `v61_after_ans.png` |

---

## Câu hỏi nhúng (`cau_hoi_v7.json` + embedded)

| Check | Kết quả |
|-------|---------|
| Số câu | **30** (text 20 / audio 10) |
| `type` text\|audio | **30/30** |
| `distractor_group` | **30/30** |
| Pinyin dấu thanh | **30/30** |
| Nghĩa trong `#qZh`/`#qPy` trước chọn | **0/30** lộ |
| Audio: đáp án là 4 chữ Hán (spec §1) | **1/10** đúng (`v6-nn-06`); **9/10** vẫn nghĩa VI → bug #3 |

---

## Bug list (gửi Dev)

1. **waternormals.jpg 404 (CDN)**  
   - **Tái hiện:** mở `proto3d.html` (có mạng) → console error `404`  
     `https://cdn.jsdelivr.net/npm/three@0.170.0/examples/textures/waternormals.jpg`  
   - **Mức:** **khó chịu** (nước vẫn chạy nhưng thiếu normal map; làm fail tiêu chí “0 lỗi console”).  
   - **Yêu cầu Dev:** đổi URL texture sang đường dẫn jsDelivr/unpkg **còn tồn tại**, hoặc nhúng/base64 file CC0 nhỏ, hoặc fallback shader không cần file; xác nhận console sạch trên cold load.

2. **Câu `type:"audio"` vẫn hiện pinyin trước khi chọn**  
   - **Tái hiện:** `__PROTO3D.openQuestion()` khi câu audio → `#qZh=🔊` nhưng `#qPy` vẫn = pinyin. Spec: *chỉ âm thanh*.  
   - **Mức:** **nhỏ** (B3 sẽ siết; lộ gợi ý).  
   - **Yêu cầu Dev:** với `type==="audio"`: để `#qPy` trống (hoặc nút “Nghe lại”); chỉ hiện pinyin + nghĩa trong `#qReveal` sau khi chọn.

3. **9/10 câu audio: `dap_an` là nghĩa tiếng Việt, không phải 4 chữ Hán**  
   - **Tái hiện:** đọc `cau_hoi_v7.json` id `v6-nn-01…05,07…10` (chỉ `v6-nn-06` đúng dạng Hán). Spec §1: *“4 chữ Hán khi hỏi bằng âm thanh”*.  
   - **Mức:** **nhỏ** (nội dung Biên tập; Dev normalize/UI).  
   - **Yêu cầu Dev + Biên Tập:** sửa JSON audio → 4 đáp án Hán cùng `distractor_group`; UI giữ luật hiện nghĩa VI chỉ sau khi chọn.

*(Không chặn B2: nhân vật procedural đúng kế hoạch B1.)*

---

## Ghi chú kỹ thuật

- Joystick trái / vuốt phải 360° / pinch 4–12m / chất lượng HQ·MID·LOW: có trong UI & CDP touch.  
- `#skillBtn` hiện chỉ `spawnSkillBurst()` — mở câu hỏi qua `__PROTO3D.openQuestion` / phím Q (chạm NPC→câu hỏi = B3).  
- Tổng tải đo thấp vì CDN; **máy thật lần đầu phụ thuộc jsDelivr**. Mất CDN giữa chừng: module đã cache thì vẫn quay; cold offline sẽ thiếu three — chấp nhận được với ghi chú “cần mạng lần đầu” (CREDITS/B1_REPORT).  
- GIẢ ĐỊNH: FPS máy tầm trung thật ≥ số headless SwiftShader đã đo; QA sẽ xác nhận lại trên điện thoại checklist dưới.

---

## Checklist 10 bước · 5 phút (điện thoại)

1. Mở `proto3d.html` qua Wi‑Fi (http.server hoặc file+CDN) — đếm giây đến khi thấy cảnh nước/núi + FPS.  
2. Xem góc FPS: avg có ≥30 khi đứng yên ~10s không.  
3. Ngón trái giữ joystick, ngón phải vuốt xoay — nhân vật/camera có chạy **đồng thời** không kẹt.  
4. Hai ngón pinch trên nửa phải — zoom xa/gần (khoảng 4–12m).  
5. Chạm nút ✨ Chiêu 20 lần nhanh — không đơ / không trắng màn.  
6. Bấm HQ→MID→LOW — cảnh vẫn thấy, FPS có cải thiện trên máy yếu.  
7. Bật chế độ máy bay **sau khi** đã vào cảnh — xoay thêm 5s: **không** màn hình trắng.  
8. (Khi có B3) mở 1 câu text: chỉ thấy Hán+pinyin, **không** thấy nghĩa; chọn xong mới thấy nghĩa.  
9. (Khi có B3) mở 1 câu audio: chỉ nghe TTS, **không** thấy pinyin/nghĩa trước khi chọn.  
10. Console remote (nếu có) / cảm quan nước: sóng có normal map; không lỗi đỏ texture.

---

## Bàn giao

**Gửi:** Dev IT (sửa bug #1 trước B2; #2–#3 cùng B3 + Biên Tập) · Tổng giám đốc (FYI B1 có điều kiện)  
**Nội dung:** Báo cáo `/workspace/game/QA_v7_B1_report.md` · shots `/workspace/game/qa_shots/v7_b1/`  
**Hạn:** Bug #1 (404 waternormals) trước khi gửi bản B2 cho QA.

=== CHỦ DUYỆT ===  
Không
