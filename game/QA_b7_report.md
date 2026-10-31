# QA Report — Proto3D B7 (offline vendor)

*Thiết kế & Kiểm thử · 30/10/2026 ~11:05 Asia/Saigon · **Không sửa code Dev***  
*File: `/workspace/game/proto3d_b7.html` · MD5 `001bd77f6fd10056abc0c08eb7d442ae` (**khớp**) · Vendor `/workspace/game/b7/`*  
*Playwright headless Chromium + SwiftShader · 360×640 & 320×568 · CPU throttle 4× · Slow 3G (500kbps/400ms)*  
*Shots: `/workspace/game/qa_shots/b7/` · Raw: `/tmp/qa-pw/qa_b7.json`*

---

## Verdict tổng

**CHƯA ĐẠT ship** — chặn bởi **Slow 3G chơi được 24–33s ≫ 8s** và **FPS p5≈20 (MID)** dưới ngưỡng spec (≥24).  
Đã **sửa B1 #1** (waternormals local, console 0) và **B1 #3** (đáp án audio = chữ Hán). **B1 #2 còn** (audio vẫn hiện pinyin trước khi chọn kể cả khi có TTS theo mã nguồn).

---

## Tiêu chí (số)

| # | Tiêu chí | Kết quả | Số liệu |
|---|----------|---------|---------|
| MD5 | Khớp file Dev | **ĐẠT** | `001bd77f6fd10056abc0c08eb7d442ae` |
| Net | 0 request ngoài localhost; vẫn load | **ĐẠT** | Block toàn bộ non-localhost → vẫn `ready` · playable **2,23s** · externalAttempts **0** |
| Bytes | Tổng ≤3MB | **ĐẠT** | Disk HTML+b7 **1,845 MB** (vendor 1,816 MB) · Slow3G transfer **1,836 MB** · Dev claim 1,732 MB ≈ khớp |
| Slow3G | Chơi được ≤8s | **CHƯA ĐẠT** | `__PROTO3D.ready`+fps: **24,85s** (lần 1) / milestones: dom **17s** · ready/glb **~33s**. Timeout 8s trong `init()` chỉ chạy **sau** khi tải xong module — không cứu cold start Slow3G. |
| Console | 0 lỗi; waternormals OK | **ĐẠT** | Console error **0** · `b7/textures/waternormals.jpg` **200** / 2400B → **B1 bug #1 đã sửa** |
| FPS HQ | avg≥30, p5≥24 @360×640 CPU4× 60s | **CHƯA** | avg **20** · p5 **20** (locked HQ) |
| FPS MID | cùng điều kiện | **CHƯA** | avg **21,8** · p5 **20** — **khớp Dev báo MID p5 20** |
| FPS LOW | cùng điều kiện | **CHƯA** | avg **25,8** · p5 **20,2** (gần avg nhưng p5 vẫn <24) |
| Auto-Q | HQ→MID→LOW khi FPS thấp | **ĐẠT** *(hành vi)* | 20s CPU4×: q **2→1→0**; log `[B7] quality ↓` |
| Save | localStorage có schema, sống sau reload | **ĐẠT** | key `halong_proto_b7` · `schema:1` · mana/hero **77/88** còn sau reload · quality khôi phục |
| TTS | zh-CN; không giọng → hiện pinyin | **ĐẠT** *(fallback)* | `speechSynthesis` absent: hint *「không có giọng zh — hiện pinyin」* · `#qPy` block · đáp án Hán |
| Audio #2 | Không pinyin/nghĩa trước trả lời khi có TTS | **CHƯA ĐẠT** | Mã: `pyEl.style.display=''` **luôn** trước nhánh audio; khi `speakZh===true` **không** ẩn `#qPy`. Nghĩa (`nghia`) chỉ vào `#qReveal` sau chọn — phần nghĩa OK. |
| Audio #3 | Đáp án audio = chữ Hán | **ĐẠT** | JSON + embedded: **0/20** audio lệch · sample `请给我一杯水。` / `您好，欢迎光临。` → **B1 bug #3 đã sửa** |
| Layout 320 | Nút ≥44px, không che | **ĐẠT** | talk 64×44 · ult 58×58 · qual 54×44 · đáp án 143×48 · overlap **false** |
| Touch | Dual joystick+camera · pinch · 50 tap | **ĐẠT** | dual OK · pinch OK · 50 tap · 0 pageerror |
| Offline | Giữa chừng không trắng | **ĐẠT** | canvas còn · bg `rgb(10,22,40)` · fps>0 · không white screen |

**Ghi chú FPS:** Headless + SwiftShader + CPU 4× thấp hơn máy thật; nhưng **Dev tự báo MID p5 20** đã dưới spec p5≥24 → tiêu chí FPS **CHƯA ĐẠT** không chỉ do môi trường QA.

---

## So với bug B1

| Bug B1 | B7 |
|--------|-----|
| #1 waternormals 404 CDN | **ĐÃ SỬA** — local `b7/textures/waternormals.jpg`, console sạch |
| #2 audio hiện pinyin trước chọn | **CÒN** — luôn `display:''`; thiếu nhánh ẩn khi TTS OK |
| #3 audio đáp án nghĩa VI | **ĐÃ SỬA** — 20/20 đáp án chữ Hán |

