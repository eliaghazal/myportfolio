"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  DEFAULT_FEATURED, DEFAULT_OTHER_PROJECTS, DEFAULT_SKILLS,
  DEFAULT_CERTS, DEFAULT_AWARDS, DEFAULT_STATS,
  type FeaturedProject, type OtherProject, type Skill, type Cert, type Award, type Stat,
} from "@/lib/defaults";

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */
const ROLES = ["Engineer.", "AI Developer.", "IoT Architect.", "Builder.", "Problem Solver.", "Lebanese."];

/* ═══════════════════════════════════════════════════════════════
   CODE RAIN
═══════════════════════════════════════════════════════════════ */
const CODE_FRAGS = [
  "const pressure = new Legacy();","if (impossible) { solve(); }","fn build() -> Result<Empire>",
  "import { ambition } from 'core'","while (breathing) { create(); }","class Engineer extends Poet {}",
  "git commit -m 'still running'","const elia = new Unstoppable();","// 3am. still compiling.",
  "let fate = self.write();","const legacy = await build();","// Lebanon → the world",
  "type Elia = Engineer & Poet;","deploy --force --no-limits",
];

function initCodeRain(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d"); if (!ctx) return null;
  const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
  resize();
  const fontSize = 12, colW = fontSize * 1.7;
  const cols = Math.floor(canvas.width / colW);
  type Col = { x:number; y:number; speed:number; text:string; opacity:number; delay:number };
  const columns: Col[] = Array.from({ length: cols }, (_, i) => ({
    x: i*colW+4, y: Math.random()*-canvas.height*1.5,
    speed: Math.random()*0.5+0.2,
    text: CODE_FRAGS[Math.floor(Math.random()*CODE_FRAGS.length)],
    opacity: Math.random()*0.28+0.1, delay: Math.floor(Math.random()*80),
  }));
  let animId: number, frame = 0;
  const draw = () => {
    frame++; ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.font = `${fontSize}px "IBM Plex Mono", monospace`;
    for (const col of columns) {
      if (frame < col.delay) continue;
      col.text.split("").forEach((ch, ci) => {
        const yPos = col.y + ci*(fontSize*1.6);
        if (yPos < -fontSize || yPos > canvas.height+fontSize) return;
        const isLead = ci === col.text.length-1;
        const alpha = isLead ? Math.min(col.opacity*3, 0.98) : col.opacity*(1-(ci/col.text.length)*0.5);
        ctx.fillStyle = isLead ? `rgba(180,255,180,${alpha})` : `rgba(57,255,20,${alpha})`;
        ctx.fillText(ch, col.x, yPos);
      });
      col.y += col.speed;
      if (col.y > canvas.height+140) {
        col.y = -(Math.random()*canvas.height*0.5+80);
        col.text = CODE_FRAGS[Math.floor(Math.random()*CODE_FRAGS.length)];
        col.opacity = Math.random()*0.28+0.1;
      }
    }
    animId = requestAnimationFrame(draw);
  };
  draw();
  window.addEventListener("resize", resize);
  return { destroy: () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); } };
}

/* ═══════════════════════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════════════════════ */

/* Single robust observer factory — fires with rootMargin so nothing stays blank */
function makeObs(cb: () => void) {
  return new IntersectionObserver(([e]) => { if (e.isIntersecting) { cb(); } }, { threshold: 0, rootMargin: "0px 0px -40px 0px" });
}

/* Staggered reveal */
function useStagger(staggerMs = 80) {
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);
  useEffect(() => {
    const container = ref.current; if (!container) return;
    const children = Array.from(container.children) as HTMLElement[];
    children.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = `opacity 0.5s ease ${i*staggerMs}ms, transform 0.5s ease ${i*staggerMs}ms`;
    });
    const obs = makeObs(() => {
      if (fired.current) return; fired.current = true;
      children.forEach(el => { el.style.opacity = "1"; el.style.transform = "translateY(0)"; });
      obs.unobserve(container);
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, [staggerMs]);
  return ref;
}

/* Clip-path heading reveal */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(16px)";
    el.style.transition = "opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)";
    const obs = makeObs(() => {
      if (fired.current) return; fired.current = true;
      el.style.opacity = "1"; el.style.transform = "translateY(0)";
      obs.unobserve(el);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* Fade up */
function useFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.opacity = "0"; el.style.transform = "translateY(20px)";
    el.style.transition = `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`;
    const obs = makeObs(() => {
      if (fired.current) return; fired.current = true;
      el.style.opacity = "1"; el.style.transform = "translateY(0)";
      obs.unobserve(el);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return ref;
}

/* Counter animation */
function useCounter(target: number, duration = 1400) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const step = (now: number) => {
          const p = Math.min((now-start)/duration, 1);
          const ease = 1 - Math.pow(1-p, 3);
          setCount(Math.floor(ease*target));
          if (p < 1) requestAnimationFrame(step);
          else setCount(target);
        };
        requestAnimationFrame(step);
        obs.unobserve(el);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return { ref, count };
}

/* Typewriter */
function useTypewriter(words: string[], speed = 85) {
  const [display, setDisplay] = useState("");
  const [wi, setWi] = useState(0); const [ci, setCi] = useState(0); const [del, setDel] = useState(false);
  useEffect(() => {
    const word = words[wi]; let t: ReturnType<typeof setTimeout>;
    if (!del && ci <= word.length)     t = setTimeout(() => { setDisplay(word.slice(0,ci)); setCi(c=>c+1); }, speed);
    else if (!del && ci > word.length) t = setTimeout(() => setDel(true), 2200);
    else if (del && ci > 0)            t = setTimeout(() => { setDisplay(word.slice(0,ci-1)); setCi(c=>c-1); }, speed/2);
    else { setDel(false); setWi(i=>(i+1)%words.length); }
    return () => clearTimeout(t);
  }, [ci, del, wi, words, speed]);
  return display;
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTS
═══════════════════════════════════════════════════════════════ */

function Badge({ status }: { status: string }) {
  const map: Record<string,[string,string]> = {
    ACTIVE:    ["rgba(57,255,20,0.1)",   "#39ff14"],
    LIVE:      ["rgba(167,139,250,0.1)", "#a78bfa"],
    COMPLETED: ["rgba(120,120,120,0.12)","#777"],
    AWARD:     ["rgba(251,191,36,0.1)",  "#fbbf24"],
  };
  const [bg, fg] = map[status] ?? map.COMPLETED;
  return (
    <span style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.2em",
      padding:"3px 10px", borderRadius:2, background:bg, color:fg, border:`1px solid ${fg}35` }}>
      {status}
    </span>
  );
}

/* Shimmer button */
function ShimmerButton({ onClick, children }: { onClick:()=>void; children:React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily:"var(--font-mono)", fontSize:11, letterSpacing:"0.22em",
        padding:"14px 36px", background: hovered ? "#39ff14" : "transparent",
        border:"1px solid #39ff14", color: hovered ? "#000" : "#39ff14",
        cursor:"pointer", textTransform:"uppercase",
        position:"relative", overflow:"hidden",
        transition:"background 0.3s, color 0.3s",
      }}>
      {/* shimmer sweep */}
      <span style={{
        position:"absolute", inset:0, pointerEvents:"none",
        background:"linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.25) 50%, transparent 65%)",
        transform: hovered ? "translateX(200%)" : "translateX(-200%)",
        transition: hovered ? "transform 0.55s ease" : "none",
      }} />
      {children}
    </button>
  );
}

