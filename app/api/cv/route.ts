import { NextRequest, NextResponse } from "next/server";
import { getSetting, setSetting } from "@/lib/db";
import { put } from "@vercel/blob";

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get("Authorization") ?? "";
  return auth === process.env.ADMIN_PASSWORD;
}

export async function GET() {
  try {
    const cvUrl = await getSetting("cv_url");
    if (!cvUrl) {
      return NextResponse.json({ error: "No CV uploaded yet" }, { status: 404 });
    }
    // Validate that cvUrl is an absolute URL before redirecting
    try {
      new URL(cvUrl);
    } catch {
      return NextResponse.json({ error: "Invalid CV URL stored" }, { status: 500 });
    }
    return NextResponse.redirect(cvUrl);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const blob = await put(`cv/${(file as File).name}`, file as File, { access: "public" });
    await setSetting("cv_url", blob.url);
    return NextResponse.json({ ok: true, url: blob.url });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
