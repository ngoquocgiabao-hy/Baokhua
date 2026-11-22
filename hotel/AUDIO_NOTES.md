# Âm thanh v8.5 · trong trẻo, không sạn, âm sắc Việt + Trung Hoa, vẫn lofi chill

Làm 22/11/2026 theo yêu cầu của Bảo: "làm cho trong trẻo hơn, bỏ sạn sạn đi, thêm nhiều âm sắc Việt như sáo hoặc cả Trung Hoa nhưng vẫn phải lofi chill". Bảo "duyệt đăng" 22/11, đã lên baokhua.com.

## Một bộ âm thanh chung: `hotel/bk-audio.js`

Game Khách sạn (`index.html`), Ā Bǎo 消消乐 (`xiao.html`) và Ngâm chill 泡温泉 (`chill.html`) cùng dùng một tệp. Mọi tiếng đều tự tổng hợp bằng Web Audio: không tệp nhạc, không CDN, không gọi máy chủ ngoài. Game Khách sạn thôi tải 4 tệp `v4/audio/*.ogg`; game Đánh Boss (`game.html`) vẫn dùng các tệp đó, không đổi.

### Nhạc cụ

| Nhạc cụ | Hàm | Cách làm cho giống |
|---|---|---|
| Sáo trúc | `sao` | tiếng gần như thuần, hơi thổi thoảng suốt nốt, luyến từ nốt trước, láy từ nốt trên, rung hơi vào muộn |
| Đàn tranh | `tranh`, `gliss` | gảy dây thép: sáng lúc gảy rồi dịu dần; nhấn (bấm dây từ nốt dưới lên), uốn lên, rung cuối nốt; lướt dây trước mỗi câu mới |
| Đàn bầu | `bau` | tiếng bồi âm rất trong, ngân dài; vuốt cần sang nốt mới, uốn lên rồi trả về, rung sâu |
| Mõ gỗ | `mo` | tiếng "cốc" trong, thay trống con trong nhạc, thay tiếng bấm nút, đếm giây cuối ở 消消乐 |
| Chuông gió | `chime` | tiếng thuần + bồi âm lệch kiểu chuông, ngân dài; thoảng qua đầu ô nhịp, dùng cho xu và lên sao |
| 二胡 èrhú · đàn nhị | `nhi` | kéo vĩ, vào nốt từ từ, trượt giữa các nốt, rung nhanh; lọc bớt tiếng cao cho khỏi chói |
| 琵琶 pípá · tỳ bà | `pipa` | gảy sáng, tắt nhanh; nốt dài thì vê (轮指 lúnzhǐ · vê ngón) |
| 箫 xiāo · tiêu | `tieu` | sáo dọc trầm, nhiều hơi, vào nốt chậm |
| Nền lofi | `ep`, `bass`, `kick`, `shaker` | piano điện ấm có rung băng rất nhẹ, bass tròn, trống mềm có swing |

### Vì sao hết "sạn"

- Bỏ tiếng đĩa than (tiếng lách tách là nguồn rè chính của bản cũ).
- Bỏ sóng vuông và răng cưa ở mọi hiệu ứng (bản cũ: tiếng bấm, tiếng sai, xu, đồng hồ, sôi sục, băng rôn…).
- Sửa lỗi ở 消消乐: hai hàm cùng tên `unlock` đè nhau nên **mỗi lần chạm bàn chơi đều kêu "bíp" sóng vuông**. Nay `wake()` chỉ mở âm thanh, `unlock()` là tiếng mở khoá.
- Cuối chuỗi có nén nhẹ + chặn đỉnh: nhiều nốt chồng nhau không bị vỡ tiếng. Đo: đỉnh 0,67–0,74 (trần là 1), mức trung bình khoảng −18 dBFS, 0 mẫu chạm trần.
- Có vang phòng ảo (tiếng cao tắt nhanh hơn tiếng trầm nên ấm, không xì). Máy bật tiết kiệm pin trong game Khách sạn thì bỏ vang.
- Lọc "màu theo giờ" mở rộng hơn (ngày 7000 Hz, tối 4300 Hz, khuya 2700 Hz; bản cũ 2600/1800/1250 Hz nên đục).

