import { NextResponse } from "next/server";
import { AdminAuthError, assertAdminSecret } from "@/lib/admin";

export async function POST(request: Request) {
  try {
    assertAdminSecret(request);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
