# Bàn giao Xưởng video Bảo Khựa 阿宝

Cập nhật 06/11/2026. Người viết: Claude (Xưởng Game và Web). Đọc kèm `video/README.md` (lệnh chạy) và `CLAUDE.md` ở gốc repo (luật).
Bản đầy đủ có danh mục tư liệu cá nhân nằm ở Drive: `BAO KHUA - SO CAI/07_TU_LIEU_VIDEO/000_BAN_GIAO_XUONG_VIDEO`. Repo này công khai nên bản ở đây không chứa dữ liệu cá nhân.

## 1. Xưởng làm được gì
Máy tự dựng video dọc 9:16 (TikTok, Reels, Shorts, Zalo) và bản 16:9, 4:5 cho YouTube, Facebook:
- Video bài giảng dựng từ giáo trình HSK0 → HSK4 của game mới, không quay game cũ nữa (bộ quay game cũ nằm ở `_luu_tru/game-cu/`).
- Chữ Hán là quân bài 3D thật (three.js, `tools/engine3d.js`). Có ảnh polaroid 3D, pháo giấy, vòng xung kích.
- Nhạc viết bằng code, không dính bản quyền: `debut/music.py` (120 BPM), `story/music_story*.py` (84 BPM), `series/music_series.py` (dùng chung cho series ngắn). Âm lượng khoảng −14 LUFS.
- Chạy bằng HyperFrames: mỗi video là một trang HTML, máy chụp từng khung rồi ghép MP4.
- Thời gian dựng (CPU, không GPU): video 15–30 giây mất 5–9 phút, video 45–60 giây mất 9–13 phút.

## 2. Danh mục thể loại (để tìm "long mạch")
| Mã | Thể loại | Khuôn dựng | Dữ liệu | Trạng thái |
|---|---|---|---|---|
| F1 | Chuyện thật (cảm xúc, hành trình) | `story/build_story*.mjs` (ngoài git) | Ảnh và lời của Bảo | 2 bản, đã chốt bản 2 |
| F2 | Chữ thật · ảnh thật (phóng kính lúp vào chữ Hán trong ảnh thật) | `series/chuthat.mjs` | `story/episodes/*.json` (ngoài git) | Tập 1–2 đã dựng |
| F3, F4 | Từ vựng và câu đố trên nền game cũ | `_luu_tru/game-cu/` | `khachsan.html` | **Đã bỏ 06/11/2026** vì đã có game mới. Không đăng 24 video này |
| F5 | Trailer thương hiệu | `debut/build_debut.mjs` | Dữ kiện công khai trên trang chủ | Đoạn 14–22 giây là game cũ: quay lại bằng game mới trước khi đăng |
| F6 | Chữ thật ở Hạ Long (biển hiệu tiếng Trung quanh Bãi Cháy) | `series/chuthat.mjs` | Bảo chụp biển hiệu, ghi khung chữ | Chưa có ảnh |
| F7 | Bảo quay mặt: tiểu phẩm hai vai, POV quầy lễ tân | Quay tay, dựng bằng skill "cắt cắt" (CapCut) | Bảo quay | Chưa làm |
| F8 | Chuyện thật · Câu thật (raw câu chuyện → câu tiếng Trung trong chuyện → điểm ăn tiền + câu đi làm → kêu gọi game và học online) | `series/cauthat.mjs` + nhạc `series/music_bed.py` | Raw video của Bảo trong `story/raw/` (ngoài git), tập trong `story/episodes/` | Tập 1 và bản short đã dựng |
| F9 | Giáo trình 3D · phân tích sâu (≤ 60 giây: gây hit → biểu đồ, luật, ví dụ đi làm, bí quyết → câu nói ngay → kêu gọi học online; chưa nhắc game mới vì game đang hoàn thiện) | `series/giaotrinh3d.mjs` | `giaotrinh/*.json` (công khai, lấy từ `COURSE` trong game mới và giáo án khung HSK0–HSK4) | GT01 v2 Bảo đã chốt hình 06/11 (thêm đồ thị thanh điệu, đếm ngược đố vui). Chờ lồng tiếng |
| F10 | Reel comic từ raw (20–35 giây: gây hit → mỗi đoạn 3 giây một bong bóng truyện tranh chữ Hán + pinyin + nghĩa → ôn lại → kêu gọi). Kiểu "mode A" trong lệnh Grok AI Reel | `series/comic_reel.mjs` + bộ CapCut `tools/capcut_kit.cjs` | Raw của Bảo trong `story/raw/` (ngoài git), tập trong `story/episodes/` | Bơi 01 Bảo chưa ưng (06/11), đã thay bằng F11 |
| F11 | Nhật ký hành trình (30–40 giây: bản đồ vẽ đường đi → các chặng, polaroid rơi theo nhịp, câu nói thật của Bảo viết tay → thẻ chữ Hán lật 3D → về đích → ôn lại → kêu gọi). Cắt khung vuông giữa hình nên né được chữ in sẵn của raw cũ | `series/nhatky.mjs` + bộ CapCut `tools/capcut_cutkit.py` | Raw của Bảo, tập trong `story/episodes/` (ngoài git) | Bơi 02 "Nhật ký bơi qua cầu Bãi Cháy" dựng 06/11, chờ duyệt |

