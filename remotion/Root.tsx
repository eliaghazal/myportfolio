/**
 * Root.tsx
 * Remotion root — registers all compositions.
 * Add more compositions here if you create additional video variants.
 */

import React from "react";
import { Composition } from "remotion";
import { TerminalToPaper } from "./TerminalToPaper";
import {
  COMPOSITION_WIDTH,
  COMPOSITION_HEIGHT,
  FPS,
  TOTAL_FRAMES,
} from "./constants";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/*
        TerminalToPaper: The main "Terminal to Paper" intro composition.
        - 1920×1080, 30fps, 33 seconds
        - Render with: npm run render-video-v2
      */}
      <Composition
        id="TerminalToPaper"
        component={TerminalToPaper}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={COMPOSITION_WIDTH}
        height={COMPOSITION_HEIGHT}
      />
    </>
  );
};
