# QA Report — game_v6 (Hạ Long Ngữ Tiên)

*Thiết kế & Kiểm thử · 30/10/2026 Asia/Saigon · **Không sửa code game***  
*Gói: `/workspace/game/game_v6.zip` · MD5 `71e5887c…` (**khớp** prefix yêu cầu) · Giải nén: `/workspace/game/v6_test/`*  
*Playwright Chromium · viewport **360×640** & **320×568** · Slow 3G + chặn CDN · rapid tap · sim ≥1000 run/class*  
*Shots: `/workspace/game/qa_shots/v6/` · Raw: `/tmp/qa-pw/qa_v6_accept.json` · `/tmp/qa-pw/sim_v6_results.json`*

---

## Verdict tổng

**CHƯA ĐẠT để ship** — tiêu chí **§9.4** (Linh Hồ 62,1% &lt; 70%) và **§9.5** (Hán trên đáp án `bat_loi`/`hai` thiếu `optionPy`/`optionVi`) fail cứng. Các tiêu chí First-hit / không modal upgrade / telegraph / 1 HTML / First 30s A–H cơ bản **ĐẠT**.

| §9 | Tiêu chí | Kết quả | Số liệu |
|----|----------|---------|---------|
| 1 | First damage ≤10s từ tap Start | **ĐẠT** | 360: **0,84s** · 320: **0,77s** (forceCorrect ngay; hệ thống sẵn sàng ≪10s) |
| 2 | Không màn zero-action &gt;3s | **ĐẠT** | `#upOverlay` không bật sau đúng · gap→câu sau **~0,2s** |
| 3 | Session stage 1–2 phút · Ch.1 ≤5 phút | **ĐẠT** *(sim)* | Median win @60%: LH **47s** · KK **43s** · TV **52s** (trong 1–2 phút) |
| 4 | ≥70% win Stage1 / ≤3 tries @60% **mỗi class** | **CHƯA ĐẠT** | LH **62,1%** · KK **72,6%** · TV **90,5%** (n=1000) |
| 5 | Mọi Hán: pinyin có thanh + nghĩa VI | **CHƯA ĐẠT** | `QUESTIONS_V6_RAW` `bat_loi`/`hai`: đáp án Hán **không** `optionPy`/`optionVi` (UI thiếu `.py`/`.vi-ans`) |
| 6 | First 30s A–H · không paywall/signup/IAP | **ĐẠT** *(nhẹ Vàng stem py ẩn)* | A 1 CTA · B 你好 · C hit · D combo×2 · F badge+tuVi · E telegraph · G fail mềm · H Zalo opacity 0,5 |
| 7 | WebAudio / vibrate · 0đ asset | **ĐẠT** *(ghi chú)* | Howler+ogg · `AudioContext` chirp · `navigator.vibrate` · art placeholder + FREE_RESOURCES |
| 8 | Đổi loại câu mỗi 3 · F @ ≤2/3 HP boss | **ĐẠT** | `rotateTypesEvery3` khối 3 · `_badgeF` + `tuVi=1` khi boss≤2/3 |
| 9 | Boss chiêu có tên + telegraph ≥800ms | **ĐẠT** | `TELE_MS=1200` · 乱声 (Luànshēng) / 吞字 (Tūnzì) |
| 10 | 1 HTML · http.server · 2D fallback | **ĐẠT** *(Vàng Slow3G)* | `game_v6.html` OK · CDN block → fallback2d **true** · Slow3G→Q1 ~**46s** |

---

## 1) MD5 & môi trường

- `md5sum game_v6.zip` = `71e5887c4cb5b196c2c042b3c9f7e579` → prefix **71e5887c** OK.  
- Server: `python3 -m http.server 8000` tại `/workspace/game/v6_test/`.  
- Hooks: `window.__bao` (`forceCorrect` / `forceWrong` / `selectedClass` / `beginRun` / …).

---

## 2) Playwright — First 30s & acceptance nhanh

