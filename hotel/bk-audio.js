/* Bảo Khựa · âm thanh chung của game Khách sạn Vịnh Ā Bǎo và các mini-game (v8.5 · 22/11/2026)
   Tự tổng hợp bằng Web Audio: không tệp nhạc, không CDN, không gọi máy chủ ngoài.
   - Nhạc cụ Việt: sáo trúc, đàn tranh (gảy, nhấn, rung, lướt dây), đàn bầu (vuốt cần, uốn, rung sâu), mõ, chuông gió.
   - Nhạc cụ Trung Hoa: 二胡 èrhú (đàn nhị, kéo vĩ), 琵琶 pípá (tỳ bà, vê tremolo), 箫 xiāo (tiêu, sáo dọc trầm).
   - Nền lofi: piano điện ấm (rung băng nhẹ), bass tròn, trống mềm có swing, mõ thay trống con.
   "Trong trẻo, không sạn": không sóng vuông/răng cưa, không tiếng đĩa than rè; có vang phòng ảo; nén nhẹ + chặn đỉnh ở cuối
   để nhiều nốt chồng nhau không bị vỡ tiếng.
   Dùng:
     const E = BKAudio.engine(ctx, đích, { lite });       // lite: bỏ vang (máy yếu)
     E.fx.coin(3) · E.tranh(E.sfx, 79, t, .1, .6) · E.chime(...) …   // hiệu ứng
     const M = E.music({ vol, mood: () => 'day'|'eve'|'late', drums, ids, sea, onTrack }); M.start() / stop() / duck(true) / next()
     M.render(0, 20, vòng) dựng trước 20 giây (dùng với OfflineAudioContext để kiểm thử, xuất bản nghe thử). */
