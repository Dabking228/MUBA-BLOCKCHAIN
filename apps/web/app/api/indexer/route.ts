import { NextResponse } from "next/server";
import { runIndexer } from "@/lib/indexer/run";
import { explainError } from "@/lib/sui/errors";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function handle() {
  try {
    const result = await runIndexer();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("indexer:", err);
    return NextResponse.json({ ok: false, error: explainError(err) }, { status: 500 });
  }
}

// Vercel Cron hits GET; manual triggers (and /api/execute) use either.
export const GET = handle;
export const POST = handle;
