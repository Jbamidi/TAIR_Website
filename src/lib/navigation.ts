export const navLinks = [
  { label: "Products", href: "/products" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerLinks = {
  products: [
    { label: "Digital Twin", href: "/products/digital-twin" },
    { label: "Autonomous Scanning", href: "/products/autonomous-scanning" },
    { label: "Multi-Sensor Vision", href: "/products/multi-sensor-vision" },
    { label: "Warehouse AI Agent", href: "/products/warehouse-ai-agent" },
    { label: "WMS Integration", href: "/products/wms-integration" },
    { label: "RFID Inventory", href: "/products/rfid-inventory" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Team", href: "/about#team" },
    { label: "Contact", href: "/contact" },
  ],
} as const;
