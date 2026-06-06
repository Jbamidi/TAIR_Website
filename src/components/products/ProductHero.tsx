"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Product } from "@/lib/products";
import { getProductIcon } from "@/lib/product-icons";
import { ProductStatusBadge } from "./ProductStatusBadge";
import { MonoText } from "@/components/ui";

interface ProductHeroProps {
  product: Product;
}

export function ProductHero({ product }: ProductHeroProps) {
  const Icon = getProductIcon(product.iconKey);

  return (
    <div className="relative overflow-hidden border-b border-divider">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: "linear-gradient(to bottom, black 40%, transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(0, 212, 255, 0.1), transparent)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 pt-12 pb-16 md:pt-16 md:pb-20">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft size={16} />
          All products
        </Link>

        <div className="flex flex-col md:flex-row md:items-start gap-8">
          <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-xl border border-accent/20 bg-surface glow-accent-subtle shrink-0">
            <Icon size={36} className="text-accent" strokeWidth={1.5} />
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-4 mb-3">
              <MonoText className="text-muted text-xs uppercase tracking-widest">
                {product.category}
              </MonoText>
              <ProductStatusBadge status={product.status} />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
              {product.name}
            </h1>
            <p className="mt-4 text-accent font-mono text-sm md:text-base">
              {product.tagline}
            </p>
            <p className="mt-6 text-secondary text-lg leading-relaxed max-w-3xl">
              {product.description}
            </p>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
          {product.highlights.map((h) => (
            <div
              key={h.label}
              className="bg-surface/80 backdrop-blur-sm border border-border rounded-lg p-5 text-center"
            >
              <p className="text-[10px] font-mono text-muted uppercase tracking-wider">
                {h.label}
              </p>
              <p className="mt-2 text-xl font-semibold text-foreground font-mono">
                {h.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
