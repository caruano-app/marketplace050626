import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DriverDashboardApp } from "@/components/dashboard/driver-dashboard-app";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/header/site-header";
import { createSupabaseRequestClient } from "@/lib/auth/session";
import { getDriverDashboard } from "@/lib/data/driver-dashboard";

export const dynamic = "force-dynamic";

function getTokenFromCookieStore(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const appCookie = cookieStore.get("caruano_session_access_token")?.value;

  if (appCookie) return appCookie;

  const authCookie = cookieStore.getAll().find((cookie) => cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token"));

  if (!authCookie?.value) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(authCookie.value));
    return parsed?.access_token || parsed?.[0] || null;
  } catch {
    return null;
  }
}

export default async function DriverDashboardPage() {
  const cookieStore = await cookies();
  const token = getTokenFromCookieStore(cookieStore);

  if (!token) {
    redirect("/login?next=/dashboard/entregador");
  }

  const supabase = createSupabaseRequestClient(token);

  if (!supabase) {
    redirect("/login?next=/dashboard/entregador");
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(token);

  if (authError || !authData.user) {
    redirect("/login?next=/dashboard/entregador");
  }

  const data = await getDriverDashboard(authData.user.id);

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-5">
        <DriverDashboardApp {...data} />
      </main>
      <SiteFooter />
    </div>
  );
}
