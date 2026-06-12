"use client";

import { useState, useTransition } from "react";
import type { FooterConfig, FooterLink } from "@/lib/data/admin-appearance";

type AdminContentPanelProps = {
  initialFooter: FooterConfig;
};

type FooterColumn = "institucional" | "ajuda" | "linksUteis";

const columnLabels: Record<FooterColumn, string> = {
  institucional: "Institucional",
  ajuda: "Ajuda",
  linksUteis: "Links Uteis",
};

function emptyLink(): FooterLink {
  return { label: "", href: "/" };
}

export function AdminContentPanel({ initialFooter }: AdminContentPanelProps) {
  const [footer, setFooter] = useState<FooterConfig>(initialFooter);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function updateColumnLink(column: FooterColumn, index: number, patch: Partial<FooterLink>) {
    setFooter((current) => ({
      ...current,
      [column]: current[column].map((link, currentIndex) => (currentIndex === index ? { ...link, ...patch } : link)),
    }));
  }

  function addColumnLink(column: FooterColumn) {
    setFooter((current) => ({
      ...current,
      [column]: [...current[column], emptyLink()],
    }));
  }

  function removeColumnLink(column: FooterColumn, index: number) {
    setFooter((current) => ({
      ...current,
      [column]: current[column].filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  function saveFooter() {
    setMessage("Salvando conteudo do rodape...");
    startTransition(async () => {
      const response = await fetch("/api/admin/appearance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ footer }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage(payload.error || "Nao foi possivel salvar o rodape.");
        return;
      }

      setMessage("Rodape atualizado. A proxima leitura da Home ja usa estes links.");
    });
  }

  return (
    <section className="rounded-[8px] bg-white p-4 shadow-sm scroll-mt-4" id="conteudo">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase text-orange-600">Conteudo</p>
          <h2 className="mt-1 text-xl font-black uppercase text-neutral-950">Rodape institucional</h2>
          <p className="mt-1 text-sm font-bold text-neutral-600">Edite os textos e links em campos visuais, sem usar formato tecnico.</p>
        </div>
        <button
          className="min-h-11 rounded-[8px] bg-[var(--primary)] px-5 text-sm font-black uppercase text-neutral-950 transition active:scale-[0.98] disabled:opacity-60"
          disabled={isPending}
          onClick={saveFooter}
          type="button"
        >
          {isPending ? "Salvando" : "Salvar rodape"}
        </button>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {(Object.keys(columnLabels) as FooterColumn[]).map((column) => (
          <div className="rounded-[8px] border border-neutral-200 bg-neutral-50 p-3" key={column}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-black uppercase text-neutral-950">{columnLabels[column]}</h3>
              <button
                className="min-h-11 rounded-[8px] bg-neutral-950 px-3 text-xs font-black uppercase text-white"
                onClick={() => addColumnLink(column)}
                type="button"
              >
                Adicionar
              </button>
            </div>
            <div className="mt-3 grid gap-2">
              {footer[column].map((link, index) => (
                <div className="rounded-[8px] border border-neutral-200 bg-white p-2" key={`${column}-${index}`}>
                  <label className="text-[11px] font-black uppercase text-neutral-500">
                    Texto
                    <input
                      className="mt-1 h-11 w-full rounded-[8px] border border-neutral-300 px-3 text-sm font-bold text-neutral-950"
                      onChange={(event) => updateColumnLink(column, index, { label: event.target.value })}
                      value={link.label}
                    />
                  </label>
                  <label className="mt-2 block text-[11px] font-black uppercase text-neutral-500">
                    Link
                    <input
                      className="mt-1 h-11 w-full rounded-[8px] border border-neutral-300 px-3 text-sm font-bold text-neutral-950"
                      onChange={(event) => updateColumnLink(column, index, { href: event.target.value })}
                      value={link.href}
                    />
                  </label>
                  <button
                    className="mt-2 min-h-11 rounded-[8px] border border-red-300 px-3 text-xs font-black uppercase text-red-700"
                    onClick={() => removeColumnLink(column, index)}
                    type="button"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <label className="mt-4 block text-xs font-black uppercase text-neutral-600">
        Copyright
        <input
          className="mt-2 h-12 w-full rounded-[8px] border border-neutral-300 px-3 text-sm font-bold text-neutral-950"
          onChange={(event) => setFooter((current) => ({ ...current, copyright: event.target.value }))}
          value={footer.copyright}
        />
      </label>

      <div className="mt-4 rounded-[8px] border border-dashed border-neutral-300 bg-neutral-50 p-3">
        <p className="text-xs font-black uppercase text-neutral-500">Preview rapido</p>
        <div className="mt-2 grid gap-3 text-sm font-bold text-neutral-700 md:grid-cols-3">
          {(Object.keys(columnLabels) as FooterColumn[]).map((column) => (
            <div key={`preview-${column}`}>
              <p className="font-black text-neutral-950">{columnLabels[column]}</p>
              {footer[column].map((link, index) => (
                <p className="mt-1" key={`${column}-preview-${index}`}>{link.label || "Link sem texto"}</p>
              ))}
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs font-bold text-neutral-500">{footer.copyright}</p>
      </div>

      {message ? <p className="mt-3 rounded-[6px] bg-neutral-100 p-3 text-sm font-black text-neutral-700">{message}</p> : null}
    </section>
  );
}
