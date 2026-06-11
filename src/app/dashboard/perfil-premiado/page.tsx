import { redirect } from "next/navigation";
import { PrizeProfileQuiz } from "@/components/dashboard/prize-profile-quiz";
import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getServerSessionClient } from "@/lib/auth/server-session";
import { getIntelligenceProfile } from "@/lib/data/management";

export const dynamic = "force-dynamic";

export default async function PrizeProfilePage() {
  const session = await getServerSessionClient();

  if (!session) {
    redirect("/login?next=/dashboard/perfil-premiado");
  }

  const profile = await getIntelligenceProfile(session.supabase, session.user.id).catch(() => null);

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-5 pb-24">
        <PrizeProfileQuiz initialProfile={profile} />
      </main>
      <SiteFooter />
    </div>
  );
}
