import { NextRequest, NextResponse } from "next/server";
import { getSetting, setSetting } from "@/lib/db";

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get("Authorization") ?? "";
  return auth === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  try {
    const key = req.nextUrl.searchParams.get("key") ?? "currently_working_on";
    const value = await getSetting(key);
    return NextResponse.json({ key, value });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { key, value } = await req.json();
    if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
    await setSetting(key, value ?? "");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
