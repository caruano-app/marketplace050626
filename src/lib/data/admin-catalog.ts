import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminCategory = {
  id: number;
  nome_categoria: string;
  slug_categoria: string;
  tipo_nicho: string | null;
};

export type AdminSubcategory = {
  id: number;
  categoria_id: number;
  nome_subcategoria: string;
  slug_subcategoria: string;
  categorias_mestre?: { nome_categoria: string } | { nome_categoria: string }[] | null;
};

export type AdminCatalogData = {
  categories: AdminCategory[];
  subcategories: AdminSubcategory[];
  error?: string;
};

export function slugifyCatalogValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

export async function getAdminCatalogData(client?: SupabaseClient): Promise<AdminCatalogData> {
  const supabase = client || createSupabaseServerClient();
  if (!supabase) return { categories: [], subcategories: [], error: "Supabase nao configurado." };

  const { data: categories, error: categoriesError } = await supabase
    .from("categorias_mestre")
    .select("id,nome_categoria,slug_categoria,tipo_nicho")
    .order("nome_categoria", { ascending: true })
    .limit(200);

  const { data: subcategories, error: subcategoriesError } = await supabase
    .from("subcategorias_mestre")
    .select("id,categoria_id,nome_subcategoria,slug_subcategoria,categorias_mestre(nome_categoria)")
    .order("nome_subcategoria", { ascending: true })
    .limit(400);

  return {
    categories: (categories || []) as AdminCategory[],
    subcategories: (subcategories || []) as AdminSubcategory[],
    error: categoriesError?.message || subcategoriesError?.message,
  };
}
