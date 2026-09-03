"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/components/providers/SessionProvider";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Callout } from "@/components/ui/Callout";
import { AddressPill } from "@/components/AddressPill";

interface DemoIdentities {
  official?: { address: string; secretKey: string };
  verifier?: { address: string; secretKey: string };
}

const SHOW_DEMO = (process.env.NEXT_PUBLIC_SHOW_DEMO_LOGINS ?? "true") === "true";
const HAS_GOOGLE = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.85 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.67-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.06l3.67 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

function ImportKeyForm({ onImport, busy }: { onImport: (key: string) => void; busy: boolean }) {
  const [key, setKey] = React.useState("");
  return (
    <div className="mt-3 flex flex-col gap-2">
      <Field label="Secret key (suiprivkey1…)">
        <Input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="suiprivkey1…"
          className="font-mono text-xs"
          autoComplete="off"
        />
      </Field>
      <Button
        size="sm"
        variant="secondary"
        loading={busy}
        disabled={!key.startsWith("suiprivkey1")}
        onClick={() => onImport(key.trim())}
      >
        Sign in with this key
      </Button>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginInner />
    </React.Suspense>
  );
}

function LoginInner() {
  const { identity, signInNew, signInWithKey, signInGoogle } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/home";
  const [busy, setBusy] = React.useState<string | null>(null);
  const [demo, setDemo] = React.useState<DemoIdentities>({});

  React.useEffect(() => {
    if (!SHOW_DEMO) return;
    fetch("/api/dev/identities")
      .then((r) => (r.ok ? r.json() : { identities: {} }))
      .then((d) => setDemo(d.identities ?? {}))
      .catch(() => setDemo({}));
  }, []);

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
          Your account is a real Sui address. Sign in with Google (zkLogin) — no seed phrase, no
          wallet app, no gas.
        </p>
      </div>

      {HAS_GOOGLE && (
        <Card>
          <CardContent className="flex flex-col gap-3 pt-5">
            <CardTitle>Households &amp; donors</CardTitle>
            <CardDescription>
              Google verifies who you are; a zero-knowledge proof binds a Sui address to your
              account without revealing anything to the chain.
            </CardDescription>
            <Button
              variant="secondary"
              fullWidth
              loading={busy === "google"}
              onClick={() => {
                setBusy("google");
                signInGoogle(next).catch(() => setBusy(null));
              }}
            >
              <GoogleIcon />
              Continue with Google
            </Button>
          </CardContent>
        </Card>
      )}

      {SHOW_DEMO && (
        <Card>
          <CardContent className="flex flex-col gap-3 pt-5">
            <CardTitle>Demo accounts</CardTitle>
            <CardDescription>
              For the walkthrough without a Google login. A throwaway browser key stands in for
              zkLogin.
            </CardDescription>
            <div className="flex flex-col gap-2">
              <Button
                loading={busy === "new"}
                onClick={() => run("new", signInNew)}
                fullWidth
              >
                Continue with a new account
              </Button>
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

      {SHOW_DEMO && (
        <details className="rounded-lg border border-border bg-surface px-4 py-3 text-sm">
          <summary className="cursor-pointer font-medium text-muted">
            Advanced — sign in with an existing key
          </summary>
          <ImportKeyForm
            onImport={(k) => run("import", () => signInWithKey(k, "Imported account"))}
            busy={busy === "import"}
          />
        </details>
      )}

      {!HAS_GOOGLE && (
        <Callout tone="warning">
          Google sign-in is not configured (`NEXT_PUBLIC_GOOGLE_CLIENT_ID` missing).
        </Callout>
      )}
    </div>
  );
}
