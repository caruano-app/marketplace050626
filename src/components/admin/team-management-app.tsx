"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  cityOptions,
  getCityLabel,
  getPermissionLabel,
  getSegmentLabel,
  permissionLevels,
  segmentOptions,
  type ManagementScope,
  type ManagementUserOption,
} from "@/lib/data/management";

type TeamManagementAppProps = {
  scopes: ManagementScope[];
};

export function TeamManagementApp({ scopes }: TeamManagementAppProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<ManagementUserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<ManagementUserOption | null>(null);
  const [cidade, setCidade] = useState("caruaru");
  const [segmento, setSegmento] = useState("alimentacao");
  const [nivel, setNivel] = useState("2");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function searchUsers(value: string) {
    setQuery(value);
    setSelectedUser(null);

    if (value.trim().length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    const response = await fetch(`/api/admin/management/users?q=${encodeURIComponent(value)}`, { cache: "no-store" });
    const payload = (await response.json()) as { users?: ManagementUserOption[]; error?: string };

    if (!response.ok) {
      setMessage(payload.error || "Nao foi possivel buscar usuarios.");
      setLoading(false);
      return;
    }

    setUsers(payload.users || []);
    setLoading(false);
  }

  async function assignScope() {
    if (!selectedUser) {
      setMessage("Selecione um usuario da busca.");
      return;
    }

    setMessage("Salvando escopo...");
    const response = await fetch("/api/admin/management/scopes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId: selectedUser.id, cidade, segmento, nivel: Number(nivel) }),
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(payload.error || "Nao foi possivel atribuir o escopo.");
      return;
    }

    setMessage("Escopo atribuido com sucesso.");
    setQuery("");
    setUsers([]);
    setSelectedUser(null);
    startTransition(() => router.refresh());
  }

  async function revokeScope(scopeId: string) {
    setMessage("Revogando acesso...");
    const response = await fetch(`/api/admin/management/scopes/${scopeId}`, { method: "PATCH" });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(payload.error || "Nao foi possivel revogar o acesso.");
      return;
    }

    setMessage("Acesso revogado.");
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[8px] bg-neutral-950 p-5 text-white">
        <p className="text-sm font-black uppercase text-[#ffd700]">Equipe Caruano</p>
        <h1 className="mt-1 text-3xl font-black uppercase leading-tight">Escopos de gerencia</h1>
        <p className="mt-2 max-w-3xl text-sm font-bold text-neutral-300">
          Defina quais usuarios podem operar demandas por cidade, segmento e nivel de permissao.
        </p>
        {message ? <p className="mt-3 rounded-[6px] bg-white/10 p-3 text-sm font-black">{message}</p> : null}
      </section>

      <section className="rounded-[8px] bg-white p-4 shadow-sm">
        <h2 className="text-xl font-black uppercase text-neutral-950">Atribuir novo escopo</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.7fr]">
          <label className="relative block">
            <span className="text-sm font-black uppercase text-neutral-700">Buscar usuario</span>
            <input
              className="mt-2 min-h-11 w-full rounded-[6px] border border-neutral-300 px-3 text-base font-bold outline-none focus:border-neutral-950"
              onChange={(event) => searchUsers(event.target.value)}
              placeholder="Nome, e-mail ou WhatsApp"
              type="search"
              value={query}
            />
            {users.length || loading ? (
              <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-[8px] border border-neutral-200 bg-white shadow-xl">
                {loading ? <p className="p-3 text-sm font-black text-neutral-500">Buscando...</p> : null}
                {users.map((user) => (
                  <button
                    className="block min-h-14 w-full border-b border-neutral-100 px-3 py-2 text-left hover:bg-[#fff8d6]"
                    key={user.id}
                    onClick={() => {
                      setSelectedUser(user);
                      setQuery(user.nome_completo || user.email || user.id);
                      setUsers([]);
                    }}
                    type="button"
                  >
                    <span className="block text-sm font-black text-neutral-950">{user.nome_completo || "Usuario sem nome"}</span>
                    <span className="block text-xs font-bold text-neutral-500">{user.email || user.telefone || "Sem contato"}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-black uppercase text-neutral-700">Cidade</span>
            <select
              className="mt-2 min-h-11 w-full rounded-[6px] border border-neutral-300 bg-white px-3 text-base font-bold"
              onChange={(event) => setCidade(event.target.value)}
              value={cidade}
            >
              {cityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-black uppercase text-neutral-700">Segmento</span>
            <select
              className="mt-2 min-h-11 w-full rounded-[6px] border border-neutral-300 bg-white px-3 text-base font-bold"
              onChange={(event) => setSegmento(event.target.value)}
              value={segmento}
            >
              {segmentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-black uppercase text-neutral-700">Nivel</span>
            <select
              className="mt-2 min-h-11 w-full rounded-[6px] border border-neutral-300 bg-white px-3 text-base font-bold"
              onChange={(event) => setNivel(event.target.value)}
              value={nivel}
            >
              {permissionLevels.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {selectedUser ? (
          <p className="mt-3 rounded-[6px] bg-neutral-100 p-3 text-sm font-black text-neutral-800">
            Selecionado: {selectedUser.nome_completo || selectedUser.email}
          </p>
        ) : null}

        <button
          className="mt-4 min-h-11 w-full rounded-[6px] bg-[#ffd700] px-4 text-sm font-black uppercase text-neutral-950 transition active:scale-95 disabled:opacity-50"
          disabled={isPending}
          onClick={assignScope}
          type="button"
        >
          Atribuir escopo
        </button>
      </section>

      <section className="rounded-[8px] bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black uppercase text-neutral-950">Gerentes ativos</h2>
            <p className="text-sm font-bold text-neutral-500">{scopes.length} escopos cadastrados.</p>
          </div>
          <button
            className="min-h-11 rounded-[6px] bg-neutral-950 px-4 text-sm font-black uppercase text-white"
            onClick={() => startTransition(() => router.refresh())}
            type="button"
          >
            Atualizar
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          {scopes.map((scope) => (
            <article className="rounded-[8px] border border-neutral-200 p-4" key={scope.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-black uppercase text-neutral-950">{scope.usuarios?.nome_completo || "Usuario Caruano"}</p>
                  <p className="mt-1 text-sm font-bold text-neutral-500">{scope.usuarios?.email || scope.usuarios?.telefone || scope.usuario_id}</p>
                </div>
                <span className="rounded-full bg-[#fff8d6] px-3 py-2 text-xs font-black uppercase text-neutral-950">
                  {getPermissionLabel(scope.nivel_permissao)}
                </span>
              </div>
              <div className="mt-3 grid gap-2 text-sm font-black text-neutral-700 sm:grid-cols-2">
                <p>Cidade: {getCityLabel(scope.cidade_atuacao)}</p>
                <p>Segmento: {getSegmentLabel(scope.segmento_atuacao)}</p>
              </div>
              <button
                className="mt-4 min-h-11 w-full rounded-[6px] border border-red-300 bg-red-50 px-4 text-sm font-black uppercase text-red-700"
                onClick={() => revokeScope(scope.id)}
                type="button"
              >
                Revogar acesso
              </button>
            </article>
          ))}

          {!scopes.length ? (
            <p className="rounded-[8px] border border-dashed border-neutral-300 p-6 text-center text-sm font-black uppercase text-neutral-500">
              Nenhum gerente ativo encontrado.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
