# Proto3D B9 Report — 1-finger Archero controls + 10s script

**Date:** 2026-10-30 (Asia/Saigon)  
**Spec:** `b9_cai_tien.md` items **1+2+3** + **10 giây đầu** + **KỸ THUẬT** only (NOT 4/5 → b10)  
**From:** B8 (untouched) · **Deploy:** none · **Assets:** free CC0/MIT only

## Paths & MD5

| File | MD5 |
|------|-----|
| `proto3d_b9.html` | `f0cb9139a64118822c2e4956092b562f` |
| `proto3d_b8.html` | `09a1c5fd610aff2c8f3fe0d76625ffd3` (**untouched**) |
| `proto3d_b9.mp4` | `594a3bce340029c4d023565effb29571` (9:16 · first 10s · `?rec=1`) |
| `proto3d_b9_start.png` | `934646d0af942f2eb9047230d9f910f4` |
| `proto3d_b9_joystick.png` | `f1488b01ef019c0e599fdd868dacfc8f` |
| `proto3d_b9_question.png` | `9447555de9d8838f5bf3ffc507a14cf5` |
| `proto3d_b9_burst.png` | `309195be1899e89e8ce4171033dfe8f6` |
| `CREDITS.txt` | `016af85807bdae79c3207b63afb7b590` |
| Vendor `b9/` | ≤3MB (copied from b8 + app.js) |

## What shipped (b9 only)

1. **Controls:** portrait 1-finger; touch-anywhere floating joystick; release → auto-aim + auto-attack nearest enemy **6m**; fixed **45°** top-down camera (no rotate/pinch); right thumb **Chiêu 80px** + **ULT ≥64px**; **答题 / Trả lời**; questions bottom ⅓; correct → refill nội năng; hand **kéo để chạy** 3s only.
2. **Graphics:** water floor + karst side frame (no big sky); high contrast; **red ring under enemy** (not outline); minimal UI HP+combo; LOW badge top-right (no overlap with HSK hint).
3. **Character:** Quaternius run/attack; big damage numbers on correct-answer skill.
4. **10s script:** fight immediate → 3s `你好 nǐ hǎo` → correct = burst + vibrate + zh TTS → enemy down ~8–10s → **Tu vi +1**.
5. **KỸ THUẬT:** red foot ring; LOW budget (≤25 enemies reserved; instancing deferred to b10 waves).

Kept: `?fps=1`, `?rec=1`, `halong_proto_b9` schema:1, HSK disclaimer, pinyin fallback.

## Acceptance self-check

| Metric | Result |
|--------|--------|
| LOW p5 (360×640 CPU4× locked) | **avg 61.7 / p5 49.5** ≥24 ✓ |
| Draw calls | **36–67** ≤100 ✓ |
| Triangles | **~7k–14k** ≤100k ✓ |
| Size | ≪ 3MB ✓ |

## Not in B9 (→ b10)

Item 4 waves/boss telegraphs multi-wave · Item 5 level-up cards.
