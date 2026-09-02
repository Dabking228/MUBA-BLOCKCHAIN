import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidSuiObjectId } from "@mysten/sui/utils";
import { serverEnv } from "@/lib/env";
import { AdminAuthError, assertAdminSecret, execAdmin } from "@/lib/admin";
import { setTierAmount } from "@/lib/sui/contract";
import { serviceClient } from "@/lib/supabase/admin";
import { runIndexer } from "@/lib/indexer/run";
import { explainError } from "@/lib/sui/errors";
import type { Tier } from "@/lib/types";

const Schema = z.object({
  zoneId: z.string().refine(isValidSuiObjectId),
  tier: z.number().int().min(0).max(2),
  amountMist: z.union([z.string(), z.number()]).transform((v) => BigInt(v)),
});

export async function POST(request: Request) {
  try {
    assertAdminSecret(request);
    const p = Schema.parse(await request.json());
    const adminCapId = serverEnv().adminCapId;

    const { digest } = await execAdmin(
      setTierAmount({ adminCapId, zoneId: p.zoneId, tier: p.tier as Tier, amountMist: p.amountMist }),
    );

    const sb = serviceClient();
    const { data } = await sb
      .from("disaster_zones")
      .select("tier_amounts")
      .eq("id", p.zoneId)
      .maybeSingle();
    const tierAmounts = { ...(data?.tier_amounts ?? {}), [p.tier]: p.amountMist.toString() };
    await sb
      .from("disaster_zones")
      .update({ tier_amounts: tierAmounts, updated_at: new Date().toISOString() })
      .eq("id", p.zoneId);
    await runIndexer().catch(() => {});

    return NextResponse.json({ ok: true, digest });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[/api/admin/tier]", err);
    return NextResponse.json({ error: explainError(err) }, { status: 400 });
  }
}
