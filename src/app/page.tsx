"use client";

import { useState } from "react";
import PostsTab from "@/components/PostsTab";
import FeedingTab from "@/components/FeedingTab";
import TipsTab from "@/components/TipsTab";

type TabKey = "posts" | "feeding" | "tips";

const TABS: { key: TabKey; label: string }[] = [
  { key: "posts", label: "留言板" },
  { key: "feeding", label: "喂食打卡" },
  { key: "tips", label: "养兔须知" },
];

export default function Home() {
  const [tab, setTab] = useState<TabKey>("posts");

  return (
    <div className="min-h-screen bg-amber-50/60 dark:bg-stone-950">
      <header className="border-b border-stone-200 bg-gradient-to-b from-orange-50 to-amber-50 dark:border-stone-800 dark:from-stone-900 dark:to-stone-950">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold text-stone-800 dark:text-stone-100">🐰 兔兔护理队</h1>
        </div>
        <nav className="mx-auto flex max-w-3xl gap-1 px-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300"
                  : "border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {tab === "posts" && <PostsTab />}
        {tab === "feeding" && <FeedingTab />}
        {tab === "tips" && <TipsTab />}
      </main>
    </div>
  );
}
