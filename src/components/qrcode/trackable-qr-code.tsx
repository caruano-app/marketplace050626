"use client";

import { useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

type TrackableQrCodeProps = {
  title: string;
  url: string;
  affiliateCode?: string;
  fileName: string;
};

const logoDataUrl =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' rx='18' fill='%23ffd700'/%3E%3Ctext x='48' y='58' text-anchor='middle' font-family='Arial' font-size='42' font-weight='900' fill='%23171717'%3EC%3C/text%3E%3C/svg%3E";

export function TrackableQrCode({ title, url, affiliateCode, fileName }: TrackableQrCodeProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [refCode, setRefCode] = useState(affiliateCode || "");
  const finalUrl = useMemo(() => {
    if (!refCode) {
      return url;
    }

    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}ref=${encodeURIComponent(refCode)}`;
  }, [refCode, url]);

  function downloadPng() {
    const canvas = wrapperRef.current?.querySelector("canvas");
    if (!canvas) {
      return;
    }

    const link = document.createElement("a");
    link.download = `${fileName}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function printPdf() {
    const canvas = wrapperRef.current?.querySelector("canvas");
    if (!canvas) {
      return;
    }

    const image = canvas.toDataURL("image/png");
    const popup = window.open("", "_blank", "noopener,noreferrer");
    if (!popup) {
      return;
    }

    popup.document.write(`
      <html>
        <head><title>${fileName}</title></head>
        <body style="font-family:Arial;text-align:center;padding:24px">
          <h1 style="font-size:28px;margin:0 0 12px">${title}</h1>
          <img src="${image}" style="width:320px;height:320px" />
          <p style="font-size:14px;font-weight:700;word-break:break-all">${finalUrl}</p>
          <script>window.print()</script>
        </body>
      </html>
    `);
    popup.document.close();
  }

  return (
    <section className="rounded-[8px] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black uppercase text-neutral-950">{title}</h2>
          <p className="mt-1 break-all text-xs font-bold text-neutral-500">{finalUrl}</p>
        </div>
      </div>

      <div className="mt-4 grid place-items-center" ref={wrapperRef}>
        <div className="rounded-[12px] border border-neutral-200 bg-white p-3">
          <QRCodeCanvas
            bgColor="#ffffff"
            fgColor="#171717"
            imageSettings={{
              src: logoDataUrl,
              height: 42,
              width: 42,
              excavate: true,
            }}
            level="H"
            size={220}
            value={finalUrl}
          />
        </div>
      </div>

      <label className="mt-4 block text-xs font-black uppercase text-neutral-700">
        Codigo de afiliado
        <input
          className="mt-2 h-11 w-full rounded-[6px] border border-neutral-300 px-3 text-sm font-bold outline-none"
          onChange={(event) => setRefCode(event.target.value.trim())}
          placeholder="Opcional: codigo_afiliado"
          value={refCode}
        />
      </label>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button className="min-h-11 rounded-[6px] bg-[#ffd700] px-4 text-sm font-black uppercase text-neutral-950" onClick={downloadPng} type="button">
          Baixar PNG
        </button>
        <button className="min-h-11 rounded-[6px] bg-neutral-950 px-4 text-sm font-black uppercase text-white" onClick={printPdf} type="button">
          PDF/Imprimir
        </button>
      </div>
    </section>
  );
}
