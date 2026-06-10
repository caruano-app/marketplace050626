import { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";
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

const logoDataUrl =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' rx='18' fill='%23ffd700'/%3E%3Ctext x='48' y='58' text-anchor='middle' font-family='Arial' font-size='42' font-weight='900' fill='%23171717'%3EC%3C/text%3E%3C/svg%3E";

function QrCode({ value }: { value: string }) {
  return (
    <div className="grid h-[3cm] w-[3cm] place-items-center bg-white" aria-label="QR Code de conferencia">
      <QRCodeSVG
        bgColor="#ffffff"
        fgColor="#171717"
        imageSettings={{ src: logoDataUrl, height: 28, width: 28, excavate: true }}
        level="H"
        size={112}
        value={value}
      />
    </div>
  );
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
            <QrCode value={order.trackingUrl} />
            <p className="mt-1 text-center text-xs font-black">conferencia caruano</p>
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
