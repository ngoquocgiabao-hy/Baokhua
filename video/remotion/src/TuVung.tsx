import React from "react";
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type Word = { hanzi: string; pinyin: string; nghia: string };
export type Data = { title: string; subtitle: string; words: Word[]; cta: string };
const INTRO = 2, PER = 3, OUTRO = 2;
export const durationOf = (d: Data) => INTRO + PER * d.words.length + OUTRO;

const C = { red: "#c8161d", gold: "#f5c542", cream: "#fff6e0", ink: "#2a0608" };
const FONT = '"WenQuanYi Zen Hei","Noto Sans CJK SC",sans-serif';
const center: React.CSSProperties = { alignItems: "center", justifyContent: "center", flexDirection: "column" };

const useIn = (delay: number, damping = 12) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: f - delay * fps, fps, config: { damping } });
};

const Intro: React.FC<{ d: Data }> = ({ d }) => {
  const a = useIn(0.1), b = useIn(0.6, 200);
  return (
    <AbsoluteFill style={center}>
      <div style={{ fontSize: 96, fontWeight: 700, textAlign: "center", padding: "0 80px", lineHeight: 1.2,
        opacity: a, transform: `translateY(${(1 - a) * 80}px)` }}>{d.title}</div>
      <div style={{ fontSize: 52, color: C.gold, marginTop: 40, opacity: b }}>{d.subtitle}</div>
    </AbsoluteFill>
  );
};

const WordCard: React.FC<{ w: Word; i: number; n: number }> = ({ w, i, n }) => {
  const num = useIn(0, 200), hz = useIn(0.05, 18), py = useIn(0.6, 200), vi = useIn(1.1, 9);
  return (
    <AbsoluteFill style={center}>
      <div style={{ fontSize: 60, color: C.gold, marginBottom: 30, opacity: num }}>{i + 1}/{n}</div>
      <div style={{ fontSize: 360, lineHeight: 1, fontWeight: 700, textShadow: `0 14px 0 ${C.ink}`,
        opacity: hz, transform: `scale(${interpolate(hz, [0, 1], [2.2, 1])})` }}>{w.hanzi}</div>
      <div style={{ fontSize: 110, color: C.gold, marginTop: 50, opacity: py, transform: `translateY(${(1 - py) * 40}px)` }}>{w.pinyin}</div>
      <div style={{ fontSize: 88, marginTop: 40, padding: "14px 50px", background: C.cream, color: C.red, borderRadius: 24,
        fontWeight: 700, transform: `scale(${vi})` }}>{w.nghia}</div>
    </AbsoluteFill>
  );
};

const Outro: React.FC<{ d: Data }> = ({ d }) => {
  const a = useIn(0.1), b = useIn(0.5, 9);
  return (
    <AbsoluteFill style={center}>
      <div style={{ fontSize: 72, fontWeight: 700, textAlign: "center", padding: "0 80px", opacity: a,
        transform: `translateY(${(1 - a) * 60}px)` }}>{d.cta}</div>
      <div style={{ marginTop: 60, fontSize: 56, padding: "26px 60px", background: C.gold, color: C.ink,
        borderRadius: 999, transform: `scale(${b})` }}>baokhua · link ở bio</div>
    </AbsoluteFill>
  );
};

export const TuVung: React.FC<{ data: Data }> = ({ data: d }) => {
  const f = useCurrentFrame(); const { fps, durationInFrames } = useVideoConfig();
  const t = f / fps;
  const local = (t - INTRO) % PER;
  const pulse = t >= INTRO && t < INTRO + PER * d.words.length ? interpolate(local, [0, 0.5], [1.12, 1], { extrapolateRight: "clamp" }) : 1;
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: C.cream,
      background: "radial-gradient(circle at 50% 35%,#b3141b 0%,#7a0d12 55%,#3d0508 100%)" }}>
      <div style={{ position: "absolute", left: 130, top: 1920 * 0.44 - 410, width: 820, height: 820, borderRadius: "50%",
        border: "6px dashed rgba(245,197,66,.35)", transform: `rotate(${(f / durationInFrames) * 90}deg) scale(${pulse})` }} />
      <div style={{ position: "absolute", top: 110, width: "100%", textAlign: "center", fontSize: 44, letterSpacing: ".08em", color: C.gold }}>BẢO KHỰA 阿宝</div>
      <Sequence durationInFrames={INTRO * fps}><Intro d={d} /></Sequence>
      {d.words.map((w, i) => (
        <Sequence key={i} from={(INTRO + i * PER) * fps} durationInFrames={PER * fps}><WordCard w={w} i={i} n={d.words.length} /></Sequence>
      ))}
      <Sequence from={(durationOf(d) - OUTRO) * fps}><Outro d={d} /></Sequence>
      <div style={{ position: "absolute", bottom: 0, left: 0, height: 18, width: 1080 * (f / durationInFrames), background: C.gold }} />
    </AbsoluteFill>
  );
};
