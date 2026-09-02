"use client";

import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { TIER_LABELS, type Tier } from "@/lib/types";

export function ReferenceSlip({
  code,
  householdId,
  postcode,
  tier,
  zoneName,
  onDone,
}: {
  code: string;
  householdId: string;
  postcode: string;
  tier: Tier;
  zoneName: string;
  onDone: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Callout tone="success" title="Household registered">
        Print this slip and give it to the household. The code is shown once and is not stored in
        plain text anywhere — if it is lost the household must re-verify in person.
      </Callout>

      <div
        id="reference-slip"
        className="rounded-lg border-2 border-dashed border-border-strong bg-surface p-6 print:border-black"
      >
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">
          MySteadyAid — reference slip
        </p>
        <p className="mt-1 text-xs text-muted">{zoneName}</p>

        <p className="mt-5 text-xs uppercase tracking-wide text-muted">Your reference code</p>
        <p className="mt-1 select-all font-mono text-2xl font-bold tracking-wider text-foreground">
          {code}
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Household</dt>
            <dd className="font-mono">{householdId}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Postcode</dt>
            <dd>{postcode}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Assessed damage</dt>
            <dd>{TIER_LABELS[tier]}</dd>
          </div>
        </dl>

        <p className="mt-5 border-t border-border pt-3 text-xs text-muted">
          When you have internet again, go to the MySteadyAid site, sign in with Google, and enter
          this code to receive your aid. Keep this slip safe. Do not share the code.
        </p>
      </div>

      <div className="flex gap-3 print:hidden">
        <Button onClick={() => window.print()}>Print slip</Button>
        <Button variant="secondary" onClick={onDone}>
          Register another household
        </Button>
      </div>
    </div>
  );
}
