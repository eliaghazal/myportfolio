/**
 * TextReveal.tsx
 * Clean Apple-style fade-in / hold / fade-out for Scene 4 ending text.
 * Features a gentle "breathing" opacity oscillation on the second line.
 */

import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import {
  FONT_ENDING,
  ENDING_FONT_SIZE,
  COLOR_ENDING_TEXT,
  BREATHING_AMPLITUDE,
  BREATHING_PERIOD_FRAMES,
} from "../constants";

interface TextRevealProps {
  /** The text to display */
  text: string;
  /** Frame when fade-in begins */
  fadeInStart: number;
  /** Duration of fade-in (frames) */
  fadeInDuration: number;
  /** Frame when fade-out begins */
  fadeOutStart: number;
  /** Duration of fade-out (frames) */
  fadeOutDuration: number;
  /** Whether to apply the breathing (pulsing opacity) effect */
  breathing?: boolean;
}

export const TextReveal: React.FC<TextRevealProps> = ({
  text,
  fadeInStart,
  fadeInDuration,
  fadeOutStart,
  fadeOutDuration,
  breathing = false,
}) => {
  const frame = useCurrentFrame();

  // Before the text should appear
  if (frame < fadeInStart) return null;

  // Fade in: 0 → 1
  const fadeIn = interpolate(frame, [fadeInStart, fadeInStart + fadeInDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out: 1 → 0
  const fadeOut = interpolate(
    frame,
    [fadeOutStart, fadeOutStart + fadeOutDuration],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Combined opacity (fade in wins until fadeOutStart)
  let opacity = frame < fadeOutStart ? fadeIn : fadeOut;

  // Breathing effect: gentle sinusoidal pulsing once fully faded in
  if (breathing && frame >= fadeInStart + fadeInDuration && frame < fadeOutStart) {
    const breathPhase = ((frame - fadeInStart - fadeInDuration) / BREATHING_PERIOD_FRAMES) * 2 * Math.PI;
    const breathOffset = Math.sin(breathPhase) * BREATHING_AMPLITUDE;
    opacity = Math.min(1, Math.max(0, opacity + breathOffset));
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p
        style={{
          fontFamily: FONT_ENDING,
          fontSize: `${ENDING_FONT_SIZE}px`,
          fontWeight: 300,
          color: COLOR_ENDING_TEXT,
          opacity,
          letterSpacing: "0.02em",
          textAlign: "center",
          margin: 0,
          padding: 0,
          textTransform: "lowercase",
        }}
      >
        {text}
      </p>
    </div>
  );
};

export default TextReveal;
