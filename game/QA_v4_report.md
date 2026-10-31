# Báo cáo QA — game_v4 (Đánh Boss học tiếng Trung)

**Ngày kiểm:** 30/10/2026 (Asia/Saigon)  
**Người kiểm:** QA (Thiết kế game & Kiểm thử)  
**Bản:** `/workspace/game/game_v4.html` (+ `v4/battle3d.mjs`, `v4/QUESTION_FORMAT.md`)  
**Cách chạy test:** `python3 -m http.server 8000` trong `/workspace/game`  
**Viewport:** 360×640, 320×568; thêm Slow 3G (CDN); spam chạm / double-submit  
**Công cụ:** Playwright + Chromium headless (miễn phí), đọc code tĩnh  
**Lưu ý:** QA **không** sửa code game.

---

## 1. Danh sách lỗi (Đỏ / Vàng)

### 1. Đỏ — Nâng cấp sau câu đúng bị bấm liên tục → cộng nhiều lần
- **Lỗi gì:** Overlay nâng cấp không khóa nút sau lần bấm đầu. Bấm nhanh / spam 3 nút trong ~100ms có thể cộng **nhiều cấp** (reproduce: level 1→16, ATK 12→47, giáp/skill cũng cộng dồn).
- **File + dòng:** `game_v4.html` — `openUpgrade()` ~L881–910 (handler `b.onclick` không `disabled` / không cờ `upLocked`).
- **Cách tái hiện:** Vào chặng 1 → trả lời đúng → khi hiện “Nâng cấp tướng”, chạm liên tục 1 nút hoặc lần lượt cả 3 nút thật nhanh trước khi overlay đóng.
- **Mức độ:** **Đỏ (chặn)** — phá cân bằng, có thể skip/`afterRound` chồng chéo.
- **Yêu cầu sửa cho Dev:** Sau lần chọn đầu: set cờ `upgradeLocked=true`, `button.disabled=true` mọi nút trong `#upOpts`, bỏ listener; chỉ `apply()` một lần; hủy/ignore click tiếp.

### 2. Đỏ — Đã hạ boss (HP=0) nhưng vẫn có thể thua chặng
- **Lỗi gì:** Boss chết sớm vẫn bắt buộc hỏi hết pool; trả lời sai vẫn trừ máu; hết máu → `end(false)` hiện “Thua…” dù `boss===0`.
- **File + dòng:** `resolve()` nhánh sai ~L863–877; `afterRound()` ~L913–918; `end(win)` ~L914+.
- **Cách tái hiện:** (debug) tăng ATK/`forceCorrect` đến khi boss=0 khi còn nhiều câu → cố ý trả lời sai đến hết máu → màn Thua, không mở map chặng 2.
- **Mức độ:** **Đỏ** — lệch luật chơi mong đợi (“hạ boss = thắng chặng”).
- **Yêu cầu sửa cho Dev:** Chọn 1 luật rõ và code theo:
  - **A (đề xuất):** khi `st.boss<=0` → thắng chặng ngay (hoặc sau câu hiện tại), bỏ hỏi tiếp; **hoặc**
  - **B:** vẫn hỏi tiếp nhưng **sai không trừ máu** / không thua được nữa (chỉ luyện); kết thúc chặng luôn `win=true` nếu boss đã chết.

### 3. Đỏ — Mạng yếu (Slow 3G): lần tải đầu ~30s vì CDN Three/Howler/Tween
- **Lỗi gì:** Emulate Slow 3G, `game_v4.html` DOM ~0.5s nhưng chờ module CDN (three@0.186, postprocessing, tween, howler) khiến sẵn sàng chơi trễ ~**30s**. Dễ tưởng app đơ trên 4G yếu VN.
- **File + dòng:** `<script type="importmap">` + howler CDN ~L7–26; `import` `./v4/battle3d.mjs` kéo three.
- **Cách tái hiện:** Chrome DevTools → Network Slow 3G → hard reload `game_v4.html` → đo đến khi bấm Bắt đầu vào được trận có câu hỏi.
- **Mức độ:** **Đỏ** trên mạng yếu / lần mở đầu.
- **Yêu cầu sửa cho Dev:** Fallback 2D/emoji **không chặn** bắt đầu trận; lazy-load 3D sau; hoặc self-host/minify bundle; skeleton UI “Đang tải đồ họa…” <3s; timeout CDN → fallback (đã có một phần `webglAvailable` nhưng vẫn import module).

