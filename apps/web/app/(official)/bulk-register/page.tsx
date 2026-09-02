"use client";

import { RequireSignIn } from "@/components/RequireSignIn";
import { BulkRegister } from "@/components/official/BulkRegister";

export default function BulkRegisterPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bulk registration</h1>
        <p className="mt-1 text-sm text-muted">
          Describe many households in plain language. GonkaRouter drafts structured entries; you
          review and correct every one before it goes on-chain — the AI never submits anything.
        </p>
      </div>
      <RequireSignIn
        need={(r) => r.registrarChannels.length > 0}
        needLabel="Your account does not hold a registrar capability."
      >
        <BulkRegister />
      </RequireSignIn>
    </div>
  );
}
