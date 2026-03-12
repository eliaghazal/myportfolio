// ─── Remotion Timing & Content Constants ─────────────────────────────────────
// All timing values are in FRAMES at 30fps.
// Adjust these to change pacing without touching component logic.

export const FPS = 30;
export const TOTAL_DURATION_SECONDS = 33;
export const TOTAL_FRAMES = TOTAL_DURATION_SECONDS * FPS; // 990

// ─── Scene Boundaries (frames) ───────────────────────────────────────────────
export const SCENE1_START = 0;
export const SCENE1_END = 8 * FPS; // 240

export const SCENE2_START = SCENE1_END; // 240
export const SCENE2_END = 20 * FPS; // 600

export const SCENE3_START = SCENE2_END; // 600
export const SCENE3_END = 26 * FPS; // 780

export const SCENE4_START = SCENE3_END; // 780
export const SCENE4_END = TOTAL_FRAMES; // 990

// ─── Scene 1: Terminal Boot Timing ───────────────────────────────────────────
// Pure black for the first 1.5s
export const SCENE1_BLACKOUT_FRAMES = Math.round(1.5 * FPS); // 45

// Terminal fades in after blackout
export const TERMINAL_FADE_IN_START = SCENE1_BLACKOUT_FRAMES; // 45
export const TERMINAL_FADE_IN_DURATION = Math.round(0.8 * FPS); // 24

// Typewriter speed: 40ms per character ≈ 1.2 chars per frame at 30fps
// We use a delay in ms mapped to frames
export const TYPEWRITER_MS_PER_CHAR = 40; // milliseconds
export const TYPEWRITER_FRAMES_PER_CHAR = Math.ceil(
  (TYPEWRITER_MS_PER_CHAR / 1000) * FPS
); // ~2 frames per char (rounding up for readability)

// When each terminal line starts typing (frames from SCENE1_START)
export const LINE1_TYPE_START = TERMINAL_FADE_IN_START + TERMINAL_FADE_IN_DURATION; // 69
export const LINE1_PAUSE = Math.round(0.5 * FPS); // 15 frames pause between lines

// Each line length determines when the next starts
export const CODE_LINE1 = "> const dream = await build();"; // 30 chars
export const CODE_LINE2 = "> // still compiling..."; // 23 chars
export const CODE_LINE3 = "> while (breathing) { create(); }"; // 33 chars

export const LINE1_FRAMES = CODE_LINE1.length * TYPEWRITER_FRAMES_PER_CHAR; // ~60
export const LINE2_TYPE_START = LINE1_TYPE_START + LINE1_FRAMES + LINE1_PAUSE;
export const LINE2_FRAMES = CODE_LINE2.length * TYPEWRITER_FRAMES_PER_CHAR; // ~46
export const LINE3_TYPE_START = LINE2_TYPE_START + LINE2_FRAMES + LINE1_PAUSE;
export const LINE3_FRAMES = CODE_LINE3.length * TYPEWRITER_FRAMES_PER_CHAR; // ~66

// Cursor blinks 3 times after last line finishes
export const CURSOR_BLINK_START =
  LINE3_TYPE_START + LINE3_FRAMES + LINE1_PAUSE;
export const CURSOR_BLINK_PERIOD = Math.round(0.5 * FPS); // 15 frames per blink

// ─── Scene 2: The Morph Timing ───────────────────────────────────────────────
// Glitch effect starts at SCENE2_START, morphs happen line by line
export const GLITCH_DURATION = Math.round(0.5 * FPS); // 15 frames of pre-morph glitch

// Each line's scramble takes 0.8–1.0s to resolve, then a pause before next
export const MORPH_DURATION_FRAMES = Math.round(1.0 * FPS); // 30 frames
export const MORPH_PAUSE_FRAMES = Math.round(0.8 * FPS); // 24 frames between lines

export const MORPH_LINE1_START = SCENE2_START + GLITCH_DURATION; // line 1 begins morphing
export const MORPH_LINE2_START =
  MORPH_LINE1_START + MORPH_DURATION_FRAMES + MORPH_PAUSE_FRAMES;
export const MORPH_LINE3_START =
  MORPH_LINE2_START + MORPH_DURATION_FRAMES + MORPH_PAUSE_FRAMES;
export const MORPH_LINE3_END = MORPH_LINE3_START + MORPH_DURATION_FRAMES;

// Background color transition: black → cream over all of Scene 2
export const BG_TRANSITION_START = SCENE2_START;
export const BG_TRANSITION_END = SCENE2_END;

// Font / color crossfade: mono→handwriting, green→warm white
// This crossfade happens per-line as each line resolves
export const FONT_CROSSFADE_DURATION = Math.round(1.2 * FPS); // 36 frames

// ─── Scene 3: The Page ───────────────────────────────────────────────────────
export const RULED_LINES_FADE_IN_START = SCENE3_START;
export const RULED_LINES_FADE_IN_DURATION = Math.round(1.5 * FPS); // 45 frames

// Hold for 2 seconds, then fade out text + ruled lines
export const SCENE3_HOLD_END = SCENE3_START + 2 * FPS; // 660
export const SCENE3_FADE_OUT_START = SCENE3_HOLD_END;
export const SCENE3_FADE_OUT_DURATION = Math.round(1.5 * FPS); // 45 frames

