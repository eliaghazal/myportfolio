"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { IntroVideoPlayer } from "./components/IntroVideoPlayer";

/* ─── Intro lines ─────────────────────────────────────────── */
const INTRO_LINES = [
  "Born in Lebanon.",
  "Raised under pressure.",
  "He writes in two languages:",
  "Code.",
  "And poetry.",
];

/* ─── Code rain fragments ─────────────────────────────────── */
const CODE_FRAGS = [
  "const pressure = new Legacy();",
  "if (impossible) { solve(); }",
  "fn build() -> Result<Empire>",
  "import { ambition } from 'core'",
  "while (breathing) { create(); }",
  "class Engineer extends Poet {}",
  "git commit -m 'still running'",
  "const elia = new Unstoppable();",
  "deploy --force --no-limits",
  "async fn dream() -> Reality",
  "// 3am. still compiling.",
  "let fate = self.write();",
  "return Ok(impossible_done);",
  "export default { Lebanon };",
  "const ink = code.toPoetry();",
  "type Elia = Engineer & Poet;",
  "npm run build:empire",
  "sudo make me unstoppable",
  "const legacy = await build();",
  "// still here. still building.",
  "yield* pressure.transform()",
  "// Lebanon → the world",
];

/* ─── Handwriting poem lines ──────────────────────────────── */
const POEM_LINES = [
  "I am the master of my fate",
  "etched in the immortal ink",
  "Come all — the eclipse",
  "Born anew with every line",
  "Midnight blue, a hue that heals",
  "transforming it into ink",
  "Land of God, we will return",
  "Behind my brown doe eyes",
  "a spark flickers",
  "With each betrayal, I rise",
  "my poetry, unbroken",
  "the creator of my destiny",
  "Still compiling. Still breathing.",
  "whispers of the eclipse",
  "Oh sea — I see myself in you",
  "forged from words",
  "Come all, it's happened",
  "I carry the burden",
  "Like Atlas, I endure",
  "my pen bleeds fury",
  "each stroke a battle",
  "each line a victory",
];

