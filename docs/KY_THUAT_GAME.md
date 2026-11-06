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
- **v14 · Khoá biên độ (`LIM`):** mọi độ lệch tư thế so với tư thế gốc bị kẹp trong khoảng đã đo bằng bảng tư thế (aF ±0,5 · eF ±0,35 · aB −0,5…0,3 · eB ±0,5 · lF/lB ±0,3 · kF/kB −0,45…0,1 · lean ±0,25 · head ±0,3). Ngoài khoảng đó tranh bị xé (rách áo, tay rời thân, đũng quần kéo dài). Boss có tay che thân dùng hệ số tay thấp trong `GAIN`/`MGAIN` (lễ tân .2, ninja .25, tập sự .35, tổ trưởng/ca đêm .45).
- **Dáng đi / chạy (v14 · bước nảy):** `Rig.gait(ref, phase, run, amt)` **không uốn chân**. Cả người nảy lên giữa mỗi bước (`hop`, 2 bước mỗi chu kỳ, `Rig.pose` nâng `hop × 24` điểm ảnh tranh), lắc trái–phải (`tilt`: cộng cùng một góc cho mọi xương nên lắc như một khối cứng), tay đánh nhẹ ngược nhau, người nghiêng về hướng đi.
  - Lịch sử: v11 bẻ chân trong mặt tranh → xé hình; v12 nhấc gối co theo chiều sâu → chân gần như đứng yên, như trượt; v13 cắt giấy → lại xé hình. Đừng quay lại các kiểu đó. Muốn chân bước thật cần khung hình vẽ tay (dây chuyền `v4/anim/`).
  - Pha phải **tăng** khi đi về phía mặt nhìn. Bản đồ: `hero.ph += dt·|v|/105` (≈ 3 bước nảy/giây khi đi).
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

## 3b. Đánh thật (v12, `FIGHT_MODE = 'act'`)
- **Phía game** (khối chính, sau `startStage`):
  - `actBegin` bật trận sau màn mở.
  - `actPress('a'|'b'|'d')` là các nút Phi tiêu / Chém / Né, có hồi chiêu `ACT_HERO.cd`.
  - `actDamage` trừ máu boss:
    - giáp vàng ở 50% máu chỉ còn 35% sát thương;
    - đòn thường không hạ boss dưới 8% máu.
  - `actHurt` trừ máu tướng khi boss đánh trúng.
  - `actUlt` mở câu hỏi tuyệt chiêu (dùng lại `ask()`).
  - `actResolve` xử lý trả lời: đúng thì tung chiêu `heroAct('ult', i)`; sai thì `counter()` + `showExplain`.
  - `actResume` quay lại trận.
  - Phím tắt: J/1 phi tiêu · K/2 chém · L/Space/3 né · U/4/Enter tuyệt chiêu.
- **Phía sân đấu:**
  - `fight(on, diff, onHit, onEvent)` bật trận; `fightPause`, `heroAct(kind, n)`, `counter()`, `setShield(v)`.
  - `actTick` là bộ não boss: đếm `every` → báo trước `tele` (nháy đỏ, "!") → `bossAttack(false, token)`.
  - Lúc boss ra đòn có giáp cứng (`atkUntil`).
  - Tướng miễn đòn khi `hero.inv > 0` (né, lướt chém). Né sát lúc đòn chạm là "né đẹp" (`dodged`).
  - `_state.act.hitIn` là thời gian tới lúc đòn chạm (nút Né nhấp nháy, bài kiểm thử dùng).
