# BÀN GIAO DỰ ÁN · Bảo Khựa 阿宝 – Web & Game học tiếng Trung

Cập nhật: 05/11/2026 · Người soạn: Xưởng Game & Web (Claude) · Chủ dự án: Bảo.
Đọc theo thứ tự: tệp này → `CLAUDE.md` (luật bắt buộc) → `docs/KY_THUAT_GAME.md` (kiến trúc mã game).

---

## 1. Dự án là gì
- **Bảo Khựa 阿宝** dạy tiếng Trung giao tiếp cho người làm khách sạn, du lịch và công nhân nhà máy ở Hạ Long – Quảng Ninh. Lộ trình gợi ý HSK0 → HSK4.
- **baokhua.com** chạy GitHub Pages từ nhánh `main` của repo này (tệp `CNAME`). Mục tiêu:
  - giới thiệu khoá học;
  - cho người xem chơi game học từ;
  - dẫn người xem về Zalo / Google Form để đăng ký thẻ hội viên.
- **Hai game một tệp, không thư viện ngoài:**
  - `khachsan.html`: Khách sạn Bảo Khựa. Xây khách sạn, phục vụ khách Trung Quốc bằng câu tiếng Trung. Bảo đã ưng, đang chờ thử, **tạm không sửa**.
  - `game.html`: Đánh Boss "Hành trình HSK0 → HSK4". Tự điều khiển Ā Bǎo qua thành phố Hạ Long thu nhỏ, gặp người, đấu quái, vào 5 trạm đánh boss bằng câu hỏi.
- Repo **công khai**. Sổ sách, giá vốn, dữ liệu học viên, hiến chương nội bộ chỉ để ở Google Drive "BAO KHUA - SO CAI".

## 0. Ưu tiên dự án (06/11/2026)

- **Dự án chính: game Khách sạn mới** (mô phỏng xây và quản lý khách sạn 3D, quốc tế). Kế hoạch: `docs/khachsan/KE_HOACH_CHUYEN_MINH.md`. Cách cải tiến liên tục: `docs/khachsan/KAIZEN.md`. Bảo đã duyệt hướng đi ngày 06/11 (mục 15 của kế hoạch). Đang ở giai đoạn 0 (2 tuần, mục 10.1): bản thử v0.2 ở `hotel/proto/` (sảnh 3D dựng 100% bằng code, kiểu hoạt hình dễ thương; giáo trình 6 bài HSK0 → HSK4, thẻ từ, ôn kiểu Anki, nhắc ôn; cài như app), kiểm bằng `node tools/test/hotel.js`; video `teaser.mp4` quay bằng `tools/hotel/capture.js`. Hình 3D và video làm không tốn thêm chi phí (mục 8.2–8.3 của kế hoạch). Chưa lên App Store, CH Play; tập trung web và PWA (mục 9.5).
- **Game Đánh Boss là game nhánh:** đóng băng tính năng ở v16, chỉ sửa lỗi. Tổng kết: `docs/TONG_KET_GAME_DANH_BOSS.md`.
- `khachsan.html` v5 tiếp tục chạy trên baokhua.com cho đến khi bản mới đạt chuẩn và Bảo duyệt đăng.

## 2. Hiện trạng (06/11/2026)
| Nơi | Nội dung |
|---|---|
| `main` (trang thật) | Bản đăng 06/11 (Bảo duyệt đăng): game Đánh Boss v16, trang chủ 11.11 (ưu đãi thẻ năm 299k đến 23:59 11/11, không ghi ngày khai giảng), trang thẻ hội viên 11.11, Khách sạn v5. Commit `0036e89`. |
| Nhánh `claude/project-investment-strategy-3oj0pf` | Như `main` cộng: bản thử game Khách sạn mới v0.2 `hotel/proto/`, công cụ quay video `tools/hotel/capture.js`, kiểm thử `tools/test/hotel.js`, trang chủ có 2 nút 3D Chơi game / Học online + bảng chọn game. Phần này **chưa đăng**, chờ Bảo gõ "duyệt đăng". |
| Bản xem thử (riêng tư) | Game Đánh Boss: https://claude.ai/artifact/NmNrwXTvr6EvJptufwGx7B. Bản thử 3D Khách sạn: https://claude.ai/artifact/75dWtZMQe9gUqRtUXTGyfQ. Chỉ người được chia sẻ mới mở được. |

