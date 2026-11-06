# Nền chuyển động sân đấu (Remotion)

Video nền lặp 6 giây cho 5 sân đấu của `game.html`, dựng bằng [Remotion](https://www.remotion.dev) (React → video).
Mỗi sân: ảnh nền `v4/bg/<kiểu>.jpg` + máy quay trôi chậm, tia sáng, bụi lấp lánh và hiệu ứng riêng:
- sảnh khách sạn: đèn chùm lấp lánh;
- nhà máy: hơi nước, lò hắt sáng;
- KCN đêm: đèn pha quét, sương xanh, neon;
- Hắc Ninja: sương tím xoáy, chớp.

Mọi chuyển động tuần hoàn theo vòng lặp nên video nối liền khi lặp.

- Sửa cảnh: `src/ArenaBg.tsx` (bảng `THEME`, các khối `Factory`, `Night`, `Shadow`, `Sparkle`). Xem thử: `npm i && npm run studio`.
- Xuất lại: `bash render.sh` → `v4/motion/<kiểu>.mp4` (mỗi tệp ≈ 130–175 KB) + `.webm` dự phòng.
- Trong game: `MOTION_BG` (đầu game.html) bật/tắt. Không phát được video hoặc máy bật "giảm chuyển động" thì dùng ảnh tĩnh.
- Giấy phép Remotion: cá nhân và nhóm tối đa 3 người được dùng mà không cần mua giấy phép công ty. Đội đông hơn cần mua giấy phép (xem remotion.pro/license) trước khi tiếp tục dùng để dựng video.
