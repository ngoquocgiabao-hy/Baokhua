# Tài nguyên miễn phí / mã mở — Bảo Khựa Game

*Nghiên cứu ~30/10/2026 (Asia/Saigon) · chỉ dùng miễn phí, CDN công khai, giấy phép cho phép dùng thương mại.*  
*Đã kiểm tra HTTP 200 (jsDelivr / npm / trang gốc) trừ khi ghi chú khác.*

---

## 1) Engine & đồ họa 3D

| Tên | Link | Giấy phép | Dùng vào việc gì |
| --- | --- | --- | --- |
| **three.js** `0.186.1` (r186) | [npm](https://www.npmjs.com/package/three) · [CDN](https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js) · addons `…/examples/jsm/` | **MIT** | Render WebGL procedural (hero/boss low-poly). v4 pin `0.186.1`. |
| **three.js addons** (GLTFLoader, OrbitControls, …) | `https://cdn.jsdelivr.net/npm/three@0.186.1/examples/jsm/` | **MIT** (cùng three) | Load GLB sau này nếu cần Quaternius; hiện chưa bắt buộc. |
| **postprocessing** (pmndrs) `6.39.5` | [GitHub](https://github.com/pmndrs/postprocessing) · [CDN](https://cdn.jsdelivr.net/npm/postprocessing@6.39.5/build/index.js) | **Zlib** (cho phép thương mại; giữ notice) | Bloom / glow nhẹ trên đòn đánh. Peer: three `>=0.168 <0.187`. Fallback: tắt bloom nếu CDN lỗi. |
| **three.quarks** `0.17.1` | [npm](https://www.npmjs.com/package/three.quarks) · [CDN ESM](https://cdn.jsdelivr.net/npm/three.quarks@0.17.1/dist/three.quarks.esm.js) | **MIT** | Particle hệ thống (tuỳ chọn). Peer three `>=0.182`. **v4 chưa gắn** (ưu tiên perf mobile, giữ particle procedural sẵn có). |
| **three-nebula** `13.2.0` | [GitHub](https://github.com/creativelifeform/three-nebula) · [jsDelivr](https://www.jsdelivr.com/package/npm/three-nebula) | **MIT** | Particle WebGL thay thế. **v4 chưa gắn** (nặng hơn quarks trên máy yếu). |

---

## 2) Tween / chuyển động

| Tên | Link | Giấy phép | Dùng vào việc gì |
| --- | --- | --- | --- |
| **@tweenjs/tween.js** `25.0.0` | [npm](https://www.npmjs.com/package/@tweenjs/tween.js) · [CDN](https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@25.0.0/dist/tween.esm.js) | **MIT** | Làm mượt HP bar, camera shake fade, số damage float. |
| **GSAP** (bản công khai CDN) | [gsap.com](https://gsap.com/) · CDN jsDelivr `gsap` | **Standard “no-charge”** (dự án miễn phí OK; thương mại có điều kiện — **không dùng trong v4** để tránh rủi ro license) | — |

---

## 3) Âm thanh (lib + media)

| Tên | Link | Giấy phép | Dùng vào việc gì |
| --- | --- | --- | --- |
| **howler.js** `2.2.4` | [npm](https://www.npmjs.com/package/howler) · [CDN](https://cdn.jsdelivr.net/npm/howler@2.2.4/dist/howler.min.js) · [unpkg](https://unpkg.com/howler@2.2.4/dist/howler.min.js) | **MIT** | Phát SFX + BGM, mute/unmute, fallback nếu CDN fail. |
| **Kenney — Impact Sounds** | [kenney.nl/assets/impact-sounds](https://www.kenney.nl/assets/impact-sounds) | **CC0** | Gợi ý SFX va chạm/đòn đánh. Kenney xác nhận dùng thương mại, attribution không bắt buộc. *(Mirror tải trực tiếp từ kenney.nl đôi khi bị chặn bot — nên tải tay khi cần.)* |
| **Kenney — UI Audio / Music** | [kenney.nl](https://kenney.nl/) (các pack Audio) | **CC0** | Click UI, nhạc nền nhẹ. |
| **OpenGameArt (lọc CC0)** | [opengameart.org](https://opengameart.org/) | **CC0 / CC-BY** (xem từng file) | SFX/nhạc thay thế; chỉ lấy file ghi rõ CC0 nếu không muốn attribution. |
| **Freesound (lọc CC0)** | [freesound.org](https://freesound.org/) | **CC0** khi chọn đúng license | SFX bổ sung. |
| **SFX/BGM tự tạo (v4/audio/*.ogg)** | `/workspace/game/v4/audio/` | **Tự tạo · dùng tự do cho Bảo Khựa** | hit/crit/hurt/ui/win/bgm_loop — dùng ngay khi mirror Kenney không tải được. |

---

## 4) Nhân vật / model (tùy chọn — v4 không bắt buộc)

| Tên | Link | Giấy phép | Dùng vào việc gì |
| --- | --- | --- | --- |
| **Quaternius — Ultimate Animated Character** | [quaternius.com](https://quaternius.com/packs/ultimatedanimatedcharacter) | **CC0** | Low-poly animated (FBX/OBJ/Blend — cần export GLB). **v4 chưa import** (tránh nặng model; giữ procedural). |
| **Kenney — Animated Characters / Mini Characters** | [kenney.nl](https://kenney.nl/) | **CC0** | Nhân vật đơn giản. Cùng lý do: chưa gắn GLB. |

---

## 5) Dữ liệu tiếng Trung

| Tên | Link | Giấy phép | Dùng vào việc gì |
| --- | --- | --- | --- |
| **CC-CEDICT** | [mdbg.net](https://www.mdbg.net/chinese/dictionary?page=cc-cedict) | **CC BY-SA 4.0** | Từ điển Hán–Anh + pinyin. Dùng thương mại được **nếu attribution + share-alike** khi phân phối dữ liệu phái sinh. |
| **complete-hsk-vocabulary** | [GitHub](https://github.com/drkameleon/complete-hsk-vocabulary) · [CDN JSON](https://cdn.jsdelivr.net/gh/drkameleon/complete-hsk-vocabulary@master/complete.json) | **MIT** (repo; định nghĩa nếu lấy từ CEDICT → vẫn CC BY-SA) | Ngân hàng từ HSK 2.0/3.0. v4 dùng câu tự soạn (hotel/factory); có thể import sau. |
| **Open Language Profiles / Zero to Hero** | [GitHub](https://github.com/openlanguageprofiles/olp-zh-zerotohero) | CEDICT **CC BY-SA 4.0**; phần còn lại **CC0** | Dataset tham khảo. |

---

## 6) CDN & hosting code

| Tên | Link | Giấy phép | Dùng vào việc gì |
| --- | --- | --- | --- |
| **jsDelivr** | https://cdn.jsdelivr.net/ | Dịch vụ CDN miễn phí | Phát three / postprocessing / tween / howler. |
| **unpkg** | https://unpkg.com/ | Dịch vụ CDN miễn phí | Fallback howler nếu jsDelivr lỗi. |

---

## 7) Đã dùng trong `game_v4` (tóm tắt)

1. **three.js 0.186.1** — MIT  
2. **postprocessing 6.39.5** — Zlib (bloom, có fallback)  
3. **@tweenjs/tween.js 25.0.0** — MIT  
4. **howler.js 2.2.4** — MIT (+ unpkg fallback)  
5. **v4/audio/*.ogg** — tự tạo  
6. **Câu hỏi hotel/factory** — tự soạn (VI UI + zh/py/vi); CEDICT/HSK ghi nhận để mở rộng sau  

**Chưa gắn (có trong bảng trên):** three.quarks, three-nebula, Quaternius GLB, Kenney pack đầy đủ (khuyến nghị tải tay CC0).

---

## 8) Ghi chú license thương mại

- **MIT / Zlib / CC0**: dùng thương mại thoải mái (MIT/Zlib giữ notice; CC0 không bắt buộc credit).  
- **CC BY-SA 4.0 (CEDICT)**: được thương mại nhưng phải ghi nguồn + chia sẻ tương thích nếu phát hành dữ liệu phái sinh.  
- **GSAP**: tránh trong bản thương mại trừ khi có license phù hợp → không dùng v4.  
- Không dùng font/ảnh “free for personal only”.
