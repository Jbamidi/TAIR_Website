"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui";
import { Button } from "@/components/ui";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { handleSmoothScroll } from "@/lib/smoothScroll";
import { navLinks } from "@/lib/navigation";

function NavLink({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isHashLink = href.startsWith("#");
  const isActive =
    !isHashLink && (href === "/" ? pathname === "/" : pathname.startsWith(href));

  if (isHashLink) {
    return (
      <a
        href={href}
        onClick={(e) => {
          handleSmoothScroll(e, href);
          onNavigate?.();
        }}
        className="text-sm text-secondary hover:text-foreground transition-colors duration-200"
      >
        {label}
      </a>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`text-sm transition-colors duration-200 ${
        isActive ? "text-foreground" : "text-secondary hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-divider"
          : "bg-transparent"
      }`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={28} />
          <span className="font-mono text-lg font-bold text-foreground tracking-tight">
            TAIR
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </div>

        <div className="hidden md:block">
          <MagneticButton>
            <Button href="/contact" className="text-sm px-5 py-2">
              Request demo
            </Button>
          </MagneticButton>
        </div>

        <button
          className="md:hidden text-foreground cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-divider"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  onNavigate={() => setMobileOpen(false)}
                />
              ))}
              <Button
                href="/contact"
                className="text-sm w-full mt-2"
                onClick={() => setMobileOpen(false)}
              >
                Request demo
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
