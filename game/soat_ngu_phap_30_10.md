# Soát ngữ pháp / pinyin / nghĩa / phương pháp dạy — 30/10/2026

*Biên tập viên học liệu · Asia/Saigon · Chỉ đọc nguồn, không sửa file gốc*  
*Phạm vi: `series_v11/` · `kich_ban_tuan1.md` · `editor/` (kịch bản + video02–04) · `lop1_slide.pdf` · `baokhua-marketing/tuan1.md` · `lop0211_dem_nguoc.md`*

---

## 1) Tóm tắt theo mức độ

| Mức độ | Số lỗi | Định nghĩa áp dụng |
|--------|--------|--------------------|
| **Nghiêm trọng** | **0** | Sai nghĩa / sai ngữ pháp gây hiểu lầm |
| **Trung bình** | **4** | Sai thanh/pinyin, câu hoặc nhãn không tự nhiên, vỡ format học |
| **Nhẹ** | **8** | Dấu câu, định dạng pinyin, thiếu pinyin/nghĩa (luật đội) |
| **OK (đã kiểm)** | Câu lõi chính | 请出示护照 / 下龙湾 / 质量问题 / 欢迎光临 / 跟我来 / 5 câu giáo án — chữ Hán + pinyin có dấu **đúng** |

**Kết luận ngắn:** Không phát hiện lỗi ngữ pháp/pinyin làm sai nghĩa ở các câu lõi. Vấn đề chủ yếu là **gán nghề sai**, **thiếu nghĩa VI trên tip/slide ôn**, và **một khung chữ video bị chen CTA**.

---

## 2) Bảng lỗi