- **v13 · bộ đệm phím:** bấm lúc tướng đang ra đòn / nút còn hồi ≤ 0,3 giây thì nhớ 0,35 giây (`actBuf`) và tự ra đòn khi rảnh. Bấm Tuyệt chiêu lúc đang ra đòn → `st.ultQ`, mở câu hỏi ngay khi xong đòn.
- **v13 · câu hỏi tuyệt chiêu vừa 1 màn:** `fitAsk()` đo các phần đang hiện rồi thu sân đấu (96–250px) cho câu hỏi + đáp án nằm gọn trong màn, không phải cuộn khi đồng hồ chạy. Đáp án ngắn xếp 2 cột (`#opts.two`).
- **v13 · CHIÊU CHỮ (đỡ đòn bằng nghĩa từ):**
  - Hẹn giờ `st.wordT` (đếm khi boss không gồng / không ra đòn), mỗi `WORD_EVERY[trạm]` giây boss gồng một chiêu chữ.
  - `wordPool(trạm)`: từ ngắn (≤ 4 chữ Hán) có pinyin + nghĩa, lấy từ đáp án có `optionPy/optionVi`, `STAGES[].learn`, từ người đã gặp. Ưu tiên từ đúng trạm.
  - `wordStart()` → sân đấu `wordCharge([zh, py], giây)` (bong bóng chỉ có chữ Hán + pinyin, boss gồng tím, dừng nhịp đánh thường); khay nút đổi thành 3 nghĩa (`#parryPad`, phím 1/2/3), thời gian `WORD_SEC[trạm]` (lần đầu ×1,25).
  - `wordAnswer(i)`: đúng → `wordResolve(true)` (ĐỠ CHỮ, boss khựng, tướng lướt chém phản đòn, sát thương `k.b × 1,9`, +26 nộ); sai/hết giờ → `wordResolve(false)` = `counter()`, sát thương ×1,5, hiện nghĩa đúng, từ vào `st.parryMiss` → Sổ ôn cuối trận.
- **v13 · chuỗi HIT + phản đòn:** mỗi đòn trúng `st.hits++` (mất sau 2,4 giây không đánh hoặc khi trúng đòn), +5% sát thương mỗi 5 hit (tối đa +30%), hiện ở `#hitCount`. Trong 1,2 giây sau NÉ ĐẸP (`st.counterUntil`), đòn kế là PHẢN ĐÒN ×1,8.
- **Nền chuyển động:** `bgVideo(look)` phát `v4/motion/<look>.mp4|.webm` vào lớp nền mỗi khung, phủ `bgOv` (tông màu + sàn tối). Lỗi thì dùng ảnh `paintBg`.

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
  - `_slow`, `_state`;
  - v13: `wordCharge(word, sec)`, `wordResolve(ok)`, `pop(txt, col, onBoss)`.
- **Tỉ lệ:** `S = min(H, W·0,97)·0,0056` – sân cao (khay nút dính đáy màn) không làm nhân vật to quá bề ngang.

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
- **v13 · Chữ vàng:** `buildGold()` đặt 4 đồng mỗi khu (`GOLD_AT`, từ `wordPool(khu)`; đồng 2 và 4 ở trên cao, phải nhảy). `grabGold` nhặt khi chạm → toast chữ Hán + pinyin + nghĩa, đọc to, +5 ⭐, lưu `prog.gold[id]`; HUD `hudXp()`; Sổ từ có mục Chữ vàng.
- **v13 · chạm rào:** `hero.blocked` → tốc độ về 0 và đứng yên (trước đây chạy tại chỗ). Vệt bóng mờ chỉ hiện khi lướt chém / chạy rất nhanh (> 230), không hiện khi đi thường.
- **Móc kiểm thử (v13):** `_hold(1)` dừng vòng lặp, `_step(dt, n)` bước tay từng khung, `_key(-1|0|1)` giữ hướng đi, `_scr()` toạ độ màn hình của Ā Bǎo. Dùng để quay đúng 30 khung/giây bất kể tốc độ chụp.

