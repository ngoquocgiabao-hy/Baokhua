# Bảo Khựa 阿宝 · baokhua.com

Trang web và game học tiếng Trung giao tiếp cho người làm khách sạn, du lịch và nhà máy ở Hạ Long (lộ trình gợi ý HSK0 → HSK4).

- `index.html`: trang chủ.
- `khachsan.html`: game Khách sạn Bảo Khựa.
- `game.html`: game Đánh Boss "Hành trình HSK0 → HSK4".
- Chạy bằng GitHub Pages từ nhánh `main`. Không thư viện ngoài, mỗi trang là một tệp.

Người phát triển tiếp theo đọc theo thứ tự:
1. [`docs/BAN_GIAO.md`](docs/BAN_GIAO.md): hiện trạng, ưu tiên, quy trình, việc đang chờ.
2. [`CLAUDE.md`](CLAUDE.md): luật bắt buộc (nội dung, pháp lý, quy trình đăng).
3. Dự án chính, game Khách sạn mới: [`docs/khachsan/KE_HOACH_CHUYEN_MINH.md`](docs/khachsan/KE_HOACH_CHUYEN_MINH.md) và [`docs/khachsan/KAIZEN.md`](docs/khachsan/KAIZEN.md).
4. Game nhánh Đánh Boss: [`docs/TONG_KET_GAME_DANH_BOSS.md`](docs/TONG_KET_GAME_DANH_BOSS.md), kiến trúc mã ở [`docs/KY_THUAT_GAME.md`](docs/KY_THUAT_GAME.md).

Chạy thử:

```bash
python3 -m http.server 8765 --bind 127.0.0.1   # http://127.0.0.1:8765/game.html
bash tools/test/run-all.sh                      # kiểm thử tự động (Playwright)
```
