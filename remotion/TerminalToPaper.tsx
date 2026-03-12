/**
 * TerminalToPaper.tsx
 * Main Remotion composition for the "Terminal to Paper" cinematic intro.
 *
 * Scene breakdown:
 *   Scene 1 (0–8s):   Terminal boot — typewriter effect, blinking cursor
 *   Scene 2 (8–20s):  The Morph — code glitches and becomes poetry,
 *                      font/color/background all transform
 *   Scene 3 (20–26s): The Page — warm cream bg, handwritten poetry, ruled lines
 *   Scene 4 (26–33s): The Ending — "it's not done yet." / "it's never done yet."
 */

import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

import { TerminalText } from "./components/TerminalText";
import { CharacterScramble } from "./components/CharacterScramble";
import { TextReveal } from "./components/TextReveal";
import { AudioPlaceholder } from "./components/AudioPlaceholder";

import {
  // Scene boundaries
  SCENE1_END,
  SCENE2_START,
  SCENE2_END,
  SCENE3_START,
  SCENE4_START,

  // Scene 1 timing
  TERMINAL_FADE_IN_START,
  TERMINAL_FADE_IN_DURATION,

  // Scene 2 morph timing
  MORPH_LINE1_START,
  MORPH_LINE2_START,
  MORPH_LINE3_START,
  MORPH_LINE3_END,
  BG_TRANSITION_START,
  BG_TRANSITION_END,

  // Scene 3 timing
  RULED_LINES_FADE_IN_START,
  RULED_LINES_FADE_IN_DURATION,
  SCENE3_FADE_OUT_START,
  SCENE3_FADE_OUT_DURATION,
  BG_REVERSE_START,
  BG_REVERSE_END,

  // Scene 4 timing
  TEXT1_FADE_IN_START,
  TEXT1_FADE_IN_DURATION,
  TEXT1_FADE_OUT_START,
  TEXT1_FADE_OUT_DURATION,
  TEXT2_FADE_IN_START,
  TEXT2_FADE_IN_DURATION,
  TEXT2_FADE_OUT_START,
  TEXT2_FADE_OUT_DURATION,

  // Content
  TERMINAL_LINES,
  POETRY_LINES,
  ENDING_LINE1,
  ENDING_LINE2,

  // Colors
  COLOR_BG_BLACK,
  COLOR_BG_CREAM,

  // Layout
  TEXT_BLOCK_LEFT,
  TEXT_LINE_HEIGHT,
  POETRY_FONT_SIZE,
  FONT_HANDWRITING,
  COLOR_POETRY_DARK,
} from "./constants";

// ─── Helper: hex color to RGB tuple ──────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Interpolate between two hex colors, return rgb() string
function lerpColor(hexA: string, hexB: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(hexA);
  const [br, bg, bb] = hexToRgb(hexB);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const b = Math.round(ab + (bb - ab) * t);
  return `rgb(${r},${g},${b})`;
}

// ─── Scanline overlay (very faint, optional effect for Scene 1–2) ─────────────
const ScanlineOverlay: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage:
        "repeating-linear-gradient(0deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 4px)",
      pointerEvents: "none",
      opacity,
    }}
  />
);

// ─── Ruled notebook lines (Scene 3) ──────────────────────────────────────────
const RuledLines: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage:
        "repeating-linear-gradient(180deg, transparent 0px, transparent 39px, rgba(180,140,100,0.18) 39px, rgba(180,140,100,0.18) 40px)",
      pointerEvents: "none",
      opacity,
    }}
  />
);

