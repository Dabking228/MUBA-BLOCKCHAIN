import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { isValidSuiObjectId } from "@mysten/sui/utils";
import { publicEnv } from "@/lib/env";
import { AdminAuthError, assertAdminSecret } from "@/lib/admin";
import { serviceClient } from "@/lib/supabase/admin";
import { getZoneEvidence, getZones } from "@/lib/queries";
import { completeJsonMulti } from "@/lib/gonka/client";
import { CREDIBILITY_MODELS } from "@/lib/gonka/models";
import { resolveZoneCredibilityConsensus } from "@/lib/gonka/consensus";
import { explainError } from "@/lib/sui/errors";
import type { CredibilityLabel, ModelCredibilityResult } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 90;

const Schema = z.object({ zoneId: z.string().refine(isValidSuiObjectId) });

const VALID_LABELS: CredibilityLabel[] = [
  "well-supported",
  "partially-supported",
  "insufficient-evidence",
  "inconsistent",
];

const SYSTEM = `You assess whether evidence submitted for a disaster-relief zone credibly supports
its claims. You have NO ability to browse the internet, search, or verify anything beyond the
exact text given to you below — base your assessment ONLY on that text.

Labels:
- "well-supported": the evidence specifically names this location/region and a matching
  timeframe, and clearly describes a disaster consistent with the zone's claims.
- "partially-supported": relevant evidence exists but is missing specifics (exact location, date)
  or only weakly matches.
- "insufficient-evidence": no evidence was provided, or what was provided does not relate to a
  disaster/relief situation at all (e.g. off-topic text). This is NOT an accusation of fraud —
  simply note evidence is needed.
- "inconsistent": the evidence provided DOES describe a disaster or relief situation, but it
  contradicts the zone's specific claims (wrong location, wrong postcode, wrong timeframe).

Always cite the specific phrase or fact you relied on (or explicitly note its absence) in your
summary — never give a verdict without pointing at something concrete.

Respond with compact JSON only:
{"label":"well-supported|partially-supported|insufficient-evidence|inconsistent","score":<0-100>,"summary":"<=60 words"}`;

interface ModelOut {
  label: CredibilityLabel;
  score: number;
  summary: string;
}

// Runs the zone's evidence past all CREDIBILITY_MODELS in parallel, persists
// one row per model (including failures), and returns the deterministic
// consensus. Never gates or changes anything about the zone itself — purely
// advisory, same principle as the existing AI verifier triage.
export async function POST(request: Request) {
  try {
    assertAdminSecret(request);
    if (!publicEnv.enableZoneCredibility) {
      return NextResponse.json({ error: "Not available" }, { status: 404 });
    }
    const { zoneId } = Schema.parse(await request.json());

    const [zones, evidence] = await Promise.all([getZones(), getZoneEvidence(zoneId)]);
    const zone = zones.find((z) => z.id === zoneId);
    if (!zone) return NextResponse.json({ error: "Zone not found" }, { status: 404 });

    const evidenceText = evidence.length
      ? evidence
          .map((e, i) => {
            const source = e.sourceType === "url" ? e.url : "pasted text";
            const note = e.fetchStatus === "failed" ? " — fetch failed, treat as unavailable" : "";
            return `Source ${i + 1} (${source}${note}):\n${e.extractedText || "(no text extracted)"}`;
          })
          .join("\n\n")
      : "No evidence has been submitted for this zone yet.";

    const userPrompt = `Zone claims under review:
- Name: ${zone.name}
- Eligible postcodes: ${zone.eligiblePostcodes.join(", ") || "(none set)"}
- Active: ${zone.active}

Submitted evidence:
${evidenceText}`;

    // Reasoning models (e.g. MiniMax) emit a <think>…</think> preamble before
    // the JSON — too small a budget truncates the response before any JSON is
    // ever produced (observed: "No JSON found in model output" at 400 tokens).
    const results = await completeJsonMulti<ModelOut>(SYSTEM, userPrompt, CREDIBILITY_MODELS, {
      maxTokens: 1200,
    });

    const perModel: ModelCredibilityResult[] = results.map((r) => {
      if (!r.ok || !r.data) {
        return { model: r.model, ok: false, error: r.error ?? "No response" };
      }
      const label = VALID_LABELS.includes(r.data.label) ? r.data.label : "insufficient-evidence";
      const score = Math.max(0, Math.min(100, Math.round(Number(r.data.score) || 0)));
      return {
        model: r.model,
        ok: true,
        label,
        score,
        summary: String(r.data.summary ?? "").slice(0, 400),
        gonkaRequestId: r.requestId,
      };
    });

    const runId = randomUUID();
    const sb = serviceClient();
    await sb.from("zone_credibility_results").insert(
      perModel.map((m) => ({
        zone_id: zoneId,
        run_id: runId,
        model: m.model,
        label: m.ok ? (m.label ?? null) : null,
        score: m.ok ? (m.score ?? null) : null,
        summary: m.ok ? (m.summary ?? null) : null,
        gonka_request_id: m.gonkaRequestId ?? null,
        error: m.ok ? null : (m.error ?? "Unknown error"),
      })),
    );

    const consensus = resolveZoneCredibilityConsensus(perModel);
    return NextResponse.json({ zoneId, runId, consensus, perModel });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[/api/admin/zone/credibility]", err);
    return NextResponse.json({ error: explainError(err) }, { status: 400 });
  }
}