### Thêm một tập F2 hoặc F6 (khoảng 10 phút làm, 7 phút máy dựng)
1. Đặt ảnh vào `story/photos/` (đã che thông tin cá nhân, xem mục 5).
2. Tạo `story/episodes/<mã>.json` theo mẫu ở đầu `series/chuthat.mjs`. Trường `box` là khung chữ tính bằng điểm ảnh của ảnh đó. Mở ảnh bằng trình xem có toạ độ, hoặc vẽ lưới bằng ImageMagick.
3. Chạy `node series/chuthat.mjs story/episodes/<mã>.json`, xem trước, rồi `cd out/<mã> && npx hyperframes render -o ../<TÊN>_master.mp4`.
4. Nén bản đăng: `ffmpeg -i ..._master.mp4 -c:v libx264 -crf 20 -preset slow -maxrate 18M -bufsize 36M -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart <TÊN>_9x16.mp4`.
5. Nghĩa và pinyin phải qua Gemini kiểm trước khi đăng (mục 5). Chữ chỉ lấy từ ảnh thật, không tự bịa.

### Thêm một reel F10 và bộ CapCut (khoảng 20 phút làm, 2 phút máy dựng)
1. Xem raw bằng bảng mỗi giây một khung, chọn cảnh **không có phụ đề in sẵn** (raw cũ của Bảo hay có phụ đề Trung in sẵn, để lọt vào là chữ Trung thiếu pinyin và nghĩa).
2. Viết `story/episodes/<mã>.json` theo mẫu ở đầu `series/comic_reel.mjs`: mỗi đoạn 3 giây, cảnh (`a` giây bắt đầu, `d`, `speed` < 1 là quay chậm, `comic` bật lọc truyện tranh, `kb` in/out), bong bóng `zh/py/vi` (giữ ít nhất 2,5 giây), `sfx`, `hook`.
3. `node series/comic_reel.mjs story/episodes/<mã>.json` → `cd out/<mã> && npx hyperframes render -o ../<TÊN>_master.mp4` → nén như mục trên. Cắt lại cảnh đã có: thêm `RECUT=1`.
4. Gemini kiểm câu (mục 5), soát mỗi giây một khung.
5. Bộ CapCut cho Bảo tự sửa: `NODE_PATH=$(npm root -g) node tools/capcut_kit.cjs out/<mã>` (cần `npm i -g capcut-cli` hoặc biến `CAPCUT_BIN`). Ra `out/<mã>/capcut_kit/`: thư mục dự án CapCut (lớp cảnh quay, lớp ảnh bong bóng, 3 lớp chữ Hán / pinyin / tiếng Việt để sửa, đang ẩn, lớp nhạc), cảnh đã cắt, PNG bong bóng nền trong, 3 tệp phụ đề SRT, nhạc. Đường dẫn trong dự án là đường dẫn tuyệt đối của máy dựng: trong CapCut bấm "Liên kết lại" chọn thư mục `assets` của dự án, hoặc chạy `capcut relink <dự án> --from <đường dẫn cũ> --to <đường dẫn trên máy Bảo>`. CapCut bản mới có thể từ chối dự án tạo ngoài ứng dụng; khi đó dùng cảnh, PNG và SRT trong bộ để ráp tay.