// ─── Main Composition ─────────────────────────────────────────────────────────
export const TerminalToPaper: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Background color ──────────────────────────────────────────────────────
  let bgColor = COLOR_BG_BLACK;

  if (frame >= BG_TRANSITION_START && frame < BG_TRANSITION_END) {
    // Scene 2: black → cream
    const t = interpolate(frame, [BG_TRANSITION_START, BG_TRANSITION_END], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    bgColor = lerpColor(COLOR_BG_BLACK, COLOR_BG_CREAM, t);
  } else if (frame >= SCENE3_START && frame < BG_REVERSE_START) {
    // Scene 3 early: stay cream
    bgColor = COLOR_BG_CREAM;
  } else if (frame >= BG_REVERSE_START && frame < BG_REVERSE_END) {
    // Scene 3 late: cream → black
    const t = interpolate(frame, [BG_REVERSE_START, BG_REVERSE_END], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    bgColor = lerpColor(COLOR_BG_CREAM, COLOR_BG_BLACK, t);
  } else if (frame >= SCENE4_START) {
    bgColor = COLOR_BG_BLACK;
  }

  // ── Terminal fade-in opacity (Scene 1) ────────────────────────────────────
  const terminalOpacity =
    frame < SCENE2_START
      ? interpolate(
          frame,
          [TERMINAL_FADE_IN_START, TERMINAL_FADE_IN_START + TERMINAL_FADE_IN_DURATION],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        )
      : 1;

  // ── Scene 1 visibility ────────────────────────────────────────────────────
  const inScene1 = frame < SCENE1_END;

  // ── Scene 2: morph block visibility ──────────────────────────────────────
  const inScene2 = frame >= SCENE2_START && frame < SCENE3_START;

  // ── Scene 3: poetry page visibility ──────────────────────────────────────
  const inScene3 = frame >= SCENE3_START && frame < SCENE4_START;
  const scene3TextOpacity = inScene3
    ? frame < SCENE3_FADE_OUT_START
      ? 1
      : interpolate(
          frame,
          [SCENE3_FADE_OUT_START, SCENE3_FADE_OUT_START + SCENE3_FADE_OUT_DURATION],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        )
    : 0;

  // Ruled lines opacity (Scene 3)
  const ruledLinesOpacity = inScene3
    ? interpolate(
        frame,
        [RULED_LINES_FADE_IN_START, RULED_LINES_FADE_IN_START + RULED_LINES_FADE_IN_DURATION],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      ) * (frame < SCENE3_FADE_OUT_START
        ? 1
        : interpolate(
            frame,
            [SCENE3_FADE_OUT_START, SCENE3_FADE_OUT_START + SCENE3_FADE_OUT_DURATION],
            [1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          ))
    : 0;

  // Scanline overlay: present in Scene 1-2, fades with terminal
  const scanlineOpacity = frame < SCENE2_END ? terminalOpacity * 0.6 : 0;

  // After the morph is complete (all 3 lines resolved), show Scene 3 poetry
  const morphComplete = frame >= MORPH_LINE3_END;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: bgColor,
        position: "relative",
        overflow: "hidden",
        fontFamily: "sans-serif",
      }}
    >
      {/* ── Audio ─────────────────────────────────────────────────────────── */}
      <AudioPlaceholder />

      {/* ── Scene 1: Terminal Window ──────────────────────────────────────── */}
      {inScene1 && (
        <div style={{ opacity: terminalOpacity, position: "absolute", inset: 0 }}>
          <TerminalText />
        </div>
      )}

      {/* ── Scanline overlay (Scenes 1–2, very faint) ────────────────────── */}
      <ScanlineOverlay opacity={scanlineOpacity} />

      {/* ── Scene 2: Character Morph ──────────────────────────────────────── */}
      {inScene2 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: TEXT_BLOCK_LEFT,
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: `${TEXT_LINE_HEIGHT * 0.5}px`,
          }}
        >
          <CharacterScramble
            sourceText={TERMINAL_LINES[0]}
            targetText={POETRY_LINES[0]}
            morphStart={MORPH_LINE1_START}
          />
          <CharacterScramble
            sourceText={TERMINAL_LINES[1]}
            targetText={POETRY_LINES[1]}
            morphStart={MORPH_LINE2_START}
          />
          <CharacterScramble
            sourceText={TERMINAL_LINES[2]}
            targetText={POETRY_LINES[2]}
            morphStart={MORPH_LINE3_START}
          />
        </div>
      )}

      {/* ── Scene 3: The Page ─────────────────────────────────────────────── */}
      {inScene3 && (
        <>
          <RuledLines opacity={ruledLinesOpacity} />
          {(inScene3 || morphComplete) && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: TEXT_BLOCK_LEFT,
                transform: "translateY(-50%)",
                display: "flex",
                flexDirection: "column",
                gap: `${TEXT_LINE_HEIGHT * 0.7}px`,
                opacity: scene3TextOpacity,
              }}
            >
              {POETRY_LINES.map((line, idx) => (
                <p
                  key={idx}
                  style={{
                    fontFamily: FONT_HANDWRITING,
                    fontSize: `${POETRY_FONT_SIZE}px`,
                    color: COLOR_POETRY_DARK,
                    margin: 0,
                    padding: 0,
                    letterSpacing: "0.01em",
                    lineHeight: 1.4,
                  }}
                >
                  {line}
                </p>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Scene 4: The Ending ───────────────────────────────────────────── */}
      {frame >= SCENE4_START && (
        <>
          <TextReveal
            text={ENDING_LINE1}
            fadeInStart={TEXT1_FADE_IN_START}
            fadeInDuration={TEXT1_FADE_IN_DURATION}
            fadeOutStart={TEXT1_FADE_OUT_START}
            fadeOutDuration={TEXT1_FADE_OUT_DURATION}
          />
          <TextReveal
            text={ENDING_LINE2}
            fadeInStart={TEXT2_FADE_IN_START}
            fadeInDuration={TEXT2_FADE_IN_DURATION}
            fadeOutStart={TEXT2_FADE_OUT_START}
            fadeOutDuration={TEXT2_FADE_OUT_DURATION}
            breathing
          />
        </>
      )}
    </div>
  );
};

export default TerminalToPaper;
