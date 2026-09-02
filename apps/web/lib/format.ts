/** Formatting helpers shared across the app. All on-chain amounts are MIST (1 SUI = 1e9 MIST). */

export const MIST_PER_SUI = 1_000_000_000n;

/** Parse a user-entered SUI amount (e.g. "0.25") into a MIST bigint. Throws on invalid input. */
export function suiToMist(input: string | number): bigint {
  const str = String(input).trim();
  if (!/^\d*(\.\d{1,9})?$/.test(str) || str === "" || str === ".") {
    throw new Error(`Invalid SUI amount: "${input}"`);
  }
  const [whole, frac = ""] = str.split(".");
  const paddedFrac = frac.padEnd(9, "0");
  return BigInt(whole || "0") * MIST_PER_SUI + BigInt(paddedFrac || "0");
}

/** Format a MIST amount (bigint | string | number) as a SUI string with up to `maxFractionDigits`. */
export function mistToSui(
  mist: bigint | string | number,
  maxFractionDigits = 4,
): string {
  const value = typeof mist === "bigint" ? mist : BigInt(Math.trunc(Number(mist)));
  const negative = value < 0n;
  const abs = negative ? -value : value;
  const whole = abs / MIST_PER_SUI;
  const frac = abs % MIST_PER_SUI;
  let fracStr = frac.toString().padStart(9, "0").slice(0, maxFractionDigits).replace(/0+$/, "");
  const wholeStr = whole.toLocaleString("en-US");
  return `${negative ? "-" : ""}${wholeStr}${fracStr ? `.${fracStr}` : ""}`;
}

/** "0.25 SUI" */
export function formatSui(mist: bigint | string | number, maxFractionDigits = 4): string {
  return `${mistToSui(mist, maxFractionDigits)} SUI`;
}

/** 0x1234…abcd */
export function shortAddress(address: string | null | undefined, chars = 4): string {
  if (!address) return "—";
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(value: string | number | Date | null | undefined): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return dateFmt.format(d);
}

export function formatRelative(value: string | number | Date | null | undefined): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.round(diffMs / 60000);
  if (Math.abs(mins) < 1) return "just now";
  if (Math.abs(mins) < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

/** Percentage 0–100 (clamped), for progress bars. */
export function pct(numerator: bigint | number, denominator: bigint | number): number {
  const n = Number(numerator);
  const d = Number(denominator);
  if (!d || d <= 0) return 0;
  return Math.max(0, Math.min(100, (n / d) * 100));
}
