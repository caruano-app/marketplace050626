type SectionHeadingProps = {
  title: string;
  note?: string;
  href?: string;
  actionLabel?: string;
};

export function SectionHeading({ title, note, href = "#", actionLabel = "Ver todos v" }: SectionHeadingProps) {
  return (
    <div className="mb-2 flex h-8 items-center gap-4">
      <h2 className="text-lg font-black text-neutral-950">{title}</h2>
      {note ? (
        <p className="hidden flex-1 text-center text-sm font-black uppercase text-neutral-500 md:block">{note}</p>
      ) : (
        <div className="flex-1" />
      )}
      <a className="text-sm font-black text-neutral-950" href={href}>
        {actionLabel}
      </a>
    </div>
  );
}
