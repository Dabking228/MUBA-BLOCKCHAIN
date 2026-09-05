import { CredibilityBadge } from "@/components/CredibilityBadge";
import { AddressPill } from "@/components/AddressPill";
import type { ZoneCredibilityRun } from "@/lib/types";

/**
 * Neutral, informational — never styled as a warning, even for a low score.
 * Server component (no client JS): uses <details> for the expandable detail.
 * Rendered defensively by the caller (never throws on missing/malformed data).
 */
export function ZoneCredibilitySummary({ run }: { run: ZoneCredibilityRun | null | undefined }) {
  if (!run || run.consensus.respondedCount === 0) {
    return <p className="text-xs text-muted">Evidence not yet reviewed.</p>;
  }

  const { consensus } = run;
  return (
    <details className="text-xs text-muted">
      <summary className="flex cursor-pointer select-none items-center gap-1.5">
        <span>
          Evidence reviewed by {consensus.respondedCount} of {consensus.totalModels} AI models
        </span>
        <CredibilityBadge label={consensus.label} />
      </summary>
      <div className="mt-2 flex flex-col gap-1.5 border-l-2 border-border pl-3">
        {consensus.score !== null && (
          <p>
            Average score: <strong className="font-semibold text-foreground">{consensus.score}/100</strong>
          </p>
        )}
        {consensus.agreement === "split" && (
          <p>Models disagreed — showing the more cautious assessment.</p>
        )}
        {run.perModel.map((m) =>
          m.ok ? (
            <p key={m.model}>
              <strong className="font-mono font-semibold text-foreground">{m.model}</strong>: {m.summary}
              {m.score !== undefined && (
                <>
                  {" "}
                  (score <strong className="font-semibold text-foreground">{m.score}/100</strong>)
                </>
              )}
              {m.gonkaRequestId && (
                <span className="ml-1.5 inline-flex items-center gap-1 align-middle">
                  request <AddressPill value={m.gonkaRequestId} showExplorer={false} chars={6} />
                </span>
              )}
            </p>
          ) : (
            <p key={m.model} className="text-danger/80">
              <strong className="font-mono font-semibold">{m.model}</strong>: no response
            </p>
          ),
        )}
      </div>
    </details>
  );
}
