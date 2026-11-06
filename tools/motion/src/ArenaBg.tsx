import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

/* Nền sân đấu chuyển động, lặp liền mạch: mọi chuyển động là hàm tuần hoàn theo vòng lặp (frame / durationInFrames). */
export type Look = "trainee" | "hotel" | "factory" | "night" | "shadow";
export type ArenaBgProps = { look: Look };

const TAU = Math.PI * 2;
// số giả ngẫu nhiên cố định (cùng kết quả mỗi lần render)
const rand = (i: number, s: number) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

const THEME: Record<Look, { grade: string; rays: string; dust: string; dustN: number; up: number; vign: number }> = {
  trainee: { grade: "linear-gradient(180deg, rgba(255,214,150,.18), rgba(40,20,0,.05) 60%, rgba(10,6,0,.35))", rays: "rgba(255,236,190,.38)", dust: "255,240,210", dustN: 34, up: 1, vign: .45 },
  hotel: { grade: "linear-gradient(180deg, rgba(255,190,110,.2), rgba(60,20,0,.06) 60%, rgba(12,4,0,.4))", rays: "rgba(255,220,150,.34)", dust: "255,228,170", dustN: 30, up: 1, vign: .5 },
  factory: { grade: "linear-gradient(180deg, rgba(40,60,90,.25), rgba(80,40,10,.12) 55%, rgba(30,10,0,.45))", rays: "rgba(255,190,120,.16)", dust: "255,170,80", dustN: 26, up: 2, vign: .55 },
  night: { grade: "linear-gradient(180deg, rgba(20,40,120,.35), rgba(10,20,60,.2) 60%, rgba(0,0,20,.55))", rays: "rgba(150,210,255,.16)", dust: "190,255,160", dustN: 22, up: 1, vign: .62 },
  shadow: { grade: "linear-gradient(180deg, rgba(70,20,120,.35), rgba(40,10,70,.25) 60%, rgba(10,0,25,.6))", rays: "rgba(200,150,255,.14)", dust: "200,140,255", dustN: 36, up: 2, vign: .66 },
};

export const ArenaBg: React.FC<ArenaBgProps> = ({ look }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D, width: W, height: H } = useVideoConfig();
  const p = (frame / D) * TAU;               // pha vòng lặp 0..2π
  const T = THEME[look];

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0d14", overflow: "hidden" }}>
      {/* ảnh nền: máy quay trôi chậm (thở), quay về đúng vị trí đầu khi hết vòng */}
      <AbsoluteFill style={{ scale: String(1.12 + 0.035 * Math.sin(p)), translate: `${14 * Math.cos(p)}px ${9 * Math.sin(p)}px` }}>
        <Img src={staticFile(`bg/${look}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: T.grade, mixBlendMode: "soft-light" }} />

      {/* tia sáng chéo (cửa sổ / đèn trần) */}
      {[0, 1, 2, 3].map((i) => (
        <div key={"r" + i} style={{
          position: "absolute", left: `${-20 + i * 18}%`, top: "-40%", width: `${7 + i * 3}%`, height: "160%",
          background: `linear-gradient(180deg, ${T.rays}, rgba(255,255,255,0) 85%)`,
          rotate: `${24 + 3.5 * Math.sin(p + i * 1.3)}deg`, transformOrigin: "50% 0%",
          opacity: 0.55 + 0.4 * Math.sin(p * 2 + i * 2.1), filter: "blur(10px)", mixBlendMode: "screen",
        }} />
      ))}

      {look === "factory" && <Factory p={p} W={W} H={H} />}
      {look === "night" && <Night p={p} W={W} H={H} />}
      {look === "shadow" && <Shadow p={p} W={W} H={H} frame={frame} D={D} />}
      {(look === "hotel" || look === "trainee") && <Sparkle p={p} W={W} H={H} warm={look === "hotel"} />}

      {/* bụi / đom đóm / tàn lửa bay lên: vị trí lặp đúng số vòng nguyên trong một vòng video */}
      {Array.from({ length: T.dustN }).map((_, i) => {
        const x0 = rand(i, 1) * W, y0 = rand(i, 2) * H, r = 1.5 + rand(i, 3) * 4.5, cyc = T.up * (1 + Math.floor(rand(i, 4) * 2));
        const y = ((y0 - (frame / D) * cyc * H * 0.6) % H + H) % H;
        const x = x0 + Math.sin(p * (1 + (i % 3)) + i) * 18;
        const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(p * 3 + i * 1.7));
        return <div key={"d" + i} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: `radial-gradient(circle, rgba(${T.dust},${a}) 0%, rgba(${T.dust},0) 70%)`, boxShadow: `0 0 ${r * 3}px rgba(${T.dust},${a * 0.6})` }} />;
      })}

      {/* viền tối + chừa sàn đấu sạch cho nhân vật */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,${T.vign}) 100%)` }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 72%, rgba(0,0,0,.28) 100%)" }} />
    </AbsoluteFill>
  );
};

