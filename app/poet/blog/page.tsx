"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const ink    = "#1c1814";
const paper  = "#f4f1ec";
const rust   = "#b85c38";
const rustDim = "rgba(184,92,56,0.55)";
const dim    = "rgba(28,24,20,0.42)";
const faint  = "rgba(28,24,20,0.14)";
const border = "rgba(28,24,20,0.1)";

/* ── Types ── */
interface Post {
  id: string;
  number?: string;
  title: string;
  date: string;
  tag: string;
  excerpt: string;
  content: string;
  readTime: string;
  available?: boolean;
  isAdmin?: boolean;
  published?: boolean;
}



/* ── Hooks ── */
function makeObs(cb: () => void) {
  return new IntersectionObserver(([e]) => { if (e.isIntersecting) cb(); }, { threshold: 0, rootMargin: "0px 0px -40px 0px" });
}
function useFade(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.opacity = "0"; el.style.transform = "translateY(14px)";
    el.style.transition = `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`;
    const obs = makeObs(() => { if (fired.current) return; fired.current = true; el.style.opacity = "1"; el.style.transform = "translateY(0)"; obs.unobserve(el); });
    obs.observe(el); return () => obs.disconnect();
  }, [delay]);
  return ref;
}
function useStagger(ms = 80) {
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    (Array.from(c.children) as HTMLElement[]).forEach((el, i) => {
      el.style.opacity = "0"; el.style.transform = "translateY(14px)";
      el.style.transition = `opacity 0.55s ease ${i * ms}ms, transform 0.55s ease ${i * ms}ms`;
    });
    const obs = makeObs(() => { if (fired.current) return; fired.current = true;
      (Array.from(c.children) as HTMLElement[]).forEach(el => { el.style.opacity = "1"; el.style.transform = "translateY(0)"; }); obs.unobserve(c); });
    obs.observe(c); return () => obs.disconnect();
  }, [ms]);
  return ref;
}

