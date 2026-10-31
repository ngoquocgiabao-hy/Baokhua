# HẠ LONG NGỮ TIÊN — Spec v6 (Thiết kế & Kiểm thử → Dev IT)

*IP gốc · 1 file HTML · mobile 360×640 · 0đ (WebAudio / CSS / canvas / `navigator.vibrate`) · không signup · không IAP · không paywall*  
*Asia/Saigon · 30/10/2026 · Deadline spec 08:30 · Audit chán + First 30s (Marketing) + 5 đòn vui*  
*Mọi chữ Hán trong game/spec: Hán + **pinyin có thanh** + nghĩa tiếng Việt.*

---

## 0) Tóm tắt IP

**Hạ Long Ngữ Tiên** — Ma chủ **Hỗn Ngữ** (混语 · Hùnyǔ · *Ngôn ngữ hỗn loạn*) phong ấn lời nói dọc lộ trình **Hạ Long → Cẩm Phả**. Người chơi là **tu sĩ ngữ đạo**: mỗi câu Hán đúng = pháp thuật đánh boss. Tu vi (修为 · xiūwéi · *sức tu luyện*) tích trong `localStorage`.

---

## 1) Audit chán v4 (Playwright 360×640 · timeline từ mở trang)

*Evidence: `/workspace/game/qa_shots/` + `/tmp/qa-pw/boredom.json`. Không sửa code game trong audit.*

| # | Lý do chán | Giây bắt đầu chán | Evidence |
|---|------------|-------------------|----------|
| 1 | **Hai màn chết trước combat** (Start → Map): không địch, không đòn, chỉ đọc copy | **t ≈ 0s** (rõ ở **2.3s** vẫn trên Start; **4.35s** vẫn trên Map) | Timeline v4: `still_on_start_menu` 2.3s · `still_on_map_no_enemy` 4.35s · shots `v4_00_start.png`, `v4_01_map.png` |
| 2 | **Timer 20s + Q1 không gấp** → đứng đọc thoải mái, não “không có trận” | **t ≈ 4.86s** (câu 1 hiện, `timer: 20s`) | `first_question_visible` 4.86s · `after_reading_q1_4s` 9.1s · `QUESTION_SECONDS=20` trong code |
| 3 | **Hit yếu (BASE_DMG=12 / bossMax=192)** — thanh máu gần như không “đau” | **t ≈ 9.4s** (first enemy hit) | `first_enemy_hit_dmg` 9.4s · dmgApprox nhỏ · `v4_03_first_hit.png` |
| 4 | **Overlay nâng cấp bắt buộc mỗi câu đúng** — ~2.5–2.7s zero-action sau mỗi hit | **t ≈ 10.07s** | `upgrade_overlay_open` 10.07s · `upgradeBlockSec=2.72` · avgDeadAfterHit≈2.53s vs activeCombat≈0.2s · `v4_04_upgrade.png` |
| 5 | **Boss không đe khi đang đọc** — không tick, không telegraph; phản đòn chỉ khi sai; loại câu không đổi | **t ≈ 9–12s** khi đứng nhìn timer; củng cố **25.95s** lúc sai | `wrong_hit_received` 25.95s note · v4 không có `bossTick` · cùng format Q suốt run |

*Tham chiếu v5 (cùng session): thêm Hub/meta trước combat (`still_in_hub_meta` 4.62s); first hit ~8.28s — số đã tốt hơn nhưng dead-menu + overlay vẫn cắt nhịp. Shots: `v5_00_start.png` … `v5_04_hit.png`.*

---

## 2) First 30 seconds (ưu tiên Marketing A→B→C→D→**F**→**E**→G→H)

*Nguồn: `/workspace/baokhua-marketing/30-giay-dau.md`. Không paywall / signup / bán item trong 30s.*

