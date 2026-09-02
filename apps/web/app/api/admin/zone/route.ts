import { NextResponse } from "next/server";
import { z } from "zod";
import { adminAddress } from "@/lib/sui/keys";
import { serverEnv } from "@/lib/env";
import { AdminAuthError, assertAdminSecret, execAdmin } from "@/lib/admin";
import {
  registerDisasterZone,
  setTierAmount,
} from "@/lib/sui/contract";
import { serviceClient } from "@/lib/supabase/admin";
import { runIndexer } from "@/lib/indexer/run";
import { explainError } from "@/lib/sui/errors";
import type { Tier } from "@/lib/types";

const Schema = z.object({
  name: z.string().min(3).max(100),
  postcodes: z.array(z.string().min(3).max(12)).min(1).max(50),
  budgetCapMist: z.union([z.string(), z.number()]).transform((v) => BigInt(v)),
  tiers: z.object({
    "0": z.union([z.string(), z.number()]).transform((v) => BigInt(v)),
    "1": z.union([z.string(), z.number()]).transform((v) => BigInt(v)),
    "2": z.union([z.string(), z.number()]).transform((v) => BigInt(v)),
  }),
});

export async function POST(request: Request) {
  try {
    assertAdminSecret(request);
    const p = Schema.parse(await request.json());
    const adminCapId = serverEnv().adminCapId;

    // Create the zone.
    const { createdByType, digest } = await execAdmin(
      registerDisasterZone({
        adminCapId,
        name: p.name,
        eligiblePostcodes: p.postcodes,
        budgetCapMist: p.budgetCapMist,
      }),
    );
    const zoneId = createdByType.DisasterZone?.[0];
    if (!zoneId) throw new Error("Zone was created but its id could not be read.");

    // Set the three tier amounts.
    const tierAmounts: Record<string, string> = {};
    for (const tier of [0, 1, 2] as Tier[]) {
      const amount = p.tiers[String(tier) as "0" | "1" | "2"];
      await execAdmin(setTierAmount({ adminCapId, zoneId, tier, amountMist: amount }));
      tierAmounts[tier] = amount.toString();
    }

    // Mirror immediately (no zone events on-chain).
    await serviceClient().from("disaster_zones").upsert({
      id: zoneId,
      name: p.name,
      active: true,
      eligible_postcodes: p.postcodes,
      tier_amounts: tierAmounts,
      budget_cap: p.budgetCapMist.toString(),
      budget_spent: "0",
      updated_at: new Date().toISOString(),
    });
    await runIndexer().catch(() => {});

    return NextResponse.json({ ok: true, zoneId, digest, adminAddress: adminAddress() });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[/api/admin/zone]", err);
    return NextResponse.json({ error: explainError(err) }, { status: 400 });
  }
}