## 5 bài lofi tự soạn (`BKAudio.TRACKS`)

| Bài | Chữ Hán | BPM | Nhạc cụ |
|---|---|---|---|
| Sóng Bãi Cháy | 海浪 hǎilàng · sóng biển | 72 | đàn tranh · sáo trúc |
| Chiều Hòn Gai | 黄昏 huánghūn · hoàng hôn | 80 | sáo trúc · đàn bầu · đàn tranh |
| Đêm Tuần Châu | 夜晚 yèwǎn · ban đêm | 64 | đàn tranh · tiêu 箫 xiāo |
| Trăng Hạ Long (mới) | 月光 yuèguāng · ánh trăng | 68 | đàn bầu · sáo trúc · đàn tranh |
| Trà chiều phố biển (mới) | 茶馆 cháguǎn · quán trà | 76 | đàn nhị 二胡 èrhú · tỳ bà 琵琶 pípá · tiêu 箫 xiāo |

Mỗi bài 8 ô nhịp × 4 vòng rồi sang bài: vòng 1 giai điệu chính · vòng 2 thêm bè · vòng 3 nghỉ, ứng tác thưa theo thang âm của bài · vòng 4 giai điệu đổi nhạc cụ. Ngày có trống mềm, tối dịu hơn, khuya (23–6 giờ trong game) tắt trống. Game Khách sạn báo "🎵 Đang phát: tên bài · chữ Hán pinyin · lofi tự soạn · nhạc cụ"; nút ⏭️ đổi bài trong "Của tôi" vẫn như cũ. Muốn thêm bài: thêm một mục vào `TRACKS` (giai điệu `mel` 8 ô nhịp, hợp âm `ch`, bass `bs`, nhạc cụ `lead`/`alt`/`har`/`imp`).

## Mỗi trò dùng thế nào

- **Game Khách sạn:** cả 5 bài + tiếng sóng vịnh rất nhỏ; giữ `MUSIC_VOL`, `MUSIC_FILES`, hạ nhạc khi đọc tiếng Trung (`Snd.duck`). Tiếng bấm nút = mõ gỗ, sai = đàn bầu trượt xuống, xu = chuông nhỏ theo ngũ cung, xây đồ = mõ + đàn tranh, lên sao = lướt dây đàn tranh + chuông gió.
- **Ā Bǎo 消消乐:** nhạc rất nhỏ dưới nền (Chiều Hòn Gai, Trà chiều phố biển, Sóng Bãi Cháy), tự hạ khi hiện câu hỏi; tắt nhạc nền trong game Khách sạn thì ở đây cũng không phát. Ghép viên = gảy đàn tranh, dây chuyền càng dài nốt càng cao; 5 giây cuối = mõ gỗ; sôi sục 沸腾 fèiténg = lướt dây + chuông. Nút 🔇 tắt cả nhạc lẫn hiệu ứng.
- **Ngâm chill 泡温泉:** nhạc không trống (Trăng Hạ Long, Đêm Tuần Châu, Sóng Bãi Cháy), giọt nước, chạm đúng = gảy đàn tranh + chuông, xong lượt = lướt dây + sáo.

## Kiểm thử

`node tools/test/audio.js tools/test/out` (có trong `run-all.sh`):

- dựng ngoại tuyến (OfflineAudioContext) đoạn dày nhất của từng bài: không NaN, không chạm trần, mức −34…−12 dBFS, ít năng lượng tần cao;
- xếp lịch trọn 5 bài × 3 tâm trạng không lỗi;
- mã âm thanh không còn `square`, `sawtooth`, đĩa than;
- chạy thật ở khung 390×844: nhạc bật ở cả 3 trò, 🔇 tắt được, 0 lỗi console, 0 gọi máy chủ ngoài.

Thêm `--demo` để xuất bản nghe thử `tools/test/out/bk-audio-demo.mp3` (khoảng 2 phút: 5 bài + bộ hiệu ứng).
