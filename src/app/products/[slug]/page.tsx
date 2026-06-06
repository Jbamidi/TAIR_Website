import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageSection } from "@/components/layout/PageSection";
import { CTABanner } from "@/components/layout/CTABanner";
import { ProductHero } from "@/components/products/ProductHero";
import { ProductDetailSections } from "@/components/products/ProductDetailSections";
import { RelatedProducts } from "@/components/products/RelatedProducts";
import { getProduct, getProductSlugs, products } from "@/lib/products";
import { getRelatedProducts } from "@/lib/product-utils";

interface ProductPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return getProductSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: ProductPageProps): Metadata {
  const product = getProduct(params.slug);
  if (!product) return { title: "Product — TAIR" };

  return {
    title: `${product.name} — TAIR`,
    description: product.summary,
    openGraph: {
      title: `${product.name} — TAIR`,
      description: product.summary,
    },
  };
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const product = getProduct(params.slug);
  if (!product) notFound();

  const related = getRelatedProducts(product, products);

  return (
    <SiteShell>
      <ProductHero product={product} />

      <PageSection>
        <ProductDetailSections product={product} />
      </PageSection>

      <PageSection bordered>
        <RelatedProducts products={related} />
      </PageSection>

      <PageSection bordered>
        <CTABanner
          title={`Interested in ${product.name}?`}
          description="We're not processing orders online yet. Reach out and we'll walk you through a demo tailored to your facility."
          buttonLabel="Request a demo"
          buttonHref={`/contact?product=${product.slug}`}
        />
      </PageSection>
    </SiteShell>
  );
}
