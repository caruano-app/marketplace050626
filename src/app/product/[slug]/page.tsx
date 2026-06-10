import Image from "next/image";
import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProductCard } from "@/components/product/product-card";
import { ProductDetailClient } from "@/components/product/product-detail-client";
import { TrackableQrCode } from "@/components/qrcode/trackable-qr-code";
import { getProductDetail } from "@/lib/data/product-detail";
import { getFeaturedProducts } from "@/lib/data/products";
import type { CategoriaResumo, LojistaResumo, ProdutoVitrine, SubcategoriaResumo } from "@/types/database";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function asSingle<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

function getStoreName(product: ProdutoVitrine) {
  return asSingle<LojistaResumo>(product.lojistas)?.nome_fantasia || "Howem";
}

function getSubcategory(product: ProdutoVitrine) {
  return asSingle<SubcategoriaResumo>(product.subcategorias_mestre);
}

function getCategory(subcategory: SubcategoriaResumo | null) {
  return asSingle<CategoriaResumo>(subcategory?.categorias_mestre) || {
    nome_categoria: "Moda Masculina",
    slug_categoria: "moda-masculina",
  };
}

function PlaceholderImage({ label, className }: { label: string; className: string }) {
  return (
    <div className={`grid place-items-center rounded-[6px] border border-neutral-300 bg-neutral-200 ${className}`}>
      <div className="text-center text-neutral-500">
        <div className="mx-auto mb-5 grid h-24 w-32 place-items-center rounded-[12px] bg-neutral-400 text-4xl font-black text-white">IMG</div>
        <p className="text-xl font-black uppercase leading-tight">{label}</p>
      </div>
    </div>
  );
}

function ProductGallery({ product }: { product: ProdutoVitrine }) {
  const images = product.imagens_url || [];
  const mainImage = images[0];
  const thumbnails = Array.from({ length: 4 }, (_, index) => images[index + 1] || images[0] || null);
  const swipeImages = images.length ? images.slice(0, 5) : [];

  return (
    <div>
      {swipeImages.length ? (
        <div className="mb-4 flex snap-x snap-mandatory gap-3 overflow-x-auto md:hidden">
          {swipeImages.map((image, index) => (
            <div className="relative h-[360px] min-w-full snap-center overflow-hidden rounded-[8px] border border-neutral-300 bg-neutral-200" key={`${image}-${index}`}>
              <Image
                alt={`${product.nome_produto} ${index + 1}`}
                blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                className="object-cover"
                fill
                placeholder="blur"
                sizes="100vw"
                src={image}
              />
            </div>
          ))}
        </div>
      ) : null}

      <div className="relative h-[360px] w-full max-w-[700px] overflow-hidden rounded-[8px] border border-neutral-300 bg-neutral-200 md:h-[500px]">
        {mainImage ? (
          <Image
            alt={product.nome_produto}
            blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
            className="object-cover"
            fill
            placeholder="blur"
            priority
            sizes="700px"
            src={mainImage}
          />
        ) : (
          <PlaceholderImage className="h-full w-full" label="Imagem ou video do produto 700x500 pixel" />
        )}
      </div>

      <div className="mt-4 flex max-w-[700px] gap-4 overflow-x-auto md:grid md:grid-cols-4 md:overflow-visible">
        {thumbnails.map((thumbnail, index) => (
          <div className="relative h-[120px] min-w-[150px] overflow-hidden rounded-[4px] border border-neutral-300 bg-neutral-100 md:h-[150px] md:min-w-0" key={`${thumbnail}-${index}`}>
            {thumbnail ? (
              <Image
                alt={`${product.nome_produto} ${index + 1}`}
                blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                className="object-cover"
                fill
                placeholder="blur"
                sizes="160px"
                src={thumbnail}
              />
            ) : (
              <PlaceholderImage className="h-full w-full" label="Imagem ou video do produto 160x150 pixel" />
            )}
          </div>
        ))}
      </div>

      <details className="mt-4 max-w-[700px] rounded-[8px] border border-neutral-400 bg-[#fffbd1] p-5" open>
        <summary className="cursor-pointer text-2xl font-black uppercase text-neutral-950">Descricao completa do produto +</summary>
        <p className="mt-4 text-base leading-relaxed text-neutral-700">{product.descricao_completa || "Descricao completa do produto indisponivel."}</p>
      </details>
    </div>
  );
}

