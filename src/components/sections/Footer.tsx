import Link from "next/link";
import { Logo, MonoText } from "@/components/ui";
import { footerLinks } from "@/lib/navigation";

export function Footer() {
  return (
    <footer className="border-t border-divider py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Logo size={24} />
              <span className="font-mono text-lg font-bold text-foreground tracking-tight">
                TAIR
              </span>
            </Link>
            <p className="text-sm text-muted leading-relaxed max-w-[200px]">
              Autonomous indoor intelligence platform.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Products
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.products.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-secondary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-secondary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

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

        <div className="mt-16 pt-6 border-t border-divider flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">© TAIR Systems, 2026</p>
          <MonoText className="text-xs text-muted">v0.2.0 · multi-page</MonoText>
        </div>
      </div>
    </footer>
  );
}
