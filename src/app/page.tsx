"use client";

import { useEffect, useState } from "react";
import PostsTab from "@/components/PostsTab";
import FeedingTab from "@/components/FeedingTab";
import TipsTab from "@/components/TipsTab";

type TabKey = "posts" | "feeding" | "tips";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "posts", label: "留言板", icon: "💬" },
  { key: "feeding", label: "喂食打卡", icon: "🥕" },
  { key: "tips", label: "养兔须知", icon: "📋" },
];

export default function Home() {
  const [tab, setTab] = useState<TabKey>("posts");
  const [adminToken, setAdminToken] = useState("");
  const [adminOpen, setAdminOpen] = useState(false);
  const [draftToken, setDraftToken] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("tutupanel:adminToken") || "";
    setAdminToken(saved);
    setDraftToken(saved);
  }, []);

  function saveToken() {
    const t = draftToken.trim();
    if (t) localStorage.setItem("tutupanel:adminToken", t);
    else localStorage.removeItem("tutupanel:adminToken");
    setAdminToken(t);
    setAdminOpen(false);
  }

  function clearToken() {
    localStorage.removeItem("tutupanel:adminToken");
    setAdminToken("");
    setDraftToken("");
    setAdminOpen(false);
  }

  return (
    <div className="min-h-screen bg-amber-50/60 dark:bg-stone-950">
      <header className="border-b border-stone-200 bg-gradient-to-b from-orange-50 to-amber-50 dark:border-stone-800 dark:from-stone-900 dark:to-stone-950">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold text-stone-800 dark:text-stone-100">🐰 兔兔护理队</h1>
          <button
            onClick={() => setAdminOpen((v) => !v)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              adminToken
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
                : "border-stone-300 bg-white text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
            }`}
            title={adminToken ? "已登录管理员" : "管理员登录"}
          >
            🔑 {adminToken ? "管理员" : "管理员登录"}
          </button>
        </div>

        {adminOpen && (
          <div className="mx-auto max-w-3xl px-4 pb-3">
            <div className="flex flex-col gap-2 rounded border border-stone-200 bg-white p-3 text-sm dark:border-stone-800 dark:bg-stone-900 sm:flex-row">
              <input
                type="password"
                value={draftToken}
                onChange={(e) => setDraftToken(e.target.value)}
                placeholder="管理员口令"
                className="flex-1 rounded border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-800"
                onKeyDown={(e) => e.key === "Enter" && saveToken()}
              />
              <button
                onClick={saveToken}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
              >
                保存
              </button>
              {adminToken && (
                <button
                  onClick={clearToken}
                  className="rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  退出
                </button>
              )}
            </div>
          </div>
        )}

        <nav className="mx-auto hidden max-w-3xl gap-1 px-2 sm:flex">
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

      <main className="mx-auto max-w-3xl px-4 py-6 pb-24 sm:pb-6">
        {tab === "posts" && <PostsTab adminToken={adminToken} />}
        {tab === "feeding" && <FeedingTab />}
        {tab === "tips" && <TipsTab adminToken={adminToken} />}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur sm:hidden dark:border-stone-800 dark:bg-stone-900/95"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-3xl">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
                tab === t.key
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-stone-500 dark:text-stone-400"
              }`}
            >
              <span className="text-lg leading-none">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