Lịch sử chính của game Đánh Boss trên nhánh:
- **v6:** 5 trạm HSK0–HSK4, ngân hàng câu theo cấp.
- **v7:** đánh nhau có chuyển động, người gặp trên đường, Sổ từ.
- **v8:** nhân vật theo tranh minh hoạ.
- **v9:**
  - thành phố tự điều khiển, quái vượt ải, boss đánh nhử khi chờ trả lời;
  - giọng đọc tốt hơn, sẵn công cụ giọng Gemini.
- **v10:**
  - chiêu thức điện ảnh, mỗi boss một tuyệt chiêu;
  - bản đồ vẽ lại 3 lớp.
- **v11:** khung xương WebGL, tay chân cử động thật.
- **v12:**
  - đánh boss thật: tự bấm Phi tiêu / Chém / Né, boss báo trước rồi tấn công thật;
  - tuyệt chiêu phải trả lời đúng câu hỏi; độ khó tăng theo trạm;
  - dáng đi nhấc gối hợp tranh nhìn chính diện (sửa lỗi chân đi ngược);
  - nền sân đấu là video lặp dựng bằng Remotion.
- **v16:** chuyển động đa dạng (5 kiểu đứng chờ, phanh gấp, đẩy rào, lộn vòng khi nhảy lúc chạy nhanh, giơ nắm đấm, người quen cúi chào, người đi đường vẫy tay; trong trận: lộn ngược khi né đẹp, khiêu khích 来吧 (lái ba · lại đây nào), boss gầm khi nổi giận và cười khi đánh trúng); rà soát chữ hướng dẫn theo kiểu đánh thật; sao trạm tính cả chiêu chữ; sửa 14 lỗi từ lượt rà soát tổng thể (bấm nhầm khi bảng vừa hiện, câu nghe trên máy không có giọng, nút đánh lại khi thua, nền lộ đường nối, thẻ đấu quái ở 360×640, tên boss bị cắt, ảnh chia sẻ, từ đỡ hụt được lưu vào Sổ ôn, nút vào game ở màn đầu…; danh sách đủ ở `docs/TONG_KET_GAME_DANH_BOSS.md`).
- **v15:**
  - sửa lỗi "ngược hướng người khi di chuyển": dấu góc thân/đầu trong khung xương bị đảo từ v11 → ngả tới thành ngả ra sau (chạy, lao, đá); quái tuần tra quay mặt một hướng mà trượt hướng kia;
  - đi map mượt hơn (nảy hình sin, nén giãn, làm đều nhịp khung hình) và nhiều hiệu ứng: chạy nhanh khi giữ nút, bóng mờ, vệt gió, vệt khí theo màu phi tiêu, bụi + dấu chân theo khu, hạt bay theo khu (bụi nước, đốm sáng, tàn lửa, đom đóm, cánh hoa), nén giãn khi đáp đất.
- **v14:**
  - sửa dứt điểm méo hình nhân vật: khoá biên độ từng khớp (`LIM`), hạ hệ số tay boss có tay che thân; dáng đi/chạy thành **bước nảy** (chân giữ nguyên hình, cả người nảy + lắc như khối cứng);
  - bài kiểm `tools/test/gait.js` viết lại: đi/chạy không uốn chân, có nảy, mọi tư thế của 8 nhân vật trong giới hạn an toàn (bản v13 không đạt: chân bị bẻ 1,35 rad);
  - lối chơi: **nhiệm vụ hằng ngày** (3 cái/ngày, thưởng ⭐), **Tủ đồ** đổi màu phi tiêu bằng ⭐, **rương** khi nhặt đủ 4 chữ vàng một khu.
