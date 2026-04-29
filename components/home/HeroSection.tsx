"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useScramble } from "@/lib/use-scramble";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const [scrambleTrigger, setScrambleTrigger] = useState(false);

  // Scramble runs on aria-hidden overlay — real H1 stays stable for LCP
  const scrambleRef = useScramble("PROGRESS,\nRIDDEN.", scrambleTrigger);

  useEffect(() => {
    if (videoRef.current) videoRef.current.play().catch(() => {});
    setScrambleTrigger(true);
    // Defer YouTube iframe until after first paint + idle
    let ric: number;
    if (typeof requestIdleCallback !== "undefined") {
      ric = requestIdleCallback(() => setIframeReady(true), { timeout: 2000 });
    } else {
      ric = window.setTimeout(() => setIframeReady(true), 1500);
    }
    return () => {
      if (typeof cancelIdleCallback !== "undefined") cancelIdleCallback(ric);
      else clearTimeout(ric);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Defer GSAP init to after first paint — avoids forced reflow on load
    const raf = requestAnimationFrame(() => {
    const wrapper = document.querySelector("[data-hero-wrapper]") ?? section;

    const ctx = gsap.context(() => {
      // Zoom out plays across the full 200vh wrapper — always moving,
      // never frozen. Scale 1.4 → 1.0 gives a clear cinematic pull-back.
      gsap.fromTo(
        mediaRef.current,
        { scale: 1.4 },
        {
          scale: 1.0,
          ease: "none",
          scrollTrigger: {
            trigger: wrapper,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );

      // Text fades in the first half of the scroll
      gsap.to(contentRef.current, {
        y: -60,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: "50% bottom",
          scrub: 1,
        },
      });
    }, section);

    return () => ctx.revert();
    }); // end requestAnimationFrame

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full h-dvh overflow-hidden bg-black">

      {/* Background — starts zoomed in, zooms out on scroll */}
      <div ref={mediaRef} className="absolute inset-0 will-change-transform">
        <Image
          src="/images/new/home-slide-1.jpg"
          alt="Energica — Progress, Ridden."
          fill
          priority
          className="object-cover object-center opacity-70"
          sizes="100vw"
        />

        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? "opacity-100" : "opacity-0"
          }`}
          src="/videos/energica-hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={() => setVideoLoaded(true)}
        />

        {!videoLoaded && iframeReady && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <iframe
              style={{
                position: "absolute",
                width: "max(100%, calc(100dvh * 16 / 9))",
                height: "max(100%, calc(100dvw * 9 / 16))",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                border: "none",
              }}
              src="https://www.youtube-nocookie.com/embed/vKfU7NPIEI4?autoplay=1&mute=1&loop=1&playlist=vKfU7NPIEI4&controls=0&showinfo=0&rel=0&start=12&modestbranding=1"
              allow="autoplay; encrypted-media"
              title="Energica"
            />
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85 z-10 pointer-events-none" />

      <div ref={contentRef} className="absolute bottom-0 left-0 right-0 z-20 will-change-transform pb-[max(4rem,env(safe-area-inset-bottom,0px)+2rem)] md:pb-20">
        <div className="max-w-[1600px] mx-auto px-[clamp(24px,4vw,64px)]">
          <span className="mono-tag mb-5 block">Modena, Italy · Est. 2009</span>
          {/* Real H1 — stable text for LCP, never mutated */}
          <div className="relative mb-3">
            <h1 className="font-display text-[clamp(52px,9vw,112px)] text-white leading-none uppercase tracking-wide whitespace-pre-line">
              PROGRESS,{"\n"}RIDDEN.
            </h1>
            {/* Scramble overlay — aria-hidden so screen readers see real text only */}
            <h1
              ref={scrambleRef as React.RefObject<HTMLHeadingElement>}
              aria-hidden="true"
              className="font-display text-[clamp(52px,9vw,112px)] text-white leading-none uppercase tracking-wide whitespace-pre-line absolute inset-0 pointer-events-none"
            >
              PROGRESS,{"\n"}RIDDEN.
            </h1>
          </div>
          <p className="text-sm text-white/70 font-light tracking-wide mb-7 max-w-md" style={{ fontFamily: "var(--font-ibm-sans)" }}>
            Born in Modena. Proven on the racetrack.{" "}<br className="hidden md:block" />Exclusive MotoE supplier. Four seasons.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <Link href="/models" className="text-xs tracking-[0.25em] uppercase text-white border-b border-white/40 pb-0.5 hover:border-white transition-colors duration-200" style={{ fontFamily: "var(--font-ibm-mono)" }}>
              Explore the lineup
            </Link>
            <span className="hidden sm:inline text-white/20">·</span>
            <Link href="/contact" className="text-xs tracking-[0.25em] uppercase text-[#78BE20] border-b border-[#78BE20]/40 pb-0.5 hover:border-[#78BE20] transition-colors duration-200" style={{ fontFamily: "var(--font-ibm-mono)" }}>
              Contact us
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 md:right-12 lg:right-20 z-20 hidden sm:flex flex-col items-center gap-2">
        <div className="w-px h-12 bg-white/20 relative overflow-hidden">
          <div suppressHydrationWarning className="absolute top-0 left-0 w-full bg-[#78BE20]" style={{ height: "40%", animation: "scrollDown 2s ease-in-out infinite" }} />
        </div>
        <span className="text-[9px] tracking-[0.3em] text-white/65 uppercase mt-4" style={{ writingMode: "vertical-rl" }}>Scroll</span>
      </div>

    </section>
  );
}
