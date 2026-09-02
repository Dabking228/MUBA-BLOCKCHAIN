import { NextResponse } from "next/server";
import { isValidSuiAddress } from "@mysten/sui/utils";
import { getSuiClient } from "@/lib/sui/client";
import { STRUCT } from "@/lib/sui/constants";

export const dynamic = "force-dynamic";

// Lists the relief capabilities owned by an address, with object IDs — the
// register / verify flows need the specific cap object to pass to the contract.
export async function GET(request: Request) {
  const address = new URL(request.url).searchParams.get("address");
  if (!address || !isValidSuiAddress(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  const client = getSuiClient();
  let objects: { objectId?: string; type?: string; json?: unknown }[] = [];
  try {
    const page = await client.listOwnedObjects({ owner: address, limit: 50, include: { json: true } });
    objects = page.objects;
  } catch {
    /* ignore */
  }

  const registrarCaps: { capId: string; channel: number }[] = [];
  let verifierCapId: string | null = null;
  let adminCapId: string | null = null;

  for (const o of objects) {
    const type = o.type ?? "";
    if (!o.objectId) continue;
    if (type.startsWith(STRUCT.RegistrarCap)) {
      registrarCaps.push({
        capId: o.objectId,
        channel: Number((o.json as { channel?: unknown } | undefined)?.channel ?? 0),
      });
    } else if (type.startsWith(STRUCT.VerifierCap)) {
      verifierCapId = o.objectId;
    } else if (type.startsWith(STRUCT.AdminCap)) {
      adminCapId = o.objectId;
    }
  }

  registrarCaps.sort((a, b) => a.channel - b.channel);
  return NextResponse.json({ registrarCaps, verifierCapId, adminCapId });
}
