import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import TechStatPillar from "@/components/home/TechStatPillar";

const pillars = [
  {
    targetValue: 96,
    suffix: "%",
    label: "Peak Motor Efficiency",
    detail: "PMASynRM — full torque from standstill, no transmission loss",
  },
  {
    targetValue: 40,
    suffix: "min",
    label: "DC Fast Charge (0→80%)",
    detail: "CCS Combo — every public rapid network in Europe and beyond",
  },
  {
    targetValue: 4,
    suffix: "",
    label: "MotoE Seasons",
    detail: "Exclusive supplier to the FIM Enel MotoE World Cup since 2019",
  },
];

export default function TechStrip() {
  return (
    <section className="w-full bg-[#0A0A0A]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 py-20 md:py-28">

        {/* Header */}
        <Reveal className="flex items-end justify-between mb-16">
          <div>
            <span className="mono-tag mb-4 inline-block">Engineering</span>
            <h2 className="font-display text-[clamp(28px,5vw,56px)] text-white leading-tight uppercase">
              Real Numbers.<br />
              <span className="text-white/45">Unreal Performance.</span>
            </h2>
          </div>
          <Link
            href="/technology"
            className="text-[10px] tracking-[0.3em] text-white/65 uppercase hover:text-white transition-colors hidden md:block"
            style={{ fontFamily: "var(--font-ibm-mono)" }}
          >
            Technology →
          </Link>
        </Reveal>

        {/* Three pillars — animated odometer counters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.06]">
          {pillars.map((pillar, i) => (
            <Reveal key={pillar.label} delay={i * 80}>
              <TechStatPillar
                targetValue={pillar.targetValue}
                suffix={pillar.suffix}
                label={pillar.label}
                detail={pillar.detail}
              />
            </Reveal>
          ))}
        </div>

        <div className="mt-10 md:hidden">
          <Link
            href="/technology"
            className="text-[10px] tracking-[0.3em] text-white/65 uppercase"
            style={{ fontFamily: "var(--font-ibm-mono)" }}
          >
            Technology →
          </Link>
        </div>

      </div>
    </section>
  );
}
