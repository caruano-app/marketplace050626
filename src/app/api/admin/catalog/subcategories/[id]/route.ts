import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { slugifyCatalogValue } from "@/lib/data/admin-catalog";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

type RouteContext = {
  params: {
    id: string;
  };
};

function parseSubcategoryId(id: string) {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAuthenticatedAdmin(request);
  if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const id = parseSubcategoryId(context.params.id);
  if (!id) return NextResponse.json({ error: "Subcategoria invalida." }, { status: 400 });

  const payload = (await request.json()) as {
    categoria_id?: number;
    nome_subcategoria?: string;
    slug_subcategoria?: string;
  };
  const categoriaId = Number(payload.categoria_id);
  const nome = payload.nome_subcategoria?.trim();

  if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
    return NextResponse.json({ error: "Categoria mestre obrigatoria." }, { status: 400 });
  }

  if (!nome) return NextResponse.json({ error: "Nome da subcategoria e obrigatorio." }, { status: 400 });

  const slug = slugifyCatalogValue(payload.slug_subcategoria || nome);
  if (!slug) return NextResponse.json({ error: "Slug invalido." }, { status: 400 });

  const supabase = createSupabaseServiceRoleClient() || admin.supabase;
  const { data, error } = await supabase
    .from("subcategorias_mestre")
    .update({
      categoria_id: categoriaId,
      nome_subcategoria: nome,
      slug_subcategoria: slug,
    })
    .eq("id", id)
    .select("id,categoria_id,nome_subcategoria,slug_subcategoria")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, subcategory: data });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getAuthenticatedAdmin(request);
  if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const id = parseSubcategoryId(context.params.id);
  if (!id) return NextResponse.json({ error: "Subcategoria invalida." }, { status: 400 });

  const supabase = createSupabaseServiceRoleClient() || admin.supabase;
  const { error } = await supabase.from("subcategorias_mestre").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
