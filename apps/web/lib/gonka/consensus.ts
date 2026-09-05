import type { CredibilityLabel, ModelCredibilityResult, ZoneCredibilityConsensus } from "@/lib/types";

// Most cautious first — on disagreement, the more cautious label wins rather
// than averaging, matching this app's existing "ambiguity escalates" instinct.
const CAUTION_ORDER: CredibilityLabel[] = [
  "inconsistent",
  "insufficient-evidence",
  "partially-supported",
  "well-supported",
];

/**
 * Deterministic, no extra model call. Aggregates whichever models actually
 * responded — a model that errored/timed out is simply excluded, never treated
 * as a "no" vote, and is never allowed to silently disappear (callers still see
 * it in `perModel` with `ok: false`).
 */
export function resolveZoneCredibilityConsensus(
  perModel: ModelCredibilityResult[],
): ZoneCredibilityConsensus {
  const totalModels = perModel.length;
  const responded = perModel.filter(
    (m): m is ModelCredibilityResult & { label: CredibilityLabel; score: number } =>
      m.ok && m.label !== undefined && m.score !== undefined,
  );

  if (responded.length === 0) {
    return { label: null, score: null, respondedCount: 0, totalModels, agreement: "none" };
  }

  let label = responded[0].label;
  for (const m of responded) {
    if (CAUTION_ORDER.indexOf(m.label) < CAUTION_ORDER.indexOf(label)) label = m.label;
  }

  const score = Math.round(responded.reduce((sum, m) => sum + m.score, 0) / responded.length);
  const allAgree = responded.every((m) => m.label === responded[0].label);
  const agreement = responded.length === 1 ? "single" : allAgree ? "unanimous" : "split";

  return { label, score, respondedCount: responded.length, totalModels, agreement };
}
