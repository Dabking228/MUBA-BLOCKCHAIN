"use client";

import * as React from "react";
import { useSession } from "@/components/providers/SessionProvider";
import { runSponsoredAction } from "@/lib/session/txClient";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { Callout } from "@/components/ui/Callout";
import { EmptyState } from "@/components/ui/EmptyState";
import { ChannelBadge, TierBadge } from "@/components/StatusBadge";
import { AddressPill } from "@/components/AddressPill";
import { AiReasoning } from "@/components/official/AiReasoning";
import { useToast } from "@/components/ui/Toast";
import { formatRelative } from "@/lib/format";
import type { AiRecommendation, HouseholdRegistration } from "@/lib/types";

export function VerifierQueue() {
  const { identity, signer, refreshRoles } = useSession();
  const toast = useToast();
  const [items, setItems] = React.useState<HouseholdRegistration[]>([]);
  const [verifierCapId, setVerifierCapId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    const [q, caps] = await Promise.all([
      fetch("/api/verify/queue", { cache: "no-store" }).then((r) => r.json()),
      identity
        ? fetch(`/api/caps?address=${identity.address}`).then((r) => r.json())
        : Promise.resolve({ verifierCapId: null }),
    ]);
    setItems(q.registrations ?? []);
    setVerifierCapId(caps.verifierCapId ?? null);
    setLoading(false);
  }, [identity]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function act(reg: HouseholdRegistration, decision: "verify" | "reject", reason?: string) {
    if (!signer || !verifierCapId) return;
    try {
      await runSponsoredAction(
        signer,
        decision === "verify" ? "verify_registration" : "reject_registration",
        decision === "verify"
          ? { verifierCapId, registrationId: reg.id }
          : { verifierCapId, registrationId: reg.id, reason: reason || "Rejected by verifier" },
      );
      toast({
        title: decision === "verify" ? "Registration verified" : "Registration rejected",
        tone: decision === "verify" ? "success" : "warning",
      });
      await refreshRoles();
      await load();
    } catch (err) {
      toast({ title: "Action failed", description: String(err), tone: "danger" });
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading queue…</p>;
  if (items.length === 0) {
    return <EmptyState title="Queue is clear" description="No registrations are awaiting verification." />;
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((reg) => (
        <QueueItem key={reg.id} reg={reg} onAct={act} canAct={!!verifierCapId} />
      ))}
    </div>
  );
}

function QueueItem({
  reg,
  onAct,
  canAct,
}: {
  reg: HouseholdRegistration;
  onAct: (reg: HouseholdRegistration, d: "verify" | "reject", reason?: string) => Promise<void>;
  canAct: boolean;
}) {
  const [busy, setBusy] = React.useState<"verify" | "reject" | null>(null);
  const [rejecting, setRejecting] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [ai, setAi] = React.useState<AiRecommendation | null>(null);
  const [aiState, setAiState] = React.useState<"idle" | "loading" | "unavailable">("idle");

  async function askAi() {
    setAiState("loading");
    try {
      const res = await fetch("/api/ai/triage", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ registrationId: reg.id }),
      });
      if (!res.ok) {
        setAiState("unavailable");
        return;
      }
      setAi(await res.json());
      setAiState("idle");
    } catch {
      setAiState("unavailable");
    }
  }

  async function run(decision: "verify" | "reject") {
    setBusy(decision);
    try {
      await onAct(reg, decision, decision === "reject" ? reason : undefined);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-sm">{reg.householdId}</span>
          <div className="flex items-center gap-1.5">
            <ChannelBadge channel={reg.channel} />
            <TierBadge tier={reg.tier} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <span>Postcode {reg.postcode}</span>
          <span>Submitted {formatRelative(reg.createdAt)}</span>
          <span className="flex items-center gap-1">
            by <AddressPill value={reg.registrar} />
          </span>
        </div>

        {aiState === "unavailable" && (
          <Callout tone="info">AI triage is not available in this build.</Callout>
        )}
        {ai && <AiReasoning rec={ai} />}

        {!rejecting ? (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" loading={busy === "verify"} disabled={!canAct} onClick={() => run("verify")}>
              Verify
            </Button>
            <Button size="sm" variant="secondary" disabled={!canAct} onClick={() => setRejecting(true)}>
              Reject
            </Button>
            <Button
              size="sm"
              variant="ghost"
              loading={aiState === "loading"}
              onClick={askAi}
            >
              Ask AI
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for rejection (shown on-chain)"
              rows={2}
            />
            <div className="flex gap-2">
              <Button size="sm" variant="danger" loading={busy === "reject"} onClick={() => run("reject")}>
                Confirm rejection
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setRejecting(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
        {!canAct && (
          <p className="text-xs text-danger">
            Your account does not hold a verifier capability.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
