import { sql } from "@vercel/postgres";

export { sql };

/* ─── Posts ─────────────────────────────────────────────────── */

export interface Post {
  id: string;
  title: string;
  date: string;
  tag: string;
  excerpt: string;
  content: string;
  read_time: string;
  published: boolean;
  category?: string;
  created_at?: string;
}

export async function getPosts(all = false, category?: string): Promise<Post[]> {
  if (all) {
    if (category) {
      const { rows } = await sql`SELECT * FROM posts WHERE category = ${category} ORDER BY created_at DESC`;
      return rows as Post[];
    }
    const { rows } = await sql`SELECT * FROM posts ORDER BY created_at DESC`;
    return rows as Post[];
  }
  if (category) {
    const { rows } = await sql`SELECT * FROM posts WHERE published = true AND category = ${category} ORDER BY created_at DESC`;
    return rows as Post[];
  }
  const { rows } = await sql`SELECT * FROM posts WHERE published = true ORDER BY created_at DESC`;
  return rows as Post[];
}

export async function createPost(post: Omit<Post, "created_at">): Promise<Post> {
  const { rows } = await sql`
    INSERT INTO posts (id, title, date, tag, excerpt, content, read_time, published, category)
    VALUES (${post.id}, ${post.title}, ${post.date}, ${post.tag}, ${post.excerpt}, ${post.content}, ${post.read_time}, ${post.published}, ${post.category ?? "blog"})
    RETURNING *
  `;
  return rows[0] as Post;
}

export async function updatePost(id: string, post: Partial<Post>): Promise<Post> {
  const { rows } = await sql`
    UPDATE posts SET
      title     = COALESCE(${post.title ?? null}, title),
      date      = COALESCE(${post.date ?? null}, date),
      tag       = COALESCE(${post.tag ?? null}, tag),
      excerpt   = COALESCE(${post.excerpt ?? null}, excerpt),
      content   = COALESCE(${post.content ?? null}, content),
      read_time = COALESCE(${post.read_time ?? null}, read_time),
      published = COALESCE(${post.published ?? null}, published),
      category  = COALESCE(${post.category ?? null}, category)
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] as Post;
}

export async function deletePost(id: string): Promise<void> {
  await sql`DELETE FROM posts WHERE id = ${id}`;
}

/* ─── Gallery ───────────────────────────────────────────────── */

export interface GalleryItem {
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
  created_at?: string;
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const { rows } = await sql`SELECT * FROM gallery_items ORDER BY created_at DESC`;
  return rows as GalleryItem[];
}

export async function createGalleryItem(item: Omit<GalleryItem, "created_at">): Promise<GalleryItem> {
  const { rows } = await sql`
    INSERT INTO gallery_items (id, type, text, poem, image_url, video_url, thumbnail_url, caption, rotation, aspect_ratio)
    VALUES (${item.id}, ${item.type}, ${item.text ?? null}, ${item.poem ?? null}, ${item.image_url ?? null}, ${item.video_url ?? null}, ${item.thumbnail_url ?? null}, ${item.caption ?? null}, ${item.rotation ?? null}, ${item.aspect_ratio ?? "1:1"})
    RETURNING *
  `;
  return rows[0] as GalleryItem;
}

export async function deleteGalleryItem(id: string): Promise<void> {
  await sql`DELETE FROM gallery_items WHERE id = ${id}`;
}

/* ─── Lab Experiments ───────────────────────────────────────── */

export interface LabExperiment {
  id: string;
  title: string;
  description: string;
  category: string;
  tech: string;        // stored as JSON string
  github_url?: string;
  demo_type?: string;
  status: string;
  accent_color?: string;
  created_at?: string;
}

export async function getLabExperiments(): Promise<LabExperiment[]> {
  const { rows } = await sql`SELECT * FROM lab_experiments ORDER BY created_at DESC`;
  return rows as LabExperiment[];
}

export async function createLabExperiment(exp: Omit<LabExperiment, "created_at">): Promise<LabExperiment> {
  const { rows } = await sql`
    INSERT INTO lab_experiments (id, title, description, category, tech, github_url, demo_type, status, accent_color)
    VALUES (${exp.id}, ${exp.title}, ${exp.description}, ${exp.category}, ${exp.tech}, ${exp.github_url ?? null}, ${exp.demo_type ?? null}, ${exp.status}, ${exp.accent_color ?? null})
    RETURNING *
  `;
  return rows[0] as LabExperiment;
}

export async function updateLabExperiment(id: string, exp: Partial<LabExperiment>): Promise<LabExperiment> {
  const { rows } = await sql`
    UPDATE lab_experiments SET
      title       = COALESCE(${exp.title ?? null}, title),
      description = COALESCE(${exp.description ?? null}, description),
      category    = COALESCE(${exp.category ?? null}, category),
      tech        = COALESCE(${exp.tech ?? null}, tech),
      github_url  = COALESCE(${exp.github_url ?? null}, github_url),
      demo_type   = COALESCE(${exp.demo_type ?? null}, demo_type),
      status      = COALESCE(${exp.status ?? null}, status),
      accent_color = COALESCE(${exp.accent_color ?? null}, accent_color)
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] as LabExperiment;
}

export async function deleteLabExperiment(id: string): Promise<void> {
  await sql`DELETE FROM lab_experiments WHERE id = ${id}`;
}

/* ─── Admin Settings ────────────────────────────────────────── */

export async function getSetting(key: string): Promise<string | null> {
  const { rows } = await sql`SELECT value FROM admin_settings WHERE key = ${key}`;
  return rows[0]?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await sql`
    INSERT INTO admin_settings (key, value) VALUES (${key}, ${value})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `;
}
