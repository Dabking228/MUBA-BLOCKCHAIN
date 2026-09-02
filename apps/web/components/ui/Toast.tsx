"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "warning" | "danger";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: Tone;
}

interface ToastInput {
  title: string;
  description?: string;
  tone?: Tone;
  duration?: number;
}

const ToastContext = React.createContext<((t: ToastInput) => void) | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

const TONE_STYLES: Record<Tone, string> = {
  info: "border-info/40 bg-surface",
  success: "border-success/40 bg-surface",
  warning: "border-warning/40 bg-surface",
  danger: "border-danger/40 bg-surface",
};

const TONE_BAR: Record<Tone, string> = {
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const idRef = React.useRef(0);

  const push = React.useCallback((input: ToastInput) => {
    const id = ++idRef.current;
    const item: ToastItem = {
      id,
      title: input.title,
      description: input.description,
      tone: input.tone ?? "info",
    };
    setItems((prev) => [...prev, item]);
    const duration = input.duration ?? (item.tone === "danger" ? 7000 : 4500);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex w-full max-w-sm overflow-hidden rounded-lg border shadow-lg",
              TONE_STYLES[t.tone],
            )}
          >
            <span className={cn("w-1 shrink-0", TONE_BAR[t.tone])} />
            <div className="flex flex-1 items-start gap-3 p-3.5">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-sm text-muted break-words">{t.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
                className="text-muted transition-colors hover:text-foreground"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
