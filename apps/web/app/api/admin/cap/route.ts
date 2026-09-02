import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidSuiAddress } from "@mysten/sui/utils";
import { serverEnv } from "@/lib/env";
import { AdminAuthError, assertAdminSecret, execAdmin } from "@/lib/admin";
import { issueRegistrarCap, issueVerifierCap } from "@/lib/sui/contract";
import { explainError } from "@/lib/sui/errors";
import type { Channel } from "@/lib/types";

const Schema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("registrar"),
    to: z.string().refine(isValidSuiAddress),
    channel: z.number().int().min(0).max(2),
  }),
  z.object({
    kind: z.literal("verifier"),
    to: z.string().refine(isValidSuiAddress),
  }),
]);

export async function POST(request: Request) {
  try {
    assertAdminSecret(request);
    const p = Schema.parse(await request.json());
    const adminCapId = serverEnv().adminCapId;

    const { digest, createdByType } = await execAdmin(
      p.kind === "registrar"
        ? issueRegistrarCap({ adminCapId, to: p.to, channel: p.channel as Channel })
        : issueVerifierCap({ adminCapId, to: p.to }),
    );

    const capId =
      p.kind === "registrar" ? createdByType.RegistrarCap?.[0] : createdByType.VerifierCap?.[0];

    return NextResponse.json({ ok: true, digest, capId });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[/api/admin/cap]", err);
    return NextResponse.json({ error: explainError(err) }, { status: 400 });
  }
}
