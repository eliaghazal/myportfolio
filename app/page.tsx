"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

/* ─── Intro lines ─────────────────────────────────────────── */
const INTRO_LINES = [
  "some days are heavier than others.",
  "but I keep showing up.",
  "with a keyboard in one hand,",
  "and a pen in the other.",
  "that's all I know how to do.",
];

/* ─── Voiceover sync timestamps ───────────────────────────── */
// When you record a voiceover, drop the file at /public/voiceover.mp3
// and adjust these timestamps (in seconds) to match your recording.
const VOICEOVER_SYNC = [
  { line: 0, time: 0.5  }, // "some days are heavier than others."
  { line: 1, time: 3.8  }, // "but I keep showing up."
  { line: 2, time: 6.5  }, // "with a keyboard in one hand,"
  { line: 3, time: 9.0  }, // "and a pen in the other."
  { line: 4, time: 12.0 }, // "that's all I know how to do."
];

/* ─── Intro timing constants ──────────────────────────────── */
// How long each line is held before fading out (seconds)
const LINE_HOLD_DURATION = 1.3;
// How long to wait before starting the GSAP fallback if audio doesn't load (ms)
const AUDIO_LOAD_TIMEOUT_MS = 1500;

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

/* ─── Intro Particles ─────────────────────────────────────── */
// Separate from the code-rain canvas — subtle dust motes that drift
// slowly during the text phase, then respond to the split.
function initParticles(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const resize = () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();

  const COUNT = 72;
  type Particle = { x: number; y: number; vx: number; vy: number; size: number; opacity: number };
  const particles: Particle[] = Array.from({ length: COUNT }, () => ({
    x:       Math.random() * canvas.width,
    y:       Math.random() * canvas.height,
    vx:      (Math.random() - 0.5) * 0.12,
    vy:      (Math.random() - 0.5) * 0.12 - 0.02, // slight upward drift
    size:    Math.random() * 0.8 + 0.4,
    opacity: Math.random() * 0.1 + 0.05,
  }));

  let animId: number;
  let gatherStrength = 0; // 0 = free drift, >0 = pulled toward center
  let splitActive    = false;

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;

    for (const p of particles) {
      if (gatherStrength > 0) {
        const dx = cx - p.x;
        p.vx    += dx * 0.00008 * gatherStrength;
        p.vx    *= 0.995;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges
      if (p.x < -5)                    p.x = canvas.width  + 5;
      if (p.x > canvas.width  + 5)     p.x = -5;
      if (p.y < -5)                    p.y = canvas.height + 5;
      if (p.y > canvas.height + 5)     p.y = -5;

      let r = 255, g = 255, b = 250;
      if (splitActive) {
        if (p.x < cx) { r = 57;  g = 255; b = 20;  }   // green — left / engineer
        else           { r = 245; g = 224; b = 184; }   // gold  — right / poet
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${p.opacity})`;
      ctx.fill();
    }

    animId = requestAnimationFrame(draw);
  };
  draw();

  const onResize = () => resize();
  window.addEventListener("resize", onResize);

  return {
    startGathering: () => { gatherStrength = 1; },
    activateSplit:  () => { splitActive = true; gatherStrength = 0; },
    destroy:        () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); },
  };
}

/* ─── Page ────────────────────────────────────────────────── */
export default function LandingPage() {
  const router = useRouter();

  const introRef       = useRef<HTMLDivElement>(null);
  const introLineRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const skipRef        = useRef<HTMLDivElement>(null);
  const seamRef        = useRef<HTMLDivElement>(null);
  const leftRef        = useRef<HTMLDivElement>(null);
  const rightRef       = useRef<HTMLDivElement>(null);

  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const codeCanvasRef     = useRef<HTMLCanvasElement>(null);
  const hwContainerRef    = useRef<HTMLDivElement>(null);
  const leftLabelRef      = useRef<HTMLDivElement>(null);
  const leftSubRef        = useRef<HTMLDivElement>(null);
  const leftEnterRef      = useRef<HTMLDivElement>(null);
  const rightLabelRef     = useRef<HTMLDivElement>(null);
  const rightSubRef       = useRef<HTMLDivElement>(null);
  const rightEnterRef     = useRef<HTMLDivElement>(null);
  const audioRef          = useRef<HTMLAudioElement>(null);
  const muteButtonRef     = useRef<HTMLDivElement>(null);

  const codeRainRef  = useRef<ReturnType<typeof initCodeRain>>(null);
  const hwRef        = useRef<ReturnType<typeof initHandwriting>>(null);
  const particleRef  = useRef<ReturnType<typeof initParticles>>(null);
  const interactive  = useRef(false);
  const navigating   = useRef(false);
  const mutedRef     = useRef(false);
  const isMobileRef  = useRef(false);

  const showFinal = useCallback(() => {
    // Set session flag so the intro is skipped on return visits.
    // Also called by SKIP and reduced-motion paths — natural completion sets it in P5.
    try { sessionStorage.setItem("elia_intro_seen", "true"); } catch { /* private browsing */ }

    gsap.set(introRef.current, { display: "none" });
    gsap.set(seamRef.current,  { display: "none" });
    // clearProps:"filter" is a defensive guard — SKIP kills all tweens mid-flight,
    // so any in-progress filter animation is cleared to avoid residual glitches.
    gsap.set([leftRef.current, rightRef.current], { opacity: 1, clearProps: "filter" });
    gsap.set(
      [leftLabelRef.current, rightLabelRef.current,
       leftSubRef.current,   rightSubRef.current],
      { opacity: 1, y: 0 }
    );
    gsap.set(skipRef.current,       { opacity: 0 });
    gsap.set(muteButtonRef.current, { opacity: 0 });
    // Hide and destroy particle canvas — it's only needed during the intro
    if (particleCanvasRef.current) particleCanvasRef.current.style.display = "none";
    particleRef.current?.destroy();
    if (codeCanvasRef.current && !codeRainRef.current)
      codeRainRef.current = initCodeRain(codeCanvasRef.current);
    if (hwContainerRef.current && !hwRef.current)
      hwRef.current = initHandwriting(hwContainerRef.current);
    interactive.current = true;
  }, []);

  useEffect(() => {
    isMobileRef.current = window.innerWidth <= 767;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      showFinal(); return;
    }

    // ── Session check: skip intro on return visits ──────────────
    try {
      if (sessionStorage.getItem("elia_intro_seen") === "true") {
        showFinal(); return;
      }
    } catch { /* private browsing — play the intro */ }

    // ── Particles ────────────────────────────────────────────────
    if (particleCanvasRef.current)
      particleRef.current = initParticles(particleCanvasRef.current);

    let skipped = false;
    const skip = () => {
      if (skipped) return;
      skipped = true;
      if (audioRef.current) { audioRef.current.pause(); }
      gsap.killTweensOf("*");
      showFinal();
    };
    skipRef.current?.addEventListener("click", skip);
    gsap.to(skipRef.current, { opacity: 0.35, duration: 0.6, delay: 1.0 });

    // ── Split reveal (P_split) ───────────────────────────────────
    const triggerSplit = () => {
      if (skipped) return;
      // Pause + gather particles toward center
      particleRef.current?.startGathering();

      const mobile = isMobileRef.current;

      // Seam (vertical on desktop, horizontal on mobile) forms
      if (seamRef.current) {
        gsap.set(seamRef.current, { scaleY: mobile ? 1 : 0, scaleX: mobile ? 0 : 1, opacity: 0 });
      }
      gsap.to(seamRef.current, {
        opacity: 1, ...(mobile ? { scaleX: 1 } : { scaleY: 1 }), duration: 0.5, ease: "power2.out",
        delay: 0.4, transformOrigin: "center center",
        onComplete: () => {
          if (skipped) return;
          // Halves fade in behind the seam
          gsap.to([leftRef.current, rightRef.current], {
            opacity: 1, duration: 0.6, ease: "power2.out",
          });
          // Seam fades away as halves settle
          gsap.to(seamRef.current, { opacity: 0, duration: 0.45, delay: 0.35 });

          // Particles shift to split colors after halves are visible (~half of fade-in duration)
          setTimeout(() => { particleRef.current?.activateSplit(); }, 700);

          // Labels + canvases (P5)
          setTimeout(() => {
            if (skipped) return;
            if (codeCanvasRef.current && !codeRainRef.current)
              codeRainRef.current = initCodeRain(codeCanvasRef.current);
            if (hwContainerRef.current && !hwRef.current)
              hwRef.current = initHandwriting(hwContainerRef.current);
            // Hide particle canvas once the split screen takes over
            if (particleCanvasRef.current)
              particleCanvasRef.current.style.display = "none";
            particleRef.current?.destroy();

            gsap.to(leftLabelRef.current,  { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
            gsap.to(rightLabelRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.1 });
            gsap.to([leftSubRef.current, rightSubRef.current], {
              opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.3,
              onComplete: () => {
                interactive.current = true;
                try { sessionStorage.setItem("elia_intro_seen", "true"); } catch { /* ok */ }
              },
            });
            gsap.to(skipRef.current,       { opacity: 0, duration: 0.3 });
            gsap.to(muteButtonRef.current, { opacity: 0, duration: 0.3 });
          }, 800);
        },
      });
    };

    // ── Trigger a single intro line ──────────────────────────────
    const triggerLine = (index: number, onDone?: () => void) => {
      const el = introLineRefs.current[index];
      if (!el) { onDone?.(); return; }
      gsap.timeline({ onComplete: onDone })
        .to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" })
        .to(el, { opacity: 0,       duration: 0.5, ease: "power2.in"  }, `+=${LINE_HOLD_DURATION}`);
    };

    // ── Audio-driven or GSAP-driven line reveals ─────────────────
    const audio = audioRef.current;
    let audioAvailable = false;

    const runGsapFallback = () => {
      // Sequential GSAP timeline: each line fades in, holds, fades out
      const tl = gsap.timeline();
      INTRO_LINES.forEach((_, i) => {
        const el = introLineRefs.current[i];
        if (!el) return;
        tl.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" })
          .to(el, { opacity: 0,       duration: 0.5, ease: "power2.in"  }, `+=${LINE_HOLD_DURATION}`)
          .to({},  { duration: 0.35 }); // brief pause between lines
      });
      tl.call(() => { setTimeout(triggerSplit, 300); });
      return tl;
    };

    let tl: ReturnType<typeof gsap.timeline> | null = null;

    if (audio) {
      const syncTriggered = new Array(INTRO_LINES.length).fill(false);

      const onTimeUpdate = () => {
        if (!audio || skipped) return;
        const ct = audio.currentTime;
        for (const { line, time } of VOICEOVER_SYNC) {
          if (!syncTriggered[line] && ct >= time) {
            syncTriggered[line] = true;
            const isLast = line === INTRO_LINES.length - 1;
            triggerLine(line, isLast ? () => setTimeout(triggerSplit, 300) : undefined);
          }
        }
      };

      const onCanPlay = () => {
        if (skipped || audioAvailable) return;
        audioAvailable = true;
        // Show mute button
        gsap.to(muteButtonRef.current, { opacity: 0.35, duration: 0.4 });
        audio.play().catch(() => {
          // Autoplay blocked — remove all audio listeners and run GSAP timing
          audio.removeEventListener("canplay",    onCanPlay);
          audio.removeEventListener("error",      onError);
          audio.removeEventListener("timeupdate", onTimeUpdate);
          gsap.set(muteButtonRef.current, { opacity: 0 });
          tl = runGsapFallback();
        });
        audio.addEventListener("timeupdate", onTimeUpdate);
      };

      const onError = () => {
        // File not found (404) or other load error — use GSAP timing
        tl = runGsapFallback();
      };

      audio.addEventListener("canplay",  onCanPlay, { once: true });
      audio.addEventListener("error",    onError,   { once: true });
      // If the audio file doesn't exist the error fires quickly;
      // wait before falling back to GSAP so we don't race with canplay.
      const fallbackTimer = setTimeout(() => {
        if (!audioAvailable && !skipped) {
          // Audio never became available — remove listeners and run GSAP
          audio.removeEventListener("canplay",    onCanPlay);
          audio.removeEventListener("error",      onError);
          tl = runGsapFallback();
        }
      }, AUDIO_LOAD_TIMEOUT_MS);

      return () => {
        clearTimeout(fallbackTimer);
        codeRainRef.current?.destroy();
        hwRef.current?.destroy();
        particleRef.current?.destroy();
        tl?.kill();
        audio.pause();
        audio.removeEventListener("canplay",     onCanPlay);
        audio.removeEventListener("error",       onError);
        audio.removeEventListener("timeupdate",  onTimeUpdate);
      };
    } else {
      tl = runGsapFallback();
      return () => {
        codeRainRef.current?.destroy();
        hwRef.current?.destroy();
        particleRef.current?.destroy();
        tl?.kill();
      };
    }
  }, [showFinal]);

  const onHover = useCallback((side: "left" | "right" | "none") => {
    if (!interactive.current) return;
    if (isMobileRef.current) return; // no expand/contract on touch screens
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
    if (isMobileRef.current) {
      // On mobile panels stack vertically — slide out vertically
      gsap.to(leaving,  { y: side === "engineer" ? "100%" : "-100%", opacity: 0, duration: 0.55, ease: "power2.inOut" });
      gsap.to(entering, { height: "100%", duration: 0.55, ease: "power2.inOut", onComplete: () => router.push(`/${side}`) });
    } else {
      gsap.to(leaving,  { x: side === "engineer" ? "100%" : "-100%", opacity: 0, duration: 0.55, ease: "power2.inOut" });
      gsap.to(entering, { width: "100%", duration: 0.55, ease: "power2.inOut", onComplete: () => router.push(`/${side}`) });
    }
  }, [router]);

  /* ── JSX ── */
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", overflow: "hidden" }}>

      {/* Hidden audio element — drop /public/voiceover.mp3 to enable */}
      <audio ref={audioRef} src="/voiceover.mp3" preload="auto" style={{ display: "none" }} />

      {/* Skip */}
      <div ref={skipRef} style={{
        position: "fixed", bottom: 28, right: 32, zIndex: 100, opacity: 0,
        fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em",
        color: "rgba(255,255,255,0.5)", cursor: "pointer", userSelect: "none",
        textTransform: "uppercase",
      }}>SKIP</div>

      {/* Mute / Unmute — only visible when voiceover.mp3 is available */}
      <div ref={muteButtonRef} style={{
        position: "fixed", bottom: 28, left: 32, zIndex: 100, opacity: 0,
        fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em",
        color: "rgba(255,255,255,0.5)", cursor: "pointer", userSelect: "none",
        textTransform: "uppercase",
      }} onClick={() => {
        const audio = audioRef.current;
        if (!audio) return;
        mutedRef.current = !mutedRef.current;
        audio.muted = mutedRef.current;
        if (muteButtonRef.current)
          muteButtonRef.current.textContent = mutedRef.current ? "[ unmute ]" : "[ mute ]";
      }}>[ mute ]</div>

      {/* Intro particle canvas — separate from the code-rain canvas */}
      <canvas ref={particleCanvasRef} style={{
        position: "fixed", inset: 0, width: "100%", height: "100%",
        zIndex: 45, pointerEvents: "none",
      }} />

      {/* Seam — vertical light line during the split reveal */}
      <div ref={seamRef} className="seam-line" style={{
        position: "fixed",
        top: "10%",
        left: "50%",
        width: "1px",
        height: "80%",
        transform: "translateX(-50%) scaleY(0)",
        transformOrigin: "center center",
        background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.9) 15%, rgba(255,255,255,0.9) 85%, transparent 100%)",
        boxShadow: "0 0 6px 2px rgba(255,255,255,0.3), 0 0 18px 4px rgba(255,255,255,0.1)",
        zIndex: 60,
        opacity: 0,
        pointerEvents: "none",
      }} />

      {/* ── Intro ── */}
      <div ref={introRef} style={{
        position: "fixed", inset: 0, zIndex: 50, background: "transparent",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
        gap: "0.55em",
      }}>
        {INTRO_LINES.map((line, i) => (
          <div key={i} ref={el => { introLineRefs.current[i] = el; }} style={{
            opacity: 0, transform: "translateY(10px)",
            fontFamily: "var(--font-cormorant), serif",
            fontWeight: 300,
            fontSize: "clamp(18px, 2.6vw, 38px)",
            color: "rgba(255,255,255,0.9)",
            letterSpacing: "0.06em",
            lineHeight: 1.3,
            textAlign: "center",
            padding: "0 clamp(24px, 8vw, 120px)",
          }}>{line}</div>
        ))}
      </div>

      {/* ══ LEFT — ENGINEER ══ */}
      <div
        ref={leftRef}
        className="split-left"
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
        className="split-right"
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
  );
}
