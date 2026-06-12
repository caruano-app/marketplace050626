import { getFeaturedCategories } from "@/lib/data/categories";
import { SectionHeading } from "./section-heading";

type FeaturedCategoriesProps = {
  title?: string;
};

export async function FeaturedCategories({ title = "Categorias em destaques" }: FeaturedCategoriesProps) {
  const categories = await getFeaturedCategories();

  return (
    <section className="mx-auto mt-3 h-[260px] max-w-[1412px] rounded-[6px] border border-neutral-300 bg-neutral-50 p-2">
      <SectionHeading
        title={title}
        note="Area do card para adicionar os produtos 1412x260 pixel"
        href="/categorias"
      />

      <div className="flex gap-4 overflow-x-auto pb-1">
        {categories.map((category) => (
          <a className="w-[210px] shrink-0 text-center" href={`/categorias/${category.slug_categoria}`} key={category.id}>
            <div className="grid h-[168px] w-[210px] place-items-center rounded-[5px] border border-neutral-300 bg-neutral-200">
              <span className="text-center text-[10px] font-black uppercase leading-tight text-neutral-500">
                Imagem produto / icone
                <br />
                210x168 pixel
              </span>
            </div>
            <span className="mt-2 block truncate text-lg font-black text-neutral-950">{category.nome_categoria}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
