import { NextResponse } from "next/server";
import { isValidSuiObjectId } from "@mysten/sui/utils";
import { publicEnv } from "@/lib/env";
import { getZoneEvidence } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!publicEnv.enableZoneCredibility) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  const zoneId = new URL(request.url).searchParams.get("zoneId");
  if (!zoneId || !isValidSuiObjectId(zoneId)) {
    return NextResponse.json({ error: "Invalid zoneId" }, { status: 400 });
  }
  return NextResponse.json({ evidence: await getZoneEvidence(zoneId) });
}
