import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "warning" | "danger";

const TONES: Record<Tone, string> = {
  info: "border-info/30 bg-info-soft text-foreground",
  success: "border-success/30 bg-success-soft text-foreground",
  warning: "border-warning/30 bg-warning-soft text-foreground",
  danger: "border-danger/30 bg-danger-soft text-foreground",
};

const ICONS: Record<Tone, string> = {
  info: "ⓘ",
  success: "✓",
  warning: "⚠",
  danger: "✕",
};

export function Callout({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: Tone;
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : "note"}
      className={cn("flex gap-3 rounded-md border p-3.5 text-sm", TONES[tone], className)}
    >
      <span aria-hidden className="mt-px select-none font-semibold">
        {ICONS[tone]}
      </span>
      <div className="flex flex-col gap-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-muted [&_strong]:text-foreground">{children}</div>}
      </div>
    </div>
  );
}
