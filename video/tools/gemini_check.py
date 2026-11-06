"""Gemini kiểm chữ Hán, pinyin, nghĩa Việt trong kịch bản và chú thích video trước khi đăng.
Chạy (từ thư mục video/):
    GEMINI_API_KEY=... python3 tools/gemini_check.py . out/KIEM_GEMINI.json [tệp1 tệp2 ...]
Không ghi tên tệp thì kiểm danh sách SOURCES bên dưới. Khoá chỉ đặt trong biến môi trường, KHÔNG ghi vào repo.
Gói miễn phí: dùng model Flash (mặc định gemini-3.6-flash); Pro cần gói trả phí. Đổi bằng GEMINI_MODEL=...
Kết quả: OK = đúng, XEM = lỗi nhỏ hoặc còn tranh cãi, SUA = sai, phải sửa trước khi đăng."""
import json, os, re, sys, time, urllib.request

KEY = os.environ.get('GEMINI_API_KEY', '')
if not KEY:
    raise SystemExit('Thiếu GEMINI_API_KEY')
MODEL = os.environ.get('GEMINI_MODEL', 'gemini-3.6-flash')
VID, OUT = sys.argv[1], sys.argv[2]
EXTRA = sys.argv[3:]

SOURCES = [
    ('F3/F4 bài giảng 3D (24 video)', 'out/CAPTIONS.md', 'all'),
    ('F1 Chuyện thật bản 2 – chú thích', 'story/CAPTIONS_CHUYEN_THAT_V2.md', 'all'),
    ('F1 Chuyện thật bản 2 – chữ trong video', 'story/build_story2.mjs', 'cjk'),
    ('F2 Chữ thật tập 1–2 – chú thích', 'story/CAPTIONS_CHU_THAT.md', 'all'),
    ('F2 Chữ thật tập 1', 'story/episodes/ct01.json', 'all'),
    ('F2 Chữ thật tập 2', 'story/episodes/ct02.json', 'all'),
    ('F8 Chuyện thật · Câu thật tập 1', 'story/episodes/r01.json', 'all'),
]

PROMPT = """Bạn là biên tập viên tiếng Trung chuẩn (giản thể, phổ thông) kiêm giáo viên dạy tiếng Trung cho người Việt.
Dưới đây là văn bản trích từ kịch bản và chú thích video dạy tiếng Trung giao tiếp (khách sạn, nhà máy, đời sống) cho người Việt.
Hãy tìm MỌI mục có chữ Hán (từ, câu, tên riêng) và kiểm từng mục:
1. Pinyin: đúng âm, đúng dấu thanh, tách từ hợp lý. Chấp nhận cả cách ghi dấu gốc lẫn ghi biến điệu của 一 và 不, nhưng báo nếu một mục ghi lẫn lộn. Thanh nhẹ ghi không dấu.
2. Nghĩa tiếng Việt: đúng, tự nhiên, không sai sắc thái.
3. Câu tiếng Trung: tự nhiên, đúng ngữ pháp, người bản xứ có nói như vậy không.
4. Nếu có mô tả quy tắc ngữ pháp hoặc mẹo (ví dụ "借 = mượn / cho mượn", "刚 + V"), kiểm quy tắc đó có đúng không.
Chỉ đánh "SUA" khi có lỗi thật. Lỗi nhỏ về văn phong hoặc chỗ còn tranh cãi thì đánh "XEM". Đúng thì "OK".
Pinyin để trống nếu văn bản không ghi pinyin cho mục đó (chỉ báo thiếu khi mục đó là nội dung dạy chính).
Trả lời bằng tiếng Việt, đúng lược đồ JSON.

Nguồn: {name}
---
{text}
---"""

SCHEMA = {
    'type': 'OBJECT',
    'properties': {
        'items': {'type': 'ARRAY', 'items': {'type': 'OBJECT', 'properties': {
            'zh': {'type': 'STRING'},
            'pinyin_hien_tai': {'type': 'STRING'},
            'nghia_hien_tai': {'type': 'STRING'},
            'trang_thai': {'type': 'STRING', 'enum': ['OK', 'SUA', 'XEM']},
            'pinyin_dung': {'type': 'STRING'},
            'nghia_de_xuat': {'type': 'STRING'},
            'ly_do': {'type': 'STRING'},
        }, 'required': ['zh', 'trang_thai']}},
        'nhan_xet_chung': {'type': 'STRING'},
    },
    'required': ['items'],
}


def extract(path, mode):
    s = open(os.path.join(VID, path), encoding='utf-8').read()
    if mode == 'all':
        return s
    lines = s.split('\n')
    keep = sorted({j for i, l in enumerate(lines) if re.search(r'[一-鿿]', l) for j in (i - 1, i, i + 1) if 0 <= j < len(lines)})
    return '\n'.join(lines[j][:400] for j in keep)


def ask(name, text):
    body = {
        'contents': [{'role': 'user', 'parts': [{'text': PROMPT.format(name=name, text=text)}]}],
        'generationConfig': {'temperature': 0, 'responseMimeType': 'application/json', 'responseSchema': SCHEMA},
    }
    req = urllib.request.Request(
        f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent',
        data=json.dumps(body).encode(), headers={'Content-Type': 'application/json', 'x-goog-api-key': KEY})
    for k in range(4):
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                d = json.load(r)
            return json.loads(d['candidates'][0]['content']['parts'][0]['text'])
        except Exception as e:  # thử lại khi quá tải
            err = getattr(e, 'read', lambda: b'')().decode()[:300]
            print('  lỗi, thử lại:', e, err, file=sys.stderr)
            time.sleep(5 * (k + 1))
    raise SystemExit('Gemini không trả lời: ' + name)


if EXTRA:
    SOURCES = [(p, p, 'cjk' if p.endswith(('.mjs', '.js', '.html')) else 'all') for p in EXTRA]
res = []
for name, path, mode in SOURCES:
    t = time.time()
    r = ask(name, extract(path, mode))
    r['nguon'], r['tep'] = name, path
    res.append(r)
    c = {s: sum(1 for i in r['items'] if i['trang_thai'] == s) for s in ('OK', 'SUA', 'XEM')}
    print(f'{name}: {len(r["items"])} mục · OK {c["OK"]} · SỬA {c["SUA"]} · XEM {c["XEM"]} ({time.time() - t:.0f}s)')
json.dump({'model': MODEL, 'ket_qua': res}, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('đã ghi', OUT)
