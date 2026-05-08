"use client";

import dynamic from "next/dynamic";
import {
  Navbar,
  Hero,
  Problem,
  HowItWorks,
  Platform,
  WhyTAIR,
  Team,
  Contact,
  Footer,
} from "@/components/sections";

const LenisProvider = dynamic(
  () => import("@/providers/LenisProvider").then((m) => m.LenisProvider),
  { ssr: false }
);

const LoadReveal = dynamic(
  () => import("@/components/loader/LoadReveal").then((m) => m.LoadReveal),
  { ssr: false }
);

export default function Home() {
  return (
    <LenisProvider>
      <LoadReveal>
        <Navbar />
        <main>
          <Hero />
          <div className="border-t border-divider" />
          <Problem />
          <div className="border-t border-divider" />
          <HowItWorks />
          <div className="border-t border-divider" />
          <Platform />
          <div className="border-t border-divider" />
          <WhyTAIR />
          <div className="border-t border-divider" />
          <Team />
          <div className="border-t border-divider" />
          <Contact />
        </main>
        <Footer />
      </LoadReveal>
    </LenisProvider>
  );
}
