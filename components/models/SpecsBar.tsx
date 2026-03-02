"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { type KeySpec } from "@/data/models";

interface SpecsBarProps {
  specs: KeySpec[];
}

function AnimatedNum({ target, decimals }: { target: number; decimals: number }) {
  const [val, setVal] = useState(0);

  useGSAP(() => {
    const proxy = { n: 0 };
    gsap.to(proxy, {
      n: target,
      duration: 1.8,
      ease: "power2.out",
      onUpdate: () => setVal(parseFloat(proxy.n.toFixed(decimals))),
      scrollTrigger: {
        trigger: "[data-specsbar]",
        start: "top 85%",
        once: true,
      },
    });
  });

  return <>{decimals > 0 ? val.toFixed(decimals) : Math.round(val)}</>;
}

export default function SpecsBar({ specs }: SpecsBarProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".sb-item", {
        y: 30,
        opacity: 0,
        stagger: 0.08,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: barRef.current,
          start: "top 90%",
        },
      });
    },
    { scope: barRef }
  );

  return (
    <div
      ref={barRef}
      data-specsbar
      className="w-full bg-[#060606] border-t-2 border-b border-[rgb(0,255,0)]/60 border-b-white/[0.04]"
    >
      <div className="max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06]">
        {specs.map((spec) => {
          const num = parseFloat(spec.value);
          const decimals = spec.value.includes(".")
            ? (spec.value.split(".")[1]?.length ?? 0)
            : 0;
          const isAnimatable = !isNaN(num);

          return (
            <div key={spec.label} className="sb-item px-4 sm:px-6 md:px-8 py-6 md:py-8 text-center">
              <div className="flex items-baseline justify-center gap-1 leading-none">
                <span
                  className="font-display text-white"
                  style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
                >
                  {isAnimatable ? (
                    <AnimatedNum target={num} decimals={decimals} />
                  ) : (
                    spec.value
                  )}
                </span>
                <span className="font-display text-[rgb(0,255,0)] text-xl md:text-2xl ml-0.5">
                  {spec.unit}
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mt-2.5">
                {spec.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
