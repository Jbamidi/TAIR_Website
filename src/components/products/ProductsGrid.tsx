"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Product } from "@/lib/products";
import {
  PRODUCT_CATEGORIES,
  filterProductsByCategory,
} from "@/lib/product-utils";
import { ProductCard } from "./ProductCard";
import { MonoText } from "@/components/ui";
import { staggerContainer, viewportOptions } from "@/lib/animations";

interface ProductsGridProps {
  products: Product[];
}

export function ProductsGrid({ products }: ProductsGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const filtered = filterProductsByCategory(products, activeCategory);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-10">
        {PRODUCT_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider border transition-colors duration-200 ${
              activeCategory === category
                ? "bg-accent/10 border-accent/30 text-accent"
                : "bg-surface border-border text-muted hover:text-secondary hover:border-secondary/30"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <motion.div
        key={activeCategory}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        viewport={viewportOptions}
      >
        {filtered.map((product, index) => (
          <ProductCard
            key={product.slug}
            product={product}
            variant="featured"
            index={index}
          />
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <p className="text-center text-muted py-12">
          <MonoText>No products in this category yet.</MonoText>
        </p>
      )}
    </div>
  );
}
