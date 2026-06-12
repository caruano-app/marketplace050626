import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";

type RouteContext = {
  params: {
    id: string;
  };
};

const allowedPartnerLevels = new Set(["standard", "silver", "gold"]);

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const admin = await getAuthenticatedAdmin(request);
  if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const payload = (await request.json()) as { is_partner?: boolean; partner_level?: string };
  const isPartner = Boolean(payload.is_partner);
  const partnerLevel = payload.partner_level || "standard";

  if (!allowedPartnerLevels.has(partnerLevel)) {
    return NextResponse.json({ error: "Nivel de parceiro invalido." }, { status: 400 });
  }

  const { error } = await admin.supabase
    .from("lojistas")
    .update({
      is_partner: isPartner,
      partner_level: partnerLevel,
    })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, is_partner: isPartner, partner_level: partnerLevel });
}
