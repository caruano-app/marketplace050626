import { SiteHeader } from "@/components/header/site-header";
import { CheckoutClient } from "@/components/checkout/checkout-client";
import { SiteFooter } from "@/components/layout/site-footer";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-8">
        <CheckoutClient />
      </main>
      <SiteFooter />
    </div>
  );
}
