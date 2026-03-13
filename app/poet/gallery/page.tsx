"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

const ink     = "#1c1814";
const paper   = "#f4f1ec";
const rust    = "#b85c38";
const rustDim = "rgba(184,92,56,0.5)";
const dim     = "rgba(28,24,20,0.42)";
const faint   = "rgba(28,24,20,0.12)";
const border  = "rgba(28,24,20,0.1)";

type AspectRatio = "original" | "1:1" | "16:9" | "3:4" | "21:9";

interface GalleryItem {
  id: string;
  type: "image" | "quote";
  text?: string;
  poem?: string;
  imageUrl?: string;
  caption?: string;
  rotation?: number;
  aspect_ratio?: AspectRatio;
}

const POEM_REEL = [
  { line: "Come all,", sub: "we're witnessing the eclipse.", poem: "The Ghost of Town" },
  { line: "I am bound by an invisible thread,", sub: "not to another — but to my own soul.", poem: "Invisible Thread" },
  { line: "You're the sun,", sub: "and I am the moon.", poem: "Circle of Love" },
  { line: "Oh sea,", sub: "how much I see myself in you.", poem: "Oh Sea" },
  { line: "In another life,", sub: "maybe our love would be alive.", poem: "In Another Life" },
  { line: "Land of God,", sub: "we will return to reclaim you.", poem: "Land of God" },
  { line: "Behind my brown doe eyes,", sub: "waterfalls cascade.", poem: "Behind My Brown Doe Eyes" },
  { line: "Keep your boat afloat", sub: "and sail away.", poem: "Introduction" },
];

