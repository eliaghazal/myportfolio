"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

/* ─── Palette ─── */
const bg       = "#0a0908";
const bgLight  = "#141210";
const paper    = "#f4f1ec";
const rust     = "#b85c38";
const rustDim  = "rgba(184,92,56,0.5)";
const dim      = "rgba(244,241,236,0.35)";

type AspectRatio = "original" | "1:1" | "16:9" | "3:4" | "21:9";

interface GalleryItem {
  id: string;
  type: "image" | "video" | "quote";
  text?: string;
  poem?: string;
  imageUrl?: string;
  image_url?: string;
  video_url?: string;
  thumbnail_url?: string;
  caption?: string;
  rotation?: number;
  aspect_ratio?: AspectRatio;
}

/* ─── Film Grain SVG (data URI) ─── */
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

/* ─── Light Leak gradients for polaroid effect ─── */
const LIGHT_LEAKS = [
  "linear-gradient(135deg, rgba(255,120,50,0.18) 0%, transparent 50%, rgba(120,80,200,0.08) 100%)",
  "linear-gradient(225deg, rgba(255,200,100,0.15) 0%, transparent 40%, rgba(200,50,80,0.1) 100%)",
  "linear-gradient(45deg, rgba(100,200,255,0.1) 0%, transparent 50%, rgba(255,150,50,0.15) 100%)",
  "linear-gradient(315deg, rgba(255,80,120,0.12) 0%, transparent 45%, rgba(80,200,150,0.08) 100%)",
  "linear-gradient(180deg, rgba(255,220,150,0.2) 0%, transparent 40%, rgba(50,50,150,0.1) 100%)",
  "linear-gradient(0deg, rgba(200,100,50,0.15) 0%, transparent 50%, rgba(100,180,255,0.1) 100%)",
];

/* ─── Masonry grid layout templates (varying cell sizes) ─── */
const GRID_PATTERNS = [
  { col: "span 2", row: "span 2" },  // large
  { col: "span 1", row: "span 2" },  // tall
  { col: "span 1", row: "span 1" },  // small
  { col: "span 2", row: "span 1" },  // wide
  { col: "span 1", row: "span 1" },  // small
  { col: "span 1", row: "span 2" },  // tall
  { col: "span 2", row: "span 2" },  // large
  { col: "span 1", row: "span 1" },  // small
  { col: "span 1", row: "span 1" },  // small
  { col: "span 2", row: "span 1" },  // wide
  { col: "span 1", row: "span 2" },  // tall
  { col: "span 1", row: "span 1" },  // small
];

