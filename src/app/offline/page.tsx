export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-[#FFC300] px-4 py-10 text-zinc-900">
      <section className="mx-auto flex max-w-[520px] flex-col justify-center rounded-[16px] bg-white p-6 shadow-xl">
        <p className="text-sm font-black uppercase text-orange-600">Caruano offline</p>
        <h1 className="mt-2 text-3xl font-black uppercase leading-tight">Voce esta sem internet.</h1>
        <p className="mt-4 text-base font-bold text-neutral-700">
          O Caruano carregara os dados assim que voce voltar. Confira sua conexao e tente novamente em instantes.
        </p>
        <a
          className="mt-6 grid min-h-11 place-items-center rounded-[8px] bg-zinc-900 px-4 text-sm font-black uppercase text-[#FFC300] active:scale-95"
          href="/"
        >
          Tentar abrir novamente
        </a>
      </section>
    </main>
  );
}
