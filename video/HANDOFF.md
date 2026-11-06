# Bàn giao Xưởng video Bảo Khựa 阿宝

Cập nhật 06/11/2026. Người viết: Claude (Xưởng Game và Web). Đọc kèm `video/README.md` (lệnh chạy) và `CLAUDE.md` ở gốc repo (luật).
Bản đầy đủ có danh mục tư liệu cá nhân nằm ở Drive: `BAO KHUA - SO CAI/07_TU_LIEU_VIDEO/000_BAN_GIAO_XUONG_VIDEO`. Repo này công khai nên bản ở đây không chứa dữ liệu cá nhân.

## 1. Xưởng làm được gì
Máy tự dựng video dọc 9:16 (TikTok, Reels, Shorts, Zalo) và bản 16:9, 4:5 cho YouTube, Facebook:
- Không cần quay màn hình: máy tự quay game Khách sạn (`tools/capture.cjs`).
- Chữ Hán là quân bài 3D thật (three.js, `tools/engine3d.js`). Có ảnh polaroid 3D, pháo giấy, vòng xung kích.
- Nhạc viết bằng code, không dính bản quyền: `debut/music.py` (120 BPM), `story/music_story*.py` (84 BPM), `series/music_series.py` (dùng chung cho series ngắn). Âm lượng khoảng −14 LUFS.
- Chạy bằng HyperFrames: mỗi video là một trang HTML, máy chụp từng khung rồi ghép MP4.
- Thời gian dựng (CPU, không GPU): video 15–30 giây mất 5–9 phút, video 45–60 giây mất 9–13 phút.

## 2. Danh mục thể loại (để tìm "long mạch")
| Mã | Thể loại | Khuôn dựng | Dữ liệu | Trạng thái |
|---|---|---|---|---|
| F1 | Chuyện thật (cảm xúc, hành trình) | `story/build_story*.mjs` (ngoài git) | Ảnh và lời của Bảo | 2 bản, đã chốt bản 2 |
| F2 | Chữ thật · ảnh thật (phóng kính lúp vào chữ Hán trong ảnh thật) | `series/chuthat.mjs` | `story/episodes/*.json` (ngoài git) | Tập 1–2 đã dựng |
| F3 | Từ vựng 3D trên nền game | `tools/build.mjs` (tv01–tv14) | `WORDS` trong `khachsan.html` | 14 video, cần dựng lại vì CTA cũ |
| F4 | 3 giây trả lời (câu đố) | `tools/build.mjs` (hn-*) | `QUESTIONS_RAW` | 10 video, cần dựng lại vì CTA cũ |
| F5 | Trailer thương hiệu | `debut/build_debut.mjs` | Dữ kiện công khai trên trang chủ | Bản EVERGREEN dùng lâu dài |
| F6 | Chữ thật ở Hạ Long (biển hiệu tiếng Trung quanh Bãi Cháy) | `series/chuthat.mjs` | Bảo chụp biển hiệu, ghi khung chữ | Chưa có ảnh |
| F7 | Bảo quay mặt: tiểu phẩm hai vai, POV quầy lễ tân | Quay tay, dựng bằng skill "cắt cắt" (CapCut) | Bảo quay | Chưa làm |
| F8 | Chuyện thật · Câu thật (raw câu chuyện → câu tiếng Trung trong chuyện → điểm ăn tiền + câu đi làm → kêu gọi game và học online) | `series/cauthat.mjs` + nhạc `series/music_bed.py` | Raw video của Bảo trong `story/raw/` (ngoài git), tập trong `story/episodes/` | Tập 1 và bản short đã dựng |

