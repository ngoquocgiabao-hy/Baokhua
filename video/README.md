# Xưởng video Bảo Khựa

Mẫu video từ vựng 9:16 (1080×1920). Nội dung lấy từ `data.json`.

## HyperFrames (mẫu chính)
Toàn bộ video nằm trong một tệp `hyperframes/index.html`. Muốn làm video mới thì chỉ sửa khối `DATA` trong tệp đó.
```bash
cd video/hyperframes && npx hyperframes render -o ../out/video.mp4
```

## Remotion (mẫu so sánh)
```bash
cd video/remotion && npm i && npm run render
```

Không commit tệp MP4: thư mục `out/` đã được bỏ qua. Video xuất ra thì cất lên Drive.
