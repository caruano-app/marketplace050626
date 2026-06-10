import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { OrderPrintActions } from "@/components/print/order-print-actions";
import { getOrderPrintData } from "@/lib/data/order-print";

type MerchantOrderPageProps = {
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

export default async function MerchantOrderPage({ params }: MerchantOrderPageProps) {
  const order = await getOrderPrintData(params.id);

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-5">
        <section className="rounded-[8px] bg-neutral-950 p-5 text-white">
          <p className="text-sm font-black uppercase text-[#ffd700]">Pedido do lojista</p>
          <h1 className="mt-1 text-3xl font-black uppercase">Pedido #{order.id.slice(0, 8)}</h1>
          <p className="mt-2 text-sm font-bold text-neutral-300">{order.customerName} | {formatPrice(order.total)}</p>
        </section>
        <OrderPrintActions order={order} />
      </main>
      <SiteFooter />
    </div>
  );
}
