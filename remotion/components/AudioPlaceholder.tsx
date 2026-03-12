/**
 * AudioPlaceholder.tsx
 * Wires up Remotion <Audio> components for all four audio tracks.
 *
 * USAGE: Drop your audio files into public/audio/ and uncomment the
 * corresponding <Audio> component below. See public/audio/README.md
 * for details on each file.
 *
 * All <Audio> components are commented out until files are present
 * to avoid build errors. Uncomment one at a time as you add files.
 */

import React from "react";
// import { Audio } from "remotion";
import {
  AUDIO_DRONE_START,
  AUDIO_DRONE_END,
  AUDIO_GLITCH_START,
  AUDIO_TRANSITION_START,
  AUDIO_VOICEOVER_START,
  FPS,
} from "../constants";

// Suppress unused variable warnings for commented-out timing constants
void AUDIO_DRONE_START;
void AUDIO_DRONE_END;
void AUDIO_GLITCH_START;
void AUDIO_TRANSITION_START;
void AUDIO_VOICEOVER_START;
void FPS;

export const AudioPlaceholder: React.FC = () => {
  return (
    <>
      {/*
        ═══════════════════════════════════════════════════════════════
        TRACK 1: Ambient Drone
        File: public/audio/drone.mp3
        Starts: Frame 0 (scene start)
        Peaks: Around Scene 2 (frame ~240)
        Ends: Frame ~840 (drops at Scene 4 silence)
        Recommended: Low 40-80Hz sine drone, 30-33s, fades naturally
        ═══════════════════════════════════════════════════════════════
      */}
      {/*
      <Audio
        src="/audio/drone.mp3"
        startFrom={AUDIO_DRONE_START}
        endAt={AUDIO_DRONE_END}
        volume={(f) => {
          // Drone builds to full volume by Scene 2, drops to 0 at Scene 4 silence
          if (f < AUDIO_DRONE_START) return 0;
          if (f < SCENE2_START) return interpolate(f, [0, SCENE2_START], [0.3, 1]);
          if (f < AUDIO_DRONE_END - FPS) return 1;
          return interpolate(f, [AUDIO_DRONE_END - FPS, AUDIO_DRONE_END], [1, 0]);
        }}
      />
      */}

      {/*
        ═══════════════════════════════════════════════════════════════
        TRACK 2: Voiceover
        File: public/audio/voiceover.mp3
        Starts: Frame ~840 (Scene 4, after 2s silence)
        Source: Eleven Labs — Elia's voice or a chosen voice
        Script: "it's not done yet." ... "it's never done yet."
        ═══════════════════════════════════════════════════════════════
      */}
      {/*
      <Audio
        src="/audio/voiceover.mp3"
        startFrom={0}
        volume={1}
        // Use delay prop to start at the right frame:
        // delay={AUDIO_VOICEOVER_START / FPS}
      />
      */}

      {/*
        ═══════════════════════════════════════════════════════════════
        TRACK 3: Glitch SFX
        File: public/audio/sfx-glitch.mp3
        Starts: Frame ~255 (first character morph begins)
        Recommended: Short 0.5-1s digital glitch / scramble noise
        ═══════════════════════════════════════════════════════════════
      */}
      {/*
      <Audio
        src="/audio/sfx-glitch.mp3"
        startFrom={0}
        volume={0.6}
        // Delay so it fires at the first morph
        // delay={AUDIO_GLITCH_START / FPS}
      />
      */}

      {/*
        ═══════════════════════════════════════════════════════════════
        TRACK 4: Transition SFX
        File: public/audio/sfx-transition.mp3
        Starts: Frame ~240 (background begins black→cream transition)
        Recommended: Soft whoosh or sweep sound, ~2s
        ═══════════════════════════════════════════════════════════════
      */}
      {/*
      <Audio
        src="/audio/sfx-transition.mp3"
        startFrom={0}
        volume={0.4}
        // delay={AUDIO_TRANSITION_START / FPS}
      />
      */}
    </>
  );
};

export default AudioPlaceholder;