- **v13:**
  - sửa lỗi phông chữ tiếng Việt (đáp án tiếng Việt bị vẽ bằng phông Trung trong thẻ đấu quái/hội thoại; ký tự ⤒ hiện ô vuông); tự gắn `lang="zh-CN"` cho chữ Hán;
  - dáng đi/chạy mới kiểu hoạt hình cắt giấy (bản v12 chân gần như đứng yên, nhìn như trượt); chạm rào đứng yên; bỏ vệt mờ khi đi thường;
  - trận đánh: khay nút dính đáy màn, câu hỏi tuyệt chiêu vừa 1 màn (trước đây 10/20 câu tràn ở 360×640), bộ đệm phím, câu nghe trên máy không có giọng Trung vẫn hiện chữ + pinyin;
  - lối chơi mới: **Chiêu chữ** (đỡ đòn bằng cách chọn đúng nghĩa từ), **chuỗi HIT**, **phản đòn** sau né đẹp, **Chữ vàng** nhặt trên bản đồ;
  - Sổ ôn có thêm từ chiêu chữ đỡ hụt; Sổ từ có mục Chữ vàng.
- **v11.1:**
  - sửa dáng đi;
  - thêm chào hỏi, khiêu chiến, phản ứng của quái;
  - thêm bộ kiểm thử và hồ sơ bàn giao này.

## 3. Bản đồ repo
```
index.html        trang chủ (CONFIG đầu script: Zalo, TikTok, saleEnd)
index_1.html      chuyển hướng link cũ về /
404.html          trang lỗi
membership.html   trang thẻ hội viên
khachsan.html     game Khách sạn
game.html         game Đánh Boss (≈6.100 dòng, xem docs/KY_THUAT_GAME.md)
CNAME             baokhua.com
v4/               ảnh, âm thanh dùng chung
  sprites/        tranh nhân vật đã tách nền: hero1..3, <boss>-idle|atk|ko
  rig/            khung xương của tranh (lưới + trọng số), sinh bằng tools/art/rig.py
  motion/         nền sân đấu chuyển động (video lặp mp4 + webm)
  vs/ bg/ art/    tranh màn VS, phông sân đấu, tranh màn bắt đầu
  audio/          tiếng đánh, nhạc nền (ogg)
tools/
  art/  cut.py build.py         tách nền ảnh boss gốc → sprites + bảng SPRITE
        joints.js rig.py        ước lượng khớp (MediaPipe) → dựng khung xương v4/rig
        video2sheet.py veo/     video Veo nền xanh → dải khung hình; khung đầu + câu lệnh Veo
  motion/ src/ render.sh        nền sân đấu chuyển động (Remotion) → v4/motion
  voice/ collect.js gen_gemini.py  gom câu tiếng Trung → tạo giọng Gemini (cần GEMINI_API_KEY)
  test/  *.js run-all.sh        kiểm thử tự động bằng Playwright (xem mục 5)
docs/   BAN_GIAO.md (tệp này), KY_THUAT_GAME.md, TONG_KET_GAME_DANH_BOSS.md
  khachsan/  KE_HOACH_CHUYEN_MINH.md (kế hoạch game Khách sạn mới), KAIZEN.md (cải tiến liên tục)
CLAUDE.md          luật làm việc của Xưởng (bắt buộc đọc)
```

## 4. Luật bắt buộc (tóm tắt `CLAUDE.md`, khi khác nhau thì theo `CLAUDE.md`)
1. **Quy trình đăng:**
   - Chỉ làm trên nhánh làm việc.
   - Chỉ đưa lên `main` khi Bảo gõ đúng "duyệt đăng" cho đúng việc đó.
2. **Trước khi báo xong:**
   - Thử ở khung điện thoại 360×640 và 390×844.
   - Không lỗi console.
   - Không gọi máy chủ ngoài (ngoài Zalo, Google Form, TikTok đã có).
