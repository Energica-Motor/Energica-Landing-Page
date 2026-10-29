"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { reveal } from "@/lib/motion";
import { Counter } from "@/components/ui/Counter";
import { type KeySpec } from "@/data/models";

interface SpecsBarProps {
  specs: KeySpec[];
}

export default function SpecsBar({ specs }: SpecsBarProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      reveal(".sb-item", { y: 20, stagger: 0.08, trigger: barRef.current });
    },
    { scope: barRef }
  );

  return (
    <div
      ref={barRef}
      data-specsbar
      className="w-full bg-[#060606] border-t-2 border-b border-[#78BE20]/60 border-b-white/[0.04]"
    >
      <div className="ds-container grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06]">
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
                    <Counter value={num} decimals={decimals} />
                  ) : (
                    spec.value
                  )}
                </span>
                <span className="font-display text-[#78BE20] text-xl md:text-2xl ml-0.5">
                  {spec.unit}
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/65 mt-2.5">
                {spec.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