### Thêm một tập F11 "Nhật ký hành trình" (khoảng 25 phút làm, 2 phút máy dựng)
1. Xem raw bằng bảng mỗi giây một khung. Khuôn cắt khung vuông giữa hình (cao 46% khung, tâm `cy`), nên chọn `cy` sao cho chữ in sẵn ở trên và dưới raw nằm ngoài khung. Soát bằng ảnh cắt thử trước khi dựng.
2. Viết `story/episodes/<mã>.json` theo mẫu ở đầu `series/nhatky.mjs`: `hook` (tiêu đề, bản đồ `map.from → map.to`), `legs` (mỗi chặng 7 giây: nhãn, 2–3 cảnh có chú thích viết tay, câu nói thật, thẻ chữ `zh/py/vi` giữ ≥ 2,5 giây, `map` tiến độ trên bản đồ nhỏ), `finish`, `recap`, `cta`.
3. `node series/nhatky.mjs story/episodes/<mã>.json` (thêm `RECUT=1` khi đổi cảnh) → dựng → nén.
4. Bộ CapCut: `CAPCUT_BIN="npx --prefix /tmp/ccli capcut" python3 tools/capcut_cutkit.py out/<TÊN>_9x16.mp4 out/<mã> <TênDựÁn> <mốc cắt cảnh>`.
5. Mở trên Mac: trong bộ có `MO_TRONG_CAPCUT.command` (`tools/capcut_mac.py` tạo). Bảo bấm đúp, tệp tự chép dự án vào thư mục dự án CapCut của máy đó, điền đúng đường dẫn, thêm vào danh sách (sao lưu danh sách cũ), không phải liên kết lại. Chưa thử được trên máy Mac thật; nếu không chạy thì làm theo HUONG_DAN.txt trong bộ.
Phông viết tay Patrick Hand (giấy phép OFL, có dấu tiếng Việt) để ở `assets/fonts/`.

### Kết cấu chuẩn cho video 1–3 phút (F8 và các thể loại dài)
1. **Gây hit (3–5 giây):** một câu hỏi hoặc mâu thuẫn, ví dụ "借 là mượn hay cho mượn?".
2. **Giá trị chuyên sâu:** các khối gồm chuyện thật 5,5 giây → câu thật (chữ Hán, pinyin, nghĩa) → điểm ăn tiền 7,5 giây (quy tắc, ví dụ, câu nói ngay khi đi làm).
3. **Kêu gọi (7 giây):** 🎮 game Khách sạn + 💬 học online nhóm nhỏ.

Một raw cho ra 4 sản phẩm: bản chính 60–90 giây, teaser 15 giây, short "câu đi làm" 20 giây, bài Zalo.
Raw dựng kiểu montage (mỗi cảnh 0,3–1 giây): khuôn tự đổi cảnh quá ngắn thành ảnh tĩnh chạy Ken Burns, video không bao giờ chạy quá điểm cuối của đoạn đã chọn (trước đây tua chậm 0,5× làm lộ cảnh kế bên). Chọn cảnh theo bảng cắt cảnh tự động: `ffmpeg -i raw.mp4 -vf "select='gt(scene,0.22)',showinfo" -f null -`, rồi lấy trọn từng cảnh, chừa 0,05 giây mỗi đầu. Soát mỗi giây một khung trước khi giao.
Raw từ TikTok thường là HEVC: đổi sang H.264 trước khi dựng (`ffmpeg -i in.mp4 -an -c:v libx264 -crf 16 -pix_fmt yuv420p -g 15 out.mp4`).
Bảng bài học phủ vùng y 1080–1920, che luôn phụ đề cũ in cứng trong raw.

