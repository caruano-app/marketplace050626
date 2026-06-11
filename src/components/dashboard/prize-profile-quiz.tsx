"use client";

import { useEffect, useMemo, useState } from "react";
import type { IntelligenceProfile } from "@/lib/data/management";

const interestOptions = ["Jeans", "Tecidos", "Sacolas", "Solar", "Seguros", "Alimentacao", "Maquinas", "Frete", "Graficas"];

type PrizeProfileQuizProps = {
  initialProfile?: IntelligenceProfile | null;
};

export function PrizeProfileQuiz({ initialProfile = null }: PrizeProfileQuizProps) {
  const [step, setStep] = useState(0);
  const [profissao, setProfissao] = useState(initialProfile?.profissao || "");
  const [bairro, setBairro] = useState(initialProfile?.bairro || "");
  const [gastoEnergia, setGastoEnergia] = useState(String(initialProfile?.gasto_mensal_energia || ""));
  const [possuiVeiculo, setPossuiVeiculo] = useState(Boolean(initialProfile?.possui_veiculo_proprio));
  const [tipoVeiculo, setTipoVeiculo] = useState(initialProfile?.tipo_veiculo_preferencial || "");
  const [faturamento, setFaturamento] = useState(String(initialProfile?.faturamento_medio_mensal || ""));
  const [interesses, setInteresses] = useState<string[]>(initialProfile?.interesses_tags || []);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(Boolean(initialProfile?.score_confianca && initialProfile.score_confianca >= 100));

  useEffect(() => {
    if (initialProfile) return;

    let active = true;
    fetch("/api/profile-intelligence", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { profile?: IntelligenceProfile }) => {
        if (!active || !payload.profile) return;
        setProfissao(payload.profile.profissao || "");
        setBairro(payload.profile.bairro || "");
        setGastoEnergia(String(payload.profile.gasto_mensal_energia || ""));
        setPossuiVeiculo(Boolean(payload.profile.possui_veiculo_proprio));
        setTipoVeiculo(payload.profile.tipo_veiculo_preferencial || "");
        setFaturamento(String(payload.profile.faturamento_medio_mensal || ""));
        setInteresses(payload.profile.interesses_tags || []);
        setCompleted(Boolean(payload.profile.score_confianca && payload.profile.score_confianca >= 100));
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [initialProfile]);

  const progress = useMemo(() => Math.round(((step + 1) / 4) * 100), [step]);

  function toggleInterest(value: string) {
    setInteresses((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  }

  async function submitProfile() {
    setSaving(true);
    setMessage("Salvando perfil...");

    const response = await fetch("/api/profile-intelligence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profissao,
        bairro,
        gastoMensalEnergia: gastoEnergia,
        possuiVeiculo,
        tipoVeiculo,
        faturamentoMedioMensal: faturamento,
        interesses,
      }),
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(payload.error || "Nao foi possivel salvar o perfil.");
      setSaving(false);
      return;
    }

    setCompleted(true);
    setMessage("Perfil completo - 100%.");
    setSaving(false);
  }

  if (completed) {
    return (
      <section className="rounded-[8px] bg-white p-5 shadow-sm">
        <div className="rounded-[8px] bg-[#ffd700] p-5 text-neutral-950">
          <p className="text-sm font-black uppercase">Perfil Completo - 100%</p>
          <h1 className="mt-2 text-3xl font-black uppercase leading-tight">Ofertas mais inteligentes para voce</h1>
          <p className="mt-2 text-sm font-bold">
            Agora voce tera acesso a ofertas exclusivas no Clube Caruano, beneficios regionais e oportunidades alinhadas ao seu perfil.
          </p>
        </div>
        <button
          className="mt-4 min-h-11 w-full rounded-[6px] bg-neutral-950 px-4 text-sm font-black uppercase text-white"
          onClick={() => {
            setCompleted(false);
            setStep(0);
          }}
          type="button"
        >
          Atualizar respostas
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-[8px] bg-white p-4 shadow-sm">
      <div className="rounded-[8px] bg-neutral-950 p-5 text-white">
        <p className="text-sm font-black uppercase text-[#ffd700]">Perfil premiado</p>
        <h1 className="mt-1 text-3xl font-black uppercase leading-tight">Conte sua rotina</h1>
        <p className="mt-2 text-sm font-bold text-neutral-300">Uma pergunta por vez para liberar ofertas melhores no Clube Caruano.</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-[#ffd700] transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-4 min-h-[300px] rounded-[8px] border border-neutral-200 p-4">
        {step === 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-black uppercase text-neutral-950">Qual e sua atividade principal?</h2>
            <label className="block">
              <span className="text-sm font-black uppercase text-neutral-700">Profissao ou negocio</span>
              <input
                className="mt-2 min-h-11 w-full rounded-[6px] border border-neutral-300 px-3 text-base font-bold"
                onChange={(event) => setProfissao(event.target.value)}
                placeholder="Ex: lojista, costureira, entregador"
                value={profissao}
              />
            </label>
            <label className="block">
              <span className="text-sm font-black uppercase text-neutral-700">Bairro</span>
              <input
                className="mt-2 min-h-11 w-full rounded-[6px] border border-neutral-300 px-3 text-base font-bold"
                onChange={(event) => setBairro(event.target.value)}
                placeholder="Ex: Petrópolis"
                value={bairro}
              />
            </label>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-black uppercase text-neutral-950">Energia e faturamento</h2>
            <label className="block">
              <span className="text-sm font-black uppercase text-neutral-700">Gasto mensal de energia</span>
              <input
                className="mt-2 min-h-11 w-full rounded-[6px] border border-neutral-300 px-3 text-base font-bold"
                inputMode="decimal"
                onChange={(event) => setGastoEnergia(event.target.value)}
                placeholder="Ex: 850,00"
                value={gastoEnergia}
              />
            </label>
            <label className="block">
              <span className="text-sm font-black uppercase text-neutral-700">Faturamento medio mensal</span>
              <input
                className="mt-2 min-h-11 w-full rounded-[6px] border border-neutral-300 px-3 text-base font-bold"
                inputMode="decimal"
                onChange={(event) => setFaturamento(event.target.value)}
                placeholder="Ex: 12000,00"
                value={faturamento}
              />
            </label>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-black uppercase text-neutral-950">Voce possui veiculo?</h2>
            <button
              className={`min-h-12 w-full rounded-[6px] px-4 text-sm font-black uppercase transition active:scale-95 ${
                possuiVeiculo ? "bg-[#ffd700] text-neutral-950" : "bg-neutral-100 text-neutral-700"
              }`}
              onClick={() => setPossuiVeiculo((current) => !current)}
              type="button"
            >
              {possuiVeiculo ? "Sim, possuo veiculo" : "Nao possuo veiculo"}
            </button>
            {possuiVeiculo ? (
              <label className="block">
                <span className="text-sm font-black uppercase text-neutral-700">Tipo de veiculo</span>
                <select
                  className="mt-2 min-h-11 w-full rounded-[6px] border border-neutral-300 bg-white px-3 text-base font-bold"
                  onChange={(event) => setTipoVeiculo(event.target.value)}
                  value={tipoVeiculo}
                >
                  <option value="">Selecione</option>
                  <option value="moto">Moto</option>
                  <option value="carro">Carro</option>
                  <option value="van">Van</option>
                  <option value="toyota">Toyota</option>
                  <option value="caminhao">Caminhao</option>
                </select>
              </label>
            ) : null}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-black uppercase text-neutral-950">Quais assuntos combinam com voce?</h2>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((interest) => {
                const active = interesses.includes(interest);
                return (
                  <button
                    className={`min-h-11 rounded-full px-4 text-sm font-black uppercase transition active:scale-95 ${
                      active ? "bg-[#ffd700] text-neutral-950" : "bg-neutral-100 text-neutral-700"
                    }`}
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    type="button"
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {message ? <p className="mt-3 rounded-[6px] bg-neutral-100 p-3 text-sm font-black text-neutral-700">{message}</p> : null}

      <div className="sticky bottom-16 mt-4 grid grid-cols-2 gap-3 rounded-[8px] bg-white/95 py-3 backdrop-blur md:bottom-0">
        <button
          className="min-h-11 rounded-[6px] border border-neutral-300 px-4 text-sm font-black uppercase text-neutral-950 disabled:opacity-40"
          disabled={step === 0 || saving}
          onClick={() => setStep((current) => Math.max(0, current - 1))}
          type="button"
        >
          Voltar
        </button>
        {step < 3 ? (
          <button
            className="min-h-11 rounded-[6px] bg-[#ffd700] px-4 text-sm font-black uppercase text-neutral-950"
            disabled={saving}
            onClick={() => setStep((current) => current + 1)}
            type="button"
          >
            Continuar
          </button>
        ) : (
          <button
            className="min-h-11 rounded-[6px] bg-[#ffd700] px-4 text-sm font-black uppercase text-neutral-950 disabled:opacity-50"
            disabled={saving}
            onClick={submitProfile}
            type="button"
          >
            {saving ? "Salvando..." : "Concluir perfil"}
          </button>
        )}
      </div>
    </section>
  );
}
