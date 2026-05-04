import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) return NextResponse.json({ error: "bad id" }, { status: 400 });
  db.prepare("DELETE FROM posts WHERE id = ?").run(numId);
  return NextResponse.json({ ok: true });
}
