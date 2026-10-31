# Proto3D B9.1 — Perf + smooth controls + UI polish

**Date:** 2026-10-30 (Asia/Saigon) · **From:** B9 (untouched) · **Deploy:** none

## FPS before → after (360×640 · CPU 4× · SwiftShader · locked tier · ~20s)

| Tier | B9 avg / p5 | B9.1 avg / p5 |
|------|-------------|---------------|
| LOW  | 61.1 / 45.1 | 58.3 / 43.6 (cap ~60) |
| MID  | 32.5 / 23.2 | **45.6 / 29.9** |
| HQ   | 20 / 20*    | 20 / 20* |

\*SwiftShader + bloom floor ~20; not a phone GPU.

## Changes
1. **PERF:** default LOW (PR 0.75); step UP only if avg5>55; PR hard-cap 1; flat water until HQ; fewer karsts/lights; 60fps cap; pause when hidden; zero-alloc FPS sort; skip Water/composer until HQ.
2. **CONTROLS:** deadzone 0.14 + accel/decel easing; ≥48px knob; instant auto-attack on release; short vibrate on hit.
3. **UI:** safe-area insets; cleaner palette; crisp HP/combo; question card bottom ⅓ + blur panel; LOW badge top-right (no overlap).
4. **QA:** first kill soft-capped until 8s + HP 340 → Tu vi **8.28s** (was ~3.3s).

Kept: `?fps=1`, `?rec=1`, schema:1 (`halong_proto_b9_1`), CREDITS, HSK disclaimer, pinyin fallback, 答题.

## Paths
`proto3d_b9_1.html` + `b9_1/` · zips `/workspace/b9_1_test.zip`, `/workspace/b9_test.zip` · mp4 `proto3d_b9_1.mp4` · shots `proto3d_b9_1_{start,joystick,question,burst,tuvi,fps_LOW}.png` · `qa_shots/b9_1/`
