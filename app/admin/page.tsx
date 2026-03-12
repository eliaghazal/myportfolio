"use client";

import { useEffect, useRef, useState } from "react";

/* ─── Palette (admin uses dark neutral to feel professional) ─── */
const bg    = "#111110";
const surface = "#1a1917";
const card  = "#1f1e1c";
const border = "rgba(255,255,255,0.08)";
const text  = "#f0ece6";
const dim   = "rgba(240,236,230,0.45)";
const faint = "rgba(240,236,230,0.14)";
const rust  = "#c4673e";
const rustDim = "rgba(196,103,62,0.5)";
const green = "#4caf82";
const red   = "#c45050";

/* ─── Types ─── */
interface Post {
  id: string;
  title: string;
  date: string;
  tag: string;
  excerpt: string;
  content: string;
  readTime: string;
  published: boolean;
}

interface GalleryItem {
  id: string;
  type: "image" | "quote";
  text?: string;
  poem?: string;
  imageUrl?: string;
  caption?: string;
  rotation?: number;
}

const TAGS = ["Essay", "Reflection", "Craft", "Personal", "Poetry", "News"];

const PASS = "eclipse2024"; // simple password — change to your own

/* ─── Utility ─── */
const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" });

/* ─── Input styles ─── */
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px",
  background: surface, border: `1px solid ${border}`,
  color: text, fontSize: 13, fontFamily: "var(--font-space)",
  outline: "none", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)", fontSize: 10,
  letterSpacing: "0.2em", color: dim,
  display: "block", marginBottom: 6, textTransform: "uppercase",
};
const btnStyle = (accent = rust): React.CSSProperties => ({
  padding: "10px 22px", background: accent, color: "#fff",
  border: "none", cursor: "pointer", fontFamily: "var(--font-mono)",
  fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
});