| Ưu tiên | Timing | Khoảnh khắc | Implement (1 HTML) | Acceptance |
|---------|--------|-------------|-------------------|------------|
| **A** | 0–2s | **1 nút duy nhất** `Thử hạ Boss Lễ Tân` | `#boot`: logo nhỏ + 1 CTA full-width; **bỏ** tường Hub/Map trước trận đầu | Từ `DOMContentLoaded` → tap CTA ≤2s có thể vào Q1; ≤1 nút primary |
| **B** | 2–6s | Q1 siêu dễ: **你好** (**nǐ hǎo**, *xin chào*) | 3 đáp án 1 chạm; Hán+pinyin+VI; mặc định hero = Kiếm Khách (có thể đổi sau) | ≥90% người chơi chọn đúng trong sim / playtest nội bộ |
| **C** | 6–10s | Đúng → **hit ngay**: HP boss tụt + flash đỏ + SFX đấm (WebAudio) + số bay | `impactAt` ≤250ms; `navigator.vibrate(40)` nếu có | **First damage ≤10s** kể từ tap Start (A) |
| **D** | 10–14s | Combo sớm: `2 liên tiếp!` từ câu 2 | Banner combo + nhân dmg sớm (xem bảng số) | Sau đúng Q2: UI hiện “2 liên tiếp” ≤400ms |
| **F** | 18–24s | Boss còn **2/3 HP** (đã mất ≥1/3) → badge `🏅 Mở Bãi Cháy` + `+1 修为 (xiūwéi, tu vi)` bay | `localStorage.tuVi += 1`; toast ≤1.2s **không** chặn input | Trigger đúng khi `boss ≤ bossMax*2/3`; không modal full-screen |
| **E** | 14–18s *(sau F trong ưu tiên Dev, nhưng timeline ~14–18s)* | Boss **telegraph** + toast `Boss sắp đánh!` | Vòng sáng / rung 1.2s rồi tick hoặc skill | Telegraph **visible ≥800ms** trước hit boss |
| **G** | 24–28s | Sai **lần đầu run**: fail mềm — không trừ HP, không reset combo | Copy: `Hmm, thử lại nhé` | `firstWrongForgiven===true` đúng 1 lần / run |
| **H** | 28–30s | Cliffhanger: `Còn 1 câu nữa hạ boss` + nút phụ mờ Zalo | Link: `https://zalo.me/g/16yx8ptwane8ggwrnyxl` · không ép | Nút Zalo `opacity≤0.55`, không chặn combat |

### GIẢ ĐỊNH (đối soát Marketing ↔ bảng số)
1. Marketing minh hoạ số bay **`-40`** → **GIẢ ĐỊNH QA:** số bay = **ATK thực** của hero (mặc định Kiếm Khách **50**, có thể 40/45/55 theo bảng nhân vật). Không hardcode 40.  
2. “Boss Lễ Tân” 30s đầu = **mini-boss Stage 1a** (HP **150** tutorial) → chuyển thẳng Stage 1b; **GIẢ ĐỊNH:** tổng Chapter 1 vẫn cân bằng theo bảng §7 (boss stage1 full **400** gồm cả đoạn tutorial hoặc tách 150+250 — Dev chọn 1, ghi chú trong PR). *Khuyến nghị:* tutorial boss **150 HP**, rồi gate vào stage map còn **250** để tổng **400**.  
3. Thứ tự ưu tiên code: **A,B,C,D,F,E,G,H** (F trước E dù E có thể hiện ~14s nếu nhịp nhanh — nếu hit sớm, E có thể lệch 12–16s; chấp nhận ±2s).  
4. v5 Hub/chest/diff: **ẩn hoàn toàn** trong lần mở đầu; mở sau khi clear Stage 1 hoặc từ nút phụ sau 30s.

---

## 3) Năm thay đổi vui lớn nhất (gập vào First 30s + loop)

| # | Thay đổi | Vì sao hết chán | Acceptance Dev IT |
|---|----------|-----------------|-------------------|
| 1 | **Hit trong 10s đầu** (A–C) | Xoá dead menu 0–4.5s | `t_firstDamage - t_tapStart ≤ 10s` |
| 2 | **Countdown nhìn thấy + áp lực 10s/câu** | Xoá timer 20s “ngủ” | Timer số + bar; hết giờ = sai (trừ G lần 1) |
| 3 | **Combo + screen-shake + WebAudio** (D) | Hit 12 dmg không còn “bủng” | Combo 3→×1.5 · 5→×2; shake ≥2px; SFX hit mỗi đòn đúng |
| 4 | **Boss phản công có telegraph + tick** (E) | Không còn đứng đọc vô sự | Tick 10 dmg / 8s (stage1); telegraph ≥800ms; skill boss có tên |
| 5 | **Thưởng bất ngờ + đổi loại câu mỗi 3 câu + fail mềm** (F,G + type rotate) | Phá nhịp nâng cấp bắt buộc / Q giống nhau | Mỗi 3Q đổi type; F badge; G 1 lần; **không** modal upgrade mỗi câu — upgrade gộp hoặc chọn nhanh ≤1s / sau boss phase |

---

## 4) Chapter 1 — cốt truyện (3 stage + 1 boss)

*Mỗi stage 2–3 dòng thoại ngắn. Hán luôn có pinyin + VI.*

### Stage 1 — Bãi Cháy (mở ấn)
- Linh Hồ: 欢迎光临！(**Huānyíng guānglín!** · *Hoan nghênh quang lâm!*)  
- Kiếm Khách: 跟我来！(**Gēn wǒ lái!** · *Theo tôi nào!*)  
- Narrator: *Hỗn Ngữ gieo “tiếng giả” — chỉ câu đúng mới chặt được ấn.*

