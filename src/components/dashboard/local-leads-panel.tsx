"use client";

import { useEffect, useMemo, useState } from "react";
import { getLocalLeadEvents, type LeadEvent } from "@/lib/leads/lead-events";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function LocalLeadsPanel() {
  const [leads, setLeads] = useState<LeadEvent[]>([]);

  useEffect(() => {
    setLeads(getLocalLeadEvents());
  }, []);

  const totals = useMemo(() => {
    const checkoutLeads = leads.filter((lead) => lead.origin === "checkout");
    const contactLeads = leads.filter((lead) => lead.origin === "contato_lojista");
    const value = checkoutLeads.reduce((sum, lead) => sum + (lead.total || 0), 0);

    return {
      checkout: checkoutLeads.length,
      contacts: contactLeads.length,
      value,
    };
  }, [leads]);

  return (
    <section className="rounded-[8px] border border-neutral-300 bg-white p-5">
      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-[6px] bg-neutral-100 p-4">
          <p className="text-sm font-black uppercase text-neutral-500">Leads checkout</p>
          <p className="text-3xl font-black text-neutral-950">{totals.checkout}</p>
        </div>
        <div className="rounded-[6px] bg-neutral-100 p-4">
          <p className="text-sm font-black uppercase text-neutral-500">Contatos lojistas</p>
          <p className="text-3xl font-black text-neutral-950">{totals.contacts}</p>
        </div>
        <div className="rounded-[6px] bg-neutral-100 p-4">
          <p className="text-sm font-black uppercase text-neutral-500">Valor capturado</p>
          <p className="text-3xl font-black text-neutral-950">{formatPrice(totals.value)}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-300 bg-[#f6b900] text-neutral-950">
              <th className="p-3">Origem</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">WhatsApp</th>
              <th className="p-3">Loja</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr className="border-b border-neutral-200" key={lead.id}>
                <td className="p-3 font-bold">{lead.origin}</td>
                <td className="p-3">{lead.customerName}</td>
                <td className="p-3">{lead.whatsapp}</td>
                <td className="p-3">{lead.storeName || "Marketplace"}</td>
                <td className="p-3">{formatPrice(lead.total || 0)}</td>
                <td className="p-3">{lead.status}</td>
              </tr>
            ))}
            {!leads.length ? (
              <tr>
                <td className="p-8 text-center font-black uppercase text-neutral-500" colSpan={6}>
                  Nenhum lead local capturado neste navegador.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
