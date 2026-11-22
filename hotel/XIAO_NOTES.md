# Ā Bǎo 消消乐 (xiāoxiāolè · ghép 3 ôn từ) – mini-game của game Khách sạn Vịnh Ā Bǎo

Bản v8.3. Làm 18/11/2026, đăng baokhua.com 19/11/2026 (Bảo duyệt, chốt tên Ā Bǎo 消消乐). Trang chủ có thẻ giới thiệu trong mục `#game`; màn chờ game Khách sạn có nút chơi 消消乐 khi mạng/máy chậm.

## Ý tưởng

Trò ghép 3 (cùng thể loại với các game ghép 3 phổ biến). Chạm, kéo, nổ dây chuyền cho cảm giác "đã tay" tức thì. Phần khác biệt là **đồng hồ chạy rất nhanh**:

- Hết giờ thì trả lời đúng 1 câu tiếng Trung để được **+15 giây** (trả lời trong 3 giây được +20). Trả lời sai mất 1 phao 🛟 (救生圈 jiùshēngquān · phao cứu sinh). Mỗi phòng có 3 phao.
- Bom 💣 (炸弹 zhàdàn · nổ 3×3), búa 🔨 (锤子 chuízi · đập 1 ô, cả thùng và khoá) và xáo bàn 🔀 (洗牌 xǐpái) đều phải trả lời đúng 1 câu mới dùng được.
- Câu hỏi lấy từ **Sổ ôn** của game Khách sạn: thẻ đến hạn hỏi trước, từ vừa trả lời sai hỏi lại sau 2 câu, rồi mới tới từ mới đúng mức tầng.

Tên, hình và màn chơi đều do Bảo Khựa tự làm. Không dùng tên "Crush", hình kẹo, nhân vật hay màn chơi của game khác. Điện thoại xoay ngang (màn thấp ≤ 560 px): bố cục 2 cột, bảng điều khiển trái, bàn chơi phải.

## Luật ghép

| Xếp | Được | Tác dụng |
|---|---|---|
| 3 viên thẳng hàng | – | xoá 3 viên |
| 4 viên thẳng hàng | Sóng 浪 làng | xoá cả hàng (nếu hàng ngang) hoặc cả cột (nếu hàng dọc) |
| hình chữ L hoặc T | Pháo hoa 烟花 yānhuā | nổ 3×3 |
| 5 viên thẳng hàng | Ngọc 宝 bǎo | đổi chỗ với viên nào thì xoá hết màu đó |
| Sóng + Sóng | – | xoá chữ thập |
| Sóng + Pháo hoa | – | xoá 3 hàng và 3 cột |
| Pháo hoa + Pháo hoa | – | nổ 5×5 |
| Ngọc 宝 + Sóng/Pháo hoa | – | biến cả màu đó thành Sóng/Pháo hoa rồi nổ hết |
| Ngọc 宝 + Ngọc 宝 | – | xoá cả bàn ("无敌 wúdí · vô địch") |

Có 6 viên ngọc. Mỗi viên mang một chữ Hán và một hình riêng, nên người khó phân biệt màu vẫn chơi được: 茶 chá (trà, vuông), 灯 dēng (đèn, tròn), 贝 bèi (vỏ sò, hình vỏ sò), 星 xīng (ngôi sao, hình sao), 月 yuè (mặt trăng, lục giác), 水 shuǐ (nước, giọt nước).

Vật cản trên bàn:

- **Cát** 沙 shā: ghép ngay trên ô để dọn, có loại 1 lớp và 2 lớp.
- **Thùng hàng** 箱 xiāng: vỡ khi ghép ngay bên cạnh hoặc khi trúng nổ.
- **Khoá** 锁 suǒ: ghép trúng viên bị khoá để mở.
- **Hành lý** 行李 xíngli: đưa xuống đáy bàn để giao cho khách.

## 20 phòng = 4 tầng khách sạn

| Tầng | Tên | Từ vựng | Ai chơi được |
|---|---|---|---|
| 1 | Sảnh đón 大堂 dàtáng | HSK0 | mọi người |
| 2 | Nhà hàng 餐厅 cāntīng | HSK1 | mọi người |
| 3 | Phòng nghỉ 客房 kèfáng | HSK2 | người có thẻ tự học (như game Khách sạn: bản thường tới 2★) |
| 4 | Sân thượng ngắm vịnh 天台 tiāntái | HSK3 | người có thẻ tự học |

