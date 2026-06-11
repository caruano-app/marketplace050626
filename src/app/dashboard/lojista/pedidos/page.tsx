import Link from "next/link";
import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getMerchantOrders, type MerchantOrderStatus } from "@/lib/data/merchant-orders";

export const dynamic = "force-dynamic";

const statusStyles: Record<MerchantOrderStatus, string> = {
  pendente_separacao: "bg-neutral-200 text-neutral-950",
  em_separacao: "bg-[#fff3a6] text-neutral-950",
  pronto_coleta: "bg-[#ffd700] text-neutral-950",
  enviado: "bg-[#00a86b] text-white",
};

const statusLabels: Record<MerchantOrderStatus, string> = {
  pendente_separacao: "Pendente",
  em_separacao: "Em separacao",
  pronto_coleta: "Pronto para coleta",
  enviado: "Enviado",
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function whatsappHref(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  const normalizedPhone = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

export default async function MerchantOrdersPage() {
  const orders = await getMerchantOrders();

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-5">
        <section className="rounded-[8px] bg-neutral-950 p-5 text-white">
          <p className="text-sm font-black uppercase text-[#ffd700]">Pedidos e excursao</p>
          <h1 className="mt-1 text-3xl font-black uppercase leading-tight">Gestao de pedidos</h1>
          <p className="mt-2 text-sm font-bold text-neutral-300">
            Separe vendas, gere etiqueta e registre comprovante da entrega no onibus direto pelo celular.
          </p>
        </section>

        <section className="mt-4 rounded-[8px] bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black uppercase text-neutral-950">Pedidos recebidos</h2>
            <Link className="grid min-h-11 place-items-center rounded-[6px] bg-[#ffd700] px-4 text-sm font-black uppercase text-neutral-950" href="/dashboard/lojista">
              Voltar ao painel
            </Link>
          </div>

          <div className="mt-4 grid gap-3">
            {orders.map((order) => {
              const whatsappMessage = `Ola ${order.customerName}, recebemos seu pedido #${order.id.slice(0, 8)}. Ja estamos preparando para a excursao!`;

              return (
              <article className="rounded-[8px] border border-neutral-200 p-4 transition hover:border-neutral-950" key={order.id}>
                <article className="grid gap-3 md:grid-cols-[1fr_180px_150px] md:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-black uppercase text-neutral-950">Pedido #{order.id.slice(0, 8)}</p>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase ${statusStyles[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-neutral-600">{order.customerName} | {order.customerPhone}</p>
                    <p className="mt-1 text-xs font-bold uppercase text-neutral-400">{formatDate(order.createdAt)} | {order.itemsCount} itens</p>
                  </div>
                  <p className="text-2xl font-black text-[#f58220] md:text-right">{formatPrice(order.total)}</p>
                  <Link className="grid min-h-11 place-items-center rounded-[6px] bg-neutral-950 px-4 text-sm font-black uppercase text-white" href={`/dashboard/lojista/pedidos/${order.id}`}>
                    Abrir
                  </Link>
                </article>
                <a
                  className="mt-3 grid min-h-11 place-items-center rounded-[6px] bg-[#25D366] px-4 text-sm font-black uppercase text-white"
                  href={whatsappHref(order.customerPhone, whatsappMessage)}
                  rel="noreferrer"
                  target="_blank"
                >
                  Chamar no Zap
                </a>
              </article>
              );
            })}

            {!orders.length ? (
              <div className="rounded-[8px] border border-dashed border-neutral-300 p-8 text-center">
                <p className="text-sm font-black uppercase text-neutral-500">Nenhum pedido recebido ainda.</p>
              </div>
            ) : null}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
