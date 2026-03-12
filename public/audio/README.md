# Audio Files for "Terminal to Paper" Intro Video

Place your audio files in this directory. The Remotion composition is pre-wired
with `<Audio>` components that are currently **commented out** — uncomment them
in `remotion/components/AudioPlaceholder.tsx` as you add each file.

---

## Track 1: `drone.mp3`

| Property | Value |
|---|---|
| **Role** | Ambient background drone / hum |
| **Starts** | Frame 0 — the very beginning of the video |
| **Peaks** | Scene 2 (~8s) — full volume as the morph begins |
| **Ends** | Scene 4 (~28s) — drops to silence before the final lines |
| **Duration** | ~30–33 seconds |

**Recommended sources:**
- Freesound.org: search "ambient drone", "low frequency hum", "film score pad"
- Recommended: ~40–80 Hz sine tone with subtle harmonic movement
- Or: A Nils Frahm / Ólafur Arnalds-style pad that builds slowly

---

## Track 2: `voiceover.mp3`

| Property | Value |
|---|---|
| **Role** | Eleven Labs AI voiceover reading the Scene 4 lines |
| **Starts** | ~Frame 840 (~28s) — after 2 seconds of silence in Scene 4 |
| **Script** | `"it's not done yet."` ... [pause] ... `"it's never done yet."` |

**How to generate:**
1. Go to [elevenlabs.io](https://elevenlabs.io)
2. Choose a voice that feels introspective, quiet, slightly tired but determined
3. Settings: Stability ~0.65, Similarity ~0.75, Style ~0.3
4. Script: `"it's not done yet."` (pause 2s) `"it's never done yet."`
5. Export as MP3

**After adding:** Uncomment the voiceover `<Audio>` block in `AudioPlaceholder.tsx`
and adjust `delay` to match the timing.

---

## Track 3: `sfx-glitch.mp3`

| Property | Value |
|---|---|
| **Role** | Short digital glitch / scramble sound effect at morph start |
| **Starts** | ~Frame 255 (~8.5s) — when the first character begins scrambling |
| **Duration** | 0.5–1 second |

**Recommended sources:**
- Freesound.org: search "digital glitch", "data corruption", "bit crush"
- zapsplat.com: Technology → Glitch effects

---

## Track 4: `sfx-transition.mp3`

| Property | Value |
|---|---|
| **Role** | Soft whoosh / sweep as background transitions from black to cream |
| **Starts** | ~Frame 240 (~8s) — the black→cream background transition begins |
| **Duration** | ~2 seconds |

**Recommended sources:**
- Freesound.org: search "whoosh", "atmosphere transition", "film sweep"
- Alternatively: a soft reversed cymbal or white noise fade

---

## Wiring Audio (How to Enable)

1. Add your `.mp3` files to this directory (`public/audio/`)
2. Open `remotion/components/AudioPlaceholder.tsx`
3. Uncomment the `import { Audio } from "remotion";` line
4. Uncomment the relevant `<Audio>` component block
5. Test in the Remotion Studio: `npx remotion studio remotion/Root.tsx`
6. Re-render: `npm run render-video-v2`
