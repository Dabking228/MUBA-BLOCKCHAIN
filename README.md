# MySteadyAid

> Transparent, fast, corruption-resistant disaster-relief distribution, built on Sui.

**Hackathon tracks:** Sui Payments & Stablecoins · AI × Sui (GonkaRouter)

---

## Description

MySteadyAid moves financial aid from donors and government budgets to
flood-affected households in Malaysia through a **public, on-chain treasury**.

It separates two things that most naïve designs conflate:

- **Registration** — an official confirms a household is eligible and records how
  much aid they should get. Happens in the field, often with no connectivity, and
  the household needs no wallet, no app, and no internet at this moment. They
  receive a **printed reference code**.
- **Fund receipt** — later, once online, the Head of Household signs in with
  Google (Sui **zkLogin** — the login *is* the wallet), submits the reference
  code, and the fixed tier amount is released to their own address. Only their
  own sign-in can ever set the payout address.

Donors top up one shared treasury; every transfer is auditable from donation to
household on a public dashboard. One-household-one-payout is enforced by the
smart contract itself, not by policy. GonkaRouter AI helps officials process
registrations and gives verifiers a fact-checked recommendation — it never moves
money.

---

## Problem

Malaysia floods badly nearly every monsoon season, and getting aid to affected
households is slow and opaque in well-understood ways:

- **Bureaucratic delay across layers.** Aid passes through several administrative
  layers; real households wait weeks for money they need immediately.
- **The PPS / non-PPS gap.** People in official evacuation centres
  (Pusat Pemindahan Sementara) are easier to register; people staying with
  relatives or in damaged homes fall into a slower, less-defined process.
- **Opaque fund flow.** Donors and the public cannot verify that a specific
  donation reached a specific household. Trust is asked for, not shown.
- **Duplicate and "ghost" claims.** Without a hard, systemic one-payout guarantee,
  fraud is a structural risk.
- **Connectivity loss.** The same disasters routinely destroy the telecom
  infrastructure a victim would need to use a wallet or app.
- **Digital literacy.** Elderly and digitally-illiterate residents — a large
  share of those affected — cannot manage seed phrases, gas, and wallet UX.

MySteadyAid removes each of these structurally: sponsored (gasless) transactions
and zkLogin remove the wallet/gas/literacy barrier; the physical reference code
removes the connectivity-at-registration barrier; on-chain registration
reservation removes duplicate claims; a public treasury and indexed dashboard
remove the opacity; trust-tiered verification keeps human review proportional to
genuinely ambiguous cases.

---

## Blockchain used

**Sui** (testnet).

| What | How it is used |
|---|---|
| Move smart contract | `disaster_relief::relief_v3` — owned vs. shared objects, capability pattern (`AdminCap` / `RegistrarCap` / `VerifierCap`), a shared `HouseholdRegistry` that reserves a household id at registration time |
| Programmable Transaction Blocks | multi-step actions (e.g. reserve + create registration, or check + pay) execute atomically |
| zkLogin | Google OAuth → deterministic Sui address; no seed phrase. The login is the wallet |
| Sponsored transactions | a server-held sponsor key pays gas for **every** user action — officials and households never hold SUI |
| Treasury | `ReliefTreasury<SUI>` shared object; testnet SUI stands in for a stablecoin (documented simplification) |

---

## Testnet contract addresses

Chain: **Sui testnet** (`chain-id 4c78adac`). Explorer:
`https://testnet.suivision.xyz`.

| Object | ID |
|---|---|
| Package (`relief_v3`) | `0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00` |
| `HouseholdRegistry` (shared) | `0xcc58634aa85fd3b3edc22ebf7c29ca9e84bb55e67f83902b75435ee2e7d88f62` |
| `AdminCap` | `0xdd0a0fe929200a0f3a07aa386a2b1460dc8179b6ad0e16cbfa320e63ab388f90` |
| `UpgradeCap` | `0x221f618c6d9f1216200f6f4480ea624ca024ac66cba3a3497c378bf13dfe9175` |

Demo data created by `scripts/seed.ts` (**changes if you re-seed** — the current
values live in `apps/web/scripts/seed-output.json` and `apps/web/.env.local`):

| Object | ID (current) |
|---|---|
| `ReliefTreasury<SUI>` (shared) | `0xf38fb4c8d6ffc54ea26e6bea884672c7cdf32f941c1f123b9cad92d3d9edfd5e` |
| `DisasterZone` "Kampung Test Flood 2026" (shared) | `0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f` |
| Demo official address (holds RegistrarCap ×3) | `0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf` |
| Demo verifier address (holds VerifierCap) | `0xb4edd0ada15437dcf5fe632f218e66cb5fde5abd82149f64dee02664009f6392` |

