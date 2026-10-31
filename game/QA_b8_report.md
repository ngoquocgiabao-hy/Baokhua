# QA Report — Proto3D B8 (gzip three + early ready)

*Thiết kế & Kiểm thử · 30/10/2026 ~11:33 Asia/Saigon · **Không sửa code Dev***  
*File: `/workspace/game/proto3d_b8.html` · MD5 `91497949ab7f31134371154cd19e6940` (**khớp**) · Vendor `/workspace/game/b8/`*  
*Playwright headless Chromium + SwiftShader · 360×640 & 320×568 · CPU throttle 4× · Slow 3G (500kbps / RTT 400ms)*  
*Shots: `/workspace/game/qa_shots/b8/` · Raw: `/tmp/qa-pw/qa_b8.json`*

---

## Verdict tổng

**CHƯA ĐẠT ship** — còn **chặn FPS**: dưới harness QA (SwiftShader + CPU 4×) **không cấp nào** đạt **p5≥24**; auto mặc định MID rồi xuống LOW nhưng vẫn **avg≈20–22 · p5≈20**.  

Đã **sửa B7 #1** (Slow 3G chơi được **~6,8s ≤8s**) và **B7 #3 / B1 #2** (có giọng zh → ẩn `#qPy` trước khi trả lời; không giọng → hiện pinyin). Regression sạch (0 external, ≤3MB, 0 console error, save schema, đáp án Hán, layout 320, touch, offline, lazy GLB).

**Ghi chú Dev claim:** HQ p5 20 (khớp QA) · MID p5 28,6 / LOW p5 40,3 (**không tái hiện được** trên SwiftShader). Cần **checklist điện thoại** xác nhận MID/LOW trước khi hạ mức FPS xuống “khó chịu”.

---

## So với bug B7

| Bug B7 | B8 |
|--------|-----|
| #1 Slow3G 24–33s ≫ 8s | **ĐÃ SỬA** — playable **6,76s** · `__PROTO3D.ttp` **5,38s** · gunzip three trên Slow3G ~3,1s |
| #2 FPS MID/HQ/LOW p5≈20; auto drop | **CÒN (đo)** — HQ/MID p5**20** · LOW avg**31** nhưng p5 vẫn**20**. Auto: mobile **MID→LOW**, **không kẹt HQ** khi p5&lt;24 ✅ hành vi |
| #3 Audio vẫn lộ pinyin khi có TTS | **ĐÃ SỬA** — mock `getVoices()` zh-CN: `#qZh=🔊`, `#qPy display:none`, nút「Nghe lại」; không giọng → fallback pinyin |

---

## Tiêu chí (số)

