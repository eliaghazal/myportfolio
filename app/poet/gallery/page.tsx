"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

const ink    = "#1c1814";
const paper  = "#f4f1ec";
const rust   = "#b85c38";
const rustDim= "rgba(184,92,56,0.5)";
const dim    = "rgba(28,24,20,0.42)";
const faint  = "rgba(28,24,20,0.12)";
const border = "rgba(28,24,20,0.1)";

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
      if (e.isIntersecting && !fired.current) { fired.current = true; el.style.opacity = "1"; el.style.transform = "translateY(0)"; obs.unobserve(el); }
    }, { threshold: 0, rootMargin: "0px 0px -40px 0px" });
    obs.observe(el); return () => obs.disconnect();
  }, [delay]);
  return ref;
}

function getAspectStyle(ar?: AspectRatio): React.CSSProperties {
  const map: Record<string, string> = { "1:1": "1/1", "16:9": "16/9", "3:4": "3/4", "21:9": "21/9" };
  if (!ar || ar === "original") return { width: "100%", height: "auto", minHeight: "clamp(190px,22vw,280px)", maxHeight: 400 };
  return { width: "100%", aspectRatio: map[ar] ?? "1/1" };
}

/* ── Polaroid Overlay ── */
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
      position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(28,24,20,0.88)", backdropFilter: "blur(16px)",
      opacity: 1, transition: "opacity 0.4s ease",
      padding: "clamp(16px,4vw,40px)",
    }}>
      <div ref={visRef} onClick={e => e.stopPropagation()} style={{
        background: "#faf8f4",
        padding: "clamp(14px,2vw,24px) clamp(14px,2vw,24px) clamp(36px,5vw,56px)",
        boxShadow: "0 32px 100px rgba(28,24,20,0.55)",
        transform: "rotate(-1.5deg)",
        transition: "opacity 0.5s cubic-bezier(0.34,1.56,0.64,1), transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
        maxWidth: "min(90vw, 580px)", width: "100%",
        position: "relative",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 12, right: 14, background: "none", border: "none",
          cursor: "pointer", fontSize: 18, color: "rgba(28,24,20,0.4)", lineHeight: 1, padding: 4,
        }}>✕</button>
        {item.type === "image" && item.imageUrl ? (
          <div style={{ width: "100%", overflow: "hidden", background: "#e8e4de", ...(() => {
            const ar = item.aspect_ratio;
            const map: Record<string, string> = { "1:1": "1/1", "16:9": "16/9", "3:4": "3/4", "21:9": "21/9" };
            if (!ar || ar === "original") return { minHeight: 240, maxHeight: 440 };
            return { aspectRatio: map[ar] ?? "1/1" };
          })() }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.imageUrl} alt={item.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        ) : (
          <div style={{ minHeight: 200, background: "rgba(28,24,20,0.04)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, border: `1px solid ${faint}` }}>
            <p style={{ fontFamily: "var(--font-space)", fontWeight: 600, fontSize: "clamp(14px,1.6vw,20px)", lineHeight: 1.65, color: ink, textAlign: "center", letterSpacing: "-0.01em" }}>&ldquo;{item.text}&rdquo;</p>
          </div>
        )}
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 5 }}>
          {item.caption && <div style={{ fontFamily: "var(--font-space)", fontWeight: 600, fontSize: "clamp(13px,1.1vw,15px)", color: ink, letterSpacing: "-0.01em" }}>{item.caption}</div>}
          {item.poem && <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: rustDim, letterSpacing: "0.18em" }}>— {item.poem}</div>}
          {item.type === "quote" && item.poem && <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: rustDim, letterSpacing: "0.18em" }}>from {item.poem}</div>}
        </div>
      </div>
    </div>
  );
}

