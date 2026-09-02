"use client";

import { RequireSignIn } from "@/components/RequireSignIn";
import { RegistrationForm } from "@/components/official/RegistrationForm";

export default function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Register a household</h1>
        <p className="mt-1 text-sm text-muted">
          Records the household on-chain and issues a printed reference code. The household does not
          need to be online or hold a wallet.
        </p>
      </div>
      <RequireSignIn
        need={(r) => r.registrarChannels.length > 0}
        needLabel="Your account does not hold a registrar capability. Ask an admin to issue one on the Capabilities page, giving them the address shown on your sign-in screen."
      >
        <RegistrationForm />
      </RequireSignIn>
    </div>
  );
}
