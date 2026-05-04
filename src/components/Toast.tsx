"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type ToastType = "error" | "success" | "info";
type Toast = { id: number; type: ToastType; message: string };
type ToastCtx = { show: (message: string, type?: ToastType) => void };

const Ctx = createContext<ToastCtx | null>(null);

export function useToast() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useToast must be used inside <ToastProvider>");
  return c;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto animate-toast-in rounded-lg px-4 py-2 text-sm font-medium shadow-lg ${
              t.type === "error"
                ? "bg-red-600 text-white"
                : t.type === "success"
                  ? "bg-emerald-600 text-white"
                  : "bg-stone-800 text-white"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
