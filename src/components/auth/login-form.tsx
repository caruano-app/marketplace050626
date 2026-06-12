"use client";

import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

type ProfileChoice = "comprador" | "lojista";
type AuthMode = "login" | "cadastro";
type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  reset: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export function LoginForm() {
  const searchParams = useSearchParams();
  const turnstileRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [mode, setMode] = useState<AuthMode>("login");
  const [profile, setProfile] = useState<ProfileChoice>("comprador");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nextUrl = searchParams.get("next") || "/";
  const captchaEnabled = Boolean(turnstileSiteKey);

  const resetCaptcha = useCallback(() => {
    setCaptchaToken("");

    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, []);

  useEffect(() => {
    if (!captchaEnabled || !turnstileReady || !turnstileRef.current || widgetIdRef.current || !window.turnstile) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: turnstileSiteKey,
      callback: (token) => setCaptchaToken(token),
      "expired-callback": () => setCaptchaToken(""),
      "error-callback": () => setCaptchaToken(""),
    });
  }, [captchaEnabled, turnstileReady]);

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (captchaEnabled && !captchaToken) {
      setStatus("Confirme o desafio de seguranca para continuar.");
      return;
    }

    setIsSubmitting(true);
    setStatus("Processando acesso...");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode,
        email,
        password,
        name,
        profile,
        captchaToken,
      }),
    });
    const payload = (await response.json()) as { ok?: boolean; error?: string; needsEmailConfirmation?: boolean };

    if (!response.ok || payload.error) {
      setStatus(payload.error || "Nao foi possivel autenticar agora.");
      resetCaptcha();
      setIsSubmitting(false);
      return;
    }

    if (!payload.needsEmailConfirmation) {
      window.location.href = nextUrl;
      return;
    }

    setStatus("Cadastro recebido! Enviamos um e-mail de confirma\u00e7\u00e3o para ativar sua conta no Caruano. Verifique tamb\u00e9m a caixa de spam ou promo\u00e7\u00f5es.");
    resetCaptcha();
    setIsSubmitting(false);
  }

  return (
    <form className="rounded-[14px] border border-neutral-300 bg-white p-5 shadow-sm" onSubmit={submitAuth}>
      {captchaEnabled ? (
        <Script
          onLoad={() => setTurnstileReady(true)}
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
        />
      ) : null}

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

      {captchaEnabled ? (
        <div className="mt-4 rounded-[8px] border border-neutral-200 bg-neutral-50 p-3">
          <div className="min-h-[65px]" ref={turnstileRef} />
          <p className="mt-2 text-xs font-bold text-neutral-500">Protecao contra acessos automatizados.</p>
        </div>
      ) : null}

      <button
        className="mt-5 h-12 w-full rounded-[8px] bg-[#FFD700] text-sm font-black uppercase text-neutral-950 shadow-sm active:scale-95 disabled:opacity-60"
        disabled={isSubmitting || (captchaEnabled && !captchaToken)}
        type="submit"
      >
        {isSubmitting ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta"}
      </button>

      {status ? <p className="mt-4 text-center text-sm font-bold text-neutral-700">{status}</p> : null}
    </form>
  );
}
