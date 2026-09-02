"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "@/components/providers/SessionProvider";
import { RequireSignIn } from "@/components/RequireSignIn";
import { runSponsoredAction } from "@/lib/session/txClient";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { StatTile } from "@/components/StatTile";
import { StatusBadge, TierBadge, ChannelBadge } from "@/components/StatusBadge";
import { StepTimeline } from "@/components/StepTimeline";
import { AddressPill } from "@/components/AddressPill";
import { AmountDisplay } from "@/components/AmountDisplay";
import { RefreshButton } from "@/components/RefreshButton";
import { registrationSteps } from "@/lib/timeline";
import { cn } from "@/lib/utils";
import { formatRelative, mistToSui } from "@/lib/format";
import {
  CHANNEL_LABELS,
  Channel,
  RegistrationStatus,
  type Donation,
  type HouseholdRegistration,
  type ResolvedRoles,
} from "@/lib/types";

interface HomeData {
  roles: ResolvedRoles;
  balance: string;
  donations: Donation[];
  registrarRegistrations: HouseholdRegistration[];
  pendingCount: number;
  summary: {
    treasuryBalance: string;
    totalDonated: string;
    pipeline: Record<"pending" | "verified" | "rejected" | "paid" | "total", number>;
  };
}

export default function HomePage() {
  return (
    <RequireSignIn>
      <HomeDashboard />
    </RequireSignIn>
  );
}

function HomeDashboard() {
  const { identity } = useSession();
  const [data, setData] = React.useState<HomeData | null>(null);

  const load = React.useCallback(async () => {
    if (!identity) return;
    const res = await fetch(`/api/home?address=${identity.address}`, { cache: "no-store" });
    if (res.ok) setData(await res.json());
  }, [identity]);

  React.useEffect(() => {
    void load();
  }, [load]);

  if (!data) {
    return (
      <div className="flex justify-center py-16 text-muted">
        <Spinner />
      </div>
    );
  }

  const { roles } = data;
  const noRole =
    !roles.isAdmin &&
    !roles.isVerifier &&
    roles.registrarChannels.length === 0 &&
    roles.households.length === 0 &&
    !roles.hasDonated;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {identity?.label ?? "Your account"}
          </h1>
          <div className="mt-1.5 flex items-center gap-2">
            <AddressPill value={identity?.address} />
            <RoleChips roles={roles} />
          </div>
        </div>
        <RefreshButton />
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Account balance" value={<AmountDisplay mist={data.balance} size="lg" />} />
        <StatTile
          label="Treasury balance"
          value={<AmountDisplay mist={data.summary.treasuryBalance} size="lg" />}
          sub={`${mistToSui(data.summary.totalDonated)} SUI donated in total`}
        />
        <StatTile
          label="Households helped"
          value={data.summary.pipeline.paid}
          sub={`of ${data.summary.pipeline.total} registered`}
        />
      </section>

      {noRole && <GettingStarted />}

      {roles.households.length > 0 && (
        <HouseholdSection households={roles.households} onChange={load} />
      )}
      {roles.hasDonated && (
        <DonorSection donations={data.donations} total={roles.donationTotal} />
      )}
      {roles.registrarChannels.length > 0 && (
        <OfficialSection
          channels={roles.registrarChannels}
          registrations={data.registrarRegistrations}
        />
      )}
      {roles.isVerifier && <VerifierSection pendingCount={data.pendingCount} />}
      {roles.isAdmin && <AdminSection />}
    </div>
  );
}

function RoleChips({ roles }: { roles: ResolvedRoles }) {
  const chips: string[] = [];
  if (roles.isAdmin) chips.push("Admin");
  if (roles.isVerifier) chips.push("Verifier");
  for (const c of roles.registrarChannels) chips.push(CHANNEL_LABELS[c as Channel]);
  if (roles.households.length > 0) chips.push("Household");
  if (roles.hasDonated) chips.push("Donor");
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {chips.map((c) => (
        <Badge key={c} tone="primary">
          {c}
        </Badge>
      ))}
    </div>
  );
}

