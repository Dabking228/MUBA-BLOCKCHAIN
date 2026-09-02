import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidSuiObjectId } from "@mysten/sui/utils";
import { completeJson } from "@/lib/gonka/client";
import { serviceClient } from "@/lib/supabase/admin";
import { readRegistration } from "@/lib/sui/read";
import { getZones } from "@/lib/queries";
import { CHANNEL_LABELS, Channel, TIER_LABELS, Tier, type AiRecommendation } from "@/lib/types";
import { explainError } from "@/lib/sui/errors";
import { mistToSui } from "@/lib/format";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Schema = z.object({ registrationId: z.string().refine(isValidSuiObjectId) });

interface ModelOut {
  recommendation: "approve" | "reject" | "needs_review";
  confidence: number;
  reasoning: string;
}

const SYSTEM = `You assist a human verifier reviewing disaster-relief household registrations in Malaysia.
You never make the final decision — you advise. Weigh the facts and consistency checks provided.
Approve when the registration is internally consistent and the checks pass. Recommend reject only
for a clear rule violation (ineligible postcode, inactive zone, duplicate household). Use
needs_review when something is ambiguous or a check failed for a non-obvious reason.
Respond with compact JSON only: {"recommendation":"approve"|"reject"|"needs_review","confidence":<0..1>,"reasoning":"<=60 words"}.`;

export async function POST(request: Request) {
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "registrationId required" }, { status: 400 });
  }

  const sb = serviceClient();

  try {
    const reg = await readRegistration(parsed.data.registrationId);
    if (!reg) return NextResponse.json({ error: "Registration not found" }, { status: 404 });

    const zones = await getZones();
    const zone = zones.find((z) => z.id === reg.zoneId);

    const { data: dupes } = await sb
      .from("household_registrations")
      .select("id,status")
      .eq("household_id", reg.householdId)
      .neq("id", reg.id);

    const checks = {
      postcodeEligible: zone ? zone.eligiblePostcodes.includes(reg.postcode) : null,
      zoneActive: zone?.active ?? null,
      tierHasAmount: zone ? Boolean(zone.tierAmounts[reg.tier]) : null,
      otherRegistrationsForHousehold: dupes?.length ?? 0,
    };

    const facts = {
      householdId: reg.householdId,
      postcode: reg.postcode,
      channel: CHANNEL_LABELS[reg.channel as Channel],
      channelAutoVerifies: reg.channel !== Channel.CommunityLeader,
      assessedTier: TIER_LABELS[reg.tier as Tier],
      payoutForTier: zone?.tierAmounts[reg.tier]
        ? `${mistToSui(zone.tierAmounts[reg.tier])} SUI`
        : "not set",
      zone: zone
        ? { name: zone.name, eligiblePostcodes: zone.eligiblePostcodes, active: zone.active }
        : "unknown",
      checks,
    };

    const { data, requestId } = await completeJson<ModelOut>(
      SYSTEM,
      `Registration under review:\n${JSON.stringify(facts, null, 2)}`,
    );

    const recommendation: AiRecommendation["recommendation"] = [
      "approve",
      "reject",
      "needs_review",
    ].includes(data.recommendation)
      ? data.recommendation
      : "needs_review";
    const confidence = Math.max(0, Math.min(1, Number(data.confidence) || 0));

    await sb.from("ai_recommendations").insert({
      registration_id: reg.id,
      gonka_request_id: requestId,
      recommendation,
      confidence,
      reasoning: data.reasoning ?? "",
    });

    const result: AiRecommendation = {
      registrationId: reg.id,
      gonkaRequestId: requestId,
      recommendation,
      confidence,
      reasoning: data.reasoning ?? "",
      createdAt: new Date().toISOString(),
    };
    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/ai/triage]", err);
    return NextResponse.json({ error: explainError(err) }, { status: 502 });
  }
}
