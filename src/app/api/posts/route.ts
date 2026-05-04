import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

type PostRow = {
  id: number;
  nickname: string;
  content: string;
  images: string;
  created_at: number;
};

export async function GET() {
  const rows = db
    .prepare("SELECT id, nickname, content, images, created_at FROM posts ORDER BY created_at DESC LIMIT 200")
    .all() as PostRow[];
  const posts = rows.map((r) => ({
    id: r.id,
    nickname: r.nickname,
    content: r.content,
    images: JSON.parse(r.images) as string[],
    createdAt: r.created_at,
  }));
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid json" }, { status: 400 });

  const nickname = String(body.nickname ?? "").trim().slice(0, 32);
  const content = String(body.content ?? "").trim().slice(0, 4000);
  const images = Array.isArray(body.images) ? body.images.filter((u: unknown) => typeof u === "string").slice(0, 9) : [];

  if (!nickname) return NextResponse.json({ error: "nickname required" }, { status: 400 });
  if (!content && images.length === 0)
    return NextResponse.json({ error: "content or image required" }, { status: 400 });

  const result = db
    .prepare("INSERT INTO posts (nickname, content, images, created_at) VALUES (?, ?, ?, ?)")
    .run(nickname, content, JSON.stringify(images), Date.now());

  return NextResponse.json({ id: result.lastInsertRowid });
}