Đồng hồ từng phòng được chỉnh bằng bot mô phỏng người chơi bình thường: người chơi trung bình phải trả lời khoảng 1–3 câu mỗi phòng mới xong. Mô phỏng 30 ván mỗi phòng, trả lời đúng tối đa 5 lần (+75 giây): tầng 1–2 thắng 87–100% số ván, tầng 3–4 thắng 63–100% (khó nhất là phòng 403 và 405). Muốn chỉnh độ khó thì sửa `time` và `map` trong `LEVELS` (`hotel/xiao-core.js`). Kiểm lại bằng `tools/test/xiao-core.js` (bot phải qua đủ 20 phòng).

## Nối với game Khách sạn

- **Xu 🪙 dùng chung.** Mỗi phòng dọn xong được 10 + 5×sao + điểm thưởng (tối đa 20) xu, lần đầu thêm 20. Xu cộng thẳng vào khách sạn. Điểm sao khách sạn được +5 khi xong phòng lần đầu và +5 khi lần đầu đạt 3★. Xu chỉ dùng trong game.
- **Sổ ôn dùng chung.** Mỗi câu trả lời gọi `Learn.met(id, đúng/sai)`: thẻ đến hạn trả lời đúng thì được chấm "Được", trả lời sai thì học lại sau 1 phút. Từ mới vào Sổ ôn.
- **Chỉ một bên ghi tiến độ.** Mini-game chỉ đọc `bk_hotel_v3`, không bao giờ ghi vào đó.
  - Mở trong game Khách sạn (khung `#evt`): gửi `postMessage {type:'bk-xiao', kind:'ready'|'learn'|'done'|'close'}`. Game cộng ngay rồi gửi lại `bk-xiao-state` (xu mới).
  - Mở riêng `hotel/xiao.html`: ghi vào hộp thư `bk_xiao_inbox`. Game Khách sạn nhận hộp thư khi mở, khi quay lại tab, hoặc khi bắt sự kiện `storage`. Số xu nhận có giới hạn theo số phòng.
- **Danh mục từ.** Game Khách sạn ghi `bk_words_v1` (mọi thẻ Sổ ôn kèm mức HSK) mỗi lần mở. Máy chưa mở game Khách sạn thì dùng `hotel/xiao-words.js`, tệp này tự sinh từ COURSE và HALONG bằng `node tools/xiao/build-words.js`. Kiểm thử báo lỗi nếu quên sinh lại.
- **Lối vào từ game Khách sạn:**
  - nút ✨ đầu menu 📍 Đi tới;
  - nút "Ôn N thẻ bằng trò ghép 3" ở tab Ôn tập;
  - sự kiện "Phòng 203 bừa bộn quá!" (🧹) trong vòng sự kiện: dọn xong được thêm +4% hài lòng;
  - đường dẫn sâu `hotel/#xiao`.
- **Lối về.** Nút "🏨 Về khách sạn" hoặc ✕. Khách sạn báo "✨ 消消乐: dọn N phòng · +X 🪙 · ôn Y thẻ" kèm mưa xu.

## Cảm giác "đã" (dopamine) có kiểm soát

- Nốt nhạc ngũ cung cao dần theo dây chuyền. Lời khen tiếng Trung ở giữa màn, luôn kèm pinyin và nghĩa:
  - 好 hǎo · tốt
  - 很好 hěn hǎo · rất tốt
  - 太棒了 tài bàng le · tuyệt quá
  - 厉害 lìhai · giỏi ghê
  - 完美 wánměi · hoàn hảo
- Hạt bắn theo màu viên, rung nhẹ, rung màn khi nổ lớn, điểm bay lên.
- Thắng phòng thì "Pháo hoa vịnh": mỗi giây còn lại thành 1 phát pháo và +50 điểm.
- Thưởng gắn với việc học, không mua bằng tiền thật. Không có mạng/lượt chờ hồi, không hộp quà ngẫu nhiên, không đếm ngược khuyến mãi.

## Thông số hay chỉnh (`hotel/xiao.html`, đầu script)

