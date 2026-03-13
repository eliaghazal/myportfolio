"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

/* ─── Types ─── */
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
  aspect_ratio?: string;
}

/* ─── Film effect configs — each image gets a unique combination ─── */
const FILM_EFFECTS = [
  { // Warm light leak from top-left, slight amber cast
    leak: "radial-gradient(ellipse at 5% 0%, rgba(255,140,50,0.35) 0%, transparent 55%)",
    cast: "linear-gradient(160deg, rgba(255,180,80,0.08) 0%, transparent 40%)",
    tint: "sepia(0.12) saturate(1.15) brightness(1.02) contrast(1.05)",
    hue: 0,
  },
  { // Red bleed from right edge — classic light leak
    leak: "radial-gradient(ellipse at 100% 50%, rgba(255,40,20,0.3) 0%, transparent 50%)",
    cast: "linear-gradient(270deg, rgba(220,50,30,0.1) 0%, transparent 35%)",
    tint: "sepia(0.08) saturate(1.2) brightness(1.0) contrast(1.06)",
    hue: -5,
  },
  { // Golden bloom from bottom — expired film warmth
    leak: "radial-gradient(ellipse at 50% 100%, rgba(255,200,100,0.3) 0%, transparent 55%)",
    cast: "linear-gradient(0deg, rgba(200,150,50,0.1) 0%, transparent 45%)",
    tint: "sepia(0.15) saturate(1.1) brightness(1.04) contrast(1.03)",
    hue: 5,
  },
  { // Cool-to-warm diagonal — cross-process look
    leak: "radial-gradient(ellipse at 0% 100%, rgba(80,120,255,0.2) 0%, transparent 45%), radial-gradient(ellipse at 100% 0%, rgba(255,120,50,0.25) 0%, transparent 45%)",
    cast: "linear-gradient(135deg, rgba(60,100,180,0.06) 0%, transparent 50%, rgba(255,150,80,0.06) 100%)",
    tint: "sepia(0.06) saturate(1.25) brightness(1.01) contrast(1.08)",
    hue: -3,
  },
  { // Flame effect — warm orange patches like Time-Zero film
    leak: "radial-gradient(circle at 30% 20%, rgba(255,160,60,0.3) 0%, transparent 35%), radial-gradient(circle at 70% 80%, rgba(255,100,40,0.2) 0%, transparent 30%)",
    cast: "linear-gradient(180deg, rgba(255,200,120,0.06) 0%, transparent 50%)",
    tint: "sepia(0.18) saturate(1.08) brightness(1.03) contrast(1.04)",
    hue: 8,
  },
  { // Magenta edge bleed — Impossible Project style
    leak: "radial-gradient(ellipse at 95% 90%, rgba(200,60,120,0.28) 0%, transparent 50%)",
    cast: "linear-gradient(200deg, rgba(180,60,100,0.07) 0%, transparent 40%)",
    tint: "sepia(0.1) saturate(1.18) brightness(1.02) contrast(1.05)",
    hue: -8,
  },
  { // Soft cyan + warm center — faded Polaroid 600
    leak: "radial-gradient(ellipse at 10% 10%, rgba(100,200,220,0.2) 0%, transparent 40%), radial-gradient(ellipse at 50% 50%, rgba(255,220,160,0.15) 0%, transparent 50%)",
    cast: "linear-gradient(45deg, rgba(80,160,180,0.05) 0%, transparent 50%)",
    tint: "sepia(0.14) saturate(1.05) brightness(1.05) contrast(1.02)",
    hue: 3,
  },
  { // Full-edge red leak — end-of-roll look
    leak: "linear-gradient(90deg, rgba(255,30,10,0.25) 0%, transparent 25%, transparent 75%, rgba(255,60,20,0.2) 100%)",
    cast: "linear-gradient(90deg, rgba(200,40,20,0.06) 0%, transparent 20%)",
    tint: "sepia(0.1) saturate(1.22) brightness(0.98) contrast(1.07)",
    hue: -4,
  },
];

/* ─── Masonry grid cell sizes ─── */
const CELL_PATTERNS = [
  { colSpan: 2, rowSpan: 2 }, // large
  { colSpan: 1, rowSpan: 1 }, // small
  { colSpan: 1, rowSpan: 2 }, // tall
  { colSpan: 1, rowSpan: 1 }, // small
  { colSpan: 2, rowSpan: 1 }, // wide
  { colSpan: 1, rowSpan: 1 }, // small
  { colSpan: 1, rowSpan: 1 }, // small
  { colSpan: 1, rowSpan: 2 }, // tall
  { colSpan: 2, rowSpan: 2 }, // large
  { colSpan: 1, rowSpan: 1 }, // small
  { colSpan: 1, rowSpan: 1 }, // small
  { colSpan: 2, rowSpan: 1 }, // wide
];

