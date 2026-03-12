/**
 * DroneAudio — Audio component for the intro video
 *
 * ────────────────────────────────────────────────────────────────────────────
 * HOW TO ADD YOUR AUDIO FILES
 * ────────────────────────────────────────────────────────────────────────────
 *
 * 1. DRONE / AMBIENT SOUND
 *    - Drop your drone audio file into: /public/audio/drone.mp3
 *    - Uncomment the <Audio> component for the drone below.
 *    - Adjust `volume` prop to taste (0.0–1.0).
 *
 * 2. ELEVEN LABS VOICEOVER
 *    - Generate your voiceover via Eleven Labs.
 *    - Save the file as: /public/audio/voiceover.mp3
 *    - Uncomment the <Audio> component for the voiceover below.
 *    - The voiceover starts at frame SEQ_1_START (after the 3s opening black).
 *    - Adjust `startFrom` to sync with your specific voiceover timing.
 *
 * 3. SILENCE GAP
 *    - The drone fades out before the 3-second silence before the final line.
 *    - Both audio tracks are volume-ramped to 0 at DRONE_SILENCE_START.
 *    - After the final line fades, they stay silent.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * CURRENT STATE: No audio files are included. The component structure is
 * ready — just add your .mp3 files to /public/audio/ and uncomment below.
 * ────────────────────────────────────────────────────────────────────────────
 */

// import { Audio, interpolate, useCurrentFrame } from "remotion";
// import { DRONE_SILENCE_START, SEQ_1_START } from "../constants";

export function DroneAudio() {
  // const frame = useCurrentFrame();

  // ── Drone volume envelope ────────────────────────────────────────────────
  // Starts barely audible, builds slowly, then cuts to silence.
  //
  // const droneVolume = (() => {
  //   if (frame >= DRONE_SILENCE_START) return 0; // SILENCE — critical moment
  //   // Slowly build from ~0.05 to ~0.25 over the whole video before silence
  //   return interpolate(frame, [0, DRONE_SILENCE_START], [0.05, 0.25], {
  //     extrapolateLeft: "clamp",
  //     extrapolateRight: "clamp",
  //   });
  // })();

  // ── Voiceover volume envelope ────────────────────────────────────────────
  // Voiceover starts with the first text line and fades with the video.
  //
  // const voiceoverVolume = (() => {
  //   if (frame >= DRONE_SILENCE_START) return 0;
  //   if (frame < SEQ_1_START) return 0;
  //   return interpolate(frame, [SEQ_1_START, SEQ_1_START + 15], [0, 1], {
  //     extrapolateLeft: "clamp",
  //     extrapolateRight: "clamp",
  //   });
  // })();

  return (
    <>
      {/* ── DRONE — uncomment after adding /public/audio/drone.mp3 ──────────
      <Audio
        src={staticFile("audio/drone.mp3")}
        volume={droneVolume}
        loop
      />
      ── END DRONE ────────────────────────────────────────────────────────── */}

      {/* ── VOICEOVER — uncomment after adding /public/audio/voiceover.mp3 ──
      <Audio
        src={staticFile("audio/voiceover.mp3")}
        startFrom={0}
        volume={voiceoverVolume}
      />
      ── END VOICEOVER ────────────────────────────────────────────────────── */}
    </>
  );
}
