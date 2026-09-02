"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/** Kicks the indexer, then refreshes server components. */
export function RefreshButton({ label = "Refresh" }: { label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  return (
    <Button
      variant="secondary"
      size="sm"
      loading={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await fetch("/api/indexer", { method: "POST" });
          router.refresh();
        } finally {
          setBusy(false);
        }
      }}
    >
      {label}
    </Button>
  );
}
