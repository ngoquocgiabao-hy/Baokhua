# KỸ THUẬT · game.html (Đánh Boss "Hành trình HSK0 → HSK4")

Một tệp HTML, không thư viện ngoài, chạy trên điện thoại.
- Gồm 2 khối script: khối cấu hình (script thường) và khối chính (`<script type="module">`).
- Tìm nhanh bằng tên (số dòng thay đổi theo phiên bản).

## 1. Khối cấu hình (đầu tệp, script thường)
| Tên | Ý nghĩa |
|---|---|
| `ZALO_LINK`, `GOOGLE_FORM_LINK`, `GAME_URL` | Link đăng ký. Chỉ dùng các link đã có. |
| `FAST_SECONDS`, `QUESTION_SECONDS`, `UPGRADE_EVERY`, `OVERTIME_MAX`, `TIMER_WARN_SECONDS` | Nhịp chơi trong trận. |
| `STAGES` | 5 trạm HSK0–HSK4 (xem bảng dưới). |
| `STORY_INTRO`, `STORY` | Lời dẫn lần đầu; người gặp trên đường. |
| `VOICE_FILES` | Bật file giọng Gemini (`v4/voice/manifest.json`). |
| `INVITE_*`, `OFFER_*`, `SALE_END` | Chữ ưu đãi, hạn 11.11 (đổi khi hết hạn). |
| `QUESTIONS_RAW` → `QUESTIONS` | Ngân hàng câu hỏi, chuẩn hoá bằng `normalizeQ`. |

Các trường của mỗi phần tử `STAGES`:

| Trường | Ý nghĩa |
|---|---|
| `key` | Mã trạm `hsk0`…`hsk4`. |
| `lv` | Nhãn hiển thị, ví dụ `HSK0`. |
| `name` | Tên trạm. |
| `boss` | Tên boss. |
| `look` | Kiểu boss: `trainee` · `hotel` · `factory` · `night` · `shadow`. |
| `time` | Mốc lộ trình gợi ý (không phải lịch khai giảng). |
| `n` | Số câu. |
| `sec` | Số giây mỗi câu. |
| `hit` | Sức đánh của boss. |
| `pyHelp` | Hiện pinyin ở đáp án. |
| `learn` | Câu mẫu học trước trận, dạng `[chữ Hán, pinyin, nghĩa]`. |
| `taunt` | Câu boss chào khi mở trận và nói ở cổng trên bản đồ. |

Các trường của mỗi phần tử `STORY`:

| Trường | Ý nghĩa |
|---|---|
| `id` | Mã người, cũng là khoá vị trí trong `NPC_X`. |
| `who` | Tên hiển thị. |
| `name` | Tên tiếng Trung, dạng `[chữ Hán, pinyin, nghĩa]`. |
| `role` | Vai trò. |
| `narr` | Lời dẫn. |
| `line` | Câu chào, cũng là bong bóng khi tới gần lúc chưa gặp. |
| `ask`, `opts`, `ok` | Câu hỏi, các lựa chọn, chỉ số đáp án đúng. |
| `after` | Câu khen, cũng là bong bóng khi đã gặp. |
| `words` | Từ đưa vào Sổ từ. |

Mỗi câu hỏi (`QUESTIONS_RAW`) gồm 9 trường gốc:
- `id`, `chang`, `ngon_ngu`, `do_kho`, `cau_hoi`, `dap_an[]`, `dung`, `pinyin`, `giai_thich`.
- Có thể thêm:
  - `type` (`mc` · `listen` · `fill` · `order` · `situ`);
  - `level` (`hsk0`…`hsk4`);
  - `zh`, `speak`, `optionPy[]`, `optionVi[]`, `topic`;
  - `story` (chỉ hỏi sau khi đã gặp người đó).
- Câu cũ không có `level`: khách sạn → HSK1, nhà máy → HSK2, nhà máy độ khó 3 → HSK3.

