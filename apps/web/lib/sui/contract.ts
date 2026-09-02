import { Transaction } from "@mysten/sui/transactions";
import { fromHex } from "@mysten/sui/utils";
import {
  DEFAULT_ZONE_ID,
  HOUSEHOLD_REGISTRY_ID,
  SUI_TYPE,
  TREASURY_ID,
  target,
} from "@/lib/sui/constants";
import type { Channel, Tier } from "@/lib/types";

/**
 * Transaction-builder thunks for `disaster_relief::relief_v3`.
 * Each returns a function that adds its command(s) to a `Transaction`.
 * They never set sender / gas — the sponsor layer does that.
 */

// ===== User actions (sponsored) =====

export function donate(params: { amountMist: bigint; treasuryId?: string }) {
  return (tx: Transaction) => {
    const coin = tx.coin({ balance: params.amountMist, useGasCoin: false });
    tx.moveCall({
      target: target("donate"),
      typeArguments: [SUI_TYPE],
      arguments: [tx.object(params.treasuryId ?? TREASURY_ID), coin],
    });
  };
}

export function registerHousehold(params: {
  registrarCapId: string;
  zoneId: string;
  householdId: string;
  referenceCodeHashHex: string;
  postcode: string;
  tier: Tier;
}) {
  return (tx: Transaction) => {
    tx.moveCall({
      target: target("register_household"),
      arguments: [
        tx.object(params.registrarCapId),
        tx.object(HOUSEHOLD_REGISTRY_ID),
        tx.object(params.zoneId),
        tx.pure.string(params.householdId),
        tx.pure.vector("u8", Array.from(fromHex(params.referenceCodeHashHex))),
        tx.pure.string(params.postcode),
        tx.pure.u8(params.tier),
      ],
    });
  };
}

export function verifyRegistration(params: { verifierCapId: string; registrationId: string }) {
  return (tx: Transaction) => {
    tx.moveCall({
      target: target("verify_registration"),
      arguments: [tx.object(params.verifierCapId), tx.object(params.registrationId)],
    });
  };
}

export function rejectRegistration(params: {
  verifierCapId: string;
  registrationId: string;
  reason: string;
}) {
  return (tx: Transaction) => {
    tx.moveCall({
      target: target("reject_registration"),
      arguments: [
        tx.object(params.verifierCapId),
        tx.object(HOUSEHOLD_REGISTRY_ID),
        tx.object(params.registrationId),
        tx.pure.string(params.reason),
      ],
    });
  };
}

export function claimAndLink(params: { registrationId: string; code: string }) {
  return (tx: Transaction) => {
    tx.moveCall({
      target: target("claim_and_link"),
      arguments: [tx.object(params.registrationId), tx.pure.string(params.code)],
    });
  };
}

export function releaseFunds(params: {
  registrationId: string;
  zoneId: string;
  treasuryId?: string;
}) {
  return (tx: Transaction) => {
    tx.moveCall({
      target: target("release_funds"),
      typeArguments: [SUI_TYPE],
      arguments: [
        tx.object(params.treasuryId ?? TREASURY_ID),
        tx.object(params.zoneId),
        tx.object(params.registrationId),
      ],
    });
  };
}

// ===== Admin actions (executed server-side with the admin key) =====

// Admin-only, executed self-signed (not sponsored) — split the fund coin from
// the admin's own gas coin.
export function createTreasury(params: { adminCapId: string; initialFundMist: bigint }) {
  return (tx: Transaction) => {
    const [coin] = tx.splitCoins(tx.gas, [params.initialFundMist]);
    tx.moveCall({
      target: target("create_treasury"),
      typeArguments: [SUI_TYPE],
      arguments: [tx.object(params.adminCapId), coin],
    });
  };
}

export function registerDisasterZone(params: {
  adminCapId: string;
  name: string;
  eligiblePostcodes: string[];
  budgetCapMist: bigint;
}) {
  return (tx: Transaction) => {
    tx.moveCall({
      target: target("register_disaster_zone"),
      arguments: [
        tx.object(params.adminCapId),
        tx.pure.string(params.name),
        tx.pure.vector("string", params.eligiblePostcodes),
        tx.pure.u64(params.budgetCapMist),
      ],
    });
  };
}

export function setTierAmount(params: {
  adminCapId: string;
  zoneId: string;
  tier: Tier;
  amountMist: bigint;
}) {
  return (tx: Transaction) => {
    tx.moveCall({
      target: target("set_tier_amount"),
      arguments: [
        tx.object(params.adminCapId),
        tx.object(params.zoneId),
        tx.pure.u8(params.tier),
        tx.pure.u64(params.amountMist),
      ],
    });
  };
}

export function issueRegistrarCap(params: {
  adminCapId: string;
  to: string;
  channel: Channel;
}) {
  return (tx: Transaction) => {
    tx.moveCall({
      target: target("issue_registrar_cap"),
      arguments: [
        tx.object(params.adminCapId),
        tx.pure.address(params.to),
        tx.pure.u8(params.channel),
      ],
    });
  };
}

export function issueVerifierCap(params: { adminCapId: string; to: string }) {
  return (tx: Transaction) => {
    tx.moveCall({
      target: target("issue_verifier_cap"),
      arguments: [tx.object(params.adminCapId), tx.pure.address(params.to)],
    });
  };
}

export { DEFAULT_ZONE_ID };
