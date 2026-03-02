"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">

      {/* VIDEO BACKGROUND */}
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
        onLoadedData={() => setVideoLoaded(true)}
      />

      {/* YouTube iframe fallback — desktop only (mobile skips iframe for perf) */}
      {!videoLoaded && (
        <iframe
          className="absolute inset-0 w-full h-full pointer-events-none hidden sm:block"
          style={{ transform: "scale(1.5)", transformOrigin: "center center" }}
          src="https://www.youtube-nocookie.com/embed/vKfU7NPIEI4?autoplay=1&mute=1&loop=1&playlist=vKfU7NPIEI4&controls=0&showinfo=0&rel=0&start=12"
          allow="autoplay; encrypted-media"
          frameBorder="0"
          title="Energica"
        />
      )}

      {/* GRADIENT OVERLAYS */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-10" />

      {/* TEXT — bottom left */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-16 md:pb-20">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">

          <p className="text-[10px] md:text-xs tracking-[0.4em] text-white/50 uppercase mb-4">
            Made in Italy · 100% Electric
          </p>

          <h1 className="font-display text-[clamp(36px,8vw,96px)] text-white leading-none uppercase tracking-tight mb-6">
            Born Electric.<br />Born Italian.
          </h1>

          <div className="flex items-center gap-6">
            <Link
              href="/models"
              className="text-xs tracking-[0.25em] uppercase text-white border-b border-white/40 pb-0.5 hover:border-white transition-colors duration-200"
            >
              Explore the lineup
            </Link>
            <span className="text-white/20">·</span>
            <Link
              href="/test-ride"
              className="text-xs tracking-[0.25em] uppercase text-[rgb(0,255,0)] border-b border-[rgb(0,255,0)]/40 pb-0.5 hover:border-[rgb(0,255,0)] transition-colors duration-200"
            >
              Book a test ride
            </Link>
          </div>
        </div>
      </div>

      {/* SCROLL INDICATOR */}
      <div className="absolute bottom-8 right-8 md:right-12 lg:right-20 z-20 flex flex-col items-center gap-2">
        <div className="w-px h-12 bg-white/20 relative overflow-hidden">
          <div
            suppressHydrationWarning
            className="absolute top-0 left-0 w-full bg-[rgb(0,255,0)]"
            style={{
              height: "40%",
              animation: "scrollDown 2s ease-in-out infinite",
            }}
          />
        </div>
        <span
          className="text-[9px] tracking-[0.3em] text-white/30 uppercase mt-4"
          style={{ writingMode: "vertical-rl" }}
        >
          Scroll
        </span>
      </div>

    </section>
  );
}
