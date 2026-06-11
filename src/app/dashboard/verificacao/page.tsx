import { IdentityVerificationForm } from "@/components/dashboard/identity-verification-form";
import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const dynamic = "force-dynamic";

export default function VerificationPage() {
  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-5">
        <IdentityVerificationForm />
      </main>
      <SiteFooter />
    </div>
  );
}
