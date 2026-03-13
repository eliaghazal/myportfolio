/* ──────────────────────────────────────────────────────────────────
   Shared default data — used by engineer/poet pages (as fallbacks)
   and by the admin dashboard (as seed values when DB is empty).
────────────────────────────────────────────────────────────────── */

export interface FeaturedProject {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  period: string;
  accent: string;
  problem: string;
  solution: string;
  impact: string;
  tech: string[];
  link: string | null;
}

export interface OtherProject {
  title: string;
  desc: string;
  tech: string[];
  badge: string | null;
}

export interface Skill {
  cat: string;
  items: string[];
}

export interface Cert {
  name: string;
  issuer: string;
  date: string;
  detail: string;
  accent: string;
  link: string | null;
}

export interface Award {
  icon: string;
  title: string;
  body: string;
  detail: string;
}

export interface Stat {
  label: string;
  value: number;
  suffix: string;
  prefix: string;
}

export interface Poem {
  title: string;
  year: string;
  theme: string;
  lines: string;
}

/* ─── Engineer Page Defaults ──────────────────────────────────── */

export const DEFAULT_FEATURED: FeaturedProject[] = [
  { id:"crashlens",     title:"CrashLens",               subtitle:"IoT + AI + Real-Time Dashboards",  status:"ACTIVE",    period:"Nov 2025 – Present", accent:"#39ff14",
    problem:"Road accidents generate critical data — but it disappears before it reaches insurers, police, or EMTs.",
    solution:"End-to-end crash detection ecosystem. Edge hardware captures the moment of impact and packages video, GPS, and sensor data — routing it to role-based dashboards for every stakeholder in real time.",
    impact:"Serves insurance firms, fleet operators, traffic police, and first responders from a single unified pipeline.",
    tech:["Raspberry Pi","4G Module","IMU / GPS","Python","Computer Vision","React","Node.js"], link:null },
  { id:"mysterypersona",title:"MysteryPersona Deck",      subtitle:"Mystical E-Commerce Platform",     status:"LIVE",      period:"2024",               accent:"#a78bfa",
    problem:"Most e-commerce is purely transactional. Users click, buy, and leave. No experience. No identity.",
    solution:"Brand-driven platform where users purchase 'draws' — single, triple, or lifetime — to receive persona-style cards and a guided self-discovery journey. Commerce as storytelling.",
    impact:"Live at mysterypersona.me with full payment flow, tiered product logic, and strong brand identity throughout.",
    tech:["React","Stripe","Node.js","MongoDB","Figma"], link:"https://www.mysterypersona.me" },
  { id:"fakenews",      title:"Fake News Detector",       subtitle:"NLP + Transformer Pipeline",       status:"COMPLETED", period:"2025",               accent:"#f59e0b",
    problem:"Misinformation spreads exponentially faster than human fact-checkers can respond.",
    solution:"DistilBERT-based transformer pipeline classifying text as misleading or synthetic — with a practical UI for real-time testing and an ensemble approach for robustness.",
    impact:"Transformer-level accuracy on both fake news and deepfake text detection with a production-ready interface.",
    tech:["Python","DistilBERT","PyTorch","scikit-learn","Pandas","React"], link:null },
  { id:"student",       title:"Student Management System",subtitle:"🥇 1st Place — AUST Coding Expo",  status:"AWARD",     period:"2024",               accent:"#fbbf24",
    problem:"Academic institutions run on spreadsheets and fragmented manual records. Errors compound. Data is impossible to query.",
    solution:"Complete student administration platform: profiles, enrollment, academic records, role-based access, and intelligent search — built for reliability and clean UX from the ground up.",
    impact:"Earned the highest score at AUST's Coding Expo. Built for production-level data handling and real institutional use.",
    tech:["Java","Spring Boot","SQL","REST API","React"], link:null },
];

export const DEFAULT_OTHER_PROJECTS: OtherProject[] = [
  { title:"Automata Visualizer",       desc:"Interactive DFA/NFA builder with Hopcroft minimization — Theory of Computation capstone.", tech:["JavaScript","React","Algorithm Design"], badge:null },
  { title:"LU Decomposition Solver",   desc:"Step-by-step educational web tool for LU decomposition and linear system solving.",         tech:["JavaScript","Math.js","HTML/CSS"],      badge:null },
  { title:"System Security Suite",     desc:"Kerberos-style auth, RSA components, SQL injection demonstrations and mitigations.",         tech:["Python","Cryptography","SQL"],          badge:null },
  { title:"Library Management System", desc:"Full circulation: cataloging, availability, borrowing, returns, member management.",         tech:["Java","Spring Boot","SQL"],             badge:"🥈 2nd Place — Coding Expo" },
  { title:"This Portfolio",            desc:"Cinematic dual-world portfolio — code rain, handwriting animations, GSAP sequences.",        tech:["Next.js","TypeScript","GSAP","Canvas"], badge:null },
];

