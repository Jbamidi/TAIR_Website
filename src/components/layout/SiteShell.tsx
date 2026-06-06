import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col bg-background">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-30"
        aria-hidden
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)",
        }}
      />
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
