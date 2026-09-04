import { ABORT_MESSAGES, MODULE, PACKAGE_ID } from "@/lib/sui/constants";

type MaybeExecutionError = {
  message?: string;
  MoveAbort?: { abortCode?: string | number };
  executionError?: { MoveAbort?: { abortCode?: string | number } };
} | null | undefined;

/** Pull a relief_v3 abort code out of a structured error or an error string. */
export function abortCodeFrom(input: unknown): number | null {
  const err = input as MaybeExecutionError;
  const raw = err?.MoveAbort?.abortCode ?? err?.executionError?.MoveAbort?.abortCode;
  if (raw !== undefined && raw !== null) {
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
  }

  const text = typeof input === "string" ? input : (err?.message ?? String(input ?? ""));
  // Sui's actual wording: "MoveAbort in 1st command, abort code: 3, in '…' (instruction 33)".
  // Match the labelled "abort code:" specifically — a generic trailing-digits
  // pattern would grab the instruction number or an unrelated "1st" instead.
  const m =
    text.match(/abort[\s_]?code[:=\s]+(\d+)/i) ?? text.match(/abort_code["'\s:=]+(\d+)/i);
  return m ? Number(m[1]) : null;
}

/** True for a failed cryptographic verification of a zkLogin (Google) signature. */
export function isZkLoginSignatureError(input: unknown): boolean {
  const text =
    typeof input === "string"
      ? input
      : (input as { message?: string })?.message ?? String(input ?? "");
  return /groth16|invalid user signature|zklogin/i.test(text);
}

/** Human-readable message for an on-chain / SDK error, mapped to relief_v3 semantics. */
export function explainError(input: unknown): string {
  const code = abortCodeFrom(input);
  if (code !== null && ABORT_MESSAGES[code]) return ABORT_MESSAGES[code];

  const text =
    typeof input === "string"
      ? input
      : (input as { message?: string })?.message ?? String(input ?? "Unknown error");

  if (isZkLoginSignatureError(text)) {
    return "Your Google sign-in could not be verified on-chain. This usually clears up by signing out and signing in with Google again — please retry.";
  }
  if (/insufficient|gas|balance/i.test(text) && /budget|coin|gas/i.test(text)) {
    return "The sponsor account is out of gas. Please try again shortly.";
  }
  if (code !== null && text.includes(`${PACKAGE_ID}::${MODULE}`)) {
    return `The relief contract rejected this transaction (abort code ${code}).`;
  }
  if (text.includes(`${PACKAGE_ID}::${MODULE}`)) {
    return "The transaction was rejected by the relief contract.";
  }
  return text.length > 200 ? "The transaction could not be completed." : text;
}