| # | Tiêu chí | Kết quả | Số liệu |
|---|----------|---------|---------|
| MD5 | Khớp file Dev | **ĐẠT** | `91497949ab7f31134371154cd19e6940` |
| Net | 0 request ngoài localhost | **ĐẠT** | Block non-localhost → vẫn `ready` · playable **1,21s** · external **0** · ttp nội bộ **612ms** |
| Bytes | Tổng ≤3MB | **ĐẠT** | Disk HTML+b8 **1,407 MB** · transfer điển hình (dùng `.gz`) **~0,91 MB** · Slow3G đo **1,436 MB** |
| Slow3G | Chơi được ≤8s | **ĐẠT** | ready **6,40s** · playable (ready+fps) **6,76s** · `ttp` **5382ms** · GLB lazy sau (~15,7s enhanced+GLB, không chặn playable) |
| Console | 0 lỗi; waternormals OK | **ĐẠT** | Console error **0** · `b8/textures/waternormals.jpg` **200** / 2400B |
| FPS HQ | avg≥30, p5≥24 @360×640 CPU4× 60s | **CHƯA** | avg **20** · p5 **20** (locked) — khớp Dev HQ p5 20 |
| FPS MID | cùng điều kiện | **CHƯA** *(harness)* | avg **20** · p5 **20** — **lệch** Dev claim MID p5 28,6 |
| FPS LOW | cùng điều kiện | **CHƯA** *(p5)* | avg **30,9** · p5 **20** — avg đạt nhưng p5&lt;24; Dev claim LOW p5 40,3 |
| Auto-Q | Default/auto avg≥30 p5≥24; không kẹt HQ khi p5&lt;24 | **Hành vi ĐẠT / số CHƯA** | Boot mobile **q=1 (MID)** → ~14s **q=0 (LOW)** · end avg**~22** p5**20**. Ép HQ rồi unlock: **2→0**, không ở lại HQ khi p5&lt;24 |
| Save | localStorage schema sống sau reload | **ĐẠT** | key `halong_proto_b8` · `schema:1` · mana/hero **77/88** còn sau reload · quality khôi phục |
| TTS ẩn pinyin | Có giọng zh → `#qPy` ẩn trước trả lời | **ĐẠT** | Init mock zh-CN: zh=`🔊` · pyDisp=`none` · `Nghe lại` · đáp án Hán · nghĩa chỉ trong `#qReveal` sau chọn (~17ms) |
| TTS fallback | Không giọng → hiện pinyin | **ĐẠT** | hint *「không có giọng zh — hiện pinyin」* · `#qPy` block |
| Audio Hán | Đáp án audio = chữ Hán | **ĐẠT** | 20/20 audio · 0 lệch · sample `您好，欢迎光临。` |
| Layout 320 | Nút ≥44px, không che | **ĐẠT** | Sau `#qPanel.show`: đáp án **143×48** · talk 64×44 · ult 58×58 · qual 54×44 · overlap **false** *(đo lúc scale(.82) mặc định trước `.show` sẽ ảo 39px — không tính)* |
| Touch | Dual + pinch + 50 tap | **ĐẠT** | dual OK · pinch OK · 50 tap · 0 pageerror |
| Offline | Giữa chừng không trắng | **ĐẠT** | canvas còn · bg `rgb(10,22,40)` · fps&gt;0 · không white screen |
| Lazy GLB | Swap không đơ / không lỗi | **ĐẠT** | `glbReady` true · fps tiếp tục · `#err` rỗng · log `[B8] GLB loaded…` / `enhanced+GLB` |

**Ghi chú FPS:** Headless + SwiftShader + CPU 4× thường thấp hơn máy thật. B7 Dev **tự báo** MID p5 20 → chặn rõ. B8 Dev báo MID/LOW cao hơn nhưng **QA không đo được** → vẫn **CHƯA ĐẠT** theo chữ spec trên harness; **bắt buộc** xác nhận điện thoại (checklist § dưới).

**Ghi chú TTS hook:** `setZhVoiceOverride()` bị `speakZh()` → `refreshZhVoice()` ghi đè từ `getVoices()` — hook QA hỏng, nhưng đường production (có voice trong `getVoices`) **đúng**. Không tính là bug UX; ghi Dev nếu muốn giữ API test.

---

## Bug list (gửi Dev)

1. **FPS p5 vẫn ≈20 trên harness; chưa chứng minh MID/LOW đạt p5≥24**  
   - **Tái hiện:** 360×640, CPU 4×, khóa HQ/MID/LOW mỗi 60s; hoặc boot auto (mobile default MID).  
   - **Số QA:** HQ avg20/p5**20** · MID avg20/p5**20** · LOW avg**30,9**/p5**20**. Auto boot: MID→LOW, end avg≈22/p5**20**.  
   - **Dev claim:** HQ p5 20 · MID 28,6 · LOW 40,3 — chỉ HQ khớp.  
   - **Mức:** **chặn** theo chữ spec (default/auto avg≥30 và p5≥24). Nếu Tiêu Hà + checklist máy thật xác nhận MID/LOW đạt → có thể hạ **khó chịu** + ship có điều kiện.  
   - **Yêu cầu Dev:** (a) gửi clip/số FPS máy tầm trung (MID khóa + auto); (b) nếu máy thật MID p5&lt;24 thì tối ưu thêm (pixelRatio, tắt bloom sớm hơn trên MID, giảm karst/water reflection); (c) đảm bảo auto **không bao giờ** ở lại HQ khi p5&lt;24 đã OK — giữ nguyên.

