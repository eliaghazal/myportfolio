/**
 * IntroVideo — Main Remotion composition
 *
 * Visual layers (back → front):
 *   1. Pure black background
 *   2. ParticleField   — 55 barely-visible drifting dots (depth / atmosphere)
 *   3. NoiseLayer      — animated film grain (changes seed per frame)
 *   4. Vignette        — radial darkening at corners, focuses eye on centre
 *   5. Ambient glow    — extremely faint radial centre glow, dims at silence
 *   6. TextReveal ×7   — all text lines with stagger + slide + blur + glow
 *   7. SilenceLine     — "flatline" during the 3-second silence gap
 *   8. Fade-to-black   — final overlay that closes the composition
 *
 * Audio: see remotion/components/DroneAudio.tsx for the 5-track guide.
 * Timing: edit remotion/constants.ts — all frame values are in one place.
 */

import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { TextReveal }    from "./components/TextReveal";
import { DroneAudio }    from "./components/DroneAudio";
import { ParticleField } from "./components/ParticleField";
import { SilenceLine }   from "./components/SilenceLine";
import { NoiseLayer }    from "./components/NoiseLayer";
import {
  BG_COLOR,
  FADE_IN_FRAMES,
  FADE_OUT_FRAMES,
  LINES,
  SEQ_1_START,  SEQ_1_HOLD,
  SEQ_2_START,  SEQ_2_HOLD,
  SEQ_3_START,  SEQ_3_HOLD,
  SEQ_4_START,  SEQ_4_HOLD,
  SEQ_5_START,  SEQ_5_HOLD,
  SEQ_6_START,  SEQ_6_HOLD,
  SEQ_7_START,  SEQ_7_HOLD,
  SEQ_SILENCE_START,
  SEQ_FINAL_FADEOUT_START,
  SEQ_FINAL_FADEOUT_DURATION,
} from "./constants";

export function IntroVideo() {
  const frame = useCurrentFrame();

  // ── Ambient centre glow ───────────────────────────────────────────────────
  // Barely perceptible radial illumination in the centre of frame.
  // Pulses very slowly (sine, ~5 s cycle) — adds depth without being visible.
  // Completely dims during the 3-second silence gap to honour the void.
  const silenceFactor = interpolate(
    frame,
    [SEQ_SILENCE_START - 10, SEQ_SILENCE_START, SEQ_7_START, SEQ_7_START + 15],
    [1, 0, 0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const glowOpacity = (0.028 + Math.sin(frame * 0.018) * 0.012) * silenceFactor;

  // ── Final fade-to-black ───────────────────────────────────────────────────
  const finalFadeOpacity = interpolate(
    frame,
    [SEQ_FINAL_FADEOUT_START, SEQ_FINAL_FADEOUT_START + SEQ_FINAL_FADEOUT_DURATION],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: BG_COLOR }}>

      {/* ── Audio (5-track guide in DroneAudio.tsx) ──────────────────────── */}
      <DroneAudio />

      {/* ── Layer 1: Particle field — deep-space atmosphere ──────────────── */}
      <ParticleField />

      {/* ── Layer 2: Film grain — cinematic texture ───────────────────────── */}
      <NoiseLayer />

      {/* ── Layer 3: Vignette — draws eye to centre, darkens corners ─────── */}
      <AbsoluteFill
        style={{
          background:    "radial-gradient(ellipse 72% 68% at 50% 50%, transparent 38%, rgba(0,0,0,0.55) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Layer 4: Ambient centre glow — barely perceptible depth ──────── */}
      <AbsoluteFill
        style={{
          background:    `radial-gradient(ellipse 55% 50% at 50% 50%, rgba(255,255,255,${glowOpacity.toFixed(4)}) 0%, transparent 100%)`,
          pointerEvents: "none",
        }}
      />

      {/* ── Text lines ───────────────────────────────────────────────────── */}

      {/* Line 1: "one more function." */}
      <TextReveal
        text={LINES.seq1}
        startFrame={SEQ_1_START}
        fadeInDuration={FADE_IN_FRAMES}
        holdDuration={SEQ_1_HOLD}
        fadeOutDuration={FADE_OUT_FRAMES}
      />

      {/* Line 2: "one more verse." */}
      <TextReveal
        text={LINES.seq2}
        startFrame={SEQ_2_START}
        fadeInDuration={FADE_IN_FRAMES}
        holdDuration={SEQ_2_HOLD}
        fadeOutDuration={FADE_OUT_FRAMES}
      />

      {/* Line 3: "one more sleepless night / that no one asked for." */}
      <TextReveal
        text={LINES.seq3}
        startFrame={SEQ_3_START}
        fadeInDuration={FADE_IN_FRAMES}
        holdDuration={SEQ_3_HOLD}
        fadeOutDuration={FADE_OUT_FRAMES}
      />

      {/* Line 4: "the screen is still on." */}
      <TextReveal
        text={LINES.seq4}
        startFrame={SEQ_4_START}
        fadeInDuration={FADE_IN_FRAMES}
        holdDuration={SEQ_4_HOLD}
        fadeOutDuration={FADE_OUT_FRAMES}
      />

      {/* Line 5: "the pen hasn't dried." */}
      <TextReveal
        text={LINES.seq5}
        startFrame={SEQ_5_START}
        fadeInDuration={FADE_IN_FRAMES}
        holdDuration={SEQ_5_HOLD}
        fadeOutDuration={FADE_OUT_FRAMES}
      />

      {/* Line 6: "it's not done yet." */}
      <TextReveal
        text={LINES.seq6}
        startFrame={SEQ_6_START}
        fadeInDuration={FADE_IN_FRAMES}
        holdDuration={SEQ_6_HOLD}
        fadeOutDuration={FADE_OUT_FRAMES}
      />

      {/* ── Silence line — appears during the 3 s void ───────────────────── */}
      <SilenceLine />

      {/* Line 7: "it's never done yet." — final line, slightly larger,
          breathing effect on opacity + scale, after 3 s of pure silence */}
      <TextReveal
        text={LINES.seq7}
        startFrame={SEQ_7_START}
        fadeInDuration={FADE_IN_FRAMES}
        holdDuration={SEQ_7_HOLD}
        fadeOutDuration={FADE_OUT_FRAMES}
        sizeScale={1.15}
        breathe
      />

      {/* ── Final fade-to-black overlay ───────────────────────────────────── */}
      {finalFadeOpacity > 0 && (
        <AbsoluteFill
          style={{
            backgroundColor: BG_COLOR,
            opacity:         finalFadeOpacity,
          }}
        />
      )}

    </AbsoluteFill>
  );
}
