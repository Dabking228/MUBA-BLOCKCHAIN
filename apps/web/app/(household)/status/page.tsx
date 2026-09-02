"use client";

import * as React from "react";
import Link from "next/link";
import { RequireSignIn } from "@/components/RequireSignIn";
import { useSession } from "@/components/providers/SessionProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge, TierBadge } from "@/components/StatusBadge";
import { AddressPill } from "@/components/AddressPill";
import { AmountDisplay } from "@/components/AmountDisplay";
import { StepTimeline } from "@/components/StepTimeline";
import { RefreshButton } from "@/components/RefreshButton";
import { registrationSteps } from "@/lib/timeline";
import { type HouseholdRegistration } from "@/lib/types";

export default function StatusPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My aid</h1>
          <p className="mt-1 text-sm text-muted">Your account balance and the status of your aid.</p>
        </div>
        <RefreshButton />
      </div>
      <RequireSignIn>
        <StatusBody />
      </RequireSignIn>
    </div>
  );
}

function StatusBody() {
  const { identity, roles } = useSession();
  const [balance, setBalance] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!identity) return;
    fetch(`/api/balance?address=${identity.address}`)
      .then((r) => r.json())
      .then((d) => setBalance(d.balance ?? "0"))
      .catch(() => setBalance("0"));
  }, [identity]);

  const households = roles?.households ?? [];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex items-center justify-between pt-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Account balance</p>
            <p className="mt-1">
              {balance === null ? (
                <span className="text-muted">Loading…</span>
              ) : (
                <AmountDisplay mist={balance} size="xl" />
              )}
            </p>
          </div>
          <AddressPill value={identity?.address} />
        </CardContent>
      </Card>

      {households.length === 0 ? (
        <EmptyState
          title="No aid linked to this account yet"
          description="If you have a reference code from an official, use it to claim your aid."
          action={
            <Link href="/claim" className={buttonClasses({ size: "sm" })}>
              Enter a reference code
            </Link>
          }
        />
      ) : (
        households.map((h) => <AidCard key={h.id} reg={h} />)
      )}
    </div>
  );
}

function AidCard({ reg }: { reg: HouseholdRegistration }) {
  const steps = registrationSteps(reg);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Household {reg.householdId}</CardTitle>
          <StatusBadge status={reg.status} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-muted">
          <span>Postcode {reg.postcode}</span>
          <TierBadge tier={reg.tier} />
        </div>
        <StepTimeline steps={steps} />
      </CardContent>
    </Card>
  );
}

