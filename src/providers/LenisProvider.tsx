"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollState {
  lenis: Lenis | null;
  progress: number;
  velocity: number;
}

const ScrollCtx = createContext<ScrollState>({
  lenis: null,
  progress: 0,
  velocity: 0,
});

export function useSmoothScroll() {
  return useContext(ScrollCtx);
}

export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [scrollState, setScrollState] = useState<ScrollState>({
    lenis: null,
    progress: 0,
    velocity: 0,
  });

  useEffect(() => {
    // Respect reduced motion preference
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const lenis = new Lenis({
      duration: prefersReduced ? 0 : 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !prefersReduced,
      wheelMultiplier: 1,
    });

    lenisRef.current = lenis;

    // Connect Lenis → GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    lenis.on(
      "scroll",
      (e: { progress: number; velocity: number }) => {
        setScrollState((prev) => ({
          ...prev,
          progress: e.progress,
          velocity: e.velocity,
        }));
      }
    );

    // Drive Lenis from GSAP ticker for frame-perfect sync
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    setScrollState((prev) => ({ ...prev, lenis }));

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
    };
  }, []);

  return (
    <ScrollCtx.Provider value={scrollState}>{children}</ScrollCtx.Provider>
  );
}
