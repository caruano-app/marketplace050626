import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { updateSiteCmsConfig, type SiteCmsPatch } from "@/lib/data/admin-appearance";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

const assetFields = {
  logoUrl: "logo",
  heroBannerUrl: "banner-principal",
  highlightBannerUrl: "banner-destaque",
} as const;

type AssetField = keyof typeof assetFields;

function isAssetField(value: unknown): value is AssetField {
  return typeof value === "string" && value in assetFields;
}

function extensionFromFile(file: File) {
  const subtype = file.type.split("/")[1]?.toLowerCase();
  if (subtype === "jpeg") return "jpg";
  if (subtype && /^[a-z0-9]+$/.test(subtype)) return subtype;
  return "webp";
}

export async function PATCH(request: NextRequest) {
  const admin = await getAuthenticatedAdmin(request);
  if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const payload = (await request.json()) as SiteCmsPatch;
  const supabase = createSupabaseServiceRoleClient() || admin.supabase;
  const result = await updateSiteCmsConfig(supabase, payload);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, config: result.config, primaryColor: result.primaryColor });
}

export async function POST(request: NextRequest) {
  const admin = await getAuthenticatedAdmin(request);
  if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const formData = await request.formData();
  const assetType = formData.get("assetType");
  const file = formData.get("file");

  if (!isAssetField(assetType)) {
    return NextResponse.json({ error: "Tipo de imagem invalido." }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo nao enviado." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Envie apenas imagens." }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Imagem muito pesada. Limite: 5MB." }, { status: 400 });
  }

  const extension = extensionFromFile(file);
  const path = `home/${assetFields[assetType]}-${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const buffer = await file.arrayBuffer();
  const supabase = createSupabaseServiceRoleClient() || admin.supabase;

  const { error: uploadError } = await supabase.storage.from("assets").upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data } = supabase.storage.from("assets").getPublicUrl(path);
  const publicUrl = data.publicUrl;
  const result = await updateSiteCmsConfig(supabase, { [assetType]: publicUrl });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, assetType, publicUrl, config: result.config });
}
