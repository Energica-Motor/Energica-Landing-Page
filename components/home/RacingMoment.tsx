import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

export default function RacingMoment() {
  return (
    <section className="relative w-full h-[70vh] md:h-screen overflow-hidden bg-[#0A0A0A]">

      <Image
        src="/images/MotoAmerica/BJNB2279_3_P.jpg"
        alt="Energica Racing"
        fill
        className="object-cover opacity-60"
        sizes="100vw"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

      <div className="absolute bottom-12 md:bottom-20 left-0 right-0 z-10">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <Reveal>
            <span className="mono-tag mb-5 inline-block">MotoE · MotoAmerica</span>
            <h2 className="font-display text-[clamp(36px,9vw,112px)] text-white leading-none uppercase mb-4">
              Born<br />On Track.
            </h2>
            <p className="text-sm text-white/65 mb-6 font-light max-w-sm" style={{ fontFamily: "var(--font-ibm-sans)" }}>
              Every watt. Every lap. Every championship.<br />Race-proven, road-ridden.
            </p>
            <Link href="/racing" className="inline-flex items-center gap-3 group">
              <div className="w-8 h-px bg-white/40 group-hover:w-12 transition-all duration-300" />
              <span className="text-xs tracking-[0.3em] text-white/60 uppercase group-hover:text-white transition-colors" style={{ fontFamily: "var(--font-ibm-mono)" }}>
                Full Racing Story
              </span>
            </Link>
          </Reveal>
        </div>
      </div>

    </section>
  );
}
