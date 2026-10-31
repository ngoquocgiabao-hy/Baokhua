# BÀN GIAO Proto3D B4 (Media polish + ?rec=1) · 2026-10-30 07:56 Asia/Saigon
**KHÔNG deploy**

## MD5
| File | MD5 |
|------|-----|
| proto3d_b4.html | `97dfbb0e2ea5742d85a95a209d692883` |
| proto3d_b4.mp4 (9:16 ?rec=1) | `2f04d06758d6be94b097a51ad32b23f2` |
| proto3d_b3.html | `3532ff1675e33ea1b274c6dfc457226e` |
| proto3d_b2.html | `a42777b736ec9afdbc9313325dc23e36` |
| CREDITS.txt | `c86be2d4f9df0e8011b8c0b1676c18d0` |
| cau_hoi_v7.json | `e04b08aaaa071113fb73fc4659ede399` |

Shots (self-review): `proto3d_b4_loading.png`, `_idle.png`, `_run.png`, `_attack.png`, `_seaview.png`, `proto3d_b4.png`

## Media fixes (critical)
- **Hero:** Quaternius `platformer_game_pack/Character.glb` (CC0) — 18 clips; AnimationMixer Idle/Run/Punch (not A-pose). Local `v7/glb/hero_character.glb`.
- **Boss:** Enemy.glb animated Idle + Bite on telegraph; in bay encounter.
- **Toon:** MeshToon keeps original vertex/texture colors (no flat cyan wipe).
- **Scene:** Water + seabed teal + multi-layer karst + fog + sky gradient; small islet (not full brown ground).
- **Camera:** raycast collision vs near/mid karst; default φ≈52° cinematic.
- **Loader:** art gradient + title **Hạ Long Ngữ Tiên** + progress bar; min ~1.4s; no “Đang tải GLB”.
- **?rec=1:** hides FPS, HQ, WASD/info hints.
- **Audio:** v7/audio/*.ogg (tự tạo từ v6) — BGM loop + hit/slash/hurt/ui/win; listed in CREDITS.txt. Kenney CC0 packs cited as optional replacements.
- **HSK:** footer disclaimer. No PvP/raids/server.

## Play
`proto3d_b4.html?rec=1` for clean capture.

## CHỦ DUYỆT
Gửi QA/Media. **Không deploy.**
