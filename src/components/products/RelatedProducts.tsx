import type { Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";
import { MonoText } from "@/components/ui";

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <div>
      <MonoText className="text-muted text-xs uppercase tracking-widest">
        // related products
      </MonoText>
      <h2 className="mt-3 text-xl font-semibold text-foreground mb-6">
        Works well with
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.slug}
            product={product}
            variant="related"
            animate={false}
          />
        ))}
      </div>
    </div>
  );
}
