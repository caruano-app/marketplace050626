import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";

type RouteContext = {
  params: {
    id: string;
  };
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const admin = await getAuthenticatedAdmin(request);
  if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const payload = (await request.json()) as { action?: "aprovar" | "rejeitar" };

  if (payload.action !== "aprovar" && payload.action !== "rejeitar") {
    return NextResponse.json({ error: "Acao invalida." }, { status: 400 });
  }

  const { data: suggestion, error: suggestionError } = await admin.supabase
    .from("sugestoes_categorias")
    .select("id,nome_sugerido,nicho_sugerido,status")
    .eq("id", params.id)
    .maybeSingle();

  if (suggestionError || !suggestion) {
    return NextResponse.json({ error: "Sugestao nao encontrada." }, { status: 404 });
  }

  if (payload.action === "aprovar") {
    const { error: categoryError } = await admin.supabase
      .from("categorias_mestre")
      .insert({
        nome_categoria: suggestion.nome_sugerido,
        slug_categoria: slugify(suggestion.nome_sugerido),
        tipo_nicho: suggestion.nicho_sugerido || "geral",
      });

    if (categoryError) {
      return NextResponse.json({ error: categoryError.message }, { status: 400 });
    }
  }

  const { error } = await admin.supabase
    .from("sugestoes_categorias")
    .update({ status: payload.action === "aprovar" ? "aprovado" : "rejeitado" })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
