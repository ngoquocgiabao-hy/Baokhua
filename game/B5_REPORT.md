# Proto3D B5 — Media fix report

**Deadline buffer:** before 19:00 Asia/Saigon · **chưa deploy**

## Deliverables
| File | MD5 |
|------|-----|
| `proto3d_b5.html` | `70257f1bfb72aeb476156f8af53d23e8` |
| `proto3d_b5.mp4` (720×1280, 12fps, 10s, `?rec=1`) | `40754ffac813c14c047d1ea3f1a7d2db` |
| `proto3d_b5_idle.png` | `ac1d724aee9610bbbadddf5fca1e57b2` |
| `proto3d_b5_run.png` | `fdef086ac18619ea66c750bb34f91ea1` |
| `proto3d_b5_attack.png` | `934780a24984456ee9d8b17a0e8eaef0` |
| `proto3d_b5_boss.png` | `a26317b517c177311d9cfea4575c5c37` |
| `proto3d_b5_question.png` | `71c5fafa5546fe4d533871b827f30f40` |
| `CREDITS.txt` | `3ec1202d8fcee208791e22e2d9c1160e` |
| `cau_hoi_v7.json` | `e04b08aaaa071113fb73fc4659ede399` |

Earlier `proto3d_b2.html` / `b3` / `b4` (+ `b4.mp4`) kept.

## Runtime (playwright capture)
- **avg FPS** ≈ **58.6** · **p5** ≈ **28.1** · instant ≈ 24 (during screenshot loop)
- Hero height **1.7** · clips: Idle_swordRight / Run_swordRight / Run_swordAttack (+…)
- Console: no pageerrors on capture path

## Fixes vs B4 reject
1. **Hero:** Quaternius KnightCharacter CC0 (humanoid swordsman), Idle/Run/sword-slash clips; scale ~1.7m. Separate Sword.glb not scene-parented (oversized slab); pose via sword anims. Credits updated.
2. **Camera:** OTS φ≈80°, dist≈8.2, height≈3.85, FOV 58; hero ≤25% screen, slightly left via shoulder; look ahead to boss corridor.
3. **Composition:** horizon + sun disc; multi-layer Hạ Long karsts (near/mid/far, green crowns); boss on rock ahead (−Z); hero on rocky islet + wooden deck (not mirror water).
4. **Water:** teal-jade, lower distortion/reflectivity; foam ring near islet.
5. **Q panel:** bottom, max-height 28vh — does not cover boss head.
6. **UI:** `#talkBtn` **答题** / **Trả lời** (no 问问). `?rec=1` clean chrome.

## Self-check
Idle/run/attack/boss/question screenshots reviewed: humanoid knight on deck, boss ahead, karst layers + golden sun, teal sea, Q panel clear of boss. Acceptable polished mobile anime-toon proto for B5 (not production art).
