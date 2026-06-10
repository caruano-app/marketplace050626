import { SiteHeader } from "@/components/header/site-header";
import { MultiCardOffers } from "@/components/home/multi-card-offers";
import { SiteFooter } from "@/components/layout/site-footer";
import { StoreHeader } from "@/components/store/store-header";
import { StoreProductSection } from "@/components/store/store-product-section";
import { StoreSidebar } from "@/components/store/store-sidebar";
import { StoreStoriesSection } from "@/components/store/store-stories-section";
import { StoreTabs } from "@/components/store/store-tabs";
import { getFeaturedCategories } from "@/lib/data/categories";
import { getStoriesByStore } from "@/lib/data/stories";
import { getStoreProfile } from "@/lib/data/store-profile";

export const dynamic = "force-dynamic";

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [{ store, products }, categories] = await Promise.all([
    getStoreProfile(slug),
    getFeaturedCategories(),
  ]);
  const stories = await getStoriesByStore(store.id);
  const highlightedProducts = products.slice(0, 4);
  const noveltyProducts = products.length >= 5 ? products : [...products, ...products].slice(0, 5);

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <main className="mx-auto max-w-[1412px] px-4 py-3">
        <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
          <StoreSidebar categories={categories} store={store} />

          <div>
            <StoreHeader store={store} />
            <StoreTabs />
            <StoreProductSection products={highlightedProducts} title="Produto em destaque" />
            <StoreProductSection products={highlightedProducts} title="Produto em destaque" />
          </div>
        </div>

        <StoreProductSection
          note="Area para adicionar os cards dos produtos 1412x482 pixel"
          products={noveltyProducts}
          title="Novidades (bloco dos lojistas)"
        />
        <StoreStoriesSection stories={stories} />
        <MultiCardOffers />
      </main>

      <SiteFooter />
    </div>
  );
}
