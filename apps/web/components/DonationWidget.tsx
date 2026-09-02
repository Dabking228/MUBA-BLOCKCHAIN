"use client";

import * as React from "react";
import { useSession } from "@/components/providers/SessionProvider";
import { requestFaucet, runSponsoredAction } from "@/lib/session/txClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Callout } from "@/components/ui/Callout";
import { AddressPill } from "@/components/AddressPill";
import { AmountDisplay } from "@/components/AmountDisplay";
import { useToast } from "@/components/ui/Toast";
import { mistToSui, suiToMist } from "@/lib/format";

const QUICK = ["0.01", "0.05", "0.1"];
const DEV = (process.env.NEXT_PUBLIC_AUTH_MODE ?? "dev") === "dev";

export function DonationWidget() {
  const { identity, keypair, refreshRoles } = useSession();
  const toast = useToast();
  const [amount, setAmount] = React.useState("0.05");
  const [balance, setBalance] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<"donate" | "faucet" | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [lastDigest, setLastDigest] = React.useState<string | null>(null);

  const loadBalance = React.useCallback(async () => {
    if (!identity) return;
    const d = await fetch(`/api/balance?address=${identity.address}`).then((r) => r.json());
    setBalance(d.balance ?? "0");
  }, [identity]);

  React.useEffect(() => {
    void loadBalance();
  }, [loadBalance]);

  const amountMist = (() => {
    try {
      return suiToMist(amount);
    } catch {
      return 0n;
    }
  })();
  const insufficient = balance !== null && amountMist > BigInt(balance);

  async function donate() {
    if (!keypair) return;
    setBusy("donate");
    setError(null);
    try {
      const digest = await runSponsoredAction(keypair, "donate", {
        amountMist: amountMist.toString(),
      });
      setLastDigest(digest);
      toast({ title: "Thank you — donation recorded", tone: "success" });
      await Promise.all([loadBalance(), refreshRoles()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Donation failed");
    } finally {
      setBusy(null);
    }
  }

  async function faucet() {
    if (!identity) return;
    setBusy("faucet");
    setError(null);
    try {
      await requestFaucet(identity.address);
      toast({ title: "Faucet request sent", description: "Balance updates in a few seconds." });
      setTimeout(loadBalance, 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Faucet failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Donate to the relief treasury</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-md bg-surface-muted p-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted">Your wallet</span>
            <AddressPill value={identity?.address} />
          </div>
          <span className="font-medium">
            {balance === null ? "…" : <AmountDisplay mist={balance} size="sm" />}
          </span>
        </div>

        <Field label="Amount (SUI)">
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" />
        </Field>
        <div className="flex gap-2">
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setAmount(q)}
              className="rounded-md border border-border-strong px-3 py-1 text-sm hover:bg-surface-muted"
            >
              {q}
            </button>
          ))}
        </div>

        {insufficient && (
          <Callout tone="warning">
            Your wallet balance is below this amount.
            {DEV && " Use the testnet faucet to top up."}
          </Callout>
        )}
        {error && <Callout tone="danger">{error}</Callout>}
        {lastDigest && (
          <Callout tone="success" title="Donation on-chain">
            <AddressPill value={lastDigest} kind="txblock" chars={6} />
          </Callout>
        )}

        <div className="flex gap-2">
          <Button loading={busy === "donate"} disabled={amountMist <= 0n || insufficient} onClick={donate}>
            Donate {mistToSui(amountMist)} SUI
          </Button>
          {DEV && (
            <Button variant="secondary" loading={busy === "faucet"} onClick={faucet}>
              Faucet top-up
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
