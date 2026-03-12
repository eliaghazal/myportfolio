/**
 * TextReveal — Reusable fade-in / fade-out text component
 *
 * Props:
 *  - text: string | string[]   — single line or array of lines (for multiline)
 *  - startFrame: number        — frame when fade-in begins
 *  - fadeInDuration: number    — frames for the fade-in
 *  - holdDuration: number      — frames the text stays fully visible
 *  - fadeOutDuration: number   — frames for the fade-out
 *  - breathe?: boolean         — subtle opacity pulse for the final line
 *  - style?: React.CSSProperties — optional overrides
 */

import { interpolate, useCurrentFrame } from "remotion";
import {
  FONT_FAMILY,
  FONT_WEIGHT,
  FONT_SIZE,
  LETTER_SPACING,
  TEXT_COLOR,
  VIDEO_HEIGHT,
} from "../constants";

interface TextRevealProps {
  text: string | string[];
  startFrame: number;
  fadeInDuration: number;
  holdDuration: number;
  fadeOutDuration: number;
  breathe?: boolean;
  style?: React.CSSProperties;
}

export function TextReveal({
  text,
  startFrame,
  fadeInDuration,
  holdDuration,
  fadeOutDuration,
  breathe = false,
  style,
}: TextRevealProps) {
  const frame = useCurrentFrame();

  // ── Opacity: fade in → hold → fade out ────────────────────────────────────
  const fadeInEnd = startFrame + fadeInDuration;
  const fadeOutStart = fadeInEnd + holdDuration;
  const fadeOutEnd = fadeOutStart + fadeOutDuration;

  let opacity = 0;

  if (frame >= startFrame && frame < fadeInEnd) {
    // Fading in
    opacity = interpolate(frame, [startFrame, fadeInEnd], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (frame >= fadeInEnd && frame < fadeOutStart) {
    // Fully visible (hold)
    opacity = 1;
  } else if (frame >= fadeOutStart && frame < fadeOutEnd) {
    // Fading out
    opacity = interpolate(frame, [fadeOutStart, fadeOutEnd], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  // ── Breathing effect for the final line ──────────────────────────────────
  // Very subtle opacity oscillation — barely perceptible, like the text is alive.
  // Oscillates between 0.88 and 1.0 opacity over ~2s cycle.
  if (breathe && frame >= fadeInEnd && frame < fadeOutStart) {
    const breathePhase = ((frame - fadeInEnd) / 60) * Math.PI * 2; // full cycle every 2s
    const breatheAmt = Math.sin(breathePhase) * 0.08; // ±8% opacity
    opacity = Math.max(0, Math.min(1, opacity + breatheAmt));
  }

  // Don't render if fully invisible
  if (opacity <= 0) return null;

  const lines = Array.isArray(text) ? text : [text];

  // Scale font size relative to video height (baseline: 1080p)
  const scaledFontSize = (FONT_SIZE / 1080) * VIDEO_HEIGHT;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        pointerEvents: "none",
        ...style,
      }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: FONT_WEIGHT,
            fontSize: scaledFontSize,
            color: TEXT_COLOR,
            letterSpacing: LETTER_SPACING,
            lineHeight: 1.6,
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
}