/* Stat card with live counter */
function StatCard({ label, value, suffix, prefix }: { label:string; value:number; suffix:string; prefix:string }) {
  const { ref, count } = useCounter(value);
  return (
    <div style={{ padding:"28px 24px", background:"#0a0a0a", border:"1px solid rgba(255,255,255,0.06)",
      borderBottom:"2px solid rgba(57,255,20,0.2)", textAlign:"center",
      transition:"border-color 0.25s, background 0.25s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderBottomColor = "#39ff14"; (e.currentTarget as HTMLDivElement).style.background = "#0f0f0f"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderBottomColor = "rgba(57,255,20,0.2)"; (e.currentTarget as HTMLDivElement).style.background = "#0a0a0a"; }}
    >
      <div style={{ fontFamily:"var(--font-space)", fontWeight:700,
        fontSize:"clamp(28px,3.5vw,44px)", color:"#fff", lineHeight:1, marginBottom:8,
        textShadow:"0 0 30px rgba(57,255,20,0.2)" }}>
        <span ref={ref}>{prefix}{count}</span><span style={{ color:"#39ff14", fontSize:"0.6em" }}>{suffix}</span>
      </div>
      <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.22em",
        color:"rgba(255,255,255,0.35)", textTransform:"uppercase" }}>{label}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INTERACTIVE CLI TERMINAL
═══════════════════════════════════════════════════════════════ */
const TERMINAL_PROJECTS = [
  { name: "CrashLens",              status: "ACTIVE",    tech: "IoT + AI + Real-Time" },
  { name: "MysteryPersona Deck",    status: "LIVE",      tech: "E-Commerce + Branding" },
  { name: "Fake News Detector",     status: "COMPLETED", tech: "NLP + DistilBERT" },
  { name: "Student Mgmt System",    status: "AWARD 🥇",  tech: "Java + Spring Boot" },
  { name: "Automata Visualizer",    status: "BUILT",     tech: "JS + Algorithm Design" },
  { name: "Library Mgmt System",    status: "AWARD 🥈",  tech: "Java + SQL" },
];

const TERMINAL_COMMANDS: Record<string, () => string[]> = {
  help: () => [
    "  Available commands:",
    "  ─────────────────────────────────────────",
    "  help              List all commands",
    "  about             About Elia",
    "  projects          Featured projects",
    "  skills            Tech stack",
    "  contact           Contact links",
    "  certs             Certifications",
    "  whoami            Current user",
    "  pwd               Current directory",
    "  ls                List files",
    "  cat about.txt     Read about file",
    "  resume            Resume summary",
    "  clear             Clear terminal",
    "  sudo hire elia    Try it ;)",
    "  echo [text]       Echo back",
  ],
  about: () => [
    "  Name:       Elia Alghazal",
    "  Location:   Lebanon → the world",
    "  Role:       Engineer / Poet / Builder",
    "  School:     AUST Computer Science (2026)",
    "  Standing:   Honor's List",
    "  Motto:      The impossible, made.",
  ],
  projects: () => [
    "  ┌────────────────────────────────────────────────────┐",
    "  │ PROJECT                 STATUS      TECH           │",
    "  ├────────────────────────────────────────────────────┤",
    ...TERMINAL_PROJECTS.map(p =>
      `  │ ${p.name.padEnd(24)} ${p.status.padEnd(11)} ${p.tech.slice(0,14).padEnd(14)} │`
    ),
    "  └────────────────────────────────────────────────────┘",
  ],
  skills: () => [
    "  Languages:    Python, TypeScript, Java, Kotlin, C++, Swift",
    "  AI / ML:      PyTorch, DistilBERT, scikit-learn, NumPy",
    "  Backend:      Spring Boot, Node.js, REST API, Microservices",
    "  Frontend:     React, Next.js, GSAP, Canvas API",
    "  Mobile:       Flutter, Kotlin Android, Swift iOS",
    "  IoT:          Raspberry Pi, 4G Module, IMU / GPS, Edge AI",
    "  DevOps:       Git, Docker, GitLab, Linux",
    "  Databases:    SQL, MongoDB, PostgreSQL",
  ],
  contact: () => [
    "  Email:    eliaghazal777@gmail.com",
    "  LinkedIn: linkedin.com/in/eliaghazal",
    "  GitHub:   github.com/eliaghazal",
  ],
  certs: () => [
    "  TOEFL iBT                   ETS                  99/120  (Sep 2025)",
    "  CCNA: Switching & Routing   Cisco                        (Jan 2025)",
    "  Introduction to Networks    Cisco                        (Dec 2024)",
    "  IT Essentials               Cisco                        (Feb 2024)",
    "  IT Specialist — Python      Certiport / Pearson VUE      (Jan 2024)",
    "  ECPE — C2 Proficiency       University of Michigan        (Dec 2023)",
    "  DELF B2                     République française          (Oct 2022)",
  ],
  resume: () => [
    "  Elia Alghazal — Computer Science @ AUST (2026)",
    "  ─────────────────────────────────────────────",
    "  ✦  9+ projects built and deployed",
    "  ✦  7 certifications earned",
    "  ✦  1st Place — AUST Coding Expo (Student Mgmt System)",
    "  ✦  Published author: Whispers of the Eclipse",
    "  ✦  Founder: TwoFoundersLab (Crypto, DFA Minimizer, ...)",
    "  ✦  Fluent: Arabic, English (C2), French (B2), Italian",
    "",
    "  [Download PDF] → linkedin.com/in/eliaghazal",
  ],
  whoami: () => ["  elia_alghazal"],
  pwd:    () => ["  /home/elia/portfolio"],
  ls:     () => ["  projects/  skills/  about.txt  contact.md  resume.pdf  lab/"],
  "cat about.txt": () => TERMINAL_COMMANDS.about(),
  "sudo hire elia": () => [
    "  [sudo] password for universe: ********",
    "  Checking qualifications...",
    "  ✓ Builds IoT ecosystems at 3am",
    "  ✓ Writes poetry AND Python",
    "  ✓ Won coding expo, got TOEFL 99, ships code, publishes books",
    "  ✓ Obsessively solves the impossible",
    "  Access granted. Sending offer letter... 📨",
  ],
};

function TerminalSection() {
  const gn = "#39ff14";
  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  const [history, setHistory]     = useState<Array<{ cmd: string; output: string[] }>>([
    { cmd: "", output: ["  Welcome to Elia's portfolio terminal.", "  Type 'help' to see available commands.", ""] },
  ]);
  const [input, setInput]         = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx]     = useState(-1);
  const inputRef                  = useRef<HTMLInputElement>(null);
  const outputRef                 = useRef<HTMLDivElement>(null);
  const mountedRef                = useRef(false);

  useEffect(() => {
    // Skip the very first render so the page doesn't jump to the terminal on load.
    // On subsequent renders (a command was entered), scroll only within the output container.
    if (!mountedRef.current) { mountedRef.current = true; return; }
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  const run = useCallback((raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    setCmdHistory(prev => [raw, ...prev]);
    setHistIdx(-1);

    if (cmd === "clear") { setHistory([]); return; }

    const match = Object.keys(TERMINAL_COMMANDS).find(k => cmd === k || cmd.startsWith("echo "));
    let output: string[];

    if (cmd.startsWith("echo ")) {
      output = [`  ${raw.slice(5)}`];
    } else if (match) {
      output = TERMINAL_COMMANDS[match]();
    } else {
      output = [`  bash: ${cmd}: command not found. Type 'help' for available commands.`];
    }

    setHistory(prev => [...prev, { cmd: raw, output }]);
  }, []);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { run(input); setInput(""); return; }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(next); setInput(cmdHistory[next] ?? "");
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = histIdx - 1;
      if (next < 0) { setHistIdx(-1); setInput(""); }
      else { setHistIdx(next); setInput(cmdHistory[next] ?? ""); }
    }
  };

  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.opacity = "0"; el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.65s ease, transform 0.65s ease";
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !fired.current) {
        fired.current = true; el.style.opacity = "1"; el.style.transform = "translateY(0)";
        obs.unobserve(el);
      }
    }, { threshold: 0, rootMargin: "0px 0px -40px 0px" });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  return (
    <section style={{ padding: "72px clamp(24px,8vw,120px)", background: "#050505", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div ref={ref}>
          <div style={{ ...mono, fontSize: 10, letterSpacing: "0.35em", color: "rgba(57,255,20,0.65)", marginBottom: 14, textTransform: "uppercase" }}>{"// Terminal"}</div>
          <h2 style={{ fontWeight: 700, fontSize: "clamp(28px,4vw,52px)", letterSpacing: "-0.02em", marginBottom: 12 }}>Try the CLI</h2>
          <p style={{ color: "rgba(255,255,255,0.3)", ...mono, fontSize: 13, letterSpacing: "0.06em", marginBottom: 48 }}>
            Type commands to explore. Try: <span style={{ color: gn }}>help</span>, <span style={{ color: gn }}>projects</span>, <span style={{ color: gn }}>skills</span>, <span style={{ color: gn }}>sudo hire elia</span>
          </p>

          {/* Terminal window */}
          <div style={{ border: "1px solid rgba(57,255,20,0.18)", boxShadow: "0 0 60px rgba(57,255,20,0.06)", background: "#000" }}
            onClick={() => inputRef.current?.focus()}>
            {/* Title bar */}
            <div style={{ padding: "10px 18px", borderBottom: "1px solid rgba(57,255,20,0.1)", display: "flex", alignItems: "center", gap: 8, background: "#0a0a0a" }}>
              {["#ff5f57", "#ffbd2e", "#28c840"].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c, opacity: 0.8 }} />)}
              <span style={{ ...mono, fontSize: 11, color: "rgba(57,255,20,0.5)", marginLeft: 10, letterSpacing: "0.12em" }}>elia@portfolio:~$</span>
            </div>

            {/* Output area */}
            <div ref={outputRef} style={{ padding: "20px 24px", minHeight: 260, maxHeight: 360, overflowY: "auto", cursor: "text" }}>
              {history.map((entry, i) => (
                <div key={i}>
                  {entry.cmd && (
                    <div style={{ ...mono, fontSize: 13, color: gn, marginBottom: 4 }}>
                      <span style={{ color: "rgba(57,255,20,0.5)", marginRight: 8 }}>elia@portfolio:~$</span>{entry.cmd}
                    </div>
                  )}
                  {entry.output.map((line, j) => (
                    <div key={j} style={{ ...mono, fontSize: 13, color: "rgba(240,240,240,0.75)", lineHeight: 1.65, whiteSpace: "pre" }}>{line}</div>
                  ))}
                </div>
              ))}
              {/* Input line */}
              <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
                <span style={{ ...mono, fontSize: 13, color: "rgba(57,255,20,0.5)", marginRight: 8 }}>elia@portfolio:~$</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", ...mono, fontSize: 13, color: gn, caretColor: gn }}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <span style={{ animation: "blink 1s step-end infinite", color: gn, ...mono, fontSize: 13, marginLeft: -2 }}>█</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BUILD IN PUBLIC DASHBOARD