**Địch:** Tiểu yêu Lễ Tân (tutorial / 1a) → Yêu ngôn Bãi Cháy (1b).  
**Win:** Boss stage máu = 0 · badge Bãi Cháy + tu vi.

### Stage 2 — Cảng Cẩm Phả
- Thiết Vệ: 有我在。( **Yǒu wǒ zài.** · *Có tôi ở đây.*)  
- Hỗn Ngữ (vang): 你们听不懂！(**Nǐmen tīng bù dǒng!** · *Các ngươi nghe không hiểu!*)  
- Linh Hồ: *Giữ nhịp — mỗi sai là một lỗ hổng giáp.*

**Địch:** Hải yêu Phát Âm.  
**Win:** mở lộ Stage 3.

### Stage 3 — Đường vào sào huyệt
- Kiếm Khách: 最后一站！(**Zuìhòu yí zhàn!** · *Chặng cuối!*)  
- Thiết Vệ: *Khiên sẵn — hắn sắp nói dối bằng thanh điệu.*  
- Linh Hồ: 小心！(**Xiǎoxīn!** · *Cẩn thận!*)

**Địch:** Hộ pháp Thanh Điệu.  
**Win:** vào **Boss Hỗn Ngữ**.

### Boss Chapter 1 — Ma chủ Hỗn Ngữ (2 phase)
Xem §6. Thoại mở:
- 混语：这里没有正确的话。( **Zhèlǐ méiyǒu zhèngquè de huà.** · *Ở đây không có câu đúng.*)  
- Hero (theo class): câu ký của nhân vật đã chọn.

---

## 5) Ba nhân vật (chọn 1) — chỉ số & skill

*Art chi tiết: `/workspace/game/v6_characters_for_media.md`. Cân bằng: **mỗi class** thắng Stage 1 @ **60% accuracy** với tỷ lệ **≥70% trong ≤3 tries** (sim Monte Carlo ≥1000 run; hidden retry 1.0/0.9/0.8).*

| Class | HP | ATK (đúng) | Giáp | Đặc trưng | Skill 1 | Skill 2 |
|-------|----|------------|------|-----------|---------|---------|
| **Linh Hồ** | 110 | 40 | 5 | Heal + CC | **Hồi xuân quán**: +25 HP (1×/stage) | **Đình ngôn**: boss bỏ 1 tick (stun 3s) |
| **Kiếm Khách** | 100 | **50** | 0 | DPS + combo | **Liên cú**: câu đúng kế ×1.25 (stack với combo) | **Đột kích**: +15 dmg tức thì (1×/stage) |
| **Thiết Vệ** | 120 | 45 | 12 | Tank + counter | **Giáp xưởng**: 4s nhận ×0.5 dmg | **Phản âm**: sau khi chịu hit, phản 20 dmg |

**Công thức dmg người chơi (đúng):**  
`floor(ATK * comboMult * skillMult) + (secs<3 ? 10 : 0)`  
Sai (sau khi hết lượt G): hero mất `max(0, 20 - armor)` (+ tick riêng).

**Loại câu xoay mỗi 3 câu:** (1) Chọn nghĩa VI của Hán · (2) Chọn pinyin đúng · (3) Nghe/nhìn Hán chọn đáp án phát âm gần · (4 lặp). Tối đa **18** câu/stage (gồm retry câu sai).

---

## 6) Boss Hỗn Ngữ — 2 phase + chiêu có telegraph

| Phase | HP đoạn | Hành vi | Chiêu (tên) | Telegraph | Hiệu ứng |
|-------|---------|---------|-------------|-----------|----------|
| **I** | 400→200 (stage1) / cổng 550→275 (stage2) | Tick + chiêu nhẹ | **Loạn thanh** (乱声 · Luànshēng · *tiếng loạn*) | Vòng vàng **1.2s** + toast | 10 dmg (bỏ qua 50% giáp) |
| **II** | ≤50% HP | Nhanh hơn, phản sau combo | **Nuốt chữ** (吞字 · Tūnzì · *nuốt chữ*) | Boss rung + tối arena **1.5s** | 16 dmg + xoá combo nếu không đúng trong 3s |
| | | Ultimate 1×/phase2 | **Hỗn ấn** (混印 · Hùnyìn · *ấn hỗn*) | 3 nhịp đếm `3-2-1` trên đầu boss | 25 dmg; Linh Hồ CC có thể **chặn** nếu Đình ngôn đang active |

*Stage map Chapter 1: Stage1 boss HP **400** tick **10**/8s · Stage2 **550** tick **12**/8s (bảng §7). Boss Hỗn Ngữ = boss cuối chapter dùng bảng stage2 hoặc riêng 550.*

