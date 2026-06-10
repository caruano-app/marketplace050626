import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CategoriaMestre } from "@/types/database";

const fallbackCategories: CategoriaMestre[] = [
  {
    id: 1,
    nome_categoria: "Menu Feminina",
    slug_categoria: "menu-feminina",
    tipo_nicho: "moda",
  },
  {
    id: 2,
    nome_categoria: "Moda Masculina",
    slug_categoria: "moda-masculina",
    tipo_nicho: "moda",
  },
  {
    id: 3,
    nome_categoria: "Menu Infantil",
    slug_categoria: "menu-infantil",
    tipo_nicho: "moda",
  },
  {
    id: 4,
    nome_categoria: "Ofertas",
    slug_categoria: "ofertas",
    tipo_nicho: "promocao",
  },
  {
    id: 5,
    nome_categoria: "Blog",
    slug_categoria: "blog",
    tipo_nicho: "conteudo",
  },
  {
    id: 6,
    nome_categoria: "Decoracao",
    slug_categoria: "decoracao",
    tipo_nicho: "casa",
  },
];

export async function getHeaderCategories(): Promise<CategoriaMestre[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return fallbackCategories;
  }

  const { data, error } = await supabase
    .from("categorias_mestre")
    .select("id,nome_categoria,slug_categoria,tipo_nicho")
    .order("id", { ascending: true })
    .limit(6);

  if (error || !data?.length) {
    return fallbackCategories;
  }

  return data;
}

export async function getFeaturedCategories(): Promise<CategoriaMestre[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return fallbackCategories;
  }

  const { data, error } = await supabase
    .from("categorias_mestre")
    .select("id,nome_categoria,slug_categoria,tipo_nicho")
    .order("id", { ascending: true })
    .limit(6);

  if (error || !data?.length) {
    return fallbackCategories;
  }

  return data;
}

export async function getAllCategories(): Promise<CategoriaMestre[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return fallbackCategories;
  }

  const { data, error } = await supabase
    .from("categorias_mestre")
    .select("id,nome_categoria,slug_categoria,tipo_nicho")
    .order("nome_categoria", { ascending: true })
    .limit(120);

  if (error || !data?.length) {
    return fallbackCategories;
  }

  return data;
}
