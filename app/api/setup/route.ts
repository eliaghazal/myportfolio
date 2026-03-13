import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id         TEXT PRIMARY KEY,
        title      TEXT NOT NULL,
        date       TEXT NOT NULL,
        tag        TEXT NOT NULL DEFAULT '',
        excerpt    TEXT NOT NULL DEFAULT '',
        content    TEXT NOT NULL DEFAULT '',
        read_time  TEXT NOT NULL DEFAULT '',
        published  BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS gallery_items (
        id         TEXT PRIMARY KEY,
        type       TEXT NOT NULL CHECK (type IN ('image', 'quote')),
        text       TEXT,
        poem       TEXT,
        image_url  TEXT,
        caption    TEXT,
        rotation   REAL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS lab_experiments (
        id          TEXT PRIMARY KEY,
        title       TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        category    TEXT NOT NULL DEFAULT '',
        tech        TEXT NOT NULL DEFAULT '[]',
        github_url  TEXT,
        demo_type   TEXT,
        status      TEXT NOT NULL DEFAULT 'CONCEPT',
        accent_color TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS admin_settings (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL DEFAULT ''
      )
    `;

    return NextResponse.json({ ok: true, message: "Database tables created successfully." });
  } catch (err) {
    console.error("Setup error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
