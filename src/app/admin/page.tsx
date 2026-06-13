import nextDynamic from "next/dynamic";
import { AdminAppearancePanel } from "@/components/admin/admin-appearance-panel";
import { AdminCatalogPanel } from "@/components/admin/admin-catalog-panel";
import { AdminContentPanel } from "@/components/admin/admin-content-panel";
import { AdminMasterShell } from "@/components/admin/admin-master-shell";
import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getAdminAppearanceConfig } from "@/lib/data/admin-appearance";
import { getAdminCatalogData } from "@/lib/data/admin-catalog";
import { getAdminDashboardData } from "@/lib/data/admin-dashboard";

export const dynamic = "force-dynamic";

const AdminControlTower = nextDynamic(
  () => import("@/components/admin/admin-control-tower").then((mod) => mod.AdminControlTower),
  {
    loading: () => (
      <div className="grid gap-4">
        <div className="dashboard-skeleton-card caruano-skeleton" />
        <div className="dashboard-skeleton-card caruano-skeleton" />
        <div className="dashboard-skeleton-card caruano-skeleton" />
      </div>
    ),
  }
);

export default async function AdminPage() {
  const { metrics, leads, categorySuggestions, reviews, stores, partnerStores, drivers, products, logs, ecosystem } = await getAdminDashboardData();
  const appearance = await getAdminAppearanceConfig();
  const catalog = await getAdminCatalogData();

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <AdminMasterShell>
        <main className="grid gap-4 pb-24">
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
            partnerStores={partnerStores}
          />
          <AdminAppearancePanel initialConfig={appearance} />
          <AdminCatalogPanel categories={catalog.categories} subcategories={catalog.subcategories} />
          <AdminContentPanel initialFooter={appearance.footer} />
        </main>
      </AdminMasterShell>
      <SiteFooter />
    </div>
  );
}
