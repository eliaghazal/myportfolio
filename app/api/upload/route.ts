import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get("Authorization") ?? "";
  return auth === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const blob = await put(file.name, file, { access: "public" });
    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
