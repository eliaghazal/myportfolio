/**
 * ParticleField — Subtle drifting star-field in the background
 *
 * 55 tiny white dots scattered across the frame. Each drifts very slowly on a
 * unique sine/cosine path so the field feels organic rather than mechanical.
 * Combined with a linear creep, no particle ever revisits exactly the same
 * position — but over 35 seconds the movement is barely perceptible.
 *
 * Opacity: field fades in over the first 3 seconds (90 frames) so it doesn't
 * distract from the opening black silence.
 *
 * Implementation notes:
 *  - All positions are deterministic (seeded pseudo-random) so the Remotion
 *    renderer produces the same frame every time — required for MP4 export.
 *  - Uses SVG so it works in both the browser player and headless rendering.
 *  - Individual dot opacities are 0.008–0.043 (barely there — depth, not noise).
 */

import { useCurrentFrame } from "remotion";
import { VIDEO_WIDTH, VIDEO_HEIGHT } from "../constants";

// ── Deterministic pseudo-random (sine hash) ───────────────────────────────────
// Returns a stable value in [0, 1) for any integer seed.
// Uses the standard sine-hash technique: multiply by a large prime-like constant
// (43758.5453 — irrational, avoids periodicity) after a rotated sine to spread
// the distribution uniformly. The seed is premixed with 127.1/311.7 to break
// low-index clustering near 0.
function seededRandom(seed: number): number {
  return Math.abs(Math.sin(seed * 127.1 + 311.7) * 43758.5453) % 1;
}

// ── Particle definitions (computed once at module load) ───────────────────────
const NUM_PARTICLES = 55;

interface Particle {
  x:      number; // 0–1 fraction of VIDEO_WIDTH
  y:      number; // 0–1 fraction of VIDEO_HEIGHT
  r:      number; // radius in px
  alpha:  number; // base opacity
  phase:  number; // sin/cos phase offset
  driftX: number; // linear px/frame drift (very small)
  driftY: number; // linear px/frame drift (very small)
}

const PARTICLES: Particle[] = Array.from({ length: NUM_PARTICLES }, (_, i) => ({
  x:      seededRandom(i * 7 + 1),
  y:      seededRandom(i * 7 + 2),
  r:      seededRandom(i * 7 + 3) * 1.2 + 0.4,          // 0.4 – 1.6 px
  alpha:  seededRandom(i * 7 + 4) * 0.035 + 0.008,       // 0.008 – 0.043
  phase:  seededRandom(i * 7 + 5) * Math.PI * 2,
  driftX: (seededRandom(i * 7 + 6) - 0.5) * 0.009,      // ±0.0045 px/frame
  driftY: (seededRandom(i * 7 + 7) - 0.5) * 0.006,      // ±0.003  px/frame
}));

// ── Component ─────────────────────────────────────────────────────────────────
export function ParticleField() {
  const frame = useCurrentFrame();

  // Fade the whole field in over the first 3 s of black
  const fieldOpacity = Math.min(1, frame / 90);
  if (fieldOpacity <= 0) return null;

  const t = frame * 0.004; // slow time base for sine oscillation

  return (
    <svg
      style={{
        position:      "absolute",
        inset:         0,
        width:         "100%",
        height:        "100%",
        opacity:       fieldOpacity,
        pointerEvents: "none",
      }}
      viewBox={`0 0 ${VIDEO_WIDTH} ${VIDEO_HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {PARTICLES.map((p, i) => {
        // Smooth organic drift: sine in X, cosine in Y, each with unique phase
        const cx = p.x * VIDEO_WIDTH  + Math.sin(t + p.phase) * 12 + p.driftX * frame;
        const cy = p.y * VIDEO_HEIGHT + Math.cos(t * 0.7 + p.phase) * 8 + p.driftY * frame;

        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={p.r}
            fill="white"
            opacity={p.alpha}
          />
        );
      })}
    </svg>
  );
}
