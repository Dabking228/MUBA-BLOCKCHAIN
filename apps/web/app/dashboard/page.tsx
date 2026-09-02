import type { Metadata } from "next";
import { getDashboardData } from "@/lib/queries";
import { StatTile } from "@/components/StatTile";
import { ZoneDashboard } from "@/components/ZoneDashboard";
import { RefreshButton } from "@/components/RefreshButton";
import { AddressPill } from "@/components/AddressPill";
import { AmountDisplay } from "@/components/AmountDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRelative, mistToSui } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Transparency dashboard" };

export default async function DashboardPage() {
  const data = await getDashboardData();
  const claimedRate =
    data.pipeline.total > 0
      ? Math.round(((data.pipeline.paid + data.pipeline.verified) / data.pipeline.total) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transparency dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Every figure here mirrors on-chain state on Sui testnet and updates continuously.
          </p>
        </div>
        <RefreshButton label="Sync now" />
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Treasury balance"
          value={<AmountDisplay mist={data.treasuryBalance} size="lg" />}
          sub="Available to disburse"
        />
        <StatTile
          label="Total donated"
          value={<AmountDisplay mist={data.totalDonated} size="lg" />}
          sub={`${data.recentDonations.length ? "" : "No "}contributions recorded`}
        />
        <StatTile
          label="Households registered"
          value={data.pipeline.total}
          sub={`${data.pipeline.pending} awaiting verification`}
        />
        <StatTile
          label="Aid paid out"
          value={data.pipeline.paid}
          sub={`${claimedRate}% verified or paid`}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Disaster zones</h2>
        {data.zones.length === 0 ? (
          <EmptyState title="No zones open" description="An admin has not opened a disaster zone yet." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {data.zones.map((z) => (
              <ZoneDashboard key={z.id} zone={z} />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Registration pipeline</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {(
              [
                ["Pending verification", data.pipeline.pending, "text-warning"],
                ["Verified, awaiting claim", data.pipeline.verified, "text-info"],
                ["Paid", data.pipeline.paid, "text-success"],
                ["Rejected", data.pipeline.rejected, "text-danger"],
              ] as const
            ).map(([label, count, color]) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-muted">{label}</span>
                <span className={`font-semibold tabular-nums ${color}`}>{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent donations</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentDonations.length === 0 ? (
              <p className="text-sm text-muted">No donations yet.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {data.recentDonations.map((d) => (
                  <li key={d.txDigest} className="flex items-center justify-between gap-2 py-2 text-sm">
                    <AddressPill value={d.donorAddress} />
                    <span className="text-muted">{formatRelative(d.createdAt)}</span>
                    <span className="font-medium tabular-nums text-foreground">
                      +{mistToSui(d.amount)} SUI
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      {data.recentPayouts.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Recent payouts</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-2 font-medium">Household</th>
                  <th className="px-4 py-2 font-medium">Postcode</th>
                  <th className="px-4 py-2 font-medium">Recipient</th>
                  <th className="px-4 py-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.recentPayouts.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2 font-mono text-xs">{p.householdId}</td>
                    <td className="px-4 py-2">{p.postcode}</td>
                    <td className="px-4 py-2">
                      <AddressPill value={p.headOfHousehold} />
                    </td>
                    <td className="px-4 py-2 text-right font-medium tabular-nums">
                      {p.paidAmount ? `${mistToSui(p.paidAmount)} SUI` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
