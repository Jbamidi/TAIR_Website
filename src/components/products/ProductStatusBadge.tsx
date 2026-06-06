import type { Product } from "@/lib/products";
import { getStatusMeta } from "@/lib/product-utils";

export function ProductStatusBadge({ status }: { status: Product["status"] }) {
  const meta = getStatusMeta(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider ${meta.className}`}
    >
      <span className="w-1 h-1 rounded-full bg-current opacity-80" />
      {meta.label}
    </span>
  );
}
