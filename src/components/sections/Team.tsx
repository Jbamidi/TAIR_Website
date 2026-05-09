"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Card, MonoText } from "@/components/ui";
import { fadeInUp, staggerContainer, viewportOptions } from "@/lib/animations";

export function Team() {
  return (
    <section id="team" className="py-32 px-6">
      <motion.div
        className="max-w-4xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOptions}
      >
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <MonoText className="text-secondary text-xs uppercase tracking-widest">
            // team
          </MonoText>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            Built by engineers
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Founder 1 — Jashwanth */}
          <motion.div variants={fadeInUp}>
            <Card className="h-full">
              <div className="flex items-start gap-5">
                {/* TODO: Replace with actual photo at /team/jashwanth.jpg */}
                <div className="w-16 h-16 rounded-lg bg-surface border border-border flex-shrink-0 flex items-center justify-center overflow-hidden">
                  <img
                    src="/team/jashwanth.jpg"
                    alt="Jashwanth Bamidi"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if photo isn't there yet
                      (e.target as HTMLElement).style.display = 'none';
                      (e.target as HTMLElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <span className="font-mono text-accent text-lg font-bold hidden">
                    JB
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-foreground">
                    Jashwanth Bamidi
                  </h3>
                  <p className="text-sm text-accent font-mono mt-0.5">
                    Co-founder · Hardware
                  </p>
                  <p className="text-xs text-secondary mt-1">
                    Electrical and Computer Engineering, UIUC
                  </p>
                  <p className="text-sm text-secondary mt-3 leading-relaxed">
                    Analog circuits, RISC-V CPU design, FPGA computer vision.
                    Leads PCB design at Eco Illini and Illini EV Concept.
                  </p>
                  <a
                    href="https://www.linkedin.com/in/jashwanthbamidi/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-xs font-mono text-muted hover:text-accent transition-colors duration-200"
                  >
                    → linkedin
                  </a>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* TODO: Fill in second founder details here */}
          <motion.div variants={fadeInUp}>
            <Card className="h-full opacity-50 border-dashed">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-lg bg-surface border border-border border-dashed flex-shrink-0 flex items-center justify-center">
                  <Plus size={20} className="text-muted" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-muted">
                    Second founder — TBA
                  </h3>
                  <p className="text-sm text-muted mt-3 leading-relaxed">
                    Co-founder details to be added.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
