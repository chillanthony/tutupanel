"use client";

import { useEffect, useState } from "react";

const COLORS = ["#10b981", "#f59e0b", "#ec4899", "#3b82f6", "#a855f7", "#ef4444"];

type Piece = { id: number; x: number; color: string; delay: number; rot: number };

export default function Confetti({ trigger }: { trigger: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!trigger) return;
    const items: Piece[] = Array.from({ length: 28 }, (_, i) => ({
      id: trigger * 1000 + i,
      x: Math.random() * 100,
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 250,
      rot: Math.random() * 360,
    }));
    setPieces(items);
    const t = setTimeout(() => setPieces([]), 1600);
    return () => clearTimeout(t);
  }, [trigger]);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-2 h-2 w-2 animate-confetti rounded-sm"
          style={{
            left: `${p.x}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}ms`,
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}
