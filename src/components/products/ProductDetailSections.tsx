import { CheckCircle2 } from "lucide-react";
import type { Product } from "@/lib/products";
import { MonoText } from "@/components/ui";

interface ProductDetailSectionsProps {
  product: Product;
}

export function ProductDetailSections({ product }: ProductDetailSectionsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-surface border border-border rounded-xl p-8">
        <MonoText className="text-muted text-xs uppercase tracking-widest">
          // features
        </MonoText>
        <h2 className="mt-3 text-xl font-semibold text-foreground mb-6">
          What you get
        </h2>
        <ul className="space-y-4">
          {product.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-3 text-sm text-secondary leading-relaxed"
            >
              <CheckCircle2
                size={16}
                className="text-accent shrink-0 mt-0.5"
                strokeWidth={2}
              />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-surface border border-border rounded-xl p-8">
        <MonoText className="text-muted text-xs uppercase tracking-widest">
          // use cases
        </MonoText>
        <h2 className="mt-3 text-xl font-semibold text-foreground mb-6">
          Built for
        </h2>
        <ul className="space-y-4">
          {product.useCases.map((useCase) => (
            <li
              key={useCase}
              className="text-sm text-secondary pl-4 border-l-2 border-accent/40 leading-relaxed"
            >
              {useCase}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
