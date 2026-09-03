import { NextResponse } from "next/server";
import { z } from "zod";
import { deriveSalt, verifyGoogleJwt } from "@/lib/zklogin/salt";

export const dynamic = "force-dynamic";

const Schema = z.object({ jwt: z.string().min(20) });

export async function POST(request: Request) {
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "jwt required" }, { status: 400 });

  try {
    const verified = await verifyGoogleJwt(parsed.data.jwt);
    return NextResponse.json({ salt: deriveSalt(verified), email: verified.email });
  } catch (err) {
    console.error("[/api/zklogin/salt]", err);
    return NextResponse.json({ error: "Could not verify the Google token." }, { status: 401 });
  }
}
