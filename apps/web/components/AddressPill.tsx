"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { shortAddress } from "@/lib/format";

const EXPLORER = "https://testnet.suivision.xyz";

export function AddressPill({
  value,
  kind = "address",
  chars = 4,
  className,
  showExplorer = true,
}: {
  value: string | null | undefined;
  kind?: "address" | "object" | "txblock";
  chars?: number;
  className?: string;
  showExplorer?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  if (!value) return <span className="text-muted">—</span>;

  async function copy() {
    try {
      await navigator.clipboard.writeText(value!);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable */
    }
  }

  const href = `${EXPLORER}/${kind}/${value}`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-surface-muted px-2 py-0.5 font-mono text-xs text-foreground",
        className,
      )}
    >
      <span title={value}>{shortAddress(value, chars)}</span>
      <button
        type="button"
        onClick={copy}
        className="text-muted transition-colors hover:text-foreground"
        aria-label="Copy to clipboard"
      >
        {copied ? "✓" : "⧉"}
      </button>
      {showExplorer && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted transition-colors hover:text-primary"
          aria-label="View on explorer"
        >
          ↗
        </a>
      )}
    </span>
  );
}
