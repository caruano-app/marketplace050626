"use client";

import { useEffect, useMemo, useState } from "react";
import { documentLabels, type IdentityDocument, type IdentityDocumentType, type IdentityStatus } from "@/lib/data/kyc";

type VerificationResponse = {
  documents: IdentityDocument[];
  status: IdentityStatus;
  error?: string;
};

type UploadField = {
  type: IdentityDocumentType;
  label: string;
  helper: string;
  capture: "environment" | "user";
  accept?: string;
};

const maxBytes = 800 * 1024;
const imageAccept = "image/*,application/pdf";

const steps = [
  { id: 1, title: "Identidade" },
  { id: 2, title: "Veiculo" },
  { id: 3, title: "Selfie" },
];

const identityFields: UploadField[] = [
  {
    type: "cnh",
    label: "CNH frente e verso",
    helper: "Envie a CNH completa. Se necessario, use uma foto composta com frente e verso legiveis.",
    capture: "environment",
    accept: imageAccept,
  },
];

const vehicleFields: UploadField[] = [
  { type: "crlv", label: "CRLV do veiculo", helper: "Documento atualizado do veiculo usado nas entregas.", capture: "environment", accept: imageAccept },
  { type: "foto_veiculo", label: "Foto do veiculo", helper: "Mostre o veiculo com a placa visivel.", capture: "environment", accept: "image/*" },
];

const selfieField: UploadField = {
  type: "selfie_identidade",
  label: "Selfie de seguranca",
  helper: "Sua selfie confirma que voce e o responsavel pelo transporte.",
  capture: "user",
  accept: "image/*",
};

function statusBadge(document?: IdentityDocument) {
  if (!document) return <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-black uppercase text-neutral-500">Pendente</span>;
  if (document.status === "aprovado") return <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black uppercase text-green-700">OK</span>;
  if (document.status === "rejeitado") return <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black uppercase text-red-700">Rejeitado</span>;
  return <span className="rounded-full bg-[#fff4b8] px-3 py-1 text-xs font-black uppercase text-neutral-900">Em analise</span>;
}

async function fileToImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = URL.createObjectURL(file);
  });
}

async function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

async function compressImage(file: File) {
  if (!file.type.startsWith("image/") || file.size <= maxBytes) return file;

  const image = await fileToImage(file);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");

  if (!context) return file;

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(image.src);

  for (const quality of [0.78, 0.68, 0.58, 0.48]) {
    const blob = await canvasToBlob(canvas, quality);
    if (blob && blob.size <= maxBytes) {
      return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
    }
  }

  const fallbackBlob = await canvasToBlob(canvas, 0.42);
  return fallbackBlob ? new File([fallbackBlob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }) : file;
}

