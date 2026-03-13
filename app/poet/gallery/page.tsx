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

/* ─── Subtle light leak accents (not heavy, just gentle color touches) ─── */
const LIGHT_LEAKS = [
  "radial-gradient(ellipse at 5% 0%, rgba(255,160,70,0.14) 0%, transparent 50%)",
  "radial-gradient(ellipse at 100% 50%, rgba(255,60,40,0.1) 0%, transparent 45%)",
  "radial-gradient(ellipse at 50% 100%, rgba(255,210,120,0.12) 0%, transparent 50%)",
  "radial-gradient(ellipse at 0% 100%, rgba(100,140,255,0.08) 0%, transparent 40%), radial-gradient(ellipse at 100% 0%, rgba(255,140,60,0.1) 0%, transparent 40%)",
  "radial-gradient(circle at 30% 20%, rgba(255,180,80,0.12) 0%, transparent 35%)",
  "radial-gradient(ellipse at 95% 90%, rgba(200,80,140,0.1) 0%, transparent 45%)",
  "radial-gradient(ellipse at 10% 50%, rgba(120,180,255,0.08) 0%, transparent 40%)",
  "linear-gradient(90deg, rgba(255,50,30,0.08) 0%, transparent 20%, transparent 80%, rgba(255,80,40,0.06) 100%)",
];

/* ─── Cell sizes: mimics rodeo.film's varied mosaic ─── */
const CELL_SIZES = [
  { c: 2, r: 2 }, { c: 1, r: 1 }, { c: 1, r: 1 },
  { c: 1, r: 2 }, { c: 2, r: 1 }, { c: 1, r: 1 },
  { c: 1, r: 1 }, { c: 1, r: 1 }, { c: 2, r: 2 },
  { c: 1, r: 2 }, { c: 1, r: 1 }, { c: 2, r: 1 },
  { c: 1, r: 1 }, { c: 1, r: 1 }, { c: 2, r: 2 },
  { c: 1, r: 1 }, { c: 2, r: 1 }, { c: 1, r: 2 },
];

/* ─── Floating Orbs ─── */
function FloatingOrbs() {
  const orbs = useRef(
    Array.from({ length: 22 }, (_, i) => ({
      size: 4 + (i * 7919 + 3) % 40,
      x: (i * 3571 + 11) % 100,
      y: (i * 1231 + 7) % 100,
      duration: 12 + (i * 4567) % 20,
      delay: (i * 2341) % 8,
      // Alternate between warm amber and cool blue
      color: i % 3 === 0
        ? `rgba(255,180,80,${0.08 + (i % 5) * 0.03})`    // warm amber
        : i % 3 === 1
        ? `rgba(120,160,255,${0.06 + (i % 4) * 0.025})`   // cool blue
        : `rgba(255,220,160,${0.05 + (i % 6) * 0.02})`,   // soft gold
      blur: 10 + (i * 919) % 30,
    }))
  ).current;

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 35, overflow: "hidden" }}>
      {orbs.map((o, i) => (
        <div key={i} style={{
          position: "absolute",
          width: o.size, height: o.size,
          left: `${o.x}%`, top: `${o.y}%`,
          background: o.color,
          borderRadius: "50%",
          filter: `blur(${o.blur}px)`,
          animation: `orbFloat${i % 4} ${o.duration}s ease-in-out ${o.delay}s infinite`,
          willChange: "transform, opacity",
        }} />
      ))}
    </div>
  );
}

/* ─── Gallery Cell ─── */
function GalleryCell({ item, index, onClick }: {
  item: GalleryItem; index: number; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
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
      {/* Media */}
      {isVideo && hovered ? (
        <video ref={videoRef} src={item.video_url} muted playsInline loop
          style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
            transform: hovered ? "scale(1.03)" : "scale(1)",
            transition: "transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}
        />
      ) : mediaUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={mediaUrl} alt={item.caption || ""} loading="lazy" draggable={false}
          style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
            transform: hovered ? "scale(1.03)" : "scale(1)",
            transition: "transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}
        />
      ) : null}

      {/* Subtle light leak accent — very gentle */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: LIGHT_LEAKS[index % LIGHT_LEAKS.length],
        mixBlendMode: "screen",
        opacity: hovered ? 0.6 : 0.35,
        transition: "opacity 0.5s ease",
      }} />

      {/* Very subtle edge vignette */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.15) 100%)",
      }} />

      {/* Video play icon */}
      {isVideo && !hovered && (
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 46, height: 46, borderRadius: "50%",
          background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1.5px solid rgba(255,255,255,0.2)",
        }}>
          <div style={{ width: 0, height: 0, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderLeft: "13px solid rgba(255,255,255,0.9)", marginLeft: 3 }} />
        </div>
      )}

      {/* Caption */}
      {(item.caption || item.poem) && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
          padding: "32px 14px 12px",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 0.35s ease, transform 0.35s ease",
          pointerEvents: "none",
        }}>
          {item.caption && <div style={{ fontFamily: "var(--font-space)", fontWeight: 600, fontSize: 12, color: "rgba(255,255,255,0.95)", marginBottom: 2 }}>{item.caption}</div>}
          {item.poem && <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.18em", color: "rgba(184,92,56,0.9)" }}>— {item.poem}</div>}
        </div>
      )}
    </div>
  );
}

