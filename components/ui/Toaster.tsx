"use client";

import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

// Fire a toast from anywhere (client-side) without threading context through props.
export function toast(message: string, type: ToastType = "success") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app-toast", { detail: { message, type } }));
  }
}

const COLORS: Record<ToastType, { bg: string; fg: string; border: string }> = {
  success: { bg: "var(--success-bg)", fg: "var(--success)", border: "var(--success)" },
  error: { bg: "var(--error-bg)", fg: "var(--error)", border: "var(--error)" },
  info: { bg: "var(--info-bg)", fg: "var(--info)", border: "var(--info)" },
};

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    let counter = 0;
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent).detail as { message: string; type?: ToastType };
      const id = ++counter;
      setToasts((prev) => [...prev, { id, message: detail.message, type: detail.type ?? "success" }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
    };
    window.addEventListener("app-toast", onToast);
    return () => window.removeEventListener("app-toast", onToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" style={{ maxWidth: "22rem" }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="rounded-lg px-4 py-3 text-sm shadow-md animate-in"
          style={{
            backgroundColor: COLORS[t.type].bg,
            color: COLORS[t.type].fg,
            border: `1px solid ${COLORS[t.type].border}`,
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
