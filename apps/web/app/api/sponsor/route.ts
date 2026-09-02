import { NextResponse } from "next/server";
import { SPONSORED, SponsorRequestSchema } from "@/lib/sui/actions";
import { buildSponsored } from "@/lib/sui/sponsor";
import { explainError } from "@/lib/sui/errors";

// Builds a sponsored transaction for a whitelisted action and pre-signs it with
// the sponsor key. The client signs the returned bytes and calls /api/execute.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = SponsorRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { action, sender, params } = parsed.data;
  try {
    const thunk = SPONSORED[action](params, sender);
    const { txBytes, sponsorSignature } = await buildSponsored(thunk, sender);
    return NextResponse.json({ txBytes, sponsorSignature });
  } catch (err) {
    console.error("[/api/sponsor]", action, err);
    return NextResponse.json({ error: explainError(err) }, { status: 400 });
  }
}
