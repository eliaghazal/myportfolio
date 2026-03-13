"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ─── Palette ─── */
const bg      = "#111110";
const surface = "#1a1917";
const card    = "#1f1e1c";
const border  = "rgba(255,255,255,0.08)";
const text    = "#f0ece6";
const dim     = "rgba(240,236,230,0.45)";
const faint   = "rgba(240,236,230,0.14)";
const rust    = "#c4673e";
const rustDim = "rgba(196,103,62,0.5)";
const green   = "#4caf82";
const red     = "#c45050";

/* ─── Types ─── */
interface Post {
  id: string;
  title: string;
  date: string;
  tag: string;
  excerpt: string;
  content: string;
  read_time: string;
  published: boolean;
}

interface GalleryItem {
  id: string;
  type: "image" | "quote";
  text?: string;
  poem?: string;
  image_url?: string;
  caption?: string;
  rotation?: number;
}

interface LabExperiment {
  id: string;
  title: string;
  description: string;
  category: string;
  tech: string;
  github_url?: string;
  demo_type?: string;
  status: string;
  accent_color?: string;
}

const TAGS     = ["Essay", "Reflection", "Craft", "Personal", "Poetry", "News"];
const STATUSES = ["LIVE", "DEMO", "CONCEPT", "COMPLETED"];

const uid     = () => Math.random().toString(36).slice(2, 10);
const nowDate = () => new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" });

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

async function apiFetch(url: string, options: RequestInit & { auth?: string } = {}) {
  const { auth, headers: extraHeaders, ...rest } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json", ...((extraHeaders as Record<string, string>) ?? {}) };
  if (auth) headers["Authorization"] = auth;
  return fetch(url, { ...rest, headers });
}