export const DEFAULT_SKILLS: Skill[] = [
  { cat:"Languages",      items:["Python","JavaScript","TypeScript","Java","Kotlin","C++","Swift","HTML / CSS"] },
  { cat:"AI / ML",        items:["PyTorch","DistilBERT","scikit-learn","Pandas","NumPy","Computer Vision","Deep Learning"] },
  { cat:"Backend",        items:["Spring Boot","REST API","Microservices","Hibernate","Node.js","JAX-RS","Maven"] },
  { cat:"Frontend",       items:["React","Next.js","Tailwind CSS","GSAP","Canvas API"] },
  { cat:"Mobile",         items:["Flutter","Kotlin Android","Swift iOS"] },
  { cat:"IoT / Hardware", items:["Raspberry Pi","4G Module","IMU / GPS","Edge AI","Camera Modules"] },
  { cat:"DevOps & Tools", items:["Git / GitHub","Docker","GitLab","Linux / UNIX","Jupyter"] },
  { cat:"Databases",      items:["SQL","MongoDB","PostgreSQL"] },
];

export const DEFAULT_CERTS: Cert[] = [
  { name:"TOEFL iBT",                           issuer:"ETS",                    date:"Sep 2025", detail:"Score: 99 / 120",                  accent:"#3b82f6", link:null },
  { name:"CCNA: Switching, Routing & Essentials",issuer:"Cisco",                 date:"Jan 2025", detail:"Routing, switching, VLANs, security", accent:"#39ff14", link:"https://www.credly.com/badges/baa3c3c1-e692-4972-8150-9782d6d2c903" },
  { name:"Introduction to Networks",             issuer:"Cisco",                  date:"Dec 2024", detail:"CCNA pathway — Networking Academy",  accent:"#39ff14", link:"https://www.credly.com/badges/baa3c3c1-e692-4972-8150-9782d6d2c903" },
  { name:"IT Essentials",                        issuer:"Cisco",                  date:"Feb 2024", detail:"Hardware, networking, troubleshooting",accent:"#39ff14", link:"https://www.credly.com/badges/e06d14d2-9f70-49a4-a39b-683052b2b93c" },
  { name:"IT Specialist — Python",               issuer:"Certiport / Pearson VUE",date:"Jan 2024", detail:"Python programming validation",       accent:"#f59e0b", link:null },
  { name:"ECPE — C2 Proficiency",                issuer:"University of Michigan", date:"Dec 2023", detail:"English at C2 expert level",           accent:"#a78bfa", link:null },
  { name:"DELF B2",                              issuer:"République française",   date:"Oct 2022", detail:"French at B2 independent level",       accent:"#60a5fa", link:null },
];

export const DEFAULT_AWARDS: Award[] = [
  { icon:"◆",  title:"Honor's List",            body:"AUST", detail:"Spring 2024 – 2025" },
  { icon:"🥇", title:"1st Place — Coding Expo",  body:"AUST", detail:"Student Management System · Highest Score" },
  { icon:"🥈", title:"2nd Place — Coding Expo",  body:"AUST", detail:"Library Management System" },
];

export const DEFAULT_STATS: Stat[] = [
  { label:"Certifications", value:7,    suffix:"",   prefix:"" },
  { label:"Projects Built", value:9,    suffix:"+",  prefix:"" },
  { label:"TOEFL Score",    value:99,   suffix:"/120",prefix:"" },
  { label:"Coding Expo",    value:1,    suffix:"st",  prefix:"#" },
];

/* ─── Poet Page Defaults ──────────────────────────────────────── */

export const DEFAULT_HERO_LINES: string[] = [
  "Come all,\nwe're witnessing\nthe eclipse.",
  "The sun tries\nher best\nbut never listens.",
  "I am bound\nby an invisible thread,\nnot to another,\nbut to my own soul.",
  "You're the sun,\nand I am the moon —\ntogether we're the eclipse.",
  "Land of God,\nwe will return\nto reclaim you.",
];

export const DEFAULT_POEMS: Poem[] = [
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
