import "server-only";
import { z } from "zod";
import { isValidSuiAddress, isValidSuiObjectId } from "@mysten/sui/utils";
import type { Transaction } from "@mysten/sui/transactions";
import * as contract from "@/lib/sui/contract";
import { DEFAULT_ZONE_ID, TREASURY_ID } from "@/lib/sui/constants";
import type { SponsoredAction } from "@/lib/types";

const objectId = z.string().refine(isValidSuiObjectId, "invalid object id");
const address = z.string().refine(isValidSuiAddress, "invalid address");
const hex = z.string().regex(/^[0-9a-f]+$/i, "invalid hex");
const amount = z.union([z.string(), z.number()]).transform((v) => BigInt(v));
const tier = z.number().int().min(0).max(2);
const channel = z.number().int().min(0).max(2);

/**
 * Whitelist of sponsorable user actions. The API route only builds one of these;
 * anything else is rejected. Each entry validates its params and returns a thunk.
 */
export const SPONSORED: Record<
  SponsoredAction,
  (raw: unknown, sender: string) => (tx: Transaction) => void
> = {
  donate: (raw) => {
    const p = z.object({ amountMist: amount }).parse(raw);
    return contract.donate({ amountMist: p.amountMist, treasuryId: TREASURY_ID });
  },
  register_household: (raw) => {
    const p = z
      .object({
        registrarCapId: objectId,
        zoneId: objectId.default(DEFAULT_ZONE_ID),
        householdId: z.string().min(1).max(120),
        referenceCodeHashHex: hex,
        postcode: z.string().min(3).max(12),
        tier,
      })
      .parse(raw);
    return contract.registerHousehold(p);
  },
  verify_registration: (raw) => {
    const p = z.object({ verifierCapId: objectId, registrationId: objectId }).parse(raw);
    return contract.verifyRegistration(p);
  },
  reject_registration: (raw) => {
    const p = z
      .object({ verifierCapId: objectId, registrationId: objectId, reason: z.string().min(1).max(200) })
      .parse(raw);
    return contract.rejectRegistration(p);
  },
  claim_and_link: (raw) => {
    const p = z.object({ registrationId: objectId, code: z.string().min(4).max(64) }).parse(raw);
    return contract.claimAndLink(p);
  },
  release_funds: (raw) => {
    const p = z
      .object({ registrationId: objectId, zoneId: objectId.default(DEFAULT_ZONE_ID) })
      .parse(raw);
    return contract.releaseFunds({ ...p, treasuryId: TREASURY_ID });
  },
};

export const SponsorRequestSchema = z.object({
  action: z.enum(Object.keys(SPONSORED) as [SponsoredAction, ...SponsoredAction[]]),
  sender: address,
  params: z.unknown(),
});
