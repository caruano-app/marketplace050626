export function StoreTabs() {
  const tabs = ["Quem somos", "FAQ", "Troca", "Termos de uso"];

  return (
    <div className="my-4 flex flex-wrap items-center gap-2">
      {tabs.map((tab) => (
        <button className="h-9 border border-neutral-400 bg-white px-4 text-xs font-black uppercase text-neutral-950" key={tab} type="button">
          {tab} v
        </button>
      ))}
      <form className="ml-auto flex h-9 w-full max-w-[310px] border border-neutral-300 bg-white md:w-[310px]">
        <input className="min-w-0 flex-1 px-3 text-sm outline-none" placeholder="Digite o nome do produto" />
        <button className="w-14 bg-[#f6b900] text-xl font-black" type="button">&gt;</button>
      </form>
      <select className="h-9 w-full max-w-[250px] border border-neutral-300 px-3 text-sm text-neutral-500 outline-none md:w-[250px]" defaultValue="">
        <option value="" disabled>Ordenar por:</option>
        <option>Mais recentes</option>
        <option>Menor preco</option>
      </select>
    </div>
  );
}
