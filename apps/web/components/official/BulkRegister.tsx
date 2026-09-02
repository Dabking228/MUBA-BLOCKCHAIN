"use client";

import * as React from "react";
import { useSession } from "@/components/providers/SessionProvider";
import { registerHousehold } from "@/lib/session/txClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Textarea, Input, Select } from "@/components/ui/Field";
import { Callout } from "@/components/ui/Callout";
import { Badge } from "@/components/ui/Badge";
import { AddressPill } from "@/components/AddressPill";
import { useToast } from "@/components/ui/Toast";
import { CHANNEL_LABELS, Channel, TIER_LABELS, Tier, type BulkRegisterDraft, type DisasterZone } from "@/lib/types";

interface RegistrarCap {
  capId: string;
  channel: number;
}

interface Row extends BulkRegisterDraft {
  key: string;
  state: "draft" | "submitting" | "done" | "error";
  code?: string;
  error?: string;
}

const EXAMPLE = `Pak Ali Hassan, postcode 43000, roof torn off and house flooded to waist height, family of 6.
Mak Minah at 43100, minor water damage to the kitchen only, lives alone.
The Tan family, 43200, house completely destroyed by the landslide, 4 people.`;

export function BulkRegister() {
  const { identity, keypair } = useSession();
  const toast = useToast();

  const [zones, setZones] = React.useState<DisasterZone[]>([]);
  const [caps, setCaps] = React.useState<RegistrarCap[]>([]);
  const [zoneId, setZoneId] = React.useState("");
  const [capId, setCapId] = React.useState("");
  const [text, setText] = React.useState("");
  const [drafting, setDrafting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [requestId, setRequestId] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<Row[]>([]);

  React.useEffect(() => {
    if (!identity) return;
    void (async () => {
      const [zr, cr] = await Promise.all([
        fetch("/api/zones").then((r) => r.json()),
        fetch(`/api/caps?address=${identity.address}`).then((r) => r.json()),
      ]);
      const zoneList: DisasterZone[] = zr.zones ?? [];
      setZones(zoneList);
      setCaps(cr.registrarCaps ?? []);
      const configured = process.env.NEXT_PUBLIC_ZONE_ID;
      setZoneId((zoneList.find((z) => z.id === configured) ?? zoneList[0])?.id ?? "");
      if (cr.registrarCaps?.[0]) setCapId(cr.registrarCaps[0].capId);
    })();
  }, [identity]);

  const zone = zones.find((z) => z.id === zoneId);

  async function draft() {
    setDrafting(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/bulk-register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, zoneId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not draft entries");
      setRequestId(json.requestId);
      setRows(
        (json.drafts as BulkRegisterDraft[]).map((d, i) => ({
          ...d,
          key: `${Date.now()}-${i}`,
          state: "draft" as const,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Draft failed");
    } finally {
      setDrafting(false);
    }
  }

  function update(key: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  async function submitRow(row: Row) {
    if (!keypair || !zone) return;
    update(row.key, { state: "submitting", error: undefined });
    try {
      const { code } = await registerHousehold(keypair, {
        registrarCapId: capId,
        zoneId,
        householdId: row.householdId.trim(),
        postcode: row.postcode,
        tier: row.tier,
      });
      update(row.key, { state: "done", code });
    } catch (err) {
      update(row.key, { state: "error", error: err instanceof Error ? err.message : "Failed" });
    }
  }

  async function submitAll() {
    for (const row of rows) {
      if (row.state === "draft" || row.state === "error") {
        // eslint-disable-next-line no-await-in-loop
        await submitRow(row);
      }
    }
    toast({ title: "Bulk registration complete", tone: "success" });
  }

  const pending = rows.filter((r) => r.state === "draft" || r.state === "error").length;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Describe the households</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Zone">
              <Select value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </Select>
            </Field>
            {caps.length > 1 && (
              <Field label="Channel">
                <Select value={capId} onChange={(e) => setCapId(e.target.value)}>
                  {caps.map((c) => (
                    <option key={c.capId} value={c.capId}>
                      {CHANNEL_LABELS[c.channel as Channel]}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
          </div>
          <Field
            label="What happened to each household?"
            hint="Plain language — one household per sentence or line. The AI structures it; you review every entry before anything is submitted."
          >
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder={EXAMPLE}
            />
          </Field>
          {error && <Callout tone="danger">{error}</Callout>}
          <div className="flex gap-2">
            <Button loading={drafting} disabled={text.trim().length < 10} onClick={draft}>
              Draft entries with AI
            </Button>
            {!text && (
              <Button variant="ghost" onClick={() => setText(EXAMPLE)}>
                Use the example
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Review &amp; submit ({rows.length})</CardTitle>
              {requestId && (
                <span className="text-xs text-muted">
                  Gonka <AddressPill value={requestId} showExplorer={false} chars={6} />
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {rows.map((row) => (
              <BulkRow
                key={row.key}
                row={row}
                eligiblePostcodes={zone?.eligiblePostcodes ?? []}
                onChange={(patch) => update(row.key, patch)}
                onSubmit={() => submitRow(row)}
              />
            ))}
            {pending > 0 && (
              <Button variant="secondary" onClick={submitAll}>
                Submit all {pending} remaining
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function BulkRow({
  row,
  eligiblePostcodes,
  onChange,
  onSubmit,
}: {
  row: Row;
  eligiblePostcodes: string[];
  onChange: (patch: Partial<Row>) => void;
  onSubmit: () => void;
}) {
  const postcodeOk = eligiblePostcodes.length === 0 || eligiblePostcodes.includes(row.postcode);
  const conf = Math.round((row.confidence ?? 0) * 100);

  if (row.state === "done") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-md border border-success/30 bg-success-soft p-3 text-sm">
        <span className="font-mono">{row.householdId}</span>
        <span className="text-muted">registered · code</span>
        <span className="select-all font-mono font-semibold">{row.code}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={row.householdId}
          onChange={(e) => onChange({ householdId: e.target.value })}
          className="h-9 flex-1 font-mono text-xs"
          placeholder="household id"
        />
        <Badge tone={conf >= 70 ? "success" : conf >= 40 ? "warning" : "danger"}>
          {conf}% sure
        </Badge>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {eligiblePostcodes.length > 0 ? (
          <Select
            value={row.postcode}
            onChange={(e) => onChange({ postcode: e.target.value })}
            className="h-9 py-1 text-xs"
          >
            {!eligiblePostcodes.includes(row.postcode) && (
              <option value={row.postcode}>{row.postcode || "—"} (not eligible)</option>
            )}
            {eligiblePostcodes.map((pc) => (
              <option key={pc} value={pc}>
                {pc}
              </option>
            ))}
          </Select>
        ) : (
          <Input
            value={row.postcode}
            onChange={(e) => onChange({ postcode: e.target.value })}
            className="h-9 py-1 text-xs"
          />
        )}
        <Select
          value={String(row.tier)}
          onChange={(e) => onChange({ tier: Number(e.target.value) as Tier })}
          className="h-9 py-1 text-xs"
        >
          {([Tier.Minor, Tier.Major, Tier.TotalLoss] as const).map((t) => (
            <option key={t} value={t}>
              {TIER_LABELS[t]}
            </option>
          ))}
        </Select>
        <Input
          value={row.damageNotes}
          onChange={(e) => onChange({ damageNotes: e.target.value })}
          className="h-9 py-1 text-xs"
          placeholder="damage notes"
        />
      </div>
      {!postcodeOk && (
        <p className="text-xs text-danger">Postcode is not in this zone&apos;s eligible list.</p>
      )}
      {row.state === "error" && <p className="text-xs text-danger">{row.error}</p>}
      <Button
        size="sm"
        className="self-start"
        loading={row.state === "submitting"}
        disabled={!row.householdId.trim() || !postcodeOk}
        onClick={onSubmit}
      >
        Register this household
      </Button>
    </div>
  );
}
