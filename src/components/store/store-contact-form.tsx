"use client";

import { useState } from "react";
import type { LojistaPerfil } from "@/types/database";
import { makeLeadId, persistLeadEvent, updateLocalLeadEventStatus } from "@/lib/leads/lead-events";

type StoreContactFormProps = {
  store: LojistaPerfil;
};

function formatWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function StoreContactForm({ store }: StoreContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  async function submitContact() {
    if (!name || !whatsapp || !message) {
      setStatus("Preencha nome, WhatsApp e mensagem.");
      return;
    }

    const finalMessage = [
      `Ola, meu nome e ${name}.`,
      `Quero falar com a loja ${store.nome_fantasia}.`,
      customerType ? `Tipo de cliente: ${customerType}` : "",
      email ? `E-mail: ${email}` : "",
      `Mensagem: ${message}`,
    ]
      .filter(Boolean)
      .join("\n");
    const leadId = makeLeadId();
    const saved = await persistLeadEvent({
      id: leadId,
      createdAt: new Date().toISOString(),
      origin: "contato_lojista",
      status: "pending_db",
      customerName: name,
      whatsapp,
      email,
      message: finalMessage,
      lojistaId: store.id,
      storeName: store.nome_fantasia,
    });

    if (!saved) {
      updateLocalLeadEventStatus(leadId, "whatsapp_opened");
    }
    setStatus(saved ? "Lead enviado para o painel e WhatsApp." : "Lead salvo localmente e enviado para WhatsApp.");
    window.open(`https://wa.me/?text=${encodeURIComponent(finalMessage)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <form className="space-y-3">
      <input className="h-10 w-full px-3 text-sm outline-none" onChange={(event) => setName(event.target.value)} placeholder="Seu Nome" type="text" value={name} />
      <input className="h-10 w-full px-3 text-sm outline-none" onChange={(event) => setEmail(event.target.value)} placeholder="E-mail" type="email" value={email} />
      <select className="h-10 w-full px-3 text-sm text-neutral-500 outline-none" onChange={(event) => setCustomerType(event.target.value)} value={customerType}>
        <option value="" disabled>Cliente, Transp., Excursao</option>
        <option>Cliente final</option>
        <option>Transportadora</option>
        <option>Excursao</option>
        <option>Lojista</option>
      </select>
      <input
        className="h-10 w-full px-3 text-sm outline-none"
        onChange={(event) => setWhatsapp(formatWhatsapp(event.target.value))}
        placeholder="(81) 99999-9999"
        type="tel"
        value={whatsapp}
      />
      <textarea className="h-32 w-full resize-none px-3 py-3 text-sm outline-none" onChange={(event) => setMessage(event.target.value)} placeholder="Digite sua mensagem" value={message} />
      <button className="h-10 w-full bg-neutral-950 text-sm font-black text-white" onClick={submitContact} type="button">
        Enviar mensagem
      </button>
      {status ? <p className="text-xs font-bold text-neutral-950">{status}</p> : null}
    </form>
  );
}
