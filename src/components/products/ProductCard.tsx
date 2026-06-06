"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/products";
import { getProductIcon } from "@/lib/product-icons";
import { ProductStatusBadge } from "./ProductStatusBadge";
import { MonoText } from "@/components/ui";
import { fadeInUp } from "@/lib/animations";

type ProductCardVariant = "compact" | "featured" | "related";

interface ProductCardProps {
  product: Product;
  variant?: ProductCardVariant;
  index?: number;
  animate?: boolean;
}

export function ProductCard({
  product,
  variant = "featured",
  index = 0,
  animate = true,
}: ProductCardProps) {
  const Icon = getProductIcon(product.iconKey);
  const href = `/products/${product.slug}`;

  const content = (
    <Link href={href} className="group block h-full">
      <div
        className={`relative h-full overflow-hidden bg-surface border border-border rounded-xl transition-all duration-200 hover:border-accent/30 ${
          variant === "compact" ? "p-6" : variant === "related" ? "p-5" : "p-8"
        }`}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.5), transparent)",
          }}
        />

        <div
          className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(circle, rgba(0, 212, 255, 0.08), transparent 70%)",
          }}
        />

        <div className="relative flex flex-col h-full">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div
              className={`flex items-center justify-center rounded-lg border border-border bg-background/60 ${
                variant === "compact" ? "w-11 h-11" : "w-12 h-12"
              } group-hover:border-accent/30 group-hover:glow-accent-subtle transition-all duration-200`}
            >
              <Icon
                size={variant === "compact" ? 22 : 24}
                className="text-accent"
                strokeWidth={1.5}
              />
            </div>
            <ProductStatusBadge status={product.status} />
          </div>

          {variant === "featured" && (
            <MonoText className="text-muted text-[10px] uppercase tracking-widest mb-2">
              {product.category}
            </MonoText>
          )}

          <h3
            className={`font-semibold text-foreground group-hover:text-accent transition-colors duration-200 ${
              variant === "compact"
                ? "text-lg"
                : variant === "related"
                  ? "text-base"
                  : "text-2xl"
            }`}
          >
            {product.name}
          </h3>

          {variant !== "related" && (
            <p className="mt-2 text-accent text-xs md:text-sm font-mono">
              {product.tagline}
            </p>
          )}

          <p
            className={`mt-3 text-secondary leading-relaxed flex-1 ${
              variant === "related" ? "text-xs line-clamp-2 mt-2" : "text-sm"
            }`}
          >
            {product.summary}
          </p>

          {variant !== "related" && product.highlights.length > 0 && (
            <div className="mt-5 pt-5 border-t border-divider grid grid-cols-3 gap-2">
              {product.highlights.map((h) => (
                <div key={h.label} className="text-center">
                  <p className="text-[10px] font-mono text-muted uppercase tracking-wider truncate">
                    {h.label}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-foreground truncate">
                    {h.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          <span
            className={`inline-flex items-center gap-1.5 text-accent ${
              variant === "related" ? "mt-3 text-xs" : "mt-6 text-sm"
            }`}
          >
            {variant === "related" ? "View" : "Explore product"}
            <ArrowRight
              size={variant === "related" ? 12 : 14}
              className="group-hover:translate-x-0.5 transition-transform duration-200"
            />
          </span>
        </div>
      </div>
    </Link>
  );

  if (!animate) return content;

  return (
    <motion.div
      variants={fadeInUp}
      custom={index}
      className="h-full"
    >
      {content}
    </motion.div>
  );
}
