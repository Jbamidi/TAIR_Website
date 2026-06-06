"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/products/ProductCard";
import { MonoText } from "@/components/ui";
import { fadeInUp, staggerContainer, viewportOptions } from "@/lib/animations";

export function ProductsPreview() {
  return (
    <section id="products" className="py-32 px-6">
      <motion.div
        className="max-w-6xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOptions}
      >
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <MonoText className="text-secondary text-xs uppercase tracking-widest">
            // product offerings
          </MonoText>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            Built for warehouse operators
          </h2>
          <p className="mt-4 text-secondary text-lg max-w-2xl mx-auto">
            Explore our product suite — from autonomous scanning to WMS sync.
            No checkout required. Reach out when you&apos;re ready to talk.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <ProductCard
              key={product.slug}
              product={product}
              variant="compact"
              index={index}
            />
          ))}
        </div>

        <motion.div variants={fadeInUp} className="text-center mt-12">
          <Link
            href="/products"
            className="text-sm text-secondary hover:text-accent transition-colors"
          >
            View all products →
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
