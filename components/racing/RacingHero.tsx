"use client";

import { useRef } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import TrackOutline from "@/components/racing/TrackOutline";
import ParticleCanvas from "@/components/ui/ParticleCanvas";

/**
 * Client wrapper for the racing page hero section.
 * Includes TrackOutline (GSAP ScrollTrigger) and ParticleCanvas (ambient particles).
 */
export default function RacingHero() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="relative h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/MotoAmerica/BJNB2279_3_P.jpg"
          alt="Energica MotoAmerica Racing"
          fill
          priority
          className="object-cover"
          style={{ objectPosition: "60% center" }}
          sizes="100vw"
        />
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-black/05" />

      {/* Ambient particles */}
      <ParticleCanvas />

      {/* SVG Track outline */}
      <TrackOutline sectionRef={sectionRef} />

      <Container className="relative z-10 w-full pt-20">
        <span className="mono-tag mb-6 inline-flex items-center gap-3">
          MotoE · MotoAmerica · Racing Heritage
        </span>
        <h1
          className="font-display text-white leading-[0.92] mb-8"
          style={{ fontSize: "clamp(56px, 10vw, 148px)" }}
        >
          FULL<br />
          ATTACK.<br />
          <span className="text-[#78BE20]">NO<br />COMPROMISE.</span>
        </h1>
        <p className="text-[length:var(--text-body-lg)] text-white/65 max-w-[540px] leading-relaxed" style={{ fontFamily: "var(--font-ibm-sans)", fontWeight: 300 }}>
          4 seasons. 22+ rounds. One motorcycle — the Energica Ego Corsa.
          Exclusive supplier to the FIM Enel MotoE World Cup. First electric in MotoAmerica.
          The track doesn't lie.
        </p>
      </Container>

      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
    </section>
  );
}
