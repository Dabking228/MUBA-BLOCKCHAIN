import { ABORT_MESSAGES, MODULE, PACKAGE_ID } from "@/lib/sui/constants";

type MaybeExecutionError = {
  message?: string;
  MoveAbort?: { abortCode?: string | number };
} | null | undefined;

/** Pull a relief_v3 abort code out of a structured error or an error string. */
export function abortCodeFrom(input: unknown): number | null {
  const err = input as MaybeExecutionError;
  const raw = err?.MoveAbort?.abortCode;
  if (raw !== undefined && raw !== null) {
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
  }
  const text = typeof input === "string" ? input : (err?.message ?? String(input ?? ""));
  // e.g. "MoveAbort(... relief_v3 ...) 6" or "abort_code: 6"
  const m =
    text.match(/MoveAbort.*?(\d+)\s*\)?\s*$/) ??
    text.match(/abort(?:_?code)?[^0-9]*(\d+)/i);
  return m ? Number(m[1]) : null;
}

/** Human-readable message for an on-chain / SDK error, mapped to relief_v3 semantics. */
export function explainError(input: unknown): string {
  const code = abortCodeFrom(input);
  if (code !== null && ABORT_MESSAGES[code]) return ABORT_MESSAGES[code];

  const text =
    typeof input === "string"
      ? input
      : (input as { message?: string })?.message ?? String(input ?? "Unknown error");

  if (/insufficient|gas|balance/i.test(text) && /budget|coin|gas/i.test(text)) {
    return "The sponsor account is out of gas. Please try again shortly.";
  }
  if (text.includes(`${PACKAGE_ID}::${MODULE}`)) {
    return "The transaction was rejected by the relief contract.";
  }
  return text.length > 200 ? "The transaction could not be completed." : text;
}
