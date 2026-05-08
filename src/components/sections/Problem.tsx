"use client";

import { motion } from "framer-motion";
import { MonoText } from "@/components/ui";
import { fadeInUp, staggerContainer, viewportOptions } from "@/lib/animations";

/* ── SVG Circular Arc for 68% ── */
function ArcStat() {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const fill = circ * (1 - 0.68);

  return (
    <div className="flex flex-col items-center">
      <MonoText className="text-muted text-xs uppercase tracking-widest mb-3">// industry baseline</MonoText>
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#2A2A2F" strokeWidth="5" />
          <motion.circle
            cx="50" cy="50" r={r} fill="none" stroke="#00D4FF" strokeWidth="5"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            whileInView={{ strokeDashoffset: fill }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl md:text-4xl font-bold font-mono text-foreground">68%</span>
        </div>
      </div>
      <p className="mt-3 text-sm text-secondary max-w-[180px] text-center">Average warehouse inventory accuracy</p>
    </div>
  );
}

/* ── Bar Chart for $1.1T ── */
function BarChartStat() {
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
  const vals = [0.7, 0.78, 0.85, 0.9, 0.95, 1.02, 1.1];

  return (
    <div className="flex flex-col items-center">
      <MonoText className="text-muted text-xs uppercase tracking-widest mb-3">// annual global cost</MonoText>
      <div className="text-5xl md:text-6xl font-bold font-mono text-foreground tracking-tight">$1.1T</div>
      <div className="mt-4 flex items-end gap-1 h-12">
        {years.map((y, i) => (
          <div key={y} className="flex flex-col items-center gap-1">
            <motion.div
              className="w-4 rounded-sm bg-accent/80"
              initial={{ height: 0 }}
              whileInView={{ height: `${(vals[i] / 1.1) * 48}px` }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 + i * 0.1 }}
            />
            <span className="text-[8px] font-mono text-muted">{String(y).slice(2)}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-secondary max-w-[180px] text-center">Lost to inventory inaccuracy per year</p>
    </div>
  );
}

/* ── Fraction Bar for $2M ── */
function FractionStat() {
  return (
    <div className="flex flex-col items-center">
      <MonoText className="text-muted text-xs uppercase tracking-widest mb-3">// per facility per year</MonoText>
      <div className="text-5xl md:text-6xl font-bold font-mono text-foreground tracking-tight">$2M</div>
      <div className="mt-4 w-40">
        <div className="flex justify-between mb-1">
          <span className="text-[10px] font-mono text-accent">$2M cycle count</span>
          <span className="text-[10px] font-mono text-muted">$50M+ total ops</span>
        </div>
        <div className="w-full h-2 bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            initial={{ width: 0 }}
            whileInView={{ width: `${(2 / 50) * 100}%` }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
          />
        </div>
      </div>
      <p className="mt-3 text-sm text-secondary max-w-[200px] text-center">Spent on manual cycle count labor</p>
    </div>
  );
}

export function Problem() {
  return (
    <section className="py-32 px-6">
      <motion.div className="max-w-6xl mx-auto" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportOptions}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
          <motion.div variants={fadeInUp}><ArcStat /></motion.div>
          <motion.div variants={fadeInUp}><BarChartStat /></motion.div>
          <motion.div variants={fadeInUp}><FractionStat /></motion.div>
        </div>
        <motion.div variants={fadeInUp} className="mt-24 max-w-2xl mx-auto">
          <p className="text-secondary text-lg leading-relaxed text-center">
            Warehouses run on broken data. Workers scan barcodes when they move
            items — but they make mistakes, skip scans, and reorganize shelves
            without updating the system. Over time, the digital record drifts
            from physical reality. Manual cycle counts can&apos;t keep up. The gap
            is bleeding money.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
