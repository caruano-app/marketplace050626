"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AdminMasterShellProps = {
  children: React.ReactNode;
};

const groups = [
  {
    label: "Operacional",
    items: [
      { label: "Dashboard", href: "/admin", icon: "M0 12h22M3 4h7v7H3V4Zm11 0h7v7h-7V4ZM3 15h7v5H3v-5Zm11 0h7v5h-7v-5Z" },
      { label: "Vendas & B2B", href: "/admin/importar", icon: "M4 7h16v12H4V7Zm2-4h12l2 4H4l2-4Z" },
      { label: "Fretes", href: "/admin#logistica", icon: "M3 7h11v9H3V7Zm11 3h4l3 3v3h-7v-6ZM6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" },
    ],
  },
  {
    label: "Ecossistema",
    items: [
      { label: "Lojistas", href: "/admin#lojistas", icon: "M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-1a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 21a6 6 0 0 1 12 0H2Zm12.5 0a5 5 0 0 0-2-4h7a4 4 0 0 1 4 4h-9Z" },
      { label: "Entregadores", href: "/admin#entregadores", icon: "M3 7h11v9H3V7Zm11 3h4l3 3v3h-7v-6ZM6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" },
      { label: "KYC", href: "/admin#kyc", icon: "M12 2 4 5v6c0 5 3.4 9.2 8 11 4.6-1.8 8-6 8-11V5l-8-3Zm-3 10 2 2 4-5" },
    ],
  },
  {
    label: "Catalogo",
    items: [
      { label: "Categorias", href: "/admin#admin-catalogo", icon: "M4 5h6v4H4V5Zm10 0h6v4h-6V5ZM4 15h6v4H4v-4Zm10 0h6v4h-6v-4ZM7 9v6m10-6v6M10 7h4" },
      { label: "Galpao Virtual", href: "/admin/galpao-virtual", icon: "M4 7h16v12H4V7Zm2-4h12l2 4H4l2-4Z" },
    ],
  },
  {
    label: "CMS",
    items: [
      { label: "Aparencia", href: "/admin#admin-aparencia", icon: "M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h1a8 8 0 0 0 8-8c0-1.1-.9-2-2-2h-7Zm-5 8h.01M9 7h.01M15 7h.01M17 11h.01" },
      { label: "Conteudo", href: "/admin#conteudo", icon: "M5 4h14v16H5V4Zm3 4h8M8 12h8M8 16h5" },
    ],
  },
  {
    label: "Inteligencia",
    items: [
      { label: "Big Data", href: "/admin/inteligencia", icon: "M4 19V9m6 10V5m6 14v-7m4 7H2" },
      { label: "Equipe", href: "/admin/equipe", icon: "M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-1a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 21a6 6 0 0 1 12 0H2Zm12.5 0a5 5 0 0 0-2-4h7a4 4 0 0 1 4 4h-9Z" },
    ],
  },
] as const;

const menuIcon = "M4 6h16M4 12h16M4 18h16";
const logoutIcon = "M10 6H5v12h5M14 8l4 4-4 4M8 12h10";
const externalIcon = "M14 3h7v7M10 14 21 3M21 14v6H4V4h6";

function AdminIcon({ path }: { path: string }) {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24">
      <path d={path} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function isActive(pathname: string, href: string) {
  const path = href.split("#")[0];
  return pathname === path;
}

export function AdminMasterShell({ children }: AdminMasterShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createSupabaseBrowserClient();
    await supabase?.auth.signOut();
    document.cookie = "caruano_session_access_token=; Max-Age=0; path=/";
    router.push("/login");
  }

  const navigation = (
    <nav className="grid gap-4">
      {groups.map((group) => (
        <section key={group.label}>
          <p className="px-3 text-[11px] font-black uppercase text-neutral-500">{group.label}</p>
          <div className="mt-2 grid gap-1">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  className={`flex min-h-11 items-center justify-between rounded-[8px] px-3 text-sm font-black uppercase transition active:scale-[0.98] ${
                    active ? "bg-[var(--primary)] text-neutral-950" : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                  href={item.href}
                  key={item.href}
                >
                  <span className="flex items-center gap-3">
                    <AdminIcon path={item.icon} />
                    {item.label}
                  </span>
                  <span aria-hidden="true">&gt;</span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-5">
      <details className="mb-4 rounded-[10px] bg-white p-3 shadow-sm lg:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-[8px] bg-neutral-950 px-4 text-sm font-black uppercase text-white">
          <span className="flex items-center gap-3">
            <AdminIcon path={menuIcon} />
            Menu Admin 360
          </span>
          <span aria-hidden="true">&gt;</span>
        </summary>
        <div className="mt-3">{navigation}</div>
        <a className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[var(--primary)] px-4 text-sm font-black uppercase text-neutral-950" href="/" target="_blank" rel="noreferrer">
          <AdminIcon path={externalIcon} />
          Visualizar site
        </a>
        <button className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-neutral-950 px-4 text-sm font-black uppercase text-white" onClick={logout} type="button">
          <AdminIcon path={logoutIcon} />
          Sair
        </button>
      </details>

      <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="sticky top-4 hidden max-h-[calc(100vh-2rem)] overflow-y-auto rounded-[12px] bg-white p-4 shadow-sm lg:block">
          <div className="rounded-[10px] bg-neutral-950 p-4 text-white">
            <p className="text-xs font-black uppercase text-[var(--primary)]">Admin 360</p>
            <p className="mt-1 text-lg font-black uppercase">Torre Caruano</p>
          </div>
          <div className="mt-4">{navigation}</div>
          <a className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[var(--primary)] px-4 text-sm font-black uppercase text-neutral-950" href="/" target="_blank" rel="noreferrer">
            <AdminIcon path={externalIcon} />
            Visualizar site
          </a>
          <button className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-neutral-950 px-4 text-sm font-black uppercase text-white" onClick={logout} type="button">
            <AdminIcon path={logoutIcon} />
            Sair
          </button>
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
