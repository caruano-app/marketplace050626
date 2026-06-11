import type { CategoriaMestre } from "@/types/database";

type CategoryMenuProps = {
  categories: CategoriaMestre[];
};

export function CategoryMenu({ categories }: CategoryMenuProps) {
  return (
    <nav className="border-t border-black/10 bg-[#f6b900]" aria-label="Categorias principais">
      <div className="mx-auto flex h-[58px] max-w-[1440px] items-center gap-8 px-8">
        <button className="flex shrink-0 items-center gap-3 text-xl font-black uppercase text-neutral-950">
          <span className="flex h-5 w-8 flex-col justify-between" aria-hidden="true">
            <span className="h-[3px] bg-neutral-950" />
            <span className="h-[3px] bg-neutral-950" />
            <span className="h-[3px] bg-neutral-950" />
          </span>
          Categorias
          <span className="text-2xl leading-none">v</span>
        </button>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-6 lg:flex">
          {categories.map((category) => (
            <a
              className="whitespace-nowrap text-lg font-black uppercase text-neutral-950"
              href={`/categorias/${category.slug_categoria}`}
              key={category.id}
            >
              {category.nome_categoria}
              <span className="ml-1 text-xl">v</span>
            </a>
          ))}
          <a className="whitespace-nowrap text-lg font-black uppercase text-neutral-950" href="/insumos">
            Insumos
            <span className="ml-1 text-xl">v</span>
          </a>
          <a className="whitespace-nowrap text-lg font-black uppercase text-neutral-950" href="/clube">
            Clube
            <span className="ml-1 text-xl">v</span>
          </a>
        </div>

        <a
          className="ml-auto hidden h-12 min-w-[220px] items-center justify-center gap-3 bg-neutral-950 px-8 text-sm font-black uppercase text-white md:flex"
          href="/dashboard/lojista"
        >
          <span className="text-xl" aria-hidden="true">
            []
          </span>
          Criar loja
        </a>
      </div>
    </nav>
  );
}
