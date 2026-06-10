"use client";

import { useState } from "react";
import { GlobalSearchOverlay } from "@/components/search/global-search-overlay";
import { VoiceSearchButton } from "@/components/search/voice-search-button";

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [voiceText, setVoiceText] = useState("");

  return (
    <>
      <form
        className="flex h-12 w-full max-w-full overflow-hidden rounded-[6px] border border-white/70 bg-white shadow-sm md:h-14 md:max-w-[640px]"
        onSubmit={(event) => {
          event.preventDefault();
          setOpen(true);
        }}
      >
        <label className="sr-only" htmlFor="caruano-search">
          Buscar no Caruano
        </label>
        <input
          id="caruano-search"
          name="q"
          className="min-w-0 flex-1 px-3 text-center text-[10px] font-black uppercase leading-tight text-neutral-900 outline-none placeholder:text-neutral-800 md:px-5 md:text-[11px]"
          onFocus={() => setOpen(true)}
          placeholder="Buscar | produtos, categorias, lojas, servicos, codigo, sku"
          value={voiceText}
          readOnly
          type="search"
        />
        <VoiceSearchButton
          onResult={(value) => {
            setVoiceText(value);
            setOpen(true);
          }}
        />
        <button className="m-2 w-16 shrink-0 rounded-[2px] bg-neutral-950 text-[9px] font-bold uppercase text-white md:w-28 md:text-[10px]" type="submit">
          Buscar
        </button>
      </form>
      <GlobalSearchOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}