Server keypairs (never in client code): sponsor address
`0x0bbea161ef47b93b6369e836b4f5551008b1def74701fa08e4add88e689b97bf`,
admin/deployer address
`0x51897613a1e8128174b5144b4e25507e178adabf464bab113e7a50388f708e81`.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend + API | Next.js 16 (App Router), React 19, Tailwind v4, TypeScript |
| Smart contract | Move (`disaster_relief::relief_v3`) on Sui testnet |
| Chain SDK | `@mysten/sui` v2 (`SuiGrpcClient`, zkLogin, sponsored PTBs) |
| Identity | Google OAuth + Sui zkLogin; browser dev-key fallback for demos |
| Database | Supabase (Postgres) — a read-mirror rebuilt by an event indexer; **never the source of truth** |
| AI | GonkaRouter (OpenAI-compatible API), called server-side only — single-model triage/bulk-register + a 3-model consensus check for zone evidence credibility |
| Hosting | Vercel (`apps/web`), Sui testnet, Supabase cloud |

---

## Repo layout

```
contracts/relief/     Move contract + unit tests
apps/web/             Next.js app (the only user-facing surface)
  app/                pages + API routes
  lib/                sui / supabase / gonka / zklogin / session helpers
  scripts/            seed.ts, fund.ts, _e2e_*.mjs integration scripts
supabase/             SQL migrations (0001 schema, 0002 indexer support,
                      0003 re-registration fix, 0004 zone credibility)
README.md / DEPLOY.md / TESTING.md
```

---

## Setup / install

### Prerequisites

