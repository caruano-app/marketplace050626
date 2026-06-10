import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { QrScannerPanel } from "@/components/smart-tools/qr-scanner-panel";

export default function MerchantScannerPage() {
  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-5">
        <QrScannerPanel />
      </main>
      <SiteFooter />
    </div>
  );
}
