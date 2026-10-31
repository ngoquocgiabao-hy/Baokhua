# Proto3D B8 Report — Slow3G ≤8s + MID p5≥24 + audio pinyin

**Date:** 2026-10-30 (Asia/Saigon)  
**Request:** QA failed B7 (`QA_b7_report.md`) → build B8 from B7; B7 untouched; **no deploy**  
**Deliverable:** `/workspace/game/proto3d_b8.html` + `/workspace/game/b8/`

## Paths & MD5

| File | MD5 |
|------|-----|
| `proto3d_b8.html` | `91497949ab7f31134371154cd19e6940` |
| `proto3d_b7.html` | `001bd77f6fd10056abc0c08eb7d442ae` (**untouched**) |
| `proto3d_b8.mp4` | `48c19d9f9e2c2b1cb145a57bb41d7ed1` (720×1280, 12fps, 10s, `?rec=1`) |
| `proto3d_b8_combat.png` | `e6c229601127c1065fe80854934810c2` |
| `proto3d_b8_question.png` | `8c963f58ec4f5679675293a4069b44b3` |
| `proto3d_b8_ultimate.png` | `c56262ca7e1c37b000fdb4ac355ed8e2` |
| `proto3d_b8_lowmana.png` | `10c9ecdef5b5ac8bcfd29c3516f9c56e` |
| `proto3d_b8_idle.png` | `babe6a5ab165aa11903f44c32f46aac6` |
| `CREDITS.txt` | `1c143e94a9984a54ea572f0b870cb184` |
| `B8_REPORT.md` | (this file) |
| `B8_MD5s.txt` | full list |
| Vendor pack `b8/` | **~1.39 MB** (`1460215` bytes) + HTML `14851` → **~1.41 MB** total ≪ 3MB |

## Blockers fixed (vs QA_b7)

### 1) Slow 3G time-to-playable ≤8s

**Method:** Playwright Chromium + CDP `Network.emulateNetworkConditions` Slow 3G (500 kbps / 400 ms RTT), viewport 360×640. Playable = `__PROTO3D.ready && fps>0`.

| Serve mode | Wall time-to-playable | Pass ≤8s |
|------------|----------------------|----------|
| Plain HTTP (no Content-Encoding) + **client gunzip** of `three.module.min.js.gz` | **6.14 s** | **YES** |
| Gzip-capable server (`Content-Encoding: gzip`) | **4.91 s** | **YES** |
| B7 baseline (QA) | 25–33 s | NO |

**How:**
- Bootstrap (classic script) fetches `b8/three.module.min.js.gz` (~171 KB), decompresses with `DecompressionStream`, injects importmap, then loads `b8/app.js`.
- First playable frame uses **procedural** hero/boss (no GLB wait); GLBs lazy-load with **meshopt** (`EXT_meshopt_compression`) + local `meshopt_decoder.module.js`, then swap in.
- Addons (Water/composer/GLTF) dynamic-import after ready.

### 2) MID p5 ≥24 · LOW tier rules

**Method:** 360×640, CPU throttle **4×**, quality **locked** via `__PROTO3D.lockQuality(true)` + `setQuality(level, true)`, ~22s sample after settle (same stack QA used).

| Tier | avg | p5 | pixelRatio | bloom | waterReflect | shadows | outlines |
|------|-----|-----|------------|-------|--------------|---------|----------|
| HQ (locked) | 29.8 | 20.0 | 1.0 | on | on | on | on |
| **MID (locked)** | **54.4** | **28.6** | **1.0** | **off** | on | off | off |
| **LOW (locked)** | **65.9** | **40.3** | **0.75** | **off** | **off (flat)** | **off** | **off** |

MID p5 **28.6 ≥ 24** — **PASS**. LOW matches requested: PR 0.75, no bloom/outline, flat non-reflective water, no shadows.

### 3) Audio pinyin

- When zh-CN (or zh-*) voice listed: `#qZh=🔊`, `#qPy` **hidden**, “Nghe lại” button.
- When no zh voice: show chữ Hán + pinyin fallback hint.
- Nghĩa / giải thích only in `#qReveal` after answer.

## Save / offline

- `localStorage` key `halong_proto_b8`, `schema: 1`
- Vendor self-contained under `b8/` (three MIT + Quaternius CC0 + meshopt decoder MIT)

## Self-check

- [x] Slow3G ≤8s (client gunzip + server gzip)
- [x] MID p5 ≥24; LOW PR 0.75 / flat water / no shadows / no bloom / no outline
- [x] Audio hide `#qPy` when TTS voice available
- [x] Screenshots + 9:16 mp4
- [x] CREDITS + MD5s + this report
- [x] b7 untouched (`001bd77f6fd10056abc0c08eb7d442ae`)
- [x] **No deploy**
