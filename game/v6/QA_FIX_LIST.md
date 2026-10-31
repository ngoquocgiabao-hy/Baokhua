# QA v6 fixes (post QA_v6_report)

## RED
1. **Skills wired** — `CLASS_SKILLS` + `#btnSkill`; sets `_stunBossUntil`, heal +25, Liên cú ×1.25, Đột kích +15, Giáp xưởng 4s ×0.5, Phản âm reflect 20. Verified in Playwright.
2. **Balance** — Monte Carlo 1000×/class @60% ≤3 tries (see SIM_TABLE.md): LH **84.5%** · KK **75.1%** · TV **83.4%** (band 72–85). Stage1 boss HP 500 (tut 180). LH HP125 ATK43; KK HP105 ATK53; TV armor 6.

## YELLOW
3. **classArmor on wrong** — `WRONG_DMG - armor*6 - floor(classArmor*0.5)` + Giáp mult.
4. **optionPy/optionVi** on all v6 `bat_loi`/`hai` (hidden until `.opts.revealed`).
5. **Stem pinyin visible** while asking (Q1 shows nǐ hǎo · Xin chào).
6. **RETRY_SCALE** on tutorial + 1b remain.
7. **Slow 3G** — Howler non-blocking (`__loadHowler` async + 2.5s timeout); WebAudio SFX always; webp art; no early three CDN. **~4.3s** to `__bao` (was ~46s).

## Art
Official heroes in `v6/art/*.webp` (from battle PNG); `ART.placeholder=false`.
