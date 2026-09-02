import { NextResponse } from "next/server";
import { isValidSuiAddress } from "@mysten/sui/utils";
import { readAddressBalance } from "@/lib/sui/read";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const address = new URL(request.url).searchParams.get("address");
  if (!address || !isValidSuiAddress(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }
  return NextResponse.json({ balance: await readAddressBalance(address) });
}
