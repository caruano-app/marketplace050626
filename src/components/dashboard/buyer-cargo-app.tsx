"use client";

import { useState } from "react";
import Image from "next/image";
import { VerifiedBadge } from "@/components/common/verified-badge";
import type { BuyerCargoOrder, BuyerCargoSummary } from "@/lib/data/buyer-cargo";

type BuyerCargoAppProps = {
  orders: BuyerCargoOrder[];
  summary: BuyerCargoSummary;
};

const statusLabels: Record<string, string> = {
  pendente_separacao: "Pendente",
  em_separacao: "Preparando",
  pronto_coleta: "No onibus",
  enviado: "No onibus",
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function sectorTone(color: string | null | undefined) {
  const normalized = (color || "").toLowerCase();
  if (normalized.includes("verde")) return "bg-green-100 text-green-900 border-green-300";
  if (normalized.includes("azul")) return "bg-blue-100 text-blue-900 border-blue-300";
  if (normalized.includes("laranja")) return "bg-orange-100 text-orange-900 border-orange-300";
  if (normalized.includes("vermelho")) return "bg-red-100 text-red-900 border-red-300";
  return "bg-[#fff8d6] text-zinc-900 border-[#FFC300]";
}

function ParkingMap({ sector }: { sector: string | null | undefined }) {
  const tone = sectorTone(sector);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <p className="text-sm font-black uppercase text-zinc-900">Mapa simplificado da vaga</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {["Laranja", "Verde", "Azul", "Vermelho"].map((item) => (
          <div
            className={`grid h-28 place-items-center rounded-xl border-2 text-center text-sm font-black uppercase ${
              sector?.toLowerCase().includes(item.toLowerCase()) ? tone : "border-neutral-200 bg-neutral-100 text-neutral-500"
            }`}
            key={item}
          >
            Setor {item}
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-xl bg-[#fff8d6] p-3 text-sm font-bold text-zinc-900">
        Procure a equipe Caruano no estacionamento e informe o setor, a vaga e o nome da excursao exibidos no pedido.
      </p>
    </div>
  );
}

export function BuyerCargoApp({ orders, summary }: BuyerCargoAppProps) {
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [mapSector, setMapSector] = useState<string | null>(null);
  const [reviewOrder, setReviewOrder] = useState<BuyerCargoOrder | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [sendingReview, setSendingReview] = useState(false);

  async function submitReview() {
    if (!reviewOrder?.reviewTargetProductId) {
      setReviewMessage("Nao foi possivel identificar o produto deste pedido.");
      return;
    }

    setSendingReview(true);
    setReviewMessage("Enviando avaliacao...");

    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        produtoId: reviewOrder.reviewTargetProductId,
        lojistaId: reviewOrder.lojistaId,
        pedidoId: reviewOrder.id,
        nota: reviewRating,
        comentario: reviewComment,
      }),
    });
    const payload = (await response.json()) as { error?: string };

    setSendingReview(false);

    if (!response.ok) {
      setReviewMessage(payload.error || "Nao foi possivel enviar a avaliacao.");
      return;
    }

    setReviewMessage("Avaliacao enviada para moderacao. Obrigado pelo feedback.");
    setReviewComment("");
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-zinc-900 p-5 text-white">
        <p className="text-sm font-black uppercase text-[#FFC300]">Minha Carga</p>
        <h1 className="mt-1 text-3xl font-black uppercase leading-tight">Pedidos e excursao</h1>
        <p className="mt-2 text-sm font-bold text-neutral-300">Acompanhe fardos, vagas e comprovantes enviados pelos lojistas.</p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase text-neutral-500">Aguardando</p>
          <p className="mt-2 text-4xl font-black text-zinc-900">{summary.waiting}</p>
          <p className="mt-1 text-xs font-bold text-neutral-500">fardos aguardando</p>
        </article>
        <article className="rounded-2xl border border-[#FFC300] bg-[#fff8d6] p-4 shadow-sm">
          <p className="text-xs font-black uppercase text-zinc-900">Nos onibus</p>
          <p className="mt-2 text-4xl font-black text-zinc-900">{summary.inBus}</p>
          <p className="mt-1 text-xs font-bold text-zinc-700">fardos confirmados</p>
        </article>
      </section>

      <section className="space-y-3">
        {orders.map((order) => (
          <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm" key={order.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-lg font-black uppercase text-zinc-900">
                  <span>{order.storeName}</span>
                  {order.storeVerified ? <VerifiedBadge size="sm" /> : null}
                </p>
                <p className="mt-1 text-xs font-black uppercase text-neutral-500">Pedido #{order.id.slice(0, 8)} | {order.itemsCount} itens</p>
              </div>
              <span className="rounded-full bg-[#FFC300] px-3 py-1 text-xs font-black uppercase text-zinc-900">
                {statusLabels[order.status] || "Pendente"}
              </span>
            </div>

            <p className="mt-3 text-2xl font-black text-[#f58220]">{formatPrice(order.total)}</p>

            {order.shipment ? (
              <div className={`mt-4 rounded-2xl border p-4 ${sectorTone(order.shipment.sectorColor)}`}>
                <p className="text-xs font-black uppercase opacity-70">Destaque logistico</p>
                <p className="mt-1 text-2xl font-black uppercase leading-tight">
                  ONIBUS: {order.shipment.excursionName || "Confirmar"} | VAGA: {order.shipment.boxNumber || "-"} | SETOR: {order.shipment.sectorColor || "-"}
                </p>
                {order.shipment.guideName ? <p className="mt-2 text-sm font-bold">Guia: {order.shipment.guideName}</p> : null}
              </div>
            ) : (
              <p className="mt-4 rounded-2xl bg-neutral-100 p-4 text-sm font-black uppercase text-neutral-600">
                O lojista ainda nao informou a vaga da excursao.
              </p>
            )}

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                className="min-h-11 rounded-xl bg-zinc-900 px-4 text-sm font-black uppercase text-white disabled:opacity-40"
                disabled={!order.shipment?.proofUrl}
                onClick={() => setProofUrl(order.shipment?.proofUrl || null)}
                type="button"
              >
                Ver comprovante
              </button>
              <button
                className="min-h-11 rounded-xl bg-[#FFC300] px-4 text-sm font-black uppercase text-zinc-900"
                onClick={() => setMapSector(order.shipment?.sectorColor || "Caruano")}
                type="button"
              >
                Como chegar na vaga
              </button>
              {order.status === "enviado" || order.shipment?.proofUrl ? (
                <button
                  className="min-h-11 rounded-xl border border-[#FFC300] bg-white px-4 text-sm font-black uppercase text-zinc-900 disabled:opacity-40"
                  disabled={!order.reviewTargetProductId}
                  onClick={() => {
                    setReviewOrder(order);
                    setReviewRating(5);
                    setReviewComment("");
                    setReviewMessage("");
                  }}
                  type="button"
                >
                  Avaliar compra
                </button>
              ) : null}
            </div>
          </article>
        ))}

        {!orders.length ? (
          <article className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center">
            <p className="text-sm font-black uppercase text-neutral-500">Voce ainda nao tem cargas ativas.</p>
          </article>
        ) : null}
      </section>

      {proofUrl ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4">
          <div className="relative h-[75vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-neutral-100">
            <Image alt="Comprovante do fardo na excursao" className="object-contain" fill sizes="100vw" src={proofUrl} />
          </div>
          <button className="mt-4 min-h-11 rounded-xl bg-[#FFC300] px-6 text-sm font-black uppercase text-zinc-900" onClick={() => setProofUrl(null)} type="button">
            Fechar
          </button>
        </div>
      ) : null}

      {mapSector ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50">
          <section className="max-h-[86vh] w-full overflow-y-auto rounded-t-2xl bg-neutral-100 p-4 md:mx-auto md:max-w-2xl">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-neutral-300" />
            <ParkingMap sector={mapSector} />
            <button className="mt-4 min-h-11 w-full rounded-xl bg-zinc-900 px-4 text-sm font-black uppercase text-white" onClick={() => setMapSector(null)} type="button">
              Fechar
            </button>
          </section>
        </div>
      ) : null}

      {reviewOrder ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50">
          <section className="w-full rounded-t-2xl bg-white p-5 shadow-2xl md:mx-auto md:max-w-xl">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-neutral-300" />
            <p className="text-sm font-black uppercase text-[#f58220]">Avaliacao da compra</p>
            <h2 className="mt-1 text-2xl font-black uppercase text-zinc-900">{reviewOrder.storeName}</h2>
            <p className="mt-1 text-sm font-bold text-neutral-600">{reviewOrder.reviewTargetProductName || "Produto Caruano"}</p>

            <div className="mt-5">
              <p className="text-sm font-black uppercase text-zinc-900">Sua nota</p>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    aria-label={`Dar nota ${value}`}
                    className="grid h-12 w-12 place-items-center rounded-xl bg-neutral-100 transition active:scale-95"
                    key={value}
                    onClick={() => setReviewRating(value)}
                    type="button"
                  >
                    <svg aria-hidden="true" className={value <= reviewRating ? "fill-[#FFC300] text-[#FFC300]" : "fill-none text-neutral-400"} height="28" viewBox="0 0 24 24" width="28">
                      <path d="m12 2.5 2.95 6 6.62.96-4.79 4.67 1.13 6.59L12 17.62l-5.91 3.1 1.13-6.59-4.79-4.67 6.62-.96L12 2.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <label className="mt-5 block text-sm font-black uppercase text-zinc-900">
              Comentario
              <textarea
                className="mt-2 min-h-28 w-full rounded-xl border border-neutral-300 p-3 text-base font-bold normal-case outline-none focus:border-zinc-900"
                onChange={(event) => setReviewComment(event.target.value)}
                placeholder="Conte como foi o atendimento, produto e entrega."
                value={reviewComment}
              />
            </label>

            {reviewMessage ? <p className="mt-3 rounded-xl bg-[#fff8d6] p-3 text-sm font-black text-zinc-900">{reviewMessage}</p> : null}

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button className="min-h-11 rounded-xl bg-[#FFC300] px-4 text-sm font-black uppercase text-zinc-900 disabled:opacity-50" disabled={sendingReview} onClick={submitReview} type="button">
                {sendingReview ? "Enviando..." : "Enviar avaliacao"}
              </button>
              <button className="min-h-11 rounded-xl bg-zinc-900 px-4 text-sm font-black uppercase text-white" onClick={() => setReviewOrder(null)} type="button">
                Fechar
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
