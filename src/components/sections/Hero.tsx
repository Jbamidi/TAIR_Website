"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { handleSmoothScroll } from "@/lib/smoothScroll";
import dynamic from "next/dynamic";

const CinematicHero = dynamic(
  () => import("@/scene/warehouse/CinematicHero").then((m) => m.CinematicHero),
  { ssr: false }
);

const TERMINAL_TEXT = "> initializing scan_pipeline.v0.1....";

function TypewriterText() {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      if (i < TERMINAL_TEXT.length) { setText(TERMINAL_TEXT.slice(0, ++i)); }
      else { clearInterval(iv); setDone(true); }
    }, 40);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!done) return;
    const iv = setInterval(() => setBlink((p) => !p), 530);
    return () => clearInterval(iv);
  }, [done]);

  return (
    <span className="font-mono text-sm md:text-base text-accent">
      {text}
      <span className={`inline-block w-2 h-5 bg-accent ml-0.5 align-middle ${done && !blink ? "opacity-0" : "opacity-100"}`} />
    </span>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const scrollProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const [sp, setSp] = useState(0);

  useEffect(() => {
    const unsub = scrollProgress.on("change", (v) => setSp(v));
    return () => unsub();
  }, [scrollProgress]);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center overflow-hidden">
      {/* 3D scene — fills right side on desktop */}
      <div className="absolute inset-0 hidden lg:block">
        <CinematicHero scrollProgress={sp} />
      </div>

      {/* Gradient overlay so text is readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none z-[1]" />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 w-full relative z-[2]">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-xl">
          <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
            Inventory that<br />knows itself.
          </motion.h1>
          <motion.p variants={fadeInUp} className="mt-6 text-lg md:text-xl text-secondary max-w-lg leading-relaxed">
            Autonomous drones map your warehouse every night. Your WMS wakes up corrected.
          </motion.p>
          <motion.div variants={fadeInUp} className="mt-6"><TypewriterText /></motion.div>
          <motion.div variants={fadeInUp} className="mt-10 flex flex-wrap gap-4">
            <MagneticButton>
              <Button onClick={(e) => handleSmoothScroll(e, "#contact")}>Request demo</Button>
            </MagneticButton>
            <Button variant="ghost" onClick={(e) => handleSmoothScroll(e, "#how-it-works")}>
              See how it works
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
