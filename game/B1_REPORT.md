# B1 Report — Proto 3D Vịnh Hạ Long (30/10/2026 Asia/Saigon)

## Files
| File | MD5 | Note |
|------|-----|------|
| `/workspace/game/proto3d.html` | `4d0ee488e55524ad5db4a97dfb648593` | 1 file HTML · Three.js r170 · anime toon |
| `/workspace/game/proto3d.mp4` | `044bb1f71c5bfe3ca03d438f1378d8b1` | 720×1280 · ~28.7s |
| `/workspace/game/proto3d_b1.png` | — | scene shot |
| `/workspace/game/proto3d_b1_after.png` | — | after move/orbit/Q |
| `/workspace/game/CREDITS.md` | — | CC0/MIT sources |
| `/workspace/game/cau_hoi_v7.json` | `760ba2fdcdbc059f23c07392e74dc1c1` | also embedded in HTML |

## FPS (headless Chromium, 720×1280, touch)
- avg **41.6** · p5 **34.4** (live avg 42.3 / p5 34.2) — đạt ≥30
- Auto quality: HQ→MID→LOW nếu avg <30 trong 3s (pixelRatio/bloom/fog)

## B1 verified
- Water addon (reflection + waves) + Fog + golden-hour sun `#FFB347`
- MeshToonMaterial + inverted-hull outline
- UnrealBloomPass (mobile-safe, toggle)
- Karst layers near/mid/far + parallax
- Joystick trái · vuốt phải orbit 360° · pinch zoom 4–12m · WASD/chuột
- Skill button bloom burst
- `CAU_HOI_V7` 30 câu embedded; text=chu_han+pinyin; audio=TTS am_thanh; nghia/giai_thich chỉ sau trả lời; shuffle dap_an; buildStagePool stage3 50/50

## Chưa (B2–B4)
- B2: GLB Quaternius/Kenney thay placeholder hero
- B3: combat loop gắn đủ balance v6/v7
- B4: particle chiêu theo class đầy đủ

## Phone test (box http.server không ra ngoài)
1. Airdrop / Zalo / Drive gửi `proto3d.html` vào máy anh
2. iOS: Files → mở bằng Safari (hoặc 1 HTML viewer); Android: Chrome mở file
3. Cần mạng lần đầu để tải three.js CDN jsDelivr
4. Hoặc: máy anh `python3 -m http.server` trong thư mục chứa file rồi mở `http://<IP-LAN>:8000/proto3d.html`
