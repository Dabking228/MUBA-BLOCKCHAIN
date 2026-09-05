import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidSuiObjectId } from "@mysten/sui/utils";
import { publicEnv } from "@/lib/env";
import { AdminAuthError, assertAdminSecret } from "@/lib/admin";
import { serviceClient } from "@/lib/supabase/admin";
import { fetchAndExtractText } from "@/lib/evidenceFetch";
import { rowToZoneEvidence } from "@/lib/mappers";
import { explainError } from "@/lib/sui/errors";
import type { ZoneEvidenceRow } from "@/lib/supabase/rows";

const Schema = z.discriminatedUnion("sourceType", [
  z.object({
    zoneId: z.string().refine(isValidSuiObjectId),
    sourceType: z.literal("url"),
    url: z.string().url().max(2000),
  }),
  z.object({
    zoneId: z.string().refine(isValidSuiObjectId),
    sourceType: z.literal("text"),
    text: z.string().min(20).max(6000),
  }),
]);

// Admin adds one evidence source (URL, fetched server-side, or pasted text) to
// a zone. The GonkaRouter models later reason only over what's stored here.
export async function POST(request: Request) {
  try {
    assertAdminSecret(request);
    if (!publicEnv.enableZoneCredibility) {
      return NextResponse.json({ error: "Not available" }, { status: 404 });
    }
    const body = Schema.parse(await request.json());
    const sb = serviceClient();

    let row: {
      zone_id: string;
      source_type: "url" | "text";
      url: string | null;
      extracted_text: string;
      fetch_status: "ok" | "failed" | "manual";
    };
    if (body.sourceType === "url") {
      const { text, status } = await fetchAndExtractText(body.url);
      row = { zone_id: body.zoneId, source_type: "url", url: body.url, extracted_text: text, fetch_status: status };
    } else {
      row = {
        zone_id: body.zoneId,
        source_type: "text",
        url: null,
        extracted_text: body.text,
        fetch_status: "manual",
      };
    }

    const { data, error } = await sb.from("zone_evidence").insert(row).select().single();
    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true, evidence: rowToZoneEvidence(data as ZoneEvidenceRow) });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[/api/admin/zone/evidence]", err);
    return NextResponse.json({ error: explainError(err) }, { status: 400 });
  }
}
