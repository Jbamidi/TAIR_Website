"use client";

import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glowOnHover?: boolean;
}

export function Card({ children, className = "", glowOnHover = false }: CardProps) {
  return (
    <motion.div
      className={`bg-surface border border-border rounded-xl p-6 ${
        glowOnHover ? "hover:border-accent/30 transition-colors duration-200" : ""
      } ${className}`}
      whileHover={
        glowOnHover
          ? {
              boxShadow: "0 0 24px rgba(0, 212, 255, 0.1)",
              transition: { duration: 0.2 },
            }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
}
