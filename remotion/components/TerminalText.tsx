/**
 * TerminalText.tsx
 * Renders terminal text lines with a typewriter effect.
 * Used in Scene 1 to type out the three code lines character by character.
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import {
  TYPEWRITER_FRAMES_PER_CHAR,
  LINE1_TYPE_START,
  LINE2_TYPE_START,
  LINE3_TYPE_START,
  CURSOR_BLINK_START,
  CURSOR_BLINK_PERIOD,
  TERMINAL_LINES,
  COLOR_TERMINAL_GREEN,
  COLOR_TERMINAL_GREEN_OPACITY,
  TERMINAL_FONT_SIZE,
  FONT_MONO,
  TEXT_BLOCK_LEFT,
  TEXT_LINE_HEIGHT,
} from "../constants";

/** Returns how many characters of a line should be visible at the given frame */
function getVisibleChars(frame: number, lineStart: number, lineLength: number) {
  if (frame < lineStart) return 0;
  const elapsed = frame - lineStart;
  return Math.min(lineLength, Math.floor(elapsed / TYPEWRITER_FRAMES_PER_CHAR));
}

/** Blinking cursor: returns true when cursor should be visible */
function isCursorVisible(frame: number, blinkStart: number): boolean {
  if (frame < blinkStart) return true; // Steady cursor while typing
  const elapsed = frame - blinkStart;
  return Math.floor(elapsed / CURSOR_BLINK_PERIOD) % 2 === 0;
}

const lineStarts = [LINE1_TYPE_START, LINE2_TYPE_START, LINE3_TYPE_START];

export const TerminalText: React.FC = () => {
  const frame = useCurrentFrame();

  // Inline style constants
  const baseTextStyle: React.CSSProperties = {
    fontFamily: FONT_MONO,
    fontSize: `${TERMINAL_FONT_SIZE}px`,
    color: COLOR_TERMINAL_GREEN,
    opacity: COLOR_TERMINAL_GREEN_OPACITY,
    lineHeight: "1.5",
    whiteSpace: "pre",
    letterSpacing: "0.04em",
    position: "relative",
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: TEXT_BLOCK_LEFT,
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: `${TEXT_LINE_HEIGHT - TERMINAL_FONT_SIZE * 1.5}px`,
      }}
    >
      {TERMINAL_LINES.map((line, idx) => {
        const start = lineStarts[idx];
        const visible = getVisibleChars(frame, start, line.length);

        // Show this line only once its start frame has been reached
        if (frame < start) return null;

        const displayText = line.slice(0, visible);
        const isLastLine = idx === TERMINAL_LINES.length - 1;
        const lineComplete = visible >= line.length;

        // Show cursor after this line while it's typing, or after last line during blink
        const showCursor =
          (!lineComplete) ||
          (isLastLine && isCursorVisible(frame, CURSOR_BLINK_START));

        return (
          <div key={idx} style={baseTextStyle}>
            {displayText}
            {showCursor && (
              <span
                style={{
                  display: "inline-block",
                  width: "0.6em",
                  height: "1em",
                  background: COLOR_TERMINAL_GREEN,
                  opacity: 0.7,
                  verticalAlign: "text-bottom",
                  marginLeft: "1px",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TerminalText;
