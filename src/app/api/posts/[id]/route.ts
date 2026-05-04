import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "tutu-admin";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (req.headers.get("x-admin-token") !== ADMIN_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) return NextResponse.json({ error: "bad id" }, { status: 400 });
  db.prepare("DELETE FROM posts WHERE id = ?").run(numId);
  return NextResponse.json({ ok: true });
}
