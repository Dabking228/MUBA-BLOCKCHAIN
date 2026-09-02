import { SuiGrpcClient } from "@mysten/sui/grpc";
import { publicEnv } from "@/lib/env";

let client: SuiGrpcClient | null = null;

/** Shared Sui client (gRPC transport). Safe to call from server or scripts. */
export function getSuiClient(): SuiGrpcClient {
  if (!client) {
    client = new SuiGrpcClient({
      network: publicEnv.suiNetwork,
      baseUrl: publicEnv.suiRpcUrl,
    });
  }
  return client;
}
