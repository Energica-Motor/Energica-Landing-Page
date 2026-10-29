"use client";

import { useRef } from "react";
import { Photo } from "@/components/ui/Photo";
import { useGSAP } from "@gsap/react";
import { reveal } from "@/lib/motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { StatCounter } from "@/components/ui/StatCounter";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

gsap.registerPlugin(ScrollTrigger);

const PHOTOS = [
  "/images/MotoAmerica/BJN61888_P-2048x1365.jpg",   // [0] story panel — paddock atmosphere
  "/images/MotoAmerica/BJNB1284_P.jpg",              // [1] grid cell 1 — Laguna Seca corkscrew
  "/images/MotoAmerica/MotoAmerica-3-1200x900.jpg",  // [2] unused slot
  "/images/MotoAmerica/797236-16x9-lg.jpg",            // [3] wide hero cell — 3 bikes, tree-lined circuit
  "/images/MotoAmerica/BJNB2683_3_P.jpg",            // [4] grid cell 2 — left-lean action
  "/images/MotoAmerica/MotoAmerica-3-1200x900.jpg",  // [5] grid cell 3 — top-down overhead
];

export default function MotoAmericaSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      reveal(".ma-eyebrow", { y: 20 });
      reveal(".ma-headline", { y: 20 });
      reveal(".ma-para", { y: 20, stagger: 0.08, trigger: ".ma-copy" });
      reveal(".ma-cta", { y: 20 });
      reveal(".ma-hero-img", { scale: 1.02 });
      reveal(".ma-cell", { y: 20, stagger: 0.08, trigger: ".ma-grid" });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="w-full border-t border-white/[0.04]">

      {/* ── STORY PANEL ─────────────────────────────────────────── */}
      <div className="w-full ds-section bg-[#0a0a0a]">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Text */}
            <div>
              <p className="ma-eyebrow inline-flex items-center gap-3 mb-6">
                <span className="w-6 h-px bg-[#CE2B37]" />
                <span className="text-[10px] uppercase tracking-[0.35em] text-white/60 font-mono">
                  MotoAmerica · 2023–2024
                </span>
              </p>

              <h2
                className="ma-headline font-display text-white leading-[0.92] mb-6"
                style={{ fontSize: "clamp(40px, 6vw, 80px)" }}
              >
                First Electric.<br />
                <span className="text-[#78BE20]">Super Hooligan.</span>
              </h2>

              <div className="ma-copy space-y-4 mb-8">
                <p className="ma-para text-white/65 text-base leading-[1.8] max-w-[600px]">
                  In 2023, the Eva Ribelle became the first electric motorcycle
                  to compete in the MotoAmerica Super Hooligan National
                  Championship — a production-based class where raw character
                  matters as much as lap time.
                </p>
                <p className="ma-para text-white/65 text-base leading-[1.8] max-w-[600px]">
                  Electric torque. MotoAmerica competition. Same motorcycle.
                </p>
              </div>

              <div className="ma-cta flex flex-wrap gap-4">
                <PrimaryButton href="/models/eva-ribelle">
                  Discover the Eva Ribelle
                </PrimaryButton>
                <SecondaryButton href="/racing">
                  Racing Heritage
                </SecondaryButton>
              </div>
            </div>

            {/* Featured photo */}
            <div className="ma-hero-img relative aspect-[4/3] overflow-hidden bg-[#111]">
              <Photo
                src={PHOTOS[0]}
                alt="Eva Ribelle — MotoAmerica Super Hooligan Championship"
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, (max-width: 1343px) 50vw, 640px"
              />
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#78BE20]" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#78BE20]" />
              <div className="absolute bottom-4 left-4">
                <span className="mono-tag" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}>Super Hooligan National Championship</span>
              </div>
            </div>

          </div>
        </Container>
      </div>

      {/* ── STATS STRIP ─────────────────────────────────────────── */}
      <div className="w-full bg-[#111] border-y border-white/[0.06]">
        <Container className="py-14">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center items-end">
            <div className="flex flex-col items-center gap-2">
              <StatCounter value={2} label="" className="items-center" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/65">
                Seasons Racing
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-end justify-center gap-1">
                <span
                  className="font-display text-white tabular-nums leading-none"
                  style={{ fontSize: "clamp(48px, 7vw, 96px)" }}
                >
                  1
                </span>
                <span
                  className="font-display text-[#78BE20] leading-none mb-1"
                  style={{ fontSize: "clamp(20px, 3vw, 40px)" }}
                >
                  st
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/65">
                Electric Entry
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p
                className="font-display text-[#78BE20] leading-none"
                style={{ fontSize: "clamp(28px, 4vw, 56px)" }}
              >
                MotoAmerica
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/65">
                Super Hooligan National Championship
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* ── PHOTO GRID ──────────────────────────────────────────── */}
      <div className="w-full ds-section bg-[#0d0d0d]">
        <Container>
          <div className="mb-10 inline-flex items-center gap-3">
            <span className="w-6 h-px bg-[#CE2B37]" />
            <span className="text-[10px] uppercase tracking-[0.35em] text-white/65 font-mono">
              On Track
            </span>
          </div>

          <div className="ma-grid grid grid-cols-1 md:grid-cols-3 gap-3">

            {/* Wide hero cell — BJNB2669 (not used elsewhere) */}
            <div
              className="ma-cell md:col-span-3 group relative overflow-hidden bg-[#111]"
              style={{ aspectRatio: "21/9" }}
            >
              <Photo
                src={PHOTOS[3]}
                alt="Eva Ribelle MotoAmerica — race action"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                style={{ objectPosition: "center 65%" }}
                sizes="100vw"
              />
              <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#78BE20] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>

            {/* Three standard cells — BJNB1846, BJNB2683, BJNB2689 */}
            {[PHOTOS[1], PHOTOS[4], PHOTOS[5]].map((src, i) => (
              <div
                key={src}
                className="ma-cell group relative overflow-hidden bg-[#111]"
                style={{ aspectRatio: "4/3" }}
              >
                <Photo
                  src={src}
                  alt={`Eva Ribelle MotoAmerica — ${i + 2}`}
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1343px) 33vw, 420px"
                />
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#78BE20] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            ))}

          </div>
        </Container>
      </div>

    </section>
  );
}