function DimensionsAccordion({ product }: { product: ProdutoVitrine }) {
  const dimensions = product.dimensoes_cm || {};

  return (
    <details className="rounded-[8px] border border-neutral-400 bg-[#fffbd1] p-5">
      <summary className="cursor-pointer text-2xl font-black uppercase text-neutral-950">Dimensoes do produto +</summary>
      <div className="mt-4 grid grid-cols-4 gap-3 text-sm font-bold text-neutral-700">
        <span>Largura: {dimensions.L ?? 0} cm</span>
        <span>Altura: {dimensions.A ?? 0} cm</span>
        <span>Comprimento: {dimensions.C ?? 0} cm</span>
        <span>Peso: {product.peso_kg ?? 0} kg</span>
      </div>
    </details>
  );
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [{ product, variations }, relatedProducts] = await Promise.all([
    getProductDetail(slug),
    getFeaturedProducts(),
  ]);

  const subcategory = getSubcategory(product);
  const category = getCategory(subcategory);
  const storeName = getStoreName(product);

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <main className="mx-auto max-w-[1412px] px-4 py-4">
        <nav className="mb-5 text-xl font-bold text-neutral-700">
          <a href="/">Home</a> &gt; <a href={`/categorias/${category.slug_categoria}`}>{category.nome_categoria}</a> &gt;{" "}
          <span>{subcategory?.nome_subcategoria || product.nome_produto}</span>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[700px_1fr]">
          <ProductGallery product={product} />

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {["Condicao: Novo", "Pronta Entrega", "Frete: Gratis", "Retirada na loja"].map((label) => (
                <span className="rounded-[4px] bg-[#f6b900] px-3 py-1 text-sm font-black text-neutral-950" key={label}>
                  {label}
                </span>
              ))}
            </div>

            <h1 className="text-4xl font-black uppercase leading-tight text-neutral-950">{product.nome_produto}</h1>
            <div className="flex flex-wrap items-center gap-8 text-lg font-bold text-neutral-700">
              <span>SKU {product.codigo_referencia_sku}</span>
              <span>4.8 *****</span>
            </div>
            <div className="flex gap-10 text-base font-bold text-neutral-700">
              <span>Marca: {storeName}</span>
              <span>Categoria: {category.nome_categoria}</span>
            </div>

            <div>
              <p className="text-lg font-bold text-neutral-500 line-through">R$ 69,90</p>
              <p className="text-5xl font-black text-[#f58220]">{formatPrice(product.preco_base_varejo)}</p>
            </div>

            <p className="max-w-[600px] text-xl leading-relaxed text-neutral-700">
              {product.descricao_completa || "Breve descricao do produto descricao do produto descricao do produto."}
            </p>

            <ProductDetailClient
              categoryName={category.nome_categoria}
              product={product}
              storeName={storeName}
              variations={variations}
            />

            <TrackableQrCode
              fileName={`qr-produto-${product.codigo_referencia_sku}`}
              title="Compra Rapida"
              url={`https://caruano.com/product/${product.id}`}
            />

            <DimensionsAccordion product={product} />
          </div>
        </section>

        <section className="mt-8 rounded-[6px] border border-neutral-300 bg-white p-2">
          <div className="mb-2 flex h-8 items-center gap-4">
            <h2 className="text-2xl font-black text-neutral-950">Produtos Relacionados</h2>
            <p className="hidden flex-1 text-center text-sm font-black uppercase text-neutral-500 md:block">
              Area para adicionar os cards dos produtos 1412x482 pixel
            </p>
            <a className="text-lg font-black text-neutral-950" href="/produtos">
              Ver todos v
            </a>
          </div>
          <div className="caruano-product-grid pb-1">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
