"use client";

type VoiceSearchButtonProps = {
  onResult: (value: string) => void;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  start: () => void;
  onresult: ((event: { results: { 0: { transcript: string } }[] }) => void) | null;
};

export function VoiceSearchButton({ onResult }: VoiceSearchButtonProps) {
  function startVoiceSearch() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onResult("Busca por voz indisponivel neste navegador.");
      return;
    }

    const recognition = new SpeechRecognition() as SpeechRecognitionLike;
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      onResult(event.results[0][0].transcript);
    };
    recognition.start();
  }

  return (
    <button aria-label="Buscar por voz" className="m-2 grid h-10 w-10 shrink-0 place-items-center rounded-[4px] bg-[#ffd700] text-lg font-black text-neutral-950" onClick={startVoiceSearch} type="button">
      M
    </button>
  );
}
