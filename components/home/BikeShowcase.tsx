"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "@/lib/gsap";

const bikes = [
  {
    id: "experia",
    index: "01",
    name: "Experia",
    tagline: "420 km. One charge.",
    category: "Grand Tourer",
    stat: { value: "420", unit: "km", label: "City Range" },
    accent: "#78BE20",
    href: "/models/experia",
    image: "/images/Pagina Experia/EXPERIA_Bormio Ice.webp",
  },
  {
    id: "esseesse9",
    index: "02",
    name: "EsseEsse9",
    tagline: "200 Nm. Instant.",
    category: "Naked Sport",
    stat: { value: "200", unit: "Nm", label: "Wheel Torque" },
    accent: "#78BE20",
    href: "/models/esseesse9",
    image: "/images/Pagina SS9/EsseEsse9 RS_Sunrise Red.webp",
  },
  {
    id: "eva-ribelle",
    index: "03",
    name: "Eva Ribelle",
    tagline: "147 HP. Italian design.",
    category: "Street Fighter",
    stat: { value: "147", unit: "HP", label: "Peak Power" },
    accent: "#78BE20",
    href: "/models/eva-ribelle",
    image: "/images/Pagina Eva/EVA Ribelle RS_Stealth Grey.webp",
  },
  {
    id: "ego",
    index: "04",
    name: "Ego",
    tagline: "147 HP. MotoE-derived. Road legal.",
    category: "Supersport",
    stat: { value: "2.6", unit: "s", label: "0–100 km/h" },
    accent: "#78BE20",
    href: "/models/ego",
    image: "/images/Pagina EGO/EGO RS_Metal Black.webp",
  },
];

