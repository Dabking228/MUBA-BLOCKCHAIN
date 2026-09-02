import { NextResponse } from "next/server";
import { isValidSuiAddress } from "@mysten/sui/utils";
import { resolveRoles } from "@/lib/sui/roles";
import {
  getDonationsForAddress,
  getPendingRegistrations,
  getRegistrationsForRegistrar,
  getTransparencySummary,
} from "@/lib/queries";
import { readAddressBalance } from "@/lib/sui/read";
import { EMPTY_ROLES } from "@/lib/session/types";

export const dynamic = "force-dynamic";

// One aggregate call powering the combined role dashboard (Handover §4.1).
export async function GET(request: Request) {
  const address = new URL(request.url).searchParams.get("address");
  if (!address || !isValidSuiAddress(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  const roles = await resolveRoles(address).catch(() => EMPTY_ROLES(address));

  const [balance, donations, registrarRegs, pending, summary] = await Promise.all([
    readAddressBalance(address),
    roles.hasDonated ? getDonationsForAddress(address) : Promise.resolve([]),
    roles.registrarChannels.length > 0
      ? getRegistrationsForRegistrar(address)
      : Promise.resolve([]),
    roles.isVerifier ? getPendingRegistrations() : Promise.resolve([]),
    getTransparencySummary(),
  ]);

  return NextResponse.json({
    roles,
    balance,
    donations,
    registrarRegistrations: registrarRegs,
    pendingCount: pending.length,
    summary,
  });
}
