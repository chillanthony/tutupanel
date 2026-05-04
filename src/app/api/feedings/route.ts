import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

type Slot = "morning" | "noon" | "evening";
const SLOTS: Slot[] = ["morning", "noon", "evening"];

type FeedingRow = {
  id: number;
  date: string;
  slot: Slot;
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

  let rows: FeedingRow[];
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    rows = db
      .prepare("SELECT id, date, slot, nickname, created_at FROM feedings WHERE date LIKE ? ORDER BY date, slot")
      .all(`${month}-%`) as FeedingRow[];
  } else {
    rows = db
      .prepare("SELECT id, date, slot, nickname, created_at FROM feedings WHERE date = ? ORDER BY slot")
      .all(todayLocal()) as FeedingRow[];
  }
  return NextResponse.json({ feedings: rows, today: todayLocal() });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid json" }, { status: 400 });

  const nickname = String(body.nickname ?? "").trim().slice(0, 32);
  const slot = String(body.slot ?? "") as Slot;
  if (!nickname) return NextResponse.json({ error: "nickname required" }, { status: 400 });
  if (!SLOTS.includes(slot)) return NextResponse.json({ error: "invalid slot" }, { status: 400 });

  const date = todayLocal();
  try {
    db.prepare("INSERT INTO feedings (date, slot, nickname, created_at) VALUES (?, ?, ?, ?)").run(
      date,
      slot,
      nickname,
      Date.now(),
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes("UNIQUE")) {
      return NextResponse.json({ error: "今日该时段已打卡" }, { status: 409 });
    }
    throw err;
  }
  return NextResponse.json({ ok: true, date, slot });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slot = searchParams.get("slot") as Slot | null;
  if (!slot || !SLOTS.includes(slot))
    return NextResponse.json({ error: "invalid slot" }, { status: 400 });
  db.prepare("DELETE FROM feedings WHERE date = ? AND slot = ?").run(todayLocal(), slot);
  return NextResponse.json({ ok: true });
}