`RESCUE_SEC` (giây cứu, 15), `FAST_SEC`/`FAST_BONUS` (trả lời nhanh), `PHAO` (3), `RESCUE_MAX` (8), `ASK_SEC` (10 giây/câu), `FREE_ROOMS` (10), `BOOST0` (quyền trợ giúp ban đầu), `TILE` (6 viên), `FLOORS`, `PRAISE`. Màn chơi ở `LEVELS` trong `hotel/xiao-core.js`.

## Kiểm thử

- `node tools/test/xiao-core.js`: luật ghép, đòn ghép, vật cản, rơi bù; bàn đầu không tự nổ và luôn có nước đi; bot qua đủ 20 phòng; bộ từ khớp game Khách sạn.
- `node tools/test/xiao.js tools/test/out 390 844` (và `360 640`): chạy đầu-cuối cả 2 đường (trong khung và chơi riêng), hết giờ → câu hỏi → thắng → xu và Sổ ôn về khách sạn. Yêu cầu 0 lỗi console, 0 gọi máy chủ ngoài, không tràn ngang.
- Móc kiểm thử: `window.__xiao` (`move()`, `answer(ok)`, `setTime(s)`, `speed(k)`, `start(id)`, `go()`), `__hotel.Xiao`.

## v8.4 (22/11) · sướng mắt hơn theo tầng, sôi sục, phòng VIP, khu trò chơi

- **Hiệu ứng theo tầng** (`tier` = tầng 1–4, phòng VIP +1):
  - nền sống sau bàn (`#amb`): đốm sáng mọi tầng, đèn lồng đỏ bay lên từ tầng 2, sao lấp lánh từ tầng 3, pháo hoa nền ở tầng 4;
  - số hạt bắn ×1 / ×1,25 / ×1,55 / ×1,9 (`PMUL`);
  - viên rơi chạm đáy thì nảy, viên đặc biệt lấp lánh;
  - sóng xung kích khi dây chuyền ≥ 3 (từ tầng 2) hoặc khi nổ;
  - viền bàn sáng sau dây chuyền lớn;
  - đếm liên hoàn "×N 连击 liánjī";
  - băng rôn cắt ngang màn hình khi dây chuyền dài (tầng 3–4 từ ×4, tầng 1–2 từ ×5), khi có Ngọc 宝, khi Vô địch 无敌;
  - "+giây" bay về thanh giờ.
- **沸腾 fèiténg · sôi sục:** mỗi viên xoá nạp thanh (dây chuyền nạp nhanh hơn). Thanh càng ngắn ở tầng cao (70 → 52). Đầy thanh thì 7 + tầng giây điểm ×2, đồng hồ đứng, bong bóng suối nổi lên, viền bàn cầu vồng.
- **Phòng VIP hôm nay** (`?vip=1`, nút trên bản đồ và trong khu trò chơi):
  - bàn chơi lấy hạt giống theo ngày, nên mọi người (cùng loại thẻ) chơi cùng một bàn;
  - thắng lần đầu trong ngày được xu ×2 và +3 điểm sao.
- **Khu trò chơi Suối nóng** (`arcade.html`): mở 消消乐 bằng `?from=arcade`, chơi xong nút "♨️ Khu trò chơi" đưa về khu trò chơi. Thắng phòng và mỗi câu trả lời đúng đều cộng vào nhiệm vụ suối nóng (`bk_arcade_v1`).

## v8.5 (22/11) · âm thanh trong trẻo

- Dùng bộ âm thanh chung `hotel/bk-audio.js` (xem `hotel/AUDIO_NOTES.md`): ghép viên = gảy đàn tranh theo ngũ cung, 5 giây cuối = mõ gỗ, sai = đàn bầu trượt xuống, sôi sục = lướt dây + chuông gió. Không còn sóng vuông/răng cưa.
- Nhạc lofi rất nhỏ dưới nền, tự hạ khi hiện câu hỏi; tắt nhạc nền trong game Khách sạn thì ở đây cũng không phát.
- Sửa lỗi: hai hàm cùng tên `unlock` đè nhau nên mỗi lần chạm bàn đều kêu "bíp". Nay `Sfx.wake()` mở âm thanh, `Sfx.unlock()` là tiếng mở khoá.