2. *(nhỏ / QA-only)* **`__PROTO3D.setZhVoiceOverride` không bền**  
   - **Tái hiện:** gọi override rồi `forceAudioQuestion` → `speakZh` gọi `refreshZhVoice()` reset `zhVoice` từ `getVoices()` (thường rỗng headless).  
   - **Mức:** **nhỏ** (không ảnh hưởng user thật có voice list).  
   - **Yêu cầu Dev (tuỳ chọn):** nếu giữ API test, bỏ qua `refreshZhVoice` khi đã override, hoặc flag `zhVoiceForced`.

---

## Ghi chú kỹ thuật B8 (đã xác nhận)

- Bootstrap: fetch `b8/three.module.min.js.gz` → `DecompressionStream` → blob importmap; fallback plain `.js`.  
- `ready` + ẩn loader **trước** addons/water/GLB (playable ASAP); GLB lazy — đúng hướng sửa B7 #1.  
- Mobile `applyQuality(1)` (MID); `lowFpsMs: 800`; drop HQ nếu avg&lt;34\|p5&lt;26; MID nếu avg&lt;28\|p5&lt;24.  
- Audio: `pyEl.style.display = (isAudio ? 'none' : '')` rồi TTS OK giữ ẩn / fail hiện pinyin.  
- `SAVE_KEY = 'halong_proto_b8'` · `SAVE_SCHEMA = 1`.  
- GIẢ ĐỊNH “chơi được” = `__PROTO3D.ready` và fps&gt;0 (cùng B1/B7).

---

## Checklist 10 bước — điện thoại thật (Bảo / Tiêu Hà)

1. Mở `proto3d_b8.html` (file local hoặc HTTP cùng máy) **bật chế độ máy bay / offline sau khi đã cache một lần** — xác nhận không màn hình trắng, scene còn.  
2. Lần cold start trên **mạng Slow 3G / 3G thật** (Chrome DevTools hoặc nhà mạng yếu): bấm đồng hồ đến lúc **điều khiển được** (joystick/đánh). Mục tiêu **≤8s** (Dev ~6s).  
3. Quan sát HUD chất lượng lúc vào: phải là **MID** (hoặc LOW), **không** kẹt HQ nếu máy yếu.  
4. Chơi ~60s bình thường; đọc `FPS … avg … p5 …` trên HUD (nếu hiện). Ghi avg/p5. Cần **avg≥30 và p5≥24** ở mức đang dùng.  
5. Bấm nút Qual lần lượt HQ → MID → LOW, mỗi mức ~30–60s; ghi p5. So với Dev: MID≈28+, LOW≈40+.  
6. Mở câu **nghe** (答题) trên máy **có giọng zh-CN**: chỉ thấy 🔊 +「Nghe lại」, **không** thấy pinyin/chữ đáp án gợi ý trước khi chọn.  
7. Tắt / không có giọng zh (hoặc trình duyệt chặn TTS): câu nghe phải **hiện pinyin** + hint fallback.  
8. Trả lời 1 câu audio: đáp án là **chữ Hán**; sau khi chọn mới thấy nghĩa/giải thích.  
9. Xoay máy / thử **320-ish** (iPhone SE): bốn nút đáp án bấm được, không chồng; dual stick + camera + 50 tap skill không đơ.  
10. Chờ boss/hero GLB thay procedural (~vài–chục giây sau playable): không freeze, không `#err`, nhân vật/địch đổi mesh mượt.

---

## Artifacts

| Loại | Đường dẫn |
|------|-----------|
| Báo cáo | `/workspace/game/QA_b8_report.md` |
| Raw JSON | `/tmp/qa-pw/qa_b8.json` |
| Screenshots | `/workspace/game/qa_shots/b8/` (`slow3g`, `fps_*`, `audio_*`, `320x568_*`, `offline`, `lazy_glb`, `touch_rapid`, …) |

*Hết báo cáo B8 — không chỉnh sửa code Dev.*
