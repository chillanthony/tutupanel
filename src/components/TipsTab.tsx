"use client";

import { useEffect, useState } from "react";
import { marked } from "marked";

type Tip = { id: number; title: string; body: string; updatedAt: number };

marked.setOptions({ breaks: true, gfm: true });

export default function TipsTab({ adminToken }: { adminToken: string }) {
  const [tips, setTips] = useState<Tip[]>([]);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const res = await fetch("/api/tips", { cache: "no-store" });
    const data = await res.json();
    setTips(data.tips ?? []);
  }

  function startNew() {
    setEditingId("new");
    setDraftTitle("");
    setDraftBody("");
    setError(null);
  }

  function startEdit(tip: Tip) {
    setEditingId(tip.id);
    setDraftTitle(tip.title);
    setDraftBody(tip.body);
    setError(null);
  }

  async function save() {
    setError(null);
    if (!adminToken) return setError("请先在右上角登录管理员");
    const payload: { title: string; body: string; id?: number } = { title: draftTitle, body: draftBody };
    if (editingId !== "new" && editingId !== null) payload.id = editingId;
    const res = await fetch("/api/tips", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "保存失败");
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
      setError(data.error || "删除失败");
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
        <div className="flex flex-col gap-2 rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
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
          {error && <p className="text-sm text-red-600">{error}</p>}
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
        {tips.length === 0 && (
          <li className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500 dark:border-stone-700">
            还没有须知，右上角登录管理员后新增一条吧
          </li>
        )}
        {tips.map((t) => (
          <li key={t.id} className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">{t.title}</h3>
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
          </li>
        ))}
      </ul>
    </div>
  );
}
