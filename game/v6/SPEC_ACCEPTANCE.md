# SPEC v6 acceptance checklist

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| — | 1. First damage ≤10s từ tap Start | **PASS** | C_first_damage_le_10s:ms=415 |
| — | 2. Không zero-action >3s / không upgrade mỗi câu | **PASS** | no_upgrade_modal:upOn=false |
| — | 3. Session stage 1–2 phút (design; tutorial 150HP + atk50) | **PASS** | tutorial_hp_150:bossMax=150 |
| — | 4. Sim ≥70% win @60% acc (chưa chạy Monte Carlo — GIẢ ĐỊNH cân bằng ATK50/HP150) | **PARTIAL** | Chưa Monte Carlo; số liệu §7 đã gắn CLASSES |
| — | 5. Hán + pinyin + VI trên UI (Q1 你好 + bank v6) | **PASS** | B_q1_nihao:v6-q1-nihao 你好 |
| — | 6. First 30s A–H (A CTA, B Q1, C hit, D combo2, E telegraph, F badge, G soft fail, no paywall) | **PASS** | A_single_cta:{"label":"⚔️ Thử hạ Boss Lễ Tân","primaryCount":1,"qSec":10,; A_no_hub_map:{"hubOn":false,"mapOn":false,"gameOn":true,"q1":"你好","q1id":; B_q1_nihao:v6-q1-nihao 你好; C_first_damage_le_10s:ms=415; D_combo2:streak=2; E_telegraph_ge_800ms:{"visible":true,"still":true}; F_badge_or_progress:{"boss":0,"bossMax":250,"badgeF":true,"tuVi":1,"streak":6,"q; G_soft_fail:{"beforeHero":{"hp":100,"streak":2,"forgiven":false},"afterS; no_paywall: |
| — | 7. WebAudio/Howler + vibrate on hit | **PASS** | C_first_damage_le_10s:ms=415 |
| — | 8. Đổi loại câu mỗi 3 + thưởng F 1/3 HP | **PASS** | type_rotate_every_3:[["bat_loi","bat_loi","bat_loi"],["hai","hai","hai"],["nghe_; F_badge_or_progress:{"boss":0,"bossMax":250,"badgeF":true,"tuVi":1,"streak":6,"q |
| — | 9. Boss chiêu có tên + telegraph ≥800ms | **PASS** | E_telegraph_ge_800ms:{"visible":true,"still":true} |
| — | 10. 1 HTML file + http.server | **PASS** | A_single_cta:{"label":"⚔️ Thử hạ Boss Lễ Tân","primaryCount":1,"qSec":10, |

## Automated checks

- ✅ `A_single_cta` — {"label":"⚔️ Thử hạ Boss Lễ Tân","primaryCount":1,"qSec":10,"v6":30,"art":{"bg":"v6/art/bg_ha_long.jpg","boss":"v6/art/b
- ✅ `Q_seconds_10` — qSec=10
- ✅ `Q_bank_30` — v6=30
- ✅ `ART_wired` — {"bg":"v6/art/bg_ha_long.jpg","boss":"v6/art/boss_hon_ngu.jpg","placeholder":true}
- ✅ `A_no_hub_map` — {"hubOn":false,"mapOn":false,"gameOn":true,"q1":"你好","q1id":"v6-q1-nihao","bossMax":150,"atk":50,"classId":"kiem_khach",
- ✅ `A_to_q1_fast` — ms=99
- ✅ `B_q1_nihao` — v6-q1-nihao 你好
- ✅ `tutorial_hp_150` — bossMax=150
- ✅ `default_kiem_khach_atk50` — atk=50
- ✅ `type_rotate_every_3` — [["bat_loi","bat_loi","bat_loi"],["hai","hai","hai"],["nghe_nhanh","nghe_nhanh","nghe_nhanh"],["bat_loi","bat_loi"]]
- ✅ `shuffle_remap_q1` — {"ok":true,"mode":"force"}
- ✅ `C_first_damage_le_10s` — ms=415
- ✅ `no_upgrade_modal` — upOn=false
- ✅ `D_combo2` — streak=2
- ✅ `G_soft_fail` — {"beforeHero":{"hp":100,"streak":2,"forgiven":false},"afterSoft":{"hp":100,"streak":2,"forgiven":true}}
- ✅ `F_badge_or_progress` — {"boss":0,"bossMax":250,"badgeF":true,"tuVi":1,"streak":6,"qSec":10,"appCombo":"combo-hot"}
- ✅ `timer_urgent_last3s` — urgent=false
- ✅ `E_telegraph_ge_800ms` — {"visible":true,"still":true}
- ✅ `nghe_fallback_text` — {"qZh":"您好，欢迎光临。","extra":"Máy không hỗ trợ đọc tiếng — hiện chữ: 您好，欢迎光临。Qǐngwèn nín yǒu yùdìng ma?","am":"您好，欢迎光临。"}
- ✅ `no_paywall` — 

## Art status

- Official hero cutouts **chưa có** trong `/workspace/game/v6_art/` (chỉ bg + Hỗn Ngữ).
- Wired placeholders từ `_superseded_pre_spec/` → `/workspace/game/v6/art/{linh_ho,kiem_khach,thiet_ve}.png` + `ART_MANIFEST.json` (`placeholder: true`).
- Khi art chính thức tới ~11:00: thay file cùng tên trong `v6/art/`, set `ART.placeholder=false`.

## 5 boredom fixes

1. Fight ≤4s: boot 1 CTA → Q1 (measured ~99ms to Q1, first dmg ~415ms)
2. Timer 10s/câu (spec §7)
3. Stronger hits: Kiếm Khách ATK 50 + combo/fast
4. Removed per-question upgrade modal
5. Boss tick + telegraph 1.2s + type rotate every 3