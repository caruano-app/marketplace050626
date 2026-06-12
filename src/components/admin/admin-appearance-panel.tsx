"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { AdminAppearanceConfig } from "@/lib/data/admin-appearance";

type AdminAppearancePanelProps = {
  initialConfig: AdminAppearanceConfig;
};

type UploadField = "logoUrl" | "heroBannerUrl" | "highlightBannerUrl";

const uploadLabels: Record<UploadField, { title: string; hint: string }> = {
  logoUrl: {
    title: "Logo do Site",
    hint: "Bucket assets | PNG, JPG ou WebP",
  },
  heroBannerUrl: {
    title: "Banner Principal",
    hint: "Referencia 1440x570px",
  },
  highlightBannerUrl: {
    title: "Banner Destaque",
    hint: "Referencia 1412x260px",
  },
};

function applyPrimaryColor(color: string) {
  document.documentElement.style.setProperty("--primary", color);
}

export function AdminAppearancePanel({ initialConfig }: AdminAppearancePanelProps) {
  const [primaryColor, setPrimaryColor] = useState(initialConfig.primaryColor);
  const [marqueeText, setMarqueeText] = useState(initialConfig.marqueeText);
  const [assets, setAssets] = useState({
    logoUrl: initialConfig.logoUrl,
    heroBannerUrl: initialConfig.heroBannerUrl,
    highlightBannerUrl: initialConfig.highlightBannerUrl,
  });
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState<UploadField | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileRefs = {
    logoUrl: useRef<HTMLInputElement>(null),
    heroBannerUrl: useRef<HTMLInputElement>(null),
    highlightBannerUrl: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    applyPrimaryColor(primaryColor);
  }, [primaryColor]);

  const sourceLabel = useMemo(() => (initialConfig.source === "database" ? "Banco ativo" : "Fallback visual"), [initialConfig.source]);

  function saveCms() {
    setMessage("Salvando aparencia...");
    startTransition(async () => {
      const response = await fetch("/api/admin/appearance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primaryColor, marqueeText }),
      });
      const payload = (await response.json()) as { error?: string; primaryColor?: string };

      if (!response.ok) {
        setMessage(payload.error || "Nao foi possivel salvar a aparencia.");
        return;
      }

      if (payload.primaryColor) {
        setPrimaryColor(payload.primaryColor);
        applyPrimaryColor(payload.primaryColor);
      }
      setMessage("Aparencia salva. A Home passa a ler esta configuracao.");
    });
  }

  async function uploadAsset(field: UploadField) {
    const file = fileRefs[field].current?.files?.[0];
    if (!file) {
      setMessage(`Selecione uma imagem para ${uploadLabels[field].title}.`);
      return;
    }

    setUploading(field);
    setMessage(`Enviando ${uploadLabels[field].title}...`);

    const formData = new FormData();
    formData.append("assetType", field);
    formData.append("file", file);

    const response = await fetch("/api/admin/appearance", {
      method: "POST",
      body: formData,
    });
    const payload = (await response.json()) as { error?: string; publicUrl?: string };
    setUploading(null);

    if (!response.ok || !payload.publicUrl) {
      setMessage(payload.error || "Nao foi possivel enviar a imagem.");
      return;
    }

    setAssets((current) => ({ ...current, [field]: payload.publicUrl }));
    setMessage(`${uploadLabels[field].title} atualizado.`);
  }

  return (
    <section className="rounded-[8px] bg-white p-4 shadow-sm" id="admin-aparencia">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase text-orange-600">CMS e aparencia</p>
          <h2 className="mt-1 text-xl font-black uppercase text-neutral-950">Banners, logo e letreiro</h2>
          <p className="mt-1 text-sm font-bold text-neutral-600">
            Salva em <span className="font-black">configuracoes_home</span>. Status: {sourceLabel}.
          </p>
        </div>
        <span className="h-12 w-12 rounded-full border border-neutral-300" style={{ backgroundColor: primaryColor }} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[160px_1fr_180px]">
        <label className="text-xs font-black uppercase text-neutral-600">
          Cor primaria
          <input
            className="mt-2 h-12 w-full rounded-[8px] border border-neutral-300 bg-white p-1"
            onChange={(event) => setPrimaryColor(event.target.value)}
            type="color"
            value={primaryColor}
          />
        </label>
        <label className="text-xs font-black uppercase text-neutral-600">
          Hexadecimal
          <input
            className="mt-2 h-12 w-full rounded-[8px] border border-neutral-300 px-3 text-base font-black uppercase text-neutral-950"
            maxLength={7}
            onChange={(event) => setPrimaryColor(event.target.value.toUpperCase())}
            value={primaryColor}
          />
        </label>
        <button
          className="min-h-11 self-end rounded-[8px] bg-[var(--primary)] px-4 text-sm font-black uppercase text-neutral-950 shadow-sm transition active:scale-[0.98] disabled:opacity-60"
          disabled={isPending}
          onClick={saveCms}
          type="button"
        >
          {isPending ? "Salvando" : "Salvar CMS"}
        </button>
      </div>

      <label className="mt-4 block text-xs font-black uppercase text-neutral-600">
        Letreiro promocional
        <textarea
          className="mt-2 min-h-28 w-full rounded-[8px] border border-neutral-300 px-3 py-2 text-sm font-bold text-neutral-950"
          onChange={(event) => setMarqueeText(event.target.value)}
          value={marqueeText}
        />
      </label>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {(Object.keys(uploadLabels) as UploadField[]).map((field) => (
          <div className="rounded-[8px] border border-neutral-200 bg-neutral-50 p-3" key={field}>
            <p className="text-sm font-black uppercase text-neutral-950">{uploadLabels[field].title}</p>
            <p className="mt-1 text-xs font-bold text-neutral-500">{uploadLabels[field].hint}</p>
            <div className="mt-3 grid min-h-24 place-items-center rounded-[6px] border border-dashed border-neutral-300 bg-white p-2 text-center text-xs font-black uppercase text-neutral-400">
              {assets[field] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={uploadLabels[field].title} className="max-h-32 max-w-full object-contain" src={assets[field] || ""} />
              ) : (
                "Sem imagem enviada"
              )}
            </div>
            <input accept="image/*" className="mt-3 w-full text-sm font-bold" ref={fileRefs[field]} type="file" />
            <button
              className="mt-3 min-h-11 w-full rounded-[8px] bg-neutral-950 px-4 text-sm font-black uppercase text-white transition active:scale-[0.98] disabled:opacity-60"
              disabled={uploading === field}
              onClick={() => uploadAsset(field)}
              type="button"
            >
              {uploading === field ? "Enviando" : "Enviar imagem"}
            </button>
          </div>
        ))}
      </div>

      {message ? <p className="mt-3 rounded-[6px] bg-neutral-100 p-3 text-sm font-black text-neutral-700">{message}</p> : null}
    </section>
  );
}