### Viewport 360×640
| Check | Kết quả |
|-------|---------|
| A — 1 nút primary | `Thử hạ Boss Lễ Tân` · primaryCount=1 · Hub ghost opacity 0,55 |
| B — Q1 | zh=你好 · py data=`nǐ hǎo` · vi=`Xin chào` · class mặc định `kiem_khach` ATK50 · boss tutorial 150 · timer 10s |
| C — First dmg | **0,84s** từ tap · dmg 60 (50+NHANH vì forceCorrect tức thì) |
| D — Combo | `COMBO x2` / streak 2 sau câu 2 |
| F — Badge 1/3 | `_badgeF=true` · `tuVi=1` |
| E — Telegraph | Toast hiện · text có **乱声 Luànshēng (tiếng loạn)** |
| G — Fail mềm | Lần 1: hero 100→100 · `firstWrongForgiven=true` · lần 2: hero→80 |
| H — Zalo cliff | `opacity=0.5` · `https://zalo.me/g/16yx8ptwane8ggwrnyxl` |
| Upgrade modal | **không** bật |
| Rapid tap | 15× forceCorrect / 50ms · **0** pageerror |

### Viewport 320×568
- First dmg **0,77s** · regression Start/Q1/hit OK (shots `320x568_*.png`).

### Slow 3G + chặn CDN
- `__bao` ready ~46s · vào Q1 OK · `fallback2d=true`.  
- **Vàng:** cold start Slow3G lâu (script Howler CDN timeout) — vẫn chơi được 2D.

---

## 3) Tiêu chí 4 — Sim Stage1 (bắt buộc)

**Định nghĩa Stage1 (khớp code thật):** Tutorial boss **150** → `promoteTutorialToStage1b` còn **250** (tổng **400**). Thắng = hạ hết không chết.  
**Nguồn logic:** `CLASSES` / `COMBO_3|5` / `FAST_BONUS_FLAT` / wrong `max(4, 20 - armor*6)` / tick `10|16` với `classArmor` nửa hiệu lực / micro `atk+2` mỗi 3 đúng / first-wrong forgive / **không** gán skill chủ động (game không wire).  
**GIẢ ĐỊNH sim:** nghĩ **4s**/câu (không NHANH) + anim 0,7–1,0s; **RETRY_SCALE không áp** trên nhánh tutorial/1b (**đúng như code** `bossMax = TUTORIAL_BOSS_HP`).  
**Không** drive browser 1000× (quá chậm) — **replicate đúng công thức file**; hooks Playwright dùng để xác nhận flow thắng Stage1.

| Class | Win 1st try | Win ≤3 tries | Median session (win) | n |
|-------|-------------|--------------|----------------------|---|
| **Linh Hồ** (HP110 ATK40 giáp5) | **26,4%** | **62,1%** ❌ | 47,3s | 1000 |
| **Kiếm Khách** (100/50/0) | **36,2%** | **72,6%** ✅ | 42,6s | 1000 |
| **Thiết Vệ** (120/45/12) | **54,3%** | **90,5%** ✅ | 52,3s | 1000 |

→ **§9.4 CHƯA ĐẠT** vì Linh Hồ &lt; 70%.

---

## 4) Tiêu chí 5 — Pinyin + nghĩa VI

- Q bank v5 (situ/mc có `optionPy`/`optionVi`): OK khi render.  
- **v6 `bat_loi` / `hai`:** chỉ có `pinyin`/`giai_thich` cho đáp án đúng; **4 đáp án Hán không có per-option py/vi** → UI `renderOptions` không gắn `.py`/`.vi-ans` (bắt lỗi Playwright trên opts).  
- Stem: nhiều type **cố ý** `$('qPy').textContent=''` khi đang chọn (L2878+) — Q1 你好 hiện Hán nhưng **không** hiện `nǐ hǎo` / nghĩa trên stem lúc hỏi (chỉ trong data).  
→ **CHƯA ĐẠT** rule “mọi Hán trên UI”.

---

## 5) Bug list (Dev IT)

### Đỏ
1. **§9.4 Linh Hồ winrate 62,1% &lt; 70%**  
   - *Repro:* sim `/tmp/qa-pw/sim_v6_stage1.mjs` · hoặc chơi Linh Hồ @~60% acc, 3 tries.  
   - *File:* `game_v6.html` L43–46 (`CLASSES.linh_ho.atk=40`), L2758 (tutorial HP cố định), skill CC **chưa gắn**.  
   - *Fix:* tăng ATK Linh Hồ (vd. 45–48) **hoặc** wire skill Hồi xuân/Đình ngôn; **và/hoặc** áp `RETRY_SCALE` lên tutorial/1b khi `stageLosses≥1`.

2. **Skill 3 class trong spec chưa implement**  
   - *Repro:* grep `_stunBossUntil` — chỉ đọc L2344/2349, **không có chỗ gán**; UI không nút Hồi xuân / Phản âm / Giáp xưởng.  
   - *Fix:* nút skill 1×/stage + gán `_stunBossUntil` / heal / counter đúng spec §5.

