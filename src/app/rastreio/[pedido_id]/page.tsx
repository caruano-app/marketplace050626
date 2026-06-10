import Image from "next/image";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/header/site-header";
import { getTrackingDetail, type MerchantOrderStatus } from "@/lib/data/merchant-orders";

export const dynamic = "force-dynamic";

type TrackingPageProps = {
  params: {
    pedido_id: string;
  };
  searchParams?: {
    confirmado?: string;
  };
};

const statusLabels: Record<MerchantOrderStatus, string> = {
  pendente_separacao: "Pendente",
  em_separacao: "Em separacao",
  pronto_coleta: "Pronto para coleta",
  enviado: "Enviado",
};

export default async function TrackingPage({ params, searchParams }: TrackingPageProps) {
  const tracking = await getTrackingDetail(params.pedido_id);

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-5">
        <section className="rounded-[8px] bg-neutral-950 p-5 text-white">
          <p className="text-sm font-black uppercase text-[#ffd700]">Rastreio Caruano</p>
          <h1 className="mt-1 text-3xl font-black uppercase leading-tight">Acompanhe seu pedido</h1>
          <p className="mt-2 text-sm font-bold text-neutral-300">Consulta publica para pedidos enviados por excursao, onibus ou coleta regional.</p>
        </section>

        {searchParams?.confirmado ? (
          <div className="mt-4 rounded-[8px] bg-[#00a86b] p-4 text-sm font-black uppercase text-white">
            Conferencia recebida. Pedido marcado como enviado.
          </div>
        ) : null}

        {!tracking ? (
          <section className="mt-4 rounded-[8px] bg-white p-6 text-center shadow-sm">
            <p className="text-lg font-black uppercase text-neutral-950">Pedido nao encontrado.</p>
            <p className="mt-2 text-sm font-bold text-neutral-500">Confira o codigo ou solicite o link novamente ao lojista.</p>
          </section>
        ) : (
          <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_420px]">
            <article className="rounded-[8px] bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black uppercase text-neutral-500">Pedido #{tracking.id.slice(0, 8).toUpperCase()}</p>
                  <h2 className="mt-1 text-2xl font-black uppercase text-neutral-950">{tracking.trackingCode}</h2>
                </div>
                <span className="rounded-full bg-[#ffd700] px-4 py-2 text-xs font-black uppercase text-neutral-950">
                  {statusLabels[tracking.status]}
                </span>
              </div>

              <div className="mt-5 rounded-[8px] border border-neutral-200 p-4">
                <p className="text-xs font-black uppercase text-neutral-500">Cliente</p>
                <p className="mt-1 text-lg font-black text-neutral-950">{tracking.customerName}</p>
                <p className="mt-3 text-xs font-black uppercase text-neutral-500">Loja responsavel</p>
                <p className="mt-1 text-lg font-black text-neutral-950">{tracking.storeName}</p>
              </div>

              {tracking.shipment ? (
                <div className="mt-4 rounded-[8px] border-2 border-[#ffd700] bg-[#fff8cc] p-4">
                  <p className="text-xs font-black uppercase text-neutral-600">Entrega via excursao</p>
                  <p className="mt-2 text-xl font-black uppercase text-neutral-950">
                    Seu pedido esta no Onibus {tracking.shipment.excursionName || "Caruano"}, Vaga {tracking.shipment.boxNumber || "-"}, Setor {tracking.shipment.sectorColor || "-"}.
                  </p>
                  <p className="mt-2 text-sm font-bold text-neutral-700">Guia: {tracking.shipment.guideName || "A confirmar"}</p>
                </div>
              ) : (
                <div className="mt-4 rounded-[8px] bg-white p-4 ring-1 ring-neutral-200">
                  <p className="text-sm font-black uppercase text-neutral-600">A logistica ainda nao foi vinculada a uma excursao.</p>
                </div>
              )}
            </article>

            <aside className="rounded-[8px] bg-white p-4 shadow-sm">
              <h2 className="text-xl font-black uppercase text-neutral-950">Comprovante</h2>
              <div className="relative mt-3 aspect-[4/5] overflow-hidden rounded-[8px] bg-neutral-200">
                {tracking.shipment?.proofUrl ? (
                  <Image alt="Foto do comprovante da excursao" className="object-cover" fill sizes="(max-width: 1024px) 100vw, 420px" src={tracking.shipment.proofUrl} />
                ) : (
                  <div className="grid h-full place-items-center p-5 text-center text-sm font-black uppercase text-neutral-500">
                    Foto do comprovante ainda nao anexada.
                  </div>
                )}
              </div>
            </aside>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
