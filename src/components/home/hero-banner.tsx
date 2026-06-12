import Image from "next/image";
import { getAdminAppearanceConfig } from "@/lib/data/admin-appearance";

export async function HeroBanner() {
  const appearance = await getAdminAppearanceConfig();

  return (
    <section className="relative mx-auto grid h-[570px] max-w-[1440px] place-items-center overflow-hidden border border-neutral-300 bg-neutral-200 px-4 text-center">
      {appearance.heroBannerUrl ? (
        <Image
          alt="Banner principal Caruano"
          className="object-cover"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1440px"
          src={appearance.heroBannerUrl}
        />
      ) : (
        <div className="flex flex-col items-center gap-4 text-neutral-500">
          <div className="grid h-28 w-36 place-items-center rounded-[14px] bg-neutral-400 text-5xl font-black text-white">
            IMG
          </div>
          <div className="max-w-full text-wrap text-sm font-black uppercase leading-tight">
            Imagens dos banners - 1440x570 pixel
            <br />
            Fica como background do card dos produtos por baixo
          </div>
        </div>
      )}
    </section>
  );
}
