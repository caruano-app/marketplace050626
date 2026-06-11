"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DemandActionButtonProps = {
  label: string;
  successLabel?: string;
  payload: {
    tipo: string;
    segmento: string;
    cidade: string;
    titulo: string;
    descricao: string;
    urgente?: boolean;
    detalhes?: Record<string, unknown>;
  };
  className?: string;
};

export function DemandActionButton({ label, successLabel = "Solicitacao enviada", payload, className }: DemandActionButtonProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleClick() {
    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/demands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus("error");
      setMessage(data.error || "Nao foi possivel registrar a solicitacao.");
      return;
    }

    setStatus("success");
    setMessage(successLabel);
  }

  return (
    <div>
      <button
        className={className || "grid min-h-11 w-full place-items-center rounded-[8px] bg-[#ffd700] px-4 text-sm font-black uppercase text-neutral-950 transition hover:bg-[#f0c400] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"}
        disabled={status === "loading" || status === "success"}
        onClick={handleClick}
        type="button"
      >
        {status === "loading" ? "Enviando..." : status === "success" ? successLabel : label}
      </button>
      {message ? <p className={`mt-2 text-xs font-bold ${status === "error" ? "text-red-600" : "text-emerald-700"}`}>{message}</p> : null}
    </div>
  );
}
