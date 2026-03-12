# Audio Files — Intro Video

Place your audio files in **this folder** (`public/audio/`). The Remotion
composition reads them from here at both preview time and export time.

---

## Required files

| File | What it is | Source |
|------|-----------|--------|
| `drone.mp3` | Low ambient hum / organ drone | Freesound, Splice, or a 55 Hz sine wave with reverb |
| `voiceover.mp3` | Eleven Labs narration | Generate via [elevenlabs.io](https://elevenlabs.io) |
| `sfx-reveal.mp3` | Subtle sound on each text line | Short white-noise burst or soft fabric swipe (0.2–0.5 s) |
| `sfx-silence-sting.mp3` | Marks the silence drop | Sub-bass thud with heavy reverb (≤ 1 s) |
| `sfx-final-impact.mp3` | Final "it's never done yet." hit | Piano note, string swell, or resonant bell with reverb |

---

## Voiceover script (exact text for Eleven Labs)

```
one more function.

one more verse.

one more sleepless night... that no one asked for.

[pause — let it breathe]

the screen is still on.

the pen hasn't dried.

[pause]

it's not done yet.

[3-second silence — do NOT narrate this gap]

it's never done yet.
```

**Recommended Eleven Labs settings:**
- Voice: Adam or Antoni
- Stability: 0.70 · Similarity: 0.75 · Style: 0.30
- Format: MP3, 44.1 kHz or 48 kHz

After generating:
1. Trim any leading silence from the start of the file.
2. The 3-second gap before "it's never done yet." must be **silent** in the file.
3. Run through a light compressor and plate reverb for a cinematic feel.

---

## Activating audio in the composition

Open `remotion/components/DroneAudio.tsx` and follow the instructions there.
Each track has its own clearly marked block — uncomment one at a time and test.

Preview: `npx remotion studio`  
Export:  `npm run render-video`
