import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { slugifyCatalogValue } from "@/lib/data/admin-catalog";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const admin = await getAuthenticatedAdmin(request);
  if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

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
    .insert({
      categoria_id: categoriaId,
      nome_subcategoria: nome,
      slug_subcategoria: slug,
    })
    .select("id,categoria_id,nome_subcategoria,slug_subcategoria")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, subcategory: data });
}
