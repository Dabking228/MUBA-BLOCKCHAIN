"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useSession } from "@/components/providers/SessionProvider";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { ResolvedRoles } from "@/lib/types";

export function RequireSignIn({
  children,
  need,
  needLabel,
}: {
  children: ReactNode;
  /** Optional predicate on resolved roles — e.g. r => r.registrarChannels.length > 0 */
  need?: (roles: ResolvedRoles) => boolean;
  needLabel?: string;
}) {
  const { identity, roles, loading } = useSession();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex justify-center py-16 text-muted">
        <Spinner />
      </div>
    );
  }

  if (!identity) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="flex flex-col items-start gap-3 pt-5">
          <CardTitle>Sign in required</CardTitle>
          <CardDescription>You need to be signed in to use this page.</CardDescription>
          <Link href={`/login?next=${encodeURIComponent(pathname)}`} className={buttonClasses()}>
            Sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (need && roles && !need(roles)) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="flex flex-col gap-2 pt-5">
          <CardTitle>Not authorised</CardTitle>
          <CardDescription>
            {needLabel ??
              "Your account does not hold the capability required for this page. An admin can grant it on the Capabilities page."}
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
