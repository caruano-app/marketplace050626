import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { slugifyCatalogValue } from "@/lib/data/admin-catalog";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const admin = await getAuthenticatedAdmin(request);
  if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const payload = (await request.json()) as {
    nome_categoria?: string;
    slug_categoria?: string;
    tipo_nicho?: string;
  };
  const nome = payload.nome_categoria?.trim();
  if (!nome) return NextResponse.json({ error: "Nome da categoria e obrigatorio." }, { status: 400 });

  const slug = slugifyCatalogValue(payload.slug_categoria || nome);
  if (!slug) return NextResponse.json({ error: "Slug invalido." }, { status: 400 });

  const supabase = createSupabaseServiceRoleClient() || admin.supabase;
  const { data, error } = await supabase
    .from("categorias_mestre")
    .insert({
      nome_categoria: nome,
      slug_categoria: slug,
      tipo_nicho: payload.tipo_nicho?.trim() || "geral",
    })
    .select("id,nome_categoria,slug_categoria,tipo_nicho")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, category: data });
}