### 4. Vàng — HP hero đi âm trong state (UI chỉ clamp hiển thị)
- **Lỗi gì:** `st.hero -= taken` không `Math.max(0,…)`. Reproduce: hero=3 + timeout → `st.hero=-17` trong khi `#heroTxt` hiện `0/110`.
- **File + dòng:** `resolve()` ~L874; `upd()` ~L671–673 chỉ clamp khi vẽ.
- **Cách tái hiện:** Chơi đến gần hết máu → để hết giờ / chọn sai.
- **Mức độ:** **Vàng**
- **Yêu cầu sửa:** `st.hero = Math.max(0, st.hero - taken)`; tương tự rà `st.boss` (đã có `Math.min` khi trừ — ổn).

### 5. Vàng — UI combo ghi “LONG HẠ!” từ streak 3 dù chưa mở skill Long Hạ
- **Lỗi gì:** `upd()` hiện `COMBO xN — LONG HẠ!` khi `streak>=3`, trong khi `pickSkill` chỉ dùng Long Hạ khi `skillLv>=2` và đủ dmg kết liễu.
- **File + dòng:** `upd()` ~L677–678; `pickSkill` ~L809–813.
- **Cách tái hiện:** Trả lời đúng 3 câu liên tiếp lúc còn skillLv 0/1 → thấy chữ LONG HẠ nhưng chiêu thực tế là Phi tiêu/Chém gió + hệ số combo 1.35.
- **Mức độ:** **Vàng** (gây hiểu nhầm “sướng” skill).
- **Yêu cầu sửa:** Đổi copy thành `COMBO xN (+35% dmg)` / `Sắp Long Hạ`; chỉ gắn “LONG HẠ” khi `skillLv>=2`.

### 6. Vàng — Pinyin + nghĩa Việt của đáp án bị `display:none` khi đang chọn
- **Lỗi gì:** Data có `optionPy`/`optionVi`, DOM render đủ, nhưng CSS `.opt .py,.opt .vi-ans{display:none}` chỉ hiện sau `.opts.revealed`. Lệch quy ước “chữ Hán hiện trên UI phải có pinyin + nghĩa Việt” (người chơi nhìn đáp án Hán trần khi chọn).
- **File + dòng:** CSS ~L229–234; `renderOptions` ~L737–752.
- **Cách tái hiện:** Vào câu mc/situ có Hán trong đáp án → quan sát nút trước khi chọn: chỉ thấy Hán, chưa thấy pinyin/VI.
- **Mức độ:** **Vàng** (quy ước sản phẩm; nếu cố ý che để tránh lộ nghĩa thì ghi rõ trong thiết kế).
- **Yêu cầu sửa:** Hiện **pinyin** dưới mỗi đáp án Hán khi đang chọn; nghĩa Việt có thể giữ ẩn đến sau khi chọn (đề xuất QA). Order chips đã hiện py+vi — nhất quán với hướng đó.

### 7. Vàng — `localStorage` không bọc try/catch
- **Lỗi gì:** `JSON.parse(localStorage.getItem…)` và `setItem` có thể throw (Safari private / quota) → trắng trang.
- **File + dòng:** ~L421–422, L433, L979.
- **Cách tái hiện:** Chế độ riêng tư chặn storage / mock `setItem` throw.
- **Mức độ:** **Vàng**
- **Yêu cầu sửa:** try/catch + fallback memory object; không crash init.

### 8. Vàng — `end()` / `beginRun()` không `clearInterval(timerId)` tường minh
- **Lỗi gì:** Timer được clear trong `resolve`/`ask`, nhưng thoát trận bằng đường khác / spam Bắt đầu lại giữa chừng có rủi ro interval cũ (hiện probe death thì timer dừng — chưa bắt được leak ổn định). Nên hardening.
- **File + dòng:** `timerId` ~L430; `ask` L724; `resolve` L817; thiếu clear trong `end`/`beginRun`/`startStage`.
- **Cách tái hiện:** Spam “Bắt đầu” / vào map / thoát khi thanh thời gian đang chạy.
- **Mức độ:** **Vàng**
- **Yêu cầu sửa:** `clearInterval(timerId); timerId=null` đầu `end`, `startStage`, `beginRun`; hủy `st.pending` và không gọi callback pending của trận cũ (gán `st.pending=null` + generation token).

