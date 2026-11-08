/* Video DEBUT v3 9:16 · "Bảo Khựa 阿宝" – bài đầu tiên, chạy quảng cáo TikTok
   Cảnh thật lấy từ phim 2K chuyến bơi qua vịnh của Bảo (07_TU_LIEU_VIDEO, 08/11). Thêm chương "Hành trình thật" (780–900).
   38 giây, 30 fps, 1080×1920, nhạc tự soạn 120 BPM (1 ô nhịp = 60 khung = 2 giây).
   Nền chuyển cảnh dựng bằng kỹ thuật "nối cảnh" (noicanh.py): đoạn A bơi vịnh thật, đoạn B chuỗi 3D nối liền
   (khung cuối đoạn trước = khung đầu đoạn sau, đường cong tốc độ chữ S khoá theo ô nhịp), đoạn C bơi vịnh cho lời mời.
   Không bán khoá học: chỉ dẫn về baokhua.com. Chữ Trung luôn kèm pinyin và nghĩa Việt.
   Vùng an toàn TikTok: chữ chính trong x 70–960, y 220–1480. */
import React from 'react';
import { AbsoluteFill, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Audio, Video } from '@remotion/media';
import { loadFont as loadLocal } from '@remotion/fonts';
import FONTS from './fonts.json';

FONTS.forEach((o: { family: string; file: string; weight: string; style: string; unicodeRange: string }) =>
  loadLocal({ family: o.family + (o.style === 'italic' ? 'I' : ''), url: staticFile(o.file), weight: o.weight, unicodeRange: o.unicodeRange }));
loadLocal({ family: 'BKZH', url: staticFile('fonts/zh900.woff2'), weight: '900' });
loadLocal({ family: 'BKZH', url: staticFile('fonts/zh700.woff2'), weight: '700' });
const VN = 'BKVN, sans-serif', PF = 'BKPFI, serif', PFN = 'BKPF, serif', ZH = 'BKZH, "Noto Serif SC", serif';
const SUN = '#FFD91F', CREAM = '#FFF7D6', INK = '#0B1222';
const OUT = Easing.bezier(0.16, 1, 0.3, 1), IO = Easing.bezier(0.65, 0, 0.35, 1);
const cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const k = (f: number, a: number, b: number, from = 0, to = 1, e = OUT) => interpolate(f, [a, b], [from, to], { ...cl, easing: e });
const life = (f: number, a: number, b: number, d = 8) => Math.min(k(f, a, a + d), k(f, b - d, b, 1, 0, IO));
const BEAT = 15;   // khung / phách
const cover: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover' };
const shadow = '0 4px 28px rgba(0,0,0,.55)';

const Flash: React.FC<{ at: number; a?: number }> = ({ at, a = 0.5 }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: '#FFF4D0', opacity: interpolate(f, [at, at + 1, at + 8], [0, a, 0], cl), pointerEvents: 'none' }} />;
};
/** chữ bật theo phách: mỗi từ vào ở khung riêng */
const Pop: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 13, stiffness: 190 } });
  return <span style={{ display: 'inline-block', opacity: f < at ? 0 : 1, scale: interpolate(s, [0, 1], [0.6, 1]), translate: `0px ${interpolate(s, [0, 1], [30, 0])}px`, ...style }}>{children}</span>;
};
const Zh: React.FC<{ zh: string; py: string; vi: string; size?: number; color?: string; sub?: string; align?: 'left' | 'center' }> = ({ zh, py, vi, size = 120, color = SUN, sub = CREAM, align = 'center' }) => (
  <div style={{ textAlign: align }}>
    <div style={{ fontFamily: ZH, fontWeight: 900, fontSize: size, lineHeight: 1.1, color }}>{zh}</div>
    <div style={{ fontFamily: VN, fontWeight: 700, fontSize: size * 0.33, color: sub, marginTop: 8 }}>{py}</div>
    <div style={{ fontFamily: VN, fontWeight: 500, fontSize: size * 0.31, color: sub, opacity: 0.88, marginTop: 2 }}>{vi}</div>
  </div>
);
const Bug: React.FC<{ o?: number }> = ({ o = 1 }) => (
  <div style={{ position: 'absolute', left: 64, top: 96, display: 'flex', alignItems: 'center', gap: 14, fontFamily: VN, color: CREAM, opacity: o * 0.95, textShadow: shadow }}>
    <div style={{ width: 58, height: 58, borderRadius: 15, background: SUN, color: INK, display: 'grid', placeItems: 'center', fontFamily: ZH, fontWeight: 900, fontSize: 36, rotate: '-6deg', textShadow: 'none' }}>宝</div>
    <div style={{ fontWeight: 800, fontSize: 28, lineHeight: 1.1 }}>Bảo Khựa<div style={{ fontWeight: 700, fontSize: 16, letterSpacing: 5, opacity: 0.75 }}>CHINA-READY</div></div>
  </div>
);

