/**
 * IntroVideo — Main Remotion composition
 *
 * Cinematic portfolio intro. ~35 seconds at 30fps.
 * Pure black background, white thin lowercase text, Apple-level restraint.
 *
 * Script (do not change words without updating LINES in constants.ts):
 *   "one more function."
 *   "one more verse."
 *   "one more sleepless night / that no one asked for."
 *   "the screen is still on."
 *   "the pen hasn't dried."
 *   "it's not done yet."
 *   [3s silence]
 *   "it's never done yet."  ← breathing effect, final line
 *
 * To adjust timing: edit remotion/constants.ts
 * To add audio: see remotion/components/DroneAudio.tsx
 */

import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { TextReveal } from "./components/TextReveal";
import { DroneAudio } from "./components/DroneAudio";
import {
  BG_COLOR,
  FADE_IN_FRAMES,
  FADE_OUT_FRAMES,
  LINES,
  SEQ_1_START,
  SEQ_1_HOLD,
  SEQ_2_START,
  SEQ_2_HOLD,
  SEQ_3_START,
  SEQ_3_HOLD,
  SEQ_4_START,
  SEQ_4_HOLD,
  SEQ_5_START,
  SEQ_5_HOLD,
  SEQ_6_START,
  SEQ_6_HOLD,
  SEQ_7_START,
  SEQ_7_HOLD,
  SEQ_FINAL_FADEOUT_START,
  SEQ_FINAL_FADEOUT_DURATION,
} from "./constants";

export function IntroVideo() {
  const frame = useCurrentFrame();

  // ── Final video fade-to-black overlay ────────────────────────────────────
  // Smoothly fades the entire composition to black at the end.
  const finalFadeOpacity = interpolate(
    frame,
    [SEQ_FINAL_FADEOUT_START, SEQ_FINAL_FADEOUT_START + SEQ_FINAL_FADEOUT_DURATION],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: BG_COLOR }}>

      {/* ── Audio (drone + voiceover placeholder) ──────────────────────── */}
      <DroneAudio />

      {/* ── Line 1: "one more function." ─────────────────────────────── */}
      <TextReveal
        text={LINES.seq1}
        startFrame={SEQ_1_START}
        fadeInDuration={FADE_IN_FRAMES}
        holdDuration={SEQ_1_HOLD}
        fadeOutDuration={FADE_OUT_FRAMES}
      />

      {/* ── Line 2: "one more verse." ─────────────────────────────────── */}
      <TextReveal
        text={LINES.seq2}
        startFrame={SEQ_2_START}
        fadeInDuration={FADE_IN_FRAMES}
        holdDuration={SEQ_2_HOLD}
        fadeOutDuration={FADE_OUT_FRAMES}
      />

      {/* ── Line 3: "one more sleepless night / that no one asked for." ── */}
      <TextReveal
        text={LINES.seq3}
        startFrame={SEQ_3_START}
        fadeInDuration={FADE_IN_FRAMES}
        holdDuration={SEQ_3_HOLD}
        fadeOutDuration={FADE_OUT_FRAMES}
      />

      {/* ── Line 4: "the screen is still on." ─────────────────────────── */}
      <TextReveal
        text={LINES.seq4}
        startFrame={SEQ_4_START}
        fadeInDuration={FADE_IN_FRAMES}
        holdDuration={SEQ_4_HOLD}
        fadeOutDuration={FADE_OUT_FRAMES}
      />

      {/* ── Line 5: "the pen hasn't dried." ──────────────────────────── */}
      <TextReveal
        text={LINES.seq5}
        startFrame={SEQ_5_START}
        fadeInDuration={FADE_IN_FRAMES}
        holdDuration={SEQ_5_HOLD}
        fadeOutDuration={FADE_OUT_FRAMES}
      />

      {/* ── Line 6: "it's not done yet." ──────────────────────────────── */}
      <TextReveal
        text={LINES.seq6}
        startFrame={SEQ_6_START}
        fadeInDuration={FADE_IN_FRAMES}
        holdDuration={SEQ_6_HOLD}
        fadeOutDuration={FADE_OUT_FRAMES}
      />

      {/* ── Line 7: "it's never done yet." — final line with breathing ── */}
      {/* After 3 seconds of silence and pure black, this lands differently. */}
      <TextReveal
        text={LINES.seq7}
        startFrame={SEQ_7_START}
        fadeInDuration={FADE_IN_FRAMES}
        holdDuration={SEQ_7_HOLD}
        fadeOutDuration={FADE_OUT_FRAMES}
        breathe
      />

      {/* ── Final fade-to-black overlay ───────────────────────────────── */}
      {finalFadeOpacity > 0 && (
        <AbsoluteFill
          style={{
            backgroundColor: BG_COLOR,
            opacity: finalFadeOpacity,
          }}
        />
      )}

    </AbsoluteFill>
  );
}
