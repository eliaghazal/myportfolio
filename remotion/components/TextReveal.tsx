/**
 * TextReveal — Cinematic text entrance / hold / exit component
 *
 * Visual effects applied per render:
 *  • Word-by-word stagger        — each word fades in 2.5 frames after the previous,
 *                                   creating a flowing left-to-right reveal
 *  • Slide-up entrance           — the whole block translates Y: 14px → 0 while opening
 *  • Blur-to-sharp entrance      — filter: blur(4px) → 0 as the block enters
 *  • Text-shadow glow            — faint white halo when fully visible
 *  • Fade-out                    — master opacity fades the whole block as one unit
 *  • Breathing (final line only) — subtle opacity + scale pulse while held
 *
 * Props:
 *  - text          string | string[]  — single line or multiline array
 *  - startFrame    number             — frame when entrance begins
 *  - fadeInDuration number            — envelope duration (drives slide/blur window)
 *  - holdDuration  number             — frames at full visibility
 *  - fadeOutDuration number           — frames for the fade-out
 *  - breathe?      boolean            — breathing effect (for final line)
 *  - sizeScale?    number             — font-size multiplier, default 1.0
 *  - style?        React.CSSProperties
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

// ── Per-word stagger constants ────────────────────────────────────────────────
const WORD_STAGGER_FRAMES = 2.5;  // frames between each word's fade start
const WORD_FADE_FRAMES    = 12;   // frames for a single word to go 0 → 1

// ── Entrance animation constants ─────────────────────────────────────────────
const ENTRANCE_DURATION_FRAMES = 16; // how long the slide+blur resolve takes
const ENTRANCE_SLIDE_PX        = 14; // starting Y offset (slides up to 0)
const ENTRANCE_BLUR_PX         = 4;  // starting blur (resolves to 0)

interface TextRevealProps {
  text: string | string[];
  startFrame: number;
  fadeInDuration: number;
  holdDuration: number;
  fadeOutDuration: number;
  breathe?: boolean;
  sizeScale?: number;
  style?: React.CSSProperties;
}

export function TextReveal({
  text,
  startFrame,
  fadeInDuration,
  holdDuration,
  fadeOutDuration,
  breathe    = false,
  sizeScale  = 1,
  style,
}: TextRevealProps) {
  const frame = useCurrentFrame();

  const fadeInEnd    = startFrame + fadeInDuration;
  const fadeOutStart = fadeInEnd  + holdDuration;
  const fadeOutEnd   = fadeOutStart + fadeOutDuration;

  // ── Early exit ───────────────────────────────────────────────────────────
  if (frame < startFrame || frame >= fadeOutEnd) return null;

  // ── Master opacity — governs the fade-OUT only ───────────────────────────
  // Words handle their own fade-IN via per-word stagger below.
  const masterOpacity =
    frame >= fadeOutStart
      ? interpolate(frame, [fadeOutStart, fadeOutEnd], [1, 0], {
          extrapolateLeft:  "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  // ── Entrance animations — slide-up + blur-resolve ────────────────────────
  const entranceEnd = startFrame + ENTRANCE_DURATION_FRAMES;

  const yOffset =
    frame < entranceEnd
      ? interpolate(frame, [startFrame, entranceEnd], [ENTRANCE_SLIDE_PX, 0], {
          extrapolateLeft:  "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  const blurPx =
    frame < entranceEnd
      ? interpolate(frame, [startFrame, entranceEnd], [ENTRANCE_BLUR_PX, 0], {
          extrapolateLeft:  "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  // ── Breathing effect (final line only) ──────────────────────────────────
  // Very subtle dual-rhythm pulse: opacity ±7 %, scale ±0.4 %
  const breathePhase =
    frame >= fadeInEnd ? ((frame - fadeInEnd) / 60) * Math.PI * 2 : 0;

  const breatheOpacityDelta =
    breathe && frame >= fadeInEnd && frame < fadeOutStart
      ? Math.sin(breathePhase) * 0.07
      : 0;

  const breatheScale =
    breathe && frame >= fadeInEnd && frame < fadeOutStart
      ? 1 + Math.sin(breathePhase * 0.7) * 0.004
      : 1;

  // ── Text glow — faint white halo at full visibility ──────────────────────
  const glowStrength =
    frame >= fadeInEnd && frame < fadeOutStart
      ? masterOpacity
      : masterOpacity * 0.5;

  const textShadow = `
    0 0 24px rgba(255,255,255,${(0.13 * glowStrength).toFixed(3)}),
    0 0 72px rgba(255,255,255,${(0.05 * glowStrength).toFixed(3)})
  `;

  // ── Typography ───────────────────────────────────────────────────────────
  const lines = Array.isArray(text) ? text : [text];
  // FONT_SIZE is defined in px at the 1080 p baseline; scale it to the actual
  // VIDEO_HEIGHT so the text stays proportional if the composition is resized.
  const fontSizeBaseline = 1080;
  const fontSize = ((FONT_SIZE * sizeScale) / fontSizeBaseline) * VIDEO_HEIGHT;

  // Pre-compute per-word data with global indices (needed for stagger timing)
  let globalWordIdx = 0;
  const lineData = lines.map((line) =>
    line.split(" ").map((word) => ({ word, globalIdx: globalWordIdx++ }))
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position:  "absolute",
        inset:     0,
        display:   "flex",
        flexDirection: "column",
        alignItems:    "center",
        justifyContent: "center",
        opacity:   Math.max(0, Math.min(1, masterOpacity + breatheOpacityDelta)),
        transform: `translateY(${yOffset}px) scale(${breatheScale})`,
        filter:    blurPx > 0.1 ? `blur(${blurPx}px)` : "none",
        pointerEvents: "none",
        ...style,
      }}
    >
      {lineData.map((lineWords, lineIdx) => (
        <div
          key={lineIdx}
          style={{
            display:        "flex",
            gap:            `${(fontSize * 0.28).toFixed(1)}px`,
            flexWrap:       "wrap",
            justifyContent: "center",
            marginBottom:   lineIdx < lineData.length - 1 ? "0.5em" : 0,
          }}
        >
          {lineWords.map(({ word, globalIdx }, wordIdx) => {
            // Each word fades in independently, staggered by globalIdx
            const wordFadeStart = startFrame + globalIdx * WORD_STAGGER_FRAMES;
            const wordFadeEnd   = wordFadeStart + WORD_FADE_FRAMES;
            const wordOpacity   = interpolate(
              frame,
              [wordFadeStart, wordFadeEnd],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            return (
              <span
                key={wordIdx}
                style={{
                  fontFamily:  FONT_FAMILY,
                  fontWeight:  FONT_WEIGHT,
                  fontSize,
                  color:       TEXT_COLOR,
                  letterSpacing: LETTER_SPACING,
                  textShadow,
                  opacity:     wordOpacity,
                  display:     "block",
                  lineHeight:  1.6,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
