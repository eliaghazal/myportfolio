/**
 * DroneAudio — Complete audio layer for the intro video
 *
 * ════════════════════════════════════════════════════════════════════════════
 *  AUDIO SETUP — READ THIS FIRST
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  STEP 1 — Create the audio folder in your project root:
 *
 *    mkdir -p public/audio
 *
 *  STEP 2 — Add your audio files (filenames must match exactly):
 *
 *    public/audio/
 *    ├── drone.mp3               ← Track 1 · ambient hum/organ
 *    ├── voiceover.mp3           ← Track 2 · Eleven Labs narration
 *    ├── sfx-reveal.mp3          ← Track 3 · subtle sound on each text line
 *    ├── sfx-silence-sting.mp3   ← Track 4 · the moment silence drops
 *    └── sfx-final-impact.mp3    ← Track 5 · the "it's never done yet." hit
 *
 *  STEP 3 — Uncomment the MAIN RETURN block at the bottom of this file.
 *           Then uncomment each individual track one by one and test.
 *
 *  STEP 4 — Preview:  npx remotion studio
 *           Export:   npm run render-video
 *
 * ════════════════════════════════════════════════════════════════════════════
 *  TRACK DETAILS
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  TRACK 1 · DRONE   (public/audio/drone.mp3)
 *  ──────────────────────────────────────────
 *  What    : A low ambient hum or organ drone — felt more than heard.
 *            Think Interstellar/Hans Zimmer organ. Deep, barely-audible,
 *            under everything. It builds very slowly, then CUTS at the
 *            silence gap (the "flatline" moment before the final line).
 *  Length  : ≥ 30 s. Set loop={true} if shorter — it will loop seamlessly.
 *  Volume  : Starts 0.05 (barely audible), builds to 0.25. Cuts to 0 at
 *            DRONE_SILENCE_START. Never comes back.
 *  Tips    :
 *    – A pure 55 Hz sine wave with slight chorus/reverb works perfectly.
 *    – Interstellar "Cornfield Chase" organ, pitched down ~2 octaves.
 *    – Search "dark ambient drone" on Freesound / Splice — use 30–60 s loops.
 *    – If the drone file is stereo, keep it; Remotion handles both fine.
 *
 *  TRACK 2 · ELEVEN LABS VOICEOVER   (public/audio/voiceover.mp3)
 *  ───────────────────────────────────────────────────────────────
 *  What    : Your Eleven Labs narration reading the exact script below.
 *            The voiceover starts 3 seconds into the video — exactly when
 *            the first text line ("one more function.") appears.
 *  Script  :
 *            "one more function.
 *             one more verse.
 *             one more sleepless night... that no one asked for.
 *             [pause]
 *             the screen is still on.
 *             the pen hasn't dried.
 *             [pause]
 *             it's not done yet.
 *             [3-second silence — DO NOT narrate this gap]
 *             it's never done yet."
 *  Start   : Frame SEQ_1_START (frame 90 = 3.0 s into the video).
 *  Volume  : Soft fade-in over 15 frames, then cuts with the drone at silence.
 *  Tips    :
 *    – Eleven Labs voice "Adam" or "Antoni" for gravitas; stability 0.70,
 *      similarity 0.75, style 0.30.
 *    – Keep natural pauses between lines — they roughly match the visual gaps.
 *    – Trim any leading silence from the start of the exported .mp3 file.
 *    – The 3-second gap before the final line must be SILENT in the audio
 *      file itself. If Eleven Labs puts narration there, trim it.
 *    – After exporting, run the audio through a compressor and light reverb
 *      to make it feel cinematic rather than a voiceover recording.
 *
 *  TRACK 3 · TEXT REVEAL SFX   (public/audio/sfx-reveal.mp3)
 *  ───────────────────────────────────────────────────────────
 *  What    : A very subtle sound that plays as each text line appears —
 *            a soft breath, a gentle page-turn swipe, or a quiet atmospheric
 *            tone. Optional; remove any Sequence block you don't want.
 *  Volume  : 0.10 — barely there. Adds tactile depth without competing with
 *            the voiceover.
 *  Length  : 0.2–0.5 s. Short transient sounds work best.
 *  Tips    :
 *    – "Soft white-noise burst" (200 ms) — cut from any noise floor recording.
 *    – A very quiet fabric swipe or page-turn sample.
 *    – Or use a different sfx file per line for variation.
 *
 *  TRACK 4 · SILENCE STING   (public/audio/sfx-silence-sting.mp3)
 *  ────────────────────────────────────────────────────────────────
 *  What    : A sound that marks the exact moment everything drops to silence.
 *            Like a reverb tail cutting off sharply, or a single resonant
 *            sub-bass thud, or a reverse cymbal swelling to nothing.
 *  Volume  : 0.25
 *  Timing  : Frame DRONE_SILENCE_START — simultaneous with the flatline visual.
 *  Tips    :
 *    – A sub-bass thud (40–80 Hz, 0.5 s, heavy reverb) is extremely effective.
 *    – OR: nothing at all — the silence IS the sound effect.
 *    – Keep it short (≤ 1 s) so it doesn't bleed into the 3-second void.
 *
 *  TRACK 5 · FINAL IMPACT   (public/audio/sfx-final-impact.mp3)
 *  ──────────────────────────────────────────────────────────────
 *  What    : The sonic payoff for "it's never done yet." This is the
 *            emotional climax. Give it weight.
 *  Volume  : 0.40
 *  Timing  : Frame SEQ_7_START — exactly when the final text fades in.
 *  Tips    :
 *    – A single piano note (middle C, long sustain, plate reverb).
 *    – A string ensemble swell (1–2 s long).
 *    – A deep sub-bass hit with a long reverb tail (3–4 s).
 *    – Even a simple sine wave chord (C + E + G) with heavy reverb.
 *
 * ════════════════════════════════════════════════════════════════════════════
 *  MIXING TIPS (once all tracks are in)
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  1. Drone should be the quietest element — barely felt, never heard.
 *     If you can clearly "hear" the drone, lower its volume.
 *  2. Voiceover sits on top of everything at full clarity. If it competes
 *     with the drone, lower the drone's max volume to 0.15.
 *  3. SFX-reveal should be inaudible on its own — only felt in context.
 *  4. The 3-second silence MUST be truly silent. Any audio bleed kills the
 *     tension. Check that all volume envelopes reach exactly 0 by
 *     DRONE_SILENCE_START.
 *  5. The final impact should feel like a breath releasing. Don't overdo it.
 *
 * ════════════════════════════════════════════════════════════════════════════
 */

