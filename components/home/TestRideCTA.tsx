import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

export default function TestRideCTA() {
  return (
    <section className="w-full bg-[#0A0A0A] py-16 md:py-28 lg:py-40">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <Reveal className="max-w-2xl">

          <p className="text-[10px] tracking-[0.4em] text-white/65 uppercase mb-6">
            Book a test ride
          </p>

<p className="text-white/60 text-lg mb-12">
            200+ authorised locations worldwide.
          </p>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-4 w-full sm:w-auto px-10 py-4 bg-[#78BE20] text-black text-xs tracking-[0.3em] uppercase font-medium hover:bg-[#5a9018] transition-colors duration-200"
          >
            Reserve a Test Ride
          </Link>

        </Reveal>
      </div>
    </section>
  );
}
