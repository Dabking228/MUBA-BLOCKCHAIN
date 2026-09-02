"use client";

import { RequireSignIn } from "@/components/RequireSignIn";
import { VerifierQueue } from "@/components/official/VerifierQueue";

export default function VerifyPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Verifier queue</h1>
        <p className="mt-1 text-sm text-muted">
          Community-channel registrations wait here for an independent reviewer — always someone
          other than the person who registered them.
        </p>
      </div>
      <RequireSignIn
        need={(r) => r.isVerifier}
        needLabel="Your account does not hold a verifier capability. An admin can grant one on the Capabilities page."
      >
        <VerifierQueue />
      </RequireSignIn>
    </div>
  );
}
