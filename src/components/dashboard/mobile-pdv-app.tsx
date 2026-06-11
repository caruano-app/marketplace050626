"use client";

import { useEffect, useRef, useState } from "react";

type OfflineSale = {
  id: string;
  ean: string;
  quantity: number;
  createdAt: string;
};

type BestOffer = {
  id: string;
  distribuidoraId: string | null;
  productId: string;
  ean: string;
  productName: string;
  price: number;
  stock: number;
  distributorName: string;
};

type SaleReceipt = {
  saleId: string;
  productId: string;
  ean: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  nextStock: number;
  lowStockAlert: boolean;
  bestOffer: BestOffer | null;
  receipt: {
    storeName: string;
    logoUrl: string | null;
    date: string;
    footer: string;
  };
};

const queueKey = "caruano-pdv-offline-queue";

function readQueue(): OfflineSale[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(queueKey) || "[]") as OfflineSale[];
  } catch {
    return [];
  }
}

function writeQueue(queue: OfflineSale[]) {
  window.localStorage.setItem(queueKey, JSON.stringify(queue));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export function MobilePdvApp() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ean, setEan] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [status, setStatus] = useState("Pronto para registrar venda de balcao.");
  const [queue, setQueue] = useState<OfflineSale[]>([]);
  const [loading, setLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [lastSale, setLastSale] = useState<SaleReceipt | null>(null);

  useEffect(() => {
    setQueue(readQueue());

    function handleOnline() {
      syncQueue();
    }

    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function postSale(sale: Omit<OfflineSale, "id" | "createdAt">) {
    const response = await fetch("/api/merchant/pdv/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sale),
    });
    const payload = (await response.json()) as {
      error?: string;
      saleId: string;
      productId: string;
      ean: string;
      productName?: string;
      quantity: number;
      unitPrice: number;
      total: number;
      nextStock?: number;
      lowStockAlert?: boolean;
      bestOffer?: BestOffer | null;
      receipt: SaleReceipt["receipt"];
    };

    if (!response.ok) {
      throw new Error(payload.error || "Falha ao registrar venda.");
    }

    return payload as SaleReceipt;
  }

  function enqueueSale() {
    const offlineSale: OfflineSale = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ean: ean.replace(/\D/g, ""),
      quantity: Number(quantity || 1),
      createdAt: new Date().toISOString(),
    };
    const nextQueue = [...readQueue(), offlineSale];
    writeQueue(nextQueue);
    setQueue(nextQueue);
    setStatus("Sem conexao ou erro temporario. Venda salva para sincronizar depois.");
  }

  async function confirmSale() {
    const cleanEan = ean.replace(/\D/g, "");

    if (!cleanEan) {
      setStatus("Leia ou digite o EAN-13 do produto.");
      return;
    }

    setLoading(true);
    setStatus("Registrando venda...");

    try {
      const payload = await postSale({ ean: cleanEan, quantity: Number(quantity || 1) });
      setStatus(
        payload.lowStockAlert && payload.bestOffer
          ? `Venda registrada: ${payload.productName}. Produto acabando! Melhor preco no Caruano: ${payload.bestOffer.distributorName} - ${formatPrice(payload.bestOffer.price)}.`
          : payload.lowStockAlert
            ? `Venda registrada: ${payload.productName}. Estoque Baixo! Ver ofertas de reposicao?`
          : `Venda registrada: ${payload.productName}. Estoque atual: ${payload.nextStock}.`,
      );
      setLastSale(payload);
      setEan("");
      setQuantity("1");
    } catch {
      enqueueSale();
    } finally {
      setLoading(false);
    }
  }

  async function syncQueue() {
    const currentQueue = readQueue();
    if (!currentQueue.length) {
      setStatus("Nenhuma venda offline pendente.");
      return;
    }

    setLoading(true);
    const remaining: OfflineSale[] = [];

    for (const sale of currentQueue) {
      try {
        await postSale({ ean: sale.ean, quantity: sale.quantity });
      } catch {
        remaining.push(sale);
      }
    }

    writeQueue(remaining);
    setQueue(remaining);
    setStatus(remaining.length ? `${remaining.length} vendas ainda pendentes.` : "Vendas offline sincronizadas.");
    setLoading(false);
  }

  async function acceptReplenishment() {
    if (!lastSale?.bestOffer?.distribuidoraId) {
      setStatus("Nao ha distribuidora valida para gerar ordem de abastecimento.");
      return;
    }

    setLoading(true);
    setStatus("Gerando ordem de abastecimento...");

    const response = await fetch("/api/merchant/replenishment/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        distribuidoraId: lastSale.bestOffer.distribuidoraId,
        productId: lastSale.productId,
        productName: lastSale.productName,
        quantity: Math.max(10, 20 - lastSale.nextStock),
        unitPrice: lastSale.bestOffer.price,
      }),
    });
    const payload = (await response.json()) as { orderId?: string; warnings?: string[]; error?: string };

    if (!response.ok) {
      setStatus(payload.error || "Nao foi possivel gerar a ordem de abastecimento.");
      setLoading(false);
      return;
    }

    setStatus(
      payload.warnings?.length
        ? `Ordem ${payload.orderId} criada. Avisos: ${payload.warnings.join(" | ")}`
        : `Ordem de abastecimento ${payload.orderId} criada e frete de carga solicitado.`,
    );
    setLoading(false);
  }

  async function startScanner() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;

      setCameraOpen(true);
      video.srcObject = stream;
      await video.play();
      setStatus("Camera ativa. Aponte para o codigo EAN.");

      if ("BarcodeDetector" in window && window.BarcodeDetector) {
        const detector = new window.BarcodeDetector({ formats: ["ean_13", "ean_8", "code_128"] });
        const scan = async () => {
          const activeVideo = videoRef.current;
          if (!activeVideo || !streamRef.current) return;
          const codes = await detector.detect(activeVideo);
          if (codes[0]) {
            setEan(codes[0].rawValue.replace(/\D/g, ""));
            setStatus("Codigo lido. Confirme a venda.");
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            setCameraOpen(false);
            return;
          }
          window.requestAnimationFrame(scan);
        };
        scan();
      } else {
        setStatus("Scanner nativo indisponivel neste navegador. Digite o EAN manualmente.");
      }
    } catch {
      setStatus("Permissao de camera negada ou indisponivel.");
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[8px] bg-neutral-950 p-5 text-white">
        <p className="text-sm font-black uppercase text-[#ffd700]">PDV Mobile</p>
        <h1 className="mt-1 text-3xl font-black uppercase leading-tight">Venda de balcao em um clique</h1>
        <p className="mt-2 text-sm font-bold text-neutral-300">Escaneie o EAN, confirme a quantidade e deixe o Caruano cuidar do estoque.</p>
      </section>

      <section className="rounded-[8px] bg-white p-4 shadow-sm">
        <video className={`aspect-video w-full rounded-[8px] bg-neutral-200 object-cover ${cameraOpen ? "block" : "hidden"}`} muted playsInline ref={videoRef} />

        <button className="min-h-[60px] w-full rounded-[8px] bg-neutral-950 px-4 text-base font-black uppercase text-white transition active:scale-95" onClick={startScanner} type="button">
          Scanner EAN-13
        </button>

        <label className="mt-4 block">
          <span className="text-sm font-black uppercase text-neutral-700">Codigo EAN</span>
          <input
            className="mt-2 min-h-[60px] w-full rounded-[8px] border border-neutral-300 px-4 text-xl font-black tracking-wide"
            inputMode="numeric"
            onChange={(event) => setEan(event.target.value.replace(/\D/g, ""))}
            placeholder="7891234567890"
            value={ean}
          />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-black uppercase text-neutral-700">Quantidade</span>
          <input
            className="mt-2 min-h-[60px] w-full rounded-[8px] border border-neutral-300 px-4 text-xl font-black"
            inputMode="numeric"
            min="1"
            onChange={(event) => setQuantity(event.target.value.replace(/\D/g, "") || "1")}
            value={quantity}
          />
        </label>

        <button
          className="mt-4 min-h-[60px] w-full rounded-[8px] bg-[#ffd700] px-4 text-base font-black uppercase text-neutral-950 transition active:scale-95 disabled:opacity-50"
          disabled={loading}
          onClick={confirmSale}
          type="button"
        >
          {loading ? "Processando..." : "Confirmar venda"}
        </button>

        <div className="mt-4 rounded-[8px] bg-neutral-100 p-3 text-sm font-black text-neutral-800">{status}</div>

        {lastSale ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button className="min-h-[60px] rounded-[8px] bg-neutral-950 px-4 text-base font-black uppercase text-white" onClick={() => window.print()} type="button">
              Imprimir cupom 80mm
            </button>
            {lastSale.bestOffer ? (
              <button
                className="min-h-[60px] rounded-[8px] bg-[#ffd700] px-4 text-base font-black uppercase text-neutral-950 disabled:opacity-50"
                disabled={loading}
                onClick={acceptReplenishment}
                type="button"
              >
                Gerar ordem B2B
              </button>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="rounded-[8px] bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black uppercase text-neutral-950">Fila offline</h2>
            <p className="text-sm font-bold text-neutral-500">{queue.length} vendas aguardando sincronizacao.</p>
          </div>
          <button className="min-h-11 rounded-[6px] bg-neutral-950 px-4 text-sm font-black uppercase text-white" onClick={syncQueue} type="button">
            Sincronizar
          </button>
        </div>
      </section>

      {lastSale ? (
        <section className="pdv-print-only">
          <div className="pdv-receipt">
            <div className="pdv-receipt-center">
              {lastSale.receipt.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={lastSale.receipt.storeName} className="pdv-receipt-logo" src={lastSale.receipt.logoUrl} />
              ) : (
                <h1>{lastSale.receipt.storeName}</h1>
              )}
              <p>Venda PDV #{lastSale.saleId.slice(0, 8)}</p>
              <p>{formatDate(lastSale.receipt.date)}</p>
            </div>
            <div className="pdv-receipt-line" />
            <p><strong>Produto:</strong> {lastSale.productName}</p>
            <p><strong>EAN:</strong> {lastSale.ean}</p>
            <p><strong>Qtd:</strong> {lastSale.quantity}</p>
            <p><strong>Unit.:</strong> {formatPrice(lastSale.unitPrice)}</p>
            <div className="pdv-receipt-total">
              <span>Total</span>
              <strong>{formatPrice(lastSale.total)}</strong>
            </div>
            <div className="pdv-receipt-line" />
            <p>Estoque atual: {lastSale.nextStock}</p>
            {lastSale.bestOffer ? (
              <p>Reposicao: {lastSale.bestOffer.distributorName} - {formatPrice(lastSale.bestOffer.price)}</p>
            ) : null}
            <div className="pdv-receipt-line" />
            <p className="pdv-receipt-center">{lastSale.receipt.footer}</p>
          </div>
        </section>
      ) : null}

      <style jsx global>{`
        .pdv-print-only {
          display: none;
        }

        @media print {
          body * {
            visibility: hidden !important;
          }

          .pdv-print-only,
          .pdv-print-only * {
            visibility: visible !important;
          }

          .pdv-print-only {
            display: block !important;
            position: fixed;
            inset: 0;
            background: white;
            color: #111;
          }

          @page {
            size: 80mm auto;
            margin: 4mm;
          }

          .pdv-receipt {
            width: 72mm;
            font-family: Arial, sans-serif;
            font-size: 11px;
            line-height: 1.25;
          }

          .pdv-receipt h1 {
            font-size: 22px;
            margin: 0 0 4px;
            text-transform: uppercase;
          }

          .pdv-receipt-logo {
            max-width: 48mm;
            max-height: 18mm;
            object-fit: contain;
            margin: 0 auto 4px;
          }

          .pdv-receipt-center {
            text-align: center;
          }

          .pdv-receipt-line {
            border-top: 1px dashed #111;
            margin: 8px 0;
          }

          .pdv-receipt-total {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-top: 8px;
            font-size: 16px;
            font-weight: 900;
          }
        }
      `}</style>
    </div>
  );
}
