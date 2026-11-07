/* Trailer 9:16 · "Bảo Khựa 阿宝 · Khách sạn Vịnh Ā Bǎo"
   48 giây, 30 fps, 1080×1920. Cắt cảnh đúng đầu ô nhịp của nhạc tự soạn (90 BPM, 1 ô nhịp = 80 khung).
   Cảnh: 0 bơi vịnh (hook) → 240 Bảo là ai → 480 bay qua phố 3D (phim dựng từ chính game) → 800 chơi thế nào + 1★→5★
         → 1040 lộ trình HSK0→HSK4 → 1200 lời mời.
   Chữ Trung luôn kèm pinyin và nghĩa Việt. Vùng an toàn TikTok: chữ chính nằm trong x 70–1010, y 200–1500. */
import React from 'react';
import { AbsoluteFill, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Audio, Video } from '@remotion/media';
import { loadFont as loadLocal } from '@remotion/fonts';
import FONTS from './fonts.json';

/* phông tải sẵn trong public/fonts (Be Vietnam Pro, Playfair Display, Noto Serif SC rút gọn đúng các chữ Hán dùng trong phim) */
FONTS.forEach((o: { family: string; file: string; weight: string; style: string; unicodeRange: string }) =>
  loadLocal({ family: o.family + (o.style === 'italic' ? 'I' : ''), url: staticFile(o.file), weight: o.weight, unicodeRange: o.unicodeRange }));
loadLocal({ family: 'BKZH', url: staticFile('fonts/zh900.woff2'), weight: '900' });
loadLocal({ family: 'BKZH', url: staticFile('fonts/zh700.woff2'), weight: '700' });
const VN = 'BKVN, sans-serif', PF = 'BKPFI, serif', PFN = 'BKPF, serif';
const ZH = 'BKZH, "Noto Serif SC", serif';

const SUN = '#FFD91F', CREAM = '#FFF7D6', INK = '#0B1222';
const OUT = Easing.bezier(0.16, 1, 0.3, 1), IO = Easing.bezier(0.65, 0, 0.35, 1);
const cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const k = (f: number, a: number, b: number, from = 0, to = 1, e = OUT) => interpolate(f, [a, b], [from, to], { ...cl, easing: e });
/** hiện ở a, ẩn ở b (mỗi đầu d khung) */
const life = (f: number, a: number, b: number, d = 10) => Math.min(k(f, a, a + d), k(f, b - d, b, 1, 0, IO));

const cover: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover' };

/* ---------- mảnh dùng chung ---------- */
const Flash: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: '#fff', opacity: interpolate(f, [at, at + 1, at + 9], [0, 0.42, 0], cl), pointerEvents: 'none' }} />;
};
const Bug: React.FC = () => (
  <div style={{ position: 'absolute', left: 64, top: 92, display: 'flex', alignItems: 'center', gap: 16, fontFamily: VN, color: CREAM, opacity: 0.92 }}>
    <div style={{ width: 62, height: 62, borderRadius: 16, background: SUN, color: INK, display: 'grid', placeItems: 'center', fontFamily: ZH, fontWeight: 900, fontSize: 38, rotate: '-6deg' }}>宝</div>
    <div style={{ fontWeight: 800, fontSize: 30, lineHeight: 1.1 }}>Bảo Khựa<div style={{ fontWeight: 700, fontSize: 17, letterSpacing: 5, opacity: 0.7 }}>CHINA-READY</div></div>
  </div>
);
/** 1 cụm tiếng Trung đủ 3 dòng: chữ Hán · pinyin · nghĩa Việt */
const ZhLine: React.FC<{ zh: string; py: string; vi: string; size?: number; color?: string; sub?: string; align?: 'left' | 'center' }> = ({ zh, py, vi, size = 120, color = SUN, sub = CREAM, align = 'left' }) => (
  <div style={{ textAlign: align }}>
    <div style={{ fontFamily: ZH, fontWeight: 900, fontSize: size, lineHeight: 1.12, color }}>{zh}</div>
    <div style={{ fontFamily: VN, fontWeight: 700, fontSize: size * 0.34, color: sub, marginTop: 10 }}>{py}</div>
    <div style={{ fontFamily: VN, fontWeight: 500, fontSize: size * 0.32, color: sub, opacity: 0.86, marginTop: 4 }}>{vi}</div>
  </div>
);

