import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

const pillars = [
  {
    number: "96%",
    label: "Peak Motor Efficiency",
    detail: "PMASynRM — full torque from zero RPM, zero transmission loss",
  },
  {
    number: "40min",
    label: "DC Fast Charge (0→80%)",
    detail: "CCS Combo — every public rapid network in Europe and beyond",
  },
  {
    number: "7",
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
          <h2 className="font-display text-[clamp(28px,5vw,56px)] text-white leading-tight uppercase">
            Built different.<br />
            <span className="text-white/20">By design.</span>
          </h2>
          <Link
            href="/technology"
            className="text-[10px] tracking-[0.3em] text-white/30 uppercase hover:text-white transition-colors hidden md:block"
          >
            Technology →
          </Link>
        </Reveal>

        {/* Three pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.06]">
          {pillars.map((pillar, i) => (
            <Reveal key={pillar.number} delay={i * 80} className="bg-[#0A0A0A] p-8 md:p-10">
              <div className="font-display text-[clamp(40px,5vw,64px)] text-white leading-none mb-3">
                {pillar.number}
              </div>
              <div className="text-[10px] tracking-[0.3em] text-[rgb(0,255,0)] uppercase mb-4">
                {pillar.label}
              </div>
              <p className="text-sm text-white/30 leading-relaxed">
                {pillar.detail}
              </p>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 md:hidden">
          <Link
            href="/technology"
            className="text-[10px] tracking-[0.3em] text-white/30 uppercase"
          >
            Technology →
          </Link>
        </div>

      </div>
    </section>
  );
}
