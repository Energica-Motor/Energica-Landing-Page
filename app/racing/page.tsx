import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import RacingHero from "@/components/racing/RacingHero";
import MotoAmericaSection from "@/components/racing/MotoAmericaSection";

export const metadata: Metadata = {
  title: "Racing Heritage | Energica Motor Company",
  description:
    "Energica — exclusive supplier to the FIM Enel MotoE World Cup for 4 seasons. Championship-winning technology on road-legal machines.",
};

const STATS = [
  { num: "4", label: "MotoE Seasons" },
  { num: "1", label: "Exclusive Supplier" },
  { num: "22+", label: "Race Rounds" },
];

export default function RacingPage() {
  return (
    <main className="bg-[#0a0a0a] text-white min-h-screen overflow-x-hidden">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <RacingHero />

      {/* ── STATS BAR ─────────────────────────────────────────── */}
      <section className="w-full bg-[#111] border-y border-white/[0.06]">
        <Container className="py-14">
          <div className="grid grid-cols-3 gap-8 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <p
                  className="font-display text-white"
                  style={{ fontSize: "clamp(48px, 7vw, 96px)" }}
                >
                  {s.num}
                </p>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/65 mt-2">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── EGO CORSA STORY ───────────────────────────────────── */}
      <section className="w-full py-[120px]">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Text */}
            <div>
              <p className="inline-flex items-center gap-3 mb-6">
                <span className="w-6 h-px bg-[#78BE20]" />
                <span className="text-[10px] uppercase tracking-[0.35em] text-white/60">
                  Born on the Track
                </span>
              </p>
              <h2
                className="font-display text-white leading-none mb-6"
                style={{ fontSize: "clamp(40px, 6vw, 80px)" }}
              >
                The Ego Corsa
              </h2>
              <p className="text-white/65 text-base leading-[1.8] mb-4 max-w-[750px]">
                The Ego Corsa is our race-specification motorcycle, purpose-built
                for competition. Every technological breakthrough on the grid feeds
                directly back into our road machines.
              </p>
              <p className="text-white/65 text-base leading-[1.8] mb-[32px] max-w-[750px]">
                The result: road-legal motorcycles with MotoE-derived electronics,
                battery management, and thermal efficiency that no other
                manufacturer can match.
              </p>
              <PrimaryButton href="/models/ego">View the Ego Road Bike →</PrimaryButton>
            </div>

            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-[#111]">
              <Image
                src="/images/MotoE/Ferrari_MotoE_R11_Assen-19.jpg"
                alt="Energica Ego Corsa on the MotoE grid at Assen"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#78BE20]" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#78BE20]" />
            </div>
          </div>
        </Container>
      </section>

      {/* ── MOTOAMERICA ───────────────────────────────────────── */}
      <MotoAmericaSection />

      {/* ── TECHNOLOGY TRANSFER ───────────────────────────────── */}
      <section className="w-full bg-[#0d0d0d] py-[120px] border-t border-white/[0.04]">
        <Container>
          <div className="mb-14 text-center">
            <p className="inline-flex items-center gap-3 mb-4">
              <span className="w-6 h-px bg-[#78BE20]" />
              <span className="text-[10px] uppercase tracking-[0.35em] text-white/65">
                From Circuit to Street
              </span>
              <span className="w-6 h-px bg-[#78BE20]" />
            </p>
            <h2
              className="font-display text-white leading-none"
              style={{ fontSize: "clamp(36px, 5vw, 72px)" }}
            >
              Race Technology.<br />Road Legal.
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                title: "PMASynRM Motor",
                body: "The same motor architecture powering every MotoE grid machine, refined for road use with identical peak efficiency.",
              },
              {
                title: "Battery Management",
                body: "Race-spec thermal management and BMS algorithms, tested across 4 seasons of competitive motorsport.",
              },
              {
                title: "Bosch MSC Electronics",
                body: "Motorcycle Stability Control, Cornering ABS, and traction control — straight from the race paddock.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 border border-white/[0.06] bg-[#0a0a0a] hover:border-[#78BE20]/25 transition-colors duration-300"
              >
                <h3 className="font-display text-white text-xl mb-3">
                  {item.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── MOTOE WORLD CUP GALLERY ───────────────────────────── */}
      <section className="w-full py-[120px] border-t border-white/[0.04]">
        <Container>

          {/* Section header */}
          <div className="mb-12">
            <p className="inline-flex items-center gap-3 mb-4">
              <span className="w-6 h-px bg-[#78BE20]" />
              <span className="text-[10px] uppercase tracking-[0.35em] text-white/60">
                2019 – 2022
              </span>
            </p>
            <h2
              className="font-display text-white leading-none"
              style={{ fontSize: "clamp(32px, 4.5vw, 64px)" }}
            >
              FIM Enel MotoE<br />
              <span className="text-[#78BE20]">World Cup.</span>
            </h2>
          </div>

          {/* 5-image magazine grid */}
          <div className="grid grid-cols-3 grid-rows-2 gap-3" style={{ height: "clamp(420px, 55vw, 760px)" }}>

            {/* Large hero cell — col-span-2, row-span-2 */}
            <div className="relative col-span-2 row-span-2 overflow-hidden bg-[#111] group">
              <Image
                src="/images/MotoE/5NG_0427.jpg"
                alt="Ego Corsa — FIM Enel MotoE World Cup"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="66vw"
              />
            </div>

            {/* Small cell 1 */}
            <div className="relative overflow-hidden bg-[#111] group">
              <Image
                src="/images/MotoE/5NG_5156.jpg"
                alt="Ego Corsa on track — MotoE"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                sizes="33vw"
              />
            </div>

            {/* Small cell 2 */}
            <div className="relative overflow-hidden bg-[#111] group">
              <Image
                src="/images/MotoE/5NG_5288.jpg"
                alt="Ego Corsa racing — MotoE grid"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                sizes="33vw"
              />
            </div>

          </div>

          {/* Bottom row — remaining 2 images full-width split */}
          <div className="grid grid-cols-2 gap-3 mt-3" style={{ height: "clamp(200px, 24vw, 340px)" }}>

            <div className="relative overflow-hidden bg-[#111] group">
              <Image
                src="/images/MotoE/LG5_1964.jpg"
                alt="Energica Ego Corsa — MotoE championship"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="50vw"
              />
            </div>

            <div className="relative overflow-hidden bg-[#111] group">
              <Image
                src="/images/MotoE/Ferrari_MotoE_R11_Assen-19.jpg"
                alt="Ego Corsa — Assen MotoE round"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="50vw"
              />
              {/* Caption overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-[9px] uppercase tracking-[0.35em] text-white/60">
                  Assen · Round 11
                </p>
              </div>
            </div>

          </div>

        </Container>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="w-full bg-[#0f0f0f] py-[120px] border-t border-white/[0.04]">
        <Container className="text-center">
          <h2
            className="font-display text-white leading-none mb-[24px]"
            style={{ fontSize: "var(--text-h1)" }}
          >
            Ride one. 200+ locations worldwide.
          </h2>
          <p className="text-white/60 text-[length:var(--text-body)] mb-[32px] max-w-[750px] mx-auto">
            Book a free test ride at your nearest authorised dealer.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <PrimaryButton href="/test-ride">Book Test Ride</PrimaryButton>
            <SecondaryButton href="/models">View All Models</SecondaryButton>
          </div>
        </Container>
      </section>

    </main>
  );
}
