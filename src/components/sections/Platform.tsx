"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { MonoText } from "@/components/ui";
import { fadeInUp, staggerContainer, viewportOptions } from "@/lib/animations";
import dynamic from "next/dynamic";

const DashboardPreview = dynamic(
  () => import("@/components/three/DashboardPreview").then((m) => m.DashboardPreview),
  { ssr: false }
);

/* ── Rack labels for terminal output ── */
const RACK_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"];
const SKUS = [
  "PHARMA-2104", "COLD-CH-0891", "ELEC-BATT-512", "MED-SUP-3301",
  "AUTO-PT-7742", "FOOD-ORG-1120", "CHEM-IND-5589", "TEXT-COT-0034",
  "PHARMA-1187", "COLD-CH-2240", "ELEC-MOT-881", "MED-DEV-4410",
];
const EVENTS = ["pallet_detected", "match_wms", "scan_rack", "rfid_read", "loc_verified"];

interface LogEntry {
  time: string;
  event: string;
  detail: string;
  type: "normal" | "warning" | "success";
}

function generateLogEntry(rackHint?: string): LogEntry {
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  const rack = rackHint || `${RACK_LABELS[Math.floor(Math.random() * RACK_LABELS.length)]}_${String(Math.floor(Math.random() * 48) + 1).padStart(2, "0")}`;
  const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];

  // ~10% chance of a discrepancy for realism
  if (Math.random() < 0.1) {
    return { time, event: "discrepancy", detail: `loc=${rack} expected!=actual`, type: "warning" };
  }

  const sku = SKUS[Math.floor(Math.random() * SKUS.length)];
  const epc = `EPC:E280...${Math.random().toString(16).slice(2, 6).toUpperCase()}`;

  if (event === "match_wms" || event === "loc_verified") {
    return { time, event, detail: `sku=${sku}`, type: "success" };
  }
  if (event === "pallet_detected" || event === "rfid_read") {
    return { time, event, detail: epc, type: "normal" };
  }
  return { time, event: "scan_rack", detail: rack, type: "normal" };
}

/* ── Continuous Terminal ── */
function ContinuousTerminal({ scanEvents }: { scanEvents: string[] }) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const maxEntries = 50;

  // Generate entries continuously
  useEffect(() => {
    const interval = setInterval(() => {
      setEntries((prev) => {
        const entry = generateLogEntry();
        const next = [...prev, entry];
        if (next.length > maxEntries) next.shift();
        return next;
      });
    }, 800 + Math.random() * 1200);

    return () => clearInterval(interval);
  }, []);

  // Also add entries from 3D scan events
  useEffect(() => {
    if (scanEvents.length === 0) return;
    const latest = scanEvents[scanEvents.length - 1];
    setEntries((prev) => {
      const entry = generateLogEntry(latest);
      const next = [...prev, entry];
      if (next.length > maxEntries) next.shift();
      return next;
    });
  }, [scanEvents]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length]);

  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-surface">
        <span className="w-1.5 h-1.5 rounded-full bg-status-green animate-pulse" />
        <span className="font-mono text-[10px] text-muted uppercase tracking-wider">tair_scan_engine v0.1.0 — live</span>
      </div>
      <div
        ref={scrollRef}
        className="p-3 font-mono text-xs h-[300px] md:h-[400px] overflow-y-auto"
      >
        {entries.map((e, i) => (
          <div key={i} className="flex gap-2 leading-relaxed">
            <span className="text-muted shrink-0">[{e.time}]</span>
            <span className={
              e.type === "warning" ? "text-status-yellow" :
              e.type === "success" ? "text-status-green" :
              "text-accent"
            }>{e.event.padEnd(16)}</span>
            <span className="text-secondary truncate">{e.detail}</span>
          </div>
        ))}
        <div className="flex items-center gap-1 mt-1">
          <span className="w-1.5 h-3 bg-accent animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function Platform() {
  const [scanEvents, setScanEvents] = useState<string[]>([]);

  const handleScanEvent = useCallback((rack: string) => {
    setScanEvents((prev) => [...prev.slice(-20), rack]);
  }, []);

  return (
    <section id="platform" className="py-32 px-6">
      <motion.div className="max-w-7xl mx-auto" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportOptions}>
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <MonoText className="text-secondary text-xs uppercase tracking-widest">// live preview</MonoText>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold text-foreground tracking-tight">Digital twin dashboard</h2>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* 3D Scene — 3/5 width */}
            <div className="lg:col-span-3">
              <DashboardPreview onScanEvent={handleScanEvent} />
            </div>

            {/* Continuous terminal — 2/5 width */}
            <div className="lg:col-span-2">
              <ContinuousTerminal scanEvents={scanEvents} />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
