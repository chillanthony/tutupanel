"use client";

import { useEffect, useMemo, useState } from "react";
import Confetti from "./Confetti";
import { useToast } from "./Toast";

type Feeding = { id: number; date: string; nickname: string; created_at: number };

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export default function FeedingTab() {
  const [today, setToday] = useState<string>("");
  const [todayFeeding, setTodayFeeding] = useState<Feeding | null>(null);
  const [monthFeedings, setMonthFeedings] = useState<Feeding[]>([]);
  const [nickname, setNickname] = useState("");
  const [cursor, setCursor] = useState(() => new Date());
  const [submitting, setSubmitting] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const { show } = useToast();

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
    setTodayFeeding(data.feeding ?? null);
  }

  async function loadMonth(month: string) {
    const res = await fetch(`/api/feedings?month=${month}`, { cache: "no-store" });
    const data = await res.json();
    setMonthFeedings(data.feedings ?? []);
  }

  async function checkIn() {
    if (!nickname.trim()) return show("请填写昵称", "error");
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nickname.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        show(data.error || "打卡失败", "error");
        return;
      }
      localStorage.setItem("tutupanel:nickname", nickname.trim());
      setConfettiKey((k) => k + 1);
      show("打卡成功 🐰", "success");
      await Promise.all([loadToday(), loadMonth(monthKey(cursor))]);
    } finally {
      setSubmitting(false);
    }
  }

  async function undo() {
    if (!confirm("撤销今日打卡？")) return;
    await fetch("/api/feedings", { method: "DELETE" });
    await Promise.all([loadToday(), loadMonth(monthKey(cursor))]);
  }

  const monthMap = useMemo(() => {
    const m = new Map<string, Feeding>();
    monthFeedings.forEach((f) => m.set(f.date, f));
    return m;
  }, [monthFeedings]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth() + 1;
  const total = daysInMonth(year, month);
  const firstWeekday = new Date(year, month - 1, 1).getDay();

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-lg border border-stone-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900">
        <Confetti trigger={confettiKey} />
        <h2 className="text-sm font-medium">今日打卡 · {today}</h2>

        {todayFeeding ? (
          <div className="mt-4 flex flex-col items-center gap-2 rounded border border-green-200 bg-green-50 py-6 dark:border-green-900/50 dark:bg-green-900/20">
            <span key={confettiKey} className="animate-pop text-3xl">✅</span>
            <p className="text-sm">
              今天 <span className="font-semibold">{todayFeeding.nickname}</span> 已经喂过啦
            </p>
            <p className="text-xs text-stone-500">{formatTime(todayFeeding.created_at)}</p>
            <button
              onClick={undo}
              className="mt-2 text-xs text-stone-400 hover:text-red-500"
            >
              撤销打卡
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center gap-3 rounded border border-dashed border-stone-300 py-6 dark:border-stone-700">
            <p className="text-sm text-stone-500">今天还没人喂～</p>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="你的昵称"
              maxLength={32}
              className="w-48 rounded border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-800"
            />
            <button
              onClick={checkIn}
              disabled={submitting}
              className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-6 py-2 text-sm font-medium text-white transition-transform hover:scale-105 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
            >
              {submitting ? "打卡中…" : "我喂啦 🐰"}
            </button>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCursor(new Date(year, month - 2, 1))}
            className="rounded px-2 py-1 text-sm hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            ←
          </button>
          <h2 className="text-sm font-medium">
            {year} 年 {month} 月
          </h2>
          <button
            onClick={() => setCursor(new Date(year, month, 1))}
            className="rounded px-2 py-1 text-sm hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            →
          </button>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs">
          {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
            <div key={d} className="py-1 text-stone-500">
              {d}
            </div>
          ))}
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {Array.from({ length: total }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const f = monthMap.get(dateStr);
            const tone = f
              ? "bg-green-200 text-green-900 dark:bg-green-900/50 dark:text-green-200"
              : "bg-stone-100 text-stone-400 dark:bg-stone-800";
            const tooltip = f ? `${dateStr} · ${f.nickname}` : `${dateStr} · 未打卡`;
            return (
              <div
                key={dateStr}
                title={tooltip}
                className={`flex aspect-square flex-col items-center justify-center rounded text-xs ${tone}`}
              >
                <span>{day}</span>
                {f && <span className="text-[10px] truncate max-w-full px-1">{f.nickname.slice(0, 3)}</span>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
