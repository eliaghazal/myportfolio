"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─── Palette ─── */
const black   = "#000";
const gn      = "#39ff14";    // neon green
const gnDim   = "rgba(57,255,20,0.55)";
const gnFaint = "rgba(57,255,20,0.14)";
const white   = "#f0f0f0";
const dim     = "rgba(240,240,240,0.45)";
const faint   = "rgba(240,240,240,0.14)";
const border  = "rgba(57,255,20,0.15)";

/* ─── Seed experiments ─── */
interface Experiment {
  id: string;
  title: string;
  description: string;
  category: string;
  tech: string[];
  github?: string;
  status: "LIVE" | "DEMO" | "CONCEPT" | "COMPLETED";
  accent: string;
  demo?: React.ReactNode;
}

/* ─── Hooks ─── */
function useFade(delay = 0) {
  const ref  = useRef<HTMLDivElement>(null);
  const fired = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.opacity = "0"; el.style.transform = "translateY(18px)";
    el.style.transition = `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`;
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

/* ═══════════════════════════════════════════════════════════════
   DEMOS
═══════════════════════════════════════════════════════════════ */

/* ── Caesar Cipher ── */
function CaesarDemo() {
  const [input, setInput]   = useState("Hello World");
  const [shift, setShift]   = useState(3);
  const [mode, setMode]     = useState<"encrypt" | "crack">("encrypt");
  const [crackInput, setCrackInput] = useState("");

  const ENGLISH_FREQ: Record<string, number> = { a:8.2,b:1.5,c:2.8,d:4.3,e:12.7,f:2.2,g:2.0,h:6.1,i:7.0,j:0.2,k:0.8,l:4.0,m:2.4,n:6.7,o:7.5,p:1.9,q:0.1,r:6.0,s:6.3,t:9.1,u:2.8,v:1.0,w:2.4,x:0.2,y:2.0,z:0.1 };

  const caesar = (str: string, n: number): string =>
    str.split("").map(c => {
      if (/[a-zA-Z]/.test(c)) {
        const base = c >= "a" ? 97 : 65;
        return String.fromCharCode(((c.charCodeAt(0) - base + n + 26) % 26) + base);
      }
      return c;
    }).join("");

  const scoreLikelihood = (str: string): number => {
    const lower = str.toLowerCase();
    let score = 0;
    for (const ch of lower) { if (ENGLISH_FREQ[ch]) score += ENGLISH_FREQ[ch]; }
    return score / (str.length || 1);
  };

  const allCracks = Array.from({ length: 26 }, (_, i) => {
    const decrypted = caesar(crackInput || "Type ciphertext above", i);
    return { shift: i, text: decrypted, score: scoreLikelihood(decrypted) };
  }).sort((a, b) => b.score - a.score);

  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  return (
    <div style={{ ...mono, fontSize: 13, color: white }}>
      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 1, marginBottom: 20 }}>
        {(["encrypt", "crack"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            style={{ padding: "6px 18px", background: mode === m ? gn : "transparent", border: `1px solid ${border}`, color: mode === m ? black : gnDim, cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            {m === "encrypt" ? "Encrypt / Decrypt" : "Crack it"}
          </button>
        ))}
      </div>

      {mode === "encrypt" ? (
        <>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: gnDim, letterSpacing: "0.2em", marginBottom: 6 }}>INPUT TEXT</div>
            <input value={input} onChange={e => setInput(e.target.value)}
              style={{ width: "100%", background: "rgba(57,255,20,0.04)", border: `1px solid ${border}`, color: white, padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: gnDim, letterSpacing: "0.2em", marginBottom: 6 }}>SHIFT: {shift}</div>
            <input type="range" min={0} max={25} value={shift} onChange={e => setShift(Number(e.target.value))}
              style={{ width: "100%", accentColor: gn }} />
          </div>
          <div style={{ background: "rgba(57,255,20,0.04)", border: `1px solid ${border}`, padding: "14px 16px", marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: gnDim, letterSpacing: "0.2em", marginBottom: 6 }}>ENCRYPTED</div>
            <div style={{ color: gn, wordBreak: "break-all", lineHeight: 1.6 }}>{caesar(input, shift)}</div>
          </div>
          <div style={{ background: "rgba(57,255,20,0.04)", border: `1px solid ${border}`, padding: "14px 16px" }}>
            <div style={{ fontSize: 10, color: gnDim, letterSpacing: "0.2em", marginBottom: 6 }}>DECRYPTED (shift back)</div>
            <div style={{ color: gnDim, wordBreak: "break-all", lineHeight: 1.6 }}>{caesar(caesar(input, shift), 26 - shift)}</div>
          </div>
        </>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: gnDim, letterSpacing: "0.2em", marginBottom: 6 }}>PASTE CIPHERTEXT</div>
            <input value={crackInput} onChange={e => setCrackInput(e.target.value)}
              placeholder="Paste encrypted text here…"
              style={{ width: "100%", background: "rgba(57,255,20,0.04)", border: `1px solid ${border}`, color: white, padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ fontSize: 10, color: gnDim, letterSpacing: "0.2em", marginBottom: 10 }}>ALL 26 SHIFTS — RANKED BY ENGLISH PROBABILITY</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 300, overflowY: "auto" }}>
            {allCracks.map((c, i) => (
              <div key={c.shift} style={{ display: "grid", gridTemplateColumns: "40px 50px 1fr", gap: 10, alignItems: "start", padding: "6px 10px", background: i === 0 ? "rgba(57,255,20,0.08)" : "transparent", border: i === 0 ? `1px solid ${border}` : "1px solid transparent" }}>
                <span style={{ color: i === 0 ? gn : faint, fontSize: 10 }}>#{i + 1}</span>
                <span style={{ color: gnDim, fontSize: 10 }}>shift {c.shift}</span>
                <span style={{ color: i === 0 ? white : dim, fontSize: 12, wordBreak: "break-all", lineHeight: 1.4 }}>{c.text.slice(0, 80)}{c.text.length > 80 ? "…" : ""}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Sorting Visualizer ── */
function SortingDemo() {
  const SIZE = 30;
  const [arr, setArr]       = useState<number[]>(() => Array.from({ length: SIZE }, () => Math.floor(Math.random() * 95) + 5));
  const [active, setActive] = useState<number[]>([]);
  const [sorted, setSorted] = useState<number[]>([]);
  const [running, setRunning] = useState(false);
  const [algo, setAlgo]     = useState<"bubble" | "quick" | "merge">("bubble");
  const [speed, setSpeed]   = useState(50);
  const stopRef             = useRef(false);

  const delay = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

  const randomize = () => {
    if (running) { stopRef.current = true; return; }
    setArr(Array.from({ length: SIZE }, () => Math.floor(Math.random() * 95) + 5));
    setActive([]); setSorted([]);
  };

  const bubble = async (a: number[]) => {
    const ar = [...a];
    const n = ar.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (stopRef.current) return;
        setActive([j, j + 1]);
        if (ar[j] > ar[j + 1]) { [ar[j], ar[j + 1]] = [ar[j + 1], ar[j]]; setArr([...ar]); }
        await delay(speed);
      }
      setSorted(prev => [...prev, n - 1 - i]);
    }
    setSorted(Array.from({ length: n }, (_, i) => i));
  };

  const quickHelper = async (ar: number[], lo: number, hi: number) => {
    if (lo >= hi || stopRef.current) return;
    const pivot = ar[hi]; let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      if (stopRef.current) return;
      setActive([j, hi]);
      if (ar[j] <= pivot) { i++; [ar[i], ar[j]] = [ar[j], ar[i]]; setArr([...ar]); }
      await delay(speed);
    }
    [ar[i + 1], ar[hi]] = [ar[hi], ar[i + 1]]; setArr([...ar]);
    await quickHelper(ar, lo, i); await quickHelper(ar, i + 2, hi);
  };

  const quick = async (a: number[]) => {
    const ar = [...a];
    await quickHelper(ar, 0, ar.length - 1);
    setSorted(Array.from({ length: ar.length }, (_, i) => i));
  };

  const mergeHelper = async (ar: number[], lo: number, hi: number) => {
    if (lo >= hi || stopRef.current) return;
    const mid = Math.floor((lo + hi) / 2);
    await mergeHelper(ar, lo, mid); await mergeHelper(ar, mid + 1, hi);
    const left = ar.slice(lo, mid + 1); const right = ar.slice(mid + 1, hi + 1);
    let i = 0, j = 0, k = lo;
    while (i < left.length && j < right.length) {
      if (stopRef.current) return;
      setActive([k]); ar[k++] = left[i] <= right[j] ? left[i++] : right[j++];
      setArr([...ar]); await delay(speed);
    }
    while (i < left.length) { ar[k++] = left[i++]; setArr([...ar]); await delay(speed); }
    while (j < right.length) { ar[k++] = right[j++]; setArr([...ar]); await delay(speed); }
  };

  const merge = async (a: number[]) => {
    const ar = [...a]; await mergeHelper(ar, 0, ar.length - 1);
    setSorted(Array.from({ length: ar.length }, (_, i) => i));
  };

  const run = async () => {
    if (running) return;
    stopRef.current = false; setRunning(true); setActive([]); setSorted([]);
    if (algo === "bubble") await bubble(arr);
    else if (algo === "quick") await quick(arr);
    else await merge(arr);
    setActive([]); setRunning(false);
  };

  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  return (
    <div style={{ ...mono }}>
      {/* Controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        {(["bubble", "quick", "merge"] as const).map(a => (
          <button key={a} onClick={() => { if (!running) setAlgo(a); }}
            style={{ padding: "5px 14px", background: algo === a ? gn : "transparent", border: `1px solid ${border}`, color: algo === a ? black : gnDim, cursor: running ? "default" : "pointer", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            {a}
          </button>
        ))}
        <button onClick={run} disabled={running}
          style={{ padding: "5px 18px", background: running ? "rgba(57,255,20,0.2)" : gn, border: "none", color: black, cursor: running ? "default" : "pointer", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginLeft: "auto" }}>
          {running ? "Sorting…" : "Sort"}
        </button>
        <button onClick={randomize} style={{ padding: "5px 14px", background: "transparent", border: `1px solid ${border}`, color: gnDim, cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {running ? "Stop" : "Shuffle"}
        </button>
      </div>
      <div style={{ fontSize: 10, color: gnDim, letterSpacing: "0.15em", marginBottom: 8 }}>SPEED: {Math.round((105 - speed) / 100 * 100)}%<input type="range" min={10} max={100} value={105 - speed} onChange={e => setSpeed(105 - Number(e.target.value))} style={{ marginLeft: 10, verticalAlign: "middle", accentColor: gn, width: 100 }} /></div>

      {/* Bars */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 160, padding: "0 2px", background: "rgba(57,255,20,0.02)", border: `1px solid ${border}` }}>
        {arr.map((v, i) => (
          <div key={i} style={{
            flex: 1, height: `${v}%`,
            background: sorted.includes(i) ? gn : active.includes(i) ? "#fff" : gnFaint,
            transition: "height 0.05s, background 0.1s",
          }} />
        ))}
      </div>
    </div>
  );
}

