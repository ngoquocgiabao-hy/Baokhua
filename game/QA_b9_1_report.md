# QA Report — Proto3D B9.1

*30/10/2026 ~16:09 Asia/Saigon · **Không sửa code Dev · không deploy***  
*File: `/workspace/game/proto3d_b9_1.html` (MD5 `c0cf3658f931ac30d24a67aedadd111b`) + `/workspace/game/b9_1/` · zip `/workspace/b9_1_test.zip`*  
*Playwright Chromium+SwiftShader · 360×640 & 320×568 · Slow 3G · CPU 4× · `?fps=1`*  
*Shots: `/workspace/game/qa_shots/b9_1/` · Raw: `/tmp/qa-pw/qa_b9_1.json`*

## Verdict: **FAIL**

Đạt timeline Tu vi 8–10s, FPS ngưỡng, Slow3G, console; **trượt** vì **chồng nút UI** (答题↔ULT và panel câu hỏi đè combat) trên 360 và 320.

| Tiêu chí | Kết quả | Số liệu |
|----------|---------|---------|
| 你好 ~3s | **PASS** | từ ready **2972ms** · zh=你好 · py=nǐ hǎo |
| Tu vi +1 trong 8–10s | **PASS** | **8,30s** since playable (Dev 8,28s) · boss giữ ≥1 HP tới 8s |
| FPS MID 60s CPU4× | **PASS** | avg **46,0** · p5 **29,9** ≈ claim 45,6/29,9 |
| FPS LOW 60s CPU4× | **PASS*** | avg **56,7** · p5 **29,9** (≥24) · *claim ~58/44 — p5 QA thấp hơn (SwiftShader)* |
| Slow 3G playable ≤8s | **PASS** | **6,36s** · ttp ~5,4s · transfer 0,95MB |
| Console / external / ≤3MB | **PASS** | 0 err · 0 external · disk **1,41MB** |
| 50 rapid tap Chiêu | **PASS** | fps>0 · `#err` rỗng |
| Offline không trắng | **PASS** | canvas còn |
| Layout 360/320 không chồng | **FAIL** | xem bug #1–#2 |

\*LOW p5 claim 44 không tái hiện trên harness; vẫn đạt spec p5≥24.

---

## Bug list

1. **答题 chồng ULT (360 & 320)**  
   - **Bug:** `#talkBtn` và `#ultBtn` giao nhau vài px → dễ bấm nhầm.  
   - **Repro:** mở `proto3d_b9_1.html` viewport 360×640 (hoặc 320×568); đo `getBoundingClientRect`.  
     - 360: talk top**414**/bottom**462** vs ult top**458**/bottom**522** (chồng ~4px, cùng cột phải).  
     - 320: talk bottom**390** vs ult top**386**. Screenshot: `qa_shots/b9_1/360_pre.png`, `320_pre.png`.  
   - **Mức:** **khó chịu**  
   - **Yêu cầu Dev:** tăng khoảng cách dọc (đẩy 答题 lên hoặc ULT/Chiêu xuống) ≥8–12px clear gap; giữ Chiêu 80px / ULT ≥64 / 答题 ≥44.

2. **Panel câu hỏi đè Chiêu / ULT / 答题 khi 你好 hiện**  
   - **Bug:** `#qPanel` (⅓ dưới) overlap cả ba nút combat → đáp án / skill cùng vùng chạm.  
   - **Repro:** đợi câu ~3s trên 360 hoặc 320; panel top~347–394 vs skill/ult/talk vẫn `vis`. `panelVsCombat: skillBtn,ultBtn,talkBtn`. Shots: `*_quiz.png`.  
   - **Mức:** **khó chịu** (lệch tay / bấm nhầm Chiêu khi chọn nghĩa).  
   - **Yêu cầu Dev:** khi `#qPanel.show`: ẩn hoặc `pointer-events:none` combat pad+talk **hoặc** nâng panel / hạ pad để không giao; ưu tiên vùng đáp án sạch trên SE/320.

3. **(nhỏ / ghi chú)** FPS LOW p5 QA **29,9** vs Dev claim **~44**  
   - **Repro:** `?fps=1`, khóa LOW, 60s, CPU 4×, SwiftShader.  
   - **Mức:** **nhỏ** (vẫn ≥24; avg khớp ~57≈58).  
   - **Yêu cầu Dev:** gửi số máy thật kèm build; không chặn ship nếu checklist điện thoại xác nhận p5≥24.

---

## Ghi chú đạt (B9.1 so B9)

- `dealBossDamage`: không cho boss về 0 trước **8,0s** intro → Tu vi **8,30s** (đúng cửa sổ marketing).  
- Default chất lượng **LOW**, step-up khi avg5>55.  
- Boss tutorial **340** HP · dmg đúng câu không one-shot sớm.

*Hết báo cáo B9.1 — không chỉnh code Dev.*