- Node.js 20+ and npm
- A Supabase project (free tier)
- A Google Cloud OAuth 2.0 **Web application** client ID
- A GonkaRouter API key
- *(optional)* the [Sui CLI](https://docs.sui.io/guides/developer/getting-started/sui-install)
  — only needed to run the Move unit tests or to redeploy the contract

### 1. Install

```bash
git clone <this repo>
cd MUBA-BLOCKCHAIN/apps/web
npm install
```

### 2. Environment

```bash
cp ../.env.example .env.local
```

Fill in `apps/web/.env.local`:

- **Sui** — keep the testnet RPC. `NEXT_PUBLIC_PACKAGE_ID` and
  `NEXT_PUBLIC_HOUSEHOLD_REGISTRY_ID` are the addresses above.
  `ADMIN_PRIVATE_KEY` / `SPONSOR_PRIVATE_KEY` are `suiprivkey1…` strings
  (server-only). `ADMIN_CAP_ID` is the address above.
- **Google** — `NEXT_PUBLIC_GOOGLE_CLIENT_ID`. In Google Cloud Console add these
  Authorized redirect URIs: `http://localhost:3000/auth/callback` and your
  Vercel URL `+ /auth/callback`.
- **Supabase** — Project URL + anon key + service_role key. Run, in order,
  `supabase/0001_init.sql`, `0002_indexer.sql`, `0003_household_reregistration.sql`,
  `0004_zone_credibility.sql` in the SQL editor.
- **GonkaRouter** — `GONKA_API_KEY` (server-only).
- **Secrets** — `ZKLOGIN_SALT_SECRET` and `ADMIN_CONSOLE_SECRET` are any long
  random strings you choose (server-only). Generate with
  `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`.
- **Feature flags** — `NEXT_PUBLIC_ENABLE_ZONE_CREDIBILITY=true` turns on the
  zone evidence credibility checker (see below); set to `false` to hide it
  entirely (client UI hidden, server routes 404) without touching any code.

### 3. Seed the chain (one time)

```bash
npx tsx scripts/seed.ts
```

Creates the treasury (funded), the demo zone with tier payouts, and issues
RegistrarCap ×3 + VerifierCap to freshly generated demo keypairs. Writes every
resulting id/key back into `.env.local` and `scripts/seed-output.json`, and
mirrors the zone into Supabase. Safe to re-run (skips what already exists).

> If you re-publish the contract, every object id changes — clear
> `NEXT_PUBLIC_TREASURY_ID` and `NEXT_PUBLIC_ZONE_ID` and re-run the seed.

### 4. Run

```bash
npm run dev            # http://localhost:3000
```

---

## How AI is used (and how it does fact-checking)

All AI runs **server-side** through **GonkaRouter** (an OpenAI-compatible router
on the Gonka network). The AI **advises humans and never calls a contract
function** — a human always makes the decision that moves money.

### 1. AI-assisted verification with fact-checking (`/verify` → "Ask AI")

When a verifier reviews a pending registration, the backend does **not** just ask
a model "is this okay?". It first computes the ground-truth facts on-chain and in
the mirror, then gives the model those facts to reason against:

| Fact checked | Source of truth |
|---|---|
| Is the postcode in the zone's eligible list? | `DisasterZone.eligible_postcodes` on-chain |
| Is the zone still active? | `DisasterZone.active` on-chain |
| Is a payout amount configured for the assessed tier? | zone tier table |
| Does another registration already exist for this household id? | indexed `household_registrations` |
| Channel, assessed tier, registrar | the on-chain `HouseholdRegistration` object |

GonkaRouter returns a structured JSON verdict — `approve` / `reject` /
`needs_review`, a **confidence score**, and a plain-language **reasoning trace**
that cites the specific checks — plus a **GonkaRouter request id** stored in the
`ai_recommendations` table for auditability. The verifier sees all of this and
then clicks Verify or Reject themselves.

So "fact-checking" here means: the system establishes verifiable facts from the
chain, and the AI's job is to judge whether the registration is *internally
consistent with those facts* and flag anything that does not add up — not to
invent facts.

### 2. AI-assisted bulk registration (`/bulk-register`)

A community leader types a plain-language description of many households. The
model structures it into individual draft entries (household id, postcode,
severity tier, damage notes, family size) each with a confidence score. It is
told the zone's eligible postcodes and **must keep** a household's stated
postcode even if it is not eligible — but lowers the confidence — so the UI can
**flag and block** ineligible entries rather than silently "correcting" them. The
official reviews and edits every row; nothing reaches the chain until they submit
it.

### 3. Multi-model evidence credibility consensus (`/zones` admin panel + public `/dashboard`)

GonkaRouter models cannot browse the internet — they can only reason over text
the app hands them. So instead of an "AI decides this disaster is real" feature
(which would be dishonest), this is an **evidence credibility review**: an
admin attaches evidence to a zone (a source URL, server-fetched and stripped to
plain text, or pasted text), and **3 GonkaRouter models independently and in
parallel** assess whether that evidence specifically supports the zone's own
claims (name, eligible postcodes, active status) — returning
`well-supported` / `partially-supported` / `insufficient-evidence` /
`inconsistent`, a 0–100 score, and a summary that must cite the specific fact
it relied on.

A deterministic (non-AI) consensus step combines the three verdicts: if the
models disagree, **the most cautious label wins** (e.g. any `inconsistent`
beats any `well-supported`) — errs toward caution rather than averaging away a
red flag. Calls run via `Promise.allSettled` so one model failing (or
GonkaRouter's model list disagreeing with what `/chat/completions` actually
accepts, which happens in practice) never blocks the other two — a failed
model is shown honestly ("2 of 3 models responded"), never hidden or silently
retried. Every per-model result, including failures, is persisted with its own
**GonkaRouter request id** for auditability, and shown on both the admin
console (full detail) and the public dashboard (a neutral one-line summary,
deliberately never styled as a warning — "AI advises, never accuses" applies
here too). This is purely advisory: it never gates opening a zone, accepting
donations, or paying households. Gated behind `NEXT_PUBLIC_ENABLE_ZONE_CREDIBILITY`.

### Model

`GONKA_MODEL` (default `deepseek-ai/DeepSeek-V4-Flash-0731`) for the
single-model triage/bulk-register features above; the router may substitute a
comparable model. The credibility consensus feature pins 3 explicit models
(`lib/gonka/models.ts`). Responses are parsed defensively (reasoning-model
`<think>` preambles are stripped, the first balanced JSON object is extracted).

---

## Team members

- Daryl Sim Wei Shern
- Leong Yu Hang

---

## Design decisions worth noting

- **Roles are resolved live, never stored.** A zkLogin address is permanently
  tied to one Google account, so one person can be a past donor, a current
  household, and (rarely) an official — all the same address. The app checks
  capability ownership on-chain and registration/donation history in the mirror,
  and renders a **combined dashboard** with every applicable section.
- **A physical reference code, not a transfer to a known account.** A zkLogin
  address only exists once the person logs in — which needs connectivity. The
  code lets an official register a household regardless, while guaranteeing only
  the household's own later login can set the payout address.
- **Per-user salt** for zkLogin is derived server-side by HMAC over the OAuth
  identity — a documented hackathon simplification; production would use a
  dedicated salt service.
- **Testnet SUI** stands in for a stablecoin throughout.

See Project Guide §12–13 for the full rationale and known limitations.