/* ─── Grain texture SVG ─── */
const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

/* ─── Single gallery cell ─── */
function GalleryCell({ item, effectIndex, onClick }: {
  item: GalleryItem;
  effectIndex: number;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const effect = FILM_EFFECTS[effectIndex % FILM_EFFECTS.length];
  const mediaUrl = item.type === "video"
    ? (item.thumbnail_url || item.image_url || item.imageUrl)
    : (item.imageUrl || item.image_url);
  const isVideo = item.type === "video" && item.video_url;

  useEffect(() => {
    if (isVideo && videoRef.current) {
      if (hovered) videoRef.current.play().catch(() => {});
      else { videoRef.current.pause(); videoRef.current.currentTime = 0; }
    }
  }, [hovered, isVideo]);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", overflow: "hidden", cursor: "pointer",
        width: "100%", height: "100%",
      }}
    >
      {/* Main media layer */}
      {isVideo && hovered ? (
        <video ref={videoRef} src={item.video_url} muted playsInline loop
          style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
            filter: effect.tint + ` hue-rotate(${effect.hue}deg)`,
            transform: hovered ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}
        />
      ) : mediaUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={mediaUrl} alt={item.caption || ""} loading="lazy" draggable={false}
          style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
            filter: effect.tint + ` hue-rotate(${effect.hue}deg)`,
            transform: hovered ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}
        />
      ) : null}

      {/* Light leak overlay — the key polaroid effect */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: effect.leak,
        mixBlendMode: "screen",
        opacity: hovered ? 0.9 : 0.7,
        transition: "opacity 0.5s ease",
      }} />

      {/* Color cast — subtle overall tint */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: effect.cast,
        mixBlendMode: "overlay",
      }} />

      {/* Vignette — darker corners like real lens falloff */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.45) 100%)",
      }} />

      {/* Film grain — per image */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: GRAIN, backgroundSize: "150px",
        opacity: 0.06, mixBlendMode: "overlay",
      }} />

      {/* Soft bloom — slight highlight glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, rgba(255,250,240,0.06) 0%, transparent 70%)",
        mixBlendMode: "soft-light",
      }} />

      {/* Video indicator */}
      {isVideo && !hovered && (
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 44, height: 44, borderRadius: "50%",
          background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid rgba(255,255,255,0.15)",
        }}>
          <div style={{ width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderLeft: "12px solid rgba(255,255,255,0.85)", marginLeft: 2 }} />
        </div>
      )}

      {/* Caption on hover */}
      {(item.caption || item.poem) && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
          padding: "36px 14px 12px",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.35s ease, transform 0.35s ease",
          pointerEvents: "none",
        }}>
          {item.caption && <div style={{ fontFamily: "var(--font-space)", fontWeight: 600, fontSize: 11, color: "rgba(244,241,236,0.95)", marginBottom: 2 }}>{item.caption}</div>}
          {item.poem && <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.18em", color: "rgba(184,92,56,0.85)" }}>— {item.poem}</div>}
        </div>
      )}
    </div>
  );
}

/* ─── Quote cell ─── */
function QuoteCell({ item, onClick }: { item: GalleryItem; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", overflow: "hidden", cursor: "pointer",
        width: "100%", height: "100%",
        background: hovered ? "#151210" : "#111010",
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        padding: "clamp(16px,2.5vw,32px)",
        border: `1px solid rgba(184,92,56,${hovered ? 0.2 : 0.06})`,
        transition: "background 0.4s ease, border-color 0.4s ease",
      }}
    >
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "0.35em", color: "rgba(184,92,56,0.35)", textTransform: "uppercase", marginBottom: 14 }}>verse</div>
      <p style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontWeight: 500, fontSize: "clamp(14px,1.6vw,20px)", lineHeight: 1.55, color: "#f4f1ec", textAlign: "center", maxWidth: 280 }}>
        &ldquo;{item.text}&rdquo;
      </p>
      {item.poem && <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.2em", color: "rgba(184,92,56,0.4)", marginTop: 14 }}>— {item.poem}</div>}
    </div>
  );
}

