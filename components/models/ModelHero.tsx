"use client";

import { useRef } from "react";
import { Photo } from "@/components/ui/Photo";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion, reveal } from "@/lib/motion";
import { type BikeModel } from "@/data/models";
import { PrimaryButton, SecondaryButton, Button } from "@/components/ui/Button";
import { configuratorModelFor } from "@/lib/configurator-models";

interface ModelHeroProps {
  model: BikeModel;
}

export default function ModelHero({ model }: ModelHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const configuratorModel = configuratorModelFor(model.id);

  useGSAP(
    () => {
      /* Bike slides in from right, scales up */
      reveal(".mh-bike", { x: "4vw", scale: 0.97, scroll: false });

      /* Text cascade */
      reveal([".mh-eyebrow", ".mh-title", ".mh-tagline", ".mh-inline-spec", ".mh-cta", ".mh-scroll"], { y: 20, stagger: 0.06, scroll: false });

      /* Subtle parallax drift on the bike as page scrolls */
      if (prefersReducedMotion()) return;
      gsap.to(".mh-bike", {
        y: "-10%",
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      // Phones and small tablets stack the bike above the text; from md the
      // bike sits to the right of it
      className="relative w-full bg-[#0a0a0a] flex flex-col pt-24 pb-12 md:pb-0 md:flex-row md:items-center md:h-screen md:min-h-[680px] overflow-hidden md:pt-20"
    >
      {/* ── Radial glow behind the bike ─────────────────────── */}
      <div
        aria-hidden
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[65vw] h-[90vh] pointer-events-none hidden md:block"
        style={{
          background: `radial-gradient(ellipse at 75% 50%, ${model.colors[0]?.hex ?? "#78BE20"}18 0%, transparent 60%)`,
        }}
      />

      {/* ── Ghost watermark name ─────────────────────────────── */}
      <div
        aria-hidden
        className="absolute inset-0 overflow-hidden pointer-events-none select-none hidden md:block"
        style={{ left: "42%" }}
      >
        <span
          className="font-display text-white/[0.07] leading-none absolute top-1/2 -translate-y-1/2"
          style={{ fontSize: "clamp(120px, 22vw, 320px)" }}
        >
          {model.name.replace(/[\s+]/g, "")}
        </span>
      </div>

      {/* ── Bike image ──────────────────────────────────────── */}
      <div className="mh-bike relative w-full aspect-[16/10] mb-6 md:mb-0 md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2 md:w-[55vw] md:max-w-[860px] md:h-[72vh] md:aspect-auto pointer-events-none will-change-transform">
        <Photo
          src={model.heroImage}
          alt={`${model.name} motorcycle`}
          priority
          className="object-contain object-center md:object-right"
          sizes="(max-width: 767px) 100vw, 55vw"
        />
      </div>

      {/* ── Gradient overlay — protects the text beside the bike (md+) ── */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent pointer-events-none z-[1] hidden md:block"
      />

      {/* ── Vertical accent line (large screens) ────────────── */}
      <div
        aria-hidden
        className="absolute left-14 top-1/2 -translate-y-1/2 w-[2px] h-40 bg-[#78BE20] hidden xl:block z-[2]"
        style={{ opacity: 0.6 }}
      />

      {/* ── Text panel ──────────────────────────────────────── */}
      <div className="relative z-10 ds-container *:max-w-xl">
        {/* Eyebrow */}
        <p className="mh-eyebrow inline-flex items-center gap-3 mb-4">
          <span className="w-8 h-px bg-[#CE2B37]" />
          <span className="text-[11px] uppercase tracking-[0.35em] text-white/65">
            Energica Motorcycles
          </span>
        </p>

        {/* Model name */}
        <h1
          className="mh-title font-display text-white leading-none mb-4"
          style={{ fontSize: "clamp(40px, 9vw, 150px)" }}
        >
          {model.name}
        </h1>

        {/* Tagline */}
        <p className="mh-tagline text-base md:text-lg text-white/60 italic mb-5">
          &ldquo;{model.tagline}&rdquo;
        </p>

        {/* Inline key specs — first two */}
        <div className="flex items-stretch gap-0 mb-8">
          {model.keySpecs.slice(0, 2).map((spec, i) => (
            <div
              key={spec.label}
              className={`mh-inline-spec pr-6 ${i > 0 ? "pl-6 border-l border-white/10" : ""}`}
            >
              <div className="flex items-baseline gap-1">
                <span className="font-display text-3xl md:text-4xl text-white">
                  {spec.value}
                </span>
                <span className="font-display text-sm text-[#78BE20]">{spec.unit}</span>
              </div>
              <p className="text-[9px] uppercase tracking-[0.25em] text-white/60 mt-0.5">
                {spec.label}
              </p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <PrimaryButton href="/contact" className="mh-cta">Enquire Now</PrimaryButton>
          {configuratorModel && (
            <SecondaryButton href={`/configurator?model=${configuratorModel}`} className="mh-cta">
              Configure
            </SecondaryButton>
          )}
          <SecondaryButton href="/dealers" className="mh-cta">Find a Dealer</SecondaryButton>
        </div>
      </div>

      {/* ── Scroll hint ─────────────────────────────────────── */}
      <div className="mh-scroll absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2">
        <span className="text-[9px] uppercase tracking-[0.3em] text-white/60">Scroll</span>
        <div className="w-px h-8 bg-white/15 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-full bg-[linear-gradient(to_bottom,#009246_0%,#009246_33%,#F1F2F1_33%,#F1F2F1_66%,#CE2B37_66%,#CE2B37_100%)] scroll-indicator-line" />
        </div>
      </div>

    </section>
  );
}
