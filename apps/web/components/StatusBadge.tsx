import { Badge, type BadgeTone } from "@/components/ui/Badge";
import {
  Channel,
  CHANNEL_LABELS,
  RegistrationStatus,
  STATUS_LABELS,
  Tier,
  TIER_LABELS,
} from "@/lib/types";

const STATUS_TONE: Record<RegistrationStatus, BadgeTone> = {
  [RegistrationStatus.Pending]: "warning",
  [RegistrationStatus.Verified]: "info",
  [RegistrationStatus.Rejected]: "danger",
  [RegistrationStatus.Paid]: "success",
};

const STATUS_ICON: Record<RegistrationStatus, string> = {
  [RegistrationStatus.Pending]: "◷",
  [RegistrationStatus.Verified]: "✓",
  [RegistrationStatus.Rejected]: "✕",
  [RegistrationStatus.Paid]: "＄",
};

export function StatusBadge({ status }: { status: RegistrationStatus }) {
  return (
    <Badge tone={STATUS_TONE[status]}>
      <span aria-hidden>{STATUS_ICON[status]}</span>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function ChannelBadge({ channel }: { channel: Channel }) {
  return <Badge tone="neutral">{CHANNEL_LABELS[channel]}</Badge>;
}

export function TierBadge({ tier }: { tier: Tier }) {
  const tone: BadgeTone =
    tier === Tier.TotalLoss ? "danger" : tier === Tier.Major ? "warning" : "neutral";
  return <Badge tone={tone}>{TIER_LABELS[tier]}</Badge>;
}
