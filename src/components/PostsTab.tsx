"use client";

import { useEffect, useRef, useState } from "react";
import Lightbox from "./Lightbox";
import { PostSkeleton, EmptyState } from "./Skeleton";
import { useToast } from "./Toast";

type Post = {
  id: number;
  nickname: string;
  content: string;
  images: string[];
  createdAt: number;
};

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString("zh-CN", { hour12: false });
}

export default function PostsTab({ adminToken }: { adminToken: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { show } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("tutupanel:nickname");
    if (saved) setNickname(saved);
    void load();
  }, []);

  async function load() {
    try {
      const res = await fetch("/api/posts", { cache: "no-store" });
      const data = await res.json();
      setPosts(data.posts ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim()) return show("请填写昵称", "error");
    if (!content.trim() && files.length === 0) return show("写点什么或贴张图", "error");

    setSubmitting(true);
    try {
      let imageUrls: string[] = [];
      if (files.length > 0) {
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        const upRes = await fetch("/api/upload", { method: "POST", body: fd });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.error || "上传失败");
        imageUrls = upData.urls;
      }
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nickname.trim(), content: content.trim(), images: imageUrls }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "发布失败");

      localStorage.setItem("tutupanel:nickname", nickname.trim());
      setContent("");
      setFiles([]);
      if (fileRef.current) fileRef.current.value = "";
      show("发布成功", "success");
      await load();
    } catch (err) {
      show(err instanceof Error ? err.message : "出错了", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: number) {
    if (!adminToken) return;
    if (!confirm("删除这条留言？")) return;
    const res = await fetch(`/api/posts/${id}`, {
      method: "DELETE",
      headers: { "x-admin-token": adminToken },
    });
    if (!res.ok) {
      show("删除失败：管理员口令无效", "error");
      return;
    }
    await load();
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={submit}
        className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
      >
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="你的昵称"
          maxLength={32}
          className="w-full rounded border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-800"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="说点什么吧～"
          rows={3}
          maxLength={4000}
          className="w-full rounded border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-800"
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 9))}
          className="text-sm"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            {submitting ? "发布中…" : "发布"}
          </button>
        </div>
      </form>

      <ul className="flex flex-col gap-3">
        {loading && (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        )}
        {!loading && posts.length === 0 && (
          <EmptyState emoji="🐰" title="还没人留言" hint="做第一个留下脚印的人吧～" />
        )}
        {!loading &&
          posts.map((p) => (
            <li
              key={p.id}
              className="rounded-lg border border-stone-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{p.nickname}</span>
                <span className="text-xs text-stone-500">{formatTime(p.createdAt)}</span>
              </div>
              {p.content && <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{p.content}</p>}
              {p.images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {p.images.map((src) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <button
                      key={src}
                      type="button"
                      onClick={() => setLightboxSrc(src)}
                      className="overflow-hidden rounded transition-transform hover:scale-[1.02]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="aspect-square w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              {adminToken && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => remove(p.id)}
                    className="text-xs text-stone-400 hover:text-red-500"
                  >
                    删除
                  </button>
                </div>
              )}
            </li>
          ))}
      </ul>

      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </div>
  );
}
