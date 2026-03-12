"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const ink    = "#1c1814";
const paper  = "#f4f1ec";
const rust   = "#b85c38";
const rustDim= "rgba(184,92,56,0.5)";
const dim    = "rgba(28,24,20,0.42)";
const faint  = "rgba(28,24,20,0.12)";
const border = "rgba(28,24,20,0.1)";

interface GalleryItem {
  id: string;
  type: "image" | "quote";
  text?: string;
  poem?: string;
  imageUrl?: string;
  caption?: string;
  rotation?: number;
}

const SEED_GALLERY: GalleryItem[] = [
  { id: "g1", type: "quote", text: "The eclipse doesn't steal the sun. It only proves that something brilliant can survive being covered.", poem: "Whispers of the Eclipse", rotation: -2.1 },
  { id: "g2", type: "quote", text: "Write. Even when it hurts. Especially when it hurts.", poem: "Personal note", rotation: 1.8 },
  { id: "g3", type: "quote", text: "I have always imagined my life as a sailing boat, bravely navigating the hazardous sea.", poem: "Introduction", rotation: -1.2 },
  { id: "g4", type: "quote", text: "My heart, the believer, wanted it so badly that reality was excommunicated.", poem: "When Will I Learn?", rotation: 2.5 },
  { id: "g5", type: "quote", text: "She never lost her trust.", poem: "Rosalyn", rotation: -0.8 },
  { id: "g6", type: "quote", text: "Land of God — cedars so tall and resilient, no storm can make you fall.", poem: "Land of God", rotation: 1.4 },
];

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

/* ── Film Reel: accepts all gallery items, merges images into the strip ── */
function FilmReel({ items }: { items: GalleryItem[] }) {
  const trackRef  = useRef<HTMLDivElement>(null);
  const animRef   = useRef<number>(0);
  const posRef    = useRef(0);
  const pausedRef = useRef(false);

  // Pull out uploaded images
  const imageItems = items.filter(it => it.type === "image" && it.imageUrl);

  // Build combined reel: interleave an image every 3 poem frames
  type ReelEntry =
    | { kind: "poem"; line: string; sub: string; poem: string }
    | { kind: "image"; imageUrl: string; caption?: string; poem?: string };

  const combined: ReelEntry[] = [];
  let imgIdx = 0;
  POEM_REEL.forEach((p, i) => {
    combined.push({ kind: "poem", ...p });
    if ((i + 1) % 3 === 0 && imgIdx < imageItems.length) {
      const img = imageItems[imgIdx++];
      combined.push({ kind: "image", imageUrl: img.imageUrl!, caption: img.caption, poem: img.poem });
    }
  });
  while (imgIdx < imageItems.length) {
    const img = imageItems[imgIdx++];
    combined.push({ kind: "image", imageUrl: img.imageUrl!, caption: img.caption, poem: img.poem });
  }

  const frames = [...combined, ...combined]; // duplicate for seamless loop

  useEffect(() => {
    const track = trackRef.current; if (!track) return;
    const speed = 0.55;
    const animate = () => {
      if (!pausedRef.current) {
        posRef.current -= speed;
        const half = track.scrollWidth / 2;
        if (Math.abs(posRef.current) >= half) posRef.current = 0;
        track.style.transform = `translateX(${posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combined.length]); // restart animation when new images added

  return (
    <div
      style={{ position: "relative", overflow: "hidden", background: ink, borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      {/* Perforations top */}
      <div style={{ display: "flex", height: 18, background: ink, paddingTop: 4, overflow: "hidden" }}>
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} style={{ width: 20, flexShrink: 0, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 10, height: 8, background: "rgba(244,241,236,0.08)", borderRadius: 1 }} />
          </div>
        ))}
      </div>

      {/* Track */}
      <div ref={trackRef} style={{ display: "flex", willChange: "transform" }}>
        {frames.map((entry, i) => (
          <div key={i} style={{
            flexShrink: 0,
            width: "clamp(240px,26vw,360px)",
            minHeight: "clamp(190px,22vw,275px)",
            borderRight: "1px solid rgba(244,241,236,0.06)",
            display: "flex", flexDirection: "column",
            justifyContent: entry.kind === "image" ? "flex-start" : "flex-end",
            padding: entry.kind === "image" ? 0 : "clamp(22px,3vw,38px) clamp(16px,2vw,26px)",
            position: "relative", overflow: "hidden",
          }}>
            {/* Frame number */}
            <div style={{ position: "absolute", top: 10, right: 12, zIndex: 2, fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", color: entry.kind === "image" ? "rgba(244,241,236,0.6)" : "rgba(244,241,236,0.14)" }}>
              {String(i % combined.length + 1).padStart(2, "0")}
            </div>

            {entry.kind === "image" ? (
              <>
                <img src={entry.imageUrl} alt={entry.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", minHeight: "clamp(190px,22vw,275px)" }} />
                {(entry.caption || entry.poem) && (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)", padding: "28px 14px 12px" }}>
                    {entry.caption && <div style={{ fontFamily: "var(--font-space)", fontWeight: 600, fontSize: "clamp(11px,1vw,13px)", color: "rgba(244,241,236,0.92)", marginBottom: 4, lineHeight: 1.3 }}>{entry.caption}</div>}
                    {entry.poem && <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.16em", color: "rgba(184,92,56,0.82)" }}>— {entry.poem}</div>}
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ fontWeight: 700, fontSize: "clamp(14px,1.7vw,21px)", lineHeight: 1.25, letterSpacing: "-0.01em", color: paper, marginBottom: 10 }}>{entry.line}</div>
                <div style={{ fontSize: "clamp(12px,1.3vw,16px)", color: "rgba(244,241,236,0.5)", lineHeight: 1.55, marginBottom: 14 }}>{entry.sub}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.2em", color: rustDim }}>— {entry.poem}</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Perforations bottom */}
      <div style={{ display: "flex", height: 18, background: ink, paddingBottom: 4, overflow: "hidden" }}>
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} style={{ width: 20, flexShrink: 0, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 10, height: 8, background: "rgba(244,241,236,0.08)", borderRadius: 1, marginTop: "auto" }} />
          </div>
        ))}
      </div>

      {/* Edge fades */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 80, height: "100%", background: `linear-gradient(to right, ${ink}, transparent)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: "100%", background: `linear-gradient(to left, ${ink}, transparent)`, pointerEvents: "none" }} />
    </div>
  );
}

/* ── Polaroid ── */
function Polaroid({ item }: { item: GalleryItem }) {
  const rot = item.rotation ?? 0;
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#faf8f4",
        padding: "14px 14px 44px",
        boxShadow: hov ? "0 18px 52px rgba(28,24,20,0.2), 0 2px 8px rgba(28,24,20,0.1)" : "0 4px 24px rgba(28,24,20,0.1), 0 1px 4px rgba(28,24,20,0.07)",
        transform: hov ? "rotate(0deg) translateY(-8px) scale(1.03)" : `rotate(${rot}deg)`,
        transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease",
        position: "relative", display: "flex", flexDirection: "column",
        zIndex: hov ? 10 : "auto",
      }}
    >
      {item.type === "image" && item.imageUrl ? (
        <div style={{ width: "100%", aspectRatio: "1/1", overflow: "hidden", background: "#e8e4de" }}>
          <img src={item.imageUrl} alt={item.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ) : (
        <div style={{ width: "100%", aspectRatio: "1/1", background: "rgba(28,24,20,0.04)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, border: `1px solid ${faint}` }}>
          <p style={{ fontFamily: "var(--font-space)", fontWeight: 600, fontSize: "clamp(11px,1.1vw,13px)", lineHeight: 1.65, color: ink, textAlign: "center", letterSpacing: "-0.01em" }}>"{item.text}"</p>
        </div>
      )}
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 3 }}>
        {item.caption && <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: dim, letterSpacing: "0.1em" }}>{item.caption}</div>}
        {item.poem && <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: rustDim, letterSpacing: "0.15em" }}>— {item.poem}</div>}
      </div>
    </div>
  );
}

