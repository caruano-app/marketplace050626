import { ProductUniversalForm } from "@/components/dashboard/product-universal-form";
import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getAllCategories } from "@/lib/data/categories";

export default async function NewMerchantProductPage() {
  const categories = await getAllCategories();

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-5 pb-24">
        <ProductUniversalForm categories={categories} />
      </main>
      <SiteFooter />
    </div>
  );
}