## 2. Khối chính (module) – các phần lớn
| Phần | Vai trò |
|---|---|
| `Chibi` | Hình người vẽ bằng canvas có khớp, dùng cho người đi đường và người gặp trên đường. Dự phòng khi chưa tải tranh. `Chibi.POSES` là kho tư thế với các góc `lean, head, bob, aF/eF, aB/eB, lF/kF, lB/kB` (rad; 0 = thẳng xuống, dương = về phía mặt nhìn). `Chibi.key` nối khung hình chính, `Chibi.mix` trộn hai tư thế. |
| `Rig` | Khung xương cho tranh minh hoạ (v11). Xem mục 3. |
| `createArena(root)` (gán vào `createBattle`) | Sân đấu: hai diễn viên `hero` và `boss`, chiêu thức, hiệu ứng, vòng vẽ. Xem mục 4. |
| `SAVE_KEY`, `prog`, `save()` | Tiến độ trong `localStorage`: `unlock`, `stars`, `met`, `gk` (quái giữ cổng đã hạ), `xp` (sao ⭐ chỉ dùng trong game), `mem` (độ nhớ từng câu), `cx` (vị trí trên bản đồ). |
| `Snd` | Âm thanh WebAudio: tiếng tổng hợp `sfx(kind)`, tiếng mẫu `play(name)`, nhạc nền, hạ nhạc khi đọc `duck`. |
| `WorldMap` | Thành phố tự điều khiển. Xem mục 5. |
| `Voice`, `speakQuiet`, `speakZh` | Đọc tiếng Trung: ưu tiên file Gemini, không có thì dùng giọng máy tốt nhất. |
| Luồng trận | `startStage` → `ask` → `resolve(ok)` → `openUpgrade`/`afterRound` → `end(win)`. Kỹ năng: `SKILLS`, `pickSkill`. Sát thương: `BASE_DMG`, `WRONG_DMG`, `BOSS_PER_Q`. |
| `window.__bao` | Móc kiểm thử (xem `docs/BAN_GIAO.md` mục 5). |

## 3. Khung xương (`Rig`)
- **Dữ liệu `v4/rig/<tên>.json`** (sinh bằng `tools/art/rig.py`):
  - kích thước, hướng tranh `fs` (+1 nhìn phải: tướng; −1 nhìn trái: boss);
  - 11 xương `root, chest, head, uaF, faF, uaB, faB, thF, shF, thB, shB` (F = tay/chân phía trước), mỗi xương có cha `p` và khớp `j`;
  - điểm mốc `pts` (bàn tay, cổ chân, bàn chân);
  - góc nghỉ `rest`;
  - lưới đỉnh, tam giác, chỉ số xương, trọng số (base64).
- **Từ tư thế ra góc xương:** `Rig.pose(c, pose, ref, gain, plant, extra, st, dt)`.
  1. Lấy độ lệch tư thế so với tư thế gốc `ref` (tư thế lúc tranh được vẽ, thường là `stance`/`stand`).
  2. Đổi thành góc xương:
     - tay chân chỉ xoay một phần (`PR.*[0]`);
     - chi co ngắn dọc trục xương (`PR.*[1]`) để giả chiều sâu, vì tranh nhìn 3/4.
  3. Đổi góc mượt bằng lò xo theo độ cứng `STIFF`. Khớp xa mềm hơn nên theo sau một nhịp.
  4. Bám đất: chân thấp nhất luôn ở mặt đất.
- **Dáng đi / chạy:** `Rig.gait(ref, phase, run, amt)`. Chân đối xứng, gối co khi đưa chân lên, tay vung ngược chân.
  - Pha phải **tăng** khi đi về phía mặt nhìn.
  - Đi ngược hướng mặt thì đổi sang nhảy lùi (`backstep` trong sân đấu), không dùng dáng đi tới.
- **Vẽ:**
  - `Rig.renderer()` tạo canvas WebGL.
  - `draw(c, img, mats, X, tint, alpha)`: `X` là ma trận tranh → điểm ảnh, ghép thêm ma trận máy quay `CAM` (rung, phóng to).
  - Hình tĩnh dùng `Rig.quad`.
  - Máy không có WebGL hoặc WebGL chạy bằng phần mềm thì trả `null`, game tự vẽ kiểu cũ (`blitSpr`).
- **Ba lớp vẽ:**
  - Sân đấu: `#fx` (nền) → `.fx-gl` (nhân vật) → `.fx-top` (hiệu ứng).
  - Bản đồ: `#cityCv` → `.city-gl` → lớp trên.
  - Muốn vẽ đè lên nhân vật thì đẩy hàm vẽ vào `topQ` (sân đấu) hoặc `onTop(fn)` (bản đồ).

## 4. Sân đấu (`createArena`)
- **Diễn viên:**
  - Mỗi diễn viên có `{x, y, rot, alpha, pose, act, state, flash, sp ('idle'|'atk'|'ko'), ghosts, rs}`.
  - `play(a, dur, fn(k,t) → {pose,x,y,rot,sq,sp,alpha,mood}, events, then)` chạy một động tác.
  - `stepActor` lo dáng chờ riêng từng boss khi rảnh.
- **Chiêu tướng:**
  - `phiTieu` (chọn `tamTieu` / `phongTieu` / `anhTieu`);
  - `chemGio`;
  - `longHa` + `dragon`.
  - Mỗi chiêu trả `{impactAt}` (ms) để trừ máu đúng lúc trúng.