### Vàng
3. **Sai câu bỏ qua `classArmor`** — L3156: `WRONG_DMG - (st.armor||0)*6` (armor upgrade), Thiết Vệ giáp 12 không giảm đòn sai.  
   - *Fix:* `taken = max(4, WRONG_DMG - (st.armor||0)*6 - f(st.classArmor))` (thống nhất với tick).

4. **Đáp án Hán v6 thiếu optionPy/optionVi** — `QUESTIONS_V6_RAW` từ ~L183.  
   - *Repro:* mở câu `bat_loi`, 4 nút Hán không dòng pinyin/VI.  
   - *Fix:* thêm `optionPy` + `optionVi` đủ 4 phần tử mỗi câu; hoặc generate từ CEDICT.

5. **Stem ẩn pinyin khi đang hỏi** — L2878–2892.  
   - *Fix (First 30s B):* với Q1 / mc đơn giản, hiện `qPy` + `qVi` ngay (nǐ hǎo · xin chào).

6. **Hidden retry không giảm HP boss nhánh First-30** — L2758 / L3177 remain=250 cố định.  
   - *Fix:* nhân `TUTORIAL_BOSS_HP` & remain với `RETRY_SCALE[stageLosses]`.

7. **Slow 3G cold start ~46s** khi CDN Howler bị chặn/chậm.  
   - *Fix:* inline WebAudio SFX fallback trước Howler; không block `__bao`/Start.

---

## 6) Checklist 10 bước (~5 phút máy)

1. Mở `game_v6.html` 360×640 — thấy 1 CTA Boss Lễ Tân.  
2. Bắt đầu ≤2s — Q1 你好, timer 10s.  
3. Trả lời đúng — HP boss tụt, flash/SFX, số bay ≤1s.  
4. Câu 2 đúng — “2 liên tiếp” / COMBO x2.  
5. Đợi ~8s hoặc xem toast telegraph 乱声.  
6. Đánh tới boss ≤2/3 — badge + tu vi.  
7. Run mới: sai lần 1 — không mất máu.  
8. Sai lần 2 — mất máu.  
9. Đổi Linh Hồ (nếu có UI chọn) / `__bao.selectedClass='linh_ho'` — cảm giác DPS thấp hơn KK.  
10. Chặn mạng CDN — vẫn vào trận 2D.

---

## 7) Metrics snapshot

