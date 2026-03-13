"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  DEFAULT_FEATURED, DEFAULT_OTHER_PROJECTS, DEFAULT_SKILLS,
  DEFAULT_CERTS, DEFAULT_AWARDS, DEFAULT_STATS, DEFAULT_POEMS, DEFAULT_HERO_LINES,
  type FeaturedProject, type OtherProject, type Skill, type Cert, type Award, type Stat, type Poem,
} from "@/lib/defaults";

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
  category?: string;
}

interface GalleryItem {
  id: string;
  type: "image" | "video" | "quote";
  text?: string;
  poem?: string;
  image_url?: string;
  video_url?: string;
  thumbnail_url?: string;
  caption?: string;
  rotation?: number;
  aspect_ratio?: "original" | "1:1" | "16:9" | "3:4" | "21:9";
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
const PROJECT_STATUSES = ["ACTIVE", "LIVE", "COMPLETED", "AWARD"];

function tryParse<T>(value: string, fallback: T): T {
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

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
  const [tab, setTab]                   = useState<"blog" | "gallery" | "lab" | "projects" | "skills" | "certs" | "awards" | "poems" | "content" | "settings">("blog");

  const [posts, setPosts]               = useState<Post[]>([]);
  const [editPost, setEditPost]         = useState<Post | null>(null);
  const [postForm, setPostForm]         = useState<Omit<Post, "id">>({ title: "", date: nowDate(), tag: "Essay", excerpt: "", content: "", read_time: "5 min", published: false, category: "blog" });

  const [gallery, setGallery]           = useState<GalleryItem[]>([]);
  const [galForm, setGalForm]           = useState({ type: "quote" as "image" | "video" | "quote", text: "", poem: "", caption: "", aspect_ratio: "1:1" as "original" | "1:1" | "16:9" | "3:4" | "21:9" });
  const [imgFile, setImgFile]           = useState<File | null>(null);
  const [imgPreview, setImgPreview]     = useState<string | null>(null);
  const [videoFile, setVideoFile]       = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [compressing, setCompressing]   = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [uploading, setUploading]       = useState(false);

  const [labs, setLabs]                 = useState<LabExperiment[]>([]);
  const [editLab, setEditLab]           = useState<LabExperiment | null>(null);
  const [labForm, setLabForm]           = useState<Omit<LabExperiment, "id">>({ title: "", description: "", category: "", tech: "", github_url: "", demo_type: "", status: "CONCEPT", accent_color: "#39ff14" });

  /* ── New content state ── */
  const [featuredProjs, setFeaturedProjs] = useState<FeaturedProject[]>([]);
  const [editFeatured, setEditFeatured]   = useState<FeaturedProject | null>(null);
  const [featuredForm, setFeaturedForm]   = useState<FeaturedProject>({ id: "", title: "", subtitle: "", status: "ACTIVE", period: "", accent: "#39ff14", problem: "", solution: "", impact: "", tech: [], link: null });
  const [featuredTechText, setFeaturedTechText] = useState("");

  const [otherProjs, setOtherProjs]     = useState<OtherProject[]>([]);
  const [editOther, setEditOther]       = useState<OtherProject | null>(null);
  const [otherForm, setOtherForm]       = useState<OtherProject>({ title: "", desc: "", tech: [], badge: null });
  const [otherTechText, setOtherTechText] = useState("");

  const [skillsData, setSkillsData]     = useState<Skill[]>([]);
  const [editSkillIdx, setEditSkillIdx] = useState<number | null>(null);
  const [skillForm, setSkillForm]       = useState<Skill>({ cat: "", items: [] });
  const [skillItemsText, setSkillItemsText] = useState("");

  const [certsData, setCertsData]       = useState<Cert[]>([]);
  const [editCertIdx, setEditCertIdx]   = useState<number | null>(null);
  const [certForm, setCertForm]         = useState<Cert>({ name: "", issuer: "", date: "", detail: "", accent: "#3b82f6", link: null });

  const [awardsData, setAwardsData]     = useState<Award[]>([]);
  const [editAwardIdx, setEditAwardIdx] = useState<number | null>(null);
  const [awardForm, setAwardForm]       = useState<Award>({ icon: "◆", title: "", body: "", detail: "" });

  const [statsData, setStatsData]       = useState<Stat[]>([]);
  const [editStatIdx, setEditStatIdx]   = useState<number | null>(null);
  const [statForm, setStatForm]         = useState<Stat>({ label: "", value: 0, suffix: "", prefix: "" });

  const [poemsData, setPoemsData]       = useState<Poem[]>([]);
  const [editPoemIdx, setEditPoemIdx]   = useState<number | null>(null);
  const [poemForm, setPoemForm]         = useState<Poem>({ title: "", year: "", theme: "", lines: "" });

  const [heroLinesData, setHeroLinesData] = useState<string[]>([]);
  const [heroLinesText, setHeroLinesText] = useState("");

  /* ── Content settings state ── */
  const [engAboutHeading, setEngAboutHeading]   = useState("I don't wait for the\nright moment.\nI build it.");
  const [engAboutBody, setEngAboutBody]         = useState("From a bedroom in Lebanon to published poet, award-winning developer, and IoT architect — I've learned that pressure doesn't break you, it compiles you.\n---\nI'm studying Computer Science at AUST (graduating June 2026), building CrashLens and MysteryPersona while carrying a full course load — and writing poetry that ends up on Amazon.\n---\nThat's not luck. That's obsession.");
  const [engAboutManifesto, setEngAboutManifesto] = useState("The impossible, made.");
  const [engTerminalAbout, setEngTerminalAbout] = useState("  Name:       Elia Ghazal\n  Location:   Lebanon → the world\n  Role:       Engineer / Poet / Builder\n  School:     AUST Computer Science (2026)\n  Standing:   Honor's List\n  Motto:      The impossible, made.");
  const [engBeyondCode, setEngBeyondCode]       = useState<Array<{t:string;d:string}>>([
    { t: "AI Workshop", d: "Attended regional AI/ML workshop — explored transformer architectures and edge deployment." },
    { t: "Environmental Seminar", d: "Participated in AUST environmental sustainability seminar series." },
    { t: "Whispers of the Eclipse", d: "Published debut poetry collection at 19 — 27 poems, Ukiyoto Publishing, 2024." },
  ]);
  const [engBeyondCodeText, setEngBeyondCodeText] = useState("");
  const [poetAboutHeading, setPoetAboutHeading] = useState("Writing was\nnever a choice.\nIt was survival.");
  const [poetAboutBody, setPoetAboutBody]       = useState("Writing has always been my sanctuary — a guiding light through the darkest times. Without it, I would never have found the happiness that now colors my world.\n---\nWhispers of the Eclipse is born from the raw and unfiltered experiences of my life. A testament to the power of words to heal, to connect, and to transform.\n---\nI have always imagined my life as a sailing boat, bravely navigating the hazardous sea. Even when life gives you the worst waves — keep your boat afloat and sail away.");
  const [poetBookTitle, setPoetBookTitle]       = useState("Whispers of the Eclipse");
  const [poetBookDescription, setPoetBookDescription] = useState("A collection written across ages 15–19 — raw, unfiltered, and honest. Twenty-seven poems tracing love, loss, identity, resilience, and what it means to grow up in Lebanon.");


  const [cvUrl, setCvUrl]               = useState<string | null>(null);
  const [cvFile, setCvFile]             = useState<File | null>(null);
  const [uploadingCv, setUploadingCv]   = useState(false);
  const [settingEmail, setSettingEmail] = useState("eliaghazal777@gmail.com");
  const [settingLinkedIn, setSettingLinkedIn] = useState("https://www.linkedin.com/in/eliaghazal/");
  const [settingGitHub, setSettingGitHub] = useState("https://github.com/eliaghazal/");
  const [settingBookLink, setSettingBookLink] = useState("https://linktr.ee/eliaghazal");
  const cvFileRef = useRef<HTMLInputElement>(null);

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

  const loadSiteContent = useCallback(async (auth: string) => {
    const keys = [
      "featured_projects","other_projects","skills","certs","awards","stats",
      "poems","hero_lines","cv_url","social_email","social_linkedin","social_github","book_link",
      "engineer_about_heading","engineer_about_body","engineer_about_manifesto",
      "engineer_terminal_about","engineer_beyond_code",
      "poet_about_heading","poet_about_body","poet_book_title","poet_book_description",
    ];
    try {
      const results = await Promise.all(
        keys.map(k => apiFetch(`/api/admin/settings?key=${k}`, { auth }).then(r => r.ok ? r.json() : null).catch(() => null))
      );
      const [fp, op, sk, ce, aw, st, po, hl, cv, em, li, gh, bl,
        eah, eab, eam, eta, ebc, pah, pab, pbt, pbd] = results;
      setFeaturedProjs(fp?.value ? tryParse(fp.value, DEFAULT_FEATURED) : DEFAULT_FEATURED);
      setOtherProjs(op?.value ? tryParse(op.value, DEFAULT_OTHER_PROJECTS) : DEFAULT_OTHER_PROJECTS);
      setSkillsData(sk?.value ? tryParse(sk.value, DEFAULT_SKILLS) : DEFAULT_SKILLS);
      setCertsData(ce?.value ? tryParse(ce.value, DEFAULT_CERTS) : DEFAULT_CERTS);
      setAwardsData(aw?.value ? tryParse(aw.value, DEFAULT_AWARDS) : DEFAULT_AWARDS);
      setStatsData(st?.value ? tryParse(st.value, DEFAULT_STATS) : DEFAULT_STATS);
      setPoemsData(po?.value ? tryParse(po.value, DEFAULT_POEMS) : DEFAULT_POEMS);
      const hlArr: string[] = hl?.value ? tryParse(hl.value, DEFAULT_HERO_LINES) : DEFAULT_HERO_LINES;
      setHeroLinesData(hlArr);
      setHeroLinesText(hlArr.join("\n---\n"));
      if (cv?.value) setCvUrl(cv.value);
      if (em?.value) setSettingEmail(em.value);
      if (li?.value) setSettingLinkedIn(li.value);
      if (gh?.value) setSettingGitHub(gh.value);
      if (bl?.value) setSettingBookLink(bl.value);
      if (eah?.value) setEngAboutHeading(tryParse(eah.value, engAboutHeading));
      if (eab?.value) setEngAboutBody(tryParse(eab.value, engAboutBody));
      if (eam?.value) setEngAboutManifesto(tryParse(eam.value, engAboutManifesto));
      if (eta?.value) setEngTerminalAbout(tryParse(eta.value, engTerminalAbout));
      if (ebc?.value) {
        const bcArr = tryParse<Array<{t:string;d:string}>>(ebc.value, engBeyondCode);
        setEngBeyondCode(bcArr);
        setEngBeyondCodeText(bcArr.map(x => `${x.t}|${x.d}`).join("\n"));
      } else {
        setEngBeyondCodeText(engBeyondCode.map(x => `${x.t}|${x.d}`).join("\n"));
      }
      if (pah?.value) setPoetAboutHeading(tryParse(pah.value, poetAboutHeading));
      if (pab?.value) setPoetAboutBody(tryParse(pab.value, poetAboutBody));
      if (pbt?.value) setPoetBookTitle(tryParse(pbt.value, poetBookTitle));
      if (pbd?.value) setPoetBookDescription(tryParse(pbd.value, poetBookDescription));
    } catch { /* */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          loadSiteContent(passInput),
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
    setPostForm({ title: "", date: nowDate(), tag: "Essay", excerpt: "", content: "", read_time: "5 min", published: false, category: "blog" });
  };
  const loadPostForEdit = (p: Post) => {
    setEditPost(p);
    setPostForm({ title: p.title, date: p.date, tag: p.tag, excerpt: p.excerpt, content: p.content, read_time: p.read_time, published: p.published, category: p.category ?? "blog" });
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
  const handleVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
    // Try browser-based compression for videos > 10MB
    if (file.size > 10 * 1024 * 1024) {
      setCompressing(true);
      setCompressionProgress(0);
      try {
        const compressed = await compressVideo(file, (p) => setCompressionProgress(p));
        setVideoFile(compressed);
        showToast(`Compressed: ${(file.size / 1024 / 1024).toFixed(1)}MB → ${(compressed.size / 1024 / 1024).toFixed(1)}MB`);
      } catch {
        showToast("Compression failed, using original", false);
        setVideoFile(file);
      }
      setCompressing(false);
    } else {
      setVideoFile(file);
    }
  };
  const compressVideo = (file: File, onProgress: (p: number) => void): Promise<File> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.muted = true;
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        // Scale down resolution for compression
        const maxDim = 1280;
        let w = video.videoWidth;
        let h = video.videoHeight;
        if (w > maxDim || h > maxDim) {
          const scale = maxDim / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        const stream = canvas.captureStream(30);
        // Try to get audio track
        try {
          const audioCtx = new AudioContext();
          const source = audioCtx.createMediaElementSource(video);
          const dest = audioCtx.createMediaStreamDestination();
          source.connect(dest);
          source.connect(audioCtx.destination);
          dest.stream.getAudioTracks().forEach(t => stream.addTrack(t));
        } catch { /* no audio track is fine */ }
        const recorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" :
                    MediaRecorder.isTypeSupported("video/webm;codecs=vp8") ? "video/webm;codecs=vp8" : "video/webm",
          videoBitsPerSecond: 2_500_000,
        });
        const chunks: Blob[] = [];
        recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: recorder.mimeType });
          const ext = recorder.mimeType.includes("webm") ? "webm" : "mp4";
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, `.${ext}`), { type: recorder.mimeType }));
          URL.revokeObjectURL(video.src);
        };
        recorder.onerror = () => reject(new Error("Recording failed"));
        recorder.start();
        video.currentTime = 0;
        video.play();
        const duration = video.duration;
        const drawFrame = () => {
          if (video.ended || video.paused) {
            recorder.stop();
            return;
          }
          ctx.drawImage(video, 0, 0, w, h);
          onProgress(Math.min(99, Math.round((video.currentTime / duration) * 100)));
          requestAnimationFrame(drawFrame);
        };
        drawFrame();
        video.onended = () => {
          onProgress(100);
          recorder.stop();
        };
      };
      video.onerror = () => reject(new Error("Failed to load video"));
    });
  };
  const generateThumbnail = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.muted = true;
      video.src = URL.createObjectURL(file);
      video.onloadeddata = () => {
        video.currentTime = Math.min(1, video.duration / 4);
      };
      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = Math.min(video.videoWidth, 640);
        canvas.height = Math.round(canvas.width * (video.videoHeight / video.videoWidth));
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          URL.revokeObjectURL(video.src);
          if (blob) resolve(new File([blob], "thumb_" + file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
          else reject(new Error("Failed to create thumbnail"));
        }, "image/jpeg", 0.8);
      };
      video.onerror = () => reject(new Error("Failed to load video for thumbnail"));
    });
  };
  const saveGalleryItem = async () => {
    if (galForm.type === "quote" && !galForm.text.trim()) { showToast("Quote text required", false); return; }
    if (galForm.type === "image" && !imgFile) { showToast("Please select an image", false); return; }
    if (galForm.type === "video" && !videoFile) { showToast("Please select a video", false); return; }
    setUploading(true);
    try {
      let imageUrl: string | undefined;
      let videoUrl: string | undefined;
      let thumbnailUrl: string | undefined;
      if (galForm.type === "image" && imgFile) {
        const form = new FormData();
        form.append("file", imgFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", headers: { "Authorization": password }, body: form });
        if (!uploadRes.ok) { const err = await uploadRes.json().catch(() => ({})); showToast(`Image upload failed: ${err.error || "Unknown error"}`, false); return; }
        const { url } = await uploadRes.json();
        imageUrl = url;
      }
      if (galForm.type === "video" && videoFile) {
        // Upload video
        const form = new FormData();
        form.append("file", videoFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", headers: { "Authorization": password }, body: form });
        if (!uploadRes.ok) { const err = await uploadRes.json().catch(() => ({})); showToast(`Video upload failed: ${err.error || "Unknown error"}`, false); return; }
        const { url } = await uploadRes.json();
        videoUrl = url;
        // Generate and upload thumbnail
        try {
          const thumb = await generateThumbnail(videoFile);
          const thumbForm = new FormData();
          thumbForm.append("file", thumb);
          const thumbRes = await fetch("/api/upload", { method: "POST", headers: { "Authorization": password }, body: thumbForm });
          if (thumbRes.ok) { const { url: tUrl } = await thumbRes.json(); thumbnailUrl = tUrl; }
        } catch { /* thumbnail generation failed, that's ok */ }
      }
      const item = {
        id: uid(), type: galForm.type,
        rotation: parseFloat(((Math.random() - 0.5) * 5).toFixed(2)),
        ...(galForm.type === "quote" ? { text: galForm.text, poem: galForm.poem || undefined } : {}),
        ...(galForm.type === "image" ? { image_url: imageUrl, caption: galForm.caption || undefined, poem: galForm.poem || undefined, aspect_ratio: galForm.aspect_ratio } : {}),
        ...(galForm.type === "video" ? { video_url: videoUrl, thumbnail_url: thumbnailUrl, image_url: thumbnailUrl, caption: galForm.caption || undefined, poem: galForm.poem || undefined, aspect_ratio: galForm.aspect_ratio } : {}),
      };
      const res = await apiFetch("/api/gallery", { method: "POST", auth: password, body: JSON.stringify(item) });
      if (res.ok) {
        const created = await res.json();
        setGallery(prev => [created, ...prev]);
        setGalForm({ type: "quote", text: "", poem: "", caption: "", aspect_ratio: "1:1" });
        setImgFile(null); setImgPreview(null);
        setVideoFile(null); setVideoPreview(null);
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

  const handleSeed = async () => {
    try {
      const res = await apiFetch("/api/seed", { method: "POST", auth: password });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message ?? "Seed data imported!");
        await Promise.all([loadPosts(password), loadGallery(password), loadLabs(password)]);
      } else {
        showToast("Seed failed", false);
      }
    } catch { showToast("Network error", false); }
  };

  /* ── Content helpers ── */
  const saveContentSetting = async (key: string, value: unknown): Promise<boolean> => {
    try {
      const res = await apiFetch("/api/admin/settings", { method: "PUT", auth: password, body: JSON.stringify({ key, value: JSON.stringify(value) }) });
      return res.ok;
    } catch { return false; }
  };

  /* ── Featured Projects handlers ── */
  const resetFeaturedForm = () => { setEditFeatured(null); setFeaturedForm({ id: "", title: "", subtitle: "", status: "ACTIVE", period: "", accent: "#39ff14", problem: "", solution: "", impact: "", tech: [], link: null }); setFeaturedTechText(""); };
  const saveFeaturedProject = async () => {
    if (!featuredForm.title.trim()) { showToast("Title required", false); return; }
    setLoading(true);
    const techArr = featuredTechText.split(",").map(s => s.trim()).filter(Boolean);
    const item: FeaturedProject = { ...featuredForm, id: editFeatured ? editFeatured.id : uid(), tech: techArr };
    const newList = editFeatured ? featuredProjs.map(p => p.id === editFeatured.id ? item : p) : [...featuredProjs, item];
    if (await saveContentSetting("featured_projects", newList)) { setFeaturedProjs(newList); showToast(editFeatured ? "Updated" : "Added"); resetFeaturedForm(); }
    else showToast("Failed to save", false);
    setLoading(false);
  };
  const deleteFeaturedProject = async (id: string) => {
    const newList = featuredProjs.filter(p => p.id !== id);
    if (await saveContentSetting("featured_projects", newList)) { setFeaturedProjs(newList); showToast("Deleted"); }
    else showToast("Failed", false);
  };

  /* ── Other Projects handlers ── */
  const resetOtherForm = () => { setEditOther(null); setOtherForm({ title: "", desc: "", tech: [], badge: null }); setOtherTechText(""); };
  const saveOtherProject = async () => {
    if (!otherForm.title.trim()) { showToast("Title required", false); return; }
    setLoading(true);
    const techArr = otherTechText.split(",").map(s => s.trim()).filter(Boolean);
    const item: OtherProject = { ...otherForm, tech: techArr };
    const newList = editOther ? otherProjs.map(p => p.title === editOther.title ? item : p) : [...otherProjs, item];
    if (await saveContentSetting("other_projects", newList)) { setOtherProjs(newList); showToast(editOther ? "Updated" : "Added"); resetOtherForm(); }
    else showToast("Failed to save", false);
    setLoading(false);
  };
  const deleteOtherProject = async (title: string) => {
    const newList = otherProjs.filter(p => p.title !== title);
    if (await saveContentSetting("other_projects", newList)) { setOtherProjs(newList); showToast("Deleted"); }
    else showToast("Failed", false);
  };

  /* ── Skills handlers ── */
  const resetSkillForm = () => { setEditSkillIdx(null); setSkillForm({ cat: "", items: [] }); setSkillItemsText(""); };
  const saveSkill = async () => {
    if (!skillForm.cat.trim()) { showToast("Category required", false); return; }
    setLoading(true);
    const items = skillItemsText.split(",").map(s => s.trim()).filter(Boolean);
    const item: Skill = { cat: skillForm.cat, items };
    const newList = editSkillIdx !== null ? skillsData.map((s, i) => i === editSkillIdx ? item : s) : [...skillsData, item];
    if (await saveContentSetting("skills", newList)) { setSkillsData(newList); showToast(editSkillIdx !== null ? "Updated" : "Added"); resetSkillForm(); }
    else showToast("Failed", false);
    setLoading(false);
  };
  const deleteSkill = async (idx: number) => {
    const newList = skillsData.filter((_, i) => i !== idx);
    if (await saveContentSetting("skills", newList)) { setSkillsData(newList); showToast("Deleted"); }
    else showToast("Failed", false);
  };

  /* ── Certs handlers ── */
  const resetCertForm = () => { setEditCertIdx(null); setCertForm({ name: "", issuer: "", date: "", detail: "", accent: "#3b82f6", link: null }); };
  const saveCert = async () => {
    if (!certForm.name.trim()) { showToast("Name required", false); return; }
    setLoading(true);
    const item: Cert = { ...certForm, link: certForm.link || null };
    const newList = editCertIdx !== null ? certsData.map((c, i) => i === editCertIdx ? item : c) : [...certsData, item];
    if (await saveContentSetting("certs", newList)) { setCertsData(newList); showToast(editCertIdx !== null ? "Updated" : "Added"); resetCertForm(); }
    else showToast("Failed", false);
    setLoading(false);
  };
  const deleteCert = async (idx: number) => {
    const newList = certsData.filter((_, i) => i !== idx);
    if (await saveContentSetting("certs", newList)) { setCertsData(newList); showToast("Deleted"); }
    else showToast("Failed", false);
  };

  /* ── Awards handlers ── */
  const resetAwardForm = () => { setEditAwardIdx(null); setAwardForm({ icon: "◆", title: "", body: "", detail: "" }); };
  const saveAward = async () => {
    if (!awardForm.title.trim()) { showToast("Title required", false); return; }
    setLoading(true);
    const newList = editAwardIdx !== null ? awardsData.map((a, i) => i === editAwardIdx ? awardForm : a) : [...awardsData, awardForm];
    if (await saveContentSetting("awards", newList)) { setAwardsData(newList); showToast(editAwardIdx !== null ? "Updated" : "Added"); resetAwardForm(); }
    else showToast("Failed", false);
    setLoading(false);
  };
  const deleteAward = async (idx: number) => {
    const newList = awardsData.filter((_, i) => i !== idx);
    if (await saveContentSetting("awards", newList)) { setAwardsData(newList); showToast("Deleted"); }
    else showToast("Failed", false);
  };

  /* ── Stats handlers ── */
  const resetStatForm = () => { setEditStatIdx(null); setStatForm({ label: "", value: 0, suffix: "", prefix: "" }); };
  const saveStat = async () => {
    if (!statForm.label.trim()) { showToast("Label required", false); return; }
    setLoading(true);
    const newList = editStatIdx !== null ? statsData.map((s, i) => i === editStatIdx ? statForm : s) : [...statsData, statForm];
    if (await saveContentSetting("stats", newList)) { setStatsData(newList); showToast(editStatIdx !== null ? "Updated" : "Added"); resetStatForm(); }
    else showToast("Failed", false);
    setLoading(false);
  };
  const deleteStat = async (idx: number) => {
    const newList = statsData.filter((_, i) => i !== idx);
    if (await saveContentSetting("stats", newList)) { setStatsData(newList); showToast("Deleted"); }
    else showToast("Failed", false);
  };

  /* ── Poems handlers ── */
  const resetPoemForm = () => { setEditPoemIdx(null); setPoemForm({ title: "", year: "", theme: "", lines: "" }); };
  const savePoem = async () => {
    if (!poemForm.title.trim()) { showToast("Title required", false); return; }
    setLoading(true);
    const newList = editPoemIdx !== null ? poemsData.map((p, i) => i === editPoemIdx ? poemForm : p) : [...poemsData, poemForm];
    if (await saveContentSetting("poems", newList)) { setPoemsData(newList); showToast(editPoemIdx !== null ? "Updated" : "Added"); resetPoemForm(); }
    else showToast("Failed", false);
    setLoading(false);
  };
  const deletePoem = async (idx: number) => {
    const newList = poemsData.filter((_, i) => i !== idx);
    if (await saveContentSetting("poems", newList)) { setPoemsData(newList); showToast("Deleted"); }
    else showToast("Failed", false);
  };
  const saveHeroLines = async () => {
    const lines = heroLinesText.split("\n---\n").map(s => s.trim()).filter(Boolean);
    if (await saveContentSetting("hero_lines", lines)) { setHeroLinesData(lines); showToast("Hero lines saved"); }
    else showToast("Failed", false);
  };

  /* ── Content settings handlers ── */
  const saveEngAbout = async () => {
    const ok = await Promise.all([
      saveContentSetting("engineer_about_heading", engAboutHeading),
      saveContentSetting("engineer_about_body", engAboutBody),
      saveContentSetting("engineer_about_manifesto", engAboutManifesto),
    ]);
    if (ok.every(Boolean)) showToast("Engineer About saved");
    else showToast("Failed to save", false);
  };
  const saveEngTerminal = async () => {
    if (await saveContentSetting("engineer_terminal_about", engTerminalAbout)) showToast("Terminal About saved");
    else showToast("Failed", false);
  };
  const saveEngBeyondCode = async () => {
    const items = engBeyondCodeText.split("\n").map(line => {
      const sep = line.indexOf("|");
      if (sep === -1) return null;
      return { t: line.slice(0, sep).trim(), d: line.slice(sep + 1).trim() };
    }).filter(Boolean) as Array<{t:string;d:string}>;
    if (await saveContentSetting("engineer_beyond_code", items)) { setEngBeyondCode(items); showToast("Beyond Code saved"); }
    else showToast("Failed", false);
  };
  const savePoetAbout = async () => {
    const ok = await Promise.all([
      saveContentSetting("poet_about_heading", poetAboutHeading),
      saveContentSetting("poet_about_body", poetAboutBody),
    ]);
    if (ok.every(Boolean)) showToast("Poet About saved");
    else showToast("Failed to save", false);
  };
  const savePoetBook = async () => {
    const ok = await Promise.all([
      saveContentSetting("poet_book_title", poetBookTitle),
      saveContentSetting("poet_book_description", poetBookDescription),
      saveContentSetting("book_link", settingBookLink),
    ]);
    if (ok.every(Boolean)) showToast("Book info saved");
    else showToast("Failed", false);
  };

  /* ── Settings handlers ── */
  const handleCvUpload = async () => {
    if (!cvFile) { showToast("Select a PDF first", false); return; }
    setUploadingCv(true);
    try {
      const form = new FormData();
      form.append("file", cvFile);
      const res = await fetch("/api/cv", { method: "POST", headers: { "Authorization": password }, body: form });
      if (res.ok) {
        const { url } = await res.json();
        setCvUrl(url); setCvFile(null);
        if (cvFileRef.current) cvFileRef.current.value = "";
        showToast("CV uploaded");
      } else showToast("Upload failed", false);
    } catch { showToast("Network error", false); }
    finally { setUploadingCv(false); }
  };
  const saveSocialLinks = async () => {
    await Promise.all([
      saveContentSetting("social_email", settingEmail),
      saveContentSetting("social_linkedin", settingLinkedIn),
      saveContentSetting("social_github", settingGitHub),
    ]);
    showToast("Social links saved");
  };
  const saveBookLink = async () => {
    if (await saveContentSetting("book_link", settingBookLink)) showToast("Book link saved");
    else showToast("Failed", false);
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

      <header style={{ padding: "0 clamp(24px,5vw,60px)", minHeight: 56, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${border}`, background: surface, flexWrap: "wrap", gap: 8, paddingTop: 8, paddingBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.3em", color: rustDim }}>ELIA · ADMIN</span>
          <span style={{ width: 1, height: 16, background: border }} />
          <div style={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {(["blog", "gallery", "lab", "projects", "skills", "certs", "awards", "poems", "content", "settings"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "6px 14px", background: tab === t ? rust : "transparent", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.18em", color: tab === t ? "#fff" : dim, textTransform: "uppercase", transition: "all 0.2s" }}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input value={workingOnInput} onChange={e => setWorkingOnInput(e.target.value)} placeholder="Currently working on…" style={{ ...inputStyle, width: 200, padding: "5px 10px", fontSize: 11 }} />
          <button onClick={saveWorkingOn} style={{ ...btnStyle(green), padding: "5px 10px", fontSize: 9 }}>Save</button>
          {!posts.find(p => p.id === "001") && (
            <button onClick={handleSeed} style={{ ...btnStyle("#7c3aed"), padding: "5px 10px", fontSize: 9 }}>SEED INITIAL DATA</button>
          )}
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
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, padding: "1px 7px", background: p.category === "devlog" ? "rgba(57,255,20,0.12)" : "rgba(96,165,250,0.12)", color: p.category === "devlog" ? "#39ff14" : "#60a5fa", border: `1px solid ${p.category === "devlog" ? "rgba(57,255,20,0.2)" : "rgba(96,165,250,0.2)"}` }}>{p.category ?? "blog"}</span>
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
                <div><label style={labelStyle}>Category</label><select value={F.category ?? "blog"} onChange={e => SF(f => ({ ...f, category: e.target.value }))} style={{ ...inputStyle, appearance: "none" }}><option value="blog">Blog (Poet)</option><option value="devlog">Devlog (Engineer)</option></select></div>
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
                    {item.type === "video" && item.video_url
                      ? <div style={{ position: "relative" }}>
                          <video src={item.video_url} style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block", marginBottom: 8 }} muted playsInline preload="metadata" />
                          <div style={{ position: "absolute", top: 4, left: 4, background: "rgba(0,0,0,0.7)", padding: "2px 6px", fontFamily: "var(--font-mono)", fontSize: 8, color: "#fff", letterSpacing: "0.1em" }}>VIDEO</div>
                        </div>
                      : item.type === "image" && item.image_url
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, marginBottom: 16 }}>
                {(["quote", "image", "video"] as const).map(t => (
                  <button key={t} onClick={() => { setGalForm(f => ({ ...f, type: t })); setImgFile(null); setImgPreview(null); setVideoFile(null); setVideoPreview(null); }} style={{ padding: "8px", background: galForm.type === t ? rust : surface, border: `1px solid ${border}`, color: galForm.type === t ? "#fff" : dim, cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" }}>{t}</button>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {galForm.type === "quote" ? (
                  <>
                    <div><label style={labelStyle}>Quote text *</label><textarea value={galForm.text} onChange={e => setGalForm(f => ({ ...f, text: e.target.value }))} rows={4} placeholder="Enter a poem line…" style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }} /></div>
                    <div><label style={labelStyle}>Source poem</label><input value={galForm.poem} onChange={e => setGalForm(f => ({ ...f, poem: e.target.value }))} placeholder="e.g. Invisible Thread" style={inputStyle} /></div>
                  </>
                ) : galForm.type === "image" ? (
                  <>
                    <div><label style={labelStyle}>Image *</label><input ref={fileRef} type="file" accept="image/*" onChange={handleImageFile} style={{ ...inputStyle, padding: "8px 12px", cursor: "pointer" }} /></div>
                    {imgPreview && <img src={imgPreview} alt="" style={{ width: "100%", aspectRatio: galForm.aspect_ratio === "16:9" ? "16/9" : galForm.aspect_ratio === "3:4" ? "3/4" : galForm.aspect_ratio === "21:9" ? "21/9" : galForm.aspect_ratio === "original" ? "auto" : "1/1", objectFit: "cover", border: `1px solid ${border}` }} />}
                    <div>
                      <label style={labelStyle}>Aspect Ratio</label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 4 }}>
                        {([["original","Auto"],["1:1","1:1"],["16:9","16:9"],["3:4","3:4"],["21:9","21:9"]] as const).map(([val, label]) => (
                          <button key={val} type="button" onClick={() => setGalForm(f => ({ ...f, aspect_ratio: val }))}
                            style={{ padding: "6px 4px", background: galForm.aspect_ratio === val ? rust : surface, border: `1px solid ${galForm.aspect_ratio === val ? rust : border}`, color: galForm.aspect_ratio === val ? "#fff" : dim, cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em" }}>{label}</button>
                        ))}
                      </div>
                    </div>
                    <div><label style={labelStyle}>Caption</label><input value={galForm.caption} onChange={e => setGalForm(f => ({ ...f, caption: e.target.value }))} placeholder="Optional caption…" style={inputStyle} /></div>
                    <div><label style={labelStyle}>Source poem</label><input value={galForm.poem} onChange={e => setGalForm(f => ({ ...f, poem: e.target.value }))} placeholder="e.g. Oh Sea" style={inputStyle} /></div>
                  </>
                ) : (
                  <>
                    <div><label style={labelStyle}>Video * (mp4, webm, mov)</label><input ref={fileRef} type="file" accept="video/*" onChange={handleVideoFile} style={{ ...inputStyle, padding: "8px 12px", cursor: "pointer" }} /></div>
                    {compressing && (
                      <div style={{ padding: 12, background: surface, border: `1px solid ${border}` }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: rustDim, marginBottom: 8, letterSpacing: "0.15em" }}>COMPRESSING… {compressionProgress}%</div>
                        <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                          <div style={{ width: `${compressionProgress}%`, height: "100%", background: rust, transition: "width 0.3s" }} />
                        </div>
                      </div>
                    )}
                    {videoPreview && !compressing && (
                      <video src={videoPreview} style={{ width: "100%", aspectRatio: galForm.aspect_ratio === "16:9" ? "16/9" : galForm.aspect_ratio === "3:4" ? "3/4" : galForm.aspect_ratio === "21:9" ? "21/9" : galForm.aspect_ratio === "original" ? "auto" : "1/1", objectFit: "cover", border: `1px solid ${border}` }} controls muted playsInline />
                    )}
                    {videoFile && <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: dim, letterSpacing: "0.1em" }}>Size: {(videoFile.size / 1024 / 1024).toFixed(1)}MB</div>}
                    <div>
                      <label style={labelStyle}>Aspect Ratio</label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 4 }}>
                        {([["original","Auto"],["1:1","1:1"],["16:9","16:9"],["3:4","3:4"],["21:9","21:9"]] as const).map(([val, label]) => (
                          <button key={val} type="button" onClick={() => setGalForm(f => ({ ...f, aspect_ratio: val }))}
                            style={{ padding: "6px 4px", background: galForm.aspect_ratio === val ? rust : surface, border: `1px solid ${galForm.aspect_ratio === val ? rust : border}`, color: galForm.aspect_ratio === val ? "#fff" : dim, cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em" }}>{label}</button>
                        ))}
                      </div>
                    </div>
                    <div><label style={labelStyle}>Caption</label><input value={galForm.caption} onChange={e => setGalForm(f => ({ ...f, caption: e.target.value }))} placeholder="Optional caption…" style={inputStyle} /></div>
                    <div><label style={labelStyle}>Source poem</label><input value={galForm.poem} onChange={e => setGalForm(f => ({ ...f, poem: e.target.value }))} placeholder="e.g. Oh Sea" style={inputStyle} /></div>
                  </>
                )}
                <button onClick={saveGalleryItem} disabled={uploading || compressing} style={{ ...btnStyle(), width: "100%", marginTop: 4, opacity: (uploading || compressing) ? 0.6 : 1 }}>{uploading ? "Uploading…" : compressing ? "Compressing…" : "Add to Gallery"}</button>
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

        {/* ── PROJECTS ── */}
        {tab === "projects" && (
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.25em", color: rustDim, marginBottom: 24 }}>// FEATURED PROJECTS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 2, alignItems: "start", marginBottom: 48 }}>
              <div>
                {featuredProjs.length === 0 && <div style={{ padding: "24px", border: `1px dashed ${border}`, color: faint, fontFamily: "var(--font-mono)", fontSize: 11, textAlign: "center" }}>No featured projects. Add one →</div>}
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {featuredProjs.map(p => (
                    <div key={p.id} style={{ padding: "14px 16px", background: card, border: `1px solid ${border}`, borderLeft: `3px solid ${p.accent}`, display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, padding: "1px 7px", background: "rgba(196,103,62,0.15)", color: rust, border: "1px solid rgba(196,103,62,0.2)" }}>{p.status}</span>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: faint }}>{p.period}</span>
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: text, marginBottom: 2 }}>{p.title}</div>
                        <div style={{ fontSize: 12, color: dim }}>{p.subtitle}</div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => { setEditFeatured(p); setFeaturedForm(p); setFeaturedTechText(p.tech.join(", ")); }} style={{ ...btnStyle("#333"), fontSize: 8, padding: "6px 10px" }}>Edit</button>
                        <button onClick={() => deleteFeaturedProject(p.id)} style={{ ...btnStyle(red), fontSize: 8, padding: "6px 10px" }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: card, border: `1px solid ${border}`, padding: "24px 20px", position: "sticky", top: 24 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: rustDim, marginBottom: 16 }}>{editFeatured ? "✎ EDITING" : "+ NEW FEATURED"}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div><label style={labelStyle}>Title *</label><input value={featuredForm.title} onChange={e => setFeaturedForm(f => ({ ...f, title: e.target.value }))} placeholder="Project title" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Subtitle</label><input value={featuredForm.subtitle} onChange={e => setFeaturedForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Short tagline" style={inputStyle} /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div><label style={labelStyle}>Status</label><select value={featuredForm.status} onChange={e => setFeaturedForm(f => ({ ...f, status: e.target.value }))} style={{ ...inputStyle, appearance: "none" }}>{PROJECT_STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
                    <div><label style={labelStyle}>Period</label><input value={featuredForm.period} onChange={e => setFeaturedForm(f => ({ ...f, period: e.target.value }))} placeholder="2024" style={inputStyle} /></div>
                  </div>
                  <div><label style={labelStyle}>Accent color</label><input type="color" value={featuredForm.accent} onChange={e => setFeaturedForm(f => ({ ...f, accent: e.target.value }))} style={{ ...inputStyle, padding: "4px", height: 42, cursor: "pointer" }} /></div>
                  <div><label style={labelStyle}>Problem</label><textarea value={featuredForm.problem} onChange={e => setFeaturedForm(f => ({ ...f, problem: e.target.value }))} rows={2} style={{ ...inputStyle, resize: "vertical" }} /></div>
                  <div><label style={labelStyle}>Solution</label><textarea value={featuredForm.solution} onChange={e => setFeaturedForm(f => ({ ...f, solution: e.target.value }))} rows={2} style={{ ...inputStyle, resize: "vertical" }} /></div>
                  <div><label style={labelStyle}>Impact</label><textarea value={featuredForm.impact} onChange={e => setFeaturedForm(f => ({ ...f, impact: e.target.value }))} rows={2} style={{ ...inputStyle, resize: "vertical" }} /></div>
                  <div><label style={labelStyle}>Tech (comma-separated)</label><input value={featuredTechText} onChange={e => setFeaturedTechText(e.target.value)} placeholder="React, Node.js, Python" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Link</label><input value={featuredForm.link ?? ""} onChange={e => setFeaturedForm(f => ({ ...f, link: e.target.value || null }))} placeholder="https://…" style={inputStyle} /></div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={saveFeaturedProject} disabled={loading} style={{ ...btnStyle(), flex: 1, opacity: loading ? 0.6 : 1 }}>{editFeatured ? "Save" : "Add"}</button>
                    {editFeatured && <button onClick={resetFeaturedForm} style={{ ...btnStyle("#333"), padding: "10px 14px" }}>Cancel</button>}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.25em", color: rustDim, marginBottom: 24 }}>// OTHER PROJECTS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 2, alignItems: "start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {otherProjs.map(p => (
                  <div key={p.title} style={{ padding: "12px 16px", background: card, border: `1px solid ${border}`, display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}>
                    <div>
                      {p.badge && <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#fbbf24", marginBottom: 3 }}>{p.badge}</div>}
                      <div style={{ fontWeight: 600, fontSize: 14, color: text, marginBottom: 2 }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: dim }}>{p.desc.slice(0, 80)}{p.desc.length > 80 ? "…" : ""}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { setEditOther(p); setOtherForm(p); setOtherTechText(p.tech.join(", ")); }} style={{ ...btnStyle("#333"), fontSize: 8, padding: "6px 10px" }}>Edit</button>
                      <button onClick={() => deleteOtherProject(p.title)} style={{ ...btnStyle(red), fontSize: 8, padding: "6px 10px" }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: card, border: `1px solid ${border}`, padding: "24px 20px", position: "sticky", top: 24 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: rustDim, marginBottom: 16 }}>{editOther ? "✎ EDITING" : "+ NEW PROJECT"}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div><label style={labelStyle}>Title *</label><input value={otherForm.title} onChange={e => setOtherForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Description</label><textarea value={otherForm.desc} onChange={e => setOtherForm(f => ({ ...f, desc: e.target.value }))} rows={3} style={{ ...inputStyle, resize: "vertical" }} /></div>
                  <div><label style={labelStyle}>Tech (comma-separated)</label><input value={otherTechText} onChange={e => setOtherTechText(e.target.value)} placeholder="React, Python" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Badge (optional)</label><input value={otherForm.badge ?? ""} onChange={e => setOtherForm(f => ({ ...f, badge: e.target.value || null }))} placeholder="🥈 2nd Place…" style={inputStyle} /></div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={saveOtherProject} disabled={loading} style={{ ...btnStyle(), flex: 1, opacity: loading ? 0.6 : 1 }}>{editOther ? "Save" : "Add"}</button>
                    {editOther && <button onClick={resetOtherForm} style={{ ...btnStyle("#333"), padding: "10px 14px" }}>Cancel</button>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SKILLS ── */}
        {tab === "skills" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 2, alignItems: "start" }}>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: dim, marginBottom: 16 }}>{skillsData.length} CATEGORIES</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {skillsData.map((s, i) => (
                  <div key={i} style={{ padding: "14px 16px", background: card, border: `1px solid ${border}`, display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "start" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: text, marginBottom: 6 }}>{s.cat}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {s.items.map((item, j) => <span key={j} style={{ fontFamily: "var(--font-mono)", fontSize: 9, padding: "2px 8px", background: "rgba(57,255,20,0.06)", color: "rgba(57,255,20,0.7)", border: "1px solid rgba(57,255,20,0.15)" }}>{item}</span>)}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { setEditSkillIdx(i); setSkillForm(s); setSkillItemsText(s.items.join(", ")); }} style={{ ...btnStyle("#333"), fontSize: 8, padding: "6px 10px" }}>Edit</button>
                      <button onClick={() => deleteSkill(i)} style={{ ...btnStyle(red), fontSize: 8, padding: "6px 10px" }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: card, border: `1px solid ${border}`, padding: "24px 20px", position: "sticky", top: 24 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: rustDim, marginBottom: 16 }}>{editSkillIdx !== null ? "✎ EDITING" : "+ NEW CATEGORY"}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div><label style={labelStyle}>Category name *</label><input value={skillForm.cat} onChange={e => setSkillForm(f => ({ ...f, cat: e.target.value }))} placeholder="e.g. Languages" style={inputStyle} /></div>
                <div><label style={labelStyle}>Items (comma-separated)</label><textarea value={skillItemsText} onChange={e => setSkillItemsText(e.target.value)} rows={4} placeholder="Python, TypeScript, Java…" style={{ ...inputStyle, resize: "vertical" }} /></div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={saveSkill} disabled={loading} style={{ ...btnStyle(), flex: 1, opacity: loading ? 0.6 : 1 }}>{editSkillIdx !== null ? "Save" : "Add Category"}</button>
                  {editSkillIdx !== null && <button onClick={resetSkillForm} style={{ ...btnStyle("#333"), padding: "10px 14px" }}>Cancel</button>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CERTS ── */}
        {tab === "certs" && (
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.25em", color: rustDim, marginBottom: 24 }}>// CERTIFICATIONS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 2, alignItems: "start", marginBottom: 48 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {certsData.map((c, i) => (
                  <div key={i} style={{ padding: "12px 16px", background: card, border: `1px solid ${border}`, borderLeft: `2px solid ${c.accent}`, display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: text, marginBottom: 2 }}>{c.name}</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: dim }}>{c.issuer} · {c.detail} · {c.date}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { setEditCertIdx(i); setCertForm(c); }} style={{ ...btnStyle("#333"), fontSize: 8, padding: "6px 10px" }}>Edit</button>
                      <button onClick={() => deleteCert(i)} style={{ ...btnStyle(red), fontSize: 8, padding: "6px 10px" }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: card, border: `1px solid ${border}`, padding: "24px 20px", position: "sticky", top: 24 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: rustDim, marginBottom: 16 }}>{editCertIdx !== null ? "✎ EDITING" : "+ NEW CERT"}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div><label style={labelStyle}>Name *</label><input value={certForm.name} onChange={e => setCertForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Issuer</label><input value={certForm.issuer} onChange={e => setCertForm(f => ({ ...f, issuer: e.target.value }))} style={inputStyle} /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div><label style={labelStyle}>Date</label><input value={certForm.date} onChange={e => setCertForm(f => ({ ...f, date: e.target.value }))} placeholder="Jan 2025" style={inputStyle} /></div>
                    <div><label style={labelStyle}>Accent</label><input type="color" value={certForm.accent} onChange={e => setCertForm(f => ({ ...f, accent: e.target.value }))} style={{ ...inputStyle, padding: "4px", height: 42, cursor: "pointer" }} /></div>
                  </div>
                  <div><label style={labelStyle}>Detail</label><input value={certForm.detail} onChange={e => setCertForm(f => ({ ...f, detail: e.target.value }))} placeholder="Score: 99/120" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Link (optional)</label><input value={certForm.link ?? ""} onChange={e => setCertForm(f => ({ ...f, link: e.target.value || null }))} placeholder="https://credly.com/…" style={inputStyle} /></div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={saveCert} disabled={loading} style={{ ...btnStyle(), flex: 1, opacity: loading ? 0.6 : 1 }}>{editCertIdx !== null ? "Save" : "Add"}</button>
                    {editCertIdx !== null && <button onClick={resetCertForm} style={{ ...btnStyle("#333"), padding: "10px 14px" }}>Cancel</button>}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.25em", color: rustDim, marginBottom: 24 }}>// AWARDS & HONORS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 2, alignItems: "start", marginBottom: 48 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {awardsData.map((a, i) => (
                  <div key={i} style={{ padding: "12px 16px", background: card, border: `1px solid ${border}`, display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <span style={{ fontSize: 20 }}>{a.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: text }}>{a.title}</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: dim }}>{a.body} · {a.detail}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { setEditAwardIdx(i); setAwardForm(a); }} style={{ ...btnStyle("#333"), fontSize: 8, padding: "6px 10px" }}>Edit</button>
                      <button onClick={() => deleteAward(i)} style={{ ...btnStyle(red), fontSize: 8, padding: "6px 10px" }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: card, border: `1px solid ${border}`, padding: "24px 20px", position: "sticky", top: 24 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: rustDim, marginBottom: 16 }}>{editAwardIdx !== null ? "✎ EDITING" : "+ NEW AWARD"}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div><label style={labelStyle}>Icon</label><input value={awardForm.icon} onChange={e => setAwardForm(f => ({ ...f, icon: e.target.value }))} placeholder="🥇 or ◆" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Title *</label><input value={awardForm.title} onChange={e => setAwardForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Body</label><input value={awardForm.body} onChange={e => setAwardForm(f => ({ ...f, body: e.target.value }))} placeholder="AUST" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Detail</label><input value={awardForm.detail} onChange={e => setAwardForm(f => ({ ...f, detail: e.target.value }))} placeholder="Spring 2024 – 2025" style={inputStyle} /></div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={saveAward} disabled={loading} style={{ ...btnStyle(), flex: 1, opacity: loading ? 0.6 : 1 }}>{editAwardIdx !== null ? "Save" : "Add"}</button>
                    {editAwardIdx !== null && <button onClick={resetAwardForm} style={{ ...btnStyle("#333"), padding: "10px 14px" }}>Cancel</button>}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.25em", color: rustDim, marginBottom: 24 }}>// STATS BAR</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 2, alignItems: "start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {statsData.map((s, i) => (
                  <div key={i} style={{ padding: "12px 16px", background: card, border: `1px solid ${border}`, display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: text }}>{s.prefix}{s.value}{s.suffix} — <span style={{ color: dim }}>{s.label}</span></div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { setEditStatIdx(i); setStatForm(s); }} style={{ ...btnStyle("#333"), fontSize: 8, padding: "6px 10px" }}>Edit</button>
                      <button onClick={() => deleteStat(i)} style={{ ...btnStyle(red), fontSize: 8, padding: "6px 10px" }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: card, border: `1px solid ${border}`, padding: "24px 20px", position: "sticky", top: 24 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: rustDim, marginBottom: 16 }}>{editStatIdx !== null ? "✎ EDITING" : "+ NEW STAT"}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div><label style={labelStyle}>Label *</label><input value={statForm.label} onChange={e => setStatForm(f => ({ ...f, label: e.target.value }))} placeholder="Certifications" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Value</label><input type="number" value={statForm.value} onChange={e => setStatForm(f => ({ ...f, value: Number(e.target.value) }))} style={inputStyle} /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div><label style={labelStyle}>Prefix</label><input value={statForm.prefix} onChange={e => setStatForm(f => ({ ...f, prefix: e.target.value }))} placeholder="#" style={inputStyle} /></div>
                    <div><label style={labelStyle}>Suffix</label><input value={statForm.suffix} onChange={e => setStatForm(f => ({ ...f, suffix: e.target.value }))} placeholder="+" style={inputStyle} /></div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={saveStat} disabled={loading} style={{ ...btnStyle(), flex: 1, opacity: loading ? 0.6 : 1 }}>{editStatIdx !== null ? "Save" : "Add"}</button>
                    {editStatIdx !== null && <button onClick={resetStatForm} style={{ ...btnStyle("#333"), padding: "10px 14px" }}>Cancel</button>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── AWARDS ── */}
        {tab === "awards" && (
          <div style={{ color: dim, fontFamily: "var(--font-mono)", fontSize: 12, padding: "24px 0" }}>
            Awards &amp; Stats are managed under the <button onClick={() => setTab("certs")} style={{ background: "none", border: "none", color: rust, cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 12, textDecoration: "underline" }}>Certs</button> tab.
          </div>
        )}

        {/* ── POEMS ── */}
        {tab === "poems" && (
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.25em", color: rustDim, marginBottom: 24 }}>// POEMS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 2, alignItems: "start", marginBottom: 48 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {poemsData.map((p, i) => (
                  <div key={i} style={{ padding: "12px 16px", background: card, border: `1px solid ${border}`, display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: text, marginBottom: 2 }}>{p.title}</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: dim }}>{p.year} · {p.theme}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { setEditPoemIdx(i); setPoemForm(p); }} style={{ ...btnStyle("#333"), fontSize: 8, padding: "6px 10px" }}>Edit</button>
                      <button onClick={() => deletePoem(i)} style={{ ...btnStyle(red), fontSize: 8, padding: "6px 10px" }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: card, border: `1px solid ${border}`, padding: "24px 20px", position: "sticky", top: 24 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: rustDim, marginBottom: 16 }}>{editPoemIdx !== null ? "✎ EDITING" : "+ NEW POEM"}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div><label style={labelStyle}>Title *</label><input value={poemForm.title} onChange={e => setPoemForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div><label style={labelStyle}>Year</label><input value={poemForm.year} onChange={e => setPoemForm(f => ({ ...f, year: e.target.value }))} placeholder="2022" style={inputStyle} /></div>
                    <div><label style={labelStyle}>Theme</label><input value={poemForm.theme} onChange={e => setPoemForm(f => ({ ...f, theme: e.target.value }))} placeholder="Identity" style={inputStyle} /></div>
                  </div>
                  <div><label style={labelStyle}>Lines (full text)</label><textarea value={poemForm.lines} onChange={e => setPoemForm(f => ({ ...f, lines: e.target.value }))} rows={10} placeholder="Poem text…" style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.7 }} /></div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={savePoem} disabled={loading} style={{ ...btnStyle(), flex: 1, opacity: loading ? 0.6 : 1 }}>{editPoemIdx !== null ? "Save" : "Add Poem"}</button>
                    {editPoemIdx !== null && <button onClick={resetPoemForm} style={{ ...btnStyle("#333"), padding: "10px 14px" }}>Cancel</button>}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.25em", color: rustDim, marginBottom: 16 }}>// HERO CYCLING LINES</div>
            <div style={{ fontSize: 12, color: dim, marginBottom: 16 }}>Enter each hero line separated by <code style={{ background: surface, padding: "1px 6px" }}>---</code> on its own line. Newlines within a line are preserved.</div>
            <textarea
              value={heroLinesText}
              onChange={e => setHeroLinesText(e.target.value)}
              rows={12}
              style={{ ...inputStyle, width: "100%", resize: "vertical", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.7, marginBottom: 12 }}
              placeholder={"Come all,\nwe're witnessing\nthe eclipse.\n---\nThe sun tries\nher best\nbut never listens."}
            />
            <button onClick={saveHeroLines} disabled={loading} style={{ ...btnStyle(), opacity: loading ? 0.6 : 1 }}>Save Hero Lines</button>
          </div>
        )}

        {/* ── CONTENT ── */}
        {tab === "content" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.25em", color: rustDim, marginBottom: 4 }}>// PAGE CONTENT SETTINGS</div>

            {/* Engineer About */}
            <div style={{ background: card, border: `1px solid ${border}`, padding: "24px 20px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: "rgba(57,255,20,0.7)", marginBottom: 16 }}>ENGINEER — ABOUT SECTION</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Heading (use \n for line breaks)</label>
                  <textarea value={engAboutHeading} onChange={e => setEngAboutHeading(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.6 }} placeholder={"I don't wait for the\nright moment.\nI build it."} />
                </div>
                <div>
                  <label style={labelStyle}>Body paragraphs (separate with --- on its own line)</label>
                  <textarea value={engAboutBody} onChange={e => setEngAboutBody(e.target.value)} rows={6} style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.6 }} placeholder={"First paragraph\n---\nSecond paragraph"} />
                </div>
                <div>
                  <label style={labelStyle}>Manifesto / highlighted phrase</label>
                  <input value={engAboutManifesto} onChange={e => setEngAboutManifesto(e.target.value)} style={inputStyle} placeholder="The impossible, made." />
                </div>
                <button onClick={saveEngAbout} disabled={loading} style={{ ...btnStyle(), opacity: loading ? 0.6 : 1, alignSelf: "flex-start" }}>Save Engineer About</button>
              </div>
            </div>

            {/* Engineer Terminal */}
            <div style={{ background: card, border: `1px solid ${border}`, padding: "24px 20px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: "rgba(57,255,20,0.7)", marginBottom: 16 }}>ENGINEER — TERMINAL ABOUT (cat about.txt)</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Each line of the about output (one per line)</label>
                  <textarea value={engTerminalAbout} onChange={e => setEngTerminalAbout(e.target.value)} rows={8} style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.6 }} placeholder={"  Name:       Elia Ghazal\n  Location:   Lebanon → the world"} />
                </div>
                <button onClick={saveEngTerminal} disabled={loading} style={{ ...btnStyle(), opacity: loading ? 0.6 : 1, alignSelf: "flex-start" }}>Save Terminal About</button>
              </div>
            </div>

            {/* Engineer Beyond the Code */}
            <div style={{ background: card, border: `1px solid ${border}`, padding: "24px 20px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: "rgba(57,255,20,0.7)", marginBottom: 16 }}>ENGINEER — BEYOND THE CODE</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Items — format: Title|Description (one per line)</label>
                  <textarea value={engBeyondCodeText} onChange={e => setEngBeyondCodeText(e.target.value)} rows={6} style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.6 }} placeholder={"AI Workshop|Attended regional AI/ML workshop.\nEnvironmental Seminar|AUST sustainability series."} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {engBeyondCode.map((item, i) => (
                    <div key={i} style={{ padding: "8px 12px", background: surface, border: `1px solid ${border}`, fontSize: 12, color: dim }}>
                      <span style={{ color: text, fontWeight: 600 }}>{item.t}</span> — {item.d}
                    </div>
                  ))}
                </div>
                <button onClick={saveEngBeyondCode} disabled={loading} style={{ ...btnStyle(), opacity: loading ? 0.6 : 1, alignSelf: "flex-start" }}>Save Beyond Code</button>
              </div>
            </div>

            {/* Poet About */}
            <div style={{ background: card, border: `1px solid ${border}`, padding: "24px 20px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: rustDim, marginBottom: 16 }}>POET — ABOUT SECTION</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Heading (use \n for line breaks)</label>
                  <textarea value={poetAboutHeading} onChange={e => setPoetAboutHeading(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.6 }} placeholder={"Writing was\nnever a choice.\nIt was survival."} />
                </div>
                <div>
                  <label style={labelStyle}>Body paragraphs (separate with --- on its own line)</label>
                  <textarea value={poetAboutBody} onChange={e => setPoetAboutBody(e.target.value)} rows={6} style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.6 }} placeholder={"First paragraph\n---\nSecond paragraph"} />
                </div>
                <button onClick={savePoetAbout} disabled={loading} style={{ ...btnStyle(), opacity: loading ? 0.6 : 1, alignSelf: "flex-start" }}>Save Poet About</button>
              </div>
            </div>

            {/* Poet Book */}
            <div style={{ background: card, border: `1px solid ${border}`, padding: "24px 20px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: rustDim, marginBottom: 16 }}>POET — BOOK INFO</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div><label style={labelStyle}>Book title</label><input value={poetBookTitle} onChange={e => setPoetBookTitle(e.target.value)} style={inputStyle} placeholder="Whispers of the Eclipse" /></div>
                <div>
                  <label style={labelStyle}>Book description</label>
                  <textarea value={poetBookDescription} onChange={e => setPoetBookDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
                </div>
                <div><label style={labelStyle}>Book purchase link</label><input value={settingBookLink} onChange={e => setSettingBookLink(e.target.value)} style={inputStyle} placeholder="https://linktr.ee/…" /></div>
                <button onClick={savePoetBook} disabled={loading} style={{ ...btnStyle(), opacity: loading ? 0.6 : 1, alignSelf: "flex-start" }}>Save Book Info</button>
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab === "settings" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

            {/* CV Upload */}
            <div style={{ background: card, border: `1px solid ${border}`, padding: "24px 20px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: rustDim, marginBottom: 16 }}>// CV / RESUME</div>
              {cvUrl && (
                <div style={{ marginBottom: 16, padding: "10px 12px", background: surface, border: `1px solid ${border}` }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: dim, marginBottom: 4 }}>CURRENT CV URL</div>
                  <a href={cvUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: green, wordBreak: "break-all" }}>{cvUrl}</a>
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div><label style={labelStyle}>Upload new CV (PDF)</label><input ref={cvFileRef} type="file" accept=".pdf" onChange={e => setCvFile(e.target.files?.[0] ?? null)} style={{ ...inputStyle, padding: "8px 12px", cursor: "pointer" }} /></div>
                <button onClick={handleCvUpload} disabled={uploadingCv || !cvFile} style={{ ...btnStyle(green), opacity: (uploadingCv || !cvFile) ? 0.5 : 1 }}>{uploadingCv ? "Uploading…" : "Upload CV"}</button>
              </div>
            </div>

            {/* Social Links */}
            <div style={{ background: card, border: `1px solid ${border}`, padding: "24px 20px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: rustDim, marginBottom: 16 }}>// SOCIAL LINKS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div><label style={labelStyle}>Email</label><input value={settingEmail} onChange={e => setSettingEmail(e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>LinkedIn URL</label><input value={settingLinkedIn} onChange={e => setSettingLinkedIn(e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>GitHub URL</label><input value={settingGitHub} onChange={e => setSettingGitHub(e.target.value)} style={inputStyle} /></div>
                <button onClick={saveSocialLinks} style={btnStyle()}>Save Social Links</button>
              </div>
            </div>

            {/* Book Link */}
            <div style={{ background: card, border: `1px solid ${border}`, padding: "24px 20px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: rustDim, marginBottom: 16 }}>// BOOK LINK</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div><label style={labelStyle}>Book purchase link</label><input value={settingBookLink} onChange={e => setSettingBookLink(e.target.value)} style={inputStyle} /></div>
                <button onClick={saveBookLink} style={btnStyle()}>Save Book Link</button>
              </div>
            </div>

            {/* Currently Working On */}
            <div style={{ background: card, border: `1px solid ${border}`, padding: "24px 20px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: rustDim, marginBottom: 16 }}>// CURRENTLY WORKING ON</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div><label style={labelStyle}>Status text</label><input value={workingOnInput} onChange={e => setWorkingOnInput(e.target.value)} placeholder="CrashLens v2" style={inputStyle} /></div>
                <button onClick={saveWorkingOn} style={btnStyle()}>Save</button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
