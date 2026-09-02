import { NextResponse } from "next/server";
import { z } from "zod";
import { hashReferenceCode } from "@/lib/refcode";
import { getRegistrationByCodeHash } from "@/lib/queries";
import { readRegistration } from "@/lib/sui/read";
import { RegistrationStatus } from "@/lib/types";

const Schema = z.object({ code: z.string().min(4).max(64) });

// Resolves a reference code to its registration (via the hashed mirror), then
// confirms against the chain. Returns just what the claim UI needs.
export async function POST(request: Request) {
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter your reference code." }, { status: 400 });

  const code = parsed.data.code.trim().toUpperCase();
  const hashHex = hashReferenceCode(code);

  const mirror = await getRegistrationByCodeHash(hashHex);
  if (!mirror) {
    return NextResponse.json(
      { error: "No registration matches that code. Check the slip and try again." },
      { status: 404 },
    );
  }

  const chain = await readRegistration(mirror.id);
  const status = chain?.status ?? mirror.status;
  const claimed = chain?.claimed ?? mirror.claimed;

  return NextResponse.json({
    registrationId: mirror.id,
    zoneId: chain?.zoneId ?? mirror.zoneId,
    householdId: mirror.householdId,
    tier: mirror.tier,
    postcode: mirror.postcode,
    status,
    claimed,
    headOfHousehold: chain?.headOfHousehold ?? mirror.headOfHousehold,
    canClaim: status === RegistrationStatus.Verified && !claimed,
  });
}