/* ---------- 1 · HOOK: bơi giữa vịnh ---------- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Sequence durationInFrames={38}><AbsoluteFill style={{ scale: interpolate(f, [0, 38], [1.12, 1.02], cl) }}><Video src={staticFile('swim-c.mp4')} muted style={cover} /></AbsoluteFill></Sequence>
      <Sequence from={36} durationInFrames={92}><AbsoluteFill style={{ scale: interpolate(f, [36, 128], [1.0, 1.07], cl) }}><Video src={staticFile('swim-a.mp4')} muted style={cover} /></AbsoluteFill></Sequence>
      <Sequence from={126} durationInFrames={114}><AbsoluteFill style={{ scale: interpolate(f, [126, 240], [1.04, 1.12], cl) }}><Video src={staticFile('swim-b.mp4')} muted playbackRate={0.9} style={cover} /></AbsoluteFill></Sequence>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg,rgba(5,10,20,.55) 0%,rgba(5,10,20,0) 26%,rgba(5,10,20,0) 52%,rgba(5,10,20,.78) 100%)' }} />
      <Flash at={36} /><Flash at={126} />
      {/* kicker */}
      <div style={{ position: 'absolute', left: 70, top: 250, opacity: life(f, 4, 120, 12), translate: `0px ${k(f, 4, 24, 30, 0)}px`, fontFamily: VN, color: CREAM }}>
        <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 8 }}>VỊNH HẠ LONG</div>
        <div style={{ fontWeight: 700, fontSize: 34, marginTop: 8 }}><span style={{ fontFamily: ZH, fontWeight: 900, color: SUN, fontSize: 46 }}>下龙湾</span> &nbsp;Xiàlóng Wān</div>
      </div>
      {/* câu hook */}
      <div style={{ position: 'absolute', left: 70, right: 70, top: 1080, fontFamily: VN, color: '#fff', textShadow: '0 4px 30px rgba(0,0,0,.5)' }}>
        {['Khách Trung đến vịnh', 'mỗi ngày.'].map((t, i) => (
          <div key={t} style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 800, fontSize: 80, lineHeight: 1.1, translate: `0px ${k(f, 20 + i * 8, 44 + i * 8, 110, 0)}%`, opacity: life(f, 20 + i * 8, 128, 6) }}>{t}</div>
          </div>
        ))}
        <div style={{ fontFamily: PF, fontWeight: 800, fontSize: 78, color: SUN, marginTop: 18, opacity: life(f, 70, 128, 8), translate: `${k(f, 70, 92, -40, 0)}px 0px` }}>Bạn chào họ được chưa?</div>
      </div>
      {/* câu chào tiếng Trung */}
      <div style={{ position: 'absolute', left: 70, right: 70, top: 980, opacity: life(f, 132, 240, 10), translate: `0px ${k(f, 132, 152, 40, 0)}px`, textShadow: '0 4px 30px rgba(0,0,0,.55)' }}>
        <ZhLine zh="你好！" py="nǐ hǎo!" vi="Xin chào!" size={170} />
        <div style={{ height: 34 }} />
        <div style={{ opacity: k(f, 160, 176) }}><ZhLine zh="欢迎来到下龙湾" py="huānyíng lái dào Xiàlóng Wān" vi="Chào mừng đến vịnh Hạ Long" size={104} /></div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 2 · BẢO LÀ AI ---------- */