### 9. Vàng — Chữ HUD quá nhỏ trên màn 320×568
- **Lỗi gì:** `.bar-lab` 11px, `.hp-lab` 12px — khó đọc ngoài trời / người lớn tuổi.
- **File + dòng:** CSS ~L227, L250.
- **Cách tái hiện:** Viewport 320×568, nhìn thanh máu/timer.
- **Mức độ:** **Vàng**
- **Yêu cầu sửa:** Tối thiểu 13–14px cho nhãn HP/timer; tăng contrast.

### 10. Vàng — Hook debug `forceCorrect` crash nếu `st.list[st.i]` undefined
- **Lỗi gì:** Không null-check; khi spam restart giữa resolve có thể `q` undefined → TypeError.
- **File + dòng:** `window.__bao.forceCorrect` ~L1093–1096.
- **Mức độ:** **Vàng** (chỉ debug, nhưng chứng tỏ thiếu guard state).
- **Yêu cầu sửa:** `if (!q) return;` + guard tương tự production paths.

### 11. Vàng — Không có hỗ trợ người mới sau thua (90%/80% máu boss) / không tick boss 8s
- **Lỗi gì:** So với đề xuất cân bằng đã chốt với anh Bảo: thiếu debuff boss ẩn sau lần thua 1–2; boss **không** tự đánh mỗi 8s (chỉ đánh khi sai/hết giờ).
- **File + dòng:** `startStage` ~L637–645; không có `lossCount` / `setInterval` boss.
- **Mức độ:** **Vàng** (thiếu feature thiết kế — chưa phải crash).
- **Yêu cầu sửa:** Đưa số ra file/const cấu hình; implement theo mục 2 bên dưới.

### Đã kiểm — chưa bắt được / OK
- Overflow ngang 360 & 320: **không** (scrollW=docW).
- Nút `.opt` / `.btn` / mute: cao ≥44px; chip order ~49×59+ (đạt ngưỡng).
- Double-submit đáp án: `locked=true` chặn resolve kép (OK).
- Câu non-order: đủ `optionPy`/`optionVi` trong data; order đủ `wordPy`/`wordVi`.
- Boss HP không âm nhờ `Math.min(dmg, st.boss)` ~L853–857.

---

## 2. Cân bằng chặng 1 — số trong code vs đề xuất QA