/* ─── Page ─── */
export default function AdminPage() {
  const [authed, setAuthed]       = useState(false);
  const [passInput, setPassInput] = useState("");
  const [passErr, setPassErr]     = useState(false);
  const [tab, setTab]             = useState<"blog" | "gallery">("blog");

  /* Blog state */
  const [posts, setPosts]         = useState<Post[]>([]);
  const [editPost, setEditPost]   = useState<Post | null>(null);
  const [postForm, setPostForm]   = useState({ title: "", date: now(), tag: "Essay", excerpt: "", content: "", readTime: "5 min", published: false });

  /* Gallery state */
  const [gallery, setGallery]     = useState<GalleryItem[]>([]);
  const [galForm, setGalForm]     = useState({ type: "quote" as "image" | "quote", text: "", poem: "", caption: "", rotation: 0 });
  const [imgPreview, setImgPreview] = useState<string | null>(null);

  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null);
  const fileRef                   = useRef<HTMLInputElement>(null);

  /* Load from localStorage */
  useEffect(() => {
    try {
      const p = localStorage.getItem("elia_posts");
      if (p) setPosts(JSON.parse(p));
      const g = localStorage.getItem("elia_gallery");
      if (g) setGallery(JSON.parse(g));
    } catch { /* */ }
  }, []);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const savePosts = (next: Post[]) => {
    setPosts(next);
    localStorage.setItem("elia_posts", JSON.stringify(next));
  };
  const saveGallery = (next: GalleryItem[]) => {
    setGallery(next);
    localStorage.setItem("elia_gallery", JSON.stringify(next));
  };

  /* ── Auth ── */
  if (!authed) return (
    <div style={{ background: bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-space)" }}>
      <div style={{ width: 340, padding: "40px 36px", background: surface, border: `1px solid ${border}` }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.3em", color: rustDim, marginBottom: 20 }}>// ADMIN</div>
        <h1 style={{ fontWeight: 700, fontSize: 22, color: text, marginBottom: 24 }}>Sign in</h1>
        <label style={labelStyle}>Password</label>
        <input type="password" value={passInput} onChange={e => setPassInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              if (passInput === PASS) { setAuthed(true); setPassErr(false); }
              else setPassErr(true);
            }
          }}
          style={{ ...inputStyle, marginBottom: 12, borderColor: passErr ? red : border }}
          placeholder="Enter password" autoFocus />
        {passErr && <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: red, marginBottom: 12 }}>Incorrect password</div>}
        <button style={{ ...btnStyle(), width: "100%" }} onClick={() => {
          if (passInput === PASS) { setAuthed(true); setPassErr(false); } else setPassErr(true);
        }}>Enter</button>
      </div>
    </div>
  );

  /* ── Blog post handlers ── */
  const resetPostForm = () => {
    setEditPost(null);
    setPostForm({ title: "", date: now(), tag: "Essay", excerpt: "", content: "", readTime: "5 min", published: false });
  };
  const loadPostForEdit = (p: Post) => {
    setEditPost(p);
    setPostForm({ title: p.title, date: p.date, tag: p.tag, excerpt: p.excerpt, content: p.content, readTime: p.readTime, published: p.published });
  };
  const savePost = () => {
    if (!postForm.title.trim()) { showToast("Title is required", false); return; }
    if (editPost) {
      savePosts(posts.map(p => p.id === editPost.id ? { ...editPost, ...postForm } : p));
      showToast("Post updated");
    } else {
      savePosts([{ id: uid(), ...postForm }, ...posts]);
      showToast("Post created");
    }
    resetPostForm();
  };
  const deletePost = (id: string) => { savePosts(posts.filter(p => p.id !== id)); showToast("Post deleted"); };
  const togglePublish = (id: string) => { savePosts(posts.map(p => p.id === id ? { ...p, published: !p.published } : p)); };

  /* ── Gallery handlers ── */
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setImgPreview(ev.target?.result as string); };
    reader.readAsDataURL(file);
  };
  const saveGalleryItem = () => {
    if (galForm.type === "quote" && !galForm.text.trim()) { showToast("Quote text required", false); return; }
    if (galForm.type === "image" && !imgPreview) { showToast("Please select an image", false); return; }
    const item: GalleryItem = {
      id: uid(), type: galForm.type, rotation: (Math.random() - 0.5) * 5,
      ...(galForm.type === "quote" ? { text: galForm.text, poem: galForm.poem || undefined } : {}),
      ...(galForm.type === "image" ? { imageUrl: imgPreview!, caption: galForm.caption || undefined, poem: galForm.poem || undefined } : {}),
    };
    saveGallery([...gallery, item]);
    setGalForm({ type: "quote", text: "", poem: "", caption: "", rotation: 0 });
    setImgPreview(null);
    if (fileRef.current) fileRef.current.value = "";
    showToast("Added to gallery");
  };
  const deleteGalleryItem = (id: string) => { saveGallery(gallery.filter(g => g.id !== id)); showToast("Removed"); };

  const F = postForm; const SF = setPostForm;

  return (
    <div style={{ background: bg, minHeight: "100vh", color: text, fontFamily: "var(--font-space)" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, padding: "12px 20px", background: toast.ok ? green : red, color: "#fff", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.15em", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header style={{ padding: "0 clamp(24px,5vw,60px)", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${border}`, background: surface }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.3em", color: rustDim }}>ELIA · ADMIN</span>
          <span style={{ width: 1, height: 16, background: border }} />
          <div style={{ display: "flex", gap: 1 }}>
            {(["blog", "gallery"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "6px 16px", background: tab === t ? rust : "transparent", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.18em", color: tab === t ? "#fff" : dim, textTransform: "uppercase", transition: "all 0.2s" }}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/poet/blog" target="_blank" style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", color: dim, textDecoration: "none", padding: "6px 12px", border: `1px solid ${border}` }}>↗ BLOG</a>
          <a href="/poet/gallery" target="_blank" style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", color: dim, textDecoration: "none", padding: "6px 12px", border: `1px solid ${border}` }}>↗ GALLERY</a>
        </div>
      </header>

      <div style={{ padding: "32px clamp(24px,5vw,60px)", maxWidth: 1100, margin: "0 auto" }}>

        {/* ══ BLOG TAB ══ */}
        {tab === "blog" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 2, alignItems: "start" }}>

            {/* Post list */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: dim }}>{posts.length} POSTS</span>
                <button onClick={resetPostForm} style={{ ...btnStyle(), fontSize: 9 }}>+ New Post</button>
              </div>

              {posts.length === 0 && (
                <div style={{ padding: "40px 20px", textAlign: "center", border: `1px dashed ${border}`, color: faint, fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.15em" }}>
                  No posts yet. Create one →
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {posts.map(p => (
                  <div key={p.id} style={{ padding: "14px 16px", background: card, border: `1px solid ${border}`, display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, padding: "1px 7px", background: `rgba(196,103,62,0.15)`, color: rust, border: `1px solid rgba(196,103,62,0.2)` }}>{p.tag}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: faint }}>{p.date}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: p.published ? green : faint }}>{p.published ? "● Live" : "○ Draft"}</span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: text, marginBottom: 4 }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: dim, lineHeight: 1.5, maxWidth: 400 }}>{p.excerpt.slice(0, 100)}{p.excerpt.length > 100 ? "…" : ""}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <button onClick={() => togglePublish(p.id)} style={{ ...btnStyle(p.published ? "#444" : green), fontSize: 8, padding: "6px 10px" }}>{p.published ? "Unpublish" : "Publish"}</button>
                      <button onClick={() => loadPostForEdit(p)} style={{ ...btnStyle("#333"), fontSize: 8, padding: "6px 10px" }}>Edit</button>
                      <button onClick={() => deletePost(p.id)} style={{ ...btnStyle(red), fontSize: 8, padding: "6px 10px" }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Post editor */}
            <div style={{ background: card, border: `1px solid ${border}`, padding: "24px 20px", position: "sticky", top: 24 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: rustDim, marginBottom: 20 }}>
                {editPost ? "✎ EDITING" : "+ NEW POST"}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={labelStyle}>Title *</label>
                  <input value={F.title} onChange={e => SF(f => ({ ...f, title: e.target.value }))} placeholder="Post title…" style={inputStyle} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={labelStyle}>Date</label>
                    <input value={F.date} onChange={e => SF(f => ({ ...f, date: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Read time</label>
                    <input value={F.readTime} onChange={e => SF(f => ({ ...f, readTime: e.target.value }))} placeholder="5 min" style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Tag</label>
                  <select value={F.tag} onChange={e => SF(f => ({ ...f, tag: e.target.value }))}
                    style={{ ...inputStyle, appearance: "none" }}>
                    {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Excerpt *</label>
                  <textarea value={F.excerpt} onChange={e => SF(f => ({ ...f, excerpt: e.target.value }))} rows={3} placeholder="Short description shown in the blog list…" style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
                </div>

                <div>
                  <label style={labelStyle}>Full content</label>
                  <textarea value={F.content} onChange={e => SF(f => ({ ...f, content: e.target.value }))} rows={10} placeholder="Write your full post here (Markdown supported)…" style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7, fontFamily: "var(--font-mono)", fontSize: 12 }} />
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={F.published} onChange={e => SF(f => ({ ...f, published: e.target.checked }))} style={{ accentColor: rust }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", color: dim }}>PUBLISH NOW</span>
                </label>

                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button onClick={savePost} style={{ ...btnStyle(), flex: 1 }}>{editPost ? "Save Changes" : "Create Post"}</button>
                  {editPost && <button onClick={resetPostForm} style={{ ...btnStyle("#333"), padding: "10px 14px" }}>Cancel</button>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ GALLERY TAB ══ */}
        {tab === "gallery" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 2, alignItems: "start" }}>

            {/* Gallery grid */}
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: dim, marginBottom: 16 }}>{gallery.length} ITEMS</div>

              {gallery.length === 0 && (
                <div style={{ padding: "40px 20px", textAlign: "center", border: `1px dashed ${border}`, color: faint, fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.15em" }}>
                  No gallery items yet. Add one →
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 2 }}>
                {gallery.map(item => (
                  <div key={item.id} style={{ background: card, border: `1px solid ${border}`, padding: 12, position: "relative" }}>
                    {item.type === "image" && item.imageUrl ? (
                      <img src={item.imageUrl} alt="" style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block", marginBottom: 8 }} />
                    ) : (
                      <div style={{ width: "100%", aspectRatio: "1/1", background: surface, display: "flex", alignItems: "center", justifyContent: "center", padding: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: dim, fontStyle: "italic", textAlign: "center", lineHeight: 1.5 }}>"{item.text?.slice(0, 60)}…"</span>
                      </div>
                    )}
                    {item.poem && <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: rustDim, marginBottom: 8 }}>— {item.poem}</div>}
                    <button onClick={() => deleteGalleryItem(item.id)} style={{ ...btnStyle(red), fontSize: 8, padding: "5px 10px", width: "100%" }}>Remove</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add gallery item */}
            <div style={{ background: card, border: `1px solid ${border}`, padding: "24px 20px", position: "sticky", top: 24 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: rustDim, marginBottom: 20 }}>+ ADD ITEM</div>

              {/* Type toggle */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, marginBottom: 16 }}>
                {(["quote", "image"] as const).map(t => (
                  <button key={t} onClick={() => setGalForm(f => ({ ...f, type: t }))} style={{ padding: "8px", background: galForm.type === t ? rust : surface, border: `1px solid ${border}`, color: galForm.type === t ? "#fff" : dim, cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" }}>{t}</button>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {galForm.type === "quote" ? (
                  <>
                    <div>
                      <label style={labelStyle}>Quote text *</label>
                      <textarea value={galForm.text} onChange={e => setGalForm(f => ({ ...f, text: e.target.value }))} rows={4} placeholder="Enter a poem line or fragment…" style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Source poem</label>
                      <input value={galForm.poem} onChange={e => setGalForm(f => ({ ...f, poem: e.target.value }))} placeholder="e.g. Invisible Thread" style={inputStyle} />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label style={labelStyle}>Image *</label>
                      <input ref={fileRef} type="file" accept="image/*" onChange={handleImageFile}
                        style={{ ...inputStyle, padding: "8px 12px", cursor: "pointer" }} />
                    </div>
                    {imgPreview && (
                      <img src={imgPreview} alt="" style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", border: `1px solid ${border}` }} />
                    )}
                    <div>
                      <label style={labelStyle}>Caption</label>
                      <input value={galForm.caption} onChange={e => setGalForm(f => ({ ...f, caption: e.target.value }))} placeholder="Optional caption…" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Source poem</label>
                      <input value={galForm.poem} onChange={e => setGalForm(f => ({ ...f, poem: e.target.value }))} placeholder="e.g. Oh Sea" style={inputStyle} />
                    </div>
                  </>
                )}

                <button onClick={saveGalleryItem} style={{ ...btnStyle(), width: "100%", marginTop: 4 }}>
                  Add to Gallery
                </button>
              </div>

              <div style={{ marginTop: 20, padding: "10px 12px", background: "rgba(76,175,130,0.08)", border: `1px solid rgba(76,175,130,0.15)` }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", color: "rgba(76,175,130,0.7)", lineHeight: 1.6 }}>
                  Items saved locally and instantly appear on the public gallery page.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