const ROWS = [
  ['5 năm', 'sống và làm việc ở Trung Quốc'],
  ['Senbo Resort 5★', 'quản lý tiếp đón khách'],
  ['Tập đoàn TCL', 'kỹ sư chất lượng'],
  ['Hướng dẫn viên', 'du lịch quốc tế, dẫn đoàn khách Trung'],
];
const Who: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const sp = spring({ frame: f - 2, fps, config: { damping: 18, stiffness: 90 } });
  const sw = spring({ frame: f - 136, fps, config: { damping: 16, stiffness: 100 } });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(70% 45% at 80% 22%, rgba(255,217,31,.22), transparent 70%), radial-gradient(90% 60% at 10% 100%, rgba(30,90,168,.55), transparent 70%), linear-gradient(180deg,#0E2547,#060B16)` }}>
      <div style={{ position: 'absolute', right: -80, top: 640, fontFamily: ZH, fontWeight: 900, fontSize: 900, lineHeight: 1, color: '#fff', opacity: 0.04, translate: `${interpolate(f, [0, 240], [0, -60])}px 0px` }}>宝</div>
      <Bug />
      {/* ảnh chân dung */}
      <div style={{ position: 'absolute', left: 400, top: 230, width: 560, padding: '18px 18px 70px', background: '#fff', borderRadius: 14, boxShadow: '0 40px 80px -30px rgba(0,0,0,.8)', rotate: `${interpolate(sp, [0, 1], [8, -4])}deg`, translate: `${interpolate(sp, [0, 1], [500, 0])}px 0px`, opacity: interpolate(sw, [0, 1], [1, 0.0]) }}>
        <Img src={staticFile('portrait.jpg')} style={{ width: '100%', height: 630, objectFit: 'cover', objectPosition: '50% 20%', borderRadius: 6, scale: interpolate(f, [0, 240], [1.0, 1.08]) }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 18, textAlign: 'center', fontFamily: VN, fontWeight: 800, fontSize: 30, color: INK }}>Bảo · <span style={{ fontFamily: ZH }}>阿宝</span> Ā Bǎo</div>
      </div>
      {/* ảnh sân khấu Bằng Tường */}
      <div style={{ position: 'absolute', left: 300, top: 210, width: 600, padding: '18px 18px 18px', background: '#fff', borderRadius: 14, boxShadow: '0 40px 80px -30px rgba(0,0,0,.8)', rotate: `${interpolate(sw, [0, 1], [-10, 3])}deg`, translate: `${interpolate(sw, [0, 1], [700, 0])}px 0px`, opacity: sw > 0.01 ? 1 : 0 }}>
        <Img src={staticFile('stage.jpg')} style={{ width: '100%', height: 700, objectFit: 'cover', objectPosition: '50% 18%', borderRadius: 6 }} />
      </div>
      {/* tên */}
      <div style={{ position: 'absolute', left: 70, top: 1010, fontFamily: VN, color: CREAM, opacity: k(f, 8, 26), translate: `0px ${k(f, 8, 30, 40, 0)}px` }}>
        <div style={{ fontFamily: PFN, fontWeight: 800, fontSize: 110, lineHeight: 1 }}>Mình là Bảo</div>
        <div style={{ fontWeight: 700, fontSize: 40, marginTop: 14 }}><span style={{ fontFamily: ZH, fontWeight: 900, color: SUN, fontSize: 56 }}>阿宝</span> &nbsp;Ā Bǎo · người Hạ Long</div>
      </div>
      {/* lý lịch */}
      <div style={{ position: 'absolute', left: 70, right: 70, top: 1250, display: 'grid', gap: 22, opacity: k(f, 128, 140, 1, 0, IO) }}>
        {ROWS.map(([a, b], i) => (
          <div key={a} style={{ display: 'flex', alignItems: 'baseline', gap: 22, fontFamily: VN, opacity: k(f, 34 + i * 18, 50 + i * 18), translate: `${k(f, 34 + i * 18, 56 + i * 18, -60, 0)}px 0px` }}>
            <div style={{ fontWeight: 800, fontSize: 50, color: SUN, whiteSpace: 'nowrap' }}>{a}</div>
            <div style={{ fontWeight: 500, fontSize: 34, color: CREAM, lineHeight: 1.25 }}>{b}</div>
          </div>
        ))}
      </div>
      {/* danh hiệu */}
      <div style={{ position: 'absolute', left: 70, right: 70, top: 1250, fontFamily: VN, color: CREAM, opacity: life(f, 146, 240, 12), translate: `0px ${k(f, 146, 170, 40, 0)}px` }}>
        <div style={{ display: 'inline-block', padding: '10px 22px', borderRadius: 999, background: SUN, color: INK, fontWeight: 800, fontSize: 36 }}><span style={{ fontFamily: ZH, fontWeight: 900 }}>亚军</span> yàjūn · Á quân 2025</div>
        <div style={{ fontWeight: 800, fontSize: 54, lineHeight: 1.18, marginTop: 22 }}>Đại sứ Hình ảnh Du lịch Biên giới Trung – Việt</div>
        <div style={{ fontWeight: 500, fontSize: 32, marginTop: 14, opacity: 0.8 }}>Lễ trao giải ở Bằng Tường, Quảng Tây</div>
        <div style={{ fontFamily: PF, fontWeight: 800, fontSize: 60, color: SUN, marginTop: 30, opacity: k(f, 190, 206) }}>Giờ mình dạy lại, từ Hạ Long.</div>
      </div>
      <Flash at={136} />
    </AbsoluteFill>
  );
};

