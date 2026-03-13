import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get("Authorization") ?? "";
  return auth === process.env.ADMIN_PASSWORD;
}

/* ── Seed data ── */

const SEED_POSTS = [
  {
    id: "001",
    title: "Writing as Sanctuary",
    date: "Winter 2024",
    tag: "Essay",
    excerpt: "Writing has always been my sanctuary — a guiding light through the darkest times. Without it, I would never have found the happiness that now colors my world. This is what I wrote in the introduction of the book. I meant every word.",
    content: `Writing has always been my sanctuary — a guiding light through the darkest times. Without it, I would never have found the happiness that now colors my world.

This is what I wrote in the introduction of Whispers of the Eclipse. I meant every word. Still do.

I started writing seriously at fifteen. Not because I was talented — I didn't know if I was. I started because I had nowhere else to put what I was feeling. My town in Lebanon was small. The people around me were kind, mostly. But there was no space, not really, for the kind of interior noise I carried.

So I wrote. I wrote about the friends who left without explanation. About the nights I counted the ceiling tiles instead of sleeping. About the strange pride of surviving things that weren't supposed to be survived.

What surprised me was that writing didn't just record pain — it transformed it. Something in the act of finding words for a feeling makes the feeling smaller. Not gone. Smaller. Holdable.

I think this is why I can't stop. Not the poems, not the notes I scrawl at 2am, not this. The page is the one place where everything I've been through becomes material rather than weight.

If you've read the collection, you've already seen the most honest version of me. Fifteen to nineteen years old, trying to make sense of things I had no framework for. I didn't clean it up. I'm glad I didn't.

Write. Even when it hurts. Especially when it hurts.`,
    read_time: "4 min",
    published: true,
  },
  {
    id: "002",
    title: "On the Eclipse as Symbol",
    date: "Autumn 2024",
    tag: "Reflection",
    excerpt: "The eclipse doesn't mean darkness wins. It means light and shadow agree, for a moment, to share the same sky. That's what the collection is really about — not the absence of light, but what we learn to do inside its absence.",
    content: `The eclipse doesn't mean darkness wins. It means light and shadow agree, for a moment, to share the same sky.

That's what I kept returning to when I was choosing a title for the collection. Not an eclipse as catastrophe. Not an eclipse as the end of something. An eclipse as the most honest moment — the moment when two opposing forces stop pretending the other doesn't exist.

A lot of the poems in Whispers of the Eclipse were written during periods where I felt covered over. Not destroyed. Covered. There's a difference. The sun doesn't die during an eclipse. It's still there, burning exactly as it was before. It just can't reach you directly for a while.

I think that's a more accurate description of what depression, grief, and loneliness actually feel like than the language we usually use. We say darkness. We say loss. But what I kept experiencing was more like being in the shadow of something — still present, still myself, just temporarily unreachable.

The poem "Circle of Love" gets at this most directly: *You're the sun, and I am the moon — together we're the eclipse.* There's no villain there. No hero. Just two things that, when they align a certain way, create something other people stop and stare at.

I want the collection to be read that way. Not as a document of suffering, but as a document of co-existence — light and shadow, engineer and poet, Lebanese and world-facing, broken and building.

Come all. We're witnessing the eclipse.`,
    read_time: "6 min",
    published: true,
  },
  {
    id: "003",
    title: "Why I Write in Images, Not Explanations",
    date: "Summer 2024",
    tag: "Craft",
    excerpt: "The first rule I learned: don't explain the emotion. Show the room where it happened. Show the thing on the table. Let the reader bring their own weight to it.",
    content: "",
    read_time: "5 min",
    published: false,
  },
  {
    id: "004",
    title: "Being Lebanese and Writing It",
    date: "Spring 2024",
    tag: "Personal",
    excerpt: '"Land of God" was the hardest poem in the collection to finish. Not because of the words — but because every time I thought I had written its ending, something happened that made the ending wrong again.',
    content: "",
    read_time: "8 min",
    published: false,
  },
  {
    id: "005",
    title: "The Engineer and the Poet Are the Same Person",
    date: "Winter 2023",
    tag: "Essay",
    excerpt: "People find it strange. Code and poetry. Logic and feeling. But I think they're more similar than anyone admits — both are systems for making the invisible visible.",
    content: "",
    read_time: "7 min",
    published: false,
  },
];