/* ---------- 1 · HOOK: Bảo bơi giữa vịnh (0–120) ---------- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg,rgba(5,10,20,.45) 0%,rgba(5,10,20,0) 22%,rgba(5,10,20,0) 48%,rgba(5,10,20,.8) 100%)' }} />
      <div style={{ position: 'absolute', left: 70, top: 230, display: 'flex', alignItems: 'center', gap: 12, fontFamily: VN, color: '#fff', textShadow: shadow, opacity: life(f, 2, 118, 10) }}>
        <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#ff4d4d', boxShadow: '0 0 0 6px rgba(255,77,77,.25)' }} />
        <span style={{ fontWeight: 800, fontSize: 30, letterSpacing: 3 }}>VỊNH HẠ LONG</span>
        <span style={{ fontFamily: ZH, fontWeight: 900, fontSize: 36, color: SUN }}>下龙湾</span>
        <span style={{ fontWeight: 700, fontSize: 28 }}>Xiàlóng Wān</span>
      </div>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 1060, fontFamily: VN, color: '#fff', textShadow: shadow, opacity: k(f, 56, 62, 1, 0, IO) }}>
        <div style={{ fontWeight: 700, fontSize: 52 }}><Pop at={3}>Mỗi ngày,</Pop></div>
        <div style={{ fontWeight: 800, fontSize: 92, lineHeight: 1.06 }}><Pop at={15}>khách Trung Quốc</Pop></div>
        <div style={{ fontFamily: PF, fontWeight: 800, fontSize: 92, lineHeight: 1.1, color: SUN }}><Pop at={30}>đến vịnh Hạ Long.</Pop></div>
      </div>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 900, fontFamily: VN, color: '#fff', textShadow: shadow, opacity: f < 60 ? 0 : 1 }}>
        <div style={{ fontWeight: 800, fontSize: 84, lineHeight: 1.08 }}><Pop at={61}>Bạn chào họ</Pop> <Pop at={70}>thế nào?</Pop></div>
        <div style={{ marginTop: 40, opacity: k(f, 88, 96) }}>
          <Pop at={88}><Zh zh="你好！" py="nǐ hǎo!" vi="Xin chào!" size={170} align="left" /></Pop>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 2 · BAY QUA HẠ LONG 3D (120–420) ---------- */