/* ---------- 3 · BAY QUA PHỐ 3D ---------- */
const STOPS = [
  { at: 60, zh: '酒店', py: 'jiǔdiàn', vi: 'Khách sạn của bạn' },
  { at: 129, zh: '夜市', py: 'yèshì', vi: 'Chợ đêm Bãi Cháy' },
  { at: 169, zh: '游乐园', py: 'yóulèyuán', vi: 'Khu vui chơi' },
  { at: 214, zh: '摩天轮', py: 'mótiānlún', vi: 'Vòng quay Mặt Trời' },
  { at: 262, zh: '大桥', py: 'dàqiáo', vi: 'Cầu Bãi Cháy' },
];
const City: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#081426' }}>
      <Video src={staticFile('tour.mp4')} muted playbackRate={1.6} style={cover} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg,rgba(6,16,32,.8) 0%,rgba(6,16,32,.15) 24%,rgba(6,16,32,0) 45%,rgba(6,16,32,.25) 62%,rgba(6,16,32,.85) 100%)' }} />
      <AbsoluteFill style={{ opacity: life(f, 0, 82, 10), background: 'linear-gradient(180deg,rgba(6,16,32,.92) 0%,rgba(6,16,32,.78) 30%,rgba(6,16,32,0) 52%)' }} />
      <Bug />
      <div style={{ position: 'absolute', left: 70, right: 70, top: 230, fontFamily: VN, color: '#fff', opacity: life(f, 4, 74, 12), textShadow: '0 4px 24px rgba(0,0,0,.5)' }}>
        <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 6, color: SUN }}>HỌC TIẾNG TRUNG · CHƠI TRÊN WEB</div>
        <div style={{ fontWeight: 800, fontSize: 88, lineHeight: 1.08, marginTop: 14, translate: `0px ${k(f, 4, 26, 40, 0)}px` }}>Mình dựng cả<br />phố Bãi Cháy</div>
        <div style={{ fontFamily: PF, fontWeight: 800, fontSize: 92, lineHeight: 1.1, color: SUN, translate: `0px ${k(f, 10, 32, 40, 0)}px`, opacity: k(f, 10, 26) }}>thành game 3D.</div>
      </div>
      <div style={{ position: 'absolute', left: 90, right: 90, top: 1200, height: 372, borderRadius: 34, background: 'rgba(8,16,30,.66)', border: '2px solid rgba(255,217,31,.45)', boxShadow: '0 40px 80px -30px rgba(0,0,0,.8)', opacity: k(f, 50, 60), scale: interpolate(f, [50, 62], [0.92, 1], cl) }} />
      {STOPS.map((s, i) => {
        const end = i < STOPS.length - 1 ? STOPS[i + 1].at - 10 : 320;
        const o = life(f, s.at - 10, end, 6), pop = spring({ frame: f - (s.at - 10), fps: 30, config: { damping: 14, stiffness: 140 } });
        return (
          <React.Fragment key={s.zh}>
            {/* ghim ở giữa khung (máy quay luôn dừng khu ở giữa) */}
            <div style={{ position: 'absolute', left: 540 - 34, top: 900 - 34, width: 68, height: 68, borderRadius: '50%', border: `5px solid ${SUN}`, opacity: o, scale: interpolate(pop, [0, 1], [0.2, 1]), boxShadow: '0 0 0 12px rgba(255,217,31,.18)' }} />
            <div style={{ position: 'absolute', left: 537, top: 968, width: 6, height: 230, background: `linear-gradient(${SUN},rgba(255,217,31,0))`, opacity: o, scale: `1 ${pop}`, transformOrigin: '50% 0' }} />
            <div style={{ position: 'absolute', left: 90, right: 90, top: 1200, padding: '34px 40px 36px', opacity: o, translate: `0px ${interpolate(pop, [0, 1], [40, 0])}px` }}>
              <ZhLine zh={s.zh} py={s.py} vi={s.vi} size={132} align="center" />
            </div>
          </React.Fragment>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 300, textAlign: 'center', fontFamily: VN, fontWeight: 700, fontSize: 28, color: CREAM, opacity: 0.75 }}>Phim dựng từ chính game · Khách sạn Vịnh Ā Bǎo</div>
    </AbsoluteFill>
  );
};

