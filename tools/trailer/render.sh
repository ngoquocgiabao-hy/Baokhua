#!/usr/bin/env bash
# Dựng trailer 9:16 (48 giây, 1080×1920) → out/trailer.mp4
# Dùng (từ thư mục tools/trailer):  npm i  &&  bash render.sh
# Trước đó chép tư liệu vào public/ (xem README.md). Máy không tải được trình duyệt riêng của Remotion thì:
#   BROWSER=/đường/dẫn/chrome-headless-shell bash render.sh
set -e
cd "$(dirname "$0")"
python3 music.py public/music.wav
EXTRA=""; [ -n "${BROWSER:-}" ] && EXTRA="--browser-executable=$BROWSER"
npx remotion render Trailer out/trailer-raw.mp4 --codec=h264 --crf=18 $EXTRA
ffmpeg -v error -y -i out/trailer-raw.mp4 -c:v libx264 -crf 20 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart out/trailer.mp4
ls -la out/trailer.mp4
