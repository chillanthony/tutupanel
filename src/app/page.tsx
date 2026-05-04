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
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold">🐰 兔兔护理队</h1>
        </div>
        <nav className="mx-auto flex max-w-3xl gap-1 px-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
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
