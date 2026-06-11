import type { LojistaPerfil } from "@/types/database";
import { VerifiedBadge } from "@/components/common/verified-badge";
import { isIdentityVerified } from "@/lib/data/verification";

type StoreHeaderProps = {
  store: LojistaPerfil;
};

export function StoreHeader({ store }: StoreHeaderProps) {
  const verified = isIdentityVerified(store.usuarios);

  return (
    <section className="grid gap-4 md:grid-cols-[340px_1fr]">
      <div className="grid h-[215px] place-items-center border border-neutral-300 bg-neutral-200 text-center">
        <div>
          <p className="text-2xl font-black uppercase text-neutral-600">Logomarca</p>
          <p className="text-lg font-black uppercase text-neutral-600">da loja | fachada</p>
          <p className="mt-4 text-xs font-black uppercase text-neutral-500">Imagens - 340x215 pixel</p>
        </div>
      </div>
      <div className="border border-neutral-300 bg-neutral-100 p-6">
        <h1 className="flex flex-wrap items-center justify-center gap-2 border-b border-neutral-400 pb-3 text-center text-2xl font-black uppercase text-neutral-950">
          <span>{store.nome_fantasia} | ID</span>
          {verified ? <VerifiedBadge size="lg" label /> : null}
        </h1>
        <div className="mt-5 space-y-2 text-base font-bold text-neutral-700">
          <p>Endereco(s): Polo de Confeccoes do Agreste</p>
          <p>Contato(s): Atendimento via Caruano</p>
          <p>Horarios de Funcionamento: {store.status_funcionamento === "aberto" ? "Aberto" : "Consultar loja"}</p>
          <p>Redes Sociais | Site: @{store.slug}</p>
        </div>
      </div>
    </section>
  );
}
