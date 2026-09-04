"use client";

import * as React from "react";
import { useSession } from "@/components/providers/SessionProvider";
import { runSponsoredAction } from "@/lib/session/txClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { Callout } from "@/components/ui/Callout";
import { useToast } from "@/components/ui/Toast";
import { ReferenceSlip } from "@/components/official/ReferenceSlip";
import {
  AUTO_VERIFY_CHANNELS,
  CHANNEL_LABELS,
  Channel,
  TIER_LABELS,
  Tier,
  type DisasterZone,
} from "@/lib/types";

interface RegistrarCap {
  capId: string;
  channel: number;
}

interface Done {
  code: string;
  householdId: string;
  postcode: string;
  tier: Tier;
  zoneName: string;
}

export function RegistrationForm() {
  const { identity, signer, refreshRoles } = useSession();
  const toast = useToast();

  const [zones, setZones] = React.useState<DisasterZone[]>([]);
  const [caps, setCaps] = React.useState<RegistrarCap[]>([]);
  const [zoneId, setZoneId] = React.useState("");
  const [capId, setCapId] = React.useState("");
  const [householdId, setHouseholdId] = React.useState("");
  const [postcode, setPostcode] = React.useState("");
  const [tier, setTier] = React.useState<Tier>(Tier.Minor);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState<Done | null>(null);

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
      const initialZone = zoneList.find((z) => z.id === configured) ?? zoneList[0];
      if (initialZone) {
        setZoneId(initialZone.id);
        setPostcode(initialZone.eligiblePostcodes[0] ?? "");
      }
      if (cr.registrarCaps?.[0]) setCapId(cr.registrarCaps[0].capId);
    })();
  }, [identity]);

  const zone = zones.find((z) => z.id === zoneId);
  const selectedCap = caps.find((c) => c.capId === capId);
  const channel = (selectedCap?.channel ?? Channel.PPS) as Channel;
  const willAutoVerify = AUTO_VERIFY_CHANNELS.has(channel);

  function selectZone(id: string) {
    setZoneId(id);
    // The postcode list is zone-specific — reset it so a postcode from the
    // previous zone can't be silently submitted against the new one.
    const next = zones.find((z) => z.id === id);
    setPostcode(next?.eligiblePostcodes[0] ?? "");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!signer || !zone) return;
    setBusy(true);
    setError(null);
    try {
      const rc = await fetch("/api/reference-code", { method: "POST" }).then((r) => r.json());
      await runSponsoredAction(signer, "register_household", {
        registrarCapId: capId,
        zoneId,
        householdId: householdId.trim(),
        referenceCodeHashHex: rc.codeHash,
        postcode,
        tier,
      });
      toast({ title: "Household registered", tone: "success" });
      await refreshRoles();
      setDone({ code: rc.code, householdId: householdId.trim(), postcode, tier, zoneName: zone.name });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <ReferenceSlip
        {...done}
        onDone={() => {
          setDone(null);
          setHouseholdId("");
        }}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register a household</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Disaster zone">
            <Select value={zoneId} onChange={(e) => selectZone(e.target.value)}>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </Select>
          </Field>

          {caps.length > 1 && (
            <Field label="Registering as">
              <Select value={capId} onChange={(e) => setCapId(e.target.value)}>
                {caps.map((c) => (
                  <option key={c.capId} value={c.capId}>
                    {CHANNEL_LABELS[c.channel as Channel]}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          <Field
            label="Household identifier"
            hint="A stable reference for this household — e.g. head-of-household IC, or a case number. Enforced unique on-chain."
            required
          >
            <Input
              value={householdId}
              onChange={(e) => setHouseholdId(e.target.value)}
              placeholder="e.g. 880101-14-5567"
            />
          </Field>

          <Field label="Postcode">
            <Select value={postcode} onChange={(e) => setPostcode(e.target.value)}>
              {(zone?.eligiblePostcodes ?? []).map((pc) => (
                <option key={pc} value={pc}>
                  {pc}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Assessed damage (severity tier)" hint="You assess this — never the household.">
            <Select value={String(tier)} onChange={(e) => setTier(Number(e.target.value) as Tier)}>
              {([Tier.Minor, Tier.Major, Tier.TotalLoss] as const).map((tr) => (
                <option key={tr} value={tr}>
                  {TIER_LABELS[tr]}
                  {zone?.tierAmounts[tr] ? ` — ${Number(zone.tierAmounts[tr]) / 1e9} SUI` : ""}
                </option>
              ))}
            </Select>
          </Field>

          <Callout tone={willAutoVerify ? "info" : "warning"}>
            {willAutoVerify
              ? `${CHANNEL_LABELS[channel]} registrations are verified automatically.`
              : `${CHANNEL_LABELS[channel]} registrations stay pending until an independent verifier approves them.`}
          </Callout>

          {error && <Callout tone="danger">{error}</Callout>}

          <Button
            type="submit"
            loading={busy}
            disabled={
              !householdId.trim() || !capId || !zone || !zone.eligiblePostcodes.includes(postcode)
            }
          >
            Register &amp; generate reference code
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