/* ─── Quote Cell ─── */
function QuoteCell({ item, onClick }: { item: GalleryItem; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", height: "100%", cursor: "pointer",
        background: hovered ? "#181614" : "#141210",
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        padding: "clamp(16px,2.5vw,32px)",
        transition: "background 0.4s ease",
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

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "rgba(5,4,3,0.94)", backdropFilter: "blur(20px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity: vis ? 1 : 0, transition: "opacity 0.35s ease",
      padding: "clamp(16px,4vw,48px)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        maxWidth: "min(92vw, 720px)", maxHeight: "85vh", position: "relative",
        transform: vis ? "scale(1) rotate(-1deg)" : "scale(0.94) rotate(-2deg)",
        opacity: vis ? 1 : 0,
        transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s, opacity 0.4s ease 0.1s",
      }}>
        {/* Polaroid frame */}
        <div style={{
          background: "#faf8f4",
          padding: "clamp(8px,1.2vw,14px) clamp(8px,1.2vw,14px) clamp(32px,4vw,50px)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)",
        }}>
          <div style={{ position: "relative", overflow: "hidden", background: "#eae6de" }}>
            {item.type === "video" && item.video_url ? (
              <video src={item.video_url} controls autoPlay playsInline style={{ width: "100%", maxHeight: "60vh", objectFit: "contain", display: "block" }} />
            ) : mediaUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mediaUrl} alt={item.caption || ""} style={{ width: "100%", maxHeight: "60vh", objectFit: "contain", display: "block" }} />
                {/* Gentle light leak on polaroid */}
                <div style={{ position: "absolute", inset: 0, background: LIGHT_LEAKS[parseInt(item.id, 36) % LIGHT_LEAKS.length], mixBlendMode: "screen", opacity: 0.3, pointerEvents: "none" }} />
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