## 3. Thử thị trường 14 ngày: tìm long mạch
Mục tiêu: sau 14 ngày biết 2 thể loại nào kéo người vào nhóm Zalo tốt nhất, rồi dồn sức vào đó.

**Thời gian:** Thứ Hai 09/11 đến Chủ nhật 22/11/2026. Đọc số giữa kỳ Chủ nhật 15/11, chốt 22/11.

**Nhịp đăng:** 2 video mỗi ngày, lúc 11:30 và 19:30 (19:30 để không trùng lớp Zoom 20:00 thứ 2 – 4 – 6). Bảo tự đăng; nhanh nhất là tối Chủ nhật lên lịch cả tuần trong TikTok Studio bản web (mục Lên lịch), khoảng 20 phút.

**Sổ:** Google Sheets `SO_LONG_MACH_14_NGAY` trong Drive `07_TU_LIEU_VIDEO`. Trang "Lịch đăng và số" có đủ 28 khung giờ kèm tên tệp; Bảo nhập số vào ô vàng 48 giờ sau khi đăng (khoảng 2 phút mỗi video). Cột điểm và trang "Tổng hợp" tự tính, tự xếp hạng thể loại có từ 3 video. Claude đọc sổ ngày 15/11 và 22/11, ghi báo cáo vào `02_BAO_CAO`.

| Ngày | 11:30 | 19:30 |
|---|---|---|
| T2 09/11 | Nghỉ (F9 chưa duyệt) | F1 Chuyện thật bản 2 |
| T3 10/11 | F9 GT01 (nếu Bảo duyệt và lồng tiếng xong) | F8 Câu thật #1 |
| T4 11/11 | F9 GT02 | F2 Chữ thật tập 1 |
| T5 12/11 | F9 GT03 | F8 Câu thật #1 bản short |
| T6 13/11 | F9 GT04 | F2 Chữ thật tập 2 |
| T7 14/11 | F9 GT05 | F8 #2 (raw 02) |
| CN 15/11 | F9 GT06 | Nghỉ, đọc số tuần 1 |
| T2 16/11 → CN 22/11 | F9 GT07 → GT12, mỗi ngày 1 tập | F8 #3–#4, F2 tập 3 nếu có ảnh; 22/11 nghỉ chốt |

Trailer F5 và mọi video có hình game cũ không đăng. F9 nhắc game mới, nên chỉ đăng sau khi game Khách sạn Vịnh Ā Bǎo được "duyệt đăng" lên baokhua.com.
20/11 là Ngày Nhà giáo: thêm story chúc 老师辛苦了 (lǎoshī xīnkǔ le – Thầy cô vất vả rồi).

**Số cần ghi cho mỗi video** (TikTok Studio → Phân tích, đọc sau 48 giờ): lượt xem, thời gian xem trung bình, tỉ lệ xem hết, lượt thích, bình luận, chia sẻ, lưu, người theo dõi mới, lượt xem hồ sơ. Ghi thêm số người vào nhóm Zalo trong ngày.

**Điểm long mạch của một thể loại** (tính trung bình các video cùng thể loại):
`điểm = 3 × (chia sẻ + lưu)/lượt xem × 100 + 2 × tỉ lệ xem hết × 10 + 2 × theo dõi mới/lượt xem × 100 + 1 × bình luận/lượt xem × 100`

Các tỉ lệ trên lượt xem tính theo %, tỉ lệ xem hết nhân 10, để hai nhóm chỉ số có sức nặng ngang nhau (công thức cũ để tỉ lệ xem hết lấn át mọi thứ). Trọng số đổi được ở trang "Tổng hợp" của sổ.

**Quy tắc chốt ngày 14:**
- Giữ 2 thể loại có điểm cao nhất, nâng lên 5 video mỗi tuần.
- Bỏ 2 thể loại thấp nhất.
- Thể loại ở giữa giữ 1 video mỗi tuần để theo dõi.
- Dừng sớm thể loại nào bị phàn nàn hoặc tốn hơn 30 phút mỗi ngày của Bảo.

