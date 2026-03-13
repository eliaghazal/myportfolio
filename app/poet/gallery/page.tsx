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

/* ─── Layout engine: pack images into a collage ─── */
interface PlacedImage {
  item: GalleryItem;
  x: number; y: number;
  w: number; h: number;
  rotation: number;
  lightLeak: number;
}

function buildCollage(items: GalleryItem[], viewW: number, viewH: number): { placed: PlacedImage[]; totalW: number; totalH: number } {
  const mediaItems = items.filter(it =>
    (it.type === "image" || it.type === "video") && (it.imageUrl || it.image_url || it.video_url || it.thumbnail_url)
  );
  if (mediaItems.length === 0) return { placed: [], totalW: viewW, totalH: viewH };

  // Create a dense grid of varying sizes
  const cols = Math.max(4, Math.ceil(Math.sqrt(mediaItems.length * 1.5)));
  const baseSize = Math.max(viewW, 1200) / cols;
  const placed: PlacedImage[] = [];

  // Size multipliers for variety — some cells are large, most are medium/small
  const sizePatterns = [
    { wm: 2.0, hm: 2.0 }, // large square
    { wm: 1.0, hm: 1.5 }, // tall
    { wm: 1.5, hm: 1.0 }, // wide
    { wm: 1.0, hm: 1.0 }, // standard
    { wm: 1.5, hm: 1.5 }, // medium-large
    { wm: 1.0, hm: 1.0 }, // standard
    { wm: 2.0, hm: 1.5 }, // large wide
    { wm: 1.0, hm: 1.0 }, // standard
    { wm: 1.0, hm: 1.5 }, // tall
    { wm: 1.5, hm: 1.0 }, // wide
    { wm: 1.0, hm: 1.0 }, // standard
    { wm: 1.0, hm: 1.0 }, // standard
  ];

  let curX = 0;
  let curY = 0;
  let rowMaxH = 0;
  let maxX = 0;

  mediaItems.forEach((item, i) => {
    const pattern = sizePatterns[i % sizePatterns.length];
    const w = baseSize * pattern.wm;
    const h = baseSize * pattern.hm;

    if (curX + w > viewW * 3 && curX > 0) {
      curX = 0;
      curY += rowMaxH;
      rowMaxH = 0;
    }

    // Subtle rotation per image, slight randomness
    const seed = ((i * 7919 + 3) % 1000) / 1000;
    const rotation = (seed - 0.5) * 4; // -2 to +2 degrees

    placed.push({
      item,
      x: curX,
      y: curY,
      w,
      h,
      rotation,
      lightLeak: i % 6,
    });

    curX += w;
    if (h > rowMaxH) rowMaxH = h;
    if (curX > maxX) maxX = curX;
  });

  return {
    placed,
    totalW: Math.max(maxX, viewW),
    totalH: curY + rowMaxH,
  };
}