const STOPS = [
  { a: 40, b: 82, zh: '大桥', py: 'dàqiáo', vi: 'Cầu Bãi Cháy' },
  { a: 100, b: 142, zh: '酒店', py: 'jiǔdiàn', vi: 'Khách sạn' },
  { a: 160, b: 202, zh: '夜市', py: 'yèshì', vi: 'Chợ đêm' },
  { a: 220, b: 262, zh: '摩天轮', py: 'mótiānlún', vi: 'Vòng quay Mặt Trời' },
];
const World3D: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const drop = spring({ frame: f, fps, config: { damping: 11, stiffness: 160 } });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg,rgba(6,16,32,.8) 0%,rgba(6,16,32,.1) 26%,rgba(6,16,32,0) 50%,rgba(6,16,32,.55) 100%)' }} />
      <Bug o={k(f, 10, 20)} />
      <div style={{ position: 'absolute', left: 70, right: 70, top: 260, fontFamily: VN, color: '#fff', textShadow: shadow, opacity: life(f, 0, 64, 8) }}>
        <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 6, color: SUN, opacity: k(f, 4, 12) }}>GAME 3D · CHƠI TRÊN WEB</div>
        <div style={{ fontWeight: 800, fontSize: 96, lineHeight: 1.04, marginTop: 10, scale: interpolate(drop, [0, 1], [1.25, 1]), transformOrigin: '0 50%' }}>Mình dựng lại<br />cả Hạ Long</div>
        <div style={{ fontFamily: PF, fontWeight: 800, fontSize: 100, lineHeight: 1.08, color: SUN }}><Pop at={14}>thành game 3D.</Pop></div>
      </div>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 250, fontFamily: VN, fontWeight: 800, fontSize: 50, lineHeight: 1.18, color: '#fff', textShadow: shadow, opacity: life(f, 70, 290, 10) }}>
        Mỗi nơi trong game<br /><span style={{ color: SUN }}>là một bài tiếng Trung.</span>
      </div>
      {STOPS.map(s => {
        const o = life(f, s.a, s.b, 6), pop = spring({ frame: f - s.a, fps, config: { damping: 13, stiffness: 160 } });
        return (
          <React.Fragment key={s.zh}>
            <div style={{ position: 'absolute', left: 540 - 36, top: 960 - 36, width: 72, height: 72, borderRadius: '50%', border: `6px solid ${SUN}`, boxShadow: '0 0 0 14px rgba(255,217,31,.2)', opacity: o, scale: interpolate(pop, [0, 1], [0.2, 1]) }} />
            <div style={{ position: 'absolute', left: 537, top: 1032, width: 6, height: 150, background: `linear-gradient(${SUN},rgba(255,217,31,0))`, opacity: o, scale: `1 ${pop}`, transformOrigin: '50% 0' }} />
            <div style={{ position: 'absolute', left: 120, right: 120, top: 1180, padding: '30px 30px 32px', borderRadius: 34, background: 'rgba(8,16,30,.72)', border: '2px solid rgba(255,217,31,.5)', opacity: o, translate: `0px ${interpolate(pop, [0, 1], [50, 0])}px`, boxShadow: '0 40px 80px -30px rgba(0,0,0,.8)' }}>
              <Zh zh={s.zh} py={s.py} vi={s.vi} size={128} />
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- 3 · CHƠI THẾ NÀO: câu hỏi thật trong game (420–480) ---------- */
const GameQ: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const ph = spring({ frame: f, fps, config: { damping: 16, stiffness: 150 } });
  const ok = spring({ frame: f - 28, fps, config: { damping: 11, stiffness: 190 } });
  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{ filter: 'blur(18px) brightness(.45)', scale: 1.1 }}><Img src={staticFile('star5.jpg')} style={cover} /></AbsoluteFill>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 220, fontFamily: VN, color: '#fff', textShadow: shadow }}>
        <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 6, color: SUN }}>CHƠI THẾ NÀO</div>
        <div style={{ fontWeight: 800, fontSize: 66, lineHeight: 1.1, marginTop: 8, opacity: f < 28 ? 1 : 0 }}>Khách nói tiếng Trung.</div>
        <div style={{ fontWeight: 800, fontSize: 66, lineHeight: 1.1, marginTop: -72, opacity: f < 28 ? 0 : 1, color: SUN }}><Pop at={28}>Bạn chọn đúng nghĩa.</Pop></div>
      </div>
      <div style={{ position: 'absolute', left: 190, top: 420, width: 700, height: 1244, borderRadius: 64, background: '#111', padding: 12, boxShadow: '0 60px 120px -40px rgba(0,0,0,.9), 0 0 0 3px #3c4250', translate: `0px ${interpolate(ph, [0, 1], [500, 0])}px`, rotate: `${interpolate(ph, [0, 1], [8, 0])}deg` }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 54, overflow: 'hidden' }}>
          <Img src={staticFile('ui-ask.jpg')} style={cover} />
          <div style={{ position: 'absolute', left: `${(60 / 1080) * 100}%`, top: `${(872 / 1920) * 100}%`, width: `${(610 / 1080) * 100}%`, height: `${(130 / 1920) * 100}%`, borderRadius: 16, border: `6px solid ${SUN}`, opacity: life(f, 8, 30, 4) }} />
          <div style={{ position: 'absolute', left: `${(36 / 1080) * 100}%`, top: `${(1686 / 1920) * 100}%`, width: `${(1008 / 1080) * 100}%`, height: `${(168 / 1920) * 100}%`, borderRadius: 24, background: 'rgba(47,191,113,.92)', display: 'flex', alignItems: 'center', paddingLeft: 36, fontFamily: VN, fontWeight: 800, fontSize: 38, color: '#fff', opacity: ok > 0.02 ? 1 : 0, scale: interpolate(ok, [0, 1], [0.9, 1]) }}>D · xin chào ✓</div>
        </div>
      </div>
      <div style={{ position: 'absolute', right: 90, top: 1120, padding: '14px 26px', borderRadius: 24, background: SUN, color: INK, fontFamily: VN, fontWeight: 800, fontSize: 56, opacity: ok > 0.02 ? 1 : 0, scale: interpolate(ok, [0, 1], [0.3, 1]), rotate: '7deg', boxShadow: '0 20px 40px -12px rgba(0,0,0,.6)' }}>+58 xu</div>
    </AbsoluteFill>
  );
};