3. **Bảo mật:** không commit mật khẩu, khoá API, dữ liệu cá nhân, danh sách học viên hay đại sứ. Khoá API chỉ đặt ở biến môi trường.
4. **Nội dung:**
   - Tiếng Trung luôn kèm pinyin có dấu và nghĩa Việt.
   - Không ghi "miễn phí", không nhắc hoàn tiền, không nhắc S-VIP.
   - Không hứa ngày mở 6–10★ khi chưa chốt.
   - Không ghi ngày khai giảng khi lịch chưa chốt.
   - Câu hỏi HSK là luyện tập theo khung HSK, không phải đề thi chính thức.
5. **Xu, sao, điểm trong game chỉ dùng trong game:**
   - Không đổi ra tiền hay quà có giá trị (Nghị định 147/2024, Điều 57).
   - Hoa hồng giới thiệu tính bằng tiền đồng, gắn giao dịch mua thật, chỉ một cấp.
6. **Kết thúc lượt:** mỗi lượt làm việc kết thúc bằng khối **BÀN GIAO**: đã xong (link, commit), đang vướng, việc cần Bảo duyệt.
7. **Nhận lệnh và báo cáo:**
   - Lệnh hằng ngày: Drive `BAO KHUA - SO CAI/01_LENH_HANG_NGAY`.
   - Báo cáo: `02_BAO_CAO`.

## 5. Chạy và kiểm thử
```bash
cd <repo>
python3 -m http.server 8765 --bind 127.0.0.1      # mở http://127.0.0.1:8765/game.html
npm i -g playwright   # hoặc dùng bản có sẵn; cần Chromium
bash tools/test/run-all.sh                         # bộ kiểm thử chính, in "KẾT QUẢ: ĐẠT" nếu qua
```

| Tệp | Kiểm gì |
|---|---|
| `tools/test/campaign.js` | Máy tự chơi trọn 5 trạm bằng phím. Đạt khi qua 5 trạm, không lỗi console, không gọi ngoài. `GL=1` ép bật khung xương. |
| `tools/test/city.js` | Gặp người, đấu quái, nhảy qua quái nhỏ, Đại quái (sai rồi đúng), tới cổng, vào trận. |
| `tools/test/fight.js` | Đánh thật: máy tự đánh từng trạm (kiểu `gioi` né đúng lúc, kiểu `kem` không né) → thắng/thua, máu mất, số câu hỏi. |
| `tools/test/feint.js` | (Kiểu `quiz`) Boss đánh nhử lúc chờ trả lời không được trừ máu. |
| `tools/test/perf.js` | Khung hình/giây bản đồ và trận, gom lỗi/cảnh báo console. |
| `tools/test/gait.js` | (v14) Dáng nhân vật: đi/chạy không uốn chân + có nảy; 14 tư thế × 8 nhân vật không vượt giới hạn uốn (chống lỗi xé hình). |
| `tools/test/fonts.js` | (v13) Đi qua mọi màn có chữ: chữ Việt không được dùng phông Trung, chữ Hán phải có `lang="zh-CN"`, không có ký tự hiếm dễ hiện ô vuông. |
| `tools/test/poses.js` | (v14) Bảng tư thế 8 nhân vật (`poses`, `walk`, `run`) để soi xé hình bằng mắt trước khi chỉnh `LIM`/`GAIN`. |
| `tools/test/slowmo.js` `maprun.js` `districts.js` `interact.js` | Chụp ảnh / quay chậm để nhìn bằng mắt. |

