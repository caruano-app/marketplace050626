import { SectionHeading } from "./section-heading";

export function HighlightBanner() {
  return (
    <section className="mx-auto mt-3 h-[260px] max-w-[1412px] rounded-[6px] border border-neutral-300 bg-white p-2">
      <SectionHeading title="Banner destaque" note="Area do banner para adicionar imagens | videos 1412x260 pixel" href="/ofertas" />
      <div className="grid h-[210px] place-items-center rounded-[4px] border border-neutral-300 bg-neutral-200">
        <span className="text-3xl font-black uppercase text-neutral-400">Imagem | Videos 1412x260 pixel</span>
      </div>
    </section>
  );
}
