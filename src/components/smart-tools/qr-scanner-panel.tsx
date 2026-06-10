"use client";

import { useRef, useState } from "react";

export function QrScannerPanel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState("Toque para ativar a camera.");
  const [result, setResult] = useState("");

  async function startScanner() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      const video = videoRef.current;
      if (!video) {
        return;
      }

      video.srcObject = stream;
      await video.play();
      setStatus("Camera ativa. Posicione o QR Code do fardo.");

      if ("BarcodeDetector" in window && window.BarcodeDetector) {
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        const scan = async () => {
          const codes = await detector.detect(video);
          if (codes[0]) {
            setResult(codes[0].rawValue);
            setStatus("QR Code lido. Entrega pronta para marcar no onibus.");
            stream.getTracks().forEach((track) => track.stop());
            return;
          }
          window.requestAnimationFrame(scan);
        };
        scan();
      } else {
        setResult("SIMULADO-FARDO-EXCURSAO");
        setStatus("Scanner nativo indisponivel. Resultado simulado para fluxo logistico.");
      }
    } catch {
      setStatus("Permissao de camera negada ou indisponivel.");
    }
  }

  return (
    <section className="rounded-[8px] bg-white p-4 shadow-sm">
      <h2 className="text-xl font-black uppercase text-neutral-950">Scanner QR logistico</h2>
      <p className="mt-1 text-sm font-bold text-neutral-500">{status}</p>
      <video className="mt-3 aspect-video w-full rounded-[8px] bg-neutral-200 object-cover" muted playsInline ref={videoRef} />
      {result ? <p className="mt-3 rounded-[6px] bg-[#fff8d6] p-3 text-sm font-black text-neutral-950">{result}</p> : null}
      <button className="mt-3 min-h-11 w-full rounded-[6px] bg-[#ffd700] px-4 text-sm font-black uppercase text-neutral-950" onClick={startScanner} type="button">
        Ativar camera
      </button>
    </section>
  );
}
