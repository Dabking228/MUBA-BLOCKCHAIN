/**
 * Environment access. Public values (NEXT_PUBLIC_*) are safe on the client;
 * `serverEnv()` must only be reached from server code (API routes, server
 * components, scripts) and throws if a required secret is missing.
 */

export const publicEnv = {
  suiRpcUrl: process.env.NEXT_PUBLIC_SUI_RPC_URL ?? "https://fullnode.testnet.sui.io:443",
  suiNetwork: (process.env.NEXT_PUBLIC_SUI_NETWORK ?? "testnet") as
    | "testnet"
    | "devnet"
    | "mainnet"
    | "localnet",
  packageId: process.env.NEXT_PUBLIC_PACKAGE_ID ?? "",
  householdRegistryId: process.env.NEXT_PUBLIC_HOUSEHOLD_REGISTRY_ID ?? "",
  treasuryId: process.env.NEXT_PUBLIC_TREASURY_ID ?? "",
  zoneId: process.env.NEXT_PUBLIC_ZONE_ID ?? "",
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
  authMode: (process.env.NEXT_PUBLIC_AUTH_MODE ?? "dev") as "dev" | "google",
  showDemoLogins: (process.env.NEXT_PUBLIC_SHOW_DEMO_LOGINS ?? "true") === "true",
  // Kill switch for the zone credibility (multi-model consensus) feature — one
  // env change hides it everywhere (UI + the two new API routes refuse to run).
  enableZoneCredibility: (process.env.NEXT_PUBLIC_ENABLE_ZONE_CREDIBILITY ?? "false") === "true",
  zkloginMaxEpochOffset: Number(process.env.NEXT_PUBLIC_ZKLOGIN_MAX_EPOCH_OFFSET ?? "10"),
  explorerBase: process.env.NEXT_PUBLIC_EXPLORER_BASE ?? "https://testnet.suivision.xyz",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function serverEnv() {
  return {
    sponsorPrivateKey: required("SPONSOR_PRIVATE_KEY", process.env.SPONSOR_PRIVATE_KEY),
    adminPrivateKey: required("ADMIN_PRIVATE_KEY", process.env.ADMIN_PRIVATE_KEY),
    adminCapId: required("ADMIN_CAP_ID", process.env.ADMIN_CAP_ID),
    supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseServiceRoleKey: required(
      "SUPABASE_SERVICE_ROLE_KEY",
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    ),
    gonkaApiKey: required("GONKA_API_KEY", process.env.GONKA_API_KEY),
    gonkaBaseUrl: process.env.GONKA_BASE_URL ?? "https://api.gonkarouter.io/v1",
    gonkaModel: process.env.GONKA_MODEL ?? "deepseek-ai/DeepSeek-V4-Flash-0731",
    zkloginProverUrl:
      process.env.ZKLOGIN_PROVER_URL ?? "https://prover-dev.mystenlabs.com/v1",
    zkloginSaltSecret: required("ZKLOGIN_SALT_SECRET", process.env.ZKLOGIN_SALT_SECRET),
  };
}
