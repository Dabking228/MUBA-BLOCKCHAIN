"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Callout } from "@/components/ui/Callout";

const KEY = "mysteadyaid.adminSecret";

const AdminSecretContext = React.createContext<string>("");
export const useAdminSecret = () => React.useContext(AdminSecretContext);

/** Simple shared-passcode gate for the admin console (checked server-side on every call). */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const [secret, setSecret] = React.useState("");
  const [ready, setReady] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [checking, setChecking] = React.useState(false);

  React.useEffect(() => {
    try {
      setSecret(sessionStorage.getItem(KEY) ?? "");
    } catch {
      /* storage unavailable */
    }
    setReady(true);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    setError(null);
    try {
      // Validate by attempting a harmless authenticated call.
      const res = await fetch("/api/admin/ping", {
        method: "POST",
        headers: { "x-admin-secret": input },
      });
      if (res.status === 401) {
        setError("That passcode was not accepted.");
        return;
      }
      try {
        sessionStorage.setItem(KEY, input);
      } catch {
        /* storage unavailable — session-only */
      }
      setSecret(input);
    } finally {
      setChecking(false);
    }
  }

  if (!ready) {
    return null; // avoid a hydration flash
  }

  if (!secret) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="flex flex-col gap-4 pt-5">
          <div>
            <CardTitle>Admin console</CardTitle>
            <CardDescription>
              Enter the admin passcode. Admin actions are signed server-side with the AdminCap key.
            </CardDescription>
          </div>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <Field label="Passcode" error={error}>
              <Input
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoComplete="off"
                autoFocus
              />
            </Field>
            <Button type="submit" loading={checking} disabled={!input}>
              Unlock
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <AdminSecretContext.Provider value={secret}>
      <div className="flex flex-col gap-6">
        <Callout tone="warning" title="Admin console">
          You&apos;re acting as the relief authority. These actions move real testnet objects.
          <button
            className="ml-2 font-medium underline"
            onClick={() => {
              try {
                sessionStorage.removeItem(KEY);
              } catch {
                /* ignore */
              }
              setSecret("");
            }}
          >
            Lock
          </button>
        </Callout>
        {children}
      </div>
    </AdminSecretContext.Provider>
  );
}
