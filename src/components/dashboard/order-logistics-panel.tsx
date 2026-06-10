"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { MerchantExcursionOption, MerchantExcursionShipment, MerchantOrderStatus } from "@/lib/data/merchant-orders";

type OrderLogisticsPanelProps = {
  orderId: string;
  currentStatus: MerchantOrderStatus;
  excursions: MerchantExcursionOption[];
  shipment: MerchantExcursionShipment | null;
};

const statusOptions: Array<{ value: MerchantOrderStatus; label: string; className: string }> = [
  { value: "pendente_separacao", label: "Pendente", className: "bg-neutral-200 text-neutral-950" },
  { value: "em_separacao", label: "Em separacao", className: "bg-[#fff3a6] text-neutral-950" },
  { value: "pronto_coleta", label: "Pronto para coleta", className: "bg-[#ffd700] text-neutral-950" },
  { value: "enviado", label: "Enviado", className: "bg-[#00a86b] text-white" },
];

const maxProofSizeBytes = 500 * 1024;

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

async function compressImage(file: File) {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  if (file.size <= maxProofSizeBytes) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.src = objectUrl;
  await image.decode();

  let maxSide = 1280;
  let quality = 0.72;
  let bestBlob: Blob | null = null;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const ratio = Math.min(1, maxSide / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * ratio));
    const height = Math.max(1, Math.round(image.height * ratio));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context?.drawImage(image, 0, 0, width, height);
    const blob = await canvasToBlob(canvas, quality);

    if (blob) {
      bestBlob = blob;
      if (blob.size <= maxProofSizeBytes) break;
    }

    quality = Math.max(0.42, quality - 0.08);
    maxSide = Math.max(720, Math.round(maxSide * 0.82));
  }

  URL.revokeObjectURL(objectUrl);

  if (!bestBlob) {
    return file;
  }

  return new File([bestBlob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
}

export function OrderLogisticsPanel({ orderId, currentStatus, excursions, shipment }: OrderLogisticsPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState("");
  const [excursionId, setExcursionId] = useState(shipment?.excursionId || excursions[0]?.id || "");
  const selectedExcursion = useMemo(() => excursions.find((excursion) => excursion.id === excursionId), [excursionId, excursions]);
  const [guideName, setGuideName] = useState(shipment?.guideName || selectedExcursion?.guideName || "");
  const [boxNumber, setBoxNumber] = useState(shipment?.boxNumber || "");
  const [sectorColor, setSectorColor] = useState(shipment?.sectorColor || selectedExcursion?.sectorColor || "");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofLabel, setProofLabel] = useState(shipment?.proofUrl ? "Comprovante ja anexado" : "");
  const [uploadingProof, setUploadingProof] = useState(false);

  function refreshAfterSuccess(message: string) {
    setStatusMessage(message);
    startTransition(() => router.refresh());
  }

  async function updateStatus(nextStatus: MerchantOrderStatus) {
    setStatusMessage("Atualizando status...");
    const response = await fetch(`/api/merchant/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setStatusMessage(data.error || "Nao foi possivel atualizar o status.");
      return;
    }

    refreshAfterSuccess("Status atualizado.");
  }

  async function saveExcursion() {
    setUploadingProof(true);
    setStatusMessage(proofFile ? "Comprimindo comprovante..." : "Salvando logistica...");

    try {
      const formData = new FormData();
      formData.set("excursionId", excursionId);
      formData.set("guideName", guideName);
      formData.set("boxNumber", boxNumber);
      formData.set("sectorColor", sectorColor);
      if (shipment?.proofUrl) formData.set("currentProofUrl", shipment.proofUrl);
      if (proofFile) {
        const compressedProof = await compressImage(proofFile);
        formData.set("proof", compressedProof);
        setStatusMessage(`Enviando comprovante (${Math.round(compressedProof.size / 1024)}kb)...`);
      }

      const response = await fetch(`/api/merchant/orders/${orderId}/excursion`, {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatusMessage(data.error || "Nao foi possivel salvar a logistica.");
        return;
      }

      setProofFile(null);
      setProofLabel("Comprovante enviado com sucesso");
      refreshAfterSuccess("Logistica salva. Pedido pronto para coleta.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Nao foi possivel preparar o comprovante.");
    } finally {
      setUploadingProof(false);
    }
  }

  return (
    <section className="rounded-[8px] bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase text-[#f58220]">Motor de logistica</p>
          <h2 className="text-2xl font-black uppercase text-neutral-950">Excursao e comprovante</h2>
        </div>
        {isPending || uploadingProof ? <span className="rounded-full bg-neutral-200 px-3 py-2 text-xs font-black uppercase text-neutral-700">Atualizando</span> : null}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {statusOptions.map((option) => (
          <button
            className={`min-h-12 rounded-[8px] px-3 text-xs font-black uppercase ${option.value === currentStatus ? option.className : "bg-white text-neutral-950 ring-1 ring-neutral-200"}`}
            key={option.value}
            onClick={() => updateStatus(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="block text-xs font-black uppercase text-neutral-700">
          Excursao / Transportadora
          <select
            className="mt-2 h-12 w-full rounded-[6px] border border-neutral-300 bg-white px-3 text-sm font-bold outline-none"
            onChange={(event) => {
              const nextId = event.target.value;
              const nextExcursion = excursions.find((excursion) => excursion.id === nextId);
              setExcursionId(nextId);
              setGuideName(nextExcursion?.guideName || guideName);
              setSectorColor(nextExcursion?.sectorColor || sectorColor);
            }}
            value={excursionId}
          >
            <option value="">Selecione a excursao</option>
            {excursions.map((excursion) => (
              <option key={excursion.id} value={excursion.id}>
                {excursion.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-black uppercase text-neutral-700">
          Nome do Guia
          <input
            className="mt-2 h-12 w-full rounded-[6px] border border-neutral-300 px-3 text-sm font-bold outline-none"
            onChange={(event) => setGuideName(event.target.value)}
            placeholder="Ex: Jose da Excursao"
            value={guideName}
          />
        </label>

        <label className="block text-xs font-black uppercase text-neutral-700">
          Vaga / Box
          <input
            className="mt-2 h-12 w-full rounded-[6px] border border-neutral-300 px-3 text-sm font-bold outline-none"
            onChange={(event) => setBoxNumber(event.target.value)}
            placeholder="Ex: B12"
            value={boxNumber}
          />
        </label>

        <label className="block text-xs font-black uppercase text-neutral-700">
          Setor / Cor
          <input
            className="mt-2 h-12 w-full rounded-[6px] border border-neutral-300 px-3 text-sm font-bold outline-none"
            onChange={(event) => setSectorColor(event.target.value)}
            placeholder="Ex: Azul"
            value={sectorColor}
          />
        </label>
      </div>

      <label className="mt-4 grid min-h-14 cursor-pointer place-items-center rounded-[8px] border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 text-center text-sm font-black uppercase text-neutral-700">
        Anexar Foto do Comprovante
        <span className="mt-1 block text-xs font-bold normal-case text-neutral-500">{proofLabel || "Abrir camera ou escolher imagem"}</span>
        <input
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0] || null;
            setProofFile(file);
            setProofLabel(file ? `${file.name} selecionado` : "");
          }}
          type="file"
        />
      </label>

      {uploadingProof ? (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-200">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-[#ffd700]" />
        </div>
      ) : null}

      <button className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-[#ffd700] px-4 text-sm font-black uppercase text-neutral-950 disabled:opacity-60" disabled={uploadingProof} onClick={saveExcursion} type="button">
        {uploadingProof ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-950 border-t-transparent" /> : null}
        {uploadingProof ? "Enviando comprovante..." : "Salvar logistica e preparar coleta"}
      </button>
      {statusMessage ? <p className="mt-3 rounded-[8px] bg-neutral-100 p-3 text-sm font-black text-neutral-700">{statusMessage}</p> : null}
    </section>
  );
}
