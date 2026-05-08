import { Logo, MonoText } from "@/components/ui";

const footerLinks = [
  {
    title: "Platform",
    links: [
      { label: "Digital Twin", href: "#platform" },
      { label: "RFID Scanning", href: "#" },
      { label: "WMS Integration", href: "#" },
      { label: "API", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#team" },
      { label: "Team", href: "#team" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-divider py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {/* Logo column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Logo size={24} />
              <span className="font-mono text-lg font-bold text-foreground tracking-tight">
                TAIR
              </span>
            </div>
            <p className="text-sm text-muted leading-relaxed max-w-[200px]">
              Autonomous indoor intelligence platform.
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-foreground mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted hover:text-secondary transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Resources — coming soon */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5">
              {["Documentation", "Case Studies", "Blog"].map((label) => (
                <li key={label} className="flex items-center gap-2">
                  <span className="text-sm text-muted/50">{label}</span>
                  <span className="text-[10px] font-mono text-muted/40 uppercase tracking-wider">
                    soon
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-16 pt-6 border-t border-divider flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            © TAIR Systems, 2026
          </p>
          <MonoText className="text-xs text-muted">
            v0.1.0 · build a4f2e9
          </MonoText>
        </div>
      </div>
    </footer>
  );
}
