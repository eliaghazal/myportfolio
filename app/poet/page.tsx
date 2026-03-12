"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─── Palette ─────────────────────────────────────────── */
const ink    = "#1c1814";
const paper  = "#f4f1ec";
const rust   = "#b85c38";
const rustDim= "rgba(184,92,56,0.55)";
const dim    = "rgba(28,24,20,0.42)";
const faint  = "rgba(28,24,20,0.14)";
const border = "rgba(28,24,20,0.1)";

/* ─── Poems (real content from the book) ─────────────── */
const HERO_LINES = [
  "Come all,\nwe're witnessing\nthe eclipse.",
  "The sun tries\nher best\nbut never listens.",
  "I am bound\nby an invisible thread,\nnot to another,\nbut to my own soul.",
  "You're the sun,\nand I am the moon —\ntogether we're the eclipse.",
  "Land of God,\nwe will return\nto reclaim you.",
];

const POEMS = [
  {
    title: "Behind My Brown Doe Eyes",
    year: "2021",
    theme: "Identity",
    lines: `Behind my brown doe eyes,
Waterfalls cascade,
Creating rivers flowing out,
Drowning thoughts and emotions.

Behind my brown doe eyes,
A spark flickers,
A tiny light in my mind,
Slowly fading in the rivers.

Behind my brown doe eyes,
Untold truths lie,
Unfolded relationships,
Sunken ships of love and sense,
And hatred for the creator of my waterfalls.

Behind my brown doe eyes,
Hotels for demons reside,
Though they appear as angels outside,
Inside, they thrive on my red-drawn lines.

Oh, to forget the past,
And rid myself of demons,
But that would end me.

Behind my brown doe eyes,
Scenes unseen,
Scenes to be forgotten,
Scenes from childhood,
Scenes from life —
Remind me,
You were never good enough.

Behind my brown doe eyes,
A shattered heart beats,
Longing to love,
A forbidden love,
A love I feared.

Everywhere I go,
I want to disappear.`,
  },
  {
    title: "The Ghost of Town",
    year: "2021",
    theme: "Isolation · Home",
    lines: `The sun tries her best but never listens,
The moon reaches out, but the phone is dusty now.

I grew up in a little town in the East,
Where everyone knows each other, but no one knows,
The ghost of town that paces around,
Lurking by lit houses,
Wondering why it is the way it is.

I threw my old spirit inside a dungeon,
All four walls with listening ears,
They heard my soul's screams every night,
The roof the only view my eyes laid on,
A trail forever engraved.

Doe eyes,
Looking up,
Hands together, knees on the ground,
Asking if there's a God listening around.

I am someone's son, someone's daughter,
I am the breath you take after death.

Come all,
We're witnessing the eclipse.
Come all,
It's happened once and for all.
Come all,
I am the ghost of town.`,
  },
  {
    title: "Circle of Love",
    year: "2022",
    theme: "Love · Celestial",
    lines: `You're the sun, and I am the moon,
Together we're the eclipse,
Casting shadows and mystery in our wake.

Together we watch them stare at our indescribable beauty,
Something they have never seen before,
Something so elusive,
Something so enshrouded in love.

You shine in my darkness,
A beacon in the void,
And we create a celestial dance,
Blinding everyone with our love.

A love that weaves through the night,
Binding us in a circle of eternal enchantment,
As we disappear into the abyss,
Leaving the world to wonder at our enigmatic union.`,
  },
  {
    title: "Invisible Thread",
    year: "2022",
    theme: "Friendship · Soul",
    lines: `As the Chinese proverb goes:
"An invisible red thread
connects those destined
to meet, despite the time,
the place, despite the
circumstances. The thread
can be tightened or tangled,
but never be broken."

I found mine, he's a tapestry of contradictions,
A jester with hidden sorrows,
A gentle hand that sometimes slips.
No matter who he is, I found him.

Through infernos, we marched together,
Drew the constellations of our lives,
Watched the cosmos unfold under night skies,
Shared laughter that echoed through time.

He was my guardian when I was young,
My light in darkness, my calm in storms,
Unwavering through every twilight.

And that's when I realized,
I am bound by an invisible thread,
not to another,
But to my own soul.`,
  },
  {
    title: "Land of God",
    year: "2023",
    theme: "Lebanon · Identity",
    lines: `The scriptures have mentioned your name,
Yet they still managed to steal that away.

Land of God,
Cedars so tall and resilient,
No storm can make you fall.

Land of God,
Begging on my knees, hands raised to the sky,
Stay strong and safe from these so-called criminals.
Let them be,
But don't let them in.

Land of God,
There's still hope for your branches, still intact,
Hopefully not divided
By these two-faced deceivers.

Land of God,
I am weary of calling out your name,
Just to check if you're still okay.

We will remain within you,
Even if we are apart from you.

Land of God,
We will return to reclaim you.`,
  },
  {
    title: "Oh Sea",
    year: "2022",
    theme: "Solitude · Peace",
    lines: `Oh sea, how calm you can be,
Oh sea, how loud you can be.

No one sees, how deep you can be,
No one feels, how cold you can be.

Oh sea, how much I see myself in you.
Oh sea, they all think I'm calm and clean,
They don't see the struggles I fear,
From drowning inside your deep blue waves.

I wonder, while I'm drowning,
Will I at least get goodbye waves?
Or will I merge into your waves and be forgotten?

Oh my sea, each night before I sleep,
I taste your salty water on my cheeks.

Oh my dear sea,
Thank you for never leaving me,
Thank you for letting me sleep,
Even in my sleepless nights.`,
  },
  {
    title: "In Another Life",
    year: "2022",
    theme: "Love · Loss",
    lines: `In another life,
Maybe our love would be alive.

In this life,
We never were in love,
But lived for its illusion,
Grasping at the hope of it.

We were actors,
Deceiving everyone with our charade,
So convincingly we deceived ourselves.

Now our memories gather dust on old shelves
In our abandoned house.

In another life,
I hope our act was no masquerade.
I hope our love was genuine,
Enduring the trials.

Maybe we'd be in Paris,
Dancing barefoot under the Eiffel Tower,
Our favorite playlist playing,
As the lights twinkle,
Mirroring our spark,
Like a Supernova.

But until then…
I remain here,
Living with the solace that we share the same sky,
Gazing at the same moon,
Wishing under the same stars.`,
  },
];

