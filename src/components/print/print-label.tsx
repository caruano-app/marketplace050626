import { forwardRef } from "react";
import type { OrderPrintData } from "@/lib/data/order-print";

type PrintLabelProps = {
  order: OrderPrintData;
};

function Barcode({ value }: { value: string }) {
  return (
    <div className="w-full">
      <div className="print-barcode print-barcode-wide" />
      <p className="mt-1 text-center text-[10px] font-black tracking-[0.18em]">CONTROLE CARUANO</p>
      <p className="text-center text-[10px] font-black">{value}</p>
    </div>
  );
}

function QrCode() {
  return <div className="print-qr" aria-label="QR Code" />;
}

export const PrintLabel = forwardRef<HTMLDivElement, PrintLabelProps>(function PrintLabel({ order }, ref) {
  return (
    <div className="print-ticket print-label print-ticket-vertical" ref={ref}>
      <header className="text-center">
        <h1 className="text-[46px] font-black leading-none tracking-tight">Caruano</h1>
        <Barcode value={order.trackingCode} />
      </header>

      <main className="grid grid-cols-[1fr_2.7cm] gap-2 py-2">
        <section className="space-y-2 text-[15px] leading-tight">
          <div>
            <p className="mb-1 inline-block bg-neutral-950 px-2 py-1 text-lg font-black uppercase text-white">Destinatario</p>
            <p>{order.customerName}</p>
            <p>Rua Alzira Vidal de Oliveira, 350</p>
            <p>Petropolis Caruaru - PE</p>
            <p>55030-270</p>
            <p>Casa 01</p>
          </div>
          <div>
            <p className="mb-1 inline-block bg-neutral-950 px-2 py-1 text-lg font-black uppercase text-white">Remetente</p>
            <p className="font-black uppercase">{order.storeName}</p>
            <p>Rua Alzira Vidal de Oliveira, 350</p>
            <p>Petropolis Caruaru - PE</p>
            <p>55030-270</p>
            <p>Casa 01</p>
          </div>
          <div className="grid place-items-center">
            <QrCode />
            <p className="mt-1 text-center text-xs font-black">caruano.com/{order.storeName.toLowerCase().replace(/\s+/g, "-")}</p>
          </div>
        </section>
        <div className="flex items-center justify-center">
          <p className="print-tracking-vertical font-black uppercase tracking-[0.16em]">
            Codigo de rastreamento {order.trackingCode.replace(/-/g, "")}
          </p>
        </div>
      </main>

      <footer className="border-t border-black pt-2 text-center">
        <p className="text-lg font-black">Nota Fiscal: 000000123457</p>
        <div className="print-barcode print-barcode-wide mt-1" />
        <p className="mt-2 text-xl font-black">Volume: {order.volume} | Peso (Kg): {order.weightKg.toFixed(3).replace(".", ",")}</p>
        <p className="mt-2 text-base font-black uppercase">Transporte via: Caruano Log</p>
        <p className="text-sm font-black">81 9 9280.7798 | 81 99405.0053</p>
      </footer>
    </div>
  );
});
