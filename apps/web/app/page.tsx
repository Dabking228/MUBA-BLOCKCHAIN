import Link from "next/link";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const AUDIENCES = [
  {
    title: "Affected households",
    body: "Registered by an official with a printed reference code. Once you're back online, sign in and claim — your aid is released straight to your own account.",
    href: "/claim",
    cta: "Claim your aid",
  },
  {
    title: "Donors",
    body: "Individuals, companies, and government bodies top up one public treasury. Every ringgit is traceable from your donation to the household that received it.",
    href: "/donate",
    cta: "Make a donation",
  },
  {
    title: "Officials & verifiers",
    body: "PPS staff, Ketua Kampung, and District officers register households on their behalf. AI assists triage; a human always makes the call that moves money.",
    href: "/register",
    cta: "Register a household",
  },
];

const STEPS = [
  ["Zone opened", "Government sets eligible postcodes, fixed tier payouts, and a hard budget cap."],
  ["Household registered", "An official records the severity tier and issues a physical reference code — no wallet or internet needed."],
  ["Verified", "PPS and District registrations auto-verify; community submissions get an independent reviewer."],
  ["Claimed & paid", "The household signs in, links their account with the code, and the fixed tier amount is released once."],
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col items-start gap-6 pt-4">
        <Badge tone="primary">Sui testnet · hackathon build</Badge>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
          Disaster relief that reaches households in minutes — and proves it.
        </h1>
        <p className="max-w-2xl text-lg text-muted">
          MySteadyAid moves aid from donors and government budgets to flood-affected households in
          Malaysia through a transparent on-chain treasury. Registration works with no wallet and no
          connectivity; duplicate and ghost claims are blocked by the contract itself.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className={buttonClasses({ size: "lg" })}>
            View the transparency dashboard
          </Link>
          <Link
            href="/donate"
            className={buttonClasses({ size: "lg", variant: "secondary" })}
          >
            Donate to the treasury
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {AUDIENCES.map((a) => (
          <Card key={a.title} className="flex flex-col">
            <CardContent className="flex flex-1 flex-col gap-3 pt-5">
              <CardTitle>{a.title}</CardTitle>
              <CardDescription className="flex-1">{a.body}</CardDescription>
              <Link
                href={a.href}
                className="text-sm font-medium text-primary hover:text-primary-hover"
              >
                {a.cta} →
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">How it works</h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([title, body], i) => (
            <li key={title} className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                {i + 1}
              </span>
              <p className="font-medium text-foreground">{title}</p>
              <p className="text-sm text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
