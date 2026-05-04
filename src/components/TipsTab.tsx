"use client";

import { useEffect, useState } from "react";
import { marked } from "marked";
import { TipSkeleton, EmptyState } from "./Skeleton";
import { useToast } from "./Toast";

type Tip = { id: number; title: string; body: string; updatedAt: number };

marked.setOptions({ breaks: true, gfm: true });

const ACCENTS = [
  { bar: "bg-emerald-400", tint: "bg-emerald-50 dark:bg-emerald-950/30" },
  { bar: "bg-amber-400", tint: "bg-amber-50 dark:bg-amber-950/30" },
  { bar: "bg-rose-400", tint: "bg-rose-50 dark:bg-rose-950/30" },
  { bar: "bg-sky-400", tint: "bg-sky-50 dark:bg-sky-950/30" },
  { bar: "bg-violet-400", tint: "bg-violet-50 dark:bg-violet-950/30" },
  { bar: "bg-orange-400", tint: "bg-orange-50 dark:bg-orange-950/30" },
];

function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function leadingEmoji(s: string): string | null {
  const m = s.match(/^\p{Extended_Pictographic}/u);
  return m ? m[0] : null;
}

function accentFor(title: string) {
  return ACCENTS[hashCode(title) % ACCENTS.length];
}

export default function TipsTab({ adminToken }: { adminToken: string }) {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const { show } = useToast();

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    try {
      const res = await fetch("/api/tips", { cache: "no-store" });
      const data = await res.json();
      setTips(data.tips ?? []);
    } finally {
      setLoading(false);
    }
  }

  function startNew() {
    setEditingId("new");
    setDraftTitle("");
    setDraftBody("");
  }

  function startEdit(tip: Tip) {
    setEditingId(tip.id);
    setDraftTitle(tip.title);
    setDraftBody(tip.body);
  }

  async function save() {
    if (!adminToken) return show("请先在右上角登录管理员", "error");
    const payload: { title: string; body: string; id?: number } = { title: draftTitle, body: draftBody };
    if (editingId !== "new" && editingId !== null) payload.id = editingId;
    const res = await fetch("/api/tips", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return show(data.error || "保存失败", "error");
    show("保存成功", "success");
    setEditingId(null);
    await load();
  }

  async function remove(id: number) {
    if (!adminToken) return;
    if (!confirm("删除这条须知？")) return;
    const res = await fetch(`/api/tips?id=${id}`, {
      method: "DELETE",
      headers: { "x-admin-token": adminToken },
    });
    if (!res.ok) {
      const data = await res.json();
      show(data.error || "删除失败", "error");
      return;
    }
    await load();
  }

  return (
    <div className="flex flex-col gap-6">
      {adminToken && (
        <div className="flex justify-end">
          <button
            onClick={startNew}
            className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm font-medium text-white dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            ＋ 新增须知
          </button>
        </div>
      )}

      {editingId !== null && (
        <div className="flex flex-col gap-2 rounded-lg border border-stone-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900">
          <input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="标题"
            className="w-full rounded border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-800"
          />
          <textarea
            value={draftBody}
            onChange={(e) => setDraftBody(e.target.value)}
            placeholder="内容支持 Markdown"
            rows={10}
            className="w-full rounded border border-stone-300 bg-white px-3 py-2 font-mono text-sm dark:border-stone-700 dark:bg-stone-800"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditingId(null)}
              className="rounded-full border border-stone-300 px-4 py-2 text-sm dark:border-stone-700"
            >
              取消
            </button>
            <button
              onClick={save}
              className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm font-medium text-white dark:bg-emerald-500 dark:hover:bg-emerald-600"
            >
              保存
            </button>
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {loading && (
          <>
            <TipSkeleton />
            <TipSkeleton />
          </>
        )}
        {!loading && tips.length === 0 && (
          <EmptyState emoji="📋" title="还没有须知" hint="右上角登录管理员后新增一条吧" />
        )}
        {!loading &&
          tips.map((t) => {
            const accent = accentFor(t.title);
            const emoji = leadingEmoji(t.title);
            return (
              <li
                key={t.id}
                className="flex overflow-hidden rounded-lg border border-stone-200 bg-white transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
              >
                <div className={`w-1.5 shrink-0 ${accent.bar}`} aria-hidden />
                <div className={`flex-1 p-4 ${accent.tint}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-base font-semibold">
                      {emoji && <span aria-hidden className="text-xl leading-none">{emoji}</span>}
                      <span>{emoji ? t.title.slice(emoji.length).trimStart() : t.title}</span>
                    </h3>
                    {adminToken && (
                      <div className="flex gap-2 text-xs">
                        <button onClick={() => startEdit(t)} className="text-stone-500 hover:text-stone-900 dark:hover:text-white">
                          编辑
                        </button>
                        <button onClick={() => remove(t.id)} className="text-stone-400 hover:text-red-500">
                          删除
                        </button>
                      </div>
                    )}
                  </div>
                  <article
                    className="prose prose-sm mt-3 max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: marked.parse(t.body) as string }}
                  />
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
