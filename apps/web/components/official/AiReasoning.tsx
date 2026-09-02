import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { AddressPill } from "@/components/AddressPill";
import type { AiRecommendation } from "@/lib/types";

const REC_TONE: Record<AiRecommendation["recommendation"], BadgeTone> = {
  approve: "success",
  reject: "danger",
  needs_review: "warning",
};

const REC_LABEL: Record<AiRecommendation["recommendation"], string> = {
  approve: "Recommends approve",
  reject: "Recommends reject",
  needs_review: "Needs human review",
};

export function AiReasoning({ rec }: { rec: AiRecommendation }) {
  const confidencePct = Math.round((rec.confidence ?? 0) * 100);
  return (
    <div className="flex flex-col gap-2 rounded-md border border-info/30 bg-info-soft p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-info">GonkaRouter</span>
          <Badge tone={REC_TONE[rec.recommendation]}>{REC_LABEL[rec.recommendation]}</Badge>
        </div>
        <span className="text-xs text-muted">confidence {confidencePct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
        <div className="h-full rounded-full bg-info" style={{ width: `${confidencePct}%` }} />
      </div>
      <p className="text-sm text-foreground">{rec.reasoning}</p>
      <p className="text-[11px] text-muted">
        Advisory only — a human makes the decision. Request{" "}
        <AddressPill value={rec.gonkaRequestId} showExplorer={false} chars={6} />
      </p>
    </div>
  );
}
