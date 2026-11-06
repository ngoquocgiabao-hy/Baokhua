#!/usr/bin/env python3
"""Tạo giọng đọc tiếng Trung tự nhiên bằng Gemini TTS (Google) cho game.html.

Bước làm:
  1) node tools/voice/collect.js          -> tools/voice/lines.json (các câu game sẽ đọc)
  2) GEMINI_API_KEY phải có sẵn trong biến môi trường (KHÔNG dán khoá vào file hay commit)
     python3 tools/voice/gen_gemini.py     -> v4/voice/*.mp3 + v4/voice/manifest.json
  3) Trong game.html đổi  const VOICE_FILES = false;  thành  true

Tuỳ chọn:
  --model gemini-2.5-pro-preview-tts   chọn mô hình (mặc định: tự tìm mô hình *tts* mới nhất, ưu tiên flash)
  --voice Kore                         giọng mặc định (giọng nữ rõ, ấm). Boss / Ā Bǎo có giọng riêng, xem ROLE_VOICE
  --only "你好,谢谢"                    chỉ làm lại vài câu (ví dụ câu nghe chưa ưng)
  --force                              làm lại cả câu đã có file
  --limit 20                           chỉ làm N câu (thử trước)
  --list-voices                        in danh sách giọng có sẵn rồi thoát

Chạy lại bao nhiêu lần cũng được: câu đã có file thì bỏ qua. Gặp giới hạn lượt (429) thì tự chờ rồi chạy tiếp.
"""
import argparse, base64, hashlib, json, os, ssl, subprocess, sys, time, urllib.error, urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
LINES = os.path.join(ROOT, 'tools', 'voice', 'lines.json')
OUT = os.path.join(ROOT, 'v4', 'voice')
API = 'https://generativelanguage.googleapis.com/v1beta'

VOICES = ['Kore', 'Puck', 'Zephyr', 'Charon', 'Fenrir', 'Leda', 'Orus', 'Aoede', 'Callirrhoe', 'Autonoe',
          'Enceladus', 'Iapetus', 'Umbriel', 'Algieba', 'Despina', 'Erinome', 'Algenib', 'Rasalgethi',
          'Laomedeia', 'Achernar', 'Alnilam', 'Schedar', 'Gacrux', 'Pulcherrima', 'Achird',
          'Zubenelgenubi', 'Vindemiatrix', 'Sadachbia', 'Sadaltager', 'Sulafat']

# Giọng theo vai: câu học / câu hỏi đọc như cô giáo; boss gằn giọng; Ā Bǎo hô chiêu; người đi đường thân thiện
ROLE_VOICE = {'question': None, 'learn': None, 'npc': 'Aoede', 'boss': 'Fenrir', 'hero': 'Puck'}
ROLE_STYLE = {
    'question': 'like a warm Mandarin teacher speaking to a beginner: standard Putonghua, every tone crisp and clear, slightly slow, natural and expressive',
    'learn':    'like a warm Mandarin teacher modelling a word for a beginner: standard Putonghua, every tone crisp and clear, slow, natural',
    'npc':      'like a friendly local Chinese person chatting on the street: standard Putonghua, lively and natural, clear tones, moderate pace',
    'boss':     'like a confident game boss challenging the player: standard Putonghua, bold and dramatic but every word clear, moderate pace',
    'hero':     'like an energetic young hero shouting a battle cry: standard Putonghua, punchy and excited',
}


def ssl_ctx():
    ca = os.environ.get('SSL_CERT_FILE') or os.environ.get('REQUESTS_CA_BUNDLE')
    return ssl.create_default_context(cafile=ca) if ca and os.path.exists(ca) else ssl.create_default_context()


def call(method, path, key, body=None, timeout=120):
    req = urllib.request.Request(API + path, method=method,
                                 data=json.dumps(body).encode() if body is not None else None,
                                 headers={'x-goog-api-key': key, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=timeout, context=ssl_ctx()) as r:
        return json.loads(r.read().decode())


def pick_model(key, want):
    if want:
        return want
    names = []
    tok = ''
    while True:
        d = call('GET', '/models?pageSize=200' + ('&pageToken=' + tok if tok else ''), key)
        names += [m['name'].split('/', 1)[1] for m in d.get('models', [])
                  if 'tts' in m['name'] and 'generateContent' in m.get('supportedGenerationMethods', [])]
        tok = d.get('nextPageToken')
        if not tok:
            break
    if not names:
        sys.exit('Không thấy mô hình TTS nào cho khoá này. Thử --model gemini-2.5-flash-preview-tts')
    names.sort(reverse=True)
    flash = [n for n in names if 'flash' in n]
    return (flash or names)[0]


def fname(text):
    return hashlib.sha1(text.encode('utf-8')).hexdigest()[:12] + '.mp3'


def to_mp3(pcm, rate, dst):
    # chuẩn hoá âm lượng to, rõ (loudnorm), cắt khoảng lặng đầu/cuối
    af = ('silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,'
          'areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12,areverse,'
          'loudnorm=I=-14:TP=-1.0:LRA=9')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(rate), '-ac', '1', '-i', 'pipe:0',
                    '-af', af, '-ar', '24000', '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '56k', dst],
                   input=pcm, check=True)


