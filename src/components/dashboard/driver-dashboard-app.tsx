"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AvailableFreight, DriverDashboardData } from "@/lib/data/driver-dashboard";
import { NotificationBell } from "@/components/smart-tools/notification-badge";

type DriverDashboardAppProps = DriverDashboardData;

const cityOptions = ["caruaru", "santa_cruz_do_capibaribe", "toritama"];
const dayOptions = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function cityLabel(value: string | null | undefined) {
  if (!value) return "A combinar";
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function whatsappHref(phone: string | null, freight: AvailableFreight) {
  const digits = (phone || "").replace(/\D/g, "");
  const target = digits ? (digits.startsWith("55") ? digits : `55${digits}`) : "";
  const message = encodeURIComponent(`Ola, sou entregador Caruano e aceitei o frete #${freight.id.slice(0, 8)}. Podemos combinar a retirada?`);
  return target ? `https://wa.me/${target}?text=${message}` : "#";
}

export function DriverDashboardApp({ profile, routes, availableFreights, metrics }: DriverDashboardAppProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [routeOrigin, setRouteOrigin] = useState("caruaru");
  const [routeDestination, setRouteDestination] = useState("");
  const [routeDays, setRouteDays] = useState<string[]>(["Seg", "Qua", "Sex"]);
  const [routeValue, setRouteValue] = useState("");
  const [vehicle, setVehicle] = useState("moto");

  if (!profile) {
    return (
      <section className="rounded-[8px] border border-red-200 bg-white p-5 text-center">
        <p className="text-sm font-black uppercase text-red-600">Cadastro incompleto</p>
        <h1 className="mt-2 text-3xl font-black uppercase text-zinc-900">Entregador nao encontrado</h1>
        <p className="mt-2 text-sm font-bold text-neutral-600">Crie o perfil satelite de entregador para liberar esta area.</p>
      </section>
    );
  }

  if (profile.status_verificacao_identidade !== "aprovado") {
    return (
      <div className="space-y-4">
        <section className="rounded-[8px] bg-zinc-900 p-5 text-white">
          <p className="text-sm font-black uppercase text-[#ffd700]">Aguardando aprovacao</p>
          <h1 className="mt-1 text-3xl font-black uppercase leading-tight">Estamos validando seus dados</h1>
          <p className="mt-2 text-sm font-bold text-neutral-300">
            Essa etapa protege compradores, lojistas e entregadores. Assim que a verificacao for aprovada, seus fretes serao liberados.
          </p>
          <p className="mt-3 rounded-[6px] bg-white/10 p-3 text-sm font-black uppercase">Status: {profile.status_verificacao_identidade.replace("_", " ")}</p>
        </section>
        <a className="grid min-h-11 place-items-center rounded-[6px] bg-[#ffd700] px-4 text-sm font-black uppercase text-zinc-900" href="/dashboard/entregador/verificacao">
          Enviar ou revisar documentos
        </a>
      </div>
    );
  }

  function toggleDay(day: string) {
    setRouteDays((current) => (current.includes(day) ? current.filter((item) => item !== day) : [...current, day]));
  }

  async function saveRoute() {
    setMessage("Salvando rota...");
    const response = await fetch("/api/driver/routes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origem: routeOrigin,
        destino: routeDestination,
        dias: routeDays,
        valorBase: Number(routeValue.replace(",", ".")) || 0,
      }),
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(payload.error || "Nao foi possivel salvar a rota.");
      return;
    }

    setRouteDestination("");
    setRouteValue("");
    setMessage("Rota cadastrada.");
    startTransition(() => router.refresh());
  }

  async function acceptFreight(freight: AvailableFreight) {
    setMessage("Aceitando frete...");
    const response = await fetch(`/api/driver/freights/${freight.id}/accept`, { method: "PATCH" });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(payload.error || "Nao foi possivel aceitar o frete.");
      return;
    }

    setMessage("Frete aceito. Chame o lojista no WhatsApp para combinar a retirada.");
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-4 pb-24">
      <section className="rounded-[8px] bg-zinc-900 p-5 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase text-[#ffd700]">Dashboard do entregador</p>
            <h1 className="mt-1 text-3xl font-black uppercase leading-tight">Fretes Caruano</h1>
            <p className="mt-2 text-sm font-bold text-neutral-300">Aceite corridas locais, intermunicipais e entregas para excursao.</p>
          </div>
          <NotificationBell placement="inline" />
        </div>
        {message ? <p className="mt-3 rounded-[6px] bg-white/10 p-3 text-sm font-black text-white">{message}</p> : null}
      </section>

      <section className="flex gap-3 overflow-x-auto pb-2">
        <article className="min-w-[180px] rounded-[8px] bg-[#00a86b] p-4 text-white shadow-sm">
          <p className="text-xs font-black uppercase">Saldo a receber</p>
          <p className="mt-2 text-2xl font-black">{formatPrice(metrics.receivable)}</p>
        </article>
        <article className="min-w-[180px] rounded-[8px] bg-[#ffd700] p-4 text-zinc-900 shadow-sm">
          <p className="text-xs font-black uppercase">Entregas realizadas</p>
          <p className="mt-2 text-3xl font-black">{metrics.completed}</p>
        </article>
        <article className="min-w-[180px] rounded-[8px] bg-white p-4 text-zinc-900 shadow-sm">
          <p className="text-xs font-black uppercase text-neutral-500">Fretes disponiveis</p>
          <p className="mt-2 text-3xl font-black">{availableFreights.length}</p>
        </article>
      </section>

      <section className="rounded-[8px] bg-white p-4 shadow-sm">
        <h2 className="text-xl font-black uppercase text-zinc-900">Veiculo e rotas</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="text-sm font-black uppercase text-zinc-900">
            Veiculo principal
            <select className="mt-2 h-12 w-full rounded-[6px] border border-neutral-300 px-3 text-base font-bold outline-none" onChange={(event) => setVehicle(event.target.value)} value={vehicle}>
              <option value="moto">Moto</option>
              <option value="carro">Carro</option>
              <option value="toyota">Toyota</option>
              <option value="van">Van</option>
              <option value="caminhao">Caminhao</option>
            </select>
          </label>
          <label className="text-sm font-black uppercase text-zinc-900">
            Origem
            <select className="mt-2 h-12 w-full rounded-[6px] border border-neutral-300 px-3 text-base font-bold outline-none" onChange={(event) => setRouteOrigin(event.target.value)} value={routeOrigin}>
              {cityOptions.map((city) => <option key={city} value={city}>{cityLabel(city)}</option>)}
            </select>
          </label>
          <label className="text-sm font-black uppercase text-zinc-900">
            Destino
            <input className="mt-2 h-12 w-full rounded-[6px] border border-neutral-300 px-3 text-base font-bold outline-none" onChange={(event) => setRouteDestination(event.target.value)} placeholder="Ex: Surubim, Recife, Zona Rural" value={routeDestination} />
          </label>
          <label className="text-sm font-black uppercase text-zinc-900">
            Valor base
            <input className="mt-2 h-12 w-full rounded-[6px] border border-neutral-300 px-3 text-base font-bold outline-none" inputMode="decimal" onChange={(event) => setRouteValue(event.target.value)} placeholder="R$ 0,00" value={routeValue} />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {dayOptions.map((day) => (
            <button className={`min-h-11 rounded-[6px] px-4 text-sm font-black uppercase ${routeDays.includes(day) ? "bg-[#ffd700] text-zinc-900" : "bg-neutral-100 text-neutral-600"}`} key={day} onClick={() => toggleDay(day)} type="button">
              {day}
            </button>
          ))}
        </div>
        <button className="mt-3 min-h-11 w-full rounded-[6px] bg-zinc-900 text-sm font-black uppercase text-white disabled:opacity-50" disabled={isPending} onClick={saveRoute} type="button">
          Salvar rota
        </button>

        <div className="mt-4 space-y-2">
          {routes.map((route) => (
            <div className="rounded-[6px] bg-neutral-100 p-3 text-sm font-bold text-neutral-700" key={route.id}>
              <strong className="text-zinc-900">{cityLabel(route.cidade_origem)}</strong> para <strong className="text-zinc-900">{cityLabel(route.cidade_destino)}</strong>
              <span className="block text-xs uppercase text-neutral-500">{route.dias_semana?.join(", ") || "Dias a combinar"} | {formatPrice(Number(route.valor_base_entrega || 0))}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[8px] bg-white p-4 shadow-sm">
        <h2 className="text-xl font-black uppercase text-zinc-900">Fretes disponiveis</h2>
        <div className="mt-3 space-y-3">
          {availableFreights.map((freight) => (
            <article className="rounded-[8px] border border-neutral-200 p-4" key={freight.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-black uppercase text-zinc-900">{freight.storeName}</p>
                  <p className="mt-1 text-xs font-bold uppercase text-neutral-500">{cityLabel(freight.storeCity)} | {freight.deliveryType} | {freight.vehicleRequired}</p>
                </div>
                <p className="text-2xl font-black text-[#f58220]">{formatPrice(freight.price)}</p>
              </div>
              <p className="mt-3 rounded-[6px] bg-neutral-100 p-3 text-sm font-bold text-neutral-700">{freight.notes || "Peso e volumes serao confirmados pelo lojista."}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <button className="min-h-11 rounded-[6px] bg-[#ffd700] px-4 text-sm font-black uppercase text-zinc-900" onClick={() => acceptFreight(freight)} type="button">
                  Aceitar frete
                </button>
                <a className={`grid min-h-11 place-items-center rounded-[6px] px-4 text-sm font-black uppercase text-white ${freight.storeWhatsapp ? "bg-[#00a86b]" : "bg-neutral-400"}`} href={whatsappHref(freight.storeWhatsapp, freight)} rel="noreferrer" target="_blank">
                  Chamar no Zap
                </a>
              </div>
            </article>
          ))}
          {!availableFreights.length ? (
            <p className="rounded-[8px] border border-dashed border-neutral-300 p-5 text-center text-sm font-black uppercase text-neutral-500">
              Nenhum frete disponivel no momento.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