function SectionShell({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function GettingStarted() {
  const cards = [
    ["Claim your aid", "Have a reference code from an official? Link your account and receive your aid.", "/claim", "Enter a code"],
    ["Donate", "Contribute testnet SUI to the shared relief treasury.", "/donate", "Donate now"],
    ["See where aid goes", "Follow every donation from the treasury to the household that received it.", "/dashboard", "Open the dashboard"],
  ] as const;
  return (
    <SectionShell title="Getting started">
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(([t, body, href, cta]) => (
          <Card key={t} className="flex flex-col">
            <CardContent className="flex flex-1 flex-col gap-2 pt-5">
              <CardTitle>{t}</CardTitle>
              <p className="flex-1 text-sm text-muted">{body}</p>
              <Link href={href} className="text-sm font-medium text-primary hover:text-primary-hover">
                {cta} →
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}

function HouseholdSection({
  households,
  onChange,
}: {
  households: HouseholdRegistration[];
  onChange: () => void;
}) {
  return (
    <SectionShell
      title="Your aid"
      action={
        <Link href="/status" className="text-sm font-medium text-primary hover:text-primary-hover">
          Full status →
        </Link>
      }
    >
      <div className="flex flex-col gap-3">
        {households.map((h) => (
          <HouseholdCard key={h.id} reg={h} onChange={onChange} />
        ))}
      </div>
    </SectionShell>
  );
}

function HouseholdCard({
  reg,
  onChange,
}: {
  reg: HouseholdRegistration;
  onChange: () => void;
}) {
  const { keypair, refreshRoles } = useSession();
  const toast = useToast();
  const [busy, setBusy] = React.useState(false);

  async function release() {
    if (!keypair) return;
    setBusy(true);
    try {
      await runSponsoredAction(keypair, "release_funds", {
        registrationId: reg.id,
        zoneId: reg.zoneId,
      });
      toast({ title: "Aid released to your account", tone: "success" });
      await refreshRoles();
      onChange();
    } catch (err) {
      toast({ title: "Could not release aid", description: String(err), tone: "danger" });
    } finally {
      setBusy(false);
    }
  }

  const canClaim = reg.status === RegistrationStatus.Verified && !reg.claimed;
  const canReceive = reg.status === RegistrationStatus.Verified && reg.claimed;

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm">{reg.householdId}</span>
          <StatusBadge status={reg.status} />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <span>Postcode {reg.postcode}</span>
          <TierBadge tier={reg.tier} />
        </div>
        <StepTimeline steps={registrationSteps(reg)} />
        {canClaim && (
          <Link href="/claim" className={cn(buttonClasses({ size: "sm" }), "self-start")}>
            Claim this aid
          </Link>
        )}
        {canReceive && (
          <Button size="sm" className="self-start" loading={busy} onClick={release}>
            Receive my aid now
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function DonorSection({ donations, total }: { donations: Donation[]; total: string }) {
  return (
    <SectionShell
      title="Your donations"
      action={
        <Link href="/donate" className="text-sm font-medium text-primary hover:text-primary-hover">
          Donate again →
        </Link>
      }
    >
      <Card>
        <CardContent className="flex flex-col gap-3 pt-5">
          <p className="text-sm text-muted">
            You&apos;ve donated <AmountDisplay mist={total} size="sm" /> in total.
          </p>
          {donations.length > 0 && (
            <ul className="flex flex-col divide-y divide-border">
              {donations.slice(0, 6).map((d) => (
                <li key={d.txDigest} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <AddressPill value={d.txDigest} kind="txblock" chars={6} />
                  <span className="text-muted">{formatRelative(d.createdAt)}</span>
                  <span className="font-medium tabular-nums">+{mistToSui(d.amount)} SUI</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </SectionShell>
  );
}

function OfficialSection({
  channels,
  registrations,
}: {
  channels: Channel[];
  registrations: HouseholdRegistration[];
}) {
  const counts = {
    pending: registrations.filter((r) => r.status === RegistrationStatus.Pending).length,
    verified: registrations.filter((r) => r.status === RegistrationStatus.Verified).length,
    paid: registrations.filter((r) => r.status === RegistrationStatus.Paid).length,
  };
  return (
    <SectionShell
      title="Registration"
      action={
        <div className="flex gap-2">
          <Link href="/register" className={buttonClasses({ size: "sm" })}>
            Register a household
          </Link>
          <Link href="/bulk-register" className={buttonClasses({ size: "sm", variant: "secondary" })}>
            Bulk register
          </Link>
        </div>
      }
    >
      <Card>
        <CardContent className="flex flex-col gap-3 pt-5">
          <div className="flex flex-wrap gap-1.5">
            {channels.map((c) => (
              <ChannelBadge key={c} channel={c} />
            ))}
          </div>
          <p className="text-sm text-muted">
            You&apos;ve submitted {registrations.length} registration
            {registrations.length === 1 ? "" : "s"} — {counts.pending} pending, {counts.verified}{" "}
            verified, {counts.paid} paid.
          </p>
          {registrations.slice(0, 5).map((r) => (
            <div key={r.id} className="flex items-center justify-between text-sm">
              <span className="font-mono text-xs">{r.householdId}</span>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    </SectionShell>
  );
}

function VerifierSection({ pendingCount }: { pendingCount: number }) {
  return (
    <SectionShell
      title="Verification"
      action={
        <Link href="/verify" className={buttonClasses({ size: "sm" })}>
          Open the queue
        </Link>
      }
    >
      <Card>
        <CardContent className="pt-5 text-sm text-muted">
          {pendingCount === 0
            ? "No registrations are waiting for verification."
            : `${pendingCount} registration${pendingCount === 1 ? "" : "s"} awaiting your review.`}
        </CardContent>
      </Card>
    </SectionShell>
  );
}

function AdminSection() {
  return (
    <SectionShell title="Relief authority">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-2 pt-5">
            <CardTitle>Disaster zones</CardTitle>
            <p className="text-sm text-muted">Open zones, set tier payouts and budget caps.</p>
            <Link href="/zones" className="text-sm font-medium text-primary hover:text-primary-hover">
              Manage zones →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-2 pt-5">
            <CardTitle>Capabilities</CardTitle>
            <p className="text-sm text-muted">Grant registrar and verifier rights to officials.</p>
            <Link href="/caps" className="text-sm font-medium text-primary hover:text-primary-hover">
              Issue capabilities →
            </Link>
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}
