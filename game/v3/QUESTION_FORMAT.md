# Định dạng câu hỏi (game_v4 / game_v5)

Mảng `QUESTIONS` (hoặc `QUESTIONS_RAW` trước khi `normalizeQ`) dùng **đúng 9 field bắt buộc** dưới đây. Field phụ (type, optionPy, …) là tùy chọn — câu hỏi chỉ có 9 field vẫn chạy được (mặc định `type: "mc"`).

## 9 field bắt buộc

| Field | Kiểu | Ý nghĩa |
|-------|------|---------|
| `id` | string | Mã câu: `bc-01`, `bc-02`, … (Bãi Cháy); `cp-01`, … (Cẩm Phả) |
| `chang` | string | Tên chặng / màn |
| `ngon_ngu` | `"zh"` \| `"en"` | Ngôn ngữ câu hỏi chính |
| `do_kho` | number | Độ khó (1 = dễ, 2 = khó hơn) |
| `cau_hoi` | string | Đề bài (tiếng Việt trên UI) |
| `dap_an` | string[4] | Đúng **4** lựa chọn |
| `dung` | number | Chỉ số đáp án đúng (0–3) |
| `pinyin` | string | Pinyin của câu / đáp án chính |
| `giai_thich` | string | Nghĩa tiếng Việt / giải thích |

## Ví dụ (bc-01)

```json
{
  "id": "bc-01",
  "chang": "Bãi Cháy – Lễ tân",
  "ngon_ngu": "zh",
  "do_kho": 1,
  "cau_hoi": "Khách đến quầy lễ tân — câu nào hỏi số người trong đoàn?",
  "dap_an": ["请问您几位？", "我要退房。", "请戴安全帽。", "机器坏了。"],
  "dung": 0,
  "pinyin": "Qǐngwèn nín jǐ wèi?",
  "giai_thich": "Xin hỏi quý khách có mấy vị?"
}
```

## Field tùy chọn (game cần thêm)

Giữ trong cùng object hoặc lookup riêng; **không** thay thế 9 field trên.

| Field | Khi nào | Ý nghĩa |
|-------|---------|---------|
| `type` | listen / order / fill / situ / mc | Loại câu (mặc định `mc`) |
| `topic` | hotel / factory / hsk | Lọc pool theo màn |
| `zh` | luôn khuyến nghị | Câu chữ Hán chính |
| `optionPy` | mc / situ / fill | Pinyin từng lựa chọn |
| `optionVi` | mc / situ / fill | Nghĩa VI từng lựa chọn |
| `words` | order | Các mảnh chữ để xếp |
| `wordPy` / `wordVi` | order | Pinyin + nghĩa từng mảnh |
| `answerOrder` | order | Thứ tự đúng (mảng chữ); runtime map vào `answer` |
| `speak` | listen | Chuỗi TTS đọc |
| `blankHint` | fill | Gợi ý ô trống |
| `stage` | boss phase 2 | Đánh dấu câu nhà máy giai đoạn 2 |

## Runtime

`normalizeQ(raw)` → object cũ (`q`, `options`, `answer`, `py`, `vi`, …) để UI không đổi.

```js
const QUESTIONS = normalizeQuestions(QUESTIONS_RAW);
```

## Quy ước id / chang

- **Bãi Cháy – Lễ tân** → `bc-01`, `bc-02`, …
- **Cẩm Phả – Nhà máy** → `cp-01`, `cp-02`, …
- `ngon_ngu`: `"zh"` (Trung) hoặc `"en"` (Anh) khi mở rộng sau này.

## Lưu ý

- Luôn kèm **pinyin + tiếng Việt** cho chữ Hán hiện trên UI (câu, từng đáp án, từng chip order).
- Không bỏ 9 field bắt buộc khi thêm câu mới.