export default function BikeShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const prevIndexRef = useRef(0);
  const sectionRef   = useRef<HTMLDivElement>(null);
  const activeRef    = useRef(0);
  const textRefs     = useRef<(HTMLDivElement | null)[]>([]);

  /* ── Text animation on index change ──────────────────────── */
  useEffect(() => {
    const prev = prevIndexRef.current;
    const next = activeIndex;
    if (prev === next) return;
    prevIndexRef.current = next;

    const dir = next > prev ? 1 : -1;
    const prevTxt = textRefs.current[prev];
    const nextTxt = textRefs.current[next];

    if (prevTxt) {
      gsap.killTweensOf(prevTxt);
      gsap.killTweensOf(Array.from(prevTxt.children));
      gsap.to(prevTxt, { y: dir * -28, opacity: 0, duration: 0.22, ease: "power3.in" });
    }
    if (nextTxt) {
      const kids = Array.from(nextTxt.children);
      gsap.killTweensOf(nextTxt);
      gsap.killTweensOf(kids);
      gsap.set(nextTxt, { y: dir * 36, opacity: 0 });
      gsap.set(kids, { y: 16, opacity: 0 });
      gsap.to(nextTxt, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out", delay: 0.08 });
      gsap.to(kids, { y: 0, opacity: 1, stagger: 0.04, duration: 0.32, ease: "power2.out", delay: 0.12 });
    }
  }, [activeIndex]);

  /* ── Initial text state ──────────────────────────────────── */
  useEffect(() => {
    textRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.set(el, { opacity: i === 0 ? 1 : 0, y: 0 });
      gsap.set(Array.from(el.children), { opacity: i === 0 ? 1 : 0, y: 0 });
    });
  }, []);

  /* ── CSS sticky scroll tracking ──────────────────────────── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleScroll = () => {
      const rect        = section.getBoundingClientRect();
      const totalScroll = section.offsetHeight - window.innerHeight;
      const scrolled    = Math.max(0, Math.min(-rect.top, totalScroll));
      const progress    = totalScroll > 0 ? scrolled / totalScroll : 0;
      const idx         = Math.min(
        Math.round(progress * (bikes.length - 1)),
        bikes.length - 1
      );
      if (idx !== activeRef.current) {
        activeRef.current = idx;
        setActiveIndex(idx);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    const lenis = (window as any).__lenis;
    if (lenis) lenis.on("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      const l = (window as any).__lenis;
      if (l) l.off("scroll", handleScroll);
    };
  }, []);

  /* ── Dot navigation ───────────────────────────────────────── */
  const goTo = (i: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const totalScroll = section.offsetHeight - window.innerHeight;
    const progress    = i / (bikes.length - 1);
    const targetY     = section.offsetTop + progress * totalScroll;
    const lenis = (window as any).__lenis;
    if (lenis) lenis.scrollTo(targetY, { duration: 0.8 });
    else window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  const activeBike = bikes[activeIndex];

  return (
    <div
      ref={sectionRef}
      className="bg-[#0A0A0A]"
      style={{ height: `${bikes.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-[#0A0A0A]">

        {/* ── FIXED IMAGE FRAME ───────────────────────────────────
            All bikes render into this exact same box.
            Position: right side, vertically centred, fixed size.
        ── */}
        <div
          className="absolute hidden md:block"
          style={{
            right: "2%",
            top: "50%",
            transform: "translateY(-50%)",
            width: "62%",
            height: "78%",
            zIndex: 1,
          }}
        >
          {/* Atmospheric green glow — sits behind all bike images */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse 70% 65% at 58% 55%, rgba(120,190,32,0.11) 0%, rgba(120,190,32,0.03) 50%, transparent 75%)",
              pointerEvents: "none",
            }}
          />

          {/* Bottom ground fade */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "22%",
              background: "linear-gradient(to top, #0A0A0A 0%, rgba(10,10,10,0.5) 60%, transparent 100%)",
              zIndex: 3,
              pointerEvents: "none",
            }}
          />

          {/* Top fade */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "12%",
              background: "linear-gradient(to bottom, #0A0A0A 0%, transparent 100%)",
              zIndex: 3,
              pointerEvents: "none",
            }}
          />

          {/* Each bike image — same box, same objectFit, same position */}
          {bikes.map((bike, i) => (
            <div
              key={bike.id}
              style={{
                position: "absolute",
                inset: 0,
                opacity:       i === activeIndex ? 1 : 0,
                transform:     i === activeIndex ? "scale(1)" : "scale(1.03)",
                transition:    "opacity 0.6s ease, transform 0.75s cubic-bezier(0.16,1,0.3,1)",
                zIndex:        i === activeIndex ? 2 : 0,
                pointerEvents: i === activeIndex ? "auto" : "none",
              }}
              data-cursor-view
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bike.image}
                alt={bike.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "center bottom",
                  display: "block",
                }}
              />
            </div>
          ))}
        </div>

        {/* ── MOBILE: full-width image (stacked layout) ── */}
        <div className="absolute inset-0 md:hidden" style={{ zIndex: 1 }}>
          {bikes.map((bike, i) => (
            <div
              key={bike.id}
              style={{
                position: "absolute",
                inset: 0,
                opacity:    i === activeIndex ? 1 : 0,
                transition: "opacity 0.6s ease",
                zIndex:     i === activeIndex ? 1 : 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bike.image}
                alt={bike.name}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "center 55%",
                }}
              />
            </div>
          ))}
          {/* Mobile bottom gradient */}
          <div
            className="pointer-events-none"
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, #0A0A0A 40%, rgba(10,10,10,0.5) 65%, transparent)",
              zIndex: 2,
            }}
          />
        </div>

        {/* ── Left text gradient (desktop) ── */}
        <div
          className="absolute inset-0 hidden md:block pointer-events-none z-[2]"
          style={{ background: "linear-gradient(to right, #0A0A0A 32%, rgba(10,10,10,0.88) 44%, rgba(10,10,10,0.15) 58%, transparent 100%)" }}
        />

        {/* ── TOP LABEL ── */}
        <div className="absolute top-0 left-0 right-0 z-20 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 pt-14">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <p className="text-[10px] tracking-[0.45em] text-white/50 uppercase">The Lineup</p>
            <Link
              href="/models"
              className="text-[10px] tracking-[0.3em] text-white/50 uppercase hover:text-white transition-colors duration-200"
            >
              View all →
            </Link>
          </div>
        </div>

        {/* ── TEXT BLOCKS ── */}
        <div className="absolute inset-0 z-10 flex md:items-center items-end pb-20 md:pb-0">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 w-full">
            <div className="relative md:max-w-[44%]" style={{ height: "clamp(320px, 50vh, 490px)" }}>
              {bikes.map((bike, i) => (
                <div
                  key={bike.id}
                  ref={el => { textRefs.current[i] = el; }}
                  className="absolute top-0 left-0 w-full"
                  aria-hidden={i !== activeIndex}
                >
                  <div className="flex items-center gap-3 mb-5 md:mb-6">
                    <span style={{ fontFamily: "var(--font-ibm-mono)", fontSize: "11px", letterSpacing: "0.45em", color: "rgba(255,255,255,0.55)" }}>
                      {bike.index}
                    </span>
                    <div className="w-5 h-px bg-white/40" />
                    <span className="mono-tag">{bike.category}</span>
                  </div>

                  <h2 className="font-display text-[clamp(44px,9vw,124px)] text-white leading-[0.88] uppercase tracking-tight mb-3">
                    {bike.name}
                  </h2>

                  <div className="h-[2px] w-12 mb-4 md:mb-5" style={{ backgroundColor: bike.accent }} />

                  <p className="text-sm md:text-base text-white/65 mb-5 md:mb-7 font-light leading-relaxed tracking-wide" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                    {bike.tagline}
                  </p>

                  <div className="mb-7 md:mb-9">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-display text-[clamp(42px,7vw,92px)] leading-none" style={{ color: bike.accent }}>
                        {bike.stat.value}
                      </span>
                      <span className="text-xl md:text-2xl text-white/60 font-light">
                        {bike.stat.unit}
                      </span>
                    </div>
                    <p className="text-[11px] tracking-[0.4em] text-white/50 uppercase" style={{ fontFamily: "var(--font-ibm-mono)" }}>
                      {bike.stat.label}
                    </p>
                  </div>

                  <Link href={bike.href} className="inline-flex items-center gap-3 group">
                    <span
                      className="h-px w-8 group-hover:w-16 transition-all duration-300"
                      style={{ backgroundColor: bike.accent }}
                    />
                    <span className="text-[11px] tracking-[0.3em] text-white uppercase group-hover:text-white/50 transition-colors duration-200">
                      Discover {bike.name}
                    </span>
                    <span
                      className="text-xs opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200"
                      style={{ color: bike.accent }}
                    >
                      →
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── WATERMARK ── */}
        <div className="absolute bottom-0 right-3 md:right-14 lg:right-20 z-0 select-none pointer-events-none overflow-hidden h-[160px] md:h-[220px]">
          {bikes.map((bike, i) => (
            <span
              key={bike.id}
              className="absolute bottom-0 right-0 font-display text-[clamp(110px,15vw,190px)] leading-none transition-opacity duration-400"
              style={{
                color: "transparent",
                WebkitTextStroke: `1px ${bike.accent}`,
                opacity: i === activeIndex ? 0.07 : 0,
              }}
            >
              {bike.index}
            </span>
          ))}
        </div>

        {/* ── BOTTOM PROGRESS ── */}
        <div className="absolute bottom-5 left-0 right-0 z-20">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 flex items-center gap-4">
            <div className="flex items-center gap-1.5 flex-1">
              {bikes.map((bike, i) => (
                <button
                  key={bike.id}
                  onClick={() => goTo(i)}
                  aria-label={`Go to ${bike.name}`}
                  className="group relative h-8 flex items-center flex-1"
                >
                  <div
                    className="w-full transition-all duration-300"
                    style={{
                      height: i === activeIndex ? "2px" : "1px",
                      backgroundColor: i === activeIndex ? activeBike.accent : "rgba(255,255,255,0.1)",
                    }}
                  />
                  {i === activeIndex && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: activeBike.accent }}
                    />
                  )}
                </button>
              ))}
            </div>
            <span className="hidden md:block text-[10px] tracking-[0.35em] text-white/50 uppercase whitespace-nowrap" style={{ fontFamily: "var(--font-ibm-mono)" }}>
              {activeBike.index} — {activeBike.name}
            </span>
          </div>
        </div>

        {/* ── LEFT NAV DOTS ── */}
        <div className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-start gap-4">
          {bikes.map((bike, i) => (
            <button
              key={bike.id}
              onClick={() => goTo(i)}
              aria-label={`Go to ${bike.name}`}
              className="group flex items-center gap-3"
            >
              <div
                className="rounded-full transition-all duration-300"
                style={{
                  width:           i === activeIndex ? "6px"  : "4px",
                  height:          i === activeIndex ? "32px" : "12px",
                  backgroundColor: i === activeIndex ? activeBike.accent : "rgba(255,255,255,0.35)",
                }}
              />
              <span
                className={`text-[9px] tracking-[0.3em] uppercase whitespace-nowrap transition-all duration-200 ${
                  i === activeIndex ? "text-white" : "text-white/0 group-hover:text-white/35"
                }`}
              >
                {bike.name}
              </span>
            </button>
          ))}
        </div>

        {/* ── LEFT ACCENT LINE ── */}
        <div
          className="absolute left-5 md:left-9 top-0 bottom-0 z-[29] w-px hidden md:block"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(120, 190, 32, 0.18), transparent)" }}
        />

      </div>
    </div>
  );
}
