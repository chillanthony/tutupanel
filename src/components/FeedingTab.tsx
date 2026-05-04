"use client";

import { useEffect, useMemo, useState } from "react";

type Slot = "morning" | "noon" | "evening";
type Feeding = { id: number; date: string; slot: Slot; nickname: string; created_at: number };

const SLOT_LABEL: Record<Slot, string> = { morning: "早", noon: "中", evening: "晚" };
const SLOTS: Slot[] = ["morning", "noon", "evening"];

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export default function FeedingTab() {
  const [today, setToday] = useState<string>("");
  const [todayFeedings, setTodayFeedings] = useState<Feeding[]>([]);
  const [monthFeedings, setMonthFeedings] = useState<Feeding[]>([]);
  const [nickname, setNickname] = useState("");
  const [cursor, setCursor] = useState(() => new Date());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("tutupanel:nickname");
    if (saved) setNickname(saved);
  }, []);

  useEffect(() => {
    void loadToday();
  }, []);

  useEffect(() => {
    void loadMonth(monthKey(cursor));
  }, [cursor]);

  async function loadToday() {
    const res = await fetch("/api/feedings", { cache: "no-store" });
    const data = await res.json();
    setToday(data.today);
    setTodayFeedings(data.feedings ?? []);
  }

  async function loadMonth(month: string) {
    const res = await fetch(`/api/feedings?month=${month}`, { cache: "no-store" });
    const data = await res.json();
    setMonthFeedings(data.feedings ?? []);
  }

  async function checkIn(slot: Slot) {
    setError(null);
    if (!nickname.trim()) return setError("请填写昵称");
    const res = await fetch("/api/feedings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: nickname.trim(), slot }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "打卡失败");
      return;
    }
    localStorage.setItem("tutupanel:nickname", nickname.trim());
    await Promise.all([loadToday(), loadMonth(monthKey(cursor))]);
  }

  async function undo(slot: Slot) {
    if (!confirm("撤销这次打卡？")) return;
    await fetch(`/api/feedings?slot=${slot}`, { method: "DELETE" });
    await Promise.all([loadToday(), loadMonth(monthKey(cursor))]);
  }

  const todayMap = useMemo(() => {
    const m = new Map<Slot, Feeding>();
    todayFeedings.forEach((f) => m.set(f.slot, f));
    return m;
  }, [todayFeedings]);

  const monthMap = useMemo(() => {
    const m = new Map<string, Feeding[]>();
    monthFeedings.forEach((f) => {
      const list = m.get(f.date) ?? [];
      list.push(f);
      m.set(f.date, list);
    });
    return m;
  }, [monthFeedings]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth() + 1;
  const total = daysInMonth(year, month);
  const firstWeekday = new Date(year, month - 1, 1).getDay();

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">今日打卡 · {today}</h2>
        </div>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="你的昵称"
          maxLength={32}
          className="mt-3 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
        <div className="mt-3 grid grid-cols-3 gap-2">
          {SLOTS.map((s) => {
            const done = todayMap.get(s);
            return (
              <div key={s} className="flex flex-col items-center gap-2 rounded border border-zinc-200 p-3 dark:border-zinc-800">
                <span className="text-xs text-zinc-500">{SLOT_LABEL[s]}</span>
                {done ? (
                  <>
                    <span className="text-lg">✅</span>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">{done.nickname}</span>
                    <button onClick={() => undo(s)} className="text-xs text-zinc-400 hover:text-red-500">
                      撤销
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => checkIn(s)}
                    className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-black"
                  >
                    打卡
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCursor(new Date(year, month - 2, 1))}
            className="rounded px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            ←
          </button>
          <h2 className="text-sm font-medium">
            {year} 年 {month} 月
          </h2>
          <button
            onClick={() => setCursor(new Date(year, month, 1))}
            className="rounded px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            →
          </button>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs">
          {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
            <div key={d} className="py-1 text-zinc-500">
              {d}
            </div>
          ))}
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {Array.from({ length: total }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const list = monthMap.get(dateStr) ?? [];
            const count = list.length;
            const tone =
              count === 0
                ? "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                : count < 3
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200"
                  : "bg-green-200 text-green-900 dark:bg-green-900/50 dark:text-green-200";
            const tooltip = list.map((f) => `${SLOT_LABEL[f.slot]}: ${f.nickname}`).join("\n") || "未打卡";
            return (
              <div
                key={dateStr}
                title={tooltip}
                className={`flex aspect-square flex-col items-center justify-center rounded text-xs ${tone}`}
              >
                <span>{day}</span>
                {count > 0 && <span className="text-[10px]">{count}/3</span>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
