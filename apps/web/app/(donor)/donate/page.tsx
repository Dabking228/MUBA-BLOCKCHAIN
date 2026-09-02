"use client";

import { RequireSignIn } from "@/components/RequireSignIn";
import { DonationWidget } from "@/components/DonationWidget";
import { Callout } from "@/components/ui/Callout";

export default function DonatePage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Donate</h1>
        <p className="mt-1 text-sm text-muted">
          Your contribution goes into one shared, publicly auditable treasury. You can follow it
          from here to the household that receives it on the transparency dashboard.
        </p>
      </div>
      <RequireSignIn>
        <DonationWidget />
      </RequireSignIn>
      <Callout tone="info">
        This is a testnet demo — donations use testnet SUI with no real-world value.
      </Callout>
    </div>
  );
}