/* ─── Gallery Canvas (the main draggable collage) ─── */
function GalleryCanvas({ items, onItemClick }: { items: GalleryItem[]; onItemClick: (item: GalleryItem) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const velRef = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const lastMouse = useRef({ x: 0, y: 0, t: 0 });
  const animRef = useRef<number>(0);
  const clickGuard = useRef(false);
  const [collage, setCollage] = useState<{ placed: PlacedImage[]; totalW: number; totalH: number }>({ placed: [], totalW: 0, totalH: 0 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const result = buildCollage(items, vw, vh);
    setCollage(result);
    // Center the collage initially
    posRef.current = {
      x: -(result.totalW - vw) / 2,
      y: -(result.totalH - vh) / 2,
    };
    if (innerRef.current) {
      innerRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
    }
  }, [items]);

  useEffect(() => {
    const animate = () => {
      if (!isDragging.current) {
        velRef.current.x *= 0.94;
        velRef.current.y *= 0.94;
        posRef.current.x += velRef.current.x;
        posRef.current.y += velRef.current.y;
        if (innerRef.current) {
          innerRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
        }
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
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
    if (innerRef.current) {
      innerRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
    }
  }, []);

  const onPointerUp = useCallback(() => { isDragging.current = false; }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed", inset: 0, overflow: "hidden",
        background: "#0c0a09",
        cursor: isDragging.current ? "grabbing" : "grab",
        userSelect: "none", touchAction: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Collage container — rotated + scaled like rodeo.film */}
      <div style={{
        position: "absolute", inset: 0,
        transform: "scale(1.15) rotate(3deg)",
        transformOrigin: "center center",
      }}>
        <div ref={innerRef} style={{ position: "absolute", top: 0, left: 0, willChange: "transform" }}>
          {collage.placed.map((p) => {
            const mediaUrl = p.item.type === "video"
              ? (p.item.thumbnail_url || p.item.image_url)
              : (p.item.imageUrl || p.item.image_url);
            const isHovered = hoveredId === p.item.id;
            return (
              <div
                key={p.item.id}
                style={{
                  position: "absolute",
                  left: p.x, top: p.y,
                  width: p.w, height: p.h,
                  transform: `rotate(${p.rotation}deg)`,
                  overflow: "hidden",
                  cursor: "pointer",
                  zIndex: isHovered ? 10 : 1,
                }}
                onMouseEnter={() => setHoveredId(p.item.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => {
                  if (!clickGuard.current) onItemClick(p.item);
                }}
              >
                {/* Image */}
                {mediaUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaUrl}
                    alt={p.item.caption || ""}
                    loading="lazy"
                    draggable={false}
                    style={{
                      width: "100%", height: "100%",
                      objectFit: "cover", display: "block",
                      transform: isHovered ? "scale(1.05)" : "scale(1)",
                      transition: "transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)",
                      filter: `brightness(${isHovered ? 1.05 : 0.92}) contrast(1.08) saturate(1.1)`,
                    }}
                  />
                )}

                {/* Light leak overlay */}
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: [
                    "linear-gradient(135deg, rgba(255,120,50,0.18) 0%, transparent 50%, rgba(120,80,200,0.06) 100%)",
                    "linear-gradient(225deg, rgba(255,200,100,0.12) 0%, transparent 40%, rgba(200,50,80,0.08) 100%)",
                    "linear-gradient(45deg, rgba(100,200,255,0.08) 0%, transparent 50%, rgba(255,150,50,0.12) 100%)",
                    "linear-gradient(315deg, rgba(255,80,120,0.1) 0%, transparent 45%, rgba(80,200,150,0.06) 100%)",
                    "linear-gradient(180deg, rgba(255,220,150,0.15) 0%, transparent 40%, rgba(50,50,150,0.08) 100%)",
                    "linear-gradient(0deg, rgba(200,100,50,0.12) 0%, transparent 50%, rgba(100,180,255,0.08) 100%)",
                  ][p.lightLeak],
                  mixBlendMode: "screen",
                  opacity: isHovered ? 0.8 : 0.5,
                  transition: "opacity 0.4s ease",
                }} />

                {/* Vignette */}
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)",
                }} />

                {/* Video play icon */}
                {p.item.type === "video" && p.item.video_url && (
                  <div style={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%,-50%)",
                    width: 44, height: 44, borderRadius: "50%",
                    background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid rgba(255,255,255,0.15)",
                    opacity: isHovered ? 0.9 : 0.6,
                    transition: "opacity 0.3s ease",
                  }}>
                    <div style={{
                      width: 0, height: 0,
                      borderTop: "7px solid transparent",
                      borderBottom: "7px solid transparent",
                      borderLeft: "12px solid rgba(255,255,255,0.9)",
                      marginLeft: 2,
                    }} />
                  </div>
                )}

                {/* Hover caption */}
                {(p.item.caption || p.item.poem) && (
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
                    padding: "32px 12px 10px",
                    opacity: isHovered ? 1 : 0,
                    transform: isHovered ? "translateY(0)" : "translateY(6px)",
                    transition: "opacity 0.35s ease, transform 0.35s ease",
                    pointerEvents: "none",
                  }}>
                    {p.item.caption && (
                      <div style={{
                        fontFamily: "var(--font-space)", fontWeight: 600,
                        fontSize: 11, color: "rgba(244,241,236,0.95)",
                        letterSpacing: "-0.01em", marginBottom: 2,
                      }}>{p.item.caption}</div>
                    )}
                    {p.item.poem && (
                      <div style={{
                        fontFamily: "var(--font-mono)", fontSize: 8,
                        letterSpacing: "0.18em", color: "rgba(184,92,56,0.85)",
                      }}>— {p.item.poem}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Paper/film grain overlay — like rodeo.film's main:after */}
      <div style={{
        position: "fixed", inset: "-50%",
        width: "200%", height: "200%",
        pointerEvents: "none", zIndex: 20,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "200px 200px",
        opacity: 0.18,
        mixBlendMode: "color-burn",
        animation: "grainDrift 8s steps(10) infinite",
      }} />
    </div>
  );
}

