import { redirect } from "next/navigation";
import { TeamManagementApp } from "@/components/admin/team-management-app";
import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getServerSessionClient } from "@/lib/auth/server-session";
import { getManagementTeamData } from "@/lib/data/management";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const session = await getServerSessionClient();

  if (!session || session.profile.is_admin !== true) {
    redirect("/login?next=/admin/equipe");
  }

  const scopes = await getManagementTeamData(session.supabase);

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-5 pb-24">
        <TeamManagementApp scopes={scopes} />
      </main>
      <SiteFooter />
    </div>
  );
}
