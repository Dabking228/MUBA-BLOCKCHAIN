"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Callout } from "@/components/ui/Callout";
import { CredibilityBadge } from "@/components/CredibilityBadge";
import { AddressPill } from "@/components/AddressPill";
import { useToast } from "@/components/ui/Toast";
import type { ModelCredibilityResult, ZoneCredibilityRun, ZoneEvidenceItem } from "@/lib/types";

export function ZoneCredibilityPanel({ zoneId, secret }: { zoneId: string; secret: string }) {
  const toast = useToast();
  const [evidence, setEvidence] = React.useState<ZoneEvidenceItem[]>([]);
  const [run, setRun] = React.useState<ZoneCredibilityRun | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [mode, setMode] = React.useState<"url" | "text">("url");
  const [value, setValue] = React.useState("");
  const [addingBusy, setAddingBusy] = React.useState(false);
  const [checking, setChecking] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    const [ev, cr] = await Promise.all([
      fetch(`/api/zones/evidence?zoneId=${zoneId}`).then((r) => (r.ok ? r.json() : { evidence: [] })),
      fetch(`/api/zones/credibility?zoneId=${zoneId}`).then((r) => (r.ok ? r.json() : null)),
    ]);
    setEvidence(ev.evidence ?? []);
    setRun(cr);
    setLoading(false);
  }, [zoneId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function addEvidence(e: React.FormEvent) {
    e.preventDefault();
    setAddingBusy(true);
    setError(null);
    try {
      const body =
        mode === "url"
          ? { zoneId, sourceType: "url" as const, url: value.trim() }
          : { zoneId, sourceType: "text" as const, text: value.trim() };
      const res = await fetch("/api/admin/zone/evidence", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-secret": secret },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to add evidence");
      if (json.evidence?.fetchStatus === "failed") {
        toast({
          title: "Added, but the fetch failed",
          description: "That URL couldn't be read automatically — consider pasting the text instead.",
          tone: "warning",
        });
      } else {
        toast({ title: "Evidence added", tone: "success" });
      }
      setValue("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setAddingBusy(false);
    }
  }

  async function checkCredibility() {
    setChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/zone/credibility", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-secret": secret },
        body: JSON.stringify({ zoneId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Credibility check failed");
      setRun(json);
      toast({ title: "Credibility check complete", tone: "success" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-surface-muted p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Evidence &amp; credibility</p>
        <CredibilityBadge label={run?.consensus.label ?? null} />
      </div>

      {loading ? (
        <p className="text-xs text-muted">Loading…</p>
      ) : (
        <>
          {evidence.length === 0 ? (
            <p className="text-xs text-muted">No evidence added yet.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {evidence.map((e) => (
                <li key={e.id} className="text-xs text-muted">
                  {e.sourceType === "url" ? (
                    <a
                      href={e.url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {e.url}
                    </a>
                  ) : (
                    <span>Pasted text ({e.extractedText.length} chars)</span>
                  )}{" "}
                  {e.fetchStatus === "failed" && <span className="text-danger">— fetch failed</span>}
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={addEvidence} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Select
                value={mode}
                onChange={(ev) => {
                  setMode(ev.target.value as "url" | "text");
                  setValue("");
                }}
                className="h-9 w-36 py-1 text-xs"
              >
                <option value="url">Source URL</option>
                <option value="text">Pasted text</option>
              </Select>
              {mode === "url" && (
                <Input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="https://…"
                  className="h-9 flex-1 text-xs"
                />
              )}
            </div>
            {mode === "text" && (
              <Textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Paste the relevant article/advisory text…"
                rows={3}
                className="text-xs"
              />
            )}
            <Button
              size="sm"
              type="submit"
              loading={addingBusy}
              disabled={value.trim().length < 4}
              className="self-start"
            >
              Add evidence
            </Button>
          </form>

          {error && <Callout tone="danger">{error}</Callout>}

          <Button size="sm" variant="secondary" loading={checking} onClick={checkCredibility} className="self-start">
            Check credibility (3 models)
          </Button>

          {run && run.perModel.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted">
                {run.consensus.respondedCount} of {run.consensus.totalModels} models responded
                {run.consensus.agreement === "split"
                  ? " — opinions differed, showing the most cautious label"
                  : ""}
                {run.consensus.score !== null ? ` · avg score ${run.consensus.score}/100` : ""}
              </p>
              {run.perModel.map((m) => (
                <ModelResultRow key={m.model} result={m} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ModelResultRow({ result }: { result: ModelCredibilityResult }) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-border bg-surface p-2 text-xs">
        <span className="font-mono">{result.model}</span>{" "}
        <span className="text-danger">— no response ({result.error ?? "error"})</span>
      </div>
    );
  }
  return (
    <div className="rounded-md border border-border bg-surface p-2 text-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono">{result.model}</span>
        <CredibilityBadge label={result.label ?? null} />
      </div>
      <p className="mt-1 text-muted">{result.summary}</p>
      <p className="mt-1 flex items-center gap-1 text-[11px] text-muted">
        score {result.score}/100 · request{" "}
        {result.gonkaRequestId && (
          <AddressPill value={result.gonkaRequestId} showExplorer={false} chars={6} />
        )}
      </p>
    </div>
  );
}