/* ─── Lightbox (fullscreen media viewer) ─── */
function Lightbox({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const mediaUrl = item.type === "video" ? item.video_url : (item.imageUrl || item.image_url);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(5,4,3,0.95)", backdropFilter: "blur(20px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
        padding: "clamp(16px,4vw,48px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: "min(90vw, 800px)", maxHeight: "85vh",
          position: "relative",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.95)",
          transition: "opacity 0.5s ease 0.1s, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s",
        }}
      >
        {item.type === "video" && item.video_url ? (
          <video
            src={item.video_url}
            controls autoPlay playsInline
            style={{ width: "100%", maxHeight: "85vh", objectFit: "contain", display: "block" }}
          />
        ) : mediaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaUrl}
            alt={item.caption || ""}
            style={{ width: "100%", maxHeight: "85vh", objectFit: "contain", display: "block" }}
          />
        ) : null}

        {(item.caption || item.poem) && (
          <div style={{ marginTop: 12, textAlign: "center" }}>
            {item.caption && (
              <div style={{
                fontFamily: "var(--font-space)", fontWeight: 500,
                fontSize: 14, color: "rgba(244,241,236,0.9)",
              }}>{item.caption}</div>
            )}
            {item.poem && (
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 10,
                letterSpacing: "0.2em", color: "rgba(184,92,56,0.7)",
                marginTop: 4,
              }}>— {item.poem}</div>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            position: "absolute", top: -36, right: 0,
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "var(--font-mono)", fontSize: 11,
            letterSpacing: "0.2em", color: "rgba(244,241,236,0.5)",
            textTransform: "uppercase",
          }}
        >CLOSE</button>
      </div>
    </div>
  );
}

/* ─── Page ─── */
export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [overlayItem, setOverlayItem] = useState<GalleryItem | null>(null);
  const closeOverlay = useCallback(() => setOverlayItem(null), []);

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

  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  return (
    <div style={{ background: "#0c0a09", color: "#f4f1ec", width: "100%", height: "100vh", overflow: "hidden", fontFamily: "var(--font-space)" }}>
      <style>{`
        @keyframes grainDrift {
          0%, 100% { transform: translate(0,0); }
          10% { transform: translate(-5%,-10%); }
          20% { transform: translate(-15%,5%); }
          30% { transform: translate(7%,-25%); }
          40% { transform: translate(-5%,25%); }
          50% { transform: translate(-15%,10%); }
          60% { transform: translate(15%,0%); }
          70% { transform: translate(0%,15%); }
          80% { transform: translate(3%,35%); }
          90% { transform: translate(-10%,10%); }
        }
        @keyframes hintPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.2; }
        }
        @media(prefers-reduced-motion:reduce){*{animation-duration:0.01ms!important;transition-duration:0.01ms!important}}
        .gal-nav-link:hover{color:rgba(184,92,56,0.85)!important}
      `}</style>

      {overlayItem && <Lightbox item={overlayItem} onClose={closeOverlay} />}

      {/* Gallery Canvas */}
      <GalleryCanvas items={items} onItemClick={setOverlayItem} />

      {/* Nav overlay */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        padding: "24px clamp(20px,4vw,48px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        pointerEvents: "none",
      }}>
        <Link href="/poet" className="gal-nav-link" style={{
          ...mono, fontSize: 10, letterSpacing: "0.2em",
          color: "rgba(244,241,236,0.5)", textDecoration: "none",
          transition: "color 0.2s", pointerEvents: "auto",
        }}>← POET</Link>
        <span style={{ ...mono, fontSize: 9, letterSpacing: "0.3em", color: "rgba(184,92,56,0.4)" }}>GALLERY</span>
      </nav>

      {/* "Touch and Move" instruction — like rodeo.film */}
      <div style={{
        position: "fixed", bottom: 28, left: "50%",
        transform: "translateX(-50%)", zIndex: 50,
        pointerEvents: "none",
        fontFamily: "var(--font-mono)", fontSize: 9,
        letterSpacing: "0.35em", color: "rgba(244,241,236,0.35)",
        textTransform: "uppercase",
        animation: "hintPulse 3s ease-in-out infinite",
      }}>
        TOUCH AND MOVE
      </div>

      {/* Footer */}
      <div style={{
        position: "fixed", bottom: 28, right: "clamp(20px,4vw,48px)",
        zIndex: 50, pointerEvents: "none",
      }}>
        <span style={{ ...mono, fontSize: 8, letterSpacing: "0.18em", color: "rgba(244,241,236,0.15)" }}>
          {items.filter(i => i.type !== "quote").length} FRAGMENTS
        </span>
      </div>
    </div>
  );
}
