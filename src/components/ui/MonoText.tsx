interface MonoTextProps {
  children: React.ReactNode;
  className?: string;
  as?: "span" | "p" | "div" | "code";
}

export function MonoText({
  children,
  className = "",
  as: Tag = "span",
}: MonoTextProps) {
  return (
    <Tag className={`font-mono text-sm tracking-wide ${className}`}>
      {children}
    </Tag>
  );
}
