"use client";

import { useMemo, useState, useTransition } from "react";
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

function linksToText(links: FooterLink[]) {
  return links.map((link) => `${link.label}|${link.href}`).join("\n");
}

function textToLinks(value: string): FooterLink[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href] = line.split("|").map((part) => part?.trim());
      return {
        label: label || "Link",
        href: href || "#",
      };
    });
}

export function AdminContentPanel({ initialFooter }: AdminContentPanelProps) {
  const [columns, setColumns] = useState<Record<FooterColumn, string>>({
    institucional: linksToText(initialFooter.institucional),
    ajuda: linksToText(initialFooter.ajuda),
    linksUteis: linksToText(initialFooter.linksUteis),
  });
  const [copyright, setCopyright] = useState(initialFooter.copyright);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const footer = useMemo<FooterConfig>(() => ({
    institucional: textToLinks(columns.institucional),
    ajuda: textToLinks(columns.ajuda),
    linksUteis: textToLinks(columns.linksUteis),
    copyright,
  }), [columns, copyright]);

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
    <section className="rounded-[8px] bg-white p-4 shadow-sm" id="conteudo">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase text-orange-600">Conteudo</p>
          <h2 className="mt-1 text-xl font-black uppercase text-neutral-950">Rodape institucional</h2>
          <p className="mt-1 text-sm font-bold text-neutral-600">Use uma linha por link no formato Nome|/url.</p>
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
          <label className="text-xs font-black uppercase text-neutral-600" key={column}>
            {columnLabels[column]}
            <textarea
              className="mt-2 min-h-44 w-full rounded-[8px] border border-neutral-300 px-3 py-2 text-sm font-bold normal-case text-neutral-950"
              onChange={(event) => setColumns((current) => ({ ...current, [column]: event.target.value }))}
              value={columns[column]}
            />
          </label>
        ))}
      </div>

      <label className="mt-4 block text-xs font-black uppercase text-neutral-600">
        Copyright
        <input
          className="mt-2 h-12 w-full rounded-[8px] border border-neutral-300 px-3 text-sm font-bold text-neutral-950"
          onChange={(event) => setCopyright(event.target.value)}
          value={copyright}
        />
      </label>

      {message ? <p className="mt-3 rounded-[6px] bg-neutral-100 p-3 text-sm font-black text-neutral-700">{message}</p> : null}
    </section>
  );
}
