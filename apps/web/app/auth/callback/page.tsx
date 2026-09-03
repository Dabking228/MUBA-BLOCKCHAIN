"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/providers/SessionProvider";
import { completeGoogleLogin, type LoginProgress } from "@/lib/zklogin/oauth";
import { Card, CardContent, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Callout } from "@/components/ui/Callout";
import { buttonClasses } from "@/components/ui/Button";
import Link from "next/link";

const STEP_LABEL: Record<LoginProgress["step"], string> = {
  verifying: "Verifying your Google sign-in…",
  salt: "Deriving your account…",
  proving: "Generating your zero-knowledge proof… (this can take a few seconds)",
  done: "Signed in — redirecting…",
  error: "Something went wrong.",
};

export default function AuthCallbackPage() {
  const { activateZkSession } = useSession();
  const router = useRouter();
  const [progress, setProgress] = React.useState<LoginProgress>({ step: "verifying" });
  const [error, setError] = React.useState<string | null>(null);
  const ran = React.useRef(false);

  React.useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    (async () => {
      try {
        const { session, next } = await completeGoogleLogin(window.location.hash, setProgress);
        await activateZkSession(session);
        router.replace(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sign-in failed.");
        setProgress({ step: "error" });
      }
    })();
  }, [activateZkSession, router]);

  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="flex flex-col items-start gap-4 pt-6">
        <CardTitle>Signing you in</CardTitle>
        {error ? (
          <>
            <Callout tone="danger">{error}</Callout>
            <Link href="/login" className={buttonClasses({ size: "sm" })}>
              Try again
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-3 text-sm text-muted">
            <Spinner className="size-4" />
            {STEP_LABEL[progress.step]}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
