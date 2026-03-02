"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const bikes = [
  {
    id: "experia",
    index: "01",
    name: "Experia",
    tagline: "Born to be wind.",
    category: "Grand Tourer",
    stat: { value: "420", unit: "km", label: "City Range" },
    accent: "#4A9EFF",
    href: "/models/experia",
    image: "/images/Pagina Experia/Energica_Experia.png",
  },
  {
    id: "esseesse9",
    index: "02",
    name: "EsseEsse9+",
    tagline: "The Naked Champion.",
    category: "Naked Sport",
    stat: { value: "200", unit: "Nm", label: "Wheel Torque" },
    accent: "#FF6B2B",
    href: "/models/esseesse9",
    image: "/images/Pagina SS9/ss9-1.png",
  },
  {
    id: "eva-ribelle",
    index: "03",
    name: "Eva Ribelle",
    tagline: "Redefine every road.",
    category: "Street Fighter",
    stat: { value: "107", unit: "HP", label: "Peak Power" },
    accent: "rgb(0,255,0)",
    href: "/models/eva-ribelle",
    image: "/images/Pagina Eva/Eva-Ribelle-1.png",
  },
  {
    id: "ego",
    index: "04",
    name: "Ego+",
    tagline: "Track tested. Street legal.",
    category: "Supersport",
    stat: { value: "2.6", unit: "s", label: "0–100 km/h" },
    accent: "#C0C0C0",
    href: "/models/ego",
    image: "/images/Pagina EGO/Ego-1.png",
  },
];

export default function BikeShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showDots, setShowDots] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* Track active bike via viewport IntersectionObserver */
  useEffect(() => {
    const observers = slideRefs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIndex(i);
        },
        { threshold: 0.5 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((obs) => obs?.disconnect());
  }, []);

  /* Show/hide left dots based on whole section visibility */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowDots(entry.isIntersecting),
      { threshold: 0.05 }
    );
    obs.observe(section);
    return () => obs.disconnect();
  }, []);

  const scrollTo = (i: number) => {
    slideRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section ref={sectionRef} className="relative bg-[#0A0A0A]">

      {/* CONTINUOUS LEFT ACCENT — thin green thread running the full showcase height */}
      <div
        suppressHydrationWarning
        className={`fixed left-5 md:left-9 top-0 bottom-0 z-29 w-px
                    bg-gradient-to-b from-transparent via-[rgb(0,255,0)]/20 to-transparent
                    transition-opacity duration-500 hidden md:block
                    ${showDots ? "opacity-100" : "opacity-0"}`}
      />

      {/* STICKY LEFT NAV DOTS */}
      <div
        suppressHydrationWarning
        className={`fixed left-6 md:left-10 top-1/2 -translate-y-1/2 z-30
                    hidden md:flex flex-col items-start gap-4
                    transition-opacity duration-500
                    ${showDots ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        {bikes.map((bike, i) => (
          <button
            key={bike.id}
            onClick={() => scrollTo(i)}
            aria-label={`Go to ${bike.name}`}
            className="group flex items-center gap-3 cursor-none"
          >
            <div
              suppressHydrationWarning
              className={`rounded-full transition-all duration-500 ${
                i === activeIndex
                  ? "w-1.5 h-8 bg-white"
                  : "w-1 h-3 bg-white/25 group-hover:bg-white/50"
              }`}
            />
            <span
              suppressHydrationWarning
              className={`text-[9px] tracking-[0.3em] uppercase whitespace-nowrap transition-all duration-300 ${
                i === activeIndex
                  ? "text-white"
                  : "text-white/0 group-hover:text-white/40"
              }`}
            >
              {bike.name}
            </span>
          </button>
        ))}
      </div>

      {/* SECTION LABEL — top strip */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 pt-20 pb-8">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-6">
          <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase">
            The Lineup
          </p>
          <Link
            href="/models"
            className="text-[10px] tracking-[0.3em] text-white/30 uppercase hover:text-white transition-colors"
          >
            View all →
          </Link>
        </div>
      </div>

      {/* BIKE SLIDES — stacked in normal document flow */}
      {bikes.map((bike, i) => (
        <div
          key={bike.id}
          ref={(el) => { slideRefs.current[i] = el; }}
          className="relative w-full flex items-center overflow-hidden bg-[#0A0A0A]"
          style={{ minHeight: "clamp(600px, 100vh, 100vh)" }}
        >
          {/* BIKE IMAGE — right side */}
          <div className="absolute inset-y-0 right-0 w-full md:w-[65%] lg:w-[62%]">
            {/* Colour glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-[55%] h-[55%] rounded-full blur-[160px] opacity-20"
                style={{ backgroundColor: bike.accent }}
              />
            </div>
            <Image
              src={bike.image}
              alt={bike.name}
              fill
              className="object-contain object-center"
              sizes="(max-width: 768px) 100vw, 65vw"
              priority={i === 0}
            />
          </div>

          {/* LEFT GRADIENT for text legibility — stronger on mobile */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/90 md:via-[#0A0A0A]/85 to-[#0A0A0A]/60 md:to-transparent" />

          {/* TEXT CONTENT */}
          <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 w-full py-20 md:py-24">
            <div className="max-w-[480px]">

              {/* Index + Category */}
              <div className="flex items-center gap-4 mb-10">
                <span className="font-mono text-[10px] tracking-[0.4em] text-white/25">
                  {bike.index}
                </span>
                <div className="w-8 h-px bg-white/20" />
                <span className="text-[10px] tracking-[0.3em] text-white/25 uppercase">
                  {bike.category}
                </span>
              </div>

              {/* Name */}
              <h2 className="font-display text-[clamp(40px,9vw,120px)] text-white leading-none uppercase tracking-tight mb-5">
                {bike.name}
              </h2>

              {/* Tagline */}
              <p className="text-base md:text-lg text-white/40 mb-12 italic font-light">
                &ldquo;{bike.tagline}&rdquo;
              </p>

              {/* KEY STAT */}
              <div className="mb-12">
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span
                    className="font-display text-[clamp(36px,7vw,84px)] leading-none"
                    style={{ color: bike.accent }}
                  >
                    {bike.stat.value}
                  </span>
                  <span className="text-xl text-white/50 font-light">
                    {bike.stat.unit}
                  </span>
                </div>
                <p className="text-[10px] tracking-[0.35em] text-white/30 uppercase">
                  {bike.stat.label}
                </p>
              </div>

              {/* CTA */}
              <Link href={bike.href} className="inline-flex items-center gap-3 group">
                <span
                  className="h-px transition-all duration-300 w-10 group-hover:w-16"
                  style={{ backgroundColor: bike.accent }}
                />
                <span className="text-xs tracking-[0.3em] text-white uppercase group-hover:text-white/60 transition-colors">
                  Discover {bike.name}
                </span>
              </Link>

            </div>
          </div>

          {/* WATERMARK NUMBER */}
          <div className="absolute bottom-6 right-6 md:right-12 lg:right-20 select-none pointer-events-none z-0">
            <span className="font-display text-[120px] md:text-[180px] text-white/[0.025] leading-none">
              {bike.index}
            </span>
          </div>

          {/* BOTTOM RULE between bikes */}
          {i < bikes.length - 1 && (
            <div className="absolute bottom-0 left-0 right-0 h-px bg-white/[0.05]" />
          )}

        </div>
      ))}

    </section>
  );
}
