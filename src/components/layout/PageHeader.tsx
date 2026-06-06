"use client";

import { motion } from "framer-motion";
import { MonoText } from "@/components/ui";
import { fadeInUp } from "@/lib/animations";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
}: PageHeaderProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <motion.header
      className={`max-w-4xl ${alignClass} ${className}`}
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
    >
      <MonoText className="text-secondary text-xs uppercase tracking-widest">
        {eyebrow}
      </MonoText>
      <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
        {title}
      </h1>
      {description && (
        <p className="mt-6 text-secondary text-lg leading-relaxed max-w-2xl">
          {description}
        </p>
      )}
    </motion.header>
  );
}
