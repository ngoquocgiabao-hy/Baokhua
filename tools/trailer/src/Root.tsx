import { Composition } from 'remotion';
import { Trailer } from './Trailer';

export const RemotionRoot: React.FC = () => (
  <Composition id="Trailer" component={Trailer} durationInFrames={1440} fps={30} width={1080} height={1920} />
);
