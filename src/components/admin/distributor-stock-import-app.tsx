"use client";

import { useMemo, useState } from "react";
import type { DistributorStockInput } from "@/lib/data/distributor-stock";

function toNumber(value: string) {
  const normalized = value.replace(/[R$\s.]/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseLines(text: string, distribuidoraId: string): DistributorStockInput[] {
  const trimmed = text.trim();

  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed) as DistributorStockInput[];
    if (Array.isArray(parsed)) {
      return parsed.map((item) => ({
        distribuidora_id: item.distribuidora_id || distribuidoraId || null,
        codigo_ean: String(item.codigo_ean || "").replace(/\D/g, ""),
        nome_produto: item.nome_produto || null,
        preco_venda_b2b: Number(item.preco_venda_b2b || 0),
        estoque_disponivel: Number(item.estoque_disponivel || 0),
      }));
    }
  } catch {
    // O importador tambem aceita texto solto extraido de PDF.
  }

  return trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\t|;|\|/).map((part) => part.trim());
      const ean = (parts[0] || line.match(/\d{8,14}/)?.[0] || "").replace(/\D/g, "");
      return {
        distribuidora_id: distribuidoraId || null,
        codigo_ean: ean,
        nome_produto: parts[1] || null,
        preco_venda_b2b: parts[2] ? toNumber(parts[2]) : null,
        estoque_disponivel: parts[3] ? Number(parts[3].replace(/\D/g, "")) : 0,
      };
    })
    .filter((item) => item.codigo_ean);
}

export function DistributorStockImportApp() {
  const [distribuidoraId, setDistribuidoraId] = useState("");
  const [rawText, setRawText] = useState("");
  const [items, setItems] = useState<DistributorStockInput[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const previewItems = useMemo(() => items.slice(0, 8), [items]);

  function processWithAiSimulation() {
    const parsed = parseLines(rawText, distribuidoraId.trim());
    setItems(parsed);
    setMessage(parsed.length ? `${parsed.length} itens estruturados para conferencia.` : "Nenhum EAN encontrado no texto colado.");
  }

  async function submitImport() {
    if (!items.length) {
      setMessage("Processe o texto antes de importar.");
      return;
    }

    setLoading(true);
    setMessage("Importando estoque da distribuidora...");

    const response = await fetch("/api/admin/distributor-stock/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    const payload = (await response.json()) as { inserted?: number; updated?: number; error?: string };

    if (!response.ok) {
      setMessage(payload.error || "Nao foi possivel importar.");
      setLoading(false);
      return;
    }

    setMessage(`Importacao concluida: ${payload.inserted || 0} novos, ${payload.updated || 0} atualizados.`);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[8px] bg-neutral-950 p-5 text-white">
        <p className="text-sm font-black uppercase text-[#ffd700]">Admin Master</p>
        <h1 className="mt-1 text-3xl font-black uppercase leading-tight">Importar estoque de distribuidoras</h1>
        <p className="mt-2 text-sm font-bold text-neutral-300">
          Cole o texto extraido de PDFs. Nesta etapa, o botao simula a estruturacao por IA e grava por codigo EAN.
        </p>
      </section>

      <section className="rounded-[8px] bg-white p-4 shadow-sm">
        <label className="block">
          <span className="text-sm font-black uppercase text-neutral-700">ID da distribuidora opcional</span>
          <input
            className="mt-2 min-h-11 w-full rounded-[6px] border border-neutral-300 px-3 text-base font-bold"
            onChange={(event) => setDistribuidoraId(event.target.value)}
            placeholder="UUID da loja distribuidora"
            value={distribuidoraId}
          />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-black uppercase text-neutral-700">Conteudo extraido do PDF</span>
          <textarea
            className="mt-2 min-h-[360px] w-full rounded-[8px] border border-neutral-300 p-3 font-mono text-sm outline-none focus:border-neutral-950"
            onChange={(event) => setRawText(event.target.value)}
            placeholder={"EAN; Produto; Preco B2B; Estoque\n7891234567890; Arroz Tipo 1 5kg; 24,90; 120"}
            value={rawText}
          />
        </label>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button className="min-h-12 rounded-[6px] bg-neutral-950 px-4 text-sm font-black uppercase text-white" onClick={processWithAiSimulation} type="button">
            Processar com IA
          </button>
          <button
            className="min-h-12 rounded-[6px] bg-[#ffd700] px-4 text-sm font-black uppercase text-neutral-950 disabled:opacity-50"
            disabled={loading || !items.length}
            onClick={submitImport}
            type="button"
          >
            {loading ? "Importando..." : "Atualizar estoque"}
          </button>
        </div>

        {message ? <p className="mt-3 rounded-[6px] bg-neutral-100 p-3 text-sm font-black text-neutral-700">{message}</p> : null}
      </section>

      {previewItems.length ? (
        <section className="rounded-[8px] bg-white p-4 shadow-sm">
          <h2 className="text-xl font-black uppercase text-neutral-950">Previa estruturada</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#ffd700] text-neutral-950">
                <tr>
                  <th className="p-3">EAN</th>
                  <th className="p-3">Produto</th>
                  <th className="p-3">Preco B2B</th>
                  <th className="p-3">Estoque</th>
                </tr>
              </thead>
              <tbody>
                {previewItems.map((item) => (
                  <tr className="border-b border-neutral-200" key={`${item.codigo_ean}-${item.nome_produto}`}>
                    <td className="p-3 font-black">{item.codigo_ean}</td>
                    <td className="p-3">{item.nome_produto}</td>
                    <td className="p-3">R$ {Number(item.preco_venda_b2b || 0).toFixed(2)}</td>
                    <td className="p-3">{item.estoque_disponivel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
