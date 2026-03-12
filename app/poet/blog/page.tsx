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
}

/* ── Seed posts (with real full content) ── */
const SEED_POSTS: Post[] = [
  {
    id: "001",
    number: "001",
    date: "Winter 2024",
    tag: "Essay",
    title: "Writing as Sanctuary",
    excerpt: "Writing has always been my sanctuary — a guiding light through the darkest times. Without it, I would never have found the happiness that now colors my world. This is what I wrote in the introduction of the book. I meant every word.",
    readTime: "4 min",
    available: true,
    content: `Writing has always been my sanctuary — a guiding light through the darkest times. Without it, I would never have found the happiness that now colors my world.

This is what I wrote in the introduction of Whispers of the Eclipse. I meant every word. Still do.

I started writing seriously at fifteen. Not because I was talented — I didn't know if I was. I started because I had nowhere else to put what I was feeling. My town in Lebanon was small. The people around me were kind, mostly. But there was no space, not really, for the kind of interior noise I carried.

So I wrote. I wrote about the friends who left without explanation. About the nights I counted the ceiling tiles instead of sleeping. About the strange pride of surviving things that weren't supposed to be survived.

What surprised me was that writing didn't just record pain — it transformed it. Something in the act of finding words for a feeling makes the feeling smaller. Not gone. Smaller. Holdable.

I think this is why I can't stop. Not the poems, not the notes I scrawl at 2am, not this. The page is the one place where everything I've been through becomes material rather than weight.

If you've read the collection, you've already seen the most honest version of me. Fifteen to nineteen years old, trying to make sense of things I had no framework for. I didn't clean it up. I'm glad I didn't.

Write. Even when it hurts. Especially when it hurts.`,
  },
  {
    id: "002",
    number: "002",
    date: "Autumn 2024",
    tag: "Reflection",
    title: "On the Eclipse as Symbol",
    excerpt: "The eclipse doesn't mean darkness wins. It means light and shadow agree, for a moment, to share the same sky. That's what the collection is really about — not the absence of light, but what we learn to do inside its absence.",
    readTime: "6 min",
    available: true,
    content: `The eclipse doesn't mean darkness wins. It means light and shadow agree, for a moment, to share the same sky.

That's what I kept returning to when I was choosing a title for the collection. Not an eclipse as catastrophe. Not an eclipse as the end of something. An eclipse as the most honest moment — the moment when two opposing forces stop pretending the other doesn't exist.

A lot of the poems in Whispers of the Eclipse were written during periods where I felt covered over. Not destroyed. Covered. There's a difference. The sun doesn't die during an eclipse. It's still there, burning exactly as it was before. It just can't reach you directly for a while.

I think that's a more accurate description of what depression, grief, and loneliness actually feel like than the language we usually use. We say darkness. We say loss. But what I kept experiencing was more like being in the shadow of something — still present, still myself, just temporarily unreachable.

The poem "Circle of Love" gets at this most directly: *You're the sun, and I am the moon — together we're the eclipse.* There's no villain there. No hero. Just two things that, when they align a certain way, create something other people stop and stare at.

I want the collection to be read that way. Not as a document of suffering, but as a document of co-existence — light and shadow, engineer and poet, Lebanese and world-facing, broken and building.

Come all. We're witnessing the eclipse.`,
  },
  {
    id: "003",
    number: "003",
    date: "Summer 2024",
    tag: "Craft",
    title: "Why I Write in Images, Not Explanations",
    excerpt: "The first rule I learned: don't explain the emotion. Show the room where it happened. Show the thing on the table. Let the reader bring their own weight to it.",
    readTime: "5 min",
    available: false,
    content: "",
  },
  {
    id: "004",
    number: "004",
    date: "Spring 2024",
    tag: "Personal",
    title: "Being Lebanese and Writing It",
    excerpt: '"Land of God" was the hardest poem in the collection to finish. Not because of the words — but because every time I thought I had written its ending, something happened that made the ending wrong again.',
    readTime: "8 min",
    available: false,
    content: "",
  },
  {
    id: "005",
    number: "005",
    date: "Winter 2023",
    tag: "Essay",
    title: "The Engineer and the Poet Are the Same Person",
    excerpt: "People find it strange. Code and poetry. Logic and feeling. But I think they're more similar than anyone admits — both are systems for making the invisible visible.",
    readTime: "7 min",
    available: false,
    content: "",
  },
];

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
            <div style={{ ...mono, fontSize: 9, letterSpacing: "0.18em", color: faint }}>— ELIA ALGHAZAL</div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Page ── */
