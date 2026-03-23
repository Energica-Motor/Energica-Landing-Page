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
          style={{ objectPosition: "center 30%", transform: "scale(0.92)", transformOrigin: "center 30%" }}
          sizes="100vw"
        />
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20" />

      {/* Ambient particles */}
      <ParticleCanvas />

      {/* SVG Track outline */}
      <TrackOutline sectionRef={sectionRef} />

      <Container className="relative z-10 w-full pt-20">
        <span className="mono-tag mb-6 inline-flex items-center gap-3">
          Racing Heritage
        </span>
        <h1
          className="font-display text-white leading-none mb-6"
          style={{ fontSize: "clamp(64px, 11vw, 160px)" }}
        >
          4 Seasons.<br />
          <span className="text-[#78BE20]">One Supplier.</span>
        </h1>
        <p className="text-[length:var(--text-body-lg)] text-white/55 max-w-[750px] leading-relaxed" style={{ fontFamily: "var(--font-ibm-sans)", fontWeight: 300 }}>
          Since the FIM Enel MotoE World Cup began in 2019, Energica has been
          the sole motorcycle supplier — every race, every round, every
          championship.
        </p>
      </Container>

      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
    </section>
  );
}
