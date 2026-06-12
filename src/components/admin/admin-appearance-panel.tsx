"use client";

import { useEffect, useState, useTransition } from "react";

type AdminAppearancePanelProps = {
  initialPrimaryColor: string;
};

function applyPrimaryColor(color: string) {
  document.documentElement.style.setProperty("--primary", color);
}

export function AdminAppearancePanel({ initialPrimaryColor }: AdminAppearancePanelProps) {
  const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    applyPrimaryColor(primaryColor);
  }, [primaryColor]);

  function saveColor() {
    setMessage("Salvando aparencia...");
    startTransition(async () => {
      const response = await fetch("/api/admin/appearance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primaryColor }),
      });
      const payload = (await response.json()) as { error?: string; primaryColor?: string };

      if (!response.ok) {
        setMessage(payload.error || "Nao foi possivel salvar a cor primaria.");
        return;
      }

      if (payload.primaryColor) {
        setPrimaryColor(payload.primaryColor);
        applyPrimaryColor(payload.primaryColor);
      }
      setMessage("Cor primaria atualizada.");
    });
  }

  return (
    <section className="rounded-[8px] bg-white p-4 shadow-sm" id="admin-aparencia">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase text-orange-600">CMS e aparencia</p>
          <h2 className="mt-1 text-xl font-black uppercase text-neutral-950">Cor primaria do Caruano</h2>
          <p className="mt-1 text-sm font-bold text-neutral-600">
            A cor muda a variavel CSS <span className="font-black">--primary</span> em tempo real e salva em configuracoes_home.
          </p>
        </div>
        <span className="h-12 w-12 rounded-full border border-neutral-300" style={{ backgroundColor: primaryColor }} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[160px_1fr_180px]">
        <label className="text-xs font-black uppercase text-neutral-600">
          Seletor
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
          className="min-h-11 self-end rounded-[8px] bg-[var(--primary)] px-4 text-sm font-black uppercase text-neutral-950 shadow-sm disabled:opacity-60"
          disabled={isPending}
          onClick={saveColor}
          type="button"
        >
          {isPending ? "Salvando" : "Salvar cor"}
        </button>
      </div>

      {message ? <p className="mt-3 rounded-[6px] bg-neutral-100 p-3 text-sm font-black text-neutral-700">{message}</p> : null}
    </section>
  );
}
