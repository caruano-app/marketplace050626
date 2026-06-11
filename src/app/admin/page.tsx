import { AdminControlTower } from "@/components/admin/admin-control-tower";
import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getAdminDashboardData } from "@/lib/data/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { metrics, leads, categorySuggestions, reviews, stores, products, logs } = await getAdminDashboardData();

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-5">
        <AdminControlTower
          categorySuggestions={categorySuggestions}
          leads={leads}
          logs={logs}
          metrics={metrics}
          products={products}
          reviews={reviews}
          stores={stores}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
