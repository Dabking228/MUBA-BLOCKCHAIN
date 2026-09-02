import { publicEnv } from "@/lib/env";

export const MODULE = "relief_v3";

export const PACKAGE_ID = publicEnv.packageId;
export const HOUSEHOLD_REGISTRY_ID = publicEnv.householdRegistryId;
export const TREASURY_ID = publicEnv.treasuryId;
export const DEFAULT_ZONE_ID = publicEnv.zoneId;

export const SUI_TYPE = "0x2::sui::SUI";

export const target = (fn: string) => `${PACKAGE_ID}::${MODULE}::${fn}` as const;

export const STRUCT = {
  AdminCap: `${PACKAGE_ID}::${MODULE}::AdminCap`,
  RegistrarCap: `${PACKAGE_ID}::${MODULE}::RegistrarCap`,
  VerifierCap: `${PACKAGE_ID}::${MODULE}::VerifierCap`,
  DisasterZone: `${PACKAGE_ID}::${MODULE}::DisasterZone`,
  HouseholdRegistration: `${PACKAGE_ID}::${MODULE}::HouseholdRegistration`,
  ReliefTreasury: `${PACKAGE_ID}::${MODULE}::ReliefTreasury`,
} as const;

export const EVENT = {
  RegistrationSubmitted: `${PACKAGE_ID}::${MODULE}::RegistrationSubmitted`,
  RegistrationVerified: `${PACKAGE_ID}::${MODULE}::RegistrationVerified`,
  RegistrationRejected: `${PACKAGE_ID}::${MODULE}::RegistrationRejected`,
  HouseholdLinked: `${PACKAGE_ID}::${MODULE}::HouseholdLinked`,
  AidPaid: `${PACKAGE_ID}::${MODULE}::AidPaid`,
  Donated: `${PACKAGE_ID}::${MODULE}::Donated`,
} as const;

/** Move abort codes from relief_v3.move → human messages. */
export const ABORT_MESSAGES: Record<number, string> = {
  1: "This household is already registered for this disaster.",
  2: "This disaster zone is not currently active.",
  3: "This postcode is not eligible for aid in this zone.",
  4: "This registration has not been verified yet.",
  5: "No payout amount has been set for this severity tier.",
  6: "Paying this household would exceed the zone's budget cap.",
  7: "This registration has already been claimed.",
  8: "The reference code does not match this registration.",
  9: "This registration has not been claimed by a household yet.",
  10: "The zone provided does not match the one this household registered under.",
};