/* ─── Lightbox ─── */
function Lightbox({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setVis(true));
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const mediaUrl = item.type === "video" ? item.video_url : (item.imageUrl || item.image_url);
  const effect = FILM_EFFECTS[parseInt(item.id, 36) % FILM_EFFECTS.length];

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "rgba(5,4,3,0.96)", backdropFilter: "blur(24px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity: vis ? 1 : 0, transition: "opacity 0.4s ease",
      padding: "clamp(16px,4vw,48px)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        maxWidth: "min(92vw, 720px)", maxHeight: "85vh", position: "relative",
        transform: vis ? "scale(1)" : "scale(0.94)",
        opacity: vis ? 1 : 0,
        transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s, opacity 0.5s ease 0.1s",
      }}>
        {/* Polaroid frame */}
        <div style={{
          background: "#faf8f4", padding: "clamp(8px,1.2vw,14px) clamp(8px,1.2vw,14px) clamp(28px,4vw,48px)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.02)",
          transform: "rotate(-1deg)",
        }}>
          <div style={{ position: "relative", overflow: "hidden", background: "#e8e4dc" }}>
            {item.type === "video" && item.video_url ? (
              <video src={item.video_url} controls autoPlay playsInline style={{ width: "100%", maxHeight: "60vh", objectFit: "contain", display: "block" }} />
            ) : mediaUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mediaUrl} alt={item.caption || ""} style={{ width: "100%", maxHeight: "60vh", objectFit: "contain", display: "block", filter: effect.tint }} />
                {/* Light leak on polaroid */}
                <div style={{ position: "absolute", inset: 0, background: effect.leak, mixBlendMode: "screen", opacity: 0.5, pointerEvents: "none" }} />
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, backgroundSize: "120px", opacity: 0.05, mixBlendMode: "overlay", pointerEvents: "none" }} />
              </>
            ) : item.type === "quote" ? (
              <div style={{ minHeight: 180, display: "flex", alignItems: "center", justifyContent: "center", padding: 28, background: "rgba(28,24,20,0.03)" }}>
                <p style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontWeight: 500, fontSize: "clamp(16px,2vw,24px)", lineHeight: 1.6, color: "#1c1814", textAlign: "center" }}>&ldquo;{item.text}&rdquo;</p>
              </div>
            ) : null}
          </div>
          <div style={{ marginTop: 12, paddingLeft: 2 }}>
            {item.caption && <div style={{ fontFamily: "var(--font-space)", fontWeight: 600, fontSize: 13, color: "#1c1814", marginBottom: 3 }}>{item.caption}</div>}
            {item.poem && <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(184,92,56,0.6)", letterSpacing: "0.18em" }}>— {item.poem}</div>}
          </div>
        </div>
        <button onClick={onClose} style={{
          position: "absolute", top: -32, right: 0, background: "none", border: "none", cursor: "pointer",
          fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", color: "rgba(244,241,236,0.4)", textTransform: "uppercase",
        }}>CLOSE</button>
      </div>
    </div>
  );
}

