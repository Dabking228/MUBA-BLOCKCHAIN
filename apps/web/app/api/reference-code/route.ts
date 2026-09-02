import { NextResponse } from "next/server";
import { generateReferenceCode, hashReferenceCode } from "@/lib/refcode";
import type { ReferenceCodeResponse } from "@/lib/types";

// Generates a one-time reference code and its sha3-256 hash. The plaintext is
// returned once for the official to print; only the hash goes on-chain.
export async function POST() {
  const code = generateReferenceCode();
  const body: ReferenceCodeResponse = { code, codeHash: hashReferenceCode(code) };
  return NextResponse.json(body);
}
