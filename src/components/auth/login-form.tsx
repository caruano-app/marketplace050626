"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type ProfileChoice = "comprador" | "lojista";
type AuthMode = "login" | "cadastro";

function saveSessionCookie(accessToken: string) {
  document.cookie = `caruano_session_access_token=${accessToken}; Max-Age=${60 * 60 * 24 * 7}; Path=/; SameSite=Lax`;
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("login");
  const [profile, setProfile] = useState<ProfileChoice>("comprador");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nextUrl = searchParams.get("next") || "/";

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("Processando acesso...");

    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setStatus("Configure as variaveis do Supabase antes de autenticar.");
      setIsSubmitting(false);
      return;
    }

    const response =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                nome_completo: name,
                perfil_principal: profile,
              },
            },
          });

    if (response.error) {
      setStatus(response.error.message);
      setIsSubmitting(false);
      return;
    }

    if (response.data.session?.access_token) {
      saveSessionCookie(response.data.session.access_token);
      window.location.href = nextUrl;
      return;
    }

    setStatus("Cadastro recebido. Confirme o e-mail, se o Supabase exigir validacao.");
    setIsSubmitting(false);
  }

  return (
    <form className="rounded-[14px] border border-neutral-300 bg-white p-5 shadow-sm" onSubmit={submitAuth}>
      <div className="grid grid-cols-2 gap-2 rounded-[10px] bg-neutral-100 p-1">
        <button
          className={`h-11 rounded-[8px] text-sm font-black uppercase active:scale-95 ${mode === "login" ? "bg-neutral-950 text-white" : "text-neutral-700"}`}
          onClick={() => setMode("login")}
          type="button"
        >
          Entrar
        </button>
        <button
          className={`h-11 rounded-[8px] text-sm font-black uppercase active:scale-95 ${mode === "cadastro" ? "bg-neutral-950 text-white" : "text-neutral-700"}`}
          onClick={() => setMode("cadastro")}
          type="button"
        >
          Cadastrar
        </button>
      </div>

      {mode === "cadastro" ? (
        <>
          <label className="mt-5 block text-sm font-black text-neutral-800">
            Nome completo
            <input
              className="mt-2 h-12 w-full rounded-[8px] border border-neutral-300 px-3 text-base outline-none focus:border-neutral-950"
              onChange={(event) => setName(event.target.value)}
              value={name}
            />
          </label>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              className={`min-h-12 rounded-[8px] border px-3 text-sm font-black active:scale-95 ${profile === "comprador" ? "border-neutral-950 bg-[#FFD700]" : "border-neutral-300 bg-white"}`}
              onClick={() => setProfile("comprador")}
              type="button"
            >
              Quero Comprar
            </button>
            <button
              className={`min-h-12 rounded-[8px] border px-3 text-sm font-black active:scale-95 ${profile === "lojista" ? "border-neutral-950 bg-[#FFD700]" : "border-neutral-300 bg-white"}`}
              onClick={() => setProfile("lojista")}
              type="button"
            >
              Quero Vender
            </button>
          </div>
        </>
      ) : null}

      <label className="mt-5 block text-sm font-black text-neutral-800">
        E-mail
        <input
          className="mt-2 h-12 w-full rounded-[8px] border border-neutral-300 px-3 text-base outline-none focus:border-neutral-950"
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          value={email}
        />
      </label>
      <label className="mt-4 block text-sm font-black text-neutral-800">
        Senha
        <input
          className="mt-2 h-12 w-full rounded-[8px] border border-neutral-300 px-3 text-base outline-none focus:border-neutral-950"
          minLength={6}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          value={password}
        />
      </label>

      <button
        className="mt-5 h-12 w-full rounded-[8px] bg-[#FFD700] text-sm font-black uppercase text-neutral-950 shadow-sm active:scale-95 disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta"}
      </button>

      {status ? <p className="mt-4 text-center text-sm font-bold text-neutral-700">{status}</p> : null}
    </form>
  );
}
