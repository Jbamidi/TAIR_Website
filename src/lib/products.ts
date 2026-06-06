import type { ProductCategory } from "./product-utils";

export type ProductIconKey =
  | "layers"
  | "scan-line"
  | "box"
  | "bot"
  | "plug"
  | "radio";

export interface Product {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  description: string;
  iconKey: ProductIconKey;
  category: ProductCategory;
  status: "available" | "beta" | "coming-soon";
  features: string[];
  useCases: string[];
  highlights: { label: string; value: string }[];
  relatedSlugs?: string[];
}

export const products: Product[] = [
  {
    slug: "digital-twin",
    name: "Digital Twin Platform",
    tagline: "Your warehouse, mapped every night",
    summary:
      "A live 3D model of your facility with rack-level inventory state, discrepancy alerts, and scan history.",
    description:
      "TAIR builds a centimeter-accurate digital twin of your warehouse from nightly autonomous scans. Operations teams get a single pane of glass for inventory location, occupancy, and exceptions — without walking the floor.",
    iconKey: "layers",
    category: "Platform",
    status: "available",
    features: [
      "Nightly autonomous map refresh from LiDAR SLAM",
      "Rack- and slot-level inventory visualization",
      "Discrepancy detection vs. WMS records",
      "Historical scan replay and audit trail",
      "Exportable inventory snapshots for ops review",
    ],
    useCases: [
      "Cold chain facilities needing continuous location accuracy",
      "3PL operators managing high-SKU mix across aisles",
      "Pharma warehouses with strict lot and location traceability",
    ],
    highlights: [
      { label: "Map refresh", value: "Nightly" },
      { label: "Accuracy", value: "±2 cm" },
      { label: "Coverage", value: "Full facility" },
    ],
    relatedSlugs: ["autonomous-scanning", "wms-integration", "multi-sensor-vision"],
  },
  {
    slug: "autonomous-scanning",
    name: "Autonomous Drone Scanning",
    tagline: "Lights-out inventory verification",
    summary:
      "Drones take off, scan every aisle, and dock — fully unattended, every night.",
    description:
      "No human operator per aisle. TAIR drones autonomously navigate your warehouse, capture inventory state, and return to dock. Designed for lights-out operations in cold storage and high-bay environments where manual counts are slow and error-prone.",
    iconKey: "scan-line",
    category: "Autonomous Systems",
    status: "available",
    features: [
      "Autonomous takeoff, navigation, and docking",
      "Obstacle-aware path planning in active warehouses",
      "Nightly scan schedules with zero operator overhead",
      "Safe operation in cold chain and low-light conditions",
      "Fleet health monitoring and mission logs",
    ],
    useCases: [
      "Replacing manual cycle counts in freezer aisles",
      "Nightly verification after receiving and putaway",
      "High-bay racking where forklift access is limited",
    ],
    highlights: [
      { label: "Operator required", value: "None" },
      { label: "Scan window", value: "Overnight" },
      { label: "Deployment", value: "Per facility" },
    ],
    relatedSlugs: ["multi-sensor-vision", "digital-twin", "rfid-inventory"],
  },
  {
    slug: "multi-sensor-vision",
    name: "Multi-Sensor Vision",
    tagline: "LiDAR, RGB, thermal, and RFID in one pass",
    summary:
      "Four sensor modalities fused into a single scan pipeline for complete inventory intelligence.",
    description:
      "Every TAIR scan combines 3D LiDAR, high-resolution RGB, thermal imaging, and RFID/barcode reads. Cold chain anomalies, label OCR, and tag reads through packaging — captured in one autonomous mission.",
    iconKey: "box",
    category: "Autonomous Systems",
    status: "available",
    features: [
      "3D LiDAR point clouds for structural mapping",
      "RGB capture for LPN, UPC, lot code, and expiry OCR",
      "Thermal imaging for cold chain anomaly detection",
      "RFID and barcode reads through shrink-wrap and condensation",
      "Sensor fusion pipeline with unified inventory output",
    ],
    useCases: [
      "Cold storage with condensation and frost on packaging",
      "Pharma lots requiring expiry and lot code verification",
      "Mixed-SKU facilities needing both visual and tag-based ID",
    ],
    highlights: [
      { label: "Sensor modes", value: "4" },
      { label: "RFID read", value: "Through packaging" },
      { label: "Thermal", value: "Cold chain" },
    ],
    relatedSlugs: ["autonomous-scanning", "rfid-inventory", "digital-twin"],
  },
  {
    slug: "warehouse-ai-agent",
    name: "Warehouse AI Agent",
    tagline: "Ask your warehouse anything",
    summary:
      "Natural-language control backed by live drone scans and WMS data via a LangGraph-powered agent.",
    description:
      "Operators and managers chat with their warehouse in plain English. The TAIR agent dispatches drones, interprets scan results, and returns actionable answers — backed by real inventory data, not guesses.",
    iconKey: "bot",
    category: "AI",
    status: "beta",
    features: [
      "Natural-language inventory queries and mission dispatch",
      "LangGraph agent orchestration with tool use",
      "Real-time answers backed by autonomous scan data",
      "Automatic WMS record updates after verification missions",
      "Audit log of every agent action and drone deployment",
    ],
    useCases: [
      '"How many pallets of SKU X are on the shelf?"',
      "Ad-hoc verification after inbound shipments",
      "Ops managers checking capacity without floor walks",
    ],
    highlights: [
      { label: "Interface", value: "Natural language" },
      { label: "Data source", value: "Live scans" },
      { label: "Status", value: "Beta" },
    ],
    relatedSlugs: ["digital-twin", "autonomous-scanning", "wms-integration"],
  },
  {
    slug: "wms-integration",
    name: "WMS Integration",
    tagline: "Corrected inventory, pushed automatically",
    summary:
      "Scan results sync directly into Extensiv and other WMS platforms — no workflow changes for your team.",
    description:
      "TAIR closes the loop between physical inventory and your system of record. Discrepancies are flagged, verified locations are pushed back to your WMS, and your team wakes up to corrected data — not another spreadsheet.",
    iconKey: "plug",
    category: "Integration",
    status: "available",
    features: [
      "Bi-directional sync with major WMS platforms",
      "Extensiv integration out of the box",
      "Discrepancy queue with resolution workflow",
      "API access for custom ERP and inventory systems",
      "Webhook notifications for exception events",
    ],
    useCases: [
      "3PLs running Extensiv or similar WMS stacks",
      "Operations teams tired of manual WMS corrections",
      "Facilities needing audit-ready inventory reconciliation",
    ],
    highlights: [
      { label: "WMS sync", value: "Automatic" },
      { label: "Extensiv", value: "Supported" },
      { label: "API", value: "Available" },
    ],
    relatedSlugs: ["digital-twin", "warehouse-ai-agent", "autonomous-scanning"],
  },
  {
    slug: "rfid-inventory",
    name: "RFID Inventory",
    tagline: "Reads tags through packaging",
    summary:
      "RFID reads through cardboard and condensation — where camera-only systems fail.",
    description:
      "TAIR's RFID module reads tags through shrink-wrap, corrugated, and cold-storage condensation. Combined with drone mobility, you get aisle-wide tag reads without fixed portal gates or manual wand scans.",
    iconKey: "radio",
    category: "Autonomous Systems",
    status: "available",
    features: [
      "UHF RFID reads through packaging and condensation",
      "No line-of-sight required per tag",
      "Bulk aisle reads during autonomous fly-through",
      "EPC-to-SKU mapping with WMS cross-reference",
      "Exception reporting for untagged or mismatched items",
    ],
    useCases: [
      "Cold chain where camera OCR fails on frosted labels",
      "High-value SKU tracking without portal readers",
      "Pharma serialization and lot traceability programs",
    ],
    highlights: [
      { label: "Read through", value: "Packaging" },
      { label: "Line of sight", value: "Not required" },
      { label: "Cold storage", value: "Supported" },
    ],
    relatedSlugs: ["multi-sensor-vision", "autonomous-scanning", "wms-integration"],
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductSlugs(): string[] {
  return products.map((p) => p.slug);
}
