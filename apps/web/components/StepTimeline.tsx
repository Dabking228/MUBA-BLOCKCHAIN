import { cn } from "@/lib/utils";

export interface TimelineStep {
  key: string;
  label: string;
  detail?: string;
  state: "done" | "current" | "upcoming" | "skipped";
}

const DOT: Record<TimelineStep["state"], string> = {
  done: "bg-success border-success text-white",
  current: "bg-primary border-primary text-primary-foreground",
  upcoming: "bg-surface border-border-strong text-muted",
  skipped: "bg-surface-muted border-border text-muted",
};

export function StepTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  DOT[step.state],
                )}
              >
                {step.state === "done" ? "✓" : step.state === "skipped" ? "–" : i + 1}
              </span>
              {!last && (
                <span
                  className={cn(
                    "w-px flex-1 min-h-6",
                    step.state === "done" ? "bg-success" : "bg-border",
                  )}
                />
              )}
            </div>
            <div className={cn("pb-6", last && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-medium",
                  step.state === "upcoming" || step.state === "skipped"
                    ? "text-muted"
                    : "text-foreground",
                )}
              >
                {step.label}
              </p>
              {step.detail && <p className="mt-0.5 text-xs text-muted">{step.detail}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
