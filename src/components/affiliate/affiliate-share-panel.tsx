"use client";

import { useState } from "react";

type AffiliateSharePanelProps = {
  shareUrl: string;
};

export function AffiliateSharePanel({ shareUrl }: AffiliateSharePanelProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="rounded-[12px] border border-neutral-300 bg-white p-4 shadow-sm">
      <p className="text-sm font-black uppercase text-neutral-500">Link de divulgacao</p>
      <div className="mt-3 rounded-[8px] border border-neutral-300 bg-neutral-50 p-3 text-sm font-bold text-neutral-800">
        {shareUrl}
      </div>
      <button
        className="mt-3 h-12 w-full rounded-[8px] bg-neutral-950 px-4 text-sm font-black uppercase text-white active:scale-95"
        onClick={copyLink}
        type="button"
      >
        {copied ? "Link copiado" : "Copiar link"}
      </button>
    </section>
  );
}