## 6. Thêm nội dung nhanh
| Muốn | Làm |
|---|---|
| Thêm câu hỏi | Thêm vào `QUESTIONS_RAW` (đủ pinyin có dấu + nghĩa Việt, có `level`). |
| Thêm người trên đường | Thêm phần tử `STORY`, vị trí trong `NPC_X`, trang phục trong `Chibi.SPECS[id]`. Câu hỏi riêng: thêm câu `s*-01` có trường `story`. |
| Thêm kiểu quái | Thêm vào `MON`, đặt `mon` cho khu trong `DIST`, vẽ trong `drawMon`. |
| Thêm chiêu tướng | Viết hàm như `tamTieu` (trả `{impactAt}`), gọi trong `phiTieu`/`playHeroAttack`. Tên chiêu thêm vào `SKN` (đủ 3 dòng). |
| Thêm boss mới | Tranh `v4/sprites/<look>-idle|atk|ko.webp` + `SPRITE`/`SPR_X`/`CH`/`BOSS_COL`/`GHOST`/`GAIN`, tranh VS `v4/vs`, nền `v4/bg`, khung xương `v4/rig/<look>-idle.json`, nhánh mới trong `bossAttack`. |
| Đổi hạn ưu đãi | `SALE_END`, `OFFER_*`, `INVITE_*` trong game.html và `saleEnd` trong index.html. |

## 6a. Nhiệm vụ hằng ngày + Tủ đồ (v14)
- `QUEST_POOL` (7 kiểu: gold, mon, parry, perfect, ult, boss, say), `quests()` chọn 3 cái theo ngày (`prog.daily`), `questTick(id)` gọi ở các chỗ: nhặt chữ vàng, hạ quái, đỡ chữ, né đẹp, đúng câu tuyệt chiêu, thắng boss, bấm 🔊 trong Sổ từ. Thưởng `QUEST_STAR` mỗi cái, `QUEST_ALL` khi xong cả 3. Thông báo `qToast` (hiện ở mọi màn).
- `SKINS` (5 màu phi tiêu, mỗi món có chữ Hán + pinyin + nghĩa), `curSkin()` dùng trong `shuriken()` của sân đấu. Mua bằng `prog.xp`, lưu `prog.owned`, `prog.skin`.
- Trọn bộ chữ vàng một khu → `prog.goldSet[khu]`, +20 ⭐ (trong `grabGold`).
- Mọi ⭐ chỉ dùng trong game, không đổi ra tiền/quà.

## 6b. Phông chữ (v13)
- `UIF` (chữ Việt: phông hệ thống có đủ dấu) và `ZHF` (chữ Hán: PingFang SC / Noto Sans CJK SC…) khai báo đầu tệp, dùng cho mọi chữ vẽ trên canvas.
- CSS: phông Trung chỉ gắn qua `[lang^="zh"]`. **Không** đặt `font-family` phông Trung vào class chung (trước đây `.talk-opts button b` làm đáp án tiếng Việt trong thẻ đấu quái bị vẽ bằng phông Trung → trên iPhone chữ có dấu bị trộn phông).
- Đầu khối module có bộ tự gắn `lang="zh-CN"`: mọi đoạn chữ Hán nằm lẫn trong câu Việt được bọc `<span lang="zh-CN">` (chạy lúc mở trang và theo dõi nội dung chèn sau bằng MutationObserver).
- Không dùng ký tự hiếm dễ hiện ô vuông (ví dụ `⤒`, `∘`, emoji mới như 🥷). Nút nhảy dùng SVG.
- Kiểm: `node tools/test/fonts.js 390 844` (đi qua mọi màn, báo chữ Việt dùng phông Trung, chữ Hán thiếu `lang`, ký tự hiếm).

## 7. Hiệu năng
- Cảnh 3 lớp được vẽ sẵn theo khu và chỉ giữ 3 khu trong bộ nhớ (`LC`/`LQ`). Khu kế tiếp được dựng sẵn khi máy rảnh.
- `dpr` tối đa 2. Lớp cảnh vẽ sẵn ở tối đa 1.5× để tiết kiệm bộ nhớ.
- Nhân vật WebGL: mỗi tranh khoảng 400–1.000 đỉnh, rất nhẹ với card đồ hoạ.
- Đo trên máy thử (không có card đồ hoạ): bản đồ khoảng 40–58 khung/giây, trận khoảng 60 (cách vẽ cũ).
- Cần đo thêm trên điện thoại thật.
