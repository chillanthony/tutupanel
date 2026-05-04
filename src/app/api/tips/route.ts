import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "tutu-admin";

type TipRow = { id: number; title: string; body_md: string; updated_at: number };

export async function GET() {
  const rows = db.prepare("SELECT id, title, body_md, updated_at FROM tips ORDER BY id ASC").all() as TipRow[];
  return NextResponse.json({
    tips: rows.map((r) => ({ id: r.id, title: r.title, body: r.body_md, updatedAt: r.updated_at })),
  });
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  if (token !== ADMIN_TOKEN) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid json" }, { status: 400 });

  const title = String(body.title ?? "").trim().slice(0, 200);
  const md = String(body.body ?? "").trim().slice(0, 20000);
  if (!title || !md) return NextResponse.json({ error: "title and body required" }, { status: 400 });

  if (body.id) {
    db.prepare("UPDATE tips SET title = ?, body_md = ?, updated_at = ? WHERE id = ?").run(
      title,
      md,
      Date.now(),
      Number(body.id),
    );
    return NextResponse.json({ ok: true, id: Number(body.id) });
  }

  const result = db
    .prepare("INSERT INTO tips (title, body_md, updated_at) VALUES (?, ?, ?)")
    .run(title, md, Date.now());
  return NextResponse.json({ ok: true, id: result.lastInsertRowid });
}

export async function DELETE(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  if (token !== ADMIN_TOKEN) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!Number.isInteger(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });
  db.prepare("DELETE FROM tips WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
