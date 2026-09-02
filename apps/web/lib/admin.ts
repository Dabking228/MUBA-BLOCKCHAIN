import "server-only";
import { Transaction } from "@mysten/sui/transactions";
import { getSuiClient } from "@/lib/sui/client";
import { adminKeypair } from "@/lib/sui/keys";
import { explainError } from "@/lib/sui/errors";

/** Throws a Response-worthy error if the admin console secret is missing/wrong. */
export function assertAdminSecret(request: Request): void {
  const provided = request.headers.get("x-admin-secret");
  const expected = process.env.ADMIN_CONSOLE_SECRET;
  if (!expected) throw new AdminAuthError("Admin console is not configured.");
  if (!provided || provided !== expected) throw new AdminAuthError("Invalid admin passcode.");
}

export class AdminAuthError extends Error {}

interface AdminExecResult {
  digest: string;
  createdByType: Record<string, string[]>; // type substring → object ids created
}

/** Build, sign (admin key), execute, and index the created objects by type. */
export async function execAdmin(build: (tx: Transaction) => void): Promise<AdminExecResult> {
  const client = getSuiClient();
  const tx = new Transaction();
  build(tx);

  const res = await client.signAndExecuteTransaction({
    transaction: tx,
    signer: adminKeypair(),
    include: { effects: true, objectTypes: true },
  });
  const done = res.Transaction ?? res.FailedTransaction;
  if (!done || !done.effects.status.success) {
    throw new Error(explainError(done?.effects.status.error));
  }
  await client.waitForTransaction({ digest: done.digest });

  const types = done.objectTypes ?? {};
  const createdByType: Record<string, string[]> = {};
  for (const co of done.effects.changedObjects) {
    if (co.idOperation !== "Created") continue;
    const t = types[co.objectId] ?? "";
    const key = t.split("::").slice(-1)[0]?.split("<")[0] ?? t;
    (createdByType[key] ??= []).push(co.objectId);
  }
  return { digest: done.digest, createdByType };
}