/* ── Film Reel ── */
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
      } else if (modeRef.current === "drag") {
        // handled in pointer events
      } else {
        velRef.current *= 0.96;
        posRef.current += velRef.current;
        if (Math.abs(velRef.current) < 0.05) modeRef.current = "auto";
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
    dragStartX.current = e.clientX;
    dragStartPos.current = posRef.current;
    lastX.current = e.clientX;
    lastTime.current = performance.now();
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
    isDragging.current = false;
    modeRef.current = "auto";
  }, []);

  return (
    <div style={{ position: "relative", overflow: "hidden", background: ink, borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`, userSelect: "none" }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Film grain overlay */}
      <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", opacity: 0.035,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundSize: "180px 180px", animation: "grainShift 0.12s steps(1) infinite",
      }} />

      {/* Light leak left */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "clamp(60px,8vw,120px)", height: "100%", zIndex: 2, pointerEvents: "none",
        background: "linear-gradient(to right, rgba(210,120,40,0.18) 0%, rgba(200,100,30,0.08) 40%, transparent 100%)",
        animation: "leakPulse 6s ease-in-out infinite",
      }} />
      {/* Light leak right */}
      <div style={{ position: "absolute", top: 0, right: 0, width: "clamp(60px,8vw,120px)", height: "100%", zIndex: 2, pointerEvents: "none",
        background: "linear-gradient(to left, rgba(210,120,40,0.12) 0%, rgba(200,100,30,0.05) 40%, transparent 100%)",
        animation: "leakPulse 8s ease-in-out infinite 2s",
      }} />

      {/* Sprocket holes top */}
      <div style={{ display: "flex", height: 22, background: "#0a0805", paddingTop: 5, overflow: "hidden", position: "relative", zIndex: 1 }}>
        {Array.from({ length: 120 }).map((_, i) => (
          <div key={i} style={{ width: 22, flexShrink: 0, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 11, height: 9, background: "rgba(244,241,236,0.09)", borderRadius: 2, border: "1px solid rgba(244,241,236,0.06)" }} />
          </div>
        ))}
      </div>

      {/* Track */}
      <div ref={trackRef} style={{ display: "flex", willChange: "transform", cursor: "grab" }}>
        {frames.map((entry, i) => {
          const frameW = "clamp(220px,24vw,340px)";
          const frameH = "clamp(180px,21vw,265px)";
          return (
            <div key={i} style={{
              flexShrink: 0, width: frameW, minHeight: frameH,
              borderRight: "1px solid rgba(244,241,236,0.05)",
              display: "flex", flexDirection: "column",
              justifyContent: entry.kind === "image" ? "flex-start" : "flex-end",
              padding: entry.kind === "image" ? 0 : "clamp(20px,3vw,34px) clamp(14px,2vw,24px)",
              position: "relative", overflow: "hidden",
              cursor: entry.kind === "image" ? "pointer" : "grab",
            }}
              onClick={entry.kind === "image" ? () => onImageClick(entry.item) : undefined}
            >
              {/* Kodak-style frame number */}
              <div style={{ position: "absolute", top: 6, right: 10, zIndex: 2, fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.25em",
                color: entry.kind === "image" ? "rgba(244,241,236,0.55)" : "rgba(244,241,236,0.12)" }}>
                {String((i % combined.length) + 1).padStart(3, "0")}A
              </div>

              {entry.kind === "image" ? (
                <>
                  <div style={{ width: "100%", ...(() => {
                    const ar = entry.aspect_ratio;
                    const map: Record<string, string> = { "1:1": "1/1", "16:9": "16/9", "3:4": "3/4", "21:9": "21/9" };
                    if (!ar || ar === "original") return { minHeight: frameH, flex: 1 };
                    return { aspectRatio: map[ar] ?? "1/1" };
                  })() }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={entry.imageUrl} alt={entry.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                  {(entry.caption || entry.poem) && (
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 100%)", padding: "28px 12px 10px" }}>
                      {entry.caption && <div style={{ fontFamily: "var(--font-space)", fontWeight: 600, fontSize: "clamp(10px,0.9vw,12px)", color: "rgba(244,241,236,0.92)", marginBottom: 3, lineHeight: 1.3 }}>{entry.caption}</div>}
                      {entry.poem && <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "0.18em", color: "rgba(184,92,56,0.82)" }}>— {entry.poem}</div>}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 700, fontSize: "clamp(13px,1.6vw,20px)", lineHeight: 1.25, letterSpacing: "-0.01em", color: paper, marginBottom: 9 }}>{entry.line}</div>
                  <div style={{ fontSize: "clamp(11px,1.2vw,15px)", color: "rgba(244,241,236,0.48)", lineHeight: 1.55, marginBottom: 13 }}>{entry.sub}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "0.22em", color: rustDim }}>— {entry.poem}</div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Sprocket holes bottom */}
      <div style={{ display: "flex", height: 22, background: "#0a0805", paddingBottom: 5, overflow: "hidden", position: "relative", zIndex: 1 }}>
        {Array.from({ length: 120 }).map((_, i) => (
          <div key={i} style={{ width: 22, flexShrink: 0, display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
            <div style={{ width: 11, height: 9, background: "rgba(244,241,236,0.09)", borderRadius: 2, border: "1px solid rgba(244,241,236,0.06)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Masonry Polaroid Card ── */
function MasonryCard({ item, onOpen, delay }: { item: GalleryItem; onOpen: (item: GalleryItem) => void; delay: number }) {
  const rot = item.rotation ?? 0;
  const [hov, setHov] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.opacity = "0"; el.style.transform = `rotate(${rot}deg) translateY(24px)`;
    el.style.transition = `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !fired.current) {
        fired.current = true;
        el.style.opacity = "1"; el.style.transform = `rotate(${rot}deg) translateY(0)`;
        obs.unobserve(el);
      }
    }, { threshold: 0, rootMargin: "0px 0px -30px 0px" });
    obs.observe(el); return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!fired.current) return;
    const el = ref.current; if (!el) return;
    if (hov) {
      el.style.transform = "rotate(0deg) translateY(-8px) scale(1.03)";
      el.style.boxShadow = "0 18px 52px rgba(28,24,20,0.2), 0 2px 8px rgba(28,24,20,0.1)";
    } else {
      el.style.transform = `rotate(${rot}deg) translateY(0)`;
      el.style.boxShadow = "0 4px 24px rgba(28,24,20,0.1), 0 1px 4px rgba(28,24,20,0.07)";
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hov]);

  return (
    <div ref={ref}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onOpen(item)}
      style={{
        background: "#faf8f4",
        padding: "14px 14px 44px",
        boxShadow: "0 4px 24px rgba(28,24,20,0.1), 0 1px 4px rgba(28,24,20,0.07)",
        position: "relative", display: "flex", flexDirection: "column",
        cursor: "pointer", zIndex: hov ? 10 : "auto",
        transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease",
      }}
    >
      {item.type === "image" && item.imageUrl ? (
        <div style={{ width: "100%", overflow: "hidden", background: "#e8e4de", ...getAspectStyle(item.aspect_ratio) }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageUrl} alt={item.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ) : (
        <div style={{ width: "100%", aspectRatio: "1/1", background: "rgba(28,24,20,0.04)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, border: `1px solid ${faint}` }}>
          <p style={{ fontFamily: "var(--font-space)", fontWeight: 600, fontSize: "clamp(11px,1.1vw,13px)", lineHeight: 1.65, color: ink, textAlign: "center", letterSpacing: "-0.01em" }}>&ldquo;{item.text}&rdquo;</p>
        </div>
      )}
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 3 }}>
        {item.caption && <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: dim, letterSpacing: "0.1em" }}>{item.caption}</div>}
        {item.poem && <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: rustDim, letterSpacing: "0.15em" }}>— {item.poem}</div>}
      </div>
    </div>
  );
}

