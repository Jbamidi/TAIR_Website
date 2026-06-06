import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSection } from "@/components/layout/PageSection";
import { CTABanner } from "@/components/layout/CTABanner";
import { Team } from "@/components/sections/Team";
import { MonoText } from "@/components/ui";

export const metadata: Metadata = {
  title: "About — TAIR",
  description:
    "TAIR Systems builds autonomous indoor intelligence for cold chain, pharma, and 3PL warehouses.",
};

const values = [
  {
    label: "Focus",
    value: "Cold chain, pharma, 3PL",
  },
  {
    label: "Approach",
    value: "Lights-out autonomous scans",
  },
  {
    label: "Outcome",
    value: "WMS-corrected inventory",
  },
];

export default function AboutPage() {
  return (
    <SiteShell>
      <PageSection className="pb-8">
        <PageHeader
          eyebrow="// about tair"
          title="Autonomous intelligence for indoor logistics"
          description="TAIR Systems is building the operating system for warehouse inventory accuracy. We combine autonomous drones, multi-sensor vision, and AI agents to give operators a corrected view of their floor — every morning."
          align="center"
          className="max-w-3xl"
        />
      </PageSection>

      <PageSection bordered className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {values.map((item) => (
            <div
              key={item.label}
              className="bg-surface border border-border rounded-xl p-6 text-center hover:border-accent/20 transition-colors duration-200"
            >
              <MonoText className="text-muted text-xs uppercase tracking-wider">
                {item.label}
              </MonoText>
              <p className="mt-3 text-foreground font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </PageSection>

      <Team />

      <PageSection bordered>
        <CTABanner
          title="Want to work with us?"
          description="Whether you're an operator, investor, or potential partner — we'd love to hear from you."
          buttonLabel="Get in touch"
          buttonHref="/contact"
        />
      </PageSection>
    </SiteShell>
  );
}
