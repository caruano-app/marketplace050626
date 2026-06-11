"use client";

import { useEffect, useRef, useState } from "react";

type OfflineSale = {
  id: string;
  ean: string;
  quantity: number;
  createdAt: string;
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

export function MobilePdvApp() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ean, setEan] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [status, setStatus] = useState("Pronto para registrar venda de balcao.");
  const [queue, setQueue] = useState<OfflineSale[]>([]);
  const [loading, setLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

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
      productName?: string;
      nextStock?: number;
      lowStockAlert?: boolean;
    };

    if (!response.ok) {
      throw new Error(payload.error || "Falha ao registrar venda.");
    }

    return payload;
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
        payload.lowStockAlert
          ? `Venda registrada: ${payload.productName}. Estoque Baixo! Ver ofertas de reposicao?`
          : `Venda registrada: ${payload.productName}. Estoque atual: ${payload.nextStock}.`,
      );
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
    </div>
  );
}