/* ─── Polaroid overlay (full-screen lightbox) ─── */
function PolaroidOverlay({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  const visRef = useRef<HTMLDivElement>(null);
  const mediaUrl = item.type === "video" ? item.video_url : (item.imageUrl || item.image_url);

  useEffect(() => {
    const el = visRef.current;
    if (el) { el.style.opacity = "0"; el.style.transform = "scale(0.92) rotate(-2deg)"; requestAnimationFrame(() => { if (el) { el.style.opacity = "1"; el.style.transform = "scale(1) rotate(-1.5deg)"; } }); }
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn); return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(5,4,3,0.95)", backdropFilter: "blur(24px)",
      transition: "opacity 0.4s ease", padding: "clamp(16px,4vw,40px)",
    }}>
      <div ref={visRef} onClick={e => e.stopPropagation()} style={{
        background: "#faf8f4",
        padding: "clamp(10px,1.5vw,18px) clamp(10px,1.5vw,18px) clamp(32px,4vw,50px)",
        boxShadow: "0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03)",
        transform: "rotate(-1.5deg)",
        transition: "opacity 0.6s cubic-bezier(0.34,1.56,0.64,1), transform 0.6s cubic-bezier(0.34,1.56,0.64,1)",
        maxWidth: "min(92vw, 640px)", width: "100%", position: "relative",
      }}>
        {/* Polaroid texture */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.03, backgroundImage: GRAIN_SVG, backgroundSize: "120px", zIndex: 5 }} />

        <button onClick={onClose} style={{
          position: "absolute", top: 8, right: 10, background: "none", border: "none",
          cursor: "pointer", fontSize: 20, color: "rgba(28,24,20,0.3)", lineHeight: 1, padding: 6, zIndex: 10,
        }}>×</button>

        {item.type === "video" && item.video_url ? (
          <div style={{ width: "100%", overflow: "hidden", background: "#1a1714", position: "relative" }}>
            <video src={item.video_url} controls autoPlay playsInline style={{ width: "100%", height: "auto", maxHeight: "60vh", objectFit: "contain", display: "block" }} />
          </div>
        ) : mediaUrl ? (
          <div style={{ width: "100%", overflow: "hidden", background: "#e8e4de", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mediaUrl} alt={item.caption || ""} style={{ width: "100%", height: "auto", maxHeight: "60vh", objectFit: "contain", display: "block" }} />
            {/* Light leak on polaroid */}
            <div style={{ position: "absolute", inset: 0, background: LIGHT_LEAKS[0], pointerEvents: "none", mixBlendMode: "overlay" }} />
          </div>
        ) : (
          <div style={{ minHeight: 200, background: "rgba(28,24,20,0.04)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, border: "1px solid rgba(28,24,20,0.1)" }}>
            <p style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontWeight: 500, fontSize: "clamp(16px,2vw,24px)", lineHeight: 1.65, color: "#1c1814", textAlign: "center" }}>"{item.text}"</p>
          </div>
        )}

        <div style={{ marginTop: 14, position: "relative", zIndex: 2 }}>
          {item.caption && <div style={{ fontFamily: "var(--font-space)", fontWeight: 600, fontSize: 13, color: "#1c1814", marginBottom: 4 }}>{item.caption}</div>}
          {item.poem && <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(184,92,56,0.65)", letterSpacing: "0.18em" }}>— {item.poem}</div>}
        </div>
      </div>
    </div>
  );
}

/* ─── Media Cell (image or video with polaroid effects) ─── */
function MediaCell({
  item,
  lightLeakIndex,
  onClick,
}: {
  item: GalleryItem;
  lightLeakIndex: number;
  onClick: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);
  const mediaUrl = item.type === "video"
    ? (item.thumbnail_url || item.image_url || item.video_url)
    : (item.imageUrl || item.image_url);
  const isVideo = item.type === "video" && item.video_url;

  useEffect(() => {
    if (isVideo && videoRef.current) {
      if (hovered) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [hovered, isVideo]);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        transform: hovered ? "scale(1.015)" : "scale(1)",
        transition: "transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.5s ease",
        boxShadow: hovered ? "0 20px 60px rgba(0,0,0,0.6)" : "none",
        zIndex: hovered ? 10 : 1,
      }}
    >
      {/* Main media */}
      {isVideo && hovered ? (
        <video
          ref={videoRef}
          src={item.video_url}
          muted
          playsInline
          loop
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : mediaUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaUrl}
          alt={item.caption || ""}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : null}

      {/* Film grain overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: GRAIN_SVG, backgroundSize: "140px",
        opacity: 0.06, mixBlendMode: "overlay",
      }} />

      {/* Light leak / color tint overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: LIGHT_LEAKS[lightLeakIndex % LIGHT_LEAKS.length],
        mixBlendMode: "screen",
        opacity: hovered ? 0.7 : 0.45,
        transition: "opacity 0.5s ease",
      }} />

      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.35) 100%)",
      }} />

      {/* Video play icon */}
      {isVideo && !hovered && (
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 48, height: 48, borderRadius: "50%",
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1.5px solid rgba(255,255,255,0.2)",
        }}>
          <div style={{ width: 0, height: 0, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderLeft: "14px solid rgba(255,255,255,0.85)", marginLeft: 3 }} />
        </div>
      )}

      {/* Bottom gradient + caption */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
        padding: "48px 14px 12px",
        opacity: hovered ? 1 : 0,
        transform: hovered ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}>
        {item.caption && (
          <div style={{
            fontFamily: "var(--font-space)", fontWeight: 600, fontSize: 12,
            color: "rgba(244,241,236,0.95)", letterSpacing: "-0.01em", marginBottom: 3,
          }}>{item.caption}</div>
        )}
        {item.poem && (
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.2em",
            color: "rgba(184,92,56,0.85)",
          }}>— {item.poem}</div>
        )}
      </div>
    </div>
  );
}

