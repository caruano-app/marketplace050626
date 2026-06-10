"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!installEvent || dismissed) {
    return null;
  }

  async function install() {
    if (!installEvent) {
      return;
    }

    await installEvent.prompt();
    await installEvent.userChoice;
    setDismissed(true);
    setInstallEvent(null);
  }

  return (
    <div className="fixed bottom-20 left-3 right-3 z-40 rounded-[10px] border border-neutral-200 bg-white p-3 shadow-xl md:left-auto md:right-6 md:max-w-sm">
      <p className="text-sm font-black uppercase text-neutral-950">Instalar Caruano</p>
      <p className="mt-1 text-xs font-bold text-neutral-600">Adicione o app na tela inicial para acesso rapido.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button className="min-h-11 rounded-[6px] bg-[#ffd700] px-4 text-sm font-black uppercase text-neutral-950" onClick={install} type="button">
          Instalar
        </button>
        <button className="min-h-11 rounded-[6px] bg-neutral-950 px-4 text-sm font-black uppercase text-white" onClick={() => setDismissed(true)} type="button">
          Agora nao
        </button>
      </div>
    </div>
  );
}
