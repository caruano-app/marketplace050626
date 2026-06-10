"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useAffiliateStore } from "@/lib/affiliate/affiliate-store";
import { useCartStore } from "@/lib/cart/cart-store";
import { makeLeadId, persistLeadEvent, updateLocalLeadEventStatus } from "@/lib/leads/lead-events";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function isLikelyUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function CheckoutClient() {
  const { items, increment, decrement, removeItem, clearCart } = useCartStore();
  const affiliate = useAffiliateStore((state) => state.affiliate);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [lgpd, setLgpd] = useState(false);
  const [status, setStatus] = useState("");
  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const hasMockStore = items.some((item) => !isLikelyUuid(item.lojistaId));
  const validAffiliate =
    affiliate && isLikelyUuid(affiliate.afiliadoId) && isLikelyUuid(affiliate.usuarioId) ? affiliate : null;
  const groupedByStore = useMemo(() => {
    return items.reduce<Record<string, typeof items>>((groups, item) => {
      groups[item.lojistaId] = groups[item.lojistaId] || [];
      groups[item.lojistaId].push(item);
      return groups;
    }, {});
  }, [items]);

  const whatsappTarget = (process.env.NEXT_PUBLIC_MARKETPLACE_WHATSAPP || "").replace(/\D/g, "");

  async function tryCreateOrder() {
    const supabase = createSupabaseBrowserClient();
    const compradorId = process.env.NEXT_PUBLIC_CHECKOUT_COMPRADOR_ID;

    if (!supabase || !compradorId || !items.length || hasMockStore) {
      return;
    }

    const { data: transaction, error: transactionError } = await supabase
      .from("transacoes_mestre")
      .insert({
        comprador_id: compradorId,
        valor_total_checkout: total,
        status_transacao: "pendente",
        forma_pagamento: "atendimento_whatsapp",
        vendido_por_id: validAffiliate?.usuarioId || null,
        origem_afiliado_id: validAffiliate?.afiliadoId || null,
      })
      .select("id")
      .single();

    if (transactionError || !transaction) {
      throw transactionError;
    }

    if (validAffiliate) {
      const paymentDate = new Date();
      paymentDate.setDate(paymentDate.getDate() + 30);

      const { error: commissionError } = await supabase.from("comissoes_afiliados").insert({
        transacao_id: transaction.id,
        afiliado_id: validAffiliate.afiliadoId,
        valor_comissao: Number((total * (validAffiliate.commissionPercent / 100)).toFixed(2)),
        status_pagamento: "pendente_liberacao",
        data_prevista_pagamento: paymentDate.toISOString().slice(0, 10),
      });

      if (commissionError) {
        throw commissionError;
      }
    }

    for (const [lojistaId, storeItems] of Object.entries(groupedByStore)) {
      const storeTotal = storeItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      const { data: subOrder, error: subOrderError } = await supabase
        .from("sub_pedidos_loja")
        .insert({
          transacao_mestre_id: transaction.id,
          lojista_id: lojistaId,
          valor_produtos_loja: storeTotal,
          valor_frete_loja: 0,
          status_preparacao: "pendente_separacao",
        })
        .select("id")
        .single();

      if (subOrderError || !subOrder) {
        throw subOrderError;
      }

      const orderItems = storeItems.map((item) => ({
        sub_pedido_id: subOrder.id,
        produto_id: item.productId,
        variacao_id: item.variationId || null,
        quantidade: item.quantity,
        preco_unitario_aplicado: item.unitPrice,
      }));

      const { error: itemsError } = await supabase.from("itens_pedido").insert(orderItems);

      if (itemsError) {
        throw itemsError;
      }
    }
  }

  async function finalizeOrder() {
    if (!items.length) {
      setStatus("Adicione itens ao carrinho antes de finalizar.");
      return;
    }

    if (!name || !whatsapp || !email || captcha.trim() !== "8" || !lgpd) {
      setStatus("Preencha os dados, aceite a LGPD e responda o captcha corretamente.");
      return;
    }

    const itemLines = items
      .map((item) => {
        const variation = [item.size, item.color, item.extras].filter(Boolean).join(", ");
        return `- ${item.quantity}x ${item.name} (${variation || "sem variacao"}) - ${formatPrice(item.unitPrice * item.quantity)}`;
      })
      .join("\n");

    const message = `Ola, meu nome e ${name}, gostaria de finalizar o pedido:\nItens:\n${itemLines}\nTotal: ${formatPrice(total)}`;
    const leadId = makeLeadId();
    const leadSaved = await persistLeadEvent({
      id: leadId,
      createdAt: new Date().toISOString(),
      origin: "checkout",
      status: "pending_db",
      customerName: name,
      whatsapp,
      email,
      message,
      total,
      items: items.map((item) => ({
        productId: item.productId,
        lojistaId: item.lojistaId,
        storeName: item.storeName,
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        size: item.size,
        color: item.color,
        extras: item.extras,
      })),
      affiliate: validAffiliate
        ? {
            afiliadoId: validAffiliate.afiliadoId,
            usuarioId: validAffiliate.usuarioId,
            codigoAfiliado: validAffiliate.codigoAfiliado,
            nomeAfiliado: validAffiliate.nomeAfiliado,
            commissionPercent: validAffiliate.commissionPercent,
          }
        : null,
    });

    try {
      await tryCreateOrder();
    } catch {
      setStatus(
        leadSaved
          ? "Lead salvo. Pedido sera enviado pelo WhatsApp; a transacao depende de login/permissoes RLS."
          : "Lead salvo localmente. Configure NEXT_PUBLIC_LEADS_TABLE/RLS para aparecer no dashboard multiusuario.",
      );
    }

    if (!leadSaved) {
      updateLocalLeadEventStatus(leadId, "whatsapp_opened");
    }
    const whatsappUrl = whatsappTarget
      ? `https://wa.me/${whatsappTarget}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-lg font-black uppercase text-[#f58220]">Carrinho</p>
        <h1 className="text-5xl font-black text-neutral-950">Finalizar pedido</h1>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xl text-neutral-500">Revise os itens, preencha seus dados e envie a solicitacao pelo WhatsApp</p>
          <a className="text-lg font-black text-[#f58220]" href="/">Continuar comprando</a>
        </div>
      </div>

      <section className="rounded-[12px] border border-neutral-500 bg-white p-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-black text-neutral-950">Seus itens ({items.length})</h2>
          <button className="text-lg font-black text-[#f58220]" onClick={clearCart} type="button">Limpar carrinho</button>
        </div>

        <div className="space-y-5">
          {hasMockStore ? (
            <div className="rounded-[6px] border border-[#f6b900] bg-[#fff8d6] px-4 py-3 text-sm font-bold text-neutral-800">
              Alguns itens sao demonstrativos ou ainda nao possuem lojista_id valido. Voce pode finalizar pelo WhatsApp normalmente; a gravacao no banco sera ativada com produtos reais.
            </div>
          ) : null}
          {items.map((item) => (
            <article className="grid items-center gap-5 md:grid-cols-[110px_1fr_190px_130px_40px]" key={item.cartId}>
              <div className="relative grid h-[100px] w-[100px] place-items-center overflow-hidden rounded-[6px] border border-neutral-300 bg-neutral-200 text-sm font-black text-neutral-500">
                {item.imageUrl ? (
                  <Image
                    alt={item.name}
                    blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                    className="object-cover"
                    fill
                    placeholder="blur"
                    sizes="100px"
                    src={item.imageUrl}
                  />
                ) : "IMG"}
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase text-neutral-950">{item.name}</h3>
                <p className="mt-1 text-base text-neutral-600">SKU {item.sku}</p>
                <p className="mt-1 inline-block rounded-[4px] bg-[#fff8d6] px-2 py-1 text-xs font-black uppercase text-neutral-800">
                  Vendido por {item.storeName}
                </p>
                <p className="mt-1 text-base text-neutral-700">{formatPrice(item.unitPrice)} cada</p>
                <div className="mt-2 flex gap-2 text-base">
                  <span className="grid h-7 min-w-7 place-items-center rounded border border-neutral-400 font-black">{item.size || "P"}</span>
                  <span className="h-7 w-7 rounded-[2px]" style={{ backgroundColor: item.colorValue || "#171717" }} />
                  <span>{item.color || "Preto"}</span>
                  <span>{item.extras || "Com Bolso"}</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button className="grid h-10 w-12 place-items-center rounded border border-neutral-400 text-2xl font-black" onClick={() => decrement(item.cartId)} type="button">-</button>
                <span className="text-3xl font-black">{item.quantity}</span>
                <button className="grid h-10 w-12 place-items-center rounded border border-neutral-400 text-2xl font-black" onClick={() => increment(item.cartId)} type="button">+</button>
              </div>
              <p className="text-right text-2xl font-black text-neutral-950">{formatPrice(item.unitPrice * item.quantity)}</p>
              <button className="grid h-10 w-10 place-items-center rounded border border-neutral-400 text-lg font-black text-red-600" onClick={() => removeItem(item.cartId)} type="button">X</button>
            </article>
          ))}
          {!items.length ? <p className="py-10 text-center text-lg font-black uppercase text-neutral-500">Seu carrinho esta vazio.</p> : null}
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <section>
          <h2 className="mb-5 text-2xl font-black text-neutral-950">Dados para atendimento</h2>
          <div className="rounded-[12px] border border-neutral-500 bg-white p-5">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="font-bold">Nome completo<input className="mt-1 h-12 w-full border border-neutral-400 px-3 outline-none" value={name} onChange={(event) => setName(event.target.value)} /></label>
              <label className="font-bold">WhatsApp<input className="mt-1 h-12 w-full border border-neutral-400 px-3 outline-none" type="tel" value={whatsapp} onChange={(event) => setWhatsapp(formatWhatsapp(event.target.value))} /></label>
              <label className="font-bold">E-mail<input className="mt-1 h-12 w-full border border-neutral-400 px-3 outline-none" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-[230px_1fr]">
              <label className="font-bold">Captcha anti-spam: 5 + 3 = ?<input className="mt-1 h-12 w-full border border-neutral-400 px-3 outline-none" placeholder="Digite a resposta" value={captcha} onChange={(event) => setCaptcha(event.target.value)} /></label>
              <label className="flex items-center gap-3 rounded border border-neutral-400 bg-neutral-50 px-4 py-3 text-base">
                <input checked={lgpd} onChange={(event) => setLgpd(event.target.checked)} type="checkbox" />
                Li e concordo com a Politica de Privacidade/LGPD e autorizo contato para atendimento deste orcamento.
              </label>
            </div>
            <button className="mt-5 h-14 w-full rounded-[8px] bg-[#f6b900] text-xl font-black uppercase text-neutral-950" onClick={finalizeOrder} type="button">
              Finalizar pedido
            </button>
            {status ? <p className="mt-3 text-center text-sm font-bold text-red-700">{status}</p> : null}
          </div>
        </section>

        <aside className="rounded-[12px] border border-neutral-500 bg-white p-6">
          <h2 className="mb-6 text-2xl font-black text-neutral-950">Resumo do pedido</h2>
          <div className="space-y-4 text-lg">
            <div className="flex justify-between"><span>Produtos</span><span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span></div>
            <div className="flex justify-between"><span>Valor totals</span><span>{formatPrice(total)}</span></div>
            {validAffiliate ? (
              <div className="rounded-[6px] bg-[#fff8d6] px-3 py-2 text-sm font-black text-neutral-800">
                Vendido por {validAffiliate.nomeAfiliado}
              </div>
            ) : null}
          </div>
          <div className="my-6 rounded-[6px] bg-neutral-100 p-4 text-base text-neutral-700">
            Frete, instalacao e condicoes comerciais serao confirmados no atendimento
          </div>
          <button className="h-14 w-full rounded-[8px] bg-[#f6b900] text-xl font-black uppercase text-neutral-950" onClick={finalizeOrder} type="button">
            Finalizar pedido
          </button>
        </aside>
      </div>
    </div>
  );
}
