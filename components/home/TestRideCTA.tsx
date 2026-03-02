import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

export default function TestRideCTA() {
  return (
    <section className="w-full bg-[#0A0A0A] py-28 md:py-40">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <Reveal className="max-w-2xl">

          <p className="text-[10px] tracking-[0.4em] text-white/20 uppercase mb-6">
            Free · No commitment
          </p>

          <h2 className="font-display text-[clamp(36px,8vw,96px)] text-white leading-tight uppercase mb-4">
            Words won&apos;t<br />do it justice.
          </h2>

          <p className="text-white/30 text-lg mb-12">
            Ride one. 200+ authorised locations worldwide.
          </p>

          <Link
            href="/test-ride"
            className="inline-flex items-center gap-4 px-10 py-4 bg-[rgb(0,255,0)] text-black text-xs tracking-[0.3em] uppercase font-medium hover:bg-[rgb(0,220,0)] transition-colors duration-200"
          >
            Book a Test Ride
          </Link>

        </Reveal>
      </div>
    </section>
  );
}