Móc kiểm thử có sẵn trong game (`window.__bao`):
- Chuyển cảnh, trạng thái: `startStage(i)`, `openMap()`, `WorldMap._tp(x)`, `WorldMap._clearMons()`, `prog`, `st`.
- Trả lời thay người chơi: `forceCorrect()`, `forceWrong()`.
- Ra chiêu: `battle.playHeroAttack(...)`, `battle.playBossAttack()`.
- Quay chậm: `battle._slow(k)`.
- Bản đồ bước tay từng khung (v13): `WorldMap._hold(1)`, `WorldMap._step(dt, n)`, `WorldMap._key(-1|0|1)`, `WorldMap._scr()`.
- Chiêu chữ (v13): `wordPool(trạm)`, `wordStart()`, `st.word` (đang gồng: `.ok` là chỉ số đáp án đúng), `st.wordT` (giây tới chiêu chữ kế).
- Truy cập thẳng: `Rig`, `Chibi`.
- `window.__forceGL = 1` (đặt trước khi tải trang) ép bật WebGL trên máy không có card đồ hoạ.

Máy thử không có card đồ hoạ thì WebGL chạy bằng phần mềm. Khi đó:
- Game tự dùng cách vẽ cũ.
- Ép bật để thử thì có cảnh báo "GPU stall due to ReadPixels". Cảnh báo này chỉ có trên máy thử, điện thoại thật không có.

## 6. Quy trình đăng lên baokhua.com (chỉ sau "duyệt đăng")
1. Chạy `tools/test/run-all.sh` → ĐẠT.
2. Gộp nhánh làm việc vào `main` (giữ nguyên `khachsan.html` nếu Bảo chưa duyệt bản khách sạn mới).
3. Đẩy `main`. GitHub Pages tự đăng trong vài phút.
4. Mở baokhua.com/game.html trên điện thoại kiểm tra lại.
5. Ghi báo cáo vào Drive `02_BAO_CAO`.
6. Đồng bộ nhánh làm việc với `main`.

## 7. Các dây chuyền làm tài sản
| Việc | Cách làm |
|---|---|
| Thêm / thay tranh boss | Ảnh gốc ở Drive `04_GAME/ANH_BOSS_04-11` → `tools/art/cut.py` (tách nền) → `tools/art/build.py` → dán bảng `SPRITE` vào `game.html` (trong `createArena`). |
| Khung xương cho tranh mới | `node tools/art/joints.js <tên>` (cài MediaPipe theo đầu tệp) → `python3 tools/art/rig.py <tên>` → `v4/rig/<tên>.json`. Kiểm tra bằng `tools/test/slowmo.js`. Tranh nên đứng thẳng, tay chân tách khỏi thân, nhìn 3/4. |
| Giọng đọc Gemini | Thêm `GEMINI_API_KEY` vào cài đặt môi trường (không dán vào chat) → `node tools/voice/collect.js` → `python3 tools/voice/gen_gemini.py` → đổi `VOICE_FILES = true` trong game.html. |
| Nền sân đấu chuyển động | Sửa `tools/motion/src/ArenaBg.tsx` → `cd tools/motion && npm i && bash render.sh` (máy chặn tải trình duyệt thì đặt `BROWSER=` tới Chromium có sẵn). Giấy phép Remotion: nhóm tối đa 3 người dùng không cần mua giấy phép công ty. |
| Hoạt hình từng khung (Veo) | Khung đầu nền xanh và câu lệnh ở `tools/art/veo/PROMPTS.md`. Bảo làm video trong Google Flow → bỏ vào Drive `04_GAME/VEO_KHUNG_DAU_05-11` → `tools/art/video2sheet.py` → nối vào sân đấu (chưa làm phần nối). |

## 8. Việc đang chờ / đề xuất làm tiếp (theo thứ tự ưu tiên)
**Chờ Bảo:**
1. Sau 23:59 ngày 11/11 các dòng ưu đãi tự ẩn; cần Bảo chốt chữ ưu đãi mới (nếu có) cho `index.html`, `membership.html`, `game.html` (`SALE_END`, `OFFER_*`).
1a. Duyệt phong cách hình 3D sau giai đoạn 0 (xem bản thử `hotel/proto/`).
2. 4 câu hỏi về giá: 299k là giá gì; giá sau 11/11; thẻ có gồm Zoom không; có gia hạn hoa hồng giới thiệu không.
3. Chỉnh Google Form theo góp ý cũ.
4. Khoá `GEMINI_API_KEY` để có giọng người thật.
5. Video Veo nếu muốn hoạt hình vẽ tay từng khung.