/* ---------- 4 · CHƠI THẾ NÀO ---------- */
const STEP = ['Khách Trung nói một câu', 'Bạn chọn đúng nghĩa · nhận xu', 'Xu xây khách sạn từ 1★ lên 5★'];
const How: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const ph = spring({ frame: f, fps, config: { damping: 18, stiffness: 110 } });
  const okp = spring({ frame: f - 58, fps, config: { damping: 12, stiffness: 160 } });
  const step = f < 56 ? 0 : f < 112 ? 1 : 2;
  const starIdx = Math.max(0, Math.min(4, Math.floor((f - 112) / 25)));
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg,#0F3468,#071A31)' }}>
      {/* phần A: màn hình câu hỏi thật trong game */}
      <AbsoluteFill style={{ opacity: k(f, 108, 118, 1, 0, IO) }}>
        <div style={{ position: 'absolute', left: 150, top: 380, width: 780, height: 1386, borderRadius: 70, background: '#111', padding: 14, boxShadow: '0 60px 120px -40px rgba(0,0,0,.9), 0 0 0 3px #3c4250', translate: `0px ${interpolate(ph, [0, 1], [300, 0])}px`, rotate: `${interpolate(ph, [0, 1], [6, 0])}deg` }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 58, overflow: 'hidden' }}>
            <Img src={staticFile('ui-ask.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {/* tô câu tiếng Trung */}
            <div style={{ position: 'absolute', left: `${(60 / 1080) * 100}%`, top: `${(872 / 1920) * 100}%`, width: `${(610 / 1080) * 100}%`, height: `${(130 / 1920) * 100}%`, borderRadius: 18, border: `6px solid ${SUN}`, opacity: life(f, 16, 60, 6), scale: interpolate(f, [16, 26], [1.15, 1], cl) }} />
            {/* đáp án đúng */}
            <div style={{ position: 'absolute', left: `${(36 / 1080) * 100}%`, top: `${(1686 / 1920) * 100}%`, width: `${(1008 / 1080) * 100}%`, height: `${(168 / 1920) * 100}%`, borderRadius: 26, background: 'rgba(47,191,113,.9)', display: 'flex', alignItems: 'center', paddingLeft: 40, fontFamily: VN, fontWeight: 800, fontSize: 40, color: '#fff', opacity: okp > 0.02 ? 1 : 0, scale: interpolate(okp, [0, 1], [0.9, 1]) }}>D · xin chào ✓</div>
          </div>
        </div>
        <div style={{ position: 'absolute', right: 70, top: 1160, padding: '16px 26px', borderRadius: 24, background: SUN, color: INK, fontFamily: VN, fontWeight: 800, fontSize: 52, opacity: okp > 0.02 ? 1 : 0, scale: interpolate(okp, [0, 1], [0.3, 1]), rotate: '6deg', boxShadow: '0 20px 40px -12px rgba(0,0,0,.6)' }}>+58 xu</div>
      </AbsoluteFill>
      {/* phần B: khách sạn lớn dần theo hạng sao (ảnh dựng từ thế giới 3D) */}
      {[1, 2, 3, 4, 5].map((s, i) => {
        const a = 112 + i * 25;
        return (
          <AbsoluteFill key={s} style={{ opacity: i === 4 ? k(f, a, a + 8) : life(f, a, a + 31, 8) }}>
            <Img src={staticFile(`star${s}.jpg`)} style={{ ...cover, scale: interpolate(f, [a, a + 40], [1.08, 1.0], cl) }} />
          </AbsoluteFill>
        );
      })}
      <AbsoluteFill style={{ opacity: k(f, 112, 120), background: 'linear-gradient(180deg,rgba(6,16,32,.85) 0%,rgba(6,16,32,0) 30%,rgba(6,16,32,0) 66%,rgba(6,16,32,.85) 100%)' }} />
      <div style={{ position: 'absolute', left: 70, right: 70, bottom: 470, textAlign: 'center', opacity: k(f, 116, 126), fontFamily: VN }}>
        <div style={{ fontSize: 110, letterSpacing: 12, color: SUN, textShadow: '0 6px 30px rgba(0,0,0,.6)' }}>
          {[0, 1, 2, 3, 4].map(i => <span key={i} style={{ opacity: i <= starIdx ? 1 : 0.22, display: 'inline-block', scale: i === starIdx ? interpolate((f - 112) % 25, [0, 6], [1.5, 1], cl) : 1 }}>★</span>)}
        </div>
        <div style={{ fontWeight: 800, fontSize: 46, color: '#fff', marginTop: 8 }}>{['Nhà nghỉ của bà', 'Thêm ban công, hoa', 'Mái kính, biển sáng đèn', 'Sảnh lớn, sư tử đá', 'Khách sạn 5 sao bên vịnh'][starIdx]}</div>
      </div>
      <Bug />
      {/* tiêu đề bước */}
      <div style={{ position: 'absolute', left: 70, right: 70, top: 200, fontFamily: VN, color: '#fff', textShadow: '0 4px 24px rgba(0,0,0,.5)' }}>
        <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 6, color: SUN }}>CHƠI THẾ NÀO</div>
        {STEP.map((t, i) => (
          <div key={t} style={{ position: 'absolute', top: 50, left: 0, right: 0, display: 'flex', gap: 20, alignItems: 'baseline', opacity: step === i ? k(f, [0, 56, 112][i], [0, 56, 112][i] + 10) : 0, translate: `0px ${step === i ? k(f, [0, 56, 112][i], [0, 56, 112][i] + 14, 30, 0) : 0}px` }}>
            <div style={{ fontFamily: PFN, fontWeight: 800, fontSize: 88, color: SUN }}>{i + 1}</div>
            <div style={{ fontWeight: 800, fontSize: 56, lineHeight: 1.15 }}>{t}</div>
          </div>
        ))}
      </div>
      <Flash at={112} />
    </AbsoluteFill>
  );
};