/* ---------- 4 · KHÁCH SẠN LỚN DẦN 1★ → 5★ (480–540) ---------- */
const Stars: React.FC = () => {
  const f = useCurrentFrame();
  const i = Math.min(4, Math.floor(f / 12));
  return (
    <AbsoluteFill style={{ background: INK }}>
      {[1, 2, 3, 4, 5].map((s, n) => (
        <AbsoluteFill key={s} style={{ opacity: n === i ? 1 : 0 }}>
          <Img src={staticFile(`star${s}.jpg`)} style={{ ...cover, scale: interpolate(f - n * 12, [0, 12], [1.07, 1.0], cl) }} />
        </AbsoluteFill>
      ))}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg,rgba(6,16,32,.85) 0%,rgba(6,16,32,0) 30%,rgba(6,16,32,0) 62%,rgba(6,16,32,.85) 100%)' }} />
      <div style={{ position: 'absolute', left: 70, right: 70, top: 230, fontFamily: VN, color: '#fff', textShadow: shadow }}>
        <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 6, color: SUN }}>TRẢ LỜI ĐÚNG → CÓ XU</div>
        <div style={{ fontWeight: 800, fontSize: 76, lineHeight: 1.08, marginTop: 8 }}>Xu xây khách sạn<br /><span style={{ fontFamily: PF, color: SUN }}>từ nhà nghỉ lên 5 sao.</span></div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1300, textAlign: 'center', fontSize: 120, letterSpacing: 14, color: SUN, textShadow: shadow }}>
        {[0, 1, 2, 3, 4].map(n => <span key={n} style={{ display: 'inline-block', opacity: n <= i ? 1 : 0.2, scale: n === i ? interpolate(f - n * 12, [0, 5], [1.6, 1], cl) : 1 }}>★</span>)}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 5 · BÀI GIẢNG NHỎ: thanh điệu (540–660) – đồ hoạ 3D giải thích vì sao 你好 đọc là "ní hǎo" ---------- */
