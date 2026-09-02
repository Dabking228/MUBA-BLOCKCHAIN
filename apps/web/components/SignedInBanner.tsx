"use client";

import Link from "next/link";
import { useSession } from "@/components/providers/SessionProvider";
import { buttonClasses } from "@/components/ui/Button";

/** Shown on the public landing when the visitor already has a session. */
export function SignedInBanner() {
  const { identity } = useSession();
  if (!identity) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary-soft px-4 py-3">
      <p className="text-sm text-foreground">
        You&apos;re signed in as <strong>{identity.label}</strong>.
      </p>
      <Link href="/home" className={buttonClasses({ size: "sm" })}>
        Go to your dashboard
      </Link>
    </div>
  );
}
