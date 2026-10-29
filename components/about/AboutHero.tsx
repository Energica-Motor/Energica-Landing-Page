"use client";

import { Photo } from "@/components/ui/Photo";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { prefersReducedMotion, reveal } from "@/lib/motion";
import { Container } from "@/components/ui/Container";

export default function AboutHero() {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const imgRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ken Burns — slow zoom into the image
    if (!prefersReducedMotion()) {
      gsap.fromTo(
        imgRef.current,
        { scale: 1 },
        { scale: 1.07, duration: 12, ease: "none" }
      );
    }

    // Text stagger entry
    const ctx = gsap.context(() => {
      reveal(".ah-item", { y: 20, stagger: 0.08, scroll: false });
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative h-screen overflow-hidden">

      {/* Background — zoom wrapper */}
      <div ref={imgRef} className="absolute inset-0 will-change-transform">
        <Photo
          src="/images/new/home-slide-1.jpg"
          alt="Energica Motor Company — the full lineup on track"
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      {/* Gradient — lighter in the middle so bikes stay visible */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/40 to-black/15" />

      {/* Left accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-[#78BE20]/45 to-transparent pointer-events-none" />

      {/* Content — pinned bottom-left */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <Container className="pb-16">
          <div ref={wrapRef}>

            {/* Eyebrow */}
            <p className="ah-item inline-flex items-center gap-3 mb-5">
              <span className="w-6 h-px bg-[#78BE20]" />
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#78BE20]/80">
                Motor Valley · Modena, Italy · Est. 2009
              </span>
            </p>

            {/* Headline — whitespace-nowrap keeps each line on one row */}
            <h1
              className="ah-item font-display text-white leading-[0.92] mb-6 whitespace-nowrap"
              style={{ fontSize: "clamp(40px, 5.8vw, 88px)" }}
            >
              Italian Heritage,<br />
              <span className="text-[#78BE20]">Electric Soul.</span>
            </h1>

            {/* Sub-copy */}
            <p
              className="ah-item text-sm text-white/65 max-w-[440px] leading-relaxed"
              style={{ fontFamily: "var(--font-ibm-sans)", fontWeight: 300 }}
            >
              Four electric motorcycles. One obsession.
            </p>

            {/* Scroll indicator */}
            <div className="ah-item mt-8 flex items-center gap-3">
              <div className="w-px h-7 opacity-70 bg-[linear-gradient(to_bottom,#009246_0%,#009246_33%,#F1F2F1_33%,#F1F2F1_66%,#CE2B37_66%,#CE2B37_100%)]" />
              <span
                className="text-[9px] uppercase tracking-[0.45em] text-white/40"
                style={{ fontFamily: "var(--font-ibm-mono)" }}
              >
                Scroll
              </span>
            </div>

          </div>
        </Container>
      </div>

      {/* Bottom blend */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />

    </section>
  );
}
