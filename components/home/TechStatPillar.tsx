"use client";

import { Counter } from "@/components/ui/Counter";

interface TechStatPillarProps {
  targetValue: number;
  suffix: string;
  label: string;
  detail: string;
  decimals?: number;
}

/**
 * Stat pillar whose number renders its real value and counts up once fully
 * in view (components/ui/Counter).
 */
export default function TechStatPillar({
  targetValue,
  suffix,
  label,
  detail,
  decimals = 0,
}: TechStatPillarProps) {
  return (
    <div className="bg-[#0A0A0A] p-8 md:p-10">
      <div className="font-display text-[clamp(40px,5vw,64px)] text-white leading-none mb-3">
        <Counter value={targetValue} decimals={decimals} />
        {suffix}
      </div>
      <div className="mono-tag mb-4 inline-block">{label}</div>
      <p
        className="text-sm text-white/60 leading-relaxed"
        style={{ fontFamily: "var(--font-ibm-sans)", fontWeight: 300 }}
      >
        {detail}
      </p>
    </div>
  );
}
