import { createHash } from "node:crypto";

// Crockford-ish alphabet: no I/O/0/1/U to avoid confusion on a printed slip.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTVWXYZ";

function randomGroup(len: number): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

/** A printable one-time reference code, e.g. "MSA-7K4Q-9Wtwo-...". */
export function generateReferenceCode(): string {
  return `MSA-${randomGroup(4)}-${randomGroup(4)}-${randomGroup(4)}`;
}

/** sha3-256 of the code's UTF-8 bytes, hex — matches Move `hash::sha3_256(code)`. */
export function hashReferenceCode(code: string): string {
  return createHash("sha3-256").update(Buffer.from(code, "utf8")).digest("hex");
}
