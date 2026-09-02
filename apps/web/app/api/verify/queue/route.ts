import { NextResponse } from "next/server";
import { getPendingRegistrations } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ registrations: await getPendingRegistrations() });
}
