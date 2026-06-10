"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { PrintLabel } from "@/components/print/print-label";
import { PrintOrder } from "@/components/print/print-order";
import type { OrderPrintData } from "@/lib/data/order-print";

type OrderPrintActionsProps = {
  order: OrderPrintData;
};

export function OrderPrintActions({ order }: OrderPrintActionsProps) {
  const labelRef = useRef<HTMLDivElement>(null);
  const orderRef = useRef<HTMLDivElement>(null);
  const printLabel = useReactToPrint({
    contentRef: labelRef,
    documentTitle: `Etiqueta-${order.id}`,
  });
  const printOrder = useReactToPrint({
    contentRef: orderRef,
    documentTitle: `Pedido-${order.id}`,
  });

  return (
    <section className="mt-4 rounded-[8px] bg-white p-4 shadow-sm">
      <h2 className="text-xl font-black uppercase text-neutral-950">Impressao termica</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <button className="min-h-11 rounded-[6px] bg-[#ffd700] px-4 text-sm font-black uppercase text-neutral-950" onClick={printLabel} type="button">
          Imprimir Etiqueta de Envio
        </button>
        <button className="min-h-11 rounded-[6px] bg-neutral-950 px-4 text-sm font-black uppercase text-white" onClick={printOrder} type="button">
          Imprimir Comprovante de Pedido
        </button>
      </div>
      <div className="mt-4 grid gap-4 overflow-x-auto lg:grid-cols-2">
        <PrintLabel order={order} ref={labelRef} />
        <PrintOrder order={order} ref={orderRef} />
      </div>
    </section>
  );
}