(function (G) {
  'use strict';
  const R = Math.random, hz = m => 440 * Math.pow(2, (m - 69) / 12), pick = a => a[(R() * a.length) | 0];

  /* 5 bài lofi tự soạn. Nốt: [vị trí 0–15 trong ô nhịp, MIDI, độ dài tính bằng nốt móc kép]; 8 ô nhịp × 4 vòng rồi sang bài:
     vòng 1 giai điệu chính · vòng 2 thêm bè (har) · vòng 3 nghỉ, ứng tác thưa (imp) · vòng 4 giai điệu chính đổi nhạc cụ (alt). */
  const TRACKS = [
    { id: 'song', name: 'Sóng Bãi Cháy', zh: '海浪', py: 'hǎilàng', bpm: 72, lead: 'tranh', alt: 'sao', har: 'sao', imp: 'tranh', ins: 'đàn tranh · sáo trúc',
      ch: [[53, 57, 60, 64, 67], [50, 53, 57, 60, 64], [55, 58, 62, 65, 69], [48, 55, 58, 62, 65]], bs: [41, 38, 43, 36],
      mel: [[[0, 72, 3], [3, 74, 3], [6, 77, 4], [12, 74, 4]], [[0, 72, 6], [6, 69, 2], [8, 72, 8]], [[0, 74, 4], [4, 72, 2], [6, 69, 2], [8, 67, 8]], [[0, 69, 3], [3, 67, 3], [6, 65, 10]],
        [[0, 77, 3], [3, 79, 3], [6, 81, 4], [10, 79, 2], [12, 77, 4]], [[0, 74, 6], [6, 77, 2], [8, 74, 4], [12, 72, 4]], [[0, 69, 4], [4, 72, 4], [8, 74, 3], [11, 72, 2], [13, 69, 3]], [[0, 67, 6], [6, 69, 2], [8, 65, 8]]] },
    { id: 'chieu', name: 'Chiều Hòn Gai', zh: '黄昏', py: 'huánghūn', bpm: 80, lead: 'sao', alt: 'bau', har: 'tranh', imp: 'tranh', ins: 'sáo trúc · đàn bầu · đàn tranh',
      ch: [[57, 60, 64, 67, 71], [53, 57, 60, 64], [48, 52, 55, 59, 62], [55, 59, 62, 64]], bs: [45, 41, 36, 43],
      mel: [[[0, 76, 4], [4, 74, 2], [6, 72, 2], [8, 69, 8]], [[0, 72, 3], [3, 74, 3], [6, 76, 6], [12, 79, 4]], [[0, 76, 8], [8, 74, 4], [12, 72, 4]], [[0, 74, 6], [6, 72, 2], [8, 67, 8]],
        [[0, 69, 2], [2, 72, 2], [4, 76, 4], [8, 81, 6], [14, 79, 2]], [[0, 76, 4], [4, 79, 4], [8, 76, 4], [12, 74, 4]], [[0, 72, 6], [6, 74, 2], [8, 76, 4], [12, 74, 4]], [[0, 72, 4], [4, 69, 12]]] },
    { id: 'dem', name: 'Đêm Tuần Châu', zh: '夜晚', py: 'yèwǎn', bpm: 64, lead: 'tranh', alt: 'tieu', har: 'tieu', imp: 'tranh', ins: 'đàn tranh · tiêu 箫 xiāo',
      ch: [[50, 53, 57, 60, 64], [58, 62, 65, 69], [55, 58, 62, 65], [57, 62, 64, 67]], bs: [38, 46, 43, 45],
      mel: [[[0, 74, 4], [4, 77, 4], [8, 79, 4], [12, 77, 4]], [[0, 74, 10], [10, 72, 2], [12, 69, 4]], [[0, 67, 4], [4, 69, 4], [8, 72, 4], [12, 74, 4]], [[0, 69, 12], [12, 72, 4]],
        [[0, 81, 4], [4, 79, 2], [6, 77, 2], [8, 79, 8]], [[0, 77, 4], [4, 74, 4], [8, 72, 8]], [[0, 74, 3], [3, 72, 3], [6, 69, 4], [10, 67, 2], [12, 69, 4]], [[0, 62, 4], [4, 65, 4], [8, 74, 8]]] },
    { id: 'trang', name: 'Trăng Hạ Long', zh: '月光', py: 'yuèguāng', bpm: 68, lead: 'bau', alt: 'sao', har: 'tranh', imp: 'tranh', ins: 'đàn bầu · sáo trúc · đàn tranh',
      ch: [[50, 53, 57, 60, 64], [46, 50, 53, 57, 60], [43, 46, 50, 53, 57], [45, 48, 52, 55, 60]], bs: [38, 46, 43, 45],
      mel: [[[0, 69, 6], [6, 72, 2], [8, 74, 8]], [[0, 77, 4], [4, 74, 4], [8, 72, 8]], [[0, 74, 4], [4, 72, 2], [6, 69, 2], [8, 67, 8]], [[0, 69, 12], [12, 72, 4]],
        [[0, 74, 3], [3, 77, 3], [6, 79, 6], [12, 77, 4]], [[0, 74, 6], [6, 72, 2], [8, 69, 8]], [[0, 67, 4], [4, 69, 4], [8, 72, 4], [12, 69, 4]], [[0, 76, 4], [4, 74, 12]]] },
    { id: 'tra', name: 'Trà chiều phố biển', zh: '茶馆', py: 'cháguǎn', bpm: 76, lead: 'nhi', alt: 'pipa', har: 'tieu', imp: 'pipa', ins: 'đàn nhị 二胡 èrhú · tỳ bà 琵琶 pípá · tiêu 箫 xiāo',
      ch: [[48, 52, 55, 59, 62], [45, 48, 52, 55, 59], [50, 53, 57, 60, 64], [43, 47, 50, 52, 57]], bs: [36, 45, 38, 43],
      mel: [[[0, 76, 4], [4, 74, 2], [6, 72, 2], [8, 74, 8]], [[0, 69, 6], [6, 72, 2], [8, 67, 8]], [[0, 72, 3], [3, 74, 3], [6, 76, 4], [10, 79, 2], [12, 76, 4]], [[0, 74, 12], [12, 72, 4]],
        [[0, 79, 4], [4, 81, 4], [8, 79, 2], [10, 76, 2], [12, 74, 4]], [[0, 76, 6], [6, 74, 2], [8, 72, 8]], [[0, 69, 4], [4, 72, 4], [8, 74, 3], [11, 72, 1], [12, 69, 4]], [[0, 67, 16]]] }
  ];
  /* thang âm của từng bài (lấy từ chính giai điệu) – dùng cho ứng tác, lướt dây, chuông gió, nốt láy */
  TRACKS.forEach(T => {
    const pcs = new Set(); T.mel.forEach(b => b.forEach(n => pcs.add(n[1] % 12)));
    T.scale = []; for (let m = 55; m <= 100; m++) if (pcs.has(m % 12)) T.scale.push(m);
  });
  const C_PENT = [72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96, 98, 100];   // ngũ cung Đô: C D E G A

  function engine(ctx, dest, opt) {
    opt = opt || {};
    const now = () => ctx.currentTime + .005;
    /* ---- chuỗi tổng: (khô + vang) → nén nhẹ → chặn đỉnh → đích ---- */
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20; comp.knee.value = 14; comp.ratio.value = 3; comp.attack.value = .012; comp.release.value = .28;
    const lim = ctx.createDynamicsCompressor();
    lim.threshold.value = -5; lim.knee.value = 2; lim.ratio.value = 20; lim.attack.value = .002; lim.release.value = .12;
    const out = ctx.createGain(); out.gain.value = 1.15;
    comp.connect(lim); lim.connect(out); out.connect(dest || ctx.destination);
    const pre = ctx.createGain();   // cổng vào vang
    if (!opt.lite) {
      const dl = ctx.createDelay(.2), rev = ctx.createConvolver(), rg = ctx.createGain();
      dl.delayTime.value = .024; rev.buffer = ir(2.1); rg.gain.value = .8;
      pre.connect(dl); dl.connect(rev); rev.connect(rg); rg.connect(comp);
    }
    /* phòng vang ảo: tiếng ồn tắt dần, tiếng cao tắt nhanh hơn tiếng trầm (ấm, không xì) */
    function ir(sec) {
      const sr = ctx.sampleRate, n = Math.floor(sr * sec), b = ctx.createBuffer(2, n, sr);
      for (let c = 0; c < 2; c++) {
        const d = b.getChannelData(c); let lp = 0;
        for (let i = 0; i < n; i++) {
          const x = i / n, a = .5 - .38 * x;
          lp += a * ((R() * 2 - 1) - lp);
          d[i] = lp * Math.pow(1 - x, 1.6) * Math.exp(-x * 3.2) * Math.min(1, i / (sr * .006));
        }
      }
      return b;
    }
    const NOISE = (() => { const n = ctx.sampleRate * 2, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = R() * 2 - 1; return b; })();
    const waves = {};
    function wave(name, amps) {
      if (!waves[name]) { const re = new Float32Array(amps.length + 1), im = new Float32Array(amps.length + 1); amps.forEach((a, i) => { im[i + 1] = a; }); waves[name] = ctx.createPeriodicWave(re, im); }
      return waves[name];
    }
    /* nhóm (nhạc / hiệu ứng): một đường khô và một đường vang, chỉnh âm lượng cả hai cùng lúc; lọc "màu" theo giờ */
    function group(vol) {
      const dIn = ctx.createBiquadFilter(), wIn = ctx.createBiquadFilter(), dry = ctx.createGain(), wet = ctx.createGain();
      [dIn, wIn].forEach(f => { f.type = 'lowpass'; f.frequency.value = 16000; f.Q.value = .4; });
      dry.gain.value = wet.gain.value = vol;
      dIn.connect(dry); wIn.connect(wet); dry.connect(comp); wet.connect(pre);
      return {
        dIn, wIn, dry,
        set(v, tc) { const t = ctx.currentTime; [dry, wet].forEach(n => { n.gain.cancelScheduledValues(t); n.gain.setTargetAtTime(v, t, tc || .1); }); },
        tone(f, t) { [dIn, wIn].forEach(n => n.frequency.setTargetAtTime(f, t || ctx.currentTime, 1.5)); }
      };
    }
    function bus(grp, gain, send, pan) {
      const g = ctx.createGain(); g.gain.value = gain; let o = g;
      if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); o = p; }
      o.connect(grp.dIn); if (send) { const s = ctx.createGain(); s.gain.value = send; o.connect(s); s.connect(grp.wIn); }
      return g;
    }
    const env0 = (g, t) => { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(.0001, t); };
    const V = v => Math.max(.0003, v);
    function vibrato(p, f, t, dur, rate, depth, delay) {
      if (dur < .22) return;
      const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = rate * (.94 + R() * .12);
      g.gain.setValueAtTime(0, t); g.gain.setValueAtTime(0, t + dur * delay); g.gain.linearRampToValueAtTime(f * depth, t + dur * .9 + .06);
      o.connect(g); g.connect(p); o.start(t); o.stop(t + dur + .5);
    }
    function breath(o, fc, t, dur, sus, chiff) {
      const s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = NOISE; s.loop = true;
      bp.type = 'bandpass'; bp.frequency.value = Math.min(8000, fc); bp.Q.value = 1.3;
      env0(g, t); g.gain.exponentialRampToValueAtTime(V(chiff), t + .02); g.gain.exponentialRampToValueAtTime(V(sus), t + .13); g.gain.setValueAtTime(V(sus), t + Math.max(.14, dur * .8)); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(bp); bp.connect(g); g.connect(o); s.start(t, R() * 1.5); s.stop(t + dur + .05);
    }

    /* ---------- nhạc cụ ---------- */
    // đàn tranh: gảy dây thép (sáng rồi dịu dần), nhấn (bấm dây từ nốt dưới lên), uốn lên, rung cuối nốt
    function tranh(o, m, t, v, dur, x) {
      x = x || {}; dur = dur || 1.4;
      const f = hz(m), os = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain(), p = os.frequency;
      os.setPeriodicWave(wave('tranh', [1, .55, .38, .25, .16, .1, .07, .05, .03, .02]));
      if (x.nhan) { const lo = f * Math.pow(2, -x.nhan / 12); p.setValueAtTime(lo, t); p.setValueAtTime(lo, t + .05); p.exponentialRampToValueAtTime(f, t + .18); }
      else { p.setValueAtTime(f * .996, t); p.exponentialRampToValueAtTime(f, t + .03); }
      if (x.bend && dur > .6) { const a = t + Math.max(.25, dur * .45); p.setValueAtTime(f, a); p.exponentialRampToValueAtTime(f * Math.pow(2, x.bend / 12), a + .16); }
      vibrato(p, f, t, dur, 5.4, .007, .35);
      lp.type = 'lowpass'; lp.Q.value = .6; lp.frequency.setValueAtTime(Math.min(11000, f * 9), t); lp.frequency.exponentialRampToValueAtTime(Math.max(520, f * 1.9), t + .5);
      const end = Math.max(1, dur + .6);
      env0(g, t); g.gain.exponentialRampToValueAtTime(V(v), t + .004); g.gain.exponentialRampToValueAtTime(V(v * .36), t + .28); g.gain.exponentialRampToValueAtTime(.0001, t + end);
      os.connect(lp); lp.connect(g); g.connect(o); os.start(t); os.stop(t + end + .05);
    }
    // lướt dây đàn tranh (glissando) – nét rất đặc trưng khi mở câu
    function gliss(o, ms, t, v, gap, dur) { const n = ms.length; ms.forEach((m, i) => tranh(o, m, t + i * (gap || .05), v * (.65 + .35 * i / Math.max(1, n - 1)), dur || 1.1)); }
    // sáo trúc: tiếng gần như thuần, hơi thổi thoảng, luyến từ nốt trước, láy từ nốt trên, rung hơi muộn
    function sao(o, m, t, dur, v, x) {
      x = x || {};
      const f = hz(m), os = ctx.createOscillator(), g = ctx.createGain(), p = os.frequency;
      os.setPeriodicWave(wave('sao', [1, .16, .07, .025, .012]));
      if (x.from) { p.setValueAtTime(hz(x.from), t); p.exponentialRampToValueAtTime(f, t + .09); }
      else if (x.grace) { const gf = hz(x.grace); p.setValueAtTime(gf, t); p.setValueAtTime(gf, t + .055); p.exponentialRampToValueAtTime(f, t + .08); }
      else { p.setValueAtTime(f * .972, t); p.exponentialRampToValueAtTime(f, t + .07); }
      vibrato(p, f, t, dur, 5.3, .011, .3);
      const end = dur + .22, a = x.from ? .03 : .06;
      env0(g, t); g.gain.exponentialRampToValueAtTime(V(v), t + a); g.gain.linearRampToValueAtTime(V(v * .8), t + Math.max(a + .05, dur * .75)); g.gain.exponentialRampToValueAtTime(.0001, t + end);
      os.connect(g); g.connect(o); os.start(t); os.stop(t + end + .05);
      breath(o, f * 1.6, t, end, v * .06, v * .3);
    }
    // 箫 xiāo (tiêu): sáo dọc trầm, nhiều hơi, vào nốt chậm
    function tieu(o, m, t, dur, v, x) {
      x = x || {};
      const f = hz(m), os = ctx.createOscillator(), g = ctx.createGain(), p = os.frequency;
      os.setPeriodicWave(wave('tieu', [1, .08, .03, .01]));
      if (x.from) { p.setValueAtTime(hz(x.from), t); p.exponentialRampToValueAtTime(f, t + .12); } else { p.setValueAtTime(f * .985, t); p.exponentialRampToValueAtTime(f, t + .1); }
      vibrato(p, f, t, dur, 4.6, .008, .4);
      const end = dur + .3;
      env0(g, t); g.gain.exponentialRampToValueAtTime(V(v), t + .12); g.gain.linearRampToValueAtTime(V(v * .75), t + Math.max(.2, dur * .8)); g.gain.exponentialRampToValueAtTime(.0001, t + end);
      os.connect(g); g.connect(o); os.start(t); os.stop(t + end + .05);
      breath(o, f * 2.2, t, end, v * .12, v * .25);
    }
    // đàn bầu: tiếng bồi âm rất trong, ngân dài; vuốt cần sang nốt mới, uốn lên rồi trả về, rung sâu
    function bau(o, m, t, dur, v, x) {
      x = x || {};
      const f = hz(m), os = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain(), p = os.frequency;
      os.setPeriodicWave(wave('bau', [1, .1, .035, .012]));
      if (x.from && x.from !== m) { p.setValueAtTime(hz(x.from), t); p.exponentialRampToValueAtTime(f, t + .22); } else p.setValueAtTime(f, t);
      if (dur > .9 && x.uon !== false) { const k = x.uon || 2, a = t + Math.max(.3, dur * .5); p.setValueAtTime(f, a); p.exponentialRampToValueAtTime(f * Math.pow(2, k / 12), a + .24); p.exponentialRampToValueAtTime(f, a + .55); }
      vibrato(p, f, t, dur, 4.8, .015, .35);
      lp.type = 'lowpass'; lp.frequency.value = Math.min(9000, f * 5); lp.Q.value = .5;
      const end = dur + .7;
      env0(g, t); g.gain.exponentialRampToValueAtTime(V(v), t + .006); g.gain.exponentialRampToValueAtTime(V(v * .6), t + .35); g.gain.exponentialRampToValueAtTime(.0001, t + end);
      os.connect(lp); lp.connect(g); g.connect(o); os.start(t); os.stop(t + end + .05);
    }
    // 二胡 èrhú (đàn nhị): kéo vĩ, giọng mũi ấm (lọc bớt tiếng cao cho khỏi chói), trượt giữa các nốt, rung nhanh
    function nhi(o, m, t, dur, v, x) {
      x = x || {};
      const f = hz(m), os = ctx.createOscillator(), pk = ctx.createBiquadFilter(), lp = ctx.createBiquadFilter(), g = ctx.createGain(), p = os.frequency;
      os.setPeriodicWave(wave('nhi', [1, .6, .4, .28, .2, .14, .1, .07, .05, .035]));
      if (x.from && x.from !== m) { p.setValueAtTime(hz(x.from), t); p.exponentialRampToValueAtTime(f, t + .16); } else { p.setValueAtTime(f * .985, t); p.exponentialRampToValueAtTime(f, t + .08); }
      vibrato(p, f, t, dur, 6.1, .012, .25);
      pk.type = 'peaking'; pk.frequency.value = 1050; pk.Q.value = 1; pk.gain.value = 4;
      lp.type = 'lowpass'; lp.frequency.value = Math.min(3800, f * 6); lp.Q.value = .5;
      const end = dur + .16;
      env0(g, t); g.gain.exponentialRampToValueAtTime(V(v * .6), t + .08); g.gain.linearRampToValueAtTime(V(v), t + Math.min(.35, dur * .5)); g.gain.linearRampToValueAtTime(V(v * .85), t + dur); g.gain.exponentialRampToValueAtTime(.0001, t + end);
      os.connect(pk); pk.connect(lp); lp.connect(g); g.connect(o); os.start(t); os.stop(t + end + .05);
    }
    // 琵琶 pípá (tỳ bà): gảy sáng, tắt nhanh; nốt dài thì vê (tremolo 轮指 lúnzhǐ)
    function pipa1(o, m, t, v, dec) {
      const f = hz(m), os = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
      os.setPeriodicWave(wave('pipa', [1, .7, .5, .35, .24, .15, .1, .06]));
      os.frequency.setValueAtTime(f * .997, t); os.frequency.exponentialRampToValueAtTime(f, t + .02);
      lp.type = 'lowpass'; lp.Q.value = .6; lp.frequency.setValueAtTime(Math.min(10000, f * 8), t); lp.frequency.exponentialRampToValueAtTime(Math.max(500, f * 2), t + .18);
      const end = dec + .25;
      env0(g, t); g.gain.exponentialRampToValueAtTime(V(v), t + .003); g.gain.exponentialRampToValueAtTime(V(v * .3), t + .12); g.gain.exponentialRampToValueAtTime(.0001, t + end);
      os.connect(lp); lp.connect(g); g.connect(o); os.start(t); os.stop(t + end + .05);
    }
    function pipa(o, m, t, dur, v, x) {
      const n = dur > .55 && !(x && x.trem === false) ? Math.min(24, Math.floor(dur / .068)) : 1;
      for (let i = 0; i < n; i++) pipa1(o, m, t + i * .068, v * (i ? .5 + .12 * Math.sin(i * 1.7) : 1), i < n - 1 ? .12 : Math.max(.5, dur * .5));
    }
    // piano điện ấm (FM nhẹ); chất lofi "rung băng" (tape wobble) làm ở đường piano của trình phát nhạc (dòng trễ lắc rất nhẹ)
    const wob = ctx.createOscillator(), wobG = ctx.createGain(); wob.frequency.value = .5; wobG.gain.value = .0008; wob.connect(wobG); wob.start();
    function ep(o, m, t, dur, v) {
      const f = hz(m), c = ctx.createOscillator(), mo = ctx.createOscillator(), mg = ctx.createGain(), g = ctx.createGain();
      c.frequency.value = f; mo.frequency.value = f;
      mg.gain.setValueAtTime(f * .3, t); mg.gain.exponentialRampToValueAtTime(f * .012, t + .9);
      mo.connect(mg); mg.connect(c.frequency);
      env0(g, t); g.gain.exponentialRampToValueAtTime(V(v), t + .015); g.gain.exponentialRampToValueAtTime(V(v * .32), t + 1.1); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      c.connect(g); g.connect(o); c.start(t); mo.start(t); c.stop(t + dur + .05); mo.stop(t + dur + .05);
    }
    function bass(o, m, t, dur, v) {
      const os = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
      os.setPeriodicWave(wave('bass', [1, .28, .06])); os.frequency.value = hz(m); lp.type = 'lowpass'; lp.frequency.value = 650;
      env0(g, t); g.gain.exponentialRampToValueAtTime(V(v), t + .03); g.gain.exponentialRampToValueAtTime(V(v * .45), t + dur * .6); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      os.connect(lp); lp.connect(g); g.connect(o); os.start(t); os.stop(t + dur + .05);
    }
    function kick(o, t, v) {
      const os = ctx.createOscillator(), g = ctx.createGain();
      os.frequency.setValueAtTime(96, t); os.frequency.exponentialRampToValueAtTime(44, t + .12);
      env0(g, t); g.gain.exponentialRampToValueAtTime(V(v), t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + .32);
      os.connect(g); g.connect(o); os.start(t); os.stop(t + .35);
    }
    // mõ gỗ: tiếng "cốc" trong, thay cho trống con và tiếng bấm nút
    function mo(o, t, v, f) {
      f = f || 1100;
      const a = ctx.createOscillator(), b = ctx.createOscillator(), g = ctx.createGain(), g2 = ctx.createGain();
      a.frequency.setValueAtTime(f * 1.18, t); a.frequency.exponentialRampToValueAtTime(f, t + .014); b.frequency.value = f * 2.42;
      env0(g, t); g.gain.exponentialRampToValueAtTime(V(v), t + .002); g.gain.exponentialRampToValueAtTime(.0001, t + .11);
      env0(g2, t); g2.gain.exponentialRampToValueAtTime(V(v * .28), t + .002); g2.gain.exponentialRampToValueAtTime(.0001, t + .045);
      a.connect(g); b.connect(g2); g.connect(o); g2.connect(o); a.start(t); b.start(t); a.stop(t + .14); b.stop(t + .07);
    }
    function shaker(o, t, v) {
      const s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = NOISE;
      bp.type = 'bandpass'; bp.frequency.value = 5200; bp.Q.value = .9;
      env0(g, t); g.gain.exponentialRampToValueAtTime(V(v), t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + .06);
      s.connect(bp); bp.connect(g); g.connect(o); s.start(t, R() * 1.5); s.stop(t + .08);
    }
    // chuông gió / chuông nhỏ: tiếng thuần + bồi âm lệch kiểu chuông, ngân dài
    function chime(o, m, t, v, dur) {
      dur = dur || 2.4; const f = hz(m);
      [[1, 1, 1], [2.76, .2, .5], [5.4, .06, .25]].forEach(([r, a, d]) => {
        const os = ctx.createOscillator(), g = ctx.createGain(); os.frequency.value = Math.min(16000, f * r);
        env0(g, t); g.gain.exponentialRampToValueAtTime(V(v * a), t + .003); g.gain.exponentialRampToValueAtTime(.0001, t + dur * d);
        os.connect(g); g.connect(o); os.start(t); os.stop(t + dur * d + .05);
      });
    }
    function blip(o, f0, f1, t, dur, v) {
      const os = ctx.createOscillator(), g = ctx.createGain();
      os.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) os.frequency.exponentialRampToValueAtTime(f1, t + dur * .6);
      env0(g, t); g.gain.exponentialRampToValueAtTime(V(v), t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      os.connect(g); g.connect(o); os.start(t); os.stop(t + dur + .05);
    }
    // tiếng gió lướt: lên xuống mượt (không bật gắt) nên không rè
    function whoosh(o, t, dur, v, f0, f1, q) {
      const s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = NOISE; s.loop = true;
      bp.type = 'bandpass'; bp.Q.value = q || .9; bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
      env0(g, t); g.gain.exponentialRampToValueAtTime(V(v), t + dur * .35); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(bp); bp.connect(g); g.connect(o); s.start(t, R() * 1.5); s.stop(t + dur + .05);
    }
    function thump(o, t, v, f0, f1, dur) {
      const os = ctx.createOscillator(), g = ctx.createGain(); dur = dur || .45;
      os.frequency.setValueAtTime(f0 || 110, t); os.frequency.exponentialRampToValueAtTime(f1 || 40, t + dur * .4);
      env0(g, t); g.gain.exponentialRampToValueAtTime(V(v), t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      os.connect(g); g.connect(o); os.start(t); os.stop(t + dur + .05);
    }

    /* ---------- hiệu ứng dùng chung ---------- */
    const SG = group(1), SFX = bus(SG, 1, .16, 0);
    const P = i => C_PENT[Math.max(0, Math.min(C_PENT.length - 1, i))];
    const fx = {
      ui() { mo(SFX, now(), .045, 1500); },
      tap() { mo(SFX, now(), .028, 1800); },
      coin(n) { const t = now(), m = P((n || 1) - 1) + 12; chime(SFX, m, t, .055, .7); chime(SFX, m + 5, t + .07, .05, 1); },
      ok() { const t = now(); tranh(SFX, 79, t, .09, .5); tranh(SFX, 84, t + .09, .09, .7); chime(SFX, 91, t + .18, .035, 1.2); },
      no() { bau(SFX, 62, now(), .4, .085, { from: 66, uon: false }); },
      win() { const t = now(); gliss(SFX, [72, 74, 76, 79, 81, 84], t, .075, .07, 1.2); chime(SFX, 91, t + .45, .045, 1.8); chime(SFX, 96, t + .6, .035, 2); },
      lose() { const t = now(); [69, 67, 64, 62].forEach((m, i) => tieu(SFX, m, t + i * .26, .3, .09)); },
      star() { const t = now(); gliss(SFX, [72, 74, 76, 79, 81, 84, 86, 88], t, .07, .055, 1.3); [91, 96, 100].forEach((m, i) => chime(SFX, m, t + .5 + i * .12, .04, 2)); },
      discover() { const t = now(); [84, 88, 91].forEach((m, i) => chime(SFX, m, t + i * .07, .042, 1.3)); },
      build() { const t = now(); mo(SFX, t, .07, 620); mo(SFX, t + .15, .07, 700); [72, 76, 79, 84].forEach((m, i) => tranh(SFX, m, t + .32 + i * .08, .07, .55)); },
      boom() { const t = now(); thump(SFX, t, .2, 110, 38, .55); whoosh(SFX, t, .45, .06, 900, 140, .7); },
      pop(k) { const t = now(), m = P(k || 0); tranh(SFX, m, t, .09, .5); chime(SFX, m + 12, t + .02, .028, .8); },
      drip() { blip(SFX, 900 + R() * 500, 1900 + R() * 600, now(), .06, .028); },
      tick(urgent) { mo(SFX, now(), urgent ? .075 : .055, urgent ? 1450 : 1080); }
    };

    /* ---------- trình phát nhạc lofi tự soạn ---------- */
    function music(o) {
      o = o || {};
      const TR = o.ids ? TRACKS.filter(T => o.ids.indexOf(T.id) >= 0) : TRACKS.slice();
      const moodF = o.mood || (() => 'day'), LOOPS = 4;
      const grp = group(0);
      const C = { ep: ctx.createGain(), bass: bus(grp, 1, 0, 0), drum: bus(grp, 1, .05, 0), lead: bus(grp, 1, .3, .06), har: bus(grp, .9, .36, -.28), imp: bus(grp, 1, .38, .26), chime: bus(grp, .8, .6, 0) };
      const tape = ctx.createDelay(.05); tape.delayTime.value = .008; wobG.connect(tape.delayTime); C.ep.connect(tape); tape.connect(bus(grp, .9, .2, -.12));
      let nErr = 0, ti = o.track != null ? o.track % TR.length : (R() * TR.length) | 0, loop = 0, stepN = 0, next = 0, on = false, timer = 0, vol = o.vol == null ? .7 : o.vol, dk = 1, mel = {}, last = null;
      if (o.sea) {   // sóng vịnh rất nhỏ, dâng hạ chậm (~11 giây một nhịp)
        const s = ctx.createBufferSource(), lp = ctx.createBiquadFilter(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
        s.buffer = NOISE; s.loop = true; lp.type = 'lowpass'; lp.frequency.value = 420; g.gain.value = .055; lfo.frequency.value = .09; lg.gain.value = .04;
        lfo.connect(lg); lg.connect(g.gain); s.connect(lp); lp.connect(g); g.connect(grp.dry); s.start(); lfo.start();
      }
      const six = () => 60 / TR[ti].bpm / 4;
      const upper = (T, m) => { for (const n of T.scale) if (n > m) return n; return m + 2; };
      function phrase(T, chd) {   // ứng tác thưa ở vòng nghỉ: 3–5 nốt trong thang âm của bài, bám hợp âm
        const out = {}; if (R() < .4) return out;
        const S = T.scale.filter(n => n >= 69 && n <= 91), pcs = chd.map(n => n % 12);
        const sl = [0, 2, 3, 6, 8, 10, 11, 14].sort(() => R() - .5).slice(0, 3 + ((R() * 3) | 0)).sort((a, b) => a - b);
        let k = S.findIndex(n => pcs.indexOf(n % 12) >= 0); if (k < 0) k = 2;
        k = Math.min(S.length - 1, k + ((R() * 3) | 0));
        sl.forEach(s => { out[s] = S[k]; k = Math.max(0, Math.min(S.length - 1, k + pick([-2, -1, -1, 1, 1, 2]))); });
        return out;
      }
      function play(kind, ch, m, t, dur, k, lead) {
        const T = TR[ti], from = lead && last && last.kind === kind && t - last.end < .25 ? last.m : 0;
        if (lead) last = { kind, m, end: t + dur };
        switch (kind) {
          case 'sao': return sao(ch, m, t, dur, .085 * k, { from: from && R() < .6 ? from : 0, grace: !from && dur > .5 && R() < .35 ? upper(T, m) : 0 });
          case 'tieu': return tieu(ch, m, t, dur, .1 * k, { from });
          case 'bau': return bau(ch, m, t, dur, .11 * k, { from });
          case 'nhi': return nhi(ch, m, t, dur, .07 * k, { from: from && R() < .75 ? from : 0 });
          case 'pipa': return pipa(ch, m, t, dur, .085 * k);
          case 'ep': return ep(ch, m, t, Math.max(.6, dur * 1.4), .07 * k);
          default: return tranh(ch, m, t, .11 * k, dur, { nhan: dur > .5 && R() < .3 ? 2 : 0, bend: dur > 1 && R() < .2 ? 2 : 0 });
        }
      }
      function step(n, t) {
        const pos = n % 16; let bar = Math.floor(n / 16);
        if (pos === 0 && bar > 0 && bar % 8 === 0) { loop++; if (loop >= LOOPS) { loop = 0; ti = (ti + 1) % TR.length; stepN = 0; bar = 0; last = null; if (o.onTrack) { const T = TR[ti]; setTimeout(() => o.onTrack(T), Math.max(0, (t - ctx.currentTime) * 1000)); } } }
        const T = TR[ti], SIX = six(), BEAT = SIX * 4, ci = bar % 4, chd = T.ch[ci], md = moodF();
        const tt = t + (pos % 4 === 2 ? SIX * .28 : 0), drums = o.drums !== false && md !== 'late' && loop !== 2, soft = md === 'day' ? 1 : .78;
        if (pos === 0) {
          mel = loop === 2 ? phrase(T, chd) : {};
          chd.forEach((m, i) => ep(C.ep, m, t + i * .016, BEAT * 4.2, .055 * soft));
          bass(C.bass, T.bs[ci], t, BEAT * 1.9, .16);
          grp.tone(md === 'day' ? 7000 : md === 'eve' ? 4300 : 2700, t);
          if (R() < (md === 'late' ? .14 : .3)) { const hi = T.scale.filter(n => n >= 84 && n <= 98); for (let i = 0, c = 1 + ((R() * 2) | 0); i < c; i++) chime(C.chime, pick(hi), t + BEAT * R() * 3, .03, 2.6); }
        }
        if (pos === 6 && R() < .6) bass(C.bass, T.bs[ci] + (R() < .5 ? 7 : 12), tt, BEAT * .9, .085);
        if (pos === 8) { bass(C.bass, T.bs[ci], t, BEAT * 1.4, .12); if (R() < .5) chd.slice(-3).forEach(m => ep(C.ep, m, t, BEAT * 2, .025 * soft)); }
        if (bar % 8 === 7 && pos === 11 && (T.lead === 'tranh' || T.imp === 'tranh') && R() < .75) {   // lướt dây dẫn vào câu mới
          const S = T.scale.filter(n => n >= 62 && n <= 86), s0 = (R() * Math.max(1, S.length - 7)) | 0;
          gliss(C.imp, S.slice(s0, s0 + 7), tt + SIX, md === 'late' ? .045 : .06, .055, 1.2);
        }
        if (drums) {
          if (pos === 0 || pos === 8 || (pos === 10 && R() < .3)) kick(C.drum, tt, (pos === 0 ? .36 : .27) * soft);
          if (pos === 4 || pos === 12) mo(C.drum, tt, .055 * soft, pos === 4 ? 1180 : 940);
          if (pos === 14 && R() < .18) mo(C.drum, tt, .022 * soft, 1420);
          if (pos % 2 === 0 && R() < .8) shaker(C.drum, tt, (pos % 4 ? .009 : .013) * soft);
        }
        if (loop === 2) { if (mel[pos]) play(T.imp || 'tranh', C.imp, mel[pos], tt, SIX * 3, md === 'late' ? .7 : .85); return; }
        const notes = T.mel[bar % 8], lead = loop === 3 ? T.alt : T.lead, k = md === 'late' ? .78 : 1;
        for (const nn of notes) if (nn[0] === pos) {
          play(lead, C.lead, nn[1], tt, nn[2] * SIX, k, true);
          if (loop === 1 && T.har) play(T.har, C.har, nn[1] - 12, tt + SIX * .5, nn[2] * SIX, .42 * k);
        }
      }
      function pump(until) { while (next < until) { try { step(stepN, next); } catch (e) { nErr++; } stepN++; next += six(); } }
      function tick() { if (!on || ctx.state !== 'running') return; const t = ctx.currentTime; if (next < t) next = t + .08; pump(t + .5); }
      return {
        start() { if (on) return; on = true; stepN = 0; loop = 0; last = null; next = ctx.currentTime + .15; grp.set(vol * dk, .9); clearInterval(timer); timer = setInterval(tick, 110); tick(); if (o.onTrack) o.onTrack(TR[ti]); },
        stop() { on = false; clearInterval(timer); grp.set(0, .3); },
        duck(d) { dk = d ? .3 : 1; if (on) grp.set(vol * dk, .12); },
        setVol(v) { vol = v; if (on) grp.set(vol * dk, .3); },
        next() { ti = (ti + 1) % TR.length; loop = 0; stepN = 0; last = null; if (on) { next = ctx.currentTime + .2; if (o.onTrack) o.onTrack(TR[ti]); } },
        render(t0, t1, lp) { on = true; next = t0; stepN = 0; loop = lp || 0; grp.set(vol, .01); pump(t1); on = false; },
        get track() { return TR[ti]; }, get on() { return on; }, get errors() { return nErr; },
        input: grp.dry   // cổng cho tệp nhạc thật (MUSIC_FILES): không qua lọc màu, không thêm vang
      };
    }

    return { ctx, sfx: SFX, sfxVol: v => SG.set(v, .05), fx, music, group, bus, tranh, gliss, sao, tieu, bau, nhi, pipa, ep, bass, kick, mo, shaker, chime, blip, whoosh, thump, PENT: C_PENT };
  }

  G.BKAudio = { engine, TRACKS, hz };
})(typeof window !== 'undefined' ? window : globalThis);