function useFade(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.opacity = "0"; el.style.transform = "translateY(14px)";
    el.style.transition = `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !fired.current) {
        fired.current = true;
        el.style.opacity = "1"; el.style.transform = "translateY(0)";
        obs.unobserve(el);
      }
    }, { threshold: 0, rootMargin: "0px 0px -40px 0px" });
    obs.observe(el); return () => obs.disconnect();
  }, [delay]);
  return ref;
}

/* Polaroid Overlay */
function PolaroidOverlay({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  const visRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = visRef.current;
    if (el) { el.style.opacity = "0"; requestAnimationFrame(() => { if (el) el.style.opacity = "1"; }); }
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn); return () => window.removeEventListener("keydown", fn);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(10,8,6,0.92)", backdropFilter: "blur(20px)",
      transition: "opacity 0.4s ease", padding: "clamp(16px,4vw,40px)",
    }}>
      <div ref={visRef} onClick={e => e.stopPropagation()} style={{
        background: "#faf8f4",
        padding: "clamp(14px,2vw,24px) clamp(14px,2vw,24px) clamp(36px,5vw,56px)",
        boxShadow: "0 40px 120px rgba(0,0,0,0.7)",
        transform: "rotate(-1.5deg)",
        transition: "opacity 0.5s cubic-bezier(0.34,1.56,0.64,1)",
        maxWidth: "min(90vw, 580px)", width: "100%", position: "relative",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 12, right: 14, background: "none", border: "none",
          cursor: "pointer", fontSize: 18, color: "rgba(28,24,20,0.4)", lineHeight: 1, padding: 4,
        }}>x</button>
        {item.type === "image" && item.imageUrl ? (
          <div style={{ width: "100%", overflow: "hidden", background: "#e8e4de" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.imageUrl} alt={item.caption || ""} style={{ width: "100%", height: "auto", maxHeight: 480, objectFit: "cover", display: "block" }} />
          </div>
        ) : (
          <div style={{ minHeight: 200, background: "rgba(28,24,20,0.04)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, border: "1px solid rgba(28,24,20,0.12)" }}>
            <p style={{ fontFamily: "var(--font-space)", fontWeight: 600, fontSize: "clamp(14px,1.6vw,20px)", lineHeight: 1.65, color: ink, textAlign: "center" }}>"{item.text}"</p>
          </div>
        )}
        <div style={{ marginTop: 14 }}>
          {item.caption && <div style={{ fontFamily: "var(--font-space)", fontWeight: 600, fontSize: 14, color: ink, marginBottom: 4 }}>{item.caption}</div>}
          {item.poem && <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: rustDim, letterSpacing: "0.18em" }}>-- {item.poem}</div>}
        </div>
      </div>
    </div>
  );
}

/* Film Reel */
function FilmReel({ items, onImageClick }: { items: GalleryItem[]; onImageClick: (item: GalleryItem) => void }) {
  const trackRef    = useRef<HTMLDivElement>(null);
  const animRef     = useRef<number>(0);
  const posRef      = useRef(0);
  const velRef      = useRef(0);
  const modeRef     = useRef<"auto" | "hover" | "drag">("auto");
  const mouseXRef   = useRef(0);
  const dragStartX  = useRef(0);
  const dragStartPos= useRef(0);
  const lastX       = useRef(0);
  const lastTime    = useRef(0);
  const isDragging  = useRef(false);
  const AUTO_SPEED  = 0.55;

  const imageItems = items.filter(it => it.type === "image" && it.imageUrl);
  type ReelEntry =
    | { kind: "poem"; line: string; sub: string; poem: string }
    | { kind: "image"; imageUrl: string; caption?: string; poem?: string; aspect_ratio?: AspectRatio; item: GalleryItem };
  const combined: ReelEntry[] = [];
  let imgIdx = 0;
  POEM_REEL.forEach((p, i) => {
    combined.push({ kind: "poem", ...p });
    if ((i + 1) % 3 === 0 && imgIdx < imageItems.length) {
      const img = imageItems[imgIdx++];
      combined.push({ kind: "image", imageUrl: img.imageUrl!, caption: img.caption, poem: img.poem, aspect_ratio: img.aspect_ratio, item: img });
    }
  });
  while (imgIdx < imageItems.length) {
    const img = imageItems[imgIdx++];
    combined.push({ kind: "image", imageUrl: img.imageUrl!, caption: img.caption, poem: img.poem, aspect_ratio: img.aspect_ratio, item: img });
  }
  const frames = [...combined, ...combined];

  useEffect(() => {
    const track = trackRef.current; if (!track) return;
    const animate = () => {
      if (modeRef.current === "auto") {
        velRef.current = -AUTO_SPEED;
        posRef.current += velRef.current;
      } else if (modeRef.current === "hover") {
        const rect = track.parentElement?.getBoundingClientRect();
        if (rect) {
          const rel = (mouseXRef.current - rect.left) / rect.width;
          const target = (rel - 0.5) * 2;
          velRef.current = target * 2.2;
          posRef.current += velRef.current;
        }
      }
      const half = track.scrollWidth / 2;
      if (posRef.current <= -half) posRef.current += half;
      if (posRef.current > 0) posRef.current -= half;
      track.style.transform = `translateX(${posRef.current}px)`;
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [combined.length]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    mouseXRef.current = e.clientX;
    if (modeRef.current !== "drag") modeRef.current = "hover";
  }, []);
  const onMouseLeave = useCallback(() => {
    if (modeRef.current !== "drag") modeRef.current = "auto";
  }, []);
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX; dragStartPos.current = posRef.current;
    lastX.current = e.clientX; lastTime.current = performance.now();
    modeRef.current = "drag";
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStartX.current;
    const now = performance.now();
    velRef.current = (e.clientX - lastX.current) / (now - lastTime.current) * 16;
    lastX.current = e.clientX; lastTime.current = now;
    posRef.current = dragStartPos.current + dx;
  }, []);
  const onPointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false; modeRef.current = "auto";
  }, []);

  return (
    <div style={{ position: "relative", overflow: "hidden", background: ink, borderTop: "1px solid rgba(28,24,20,0.1)", borderBottom: "1px solid rgba(28,24,20,0.1)", userSelect: "none" }}
      onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove}
      onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
    >
      <div style={{ display: "flex", height: 22, background: "#0a0805", paddingTop: 5, overflow: "hidden" }}>
        {Array.from({ length: 120 }).map((_, i) => (
          <div key={i} style={{ width: 22, flexShrink: 0, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 11, height: 9, background: "rgba(244,241,236,0.09)", borderRadius: 2, border: "1px solid rgba(244,241,236,0.06)" }} />
          </div>
        ))}
      </div>
      <div ref={trackRef} style={{ display: "flex", willChange: "transform", cursor: "grab" }}>
        {frames.map((entry, i) => {
          const frameW = "clamp(220px,24vw,340px)";
          const frameH = "clamp(180px,21vw,265px)";
          return (
            <div key={i} style={{
              flexShrink: 0, width: frameW, minHeight: frameH, borderRight: "1px solid rgba(244,241,236,0.05)",
              display: "flex", flexDirection: "column",
              justifyContent: entry.kind === "image" ? "flex-start" : "flex-end",
              padding: entry.kind === "image" ? 0 : "clamp(20px,3vw,34px) clamp(14px,2vw,24px)",
              position: "relative", overflow: "hidden",
              cursor: entry.kind === "image" ? "pointer" : "grab",
            }} onClick={entry.kind === "image" ? () => onImageClick(entry.item) : undefined}>
              <div style={{ position: "absolute", top: 6, right: 10, zIndex: 2, fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.25em", color: entry.kind === "image" ? "rgba(244,241,236,0.55)" : "rgba(244,241,236,0.12)" }}>
                {String((i % combined.length) + 1).padStart(3, "0")}A
              </div>
              {entry.kind === "image" ? (
                <>
                  <div style={{ width: "100%", minHeight: frameH, flex: 1 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={entry.imageUrl} alt={entry.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                  {(entry.caption || entry.poem) && (
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 100%)", padding: "28px 12px 10px" }}>
                      {entry.caption && <div style={{ fontFamily: "var(--font-space)", fontWeight: 600, fontSize: 11, color: "rgba(244,241,236,0.92)", marginBottom: 3 }}>{entry.caption}</div>}
                      {entry.poem && <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "0.18em", color: "rgba(184,92,56,0.82)" }}>-- {entry.poem}</div>}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 700, fontSize: "clamp(13px,1.6vw,20px)", lineHeight: 1.25, color: paper, marginBottom: 9 }}>{entry.line}</div>
                  <div style={{ fontSize: "clamp(11px,1.2vw,15px)", color: "rgba(244,241,236,0.48)", lineHeight: 1.55, marginBottom: 13 }}>{entry.sub}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "0.22em", color: rustDim }}>-- {entry.poem}</div>
                </>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", height: 22, background: "#0a0805", paddingBottom: 5, overflow: "hidden" }}>
        {Array.from({ length: 120 }).map((_, i) => (
          <div key={i} style={{ width: 22, flexShrink: 0, display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
            <div style={{ width: 11, height: 9, background: "rgba(244,241,236,0.09)", borderRadius: 2, border: "1px solid rgba(244,241,236,0.06)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* Drag Canvas - Rodeo Film style */
interface CanvasCard {
  id: string;
  kind: "image" | "poem";
  item?: GalleryItem;
  poem?: { line: string; sub: string; poem: string };
  x: number;
  y: number;
  rotation: number;
  width: number;
  zBase: number;
}

function buildCards(items: GalleryItem[]): CanvasCard[] {
  const cards: CanvasCard[] = [];
  items.filter(it => it.imageUrl).forEach((item, i) => {
    const a = (i * 7919 + 3) % 1000 / 1000;
    const b = (i * 3571 + 11) % 1000 / 1000;
    const c = (i * 1231 + 7) % 1000 / 1000;
    const w = [240, 300, 260, 280, 320][i % 5];
    cards.push({ id: item.id, kind: "image", item, x: a * 3200 - 800, y: b * 2200 - 500, rotation: c * 14 - 7, width: w, zBase: i });
  });
  POEM_REEL.forEach((p, i) => {
    const a = (i * 6131 + 17) % 1000 / 1000;
    const b = (i * 2713 + 23) % 1000 / 1000;
    const c = (i * 3317 + 7) % 1000 / 1000;
    cards.push({ id: "poem-" + i, kind: "poem", poem: p, x: a * 3000 - 700, y: b * 2000 - 400, rotation: c * 10 - 5, width: 250, zBase: 100 + i });
  });
  return cards;
}

function DragCanvas({ items, onOpenItem }: { items: GalleryItem[]; onOpenItem: (item: GalleryItem) => void }) {
  const canvasRef  = useRef<HTMLDivElement>(null);
  const posRef     = useRef({ x: 0, y: 0 });
  const velRef     = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart  = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const lastMouse  = useRef({ x: 0, y: 0, t: 0 });
  const animRef    = useRef<number>(0);
  const clickGuard = useRef(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const cards = useRef<CanvasCard[]>([]);

  useEffect(() => {
    cards.current = buildCards(items);
  }, [items.length]);

  useEffect(() => {
    if (cards.current.length === 0) cards.current = buildCards([]);
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

  return (
    <div
      style={{
        position: "relative", width: "100%", height: "100vh",
        background: "#0d0b09", overflow: "hidden",
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
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundSize: "180px 180px", animation: "grainShift 0.12s steps(1) infinite",
      }} />
      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 9, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(8,6,4,0.75) 100%)",
      }} />
      {/* Hint */}
      <div style={{
        position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)",
        zIndex: 20, pointerEvents: "none",
        fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.4em",
        color: "rgba(244,241,236,0.22)", textTransform: "uppercase",
        animation: "hintFade 3s ease-in-out infinite",
      }}>
        drag to explore
      </div>
      {/* Canvas */}
      <div ref={canvasRef} style={{ position: "absolute", top: "50%", left: "50%", willChange: "transform" }}>
        {cards.current.map((card) => (
          <div
            key={card.id}
            data-card="true"
            style={{
              position: "absolute",
              left: card.x, top: card.y,
              width: card.width,
              zIndex: activeId === card.id ? 500 : card.zBase,
              transform: `rotate(${card.rotation}deg)`,
              transition: "transform 0.38s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.38s ease",
              boxShadow: card.kind === "image" ? "0 8px 48px rgba(0,0,0,0.6)" : "0 4px 28px rgba(0,0,0,0.45)",
            }}
            onMouseEnter={e => {
              setActiveId(card.id);
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "rotate(0deg) translateY(-14px) scale(1.04)";
              el.style.boxShadow = card.kind === "image" ? "0 32px 90px rgba(0,0,0,0.75)" : "0 24px 70px rgba(0,0,0,0.6)";
            }}
            onMouseLeave={e => {
              setActiveId(null);
              const el = e.currentTarget as HTMLElement;
              el.style.transform = `rotate(${card.rotation}deg)`;
              el.style.boxShadow = card.kind === "image" ? "0 8px 48px rgba(0,0,0,0.6)" : "0 4px 28px rgba(0,0,0,0.45)";
            }}
            onClick={() => {
              if (clickGuard.current) return;
              if (card.kind === "image" && card.item) onOpenItem(card.item);
            }}
          >
            {card.kind === "image" && card.item?.imageUrl ? (
              <div style={{ background: "#f5f2ed", padding: "12px 12px 48px", cursor: "pointer" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.item.imageUrl} alt={card.item.caption || ""} draggable={false}
                  style={{
                    width: "100%", display: "block", objectFit: "cover",
                    aspectRatio: (() => {
                      const map: Record<string, string> = { "1:1": "1/1", "16:9": "16/9", "3:4": "3/4", "21:9": "21/9" };
                      return map[card.item!.aspect_ratio ?? ""] ?? "4/3";
                    })(),
                  }}
                />
                <div style={{ marginTop: 10 }}>
                  {card.item.caption && <div style={{ fontFamily: "var(--font-space)", fontWeight: 700, fontSize: 11, color: ink, letterSpacing: "-0.01em", lineHeight: 1.3 }}>{card.item.caption}</div>}
                  {card.item.poem && <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.18em", color: rustDim, marginTop: 4 }}>-- {card.item.poem}</div>}
                </div>
              </div>
            ) : card.kind === "poem" && card.poem ? (
              <div style={{ background: "#1a1410", border: "1px solid rgba(184,92,56,0.18)", padding: "clamp(20px,3vw,28px) clamp(18px,2.5vw,24px)", cursor: "default" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "0.3em", color: rustDim, textTransform: "uppercase", marginBottom: 14 }}>verse</div>
                <div style={{ fontFamily: "var(--font-space)", fontWeight: 700, fontSize: "clamp(14px,1.4vw,18px)", color: paper, lineHeight: 1.35, marginBottom: 8 }}>{card.poem.line}</div>
                <div style={{ fontSize: "clamp(11px,1.1vw,14px)", color: "rgba(244,241,236,0.45)", lineHeight: 1.6, marginBottom: 14 }}>{card.poem.sub}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "0.22em", color: rustDim }}>-- {card.poem.poem}</div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Floating Particles */
const PARTICLE_DATA = Array.from({ length: 18 }, (_, i) => ({
  w: (i * 7919 + 1) % 100 / 50 + 1, h: (i * 3571 + 7) % 100 / 50 + 1,
  opacity: (i * 1231 + 3) % 100 / 333 + 0.1,
  left: (i * 4567 + 5) % 100, top: (i * 9001 + 5) % 100,
  dur: (i * 2341 + 13) % 12 + 8, delay: (i * 8123 + 17) % 6,
}));

function Particles() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }} aria-hidden="true">
      {PARTICLE_DATA.map((p, i) => (
        <div key={i} style={{
          position: "absolute", width: p.w + "px", height: p.h + "px",
          background: `rgba(184,92,56,${p.opacity})`, borderRadius: "50%",
          left: p.left + "%", top: p.top + "%",
          animation: `particleDrift ${p.dur}s ease-in-out ${p.delay}s infinite`,
        }} />
      ))}
    </div>
  );
}

/* Page */
export default function GalleryPage() {
  const [scrolled, setScrolled]       = useState(false);
  const [items, setItems]             = useState<GalleryItem[]>([]);
  const [overlayItem, setOverlayItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    fetch("/api/gallery")
      .then(r => r.ok ? r.json() : [])
      .then((data: Array<GalleryItem & { image_url?: string }>) => {
        setItems(data.map(item => ({ ...item, imageUrl: item.image_url ?? item.imageUrl })));
      })
      .catch(() => {});
  }, []);

  const headRef = useFade(0);
  const closeOverlay = useCallback(() => setOverlayItem(null), []);
  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  return (
    <div style={{ background: paper, color: ink, minHeight: "100vh", fontFamily: "var(--font-space)", overflowX: "hidden" }}>
      <style>{`
        @keyframes grainShift {
          0%{transform:translate(0,0)} 10%{transform:translate(-2%,-2%)} 20%{transform:translate(2%,1%)}
          30%{transform:translate(-1%,2%)} 40%{transform:translate(3%,-1%)} 50%{transform:translate(-2%,3%)}
          60%{transform:translate(1%,-3%)} 70%{transform:translate(-3%,1%)} 80%{transform:translate(2%,2%)}
          90%{transform:translate(-1%,-1%)} 100%{transform:translate(0,0)}
        }
        @keyframes hintFade { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes particleDrift {
          0%,100%{transform:translate(0,0) scale(1);opacity:0.7}
          25%{transform:translate(-8px,-12px) scale(1.2);opacity:1}
          50%{transform:translate(10px,-20px) scale(0.8);opacity:0.5}
          75%{transform:translate(-5px,-8px) scale(1.1);opacity:0.9}
        }
        @media(prefers-reduced-motion:reduce){*{animation-duration:0.01ms!important;transition-duration:0.01ms!important}}
        .gal-link:hover{color:${rust}!important}
      `}</style>

      {overlayItem && <PolaroidOverlay item={overlayItem} onClose={closeOverlay} />}

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 clamp(24px,6vw,80px)", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(244,241,236,0.94)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid ${border}` : "none",
        transition: "background 0.35s",
      }}>
        <Link href="/poet" className="gal-link" style={{ ...mono, fontSize: 11, letterSpacing: "0.2em", color: dim, textDecoration: "none", transition: "color 0.2s" }}>back to POET</Link>
        <span style={{ ...mono, fontSize: 10, letterSpacing: "0.25em", color: rustDim }}>GALLERY</span>
      </nav>

      {/* Header */}
      <div style={{
        paddingTop: 120, paddingBottom: 56,
        paddingLeft: "clamp(24px,8vw,120px)", paddingRight: "clamp(24px,8vw,120px)",
        borderBottom: `1px solid ${border}`, position: "relative",
      }}>
        <Particles />
        <div ref={headRef} style={{ position: "relative", zIndex: 1 }}>
          <div style={{ ...mono, fontSize: 10, letterSpacing: "0.3em", color: rustDim, marginBottom: 16, textTransform: "uppercase" }}>{"// Gallery"}</div>
          <h1 style={{ fontWeight: 700, fontSize: "clamp(36px,7vw,96px)", letterSpacing: "-0.03em", lineHeight: 1.0, color: ink, marginBottom: 16 }}>
            Visual<br />Fragments
          </h1>
          <p style={{ ...mono, fontSize: 10, letterSpacing: "0.15em", color: dim, maxWidth: 400 }}>
            Poem lines as visual objects. Atmosphere, imagery, and words that define the Eclipse.
          </p>
        </div>
      </div>

      {/* Film Reel */}
      <FilmReel items={items} onImageClick={setOverlayItem} />

      {/* Canvas label */}
      <div style={{
        padding: "clamp(40px,6vw,72px) clamp(24px,8vw,120px) 0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#0d0b09",
      }}>
        <div style={{ ...mono, fontSize: 10, letterSpacing: "0.3em", color: "rgba(184,92,56,0.4)", textTransform: "uppercase" }}>
          -- Fragments and Verses
        </div>
        <div style={{ ...mono, fontSize: 9, letterSpacing: "0.25em", color: "rgba(244,241,236,0.18)", textTransform: "uppercase" }}>
          {items.length} fragments
        </div>
      </div>

      {/* Drag Canvas */}
      <DragCanvas items={items} onOpenItem={setOverlayItem} />

      {/* Footer */}
      <div style={{
        padding: "28px clamp(24px,8vw,120px)",
        borderTop: `1px solid ${border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
        background: paper,
      }}>
        <span style={{ ...mono, fontSize: 10, letterSpacing: "0.15em", color: faint }}>ELIA GHAZAL - POET</span>
        <Link href="/poet" className="gal-link" style={{ ...mono, fontSize: 10, letterSpacing: "0.15em", color: faint, textDecoration: "none", transition: "color 0.2s" }}>Back to Poet</Link>
      </div>
    </div>
  );
}
