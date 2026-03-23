"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Container } from "@/components/ui/Container";
import ParticleCanvas from "@/components/ui/ParticleCanvas";

export default function AboutHero() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".ah-item", {
        opacity: 0,
        y: 32,
        duration: 1,
        stagger: 0.14,
        ease: "power3.out",
        delay: 0.25,
      });
    }, wrapRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="relative h-screen flex items-end overflow-hidden">

      {/* Background */}
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

      {/* Layered gradient — strong bottom read, subtle top for nav */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/60 to-black/20" />

      {/* Ambient particles */}
      <ParticleCanvas />

      {/* Left accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-[#78BE20]/50 to-transparent pointer-events-none" />

      {/* Content */}
      <Container className="relative z-10 w-full pb-28">
        <div ref={wrapRef}>

          {/* Eyebrow */}
          <p className="ah-item inline-flex items-center gap-3 mb-5">
            <span className="w-6 h-px bg-[#78BE20]" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#78BE20]/80">
              Motor Valley · Modena, Italy · Est. 2009
            </span>
          </p>

          {/* Headline */}
          <h1
            className="ah-item font-display text-white leading-[0.92] mb-6"
            style={{ fontSize: "clamp(52px, 8.5vw, 124px)" }}
          >
            Italian Heritage,<br />
            <span className="text-[#78BE20]">Electric Soul.</span>
          </h1>

          {/* Sub-copy */}
          <p
            className="ah-item text-sm text-white/65 max-w-[480px] leading-relaxed"
            style={{ fontFamily: "var(--font-ibm-sans)", fontWeight: 300 }}
          >
            Four electric motorcycles. One obsession. Engineered where Ferrari,
            Lamborghini and Ducati were born.
          </p>

          {/* Scroll indicator */}
          <div className="ah-item mt-10 flex items-center gap-3">
            <div className="w-px h-8 bg-[#78BE20]/45" />
            <span
              className="text-[9px] uppercase tracking-[0.45em] text-white/40"
              style={{ fontFamily: "var(--font-ibm-mono)" }}
            >
              Scroll
            </span>
          </div>

        </div>
      </Container>

      {/* Bottom blend into page bg */}
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />

    </section>
  );
}