**Đề xuất kỹ thuật:**
1. **Đo trên điện thoại thật** (Android tầm trung, iPhone): khung hình/giây bản đồ và trận. Nếu giật thì:
   - giảm `dpr` tối đa xuống 1.5;
   - giảm số lớp cảnh;
   - hoặc tắt WebGL theo thiết bị.
2. Gắn khung xương cho tranh ra đòn / gục của boss (`-atk`, `-ko`), hoặc thay bằng dải khung hình từ video Veo.
3. Người đi đường dùng tranh minh hoạ (hiện là hình vẽ Chibi), cần tranh mới.
4. Âm thanh bước chân, tiếng môi trường từng khu.
5. Lưu tiến độ lên máy chủ (hiện chỉ lưu trên máy người chơi, `localStorage`, khoá `baokhua_game_v4`).
6. Thống kê: số người chơi, trạm hay bỏ cuộc, câu hay sai. Cần chọn công cụ không vi phạm luật "không gọi máy chủ ngoài", hoặc xin Bảo duyệt thêm link.

## 9. Vấn đề đã biết
- **Khung xương làm cong một bức tranh.** Vì vậy:
  - động tác quá lớn (vung tay quá đầu) vẫn hơi kéo giãn;
  - không quay người được.
- **Tranh vẽ chính diện chỉ uốn được rất ít** (v14). Mọi khớp bị khoá trong `LIM`; dáng đi là bước nảy, không bẻ chân. Muốn động tác lớn hơn thì làm bằng cả thân (lao, xoay, nảy) và hiệu ứng, hoặc vẽ thêm khung hình. Trước khi nới `LIM`/`GAIN` phải chạy `tools/test/gait.js` và xem bảng tư thế (cách làm: vẽ `Rig.pose` của từng tư thế lên một canvas WebGL, xem mục 3 `docs/KY_THUAT_GAME.md`).
- **Kiểm chuyển động phải quay đúng nhịp:** chụp ảnh mất ~0,25 giây/khung nên ảnh chụp liên tiếp bị lệch pha (nhìn như chân rung tại chỗ). Dùng `WorldMap._hold/_step` để bước đúng 1/30 giây mỗi khung.
- **Cân bằng đánh thật chưa thử với người chơi thật:** chỉnh `ACT_DIFF` (máu boss, nhịp đòn, giây báo trước, sát thương), `ACT_HERO`, `WORD_EVERY` / `WORD_SEC` (nhịp và thời gian chiêu chữ) sau khi cho vài học viên chơi thử.
- **Lỗi "đi lùi ngược" / "chân ngược" đã sửa ở v11.1 và v12.** Boss lùi về bằng nhảy lùi (`backstep`). Khi viết động tác mới:
  - nhân vật di chuyển ngược hướng mặt thì dùng nhảy lùi hoặc lộn;
  - không dùng dáng đi tới.
- **Giọng đọc phụ thuộc giọng tiếng Trung có trên máy.** Máy không có giọng thì game hiện pinyin và chỉ cách cài.
- **Nút tải ảnh thành tích không chạy trong bản xem thử claude.ai** (khung xem chặn tải tệp), trên trang thật vẫn chạy.

## 10. Liên hệ và tài liệu khác
- Chủ dự án: Bảo. Liên lạc qua kênh nội bộ của đội. Không ghi số điện thoại hay thông tin cá nhân vào repo.
- Drive "BAO KHUA - SO CAI":
  - `01_LENH_HANG_NGAY`: lệnh.
  - `02_BAO_CAO`: báo cáo, gồm `BAO_CAO_05-11_GAME_DANH_BOSS_V9/V10/V11/V12/V13`.
  - `04_GAME`: ảnh gốc, video Veo.
- Báo cáo bàn giao bản Drive: `02_BAO_CAO/BAN_GIAO_05-11_CHO_NGUOI_TIEP_THEO`.
