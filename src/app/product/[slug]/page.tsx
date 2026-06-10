import Image from "next/image";
import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProductCard } from "@/components/product/product-card";
import { ProductDetailClient } from "@/components/product/product-detail-client";
import { TrackableQrCode } from "@/components/qrcode/trackable-qr-code";
import { getProductDetail, type WholesalePriceRule } from "@/lib/data/product-detail";
import { getFeaturedProducts } from "@/lib/data/products";
import type { CategoriaResumo, LojistaResumo, ProdutoVitrine, SubcategoriaResumo } from "@/types/database";

export const dynamic = "force-dynamic";

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

function getStoreSlug(product: ProdutoVitrine) {
  return asSingle<LojistaResumo>(product.lojistas)?.slug || "loja-caruano";
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

function PlayBadge() {
  return (
    <span className="absolute inset-0 grid place-items-center bg-black/20" aria-hidden="true">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-[#ffd700] text-neutral-950 shadow-lg">
        <span className="ml-1 h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-neutral-950" />
      </span>
    </span>
  );
}

function ProductGallery({ product }: { product: ProdutoVitrine }) {
  const images = (product.imagens_url || []).slice(0, 5);
  const mainImage = images[0];
  const mediaItems = [
    ...images.map((image) => ({ type: "image" as const, src: image })),
    ...(product.video_url ? [{ type: "video" as const, src: product.video_url }] : []),
  ].slice(0, 6);

  return (
    <div>
      {mediaItems.length ? (
        <div className="mb-4 flex snap-x snap-mandatory gap-3 overflow-x-auto md:hidden">
          {mediaItems.map((item, index) => (
            <div className="relative h-[360px] min-w-full snap-center overflow-hidden rounded-[8px] border border-neutral-300 bg-neutral-200" key={`${item.type}-${item.src}-${index}`}>
              {item.type === "image" ? (
                <Image
                  alt={`${product.nome_produto} ${index + 1}`}
                  blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                  className="object-cover"
                  fill
                  placeholder="blur"
                  sizes="100vw"
                  src={item.src}
                />
              ) : (
                <video className="h-full w-full object-cover" controls loop muted playsInline poster={mainImage || undefined} preload="none">
                  <source src={item.src} />
                </video>
              )}
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
          product.video_url ? (
            <video className="h-full w-full object-cover" controls loop muted playsInline preload="none">
              <source src={product.video_url} />
            </video>
          ) : (
            <PlaceholderImage className="h-full w-full" label="Imagem ou video do produto 700x500 pixel" />
          )
        )}
      </div>

      <div className="mt-4 flex max-w-[700px] gap-4 overflow-x-auto md:grid md:grid-cols-6 md:overflow-visible">
        {mediaItems.map((item, index) => (
          <div className="relative h-[120px] min-w-[150px] overflow-hidden rounded-[4px] border border-neutral-300 bg-neutral-100 md:h-[120px] md:min-w-0" key={`thumb-${item.type}-${item.src}-${index}`}>
            {item.type === "image" ? (
              <Image
                alt={`${product.nome_produto} ${index + 1}`}
                blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                className="object-cover"
                fill
                placeholder="blur"
                sizes="160px"
                src={item.src}
              />
            ) : (
              <>
                {mainImage ? (
                  <Image
                    alt={`Video de ${product.nome_produto}`}
                    blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                    className="object-cover"
                    fill
                    placeholder="blur"
                    sizes="160px"
                    src={mainImage}
                  />
                ) : (
                  <div className="h-full w-full bg-neutral-300" />
                )}
                <PlayBadge />
              </>
            )}
          </div>
        ))}
        {!mediaItems.length ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div className="relative h-[120px] min-w-[150px] overflow-hidden rounded-[4px] border border-neutral-300 bg-neutral-100 md:h-[120px] md:min-w-0" key={`placeholder-${index}`}>
              <PlaceholderImage className="h-full w-full" label="Imagem ou video do produto 160x150 pixel" />
            </div>
          ))
        ) : null}
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
  const depth = dimensions.P ?? dimensions.C ?? 0;

  return (
    <details className="rounded-[8px] border border-neutral-400 bg-[#fffbd1] p-5">
      <summary className="cursor-pointer text-2xl font-black uppercase text-neutral-950">Dimensoes do produto +</summary>
      <div className="mt-4 grid grid-cols-4 gap-3 text-sm font-bold text-neutral-700">
        <span>Largura: {dimensions.L ?? 0} cm</span>
        <span>Altura: {dimensions.A ?? 0} cm</span>
        <span>Profundidade: {depth} cm</span>
        <span>Peso: {product.peso_kg ?? 0} kg</span>
      </div>
    </details>
  );
}

function flattenSpecifications(value: Record<string, unknown> | null | undefined) {
  if (!value) return [];

  const rows: Array<[string, string]> = [];

  Object.entries(value).forEach(([key, entry]) => {
    if (entry === null || entry === undefined || entry === "") return;

    if (typeof entry === "object" && !Array.isArray(entry)) {
      Object.entries(entry as Record<string, unknown>).forEach(([childKey, childValue]) => {
        if (childValue !== null && childValue !== undefined && childValue !== "") {
          rows.push([childKey, String(childValue)]);
        }
      });
      return;
    }

    rows.push([key, String(entry)]);
  });

  return rows;
}

function labelize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isPremiumPartner(product: ProdutoVitrine) {
  const specs = product.especificacoes_tecnicas || {};
  const partnerStore = specs.partner_store;
  const partnerFlags = specs.parceiro_premium;

  if (typeof partnerFlags === "boolean") return partnerFlags;
  if (typeof partnerStore === "object" && partnerStore && "premium" in partnerStore) {
    return Boolean((partnerStore as { premium?: unknown }).premium);
  }

  return false;
}

function TechnicalSpecifications({ product }: { product: ProdutoVitrine }) {
  const rows = flattenSpecifications(product.especificacoes_tecnicas);

  if (!rows.length) {
    return null;
  }

  return (
    <details className="rounded-[8px] border border-neutral-400 bg-white p-5" open>
      <summary className="cursor-pointer text-2xl font-black uppercase text-neutral-950">Especificacoes tecnicas +</summary>
      <div className="mt-4 overflow-hidden rounded-[8px] border border-neutral-200">
        {rows.map(([key, value], index) => (
          <div className={`grid grid-cols-[150px_1fr] gap-3 px-3 py-2 text-sm ${index % 2 ? "bg-white" : "bg-neutral-50"}`} key={`${key}-${index}`}>
            <span className="font-black uppercase text-neutral-700">{labelize(key)}</span>
            <span className="font-bold text-neutral-800">{value}</span>
          </div>
        ))}
      </div>
    </details>
  );
}

function WholesalePriceTable({ pricing, retailPrice, unit }: { pricing: WholesalePriceRule[]; retailPrice: number; unit?: string | null }) {
  if (!pricing.length) {
    return null;
  }

  const firstRule = pricing[0];
  const retailLimit = Math.max(Number(firstRule.quantidade_minima || 1) - 1, 1);

  return (
    <section className="rounded-[8px] border border-[#f6b900] bg-[#fff8d6] p-4">
      <h2 className="text-lg font-black uppercase text-neutral-950">Tabela de precos</h2>
      <div className="mt-3 overflow-hidden rounded-[8px] border border-[#f6b900] bg-white">
        <div className="grid grid-cols-[1fr_150px] gap-3 bg-[#ffd700] px-3 py-2 text-sm font-black uppercase text-neutral-950">
          <span>Quantidade</span>
          <span>Preco</span>
        </div>
        <div className="grid grid-cols-[1fr_150px] gap-3 px-3 py-2 text-sm font-bold text-neutral-800">
          <span>1 a {retailLimit} {unit || "UN"}</span>
          <span>{formatPrice(retailPrice)}</span>
        </div>
        {pricing.map((rule) => (
          <div className="grid grid-cols-[1fr_150px] gap-3 border-t border-neutral-200 px-3 py-2 text-sm font-bold text-neutral-800" key={`${rule.quantidade_minima}-${rule.preco_unitario_atacado}`}>
            <span>Acima de {rule.quantidade_minima} {unit || "UN"}</span>
            <span>{formatPrice(Number(rule.preco_unitario_atacado || 0))}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [{ product, variations, wholesalePricing }, relatedProducts] = await Promise.all([
    getProductDetail(slug),
    getFeaturedProducts(),
  ]);

  const subcategory = getSubcategory(product);
  const category = getCategory(subcategory);
  const storeName = getStoreName(product);
  const storeSlug = getStoreSlug(product);
  const premiumPartner = isPremiumPartner(product);

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
              <p className="text-5xl font-black text-[#f58220]">
                {formatPrice(product.preco_base_varejo)}
                {product.unidade_medida ? <span className="ml-2 text-xl text-neutral-600">/{product.unidade_medida}</span> : null}
              </p>
              <a className="mt-3 inline-flex min-h-11 flex-wrap items-center gap-2 rounded-[8px] border border-[#f6b900] bg-[#fff8d6] px-4 text-sm font-black uppercase text-neutral-950" href={`/loja/${storeSlug}`}>
                <span>Vendido e entregue por: {product.vendido_e_entregue_por || storeName}</span>
                {premiumPartner ? (
                  <span className="rounded-full bg-neutral-950 px-2 py-1 text-[11px] text-[#FFD700]">Verificado</span>
                ) : null}
              </a>
            </div>

            <p className="max-w-[600px] text-xl leading-relaxed text-neutral-700">
              {product.descricao_completa || "Breve descricao do produto descricao do produto descricao do produto."}
            </p>

            <WholesalePriceTable pricing={wholesalePricing} retailPrice={Number(product.preco_base_varejo || 0)} unit={product.unidade_medida} />

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
            <TechnicalSpecifications product={product} />
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
