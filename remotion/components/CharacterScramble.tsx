/**
 * CharacterScramble.tsx
 * The hero component of "Terminal to Paper".
 * Handles the character-by-character morph from code text to poetry text.
 *
 * How the effect works:
 * 1. When morphing starts for a line, each character begins cycling through
 *    random characters from SCRAMBLE_CHARS.
 * 2. Characters resolve left-to-right with a slight wave delay so the
 *    effect ripples across the line.
 * 3. As a character resolves, it locks onto the target poetry character.
 * 4. Font and color crossfade from mono/green → handwriting/warm over
 *    FONT_CROSSFADE_DURATION frames.
 */

import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import {
  SCRAMBLE_CHARS,
  SCRAMBLE_CYCLE_FRAMES,
  MORPH_DURATION_FRAMES,
  FONT_CROSSFADE_DURATION,
  TERMINAL_FONT_SIZE,
  POETRY_FONT_SIZE,
  FONT_MONO,
  FONT_HANDWRITING,
  COLOR_TERMINAL_GREEN,
  COLOR_TERMINAL_GREEN_OPACITY,
  COLOR_POETRY_WARM,
} from "../constants";

interface CharacterScrambleProps {
  /** The original code text (source) */
  sourceText: string;
  /** The target poetry text */
  targetText: string;
  /** Absolute frame when this line's morph begins */
  morphStart: number;
  /** Opacity of the entire line (used for Scene 3 fade-out) */
  opacity?: number;
}

/**
 * A seeded pseudo-random function so scramble characters are deterministic
 * per frame (avoids flickering from React re-renders with Math.random).
 */
function seededChar(seed: number): string {
  // Simple hash: combine seed with a prime to get consistent variation
  const idx = ((seed * 1103515245 + 12345) & 0x7fffffff) % SCRAMBLE_CHARS.length;
  return SCRAMBLE_CHARS[idx];
}

export const CharacterScramble: React.FC<CharacterScrambleProps> = ({
  sourceText,
  targetText,
  morphStart,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();

  // All values computed unconditionally (hooks must not be called conditionally)
  const elapsed = Math.max(0, frame - morphStart);
  const isMorphing = frame >= morphStart;

  // How far through the full morph are we? 0→1
  const morphProgress = Math.min(1, elapsed / MORPH_DURATION_FRAMES);

  // Font crossfade progress (may extend beyond MORPH_DURATION_FRAMES)
  const crossfadeProgress = Math.min(1, elapsed / FONT_CROSSFADE_DURATION);

  // The longest of the two strings determines how many character slots to render
  const maxLen = Math.max(sourceText.length, targetText.length);

  // Build per-character output (unconditional useMemo — no early return before this)
  const characters = useMemo(() => {
    if (!isMorphing) {
      // Return source characters unchanged before morph starts
      return Array.from({ length: sourceText.length }, (_, i) => ({
        char: sourceText[i] ?? " ",
        resolved: false,
      }));
    }
    return Array.from({ length: maxLen }, (_, i) => {
      const src = sourceText[i] ?? " ";
      const tgt = targetText[i] ?? " ";

      // Wave delay: characters resolve left-to-right
      // character i resolves at morphProgress = i / maxLen
      const resolveThreshold = i / maxLen;
      const isResolved = morphProgress >= resolveThreshold;

      if (isResolved) {
        return { char: tgt, resolved: true };
      }

      // Still scrambling: cycle through random characters
      // Use frame + i as seed for deterministic randomness
      const cycleIndex = Math.floor(elapsed / SCRAMBLE_CYCLE_FRAMES);
      const scrambledChar = src === " " ? " " : seededChar(cycleIndex * maxLen + i);
      return { char: scrambledChar, resolved: false };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame, sourceText, targetText, morphStart]);

  // Before morph starts, render source text in terminal style (no crossfade needed)
  if (!isMorphing) {
    return (
      <span
        style={{
          fontFamily: FONT_MONO,
          fontSize: `${TERMINAL_FONT_SIZE}px`,
          color: COLOR_TERMINAL_GREEN,
          opacity: COLOR_TERMINAL_GREEN_OPACITY * opacity,
          whiteSpace: "pre",
          letterSpacing: "0.04em",
        }}
      >
        {sourceText}
      </span>
    );
  }

  // Interpolate font size
  const fontSize = TERMINAL_FONT_SIZE + (POETRY_FONT_SIZE - TERMINAL_FONT_SIZE) * crossfadeProgress;

  // Interpolate color from terminal green → warm white
  // We parse hex to RGB for interpolation
  const greenR = 0x39, greenG = 0xff, greenB = 0x14; // #39ff14
  const warmR = 0xf5, warmG = 0xe0, warmB = 0xb8; // #f5e0b8
  const r = Math.round(greenR + (warmR - greenR) * crossfadeProgress);
  const g = Math.round(greenG + (warmG - greenG) * crossfadeProgress);
  const b = Math.round(greenB + (warmB - greenB) * crossfadeProgress);
  const colorOpacity = COLOR_TERMINAL_GREEN_OPACITY + (1 - COLOR_TERMINAL_GREEN_OPACITY) * crossfadeProgress;

  // Font family crossfade: we render two overlapping spans and fade between them
  const monoOpacity = (1 - crossfadeProgress) * colorOpacity;
  const handwritingOpacity = crossfadeProgress * colorOpacity;

  // Current character state: scrambled chars during morph, target chars when resolved
  const displayText = characters.map((c) => c.char).join("");

  return (
    <span style={{ position: "relative", display: "inline-block", whiteSpace: "pre" }}>
      {/* Mono layer: fades out */}
      <span
        style={{
          fontFamily: FONT_MONO,
          fontSize: `${TERMINAL_FONT_SIZE + (fontSize - TERMINAL_FONT_SIZE) * 0.5}px`,
          color: `rgb(${r},${g},${b})`,
          opacity: monoOpacity * opacity,
          position: "absolute",
          left: 0,
          top: 0,
          letterSpacing: "0.04em",
          whiteSpace: "pre",
        }}
      >
        {displayText}
      </span>
      {/* Handwriting layer: fades in */}
      <span
        style={{
          fontFamily: FONT_HANDWRITING,
          fontSize: `${fontSize}px`,
          color: crossfadeProgress > 0.5 ? COLOR_POETRY_WARM : `rgb(${r},${g},${b})`,
          opacity: handwritingOpacity * opacity,
          letterSpacing: "0.01em",
          whiteSpace: "pre",
        }}
      >
        {displayText}
      </span>
      {/* Invisible spacer to hold layout width (uses handwriting font) */}
      <span
        style={{
          fontFamily: FONT_HANDWRITING,
          fontSize: `${POETRY_FONT_SIZE}px`,
          opacity: 0,
          whiteSpace: "pre",
          pointerEvents: "none",
        }}
      >
        {targetText}
      </span>
    </span>
  );
};

export default CharacterScramble;
