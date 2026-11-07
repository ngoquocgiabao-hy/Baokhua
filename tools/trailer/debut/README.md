# Video DEBUT v2 (08/11) – 34 giây 9:16, kỹ thuật "nối cảnh" (skill noi-canh-ai)

Chỉ dẫn về baokhua.com, không bán khoá học. Nhạc tự soạn `../debut_music.py` (120 BPM, 17 ô nhịp; chạy quảng cáo trả phí được).

1. Cảnh 3D nối liền: `node tools/film/chain.js <ra> tools/trailer/debut/keys.json 4 30 1080 1920`
   (6 khung khoá → 5 đoạn, mỗi đoạn MỘT động tác máy, tốc độ đều; khung cuối đoạn trước = khung đầu đoạn sau).
   Mã hoá mỗi đoạn: `ffmpeg -framerate 30 -i c01/f%04d.jpg -c:v libx264 -crf 14 clips/w01.mp4` …
2. Cảnh thật: `clips/swim-a|b|c.mp4` cắt 60 fps từ raw `swim_tap1_cau_bai_chay.mp4` giây 70.2 (3.6 s), 75.4 (3.4 s), 67.2 (2.2 s).
3. Đường cong tốc độ + nhòe chuyển động + whoosh (skill noi-canh-ai, `~/.noicanh/noicanh.py`):
   `noicanh.py render planA.json --out out/secA.mp4 --shutter 0.7 --pulse 0.02 --whoosh 0.45 --grain 2`
   `noicanh.py render planB.json --out out/secB.mp4 --shutter 0.7 --pulse 0.015 --whoosh 0.45`
   `noicanh.py render planC.json --out out/secC.mp4 --shutter 0.6 --whoosh 0.25 --grain 2`
4. Chép `secA|B|C.mp4` + `music.wav` vào `public/debut/`, thêm `public/v2-helmet.mp4` (video "Chuyện thật V2" đã duyệt, giây 15.8–17.25),
   `public/ui-ask.jpg`, `star1..5.jpg`, `stage.jpg`; dựng `npx remotion render Debut out/debut-raw.mp4 --codec=h264 --crf=17`
   rồi chuẩn âm lượng `-af loudnorm=I=-14:TP=-1.5`.

| Khung | Cảnh |
|---|---|
| 0–120 | Bảo bơi giữa vịnh: "Mỗi ngày, khách Trung Quốc đến vịnh Hạ Long. Bạn chào họ thế nào?" 你好！nǐ hǎo · Xin chào |
| 120–420 | Thế giới 3D nối liền: toàn vịnh → 大桥 dàqiáo → 酒店 jiǔdiàn → 夜市 yèshì → 摩天轮 mótiānlún → khách sạn về đêm |
| 420–540 | Câu hỏi thật trong game → +xu → khách sạn 1★ → 5★ |
| 540–660 | Bài giảng 10 giây: vì sao 你好 viết nǐ hǎo mà đọc ní hǎo (biểu đồ thanh điệu 3D, tiếng sáo minh hoạ) |
| 660–780 | Ai dạy: Bảo, Á quân 2025, đoạn "Chuyện thật V2", 4 dòng lý lịch |
| 780–840 | Lộ trình HSK0 → HSK4 |
| 840–1020 | baokhua.com, rồi tắt chữ quay về cảnh bơi để video lặp |
