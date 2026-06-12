import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { slugifyCatalogValue } from "@/lib/data/admin-catalog";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

type RouteContext = {
  params: {
    id: string;
  };
};

function parseCategoryId(id: string) {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAuthenticatedAdmin(request);
  if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const id = parseCategoryId(context.params.id);
  if (!id) return NextResponse.json({ error: "Categoria invalida." }, { status: 400 });

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
    .update({
      nome_categoria: nome,
      slug_categoria: slug,
      tipo_nicho: payload.tipo_nicho?.trim() || "geral",
    })
    .eq("id", id)
    .select("id,nome_categoria,slug_categoria,tipo_nicho")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, category: data });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getAuthenticatedAdmin(request);
  if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const id = parseCategoryId(context.params.id);
  if (!id) return NextResponse.json({ error: "Categoria invalida." }, { status: 400 });

  const supabase = createSupabaseServiceRoleClient() || admin.supabase;
  const { error } = await supabase.from("categorias_mestre").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
