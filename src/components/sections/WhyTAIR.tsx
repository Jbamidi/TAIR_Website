"use client";

import { motion } from "framer-motion";
import { Zap, Radio, Plug } from "lucide-react";
import { Card, MonoText } from "@/components/ui";
import { fadeInUp, staggerContainer, viewportOptions } from "@/lib/animations";
import type { LucideIcon } from "lucide-react";

interface Differentiator {
  icon: LucideIcon;
  title: string;
  description: string;
}

const differentiators: Differentiator[] = [
  {
    icon: Zap,
    title: "Lights-out autonomous",
    description:
      "No human operator per aisle. The drone takes off, scans, and docks — every night, fully unattended.",
  },
  {
    icon: Radio,
    title: "RFID through packaging",
    description:
      "Reads tags through cardboard and condensation. Works in cold storage where camera-only systems fail.",
  },
  {
    icon: Plug,
    title: "WMS-native integration",
    description:
      "Corrected inventory pushes directly into Extensiv and other WMS platforms. No workflow changes for your team.",
  },
];

export function WhyTAIR() {
  return (
    <section className="py-32 px-6">
      <motion.div
        className="max-w-6xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOptions}
      >
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <MonoText className="text-secondary text-xs uppercase tracking-widest">
            // differentiators
          </MonoText>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            Why TAIR
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {differentiators.map((d) => {
            const Icon = d.icon;
            return (
              <motion.div key={d.title} variants={fadeInUp}>
                <Card glowOnHover className="h-full">
                  <Icon
                    size={28}
                    className="text-accent mb-4"
                    strokeWidth={1.5}
                  />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {d.title}
                  </h3>
                  <p className="text-sm text-secondary leading-relaxed">
                    {d.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
