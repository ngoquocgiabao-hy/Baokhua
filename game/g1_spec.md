# SPEC GĐ1 MVP – TU SĨ ANKI (HSK1–3) · BOSS ĐƠN · LINH ĐAN · CỬA HÀNG (QA/Thiết kế, 30/10/2026)
Lệnh TGĐ 07:40: chỉ làm MVP. PvP với bot ĐÓNG BĂNG (không làm, không hiện nút). Tu vi chỉ mở HSK1–3.
Mọi chữ Hán hiển thị kèm pinyin dấu thanh; nghĩa tiếng Việt chỉ hiện SAU khi trả lời (theo v7). Lưu tiến độ bằng localStorage (0đ, không server).

## 1. Tu sĩ Anki (ôn thẻ)
- Lặp lại ngắt quãng kiểu SM-2 rút gọn. Mỗi thẻ có hộp 0–5, khoảng ôn: 0 phút / 10 phút / 1 ngày / 3 ngày / 7 ngày / 21 ngày.
- Mặt trước: chữ Hán + pinyin (hoặc âm thanh). Mặt sau: nghĩa + ví dụ. Chọn đáp án nhanh 4 lựa chọn (không tự chấm "nhớ/quên" để chống gian).
- Đúng: lên 1 hộp. Sai: về hộp 0. Một phiên gồm 20 thẻ (15 thẻ đến hạn + 5 thẻ mới), khoảng 3–4 phút.
- Điểm tu vi (TV): đúng thẻ mới +5, đúng thẻ ôn +3, đúng trong 3s +1. Sai 0 (không trừ). Mỗi ngày tối đa 600 TV để chống cày.

## 2. Cấp tu vi (theo HSK)
| Cấp | HSK | Số từ cần "thuộc" (hộp ≥3) | TV mở khóa |
|---|---|---|---|
| Luyện Khí | 1 | 150 (≥80% bộ HSK1) | 0 |
| Trúc Cơ | 2 | +150 | 1.500 |
| Kim Đan | 3 | +300 | 4.000 |
| Nguyên Anh → Chiến Thần | 4–9 | – | thẻ mờ chữ "Sắp ra mắt" |
- Lên cấp cần ĐỦ CẢ HAI điều kiện: TV và ≥80% từ của cấp đó ở hộp ≥3. Bài kiểm tra đột phá: 20 câu, đúng ≥16 câu.
- Thẻ HSK4–9: hiện mờ, chữ "Sắp ra mắt", KHÔNG giá, KHÔNG nút mua, không bấm được (chạm thì không xảy ra gì).
- Mỗi cấp +5% sát thương trong trận (Kim Đan +15%).
- GIẢ ĐỊNH: Biên Tập Viên cung cấp JSON 600 từ HSK1–3 (có pinyin + nghĩa); chạy thử được ngay với 300 từ HSK1–2.

## 3. Linh đan (tiền trong game, không mua bằng tiền thật)
- Boss màn: thắng lần đầu được 30 linh đan, thắng lại được 10. Thắng không mất máu thưởng thêm 10.
- Anki: mỗi thẻ đúng có 5% rơi 1–3 linh đan. Hoàn thành phiên 20 thẻ thưởng chắc chắn 5.
- Người chơi đều đặn (2 boss + 3 phiên Anki/ngày) kiếm khoảng 50 linh đan/ngày. Món thường mua được sau 1–2 ngày, món hiếm sau 5–6 ngày. Linh đan lưu offline bằng localStorage.

## 4. Cửa hàng trang bị (3 ô: vũ khí, áo, bùa)
| Món | Giá | Hiệu quả |
|---|---|---|
| Kiếm Gỗ Đào | 50 | +5 sát thương mỗi câu đúng |
| Kiếm Đá Vôi | 250 | +10 sát thương |
| Áo Sương Vịnh | 60 | +15 HP tối đa |
| Giáp Ngọc Trai | 280 | +30 HP tối đa |
| Bùa Thời Gian | 80 | +2 giây mỗi câu |
| Bùa Gợi Ý | 120 | 1 lần/trận loại 2 đáp án sai |
- Mỗi ô chỉ trang bị 1 món. Tổng chỉ số tối đa +10 sát thương, +30 HP, +2 giây, để cân bằng trận đấu không vỡ.
- Không bán trang bị bằng tiền thật trong GĐ1.

## 5. Boss đơn
- Dùng lại combat + BALANCE v7 (boss màn 1 có 450 HP). Mỗi cấp tu vi mở 1 boss: Luyện Khí → Thủy Quái Vịnh, Trúc Cơ → Thạch Ma Đá Vôi, Kim Đan → Hỗn Ngữ (2 pha).
- Câu hỏi boss lấy từ bộ HSK của cấp hiện tại.
- Mục tiêu: đúng 60% thì thắng trong 3 lần thử từ 72–85%.

## 6. Tiêu chí nghiệm thu (số)
1. 0 thẻ hay câu boss nào hiện nghĩa tiếng Việt trước khi trả lời.
2. 100% chữ Hán có pinyin dấu thanh.
3. Khoảng ôn đúng bảng §1, sai lệch ≤1 phút (test bằng đồng hồ giả lập).
4. TV cộng đúng luật §1, chặn ở 600 TV/ngày.
5. Lên cấp chỉ khi đủ TV + ≥80% từ ở hộp ≥3 + kiểm tra đột phá ≥16/20.
6. HSK4–9: 0 giá, 0 nút mua, chạm không có phản hồi (QA quét DOM).
7. Linh đan: mô phỏng 1000 ngày chơi đều được 40–60 linh đan/ngày.
8. Boss Monte Carlo 1000 ván/nhân vật ở độ chính xác 60%: thắng trong 3 lần thử từ 72–85%; 0 nút PvP trong DOM.
9. Tắt rồi mở lại trang không mất tiến độ (localStorage); chạm nhanh 50 lần không cộng thưởng 2 lần.
10. Màn 320x568: nút ≥44px; mở màn Anki ≤1s, phiên 20 thẻ không lỗi console.

## 7. Thứ tự làm (Dev IT)
B1 Anki + TV + lưu → B2 cấp tu vi + đột phá → B3 boss đơn + linh đan + cửa hàng → gửi QA. (PvP đóng băng.)
