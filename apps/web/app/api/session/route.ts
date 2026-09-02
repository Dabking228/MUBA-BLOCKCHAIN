import { NextResponse } from "next/server";
import { isValidSuiAddress } from "@mysten/sui/utils";
import { resolveRoles } from "@/lib/sui/roles";
import { EMPTY_ROLES } from "@/lib/session/types";

export const dynamic = "force-dynamic";

// Live role resolution per Handover §4.1.
export async function GET(request: Request) {
  const address = new URL(request.url).searchParams.get("address");
  if (!address || !isValidSuiAddress(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }
  try {
    return NextResponse.json(await resolveRoles(address));
  } catch (err) {
    console.error("resolveRoles:", err);
    return NextResponse.json(EMPTY_ROLES(address));
  }
}
