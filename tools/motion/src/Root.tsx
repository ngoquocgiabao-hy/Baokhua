import { Composition } from "remotion";
import { ArenaBg, Look } from "./ArenaBg";

const LOOKS: Look[] = ["trainee", "hotel", "factory", "night", "shadow"];

// 5 nền sân đấu: vuông 720×720 (game cắt vừa khung sân), 24 hình/giây, vòng lặp 6 giây
export const RemotionRoot: React.FC = () => (
  <>
    {LOOKS.map((look) => (
      <Composition key={look} id={`bg-${look}`} component={ArenaBg} durationInFrames={144} fps={24} width={720} height={720} defaultProps={{ look }} />
    ))}
  </>
);
