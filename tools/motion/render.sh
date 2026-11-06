#!/usr/bin/env bash
# Xuất 5 video nền sân đấu (lặp 6 giây, 720×720) vào v4/motion/<kiểu boss>.mp4 + .webm
# Dùng (từ thư mục tools/motion):  npm i  &&  bash render.sh
# Máy không tải được trình duyệt riêng của Remotion thì chỉ đường tới Chromium có sẵn:
#   BROWSER=/đường/dẫn/chrome-headless-shell bash render.sh
set -e
cd "$(dirname "$0")"
OUT=../../v4/motion; mkdir -p public/bg out "$OUT"
cp ../../v4/bg/*.jpg public/bg/
EXTRA=""; [ -n "${BROWSER:-}" ] && EXTRA="--browser-executable=$BROWSER"
for c in trainee hotel factory night shadow; do
  npx remotion render "bg-$c" "out/$c.mp4" --codec=h264 --crf=30 --muted --pixel-format=yuv420p $EXTRA
  ffmpeg -v error -y -i "out/$c.mp4" -c copy -movflags +faststart "$OUT/$c.mp4"
  ffmpeg -v error -y -i "$OUT/$c.mp4" -c:v libvpx-vp9 -b:v 0 -crf 40 -row-mt 1 -an "$OUT/$c.webm"
  echo "xong $c"
done
ls -la "$OUT"