## 4. Bài giảng 3D hằng ngày: F9 "Giáo trình 3D"
Nguồn: giáo trình 6 bài HSK0 → HSK4 trong game mới (mảng `COURSE` trong `hotel/index.html`, nhánh game) và giáo án khung HSK0–HSK4 trên Drive `06_LOP_HOC`. Mỗi tập mổ xẻ **một** điểm người Việt hay sai, có biểu đồ, luật, 2–4 ví dụ đi làm và một câu nói ngay.

| Tập | Chặng | Điểm phân tích | Câu nói ngay |
|---|---|---|---|
| GT01 | HSK0 · Chào hỏi | Thanh 3 gặp thanh 3: viết nǐ hǎo, đọc ní hǎo; nửa thanh 3 | 你好，欢迎光临！ |
| GT02 | HSK0 | 不 lúc bù lúc bú: 不客气 bú kèqi, 不是 bú shì | 不客气，祝您愉快！ |
| GT03 | HSK0 | 一 đổi 3 kiểu: 一下 yíxià, 一起 yìqǐ, 一个 yí ge | 请等一下。 |
| GT04 | HSK1 · Nhận phòng | 几 hay 多少: hỏi số lượng thế nào cho đúng | 请问您几位？ |
| GT05 | HSK1 | 请 + động từ: lịch sự với khách, khác 麻烦 ở đâu | 请出示您的护照。 |
| GT06 | HSK1 · Giờ giấc | 点 (lúc mấy giờ) và 小时 (mấy tiếng) | 早餐七点开始。 |
| GT07 | HSK1 | 在 chỉ chỗ: người Việt hay đặt sai thứ tự | 餐厅在二楼。 |
| GT08 | HSK2 · Phục vụ phòng | 马上 và 一会儿: hứa với khách bao lâu | 我马上来。 |
| GT09 | HSK2 | 帮 + người + việc | 我帮您拿行李。 |
| GT10 | HSK3 · Sự cố | 了 báo đổi trạng thái: 坏了 | 空调坏了，我们马上解决。 |
| GT11 | HSK3 | 3 mức xin lỗi: 不好意思 · 对不起 · 非常抱歉 | 非常抱歉，我们马上解决。 |
| GT12 | HSK4 · Tiễn khách | 一路平安 và 一路顺风: chúc khách đi máy bay câu nào | 祝您一路平安！ |

Quy trình mỗi tập (khoảng 20 phút người + 10 phút máy): viết `giaotrinh/gtNN.json` → Gemini kiểm (`tools/gemini_check.py`) → `snapshot` soát bố cục → dựng → Bảo lồng tiếng theo `out/gtNN/vo.md` trong CapCut (giọng thật của thầy, không dùng giọng máy cho bài phát âm: giọng máy Gemini đã thử 06/11, đọc sai thanh chữ 麻) → đăng.
Nâng cấp hình sau này: cảnh mở đầu bằng video AI (Google Flow / Veo, Seedance) khi Bảo cấp quyền; phần chữ, biểu đồ, quân bài vẫn dựng bằng HyperFrames để đúng nội dung.

### Lồng giọng thật và cân âm lượng (miễn phí)
`python3 tools/long_tieng.py --video out/X_master.mp4 --voice <ghi âm> [--split --marks 0,4.5,14] [--music <bài của Bảo>] --out out/X_long_tieng.mp4`
- Làm sạch giọng (cắt ù dưới 85 Hz, giảm ồn, bớt chói "s", nén nhẹ), đưa về −16 LUFS, cân đều từng câu (±8 dB).
- `--split`: tách câu theo khoảng nghỉ ≥ 0,55 giây, đặt câu thứ n vào mốc thứ n. `--measure`: chỉ in độ dài từng câu.
- Nhạc nền (của video, hoặc `--music` bài Bảo tự đàn hát, tự cắt vừa và mờ đầu cuối) để ở −20 LUFS, tự hạ 10 dB khi có giọng (`--duck`), lên lại sau 0,4 giây.
- Cả bài về −14 LUFS, đỉnh dưới −1,5 dBTP. Xuất thêm `_giong.wav` và `_nhac.wav` để kéo vào CapCut, cả 2 để 100%.
- Đã thử 07/11 bằng giọng Bảo cắt từ raw, hạ còn −30 LUFS như ghi điện thoại: ra −14,3 LUFS, đỉnh −1,8 dBTP, nhạc thấp hơn giọng khoảng 9–10 dB khi nói.

