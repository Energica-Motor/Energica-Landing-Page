import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import RacingHero from "@/components/racing/RacingHero";

export const metadata: Metadata = {
  title: "Racing Heritage | Energica Motor Company",
  description:
    "Energica — exclusive supplier to the FIM Enel MotoE World Cup for 7 consecutive seasons. Championship-winning technology on road-legal machines.",
};

const STATS = [
  { num: "7", label: "MotoE Seasons" },
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
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mt-2">
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
                <span className="text-[10px] uppercase tracking-[0.35em] text-white/35">
                  Born on the Track
                </span>
              </p>
              <h2
                className="font-display text-white leading-none mb-6"
                style={{ fontSize: "clamp(40px, 6vw, 80px)" }}
              >
                The Ego Corsa
              </h2>
              <p className="text-white/50 text-base leading-[1.8] mb-4 max-w-[750px]">
                The Ego Corsa is our race-specification motorcycle, purpose-built
                for competition. Every technological breakthrough on the grid feeds
                directly back into our road machines.
              </p>
              <p className="text-white/50 text-base leading-[1.8] mb-[32px] max-w-[750px]">
                The result: road-legal motorcycles with MotoE-derived electronics,
                battery management, and thermal efficiency that no other
                manufacturer can match.
              </p>
              <PrimaryButton href="/models/ego">View the Ego Road Bike →</PrimaryButton>
            </div>

            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-[#111]">
              <Image
                src="/images/Pagina%20EGO/ANN4778.jpg"
                alt="Energica Ego racing"
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

      {/* ── TECHNOLOGY TRANSFER ───────────────────────────────── */}
      <section className="w-full bg-[#0d0d0d] py-[120px] border-t border-white/[0.04]">
        <Container>
          <div className="mb-14 text-center">
            <p className="inline-flex items-center gap-3 mb-4">
              <span className="w-6 h-px bg-[#78BE20]" />
              <span className="text-[10px] uppercase tracking-[0.35em] text-white/35">
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
                <p className="text-white/45 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── GALLERY ───────────────────────────────────────────── */}
      <section className="w-full py-[120px] border-t border-white/[0.04]">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              "/images/Pagina%20EGO/ANN4779.jpg",
              "/images/Pagina%20EGO/ANN4787.jpg",
              "/images/Pagina%20EGO/ANN4778.jpg",
            ].map((src, i) => (
              <div
                key={i}
                className="relative overflow-hidden bg-[#111]"
                style={{ aspectRatio: "4/3" }}
              >
                <Image
                  src={src}
                  alt="Energica racing"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-600"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            ))}
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
            Experience the Difference.
          </h2>
          <p className="text-white/40 text-[length:var(--text-body)] mb-[32px] max-w-[750px] mx-auto">
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
