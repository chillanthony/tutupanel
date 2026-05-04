import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

type FeedingRow = {
  id: number;
  date: string;
  nickname: string;
  created_at: number;
};

function todayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const today = todayLocal();

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const rows = db
      .prepare("SELECT id, date, nickname, created_at FROM feedings WHERE date LIKE ? ORDER BY date")
      .all(`${month}-%`) as FeedingRow[];
    return NextResponse.json({ feedings: rows, today });
  }

  const todayRow = db
    .prepare("SELECT id, date, nickname, created_at FROM feedings WHERE date = ?")
    .get(today) as FeedingRow | undefined;
  return NextResponse.json({ feeding: todayRow ?? null, today });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid json" }, { status: 400 });

  const nickname = String(body.nickname ?? "").trim().slice(0, 32);
  if (!nickname) return NextResponse.json({ error: "nickname required" }, { status: 400 });

  const date = todayLocal();
  try {
    db.prepare("INSERT INTO feedings (date, nickname, created_at) VALUES (?, ?, ?)").run(
      date,
      nickname,
      Date.now(),
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes("UNIQUE")) {
      return NextResponse.json({ error: "今日已有人打过卡" }, { status: 409 });
    }
    throw err;
  }
  return NextResponse.json({ ok: true, date });
}

export async function DELETE() {
  db.prepare("DELETE FROM feedings WHERE date = ?").run(todayLocal());
  return NextResponse.json({ ok: true });
}
