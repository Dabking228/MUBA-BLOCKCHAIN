"use client";

import * as React from "react";
import { AdminGate, useAdminSecret } from "@/components/admin/AdminGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Callout } from "@/components/ui/Callout";
import { AddressPill } from "@/components/AddressPill";
import { AmountDisplay } from "@/components/AmountDisplay";
import { useToast } from "@/components/ui/Toast";
import { ZoneCredibilityPanel } from "@/components/admin/ZoneCredibilityPanel";
import { publicEnv } from "@/lib/env";
import { suiToMist } from "@/lib/format";
import { TIER_LABELS, Tier, type DisasterZone } from "@/lib/types";

export default function ZonesPage() {
  return (
    <AdminGate>
      <ZonesConsole />
    </AdminGate>
  );
}

function ZonesConsole() {
  const secret = useAdminSecret();
  const toast = useToast();
  const [zones, setZones] = React.useState<DisasterZone[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/zones", { cache: "no-store" });
    const data = await res.json();
    setZones(data.zones ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Disaster zones</h1>
        <p className="mt-1 text-sm text-muted">
          Open a zone with eligible postcodes, a hard budget cap, and fixed payouts per severity tier.
        </p>
      </div>

      <CreateZoneForm secret={secret} onCreated={load} toast={toast} />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Open zones</h2>
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : zones.length === 0 ? (
          <p className="text-sm text-muted">No zones yet.</p>
        ) : (
          zones.map((z) => (
            <ZoneRow key={z.id} zone={z} secret={secret} onSaved={load} toast={toast} />
          ))
        )}
      </section>
    </div>
  );
}

function CreateZoneForm({
  secret,
  onCreated,
  toast,
}: {
  secret: string;
  onCreated: () => void;
  toast: ReturnType<typeof useToast>;
}) {
  const [name, setName] = React.useState("");
  const [postcodes, setPostcodes] = React.useState("");
  const [cap, setCap] = React.useState("2");
  const [t0, setT0] = React.useState("0.05");
  const [t1, setT1] = React.useState("0.1");
  const [t2, setT2] = React.useState("0.2");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = {
        name,
        postcodes: postcodes.split(",").map((s) => s.trim()).filter(Boolean),
        budgetCapMist: suiToMist(cap).toString(),
        tiers: {
          "0": suiToMist(t0).toString(),
          "1": suiToMist(t1).toString(),
          "2": suiToMist(t2).toString(),
        },
      };
      const res = await fetch("/api/admin/zone", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-secret": secret },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create zone");
      toast({ title: "Zone opened", description: json.zoneId, tone: "success" });
      setName("");
      setPostcodes("");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Open a new zone</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Zone name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Kampung … Flood 2026" />
          </Field>
          <Field label="Eligible postcodes" hint="Comma-separated, e.g. 43000, 43100, 43200" required>
            <Input value={postcodes} onChange={(e) => setPostcodes(e.target.value)} placeholder="43000, 43100" />
          </Field>
          <Field label="Budget cap (SUI)" required>
            <Input value={cap} onChange={(e) => setCap(e.target.value)} inputMode="decimal" />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label={`${TIER_LABELS[Tier.Minor]} (SUI)`}>
              <Input value={t0} onChange={(e) => setT0(e.target.value)} inputMode="decimal" />
            </Field>
            <Field label={`${TIER_LABELS[Tier.Major]} (SUI)`}>
              <Input value={t1} onChange={(e) => setT1(e.target.value)} inputMode="decimal" />
            </Field>
            <Field label={`${TIER_LABELS[Tier.TotalLoss]} (SUI)`}>
              <Input value={t2} onChange={(e) => setT2(e.target.value)} inputMode="decimal" />
            </Field>
          </div>
          {error && <Callout tone="danger">{error}</Callout>}
          <Button type="submit" loading={busy} disabled={!name || !postcodes}>
            Open zone (4 transactions)
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ZoneRow({
  zone,
  secret,
  onSaved,
  toast,
}: {
  zone: DisasterZone;
  secret: string;
  onSaved: () => void;
  toast: ReturnType<typeof useToast>;
}) {
  const [editing, setEditing] = React.useState<Tier | null>(null);
  const [amount, setAmount] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function save(tier: Tier) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/tier", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-secret": secret },
        body: JSON.stringify({ zoneId: zone.id, tier, amountMist: suiToMist(amount).toString() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      toast({ title: "Tier updated", tone: "success" });
      setEditing(null);
      onSaved();
    } catch (err) {
      toast({ title: "Update failed", description: String(err), tone: "danger" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-5">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-foreground">{zone.name}</p>
          <AddressPill value={zone.id} kind="object" />
        </div>
        <p className="text-xs text-muted">Postcodes: {zone.eligiblePostcodes.join(", ")}</p>
        <p className="text-sm text-muted">
          Budget <AmountDisplay mist={zone.budgetSpent} size="sm" showUnit={false} /> /{" "}
          <AmountDisplay mist={zone.budgetCap} size="sm" /> spent
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {([Tier.Minor, Tier.Major, Tier.TotalLoss] as const).map((tier) => (
            <div key={tier} className="rounded-md bg-surface-muted p-2.5">
              <p className="text-[11px] uppercase tracking-wide text-muted">{TIER_LABELS[tier]}</p>
              {editing === tier ? (
                <div className="mt-1 flex gap-1">
                  <Input
                    className="h-8 py-1 text-xs"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    inputMode="decimal"
                    autoFocus
                  />
                  <Button size="sm" className="h-8 px-2" loading={busy} onClick={() => save(tier)}>
                    Save
                  </Button>
                </div>
              ) : (
                <button
                  className="mt-0.5 text-sm font-semibold text-foreground hover:text-primary"
                  onClick={() => {
                    setEditing(tier);
                    setAmount(zone.tierAmounts[tier] ? String(Number(zone.tierAmounts[tier]) / 1e9) : "");
                  }}
                >
                  {zone.tierAmounts[tier] ? <AmountDisplay mist={zone.tierAmounts[tier]} size="sm" /> : "Set →"}
                </button>
              )}
            </div>
          ))}
        </div>

        {publicEnv.enableZoneCredibility && <ZoneCredibilityPanel zoneId={zone.id} secret={secret} />}
      </CardContent>
    </Card>
  );
}
