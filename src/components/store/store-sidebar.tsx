import type { CategoriaMestre, LojistaPerfil } from "@/types/database";
import { StoreContactForm } from "@/components/store/store-contact-form";

type StoreSidebarProps = {
  store: LojistaPerfil;
  categories: CategoriaMestre[];
};

export function StoreSidebar({ store, categories }: StoreSidebarProps) {
  return (
    <aside className="space-y-3">
      <section className="bg-[#f6b900] p-5 text-center text-neutral-950">
        <h2 className="text-2xl font-black uppercase leading-tight">Avaliacoes da loja</h2>
        <p className="mt-2 text-2xl font-black">4.8 *****</p>
      </section>

      <section className="bg-[#f6b900] p-4">
        <h2 className="mb-3 text-center text-xl font-black uppercase leading-tight">Categorias do lojista</h2>
        <div className="border border-neutral-950 bg-white">
          <div className="border-b border-neutral-300 px-4 py-2 text-sm font-black uppercase">Categorias v</div>
          {categories.map((category) => (
            <a
              className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 text-sm font-bold uppercase text-neutral-950"
              href={`/categorias/${category.slug_categoria}`}
              key={category.id}
            >
              {category.nome_categoria}
              <span>&gt;</span>
            </a>
          ))}
        </div>
      </section>

      <section className="bg-[#f6b900] p-4">
        <h2 className="mb-4 text-center text-xl font-black uppercase leading-tight">Converse com o lojista</h2>
        <StoreContactForm store={store} />
        <p className="sr-only">Formulario visual para contato com {store.nome_fantasia}</p>
      </section>
    </aside>
  );
}
