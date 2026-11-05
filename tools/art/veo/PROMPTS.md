# Làm nhân vật cử động thật bằng Google Flow / Veo (gói Google AI Pro)

Khung đầu nền xanh lá trong thư mục này (`hero1..3.jpg`, `<boss>-idle.jpg`) cắt từ chính hình nhân vật trong game, nên video ra giữ đúng mặt, áo, màu.

## Cách làm (khoảng 2 phút mỗi video)
1. Mở Google Flow (labs.google/flow), đăng nhập tài khoản có gói Google AI Pro, tạo dự án mới.
2. Chọn **Frames to Video** (khung hình → video), tải lên ảnh khung đầu, ví dụ `hero1.jpg`.
3. Dán **câu lệnh chung** + **câu lệnh hành động** ở dưới (tiếng Anh cho Veo hiểu chuẩn nhất).
4. Chọn chế độ Fast để tiết kiệm credit, tỉ lệ 16:9. Bấm tạo, chọn bản đẹp nhất, tải MP4 về.
5. Đặt tên file theo dạng `<nhân vật>-<hành động>.mp4`, ví dụ `hero1-atk.mp4`, `factory-idle.mp4`, rồi bỏ vào Drive `04_GAME/VEO_KHUNG_DAU_05-11`.
6. Báo Xưởng "đã có video". Xưởng chạy `tools/art/video2sheet.py` để tách nền và cắt khung, rồi nối vào trận đánh.

Ưu tiên làm trước: `hero1-atk`, `hero1-idle`, và cho mỗi boss `-atk` và `-idle`. Sau đó làm `-hit` và `-ko`.

## Câu lệnh chung (dán vào đầu mọi lệnh)
```
Keep the exact same character design, face, outfit, colors and proportions as the input image.
Camera locked off: no camera movement, no zoom, no cuts. Side view, full body always inside the frame, feet stay on the same ground line.
Flat solid pure green (#00FF00) background that stays perfectly uniform the whole time: no shadows on the background, no floor, no props, no particles, no text.
Smooth, snappy 2D anime fighting-game animation. No music, no speech.
```

## Câu lệnh hành động
| File | Câu lệnh hành động |
|---|---|
| `<ai>-idle` | `The character breathes gently in a fighting-ready stance, shifts weight slightly from foot to foot and blinks. Subtle natural idle movement. It ends in exactly the same pose it started in, so the clip loops seamlessly. 3 seconds.` |
| `hero*-atk` | `The young ninja steps forward and throws a spinning shuriken with a fast, powerful arm swing, follows through, then hops back into his ready stance.` |
| `hero*-skill` | `The young ninja crouches, leaps up and performs a spinning flying kick toward the right, lands and strikes a confident pose.` |
| `trainee-atk` | `The young receptionist steps forward and swings her folder in a quick scolding strike, then steps back and holds the folder to her chest again.` |
| `hotel-atk` | `The strict hotel receptionist points sharply forward with an angry expression, steps in and slaps her hand down as if ringing a reception bell, then returns to her stance.` |
| `factory-atk` | `The factory team leader shouts into his walkie-talkie, then lunges forward with a strong overhead swing of his arm as if throwing a wrench, then returns to his stance.` |
| `night-atk` | `The night-shift manager steps forward and swings his arm in a wide sweeping strike, like slashing with a flashlight beam, then returns to his stance.` |
| `shadow-atk` | `The shadow ninja dashes forward in a blur and performs a fast diagonal sword slash, cape and scarf whipping, then slides back into his stance.` |
| `<ai>-hit` | `The character gets hit by an invisible strike, recoils backwards with a pained expression, staggers, then recovers to the stance.` |
| `<ai>-ko` | `The character gets hit hard, spins and falls backwards onto the ground, dizzy, and lies still.` |

Mẹo: nếu nhân vật bị đổi mặt hay đổi áo, bấm tạo lại hoặc rút ngắn câu lệnh hành động. Nếu nền có bóng đổ hay hoa văn, thêm `The green background must stay perfectly flat and empty.` vào cuối.