### Thêm một tập F2 hoặc F6 (khoảng 10 phút làm, 7 phút máy dựng)
1. Đặt ảnh vào `story/photos/` (đã che thông tin cá nhân, xem mục 5).
2. Tạo `story/episodes/<mã>.json` theo mẫu ở đầu `series/chuthat.mjs`. Trường `box` là khung chữ tính bằng điểm ảnh của ảnh đó. Mở ảnh bằng trình xem có toạ độ, hoặc vẽ lưới bằng ImageMagick.
3. Chạy `node series/chuthat.mjs story/episodes/<mã>.json`, xem trước, rồi `cd out/<mã> && npx hyperframes render -o ../<TÊN>_master.mp4`.
4. Nén bản đăng: `ffmpeg -i ..._master.mp4 -c:v libx264 -crf 20 -preset slow -maxrate 18M -bufsize 36M -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart <TÊN>_9x16.mp4`.
5. Nghĩa và pinyin phải qua Gemini kiểm trước khi đăng (mục 5). Chữ chỉ lấy từ ảnh thật, không tự bịa.

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
| T2 09/11 | F5 trailer EVERGREEN (ghim) | F1 Chuyện thật bản 2 |
| T3 10/11 | F3 tv04 | F8 Câu thật #1 |
| T4 11/11 | F4 hn-hotel-1 | F2 Chữ thật tập 1 |
| T5 12/11 | F3 tv01 | F4 hn-factory-1 |
| T6 13/11 | F3 tv05 | F8 Câu thật #1 bản short |
| T7 14/11 | F4 hn-hotel-2 | F2 Chữ thật tập 2 |
| CN 15/11 | F3 tv09 | Nghỉ, đọc số tuần 1 |
| T2 16/11 → CN 22/11 | F3/F4 xen kẽ (tv02, tv06, tv10, tv03, tv07; hn-hotel-3, 4; hn-factory-2, 3, 4) | F8 #2–#4 từ raw 02–04 (chờ Bảo gửi; chưa có thì đăng F2/F3 dự phòng), 22/11 nghỉ chốt |

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

## 4. Bài giảng 3D hằng ngày (sau khi chốt long mạch)
- **Mỗi ngày 1 video bài giảng** (F3 hoặc F4) lúc 11:30. Khung 20:00 dành cho thể loại thắng.
- **Kho hiện có:** 24 video (bỏ kg01 vì ghi ngày cũ), đủ khoảng 3,5 tuần. Phải dựng lại trước khi đăng, vì CTA cũ ghi "khai giảng 04/11". Câu kêu gọi đã sửa trong `config.json`.
  - Lệnh: `node tools/build.mjs` (khoảng 2,5 giờ máy cho 24 video).
- **Nối dài kho:**
  - Gemini soạn thêm câu vào `QUESTIONS_RAW` (việc V04, V15 trong hàng đợi). Cứ 3 câu mới là có thêm 1 video F4.
  - Thêm nhóm từ vào `config.json → tuvung`: mỗi dòng mới là 1 video F3.
- **Mỗi Chủ nhật:**
  - Dựng sẵn 7 video cho tuần sau.
  - Nén bản đăng.
  - Cập nhật bảng lịch đăng trên Drive.

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
1. ~~Dựng lại 24 video F3/F4 với CTA mới~~ (đang chạy 06/11; 8 câu nhà máy trong `QUESTIONS_RAW` đã thêm dấu 。 cho đồng bộ).
2. Bảo gửi raw 02–04 qua chat (Drive chỉ tải được tệp dưới 5 MB) để làm F8 #2–#4. Raw 01 đã thành F8 #1 và bản short.
3. Bảo chụp 10 biển hiệu tiếng Trung quanh Bãi Cháy để làm F6. Không chê bai cơ sở cụ thể nào.
4. ~~Gemini kiểm pinyin và nghĩa~~: xong 06/11 cho F1 bản 2, F2 tập 1–2, F8 tập 1 và 24 video bài giảng (125 mục, 0 lỗi phải sửa). Còn chờ Bảo duyệt thêm dấu 。 cho 5 câu nhà máy trong `QUESTIONS_RAW`.
5. ~~Lập bảng số liệu thử thị trường~~: xong, `SO_LONG_MACH_14_NGAY` trên Drive.