| Hạng mục | **Code hiện tại (v4)** | **Đề xuất QA** |
|---|---|---|
| Boss HP chặng 1 | `bossMax = max(listLen,8) * BOSS_PER_Q` → pool 8–12 câu → **128–192 HP** (thường **192**) | **600** |
| Boss đánh chủ động | Không; chỉ khi **sai / hết giờ** | Mỗi **8s** −20 HP |
| ST boss khi sai | `WRONG_DMG=20` (−6 mỗi cấp giáp, min 4) | **20** ngay khi sai |
| Máu người chơi | `HERO_BASE=110` | **100** |
| ST khi đúng | `BASE_DMG=12` × skill (1 / 1.35 / 1.8) + nâng cấp ATK+4 | **50** cố định (đơn giản hơn) |
| Combo | streak≥3 → **×1.35**; UI ghi LONG HẠ | 3 → **×1.5**, 5 → **×2** |
| Thời gian / câu | `QUESTION_SECONDS=20` | **10** |
| Trả lời nhanh | `FAST_SECONDS=5` → **×2 dmg** | **&lt;3s → +10** dmg |
| Hỗ trợ sau thua | **Không có** | Ẩn: thua 1 → boss **90%** (540); thua 2 → **80%** (480) |
| Thắng chặng | Hỏi **hết** list và `boss<=0` và còn máu | Hạ hết máu boss (đề xuất A ở lỗi #2) |

**Đo thực tế (Playwright, pattern ~60% đúng = 8/12):** thắng chặng 1, mở map chặng 2; thời gian máy ~20s (bỏ qua đọc câu); sim Monte Carlo người thật: **~60% win rate**, median ~**145s/lượt** (~2,5 phút).  
→ Chặng 1 **dễ hơn** mục tiêu “thắng sau 2–3 lần thử” (mục tiêu ≥70% sau 3 lần với người mới ~60% accuracy: hiện đã ~60% **ngay lần 1**).

**Đề xuất chỉnh const (Dev đưa ra config):**

```js
// Đề xuất QA — stage 1 feel
const HERO_BASE = 100;
const BOSS_STAGE1_HP = 600;      // thay BOSS_PER_Q * n cho stage 0
const BASE_DMG = 50;
const WRONG_DMG = 20;
const QUESTION_SECONDS = 10;
const FAST_SECONDS = 3;
const FAST_BONUS_FLAT = 10;      // thay vì ×2
const COMBO_3 = 1.5, COMBO_5 = 2.0;
const BOSS_TICK_MS = 8000, BOSS_TICK_DMG = 20;
// Sau thua: bossMax *= [1, 0.9, 0.8][min(losses,2)]
```

---

## 3. Checklist thử điện thoại — 10 bước / ~5 phút (v4)

1. **Mở** `game_v4.html` bằng 4G thật (hoặc throttling), đo: có vào được màn Start &lt;5s không; nếu chờ 3D &gt;10s → ghi lại.  
2. Bật **màn nhỏ** (iPhone SE / thu hẹp ~320px): nhìn title, nút BẮT ĐẦU, mute 44px.  
3. Bấm **BẮT ĐẦU** → map Hạ Long–Cẩm Phả: node 1 mở, node 2 khóa.  
4. Vào chặng 1: xác nhận thanh máu boss/hero, timer chạy, câu có **pinyin + nghĩa** (stem).  
5. Trả lời **đúng nhanh** (&lt;3–5s): có float dmg / combo; mở nâng cấp → **chỉ chọn 1 lần** (thử spam 3–4 cái xem có cộng kép không — bug #1).  
6. Trả lời **sai** + để **hết giờ** 1 lần: bị trừ máu, rung/flash; không double-damage.  
7. Gặp câu **order**: chip đủ to, có py; Kiểm tra / Xóa hoạt động; spam chip không crash.  
8. Gặp câu **listen**: nút Nghe lại; nếu không TTS vẫn thấy chữ/pinyin fallback.  
9. Chơi đến **thắng hoặc thua**: thắng → map mở chặng 2; thua → màn end + Form/Zalo; bấm chơi lại reset máu/ATK (không giữ giáp trận trước).  
10. **Spam** Bắt đầu / vào chặng / mute lúc đang anim: không trắng trang, không HP âm trên UI, không timer chạy nền sau end.

**Chỉ số ghi nhanh sau checklist:** hết chặng 1? (Y/N) · thời gian lượt (phút) · lỗi Đỏ còn (số).

---

## 4. Góp ý thiết kế v5 (skim `game_v5.html`) — số cụ thể

### Bot Dễ / Thường / Ác (đang có)
| | HP boss | Thời gian/câu |
|---|---|---|
| Dễ | ×**0.7** | **24s** |
| Thường | ×**1** | **20s** |
| Ác | ×**1.45** | **14s** |

**Đề xuất chỉnh cho khớp cảm giác “sướng + công bằng”:**
- Dễ: HP ×**0.75**, **12s**, WRONG_DMG **15** (đỡ phạt).  
- Thường: HP ×**1**, **10s** (đồng bộ đề xuất v4).  
- Ác: HP ×**1.35**, **8s**, WRONG **25**; thưởng badge + Form OK; **không** khóa cứng nếu chưa Kim đan — chỉ cảnh báo (code đã alert) + giữ thử được.

### Cảnh giới tu vi (REALMS)
| Cảnh | XP cần (hiện) | ATK mult | Đề xuất |
|---|---|---|---|
| Luyện khí | 0 | ×1 | Giữ; XP/câu đúng = **1** |
| Trúc cơ | **8** | ×1.15 | XP **10**; mở Cẩm Phả |
| Kim đan | **20** | ×1.35 | XP **24**; mở full bot Ác + cosmetic frame |

Thêm 1 bậc optional sau (Nguyên anh) XP **40**, ×1.5 — để streak dài không “max sớm”.

### Rương ngày (0đ)
- 1 lần/ngày (Asia/Saigon) — OK.  
- Pool cosmetic 6 món — OK.  
- **Đề xuất:** bảo đảm drop ưu tiên món chưa sở hữu (đã filter); thêm phần thưởng gameplay nhẹ: **+1 freeze streak** (20%) hoặc **+2 XP** (50%) hoặc cosmetic (30%) để rương gắn retention học, không chỉ skin.  
- Voucher 1/7 → Form: giữ, không gắn thanh toán trong app.

### Streak / SRS
- Freeze mỗi 7 ngày, bank max 3 — hợp lý.  
- SRS interval: giữ Anki-lite; **đề xuất** tối đa 10 thẻ due/ngày để session &lt;3 phút trên điện thoại.

### PvP (sắp tới — chưa deep-test)
- Bot Ác = “ghost” PvP offline trước; điểm tuần `weekBoard` mock OK khi chưa backend.  
- Khi có PvP thật: chỉ gửi **số câu đúng + thời gian**, không trust ATK client (tránh exploit bug #1).

---

## 5. Tóm tắt đánh giá số

| Chỉ số | Kết quả đo / ước lượng | Mục tiêu |
|---|---|---|
| Tỷ lệ hết chặng 1 @ ~60% accuracy | **~60% lần 1** (dễ) | ≥70% **sau ≤3 lần** |
| Thời gian 1 lượt chặng 1 | ~**2–2,5 phút** (sim người) | 1–2 phút |
| Lỗi Đỏ còn lại | **3** (#1 upgrade spam, #2 thua sau hạ boss, #3 tải 3G) | **0** trước deploy |
| Lỗi Vàng | **8** | ≤3 trước public |

**Kết luận:** Chưa duyệt deploy. Ưu tiên Dev sửa **#1 và #2**, rồi cân bằng const chặng 1 theo bảng đề xuất; sau đó QA chạy lại checklist 10 bước trên điện thoại thật.

— QA Bảo Khựa v4

## Retest 30/10 (Asia/Saigon) — sau khi Dev IT fix

**Phạm vi:** `/workspace/game/game_v4.html` (mtime ~03:22), **không** sửa code.  
**Công cụ:** Playwright + Chromium headless; viewport **360×640** và **320×568**; Slow 3G + chặn CDN.  
**Server:** `python3 -m http.server 8000` trong `/workspace/game`.

### PASS/FAIL theo bug đã yêu cầu

| # | Hạng mục | Kết quả | Bằng chứng |
|---|---|---|---|
| **1** | Upgrade spam chỉ +1 level | **PASS** (360 & 320) | Spam 8× cả 3 nút nâng cấp: `deltaLevel=1`; nút `disabled=true`. VD 360: level 1→2, ATK 12→16. 320: level 1→2, armor 0→1. Code: `upgradeLocked` + disable ~L1724–1742. |
| **2** | `boss<=0` thắng ngay, không thua sau | **PASS** (360 & 320) | ATK cao → boss=0 → `ended=true`, `onMap=true`, `stageIdx=1`, không hiện “Thua”. Thử `forceWrong` sau đó: `lossAfter=false`. Code: `openUpgrade`/`afterRound`/`resolve` sai → `end(true)` ~L1689–1762. |
| **3a** | Slow 3G → câu hỏi đầu | **PASS** | `msToBao=5639`, **`msToFirstQuestion=6293`** (~6,3s; Dev claim ~7,7s — **đạt / tốt hơn claim**). `hasQuestion=true`, fallback 2D hiện sớm. |
| **3b** | CDN bị chặn, chơi 2D được | **PASS** | Abort `cdn.jsdelivr.net`/`unpkg.com`: vẫn vào trận, `fallback=true`, `answered=1`, không `pageerror`. |
| **4** | `st.hero` không âm | **PASS** (360 & 320) | `hero=3` + timeout → samples `[0,0]`; UI end Thua; `allNonNeg=true`. Code: `st.hero = Math.max(0, st.hero - taken)` ~L1707. |
| **7** | `localStorage` throw không crash | **PASS** | (1) Stub get/set throw lúc runtime: mute/start/upgrade vẫn sống, `hasBao`. (2) Throw ngay từ `addInitScript` lúc load: `hasBao=true`, `btnStart` có, `pageErrors=[]`. Code: `lsGet`/`lsSet` + try/catch prog ~L1194–1213. |

### Regression nhanh

| Hạng mục | 360 | 320 | Ghi chú |
|---|---|---|---|
| Thắng chặng 1 (boss chết → map chặng 2) | PASS | PASS | `stageIdx=1`, `onMap=true` |
| Thua chặng 1 | PASS | PASS | Title “Thua ở Bãi Cháy…”, `hero=0` |
| Chơi lại / vào lại reset state | PASS | PASS | hero=110, atk=12, level=1, armor=0, skillLv=0, i=0, boss=192 |
| Timer không chạy sau end | PASS | PASS | `#timer i` width không đổi sau 600ms; `end()` có `clearInterval` ~L1770 |
| Console `pageerror` mới | PASS | PASS | Không có pageerror trong các scenario trên |

### Bug cũ còn lại (không thuộc list retest bắt buộc) / trạng thái

| # cũ | Mức | Trạng thái sau retest |
|---|---|---|
| 5 Combo UI “LONG HẠ!” khi `skillLv<2` | Vàng | **Còn** — streak=3, skillLv=0 vẫn hiện `COMBO x3 — LONG HẠ!` (`upd` ~L1497) |
| 6 optionPy/Vi `display:none` khi chọn | Vàng | **Còn** — CSS ~L240–244 |
| 8 clear timer khi begin/startStage | Vàng | **Một phần** — `end()` đã clear; `beginRun`/`startStage` **chưa** `clearInterval` |
| 9 HUD 11–12px | Vàng | **Còn** — `.bar-lab`/`.hp-lab` ~L238, L261 |
| 10 forceCorrect null-guard | Vàng | **Đã cải thiện** — có `if (!st \|\| st._ended \|\| !st.list) return` ~L1948+ |
| 11 Balance 600HP / tick 8s / 90%–80% | Vàng (thiết kế) | **Còn** — vẫn `BOSS_PER_Q=16`, `HERO_BASE=110`, `QUESTION_SECONDS=20`, không tick boss, không debuff sau thua |

### Bug mới phát hiện trong retest

Không có lỗi **Đỏ** mới.

**Vàng (nhỏ) — đề xuất hardening (không chặn deploy chức năng):**
1. **`startStage` / `beginRun` chưa clear timer + hủy pending trận cũ** — `game_v4.html` `beginRun` ~L1450, `startStage` ~L1455.  
   - **Tái hiện:** đang trong câu (timer chạy) → thoát về map / bắt đầu lại thật nhanh.  
   - **Yêu cầu Dev:** đầu `startStage`/`beginRun`: `clearInterval(timerId); timerId=null; if (st) { st.pending=null; }`.  
   - Hiện `end()` đã chặn phần lớn; regression spam chưa bắt leak — vẫn nên đóng cho chắc.

### Đếm lỗi còn lại

| | Trước (báo cáo đầu) | Sau retest 30/10 |
|---|---|---|
| **Đỏ** | 3 (#1, #2, #3) | **0** |
| **Vàng** | 8 | **~5–6 còn mở** (#5, #6, #8 một phần, #9, #11; #10 gần xong; +1 hardening timer start) |

### Khuyến nghị deploy

- **Về cổng QA chức năng (3 Đỏ + #4 + #7 + regression):** **ĐẠT — có thể đưa anh Bảo duyệt deploy bản v4 này.**  
- **Điều kiện kèm:**  
  1. Deploy **sau khi anh Bảo duyệt** (đúng quy tắc team).  
  2. Cân bằng chặng 1 vẫn **dễ hơn** đề xuất QA (boss ~192, timer 20s) — nên lên backlog / v5, **không** chặn nếu mục tiêu lần này là ổn định bug.  
  3. Nên fix nhanh copy combo (#5) và hiện pinyin đáp án (#6) trong bản vá nhỏ tiếp theo (Vàng UX/học).  
- **Không** tự deploy từ QA.

**Tóm tắt một dòng cho Dev IT:** #1/#2/#3/#4/#7 PASS; Slow 3G ~6,3s tới câu đầu; CDN down vẫn chơi 2D; regression thắng/thua/reset/timer OK; Đỏ còn = 0; còn Vàng combo copy + ẩn pinyin option + balance.

— QA retest 30/10/2026 (Asia/Saigon)