/* ── DFA Visualizer ── */
function DFADemo() {
  const [states, setStates] = useState([{ id: "q0", x: 80, y: 100, accepting: false }, { id: "q1", x: 240, y: 100, accepting: true }]);
  const [transitions] = useState([{ from: "q0", to: "q1", symbol: "a" }, { from: "q1", to: "q1", symbol: "b" }, { from: "q0", to: "q0", symbol: "b" }]);
  const [testStr, setTestStr]   = useState("aab");
  const [result, setResult]     = useState<null | boolean>(null);
  const [stateCounter, setStateCounter] = useState(2);

  const addState = () => {
    const id = `q${stateCounter}`;
    setStates(prev => [...prev, { id, x: 80 + (stateCounter % 4) * 120, y: 100 + Math.floor(stateCounter / 4) * 80, accepting: false }]);
    setStateCounter(c => c + 1);
  };

  const toggleAccept = (id: string) => {
    setStates(prev => prev.map(s => s.id === id ? { ...s, accepting: !s.accepting } : s));
  };

  const runDFA = () => {
    if (states.length === 0) return;
    let current = states[0].id;
    for (const ch of testStr) {
      const t = transitions.find(t => t.from === current && t.symbol === ch);
      if (!t) { setResult(false); return; }
      current = t.to;
    }
    const finalState = states.find(s => s.id === current);
    setResult(finalState?.accepting ?? false);
  };

  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };
  const purple = "#a78bfa";

  return (
    <div style={{ ...mono, fontSize: 13, color: white }}>
      {/* DFA Canvas */}
      <svg width="100%" height="200" style={{ background: "rgba(167,139,250,0.03)", border: `1px solid rgba(167,139,250,0.15)`, marginBottom: 14, display: "block" }}>
        {/* Transitions */}
        {transitions.map((t, i) => {
          const from = states.find(s => s.id === t.from);
          const to   = states.find(s => s.id === t.to);
          if (!from || !to) return null;
          if (from.id === to.id) {
            return (
              <g key={i}>
                <path d={`M ${from.x} ${from.y - 20} Q ${from.x + 40} ${from.y - 60} ${from.x} ${from.y - 20}`} fill="none" stroke={purple} strokeWidth={1.5} opacity={0.5} markerEnd="url(#arrow)" />
                <text x={from.x + 42} y={from.y - 45} fill={purple} fontSize={11} fontFamily="var(--font-mono)" opacity={0.8}>{t.symbol}</text>
              </g>
            );
          }
          const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
          return (
            <g key={i}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={purple} strokeWidth={1.5} opacity={0.5} markerEnd="url(#arrow)" />
              <text x={mx} y={my - 8} fill={purple} fontSize={11} fontFamily="var(--font-mono)" textAnchor="middle" opacity={0.8}>{t.symbol}</text>
            </g>
          );
        })}
        {/* Arrow marker */}
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill={purple} opacity={0.7} />
          </marker>
        </defs>
        {/* States */}
        {states.map(s => (
          <g key={s.id} onClick={() => toggleAccept(s.id)} style={{ cursor: "pointer" }}>
            {s === states[0] && <polygon points={`${s.x - 42},${s.y - 12} ${s.x - 24},${s.y} ${s.x - 42},${s.y + 12}`} fill={purple} opacity={0.4} />}
            <circle cx={s.x} cy={s.y} r={22} fill="rgba(167,139,250,0.08)" stroke={purple} strokeWidth={s.accepting ? 2.5 : 1.5} opacity={0.85} />
            {s.accepting && <circle cx={s.x} cy={s.y} r={17} fill="none" stroke={purple} strokeWidth={1} opacity={0.5} />}
            <text x={s.x} y={s.y + 5} textAnchor="middle" fill={purple} fontSize={12} fontFamily="var(--font-mono)">{s.id}</text>
          </g>
        ))}
      </svg>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <button onClick={addState} style={{ padding: "5px 12px", background: "transparent", border: "1px solid rgba(167,139,250,0.3)", color: purple, cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em" }}>+ STATE</button>
        <div style={{ fontSize: 10, color: "rgba(167,139,250,0.6)", marginLeft: 6, lineHeight: 1.6 }}>Click state to toggle accept. {states.length} states, {transitions.length} transitions.</div>
      </div>

      {/* Test string */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <input value={testStr} onChange={e => { setTestStr(e.target.value); setResult(null); }}
          style={{ flex: 1, background: "rgba(167,139,250,0.05)", border: "1px solid rgba(167,139,250,0.2)", color: white, padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: 13, outline: "none" }}
          placeholder="Test string…" />
        <button onClick={runDFA} style={{ padding: "8px 18px", background: purple, border: "none", color: "#0a0a0a", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>Run</button>
      </div>
      {result !== null && (
        <div style={{ padding: "10px 14px", background: result ? "rgba(57,255,20,0.08)" : "rgba(200,50,50,0.08)", border: `1px solid ${result ? "rgba(57,255,20,0.3)" : "rgba(200,50,50,0.3)"}`, fontFamily: "var(--font-mono)", fontSize: 12, color: result ? gn : "#c45050" }}>
          {result ? `"${testStr}" is ACCEPTED ✓` : `"${testStr}" is REJECTED ✗`}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SEED EXPERIMENTS
═══════════════════════════════════════════════════════════════ */
const SEED_EXPERIMENTS: Experiment[] = [
  {
    id: "caesar",
    title: "Caesar Cipher Playground",
    description: "Interactive Caesar cipher: type text, slide the shift, watch it encrypt live. Crack mode brute-forces all 26 shifts and ranks results by English letter frequency probability.",
    category: "Cryptography",
    tech: ["Python", "Cryptography", "AI-assisted analysis"],
    github: "https://github.com/TwoFoundersLab/Crypto",
    status: "LIVE",
    accent: "#39ff14",
    demo: <CaesarDemo />,
  },
  {
    id: "dfa",
    title: "DFA Minimizer Visualizer",
    description: "A visual DFA builder powered by Hopcroft's algorithm. Add states, define transitions, test strings, and watch the automaton accept or reject — all in the browser.",
    category: "Theory of Computation",
    tech: ["C++", "Qt 6", "Hopcroft Algorithm", "Automata Theory"],
    github: "https://github.com/TwoFoundersLab/DFA_Minimization",
    status: "DEMO",
    accent: "#a78bfa",
    demo: <DFADemo />,
  },
  {
    id: "sorting",
    title: "Sorting Algorithm Visualizer",
    description: "Real-time array sorting visualizer. Watch Bubble Sort, Quick Sort, and Merge Sort race each other — bars animate as comparisons and swaps happen. Adjustable speed and size.",
    category: "Algorithms",
    tech: ["TypeScript", "Canvas API", "Algorithm Design"],
    status: "LIVE",
    accent: "#f59e0b",
    demo: <SortingDemo />,
  },
];

/* ═══════════════════════════════════════════════════════════════
   CARD
═══════════════════════════════════════════════════════════════ */
function parseTechArray(tech: string[] | string): string[] {
  if (Array.isArray(tech)) return tech;
  try { return JSON.parse(tech); } catch { return []; }
}

function ExperimentCard({ exp, accent }: { exp: Experiment | (ReturnType<typeof mapDbExp>); accent: string }) {
  const [open, setOpen]     = useState(false);
  const [hov, setHov]       = useState(false);
  const ref                 = useFade(0);
  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };
  const tech: string[] = parseTechArray((exp as Experiment).tech);

  const statusColor = { LIVE: gn, DEMO: "#f59e0b", CONCEPT: dim, COMPLETED: "#60a5fa" }[exp.status as string] ?? dim;

  return (
    <div ref={ref}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: hov ? `rgba(${accent === "#39ff14" ? "57,255,20" : accent === "#a78bfa" ? "167,139,250" : "245,158,11"},0.04)` : "rgba(255,255,255,0.02)",
          border: `1px solid ${hov ? accent + "44" : border}`,
          padding: "24px 28px",
          transition: "border-color 0.25s, background 0.25s",
          cursor: "pointer",
        }}
        onClick={() => setOpen(o => !o)}
      >
        {/* Card header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              <span style={{ ...mono, fontSize: 9, padding: "2px 8px", color: accent, border: `1px solid ${accent}44`, letterSpacing: "0.15em" }}>{exp.category}</span>
              <span style={{ ...mono, fontSize: 9, padding: "2px 8px", color: statusColor, border: `1px solid ${statusColor}44`, letterSpacing: "0.15em" }}>{exp.status}</span>
            </div>
            <h3 style={{ fontWeight: 700, fontSize: "clamp(16px,1.8vw,22px)", color: white, letterSpacing: "-0.01em", marginBottom: 8 }}>{exp.title}</h3>
            <p style={{ fontSize: "clamp(12px,1.1vw,14px)", color: dim, lineHeight: 1.75, maxWidth: 520 }}>{exp.description}</p>
          </div>
          <div style={{ ...mono, fontSize: 12, color: accent, marginLeft: 20, flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(45deg)" : "none" }}>+</div>
        </div>

        {/* Tech tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {tech.map((t, i) => (
            <span key={i} style={{ ...mono, fontSize: 9, padding: "2px 8px", background: "rgba(255,255,255,0.04)", color: faint, border: `1px solid ${faint}` }}>{t}</span>
          ))}
        </div>

        {/* Links */}
        {(exp as Experiment).github && (
          <a href={(exp as Experiment).github} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{ ...mono, fontSize: 10, color: gnDim, letterSpacing: "0.12em", textDecoration: "none" }}>
            ↗ GitHub
          </a>
        )}
      </div>

      {/* Expanded demo */}
      {open && (exp as Experiment).demo && (
        <div style={{ borderLeft: `2px solid ${accent}`, borderRight: `1px solid ${border}`, borderBottom: `1px solid ${border}`, padding: "28px 28px" }}>
          <div style={{ ...mono, fontSize: 10, letterSpacing: "0.2em", color: accent, marginBottom: 20 }}>{"// INTERACTIVE DEMO"}</div>
          {(exp as Experiment).demo}
        </div>
      )}
    </div>
  );
}

/* ─── map DB experiment to display format ─── */
function mapDbExp(e: { id: string; title: string; description: string; category: string; tech: string; github_url?: string; status: string; accent_color?: string }) {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    category: e.category,
    tech: e.tech,
    github: e.github_url,
    status: e.status as "LIVE" | "DEMO" | "CONCEPT" | "COMPLETED",
    accent: e.accent_color ?? gn,
  };
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default function LabPage() {
  const [scrolled, setScrolled]   = useState(false);
  const [dbExps, setDbExps]       = useState<ReturnType<typeof mapDbExp>[]>([]);
  const headRef                   = useFade(0);
  const listRef                   = useFade(100);
  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    fetch("/api/lab")
      .then(r => r.ok ? r.json() : [])
      .then((data: Parameters<typeof mapDbExp>[0][]) => setDbExps(data.map(mapDbExp)))
      .catch(() => {});
  }, []);

  return (
    <div style={{ background: black, color: white, minHeight: "100vh", fontFamily: "var(--font-space)" }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        ::-webkit-scrollbar { width: 6px; background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: rgba(57,255,20,0.2); }
      `}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 clamp(24px,6vw,80px)", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", background: scrolled ? "rgba(0,0,0,0.94)" : "transparent", backdropFilter: scrolled ? "blur(12px)" : "none", borderBottom: scrolled ? `1px solid ${border}` : "none", transition: "background 0.35s" }}>
        <Link href="/engineer" style={{ ...mono, fontSize: 11, letterSpacing: "0.2em", color: gnDim, textDecoration: "none", transition: "color 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.color = gn)} onMouseLeave={e => (e.currentTarget.style.color = gnDim)}>← ENGINEER</Link>
        <span style={{ ...mono, fontSize: 10, letterSpacing: "0.25em", color: gnDim }}>{"// LAB"}</span>
      </nav>

      <div style={{ padding: "clamp(88px,12vw,140px) clamp(24px,8vw,120px) 88px", maxWidth: 1060, margin: "0 auto" }}>

        {/* Header */}
        <div ref={headRef} style={{ marginBottom: 72, borderBottom: `1px solid ${border}`, paddingBottom: 48 }}>
          <div style={{ ...mono, fontSize: 10, letterSpacing: "0.3em", color: gnDim, marginBottom: 16 }}>{"// LAB"}</div>
          <h1 style={{ fontWeight: 900, fontSize: "clamp(40px,7vw,96px)", letterSpacing: "-0.03em", lineHeight: 1.0, color: gn, marginBottom: 20, textShadow: "0 0 40px rgba(57,255,20,0.3)" }}>
            Experiments
          </h1>
          <p style={{ fontSize: "clamp(13px,1.2vw,16px)", color: dim, lineHeight: 1.85, maxWidth: 520 }}>
            Demos, tools, and things I built for fun. Click any card to see the interactive demo.
          </p>
        </div>

        {/* Seed experiments */}
        <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 48 }}>
          {SEED_EXPERIMENTS.map(exp => (
            <ExperimentCard key={exp.id} exp={exp} accent={exp.accent} />
          ))}
        </div>

        {/* DB experiments */}
        {dbExps.length > 0 && (
          <>
            <div style={{ ...mono, fontSize: 10, letterSpacing: "0.3em", color: gnDim, marginBottom: 16, paddingTop: 24, borderTop: `1px solid ${border}` }}>— FROM THE ADMIN PANEL</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {dbExps.map(exp => (
                <ExperimentCard key={exp.id} exp={exp as unknown as Experiment} accent={exp.accent} />
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${border}`, marginTop: 64, paddingTop: 28, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span style={{ ...mono, fontSize: 10, letterSpacing: "0.15em", color: faint }}>ELIA ALGHAZAL © 2026</span>
          <Link href="/engineer" style={{ ...mono, fontSize: 10, letterSpacing: "0.15em", color: faint, textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = gn)} onMouseLeave={e => (e.currentTarget.style.color = faint)}>← Back to Engineer</Link>
        </div>
      </div>
    </div>
  );
}
