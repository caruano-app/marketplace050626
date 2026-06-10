import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderLogisticsPanel } from "@/components/dashboard/order-logistics-panel";
import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { OrderPrintActions } from "@/components/print/order-print-actions";
import { getMerchantOrderDetail } from "@/lib/data/merchant-orders";
import { getOrderPrintData } from "@/lib/data/order-print";

export const dynamic = "force-dynamic";

type MerchantOrderDetailPageProps = {
  params: {
    id: string;
  };
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default async function MerchantOrderDetailPage({ params }: MerchantOrderDetailPageProps) {
  const [order, printOrder] = await Promise.all([
    getMerchantOrderDetail(params.id),
    getOrderPrintData(params.id),
  ]);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-5">
        <section className="rounded-[8px] bg-neutral-950 p-5 text-white">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase text-[#ffd700]">Pedido do lojista</p>
              <h1 className="mt-1 text-3xl font-black uppercase leading-tight">Pedido #{order.id.slice(0, 8)}</h1>
              <p className="mt-2 text-sm font-bold text-neutral-300">{order.customerName} | {formatPrice(order.total)}</p>
            </div>
            <Link className="grid min-h-11 place-items-center rounded-[6px] bg-[#ffd700] px-4 text-sm font-black uppercase text-neutral-950" href="/dashboard/lojista/pedidos">
              Voltar
            </Link>
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_420px]">
          <article className="rounded-[8px] bg-white p-4 shadow-sm">
            <h2 className="text-xl font-black uppercase text-neutral-950">Itens do pedido</h2>
            <div className="mt-3 space-y-3">
              {order.items.map((item) => (
                <div className="grid grid-cols-[64px_1fr] gap-3 rounded-[8px] border border-neutral-200 p-3" key={item.id}>
                  <div className="relative h-16 w-16 overflow-hidden rounded-[6px] bg-neutral-200">
                    {item.imagem ? <Image alt={item.produto} className="object-cover" fill sizes="64px" src={item.imagem} /> : null}
                  </div>
                  <div>
                    <p className="line-clamp-1 text-sm font-black uppercase text-neutral-950">{item.produto}</p>
                    <p className="mt-1 text-xs font-bold text-neutral-500">SKU {item.sku}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="rounded-[6px] bg-neutral-100 px-3 py-1 text-xs font-black uppercase text-neutral-700">
                        {item.quantidade} un.
                      </span>
                      <strong className="text-sm text-[#f58220]">{formatPrice(item.preco_unitario_aplicado * item.quantidade)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <aside className="space-y-4">
            <section className="rounded-[8px] bg-white p-4 shadow-sm">
              <h2 className="text-xl font-black uppercase text-neutral-950">Cliente</h2>
              <p className="mt-2 text-sm font-black text-neutral-950">{order.customerName}</p>
              <p className="text-sm font-bold text-neutral-600">{order.customerPhone}</p>
              <p className="text-sm font-bold text-neutral-600">{order.customerEmail}</p>
            </section>
            <section className="rounded-[8px] bg-[#fff8cc] p-4 ring-1 ring-[#ffd700]">
              <h2 className="text-xl font-black uppercase text-neutral-950">Rastreio</h2>
              <p className="mt-2 break-all text-sm font-bold text-neutral-700">/rastreio/{order.id}</p>
              <Link className="mt-3 grid min-h-11 place-items-center rounded-[6px] bg-neutral-950 px-4 text-sm font-black uppercase text-white" href={`/rastreio/${order.id}`}>
                Abrir rastreio
              </Link>
            </section>
          </aside>
        </section>

        <div className="mt-4">
          <OrderLogisticsPanel currentStatus={order.status} excursions={order.excursions} orderId={order.id} shipment={order.shipment} />
        </div>

        <OrderPrintActions order={printOrder} />
      </main>
      <SiteFooter />
    </div>
  );
}
