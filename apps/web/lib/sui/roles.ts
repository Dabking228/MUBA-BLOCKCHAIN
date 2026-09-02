import "server-only";
import { getSuiClient } from "@/lib/sui/client";
import { serviceClient } from "@/lib/supabase/admin";
import { PACKAGE_ID, STRUCT } from "@/lib/sui/constants";
import { rowToRegistration } from "@/lib/mappers";
import { EMPTY_ROLES } from "@/lib/session/types";
import type { HouseholdRegistrationRow } from "@/lib/supabase/rows";
import type { Channel, ResolvedRoles } from "@/lib/types";

/**
 * Roles are resolved live (Handover §4.1): capability ownership straight from
 * the chain, household/donor status from the indexed mirror. Never stored.
 */
export async function resolveRoles(address: string): Promise<ResolvedRoles> {
  const client = getSuiClient();
  const sb = serviceClient();

  const [ownedCaps, regs, donations] = await Promise.all([
    client
      .listOwnedObjects({ owner: address, type: `${PACKAGE_ID}::relief_v3`, limit: 50 })
      .catch(() => ({ objects: [] as { type?: string; json?: unknown }[] })),
    sb
      .from("household_registrations")
      .select("*")
      .eq("head_of_household", address)
      .order("created_at", { ascending: true }),
    sb.from("donations").select("amount").eq("donor_address", address),
  ]);

  const roles: ResolvedRoles = EMPTY_ROLES(address);

  for (const obj of ownedCaps.objects) {
    const type = obj.type ?? "";
    if (type.startsWith(STRUCT.AdminCap)) roles.isAdmin = true;
    else if (type.startsWith(STRUCT.VerifierCap)) roles.isVerifier = true;
    else if (type.startsWith(STRUCT.RegistrarCap)) {
      const channel = Number((obj.json as { channel?: unknown } | undefined)?.channel ?? 0) as Channel;
      if (!roles.registrarChannels.includes(channel)) roles.registrarChannels.push(channel);
    }
  }
  roles.registrarChannels.sort();

  roles.households = ((regs.data ?? []) as HouseholdRegistrationRow[]).map(rowToRegistration);

  const total = (donations.data ?? []).reduce(
    (sum: bigint, d: { amount: string | number }) => sum + BigInt(d.amount ?? 0),
    0n,
  );
  roles.hasDonated = total > 0n;
  roles.donationTotal = total.toString();

  return roles;
}
