type VerifiedBadgeProps = {
  size?: "sm" | "md" | "lg";
  label?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

export function VerifiedBadge({ size = "md", label = false, className = "" }: VerifiedBadgeProps) {
  return (
    <span
      className={`group relative inline-flex animate-[verified-fade-in_180ms_ease-out] items-center gap-1 align-middle text-zinc-900 ${className}`}
      title="Identidade e Documentos verificados pelo Caruano"
    >
      <span className="grid place-items-center rounded-full bg-[#FFC300] p-0.5 text-zinc-900 shadow-sm">
        <svg aria-hidden="true" className={sizeClasses[size]} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M9 12.5 11.2 15 16 9" />
          <path d="m12 2 2.2 2.1 3.1-.4 1 3 2.8 1.4-1.4 2.8 1.4 2.8-2.8 1.4-1 3-3.1-.4L12 22l-2.2-2.1-3.1.4-1-3-2.8-1.4 1.4-2.8-1.4-2.8 2.8-1.4 1-3 3.1.4L12 2Z" />
        </svg>
      </span>
      {label ? <span className="text-xs font-black uppercase text-zinc-900">Verificado</span> : null}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-56 -translate-x-1/2 rounded-[6px] bg-zinc-900 px-3 py-2 text-center text-[11px] font-bold leading-tight text-white shadow-lg group-hover:block">
        Identidade e Documentos verificados pelo Caruano
      </span>
    </span>
  );
}
