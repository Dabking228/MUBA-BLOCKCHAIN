"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RequireSignIn } from "@/components/RequireSignIn";
import { useSession } from "@/components/providers/SessionProvider";
import { runSponsoredAction } from "@/lib/session/txClient";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Callout } from "@/components/ui/Callout";
import { StatusBadge, TierBadge } from "@/components/StatusBadge";
import { AmountDisplay } from "@/components/AmountDisplay";
import { useToast } from "@/components/ui/Toast";
import { RegistrationStatus, STATUS_LABELS, type Tier } from "@/lib/types";

interface Lookup {
  registrationId: string;
  zoneId: string;
  householdId: string;
  tier: Tier;
  postcode: string;
  status: RegistrationStatus;
  claimed: boolean;
  canClaim: boolean;
}

export default function ClaimPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Claim your aid</h1>
        <p className="mt-1 text-sm text-muted">
          Enter the reference code from your registration slip. This links your account to your
          registration — only your own sign-in can ever do this.
        </p>
      </div>
      <RequireSignIn>
        <ClaimFlow />
      </RequireSignIn>
    </div>
  );
}

function ClaimFlow() {
  const { keypair, refreshRoles } = useSession();
  const toast = useToast();
  const router = useRouter();

  const [code, setCode] = React.useState("");
  const [lookup, setLookup] = React.useState<Lookup | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<"lookup" | "claim" | "release" | null>(null);
  const [claimedNow, setClaimedNow] = React.useState(false);

  const normalized = code.trim().toUpperCase();

  async function doLookup(e: React.FormEvent) {
    e.preventDefault();
    setBusy("lookup");
    setError(null);
    setLookup(null);
    try {
      const res = await fetch("/api/claim/lookup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: normalized }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Lookup failed");
      setLookup(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setBusy(null);
    }
  }

  async function doClaim() {
    if (!keypair || !lookup) return;
    setBusy("claim");
    setError(null);
    try {
      await runSponsoredAction(keypair, "claim_and_link", {
        registrationId: lookup.registrationId,
        code: normalized,
      });
      toast({ title: "Account linked", tone: "success" });
      setClaimedNow(true);
      await refreshRoles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Claim failed");
    } finally {
      setBusy(null);
    }
  }

  async function doRelease() {
    if (!keypair || !lookup) return;
    setBusy("release");
    setError(null);
    try {
      await runSponsoredAction(keypair, "release_funds", {
        registrationId: lookup.registrationId,
        zoneId: lookup.zoneId,
      });
      toast({ title: "Aid released to your account", tone: "success" });
      await refreshRoles();
      router.push("/status");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Release failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-5">
        <form onSubmit={doLookup} className="flex flex-col gap-3">
          <Field label="Reference code" hint="Looks like MSA-XXXX-XXXX-XXXX">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="MSA-…"
              className="font-mono uppercase tracking-wider"
              autoCapitalize="characters"
            />
          </Field>
          {!lookup && (
            <Button type="submit" loading={busy === "lookup"} disabled={normalized.length < 4}>
              Look up my registration
            </Button>
          )}
        </form>

        {error && <Callout tone="danger">{error}</Callout>}

        {lookup && (
          <div className="flex flex-col gap-3 rounded-md border border-border bg-surface-muted p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm">{lookup.householdId}</span>
              <StatusBadge status={lookup.status} />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <span>Postcode {lookup.postcode}</span>
              <TierBadge tier={lookup.tier} />
            </div>

            {lookup.claimed && !claimedNow && (
              <Callout tone="warning" title="Already claimed">
                This registration is already linked to an account.
              </Callout>
            )}

            {!lookup.claimed && lookup.status === RegistrationStatus.Pending && (
              <Callout tone="warning" title="Awaiting verification">
                A verifier still needs to approve this registration. Check back soon.
              </Callout>
            )}

            {lookup.status === RegistrationStatus.Rejected && (
              <Callout tone="danger" title="Registration rejected">
                {STATUS_LABELS[lookup.status]}. Please re-verify in person.
              </Callout>
            )}

            {lookup.canClaim && !claimedNow && (
              <Button onClick={doClaim} loading={busy === "claim"}>
                Link this to my account
              </Button>
            )}

            {claimedNow && (
              <>
                <Callout tone="success" title="Linked to your account">
                  Now release your aid to receive it.
                </Callout>
                <Button onClick={doRelease} loading={busy === "release"}>
                  Receive my aid now
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
