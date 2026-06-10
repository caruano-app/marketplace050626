import { LoginForm } from "@/components/auth/login-form";
import { SiteHeader } from "@/components/header/site-header";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto grid min-h-[calc(100vh-160px)] max-w-[1412px] items-center px-4 py-8">
        <section className="mx-auto w-full max-w-[460px]">
          <p className="text-sm font-black uppercase text-[#f58220]">Conta Caruano</p>
          <h1 className="mt-1 text-4xl font-black text-neutral-950">Entre ou cadastre-se</h1>
          <p className="mt-3 text-base font-bold text-neutral-600">
            Acesse sua conta para comprar, vender ou gerenciar sua loja no marketplace Caruano.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </section>
      </main>
    </div>
  );
}
