# Proto3D B7 Report — Liên Quân combat + offline + lag fix

**Date:** 2026-10-30 (Asia/Saigon)  
**Request:** Bảo playtest b6 (t66u / pt66u) + steering QA (self-host ≤3MB, localStorage schema, zh speech fallback, ≥30fps target)  
**Deliverable:** `/workspace/game/proto3d_b7.html` (from b6; b6 untouched)  
**Deploy:** none

## Paths & MD5

| File | MD5 |
|------|-----|
| `proto3d_b7.html` | `001bd77f6fd10056abc0c08eb7d442ae` |
| `proto3d_b6.html` | `409a8da71f6423efa81f80358da85836` (**untouched**) |
| `proto3d_b7.mp4` | `253cf083887553bf311110048ebc7a6a` (720×1280, 12fps, 10s, `?rec=1`) |
| `proto3d_b7_combat.png` | `38b625165d7b4567e27c9f4e2b7a37a8` |
| `proto3d_b7_question.png` | `3c0977bae9e73124493f3ae2efefda75` |
| `proto3d_b7_ultimate.png` | `cb609f912826b443e2d8d215a76ebe6b` |
| `proto3d_b7_lowmana.png` | `e00ded86ad015cd55d1298a45df89087` |
| `proto3d_b7_idle.png` | `49d7df4b3cbbef0971f1e6244bec4d70` |
| `CREDITS.txt` | `fdae6196877be0632ca235756bf9c41b` |
| `B7_REPORT.md` | (this file) |
| Vendor pack `b7/` | **1.732 MB** (≤3MB) — `1815801` bytes |

## Offline vendor (`/workspace/game/b7/`)

Relative imports only (importmap → `./b7/three.module.min.js`, `./b7/addons/`).  
GLB/audio/waternormals local. No CDN at runtime. three.js MIT + Quaternius CC0.

## Gameplay (vs B6)

1. **MOBA controls:** left joystick; right ATK + S1/S2/S3 (cooldown rings) + ULT.  
2. **Nội năng** bar under HP; skills spend mana; empty → question refill (correct=full, wrong=+12).  
3. **Ultimate:** HARD `do_kho>=3` question; card scale/fade/glow **in → answer → full out**; **then** cinematic (orbit zoom, slow-mo, slash arcs, light pillar, flash, big dmg). Q never overlaps ult VFX.  
4. **Boss AI:** chase, red ground telegraph (dodgeable), HP, hit reactions.  
5. **Road riddles:** `b7-rid-*` longer items; every Chinese line has pinyin + Vietnamese.  
6. **localStorage** `halong_proto_b7` with `{ schema: 1, ... }`.  
7. **speechSynthesis zh-CN**; if no zh voice → show chu_han + pinyin (no fake audio).  
8. UI kept: **答题 / Trả lời**, HSK disclaimer, Proto B7 footer.

## Lag — before / after (headless ANGLE 720×1280, MID, ?rec=1)

| Build | steady avg | p5 | notes |
|-------|------------|-----|-------|
| B6 baseline | **21.3** | 20 | stutter felt by Bảo |
| B7 steady | **33.7** | 20 | warm combat ~47 avg earlier |

Headless p5≈20 is ANGLE floor; phone GPU + auto HQ→MID→LOW targets **≥30**.  

**Stutter causes addressed:**
- pixelRatio hard-capped ≤1.5, default **MID** on mobile  
- shadow map 512→256/128; shadows HQ-only  
- fewer karst draws / vegetation; far layer hideable on LOW  
- **particle + damage-number pools** (no per-hit alloc/GC)  
- FPS ring buffer (less GC than `shift`/`slice().sort` every frame)  
- `renderer.compile` + warm burst before play (first skill/ult hitch)  
- bloom/FXAA **disabled on LOW**; FXAA HQ-only  
- offline local assets (no CDN hitch)

## Self-check

- [x] Screenshots: combat / question / ultimate / low-mana / idle  
- [x] 9:16 mp4 skill → mana Q → ult  
- [x] MD5s, CREDITS, vendor size  
- [x] b6 untouched, no deploy  