## 5. Luật bắt buộc
- Repo công khai: ảnh cá nhân, kịch bản đời tư, tập dữ liệu F1/F2 để ngoài git (`.gitignore` đã có sẵn). Bản sao để trên Drive.
- Ảnh đưa vào video phải che: số CCCD hoặc định danh, ngày sinh, số hiệu chứng chỉ, số thẻ. Làm mờ màn hình tài liệu nội bộ.
- Không đưa vào video: mặt trẻ em, nội dung chính trị, tài liệu hay sản phẩm nội bộ của công ty, mặt người lạ khi ảnh không phải sự kiện công khai.
- Không ghi "miễn phí", không nhắc hoàn tiền, không nhắc S-VIP, không hứa ngày mở 6–10★.
- Tiếng Trung luôn kèm pinyin có dấu và nghĩa Việt; Gemini kiểm trước khi đăng:
  `GEMINI_API_KEY=... python3 tools/gemini_check.py . out/KIEM.json story/episodes/<mã>.json`. Kết quả OK, XEM (lỗi nhỏ) hoặc SUA (phải sửa). Khoá chỉ đặt trong biến môi trường hoặc cài đặt môi trường, không ghi vào repo. Gói miễn phí chỉ chạy bản Flash, và chỉ gửi nội dung sẽ đăng công khai.
- Bot không tự đăng, không nhắn người thật. Bảo đăng bằng tài khoản của mình.
- Không né cơ chế chống bot của nền tảng. Video TikTok cũ thì Bảo lưu từ máy hoặc từ ứng dụng rồi gửi lại.

## 6. Việc còn mở
1. Lồng tiếng: Bảo tự ghi âm (07/11 bỏ hẳn ElevenLabs và mọi dịch vụ trả phí). Bảo tải tệp vào Drive `07_TU_LIEU_VIDEO/09_GHI_AM_BAO/01_loi_doc`, nhạc tự sáng tác vào `02_nhac_tu_sang_tac`; hướng dẫn và bảng đọc GT01 ở tài liệu `00_HUONG_DAN_GHI_AM_07-11` cùng thư mục. Dựng theo nguyên tắc "giọng trước, hình theo giọng": đo độ dài từng câu (`tools/long_tieng.py --split --measure`), chỉnh thời lượng các đoạn trong `giaotrinh/gtNN.json` cho khớp, dựng lại, rồi lồng tiếng. Duyệt giọng GT01 xong thì làm GT02 → GT12.
2. Game mới "Khách sạn Vịnh Ā Bǎo" đang hoàn thiện, chưa đẩy. F9, F10 hiện chỉ kêu gọi học online; khi game được "duyệt đăng" thì thêm thẻ game vào kêu gọi.
3. F11: Bảo duyệt Bơi 02 và bấm đúp thử MO_TRONG_CAPCUT.command trên Mac. Bơi 01 (F10 comic) Bảo chưa ưng, để ở 03_CAN_LAM_LAI.
4. Trailer F5: quay lại đoạn game (14–22 giây) bằng game mới, sau khi game được duyệt.
5. Tải video lớn lên Drive: dùng mã OAuth tạm (hết hạn sau khoảng 1 giờ) qua ô nhập bảo mật, tải lên bằng API resumable. Không có mã thì Bảo kéo thả theo bảng `00_DANH_MUC_VIDEO`.
6. Sổ `SO_LONG_MACH_14_NGAY`: đổi các khung 11:30 từ F3/F4 sang F9/F10 (cần bật connector Google Sheets để Claude sửa thẳng vào tệp).
7. Bảo chụp 10 biển hiệu tiếng Trung quanh Bãi Cháy để làm F6.
