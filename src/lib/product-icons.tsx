"use client";

import type { LucideIcon } from "lucide-react";
import {
  Box,
  Bot,
  Layers,
  Plug,
  Radio,
  ScanLine,
} from "lucide-react";
import type { ProductIconKey } from "@/lib/products";

const ICON_MAP: Record<ProductIconKey, LucideIcon> = {
  layers: Layers,
  "scan-line": ScanLine,
  box: Box,
  bot: Bot,
  plug: Plug,
  radio: Radio,
};

export function getProductIcon(key: ProductIconKey): LucideIcon {
  return ICON_MAP[key];
}