const SEED_GALLERY = [
  { id: "g1", type: "quote", text: "The eclipse doesn't steal the sun. It only proves that something brilliant can survive being covered.", poem: "Whispers of the Eclipse", rotation: -2.1 },
  { id: "g2", type: "quote", text: "Write. Even when it hurts. Especially when it hurts.", poem: "Personal note", rotation: 1.8 },
  { id: "g3", type: "quote", text: "I have always imagined my life as a sailing boat, bravely navigating the hazardous sea.", poem: "Introduction", rotation: -1.2 },
  { id: "g4", type: "quote", text: "My heart, the believer, wanted it so badly that reality was excommunicated.", poem: "When Will I Learn?", rotation: 2.5 },
  { id: "g5", type: "quote", text: "She never lost her trust.", poem: "Rosalyn", rotation: -0.8 },
  { id: "g6", type: "quote", text: "Land of God — cedars so tall and resilient, no storm can make you fall.", poem: "Land of God", rotation: 1.4 },
];

const SEED_EXPERIMENTS = [
  {
    id: "sorting",
    title: "Sorting Algorithm Visualizer",
    description: "Real-time array sorting visualizer. Watch Bubble Sort, Quick Sort, and Merge Sort race each other — bars animate as comparisons and swaps happen. Adjustable speed and size.",
    category: "Algorithms",
    tech: '["TypeScript", "Canvas API", "Algorithm Design"]',
    status: "LIVE",
    accent_color: "#f59e0b",
  },
];

/* ── Core seeding logic (also imported by /api/setup) ── */
export async function runSeed(): Promise<{ posts: number; gallery: number; experiments: number }> {
  let seededPosts = 0;
  let seededGallery = 0;
  let seededExperiments = 0;

  for (const post of SEED_POSTS) {
    const { rows } = await sql`SELECT id FROM posts WHERE id = ${post.id}`;
    if (rows.length === 0) {
      await sql`
        INSERT INTO posts (id, title, date, tag, excerpt, content, read_time, published)
        VALUES (${post.id}, ${post.title}, ${post.date}, ${post.tag}, ${post.excerpt}, ${post.content}, ${post.read_time}, ${post.published})
      `;
      seededPosts++;
    }
  }

  for (const item of SEED_GALLERY) {
    const { rows } = await sql`SELECT id FROM gallery_items WHERE id = ${item.id}`;
    if (rows.length === 0) {
      await sql`
        INSERT INTO gallery_items (id, type, text, poem, rotation)
        VALUES (${item.id}, ${item.type}, ${item.text}, ${item.poem}, ${item.rotation})
      `;
      seededGallery++;
    }
  }

  for (const exp of SEED_EXPERIMENTS) {
    const { rows } = await sql`SELECT id FROM lab_experiments WHERE id = ${exp.id}`;
    if (rows.length === 0) {
      await sql`
        INSERT INTO lab_experiments (id, title, description, category, tech, status, accent_color)
        VALUES (${exp.id}, ${exp.title}, ${exp.description}, ${exp.category}, ${exp.tech}, ${exp.status}, ${exp.accent_color})
      `;
      seededExperiments++;
    }
  }

  return { posts: seededPosts, gallery: seededGallery, experiments: seededExperiments };
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await runSeed();
    return NextResponse.json({
      ok: true,
      message: `Seeded ${result.posts} posts, ${result.gallery} gallery items, ${result.experiments} experiments.`,
      ...result,
    });
  } catch (err) {
    console.error("Seed error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