/* ---------- 5 · LỘ TRÌNH HSK ---------- */
const HSK = [
  { lv: 'HSK0', zh: '你好', py: 'nǐ hǎo', vi: 'Xin chào' },
  { lv: 'HSK1', zh: '我想办理入住', py: 'wǒ xiǎng bànlǐ rùzhù', vi: 'Tôi muốn làm thủ tục nhận phòng' },
  { lv: 'HSK2', zh: '我已经下班了', py: 'wǒ yǐjīng xiàbān le', vi: 'Tôi tan ca rồi' },
  { lv: 'HSK3', zh: '我给您换房间', py: 'wǒ gěi nín huàn fángjiān', vi: 'Tôi đổi phòng cho anh chị' },
  { lv: 'HSK4', zh: '我们按时交货', py: 'wǒmen ànshí jiāohuò', vi: 'Chúng tôi giao hàng đúng hạn' },
];
const Path: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const cur = Math.max(0, Math.min(4, Math.floor((f - 14) / 24)));
  const W = 168, D = 60;      // bề ngang 1 bậc, độ sâu giả 3D
  return (
    <AbsoluteFill style={{ background: `radial-gradient(80% 50% at 50% 30%, #FFE97A, ${SUN} 70%)` }}>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 200, fontFamily: VN, color: INK }}>
        <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 6, color: '#1E5AA8' }}>LỘ TRÌNH GỢI Ý</div>
        <div style={{ fontFamily: PFN, fontWeight: 800, fontSize: 104, lineHeight: 1.04, marginTop: 10, translate: `0px ${k(f, 0, 18, 40, 0)}px`, opacity: k(f, 0, 12) }}>HSK0 → HSK4</div>
        <div style={{ fontWeight: 500, fontSize: 34, marginTop: 10, opacity: k(f, 8, 20) }}>Từ con số 0 tới họp, đàm phán, phỏng vấn.</div>
      </div>
      {/* bậc thang khối 3D */}
      <svg width={1080} height={760} style={{ position: 'absolute', left: 0, top: 560 }}>
        {HSK.map((s, i) => {
          const st = spring({ frame: f - (6 + i * 10), fps, config: { damping: 15, stiffness: 120 } });
          const h = 110 + i * 92, x = 80 + i * W, base = 700, y = base - h + interpolate(st, [0, 1], [h + 40, 0]);
          const lit = i <= cur && f >= 14;
          const top = lit ? (i === 4 ? '#16171B' : '#fff') : '#FFF3B8', front = lit ? (i === 4 ? '#23252C' : '#F2B200') : '#E8C64A', side = lit ? (i === 4 ? '#0B0C10' : '#C99200') : '#D2B33F';
          return (
            <g key={s.lv} opacity={st}>
              <polygon points={`${x},${y} ${x + W},${y} ${x + W + D},${y - D * 0.55} ${x + D},${y - D * 0.55}`} fill={top} stroke="#16171B" strokeWidth={3} />
              <polygon points={`${x},${y} ${x + W},${y} ${x + W},${base} ${x},${base}`} fill={front} stroke="#16171B" strokeWidth={3} />
              <polygon points={`${x + W},${y} ${x + W + D},${y - D * 0.55} ${x + W + D},${base - D * 0.55} ${x + W},${base}`} fill={side} stroke="#16171B" strokeWidth={3} />
              <text x={x + W / 2} y={y + 58} textAnchor="middle" fontFamily={VN} fontWeight={800} fontSize={36} fill={i === 4 && lit ? SUN : '#16171B'}>{s.lv}</text>
            </g>
          );
        })}
        {/* con dấu 宝 nhảy lên từng bậc */}
        {(() => {
          const t = Math.max(0, f - 14), i = Math.min(4, Math.floor(t / 24)), u = Math.min(1, (t % 24) / 12);
          const xi = (j: number) => 80 + j * W + W / 2 + D / 2, yi = (j: number) => 700 - (110 + j * 92) - D * 0.3;
          const from = Math.max(0, i - 1), x = interpolate(u, [0, 1], [xi(from), xi(i)]), y = interpolate(u, [0, 1], [yi(from), yi(i)]) - Math.sin(u * Math.PI) * 70;
          return <g opacity={k(f, 10, 16)} transform={`translate(${x} ${y - 46})`}><rect x={-40} y={-40} width={80} height={80} rx={20} fill="#16171B" transform="rotate(-6)" /><text x={0} y={22} textAnchor="middle" fontFamily={ZH} fontWeight={900} fontSize={56} fill={SUN}>宝</text></g>;
        })()}
      </svg>
      {/* câu mẫu từng bậc */}
      <div style={{ position: 'absolute', left: 70, right: 70, top: 1330, height: 260 }}>
        {HSK.map((s, i) => (
          <div key={s.lv} style={{ position: 'absolute', inset: 0, opacity: i === cur ? k(f, 14 + i * 24, 22 + i * 24) : 0, translate: `0px ${i === cur ? k(f, 14 + i * 24, 30 + i * 24, 24, 0) : 0}px` }}>
            <ZhLine zh={s.zh} py={s.py} vi={s.vi} size={100} color={INK} sub={INK} />
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 1640, fontFamily: VN, fontWeight: 500, fontSize: 26, color: '#4d4514' }}>Luyện tập theo khung HSK · 12 chương Hành trình Hạ Long trong game</div>
    </AbsoluteFill>
  );
};

