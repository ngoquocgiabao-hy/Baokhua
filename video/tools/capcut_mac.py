"""Làm dự án CapCut (dựng bằng capcut-cli) mở được trên máy Mac bất kỳ, không phải "liên kết lại" tệp.
Đổi đường dẫn tuyệt đối của máy dựng thành mã giữ chỗ, rồi viết tệp MO_TRONG_CAPCUT.command:
người dùng bấm đúp → tệp tự chép dự án vào thư mục dự án CapCut trên máy đó, điền đúng đường dẫn và
thêm dự án vào danh sách của CapCut (có sao lưu root_meta_info.json trước khi sửa).
Chạy: python3 tools/capcut_mac.py <thư mục bộ> <thư mục du_an_capcut> <tên dự án>
"""
import json, os, shutil, stat, sys

KIT, DRAFTS, NAME = sys.argv[1], sys.argv[2], sys.argv[3]
D = os.path.abspath(os.path.join(DRAFTS, NAME))
shutil.rmtree(os.path.join(D, '.capcut-cli-history'), ignore_errors=True)
for f in ('draft_content.json', 'draft_info.json', 'draft_meta_info.json'):
    p = os.path.join(D, f)
    if not os.path.exists(p):
        continue
    s = open(p, encoding='utf-8').read().replace(D, '__DRAFT_DIR__')
    s = s.replace('"draft_root_path":"' + os.path.basename(os.path.abspath(DRAFTS)) + '"', '"draft_root_path":"__STORE__"')
    s = s.replace('"draft_root_path": "' + os.path.basename(os.path.abspath(DRAFTS)) + '"', '"draft_root_path": "__STORE__"')
    open(p, 'w', encoding='utf-8').write(s)
    if os.path.exists(p + '.bak'):
        os.remove(p + '.bak')
root = json.load(open(os.path.join(os.path.abspath(DRAFTS), 'root_meta_info.json'), encoding='utf-8'))
entry = next(e for e in root['all_draft_store'] if e['draft_name'] == NAME)
entry = json.loads(json.dumps(entry).replace(D, '__DRAFT_DIR__'))
entry['draft_root_path'] = '__STORE__'
json.dump(entry, open(os.path.join(os.path.abspath(DRAFTS), f'_root_entry_{NAME}.json'), 'w', encoding='utf-8'))
os.remove(os.path.join(os.path.abspath(DRAFTS), 'root_meta_info.json'))
rel = os.path.relpath(os.path.abspath(DRAFTS), os.path.abspath(KIT))

SCRIPT = r'''#!/bin/bash
# Bấm đúp để đưa dự án "__NAME__" vào CapCut trên máy Mac này.
# Tệp tự tìm thư mục dự án của CapCut, chép dự án vào, điền đúng đường dẫn, thêm vào danh sách dự án.
cd "$(dirname "$0")"
NAME="__NAME__"
SRC="__REL__/$NAME"
STORE=""
for c in "$HOME/Movies/CapCut/User Data/Projects/com.lveditor.draft" \
         "$HOME/Library/Containers/com.lemon.lvoverseas/Data/Movies/CapCut/User Data/Projects/com.lveditor.draft"; do
  if [ -d "$c" ]; then STORE="$c"; break; fi
done
if [ -z "$STORE" ]; then
  echo "Chưa thấy thư mục dự án CapCut trên máy này."
  echo "Mở CapCut, tạo thử 1 dự án trống, đóng CapCut rồi bấm đúp lại tệp này."
  read -n 1 -s -r -p "Bấm phím bất kỳ để đóng."; exit 1
fi
echo "Đóng CapCut (nếu đang mở)..."
osascript -e 'tell application "CapCut" to quit' >/dev/null 2>&1; sleep 2
DEST="$STORE/$NAME"
rm -rf "$DEST"; cp -R "$SRC" "$DEST" || { echo "Không chép được dự án."; read -n 1 -s; exit 1; }
cp "__REL__/_root_entry_$NAME.json" "$DEST/.root_entry.json"
/usr/bin/osascript -l JavaScript - "$DEST" "$STORE" <<'JXA'
ObjC.import('Foundation');
function rd(p){ var o=$.NSString.stringWithContentsOfFileEncodingError(p,$.NSUTF8StringEncoding,null); return (o.isNil && o.isNil()) ? '' : ObjC.unwrap(o) || ''; }
function wr(p,s){ $(s).writeToFileAtomicallyEncodingError(p,true,$.NSUTF8StringEncoding,null); }
function fill(s,dest,store){ return s.split('__DRAFT_DIR__').join(dest).split('__STORE__').join(store); }
function run(argv){
  var dest=argv[0], store=argv[1];
  ['draft_content.json','draft_info.json','draft_meta_info.json'].forEach(function(f){ var s=rd(dest+'/'+f); if(s) wr(dest+'/'+f, fill(s,dest,store)); });
  var entry=JSON.parse(fill(rd(dest+'/.root_entry.json'),dest,store));
  var now=Date.now()*1000; entry.tm_draft_modified=now;
  var rp=store+'/root_meta_info.json', old=rd(rp), root={all_draft_store:[]};
  if(old){ wr(rp+'.truoc_khi_them_'+entry.draft_name, old); try{ root=JSON.parse(old); }catch(e){} }
  root.all_draft_store=(root.all_draft_store||[]).filter(function(d){ return d.draft_name!==entry.draft_name; });
  root.all_draft_store.unshift(entry);
  wr(rp, JSON.stringify(root));
  $.NSFileManager.defaultManager.removeItemAtPathError(dest+'/.root_entry.json', null);
  return 'Xong: '+dest;
}
JXA
echo ""
echo "Đã đưa dự án \"$NAME\" vào CapCut. Mở CapCut, dự án nằm đầu danh sách."
open -a "CapCut" >/dev/null 2>&1
read -n 1 -s -r -p "Bấm phím bất kỳ để đóng cửa sổ này."
'''
cmd = os.path.join(KIT, 'MO_TRONG_CAPCUT.command')
open(cmd, 'w', encoding='utf-8').write(SCRIPT.replace('__NAME__', NAME).replace('__REL__', rel))
os.chmod(cmd, os.stat(cmd).st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
print('ok', cmd)
