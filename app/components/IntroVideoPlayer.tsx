"use client";

/**
 * IntroVideoPlayer.tsx
 * Client component that renders the "Terminal to Paper" intro video as a
 * full-screen overlay using @remotion/player.
 *
 * Behaviour:
 * - Plays automatically on first visit (no localStorage flag set)
 * - On return visits, the overlay is skipped entirely
 * - Skip via: click "SKIP" button | Escape key | Space key
 * - When video ends or is skipped → fades out overlay → GSAP landing page begins
 *
 * Integration note: This component should be rendered ABOVE the main landing
 * page content. It uses position: fixed + z-index: 9999 so it sits on top
 * of everything without modifying the landing page.
 */

import React, { useEffect, useRef, useState, useCallback, startTransition } from "react";
import { Player, PlayerRef } from "@remotion/player";
import { TerminalToPaper } from "../../remotion/TerminalToPaper";
import { FPS, TOTAL_FRAMES, COMPOSITION_WIDTH, COMPOSITION_HEIGHT } from "../../remotion/constants";

// localStorage key — bump the suffix to force re-play after a redesign
const STORAGE_KEY = "intro-v2-watched";

// Duration (ms) of the overlay fade-out — must match the CSS transition below
const FADE_OUT_DURATION_MS = 800;

export const IntroVideoPlayer: React.FC = () => {
  const [show, setShow] = useState(false);
  const [fading, setFading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerRef>(null);
  const hasCompleted = useRef(false);

  // Check localStorage on mount — only run client-side
  useEffect(() => {
    try {
      const watched = localStorage.getItem(STORAGE_KEY);
      if (!watched) {
        // Use startTransition to avoid synchronous setState in effect body
        startTransition(() => setShow(true));
      }
    } catch {
      // localStorage unavailable (private browsing edge case) — skip intro
    }
  }, []);

  /** Fade out the overlay then unmount it */
  const dismiss = useCallback(() => {
    if (hasCompleted.current) return;
    hasCompleted.current = true;

    setFading(true);

    // After the CSS transition completes, hide the overlay entirely
    setTimeout(() => {
      setShow(false);
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // Ignore storage errors
      }
    }, FADE_OUT_DURATION_MS); // matches the CSS transition duration below
  }, []);

  // Listen for video end via the Player ref event emitter
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    player.addEventListener("ended", dismiss);
    return () => {
      player.removeEventListener("ended", dismiss);
    };
  }, [dismiss, show]);

  // Keyboard skip: Escape or Space
  useEffect(() => {
    if (!show) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " ") {
        e.preventDefault();
        dismiss();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [show, dismiss]);

  // Don't render anything if the intro shouldn't show
  if (!show) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#000",
        opacity: fading ? 0 : 1,
        transition: `opacity ${FADE_OUT_DURATION_MS / 1000}s ease`,
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      {/* ── Remotion Player ───────────────────────────────────────────────── */}
      <Player
        ref={playerRef}
        component={TerminalToPaper}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        compositionWidth={COMPOSITION_WIDTH}
        compositionHeight={COMPOSITION_HEIGHT}
        autoPlay
        loop={false}
        controls={false}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />

      {/* ── SKIP button ───────────────────────────────────────────────────── */}
      {/* Styled to match portfolio's existing mono label aesthetic */}
      <button
        onClick={dismiss}
        aria-label="Skip intro"
        style={{
          position: "absolute",
          bottom: "32px",
          right: "32px",
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "rgba(255,255,255,0.5)",
          fontFamily: "var(--font-mono), IBM Plex Mono, monospace",
          fontSize: "10px",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          padding: "8px 16px",
          cursor: "pointer",
          lineHeight: 1,
          // Subtle hover effect without modifying existing styles
          transition: "color 0.2s, border-color 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.85)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.55)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.3)";
        }}
      >
        skip
      </button>
    </div>
  );
};

export default IntroVideoPlayer;
