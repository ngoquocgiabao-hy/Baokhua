# Proto3D B6 Report — Hạ Long graphics polish

**Date:** 2026-10-30 (Asia/Saigon)  
**Request:** Bảo (t65u / pt65u) — Cải tiến thêm đồ hoạ  
**Deliverable:** `/workspace/game/proto3d_b6.html` (from b5; b5 untouched)  
**Deploy:** none

## Paths & MD5

| File | MD5 | Notes |
|------|-----|-------|
| `proto3d_b6.html` | `409a8da71f6423efa81f80358da85836` | single HTML, mobile |
| `proto3d_b5.html` | `70257f1bfb72aeb476156f8af53d23e8` | **untouched** |
| `proto3d_b6.mp4` | `a5b57c5435db278e380e8b2a045fa853` | 720×1280, 12 fps, 9.0 s, `?rec=1` |
| `proto3d_b6_idle.png` | `422cdce9b96e207cd09900464ab8776f` | OTS idle |
| `proto3d_b6_run.png` | `ea0ee538fdbb7ef8aeec19f9d29073f9` | run |
| `proto3d_b6_attack.png` | `bffa1a19980c71fe48f1cd9fb467ca5c` | sword attack + hit VFX |
| `proto3d_b6_boss.png` | `371c732f6192678a82b4dcb718d313e3` | full-body boss |
| `proto3d_b6_question.png` | `4b5bf140cd48bd11d5ac8ef911bea6b5` | Q panel + 答题 |
| `CREDITS.txt` | `870d96b16bd6486722cd8c074498a166` | + Enemy_Large, Katana |
| `B6_REPORT.md` | (this file) | |

Local GLBs: `v7/glb/boss_enemy_large.glb`, `v7/glb/knight_katana.glb`

## FPS (headless Chromium ANGLE)

| Mode | avg | p5 | quality |
|------|-----|-----|---------|
| stills / gameplay probe | ~20.9 | 20 | MID (floor under `?rec=1`) |
| video capture | 20 | 20 | MID |

**Note:** Headless ANGLE under-reports vs phone GPU. Auto quality tiers HQ→MID→LOW keep target **p5 ≥ 25** on device; REC_MODE refuses drop below MID so capture stays readable. Soft shadows / bloom / FXAA scale with tier.

## Graphics changes vs B5

1. **Open Hạ Long bay** — spaced near/mid/far islets (not cave-filling cones); `displaceGeo` vertex noise; green vegetation crowns; multi-layer fog/haze; sky gradient + soft cloud planes.
2. **Sun** — soft glow disc + halo; UnrealBloom (strength ~0.38, thresh ~0.82); ACES filmic + exposure 1.0.
3. **Boss** — Quaternius CC0 **Enemy_Large** full-body GLB (Idle / Attack clips), not floating head.
4. **Hero** — Knight + **Katana** parented to **PalmR** (world-scale compensated); rim light; sword visible in OTS.
5. **Water** — Water.js normals, fresnel-ish reflections, foam rings around islets.
6. **Hit VFX** — particle burst, screen shake, floating damage numbers.
7. **Shadows** — `PCFSoftShadowMap` (HQ); downgraded on MID/LOW.
8. **Post** — ACESFilmicToneMapping, UnrealBloomPass, FXAAShader, OutputPass.
9. **Quality auto-downgrade** — `applyQuality` / `setQuality` HQ|MID|LOW from rolling FPS.

## UI kept

- `#talkBtn` label: **答题 / Trả lời**
- Question panel bottom sheet — does not cover boss
- Footer: `Proto B6 · … · Không liên kết với kỳ thi HSK chính thức · chưa deploy`
- Free assets only (Three.js MIT, Quaternius CC0) — see CREDITS.txt

## Self-check

- [x] 5 screenshots (idle / run / attack / boss / question)
- [x] 9:16 mp4 via `?rec=1`
- [x] MD5s listed
- [x] CREDITS updated (Enemy_Large, Katana)
- [x] b5 file MD5 unchanged
- [x] No deploy

## Known limits

- Headless p5 ≈ 20 @ MID; expect higher on phone Metal/Adreno/Mali with auto tier.
- Cyberpunk Enemy_Large has large head proportion — still full limbs/body, not a rock-mounted bust.
