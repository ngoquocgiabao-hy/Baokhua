# game_v3 assets

- `battle3d.mjs` — procedural low-poly hero + boss (three.js), theo Media concept
- `QUESTION_FORMAT.md` — định dạng câu hỏi
- `ninja_tier*.jpg` / `boss_*.jpg` — copy concept Media (hiện màn start)
- `smoke_*.png` — ảnh smoke test headless (có thể xóa)

Chạy local (bắt buộc http vì ES module + importmap):

```bash
cd /workspace/game && python3 -m http.server 8000
# điện thoại cùng WiFi → http://<IP>:8000/game_v3.html
```

three.js: CDN pin `three@0.170.0` (0đ). Không GLB — model procedural khớp palette Media.

## Combat VFX (v3 combat pass)
Không chỉnh model. Thêm: trail/projectile/slash/AoE, hit-stop, knockback, shockwave, float dmg, level-up pillar, boss telegraph, vignette (UI).
Placeholder: `GOOGLE_FORM_LINK`, `ZALO_LINK` trong `game_v3.html`.
Backup trước pass: `/workspace/game/v3_backup/`.
