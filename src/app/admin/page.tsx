import nextDynamic from "next/dynamic";
import { AdminAppearancePanel } from "@/components/admin/admin-appearance-panel";
import { AdminMasterShell } from "@/components/admin/admin-master-shell";
import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getAdminAppearanceConfig } from "@/lib/data/admin-appearance";
import { getAdminDashboardData } from "@/lib/data/admin-dashboard";

export const dynamic = "force-dynamic";

const AdminControlTower = nextDynamic(() => import("@/components/admin/admin-control-tower").then((mod) => mod.AdminControlTower), {
  loading: () => (
    <div className="grid gap-4">
      <div className="dashboard-skeleton-card caruano-skeleton" />
      <div className="dashboard-skeleton-card caruano-skeleton" />
      <div className="dashboard-skeleton-card caruano-skeleton" />
    </div>
  ),
});

export default async function AdminPage() {
  const { metrics, leads, categorySuggestions, reviews, stores, drivers, products, logs, ecosystem } = await getAdminDashboardData();
  const appearance = await getAdminAppearanceConfig();

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <AdminMasterShell>
        <main className="grid gap-4 pb-24">
          <AdminAppearancePanel initialPrimaryColor={appearance.primaryColor} />
          <AdminControlTower
            categorySuggestions={categorySuggestions}
            leads={leads}
            logs={logs}
            metrics={metrics}
            products={products}
            reviews={reviews}
            drivers={drivers}
            ecosystem={ecosystem}
            stores={stores}
          />
        </main>
      </AdminMasterShell>
      <SiteFooter />
    </div>
  );
}
