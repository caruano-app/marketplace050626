import { redirect } from "next/navigation";
import { MobilePdvApp } from "@/components/dashboard/mobile-pdv-app";
import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getServerSessionClient } from "@/lib/auth/server-session";

export const dynamic = "force-dynamic";

export default async function MerchantPdvPage() {
  const session = await getServerSessionClient();

  if (!session || session.profile.perfil_principal !== "lojista") {
    redirect("/login?next=/dashboard/lojista/pdv");
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-5 pb-24">
        <MobilePdvApp />
      </main>
      <SiteFooter />
    </div>
  );
}
