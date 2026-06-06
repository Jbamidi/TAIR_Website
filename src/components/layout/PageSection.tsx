interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  bordered?: boolean;
}

export function PageSection({
  children,
  className = "",
  bordered = false,
}: PageSectionProps) {
  return (
    <section
      className={`py-16 md:py-24 px-6 ${bordered ? "border-t border-divider" : ""} ${className}`}
    >
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  );
}
