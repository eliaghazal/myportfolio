"use client";

/**
 * IntroVideoPlayer — Full-screen Remotion video overlay for the homepage.
 *
 * Plays the cinematic intro once. When complete or skipped:
 *  - Fades out the overlay
 *  - Sets a localStorage flag so it never plays again on return visits
 *  - Calls onComplete() to let the parent begin the GSAP intro sequence
 *
 * Keyboard shortcuts: Escape or Space to skip.
 * The video is muted by default (browsers block autoplay with sound).
 * A speaker icon lets the user unmute.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Player, PlayerRef } from "@remotion/player";
import { IntroVideo } from "../../remotion/IntroVideo";
import { FPS, TOTAL_DURATION_FRAMES, VIDEO_WIDTH, VIDEO_HEIGHT } from "../../remotion/constants";

const STORAGE_KEY = "intro_video_seen";

interface IntroVideoPlayerProps {
  /** Called when the video ends or is skipped — triggers the GSAP intro */
  onComplete: () => void;
}

export default function IntroVideoPlayer({ onComplete }: IntroVideoPlayerProps) {
  const playerRef = useRef<PlayerRef>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const [visible, setVisible] = useState(true);
  const completedRef = useRef(false);

  // ── Dismiss: fade out the overlay, then call onComplete ─────────────────
  const dismiss = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;

    // Mark as seen in localStorage so it never plays again
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // localStorage may be unavailable in some contexts — fail silently
    }

    // Fade out the overlay
    const overlay = overlayRef.current;
    if (overlay) {
      overlay.style.transition = "opacity 0.6s ease";
      overlay.style.opacity = "0";
      setTimeout(() => {
        setVisible(false);
        onComplete();
      }, 650);
    } else {
      setVisible(false);
      onComplete();
    }
  }, [onComplete]);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " ") {
        e.preventDefault();
        dismiss();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dismiss]);

  // ── Auto-play on mount + subscribe to "ended" event via PlayerRef ───────
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    player.play();

    const handleEnded = () => dismiss();
    player.addEventListener("ended", handleEnded);
    return () => player.removeEventListener("ended", handleEnded);
  }, [dismiss]);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* ── Remotion Player ─────────────────────────────────────────────── */}
      <Player
        ref={playerRef}
        component={IntroVideo}
        durationInFrames={TOTAL_DURATION_FRAMES}
        fps={FPS}
        compositionWidth={VIDEO_WIDTH}
        compositionHeight={VIDEO_HEIGHT}
        style={{
          width: "100%",
          height: "100%",
        }}
        controls={false}
        loop={false}
        // Muted by default — browsers block autoplay with sound
        initiallyMuted={true}
        // Autoplay is triggered via playerRef.play() in useEffect above
        autoPlay={false}
        // Disable built-in keyboard/click controls
        clickToPlay={false}
        spaceKeyToPlayOrPause={false}
      />

      {/* ── SKIP button ──────────────────────────────────────────────────── */}
      {/* Matches the style of the existing GSAP intro skip button exactly */}
      <button
        onClick={dismiss}
        style={{
          position: "fixed",
          bottom: 28,
          right: 32,
          zIndex: 201,
          background: "none",
          border: "none",
          padding: 0,
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.25em",
          color: "rgba(255,255,255,0.5)",
          cursor: "pointer",
          userSelect: "none",
          textTransform: "uppercase",
          outline: "none",
          // Subtle fade-in so it's not distracting from the first 3 seconds
          animation: "introSkipFadeIn 1.2s ease forwards",
        }}
        aria-label="Skip intro"
      >
        SKIP
      </button>

      {/* ── Mute/unmute toggle ───────────────────────────────────────────── */}
      <button
        onClick={() => {
          const player = playerRef.current;
          if (!player) return;
          if (muted) {
            player.unmute();
          } else {
            player.mute();
          }
          setMuted((m) => !m);
        }}
        style={{
          position: "fixed",
          bottom: 28,
          left: 32,
          zIndex: 201,
          background: "none",
          border: "none",
          padding: 0,
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.25em",
          color: "rgba(255,255,255,0.35)",
          cursor: "pointer",
          userSelect: "none",
          textTransform: "uppercase",
          outline: "none",
          animation: "introSkipFadeIn 1.2s ease forwards",
        }}
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? "♪ UNMUTE" : "♪ MUTE"}
      </button>

      {/* ── Keyframe for the skip/mute buttons ──────────────────────────── */}
      <style>{`
        @keyframes introSkipFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
