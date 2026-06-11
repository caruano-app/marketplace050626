import { DriverVerificationForm } from "@/components/dashboard/driver-verification-form";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/header/site-header";

export const dynamic = "force-dynamic";

export default function DriverVerificationPage() {
  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-5">
        <DriverVerificationForm />
      </main>
      <SiteFooter />
    </div>
  );
}
