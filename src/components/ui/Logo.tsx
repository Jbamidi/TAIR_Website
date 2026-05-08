interface LogoProps {
  className?: string;
  /** Height in pixels — width scales proportionally */
  size?: number;
}

export function Logo({ className = "", size = 32 }: LogoProps) {
  // Original viewBox is 200x240, so width = size * (200/240)
  const width = Math.round(size * (200 / 240));

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 240"
      fill="none"
      stroke="#00D4FF"
      strokeWidth="8"
      strokeLinecap="square"
      strokeLinejoin="miter"
      width={width}
      height={size}
      className={className}
      aria-label="TAIR logo"
    >
      {/* Starting dot (top-left origin) */}
      <circle cx="40" cy="40" r="8" fill="#00D4FF" stroke="none" />

      {/* Serpentine scan path */}
      <path
        d="M 40 40
           L 160 40
           L 160 80
           L 40 80
           L 40 120
           L 160 120
           L 160 160
           L 40 160
           L 40 200
           L 150 200"
      />

      {/* Ending arrow (bottom-right terminus) */}
      <path
        d="M 150 188 L 170 200 L 150 212 Z"
        fill="#00D4FF"
        stroke="none"
      />
    </svg>
  );
}
