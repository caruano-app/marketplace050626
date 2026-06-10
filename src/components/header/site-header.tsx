import { getHeaderCategories } from "@/lib/data/categories";
import { CategoryMenu } from "./category-menu";
import { HeaderActions } from "./header-actions";
import { PromoMarquee } from "./promo-marquee";
import { SearchBar } from "./search-bar";

export async function SiteHeader() {
  const categories = await getHeaderCategories();

  return (
    <header className="w-full overflow-hidden bg-[#f6b900] text-neutral-950">
      <PromoMarquee />
      <div className="mx-auto flex min-h-[96px] max-w-[1440px] flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:gap-8 md:px-8">
        <div className="flex w-full items-center justify-between gap-4 md:w-auto">
          <a className="shrink-0 text-[38px] font-black leading-none tracking-normal text-neutral-950 md:text-[44px]" href="/">
            Caruano
          </a>
        </div>
        <div className="flex w-full flex-1 justify-center">
          <SearchBar />
        </div>
        <div className="hidden md:block">
          <HeaderActions />
        </div>
      </div>
      <div className="mx-auto hidden max-w-[1440px] px-8 pb-1 text-center text-[10px] font-bold uppercase text-neutral-800 lg:block">
        Funcao dos menus: categorias | paginas | produtos | link externo | cidades | lojas | afiliados mercado livre
      </div>
      <CategoryMenu categories={categories} />
    </header>
  );
}
