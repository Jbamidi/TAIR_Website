import type { Product } from "./products";

export const PRODUCT_STATUS = {
  available: { label: "Available", className: "text-status-green" },
  beta: { label: "Beta", className: "text-accent" },
  "coming-soon": { label: "Coming soon", className: "text-muted" },
} as const;

export const PRODUCT_CATEGORIES = [
  "All",
  "Platform",
  "Autonomous Systems",
  "AI",
  "Integration",
] as const;

export type ProductCategory = Exclude<(typeof PRODUCT_CATEGORIES)[number], "All">;

export function getStatusMeta(status: Product["status"]) {
  return PRODUCT_STATUS[status];
}

export function getRelatedProducts(product: Product, all: Product[]): Product[] {
  if (product.relatedSlugs?.length) {
    return product.relatedSlugs
      .map((slug) => all.find((p) => p.slug === slug))
      .filter((p): p is Product => Boolean(p));
  }
  return all.filter((p) => p.slug !== product.slug && p.category === product.category).slice(0, 3);
}

export function filterProductsByCategory(
  products: Product[],
  category: string
): Product[] {
  if (category === "All") return products;
  return products.filter((p) => p.category === category);
}
