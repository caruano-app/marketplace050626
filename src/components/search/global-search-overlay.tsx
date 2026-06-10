"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type SearchResult = {
  id: string;
  label: string;
  subtitle: string;
  type: "produto" | "categoria" | "lojista" | "servico";
  href: string;
};

const fallbackResults: SearchResult[] = [
  {
    id: "fallback-produto",
    label: "Nome do produto",
    subtitle: "Produto | SKU PR-241276",
    type: "produto",
    href: "/product/fallback-1",
  },
  {
    id: "fallback-categoria",
    label: "Moda Masculina",
    subtitle: "Categoria",
    type: "categoria",
    href: "/categorias/moda-masculina",
  },
  {
    id: "fallback-lojista",
    label: "Nome da loja",
    subtitle: "Lojista",
    type: "lojista",
    href: "/loja/nome-da-loja",
  },
  {
    id: "fallback-servico",
    label: "Costura e ajustes",
    subtitle: "Servico",
    type: "servico",
    href: "/servicos",
  },
];

function cleanSearchTerm(value: string) {
  return value.trim().replace(/[%_,]/g, " ").replace(/\s+/g, " ");
}

type GlobalSearchOverlayProps = {
  open: boolean;
  onClose: () => void;
};

function resultTypeLabel(type: SearchResult["type"]) {
  const labels = {
    produto: "Produto",
    categoria: "Categoria",
    lojista: "Lojista",
    servico: "Servico",
  };

  return labels[type];
}

export function GlobalSearchOverlay({ open, onClose }: GlobalSearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>(fallbackResults);
  const [loading, setLoading] = useState(false);

  const visibleResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return results.slice(0, 8);
    }

    return results
      .filter((result) =>
        [result.label, result.subtitle, result.type].some((field) => field.toLowerCase().includes(normalized)),
      )
      .slice(0, 10);
  }, [query, results]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setResults(fallbackResults);
      return;
    }

    const timeout = window.setTimeout(async () => {
      const term = cleanSearchTerm(query);
      setLoading(true);

      try {
        const [products, categories, stores, services] = await Promise.all([
          supabase
            .from("produtos")
            .select("id,nome_produto,codigo_referencia_sku")
            .or(`nome_produto.ilike.%${term}%,codigo_referencia_sku.ilike.%${term}%`)
            .limit(5),
          supabase
            .from("categorias_mestre")
            .select("id,nome_categoria,slug_categoria")
            .or(`nome_categoria.ilike.%${term}%,slug_categoria.ilike.%${term}%`)
            .limit(5),
          supabase
            .from("lojistas")
            .select("id,nome_fantasia,slug")
            .or(`nome_fantasia.ilike.%${term}%,slug.ilike.%${term}%`)
            .limit(5),
          supabase
            .from("prestadores_servico")
            .select("id,categoria_servico,descricao_portfolio")
            .or(`categoria_servico.ilike.%${term}%,descricao_portfolio.ilike.%${term}%`)
            .limit(5),
        ]);

        const nextResults: SearchResult[] = [
          ...(products.data || []).map((product) => ({
            id: product.id,
            label: product.nome_produto,
            subtitle: `Produto | SKU ${product.codigo_referencia_sku}`,
            type: "produto" as const,
            href: `/product/${product.id}`,
          })),
          ...(categories.data || []).map((category) => ({
            id: String(category.id),
            label: category.nome_categoria,
            subtitle: "Categoria",
            type: "categoria" as const,
            href: `/categorias/${category.slug_categoria}`,
          })),
          ...(stores.data || []).map((store) => ({
            id: store.id,
            label: store.nome_fantasia,
            subtitle: "Lojista",
            type: "lojista" as const,
            href: `/loja/${store.slug}`,
          })),
          ...(services.data || []).map((service) => ({
            id: service.id,
            label: service.categoria_servico,
            subtitle: service.descricao_portfolio || "Servico",
            type: "servico" as const,
            href: `/servicos?prestador=${service.id}`,
          })),
        ];

        setResults(nextResults.length ? nextResults : fallbackResults);
      } catch {
        setResults(fallbackResults);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => window.clearTimeout(timeout);
  }, [open, query]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 px-4 pb-24 pt-6" role="dialog" aria-modal="true">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-[10px] bg-white shadow-xl">
        <div className="flex items-center gap-3 border-b border-neutral-200 p-4">
          <input
            autoFocus
            className="h-12 min-w-0 flex-1 rounded-[6px] border border-neutral-300 px-4 text-base font-bold outline-none"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar produtos, categorias, lojas, servicos, cod, sku"
            type="search"
            value={query}
          />
          <button className="h-12 rounded-[6px] bg-neutral-950 px-4 text-sm font-black text-white" onClick={onClose} type="button">
            Fechar
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-2">
          {loading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="h-16 rounded-[6px] caruano-skeleton" key={index} />
              ))}
            </div>
          ) : null}

          {!loading && visibleResults.length ? (
            visibleResults.map((result) => (
              <a
                className="grid grid-cols-[76px_1fr] gap-3 rounded-[6px] px-3 py-3 text-neutral-950 hover:bg-neutral-100"
                href={result.href}
                key={`${result.type}-${result.id}`}
                onClick={onClose}
              >
                <span className="grid h-9 place-items-center rounded-[4px] bg-[#f6b900] text-[10px] font-black uppercase">
                  {resultTypeLabel(result.type)}
                </span>
                <span>
                  <strong className="line-clamp-1 text-sm font-black uppercase">{result.label}</strong>
                  <small className="line-clamp-1 text-xs font-bold text-neutral-500">{result.subtitle}</small>
                </span>
              </a>
            ))
          ) : null}

          {!loading && !visibleResults.length ? (
            <p className="px-4 py-8 text-center text-sm font-black uppercase text-neutral-500">Nenhum resultado encontrado.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
