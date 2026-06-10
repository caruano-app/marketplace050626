import { SiteHeader } from "@/components/header/site-header";
import { DailyOffers } from "@/components/home/daily-offers";
import { FairOffers } from "@/components/home/fair-offers";
import { FeaturedProducts } from "@/components/home/featured-products";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { FloatingStoriesWidget } from "@/components/home/floating-stories-widget";
import { HeroBanner } from "@/components/home/hero-banner";
import { HighlightBanner } from "@/components/home/highlight-banner";
import { LivesShopSection } from "@/components/home/lives-shop-section";
import { MultiCardOffers } from "@/components/home/multi-card-offers";
import { StoriesSection } from "@/components/home/stories-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { getHomeStories } from "@/lib/data/stories";

export default async function Home() {
  const floatingStories = await getHomeStories();

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-2">
        <HeroBanner />
        <FeaturedProducts />
        <MultiCardOffers />
        <FeaturedCategories />
        <DailyOffers />
        <HighlightBanner />
        <StoriesSection />
        <FairOffers />
        <LivesShopSection />
      </main>
      <SiteFooter />
      <FloatingStoriesWidget stories={floatingStories} />
    </div>
  );
}
