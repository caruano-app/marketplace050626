import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-[8px] bg-neutral-200 ${className}`} />;
}

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] space-y-4 px-4 py-5">
        <SkeletonBlock className="h-36 bg-neutral-300" />
        <section className="flex gap-3 overflow-hidden">
          {[0, 1, 2, 3].map((item) => (
            <SkeletonBlock className="h-24 min-w-[190px]" key={item} />
          ))}
        </section>
        {[0, 1, 2].map((section) => (
          <section className="rounded-[8px] bg-white p-4 shadow-sm" key={section}>
            <SkeletonBlock className="h-7 w-56" />
            <div className="mt-3 space-y-3">
              {[0, 1, 2].map((row) => (
                <SkeletonBlock className="h-20" key={row} />
              ))}
            </div>
          </section>
        ))}
      </main>
      <SiteFooter />
    </div>
  );
}
