import Image from "next/image";
import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { VerifiedBadge } from "@/components/common/verified-badge";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { PartnerBadge } from "@/components/common/partner-badge";
import { ProductDetailClient } from "@/components/product/product-detail-client";
import { TrackableQrCode } from "@/components/qrcode/trackable-qr-code";
import { getProductDetail, type ProductCustomerReview, type WholesalePriceRule } from "@/lib/data/product-detail";
import { getFeaturedProducts } from "@/lib/data/products";
import { isIdentityVerified } from "@/lib/data/verification";
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

function isProductStoreVerified(product: ProdutoVitrine) {
  return isIdentityVerified(asSingle<LojistaResumo>(product.lojistas)?.usuarios);
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

function RatingStars({ value, size = 20 }: { value: number; size?: number }) {
  const rounded = Math.round(value);

  return (
    <span className="inline-flex items-center gap-1" aria-label={`Nota ${value.toFixed(1)} de 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          aria-hidden="true"
          className={star <= rounded ? "fill-[#FFC300] text-[#FFC300]" : "fill-none text-neutral-400"}
          height={size}
          key={star}
          viewBox="0 0 24 24"
          width={size}
        >
          <path d="m12 2.5 2.95 6 6.62.96-4.79 4.67 1.13 6.59L12 17.62l-5.91 3.1 1.13-6.59-4.79-4.67 6.62-.96L12 2.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      ))}
    </span>
  );
}

function maskCustomerName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Cliente Caruano";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1].slice(0, 1)}.`;
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

function CustomerReviews({ reviews, average }: { reviews: ProductCustomerReview[]; average: number }) {
  return (
    <section className="rounded-[8px] border border-neutral-300 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase text-[#f58220]">Prova social</p>
          <h2 className="text-2xl font-black uppercase text-neutral-950">Avaliacoes dos clientes</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-[#fff8d6] px-4 py-2 text-sm font-black text-neutral-950">
          <RatingStars value={average || 0} size={18} />
          <span>{average ? average.toFixed(1) : "Sem nota"}</span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {reviews.map((review) => (
          <article className="rounded-[8px] border border-neutral-200 bg-neutral-50 p-4" key={review.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-black uppercase text-neutral-950">{maskCustomerName(review.customerName)}</p>
              <RatingStars value={review.nota} size={18} />
            </div>
            <p className="mt-3 text-sm font-bold leading-relaxed text-neutral-700">{review.comentario || "Cliente recomendou este produto."}</p>
          </article>
        ))}

        {!reviews.length ? (
          <p className="rounded-[8px] border border-dashed border-neutral-300 p-5 text-center text-sm font-black uppercase text-neutral-500">
            Este produto ainda nao possui avaliacoes aprovadas.
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [{ product, variations, wholesalePricing, reviews, reviewAverage }, relatedProducts] = await Promise.all([
    getProductDetail(slug),
    getFeaturedProducts(),
  ]);

  const subcategory = getSubcategory(product);
  const category = getCategory(subcategory);
  const storeName = getStoreName(product);
  const store = Array.isArray(product.lojistas) ? product.lojistas[0] : product.lojistas;
  const sellerName = product.vendido_e_entregue_por || storeName;
  const storeSlug = getStoreSlug(product);
  const premiumPartner = isPremiumPartner(product);

  if (!isProductStoreVerified(product)) {
    return (
      <div className="min-h-screen bg-white">
        <SiteHeader />
        <main className="mx-auto max-w-[1412px] px-4 py-10">
          <section className="rounded-[8px] border border-neutral-200 bg-neutral-100 p-6 text-center">
            <p className="text-sm font-black uppercase text-orange-600">Produto indisponivel</p>
            <h1 className="mt-2 text-3xl font-black uppercase text-neutral-950">Esta loja ainda esta em verificacao</h1>
            <p className="mx-auto mt-3 max-w-2xl text-base font-bold text-neutral-600">
              Para proteger compradores e lojistas, produtos so aparecem quando a identidade do vendedor e aprovada pelo Caruano.
            </p>
            <a className="mt-5 inline-grid min-h-11 place-items-center rounded-[6px] bg-[#ffd700] px-5 text-sm font-black uppercase text-neutral-950" href="/">
              Voltar para a home
            </a>
          </section>
        </main>
        <SiteFooter />
      </div>
    );
  }

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
              <span className="flex items-center gap-2">
                {reviewAverage ? reviewAverage.toFixed(1) : "Sem nota"}
                <RatingStars value={reviewAverage || 0} />
              </span>
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
              <Link className="mt-3 inline-flex min-h-11 flex-wrap items-center gap-2 rounded-[8px] border border-[#f6b900] bg-[#fff8d6] px-4 text-sm font-black uppercase text-neutral-950" href={`/loja/${storeSlug}`}>
                <span>Vendido e entregue por: </span>
                <span className="inline-flex min-w-0 items-center gap-1 underline decoration-2 underline-offset-2">
                  <span className="truncate">{sellerName}</span>
                  {store?.is_partner ? <PartnerBadge level={store.partner_level} size="sm" /> : null}
                </span>
                {isProductStoreVerified(product) ? <VerifiedBadge size="lg" label /> : null}
                {premiumPartner ? (
                  <span className="rounded-full bg-neutral-950 px-2 py-1 text-[11px] text-[#FFD700]">Premium</span>
                ) : null}
              </Link>
              {isProductStoreVerified(product) ? (
                <p className="mt-2 text-sm font-bold text-neutral-700">
                  Compre com seguranca: Este vendedor passou por nossa auditoria de documentos.
                </p>
              ) : null}
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
            <CustomerReviews reviews={reviews} average={reviewAverage} />
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

        {isProductStoreVerified(product) ? (
          <section className="mt-6 rounded-[8px] border border-[#FFC300] bg-[#fff8d6] p-4 text-sm font-bold leading-relaxed text-zinc-900">
            <span className="mr-2 inline-grid h-7 w-7 place-items-center rounded-full bg-[#FFC300] text-base font-black text-zinc-900">!</span>
            <strong>Garantia Caruano:</strong> Este lojista e verificado. Se houver qualquer problema com a entrega na excursao, nossa equipe de suporte intervem por voce.
          </section>
        ) : null}
      </main>

      <SiteFooter />
    </div>
  );
}
