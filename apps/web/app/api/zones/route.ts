import { NextResponse } from "next/server";
import { getZones } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ zones: await getZones() });
}