// Background transitions back to black over the last 2s of Scene 3
export const BG_REVERSE_START = SCENE3_START + 2 * FPS; // 660
export const BG_REVERSE_END = SCENE3_END; // 780

// ─── Scene 4: The Ending ─────────────────────────────────────────────────────
export const SCENE4_SILENCE_FRAMES = 2 * FPS; // 60 frames of silence

// "it's not done yet." line
export const TEXT1_FADE_IN_START = SCENE4_START + SCENE4_SILENCE_FRAMES; // 840
export const TEXT1_FADE_IN_DURATION = Math.round(0.8 * FPS); // 24
export const TEXT1_HOLD_DURATION = 2 * FPS; // 60
export const TEXT1_FADE_OUT_START =
  TEXT1_FADE_IN_START + TEXT1_FADE_IN_DURATION + TEXT1_HOLD_DURATION;
export const TEXT1_FADE_OUT_DURATION = Math.round(0.8 * FPS); // 24

// 2 seconds of black between the two lines
export const TEXT2_SILENCE_START =
  TEXT1_FADE_OUT_START + TEXT1_FADE_OUT_DURATION;
export const TEXT2_SILENCE_DURATION = 2 * FPS; // 60

// "it's never done yet." line
export const TEXT2_FADE_IN_START =
  TEXT2_SILENCE_START + TEXT2_SILENCE_DURATION;
export const TEXT2_FADE_IN_DURATION = Math.round(0.8 * FPS); // 24
export const TEXT2_HOLD_DURATION = 3 * FPS; // 90
export const TEXT2_FADE_OUT_START =
  TEXT2_FADE_IN_START + TEXT2_FADE_IN_DURATION + TEXT2_HOLD_DURATION;
export const TEXT2_FADE_OUT_DURATION = Math.round(0.8 * FPS); // 24

// Breathing animation: gentle opacity oscillation for TEXT2
export const BREATHING_AMPLITUDE = 0.08; // ±8% opacity
export const BREATHING_PERIOD_FRAMES = Math.round(2.5 * FPS); // 75 frames per breath

// ─── Text Content ─────────────────────────────────────────────────────────────
// Terminal lines (Scene 1)
export const TERMINAL_LINES = [CODE_LINE1, CODE_LINE2, CODE_LINE3];

// Poetry lines (Scene 2–3 target after morph)
export const POETRY_LINES = [
  "I am the master of my fate",
  "etched in the immortal ink",
  "with each betrayal, I rise",
];

// Scene 4 ending text
export const ENDING_LINE1 = "it's not done yet.";
export const ENDING_LINE2 = "it's never done yet.";

// ─── Character Scramble Pool ──────────────────────────────────────────────────
// Characters cycled during the morph animation
export const SCRAMBLE_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789{}()[];:=>/._";

// Scramble cycling speed: ~30ms per character swap
export const SCRAMBLE_CYCLE_MS = 30;
export const SCRAMBLE_CYCLE_FRAMES = Math.ceil(
  (SCRAMBLE_CYCLE_MS / 1000) * FPS
); // ~1 frame

// ─── Colors ───────────────────────────────────────────────────────────────────
export const COLOR_TERMINAL_GREEN = "#39ff14"; // Neon green
export const COLOR_TERMINAL_GREEN_OPACITY = 0.4; // Dimmed to 40%
export const COLOR_POETRY_WARM = "#f5e0b8"; // Warm white (morph target)
export const COLOR_POETRY_DARK = "#1a1005"; // Dark warm (on cream bg)
export const COLOR_BG_BLACK = "#000000";
export const COLOR_BG_CREAM = "#f4ede0";
export const COLOR_ENDING_TEXT = "#ffffff"; // Scene 4: white on black

// ─── Typography ───────────────────────────────────────────────────────────────
export const FONT_MONO = "IBM Plex Mono, monospace"; // Scene 1–2 terminal
export const FONT_HANDWRITING = "Caveat, cursive"; // Scene 2–3 poetry
export const FONT_ENDING = "Space Grotesk, sans-serif"; // Scene 4

// Font sizes (px, for 1920×1080 composition)
export const TERMINAL_FONT_SIZE = 20; // Scene 1–2
export const POETRY_FONT_SIZE = 28; // Scene 2–3
export const ENDING_FONT_SIZE = 22; // Scene 4

// ─── Layout ───────────────────────────────────────────────────────────────────
export const COMPOSITION_WIDTH = 1920;
export const COMPOSITION_HEIGHT = 1080;

// Terminal text block position (centered)
export const TEXT_BLOCK_LEFT = 200; // px from left (offset for terminal feel)
export const TEXT_LINE_HEIGHT = 52; // px between lines

// ─── Audio Timing (frames) ───────────────────────────────────────────────────
// These match the Remotion <Audio> startFrom / endAt props
export const AUDIO_DRONE_START = 0; // Drone begins from frame 0
export const AUDIO_DRONE_VOLUME_PEAK = SCENE2_START; // Full volume at Scene 2
export const AUDIO_DRONE_END = SCENE4_START + SCENE4_SILENCE_FRAMES; // Drops at silence

export const AUDIO_GLITCH_START = SCENE2_START + GLITCH_DURATION; // SFX at first morph
export const AUDIO_TRANSITION_START = BG_TRANSITION_START; // Whoosh at bg transition

export const AUDIO_VOICEOVER_START = TEXT1_FADE_IN_START; // Voiceover begins at Scene 4