// đường thanh trên thang 5 bậc (x 0..1, y = bậc 1..5)
const C3 = [[0, 2], [0.45, 1], [1, 4]], C2 = [[0, 3], [1, 5]];
const path = (pts: number[][], x0: number, w: number, top: number, h: number) => pts.map(([x, y], j) => `${j ? 'L' : 'M'}${x0 + x * w},${top + h - ((y - 1) / 4) * h}`).join(' ');
const lerpPts = (a: number[][], b: number[][], t: number) => { const bb = b.length === 2 ? [b[0], [0.45, (b[0][1] + b[1][1]) / 2], b[1]] : b; return a.map((p, j) => [p[0] + (bb[j][0] - p[0]) * t, p[1] + (bb[j][1] - p[1]) * t]); };
const Lesson: React.FC = () => {
  const f = useCurrentFrame();
  const m = k(f, 72, 92, 0, 1, IO);          // 你 đổi từ thanh 3 sang thanh 2 (đúng lúc nhạc phát "ní")
  const d1 = k(f, 15, 30), d2 = k(f, 45, 60);  // vẽ 2 đường theo tiếng sáo (phách 2 và 4 của ô 9)
  const T = 250, H = 300, X1 = 150, X2 = 590, W = 340;
  const p1 = path(lerpPts(C3, C2, m), X1, W, T, H), p2 = path(C3, X2, W, T, H);
  const layers = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <AbsoluteFill style={{ background: `radial-gradient(80% 50% at 50% 35%, #16305a, ${INK} 70%)` }}>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 220, fontFamily: VN, color: '#fff' }}>
        <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 6, color: SUN }}>BÀI GIẢNG 10 GIÂY · THANH ĐIỆU</div>
        <div style={{ fontWeight: 800, fontSize: 64, lineHeight: 1.12, marginTop: 10 }}>Viết <span style={{ color: SUN }}>nǐ hǎo</span>,<br />sao lại đọc <span style={{ fontFamily: PF, color: SUN }}>“ní hǎo”?</span></div>
      </div>
      {/* biểu đồ thanh điệu nghiêng 3D: nhiều lớp nét chồng lệch nhau tạo bề dày */}
      <div style={{ position: 'absolute', left: 0, top: 560, width: 1080, height: 700, perspective: 1400 }}>
        <div style={{ width: '100%', height: '100%', transform: `rotateX(${interpolate(f, [0, 120], [24, 16])}deg) rotateY(${interpolate(f, [0, 120], [-16, -8])}deg)`, transformStyle: 'preserve-3d' }}>
          <svg width={1080} height={700} style={{ overflow: 'visible' }}>
            {[1, 2, 3, 4, 5].map(l => <g key={l}><line x1={110} x2={970} y1={T + H - ((l - 1) / 4) * H} y2={T + H - ((l - 1) / 4) * H} stroke="rgba(255,255,255,.14)" strokeWidth={2} strokeDasharray="8 10" /><text x={80} y={T + H - ((l - 1) / 4) * H + 10} fill="rgba(255,255,255,.45)" fontFamily={VN} fontWeight={700} fontSize={26} textAnchor="middle">{l}</text></g>)}
            {layers.map(z => <path key={'a' + z} d={p1} fill="none" stroke={z === 7 ? SUN : `rgba(242,178,0,${0.18 + z * 0.06})`} strokeWidth={z === 7 ? 16 : 14} strokeLinecap="round" strokeLinejoin="round" transform={`translate(${7 - z} ${(7 - z) * 2.2})`} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - d1} />)}
            {layers.map(z => <path key={'b' + z} d={p2} fill="none" stroke={z === 7 ? '#7fd4ff' : `rgba(30,90,168,${0.25 + z * 0.08})`} strokeWidth={z === 7 ? 16 : 14} strokeLinecap="round" strokeLinejoin="round" transform={`translate(${7 - z} ${(7 - z) * 2.2})`} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - d2} />)}
            <text x={X1 + W / 2} y={T - 70} textAnchor="middle" fontFamily={ZH} fontWeight={900} fontSize={120} fill="#fff">你</text>
            <text x={X2 + W / 2} y={T - 70} textAnchor="middle" fontFamily={ZH} fontWeight={900} fontSize={120} fill="#fff">好</text>
          </svg>
        </div>
      </div>
      {/* pinyin dưới từng chữ: nǐ → ní */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1180, display: 'flex', justifyContent: 'center', gap: 280, fontFamily: VN, fontWeight: 800, fontSize: 84, color: '#fff' }}>
        <span style={{ position: 'relative', width: 160, textAlign: 'center' }}>
          <span style={{ position: 'absolute', inset: 0, opacity: 1 - m }}>nǐ</span>
          <span style={{ position: 'absolute', inset: 0, opacity: m, color: SUN, scale: interpolate(m, [0, 1], [1.4, 1]) }}>ní</span>
        </span>
        <span style={{ width: 160, textAlign: 'center' }}>hǎo</span>
      </div>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 1320, fontFamily: VN, color: '#fff', textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 40, opacity: life(f, 10, 64, 6) }}>Chữ viết: thanh 3 + thanh 3</div>
        <div style={{ fontWeight: 800, fontSize: 44, lineHeight: 1.3, marginTop: -54, opacity: k(f, 66, 76) }}>
          Hai thanh 3 đứng liền nhau<br /><span style={{ color: SUN }}>→ chữ đầu đọc thành thanh 2.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 6 · AI DẠY? Bảo thật (660–780) ---------- */
