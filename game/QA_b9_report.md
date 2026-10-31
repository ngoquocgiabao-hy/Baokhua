# QA Report — Proto3D B9 (1 ngón Archero + 10s script)

*Thiết kế & Kiểm thử · 30/10/2026 ~14:49 Asia/Saigon · **Không sửa code Dev***  
*File: `/workspace/game/proto3d_b9.html` · MD5 `f0cb9139a64118822c2e4956092b562f` (**khớp**) · Vendor `/workspace/game/b9/` · Spec `b9_cai_tien.md` mục **1+2+3** + kịch bản 10s (**bỏ 4/5 → b10**)*  
*Playwright headless Chromium + SwiftShader · 360×640 & 320×568 · CPU 4× · Slow 3G 500kbps/400ms*  
*Shots: `/workspace/game/qa_shots/b9/` · Raw: `/tmp/qa-pw/qa_b9.json` · Children MD5 `B9_MD5s.txt`: **all OK***

---

## Tóm tắt (≤15 dòng)

1. **Verdict: ĐẠT** phạm vi B9 (điều khiển 1 ngón + đồ họa tối giản + nhân vật/10s script); waves/cards để b10.  
2. Joystick nổi 1 ngón tại điểm chạm (360/320), nhả tay ẩn stick + `autoAtkOn`; không `lookZone`/xoay/pinch; camera `updateCamera` cố định pitch 45°.  
3. UI combat chỉ **Chiêu 80×80** + **ULT 64×64** + **答题**; không sk1–3/atkBtn; tay động「kéo để chạy」3s, không màn hướng dẫn chữ.  
4. Timeline naive: combat ngay (`combatArmed`); câu **你好 / nǐ hǎo** ~**3,4s**; panel ⅓ dưới; pinyin hiện; `#qReveal`/nghĩa chưa lộ trước chọn.  
5. Trả lời đúng「Xin chào」: burst dmg + `vibrate([40,30,60])` + TTS「你好」+ **Tu vi +1** (wall ~**3,3s** ≤10s). Sai đáp án đầu: không rung/TTS (đúng spec); assist hạ địch sau unpause → Tu vi vẫn tới.  
6. Badge **LOW** góc phải trên, hint HSK đáy — **không chồng** (360 & 320, có screenshot).  
7. Slow3G playable **6,29s** ≤8s · disk **1,407MB** · transfer Slow3G **0,94MB** · 0 external · 0 console error · offline không trắng · 50 tap Chiêu OK.  
8. FPS 60s CPU4×: auto → LOW avg**~51** p5**~38**; locked LOW avg**50,5** p5**33,8** ≥24 (**cải thiện mạnh vs B8**; SwiftShader không còn sàn 20).  
9. Không bug **chặn**; chỉ ghi chú nhỏ timeline marketing 8–10s bị rút khi trả lời đúng sớm.

---

## Tiêu chí số (rút)

| Tiêu chí | Kết quả | Số |
|----------|---------|-----|
| MD5 + children | **ĐẠT** | HTML khớp · `B9_MD5s.txt` 0 fail |
| 0 external / ≤3MB | **ĐẠT** | external 0 · disk 1,407MB · Slow3G 0,94MB |
| Slow3G ≤8s | **ĐẠT** | playable **6,29s** · ttp **5374ms** |
| Console 0 | **ĐẠT** | 0 error |
| Joystick 1 ngón | **ĐẠT** | stick gần điểm chạm · nhả → `display:none` |
| Nút Chiêu/ULT/答题 | **ĐẠT** | 80 / 64 / 64×48 · leftover [] |
| Camera 45° cố định | **ĐẠT** | không lookZone; pinch không đổi góc nhìn gameplay |
| 你好 ~3s + pinyin | **ĐẠT** | wall **3362ms** · zh=你好 · py=nǐ hǎo |
| Đúng → burst/rung/TTS/Tu vi≤10s | **ĐẠT** | vib✓ speak你好 · Tu vi ~**3335ms** |
| LOW ≠ đè hint | **ĐẠT** | overlap false (screenshot `*_low_hint.png`) |
| FPS auto/LOW p5≥24 | **ĐẠT** | auto p5~38 · LOW p5**33,8** |
| Offline / 50 tap | **ĐẠT** | canvas còn · 0 pageerror |

---

## Bug list

1. **(nhỏ)** Kịch bản marketing「giây 8–10 hạ quái + Tu vi」bị **rút còn ~3s** nếu trả lời đúng ngay — boss 180 máu + dmg intro ≥90 một phát chết.  
   - **Mức:** nhỏ (vẫn ≤10s; nghiệm thu “chơi được 10s” vẫn đạt).  
   - **Yêu cầu Dev (tuỳ chọn):** nếu muốn đúng nhịp 8–10s Teaser, giảm dmg câu intro hoặc tăng HP địch tutorial; không bắt buộc để ship B9.

*Không có bug chặn / khó chịu trong phạm vi B9 đã test.*

---

## Checklist 10 bước — điện thoại + 5 người lạ

1. Mở `proto3d_b9.html` dọc 360-ish: vào là đánh được, thấy tay「kéo để chạy」~3s, **không** màn hướng dẫn dài.  
2. Chạm 1 ngón chỗ trống → joystick nổi đúng chỗ; kéo chạy; **nhấc tay** → nhân vật tự ngắm/đánh (tầm ~6m), không cần ngón 2.  
3. Thử vuốt/pinch: camera **không** xoay tự do; góc nhìn chéo từ trên.  
4. Chỉ thấy nút **Chiêu** (to) + **ULT** + **答题** (không 6 nút cũ).  
5. ~3s: câu **你好** + pinyin; chạm đáp án ở ⅓ dưới; trước khi chọn **không** thấy dòng nghĩa/giải thích.  
6. Chọn đúng「Xin chào」: chiêu nổ, máy rung (Android), nghe TTS Trung, tới **Tu vi +1** trong **≤10s**.  
7. Bật chất lượng LOW: chữ disclaimer đáy vẫn đọc được, badge không đè.  
8. Airplane/offline sau khi đã load: không màn trắng; spam Chiêu 50 lần không đơ.  
9. **Test 5 người lạ (nghiệm thu cứng):** mỗi người máy riêng, **không ai chỉ**; giao việc “chơi thử 10 giây”. Đạt nếu **5/5** tự kéo chạy + tự trả lời câu đầu trong ≤10s. Ghi lại ai fail bước nào.  
10. (Tuỳ chọn) So FPS HUD ~60s trên máy tầm trung với số QA (LOW p5≥24); quay 10s đầu đối chiếu `proto3d_b9.mp4`.

---

## Artifacts

`/workspace/game/QA_b9_report.md` · `/tmp/qa-pw/qa_b9.json` · `/workspace/game/qa_shots/b9/` (`naive_*`, `correct_burst`, `*_joystick`, `*_low_hint`, `slow3g`, `fps_*`, `offline`…)

*Hết B9 — không chỉnh code Dev. Waves/cards = b10.*
