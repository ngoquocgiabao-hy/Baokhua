#!/usr/bin/env bash
# Chạy bộ kiểm thử chính ở 2 khung điện thoại (360×640, 390×844). Ảnh lưu ở tools/test/out (không commit).
# Dùng: bash tools/test/run-all.sh        (từ thư mục repo; cần Node + Playwright có Chromium)
set -u
cd "$(dirname "$0")/../.."
OUT=tools/test/out; mkdir -p "$OUT"
if ! curl -s -o /dev/null http://127.0.0.1:8765/game.html; then (python3 -m http.server 8765 --bind 127.0.0.1 >/dev/null 2>&1 &); sleep 1; fi
ok=1
for sz in "360 640" "390 844"; do
  set -- $sz
  echo "== Bản đồ $1×$2";   node tools/test/city.js "$OUT" $1 $2 | tail -c 400; echo
  echo "== Trọn 5 trạm $1×$2"; node tools/test/campaign.js "$OUT" $1 $2 > "$OUT/campaign-$1.json"; python3 -c "import json,sys; d=json.load(open('$OUT/campaign-$1.json')); print('qua', d['cleared'], 'trạm · lỗi', d['errs'], '· gọi ngoài', d['ext']); sys.exit(0 if d['cleared']==5 and not d['errs'] and not d['ext'] else 1)" || ok=0
done
echo "== Đánh thật (HSK0 và HSK4, né đúng lúc)"; node tools/test/fight.js "$OUT" 0 gioi > "$OUT/fight0.json" && node tools/test/fight.js "$OUT" 4 gioi > "$OUT/fight4.json"
python3 -c "import json,sys; r=json.load(open('$OUT/fight0.json'))+json.load(open('$OUT/fight4.json')); [print('  HSK%d'%x['stage'], 'thắng' if x['win'] else 'THUA', 'máu %d/%d'%(x['heroLeft'],x['heroMax']), 'câu %d/%d'%(x['correct'],x['asked']), 'đỡ chữ', x.get('parry'), 'hit', x.get('hitMax'), x['errs']) for x in r]; sys.exit(0 if all(x['win'] and not x['errs'] for x in r) else 1)" || ok=0
echo "== Khung hình/giây + console"; node tools/test/perf.js
echo "== Dáng nhân vật (không xé hình)"; node tools/test/gait.js || ok=0
for sz in "360 640" "390 844"; do set -- $sz; echo "== Phông chữ Việt/Trung $1×$2"; node tools/test/fonts.js $1 $2 | tail -2 || ok=0; done
[ $ok = 1 ] && echo "KẾT QUẢ: ĐẠT" || { echo "KẾT QUẢ: CÓ LỖI"; exit 1; }
