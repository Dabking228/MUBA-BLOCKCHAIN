import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { AmountDisplay } from "@/components/AmountDisplay";
import { pct } from "@/lib/format";
import { TIER_LABELS, Tier, type DisasterZone } from "@/lib/types";

export function ZoneDashboard({ zone }: { zone: DisasterZone }) {
  const used = pct(BigInt(zone.budgetSpent), BigInt(zone.budgetCap));
  const remaining = BigInt(zone.budgetCap) - BigInt(zone.budgetSpent);
  const tone = used >= 100 ? "danger" : used >= 80 ? "warning" : "primary";

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">{zone.name}</h3>
            <p className="mt-0.5 text-xs text-muted">
              Eligible postcodes: {zone.eligiblePostcodes.join(", ") || "—"}
            </p>
          </div>
          <Badge tone={zone.active ? "success" : "neutral"}>
            {zone.active ? "Active" : "Closed"}
          </Badge>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted">Budget used</span>
            <span className="font-medium text-foreground">
              <AmountDisplay mist={zone.budgetSpent} size="sm" showUnit={false} /> /{" "}
              <AmountDisplay mist={zone.budgetCap} size="sm" />
            </span>
          </div>
          <Progress value={used} tone={tone} />
          <p className="text-xs text-muted">
            <AmountDisplay mist={remaining < 0n ? 0n : remaining} size="sm" /> remaining
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {([Tier.Minor, Tier.Major, Tier.TotalLoss] as const).map((tier) => (
            <div key={tier} className="rounded-md bg-surface-muted p-2.5 text-center">
              <p className="text-[11px] uppercase tracking-wide text-muted">{TIER_LABELS[tier]}</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground tabular-nums">
                {zone.tierAmounts[tier] ? (
                  <AmountDisplay mist={zone.tierAmounts[tier]} size="sm" />
                ) : (
                  "—"
                )}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
