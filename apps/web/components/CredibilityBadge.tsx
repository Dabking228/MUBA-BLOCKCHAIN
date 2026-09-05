import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { CREDIBILITY_LABELS, type CredibilityLabel } from "@/lib/types";

const TONE: Record<CredibilityLabel, BadgeTone> = {
  "well-supported": "success",
  "partially-supported": "info",
  "insufficient-evidence": "neutral",
  inconsistent: "danger",
};

export function CredibilityBadge({ label }: { label: CredibilityLabel | null }) {
  if (!label) return <Badge tone="neutral">Not yet reviewed</Badge>;
  return <Badge tone={TONE[label]}>{CREDIBILITY_LABELS[label]}</Badge>;
}
