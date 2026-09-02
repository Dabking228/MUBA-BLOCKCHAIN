"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/components/providers/SessionProvider";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { AddressPill } from "@/components/AddressPill";

interface DemoIdentities {
  official?: { address: string; secretKey: string };
  verifier?: { address: string; secretKey: string };
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginInner />
    </React.Suspense>
  );
}

function LoginInner() {
  const { identity, signInNew, signInWithKey } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [busy, setBusy] = React.useState<string | null>(null);
  const [demo, setDemo] = React.useState<DemoIdentities>({});
  const devMode = (process.env.NEXT_PUBLIC_AUTH_MODE ?? "dev") === "dev";

  React.useEffect(() => {
    if (!devMode) return;
    fetch("/api/dev/identities")
      .then((r) => (r.ok ? r.json() : { identities: {} }))
      .then((d) => setDemo(d.identities ?? {}))
      .catch(() => setDemo({}));
  }, [devMode]);

  async function run(key: string, fn: () => Promise<void>) {
    setBusy(key);
    try {
      await fn();
      router.push(next);
    } finally {
      setBusy(null);
    }
  }

  if (identity) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="flex flex-col gap-3 pt-5">
          <CardTitle>You&apos;re signed in</CardTitle>
          <CardDescription>
            Signed in as <strong>{identity.label}</strong>
          </CardDescription>
          <AddressPill value={identity.address} />
          <Button onClick={() => router.push(next)}>Continue</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-muted">
          Your account is a real Sui address. Sign in creates or restores it in this browser.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-5">
          <CardTitle>Households &amp; donors</CardTitle>
          <CardDescription>
            Creates a wallet for you — no seed phrase, no app to install. Use this to claim aid with
            your reference code or to donate.
          </CardDescription>
          <Button
            loading={busy === "new"}
            onClick={() => run("new", signInNew)}
            fullWidth
          >
            Continue with a new account
          </Button>
        </CardContent>
      </Card>

      {devMode && (demo.official || demo.verifier) && (
        <Card>
          <CardContent className="flex flex-col gap-3 pt-5">
            <CardTitle>Demo officials</CardTitle>
            <CardDescription>
              Preconfigured accounts for the walkthrough — the official holds registrar
              capabilities for all three channels; the verifier can approve pending registrations.
            </CardDescription>
            <div className="flex flex-col gap-2">
              {demo.official && (
                <Button
                  variant="secondary"
                  loading={busy === "official"}
                  onClick={() =>
                    run("official", () => signInWithKey(demo.official!.secretKey, "Demo official"))
                  }
                  fullWidth
                >
                  Sign in as demo official
                </Button>
              )}
              {demo.verifier && (
                <Button
                  variant="secondary"
                  loading={busy === "verifier"}
                  onClick={() =>
                    run("verifier", () => signInWithKey(demo.verifier!.secretKey, "Demo verifier"))
                  }
                  fullWidth
                >
                  Sign in as demo verifier
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Callout tone="info" title="Google sign-in (zkLogin)">
        Real Google zkLogin is being wired up. Until then this build uses a browser-held testnet
        key so every flow can be demonstrated end to end.
      </Callout>
    </div>
  );
}
