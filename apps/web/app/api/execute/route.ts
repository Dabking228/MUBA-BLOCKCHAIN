import { NextResponse } from "next/server";
import { z } from "zod";
import { executeSponsored } from "@/lib/sui/sponsor";
import { explainError } from "@/lib/sui/errors";
import { runIndexer } from "@/lib/indexer/run";
import type { ExecuteResponse } from "@/lib/types";

const Schema = z.object({
  txBytes: z.string().min(1),
  sponsorSignature: z.string().min(1),
  senderSignature: z.string().min(1),
});

// Executes a sponsored transaction with both signatures, then kicks the indexer
// so the mirror reflects the new state quickly.
export async function POST(request: Request) {
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const { digest } = await executeSponsored(parsed.data);
    // Best-effort: sync the mirror before responding so the UI can refetch.
    await runIndexer().catch((e) => console.error("post-execute indexer:", e));
    const body: ExecuteResponse = { digest, success: true };
    return NextResponse.json(body);
  } catch (err) {
    const body: ExecuteResponse = { digest: "", success: false, error: explainError(err) };
    return NextResponse.json(body, { status: 400 });
  }
}
