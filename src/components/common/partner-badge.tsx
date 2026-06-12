type PartnerBadgeProps = {
  size?: "sm" | "md" | "lg";
  level?: string | null;
  label?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

const levelLabels: Record<string, string> = {
  standard: "Parceiro Oficial",
  silver: "Parceiro Silver",
  gold: "Parceiro Gold",
};

export function PartnerBadge({ size = "md", level = "standard", label = false, className = "" }: PartnerBadgeProps) {
  const labelText = levelLabels[level || "standard"] || "Parceiro Oficial";

  return (
    <span
      className={`group relative inline-flex animate-[verified-fade-in_180ms_ease-out] items-center gap-1 align-middle text-zinc-950 ${className}`}
      title={`${labelText} Caruano`}
    >
      <span className="grid place-items-center rounded-full bg-[#f6b900] p-0.5 text-zinc-950 shadow-sm ring-1 ring-zinc-950/10">
        <svg
          aria-hidden="true"
          className={sizeClasses[size]}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.4"
          viewBox="0 0 24 24"
        >
          <path d="M12 3 14.6 8.3 20.5 9.2 16.2 13.4 17.2 19.3 12 16.5 6.8 19.3 7.8 13.4 3.5 9.2 9.4 8.3 12 3Z" />
          <path d="m9.4 12.2 1.8 1.8 3.7-4" />
        </svg>
      </span>
      {label ? <span className="text-[11px] font-black uppercase text-zinc-950">{labelText}</span> : null}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-44 -translate-x-1/2 rounded-[6px] bg-zinc-900 px-3 py-2 text-center text-[11px] font-bold leading-tight text-white shadow-lg group-hover:block">
        {labelText} Caruano
      </span>
    </span>
  );
}