| File | Dòng/Giây | Sai gì | Sửa thành gì | Mức độ |
|------|-----------|--------|--------------|--------|
| `/workspace/baokhua-marketing/tuan1.md` | mục «Hoạt động luyện», dòng ~91 | Gán **HDV (câu 2–3)** trong đó câu 2 là 请出示一下您的护照 (câu **lễ tân nhận phòng**, không phải HDV dẫn đoàn) → dễ dạy sai ngữ cảnh | HDV: câu 3 (+ tùy câu hỏi đoàn); Lễ tân: câu 2 + câu 5 (+ câu 1). Câu đúng cho lễ tân: **请出示一下您的护照。** *Qǐng chūshì yíxià nín de hùzhào.* = Anh/chị vui lòng cho em xem hộ chiếu ạ. | Trung bình |
| `/workspace/media/lop1_slides/02_cau2.png` (= trang 3 PDF) | nhãn đầu thẻ «Câu 2/5 · **Lễ tân / HDV**» | Nhãn nghề gắn HDV vào câu hộ chiếu — cùng lỗi gán nghề | Đổi nhãn thành «Câu 2/5 · **Lễ tân**». Giữ câu: **请出示一下您的护照。** *Qǐng chūshì yíxià nín de hùzhào.* = Anh/chị vui lòng cho em xem hộ chiếu ạ. | Trung bình |
| `/workspace/editor/xuat/video01_gameplay_proto3d_b4.mp4` | UI nút vàng (~suốt clip; frame ~8–22s) | Chữ **问问** gắn nhãn «Hỏi» (mở câu hỏi game). **问问** *wènwen* = hỏi thăm / hỏi quanh — **không** phải nút «mở câu quiz» | Đổi UI thành **提问** *tíwèn* = đặt câu hỏi; hoặc **答题** *dátí* = trả lời bài; hoặc chỉ để «Hỏi» VI nếu không cần Hán trên nút | Trung bình |
| `/workspace/editor/xuat/video03_cau_baichay_genwolai.mp4` | ~18s (frame 1fps #18) | Khung 3 dòng bài học bị chen: dòng giữa lẽ ra pinyin nhưng hiện CTA kiểu «Lưu câu hỏi link ở bio» trong lúc vẫn còn 跟我来！ / Theo tôi nào! → vỡ luật 3 dòng Hán/pinyin/nghĩa | Tách CTA ra 1 dòng riêng (như các clip khác: `Lưu câu • link ở bio`). Giữ 3 dòng: **跟我来！** *Gēn wǒ lái!* = Theo tôi! / Anh/chị đi theo em ạ! | Trung bình |
| `/workspace/media/series_v11/build_v11.py` | `TIP["ep3"]` dòng ~151; frame `qa/tap3/f_12.jpg` | Tip **质量问题** + *zhìliàng wèntí* **thiếu nghĩa tiếng Việt** (ep1/ep2 đều có dòng `= …`) | Thêm dòng: `= vấn đề chất lượng`. Đầy đủ: **质量问题** *zhìliàng wèntí* = vấn đề chất lượng | Nhẹ |
| `/workspace/media/lop1_slides/06_ket.png` (= trang 7 PDF) | cả khối «Ôn lại 5 câu» | 5 câu Hán **không** kèm pinyin + nghĩa VI (vi phạm luật đội) | Mỗi câu 3 dòng, ví dụ: **您好，我叫阿宝。** *Nín hǎo, wǒ jiào Ābǎo.* = Xin chào anh/chị, tôi tên A Bảo. (và 4 câu còn lại như giáo án) | Nhẹ |
| `/workspace/baokhua-marketing/tuan1.md` · `lop1_slide` · series | pinyin câu 5 / slide 5 | Viết **zhè biān** tách từ; chuẩn từ điển thường **zhèbiān** | **这边** *zhèbiān* = bên này | Nhẹ |
| `/workspace/baokhua-marketing/tuan1.md` · slide 1 | pinyin tên | **Ā Bǎo** (có khoảng) dễ đọc như họ+tên; biệt danh thường **Ābǎo** | **阿宝** *Ābǎo* = A Bảo | Nhẹ |
| `/workspace/editor/xuat/video04_halong_xialongwan.mp4` | chữ nghĩa VI (~suốt đoạn bài, frame 5–10s) | Nghĩa trên màn: «Hôm nay mình đi Vịnh Hạ Long **nhé?**» — **rút** so với giáo án/kịch bản có «…nhé, **được không ạ?**» trong khi Hán có **好吗** | Đồng bộ: **今天我们去下龙湾，好吗？** *Jīntiān wǒmen qù Xiàlóng Wān, hǎo ma?* = Hôm nay mình đi Vịnh Hạ Long nhé, được không ạ? | Nhẹ |
| `/workspace/editor/kich_ban_5_video.md` | bảng map session ~244–251 | Các cụm **跟我来** · **有我在** · **海边** · **谢谢** · **再见** (ở một số dòng) **không** kèm pinyin + nghĩa | Bổ sung, ví dụ: **跟我来** *Gēn wǒ lái* = theo tôi; **有我在** *Yǒu wǒ zài* = có tôi ở đây; **海边** *hǎibiān* = ven biển; **谢谢** *xièxie* = cảm ơn; **再见** *zàijiàn* = tạm biệt | Nhẹ |
| `/workspace/editor/xuat/video03_…mp4` | tên file `…baichay…` vs hình | Tên gợi Bãi Cháy/lễ tân nhưng hình = bơi/vịnh (Hạ Long) — lệch nhãn địa điểm so với câu dạy | Đổi tên file/mô tả cho khớp ngữ cảnh vịnh; hoặc quay lại cảnh lễ tân nếu muốn câu khách sạn. Câu hiện tại vẫn đúng: **跟我来！** *Gēn wǒ lái!* = Theo tôi! | Nhẹ |
| series LESSON vs marketing | nghĩa câu hộ chiếu | Series/kịch bản: «Anh/chị **cho em xem** hộ chiếu ạ.» · Giáo án/slide: «Anh/chị **vui lòng cho em xem**…» — cùng nghĩa, lệch lịch sự nhẹ | Chọn **một** bản: ưu tiên giáo án *vui lòng…* cho lễ tân. **请出示一下您的护照。** *Qǐng chūshì yíxià nín de hùzhào.* = Anh/chị vui lòng cho em xem hộ chiếu ạ. | Nhẹ |

### Đã kiểm — **không** ghi lỗi (tránh bịa)

| Câu | Pinyin | Nghĩa | Ghi chú |
|-----|--------|-------|---------|
| 请出示一下您的护照。 | Qǐng chūshì yíxià nín de hùzhào. | Anh/chị vui lòng cho em xem hộ chiếu ạ. | *yíxià* đúng biến điệu (一 trước thanh 4) |
| 今天我们去下龙湾，好吗？ | Jīntiān wǒmen qù Xiàlóng Wān, hǎo ma? | Hôm nay mình đi Vịnh Hạ Long nhé, được không ạ? | 下龙湾 đúng tên Trung của Vịnh Hạ Long |
| 这个有质量问题。 | Zhège yǒu zhìliàng wèntí. | Cái này có vấn đề chất lượng. | Tự nhiên cho QC |
| 您好，我叫阿宝。 | Nín hǎo, wǒ jiào Ābǎo. | Xin chào anh/chị, tôi tên A Bảo. | OK |
| 请跟我来，这边是电梯。 | Qǐng gēn wǒ lái, zhèbiān shì diàntī. | Anh/chị đi theo em, thang máy bên này ạ. | OK (chỉ chỉnh ghép *zhèbiān*) |
| 你会说中文吗？ | Nǐ huì shuō Zhōngwén ma? | Anh/chị nói được tiếng Trung không? | `lop0211_dem_nguoc.md` A |
| 我是导游。 | Wǒ shì dǎoyóu. | Tôi là hướng dẫn viên. | Bài B |
| 今天晚上八点上课。 | Jīntiān wǎnshang bādiǎn shàngkè. | Tối nay 8 giờ vào lớp. | Bài C; *wǎnshang* thanh nhẹ OK |
| 欢迎光临！ | Huānyíng guānglín! | Xin chào quý khách! / Hân hạnh đón tiếp! | video02 + video01 |
| 跟我来！ | Gēn wǒ lái! | Theo tôi! | video03 (nghĩa «Theo tôi nào!» hơi thân mật nhưng chấp nhận được ngoài trời/bơi) |
| 加油！ | Jiāyóu! | Cố lên! | kịch bản video 5 (chưa có bản xuất sạch) |

---

## 3) Đánh giá phương pháp dạy (theo file)

| Nguồn | Có tình huống nghề thật? | Câu thực chiến? | Gợi ý cải thiện |
|-------|---------------------------|-----------------|-----------------|
| **series_v11** (3 tập) | Có: lễ tân hộ chiếu · HDV vịnh · QC vải | Có; đúng 3 dòng Hán/pinyin/nghĩa trên LESSON | Thêm nghĩa VI cho tip ep3; đồng bộ nghĩa câu hộ chiếu với giáo án; cảnh tip ep1 (đưa thẻ) khớp 出示 |
| **kich_ban_tuan1.md** | Có (quầy / bến / bàn kiểm vải GIẢ ĐỊNH) | Có; beat + chữ 3 dòng rõ | Giữ nguyên câu; khi quay nhấn đúng *chūshì* / *wān* / *zhìliàng* |
| **editor/kich_ban_5_video.md** | Có (nối tuần 1 + gameplay) | Có | Bổ sung pinyin+nghĩa cho cụm map session; video 5 chờ record |
| **editor video02** (`…huanying`) | Có (khách sạn Jayden / sảnh) | **欢迎光临** đúng nghề lễ tân | OK đăng sau duyệt; giữ 3 dòng |
| **editor video03** (`…genwolai`) | Tình huống **bơi/vịnh** (không phải quầy Bãi Cháy như tên file) | **跟我来** dùng được cho HDV/đoàn ngoài trời | Đổi tên/mô tả cho khớp vịnh; sửa frame ~18s không chen CTA vào dòng pinyin; nghĩa có thể lịch sự hơn: «Anh/chị đi theo em ạ!» |
| **editor video04** (`…xialongwan`) | Có (vịnh Hạ Long) | **下龙湾** đúng | Đồng bộ nghĩa VI với giáo án (thêm «được không ạ?») |
| **editor video01** gameplay | Game proto (không phải ca thật) | **欢迎光临** OK; nút **问问** lệch nghĩa | Đổi nhãn Hán nút; bản FAIL dựng (hook/UI) — chờ proto đạt |
| **lop1_slide.pdf** (+ PNG) | Có nhãn nghề từng câu | 5 câu lõi đúng | Sửa nhãn câu 2; slide ôn lại thêm pinyin+nghĩa |
| **tuan1.md** giáo án | Role-play 3 nghề | 5 câu lõi đúng | Sửa bảng chia nhóm nghề (mục §2 trên) |
| **lop0211_dem_nguoc.md** | Câu đăng Zalo (đếm ngược lớp) | 3 câu đúng, có pinyin+nghĩa | OK; câu lớp không phải câu nghề Hạ Long — chấp nhận cho tin đếm ngược |

---

## 4) Mục chưa soát được / hạn chế

| Hạng mục | Lý do |
|----------|--------|
| File âm thanh `series_v11/audio/norm/*.wav` | Không chạy ASR trong lượt này — **chưa đối chiếu** giọng nói với chữ trên màn (chỉ soát chữ trong `build_v11.py` + frame). Thu âm cũ `bao_thu_am_1.m4a` đã được kho tư liệu cảnh báo máy nhận sai 出示 — **chưa nghe lại** tại đây. |
| `lop1_slide.pdf` bằng `pdftotext` | PDF raster (7 trang ảnh) → text rỗng; đã soát qua PNG `lop1_slides/00_bia.png`…`06_ket.png` (cùng nội dung theo README). |
| Still cũ `editor/xuat/_v03_f0.jpg` / `_v03_mid.jpg` | **Không khớp** `video03_…mp4` hiện tại (still cũ: người kính + chữ nguồn kiểu 旅行证件…; mp4 hiện tại: bơi + 跟我来). Đã ưu tiên mp4 + frame ffmpeg mới. |
| `video05` / bản 加油 gameplay sạch | Kịch bản có chữ; **chưa có file xuất** đạt — ghi trong kịch bản «cần record». |
| Toàn bộ timeline audio TTS/giọng người trong series_v11 mp4 | Chỉ đọc chữ burn-in + source Python; **không** chấm phát âm thanh điệu từng sample. |
| Ảnh plate không chữ (`plates/*`, `kiem_vai/*`, phần lớn `le_tan/*`) | Không có Hán để soát ngữ pháp. |

---

## 5) Đường dẫn báo cáo

`/workspace/game/soat_ngu_phap_30_10.md`

---

=== BÀN GIAO ===  
Gửi: Dev IT / Media / Tổng giám đốc  
Nội dung: Báo cáo soát ngữ pháp — 0 nghiêm trọng · 4 trung bình · 8 nhẹ; ưu tiên sửa (1) chia nhóm nghề + nhãn slide câu 2, (2) tip ep3 thêm nghĩa VI, (3) slide ôn lại thêm pinyin+nghĩa, (4) video03 tách CTA khỏi dòng pinyin, (5) nút 问问 trên video01.  
Hạn: trước lớp 20:00 02/11/2026 (Asia/Saigon) — ưu tiên giáo án + slide.  
=== CHỦ DUYỆT ===  
Không (chỉ báo cáo nội bộ; không đăng / không sửa live)