- **Boss:** `bossAttack(feint)`. `feint = true` là đánh nhử lúc chờ trả lời: không trừ máu, tướng đỡ hoặc né (`heroGuard`).
- **Hiệu ứng:**
  - Chiêu và va chạm: `burst`, `ring`, `bolt`, `impact`, `hitSpark`, `flare`, `slashFx`, `cutLine`, `shuriken`.
  - Toàn cảnh: `rays`, `pillar`, `speedLines`, `cutIn` (băng hô tên chiêu: chữ Hán + pinyin + nghĩa Việt).
  - Nhịp và máy quay: `invert` (khung âm bản), `slowmo`, `hitStop`, `shake`, `focus`/`zoomTo`.
  - Tàn dư: `groundDust`, `debris`, `smokePuff`, `textPop`.
- **Đánh nhử:** `pressure(on, secs, quiet)`, `pressTick` (câu nghe thì đánh thưa, im tiếng).
- **API trả ra:**
  - `playHeroAttack(kind, info)`, `playBossAttack()`;
  - `intro`, `ko`, `down`, `reset`;
  - `setStage`, `setVisual`, `setRage`, `pressure`;
  - `_slow`, `_state`.

## 5. Bản đồ (`WorldMap`)
- **Thế giới:**
  - `VIEW = 360` đơn vị ngang, 5 khu × `DW = 1100`.
  - `DIST`: màu, kiểu quái từng khu.
  - `gateX(i)` = cổng trạm, `wallX(i)` = rào giữa khu.
  - `NPC_X`: vị trí người.
  - `MON`: kiểu quái.
- **Cảnh:**
  - `SKY` (trời từng khu);
  - `PAINT[khu](ctx, lớp, rộng, rnd, meta)` vẽ sẵn 3 lớp trôi `LF = [.12, .3, .55]` vào canvas phụ;
  - `LIVE` (chi tiết chuyển động trên lớp);
  - `groundTile` (mặt đất lặp), `drawProps`, `drawGates`, `drawNpcs`, `drawMon`, `drawHero`, `drawFront`, `drawPost`.
- **Luật mỗi khung:** `update(dt)` gồm:
  - di chuyển, nhảy, trượt phanh;
  - quái tuần tra, quay về phía tướng, chạm thì `startDuel`;
  - người chưa gặp thì tự `talk`;
  - máy quay nhìn trước, rung (`mapHit`).
- **Tương tác:**
  - bong bóng `speech(x, y, [chữ Hán, pinyin, nghĩa])` cho người đi đường (`line`/`after`) và boss ở cổng (`taunt`);
  - Ā Bǎo vẫy tay khi gần người quen, đứng lâu thì ngó quanh / vươn vai.
- **Đấu quái:** `pickQ`, `startDuel`, `openDuel`, `answer`, `finishDuel` (đúng: chém hạ quái +⭐; sai: bị đẩy lùi).

## 6. Thêm nội dung nhanh
| Muốn | Làm |
|---|---|
| Thêm câu hỏi | Thêm vào `QUESTIONS_RAW` (đủ pinyin có dấu + nghĩa Việt, có `level`). |
| Thêm người trên đường | Thêm phần tử `STORY`, vị trí trong `NPC_X`, trang phục trong `Chibi.SPECS[id]`. Câu hỏi riêng: thêm câu `s*-01` có trường `story`. |
| Thêm kiểu quái | Thêm vào `MON`, đặt `mon` cho khu trong `DIST`, vẽ trong `drawMon`. |
| Thêm chiêu tướng | Viết hàm như `tamTieu` (trả `{impactAt}`), gọi trong `phiTieu`/`playHeroAttack`. Tên chiêu thêm vào `SKN` (đủ 3 dòng). |
| Thêm boss mới | Tranh `v4/sprites/<look>-idle|atk|ko.webp` + `SPRITE`/`SPR_X`/`CH`/`BOSS_COL`/`GHOST`/`GAIN`, tranh VS `v4/vs`, nền `v4/bg`, khung xương `v4/rig/<look>-idle.json`, nhánh mới trong `bossAttack`. |
| Đổi hạn ưu đãi | `SALE_END`, `OFFER_*`, `INVITE_*` trong game.html và `saleEnd` trong index.html. |

## 7. Hiệu năng
- Cảnh 3 lớp được vẽ sẵn theo khu và chỉ giữ 3 khu trong bộ nhớ (`LC`/`LQ`). Khu kế tiếp được dựng sẵn khi máy rảnh.
- `dpr` tối đa 2. Lớp cảnh vẽ sẵn ở tối đa 1.5× để tiết kiệm bộ nhớ.
- Nhân vật WebGL: mỗi tranh khoảng 400–1.000 đỉnh, rất nhẹ với card đồ hoạ.
- Đo trên máy thử (không có card đồ hoạ): bản đồ khoảng 40–58 khung/giây, trận khoảng 60 (cách vẽ cũ).
- Cần đo thêm trên điện thoại thật.
