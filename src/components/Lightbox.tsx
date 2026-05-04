"use client";

import { useEffect } from "react";

export default function Lightbox({ src, onClose }: { src: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!src) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = prev;
    };
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/85 p-4"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-h-full max-w-full rounded shadow-2xl"
      />
      <button
        onClick={onClose}
        aria-label="关闭"
        className="absolute right-4 top-4 rounded-full bg-white/20 px-3 py-1 text-sm text-white backdrop-blur hover:bg-white/30"
      >
        ✕
      </button>
    </div>
  );
}