/* ─── Quote Cell ─── */
function QuoteCell({ item, onClick }: { item: GalleryItem; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        background: bgLight,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "clamp(20px,3vw,40px)",
        transform: hovered ? "scale(1.01)" : "scale(1)",
        transition: "transform 0.5s ease, background 0.5s ease",
        border: `1px solid rgba(184,92,56,${hovered ? 0.25 : 0.08})`,
      }}
    >
      {/* Grain */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: GRAIN_SVG, backgroundSize: "140px", opacity: 0.04 }} />

      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "0.35em",
        color: rustDim, textTransform: "uppercase", marginBottom: 16,
      }}>verse</div>
      <p style={{
        fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontWeight: 500,
        fontSize: "clamp(15px,1.8vw,22px)", lineHeight: 1.55,
        color: paper, textAlign: "center", maxWidth: 320,
        opacity: hovered ? 1 : 0.85, transition: "opacity 0.4s ease",
      }}>
        &ldquo;{item.text}&rdquo;
      </p>
      {item.poem && (
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.22em",
          color: rustDim, marginTop: 16,
        }}>— {item.poem}</div>
      )}
    </div>
  );
}

/* ─── Draggable Canvas Section (rodeo.film style) ─── */
function DragCanvas({ items, onOpenItem }: { items: GalleryItem[]; onOpenItem: (item: GalleryItem) => void }) {
  const canvasRef  = useRef<HTMLDivElement>(null);
  const posRef     = useRef({ x: 0, y: 0 });
  const velRef     = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart  = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const lastMouse  = useRef({ x: 0, y: 0, t: 0 });
  const animRef    = useRef<number>(0);
  const clickGuard = useRef(false);

  const mediaItems = items.filter(it => (it.type === "image" || it.type === "video") && (it.imageUrl || it.image_url || it.video_url));
  const quoteItems = items.filter(it => it.type === "quote" && it.text);

  interface ScatteredCard {
    id: string;
    item: GalleryItem;
    x: number; y: number;
    rotation: number;
    width: number;
    zBase: number;
  }

  const cards = useRef<ScatteredCard[]>([]);

  useEffect(() => {
    const all = [...mediaItems, ...quoteItems];
    cards.current = all.map((item, i) => {
      const seed1 = (i * 7919 + 3) % 1000 / 1000;
      const seed2 = (i * 3571 + 11) % 1000 / 1000;
      const seed3 = (i * 1231 + 7) % 1000 / 1000;
      const widths = [260, 320, 240, 300, 280, 340, 220, 360];
      return {
        id: item.id,
        item,
        x: seed1 * 3600 - 900,
        y: seed2 * 2600 - 600,
        rotation: seed3 * 16 - 8,
        width: widths[i % widths.length],
        zBase: i,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  useEffect(() => {
    const animate = () => {
      if (!isDragging.current) {
        velRef.current.x *= 0.93;
        velRef.current.y *= 0.93;
        posRef.current.x += velRef.current.x;
        posRef.current.y += velRef.current.y;
        if (canvasRef.current) {
          canvasRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
        }
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-card]")) return;
    isDragging.current = true;
    clickGuard.current = false;
    dragStart.current = { mx: e.clientX, my: e.clientY, px: posRef.current.x, py: posRef.current.y };
    lastMouse.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) clickGuard.current = true;
    const now = performance.now();
    const dt = Math.max(now - lastMouse.current.t, 1);
    velRef.current.x = (e.clientX - lastMouse.current.x) / dt * 16;
    velRef.current.y = (e.clientY - lastMouse.current.y) / dt * 16;
    lastMouse.current = { x: e.clientX, y: e.clientY, t: now };
    posRef.current.x = dragStart.current.px + dx;
    posRef.current.y = dragStart.current.py + dy;
    if (canvasRef.current) canvasRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
  }, []);

  const onPointerUp = useCallback(() => { isDragging.current = false; }, []);

  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div
      style={{
        position: "relative", width: "100%", height: "100vh",
        background: bg, overflow: "hidden",
        cursor: "grab", userSelect: "none", touchAction: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Grain */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none", opacity: 0.04,
        backgroundImage: GRAIN_SVG, backgroundSize: "180px",
        animation: "grainShift 0.12s steps(1) infinite",
      }} />
      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 9, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 35%, rgba(5,4,3,0.8) 100%)",
      }} />
      {/* Hint */}
      <div style={{
        position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)",
        zIndex: 20, pointerEvents: "none",
        fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.4em",
        color: "rgba(244,241,236,0.2)", textTransform: "uppercase",
        animation: "hintFade 3s ease-in-out infinite",
      }}>
        touch and move
      </div>
      {/* Canvas */}
      <div ref={canvasRef} style={{ position: "absolute", top: "50%", left: "50%", willChange: "transform" }}>
        {cards.current.map((card) => {
          const isMedia = card.item.type === "image" || card.item.type === "video";
          const mediaUrl = card.item.type === "video" ? (card.item.thumbnail_url || card.item.image_url) : (card.item.imageUrl || card.item.image_url);
          return (
            <div
              key={card.id}
              data-card="true"
              style={{
                position: "absolute",
                left: card.x, top: card.y,
                width: card.width,
                zIndex: activeId === card.id ? 500 : card.zBase,
                transform: `rotate(${card.rotation}deg)`,
                transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease",
                boxShadow: isMedia ? "0 8px 48px rgba(0,0,0,0.6)" : "0 4px 28px rgba(0,0,0,0.45)",
              }}
              onMouseEnter={e => {
                setActiveId(card.id);
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "rotate(0deg) translateY(-14px) scale(1.04)";
                el.style.boxShadow = "0 32px 90px rgba(0,0,0,0.8)";
              }}
              onMouseLeave={e => {
                setActiveId(null);
                const el = e.currentTarget as HTMLElement;
                el.style.transform = `rotate(${card.rotation}deg)`;
                el.style.boxShadow = isMedia ? "0 8px 48px rgba(0,0,0,0.6)" : "0 4px 28px rgba(0,0,0,0.45)";
              }}
              onClick={() => {
                if (clickGuard.current) return;
                onOpenItem(card.item);
              }}
            >
              {isMedia && mediaUrl ? (
                <div style={{ background: "#f5f2ed", padding: "10px 10px 44px", cursor: "pointer", position: "relative" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaUrl} alt={card.item.caption || ""} draggable={false} style={{ width: "100%", display: "block", objectFit: "cover", aspectRatio: "4/3" }} />
                  {/* Light leak */}
                  <div style={{ position: "absolute", top: 10, left: 10, right: 10, bottom: 44, background: LIGHT_LEAKS[(card.zBase) % LIGHT_LEAKS.length], mixBlendMode: "screen", opacity: 0.3, pointerEvents: "none" }} />
                  {/* Grain on photo */}
                  <div style={{ position: "absolute", top: 10, left: 10, right: 10, bottom: 44, backgroundImage: GRAIN_SVG, backgroundSize: "100px", opacity: 0.06, pointerEvents: "none" }} />
                  {card.item.type === "video" && (
                    <div style={{ position: "absolute", top: 20, right: 20, background: "rgba(0,0,0,0.6)", padding: "2px 8px", fontFamily: "var(--font-mono)", fontSize: 7, color: "#fff", letterSpacing: "0.2em" }}>VIDEO</div>
                  )}
                  <div style={{ marginTop: 8, paddingLeft: 2 }}>
                    {card.item.caption && <div style={{ fontFamily: "var(--font-space)", fontWeight: 700, fontSize: 10, color: "#1c1814", letterSpacing: "-0.01em", lineHeight: 1.3 }}>{card.item.caption}</div>}
                    {card.item.poem && <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "0.18em", color: "rgba(184,92,56,0.6)", marginTop: 3 }}>— {card.item.poem}</div>}
                  </div>
                </div>
              ) : card.item.type === "quote" ? (
                <div style={{ background: "#110f0d", border: "1px solid rgba(184,92,56,0.12)", padding: "clamp(20px,3vw,28px) clamp(16px,2.5vw,24px)", cursor: "pointer" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "0.3em", color: rustDim, textTransform: "uppercase", marginBottom: 12 }}>verse</div>
                  <div style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontWeight: 500, fontSize: "clamp(14px,1.4vw,18px)", color: paper, lineHeight: 1.45, marginBottom: 14 }}>&ldquo;{card.item.text}&rdquo;</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "0.22em", color: rustDim }}>— {card.item.poem}</div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Page ─── */
export default function GalleryPage() {
  const [items, setItems]             = useState<GalleryItem[]>([]);
  const [overlayItem, setOverlayItem] = useState<GalleryItem | null>(null);
  const [scrolled, setScrolled]       = useState(false);
  const closeOverlay                  = useCallback(() => setOverlayItem(null), []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    fetch("/api/gallery")
      .then(r => r.ok ? r.json() : [])
      .then((data: GalleryItem[]) => {
        setItems(data.map(item => ({
          ...item,
          imageUrl: item.image_url ?? item.imageUrl,
        })));
      })
      .catch(() => {});
  }, []);

  const mediaItems = items.filter(it => (it.type === "image" || it.type === "video") && (it.imageUrl || it.image_url || it.video_url));
  const quoteItems = items.filter(it => it.type === "quote" && it.text);

  // Interleave quotes into media grid
  const gridItems: GalleryItem[] = [];
  let qIdx = 0;
  mediaItems.forEach((item, i) => {
    gridItems.push(item);
    if ((i + 1) % 4 === 0 && qIdx < quoteItems.length) {
      gridItems.push(quoteItems[qIdx++]);
    }
  });
  while (qIdx < quoteItems.length) {
    gridItems.push(quoteItems[qIdx++]);
  }

  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  return (
    <div style={{ background: bg, color: paper, minHeight: "100vh", fontFamily: "var(--font-space)", overflowX: "hidden" }}>
      <style>{`
        @keyframes grainShift {
          0%{transform:translate(0,0)} 10%{transform:translate(-2%,-2%)} 20%{transform:translate(2%,1%)}
          30%{transform:translate(-1%,2%)} 40%{transform:translate(3%,-1%)} 50%{transform:translate(-2%,3%)}
          60%{transform:translate(1%,-3%)} 70%{transform:translate(-3%,1%)} 80%{transform:translate(2%,2%)}
          90%{transform:translate(-1%,-1%)} 100%{transform:translate(0,0)}
        }
        @keyframes hintFade { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media(prefers-reduced-motion:reduce){*{animation-duration:0.01ms!important;transition-duration:0.01ms!important}}
        .gal-link:hover{color:${rust}!important}
        .gal-cell { animation: fadeUp 0.6s ease both; }
      `}</style>

      {overlayItem && <PolaroidOverlay item={overlayItem} onClose={closeOverlay} />}

      {/* ─── Nav ─── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 clamp(16px,4vw,48px)", height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(10,9,8,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(244,241,236,0.06)" : "none",
        transition: "background 0.35s, border 0.35s",
      }}>
        <Link href="/poet" className="gal-link" style={{ ...mono, fontSize: 10, letterSpacing: "0.2em", color: dim, textDecoration: "none", transition: "color 0.2s" }}>← POET</Link>
        <span style={{ ...mono, fontSize: 9, letterSpacing: "0.3em", color: rustDim }}>GALLERY</span>
      </nav>

      {/* ─── Hero / Title ─── */}
      <div style={{
        position: "relative", paddingTop: 100, paddingBottom: 32,
        paddingLeft: "clamp(16px,5vw,80px)", paddingRight: "clamp(16px,5vw,80px)",
      }}>
        {/* Ambient grain */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.035,
          backgroundImage: GRAIN_SVG, backgroundSize: "180px",
          animation: "grainShift 0.12s steps(1) infinite",
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ ...mono, fontSize: 9, letterSpacing: "0.35em", color: rustDim, marginBottom: 14, textTransform: "uppercase" }}>gallery</div>
          <h1 style={{ fontWeight: 700, fontSize: "clamp(40px,9vw,110px)", letterSpacing: "-0.04em", lineHeight: 0.92, color: paper, marginBottom: 14 }}>
            Visual<br />Fragments
          </h1>
          <p style={{ ...mono, fontSize: 9, letterSpacing: "0.18em", color: dim, maxWidth: 380 }}>
            Images, verses, and atmosphere from the world of Whispers of the Eclipse.
          </p>
        </div>
      </div>

      {/* ─── Dense Masonry Grid (rodeo.film inspired) ─── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gridAutoRows: "clamp(140px, 18vw, 240px)",
        gap: 3,
        padding: "0 3px",
        position: "relative",
      }}>
        {/* Overall grain layer */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 15, opacity: 0.03,
          backgroundImage: GRAIN_SVG, backgroundSize: "200px",
          animation: "grainShift 0.12s steps(1) infinite",
        }} />

        {gridItems.map((item, i) => {
          const pattern = GRID_PATTERNS[i % GRID_PATTERNS.length];
          return (
            <div
              key={item.id}
              className="gal-cell"
              style={{
                gridColumn: pattern.col,
                gridRow: pattern.row,
                animationDelay: `${i * 60}ms`,
                position: "relative",
              }}
            >
              {item.type === "quote" ? (
                <QuoteCell item={item} onClick={() => setOverlayItem(item)} />
              ) : (
                <MediaCell
                  item={item}
                  lightLeakIndex={i}
                  onClick={() => setOverlayItem(item)}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Drag Canvas Section ─── */}
      {items.length > 0 && (
        <>
          <div style={{
            padding: "clamp(32px,5vw,56px) clamp(16px,5vw,80px) 0",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ ...mono, fontSize: 9, letterSpacing: "0.3em", color: rustDim, textTransform: "uppercase" }}>
              — Scattered Fragments
            </div>
            <div style={{ ...mono, fontSize: 8, letterSpacing: "0.25em", color: "rgba(244,241,236,0.15)", textTransform: "uppercase" }}>
              {items.length} pieces
            </div>
          </div>
          <DragCanvas items={items} onOpenItem={setOverlayItem} />
        </>
      )}

      {/* ─── Footer ─── */}
      <div style={{
        padding: "24px clamp(16px,5vw,80px)",
        borderTop: "1px solid rgba(244,241,236,0.06)",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
      }}>
        <span style={{ ...mono, fontSize: 9, letterSpacing: "0.18em", color: "rgba(244,241,236,0.12)" }}>ELIA GHAZAL — GALLERY</span>
        <Link href="/poet" className="gal-link" style={{ ...mono, fontSize: 9, letterSpacing: "0.15em", color: "rgba(244,241,236,0.12)", textDecoration: "none", transition: "color 0.2s" }}>Back to Poet</Link>
      </div>
    </div>
  );
}
