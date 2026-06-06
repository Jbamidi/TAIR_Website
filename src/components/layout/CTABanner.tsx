import { Button, MonoText } from "@/components/ui";

interface CTABannerProps {
  title: string;
  description: string;
  buttonLabel?: string;
  buttonHref?: string;
}

export function CTABanner({
  title,
  description,
  buttonLabel = "Contact us",
  buttonHref = "/contact",
}: CTABannerProps) {
  return (
    <div className="relative overflow-hidden bg-surface border border-border rounded-xl p-8 md:p-12 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0, 212, 255, 0.12), transparent)",
        }}
      />
      <div className="relative">
        <MonoText className="text-muted text-xs uppercase tracking-widest">
          // get started
        </MonoText>
        <h2 className="mt-3 text-2xl md:text-3xl font-bold text-foreground">
          {title}
        </h2>
        <p className="mt-3 text-secondary max-w-xl mx-auto leading-relaxed">
          {description}
        </p>
        <Button href={buttonHref} className="mt-8 inline-block">
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}