export default function BlogPage() {
  const [scrolled, setScrolled]       = useState(false);
  const [adminPosts, setAdminPosts]   = useState<Post[]>([]);
  const [openPost, setOpenPost]       = useState<Post | null>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    try {
      const p = localStorage.getItem("elia_posts");
      if (p) {
        setAdminPosts(
          (JSON.parse(p) as Post[])
            .filter(x => x.published ?? true)
            .map(x => ({ ...x, isAdmin: true, available: true }))
        );
      }
    } catch { /* */ }
  }, []);

  const handleOpen = (post: Post) => {
    // "Soon" posts — no content yet
    if (post.available === false) return;
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

        {/* Admin posts first */}
        {adminPosts.length > 0 && (
          <div style={{ marginBottom: 2 }}>
            <div style={{ ...mono, fontSize: 9, letterSpacing: "0.2em", color: rustDim, padding: "8px 0", borderBottom: `1px solid ${border}`, marginBottom: 1 }}>NEW</div>
            {adminPosts.map(p => (
              <div key={p.id}
                className="post-row"
                data-available="true"
                onClick={() => handleOpen(p)}
                style={{ padding: "clamp(20px,3vw,34px)", borderLeft: `2px solid ${rust}`, background: "rgba(184,92,56,0.03)", display: "grid", gridTemplateColumns: "60px 1fr auto", gap: "clamp(14px,3vw,38px)", alignItems: "start", marginBottom: 1, cursor: "pointer" }}>
                <div style={{ ...mono, fontSize: 11, color: faint, paddingTop: 2 }}>NEW</div>
                <div>
                  <div style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ ...mono, fontSize: 9, letterSpacing: "0.2em", padding: "2px 8px", background: `rgba(184,92,56,0.1)`, color: rust, border: `1px solid rgba(184,92,56,0.2)` }}>{p.tag}</span>
                    <span style={{ ...mono, fontSize: 9, letterSpacing: "0.15em", color: dim }}>{p.date}</span>
                  </div>
                  <h2 className="post-title" style={{ fontWeight: 700, fontSize: "clamp(15px,2vw,22px)", letterSpacing: "-0.01em", color: ink, marginBottom: 10 }}>{p.title}</h2>
                  <p style={{ fontSize: "clamp(12px,1.1vw,14px)", color: dim, lineHeight: 1.8, maxWidth: 560 }}>{p.excerpt}</p>
                </div>
                <div style={{ ...mono, fontSize: 9, letterSpacing: "0.15em", color: rust, whiteSpace: "nowrap", paddingTop: 4 }}>{p.readTime} →</div>
              </div>
            ))}
          </div>
        )}

        {/* Seed posts */}
        <div ref={postsRef} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {SEED_POSTS.map(post => (
            <div key={post.id}
              className="post-row"
              data-available={String(post.available)}
              onClick={() => handleOpen(post)}
              style={{ padding: "clamp(20px,3vw,34px)", borderLeft: `2px solid ${border}`, display: "grid", gridTemplateColumns: "60px 1fr auto", gap: "clamp(14px,3vw,38px)", alignItems: "start", cursor: post.available ? "pointer" : "default" }}>
              <div style={{ ...mono, fontSize: 11, color: faint, paddingTop: 2 }}>{post.number}</div>
              <div>
                <div style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ ...mono, fontSize: 9, letterSpacing: "0.2em", padding: "2px 8px", background: `rgba(184,92,56,0.1)`, color: rust, border: `1px solid rgba(184,92,56,0.2)` }}>{post.tag}</span>
                  <span style={{ ...mono, fontSize: 9, letterSpacing: "0.15em", color: dim }}>{post.date}</span>
                </div>
                <h2 className="post-title" style={{ fontWeight: 700, fontSize: "clamp(15px,2vw,22px)", letterSpacing: "-0.01em", color: ink, marginBottom: 10 }}>{post.title}</h2>
                <p style={{ fontSize: "clamp(12px,1.1vw,14px)", color: dim, lineHeight: 1.8, maxWidth: 560 }}>{post.excerpt}</p>
              </div>
              <div style={{ ...mono, fontSize: 9, letterSpacing: "0.15em", color: post.available ? rust : faint, whiteSpace: "nowrap", paddingTop: 4 }}>
                {post.available ? `${post.readTime} →` : "Soon"}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${border}`, marginTop: 64, paddingTop: 28, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span style={{ ...mono, fontSize: 10, letterSpacing: "0.15em", color: faint }}>ELIA ALGHAZAL © 2026</span>
          <Link href="/poet" style={{ ...mono, fontSize: 10, letterSpacing: "0.15em", color: faint, textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = rust)} onMouseLeave={e => (e.currentTarget.style.color = faint)}>← Back to Poet</Link>
        </div>
      </div>

      {/* Post reader drawer */}
      {openPost && <PostReader post={openPost} onClose={() => setOpenPost(null)} />}
    </div>
  );
}