export function DriverVerificationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [documents, setDocuments] = useState<IdentityDocument[]>([]);
  const [status, setStatus] = useState<IdentityStatus>("nao_enviado");
  const [message, setMessage] = useState("Carregando documentos...");
  const [uploadingType, setUploadingType] = useState<IdentityDocumentType | null>(null);

  const latestByType = useMemo(() => {
    const entries = new Map<IdentityDocumentType, IdentityDocument>();
    documents.forEach((documentItem) => {
      if (!entries.has(documentItem.tipo)) entries.set(documentItem.tipo, documentItem);
    });
    return entries;
  }, [documents]);

  async function loadDocuments() {
    const response = await fetch("/api/verification/documents", { cache: "no-store" });
    const payload = (await response.json()) as VerificationResponse;

    if (!response.ok) {
      setMessage(payload.error || "Nao foi possivel carregar os documentos.");
      return;
    }

    setDocuments(payload.documents || []);
    setStatus(payload.status || "nao_enviado");
    setMessage("Envie fotos nitidas. Documentos serao analisados pela equipe Caruano.");
  }

  useEffect(() => {
    void loadDocuments();
  }, []);

  async function uploadDocument(type: IdentityDocumentType, file: File | null) {
    if (!file) return;

    setUploadingType(type);
    setMessage("Comprimindo e enviando documento...");

    try {
      const optimizedFile = await compressImage(file);
      const formData = new FormData();
      formData.append("type", type);
      formData.append("file", optimizedFile);

      const response = await fetch("/api/verification/documents", { method: "POST", body: formData });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage(payload.error || "Nao foi possivel enviar o documento.");
        return;
      }

      setMessage(`${documentLabels[type]} enviado para analise.`);
      await loadDocuments();
    } catch {
      setMessage("Falha ao preparar o arquivo. Tente outra foto.");
    } finally {
      setUploadingType(null);
    }
  }

  function renderUploadField(field: UploadField, selfie = false) {
    const currentDocument = latestByType.get(field.type);

    return (
      <article className="rounded-[8px] border border-neutral-200 bg-white p-4 shadow-sm" key={field.type}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-black uppercase text-neutral-950">{field.label}</h3>
            <p className="mt-1 text-sm font-bold text-neutral-600">{field.helper}</p>
          </div>
          {statusBadge(currentDocument)}
        </div>

        {selfie ? (
          <div className="mx-auto my-4 grid h-44 w-44 place-items-center rounded-full border-4 border-dashed border-[#ffd700] bg-neutral-100 text-center text-xs font-black uppercase text-neutral-500">
            Centralize seu rosto
          </div>
        ) : null}

        <label className="mt-4 grid min-h-11 cursor-pointer place-items-center rounded-[6px] bg-neutral-950 px-4 text-center text-sm font-black uppercase text-white active:scale-95 active:opacity-80">
          {uploadingType === field.type ? "Enviando..." : "Anexar arquivo"}
          <input
            accept={field.accept || imageAccept}
            capture={field.capture}
            className="sr-only"
            disabled={uploadingType !== null}
            onChange={(event) => uploadDocument(field.type, event.target.files?.[0] || null)}
            type="file"
          />
        </label>
      </article>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <section className="rounded-[8px] bg-neutral-950 p-5 text-white">
        <p className="text-sm font-black uppercase text-[#ffd700]">Transportador Caruano</p>
        <h1 className="mt-1 text-3xl font-black uppercase leading-tight">Verificacao do entregador</h1>
        <p className="mt-2 text-sm font-bold text-neutral-300">Valide identidade, veiculo e selfie para liberar fretes locais, intermunicipais e excursao.</p>
        <p className="mt-3 rounded-[6px] bg-white/10 p-3 text-sm font-black uppercase">Status: {status.replace("_", " ")}</p>
      </section>

      <nav className="grid grid-cols-3 gap-2 rounded-[8px] bg-white p-2 shadow-sm">
        {steps.map((step) => (
          <button
            className={`min-h-11 rounded-[6px] text-xs font-black uppercase ${currentStep === step.id ? "bg-[#ffd700] text-neutral-950" : "bg-neutral-100 text-neutral-600"}`}
            key={step.id}
            onClick={() => setCurrentStep(step.id)}
            type="button"
          >
            {step.id}. {step.title}
          </button>
        ))}
      </nav>

      {message ? <p className="rounded-[8px] bg-[#fff4b8] p-3 text-sm font-black text-neutral-950">{message}</p> : null}

      {currentStep === 1 ? (
        <section className="space-y-3">
          <div className="rounded-[8px] border border-neutral-200 bg-white p-4">
            <h2 className="text-xl font-black uppercase text-neutral-950">Passo 1: Identidade</h2>
            <p className="mt-1 text-sm font-bold text-neutral-600">Use a camera traseira para enviar CNH legivel.</p>
          </div>
          {identityFields.map((field) => renderUploadField(field))}
        </section>
      ) : null}

      {currentStep === 2 ? (
        <section className="space-y-3">
          <div className="rounded-[8px] border border-neutral-200 bg-white p-4">
            <h2 className="text-xl font-black uppercase text-neutral-950">Passo 2: Veiculo</h2>
            <p className="mt-1 text-sm font-bold text-neutral-600">Envie CRLV e uma foto do veiculo com a placa visivel.</p>
          </div>
          {vehicleFields.map((field) => renderUploadField(field))}
        </section>
      ) : null}

      {currentStep === 3 ? (
        <section className="space-y-3">
          <div className="rounded-[8px] border border-neutral-200 bg-white p-4">
            <h2 className="text-xl font-black uppercase text-neutral-950">Passo 3: Selfie</h2>
            <p className="mt-1 text-sm font-bold text-neutral-600">A selfie protege voce e os lojistas contra uso indevido de cadastro.</p>
          </div>
          {renderUploadField(selfieField, true)}
        </section>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white p-3 md:hidden">
        <div className="grid grid-cols-2 gap-2">
          <button className="min-h-11 rounded-[6px] bg-neutral-100 text-sm font-black uppercase text-neutral-950 disabled:opacity-50" disabled={currentStep === 1} onClick={() => setCurrentStep((step) => Math.max(1, step - 1))} type="button">
            Voltar
          </button>
          <button className="min-h-11 rounded-[6px] bg-[#ffd700] text-sm font-black uppercase text-neutral-950 disabled:opacity-50" disabled={currentStep === 3} onClick={() => setCurrentStep((step) => Math.min(3, step + 1))} type="button">
            Proximo
          </button>
        </div>
      </div>
    </div>
  );
}
