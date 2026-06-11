"use client";

type ExportCsvButtonProps = {
  fileName: string;
  rows: Array<Record<string, string | number | null | undefined>>;
  className?: string;
};

function escapeCsv(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function ExportCsvButton({
  fileName,
  rows,
  className = "min-h-11 rounded-[6px] bg-[#ffd700] px-4 text-sm font-black uppercase text-neutral-950",
}: ExportCsvButtonProps) {
  function exportCsv() {
    if (!rows.length) return;

    const headers = Object.keys(rows[0]);
    const csv = [headers.map(escapeCsv).join(","), ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName.endsWith(".csv") ? fileName : `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button className={className} disabled={!rows.length} onClick={exportCsv} type="button">
      Exportar relatorio
    </button>
  );
}