const CHIPS = ['5 năm làm việc ở Trung Quốc', 'Quản lý tiếp đón resort 5★', 'Kỹ sư chất lượng · Tập đoàn TCL', 'Hướng dẫn viên du lịch quốc tế'];
const Who: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const a = spring({ frame: f, fps, config: { damping: 15, stiffness: 120 } });
  const b = spring({ frame: f - 60, fps, config: { damping: 15, stiffness: 120 } });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(70% 45% at 80% 20%, rgba(255,217,31,.2), transparent 70%), linear-gradient(180deg,#0E2547,#060B16)` }}>
      <Bug />
      <div style={{ position: 'absolute', left: 70, top: 210, fontFamily: VN, color: '#fff' }}>
        <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 6, color: SUN }}>AI DẠY?</div>
        <div style={{ fontFamily: PFN, fontWeight: 800, fontSize: 92, lineHeight: 1.02, marginTop: 6 }}>Bảo · <span style={{ fontFamily: ZH, color: SUN }}>阿宝</span></div>
        <div style={{ fontWeight: 700, fontSize: 34, marginTop: 6, opacity: 0.85 }}>Ā Bǎo · người Hạ Long</div>
      </div>
      {/* ảnh sân khấu Bằng Tường */}
      <div style={{ position: 'absolute', left: 500, top: 420, width: 500, padding: 16, background: '#fff', borderRadius: 14, boxShadow: '0 40px 80px -30px rgba(0,0,0,.85)', rotate: `${interpolate(a, [0, 1], [10, 4])}deg`, translate: `${interpolate(a, [0, 1], [600, 0])}px 0px`, opacity: interpolate(b, [0, 1], [1, 0.0]) }}>
        <Img src={staticFile('stage.jpg')} style={{ width: '100%', height: 640, objectFit: 'cover', objectPosition: '50% 18%', borderRadius: 6, scale: interpolate(f, [0, 60], [1, 1.06]) }} />
      </div>
      <div style={{ position: 'absolute', left: 70, right: 610, top: 520, fontFamily: VN, color: '#fff', opacity: life(f, 8, 62, 6) }}>
        <div style={{ display: 'inline-block', padding: '8px 18px', borderRadius: 999, background: SUN, color: INK, fontWeight: 800, fontSize: 32 }}><span style={{ fontFamily: ZH }}>亚军</span> yàjūn</div>
        <div style={{ fontWeight: 800, fontSize: 44, lineHeight: 1.18, marginTop: 16 }}>Á quân 2025</div>
        <div style={{ fontWeight: 500, fontSize: 31, lineHeight: 1.3, marginTop: 8, opacity: 0.88 }}>Đại sứ Hình ảnh Du lịch Biên giới Trung – Việt</div>
      </div>
      {/* đoạn phim thật (video "Chuyện thật V2" đã duyệt): Bảo ở công trường bên Trung Quốc */}
      <div style={{ position: 'absolute', left: 545, top: 380, width: 450, height: 800, borderRadius: 36, overflow: 'hidden', border: '6px solid #fff', boxShadow: '0 40px 80px -30px rgba(0,0,0,.85)', rotate: `${interpolate(b, [0, 1], [-10, -3])}deg`, translate: `${interpolate(b, [0, 1], [700, 0])}px 0px`, opacity: f < 58 ? 0 : 1 }}>
        <Sequence from={60} layout="none"><Video src={staticFile('v2-helmet.mp4')} muted playbackRate={0.72} style={cover} /></Sequence>
      </div>
      <div style={{ position: 'absolute', left: 70, right: 575, top: 540, display: 'grid', gap: 16, fontFamily: VN }}>
        {CHIPS.map((c, n) => (
          <div key={c} style={{ padding: '16px 20px', borderRadius: 20, background: 'rgba(255,255,255,.08)', border: '2px solid rgba(255,217,31,.4)', color: '#fff', fontWeight: 700, fontSize: 30, lineHeight: 1.25, opacity: k(f, 64 + n * 8, 72 + n * 8), translate: `${k(f, 64 + n * 8, 76 + n * 8, -50, 0)}px 0px` }}>{c}</div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 1300, fontFamily: PF, fontWeight: 800, fontSize: 60, lineHeight: 1.15, color: SUN, opacity: k(f, 96, 108) }}>Dạy thứ tiếng Trung<br />mình đã dùng để đi làm.</div>
    </AbsoluteFill>
  );
};


