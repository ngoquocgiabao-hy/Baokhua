import { Composition } from 'remotion';
import { Trailer } from './Trailer';
import { Debut } from './Debut';
import { Debut3 } from './Debut3';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Trailer" component={Trailer} durationInFrames={1440} fps={30} width={1080} height={1920} />
    <Composition id="Debut" component={Debut} durationInFrames={1020} fps={30} width={1080} height={1920} />
    <Composition id="Debut3" component={Debut3} durationInFrames={1140} fps={30} width={1080} height={1920} />
  </>
);
