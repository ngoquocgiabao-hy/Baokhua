# QA Report — Proto3D B9.2

*30/10/2026 ~16:15 Asia/Saigon · **Không sửa code Dev · không deploy***  
*File: `/workspace/game/proto3d_b9_2.html` (MD5 `28d6e4b75373edf9e226283377d1ffe9`) + `/workspace/game/b9_2/` · zip `/workspace/b9_2_test.zip` · tổng **1,41MB***  
*Playwright Chromium+SwiftShader · 320×568 / 360×640 / 412×915 · Slow 3G · CPU 4× · `?fps=1` · default LOW*  
*Shots: `/workspace/game/qa_shots/b9_2/` · Raw: `/tmp/qa-pw/qa_b9_2.json`*

## Verdict: **PASS**

Hai bug layout B9.1 đã hết trên 320/360/412; regression timeline / FPS / Slow3G / console / rapid tap đều đạt. **0 bug.**

| Tiêu chí | Kết quả | Số liệu |
|----------|---------|---------|
| 答题↔ULT gap ≥8px (320/360/412) | **PASS** | gap **14px** cả ba VP |
| Panel ẩn Chiêu/ULT/答题 khi mở; restore sau | **PASS** | `q-open` → combatHidden · covered=[] · after restore vis |
| 你好 ~3s | **PASS** | **3027ms** từ ready · zh=你好 |
| Tu vi +1 trong 8–10s | **PASS** | **8,49s** since playable |
| FPS LOW 60s CPU4× p5≥24 | **PASS** | avg **54,3** · p5 **29,9** |
| Slow 3G playable | **PASS** | **6,46s** · ttp ~5,5s |
| Console / external / ≤3MB | **PASS** | 0 err · 0 external · **1,41MB** |
| 50 rapid tap | **PASS** | ok trên cả 3 VP |

## Bug list

*(trống — không có bug chặn / khó chịu / nhỏ)*

## Ghi chú harness

- Layout: `#talkBtn` bottom≈196px+safe → gap 14px so với ULT; `body.q-open` ẩn `#combatPad`+#talkBtn (visibility/opacity/pointer-events); `hideQuestionCard` bỏ class → nút hiện lại.
- Shots: `qa_shots/b9_2/{320,360,412}_{pre,quiz,after}.png`, `tuvi.png`, `slow3g.png`, `fps_LOW.png`.
