/**
 * NoiseLayer — Animated film-grain texture
 *
 * Renders an SVG feTurbulence noise filter over the entire frame at very low
 * opacity (~3 %). The filter seed advances every frame (frame % 97), so each
 * rendered frame has subtly different grain — exactly how film grain behaves
 * in real cinema.
 *
 * In the browser @remotion/player the grain visibly animates (good).
 * In the exported MP4 each frame is rendered independently so every frame
 * gets unique grain without any JavaScript animation overhead.
 *
 * Why 97? It's prime, so the seed cycle (97 unique seeds) has no sub-cycles
 * shorter than 97 frames — virtually invisible to the eye.
 *
 * Opacity 0.028 = 7 / 255, just enough to read as texture without washing out
 * the deep black or the text.
 */

import { useCurrentFrame } from "remotion";

// Number of distinct seeds before cycling. Prime value prevents visible
// sub-cycles — any value < NOISE_SEED_CYCLE divides it without remainder.
const NOISE_SEED_CYCLE = 97;

export function NoiseLayer() {
  const frame = useCurrentFrame();

  // Prime-cycle seed gives varied grain without pattern repetition
  const seed = frame % NOISE_SEED_CYCLE;

  // Use a unique filter id per seed so the browser doesn't cache stale grain
  const filterId = `grain-${seed}`;

  return (
    <svg
      style={{
        position:      "absolute",
        inset:         0,
        width:         "100%",
        height:        "100%",
        pointerEvents: "none",
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id={filterId} x="0%" y="0%" width="100%" height="100%">
          {/* fractalNoise gives organic grain; baseFrequency ~0.72 ≈ fine film grain */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.72"
            numOctaves={4}
            seed={seed}
            stitchTiles="stitch"
          />
          {/* Desaturate so we get monochrome grain, not coloured noise */}
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>

      {/* Grain rect — opacity tuned so it's felt, not seen */}
      <rect
        width="100%"
        height="100%"
        filter={`url(#${filterId})`}
        opacity="0.028"
      />
    </svg>
  );
}