/* ---------- 7b · HÀNH TRÌNH THẬT: bơi qua vịnh (780–900) ---------- */
const Journey: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg,rgba(5,10,20,.55) 0%,rgba(5,10,20,0) 26%,rgba(5,10,20,0) 52%,rgba(5,10,20,.82) 100%)' }} />
      <Bug />
      <div style={{ position: 'absolute', left: 70, right: 70, top: 1040, fontFamily: VN, color: '#fff', textShadow: shadow }}>
        <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 14, padding: '10px 22px', borderRadius: 999, background: 'rgba(8,16,30,.6)', border: '2px solid rgba(255,217,31,.5)', opacity: k(f, 4, 14), textShadow: 'none' }}>
          <span style={{ fontWeight: 800, fontSize: 26, letterSpacing: 4, color: SUN }}>HÀNH TRÌNH THẬT</span>
          <span style={{ fontFamily: ZH, fontWeight: 900, fontSize: 40, color: '#fff' }}>游泳</span>
          <span style={{ fontWeight: 700, fontSize: 28 }}>yóuyǒng · bơi</span>
        </div>
        <div style={{ fontWeight: 800, fontSize: 92, lineHeight: 1.06, marginTop: 22 }}><Pop at={8}>Bơi qua</Pop> <Pop at={18}>vịnh Hạ Long.</Pop></div>
        <div style={{ fontFamily: PF, fontWeight: 800, fontSize: 64, lineHeight: 1.15, color: SUN, marginTop: 14, opacity: k(f, 62, 74), translate: `0px ${k(f, 62, 80, 30, 0)}px` }}>Mình dạy tiếng Trung<br />từ chính nơi này.</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 7 · LỘ TRÌNH HSK0 → HSK4 (900–960) ---------- */
const Path: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const Wd = 168, D = 60;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(80% 50% at 50% 30%, #FFE97A, ${SUN} 70%)` }}>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 220, fontFamily: VN, color: INK }}>
        <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 6, color: '#1E5AA8' }}>LỘ TRÌNH GỢI Ý</div>
        <div style={{ fontFamily: PFN, fontWeight: 800, fontSize: 110, lineHeight: 1.02, marginTop: 8 }}>HSK0 → HSK4</div>
        <div style={{ fontWeight: 700, fontSize: 40, lineHeight: 1.25, marginTop: 14 }}>Từ <span style={{ fontFamily: ZH, fontWeight: 900 }}>你好</span> nǐ hǎo (xin chào)<br />tới họp, đàm phán, phỏng vấn.</div>
      </div>
      <svg width={1080} height={760} style={{ position: 'absolute', left: 0, top: 640 }}>
        {[0, 1, 2, 3, 4].map(i => {
          const st = spring({ frame: f - i * 6, fps, config: { damping: 14, stiffness: 150 } });
          const h = 110 + i * 92, x = 80 + i * Wd, base = 700, y = base - h + interpolate(st, [0, 1], [h + 40, 0]);
          const dark = i === 4;
          return (
            <g key={i} opacity={st}>
              <polygon points={`${x},${y} ${x + Wd},${y} ${x + Wd + D},${y - D * 0.55} ${x + D},${y - D * 0.55}`} fill={dark ? '#16171B' : '#fff'} stroke="#16171B" strokeWidth={3} />
              <polygon points={`${x},${y} ${x + Wd},${y} ${x + Wd},${base} ${x},${base}`} fill={dark ? '#23252C' : '#F2B200'} stroke="#16171B" strokeWidth={3} />
              <polygon points={`${x + Wd},${y} ${x + Wd + D},${y - D * 0.55} ${x + Wd + D},${base - D * 0.55} ${x + Wd},${base}`} fill={dark ? '#0B0C10' : '#C99200'} stroke="#16171B" strokeWidth={3} />
              <text x={x + Wd / 2} y={y + 58} textAnchor="middle" fontFamily={VN} fontWeight={800} fontSize={36} fill={dark ? SUN : '#16171B'}>HSK{i}</text>
            </g>
          );
        })}
      </svg>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 1440, fontFamily: VN, fontWeight: 500, fontSize: 26, color: '#4d4514' }}>Luyện tập theo khung HSK · mốc thời gian là lộ trình gợi ý</div>
    </AbsoluteFill>
  );
};

