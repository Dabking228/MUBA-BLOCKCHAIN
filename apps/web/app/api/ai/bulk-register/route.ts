import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidSuiObjectId } from "@mysten/sui/utils";
import { completeJson } from "@/lib/gonka/client";
import { getZones } from "@/lib/queries";
import { Tier, type BulkRegisterDraft } from "@/lib/types";
import { explainError } from "@/lib/sui/errors";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Schema = z.object({
  text: z.string().min(10).max(4000),
  zoneId: z.string().refine(isValidSuiObjectId).optional(),
});

const SYSTEM = `You help a community leader turn a spoken/typed description of flood-affected
households into structured draft registrations. Extract one entry per household.

For each entry produce:
- householdId: a short stable identifier. Use an IC/case number if stated, otherwise a slug of
  the head-of-household name (e.g. "pak-ali-hassan"). Never invent an IC number.
- postcode: 5 digits. If a household's stated postcode is not in the eligible list, keep what was
  said but lower the confidence.
- tier: 0 = minor damage, 1 = major damage, 2 = total loss / uninhabitable.
- damageNotes: one short phrase quoting the described damage.
- headCount: integer if a family size is stated, else omit.
- confidence: 0..1 — how sure you are this entry is complete and correct.

Respond with compact JSON only: {"drafts":[{...}]}. Do not register anything; you only draft.`;

interface ModelOut {
  drafts: {
    householdId?: string;
    postcode?: string;
    tier?: number;
    damageNotes?: string;
    headCount?: number;
    confidence?: number;
  }[];
}

export async function POST(request: Request) {
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "A description of the households is required." }, { status: 400 });
  }

  try {
    const zones = await getZones();
    const zone = parsed.data.zoneId
      ? zones.find((z) => z.id === parsed.data.zoneId)
      : zones[0];
    const eligible = zone?.eligiblePostcodes ?? [];

    const { data, requestId } = await completeJson<ModelOut>(
      SYSTEM,
      `Eligible postcodes for this zone: ${eligible.join(", ") || "(none configured)"}\n\n` +
        `Description:\n${parsed.data.text}`,
      { maxTokens: 1400 },
    );

    const drafts: BulkRegisterDraft[] = (data.drafts ?? [])
      .map((d) => ({
        householdId: String(d.householdId ?? "").trim().slice(0, 120),
        postcode: String(d.postcode ?? "").trim(),
        tier: ([0, 1, 2].includes(Number(d.tier)) ? Number(d.tier) : Tier.Minor) as Tier,
        damageNotes: String(d.damageNotes ?? "").slice(0, 300),
        headCount:
          Number.isFinite(Number(d.headCount)) && Number(d.headCount) > 0
            ? Math.round(Number(d.headCount))
            : undefined,
        confidence: Math.max(0, Math.min(1, Number(d.confidence) || 0.5)),
      }))
      .filter((d) => d.householdId.length > 0);

    return NextResponse.json({ drafts, requestId, zoneId: zone?.id ?? null });
  } catch (err) {
    console.error("[/api/ai/bulk-register]", err);
    return NextResponse.json({ error: explainError(err) }, { status: 502 });
  }
}