/* ─── Code Rain ───────────────────────────────────────────── */
function initCodeRain(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const resize = () => {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };
  resize();

  const fontSize = 12;
  const colW     = fontSize * 1.7;
  const cols     = Math.floor(canvas.width / colW);

  type Col = { x: number; y: number; speed: number; text: string; opacity: number; delay: number };
  const columns: Col[] = Array.from({ length: cols }, (_, i) => ({
    x:       i * colW + 4,
    y:       Math.random() * -canvas.height * 1.5,
    speed:   Math.random() * 0.6 + 0.25,
    text:    CODE_FRAGS[Math.floor(Math.random() * CODE_FRAGS.length)],
    opacity: Math.random() * 0.32 + 0.14,
    delay:   Math.floor(Math.random() * 100),
  }));

  let animId: number;
  let speedMult = 1;
  let frame = 0;
  const setSpeed = (s: number) => { speedMult = s; };

  const draw = () => {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px "IBM Plex Mono", monospace`;

    for (const col of columns) {
      if (frame < col.delay) continue;
      const chars = col.text.split("");
      chars.forEach((ch, ci) => {
        const yPos = col.y + ci * (fontSize * 1.6);
        if (yPos < -fontSize || yPos > canvas.height + fontSize) return;
        const isLead = ci === chars.length - 1;
        const fade   = 1 - (ci / chars.length) * 0.5;
        const alpha  = isLead
          ? Math.min(col.opacity * 3, 0.98)
          : col.opacity * fade;
        ctx.fillStyle = isLead
          ? `rgba(180, 255, 180, ${alpha})`
          : `rgba(57, 255, 20, ${alpha})`;
        ctx.fillText(ch, col.x, yPos);
      });

      col.y += col.speed * speedMult;
      if (col.y > canvas.height + 140) {
        col.y       = -(Math.random() * canvas.height * 0.5 + 80);
        col.text    = CODE_FRAGS[Math.floor(Math.random() * CODE_FRAGS.length)];
        col.opacity = Math.random() * 0.32 + 0.14;
        col.speed   = Math.random() * 0.6 + 0.25;
      }
    }
    animId = requestAnimationFrame(draw);
  };
  draw();

  const onResize = () => resize();
  window.addEventListener("resize", onResize);
  return {
    setSpeed,
    destroy: () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); },
  };
}

/* ─── Handwriting Poems ───────────────────────────────────── */
function initHandwriting(container: HTMLDivElement): { destroy: () => void } {
  let destroyed = false;
  let linePool  = [...POEM_LINES].sort(() => Math.random() - 0.5);
  let poolIdx   = 0;
  const timers: ReturnType<typeof setTimeout>[] = [];

  const positions = [
    { top: "7%",  left: "4%",  rot: -3 },
    { top: "11%", left: "54%", rot:  4 },
    { top: "21%", left: "12%", rot: -5 },
    { top: "27%", left: "60%", rot:  3 },
    { top: "37%", left: "6%",  rot: -4 },
    { top: "43%", left: "56%", rot:  2 },
    { top: "54%", left: "16%", rot: -3 },
    { top: "62%", left: "58%", rot:  5 },
    { top: "71%", left: "5%",  rot: -6 },
    { top: "77%", left: "55%", rot:  3 },
    { top: "84%", left: "18%", rot: -2 },
    { top: "89%", left: "52%", rot:  4 },
  ];
  let posIdx = 0;

  const spawnLine = () => {
    if (destroyed) return;

    const text     = linePool[poolIdx % linePool.length];
    poolIdx++;
    if (poolIdx >= linePool.length) {
      linePool = [...POEM_LINES].sort(() => Math.random() - 0.5);
      poolIdx  = 0;
    }

    const pos      = positions[posIdx % positions.length];
    posIdx++;

    // Increased opacity range: 0.45 – 0.75
    const opacity  = Math.random() * 0.30 + 0.45;
    const fontSize = Math.random() * 6 + 15; // 15–21px

    const el       = document.createElement("div");
    el.style.cssText = `
      position: absolute;
      top: ${pos.top};
      left: ${pos.left};
      font-family: var(--font-caveat), cursive;
      font-size: ${fontSize}px;
      font-weight: ${Math.random() > 0.5 ? "500" : "400"};
      color: rgba(28, 16, 4, ${opacity});
      white-space: nowrap;
      transform: rotate(${pos.rot}deg);
      pointer-events: none;
      opacity: 0;
      letter-spacing: 0.01em;
      line-height: 1.3;
      max-width: 40%;
    `;
    container.appendChild(el);

    let ci = 0;
    const typeChar = () => {
      if (destroyed) { el.remove(); return; }
      if (ci <= text.length) {
        el.textContent = text.slice(0, ci);
        if (ci === 1) gsap.to(el, { opacity: 1, duration: 0.2 });
        ci++;
        const t = setTimeout(typeChar, Math.random() * 28 + 24);
        timers.push(t);
      } else {
        const t = setTimeout(() => {
          if (destroyed) return;
          gsap.to(el, {
            opacity: 0, duration: 1.6, ease: "power2.in",
            onComplete: () => { el.remove(); if (!destroyed) spawnLine(); },
          });
        }, Math.random() * 2800 + 2200);
        timers.push(t);
      }
    };

    const t = setTimeout(typeChar, Math.random() * 300 + 80);
    timers.push(t);
  };

  // Stagger initial batch
  positions.forEach((_, i) => {
    const t = setTimeout(() => { if (!destroyed) spawnLine(); }, i * 380 + Math.random() * 150);
    timers.push(t);
  });

  return {
    destroy: () => {
      destroyed = true;
      timers.forEach(clearTimeout);
      container.innerHTML = "";
    },
  };
}

/* ─── Page ────────────────────────────────────────────────── */
export default function LandingPage() {
  const router = useRouter();

  const introRef       = useRef<HTMLDivElement>(null);
  const introLineRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const skipRef        = useRef<HTMLDivElement>(null);
  const cursorRef      = useRef<HTMLDivElement>(null);
  const leftRef        = useRef<HTMLDivElement>(null);
  const rightRef       = useRef<HTMLDivElement>(null);

  // ← Seam now uses a wrapper div for positioning + inner div for scaleY animation
  // This avoids GSAP overwriting translateX when animating scaleY
  const codeCanvasRef  = useRef<HTMLCanvasElement>(null);
  const hwContainerRef = useRef<HTMLDivElement>(null);
  const leftLabelRef   = useRef<HTMLDivElement>(null);
  const leftSubRef     = useRef<HTMLDivElement>(null);
  const leftEnterRef   = useRef<HTMLDivElement>(null);
  const rightLabelRef  = useRef<HTMLDivElement>(null);
  const rightSubRef    = useRef<HTMLDivElement>(null);
  const rightEnterRef  = useRef<HTMLDivElement>(null);

  const codeRainRef = useRef<ReturnType<typeof initCodeRain>>(null);
  const hwRef       = useRef<ReturnType<typeof initHandwriting>>(null);
  const interactive = useRef(false);
  const navigating  = useRef(false);

  const showFinal = useCallback(() => {
    gsap.set(introRef.current,  { display: "none" });
    gsap.set(cursorRef.current, { opacity: 0 });
    gsap.set([leftRef.current, rightRef.current], { opacity: 1 });
    gsap.set(
      [leftLabelRef.current, rightLabelRef.current,
       leftSubRef.current,   rightSubRef.current],
      { opacity: 1, y: 0 }
    );
    gsap.set(skipRef.current, { opacity: 0 });
    if (codeCanvasRef.current && !codeRainRef.current)
      codeRainRef.current = initCodeRain(codeCanvasRef.current);
    if (hwContainerRef.current && !hwRef.current)
      hwRef.current = initHandwriting(hwContainerRef.current);
    interactive.current = true;
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      showFinal(); return;
    }

    let skipped = false;
    const skip = () => {
      if (skipped) return;
      skipped = true;
      gsap.killTweensOf("*");
      showFinal();
    };
    skipRef.current?.addEventListener("click", skip);
    gsap.to(skipRef.current, { opacity: 0.35, duration: 0.6, delay: 0.8 });

    /* P1 */
    const tl = gsap.timeline({
      onComplete: () => {
        if (skipped) return;
        gsap.to(introRef.current, {
          opacity: 0, duration: 0.35,
          onComplete: () => {
            if (introRef.current) introRef.current.style.display = "none";
            p2();
          },
        });
      },
    });
    INTRO_LINES.forEach((_, i) => {
      const el = introLineRefs.current[i];
      if (!el) return;
      const hold = i >= 3 ? 1.2 : 0.9;
      tl.to(el, { opacity: 1, y: 0,  duration: 0.5,  ease: "power2.out" })
        .to(el, { opacity: 0,        duration: 0.4,  ease: "power2.in"  }, `+=${hold}`);
      if (i === 3) tl.to({}, { duration: 0.3 });
    });
    tl.to({}, { duration: 0.5 });

    /* P2 — cursor */
    const p2 = () => {
      if (skipped) return;
      gsap.timeline({ onComplete: p3 })
        .to(cursorRef.current, { opacity: 1, duration: 0.15 })
        .to(cursorRef.current, { opacity: 0, duration: 0.15, delay: 0.45 })
        .to(cursorRef.current, { opacity: 1, duration: 0.15, delay: 0.12 })
        .to(cursorRef.current, { opacity: 0, duration: 0.15, delay: 0.45 });
    };

    /* P3 — halves appear */
    const p3 = () => {
      if (skipped) return;
      gsap.to([leftRef.current, rightRef.current], { opacity: 1, duration: 0.4 });
      setTimeout(p4, 500);
    };

    /* P4 — crack: brief white flash at the split point, no persistent line */
    const p4 = () => {
      if (skipped) return;
      // Flash both halves slightly bright then settle — gives crack feel without a line
      gsap.to([leftRef.current, rightRef.current], {
        filter: "brightness(1.4)", duration: 0.08, yoyo: true, repeat: 1,
        onComplete: p5,
      });
    };

    /* P5 — labels + canvases */
    const p5 = () => {
      if (skipped) return;
      if (codeCanvasRef.current && !codeRainRef.current)
        codeRainRef.current = initCodeRain(codeCanvasRef.current);
      if (hwContainerRef.current && !hwRef.current)
        hwRef.current = initHandwriting(hwContainerRef.current);

      gsap.to(leftLabelRef.current,  { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
      gsap.to(rightLabelRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.1 });
      gsap.to([leftSubRef.current, rightSubRef.current], {
        opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.3,
        onComplete: () => { interactive.current = true; },
      });
      gsap.to(skipRef.current, { opacity: 0, duration: 0.3 });
    };

    return () => {
      codeRainRef.current?.destroy();
      hwRef.current?.destroy();
      tl.kill();
    };
  }, [showFinal]);

  const onHover = useCallback((side: "left" | "right" | "none") => {
    if (!interactive.current) return;
    const L = leftRef.current, R = rightRef.current;
    if (!L || !R) return;
    const d = 0.45, e = "power2.out";

    if (side === "left") {
      gsap.to(L, { width: "60%", duration: d, ease: e });
      gsap.to(R, { width: "40%", duration: d, ease: e });
      gsap.to(leftEnterRef.current,  { opacity: 1, y: 0, duration: 0.3 });
      gsap.to(rightEnterRef.current, { opacity: 0, y: 4, duration: 0.2 });
      codeRainRef.current?.setSpeed(3);
    } else if (side === "right") {
      gsap.to(L, { width: "40%", duration: d, ease: e });
      gsap.to(R, { width: "60%", duration: d, ease: e });
      gsap.to(rightEnterRef.current, { opacity: 1, y: 0, duration: 0.3 });
      gsap.to(leftEnterRef.current,  { opacity: 0, y: 4, duration: 0.2 });
      codeRainRef.current?.setSpeed(0.3);
    } else {
      gsap.to(L, { width: "50%", duration: d, ease: e });
      gsap.to(R, { width: "50%", duration: d, ease: e });
      gsap.to([leftEnterRef.current, rightEnterRef.current], { opacity: 0, y: 4, duration: 0.2 });
      codeRainRef.current?.setSpeed(1);
    }
  }, []);

  /* ── Navigate */
  const onNavigate = useCallback((side: "engineer" | "poet") => {
    if (!interactive.current || navigating.current) return;
    navigating.current = true;
    const leaving  = side === "engineer" ? rightRef.current : leftRef.current;
    const entering = side === "engineer" ? leftRef.current  : rightRef.current;
    gsap.to(leaving,  { x: side === "engineer" ? "100%" : "-100%", opacity: 0, duration: 0.55, ease: "power2.inOut" });
    gsap.to(entering, { width: "100%", duration: 0.55, ease: "power2.inOut", onComplete: () => router.push(`/${side}`) });
  }, [router]);

  /* ── JSX ── */
  return (
    <>
      {/* Cinematic intro video overlay — plays once on first visit */}
      <IntroVideoPlayer />
      <div style={{ position: "fixed", inset: 0, background: "#000", overflow: "hidden" }}>

      {/* Skip */}
      <div ref={skipRef} style={{
        position: "fixed", bottom: 28, right: 32, zIndex: 100, opacity: 0,
        fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em",
        color: "rgba(255,255,255,0.5)", cursor: "pointer", userSelect: "none",
        textTransform: "uppercase",
      }}>SKIP</div>

      {/* ── Intro ── */}
      <div ref={introRef} style={{
        position: "fixed", inset: 0, zIndex: 50, background: "#000",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        {INTRO_LINES.map((line, i) => (
          <div key={i} ref={el => { introLineRefs.current[i] = el; }} style={{
            opacity: 0, transform: "translateY(8px)",
            fontFamily: i === 3 ? "var(--font-mono)"
                      : i === 4 ? "var(--font-caveat)"
                      : "var(--font-cormorant)",
            fontWeight: i === 3 ? 400 : i === 4 ? 600 : 300,
            fontSize:   i === 3 ? "clamp(22px,3.5vw,44px)"
                      : i === 4 ? "clamp(28px,4.5vw,58px)"
                      :           "clamp(18px,2.8vw,36px)",
            color:      i === 3 ? "#39ff14" : i === 4 ? "#f5e0b8" : "rgba(255,255,255,0.88)",
            letterSpacing: i === 3 ? "0.06em" : "0.02em",
            lineHeight: 1.2,
            marginBottom: i === 3 ? "0.1em" : "0.4em",
            textAlign: "center",
          }}>{line}</div>
        ))}
      </div>

      {/* Cursor */}
      <div ref={cursorRef} style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)", zIndex: 40, opacity: 0,
        fontFamily: "var(--font-mono)", fontSize: "clamp(28px,4vw,48px)",
        color: "#fff", fontWeight: 300, pointerEvents: "none",
      }}>|</div>

      {/* ══ LEFT — ENGINEER ══ */}
      <div
        ref={leftRef}
        onMouseEnter={() => onHover("left")}
        onMouseLeave={() => onHover("none")}
        onClick={() => onNavigate("engineer")}
        style={{
          position: "fixed", top: 0, left: 0, width: "50%", height: "100%",
          background: "#000000", opacity: 0, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
          boxShadow: "4px 0 18px 4px rgba(0,0,0,0.85)",  /* kills hard edge */
        }}
      >
        <canvas ref={codeCanvasRef} style={{
          position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "radial-gradient(ellipse 52% 52% at 50% 50%, rgba(0,0,0,0.88) 0%, transparent 100%)",
        }} />
        <div style={{
          position: "relative", zIndex: 20,
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: "clamp(8px,1.2vw,16px)", textAlign: "center",
          padding: "0 clamp(20px,5%,60px)",
        }}>
          <div ref={leftLabelRef} style={{
            opacity: 0, transform: "translateY(12px)",
            fontFamily: "var(--font-space)", fontWeight: 700,
            fontSize: "clamp(36px,7vw,96px)", color: "#ffffff",
            letterSpacing: "0.15em", textTransform: "uppercase",
            textShadow: "0 0 35px rgba(57,255,20,0.5), 0 0 90px rgba(57,255,20,0.2)",
            lineHeight: 1,
          }}>ENGINEER</div>
          <div ref={leftSubRef} style={{
            opacity: 0, transform: "translateY(8px)",
            fontFamily: "var(--font-mono)", fontWeight: 300,
            fontSize: "clamp(9px,1.1vw,13px)", color: "rgba(57,255,20,0.5)",
            letterSpacing: "0.28em", textTransform: "uppercase",
          }}>IoT · AI · Systems · Hardware</div>
          <div ref={leftEnterRef} style={{
            opacity: 0, transform: "translateY(4px)",
            fontFamily: "var(--font-mono)", fontSize: "clamp(9px,1vw,12px)",
            color: "rgba(57,255,20,0.85)", letterSpacing: "0.22em", marginTop: 4,
            animation: "enterPulse 2s ease-in-out infinite",
          }}>[ ENTER ]</div>
        </div>
      </div>

      {/* ══ RIGHT — POET ══ */}
      <div
        ref={rightRef}
        onMouseEnter={() => onHover("right")}
        onMouseLeave={() => onHover("none")}
        onClick={() => onNavigate("poet")}
        style={{
          position: "fixed", top: 0, right: 0, width: "50%", height: "100%",
          background: "#f4ede0", opacity: 0, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Handwriting container */}
        <div ref={hwContainerRef} style={{
          position: "absolute", inset: 0, zIndex: 1,
          pointerEvents: "none", overflow: "hidden",
        }} />

        {/* Ruled lines */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
          backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(160,130,90,0.12) 27px, rgba(160,130,90,0.12) 28px)",
        }} />

        {/* Corner aging */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
          background: `
            radial-gradient(ellipse 100% 100% at 0% 0%,    rgba(190,165,120,0.2) 0%, transparent 45%),
            radial-gradient(ellipse 100% 100% at 100% 0%,  rgba(190,165,120,0.2) 0%, transparent 45%),
            radial-gradient(ellipse 100% 100% at 0% 100%,  rgba(190,165,120,0.2) 0%, transparent 45%),
            radial-gradient(ellipse 100% 100% at 100% 100%,rgba(190,165,120,0.2) 0%, transparent 45%)
          `,
        }} />

        {/* Label readability glow */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none",
          background: "radial-gradient(ellipse 48% 52% at 50% 50%, rgba(244,237,224,0.92) 0%, transparent 100%)",
        }} />

        {/* Labels */}
        <div style={{
          position: "relative", zIndex: 20,
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: "clamp(8px,1.2vw,16px)", textAlign: "center",
          padding: "0 clamp(20px,5%,60px)",
        }}>
          <div ref={rightLabelRef} style={{
            opacity: 0, transform: "translateY(12px)",
            fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontWeight: 600,
            fontSize: "clamp(40px,7.5vw,104px)", color: "#1a1005",
            letterSpacing: "0.04em",
            textShadow: "0 2px 30px rgba(80,50,10,0.15)",
            lineHeight: 1,
          }}>Poet</div>
          <div ref={rightSubRef} style={{
            opacity: 0, transform: "translateY(8px)",
            fontFamily: "var(--font-lora)", fontStyle: "italic", fontWeight: 400,
            fontSize: "clamp(9px,1.1vw,13px)", color: "rgba(80,55,20,0.5)",
            letterSpacing: "0.2em",
          }}>Poetry · Essays · Memoir</div>
          <div ref={rightEnterRef} style={{
            opacity: 0, transform: "translateY(4px)",
            fontFamily: "var(--font-caveat)", fontWeight: 500,
            fontSize: "clamp(13px,1.4vw,17px)",
            color: "rgba(100,65,15,0.75)", letterSpacing: "0.05em", marginTop: 4,
            animation: "enterPulse 2.2s ease-in-out infinite",
          }}>Open the Book →</div>
        </div>
      </div>

    </div>
    </>
  );
}