---

## 7) Bảng số (cân bằng)

| Tham số | Giá trị | Ghi chú / điều chỉnh |
|---------|---------|----------------------|
| Boss HP stage1 / stage2 | **400 / 550** | Giữ theo brief |
| Player HP (base trước class) | **100** | Class chỉnh §5 |
| Đúng / Sai | **50** ATK ref / **20** | ATK thực theo class; 50 = Kiếm Khách |
| Boss tick | **10 / 8s** (S1) · **12 / 8s** (S2) | Brief 10/8s — S2 +2 **GIẢ ĐỊNH** khớp v5 |
| Thời gian / câu | **10s** | Có số đếm ngược |
| Nhanh &lt;3s | **+10** dmg | Flat |
| Combo 3 / 5 | **×1.5 / ×2** | Shake + SFX |
| Hidden retry boss HP | **×1.0 / 0.9 / 0.8** | Thua 0/1/2+ |
| Retry câu sai | gộp hàng đợi, **≤18** câu/stage | |
| Session mục tiêu | **1–2 phút** / stage · Chapter 1 **~3–5 phút** | |
| Tutorial boss (30s) | **150 HP** **GIẢ ĐỊNH** | Cộng phần còn lại = 400 |

**Sim tham chiếu (Kiếm Khách, 60% acc, S1 400 HP, retry scale):**  
Kỳ vọng ~7 đúng / ~5 sai trên ~12 câu hiệu dụng + combo/fast → dmg kỳ vọng ≥400 trong ≤2–3 tries với hidden retry → target **≥70% win / 3 tries**. Linh Hồ/Thiết Vệ bù bằng heal/armor (cùng target).

---

## 8) Core loop 3 phút (giây-by-giây)

| Giây | Việc gì xảy ra |
|------|----------------|
| 0–2 | A: 1 nút Start |
| 2–6 | B: Q1 你好 |
| 6–10 | C: hit + flash + SFX + số bay |
| 10–14 | D: Q2 đúng → `2 liên tiếp!` |
| 14–18 | E: telegraph Loạn thanh |
| 18–24 | F: mất ≥1/3 HP boss → badge +1 tu vi |
| 24–28 | G: nếu sai lần 1 → fail mềm |
| 28–30 | H: tease + Zalo mờ |
| 30–50 | Q3–Q5; đổi **loại câu** ở Q4; combo xây |
| 50–70 | Phase check; tick đều; có thể skill hero |
| 70–90 | Boss ≤50% → Phase II telegraph Nuốt chữ |
| 90–120 | Đẩy DPS / heal / counter theo class |
| 120–150 | Câu retry sai; cliffhanger nếu gần thắng |
| 150–180 | Hạ boss hoặc thua → kết ngắn + **Chơi lại** 1 nút (không form) |

*Không màn hình zero-action &gt;3s* (trừ telegraph có countdown nhìn thấy).

---

## 9) Acceptance criteria tổng (Dev IT)

1. **First damage ≤10s** từ tap Start (A).  
2. **Không màn zero-action &gt;3s** (overlay nâng cấp kiểu v4 cấm lặp mỗi câu).  
3. Session stage **1–2 phút**; Chapter 1 chơi thử **≤5 phút**.  
4. Sim: mỗi class **≥70% win Stage1 trong ≤3 tries @ 60% accuracy**.  
5. Mọi Hán trên UI: pinyin có thanh + nghĩa VI.  
6. First 30s: đủ A–H theo bảng §2; **không** paywall/signup/IAP.  
7. Âm thanh WebAudio; rung `navigator.vibrate` khi hit/crit; 0đ asset.  
8. Đổi loại câu mỗi 3 câu; thưởng F đúng ngưỡng 1/3 HP.  
9. Boss chiêu có tên + telegraph ≥800ms.  
10. 1 file HTML chạy được qua `python -m http.server` offline-ish (CDN 3D optional; 2D fallback OK).

---

## 10) File liên quan
- Nhân vật media: `/workspace/game/v6_characters_for_media.md`  
- Audit shots: `/workspace/game/qa_shots/`  
- Marketing 30s: `/workspace/baokhua-marketing/30-giay-dau.md`  
- **Cấm:** sửa `game_v4.html` / `game_v5.html` trong task QA này — Dev implement `game_v6.html` mới.

=== BÀN GIAO ===  
Gửi: Dev IT · TGĐ (bản sao)  
File: `/workspace/game/v6_spec.md`  
Kèm: `/workspace/game/v6_characters_for_media.md`  
Hạn: characters 06:30 · spec 08:30 30/10 Asia/Saigon  
===
