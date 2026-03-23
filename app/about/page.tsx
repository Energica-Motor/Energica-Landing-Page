import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About | Energica Motor Company",
  description: "Born to Race. Reborn to Fly. Energica Motor Company — engineered in Modena's Motor Valley since 2009, exclusive MotoE supplier for 4 seasons.",
};

const STATS = [
  { stat: "2009", label: "Founded in Modena, Italy" },
  { stat: "4", label: "Seasons as exclusive MotoE supplier" },
  { stat: "4,000+", label: "Riders globally" },
  { stat: "135+", label: "Dealer & importer touchpoints" },
];

const CULTURAL = [
  { label: "Film", title: "Nope", sub: "Jordan Peele · 2022" },
  { label: "Film", title: "GI Joe: Snake Eyes", sub: "Paramount · 2021" },
  { label: "TV Feature", title: "Jay Leno's Garage", sub: "NBC · Multiple features" },
  { label: "Brand Advocate", title: "Nico Rosberg", sub: "F1 World Champion · Owner" },
];

export default function AboutPage() {
  return (
    <main className="bg-[#0a0a0a] text-white min-h-screen overflow-x-hidden">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative h-screen flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/new/home-slide-1.jpg"
            alt="Energica Motor Company — the full lineup on track"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
        {/* Gradient: dark bottom for text, subtle top for nav visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/55 to-black/25" />

        <Container className="relative z-10 w-full pb-20">
          <p className="inline-flex items-center gap-3 mb-5">
            <span className="w-6 h-px bg-[#78BE20]" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#78BE20]/80">
              Motor Valley · Modena, Italy · Est. 2009
            </span>
          </p>
          <h1
            className="font-display text-white leading-[0.92] mb-6"
            style={{ fontSize: "clamp(52px, 8.5vw, 124px)" }}
          >
            Italian Heritage,<br />
            <span className="text-[#78BE20]">Electric Soul.</span>
          </h1>
          <p className="text-sm text-white/65 max-w-[480px] leading-relaxed" style={{ fontFamily: "var(--font-ibm-sans)", fontWeight: 300 }}>
            Four electric motorcycles. One obsession. Engineered where Ferrari,
            Lamborghini and Ducati were born.
          </p>
        </Container>
      </section>

      {/* ── STORY + STATS ─────────────────────────────────────── */}
      <section className="w-full py-[120px]">
        <Container>
          <div className="grid lg:grid-cols-[3fr_2fr] gap-16 lg:gap-24 items-start">

            {/* Story text */}
            <div>
              <p className="inline-flex items-center gap-3 mb-6">
                <span className="w-6 h-px bg-[#78BE20]" />
                <span className="text-[10px] uppercase tracking-[0.35em] text-white/60">
                  Our Story
                </span>
              </p>
              <h2
                className="font-display text-white leading-none mb-8"
                style={{ fontSize: "clamp(36px, 5vw, 72px)" }}
              >
                Pioneers Since 2009.
              </h2>
              <p className="text-white/65 text-base leading-[1.9] mb-5">
                Energica Motor Company was founded in Modena, Italy — the same city
                that gave the world Ferrari, Lamborghini, and Maserati. From the
                very beginning, our mission was singular: build the world&apos;s most
                advanced electric motorcycles.
              </p>
              <p className="text-white/65 text-base leading-[1.9] mb-5">
                In 2019, we were named the exclusive motorcycle supplier to the FIM
                Enel MotoE World Cup — a role we held for four seasons,
                proving our technology against the most demanding conditions in
                professional motorsport.
              </p>
              <p className="text-white/65 text-base leading-[1.9]">
                Every lesson learned on the grid feeds directly into our road bikes.
                The result is a lineup of four motorcycles that no other manufacturer
                on earth can match for performance, refinement, or pedigree.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-col gap-8 lg:pt-14">
              {STATS.map((item) => (
                <div key={item.label} className="border-l-2 border-[#78BE20] pl-6 py-1">
                  <p
                    className="font-display text-white leading-none"
                    style={{ fontSize: "clamp(40px, 5vw, 64px)" }}
                  >
                    {item.stat}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 mt-2">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </Container>
      </section>

      {/* ── PULL QUOTE ────────────────────────────────────────── */}
      <section className="w-full bg-[#0d0d0d] border-y border-white/[0.04]">
        <Container className="py-20">
          <p className="font-display text-white leading-tight max-w-4xl"
            style={{ fontSize: "clamp(28px, 4vw, 56px)" }}>
            &ldquo;Performance is not a feature.{" "}
            <span className="text-[#78BE20]">It is the baseline.&rdquo;</span>
          </p>
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/40 mt-6 font-mono">
            Engineered in Motor Valley · Modena, Italy
          </p>
        </Container>
      </section>

      {/* ── CULTURAL VALIDATION ───────────────────────────────── */}
      <section className="w-full py-[120px]">
        <Container>
          <div className="grid lg:grid-cols-[2fr_3fr] gap-16 items-start">

            {/* Left — heading */}
            <div>
              <p className="inline-flex items-center gap-3 mb-6">
                <span className="w-6 h-px bg-[#78BE20]" />
                <span className="text-[10px] uppercase tracking-[0.35em] text-white/60">
                  Beyond the Road
                </span>
              </p>
              <h2
                className="font-display text-white leading-none"
                style={{ fontSize: "clamp(32px, 4.5vw, 64px)" }}
              >
                Earned<br />Visibility.<br />
                <span className="text-[#78BE20]">No Paid<br />Noise.</span>
              </h2>
              <p className="text-white/55 text-sm leading-relaxed mt-6 max-w-xs">
                Energica&apos;s presence in culture has been entirely organic — chosen
                by filmmakers, champions, and audiences for what the machines
                represent.
              </p>
            </div>

            {/* Right — cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CULTURAL.map((item) => (
                <div
                  key={item.title}
                  className="p-6 border border-white/[0.08] bg-[#0d0d0d] hover:border-[#78BE20]/30 transition-colors duration-300 group"
                >
                  <span className="text-[9px] uppercase tracking-[0.35em] text-[#78BE20]/70 font-mono block mb-3">
                    {item.label}
                  </span>
                  <p className="font-display text-white text-xl leading-tight mb-2 group-hover:text-[#78BE20] transition-colors duration-300">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-white/45 tracking-wide">
                    {item.sub}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </Container>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="w-full bg-[#0d0d0d] py-[120px] border-t border-white/[0.04]">
        <Container className="text-center">
          <p className="inline-flex items-center gap-3 mb-6 justify-center">
            <span className="w-6 h-px bg-[#78BE20]" />
            <span className="text-[10px] uppercase tracking-[0.35em] text-white/60">
              Progress, Ridden.
            </span>
            <span className="w-6 h-px bg-[#78BE20]" />
          </p>
          <h2
            className="font-display text-white leading-none mb-6"
            style={{ fontSize: "clamp(36px, 5vw, 72px)" }}
          >
            Experience Energica.
          </h2>
          <p className="text-white/60 text-base mb-10 max-w-[600px] mx-auto leading-relaxed">
            Book a free test ride at your nearest authorised dealer and feel
            what Motor Valley engineering delivers on the road.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <PrimaryButton href="/models">View All Models</PrimaryButton>
            <SecondaryButton href="/racing">Racing Heritage</SecondaryButton>
          </div>
        </Container>
      </section>

    </main>
  );
}
