import { forwardRef } from "react";
import type { OrderPrintData } from "@/lib/data/order-print";

type PrintOrderProps = {
  order: OrderPrintData;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export const PrintOrder = forwardRef<HTMLDivElement, PrintOrderProps>(function PrintOrder({ order }, ref) {
  return (
    <div className="print-ticket print-order print-ticket-vertical" ref={ref}>
      <header className="grid grid-cols-[1fr_2.8cm] gap-3">
        <div>
          <h1 className="text-[42px] font-black leading-none tracking-tight">Caruano</h1>
          <p className="mt-3 text-[15px] leading-tight">Rua Alzira Vidal de Oliveira, 350</p>
          <p className="text-[15px] leading-tight">Petropolis Caruaru - PE</p>
          <p className="text-[15px] leading-tight">CEP 55030-270 - Loja 01</p>
        </div>
        <div className="grid place-items-center">
          <div className="print-qr print-qr-small" />
          <p className="text-[10px] font-black">caruano.com/caruano</p>
        </div>
      </header>

      <section className="mt-5 text-[15px]">
        <p className="text-xl font-black uppercase">Pedido: #{order.id.slice(0, 8).toUpperCase()}</p>
        <p>{formatDate(order.createdAt)}</p>
      </section>

      <section className="print-dashed py-3 text-[15px] leading-tight">
        <p className="text-xl font-black uppercase">Cliente</p>
        <p>{order.customerName}</p>
        <p>Rua Alzira Vidal de Oliveira, 350</p>
        <p>Petropolis Caruaru - PE 55030-270 Casa 01</p>
      </section>

      <section className="print-dashed py-3">
        <h2 className="text-xl font-black uppercase">Itens</h2>
        {order.items.map((item) => (
          <div className="py-2 text-[15px] leading-tight" key={item.id}>
            <p>Cod. {item.sku}</p>
            <p>{item.quantidade}X {item.produto}</p>
            <p>TAM: {item.tamanho} Cor: {item.cor}</p>
          </div>
        ))}
        <div className="mt-2 space-y-1 text-[15px]">
          <div className="flex justify-between"><span>Subtotal:</span><span>{formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between text-xl font-black"><span>TOTAL:</span><span>{formatPrice(order.subtotal)}</span></div>
        </div>
      </section>

      <section className="print-dashed py-3 text-[15px]">
        <p className="font-black uppercase">Forma de entrega:</p>
        <p>Motoboy</p>
        <div className="mt-2 flex justify-between"><span>Valor do Frete:</span><strong className="text-xl">{formatPrice(order.freight)}</strong></div>
        <div className="flex justify-between text-xl font-black"><span>TOTAL A PAGAR:</span><span>{formatPrice(order.total)}</span></div>
      </section>

      <footer className="pt-3 text-center">
        <div className="print-dashed pb-3 text-left text-[15px]">
          <p className="font-black uppercase">Observacoes:</p>
          <p>Fazer a entrega a partir das 15h00</p>
          <p>Trazer troco para R$ 100,00</p>
        </div>
        <p className="mt-2 text-sm font-black">Cod Controle Interno: 000000123457</p>
        <div className="print-barcode print-barcode-wide mx-auto mt-1" />
        <p className="mt-4 text-base font-black uppercase">Obrigado pela preferencia!</p>
      </footer>
    </div>
  );
});