def tts(key, model, text, voice, style):
    body = {
        'contents': [{'parts': [{'text': f'Read the following Mandarin Chinese aloud {style}. Read only the Chinese text, nothing else:\n{text}'}]}],
        'generationConfig': {
            'responseModalities': ['AUDIO'],
            'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': voice}}},
        },
    }
    d = call('POST', f'/models/{model}:generateContent', key, body)
    part = d['candidates'][0]['content']['parts'][0]['inlineData']
    mime = part.get('mimeType', '')
    rate = 24000
    for bit in mime.split(';'):
        if bit.strip().startswith('rate='):
            rate = int(bit.split('=')[1])
    return base64.b64decode(part['data']), rate


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--model'); ap.add_argument('--voice', default='Kore')
    ap.add_argument('--only'); ap.add_argument('--force', action='store_true')
    ap.add_argument('--limit', type=int, default=0); ap.add_argument('--list-voices', action='store_true')
    a = ap.parse_args()
    if a.list_voices:
        print('\n'.join(VOICES)); return
    key = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
    if not key:
        sys.exit('Chưa có GEMINI_API_KEY trong biến môi trường. Thêm khoá vào cài đặt môi trường (không dán vào chat, không commit).')
    if not os.path.exists(LINES):
        sys.exit('Chưa có tools/voice/lines.json — chạy: node tools/voice/collect.js')
    lines = json.load(open(LINES, encoding='utf-8'))
    if a.only:
        want = {t.strip() for t in a.only.replace('，', ',').split(',') if t.strip()}
        lines = [l for l in lines if l['text'] in want]
    os.makedirs(OUT, exist_ok=True)
    man_path = os.path.join(OUT, 'manifest.json')
    manifest = json.load(open(man_path, encoding='utf-8')) if os.path.exists(man_path) else {}
    model = pick_model(key, a.model)
    print('Mô hình:', model, '· giọng mặc định:', a.voice, '·', len(lines), 'câu')
    done = fail = 0
    for i, l in enumerate(lines):
        if a.limit and done >= a.limit:
            break
        text, role = l['text'], l.get('role', 'question')
        dst = os.path.join(OUT, fname(text))
        if os.path.exists(dst) and not a.force:
            manifest[text] = fname(text); continue
        voice = ROLE_VOICE.get(role) or a.voice
        for attempt in range(6):
            try:
                pcm, rate = tts(key, model, text, voice, ROLE_STYLE.get(role, ROLE_STYLE['question']))
                to_mp3(pcm, rate, dst)
                manifest[text] = fname(text); done += 1
                print(f'[{i + 1}/{len(lines)}] {voice:8s} {text}')
                break
            except urllib.error.HTTPError as e:
                msg = e.read().decode(errors='replace')[:300]
                if e.code in (429, 500, 503):
                    wait = min(90, 8 * 2 ** attempt)
                    print(f'  … máy chủ bận / hết lượt ({e.code}), chờ {wait}s'); time.sleep(wait); continue
                print(f'  ✗ {text}: HTTP {e.code} {msg}'); fail += 1; break
            except (KeyError, IndexError):
                print(f'  ✗ {text}: Gemini không trả âm thanh (thử lại sau hoặc đổi --voice)'); fail += 1; break
            except Exception as e:
                print(f'  ✗ {text}: {e}'); fail += 1; break
        # ghi manifest dần để dừng giữa chừng vẫn giữ được
        json.dump(manifest, open(man_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=0, sort_keys=True)
        time.sleep(0.6)
    json.dump(manifest, open(man_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=0, sort_keys=True)
    print(f'Xong: {done} file mới, {fail} lỗi, manifest có {len(manifest)} câu → v4/voice/manifest.json')
    if manifest:
        print('Bước cuối: trong game.html đổi  const VOICE_FILES = false;  thành  true')


if __name__ == '__main__':
    main()
