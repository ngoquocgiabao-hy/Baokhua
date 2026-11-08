# Debut v3 + phim web từ bản 2K (08/11)

Nguồn: `BAO KHUA - SO CAI/07_TU_LIEU_VIDEO/copy_4C594368…MOV` (1440×2560, 60 fps, HEVC, 4:13, md5 dd1623be6c8d86d108a8ff6646ccf0e0) – chuyến bơi qua vịnh của Bảo, đã edit nhẹ trong CapCut.

Cảnh dùng được (giây trong bản gốc): thuyền chài 37,3–41,5 · 216–222 | Bảo nói giữa vịnh 181,0–184,3 | đảo đá 116–119,6 |
vách đá nhà bè 129–132 · 145–148,4 | Bảo bơi sát vách 133,3–136,9 (cắt viền đen CapCut: `crop=1384:2460`) | Bảo bơi giữa vịnh 138–142 (cắt viền) |
bình minh 172,3–176,5 | Bảo dưới nắng 111,9–115,5.
KHÔNG dùng: 0–10 s, 204–245 s (trẻ em) · 52–58, 84–90, 100–104 s (người đi cùng lộ mặt) · 184,5–193 s (mặt bị nhoè vỡ) · 70 s (mũi tên dán) · 47–51 s (chữ "OSMO ACTION 5 PRO" của camera ở mép trái).

- Phim web: `python3 loop.py <ra> 540 960 31 45 'goc.mov|37.6|3.2|-1' …` (9:16) và `… 1280 720 32 45 'goc.mov|37.6|3.2|1080' …` (16:9, y0 = dải ngang cắt từ bản gốc).
- Debut v3: các đoạn thật `clips/*.mp4` (1080×1920, 60 fps) → `noicanh.py render planA3/J3/C3.json` → chép vào `public/debut3/` cùng `secB.mp4` (chuỗi 3D của debut v2) và nhạc `../debut3_music.py` → `npx remotion render Debut3`.
