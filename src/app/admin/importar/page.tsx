import { redirect } from "next/navigation";
import { DistributorStockImportApp } from "@/components/admin/distributor-stock-import-app";
import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { isCaruanoAdmin } from "@/lib/auth/admin";
import { getServerSessionClient } from "@/lib/auth/server-session";

export const dynamic = "force-dynamic";

export default async function AdminImportPage() {
  const session = await getServerSessionClient();

  if (!session || !isCaruanoAdmin(session.profile)) {
    redirect("/login?next=/admin/importar");
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-5 pb-24">
        <DistributorStockImportApp />
      </main>
      <SiteFooter />
    </div>
  );
}