/* ── Page ── */
export default function GalleryPage() {
  const [scrolled, setScrolled] = useState(false);
  const [items, setItems] = useState<GalleryItem[]>(SEED_GALLERY);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("elia_gallery");
      if (stored) setItems([...SEED_GALLERY, ...(JSON.parse(stored) as GalleryItem[])]);
    } catch { /* */ }
  }, []);

  const headRef = useFade(0);
  const gridRef = useFade(100);
  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  return (
    <div style={{ background: paper, color: ink, minHeight: "100vh", fontFamily: "var(--font-space)", overflowX: "hidden" }}>
      <style>{`.gal-link:hover{color:${rust}!important}`}</style>

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 clamp(24px,6vw,80px)", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", background: scrolled ? "rgba(244,241,236,0.94)" : "transparent", backdropFilter: scrolled ? "blur(12px)" : "none", borderBottom: scrolled ? `1px solid ${border}` : "none", transition: "background 0.35s" }}>
        <Link href="/poet" className="gal-link" style={{ ...mono, fontSize: 11, letterSpacing: "0.2em", color: dim, textDecoration: "none", transition: "color 0.2s" }}>← POET</Link>
        <span style={{ ...mono, fontSize: 10, letterSpacing: "0.25em", color: rustDim }}>GALLERY</span>
      </nav>

      <div style={{ paddingTop: 120, paddingBottom: 56, paddingLeft: "clamp(24px,8vw,120px)", paddingRight: "clamp(24px,8vw,120px)", borderBottom: `1px solid ${border}` }}>
        <div ref={headRef}>
          <div style={{ ...mono, fontSize: 10, letterSpacing: "0.3em", color: rustDim, marginBottom: 16, textTransform: "uppercase" }}>// Gallery</div>
          <h1 style={{ fontWeight: 700, fontSize: "clamp(36px,7vw,96px)", letterSpacing: "-0.03em", lineHeight: 1.0, color: ink, marginBottom: 16 }}>Visual<br />Fragments</h1>
          <p style={{ ...mono, fontSize: 10, letterSpacing: "0.15em", color: dim, maxWidth: 400 }}>
            Poem lines as visual objects — atmosphere, imagery, and words that define the Eclipse.
          </p>
        </div>
      </div>

      <FilmReel items={items} />

      <div style={{ padding: "88px clamp(24px,8vw,120px)" }}>
        <div style={{ ...mono, fontSize: 10, letterSpacing: "0.3em", color: rustDim, marginBottom: 48, textTransform: "uppercase" }}>— Fragments & Verses</div>
        <div ref={gridRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(clamp(180px,20vw,250px), 1fr))", gap: "clamp(24px,4vw,52px)", alignItems: "start" }}>
          {items.map(item => <Polaroid key={item.id} item={item} />)}
        </div>
        <div style={{ marginTop: 72, borderTop: `1px solid ${border}`, paddingTop: 28, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span style={{ ...mono, fontSize: 10, letterSpacing: "0.15em", color: faint }}>{items.length} fragments</span>
          <Link href="/poet" className="gal-link" style={{ ...mono, fontSize: 10, letterSpacing: "0.15em", color: faint, textDecoration: "none", transition: "color 0.2s" }}>← Back to Poet</Link>
        </div>
      </div>
    </div>
  );
}
