/**
 * Remotion Intro Video — Constants
 *
 * All timing values are in FRAMES (30fps).
 * 30 frames = 1 second.
 *
 * Edit these values to adjust pacing, text content, or colors.
 */

export const FPS = 30;
export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;

// ─── Colors ──────────────────────────────────────────────────────────────────
export const BG_COLOR = "#000000";
export const TEXT_COLOR = "#ffffff";

// ─── Typography ──────────────────────────────────────────────────────────────
// Using Space Grotesk (already loaded in the project) at weight 300 for the
// Apple-like thin, clean, centered aesthetic.
export const FONT_FAMILY = "'Space Grotesk', 'Inter', -apple-system, sans-serif";
export const FONT_WEIGHT = 300;
export const FONT_SIZE = 28; // px — scales to VIDEO_HEIGHT at render time
export const LETTER_SPACING = "0.08em";

// ─── Timing ──────────────────────────────────────────────────────────────────
// All durations are in frames (30fps)

// Fade durations
export const FADE_IN_FRAMES = 18;   // 0.6s — elegant, not instant
export const FADE_OUT_FRAMES = 15;  // 0.5s — clean exit

// Sequence start frames
// 0–89: 3 seconds of pure black + drone begins
export const SEQ_OPENING_BLACK = 90; // 3s of black

// "one more function."
export const SEQ_1_START = SEQ_OPENING_BLACK; // frame 90
export const SEQ_1_HOLD = 60;                 // 2s hold

// "one more verse."
export const SEQ_2_GAP = 30;                  // 1s black between lines
export const SEQ_2_START = SEQ_1_START + FADE_IN_FRAMES + SEQ_1_HOLD + FADE_OUT_FRAMES + SEQ_2_GAP;
export const SEQ_2_HOLD = 45;                 // 1.5s hold

// "one more sleepless night / that no one asked for."
export const SEQ_3_GAP = 25;
export const SEQ_3_START = SEQ_2_START + FADE_IN_FRAMES + SEQ_2_HOLD + FADE_OUT_FRAMES + SEQ_3_GAP;
export const SEQ_3_HOLD = 75;                 // 2.5s hold

// [hum builds — 2 seconds of black]
export const SEQ_MID_BLACK = SEQ_3_START + FADE_IN_FRAMES + SEQ_3_HOLD + FADE_OUT_FRAMES;
export const SEQ_MID_GAP = 60;               // 2s

// "the screen is still on."
export const SEQ_4_START = SEQ_MID_BLACK + SEQ_MID_GAP;
export const SEQ_4_HOLD = 60;               // 2s hold

// "the pen hasn't dried."
export const SEQ_5_GAP = 25;
export const SEQ_5_START = SEQ_4_START + FADE_IN_FRAMES + SEQ_4_HOLD + FADE_OUT_FRAMES + SEQ_5_GAP;
export const SEQ_5_HOLD = 45;               // 1.5s hold

// [2 seconds of black — tension peaks]
export const SEQ_TENSION_BLACK = SEQ_5_START + FADE_IN_FRAMES + SEQ_5_HOLD + FADE_OUT_FRAMES;
export const SEQ_TENSION_GAP = 55;          // ~1.8s — slightly shorter, tension building

// "it's not done yet."
export const SEQ_6_START = SEQ_TENSION_BLACK + SEQ_TENSION_GAP;
export const SEQ_6_HOLD = 60;              // 2s hold

// [BLACK — silence drops. 3 full seconds.]
export const SEQ_SILENCE_START = SEQ_6_START + FADE_IN_FRAMES + SEQ_6_HOLD + FADE_OUT_FRAMES;
export const SEQ_SILENCE_DURATION = 90;   // 3s — critical silence

// "it's never done yet." — the final line
export const SEQ_7_START = SEQ_SILENCE_START + SEQ_SILENCE_DURATION;
export const SEQ_7_HOLD = 120;            // 4s hold with breathing effect

// Final fade to black
export const SEQ_FINAL_FADEOUT_START = SEQ_7_START + FADE_IN_FRAMES + SEQ_7_HOLD;
export const SEQ_FINAL_FADEOUT_DURATION = 30; // 1s fade

// Total video duration
// The 15-frame (0.5 s) buffer ensures the final fade-to-black completes fully
// before the Remotion player fires its "ended" event, preventing any flash of
// the underlying page before the overlay has dismissed.
export const TOTAL_DURATION_FRAMES =
  SEQ_FINAL_FADEOUT_START + SEQ_FINAL_FADEOUT_DURATION + 15;

// ─── Audio timing ────────────────────────────────────────────────────────────
// The drone runs from frame 0. It builds slowly until SEQ_SILENCE_START,
// then cuts to silence. After the final line appears it stays silent.
export const DRONE_SILENCE_START = SEQ_SILENCE_START; // frame where drone cuts out
export const DRONE_BUILD_PEAK = SEQ_SILENCE_START;    // drone reaches max at this frame

// ─── Text content ────────────────────────────────────────────────────────────
// Edit these to change the script without touching animation code.
export const LINES: {
  seq1: string;
  seq2: string;
  seq3: string[];
  seq4: string;
  seq5: string;
  seq6: string;
  seq7: string;
} = {
  seq1: "one more function.",
  seq2: "one more verse.",
  seq3: ["one more sleepless night", "that no one asked for."],
  seq4: "the screen is still on.",
  seq5: "the pen hasn't dried.",
  seq6: "it's not done yet.",
  seq7: "it's never done yet.",
};