/* Nhà máy: hơi nước trôi ngang, lò hắt sáng đỏ cam nhịp thở */
const Factory: React.FC<{ p: number; W: number; H: number }> = ({ p, W, H }) => (
  <>
    {[0, 1, 2, 3, 4].map((i) => {
      const x = ((rand(i, 7) * W * 1.4 + (p / TAU) * W * 1.4 * (i % 2 ? 1 : 2)) % (W * 1.4)) - W * 0.2;  // đi đúng số vòng nguyên → lặp liền
      return <div key={"s" + i} style={{ position: "absolute", left: x - 120, top: H * (0.12 + rand(i, 8) * 0.4), width: 260, height: 120, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(235,235,240,.22), rgba(235,235,240,0) 70%)", filter: "blur(14px)" }} />;
    })}
    <div style={{ position: "absolute", left: "-10%", right: "-10%", bottom: "-20%", height: "55%", background: "radial-gradient(ellipse at 70% 100%, rgba(255,120,30,.38), rgba(255,120,30,0) 65%)", opacity: 0.6 + 0.4 * Math.sin(p * 3), mixBlendMode: "screen" }} />
  </>
);

/* KCN đêm: 2 lớp sương xanh trôi, đèn pha quét, neon chớp */
const Night: React.FC<{ p: number; W: number; H: number }> = ({ p, W, H }) => (
  <>
    <div style={{ position: "absolute", left: "55%", top: "-10%", width: 40, height: "120%", transformOrigin: "50% 0%", rotate: `${-35 + 30 * Math.sin(p)}deg`, background: "linear-gradient(180deg, rgba(220,240,255,.35), rgba(220,240,255,0) 80%)", filter: "blur(8px)", mixBlendMode: "screen" }} />
    {[0, 1].map((i) => (
      <div key={"f" + i} style={{ position: "absolute", left: `${-50 + ((p / TAU) * 100 * (i ? -1 : 1) + 300) % 100}%`, bottom: `${8 + i * 10}%`, width: "200%", height: "28%", background: "linear-gradient(180deg, rgba(120,150,255,0), rgba(120,150,255,.18), rgba(120,150,255,0))", filter: "blur(12px)" }} />
    ))}
    {[[0.12, 0.2, "255,60,150"], [0.82, 0.16, "80,220,255"]].map(([x, y, c], i) => (
      <div key={"n" + i} style={{ position: "absolute", left: (x as number) * W - 60, top: (y as number) * H - 30, width: 120, height: 60, borderRadius: 20, background: `radial-gradient(ellipse, rgba(${c},.45), rgba(${c},0) 70%)`, opacity: Math.sin(p * 12 + i * 3) > -0.7 ? 1 : 0.25, mixBlendMode: "screen" }} />
    ))}
  </>
);

/* Đỉnh Hắc Ninja: sương tím xoáy, vệt chớp xa (2 lần mỗi vòng) */
const Shadow: React.FC<{ p: number; W: number; H: number; frame: number; D: number }> = ({ p, W, H, frame, D }) => {
  const f = frame % (D / 2), flash = f < 3 ? 0.35 * (1 - f / 3) : 0;
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div key={"m" + i} style={{ position: "absolute", left: W * 0.5 - 300 + 120 * Math.cos(p + i * 2.1), top: H * (0.55 + 0.08 * i) - 120 + 30 * Math.sin(p * 2 + i), width: 600, height: 240, borderRadius: "50%", rotate: `${(p / TAU) * 360 * (i % 2 ? -1 : 1)}deg`, background: "radial-gradient(ellipse, rgba(150,70,220,.25), rgba(150,70,220,0) 70%)", filter: "blur(16px)", mixBlendMode: "screen" }} />
      ))}
      <AbsoluteFill style={{ background: "rgba(220,200,255,1)", opacity: flash, mixBlendMode: "screen" }} />
    </>
  );
};

/* Sảnh khách sạn: đèn chùm lấp lánh */
const Sparkle: React.FC<{ p: number; W: number; H: number; warm: boolean }> = ({ p, W, H, warm }) => (
  <>
    {Array.from({ length: 14 }).map((_, i) => {
      const x = rand(i, 11) * W, y = rand(i, 12) * H * 0.45, s = 4 + rand(i, 13) * 8, a = Math.max(0, Math.sin(p * (2 + (i % 3)) + i * 1.9));
      return <div key={"k" + i} style={{ position: "absolute", left: x - s, top: y - s, width: s * 2, height: s * 2, background: `radial-gradient(circle, rgba(255,${warm ? 230 : 245},${warm ? 170 : 220},${a}) 0%, rgba(255,240,200,0) 65%)`, rotate: "45deg" }} />;
    })}
  </>
);
