"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * SVG circuit outline that draws in on scroll — stroke-dashoffset animation.
 * The path is an evocative chicane/circuit shape (not a literal MotoE track).
 * Positioned decoratively in the racing hero section.
 */
export default function TrackOutline({ sectionRef }: { sectionRef: React.RefObject<HTMLElement | null> }) {
  const pathRef = useRef<SVGPathElement>(null);

  useGSAP(() => {
    const path = pathRef.current;
    const trigger = sectionRef.current;
    if (!path || !trigger) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

    gsap.to(path, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger,
        start: "top 85%",
        end: "bottom 15%",
        scrub: 1.5,
      },
    });
  }, { scope: sectionRef, dependencies: [] });

  return (
    <div
      aria-hidden="true"
      className="absolute bottom-0 right-0 pointer-events-none opacity-30"
      style={{ width: "clamp(200px, 35vw, 520px)", height: "auto" }}
    >
      <svg
        viewBox="0 0 520 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "auto" }}
      >
        <path
          ref={pathRef}
          d="
            M 20 200
            C 20 140 80 120 140 130
            L 200 135
            C 240 138 260 100 300 90
            C 340 80 380 110 400 150
            L 410 180
            C 420 210 450 230 480 220
            C 500 215 510 200 500 180
            L 490 150
            C 470 100 430 70 380 60
            C 330 50 290 70 260 110
            L 230 155
            C 210 180 180 195 150 185
            C 120 175 110 150 120 120
            C 130 90 165 70 200 75
          "
          stroke="#CE2B37"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
