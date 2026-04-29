"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";

export default function LoadingScreen() {
  const [hidden, setHidden] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    const overlay = overlayRef.current;
    const bar = barRef.current;
    if (!overlay || !bar) return;

    // Animate the bar to 70 % immediately, simulating progress
    const tl = gsap.timeline();
    tl.fromTo(bar, { scaleX: 0 }, { scaleX: 0.7, duration: 0.7, ease: "power2.out" });

    function dismiss() {
      if (doneRef.current) return;
      doneRef.current = true;
      tl.kill();
      // Complete bar then fade overlay out
      gsap.to(bar, {
        scaleX: 1,
        duration: 0.2,
        ease: "none",
        onComplete: () => {
          gsap.to(overlay, {
            opacity: 0,
            duration: 0.45,
            delay: 0.05,
            ease: "power2.inOut",
            onComplete: () => setHidden(true),
          });
        },
      });
    }

    if (document.readyState === "complete") {
      const t = setTimeout(dismiss, 150);
      return () => clearTimeout(t);
    }

    window.addEventListener("load", dismiss, { once: true });

    // Hard fallback: 800ms max — never block LCP
    const fallback = setTimeout(dismiss, 800);

    return () => {
      window.removeEventListener("load", dismiss);
      clearTimeout(fallback);
      tl.kill();
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a]"
      aria-hidden="true"
    >
      {/* Logo */}
      <Image
        src="/images/Logo/energica-logo-standard.webp"
        alt="Energica"
        width={140}
        height={42}
        priority
        className="object-contain opacity-75 mb-10"
      />

      {/* Thin red progress bar */}
      <div className="w-28 h-px bg-white/10 overflow-hidden">
        <div
          ref={barRef}
          className="h-full bg-[#78BE20] origin-left"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
    </div>
  );
}
