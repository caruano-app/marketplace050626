import type { HomeSectionConfig } from "@/lib/data/admin-appearance";
import { DailyOffers } from "@/components/home/daily-offers";
import { FairOffers } from "@/components/home/fair-offers";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { FeaturedProducts } from "@/components/home/featured-products";
import { HeroBanner } from "@/components/home/hero-banner";
import { HighlightBanner } from "@/components/home/highlight-banner";
import { LivesShopSection } from "@/components/home/lives-shop-section";
import { MultiCardOffers } from "@/components/home/multi-card-offers";
import { StoriesSection } from "@/components/home/stories-section";

type HomeSectionsProps = {
  sections: HomeSectionConfig[];
};

function renderHomeSection(section: HomeSectionConfig) {
  if (!section.enabled) return null;

  switch (section.key) {
    case "hero":
      return <HeroBanner key={section.key} />;
    case "featured":
      return <FeaturedProducts key={section.key} title={section.title} />;
    case "multicards":
      return <MultiCardOffers key={section.key} title={section.title} />;
    case "categories":
      return <FeaturedCategories key={section.key} title={section.title} />;
    case "daily":
      return <DailyOffers key={section.key} title={section.title} />;
    case "highlight":
      return <HighlightBanner key={section.key} title={section.title} />;
    case "stories":
      return <StoriesSection key={section.key} title={section.title} />;
    case "fair":
      return <FairOffers key={section.key} title={section.title} />;
    case "lives":
      return <LivesShopSection key={section.key} title={section.title} />;
    default:
      return null;
  }
}

export function HomeSections({ sections }: HomeSectionsProps) {
  return sections.map(renderHomeSection);
}
