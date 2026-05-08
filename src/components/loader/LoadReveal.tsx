"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";
import gsap from "gsap";

export function LoadReveal({ children }: { children: ReactNode }) {
  const [revealed, setRevealed] = useState(false);
  const [skip, setSkip] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const arrowRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("tair-loaded")) {
      setSkip(true);
      setRevealed(true);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setRevealed(true);
        sessionStorage.setItem("tair-loaded", "1");
      },
    });

    const path = pathRef.current!;
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.set(arrowRef.current, { opacity: 0 });

    tl.to({}, { duration: 0.2 }) // black pause
      .fromTo(dotRef.current, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out", transformOrigin: "center" })
      .to(path, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" })
      .to(arrowRef.current, { opacity: 1, duration: 0.2 }, "-=0.1")
      .to({}, { duration: 0.3 }) // hold
      .to(overlayRef.current, { opacity: 0, duration: 0.6, ease: "power2.in" });
  }, []);

  if (skip) return <>{children}</>;

  return (
    <>
      {!revealed && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[9999] bg-background flex items-center justify-center"
        >
          <svg viewBox="0 0 200 240" className="w-16 h-20" fill="none">
            <circle ref={dotRef} cx="40" cy="40" r="8" fill="#00D4FF" />
            <path
              ref={pathRef}
              d="M40 40 L160 40 L160 80 L40 80 L40 120 L160 120 L160 160 L40 160 L40 200 L150 200"
              stroke="#00D4FF"
              strokeWidth="8"
              strokeLinecap="square"
              strokeLinejoin="miter"
              fill="none"
            />
            <path
              ref={arrowRef}
              d="M150 188 L170 200 L150 212 Z"
              fill="#00D4FF"
            />
          </svg>
        </div>
      )}
      <div style={{ visibility: revealed ? "visible" : "hidden" }}>{children}</div>
    </>
  );
}
