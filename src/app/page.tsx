import { SiteHeader } from "@/components/header/site-header";
import { FloatingStoriesWidget } from "@/components/home/floating-stories-widget";
import { HomeSections } from "@/components/home/home-sections";
import { SiteFooter } from "@/components/layout/site-footer";
import { getAdminAppearanceConfig } from "@/lib/data/admin-appearance";
import { getHomeStories } from "@/lib/data/stories";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [floatingStories, appearance] = await Promise.all([
    getHomeStories(),
    getAdminAppearanceConfig(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-2">
        <HomeSections sections={appearance.homeSections} />
      </main>
      <SiteFooter />
      <FloatingStoriesWidget stories={floatingStories} />
    </div>
  );
}
