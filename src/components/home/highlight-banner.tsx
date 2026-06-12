import Image from "next/image";
import { getAdminAppearanceConfig } from "@/lib/data/admin-appearance";
import { SectionHeading } from "./section-heading";

type HighlightBannerProps = {
  title?: string;
};

export async function HighlightBanner({ title = "Banner destaque" }: HighlightBannerProps) {
  const appearance = await getAdminAppearanceConfig();

  return (
    <section className="mx-auto mt-3 h-[260px] max-w-[1412px] rounded-[6px] border border-neutral-300 bg-white p-2">
      <SectionHeading title={title} note="Area do banner para adicionar imagens | videos 1412x260 pixel" href="/ofertas" />
      <div className="relative grid h-[210px] place-items-center overflow-hidden rounded-[4px] border border-neutral-300 bg-neutral-200">
        {appearance.highlightBannerUrl ? (
          <Image
            alt="Banner destaque Caruano"
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, 1412px"
            src={appearance.highlightBannerUrl}
          />
        ) : (
          <span className="text-3xl font-black uppercase text-neutral-400">Imagem | Videos 1412x260 pixel</span>
        )}
      </div>
    </section>
  );
}
