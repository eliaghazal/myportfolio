/**
 * Remotion Root — registers all compositions for the Remotion CLI.
 *
 * Used when rendering to .mp4 via:
 *   npx remotion render IntroVideo out/intro.mp4
 *
 * Or previewed via:
 *   npx remotion studio
 */

import { Composition } from "remotion";
import { IntroVideo } from "./IntroVideo";
import {
  FPS,
  VIDEO_WIDTH,
  VIDEO_HEIGHT,
  TOTAL_DURATION_FRAMES,
} from "./constants";

export function RemotionRoot() {
  return (
    <>
      {/*
       * IntroVideo composition
       *
       * id:           used with `npx remotion render IntroVideo out/intro.mp4`
       * durationInFrames: total length of the video (see constants.ts to adjust)
       * fps:          30 — smooth and standard
       * width/height: 1920×1080 for full-HD export and homepage use
       */}
      <Composition
        id="IntroVideo"
        component={IntroVideo}
        durationInFrames={TOTAL_DURATION_FRAMES}
        fps={FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />
    </>
  );
}
