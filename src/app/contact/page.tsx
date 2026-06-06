import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSection } from "@/components/layout/PageSection";
import { ContactForm } from "@/components/sections/ContactForm";
import { getProduct } from "@/lib/products";

export const metadata: Metadata = {
  title: "Contact — TAIR",
  description:
    "Get in touch with TAIR Systems. Request a demo or ask about our warehouse intelligence products.",
};

interface ContactPageProps {
  searchParams: { product?: string };
}

export default function ContactPage({ searchParams }: ContactPageProps) {
  const productSlug = searchParams.product;
  const product = productSlug ? getProduct(productSlug) : undefined;
  const defaultProductInterest = product?.name ?? productSlug ?? "";

  return (
    <SiteShell>
      <PageSection className="pb-8">
        <PageHeader
          eyebrow="// contact"
          title="Talk to us"
          description="Tell us about your warehouse, which products you're interested in, and how we can help. We'll get back to you within 24 hours."
          align="center"
          className="max-w-3xl"
        />
      </PageSection>

      <PageSection bordered className="pt-0">
        <ContactForm
          defaultProductInterest={defaultProductInterest}
          showIntro={false}
          idPrefix="page-contact"
        />
      </PageSection>
    </SiteShell>
  );
}
