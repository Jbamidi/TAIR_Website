"use client";

import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";
import { MonoText } from "@/components/ui";
import { fadeInUp, staggerContainer, viewportOptions } from "@/lib/animations";

interface Row {
  feature: string;
  others: "none" | "partial" | "yes";
  tair: "none" | "partial" | "yes";
  note?: string;
}

const rows: Row[] = [
  { feature: "Fully lights-out operation", others: "none", tair: "yes", note: "No operator needed — autonomous takeoff, scan, and dock" },
  { feature: "RFID through packaging", others: "none", tair: "yes", note: "Reads tags through cardboard, shrink-wrap, and condensation" },
  { feature: "Thermal cold-chain monitoring", others: "none", tair: "yes", note: "Onboard IR detects temperature anomalies in real time" },
  { feature: "Auto-dock and charge", others: "none", tair: "yes", note: "Continuous operation without manual battery swaps" },
  { feature: "Direct WMS correction", others: "partial", tair: "yes", note: "Corrected data pushed to WMS — not just exception flags" },
  { feature: "LiDAR-built digital twin", others: "none", tair: "yes", note: "Centimeter-accurate 3D facility map, updated nightly" },
  { feature: "Multi-sensor fusion", others: "none", tair: "yes", note: "Camera + RFID + LiDAR + thermal in a single pipeline" },
  { feature: "Natural-language queries", others: "partial", tair: "yes" },
  { feature: "Works in cold storage (−20 °F)", others: "yes", tair: "yes" },
  { feature: "Barcode / UPC reading", others: "yes", tair: "yes" },
];

function StatusIcon({ status }: { status: "none" | "partial" | "yes" }) {
  if (status === "yes") return <Check size={16} className="text-status-green" strokeWidth={2.5} />;
  if (status === "partial") return <Minus size={16} className="text-status-yellow" strokeWidth={2.5} />;
  return <X size={16} className="text-status-red/60" strokeWidth={2.5} />;
}

export function Comparison() {
  return (
    <section className="py-32 px-6">
      <motion.div
        className="max-w-4xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOptions}
      >
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <MonoText className="text-secondary text-xs uppercase tracking-widest">
            // the TAIR advantage
          </MonoText>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            Built different
          </h2>
          <p className="mt-4 text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
            Most warehouse drone solutions rely on a single sensor and still
            require a human operator. TAIR is designed for full autonomy
            from day one.
          </p>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_100px_100px] border-b border-border bg-background">
              <div className="px-4 py-3 sm:px-6">
                <span className="text-xs font-mono text-muted uppercase tracking-wider">Capability</span>
              </div>
              <div className="px-2 py-3 text-center border-l border-border">
                <span className="text-xs font-mono text-muted uppercase tracking-wider">Others</span>
              </div>
              <div className="px-2 py-3 text-center border-l border-accent/20 bg-accent/5">
                <span className="text-xs font-mono text-accent uppercase tracking-wider">TAIR</span>
              </div>
            </div>

            {/* Rows */}
            {rows.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_100px_100px] ${
                  i < rows.length - 1 ? "border-b border-border" : ""
                } hover:bg-background/50 transition-colors duration-150`}
              >
                <div className="px-4 py-3 sm:px-6">
                  <span className="text-sm text-foreground">{row.feature}</span>
                  {row.note && (
                    <p className="text-[11px] text-muted mt-0.5 leading-snug hidden sm:block">{row.note}</p>
                  )}
                </div>
                <div className="px-2 py-3 flex items-center justify-center border-l border-border">
                  <StatusIcon status={row.others} />
                </div>
                <div className="px-2 py-3 flex items-center justify-center border-l border-accent/20 bg-accent/5">
                  <StatusIcon status={row.tair} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs font-mono text-muted">
            <div className="flex items-center gap-1.5">
              <Check size={12} className="text-status-green" strokeWidth={2.5} />
              <span>Supported</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Minus size={12} className="text-status-yellow" strokeWidth={2.5} />
              <span>Partial / announced</span>
            </div>
            <div className="flex items-center gap-1.5">
              <X size={12} className="text-status-red/60" strokeWidth={2.5} />
              <span>Not available</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