/* ── Post Reader Drawer ── */
function PostReader({ post, onClose }: { post: Post; onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 380);
  };

  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  // Render content: split by double newline into paragraphs
  const paragraphs = post.content.split(/\n\n+/).filter(Boolean);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(28,24,20,0.45)", opacity: visible ? 1 : 0, transition: "opacity 0.38s ease", backdropFilter: "blur(2px)" }}
      />

      {/* Drawer panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 201,
        width: "clamp(320px, 52vw, 680px)",
        maxWidth: "100vw",
        background: paper,
        boxShadow: "-8px 0 48px rgba(28,24,20,0.16)",
        transform: visible ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.38s cubic-bezier(0.16,1,0.3,1)",
        display: "flex", flexDirection: "column",
        overflowY: "auto",
      }}>
        {/* Drawer header */}
        <div style={{ padding: "20px 32px 18px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: paper, zIndex: 10 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ ...mono, fontSize: 9, letterSpacing: "0.2em", padding: "2px 8px", background: `rgba(184,92,56,0.1)`, color: rust, border: `1px solid rgba(184,92,56,0.2)` }}>{post.tag}</span>
            <span style={{ ...mono, fontSize: 9, letterSpacing: "0.15em", color: dim }}>{post.date} · {post.readTime}</span>
          </div>
          <button onClick={handleClose} style={{ background: "none", border: "none", cursor: "pointer", ...mono, fontSize: 11, letterSpacing: "0.15em", color: dim, padding: "4px 8px", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = ink)}
            onMouseLeave={e => (e.currentTarget.style.color = dim)}
          >✕ CLOSE</button>
        </div>

        {/* Article body */}
        <div style={{ padding: "40px 32px 80px", flex: 1 }}>
          <h1 style={{ fontWeight: 700, fontSize: "clamp(22px,3vw,34px)", letterSpacing: "-0.02em", lineHeight: 1.15, color: ink, marginBottom: 36 }}>
            {post.title}
          </h1>

          {paragraphs.length > 0 ? (
            paragraphs.map((para, i) => (
              <p key={i} style={{ fontSize: "clamp(14px,1.3vw,16px)", color: i === 0 ? ink : dim, lineHeight: 1.95, marginBottom: 24, fontStyle: i === 0 ? "italic" : "normal" }}>
                {para}
              </p>
            ))
          ) : (
            <p style={{ fontSize: 15, color: dim, lineHeight: 1.9, fontStyle: "italic" }}>
              Full text coming soon.
            </p>
          )}

          {/* Footer inside drawer */}
          <div style={{ marginTop: 56, paddingTop: 24, borderTop: `1px solid ${border}` }}>
            <div style={{ ...mono, fontSize: 9, letterSpacing: "0.18em", color: faint }}>— ELIA GHAZAL</div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Page ── */
export default function BlogPage() {
  const [scrolled, setScrolled]       = useState(false);
  const [posts, setPosts]             = useState<Post[]>([]);
  const [openPost, setOpenPost]       = useState<Post | null>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    fetch("/api/posts?all=true")
      .then(r => r.ok ? r.json() : [])
      .then((data: Array<Post & { read_time?: string }>) => {
        setPosts(
          data.map(x => ({ ...x, readTime: x.read_time ?? x.readTime ?? "" }))
        );
      })
      .catch(() => {});
  }, []);

  const handleOpen = (post: Post) => {
    if (!post.published || !post.content) return;
    setOpenPost(post);
  };

  const headRef  = useFade(0);
  const postsRef = useStagger(80);
  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  return (
    <div style={{ background: paper, color: ink, minHeight: "100vh", fontFamily: "var(--font-space)", overflowX: "hidden" }}>
      <style>{`
        .post-row { transition: border-left-color 0.22s, background 0.22s; }
        .post-row[data-available="true"]:hover { border-left-color: ${rust} !important; background: rgba(184,92,56,0.03) !important; }
        .post-row[data-available="true"]:hover .post-title { color: ${rust} !important; }
        .post-title { transition: color 0.22s; }
      `}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 clamp(24px,6vw,80px)", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", background: scrolled ? "rgba(244,241,236,0.94)" : "transparent", backdropFilter: scrolled ? "blur(12px)" : "none", borderBottom: scrolled ? `1px solid ${border}` : "none", transition: "background 0.35s" }}>
        <Link href="/poet" style={{ ...mono, fontSize: 11, letterSpacing: "0.2em", color: dim, textDecoration: "none", transition: "color 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.color = rust)} onMouseLeave={e => (e.currentTarget.style.color = dim)}>← POET</Link>
        <span style={{ ...mono, fontSize: 10, letterSpacing: "0.25em", color: rustDim, textTransform: "uppercase" }}>Journal</span>
      </nav>

      <div style={{ padding: "120px clamp(24px,8vw,120px) 88px", maxWidth: 1060, margin: "0 auto" }}>

        {/* Header */}
        <div ref={headRef} style={{ marginBottom: 72, borderBottom: `1px solid ${border}`, paddingBottom: 48 }}>
          <div style={{ ...mono, fontSize: 10, letterSpacing: "0.3em", color: rustDim, marginBottom: 16, textTransform: "uppercase" }}>// Journal</div>
          <h1 style={{ fontWeight: 700, fontSize: "clamp(36px,6vw,80px)", letterSpacing: "-0.03em", lineHeight: 1.0, color: ink, marginBottom: 20 }}>
            Writing &<br />Reflections
          </h1>
          <p style={{ fontSize: "clamp(13px,1.2vw,15px)", color: dim, lineHeight: 1.85, maxWidth: 480 }}>
            Essays on poetry, craft, survival, and the strange experience of being a builder who also writes.
          </p>
        </div>

        {/* All posts — unified list */}
        <div ref={postsRef} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {posts.map(post => {
            const available = !!(post.published && post.content);
            const numDisplay = /^\d+$/.test(post.id) ? post.id : "";
            return (
              <div key={post.id}
                className="post-row"
                data-available={String(available)}
                onClick={() => handleOpen(post)}
                style={{ padding: "clamp(16px,3vw,34px)", borderLeft: `2px solid ${available ? rust : border}`, background: available ? "rgba(184,92,56,0.03)" : "transparent", display: "grid", gridTemplateColumns: "clamp(32px,5vw,60px) 1fr auto", gap: "clamp(10px,3vw,38px)", alignItems: "start", marginBottom: 1, cursor: available ? "pointer" : "default" }}>
                <div style={{ ...mono, fontSize: 11, color: faint, paddingTop: 2 }}>{numDisplay}</div>
                <div>
                  <div style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ ...mono, fontSize: 9, letterSpacing: "0.2em", padding: "2px 8px", background: `rgba(184,92,56,0.1)`, color: rust, border: `1px solid rgba(184,92,56,0.2)` }}>{post.tag}</span>
                    <span style={{ ...mono, fontSize: 9, letterSpacing: "0.15em", color: dim }}>{post.date}</span>
                  </div>
                  <h2 className="post-title" style={{ fontWeight: 700, fontSize: "clamp(15px,2vw,22px)", letterSpacing: "-0.01em", color: ink, marginBottom: 10 }}>{post.title}</h2>
                  <p style={{ fontSize: "clamp(12px,1.1vw,14px)", color: dim, lineHeight: 1.8, maxWidth: 560 }}>{post.excerpt}</p>
                </div>
                <div style={{ ...mono, fontSize: 9, letterSpacing: "0.15em", color: available ? rust : faint, whiteSpace: "nowrap", paddingTop: 4 }}>
                  {available ? `${post.readTime} →` : "Soon"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${border}`, marginTop: 64, paddingTop: 28, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span style={{ ...mono, fontSize: 10, letterSpacing: "0.15em", color: faint }}>ELIA GHAZAL © 2026</span>
          <Link href="/poet" style={{ ...mono, fontSize: 10, letterSpacing: "0.15em", color: faint, textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = rust)} onMouseLeave={e => (e.currentTarget.style.color = faint)}>← Back to Poet</Link>
        </div>
      </div>

      {/* Post reader drawer */}
      {openPost && <PostReader post={openPost} onClose={() => setOpenPost(null)} />}
    </div>
  );
}
