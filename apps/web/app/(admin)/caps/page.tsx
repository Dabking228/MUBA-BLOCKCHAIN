"use client";

import * as React from "react";
import { AdminGate, useAdminSecret } from "@/components/admin/AdminGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { Callout } from "@/components/ui/Callout";
import { AddressPill } from "@/components/AddressPill";
import { useToast } from "@/components/ui/Toast";
import { CHANNEL_LABELS, Channel } from "@/lib/types";

export default function CapsPage() {
  return (
    <AdminGate>
      <CapsConsole />
    </AdminGate>
  );
}

function CapsConsole() {
  const secret = useAdminSecret();
  const toast = useToast();
  const [kind, setKind] = React.useState<"registrar" | "verifier">("registrar");
  const [channel, setChannel] = React.useState<Channel>(Channel.PPS);
  const [to, setTo] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [issued, setIssued] = React.useState<{ capId?: string; digest: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setIssued(null);
    try {
      const body =
        kind === "registrar" ? { kind, to, channel } : { kind, to };
      const res = await fetch("/api/admin/cap", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-secret": secret },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to issue capability");
      setIssued({ capId: json.capId, digest: json.digest });
      toast({ title: `${kind === "registrar" ? "Registrar" : "Verifier"} capability issued`, tone: "success" });
      setTo("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Capabilities</h1>
        <p className="mt-1 text-sm text-muted">
          Grant an official the right to register households (per channel) or to verify pending
          registrations. The recipient address is the one shown on their sign-in screen.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Issue a capability</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <Field label="Capability type">
              <Select value={kind} onChange={(e) => setKind(e.target.value as "registrar" | "verifier")}>
                <option value="registrar">Registrar (register households)</option>
                <option value="verifier">Verifier (approve/reject pending)</option>
              </Select>
            </Field>
            {kind === "registrar" && (
              <Field label="Channel" hint="Determines whether registrations auto-verify (PPS / District) or stay pending (Ketua Kampung).">
                <Select
                  value={String(channel)}
                  onChange={(e) => setChannel(Number(e.target.value) as Channel)}
                >
                  {Object.entries(CHANNEL_LABELS).map(([v, label]) => (
                    <option key={v} value={v}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
            <Field label="Recipient address" required>
              <Input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="0x…"
                className="font-mono text-xs"
              />
            </Field>
            {error && <Callout tone="danger">{error}</Callout>}
            {issued && (
              <Callout tone="success" title="Capability issued">
                <div className="flex flex-col gap-1">
                  {issued.capId && (
                    <span>
                      Object <AddressPill value={issued.capId} kind="object" />
                    </span>
                  )}
                  <span>
                    Tx <AddressPill value={issued.digest} kind="txblock" showExplorer />
                  </span>
                </div>
              </Callout>
            )}
            <Button type="submit" loading={busy} disabled={!to}>
              Issue capability
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
