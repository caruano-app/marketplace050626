"use client";

import Image from "next/image";
import { useState } from "react";
import type { MerchantProductItem, PendingQuote } from "@/lib/data/merchant-dashboard";

type MerchantDashboardAppProps = {
  products: MerchantProductItem[];
  quotes: PendingQuote[];
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function MerchantDashboardApp({ products, quotes }: MerchantDashboardAppProps) {
  const [selectedQuote, setSelectedQuote] = useState<PendingQuote | null>(null);
  const [fabOpen, setFabOpen] = useState(false);

  return (
    <>
      <section className="mt-4 rounded-[8px] bg-white p-4 shadow-sm">
        <h2 className="text-xl font-black uppercase text-neutral-950">Produtos rapidos</h2>
        <div className="mt-3 space-y-3">
          {products.map((product) => (
            <article className="grid grid-cols-[50px_1fr_64px] items-center gap-3 rounded-[8px] border border-neutral-200 p-3" key={product.id}>
              <div className="relative h-[50px] w-[50px] overflow-hidden rounded-[6px] bg-neutral-200">
                {product.imagens_url?.[0] ? (
                  <Image alt={product.nome_produto} className="object-cover" fill sizes="50px" src={product.imagens_url[0]} />
                ) : null}
              </div>
              <div>
                <p className="line-clamp-1 text-sm font-black uppercase text-neutral-950">{product.nome_produto}</p>
                <p className="text-sm font-black text-[#f58220]">{formatPrice(Number(product.preco_base_varejo || 0))}</p>
              </div>
              <button
                aria-label="Alternar produto ativo"
                className={`flex h-11 w-16 items-center rounded-full p-1 ${product.status_moderacao === "aprovado" ? "bg-[#00a86b]" : "bg-neutral-300"}`}
                type="button"
              >
                <span className={`h-9 w-9 rounded-full bg-white shadow ${product.status_moderacao === "aprovado" ? "ml-5" : ""}`} />
              </button>
            </article>
          ))}
          {!products.length ? <p className="rounded-[8px] border border-dashed border-neutral-300 p-5 text-center text-sm font-black uppercase text-neutral-500">Nenhum produto encontrado.</p> : null}
        </div>
      </section>

      <section className="mt-4 rounded-[8px] bg-white p-4 shadow-sm">
        <h2 className="text-xl font-black uppercase text-neutral-950">Cotacoes de tecidos/servicos</h2>
        <div className="mt-3 space-y-3">
          {quotes.map((quote) => (
            <button className="min-h-16 w-full rounded-[8px] border border-neutral-200 p-4 text-left" key={quote.id} onClick={() => setSelectedQuote(quote)} type="button">
              <span className="block text-sm font-black uppercase text-neutral-950">Cotacao #{quote.id.slice(0, 8)}</span>
              <span className="mt-1 block text-xs font-bold text-neutral-500">{quote.observacoes || "Toque para enviar orcamento."}</span>
            </button>
          ))}
          {!quotes.length ? <p className="rounded-[8px] border border-dashed border-neutral-300 p-5 text-center text-sm font-black uppercase text-neutral-500">Nenhuma cotacao pendente.</p> : null}
        </div>
      </section>

      {selectedQuote ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
          <div className="w-full rounded-t-[18px] bg-white p-5 shadow-xl">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-neutral-300" />
            <h2 className="text-2xl font-black uppercase text-neutral-950">Enviar orcamento</h2>
            <p className="mt-1 text-sm font-bold text-neutral-500">Cotacao #{selectedQuote.id.slice(0, 8)}</p>
            <label className="mt-4 block text-sm font-black uppercase text-neutral-950">
              Valor
              <input className="mt-2 h-12 w-full rounded-[6px] border border-neutral-300 px-3 text-lg font-black outline-none" inputMode="decimal" placeholder="R$ 0,00" />
            </label>
            <button className="mt-4 min-h-11 w-full rounded-[6px] bg-[#ffd700] px-4 text-sm font-black uppercase text-neutral-950" type="button">
              Enviar orcamento
            </button>
            <button className="mt-2 min-h-11 w-full rounded-[6px] bg-neutral-950 px-4 text-sm font-black uppercase text-white" onClick={() => setSelectedQuote(null)} type="button">
              Fechar
            </button>
          </div>
        </div>
      ) : null}

      <div className="fixed bottom-20 right-4 z-40">
        {fabOpen ? (
          <div className="mb-3 grid gap-2">
            <a className="grid min-h-11 place-items-center rounded-[8px] bg-neutral-950 px-4 text-sm font-black uppercase text-white shadow-lg" href="/dashboard/lojista/produtos/novo">
              Novo Produto
            </a>
            <button className="min-h-11 rounded-[8px] bg-neutral-950 px-4 text-sm font-black uppercase text-white shadow-lg" type="button">
              Novo Story/Video
            </button>
            <a className="grid min-h-11 place-items-center rounded-[8px] bg-neutral-950 px-4 text-sm font-black uppercase text-white shadow-lg" href="/dashboard/lojista/pedidos">
              Ver Vendas
            </a>
          </div>
        ) : null}
        <button className="grid h-14 w-14 place-items-center rounded-full bg-[#ffd700] text-3xl font-black text-neutral-950 shadow-xl" onClick={() => setFabOpen((current) => !current)} type="button">
          +
        </button>
      </div>
    </>
  );
}