export default function AdminPage() {
  const [authed, setAuthed]             = useState(false);
  const [passInput, setPassInput]       = useState("");
  const [passErr, setPassErr]           = useState(false);
  const [authLoading, setAuthLoading]   = useState(false);
  const [password, setPassword]         = useState("");
  const [tab, setTab]                   = useState<"blog" | "gallery" | "lab">("blog");

  const [posts, setPosts]               = useState<Post[]>([]);
  const [editPost, setEditPost]         = useState<Post | null>(null);
  const [postForm, setPostForm]         = useState<Omit<Post, "id">>({ title: "", date: nowDate(), tag: "Essay", excerpt: "", content: "", read_time: "5 min", published: false });

  const [gallery, setGallery]           = useState<GalleryItem[]>([]);
  const [galForm, setGalForm]           = useState({ type: "quote" as "image" | "quote", text: "", poem: "", caption: "" });
  const [imgFile, setImgFile]           = useState<File | null>(null);
  const [imgPreview, setImgPreview]     = useState<string | null>(null);
  const [uploading, setUploading]       = useState(false);

  const [labs, setLabs]                 = useState<LabExperiment[]>([]);
  const [editLab, setEditLab]           = useState<LabExperiment | null>(null);
  const [labForm, setLabForm]           = useState<Omit<LabExperiment, "id">>({ title: "", description: "", category: "", tech: "", github_url: "", demo_type: "", status: "CONCEPT", accent_color: "#39ff14" });

  const [workingOn, setWorkingOn]       = useState("");
  const [workingOnInput, setWorkingOnInput] = useState("");

  const [toast, setToast]               = useState<{ msg: string; ok: boolean } | null>(null);
  const [loading, setLoading]           = useState(false);
  const fileRef                         = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadPosts = useCallback(async (auth: string) => {
    try {
      const res = await apiFetch("/api/posts?all=true", { auth });
      if (res.ok) setPosts(await res.json());
    } catch { /* */ }
  }, []);

  const loadGallery = useCallback(async (auth: string) => {
    try {
      const res = await apiFetch("/api/gallery", { auth });
      if (res.ok) setGallery(await res.json());
    } catch { /* */ }
  }, []);

  const loadLabs = useCallback(async (auth: string) => {
    try {
      const res = await apiFetch("/api/lab", { auth });
      if (res.ok) setLabs(await res.json());
    } catch { /* */ }
  }, []);

  const loadSettings = useCallback(async (auth: string) => {
    try {
      const res = await apiFetch("/api/admin/settings?key=currently_working_on", { auth });
      if (res.ok) {
        const { value } = await res.json();
        setWorkingOn(value ?? "");
        setWorkingOnInput(value ?? "");
      }
    } catch { /* */ }
  }, []);

  const handleLogin = async () => {
    if (!passInput.trim()) return;
    setAuthLoading(true);
    setPassErr(false);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passInput }),
      });
      if (res.ok) {
        setPassword(passInput);
        setAuthed(true);
        await Promise.all([
          loadPosts(passInput),
          loadGallery(passInput),
          loadLabs(passInput),
          loadSettings(passInput),
        ]);
      } else {
        setPassErr(true);
      }
    } catch {
      setPassErr(true);
    } finally {
      setAuthLoading(false);
    }
  };

  // suppress "unused" warning — useEffect for any future real-time updates
  useEffect(() => { /* admin is fully API-driven */ }, []);

  if (!authed) return (
    <div style={{ background: bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-space)" }}>
      <div style={{ width: 340, padding: "40px 36px", background: surface, border: `1px solid ${border}` }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.3em", color: rustDim, marginBottom: 20 }}>{"// ADMIN"}</div>
        <h1 style={{ fontWeight: 700, fontSize: 22, color: text, marginBottom: 24 }}>Sign in</h1>
        <label style={labelStyle}>Password</label>
        <input type="password" value={passInput} onChange={e => setPassInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleLogin(); }}
          style={{ ...inputStyle, marginBottom: 12, borderColor: passErr ? red : border }}
          placeholder="Enter password" autoFocus />
        {passErr && <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: red, marginBottom: 12 }}>Incorrect password</div>}
        <button style={{ ...btnStyle(), width: "100%", opacity: authLoading ? 0.6 : 1 }} onClick={handleLogin} disabled={authLoading}>
          {authLoading ? "Checking…" : "Enter"}
        </button>
      </div>
    </div>
  );

  /* ── Blog handlers ── */
  const resetPostForm = () => {
    setEditPost(null);
    setPostForm({ title: "", date: nowDate(), tag: "Essay", excerpt: "", content: "", read_time: "5 min", published: false });
  };
  const loadPostForEdit = (p: Post) => {
    setEditPost(p);
    setPostForm({ title: p.title, date: p.date, tag: p.tag, excerpt: p.excerpt, content: p.content, read_time: p.read_time, published: p.published });
  };
  const savePost = async () => {
    if (!postForm.title.trim()) { showToast("Title is required", false); return; }
    setLoading(true);
    try {
      if (editPost) {
        const res = await apiFetch("/api/posts", { method: "PUT", auth: password, body: JSON.stringify({ id: editPost.id, ...postForm }) });
        if (res.ok) {
          const updated = await res.json();
          setPosts(prev => prev.map(p => p.id === editPost.id ? updated : p));
          showToast("Post updated"); resetPostForm();
        } else showToast("Failed to update", false);
      } else {
        const res = await apiFetch("/api/posts", { method: "POST", auth: password, body: JSON.stringify({ id: uid(), ...postForm }) });
        if (res.ok) {
          const created = await res.json();
          setPosts(prev => [created, ...prev]);
          showToast("Post created"); resetPostForm();
        } else showToast("Failed to create", false);
      }
    } catch { showToast("Network error", false); }
    finally { setLoading(false); }
  };
  const deletePost = async (id: string) => {
    try {
      await apiFetch("/api/posts", { method: "DELETE", auth: password, body: JSON.stringify({ id }) });
      setPosts(prev => prev.filter(p => p.id !== id)); showToast("Post deleted");
    } catch { showToast("Failed to delete", false); }
  };
  const togglePublish = async (id: string) => {
    const post = posts.find(p => p.id === id); if (!post) return;
    try {
      const res = await apiFetch("/api/posts", { method: "PUT", auth: password, body: JSON.stringify({ id, published: !post.published }) });
      if (res.ok) { const updated = await res.json(); setPosts(prev => prev.map(p => p.id === id ? updated : p)); }
    } catch { showToast("Failed", false); }
  };

  /* ── Gallery handlers ── */
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setImgFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImgPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };
  const saveGalleryItem = async () => {
    if (galForm.type === "quote" && !galForm.text.trim()) { showToast("Quote text required", false); return; }
    if (galForm.type === "image" && !imgFile) { showToast("Please select an image", false); return; }
    setUploading(true);
    try {
      let imageUrl: string | undefined;
      if (galForm.type === "image" && imgFile) {
        const form = new FormData();
        form.append("file", imgFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", headers: { "Authorization": password }, body: form });
        if (!uploadRes.ok) { showToast("Image upload failed", false); return; }
        const { url } = await uploadRes.json();
        imageUrl = url;
      }
      const item = {
        id: uid(), type: galForm.type,
        rotation: parseFloat(((Math.random() - 0.5) * 5).toFixed(2)),
        ...(galForm.type === "quote" ? { text: galForm.text, poem: galForm.poem || undefined } : {}),
        ...(galForm.type === "image" ? { image_url: imageUrl, caption: galForm.caption || undefined, poem: galForm.poem || undefined } : {}),
      };
      const res = await apiFetch("/api/gallery", { method: "POST", auth: password, body: JSON.stringify(item) });
      if (res.ok) {
        const created = await res.json();
        setGallery(prev => [created, ...prev]);
        setGalForm({ type: "quote", text: "", poem: "", caption: "" });
        setImgFile(null); setImgPreview(null);
        if (fileRef.current) fileRef.current.value = "";
        showToast("Added to gallery");
      } else showToast("Failed to save", false);
    } catch { showToast("Network error", false); }
    finally { setUploading(false); }
  };
  const deleteGalleryItem = async (id: string) => {
    try {
      await apiFetch("/api/gallery", { method: "DELETE", auth: password, body: JSON.stringify({ id }) });
      setGallery(prev => prev.filter(g => g.id !== id)); showToast("Removed");
    } catch { showToast("Failed to delete", false); }
  };

  /* ── Lab handlers ── */
  const resetLabForm = () => {
    setEditLab(null);
    setLabForm({ title: "", description: "", category: "", tech: "", github_url: "", demo_type: "", status: "CONCEPT", accent_color: "#39ff14" });
  };
  const loadLabForEdit = (e: LabExperiment) => {
    setEditLab(e);
    setLabForm({ title: e.title, description: e.description, category: e.category, tech: e.tech, github_url: e.github_url ?? "", demo_type: e.demo_type ?? "", status: e.status, accent_color: e.accent_color ?? "#39ff14" });
  };
  const saveLab = async () => {
    if (!labForm.title.trim()) { showToast("Title is required", false); return; }
    let techStr = labForm.tech.trim();
    if (techStr && !techStr.startsWith("[")) {
      techStr = JSON.stringify(techStr.split(",").map(s => s.trim()).filter(Boolean));
    }
    const payload = { ...labForm, tech: techStr || "[]" };
    setLoading(true);
    try {
      if (editLab) {
        const res = await apiFetch("/api/lab", { method: "PUT", auth: password, body: JSON.stringify({ id: editLab.id, ...payload }) });
        if (res.ok) {
          const updated = await res.json();
          setLabs(prev => prev.map(l => l.id === editLab.id ? updated : l));
          showToast("Experiment updated"); resetLabForm();
        } else showToast("Failed to update", false);
      } else {
        const res = await apiFetch("/api/lab", { method: "POST", auth: password, body: JSON.stringify({ id: uid(), ...payload }) });
        if (res.ok) {
          const created = await res.json();
          setLabs(prev => [created, ...prev]);
          showToast("Experiment created"); resetLabForm();
        } else showToast("Failed to create", false);
      }
    } catch { showToast("Network error", false); }
    finally { setLoading(false); }
  };
  const deleteLab = async (id: string) => {
    try {
      await apiFetch("/api/lab", { method: "DELETE", auth: password, body: JSON.stringify({ id }) });
      setLabs(prev => prev.filter(l => l.id !== id)); showToast("Experiment deleted");
    } catch { showToast("Failed to delete", false); }
  };

  const saveWorkingOn = async () => {
    try {
      const res = await apiFetch("/api/admin/settings", { method: "PUT", auth: password, body: JSON.stringify({ key: "currently_working_on", value: workingOnInput }) });
      if (res.ok) { setWorkingOn(workingOnInput); showToast("Saved"); }
      else showToast("Failed to save", false);
    } catch { showToast("Network error", false); }
  };

  const F  = postForm;
  const SF = setPostForm;
  const LF = labForm;
  const SLF = setLabForm;

  return (
    <div style={{ background: bg, minHeight: "100vh", color: text, fontFamily: "var(--font-space)" }}>

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, padding: "12px 20px", background: toast.ok ? green : red, color: "#fff", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.15em", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
          {toast.msg}
        </div>
      )}

      <header style={{ padding: "0 clamp(24px,5vw,60px)", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${border}`, background: surface, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.3em", color: rustDim }}>ELIA · ADMIN</span>
          <span style={{ width: 1, height: 16, background: border }} />
          <div style={{ display: "flex", gap: 1 }}>
            {(["blog", "gallery", "lab"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "6px 16px", background: tab === t ? rust : "transparent", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.18em", color: tab === t ? "#fff" : dim, textTransform: "uppercase", transition: "all 0.2s" }}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input value={workingOnInput} onChange={e => setWorkingOnInput(e.target.value)} placeholder="Currently working on…" style={{ ...inputStyle, width: 200, padding: "5px 10px", fontSize: 11 }} />
          <button onClick={saveWorkingOn} style={{ ...btnStyle(green), padding: "5px 10px", fontSize: 9 }}>Save</button>
          <a href="/poet/blog" target="_blank" style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", color: dim, textDecoration: "none", padding: "6px 12px", border: `1px solid ${border}` }}>↗ BLOG</a>
          <a href="/poet/gallery" target="_blank" style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", color: dim, textDecoration: "none", padding: "6px 12px", border: `1px solid ${border}` }}>↗ GALLERY</a>
          <a href="/engineer/lab" target="_blank" style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", color: dim, textDecoration: "none", padding: "6px 12px", border: `1px solid ${border}` }}>↗ LAB</a>
        </div>
      </header>

      {workingOn && (
        <div style={{ background: "rgba(57,255,20,0.05)", borderBottom: "1px solid rgba(57,255,20,0.1)", padding: "6px clamp(24px,5vw,60px)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", color: "rgba(57,255,20,0.6)" }}>● currently_building: {workingOn}</span>
        </div>
      )}

      <div style={{ padding: "32px clamp(24px,5vw,60px)", maxWidth: 1100, margin: "0 auto" }}>

        {/* ── BLOG ── */}
        {tab === "blog" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 2, alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: dim }}>{posts.length} POSTS</span>
                <button onClick={resetPostForm} style={{ ...btnStyle(), fontSize: 9 }}>+ New Post</button>
              </div>
              {posts.length === 0 && <div style={{ padding: "40px 20px", textAlign: "center", border: `1px dashed ${border}`, color: faint, fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.15em" }}>No posts yet. Create one →</div>}
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {posts.map(p => (
                  <div key={p.id} style={{ padding: "14px 16px", background: card, border: `1px solid ${border}`, display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, padding: "1px 7px", background: "rgba(196,103,62,0.15)", color: rust, border: "1px solid rgba(196,103,62,0.2)" }}>{p.tag}</span>
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
            <div style={{ background: card, border: `1px solid ${border}`, padding: "24px 20px", position: "sticky", top: 24 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: rustDim, marginBottom: 20 }}>{editPost ? "✎ EDITING" : "+ NEW POST"}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div><label style={labelStyle}>Title *</label><input value={F.title} onChange={e => SF(f => ({ ...f, title: e.target.value }))} placeholder="Post title…" style={inputStyle} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div><label style={labelStyle}>Date</label><input value={F.date} onChange={e => SF(f => ({ ...f, date: e.target.value }))} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Read time</label><input value={F.read_time} onChange={e => SF(f => ({ ...f, read_time: e.target.value }))} placeholder="5 min" style={inputStyle} /></div>
                </div>
                <div><label style={labelStyle}>Tag</label><select value={F.tag} onChange={e => SF(f => ({ ...f, tag: e.target.value }))} style={{ ...inputStyle, appearance: "none" }}>{TAGS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label style={labelStyle}>Excerpt *</label><textarea value={F.excerpt} onChange={e => SF(f => ({ ...f, excerpt: e.target.value }))} rows={3} placeholder="Short description…" style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} /></div>
                <div><label style={labelStyle}>Full content</label><textarea value={F.content} onChange={e => SF(f => ({ ...f, content: e.target.value }))} rows={10} placeholder="Full post content…" style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7, fontFamily: "var(--font-mono)", fontSize: 12 }} /></div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={F.published} onChange={e => SF(f => ({ ...f, published: e.target.checked }))} style={{ accentColor: rust }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", color: dim }}>PUBLISH NOW</span>
                </label>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button onClick={savePost} disabled={loading} style={{ ...btnStyle(), flex: 1, opacity: loading ? 0.6 : 1 }}>{editPost ? "Save Changes" : "Create Post"}</button>
                  {editPost && <button onClick={resetPostForm} style={{ ...btnStyle("#333"), padding: "10px 14px" }}>Cancel</button>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── GALLERY ── */}
        {tab === "gallery" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 2, alignItems: "start" }}>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: dim, marginBottom: 16 }}>{gallery.length} ITEMS</div>
              {gallery.length === 0 && <div style={{ padding: "40px 20px", textAlign: "center", border: `1px dashed ${border}`, color: faint, fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.15em" }}>No gallery items yet. Add one →</div>}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 2 }}>
                {gallery.map(item => (
                  <div key={item.id} style={{ background: card, border: `1px solid ${border}`, padding: 12 }}>
                    {item.type === "image" && item.image_url
                      ? <img src={item.image_url} alt="" style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block", marginBottom: 8 }} />
                      : <div style={{ width: "100%", aspectRatio: "1/1", background: surface, display: "flex", alignItems: "center", justifyContent: "center", padding: 10, marginBottom: 8 }}><span style={{ fontSize: 12, color: dim, fontStyle: "italic", textAlign: "center", lineHeight: 1.5 }}>{`"${item.text?.slice(0, 60)}…"`}</span></div>
                    }
                    {item.poem && <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: rustDim, marginBottom: 8 }}>— {item.poem}</div>}
                    <button onClick={() => deleteGalleryItem(item.id)} style={{ ...btnStyle(red), fontSize: 8, padding: "5px 10px", width: "100%" }}>Remove</button>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: card, border: `1px solid ${border}`, padding: "24px 20px", position: "sticky", top: 24 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: rustDim, marginBottom: 20 }}>+ ADD ITEM</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, marginBottom: 16 }}>
                {(["quote", "image"] as const).map(t => (
                  <button key={t} onClick={() => setGalForm(f => ({ ...f, type: t }))} style={{ padding: "8px", background: galForm.type === t ? rust : surface, border: `1px solid ${border}`, color: galForm.type === t ? "#fff" : dim, cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" }}>{t}</button>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {galForm.type === "quote" ? (
                  <>
                    <div><label style={labelStyle}>Quote text *</label><textarea value={galForm.text} onChange={e => setGalForm(f => ({ ...f, text: e.target.value }))} rows={4} placeholder="Enter a poem line…" style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }} /></div>
                    <div><label style={labelStyle}>Source poem</label><input value={galForm.poem} onChange={e => setGalForm(f => ({ ...f, poem: e.target.value }))} placeholder="e.g. Invisible Thread" style={inputStyle} /></div>
                  </>
                ) : (
                  <>
                    <div><label style={labelStyle}>Image *</label><input ref={fileRef} type="file" accept="image/*" onChange={handleImageFile} style={{ ...inputStyle, padding: "8px 12px", cursor: "pointer" }} /></div>
                    {imgPreview && <img src={imgPreview} alt="" style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", border: `1px solid ${border}` }} />}
                    <div><label style={labelStyle}>Caption</label><input value={galForm.caption} onChange={e => setGalForm(f => ({ ...f, caption: e.target.value }))} placeholder="Optional caption…" style={inputStyle} /></div>
                    <div><label style={labelStyle}>Source poem</label><input value={galForm.poem} onChange={e => setGalForm(f => ({ ...f, poem: e.target.value }))} placeholder="e.g. Oh Sea" style={inputStyle} /></div>
                  </>
                )}
                <button onClick={saveGalleryItem} disabled={uploading} style={{ ...btnStyle(), width: "100%", marginTop: 4, opacity: uploading ? 0.6 : 1 }}>{uploading ? "Uploading…" : "Add to Gallery"}</button>
              </div>
            </div>
          </div>
        )}

        {/* ── LAB ── */}
        {tab === "lab" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 2, alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: dim }}>{labs.length} EXPERIMENTS</span>
                <button onClick={resetLabForm} style={{ ...btnStyle(), fontSize: 9 }}>+ New Experiment</button>
              </div>
              {labs.length === 0 && <div style={{ padding: "40px 20px", textAlign: "center", border: `1px dashed ${border}`, color: faint, fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.15em" }}>No experiments yet. Create one →</div>}
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {labs.map(l => {
                  const techArr: string[] = (() => { try { return JSON.parse(l.tech); } catch { return []; } })();
                  return (
                    <div key={l.id} style={{ padding: "14px 16px", background: card, border: `1px solid ${border}`, display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, padding: "1px 7px", background: "rgba(196,103,62,0.15)", color: rust, border: "1px solid rgba(196,103,62,0.2)" }}>{l.category}</span>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: l.status === "LIVE" ? green : faint }}>{l.status}</span>
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: text, marginBottom: 4 }}>{l.title}</div>
                        <div style={{ fontSize: 12, color: dim, lineHeight: 1.5, maxWidth: 400, marginBottom: 6 }}>{l.description.slice(0, 100)}{l.description.length > 100 ? "…" : ""}</div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {techArr.slice(0, 4).map((t, i) => (
                            <span key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 8, padding: "1px 6px", background: "rgba(255,255,255,0.05)", color: faint, border: `1px solid ${border}` }}>{t}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <button onClick={() => loadLabForEdit(l)} style={{ ...btnStyle("#333"), fontSize: 8, padding: "6px 10px" }}>Edit</button>
                        <button onClick={() => deleteLab(l.id)} style={{ ...btnStyle(red), fontSize: 8, padding: "6px 10px" }}>Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ background: card, border: `1px solid ${border}`, padding: "24px 20px", position: "sticky", top: 24 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: rustDim, marginBottom: 20 }}>{editLab ? "✎ EDITING" : "+ NEW EXPERIMENT"}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div><label style={labelStyle}>Title *</label><input value={LF.title} onChange={e => SLF(f => ({ ...f, title: e.target.value }))} placeholder="Experiment title…" style={inputStyle} /></div>
                <div><label style={labelStyle}>Description</label><textarea value={LF.description} onChange={e => SLF(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="What did you build?" style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div><label style={labelStyle}>Category</label><input value={LF.category} onChange={e => SLF(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Algorithms" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Status</label><select value={LF.status} onChange={e => SLF(f => ({ ...f, status: e.target.value }))} style={{ ...inputStyle, appearance: "none" }}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                </div>
                <div><label style={labelStyle}>Tech (comma-separated)</label><input value={LF.tech} onChange={e => SLF(f => ({ ...f, tech: e.target.value }))} placeholder="TypeScript, React, Canvas API" style={inputStyle} /></div>
                <div><label style={labelStyle}>GitHub URL</label><input value={LF.github_url} onChange={e => SLF(f => ({ ...f, github_url: e.target.value }))} placeholder="https://github.com/…" style={inputStyle} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div><label style={labelStyle}>Demo type</label><input value={LF.demo_type} onChange={e => SLF(f => ({ ...f, demo_type: e.target.value }))} placeholder="e.g. Interactive" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Accent color</label><input type="color" value={LF.accent_color} onChange={e => SLF(f => ({ ...f, accent_color: e.target.value }))} style={{ ...inputStyle, padding: "4px", height: 42, cursor: "pointer" }} /></div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button onClick={saveLab} disabled={loading} style={{ ...btnStyle(), flex: 1, opacity: loading ? 0.6 : 1 }}>{editLab ? "Save Changes" : "Create Experiment"}</button>
                  {editLab && <button onClick={resetLabForm} style={{ ...btnStyle("#333"), padding: "10px 14px" }}>Cancel</button>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
