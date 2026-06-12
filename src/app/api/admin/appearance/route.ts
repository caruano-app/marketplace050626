import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { updateAdminAppearanceConfig } from "@/lib/data/admin-appearance";

export async function PATCH(request: NextRequest) {
  const admin = await getAuthenticatedAdmin(request);
  if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const payload = (await request.json()) as { primaryColor?: string };
  const result = await updateAdminAppearanceConfig(admin.supabase, payload.primaryColor || "");

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, primaryColor: result.primaryColor });
}