/* ---------- 6 · LỜI MỜI ---------- */
const Cta: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 13, stiffness: 90 } });
  return (
    <AbsoluteFill style={{ background: '#05101f' }}>
      <AbsoluteFill style={{ scale: interpolate(f, [0, 240], [1.12, 1.0]), filter: 'saturate(1.1)' }}><Img src={staticFile('star5.jpg')} style={cover} /></AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg,rgba(5,12,24,.88) 0%,rgba(5,12,24,.55) 40%,rgba(5,12,24,.9) 100%)' }} />
      <div style={{ position: 'absolute', left: 540 - 140, top: 300, width: 280, height: 280, perspective: 900 }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 64, background: `linear-gradient(145deg,#FFE97A,#F2B200)`, display: 'grid', placeItems: 'center', fontFamily: ZH, fontWeight: 900, fontSize: 190, color: INK, boxShadow: '0 30px 90px -20px rgba(255,217,31,.7)', rotate: `y ${interpolate(s, [0, 1], [180, -8])}deg`, scale: interpolate(s, [0, 1], [0.4, 1]) }}>宝</div>
      </div>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 660, textAlign: 'center', fontFamily: VN, color: '#fff' }}>
        <div style={{ fontFamily: PFN, fontWeight: 800, fontSize: 96, lineHeight: 1.06, opacity: k(f, 14, 30), translate: `0px ${k(f, 14, 36, 40, 0)}px` }}>Học tiếng Trung<br />để đi làm</div>
        <div style={{ fontWeight: 700, fontSize: 44, marginTop: 20, opacity: k(f, 26, 40) }}>cùng Bảo · <span style={{ fontFamily: ZH, fontWeight: 900, color: SUN }}>阿宝</span> Ā Bǎo</div>
      </div>
      {[
        ['CHƠI GAME 3D', 'baokhua.com/hotel'],
        ['HỌC CÙNG BẢO', 'Nhóm Zalo · link ở baokhua.com'],
      ].map(([a, b], i) => (
        <div key={a} style={{ position: 'absolute', left: 110, right: 110, top: 1040 + i * 196, padding: '24px 34px', borderRadius: 34, background: i ? 'rgba(255,255,255,.1)' : SUN, border: i ? '2px solid rgba(255,255,255,.35)' : 'none', color: i ? '#fff' : INK, fontFamily: VN, textAlign: 'center', opacity: k(f, 44 + i * 14, 58 + i * 14), translate: `0px ${k(f, 44 + i * 14, 66 + i * 14, 50, 0)}px` }}>
          <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: 5, opacity: 0.75 }}>{a}</div>
          <div style={{ fontWeight: 800, fontSize: 50, marginTop: 4 }}>{b}</div>
        </div>
      ))}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1460, textAlign: 'center', fontFamily: VN, fontWeight: 700, fontSize: 34, color: CREAM, opacity: k(f, 80, 96) }}>TikTok @baokhuaa</div>
      <AbsoluteFill style={{ background: '#000', opacity: k(f, 218, 240, 0, 1, IO) }} />
    </AbsoluteFill>
  );
};

export const Trailer: React.FC = () => (
  <AbsoluteFill style={{ background: '#000' }}>
    <Sequence durationInFrames={240}><Hook /></Sequence>
    <Sequence from={240} durationInFrames={240}><Who /></Sequence>
    <Sequence from={480} durationInFrames={320}><City /></Sequence>
    <Sequence from={800} durationInFrames={240}><How /></Sequence>
    <Sequence from={1040} durationInFrames={160}><Path /></Sequence>
    <Sequence from={1200} durationInFrames={240}><Cta /></Sequence>
    <Flash at={240} /><Flash at={480} /><Flash at={800} /><Flash at={1040} /><Flash at={1200} />
    <Audio src={staticFile('music.wav')} />
  </AbsoluteFill>
);