/* ---------- 8 · LỜI MỜI: chỉ dẫn về baokhua.com (960–1140) ---------- */
const Cta: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 12, stiffness: 110 } });
  const beat = Math.max(0, 1 - ((f % BEAT) / BEAT) * 3);
  const end = k(f, 150, 178, 1, 0, IO);    // chữ tắt dần → video lặp về cảnh đầu
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg,rgba(5,12,24,.72) 0%,rgba(5,12,24,.35) 45%,rgba(5,12,24,.78) 100%)', opacity: end }} />
      <div style={{ opacity: end }}>
        <div style={{ position: 'absolute', left: 540 - 130, top: 300, width: 260, height: 260, perspective: 900 }}>
          <div style={{ width: '100%', height: '100%', borderRadius: 60, background: 'linear-gradient(145deg,#FFE97A,#F2B200)', display: 'grid', placeItems: 'center', fontFamily: ZH, fontWeight: 900, fontSize: 176, color: INK, boxShadow: '0 30px 90px -20px rgba(255,217,31,.75)', rotate: `y ${interpolate(s, [0, 1], [180, -8])}deg`, scale: interpolate(s, [0, 1], [0.4, 1]) }}>宝</div>
        </div>
        <div style={{ position: 'absolute', left: 70, right: 70, top: 620, textAlign: 'center', fontFamily: VN, color: '#fff', textShadow: shadow }}>
          <div style={{ fontFamily: PFN, fontWeight: 800, fontSize: 96, lineHeight: 1.04, opacity: k(f, 10, 24), translate: `0px ${k(f, 10, 30, 40, 0)}px` }}>Tiếng Trung<br />để đi làm.</div>
          <div style={{ fontWeight: 700, fontSize: 42, marginTop: 18, opacity: k(f, 22, 34) }}>Học cùng Bảo · <span style={{ fontFamily: ZH, fontWeight: 900, color: SUN }}>阿宝</span> Ā Bǎo · từ Hạ Long</div>
        </div>
        <div style={{ position: 'absolute', left: 120, right: 120, top: 1000, padding: '30px 20px', borderRadius: 999, background: SUN, color: INK, fontFamily: VN, fontWeight: 800, fontSize: 92, textAlign: 'center', letterSpacing: 1, opacity: k(f, 32, 44), scale: interpolate(spring({ frame: f - 32, fps, config: { damping: 10, stiffness: 160 } }), [0, 1], [0.6, 1]) * (1 + beat * 0.025), boxShadow: '0 30px 70px -20px rgba(255,217,31,.6)' }}>baokhua.com</div>
        <div style={{ position: 'absolute', left: 70, right: 70, top: 1200, textAlign: 'center', fontFamily: VN, fontWeight: 700, fontSize: 38, color: '#fff', textShadow: shadow, opacity: k(f, 48, 60) }}>Chơi game 3D, xem bài giảng, gặp Bảo</div>
      </div>
    </AbsoluteFill>
  );
};

export const Debut3: React.FC = () => (
  <AbsoluteFill style={{ background: '#000' }}>
    {/* nền chuyển cảnh (noicanh.py): A, J, C = phim 2K thật; B = chuỗi 3D nối liền */}
    <Sequence durationInFrames={120}><Video src={staticFile('debut3/secA.mp4')} style={cover} /></Sequence>
    <Sequence from={120} durationInFrames={300}><Video src={staticFile('debut3/secB.mp4')} style={cover} /></Sequence>
    <Sequence from={780} durationInFrames={120}><Video src={staticFile('debut3/secJ.mp4')} style={cover} /></Sequence>
    <Sequence from={960} durationInFrames={180}><Video src={staticFile('debut3/secC.mp4')} style={cover} /></Sequence>
    {/* chữ, đồ hoạ */}
    <Sequence durationInFrames={120}><Hook /></Sequence>
    <Sequence from={120} durationInFrames={300}><World3D /></Sequence>
    <Sequence from={420} durationInFrames={60}><GameQ /></Sequence>
    <Sequence from={480} durationInFrames={60}><Stars /></Sequence>
    <Sequence from={540} durationInFrames={120}><Lesson /></Sequence>
    <Sequence from={660} durationInFrames={120}><Who /></Sequence>
    <Sequence from={780} durationInFrames={120}><Journey /></Sequence>
    <Sequence from={900} durationInFrames={60}><Path /></Sequence>
    <Sequence from={960} durationInFrames={180}><Cta /></Sequence>
    <Flash at={120} a={0.6} /><Flash at={420} /><Flash at={540} a={0.35} /><Flash at={660} /><Flash at={780} a={0.45} /><Flash at={900} /><Flash at={960} a={0.6} />
    <Audio src={staticFile('debut3/music.wav')} />
  </AbsoluteFill>
);
