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
    <section ref={sectionRef} className="relative h-screen overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/MotoAmerica/BJNB2279_3_P.jpg"
          alt="Energica MotoAmerica Racing"
          fill
          priority
          className="object-cover"
          style={{ objectPosition: "65% center" }}
          sizes="100vw"
        />
      </div>
      {/* Overlay — stronger left fade so text always readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />

      {/* Ambient particles */}
      <ParticleCanvas />

      {/* SVG Track outline */}
      <TrackOutline sectionRef={sectionRef} />

      {/* Content — pinned to bottom-left like most racing hero layouts */}
      <div className="absolute bottom-16 left-0 right-0 z-10">
        <Container>
          <span className="mono-tag mb-5 inline-block">
            MotoE · MotoAmerica · Racing Heritage
          </span>
          <h1
            className="font-display text-white leading-[0.93] mb-6 whitespace-nowrap"
            style={{ fontSize: "clamp(40px, 6.5vw, 100px)" }}
          >
            BORN TO RACE.<br />
            <span className="text-[#78BE20]">REBORN TO FLY.</span>
          </h1>
          <p className="text-sm text-white/65 max-w-[480px] leading-relaxed" style={{ fontFamily: "var(--font-ibm-sans)", fontWeight: 300 }}>
            4 seasons. 22+ rounds. One motorcycle — the Energica Ego Corsa.<br />
            Exclusive MotoE supplier. First electric entry in MotoAmerica.
          </p>
        </Container>
      </div>

      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
    </section>
  );
}
