"use client";

import { motion } from "framer-motion";
import { Radar, Layers, GitCompare, CheckCircle } from "lucide-react";
import { MonoText } from "@/components/ui";
import { fadeInUp, staggerContainer, viewportOptions } from "@/lib/animations";
import type { LucideIcon } from "lucide-react";

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
  mono: string;
}

const steps: Step[] = [
  {
    icon: Radar,
    title: "Scan",
    description:
      "Autonomous drone scans every aisle nightly using LiDAR SLAM navigation. No pilot, no GPS.",
    mono: "01",
  },
  {
    icon: Layers,
    title: "Map",
    description:
      "LiDAR, barcode, and RFID data fuse into a centimeter-accurate digital twin of the facility.",
    mono: "02",
  },
  {
    icon: GitCompare,
    title: "Reconcile",
    description:
      "ML engine compares scan data against WMS records. Every discrepancy is flagged automatically.",
    mono: "03",
  },
  {
    icon: CheckCircle,
    title: "Correct",
    description:
      "Corrected inventory is pushed directly into the WMS before the morning shift arrives.",
    mono: "04",
  },
];

function StepCard({ step, index }: { step: Step; index: number }) {
  const Icon = step.icon;
  return (
    <motion.div variants={fadeInUp} className="relative flex flex-col items-center text-center">
      {/* Connecting dotted line — hidden on mobile, visible on md+ */}
      {index < steps.length - 1 && (
        <div className="hidden md:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-40px)] border-t border-dashed border-border z-0" />
      )}
      {/* Vertical connecting line on mobile */}
      {index < steps.length - 1 && (
        <div className="md:hidden absolute top-[calc(100%)] left-1/2 -translate-x-1/2 h-8 border-l border-dashed border-border z-0" />
      )}

      <div className="relative z-10 w-16 h-16 rounded-xl bg-surface border border-border flex items-center justify-center mb-4">
        <Icon size={24} className="text-accent" strokeWidth={1.5} />
      </div>

      <MonoText className="text-muted text-xs mb-2">{step.mono}</MonoText>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {step.title}
      </h3>
      <p className="text-sm text-secondary max-w-[220px] leading-relaxed">
        {step.description}
      </p>
    </motion.div>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 px-6">
      <motion.div
        className="max-w-6xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOptions}
      >
        <motion.div variants={fadeInUp} className="text-center mb-20">
          <MonoText className="text-muted text-xs uppercase tracking-widest">
            // process
          </MonoText>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            How it works
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {steps.map((step, i) => (
            <StepCard key={step.mono} step={step} index={i} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
