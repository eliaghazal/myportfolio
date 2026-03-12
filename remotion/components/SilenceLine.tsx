/**
 * SilenceLine — The "flatline" moment
 *
 * During the critical 3-second silence before the final line, a thin horizontal
 * white line draws itself across the centre of the frame, holds briefly, then
 * fades out just as "it's never done yet." arrives.
 *
 * Timing (all frame-accurate, derived from constants.ts):
 *
 *   SEQ_SILENCE_START ──────────────────────────────────────────────── SEQ_7_START
 *   |                                                                           |
 *   |◄── 25 f draw ──►|◄─────────── hold ~30 f ────────────►|◄── 35 f fade ──►|
 *
 * The line extends from the centre outward using CSS scaleX, so the growth
 * radiates from the middle of the screen rather than from one side.
 *
 * A faint white glow (box-shadow) makes it read on black without being harsh.
 */

import { interpolate, useCurrentFrame } from "remotion";
import { SEQ_SILENCE_START, SEQ_7_START } from "../constants";

const DRAW_DURATION  = 25; // frames: line extends from 0 → full width
const FADE_DURATION  = 35; // frames: line fades out at the end

const MAX_LINE_WIDTH_PCT = "28%"; // line is 28% of the container width

export function SilenceLine() {
  const frame = useCurrentFrame();

  const drawEnd  = SEQ_SILENCE_START + DRAW_DURATION;
  const holdEnd  = SEQ_7_START - FADE_DURATION; // hold until FADE_DURATION frames before final text
  const fadeEnd  = SEQ_7_START + 10;            // finishes just as final text begins

  // Only active in this window
  if (frame < SEQ_SILENCE_START || frame >= fadeEnd) return null;

  // ── scaleX: 0 → 1 during draw, 1 during hold, 1 → 0 during fade ──────────
  const scaleX = (() => {
    if (frame < drawEnd)
      return interpolate(frame, [SEQ_SILENCE_START, drawEnd], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
    if (frame < holdEnd) return 1;
    return interpolate(frame, [holdEnd, fadeEnd], [1, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
  })();

  // ── opacity: fades in with draw, holds, then fades out ───────────────────
  const opacity = (() => {
    const fadeInEnd = SEQ_SILENCE_START + 10;
    if (frame < fadeInEnd)
      return interpolate(frame, [SEQ_SILENCE_START, fadeInEnd], [0, 0.38], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
    if (frame < holdEnd) return 0.38;
    return interpolate(frame, [holdEnd, fadeEnd], [0.38, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
  })();

  if (opacity <= 0.001) return null;

  return (
    <div
      style={{
        position:      "absolute",
        inset:         0,
        display:       "flex",
        alignItems:    "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width:           MAX_LINE_WIDTH_PCT,
          height:          1,
          background:      "white",
          opacity,
          transform:       `scaleX(${scaleX})`,
          transformOrigin: "center",
          // Soft glow so the line reads on pure black without being harsh
          boxShadow: `
            0 0  6px rgba(255, 255, 255, ${(opacity * 0.65).toFixed(3)}),
            0 0 18px rgba(255, 255, 255, ${(opacity * 0.30).toFixed(3)})
          `,
        }}
      />
    </div>
  );
}
