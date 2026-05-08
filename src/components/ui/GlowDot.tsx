export function GlowDot({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full bg-accent ${className}`}
      style={{
        boxShadow: "0 0 8px rgba(0, 212, 255, 0.6), 0 0 16px rgba(0, 212, 255, 0.3)",
      }}
    />
  );
}