/* ─── Main Page ─── */
export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [overlayItem, setOverlayItem] = useState<GalleryItem | null>(null);
  const closeOverlay = useCallback(() => setOverlayItem(null), []);

  // 2D drag state
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
        setItems(data.map(item => ({ ...item, imageUrl: item.image_url ?? item.imageUrl })));
      })
      .catch(() => {});
  }, []);

  // Inertia
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

  // Scroll => 2D movement
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
    isDragging.current = true; clickGuard.current = false;
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

  // Build grid: media + interleaved quotes, then REPEAT to fill space
  const mediaItems = items.filter(it => (it.type === "image" || it.type === "video") && (it.imageUrl || it.image_url || it.video_url));
  const quoteItems = items.filter(it => it.type === "quote" && it.text);

  const baseGrid: GalleryItem[] = [];
  let qIdx = 0;
  mediaItems.forEach((item, i) => {
    baseGrid.push(item);
    if ((i + 1) % 6 === 0 && qIdx < quoteItems.length) {
      baseGrid.push(quoteItems[qIdx++]);
    }
  });
  while (qIdx < quoteItems.length) baseGrid.push(quoteItems[qIdx++]);

  // Repeat items to fill space — at least 3x so user never hits empty space
  const repeats = baseGrid.length > 0 ? Math.max(3, Math.ceil(36 / baseGrid.length)) : 0;
  const gridItems: GalleryItem[] = [];
  for (let r = 0; r < repeats; r++) {
    baseGrid.forEach((item, i) => {
      gridItems.push({ ...item, id: `${item.id}_rep${r}_${i}` });
    });
  }

  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  return (
    <div style={{ background: "#0c0a09", color: "#f4f1ec", width: "100%", height: "100vh", overflow: "hidden", fontFamily: "var(--font-space)" }}>
      <style>{`
        @keyframes orbFloat0 {
          0%,100%{transform:translate(0,0) scale(1);opacity:0.6}
          25%{transform:translate(40px,-60px) scale(1.3);opacity:1}
          50%{transform:translate(-30px,-100px) scale(0.9);opacity:0.4}
          75%{transform:translate(50px,-40px) scale(1.15);opacity:0.8}
        }
        @keyframes orbFloat1 {
          0%,100%{transform:translate(0,0) scale(1);opacity:0.5}
          33%{transform:translate(-50px,40px) scale(1.2);opacity:0.9}
          66%{transform:translate(30px,80px) scale(0.85);opacity:0.3}
        }
        @keyframes orbFloat2 {
          0%,100%{transform:translate(0,0) scale(1);opacity:0.7}
          25%{transform:translate(60px,30px) scale(1.1);opacity:0.4}
          50%{transform:translate(-40px,70px) scale(1.35);opacity:0.9}
          75%{transform:translate(20px,-50px) scale(0.9);opacity:0.5}
        }
        @keyframes orbFloat3 {
          0%,100%{transform:translate(0,0) scale(1);opacity:0.4}
          50%{transform:translate(-60px,-80px) scale(1.25);opacity:0.8}
        }
        @keyframes grainDrift {
          0%,100%{transform:translate(0,0)}10%{transform:translate(-5%,-10%)}
          30%{transform:translate(7%,-25%)}50%{transform:translate(-15%,10%)}
          70%{transform:translate(0,15%)}90%{transform:translate(-10%,10%)}
        }
        @keyframes hintPulse { 0%,100%{opacity:0.45} 50%{opacity:0.12} }
        @media(prefers-reduced-motion:reduce){*{animation-duration:0.01ms!important;transition-duration:0.01ms!important}}
        .nav-link:hover{color:rgba(184,92,56,0.9)!important}
      `}</style>

      {overlayItem && <Lightbox item={overlayItem} onClose={closeOverlay} />}

      {/* Floating orbs */}
      <FloatingOrbs />

      {/* 2D drag/scroll container */}
      <div
        ref={containerRef}
        style={{ position: "fixed", inset: 0, overflow: "hidden", cursor: "grab", userSelect: "none", touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Tilted + scaled canvas like rodeo.film */}
        <div style={{
          transform: "scale(1.15) rotate(3deg)",
          transformOrigin: "center center",
          position: "absolute", inset: "-15%",
          width: "130%", height: "130%",
        }}>
          <div ref={innerRef} style={{ willChange: "transform" }}>
            {/* Dense mosaic grid — minimal gaps */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridAutoRows: "clamp(200px, 24vw, 340px)",
              gap: 2,
              width: "max(110vw, 1600px)",
            }}>
              {gridItems.map((item, i) => {
                const size = CELL_SIZES[i % CELL_SIZES.length];
                return (
                  <div key={item.id} style={{
                    gridColumn: `span ${size.c}`,
                    gridRow: `span ${size.r}`,
                  }}>
                    {item.type === "quote" ? (
                      <QuoteCell item={item} onClick={() => { if (!clickGuard.current) setOverlayItem(item); }} />
                    ) : (
                      <GalleryCell item={item} index={i} onClick={() => { if (!clickGuard.current) setOverlayItem(item); }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Very light global grain — barely visible */}
        <div style={{
          position: "fixed", inset: "-50%", width: "200%", height: "200%",
          pointerEvents: "none", zIndex: 30,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px",
          opacity: 0.06,
          mixBlendMode: "overlay",
          animation: "grainDrift 8s steps(10) infinite",
        }} />
      </div>

      {/* ─── Nav ─── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        padding: "20px clamp(20px,4vw,48px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        pointerEvents: "none",
        background: "linear-gradient(to bottom, rgba(12,10,9,0.5) 0%, transparent 100%)",
      }}>
        <Link href="/poet" className="nav-link" style={{
          ...mono, fontSize: 10, letterSpacing: "0.2em",
          color: "rgba(244,241,236,0.55)", textDecoration: "none",
          transition: "color 0.2s", pointerEvents: "auto",
        }}>← POET</Link>
        <span style={{ ...mono, fontSize: 9, letterSpacing: "0.3em", color: "rgba(184,92,56,0.4)" }}>GALLERY</span>
      </nav>

      {/* Instruction */}
      <div style={{
        position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
        zIndex: 50, pointerEvents: "none",
        ...mono, fontSize: 9, letterSpacing: "0.35em",
        color: "rgba(244,241,236,0.3)", textTransform: "uppercase",
        animation: "hintPulse 3s ease-in-out infinite",
      }}>SCROLL AND MOVE</div>

      <div style={{
        position: "fixed", bottom: 28, right: "clamp(20px,4vw,48px)",
        zIndex: 50, pointerEvents: "none",
        ...mono, fontSize: 8, letterSpacing: "0.18em", color: "rgba(244,241,236,0.12)",
      }}>{mediaItems.length} FRAGMENTS</div>
    </div>
  );
}