/* ─── Hooks ───────────────────────────────────────────── */
function makeObs(cb: () => void) {
  return new IntersectionObserver(([e]) => { if (e.isIntersecting) cb(); },
    { threshold: 0, rootMargin: "0px 0px -40px 0px" });
}
function useFade(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.opacity = "0"; el.style.transform = "translateY(16px)";
    el.style.transition = `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`;
    const obs = makeObs(() => {
      if (fired.current) return; fired.current = true;
      el.style.opacity = "1"; el.style.transform = "translateY(0)"; obs.unobserve(el);
    });
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
    const obs = makeObs(() => {
      if (fired.current) return; fired.current = true;
      (Array.from(c.children) as HTMLElement[]).forEach(el => { el.style.opacity = "1"; el.style.transform = "translateY(0)"; });
      obs.unobserve(c);
    });
    obs.observe(c); return () => obs.disconnect();
  }, [ms]);
  return ref;
}

/* ─── Page ────────────────────────────────────────────── */
export default function PoetPage() {
  const [heroIdx, setHeroIdx] = useState(0);
  const [heroVisible, setHeroVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [activePoem, setActivePoem] = useState(0);

  /* Hero line cycling */
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroVisible(false);
      setTimeout(() => { setHeroIdx(i => (i + 1) % HERO_LINES.length); setHeroVisible(true); }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 56);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  /* Section refs */
  const aboutHead = useFade(0);
  const aboutBody = useFade(100);
  const aboutQuote = useFade(180);
  const bookRef = useFade(0);
  const poemsHead = useFade(0);
  const gatewayRef = useStagger(120);
  const contactHead = useFade(0);
  const contactBody = useFade(100);

  const sec: React.CSSProperties = { padding: "88px clamp(24px, 8vw, 120px)" };
  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };
  const space: React.CSSProperties = { fontFamily: "var(--font-space)" };

  return (
    <div style={{ background: paper, color: ink, minHeight: "100vh", fontFamily: "var(--font-space)", overflowX: "hidden" }}>

      <style>{`
        @keyframes fadeSlide { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .poem-tab:hover { color: ${rust} !important; }
        .poem-tab.active { color: ${rust} !important; border-left-color: ${rust} !important; }
        .gateway-card:hover { border-color: ${rust} !important; }
        .gateway-card:hover .gw-arrow { transform: translateX(4px); color: ${rust}; }
        .gw-arrow { transition: transform 0.25s ease, color 0.25s ease; }
        .nav-link:hover { color: ${rust} !important; }
        .contact-link:hover { background: rgba(184,92,56,0.06) !important; border-color: rgba(184,92,56,0.35) !important; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 clamp(24px,6vw,80px)", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(244,241,236,0.94)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid ${border}` : "none",
        transition: "background 0.35s, border-color 0.35s",
      }}>
        <Link href="/" className="nav-link" style={{ ...mono, fontSize: 11, letterSpacing: "0.2em", color: dim, textDecoration: "none", transition: "color 0.2s" }}>← HOME</Link>
        <div style={{ display: "flex", gap: "clamp(18px,2.5vw,36px)" }}>
          {["about", "book", "poems", "contact"].map(id => (
            <button key={id} onClick={() => scrollTo(id)} className="nav-link" style={{
              background: "none", border: "none", cursor: "pointer",
              ...mono, fontSize: 10, letterSpacing: "0.2em", color: dim,
              textTransform: "uppercase", padding: "4px 0", transition: "color 0.2s",
            }}>{id}</button>
          ))}
        </div>
      </nav>

      {/* ══════════════════════════════════
          HERO — editorial scale
      ══════════════════════════════════ */}
      <section style={{
        height: "100vh", display: "flex", flexDirection: "column",
        justifyContent: "flex-end", padding: "0 clamp(24px,8vw,120px) clamp(48px,7vw,88px)",
        position: "relative", borderBottom: `1px solid ${border}`,
      }}>
        {/* top label */}
        <div style={{ ...mono, fontSize: 10, letterSpacing: "0.35em", color: rustDim, textTransform: "uppercase", position: "absolute", top: 80, left: "clamp(24px,8vw,120px)" }}>
          Portfolio · Writer
        </div>

        {/* Huge cycling poem line */}
        <div style={{
          fontWeight: 700, fontSize: "clamp(48px,9.5vw,136px)",
          lineHeight: 0.95, letterSpacing: "-0.03em",
          whiteSpace: "pre-line", color: ink,
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.45s ease, transform 0.45s ease",
          marginBottom: "clamp(28px,4vw,48px)",
          maxWidth: "85vw",
        }}>
          {HERO_LINES[heroIdx]}
        </div>

        {/* Name + meta */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: "clamp(15px,1.8vw,22px)", fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 4 }}>Elia Alghazal</div>
            <div style={{ ...mono, fontSize: 10, letterSpacing: "0.22em", color: dim, textTransform: "uppercase" }}>Whispers of the Eclipse — 2024</div>
          </div>
          <button onClick={() => scrollTo("poems")} style={{
            ...mono, fontSize: 11, letterSpacing: "0.2em",
            padding: "12px 28px", background: "transparent",
            border: `1px solid ${faint}`, color: dim,
            cursor: "pointer", textTransform: "uppercase",
            transition: "border-color 0.25s, color 0.25s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = rust; e.currentTarget.style.color = rust; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = faint; e.currentTarget.style.color = dim; }}
          >Read the poems ↓</button>
        </div>

        {/* Scroll hint */}
        <div style={{ ...mono, fontSize: 9, letterSpacing: "0.3em", color: faint, position: "absolute", bottom: 28, right: "clamp(24px,8vw,120px)", textTransform: "uppercase" }}>scroll ↓</div>
      </section>

      {/* ══════════════════════════════════
          ABOUT
      ══════════════════════════════════ */}
      <section id="about" style={{ ...sec, borderBottom: `1px solid ${border}` }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(48px,7vw,96px)", alignItems: "start" }}>
          <div>
            <div ref={aboutHead}>
              <div style={{ ...mono, fontSize: 10, letterSpacing: "0.3em", color: rustDim, marginBottom: 20, textTransform: "uppercase" }}>// About</div>
              <h2 style={{ fontWeight: 700, fontSize: "clamp(28px,4vw,52px)", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 32, color: ink }}>
                Writing was<br />never a choice.<br />
                <span style={{ color: rust }}>It was survival.</span>
              </h2>
            </div>
            <div ref={aboutBody}>
              <p style={{ fontSize: "clamp(13px,1.2vw,15px)", color: dim, lineHeight: 1.88, marginBottom: 18 }}>
                Writing has always been my sanctuary — a guiding light through the darkest times. Without it, I would never have found the happiness that now colors my world.
              </p>
              <p style={{ fontSize: "clamp(13px,1.2vw,15px)", color: dim, lineHeight: 1.88, marginBottom: 18 }}>
                <em>Whispers of the Eclipse</em> is born from the raw and unfiltered experiences of my life. A testament to the power of words to heal, to connect, and to transform. The poems within are infused with the emotions that shaped me — friendships, family, anger, sadness, and the tender moments of love.
              </p>
              <p style={{ fontSize: "clamp(13px,1.2vw,15px)", color: dim, lineHeight: 1.88 }}>
                I have always imagined my life as a sailing boat, bravely navigating the hazardous sea. Even when life gives you the worst waves — keep your boat afloat and sail away.
              </p>
            </div>
          </div>

          {/* Pull quote */}
          <div ref={aboutQuote} style={{ paddingTop: "clamp(0px,2vw,40px)" }}>
            <div style={{ borderLeft: `3px solid ${rust}`, paddingLeft: "clamp(20px,3vw,36px)", marginBottom: 40 }}>
              <p style={{ fontSize: "clamp(18px,2.2vw,28px)", fontWeight: 600, lineHeight: 1.5, letterSpacing: "-0.01em", color: ink, marginBottom: 16 }}>
                "I am someone's son,<br />someone's daughter,<br />I am the breath you take<br />after death."
              </p>
              <div style={{ ...mono, fontSize: 9, letterSpacing: "0.2em", color: rustDim }}>— The Ghost of Town</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
              {[
                ["Published", "2024 · Ukiyoto"],
                ["Poems", "27 pieces"],
                ["Written", "Ages 15–19"],
                ["Available", "Amazon UK"],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: "16px 14px", background: "rgba(28,24,20,0.03)", border: `1px solid ${border}` }}>
                  <div style={{ ...mono, fontSize: 9, letterSpacing: "0.18em", color: rustDim, marginBottom: 4, textTransform: "uppercase" }}>{k}</div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: ink }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          BOOK
      ══════════════════════════════════ */}
      <section id="book" style={{ ...sec, background: ink, borderBottom: `1px solid rgba(244,241,236,0.08)` }}>
        <div ref={bookRef} style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: "auto 1fr", gap: "clamp(32px,5vw,64px)", alignItems: "center" }}>

          {/* Typographic book cover — inverted */}
          <div style={{
            width: "clamp(130px,14vw,180px)", aspectRatio: "3/4",
            background: paper, color: ink,
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "20px 18px",
            boxShadow: "12px 12px 40px rgba(0,0,0,0.4)",
            flexShrink: 0, position: "relative",
          }}>
            <div style={{ ...mono, fontSize: 8, letterSpacing: "0.5em", color: rustDim, marginBottom: 14, textTransform: "uppercase" }}>Ukiyoto · 2024</div>
            <div style={{ borderTop: `1px solid ${faint}`, width: "100%", marginBottom: 14 }} />
            <div style={{ fontWeight: 700, fontSize: "clamp(10px,1.2vw,13px)", textAlign: "center", lineHeight: 1.35, marginBottom: 14, letterSpacing: "-0.01em" }}>
              WHISPERS<br />OF THE<br />ECLIPSE
            </div>
            <div style={{ borderBottom: `1px solid ${faint}`, width: "100%", marginBottom: 14 }} />
            <div style={{ fontSize: "clamp(8px,0.9vw,10px)", letterSpacing: "0.1em", color: dim, textAlign: "center" }}>Elia Alghazal</div>
            <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, textAlign: "center", ...mono, fontSize: 8, letterSpacing: "0.3em", color: rustDim }}>A · E · C · L</div>
          </div>

          {/* Book info — on dark bg */}
          <div style={{ color: paper }}>
            <div style={{ ...mono, fontSize: 10, letterSpacing: "0.3em", color: rustDim, marginBottom: 18, textTransform: "uppercase" }}>// The Book</div>
            <h2 style={{ fontWeight: 700, fontSize: "clamp(24px,3.5vw,44px)", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 20, color: paper }}>
              Whispers of<br /><span style={{ color: rust }}>the Eclipse</span>
            </h2>
            <p style={{ fontSize: "clamp(12px,1.2vw,14px)", color: "rgba(244,241,236,0.55)", lineHeight: 1.9, marginBottom: 20, maxWidth: 480 }}>
              A collection written across ages 15–19 — raw, unfiltered, and honest. Twenty-seven poems tracing love, loss, identity, resilience, and what it means to grow up in Lebanon.
            </p>
            <p style={{ fontSize: "clamp(12px,1.2vw,14px)", color: "rgba(244,241,236,0.55)", lineHeight: 1.9, marginBottom: 32, maxWidth: 480 }}>
              A Love, Loss, and Identity collection — published by Ukiyoto Publishing in 2024.
            </p>
            <a href="https://www.amazon.co.uk/Whispers-Eclipse-Elia-Ghazal/dp/9367950519"
              target="_blank" rel="noopener noreferrer" style={{
                ...mono, fontSize: 11, letterSpacing: "0.2em",
                padding: "13px 32px", background: rust, color: paper,
                textDecoration: "none", display: "inline-block", textTransform: "uppercase",
                transition: "opacity 0.25s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.82")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >Get it on Amazon ↗</a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          POEMS — interactive two-panel
      ══════════════════════════════════ */}
      <section id="poems" style={{ ...sec, borderBottom: `1px solid ${border}` }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div ref={poemsHead} style={{ marginBottom: 48 }}>
            <div style={{ ...mono, fontSize: 10, letterSpacing: "0.3em", color: rustDim, marginBottom: 16, textTransform: "uppercase" }}>// Poems</div>
            <h2 style={{ fontWeight: 700, fontSize: "clamp(28px,4vw,52px)", lineHeight: 1.1, letterSpacing: "-0.02em", color: ink }}>
              From the collection
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 2 }}>
            {/* Left rail — poem selector */}
            <div style={{ borderRight: `1px solid ${border}` }}>
              {POEMS.map((p, i) => (
                <button key={i} onClick={() => setActivePoem(i)}
                  className={`poem-tab${activePoem === i ? " active" : ""}`}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "14px 18px 14px 16px",
                    background: "none", border: "none", cursor: "pointer",
                    borderLeft: `2px solid ${activePoem === i ? rust : "transparent"}`,
                    transition: "border-color 0.2s, color 0.2s",
                  }}>
                  <div style={{ fontWeight: 600, fontSize: "clamp(12px,1.1vw,13px)", color: activePoem === i ? rust : ink, marginBottom: 3, lineHeight: 1.3 }}>{p.title}</div>
                  <div style={{ ...mono, fontSize: 9, letterSpacing: "0.15em", color: dim }}>{p.theme}</div>
                </button>
              ))}
            </div>

            {/* Right panel — poem display */}
            <div key={activePoem} style={{ padding: "0 0 0 clamp(24px,4vw,52px)", animation: "fadeSlide 0.35s ease both" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
                <h3 style={{ fontWeight: 700, fontSize: "clamp(18px,2.2vw,28px)", letterSpacing: "-0.01em", color: ink }}>{POEMS[activePoem].title}</h3>
                <span style={{ ...mono, fontSize: 9, letterSpacing: "0.2em", color: rustDim }}>{POEMS[activePoem].year} · {POEMS[activePoem].theme}</span>
              </div>
              <div style={{ fontSize: "clamp(13px,1.3vw,16px)", lineHeight: 2.1, whiteSpace: "pre-line", color: dim, maxWidth: 560 }}>
                {POEMS[activePoem].lines}
              </div>
              <div style={{ ...mono, fontSize: 9, letterSpacing: "0.2em", color: "rgba(28,24,20,0.22)", marginTop: 28 }}>— Whispers of the Eclipse, Elia Alghazal</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          GATEWAY — Blog + Gallery
      ══════════════════════════════════ */}
      <section style={{ ...sec, borderBottom: `1px solid ${border}` }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ ...mono, fontSize: 10, letterSpacing: "0.3em", color: rustDim, marginBottom: 48, textTransform: "uppercase" }}>// Explore More</div>
          <div ref={gatewayRef} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>

            {/* Journal */}
            <Link href="/poet/blog" className="gateway-card" style={{
              display: "block", textDecoration: "none",
              padding: "clamp(32px,5vw,56px)",
              border: `1px solid ${border}`,
              background: "transparent",
              transition: "border-color 0.3s",
            }}>
              <div style={{ ...mono, fontSize: 9, letterSpacing: "0.25em", color: rustDim, marginBottom: 20, textTransform: "uppercase" }}>01 · Journal</div>
              <h3 style={{ fontWeight: 700, fontSize: "clamp(22px,3vw,38px)", letterSpacing: "-0.02em", color: ink, lineHeight: 1.15, marginBottom: 16 }}>
                Writing &<br />Reflections
              </h3>
              <p style={{ fontSize: "clamp(12px,1.1vw,14px)", color: dim, lineHeight: 1.75, marginBottom: 28 }}>
                Essays on poetry, craft, survival, and the strange experience of being a builder who also writes.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ ...mono, fontSize: 10, letterSpacing: "0.18em", color: rust }}>ENTER JOURNAL</span>
                <span className="gw-arrow" style={{ color: rust, fontSize: 14 }}>→</span>
              </div>
            </Link>

            {/* Gallery */}
            <Link href="/poet/gallery" className="gateway-card" style={{
              display: "block", textDecoration: "none",
              padding: "clamp(32px,5vw,56px)",
              border: `1px solid ${border}`,
              background: "transparent",
              transition: "border-color 0.3s",
            }}>
              <div style={{ ...mono, fontSize: 9, letterSpacing: "0.25em", color: rustDim, marginBottom: 20, textTransform: "uppercase" }}>02 · Gallery</div>
              <h3 style={{ fontWeight: 700, fontSize: "clamp(22px,3vw,38px)", letterSpacing: "-0.02em", color: ink, lineHeight: 1.15, marginBottom: 16 }}>
                Visual<br />Fragments
              </h3>
              <p style={{ fontSize: "clamp(12px,1.1vw,14px)", color: dim, lineHeight: 1.75, marginBottom: 28 }}>
                Poem lines as visual objects — the atmosphere, imagery, and words that define the Eclipse.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ ...mono, fontSize: 10, letterSpacing: "0.18em", color: rust }}>ENTER GALLERY</span>
                <span className="gw-arrow" style={{ color: rust, fontSize: 14 }}>→</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          CONTACT
      ══════════════════════════════════ */}
      <section id="contact" style={{ ...sec }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div ref={contactHead}>
            <div style={{ ...mono, fontSize: 10, letterSpacing: "0.3em", color: rustDim, marginBottom: 20, textTransform: "uppercase" }}>// Contact</div>
            <h2 style={{ fontWeight: 700, fontSize: "clamp(32px,5.5vw,76px)", letterSpacing: "-0.03em", lineHeight: 1.0, marginBottom: 32, color: ink }}>
              Let's talk<br />about words.
            </h2>
          </div>
          <div ref={contactBody} style={{ display: "flex", gap: "clamp(40px,6vw,80px)", flexWrap: "wrap", alignItems: "flex-start" }}>
            <p style={{ fontSize: "clamp(13px,1.2vw,15px)", color: dim, lineHeight: 1.88, maxWidth: 380 }}>
              For collaborations, readings, writing commissions, or simply to say the poems meant something to you.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { label: "Email", href: "mailto:eliaghazal777@gmail.com" },
                { label: "Amazon UK", href: "https://www.amazon.co.uk/Whispers-Eclipse-Elia-Ghazal/dp/9367950519" },
                { label: "LinkedIn", href: "https://www.linkedin.com/in/eliaghazal/" },
              ].map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="contact-link"
                  style={{ ...mono, fontSize: 10, letterSpacing: "0.18em", padding: "12px 22px", background: "transparent", border: `1px solid ${border}`, color: dim, textDecoration: "none", transition: "background 0.25s, border-color 0.25s", textTransform: "uppercase" }}>
                  {l.label} ↗
                </a>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ borderTop: `1px solid ${border}`, marginTop: 64, paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ ...mono, fontSize: 10, letterSpacing: "0.15em", color: faint }}>ELIA ALGHAZAL © 2026</span>
            <div style={{ display: "flex", gap: 24 }}>
              <Link href="/engineer" style={{ ...mono, fontSize: 10, letterSpacing: "0.15em", color: faint, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = rust)}
                onMouseLeave={e => (e.currentTarget.style.color = faint)}
              >Engineer side →</Link>
              <Link href="/" style={{ ...mono, fontSize: 10, letterSpacing: "0.15em", color: faint, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = rust)}
                onMouseLeave={e => (e.currentTarget.style.color = faint)}
              >← Back to beginning</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