/* ── Floating Particles ── */
const PARTICLE_DATA = Array.from({ length: 18 }, (_, i) => {
  const seed = (i * 7919 + 1) % 100;
  const seed2 = (i * 3571 + 7) % 100;
  const seed3 = (i * 1231 + 3) % 100;
  const seed4 = (i * 9001 + 5) % 100;
  const seed5 = (i * 4567 + 11) % 100;
  const seed6 = (i * 2341 + 13) % 12;
  const seed7 = (i * 8123 + 17) % 6;
  return {
    w: seed / 50 + 1,
    h: seed2 / 50 + 1,
    opacity: seed3 / 333 + 0.1,
    left: seed4,
    top: seed5,
    dur: seed6 + 8,
    delay: seed7,
  };
});

function Particles() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }} aria-hidden="true">
      {PARTICLE_DATA.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          width: p.w + "px",
          height: p.h + "px",
          background: `rgba(184,92,56,${p.opacity})`,
          borderRadius: "50%",
          left: p.left + "%",
          top: p.top + "%",
          animation: `particleDrift ${p.dur}s ease-in-out ${p.delay}s infinite`,
        }} />
      ))}
    </div>
  );
}

/* ── Page ── */
export default function GalleryPage() {
  const [scrolled, setScrolled] = useState(false);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [overlayItem, setOverlayItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    fetch("/api/gallery")
      .then(r => r.ok ? r.json() : [])
      .then((data: Array<GalleryItem & { image_url?: string }>) => {
        const mapped = data.map(item => ({
          ...item,
          imageUrl: item.image_url ?? item.imageUrl,
        }));
        setItems(mapped);
      })
      .catch(() => {});
  }, []);

  const headRef = useFade(0);
  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };
  const closeOverlay = useCallback(() => setOverlayItem(null), []);

  return (
    <div style={{ background: paper, color: ink, minHeight: "100vh", fontFamily: "var(--font-space)", overflowX: "hidden" }}>
      <style>{`
        .gal-link:hover{color:${rust}!important}
        @keyframes grainShift {
          0%{transform:translate(0,0)} 10%{transform:translate(-2%,-2%)} 20%{transform:translate(2%,1%)}
          30%{transform:translate(-1%,2%)} 40%{transform:translate(3%,-1%)} 50%{transform:translate(-2%,3%)}
          60%{transform:translate(1%,-3%)} 70%{transform:translate(-3%,1%)} 80%{transform:translate(2%,2%)}
          90%{transform:translate(-1%,-1%)} 100%{transform:translate(0,0)}
        }
        @keyframes leakPulse {
          0%,100%{opacity:1} 50%{opacity:0.6}
        }
        @keyframes particleDrift {
          0%,100%{transform:translate(0,0) scale(1); opacity:0.7}
          25%{transform:translate(clamp(-8px,-1vw,-4px),clamp(-12px,-2vw,-6px)) scale(1.2); opacity:1}
          50%{transform:translate(clamp(6px,1vw,10px),clamp(-20px,-3vw,-10px)) scale(0.8); opacity:0.5}
          75%{transform:translate(clamp(-5px,-0.8vw,-3px),clamp(-8px,-1.5vw,-4px)) scale(1.1); opacity:0.9}
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {overlayItem && <PolaroidOverlay item={overlayItem} onClose={closeOverlay} />}

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 clamp(24px,6vw,80px)", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", background: scrolled ? "rgba(244,241,236,0.94)" : "transparent", backdropFilter: scrolled ? "blur(12px)" : "none", borderBottom: scrolled ? `1px solid ${border}` : "none", transition: "background 0.35s" }}>
        <Link href="/poet" className="gal-link" style={{ ...mono, fontSize: 11, letterSpacing: "0.2em", color: dim, textDecoration: "none", transition: "color 0.2s" }}>← POET</Link>
        <span style={{ ...mono, fontSize: 10, letterSpacing: "0.25em", color: rustDim }}>GALLERY</span>
      </nav>

      {/* Header with particles */}
      <div style={{ paddingTop: 120, paddingBottom: 56, paddingLeft: "clamp(24px,8vw,120px)", paddingRight: "clamp(24px,8vw,120px)", borderBottom: `1px solid ${border}`, position: "relative" }}>
        <Particles />
        <div ref={headRef} style={{ position: "relative", zIndex: 1 }}>
          <div style={{ ...mono, fontSize: 10, letterSpacing: "0.3em", color: rustDim, marginBottom: 16, textTransform: "uppercase" }}>{"// Gallery"}</div>
          <h1 style={{ fontWeight: 700, fontSize: "clamp(36px,7vw,96px)", letterSpacing: "-0.03em", lineHeight: 1.0, color: ink, marginBottom: 16 }}>Visual<br />Fragments</h1>
          <p style={{ ...mono, fontSize: 10, letterSpacing: "0.15em", color: dim, maxWidth: 400 }}>
            Poem lines as visual objects — atmosphere, imagery, and words that define the Eclipse.
          </p>
        </div>
      </div>

      <FilmReel items={items} onImageClick={setOverlayItem} />

      {/* Masonry grid */}
      <div style={{ padding: "88px clamp(24px,8vw,120px)", position: "relative" }}>
        <div style={{ ...mono, fontSize: 10, letterSpacing: "0.3em", color: rustDim, marginBottom: 48, textTransform: "uppercase" }}>— Fragments & Verses</div>
        <div style={{
          columns: "clamp(160px,20vw,240px)",
          columnGap: "clamp(20px,3vw,40px)",
          columnFill: "balance",
        }}>
          {items.map((item, i) => (
            <div key={item.id} style={{ breakInside: "avoid", marginBottom: "clamp(20px,3vw,40px)", display: "inline-block", width: "100%" }}>
              <MasonryCard item={item} onOpen={setOverlayItem} delay={i * 55} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 72, borderTop: `1px solid ${border}`, paddingTop: 28, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span style={{ ...mono, fontSize: 10, letterSpacing: "0.15em", color: faint }}>{items.length} fragments</span>
          <Link href="/poet" className="gal-link" style={{ ...mono, fontSize: 10, letterSpacing: "0.15em", color: faint, textDecoration: "none", transition: "color 0.2s" }}>← Back to Poet</Link>
        </div>
      </div>
    </div>
  );
}