---

## Bug list (gửi Dev)

1. **Slow 3G time-to-playable 24–33s > 8s**  
   - **Tái hiện:** CDP Slow 3G (500kbps, RTT 400ms) → mở `proto3d_b7.html` → đo đến `__PROTO3D.ready` (và/hoặc ẩn loader).  
   - **Số:** ~**24,9s** (QA suite) / milestones ready+glb ~**33s**. Payload ~1,84MB lý thuyết ≥30s ở 62,5KB/s.  
   - **Mức:** **chặn** (trượt tiêu chí nghiệm thu cứng).  
   - **Yêu cầu Dev:** (a) đặt `ready`/ẩn loader ngay khi procedural scene + water sẵn (không chờ GLB); GLB tải nền; (b) giảm/nén GLB (meshopt/Draco) hoặc lazy boss/boat; (c) timeout 8s phải tính từ navigation, không chỉ từ sau `init()`. Xác nhận lại Slow3G ≤8s trước khi gửi QA.

2. **FPS p5 ≈ 20 ở MID (và HQ/LOW) — dưới p5≥24**  
   - **Tái hiện:** 360×640, CPU 4×, khóa từng HQ/MID/LOW 60s; hoặc để auto-drop. Dev đã tự báo MID p5 20.  
   - **Số QA (locked):** HQ avg20/p5**20** · MID avg21,8/p5**20** · LOW avg25,8/p5**20,2**. Auto: HQ→LOW trong ~11s.  
   - **Mức:** **chặn** theo chữ spec; nếu Tiêu Hà chấp nhận “LOW đạt avg≥30 trên máy thật” thì hạ còn **khó chịu** + bắt buộc checklist điện thoại.  
   - **Yêu cầu Dev:** tối ưu MID (tắt bloom/FXAA sớm hơn, giảm pixelRatio/karst, rút `lowFpsThresh`); mục tiêu MID p5≥24 trên máy tầm trung. Gửi số FPS máy thật kèm B7.1.

3. **Audio vẫn hiện pinyin trước khi trả lời khi có TTS (B1 #2 còn)**  
   - **Tái hiện:** `openQuestion` với `type==="audio"`: `#qPy` luôn gán pinyin + `display=''` (dòng ~1782–1783); nhánh `speakZh===true` không `display='none'`.  
   - **Mức:** **khó chịu** (lộ gợi ý nghe).  
   - **Yêu cầu Dev:** nếu TTS OK → `#qZh='🔊'`, `#qPy` ẩn, chỉ nút “Nghe lại”; nếu không giọng → giữ fallback pinyin như hiện tại. Nghĩa/`giai_thich` chỉ trong `#qReveal`.

---

## Ghi chú kỹ thuật

- Import map `three` → `./b7/three.module.min.js` · addons local — **không CDN runtime** (chữ “jsDelivr” chỉ còn trong comment ASSET).  
- `SAVE_SCHEMA = 1` · key `halong_proto_b7`.  
- GIẢ ĐỊNH: “chơi được” = `__PROTO3D.ready` và fps>0 (cùng định nghĩa B1). Loader ẩn sau GLB (+min 1,4s) làm cảm giác chờ lâu hơn trên Slow3G.

---

## Checklist 10 bước · 5 phút (điện thoại)

1. Mở `proto3d_b7.html` **chỉ Wi‑Fi lần đầu**, bật chế độ tiết kiệm dữ liệu / throttle nếu có — đếm giây đến khi vào cảnh (mục tiêu ≤8s).  
2. Tắt mạng hoàn toàn, reload: phải **vẫn** vào được (vendor local).  
3. Nhìn FPS 10s đứng yên — avg≥30? p5 có ổn không; xem nút HQ/MID/LOW tự hạ.  
4. Joystick trái + vuốt phải **cùng lúc** — không kẹt.  
5. Pinch zoom nửa phải.  
6. Chạm Talk/ATK 50 lần nhanh — không đơ/trắng.  
7. Mở câu **audio**: có TTS thì **không** thấy pinyin trước khi chọn; không TTS thì thấy pinyin fallback.  
8. Đáp án audio là **chữ Hán**; sau khi chọn mới thấy nghĩa VI.  
9. Chơi 30s → reload trang: máu/mana/quality còn (schema save).  
10. Bật máy bay giữa trận — xoay camera thêm: **không** màn hình trắng.

---

## Bàn giao

**Gửi:** Dev IT (ưu tiên bug #1 Slow3G + #2 FPS; #3 = B1#2 audio pinyin) · Tổng giám đốc (FYI: B7 chưa đạt ship)  
**Nội dung:** `/workspace/game/QA_b7_report.md` · shots `/workspace/game/qa_shots/b7/`  
**Hạn:** bản B7.1 sửa Slow3G+FPS gửi QA ngay khi xong  

=== CHỦ DUYỆT ===  
Không
