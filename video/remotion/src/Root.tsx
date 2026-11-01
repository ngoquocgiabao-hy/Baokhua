import React from "react";
import { Composition } from "remotion";
import { TuVung, durationOf } from "./TuVung";
import data from "../../data.json";

export const Root: React.FC = () => (
  <Composition id="TuVung" component={TuVung} fps={30} width={1080} height={1920}
    durationInFrames={durationOf(data) * 30} defaultProps={{ data }} />
);
