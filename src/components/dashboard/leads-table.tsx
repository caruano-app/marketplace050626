import type { AtendimentoLead } from "@/lib/data/leads";

type LeadsTableProps = {
  leads: AtendimentoLead[];
};

function whatsappHref(value: string) {
  const digits = value.replace(/\D/g, "");
  return `https://wa.me/55${digits}`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function LeadsTable({ leads }: LeadsTableProps) {
  return (
    <section className="rounded-[8px] border border-neutral-300 bg-white p-5">
      <div className="mb-5 grid gap-3 md:grid-cols-4">
        <div className="rounded-[6px] bg-neutral-100 p-4">
          <p className="text-sm font-black uppercase text-neutral-500">Total leads</p>
          <p className="text-3xl font-black text-neutral-950">{leads.length}</p>
        </div>
        <div className="rounded-[6px] bg-neutral-100 p-4">
          <p className="text-sm font-black uppercase text-neutral-500">Novos</p>
          <p className="text-3xl font-black text-neutral-950">{leads.filter((lead) => (lead.status || "novo") === "novo").length}</p>
        </div>
        <div className="rounded-[6px] bg-neutral-100 p-4">
          <p className="text-sm font-black uppercase text-neutral-500">Checkout</p>
          <p className="text-3xl font-black text-neutral-950">{leads.filter((lead) => lead.origem === "checkout").length}</p>
        </div>
        <div className="rounded-[6px] bg-neutral-100 p-4">
          <p className="text-sm font-black uppercase text-neutral-500">PDP direto</p>
          <p className="text-3xl font-black text-neutral-950">{leads.filter((lead) => lead.origem === "pdp_direto").length}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-300 bg-[#f6b900] text-neutral-950">
              <th className="p-3">Nome</th>
              <th className="p-3">WhatsApp</th>
              <th className="p-3">Origem</th>
              <th className="p-3">Status</th>
              <th className="p-3">Loja</th>
              <th className="p-3">Criado em</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr className="border-b border-neutral-200" key={lead.id}>
                <td className="p-3 font-black text-neutral-950">{lead.nome}</td>
                <td className="p-3">
                  <a className="font-black text-[#00a86b]" href={whatsappHref(lead.whatsapp)} rel="noreferrer" target="_blank">
                    {lead.whatsapp}
                  </a>
                </td>
                <td className="p-3">{lead.origem || "-"}</td>
                <td className="p-3">
                  <span className="rounded-[4px] bg-neutral-100 px-2 py-1 text-xs font-black uppercase">{lead.status || "novo"}</span>
                </td>
                <td className="p-3">{lead.lojistas?.nome_fantasia || "Marketplace"}</td>
                <td className="p-3">{formatDate(lead.criado_em)}</td>
              </tr>
            ))}
            {!leads.length ? (
              <tr>
                <td className="p-8 text-center font-black uppercase text-neutral-500" colSpan={6}>
                  Nenhum lead encontrado em leads_atendimento.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
