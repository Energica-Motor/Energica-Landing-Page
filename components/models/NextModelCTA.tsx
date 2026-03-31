"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { type BikeModel } from "@/data/models";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

interface NextModelCTAProps {
  nextModel: BikeModel;
}

export default function NextModelCTA({ nextModel }: NextModelCTAProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      tl.from(".nm-label", { y: 20, opacity: 0, duration: 0.6, ease: "power3.out" })
        .from(".nm-name", { y: 50, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.3")
        .from(".nm-tag", { y: 20, opacity: 0, duration: 0.5, ease: "power3.out" }, "-=0.4")
        .from(".nm-cta", { y: 20, opacity: 0, duration: 0.5, ease: "power3.out" }, "-=0.3")
        .from(".nm-bike", { x: 60, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.8");
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#050505] overflow-hidden border-t border-white/[0.04]"
    >
      {/* Subtle grid decoration */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.018]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Accent glow */}
      <div
        aria-hidden
        className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at right center, ${nextModel.colors[0]?.hex ?? "#78BE20"}12 0%, transparent 60%)`,
        }}
      />

      <Container className="relative py-[60px] lg:py-[120px]">
      <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center gap-0">
        {/* ── Bike preview — shown FIRST on mobile, right column on desktop ── */}
        <div className="nm-bike relative h-[40vh] lg:h-[60vh] order-first lg:order-last mb-6 lg:mb-0">
          <Image
            src={nextModel.heroImage}
            alt={nextModel.name}
            fill
            className="object-contain object-center lg:object-right"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        {/* ── Left: text — shown SECOND on mobile, left column on desktop ── */}
        <div className="order-last lg:order-first">
          <p className="nm-label inline-flex items-center gap-3 mb-4 lg:mb-8">
            <span className="w-6 h-px bg-[#78BE20]" />
            <span className="text-[10px] uppercase tracking-[0.35em] text-white/65">
              Also from Energica
            </span>
          </p>

          <h2
            className="nm-name font-display text-white leading-none mb-2 lg:mb-4"
            style={{ fontSize: "clamp(48px, 9vw, 140px)" }}
          >
            {nextModel.name}
          </h2>

          <p className="nm-tag text-[length:var(--text-body)] text-white/60 italic mb-5 lg:mb-10">
            &ldquo;{nextModel.tagline}&rdquo;
          </p>

          {/* Key stats */}
          <div className="nm-tag flex items-center gap-6 mb-6 lg:mb-12">
            {nextModel.keySpecs.slice(0, 2).map((spec, i) => (
              <div key={spec.label} className={i > 0 ? "pl-6 border-l border-white/10" : ""}>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-3xl text-white">{spec.value}</span>
                  <span className="font-display text-sm text-[#78BE20]">{spec.unit}</span>
                </div>
                <p className="text-[9px] uppercase tracking-widest text-white/65 mt-0.5">
                  {spec.label}
                </p>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="lg"
            href={`/models/${nextModel.id}`}
            className="nm-cta"
          >
            View {nextModel.name} →
          </Button>
        </div>
      </div>
      </Container>
    </section>
  );
}
