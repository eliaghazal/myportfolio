"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Post {
  id: string;
  title: string;
  date: string;
  tag: string;
  excerpt: string;
  content: string;
  read_time: string;
  published: boolean;
  category?: string;
}

function useFade(delay = 0) {
  const ref = { current: null as HTMLDivElement | null };
  const fired = { current: false };
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.opacity = "0"; el.style.transform = "translateY(16px)";
    el.style.transition = `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !fired.current) {
        fired.current = true; el.style.opacity = "1"; el.style.transform = "translateY(0)"; obs.unobserve(el);
      }
    }, { threshold: 0, rootMargin: "0px 0px -40px 0px" });
    obs.observe(el); return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay]);
  return ref;
}

export default function DevlogPostPage() {
  const params = useParams();
  const id = params?.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/posts?category=devlog`)
      .then(r => r.ok ? r.json() : [])
      .then((posts: Post[]) => {
        const found = posts.find(p => p.id === id);
        setPost(found ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const gn = "#39ff14";
  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };
  const headRef = useFade(0);
  const bodyRef = useFade(100);

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", fontFamily: "var(--font-space)", overflowX: "hidden" }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .devlog-back:hover { color: ${gn} !important; }
      `}</style>

      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 clamp(24px,6vw,80px)", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(0,0,0,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(57,255,20,0.06)" : "none",
        transition: "background 0.4s",
      }}>
        <Link href="/engineer" className="devlog-back" style={{ ...mono, fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.38)", textDecoration: "none", transition: "color 0.2s" }}>← ENGINEER</Link>
        <span style={{ ...mono, fontSize: 10, letterSpacing: "0.25em", color: "rgba(57,255,20,0.5)" }}>DEVLOG</span>
      </nav>

      <div style={{ paddingTop: 100, paddingBottom: 80, maxWidth: 760, margin: "0 auto", padding: "100px clamp(24px,8vw,80px) 80px" }}>
        {loading ? (
          <div style={{ ...mono, fontSize: 12, color: "rgba(57,255,20,0.4)", letterSpacing: "0.14em", paddingTop: 40 }}>
            Loading<span style={{ animation: "blink 1s step-end infinite" }}>▌</span>
          </div>
        ) : !post ? (
          <div style={{ ...mono, fontSize: 13, color: "rgba(255,255,255,0.3)", paddingTop: 40 }}>
            Post not found. <Link href="/engineer" style={{ color: gn, textDecoration: "none" }}>← Back</Link>
          </div>
        ) : (
          <>
            <div ref={headRef}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
                <span style={{ ...mono, fontSize: 9, padding: "2px 10px", background: "rgba(57,255,20,0.08)", color: gn, border: "1px solid rgba(57,255,20,0.2)" }}>{post.tag}</span>
                <span style={{ ...mono, fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{post.date}</span>
                <span style={{ ...mono, fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{post.read_time}</span>
              </div>
              <h1 style={{ fontWeight: 700, fontSize: "clamp(28px,5vw,56px)", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 24, color: "#fff" }}>
                {post.title}
              </h1>
              <p style={{ fontSize: "clamp(14px,1.4vw,17px)", color: "rgba(255,255,255,0.45)", lineHeight: 1.75, marginBottom: 40, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 32 }}>
                {post.excerpt}
              </p>
            </div>
            <div ref={bodyRef} style={{ fontSize: "clamp(14px,1.3vw,16px)", color: "rgba(255,255,255,0.7)", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
              {post.content}
            </div>
            <div style={{ marginTop: 64, paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <Link href="/engineer#devlog" className="devlog-back" style={{ ...mono, fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s" }}>← Back to Devlog</Link>
              <span style={{ ...mono, fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.15)" }}>ELIA GHAZAL © 2026</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
