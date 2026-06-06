import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSection } from "@/components/layout/PageSection";
import { CTABanner } from "@/components/layout/CTABanner";
import { ProductsGrid } from "@/components/products/ProductsGrid";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Products — TAIR",
  description:
    "Explore TAIR's product offerings: digital twin, autonomous scanning, multi-sensor vision, warehouse AI agent, WMS integration, and RFID inventory.",
};

export default function ProductsPage() {
  return (
    <SiteShell>
      <PageSection className="pb-8 md:pb-12">
        <PageHeader
          eyebrow="// products"
          title="Everything you need for autonomous warehouse intelligence"
          description="TAIR is a platform of connected products — deploy what you need today and expand as your operations scale. No transactions on this site; contact us to discuss deployment."
        />
      </PageSection>

      <PageSection bordered className="pt-0">
        <ProductsGrid products={products} />
      </PageSection>

      <PageSection bordered>
        <CTABanner
          title="Not sure which product fits?"
          description="Tell us about your warehouse and we'll recommend the right starting point."
          buttonLabel="Contact us"
          buttonHref="/contact"
        />
      </PageSection>
    </SiteShell>
  );
}
