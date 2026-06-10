import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { StoryVideo } from "@/types/database";

const fallbackStories: StoryVideo[] = Array.from({ length: 6 }, (_, index) => ({
  id: `story-fallback-${index + 1}`,
  lojista_id: `lojista-fallback-${index + 1}`,
  produto_id: `fallback-${index + 1}`,
  titulo: ["Howem Modas", "Caruano", "Jully Modas", "Consertec", "Decorart", "JKF Eletrica"][index],
  video_url: "",
  thumbnail_url: null,
  ativo: true,
  chamada_acao: "Clique e assista",
  visualizacoes: 0,
  cliques: 0,
  exibir_home: true,
  exibir_produto: false,
  exibir_categoria: false,
  criado_em: new Date(0).toISOString(),
}));

export async function getHomeStories(): Promise<StoryVideo[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return fallbackStories;
  }

  const { data, error } = await supabase
    .from("stories_videos")
    .select(
      "id,lojista_id,produto_id,titulo,video_url,thumbnail_url,ativo,chamada_acao,visualizacoes,cliques,exibir_home,exibir_produto,exibir_categoria,criado_em",
    )
    .eq("ativo", true)
    .eq("exibir_home", true)
    .order("criado_em", { ascending: false })
    .limit(6);

  if (error || !data?.length) {
    return fallbackStories;
  }

  return data as StoryVideo[];
}

export async function getLiveShopStories(): Promise<StoryVideo[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return fallbackStories.slice(0, 5);
  }

  const { data, error } = await supabase
    .from("stories_videos")
    .select(
      "id,lojista_id,produto_id,titulo,video_url,thumbnail_url,ativo,chamada_acao,visualizacoes,cliques,exibir_home,exibir_produto,exibir_categoria,criado_em",
    )
    .eq("ativo", true)
    .order("criado_em", { ascending: false })
    .limit(5);

  if (error || !data?.length) {
    return fallbackStories.slice(0, 5);
  }

  return data as StoryVideo[];
}

export async function getStoriesByStore(lojistaId: string): Promise<StoryVideo[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase || lojistaId === "fallback-store") {
    return fallbackStories.map((story) => ({
      ...story,
      lojista_id: lojistaId,
    }));
  }

  const { data, error } = await supabase
    .from("stories_videos")
    .select(
      "id,lojista_id,produto_id,titulo,video_url,thumbnail_url,ativo,chamada_acao,visualizacoes,cliques,exibir_home,exibir_produto,exibir_categoria,criado_em",
    )
    .eq("ativo", true)
    .eq("lojista_id", lojistaId)
    .order("criado_em", { ascending: false })
    .limit(6);

  if (error || !data?.length) {
    return fallbackStories.map((story) => ({
      ...story,
      lojista_id: lojistaId,
    }));
  }

  return data as StoryVideo[];
}