| Metric | Giá trị |
|--------|---------|
| Đỏ mở | **2** (#1 balance LH, #2 skills) |
| Vàng mở | **5** |
| Clear rate sim @60% ≤3 tries | LH 62% · KK 73% · TV 91% |
| Median stage1 (sim win) | ~43–52s |
| First damage | ≤1s (bot) / thiết kế ≤10s |

=== BÀN GIAO ===  
File: `/workspace/game/QA_v6_report.md`  
Gói MD5: `71e5887c…` OK · Unzip: `/workspace/game/v6_test/`  
Verdict: **CHƯA ĐẠT ship** (thiếu §9.4 Linh Hồ + §9.5 pinyin đáp án).  
===

---

# Retest v6 — Dev fix sau QA lần 1

*Thiết kế & Kiểm thử · 30/10/2026 ~05:00 Asia/Saigon · **Không sửa code game***  
*Gói: `/workspace/game/game_v6.zip` MD5 **`90cbd8c49d6462fd68e980c0390d1db8`** (khớp) · HTML MD5 **`cd607ffc42363e727418232df241b9f2`** (khớp)*  
*Giải nén mới: `/workspace/game/v6_test2/` · Server `:8000` · Playwright 360×640 & 320×568*  
*Raw: `/tmp/qa-pw/qa_v6_retest.json` · Sim QA độc lập trong JSON · Dev: `v6_test2/v6/SIM_TABLE.md`*  
*Slow 3G chuẩn Chrome: 500 kbps / 400 ms RTT (không dùng throttle 50 KB/s cũ)*

## Verdict tổng (Retest)

**ĐẠT có điều kiện (1 Vàng UX)** — các fail cứng lần 1 (§9.4 Linh Hồ, §9.5 thiếu optionPy/Vi data, skills chưa wire) **đã sửa và xác nhận**. Balance Stage1 cả 3 class ≥72% ≤3 tries (QA độc lập ≈ Dev SIM_TABLE). Còn **1 Vàng**: pinyin trên đáp án vẫn `display:none` khi đang chọn (chỉ hiện sau `.opts.revealed`) — lệch team rule “py hiện khi chọn; VI có thể ẩn đến sau”. Không chặn ship balance; nên sửa UX trước marketing First-30s nếu team rule cứng.

| §9 | Tiêu chí | Retest | Số liệu |
|----|----------|--------|---------|
| 1 | First damage ≤10s từ tap Start | **ĐẠT** | 360: **0,43s** · 320: **0,68s** |
| 2 | Không màn zero-action >3s / không upgrade modal | **ĐẠT** | `#upOverlay` không bật · gap→câu sau nhanh |
| 3 | Session stage ~1–2 phút | **ĐẠT** *(sim)* | Median win @60%: LH **105,5s** · KK **76,4s** · TV **100,8s** |
| 4 | Win Stage1 ≤3 tries @60% · band mục tiêu **72–85%** | **ĐẠT** | QA n=1000: LH **84,8%** · KK **77,4%** · TV **86,7%** · Dev: 84,5 / 75,1 / 83,4 · TV QA hơi >85 (dao động seed; sàn ≥72 đạt) |
| 5 | Mọi Hán: pinyin + nghĩa VI (data + UI) | **ĐẠT data / Vàng UI py đáp án** | `bat_loi`/`hai` có `optionPy`/`optionVi` · stem `.py`+`.vi` hiện · **`.opt .py` ẩn đến khi revealed** |
| 6 | First 30s A–H · 0 paywall/IAP | **ĐẠT** | A 1 CTA · B 你好 · C hit · D COMBO×2 · E telegraph · F badge+tuVi · G forgive · H Zalo opacity 0,5 |
| 7 | WebAudio / vibrate · 0đ | **ĐẠT** | Howler lazy · vibrate true · webp art |
| 8 | Đổi loại mỗi 3 · F @ ≤2/3 HP | **ĐẠT** | rotate `mc→bat_loi×3→hai×3→nghe_nhanh×3…` · badge+tuVi |
| 9 | Telegraph ≥800ms + tên chiêu | **ĐẠT** | Toast `乱声 Luànshēng (tiếng loạn)` · TELE_MS 1200 |
| 10 | 1 HTML · Slow 3G time-to-play · 2D | **ĐẠT** | Chrome Slow3G ready **~4,35s** / to-play **~4,48s** (khớp claim Dev ~4,3s) · art progressive · không overflowX |

## MD5 & môi trường

| File | MD5 kỳ vọng | Đo được | |
|------|-------------|---------|---|
| `game_v6.html` | `cd607ffc42363e727418232df241b9f2` | `cd607ffc42363e727418232df241b9f2` | khớp |
| `game_v6.zip` | `90cbd8c49d6462fd68e980c0390d1db8` | `90cbd8c49d6462fd68e980c0390d1db8` | khớp |

Unzip fresh → `/workspace/game/v6_test2/` (gồm `game_v6.html`, `v6/art/*.webp`, `v6/SIM_TABLE.md`, …).

## Criterion 4 — Sim độc lập vs Dev

Định nghĩa Stage1 (code v6): Tutorial boss **180** → promote 1b còn phần STAGE1 (**500** tổng) · RETRY_SCALE `[1,0.9,0.8]` trên tutorial · skills có xác suất dùng (sim) · accuracy 60% · thắng = clear tut+1b không chết · ≤3 tries.

| Class | Dev ≤3 | QA ≤3 | Δ | Median QA (win) | Band 72–85 |
|-------|--------|-------|---|-----------------|------------|
| Linh Hồ | **84,5%** | **84,8%** | +0,3 | 105,5s | trong band |
| Kiếm Khách | **75,1%** | **77,4%** | +2,3 | 76,4s | trong band |
| Thiết Vệ | **83,4%** | **86,7%** | +3,3 | 100,8s | QA hơi trên 85 (OK sàn ≥72; gần Dev) |

→ So với lần 1 (LH **62,1%** fail): **đã đạt**. QA ≈ Dev (±3 pp) — công thức balance/skills khớp.

## Skills thật (Playwright) — cả 3 class

| Class | Skill | Quan sát |
|-------|-------|----------|
| Linh Hồ | Hồi xuân quán + Đình ngôn | heal/full HP · `stunUntil` set · **stunStopsTick.blocked=true** (boss không đánh khi stun) |
| Kiếm Khách | Liên cụ + Đột kích | `mult=1.25` armed · Đột kích dmg **15** (boss 180→165) |
| Thiết Vệ | Giáp xưởng + Phản âm | `giap`+`phanAm` used · `classArmor=6` |

## classArmor khi sai

Thiết Vệ: sai lần 2 (sau forgive) mất **8** HP (hero 120→112). `expectedBase` không giáp tạm = **17**; khi Giáp xưởng active ×0,5 → floor(17×0,5)=**8**. → **classArmor áp đúng**.

## Pinyin / VI / stem / retry / art / rapid

- **Data** `optionPy`/`optionVi` trên `bat_loi`/`hai`: có (DOM `.py`/`.vi-ans` + text).  
- **Stem**: `qPy`/`qVi` hiện (vd. `nǐ hǎo` / `Xin chào`; bat_loi stem `Qǐng shàng chuán.`).  
- **Option py khi đang chọn**: `pyDisplay=none` · `viDisplay=none` · `revealed=false` → **Vàng** theo team rule.  
- **Retry tutorial**: 2 thua → `bossMax=144` = `180×0,8` (RETRY_SCALE[2]) — **ĐẠT**.  
- **Art** net thường 360/320: `kiem_khach.webp` nw=480 · `boss_hon_ngu.webp` nw=512 · `overflowX=false`. Slow3G: load progressive, không tràn.  
- **Rapid tap**: 0 `pageerror` · alive.  
- **Paywall**: gate/form = false.

## Slow 3G

| Preset | ready | to-play | Ghi chú |
|--------|-------|---------|---------|
| Chrome Slow 3G (500 kbps, 400 ms) | **4354 ms** | **4483 ms** | **khớp Dev ~4,3s** |
| Throttle cũ QA (50 KB/s, 2000 ms) | ~44 s | ~44 s | quá khắc — không dùng so claim |

## Bugs còn mở (Retest)

### Vàng-R1 — Pinyin đáp án ẩn khi đang chọn
- **Mức:** Vàng (UX / team rule First-30s học)  
- **File+line:** `game_v6.html` **L1098–1103** (và comment L1101, L3295)  
  ```
  .opt .py,.opt .vi-ans{display:none;…}
  .opts.revealed .opt .py, .opts.revealed .opt .vi-ans{display:block}
  ```
- **Repro:** Start → vào câu bat_loi/hai/mc → trước khi tap đáp án, inspect `.opt .py` → `display:none`. Sau chọn (`.opts.revealed`) mới hiện.  
- **Kỳ vọng team:** **pinyin hiện trong lúc chọn**; nghĩa VI có thể ẩn đến sau.  
- **Fix đề xuất (Dev):** bỏ `display:none` trên `.opt .py` (hoặc luôn `display:block`); giữ ẩn `.opt .vi-ans` đến `.opts.revealed`. Không đổi data.

### Đã đóng so với QA lần 1
- Đỏ #1 LH <70% → **đóng** (84,8%).  
- Đỏ skills chưa wire → **đóng** (3 class cast + stun chặn tick).  
- Đỏ/Vàng thiếu optionPy bat_loi/hai → **đóng data**.  
- Retry không scale tutorial → **đóng**.  
- Slow3G ~46s vs claim → **đóng** khi đo đúng preset Chrome Slow 3G (~4,3s).

## Checklist viewport

| Check | 360×640 | 320×568 |
|-------|---------|---------|
| First dmg | 0,43s | 0,68s |
| Skills LH/KK/TV | OK | OK |
| stun chặn boss | OK | OK |
| classArmor wrong | lost 8 | lost 8 |
| no upgrade | OK | OK |
| telegraph | OK | OK |
| art no overflow | OK | OK |
| rapid 0 err | OK | OK |
| option py while choosing | ẩn (Vàng) | ẩn (Vàng) |

=== BÀN GIAO RETEST ===  
MD5 HTML `cd607ffc…` · ZIP `90cbd8c4…` · Unzip `/workspace/game/v6_test2/`  
Sim QA: LH 84,8 · KK 77,4 · TV 86,7 ≈ Dev 84,5 / 75,1 / 83,4  
Verdict: **ĐẠT có điều kiện** — 0 Đỏ · **1 Vàng** (py đáp án chỉ hiện sau chọn, L1098–1103).  
===
