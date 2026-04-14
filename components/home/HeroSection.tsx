"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useScramble } from "@/lib/use-scramble";

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [scrambleTrigger, setScrambleTrigger] = useState(false);

  const h1Ref = useScramble("PROGRESS,\nRIDDEN.", scrambleTrigger);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
    const t = setTimeout(() => setScrambleTrigger(true), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative w-full h-dvh overflow-hidden bg-black">

      {/* LAYER 1: Static poster */}
      <Image
        src="/images/new/home-slide-1.jpg"
        alt="Energica — Progress, Ridden."
        fill
        priority
        className="object-cover object-center opacity-70"
        sizes="100vw"
      />

      {/* LAYER 2: Local video */}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          videoLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ willChange: "transform", transform: "translateZ(0)" }}
        src="/videos/energica-hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onLoadedData={() => setVideoLoaded(true)}
      />

      {/* LAYER 3: YouTube iframe fallback */}
      {!videoLoaded && (
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

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85 z-10" />

      {/* Text content */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-[max(4rem,env(safe-area-inset-bottom,0px)+2rem)] md:pb-20">
        <div className="max-w-[1600px] mx-auto px-[clamp(24px,4vw,64px)]">

          <span className="mono-tag mb-5 block">Modena, Italy · Est. 2009</span>

          <h1
            ref={h1Ref as React.RefObject<HTMLHeadingElement>}
            className="font-display text-[clamp(52px,9vw,112px)] text-white leading-none uppercase tracking-wide mb-3 whitespace-pre-line"
          >
            {scrambleTrigger ? "PROGRESS,\nRIDDEN." : "·········\n·······"}
          </h1>

          <p className="text-sm text-white/70 font-light tracking-wide mb-7 max-w-md" style={{ fontFamily: "var(--font-ibm-sans)" }}>
            Born in Modena. Proven on the racetrack.{" "}<br className="hidden md:block" />Exclusive MotoE supplier. Four seasons.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <Link
              href="/models"
              className="text-xs tracking-[0.25em] uppercase text-white border-b border-white/40 pb-0.5 hover:border-white transition-colors duration-200"
              style={{ fontFamily: "var(--font-ibm-mono)" }}
            >
              Explore the lineup
            </Link>
            <span className="hidden sm:inline text-white/20">·</span>
            <Link
              href="/contact"
              className="text-xs tracking-[0.25em] uppercase text-[#78BE20] border-b border-[#78BE20]/40 pb-0.5 hover:border-[#78BE20] transition-colors duration-200"
              style={{ fontFamily: "var(--font-ibm-mono)" }}
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-8 md:right-12 lg:right-20 z-20 hidden sm:flex flex-col items-center gap-2">
        <div className="w-px h-12 bg-white/20 relative overflow-hidden">
          <div
            suppressHydrationWarning
            className="absolute top-0 left-0 w-full bg-[#78BE20]"
            style={{ height: "40%", animation: "scrollDown 2s ease-in-out infinite" }}
          />
        </div>
        <span
          className="text-[9px] tracking-[0.3em] text-white/65 uppercase mt-4"
          style={{ writingMode: "vertical-rl" }}
        >
          Scroll
        </span>
      </div>

    </section>
  );
}