═══════════════════════════════════════════════════════════════ */
interface GitHubStats {
  publicRepos: number;
  totalLinesApprox: number;
  memberSince: number | null;
  topLanguages: string[];
}

function BuildInPublic() {
  const gn = "#39ff14";
  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  const [stats, setStats]         = useState<GitHubStats | null>(null);
  const [working, setWorking]     = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/github-stats").then(r => r.ok ? r.json() : null).catch(() => null),
      fetch("/api/admin/settings?key=currently_working_on").then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([gh, cfg]) => {
      if (gh && !gh.error) setStats(gh);
      if (cfg?.value) setWorking(cfg.value);
      setLoading(false);
    });
  }, []);

  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.opacity = "0"; el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.65s ease 100ms, transform 0.65s ease 100ms";
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !fired.current) {
        fired.current = true; el.style.opacity = "1"; el.style.transform = "translateY(0)";
        obs.unobserve(el);
      }
    }, { threshold: 0, rootMargin: "0px 0px -40px 0px" });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  return (
    <section style={{ padding: "72px clamp(24px,8vw,120px)", background: "#000", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div ref={ref}>
          <div style={{ ...mono, fontSize: 10, letterSpacing: "0.35em", color: "rgba(57,255,20,0.65)", marginBottom: 14, textTransform: "uppercase" }}>{"// Build in Public"}</div>
          <h2 style={{ fontWeight: 700, fontSize: "clamp(28px,4vw,52px)", letterSpacing: "-0.02em", marginBottom: 48 }}>Live Dashboard</h2>

          {/* Currently working on */}
          {working && (
            <div style={{ marginBottom: 32, padding: "16px 22px", background: "rgba(57,255,20,0.04)", border: "1px solid rgba(57,255,20,0.15)", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: gn, flexShrink: 0, boxShadow: `0 0 8px ${gn}` }} />
              <span style={{ ...mono, fontSize: 13, color: gn, letterSpacing: "0.04em" }}>currently_building: {working}</span>
            </div>
          )}

          {loading ? (
            <div style={{ ...mono, fontSize: 12, color: "rgba(57,255,20,0.4)", letterSpacing: "0.14em" }}>
              {"Fetching GitHub data"}
              <span style={{ animation: "blink 1s step-end infinite" }}>▌</span>
            </div>
          ) : stats ? (
            <div className="dash-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
              {/* Stats cards */}
              {[
                { label: "Public Repos",          value: String(stats.publicRepos), accent: gn },
                { label: "Approx. Lines of Code", value: stats.totalLinesApprox >= 1000 ? `~${Math.round(stats.totalLinesApprox / 1000)}k` : `~${stats.totalLinesApprox}`, accent: "#f59e0b" },
                { label: "Member Since",          value: stats.memberSince ? String(stats.memberSince) : "—", accent: "#60a5fa" },
              ].map(s => (
                <div key={s.label} style={{ padding: "clamp(18px,2.5vw,28px) clamp(16px,2vw,24px)", background: "#080808", border: "1px solid rgba(255,255,255,0.05)", borderBottom: `2px solid ${s.accent}30`, transition: "border-color 0.25s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderBottomColor = s.accent}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderBottomColor = `${s.accent}30`}>
                  <div style={{ fontWeight: 700, fontSize: "clamp(28px,3vw,44px)", color: "#fff", lineHeight: 1, marginBottom: 8 }}>{s.value}</div>
                  <div style={{ ...mono, fontSize: 9, letterSpacing: "0.22em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>{s.label}</div>
                </div>
              ))}

              {/* Top languages — full width */}
              {stats.topLanguages.length > 0 && (
                <div style={{ padding: "clamp(18px,2.5vw,28px) clamp(16px,2vw,24px)", background: "#080808", border: "1px solid rgba(255,255,255,0.05)", gridColumn: "1 / -1" }}>
                  <div style={{ ...mono, fontSize: 9, letterSpacing: "0.22em", color: "rgba(255,255,255,0.3)", marginBottom: 14, textTransform: "uppercase" }}>Top Languages</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {stats.topLanguages.map((lang, i) => (
                      <span key={lang} style={{ ...mono, fontSize: 11, padding: "4px 12px", background: `rgba(57,255,20,${0.12 - i * 0.015})`, color: gn, border: "1px solid rgba(57,255,20,0.2)" }}>{lang}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ ...mono, fontSize: 12, color: "rgba(255,255,255,0.3)", padding: "24px", border: "1px dashed rgba(255,255,255,0.08)" }}>
              GitHub stats unavailable — check back later.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default function EngineerPage() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const codeRainRef = useRef<ReturnType<typeof initCodeRain>>(null);
  const role        = useTypewriter(ROLES);
  const [scrolled, setScrolled] = useState(false);

  /* Content state — initialised with hardcoded defaults, overridden by DB if set */
  const [featured, setFeatured]     = useState<FeaturedProject[]>(DEFAULT_FEATURED);
  const [otherProjs, setOtherProjs] = useState<OtherProject[]>(DEFAULT_OTHER_PROJECTS);
  const [skills, setSkills]         = useState<Skill[]>(DEFAULT_SKILLS);
  const [certs, setCerts]           = useState<Cert[]>(DEFAULT_CERTS);
  const [awards, setAwards]         = useState<Award[]>(DEFAULT_AWARDS);
  const [stats, setStats]           = useState<Stat[]>(DEFAULT_STATS);

  /* Load content from DB (falls back to defaults above if DB is empty) */
  useEffect(() => {
    const keys = ["featured_projects","other_projects","skills","certs","awards","stats"];
    Promise.all(keys.map(k =>
      fetch(`/api/admin/settings?key=${k}`).then(r => r.ok ? r.json() : null).catch(() => null)
    )).then(([fp, op, sk, ce, aw, st]) => {
      if (fp?.value) try { setFeatured(JSON.parse(fp.value)); } catch { /* keep defaults */ }
      if (op?.value) try { setOtherProjs(JSON.parse(op.value)); } catch { /* keep defaults */ }
      if (sk?.value) try { setSkills(JSON.parse(sk.value)); } catch { /* keep defaults */ }
      if (ce?.value) try { setCerts(JSON.parse(ce.value)); } catch { /* keep defaults */ }
      if (aw?.value) try { setAwards(JSON.parse(aw.value)); } catch { /* keep defaults */ }
      if (st?.value) try { setStats(JSON.parse(st.value)); } catch { /* keep defaults */ }
    });
  }, []);

  useEffect(() => {
    if (canvasRef.current && !codeRainRef.current) codeRainRef.current = initCodeRain(canvasRef.current);
    return () => { codeRainRef.current?.destroy(); };
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scroll = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior:"smooth" });

  /* Staggered section refs */
  const statsGrid  = useStagger(80);
  const projList   = useStagger(60);
  const cardsGrid  = useStagger(55);
  const skillsGrid = useStagger(40);
  const certsList  = useStagger(50);
  const awardsList = useStagger(70);

  /* Heading reveal refs */
  const h2About   = useReveal();
  const h2Work    = useReveal();
  const h2Skills  = useReveal();
  const h2Creds   = useReveal();
  const h2Contact = useReveal();

  /* Fade refs */
  const eyebrowAbout   = useFadeIn(0);
  const eyebrowWork    = useFadeIn(0);
  const eyebrowSkills  = useFadeIn(0);
  const eyebrowCreds   = useFadeIn(0);
  const eyebrowContact = useFadeIn(0);
  const manifestoRef   = useFadeIn(100);
  const contactBody    = useFadeIn(120);

  const mono: React.CSSProperties = { fontFamily:"var(--font-mono)" };
  const sec: React.CSSProperties  = { padding:"72px clamp(24px,8vw,120px)" };

  const mkTag = (accent = "#39ff14"): React.CSSProperties => ({
    ...mono, fontSize:10, letterSpacing:"0.12em", padding:"4px 10px", borderRadius:2,
    background:`${accent}10`, color:accent, border:`1px solid ${accent}28`, transition:"background 0.2s",
  });

  const eyebrow = (label: string, ref: React.RefObject<HTMLDivElement | null>) => (
    <div ref={ref} style={{ ...mono, fontSize:10, letterSpacing:"0.35em", color:"rgba(57,255,20,0.65)",
      marginBottom:14, textTransform:"uppercase" }}>// {label}</div>
  );

  return (
    <div style={{ background:"#000", color:"#fff", minHeight:"100vh",
      fontFamily:"var(--font-space)", overflowX:"hidden" }}>

      {/* ── Keyframe styles injected inline ── */}
      <style>{`
        @keyframes breathe { 0%,100%{text-shadow:0 0 40px rgba(57,255,20,0.3),0 0 120px rgba(57,255,20,0.1)} 50%{text-shadow:0 0 60px rgba(57,255,20,0.55),0 0 160px rgba(57,255,20,0.2)} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes scan    { 0%{background-position:-200% 0} 100%{background-position:300% 0} }
        @keyframes orbGlow { 0%,100%{opacity:0.6; transform:translate(-50%,-50%) scale(1)} 50%{opacity:1; transform:translate(-50%,-50%) scale(1.08)} }
        .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease !important; }
        .hover-lift:hover { transform: translateY(-3px) !important; }
        @media (max-width: 640px) { .dash-grid { grid-template-columns: 1fr !important; } }
        @media (min-width: 641px) and (max-width: 900px) { .dash-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        padding:"0 clamp(24px,6vw,80px)", height:56,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        background: scrolled ? "rgba(0,0,0,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(57,255,20,0.06)" : "none",
        transition:"background 0.4s, border-color 0.4s",
      }}>
        <Link href="/" style={{ ...mono, fontSize:11, letterSpacing:"0.2em",
          color:"rgba(255,255,255,0.38)", textDecoration:"none", transition:"color 0.2s" }}
          onMouseEnter={e=>(e.currentTarget.style.color="#39ff14")}
          onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.38)")}
        >← HOME</Link>
        <div style={{ display:"flex", gap:"clamp(16px,3vw,36px)", alignItems:"center" }}>
          {["work","about","skills","certs","contact"].map(id => (
            <button key={id} onClick={()=>scroll(id)} style={{
              background:"none", border:"none", cursor:"pointer",
              ...mono, fontSize:10, letterSpacing:"0.2em",
              color:"rgba(255,255,255,0.32)", textTransform:"uppercase", padding:"4px 0",
              transition:"color 0.2s", position:"relative",
            }}
              onMouseEnter={e=>{e.currentTarget.style.color="#39ff14";}}
              onMouseLeave={e=>{e.currentTarget.style.color="rgba(255,255,255,0.32)";}}
            >{id}</button>
          ))}
          <Link href="/engineer/lab" style={{ ...mono, fontSize:10, letterSpacing:"0.2em", color:"rgba(57,255,20,0.55)", textDecoration:"none", padding:"4px 0", transition:"color 0.2s", textTransform:"uppercase" }}
            onMouseEnter={e=>(e.currentTarget.style.color="#39ff14")}
            onMouseLeave={e=>(e.currentTarget.style.color="rgba(57,255,20,0.55)")}
          >LAB ↗</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position:"relative", height:"100vh", overflow:"hidden",
        display:"flex", alignItems:"center", justifyContent:"center" }}>
        <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }} />

        {/* Ambient glow orbs */}
        <div style={{ position:"absolute", top:"30%", left:"20%", width:400, height:400, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(57,255,20,0.06) 0%, transparent 70%)",
          animation:"orbGlow 6s ease-in-out infinite", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"25%", right:"15%", width:300, height:300, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(57,255,20,0.04) 0%, transparent 70%)",
          animation:"orbGlow 8s ease-in-out infinite 2s", pointerEvents:"none" }} />

        <div style={{ position:"absolute", inset:0, pointerEvents:"none",
          background:"radial-gradient(ellipse 70% 75% at 50% 50%, rgba(0,0,0,0.78) 0%, transparent 100%)" }} />
        <div style={{ position:"absolute", inset:0, pointerEvents:"none",
          backgroundImage:"repeating-linear-gradient(to bottom, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)" }} />

        <div style={{ position:"relative", zIndex:2, textAlign:"center",
          padding:"0 clamp(20px,6vw,80px)", maxWidth:960, margin:"0 auto" }}>
          <div style={{ ...mono, fontSize:"clamp(9px,1vw,11px)", letterSpacing:"0.4em",
            color:"rgba(57,255,20,0.5)", marginBottom:"clamp(16px,2.5vw,24px)", textTransform:"uppercase" }}>
            Portfolio · Engineer
          </div>

          {/* Name */}
          <h1 style={{ fontFamily:"var(--font-space)", fontWeight:700,
            fontSize:"clamp(52px,10.5vw,140px)", letterSpacing:"0.04em", lineHeight:0.9,
            color:"#fff", marginBottom:"clamp(20px,3vw,32px)" }}>
            ELIA<br />
            <span style={{ color:"#39ff14", animation:"breathe 4s ease-in-out infinite" }}>ALGHAZAL</span>
          </h1>

          {/* Typewriter */}
          <div style={{ ...mono, fontSize:"clamp(13px,1.8vw,20px)", letterSpacing:"0.08em",
            color:"rgba(255,255,255,0.6)", marginBottom:"clamp(20px,3vw,32px)", minHeight:"1.6em" }}>
            <span>{role}</span>
            <span style={{ animation:"blink 1s step-end infinite", color:"#39ff14" }}>|</span>
          </div>

          {/* One-liner */}
          <p style={{ fontWeight:300, fontSize:"clamp(13px,1.4vw,17px)", letterSpacing:"0.04em",
            color:"rgba(255,255,255,0.38)", maxWidth:460, margin:"0 auto clamp(36px,5vw,56px)",
            lineHeight:1.7 }}>
            From problem to solution. From idea to reality.<br />
            <span style={{ color:"rgba(57,255,20,0.7)", fontStyle:"italic" }}>The impossible, made.</span>
          </p>

          {/* CTAs */}
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <ShimmerButton onClick={()=>scroll("work")}>[ VIEW MY WORK ]</ShimmerButton>
            <a href="/api/cv" target="_blank" rel="noopener noreferrer" style={{
              ...mono, fontSize:11, letterSpacing:"0.22em", padding:"14px 32px",
              background:"transparent", border:"1px solid rgba(57,255,20,0.4)",
              color:"#39ff14", textDecoration:"none", textTransform:"uppercase",
              display:"inline-block", transition:"border-color 0.25s, background 0.25s, color 0.25s",
            }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(57,255,20,0.12)"; e.currentTarget.style.borderColor="#39ff14";}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="rgba(57,255,20,0.4)";}}
            >DOWNLOAD CV ↓</a>
            <a href="mailto:eliaghazal777@gmail.com" style={{
              ...mono, fontSize:11, letterSpacing:"0.22em", padding:"14px 32px",
              background:"transparent", border:"1px solid rgba(255,255,255,0.14)",
              color:"rgba(255,255,255,0.4)", textDecoration:"none", textTransform:"uppercase",
              display:"inline-block", transition:"border-color 0.25s, color 0.25s",
            }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.45)"; e.currentTarget.style.color="#fff";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.14)"; e.currentTarget.style.color="rgba(255,255,255,0.4)";}}
            >GET IN TOUCH</a>
          </div>
        </div>

        <div style={{ position:"absolute", bottom:28, left:"50%", transform:"translateX(-50%)",
          ...mono, fontSize:9, letterSpacing:"0.3em", color:"rgba(255,255,255,0.18)",
          textTransform:"uppercase" }}>SCROLL ↓</div>
      </section>

      {/* ── STATS BAR ── */}
      <div ref={statsGrid} style={{ display:"grid",
        gridTemplateColumns:"repeat(4, 1fr)", gap:1,
        background:"#111", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── BUILD IN PUBLIC ── */}
      <BuildInPublic />

      {/* ── ABOUT ── */}
      <section id="about" style={{ ...sec, background:"#050505",
        borderTop:"1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto",
          display:"grid", gridTemplateColumns:"1fr 1fr",
          gap:"clamp(40px,6vw,80px)", alignItems:"start" }}>
          <div>
            {eyebrow("About", eyebrowAbout)}
            <div ref={h2About}>
              <h2 style={{ fontWeight:700, fontSize:"clamp(26px,3.5vw,44px)",
                lineHeight:1.18, marginBottom:32, letterSpacing:"-0.02em" }}>
                I don't wait for the<br />
                <span style={{ color:"#39ff14" }}>right moment.</span><br />
                I build it.
              </h2>
            </div>
            <div ref={manifestoRef}>
              <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"clamp(13px,1.2vw,15px)", lineHeight:1.85, marginBottom:16 }}>
                From a bedroom in Lebanon to published poet, award-winning developer, and IoT architect — I've learned that pressure doesn't break you, it compiles you.
              </p>
              <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"clamp(13px,1.2vw,15px)", lineHeight:1.85, marginBottom:16 }}>
                I'm studying Computer Science at AUST (graduating June 2026), building CrashLens and MysteryPersona while carrying a full course load — and writing poetry that ends up on Amazon.
              </p>
              <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"clamp(13px,1.2vw,15px)", lineHeight:1.85 }}>
                That's not luck. That's <span style={{ color:"#39ff14" }}>obsession.</span>
              </p>
            </div>
          </div>

          <div ref={statsGrid.current ? undefined : undefined}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:1 }}>
              {[
                ["Degree",        "B.S. Computer Science"],
                ["University",    "AUST, Lebanon"],
                ["Graduation",    "June 2026"],
                ["Standing",      "Honor's List"],
                ["TOEFL",         "99 / 120"],
                ["Certifications","7 Earned"],
                ["Projects",      "9+ Built"],
                ["Languages",     "AR · EN · FR · IT"],
              ].map(([label, value], i) => (
                <div key={label} style={{ padding:"18px 16px", background:"#0a0a0a",
                  border:"1px solid rgba(255,255,255,0.05)",
                  opacity:0, transform:"translateY(20px)",
                  animation:`fadeUp 0.5s ease ${i*60+200}ms forwards`,
                  transition:"background 0.2s" }}
                  onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="#111"}
                  onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="#0a0a0a"}
                >
                  <div style={{ ...mono, fontSize:9, letterSpacing:"0.2em",
                    color:"rgba(57,255,20,0.45)", marginBottom:5, textTransform:"uppercase" }}>{label}</div>
                  <div style={{ fontWeight:600, fontSize:"clamp(11px,1.1vw,13px)", color:"#fff", letterSpacing:"0.02em" }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TERMINAL ── */}
      <TerminalSection />

      {/* ── PROJECTS ── */}
      <section id="work" style={{ ...sec, background:"#000" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          {eyebrow("Work", eyebrowWork)}
          <div ref={h2Work}>
            <h2 style={{ fontWeight:700, fontSize:"clamp(28px,4vw,52px)",
              letterSpacing:"-0.02em", marginBottom:12 }}>Featured Projects</h2>
          </div>
          <p style={{ color:"rgba(255,255,255,0.3)", fontSize:13, marginBottom:64,
            ...mono, letterSpacing:"0.06em" }}>Each one starts with a real problem.</p>

          <div ref={projList} style={{ display:"flex", flexDirection:"column", gap:2 }}>
            {featured.map(p => (
              <div key={p.id} className="hover-lift" style={{
                background:"#080808", border:"1px solid rgba(255,255,255,0.05)",
                borderLeft:`3px solid ${p.accent}`,
                padding:"clamp(24px,3.5vw,44px)",
                transition:"box-shadow 0.35s ease, border-color 0.35s ease, transform 0.3s ease",
              }}
                onMouseEnter={e=>{
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.boxShadow = `0 20px 60px ${p.accent}18, 0 4px 20px ${p.accent}10`;
                  el.style.borderLeftWidth = "5px";
                  el.style.borderLeftColor = p.accent;
                }}
                onMouseLeave={e=>{
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.boxShadow = "none";
                  el.style.borderLeftWidth = "3px";
                }}
              >
                <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:24, flexWrap:"wrap" }}>
                  <Badge status={p.status} />
                  <span style={{ ...mono, fontSize:10, letterSpacing:"0.14em", color:"rgba(255,255,255,0.25)" }}>{p.period}</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"minmax(160px,1fr) 2fr",
                  gap:"clamp(20px,4vw,52px)", alignItems:"start" }}>
                  <div>
                    <h3 style={{ fontWeight:700, fontSize:"clamp(20px,2.5vw,32px)",
                      marginBottom:6, color:"#fff", letterSpacing:"-0.01em" }}>{p.title}</h3>
                    <p style={{ ...mono, fontSize:10, color:p.accent, letterSpacing:"0.08em", lineHeight:1.5, opacity:0.85 }}>{p.subtitle}</p>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
                    {(["Problem","Solution","Impact"] as const).map((label, li) => {
                      const text = [p.problem, p.solution, p.impact][li];
                      return (
                        <div key={label}>
                          <div style={{ ...mono, fontSize:9, letterSpacing:"0.25em",
                            color:p.accent, marginBottom:5, textTransform:"uppercase", opacity:0.6 }}>{label}</div>
                          <p style={{ color:"rgba(255,255,255,0.55)", fontSize:"clamp(12px,1.1vw,14px)", lineHeight:1.8 }}>{text}</p>
                        </div>
                      );
                    })}
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, paddingTop:4 }}>
                      {p.tech.map(t => <span key={t} style={mkTag(p.accent)}>{t}</span>)}
                    </div>
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noopener noreferrer"
                        style={{ ...mono, fontSize:10, letterSpacing:"0.18em",
                          color:p.accent, textDecoration:"none", transition:"opacity 0.2s" }}
                        onMouseEnter={e=>(e.currentTarget.style.opacity="0.6")}
                        onMouseLeave={e=>(e.currentTarget.style.opacity="1")}
                      >VISIT LIVE SITE ↗</a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Other projects */}
          <div style={{ marginTop:72 }}>
            <h3 style={{ fontWeight:500, fontSize:"clamp(14px,1.6vw,18px)", letterSpacing:"0.02em",
              marginBottom:24, color:"rgba(255,255,255,0.35)" }}>Other Projects</h3>
            <div ref={cardsGrid} style={{ display:"grid",
              gridTemplateColumns:"repeat(auto-fill, minmax(260px,1fr))", gap:2 }}>
              {otherProjs.map(c => (
                <div key={c.title} className="hover-lift" style={{
                  background:"#080808", border:"1px solid rgba(255,255,255,0.05)",
                  padding:"clamp(18px,2.5vw,26px)",
                  transition:"border-color 0.25s, box-shadow 0.25s, transform 0.3s",
                }}
                  onMouseEnter={e=>{
                    (e.currentTarget as HTMLDivElement).style.borderColor="rgba(57,255,20,0.2)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow="0 12px 40px rgba(57,255,20,0.06)";
                  }}
                  onMouseLeave={e=>{
                    (e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow="none";
                  }}
                >
                  {c.badge && <div style={{ ...mono, fontSize:9, letterSpacing:"0.14em", color:"#fbbf24", marginBottom:8 }}>{c.badge}</div>}
                  <h4 style={{ fontWeight:600, fontSize:"clamp(13px,1.3vw,16px)", marginBottom:10 }}>{c.title}</h4>
                  <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, lineHeight:1.65, marginBottom:14 }}>{c.desc}</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                    {c.tech.map(t => <span key={t} style={mkTag()}>{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SKILLS ── */}
      <section id="skills" style={{ ...sec, background:"#050505",
        borderTop:"1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          {eyebrow("Skills", eyebrowSkills)}
          <div ref={h2Skills}>
            <h2 style={{ fontWeight:700, fontSize:"clamp(28px,4vw,52px)",
              letterSpacing:"-0.02em", marginBottom:52 }}>Stack &amp; Tools</h2>
          </div>

          <div style={{ border:"1px solid rgba(57,255,20,0.1)", background:"#080808",
            boxShadow:"0 0 80px rgba(57,255,20,0.04)" }}>
            {/* Terminal bar */}
            <div style={{ padding:"10px 18px", borderBottom:"1px solid rgba(57,255,20,0.07)",
              display:"flex", alignItems:"center", gap:8, background:"#050505" }}>
              {["#ff5f57","#ffbd2e","#28c840"].map(c => (
                <div key={c} style={{ width:10, height:10, borderRadius:"50%", background:c, opacity:0.75 }} />
              ))}
              <span style={{ ...mono, fontSize:10, color:"rgba(57,255,20,0.35)", marginLeft:8, letterSpacing:"0.14em" }}>
                elia@portfolio:~$ skill --list --all
              </span>
              <span style={{ animation:"blink 1.2s step-end infinite", color:"#39ff14", marginLeft:2, ...mono, fontSize:11 }}>█</span>
            </div>

            <div ref={skillsGrid} style={{ padding:"clamp(20px,3vw,40px)",
              display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(230px,1fr))", gap:32 }}>
              {skills.map(s => (
                <div key={s.cat}>
                  <div style={{ ...mono, fontSize:10, color:"#39ff14", marginBottom:12,
                    letterSpacing:"0.16em" }}>
                    &gt; {s.cat.toLowerCase().replace(/ [/&] /g,"_")}
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {s.items.map((item, i) => (
                      <span key={item} style={{ ...mono, fontSize:10, letterSpacing:"0.08em",
                        padding:"4px 10px", background:"rgba(57,255,20,0.04)",
                        border:"1px solid rgba(57,255,20,0.1)", color:"rgba(255,255,255,0.55)",
                        transition:"background 0.2s, color 0.2s, border-color 0.2s",
                        opacity:0, animation:`fadeUp 0.4s ease ${i*35}ms forwards`,
                        cursor:"default" }}
                        onMouseEnter={e=>{
                          e.currentTarget.style.background="rgba(57,255,20,0.12)";
                          e.currentTarget.style.color="#fff";
                          e.currentTarget.style.borderColor="rgba(57,255,20,0.35)";
                        }}
                        onMouseLeave={e=>{
                          e.currentTarget.style.background="rgba(57,255,20,0.04)";
                          e.currentTarget.style.color="rgba(255,255,255,0.55)";
                          e.currentTarget.style.borderColor="rgba(57,255,20,0.1)";
                        }}
                      >{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── LAB TEASER ── */}
      <section style={{ padding:"clamp(40px,6vw,72px) clamp(24px,8vw,120px)", background:"#000",
        borderTop:"1px solid rgba(57,255,20,0.1)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ border:"1px solid rgba(57,255,20,0.22)", background:"rgba(57,255,20,0.02)",
            padding:"clamp(28px,4vw,52px)",
            display:"grid", gridTemplateColumns:"1fr auto", gap:"clamp(24px,4vw,48px)", alignItems:"center" }}>
            <div>
              <div style={{ ...mono, fontSize:10, letterSpacing:"0.3em", color:"rgba(57,255,20,0.65)",
                marginBottom:14, textTransform:"uppercase" }}>{"// Lab · Experiments"}</div>
              <h2 style={{ fontWeight:700, fontSize:"clamp(22px,3vw,40px)", letterSpacing:"-0.02em",
                marginBottom:16, lineHeight:1.15 }}>
                The <span style={{ color:"#39ff14" }}>Engineering Playground</span>
              </h2>
              <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"clamp(13px,1.1vw,15px)", lineHeight:1.8,
                marginBottom:28, maxWidth:480 }}>
                Interactive experiments and algorithm visualizers — all running live in your browser.
                Currently featuring a <span style={{ color:"rgba(57,255,20,0.75)" }}>Sorting Algorithm Visualizer</span>{" "}
                (Bubble, Quick, Merge). More experiments coming soon.
              </p>
              <Link href="/engineer/lab" style={{ ...mono, fontSize:11, letterSpacing:"0.22em",
                color:"#000", background:"#39ff14", padding:"12px 28px",
                textDecoration:"none", display:"inline-block", textTransform:"uppercase",
                transition:"opacity 0.2s, box-shadow 0.2s", boxShadow:"0 0 0 rgba(57,255,20,0)" }}
                onMouseEnter={e=>{
                  e.currentTarget.style.opacity="0.88";
                  e.currentTarget.style.boxShadow="0 0 24px rgba(57,255,20,0.4)";
                }}
                onMouseLeave={e=>{
                  e.currentTarget.style.opacity="1";
                  e.currentTarget.style.boxShadow="0 0 0 rgba(57,255,20,0)";
                }}
              >EXPLORE THE LAB ↗</Link>
            </div>
            {/* Mini bar-chart preview */}
            <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:80, width:140,
              padding:"0 4px", flexShrink:0, opacity:0.7 }}>
              {[45,82,23,67,38,91,55,74,30,60,85,20,50,70,40].map((h, i) => (
                <div key={i} style={{ flex:1, height:`${h}%`,
                  background:`rgba(57,255,20,${0.25 + (h/100)*0.5})` }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CERTS & AWARDS ── */}
      <section id="certs" style={{ ...sec, background:"#000" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          {eyebrow("Credentials", eyebrowCreds)}
          <div ref={h2Creds}>
            <h2 style={{ fontWeight:700, fontSize:"clamp(28px,4vw,52px)",
              letterSpacing:"-0.02em", marginBottom:60 }}>Certifications &amp; Awards</h2>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"3fr 2fr",
            gap:"clamp(32px,5vw,64px)", alignItems:"start" }}>
            {/* Certs */}
            <div>
              <div style={{ ...mono, fontSize:9, letterSpacing:"0.25em",
                color:"rgba(255,255,255,0.25)", marginBottom:20, textTransform:"uppercase" }}>Certifications</div>
              <div ref={certsList} style={{ display:"flex", flexDirection:"column", gap:1 }}>
                {certs.map(c => (
                  <div key={c.name} className="hover-lift" style={{
                    padding:"16px 20px", background:"#080808",
                    border:"1px solid rgba(255,255,255,0.05)",
                    borderLeft:`2px solid ${c.accent}`,
                    display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12,
                    transition:"background 0.2s, box-shadow 0.25s, transform 0.3s",
                  }}
                    onMouseEnter={e=>{
                      (e.currentTarget as HTMLDivElement).style.background="#0d0d0d";
                      (e.currentTarget as HTMLDivElement).style.boxShadow=`4px 0 20px ${c.accent}18`;
                    }}
                    onMouseLeave={e=>{
                      (e.currentTarget as HTMLDivElement).style.background="#080808";
                      (e.currentTarget as HTMLDivElement).style.boxShadow="none";
                    }}
                  >
                    <div>
                      <div style={{ fontWeight:600, fontSize:13, marginBottom:3 }}>
                        {c.link
                          ? <a href={c.link} target="_blank" rel="noopener noreferrer"
                              style={{ color:"#fff", textDecoration:"none", transition:"color 0.2s" }}
                              onMouseEnter={e=>(e.currentTarget.style.color=c.accent)}
                              onMouseLeave={e=>(e.currentTarget.style.color="#fff")}
                            >{c.name} ↗</a>
                          : c.name}
                      </div>
                      <div style={{ ...mono, fontSize:10, color:"rgba(255,255,255,0.32)", letterSpacing:"0.08em" }}>
                        {c.issuer} · {c.detail}
                      </div>
                    </div>
                    <div style={{ ...mono, fontSize:10, color:c.accent,
                      letterSpacing:"0.1em", whiteSpace:"nowrap", opacity:0.6 }}>{c.date}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Awards */}
            <div>
              <div style={{ ...mono, fontSize:9, letterSpacing:"0.25em",
                color:"rgba(255,255,255,0.25)", marginBottom:20, textTransform:"uppercase" }}>Awards & Honors</div>
              <div ref={awardsList} style={{ display:"flex", flexDirection:"column", gap:1, marginBottom:44 }}>
                {awards.map(a => (
                  <div key={a.title} className="hover-lift" style={{
                    padding:"22px 18px", background:"#080808",
                    border:"1px solid rgba(255,255,255,0.05)",
                    display:"flex", gap:14, alignItems:"flex-start",
                    transition:"background 0.2s, transform 0.3s",
                  }}
                    onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="#0e0e0e"}
                    onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="#080808"}
                  >
                    <div style={{ fontSize:20, lineHeight:1, marginTop:1 }}>{a.icon}</div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{a.title}</div>
                      <div style={{ ...mono, fontSize:9, color:"rgba(57,255,20,0.5)",
                        letterSpacing:"0.08em", marginBottom:3 }}>{a.body}</div>
                      <div style={{ ...mono, fontSize:9, color:"rgba(255,255,255,0.3)",
                        letterSpacing:"0.06em" }}>{a.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ ...mono, fontSize:9, letterSpacing:"0.25em",
                color:"rgba(255,255,255,0.25)", marginBottom:16, textTransform:"uppercase" }}>Beyond the Code</div>
              {[
                { t:"AI Workshop — High School Students", d:"Designed + delivered a 2-hour prompt engineering workshop. Students built an AI chatbot/web-app concept." },
                { t:"Environmental Seminar Speaker",      d:"Delivered a seminar on climate change risk — communicating complex science for a broad audience." },
                { t:"Whispers of the Eclipse",           d:"Published poetry collection. Written ages 15–19." },
              ].map(e => (
                <div key={e.t} className="hover-lift" style={{ padding:"13px 14px", background:"#080808",
                  border:"1px solid rgba(255,255,255,0.05)", marginBottom:1,
                  transition:"background 0.2s, transform 0.3s" }}
                  onMouseEnter={el=>(el.currentTarget as HTMLDivElement).style.background="#0d0d0d"}
                  onMouseLeave={el=>(el.currentTarget as HTMLDivElement).style.background="#080808"}
                >
                  <div style={{ fontWeight:600, fontSize:12, marginBottom:4 }}>{e.t}</div>
                  <div style={{ color:"rgba(255,255,255,0.35)", fontSize:12, lineHeight:1.65 }}>{e.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ ...sec, background:"#050505",
        borderTop:"1px solid rgba(255,255,255,0.04)", textAlign:"center" }}>
        <div style={{ maxWidth:560, margin:"0 auto" }}>
          {eyebrow("Contact", eyebrowContact)}
          <div ref={h2Contact}>
            <h2 style={{ fontWeight:700, fontSize:"clamp(32px,5vw,68px)",
              letterSpacing:"-0.02em", lineHeight:1.08, marginBottom:16 }}>
              Let's build something<br />
              <span style={{ color:"#39ff14", animation:"breathe 4s ease-in-out infinite" }}>impossible.</span>
            </h2>
          </div>
          <div ref={contactBody}>
            <p style={{ color:"rgba(255,255,255,0.35)", fontSize:14, lineHeight:1.8, marginBottom:52, maxWidth:400, margin:"0 auto 52px" }}>
              Open to collaboration, internships, and anything that sounds too ambitious to work.
            </p>
            <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", marginBottom:64 }}>
              {[
                { label:"EMAIL",    href:"mailto:eliaghazal777@gmail.com",           accent:"#39ff14" },
                { label:"LINKEDIN", href:"https://www.linkedin.com/in/eliaghazal/",  accent:"#a78bfa" },
                { label:"GITHUB",   href:"https://github.com/eliaghazal/",           accent:"#60a5fa" },
              ].map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={{
                  ...mono, fontSize:10, letterSpacing:"0.22em",
                  padding:"13px 28px", background:"transparent",
                  border:`1px solid ${l.accent}35`, color:l.accent,
                  textDecoration:"none", transition:"background 0.25s, border-color 0.25s, box-shadow 0.25s",
                }}
                  onMouseEnter={e=>{
                    e.currentTarget.style.background=`${l.accent}10`;
                    e.currentTarget.style.borderColor=l.accent;
                    e.currentTarget.style.boxShadow=`0 0 20px ${l.accent}25`;
                  }}
                  onMouseLeave={e=>{
                    e.currentTarget.style.background="transparent";
                    e.currentTarget.style.borderColor=`${l.accent}35`;
                    e.currentTarget.style.boxShadow="none";
                  }}
                >{l.label} ↗</a>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop:"1px solid rgba(255,255,255,0.04)", paddingTop:28,
          display:"flex", justifyContent:"space-between", alignItems:"center",
          maxWidth:1100, margin:"0 auto", flexWrap:"wrap", gap:12 }}>
          <span style={{ ...mono, fontSize:10, letterSpacing:"0.15em", color:"rgba(255,255,255,0.15)" }}>
            ELIA ALGHAZAL © 2026
          </span>
          <Link href="/" style={{ ...mono, fontSize:10, letterSpacing:"0.15em",
            color:"rgba(255,255,255,0.15)", textDecoration:"none", transition:"color 0.2s" }}
            onMouseEnter={e=>(e.currentTarget.style.color="#39ff14")}
            onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.15)")}
          >← BACK TO BEGINNING</Link>
        </div>
      </section>

      {/* fadeUp keyframe */}
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

    </div>
  );
}
