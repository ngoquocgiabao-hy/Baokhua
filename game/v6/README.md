# Hạ Long Ngữ Tiên — game v6

- File: `/workspace/game/game_v6.html` (+ `/workspace/game/v6/`)
- Spec: `/workspace/game/v6_spec.md` · Checklist: `SPEC_ACCEPTANCE.md`
- localStorage: `baokhua_game_v6` (+ `tuVi`)
- **KHÔNG deploy** khi chưa anh Bảo duyệt

## Juice / boredom fixes
1. 1 nút `Thử hạ Boss Lễ Tân` → vào trận ngay (không Hub/Map)
2. Timer **10s**/câu · bar đỏ 3s cuối
3. ATK class (Kiếm Khách 50) · combo ×1.5/×2 · NHANH +10 · shake/hit-stop
4. **Không** modal nâng cấp mỗi câu
5. Boss tick 8s + telegraph ≥800ms (乱声) · xoay loại câu mỗi 3

## Art
Swap files in `v6/art/` (see `ART_MANIFEST.json`). Placeholders until official hero art arrives.

## Local
```bash
cd /workspace/game && python3 -m http.server 8765
# http://127.0.0.1:8765/game_v6.html
```
