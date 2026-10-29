"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Mounts Lenis smooth-scroll and wires it to GSAP ScrollTrigger.
 * Renders nothing — purely a side-effect component.
 */
export default function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    // Reduced motion keeps the browser's own scrolling
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Expose instance globally so other components can stop/start scroll
    (window as any).__lenis = lenis;

    // Keep ScrollTrigger in sync with Lenis scroll position
    // Also emit scroll velocity for speed lines canvas + text blur
    lenis.on("scroll", (e: { velocity: number }) => {
      ScrollTrigger.update();
      const vel = Math.abs(e.velocity);
      // CSS variable for text blur effect
      document.documentElement.style.setProperty(
        "--scroll-blur",
        `${Math.min(vel * 0.35, 2.5)}px`
      );
      // Custom event for SpeedCanvas and other velocity consumers
      document.dispatchEvent(
        new CustomEvent("scrollvelocity", { detail: vel })
      );
    });

    // Drive Lenis from GSAP's RAF loop
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(raf);
      delete (window as any).__lenis;
    };
  }, []);

  return null;
}
