import { NextResponse, type NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAuthenticatedMerchant } from "@/lib/auth/session";

type ReplenishmentPayload = {
  distribuidoraId?: string | null;
  productId?: string;
  productName?: string;
  quantity?: number;
  unitPrice?: number;
};

async function createSupplyOrder(
  supabase: SupabaseClient,
  mercadinhoId: string,
  distribuidoraId: string,
  value: number,
) {
  const firstAttempt = await supabase
    .from("ordens_abastecimento")
    .insert({
      mercadinho_id: mercadinhoId,
      distribuidora_id: distribuidoraId,
      valor_total: value,
      status: "pendente",
    })
    .select("id")
    .single();

  if (!firstAttempt.error && firstAttempt.data) {
    return { orderId: firstAttempt.data.id as string, warning: null };
  }

  const fallbackAttempt = await supabase
    .from("ordens_abastecimento")
    .insert({
      comprador_id: mercadinhoId,
      fornecedor_id: distribuidoraId,
      valor_total: value,
      comissao_caruano: Number((value * 0.05).toFixed(2)),
      status: "analise_marketplace",
    })
    .select("id")
    .single();

  if (fallbackAttempt.error || !fallbackAttempt.data) {
    throw new Error(firstAttempt.error?.message || fallbackAttempt.error?.message || "Nao foi possivel gerar a ordem.");
  }

  return {
    orderId: fallbackAttempt.data.id as string,
    warning: "Ordem criada usando schema legado comprador_id/fornecedor_id.",
  };
}

export async function POST(request: NextRequest) {
  const merchant = await getAuthenticatedMerchant(request);
  if ("error" in merchant) return NextResponse.json({ error: merchant.error }, { status: merchant.status });

  const payload = (await request.json()) as ReplenishmentPayload;
  const distribuidoraId = payload.distribuidoraId;
  const quantity = Number(payload.quantity || 1);
  const unitPrice = Number(payload.unitPrice || 0);
  const total = Number((quantity * unitPrice).toFixed(2));

  if (!distribuidoraId || !payload.productId || quantity <= 0 || unitPrice <= 0) {
    return NextResponse.json({ error: "Dados de reposicao incompletos." }, { status: 400 });
  }

  try {
    const order = await createSupplyOrder(merchant.supabase, merchant.store.id, distribuidoraId, total);
    const warnings: string[] = order.warning ? [order.warning] : [];

    const { data: distributor } = await merchant.supabase
      .from("lojistas")
      .select("usuario_id,nome_fantasia")
      .eq("id", distribuidoraId)
      .maybeSingle();

    if (distributor?.usuario_id) {
      const { error: notificationError } = await merchant.supabase.from("notificacoes").insert({
        usuario_id: distributor.usuario_id,
        titulo: "Nova ordem de abastecimento",
        mensagem: `${merchant.store.nome_fantasia} solicitou reposicao de ${payload.productName || "produto"} pelo Caruano.`,
        lida: false,
        link_acao: "/dashboard/lojista/reabastecimento",
      });

      if (notificationError) {
        warnings.push(`Notificacao nao enviada: ${notificationError.message}`);
      }
    }

    const freightAttempt = await merchant.supabase.from("solicitacoes_frete").insert({
      comprador_id: merchant.user.id,
      lojista_id: distribuidoraId,
      veiculo_minimo_requerido: "van",
      preco_frete: 0,
      status_corrida: "aguardando_motorista",
      tipo_entrega: "frete_intermunicipal",
      observacoes_coleta: `Reposicao B2B Caruano #${order.orderId}`,
    });

    if (freightAttempt.error) {
      warnings.push(`Frete de carga nao aberto automaticamente: ${freightAttempt.error.message}`);
    }

    return NextResponse.json({ ok: true, orderId: order.orderId, warnings });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Falha ao gerar ordem." }, { status: 400 });
  }
}
