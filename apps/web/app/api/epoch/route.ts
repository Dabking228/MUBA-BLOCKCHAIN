import { NextResponse } from "next/server";
import { getSuiClient } from "@/lib/sui/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await getSuiClient().getCurrentSystemState();
  const s = (state as { systemState?: { epoch?: string; epochStartTimestampMs?: string } }).systemState;
  return NextResponse.json({
    epoch: Number(s?.epoch ?? 0),
    epochStartTimestampMs: Number(s?.epochStartTimestampMs ?? 0),
  });
}