// ── Uncomment these imports when audio files are ready ───────────────────────
// import { Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
// import {
//   DRONE_SILENCE_START,
//   SEQ_1_START,
//   SEQ_2_START,
//   SEQ_3_START,
//   SEQ_4_START,
//   SEQ_5_START,
//   SEQ_6_START,
//   SEQ_7_START,
// } from "../constants";

export function DroneAudio() {
  // ══════════════════════════════════════════════════════════════════════════
  //  UNCOMMENT THE ENTIRE BLOCK BELOW WHEN YOUR AUDIO FILES ARE READY
  // ══════════════════════════════════════════════════════════════════════════
  //
  // const frame = useCurrentFrame();
  //
  // // ── Track 1 volume: 0.05 → 0.25 over pre-silence portion, then 0 ────────
  // const droneVolume = frame >= DRONE_SILENCE_START
  //   ? 0
  //   : interpolate(frame, [0, DRONE_SILENCE_START], [0.05, 0.25], {
  //       extrapolateLeft:  "clamp",
  //       extrapolateRight: "clamp",
  //     });
  //
  // // ── Track 2 volume: fades in at SEQ_1_START, cuts at DRONE_SILENCE_START ─
  // const voiceoverVolume = frame >= DRONE_SILENCE_START
  //   ? 0
  //   : frame < SEQ_1_START
  //   ? 0
  //   : interpolate(frame, [SEQ_1_START, SEQ_1_START + 15], [0, 1], {
  //       extrapolateLeft:  "clamp",
  //       extrapolateRight: "clamp",
  //     });
  //
  // const REVEAL_VOL = 0.10; // volume for each text-reveal SFX instance
  //
  // return (
  //   <>
  //     {/* ── TRACK 1: Ambient Drone ─────────────────────────────────────────
  //         File:   public/audio/drone.mp3
  //         Effect: Low hum that builds from frame 0, cuts at silence gap.
  //         loop=true so shorter files still cover the full video.           */}
  //     <Audio
  //       src={staticFile("audio/drone.mp3")}
  //       volume={droneVolume}
  //       loop
  //     />
  //
  //     {/* ── TRACK 2: Eleven Labs Voiceover ────────────────────────────────
  //         File:   public/audio/voiceover.mp3
  //         Effect: Full narration. Starts 3 s in (SEQ_1_START), soft fade-in,
  //                 cuts with the drone at DRONE_SILENCE_START.
  //         Note:   startFrom={0} = play from the beginning of the audio file.
  //                 Increase if your .mp3 has leading silence.               */}
  //     <Sequence from={SEQ_1_START}>
  //       <Audio
  //         src={staticFile("audio/voiceover.mp3")}
  //         volume={voiceoverVolume}
  //         startFrom={0}
  //       />
  //     </Sequence>
  //
  //     {/* ── TRACK 3: Text Reveal SFX — one instance per text line ─────────
  //         File:   public/audio/sfx-reveal.mp3
  //         Effect: Subtle sound each time a line of text appears.
  //         Each <Sequence from={SEQ_N_START}> fires the audio at that frame.
  //         Remove any Sequence you don't want — they're all independent.    */}
  //     <Sequence from={SEQ_1_START}>
  //       <Audio src={staticFile("audio/sfx-reveal.mp3")} volume={REVEAL_VOL} />
  //     </Sequence>
  //     <Sequence from={SEQ_2_START}>
  //       <Audio src={staticFile("audio/sfx-reveal.mp3")} volume={REVEAL_VOL} />
  //     </Sequence>
  //     <Sequence from={SEQ_3_START}>
  //       <Audio src={staticFile("audio/sfx-reveal.mp3")} volume={REVEAL_VOL} />
  //     </Sequence>
  //     <Sequence from={SEQ_4_START}>
  //       <Audio src={staticFile("audio/sfx-reveal.mp3")} volume={REVEAL_VOL} />
  //     </Sequence>
  //     <Sequence from={SEQ_5_START}>
  //       <Audio src={staticFile("audio/sfx-reveal.mp3")} volume={REVEAL_VOL} />
  //     </Sequence>
  //     <Sequence from={SEQ_6_START}>
  //       <Audio src={staticFile("audio/sfx-reveal.mp3")} volume={REVEAL_VOL} />
  //     </Sequence>
  //
  //     {/* ── TRACK 4: Silence Sting ────────────────────────────────────────
  //         File:   public/audio/sfx-silence-sting.mp3
  //         Effect: Sonic punctuation at the exact moment silence drops.
  //                 Must be short (≤ 1 s) to respect the silent void.        */}
  //     <Sequence from={DRONE_SILENCE_START}>
  //       <Audio src={staticFile("audio/sfx-silence-sting.mp3")} volume={0.25} />
  //     </Sequence>
  //
  //     {/* ── TRACK 5: Final Impact ─────────────────────────────────────────
  //         File:   public/audio/sfx-final-impact.mp3
  //         Effect: The emotional landing for "it's never done yet."
  //                 Deep chord, piano note, or resonant bell with reverb.     */}
  //     <Sequence from={SEQ_7_START}>
  //       <Audio src={staticFile("audio/sfx-final-impact.mp3")} volume={0.40} />
  //     </Sequence>
  //   </>
  // );
  //
  // ══════════════════════════════════════════════════════════════════════════
  //  END OF AUDIO BLOCK
  // ══════════════════════════════════════════════════════════════════════════

  // Remove this line and uncomment the block above when audio is ready:
  return null;
}