/* ─── Page ─── */
export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [overlayItem, setOverlayItem] = useState<GalleryItem | null>(null);
  const closeOverlay = useCallback(() => setOverlayItem(null), []);

  // 2D free scroll/drag state
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const velRef = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const lastMouse = useRef({ x: 0, y: 0, t: 0 });
  const animRef = useRef<number>(0);
  const clickGuard = useRef(false);

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

  // Inertia animation loop
  useEffect(() => {
    const animate = () => {
      if (!isDragging.current) {
        velRef.current.x *= 0.92;
        velRef.current.y *= 0.92;
        if (Math.abs(velRef.current.x) > 0.1 || Math.abs(velRef.current.y) > 0.1) {
          posRef.current.x += velRef.current.x;
          posRef.current.y += velRef.current.y;
        }
      }
      if (innerRef.current) {
        innerRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Mouse wheel => free 2D scroll (shift+wheel for horizontal)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      posRef.current.x -= e.deltaX;
      posRef.current.y -= e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    clickGuard.current = false;
    dragStart.current = { mx: e.clientX, my: e.clientY, px: posRef.current.x, py: posRef.current.y };
    lastMouse.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
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
  }, []);

  const onPointerUp = useCallback(() => { isDragging.current = false; }, []);

  // Build grid items — interleave quotes between media
  const mediaItems = items.filter(it => (it.type === "image" || it.type === "video") && (it.imageUrl || it.image_url || it.video_url));
  const quoteItems = items.filter(it => it.type === "quote" && it.text);
  const gridItems: GalleryItem[] = [];
  let qIdx = 0;
  mediaItems.forEach((item, i) => {
    gridItems.push(item);
    if ((i + 1) % 5 === 0 && qIdx < quoteItems.length) {
      gridItems.push(quoteItems[qIdx++]);
    }
  });
  while (qIdx < quoteItems.length) gridItems.push(quoteItems[qIdx++]);

  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  return (
    <div style={{ background: "#0c0a09", color: "#f4f1ec", width: "100%", height: "100vh", overflow: "hidden", fontFamily: "var(--font-space)" }}>
      <style>{`
        @keyframes grainDrift {
          0%,100%{transform:translate(0,0)}10%{transform:translate(-5%,-10%)}20%{transform:translate(-15%,5%)}
          30%{transform:translate(7%,-25%)}40%{transform:translate(-5%,25%)}50%{transform:translate(-15%,10%)}
          60%{transform:translate(15%,0)}70%{transform:translate(0,15%)}80%{transform:translate(3%,35%)}
          90%{transform:translate(-10%,10%)}
        }
        @keyframes hintPulse { 0%,100%{opacity:0.5} 50%{opacity:0.15} }
        @media(prefers-reduced-motion:reduce){*{animation-duration:0.01ms!important;transition-duration:0.01ms!important}}
        .nav-link:hover{color:rgba(184,92,56,0.85)!important}
      `}</style>

      {overlayItem && <Lightbox item={overlayItem} onClose={closeOverlay} />}

      {/* ─── 2D draggable + scrollable container ─── */}
      <div
        ref={containerRef}
        style={{
          position: "fixed", inset: 0, overflow: "hidden",
          cursor: "grab", userSelect: "none", touchAction: "none",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div ref={innerRef} style={{ willChange: "transform" }}>
          {/* Mosaic grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(200px, 1fr))",
            gridAutoRows: "clamp(180px, 22vw, 300px)",
            gap: 3,
            width: "max(100vw, 1400px)",
            padding: 0,
          }}>
            {gridItems.map((item, i) => {
              const pattern = CELL_PATTERNS[i % CELL_PATTERNS.length];
              return (
                <div key={item.id} style={{
                  gridColumn: `span ${pattern.colSpan}`,
                  gridRow: `span ${pattern.rowSpan}`,
                }}>
                  {item.type === "quote" ? (
                    <QuoteCell item={item} onClick={() => { if (!clickGuard.current) setOverlayItem(item); }} />
                  ) : (
                    <GalleryCell
                      item={item}
                      effectIndex={i}
                      onClick={() => { if (!clickGuard.current) setOverlayItem(item); }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Global film grain overlay */}
        <div style={{
          position: "fixed", inset: "-50%", width: "200%", height: "200%",
          pointerEvents: "none", zIndex: 30,
          backgroundImage: GRAIN, backgroundSize: "200px",
          opacity: 0.12,
          mixBlendMode: "color-burn",
          animation: "grainDrift 8s steps(10) infinite",
        }} />

        {/* Global vignette */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 25,
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(5,4,3,0.5) 100%)",
        }} />
      </div>

      {/* ─── Nav overlay ─── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        padding: "20px clamp(20px,4vw,48px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        pointerEvents: "none",
        background: "linear-gradient(to bottom, rgba(12,10,9,0.6) 0%, transparent 100%)",
      }}>
        <Link href="/poet" className="nav-link" style={{
          ...mono, fontSize: 10, letterSpacing: "0.2em",
          color: "rgba(244,241,236,0.5)", textDecoration: "none",
          transition: "color 0.2s", pointerEvents: "auto",
        }}>← POET</Link>
        <span style={{ ...mono, fontSize: 9, letterSpacing: "0.3em", color: "rgba(184,92,56,0.4)" }}>GALLERY</span>
      </nav>

      {/* ─── "Scroll and move" ─── */}
      <div style={{
        position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
        zIndex: 50, pointerEvents: "none",
        ...mono, fontSize: 9, letterSpacing: "0.35em",
        color: "rgba(244,241,236,0.3)", textTransform: "uppercase",
        animation: "hintPulse 3s ease-in-out infinite",
      }}>
        SCROLL AND MOVE
      </div>

      {/* ─── Count ─── */}
      <div style={{
        position: "fixed", bottom: 28, right: "clamp(20px,4vw,48px)",
        zIndex: 50, pointerEvents: "none",
        ...mono, fontSize: 8, letterSpacing: "0.18em", color: "rgba(244,241,236,0.12)",
      }}>
        {mediaItems.length} FRAGMENTS
      </div>
    </div>
  );
}
