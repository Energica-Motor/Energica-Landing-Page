"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/gsap";

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

  const stickyRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const isAnimating = useRef(false);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* ── Set initial GSAP visibility ─────────────────────────── */
  useEffect(() => {
    imageRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.set(el, { opacity: i === 0 ? 1 : 0, x: 0, scale: 1 });
    });
    textRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.set(el, { opacity: i === 0 ? 1 : 0, y: 0 });
      gsap.set(Array.from(el.children), { opacity: i === 0 ? 1 : 0, y: 0 });
    });
  }, []);

  /* ── Bike transition animation ───────────────────────────── */
  const runTransition = (nextIdx: number, prevIdx: number) => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const dir = nextIdx > prevIdx ? 1 : -1;
    const prevImg = imageRefs.current[prevIdx];
    const nextImg = imageRefs.current[nextIdx];
    const prevTxt = textRefs.current[prevIdx];
    const nextTxt = textRefs.current[nextIdx];

    const tl = gsap.timeline({ onComplete: () => { isAnimating.current = false; } });

    /* Image: old slides out + scales down, new slides in + scales to 1 */
    if (prevImg) {
      tl.to(prevImg, { x: dir * -90, scale: 0.88, opacity: 0, duration: 0.32, ease: "power3.in" }, 0);
    }
    if (nextImg) {
      gsap.set(nextImg, { x: dir * 110, scale: 1.08, opacity: 0 });
      tl.to(nextImg, { x: 0, scale: 1, opacity: 1, duration: 0.62, ease: "expo.out" }, 0.04);
    }

    /* Text: old fades up, new enters from below with per-child stagger */
    if (prevTxt) {
      tl.to(prevTxt, { y: dir * -45, opacity: 0, duration: 0.24, ease: "power3.in" }, 0);
    }
    if (nextTxt) {
      const kids = Array.from(nextTxt.children);
      gsap.set(nextTxt, { y: dir * 55, opacity: 0 });
      gsap.set(kids, { y: 24, opacity: 0 });
      tl.to(nextTxt, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, 0.1);
      tl.to(kids, { y: 0, opacity: 1, stagger: 0.055, duration: 0.4, ease: "power2.out" }, 0.15);
    }
  };

  /* ── ScrollTrigger: pin + snap (works natively with Lenis) ── */
  useEffect(() => {
    const sticky = stickyRef.current;
    if (!sticky) return;

    const st = ScrollTrigger.create({
      trigger: sticky,
      start: "top top",
      end: `+=${(bikes.length - 1) * window.innerHeight}`,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      snap: {
        snapTo: 1 / (bikes.length - 1),   // snaps to 0, 0.333, 0.666, 1
        duration: { min: 0.25, max: 0.5 },
        delay: 0,
        ease: "power2.inOut",
      },
      onUpdate(self) {
        const idx = Math.min(
          Math.round(self.progress * (bikes.length - 1)),
          bikes.length - 1
        );
        if (idx !== activeRef.current) {
          const prev = activeRef.current;
          activeRef.current = idx;
          setActiveIndex(idx);
          runTransition(idx, prev);
        }
      },
    });

    return () => st.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Dot/progress navigation ─────────────────────────────── */
  const goTo = (i: number) => {
    const sticky = stickyRef.current;
    if (!sticky) return;
    const targetY = sticky.offsetTop + i * window.innerHeight;
    const lenis = (window as any).__lenis;
    if (lenis) lenis.scrollTo(targetY, { duration: 0.7 });
    else window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  const activeBike = bikes[activeIndex];

  return (
    /* Outer wrapper — background only, no height set (ScrollTrigger adds spacer) */
    <div className="bg-[#0A0A0A]">

      {/* This div is pinned by ScrollTrigger */}
      <div ref={stickyRef} className="relative h-screen overflow-hidden bg-[#0A0A0A]">

        {/* ── BIKE IMAGES ── */}
        {bikes.map((bike, i) => (
          <div
            key={bike.id}
            ref={el => { imageRefs.current[i] = el; }}
            /* Right 70% on desktop so text has breathing room; full-width on mobile */
            className="absolute inset-y-0 right-0 w-full md:w-[70%]"
            style={{ opacity: 0 }}
          >
            <Image
              src={bike.image}
              alt={bike.name}
              fill
              className="object-contain object-center"
              sizes="(max-width: 768px) 100vw, 70vw"
              priority={i === 0}
            />
          </div>
        ))}

        {/* ── Gradient overlays ── */}
        {/* Desktop: left-to-right for text legibility */}
        <div className="absolute inset-0 hidden md:block pointer-events-none z-[1]"
          style={{ background: "linear-gradient(to right, #0A0A0A 32%, rgba(10,10,10,0.7) 55%, transparent)" }}
        />
        {/* Mobile: bottom-up so bottom text is readable */}
        <div className="absolute inset-0 md:hidden pointer-events-none z-[1]"
          style={{ background: "linear-gradient(to top, #0A0A0A 40%, rgba(10,10,10,0.6) 65%, transparent)" }}
        />

        {/* ── TOP LABEL ── */}
        <div className="absolute top-0 left-0 right-0 z-20 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 pt-14">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <p className="text-[10px] tracking-[0.45em] text-white/25 uppercase">The Lineup</p>
            <Link
              href="/models"
              className="text-[10px] tracking-[0.3em] text-white/25 uppercase hover:text-white transition-colors duration-200"
            >
              View all →
            </Link>
          </div>
        </div>

        {/* ── TEXT BLOCKS — stacked at same position, GSAP crossfades ── */}
        <div className="absolute inset-0 z-10 flex md:items-center items-end pb-24 md:pb-0">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 w-full">
            {/* Fixed-height container so all absolute text blocks stack cleanly */}
            <div className="relative md:max-w-[46%]" style={{ height: "clamp(340px, 52vh, 500px)" }}>
              {bikes.map((bike, i) => (
                <div
                  key={bike.id}
                  ref={el => { textRefs.current[i] = el; }}
                  className="absolute top-0 left-0 w-full"
                  style={{ opacity: 0 }}
                  aria-hidden={i !== activeIndex}
                >
                  {/* Index + Category */}
                  <div className="flex items-center gap-3 mb-5">
                    <span className="font-mono text-[10px] tracking-[0.45em] text-white/20">
                      {bike.index}
                    </span>
                    <div className="w-5 h-px bg-white/15" />
                    <span
                      className="text-[9px] tracking-[0.4em] uppercase font-medium"
                      style={{ color: bike.accent }}
                    >
                      {bike.category}
                    </span>
                  </div>

                  {/* Name */}
                  <h2 className="font-display text-[clamp(52px,9.5vw,128px)] text-white leading-[0.88] uppercase tracking-tight mb-3">
                    {bike.name}
                  </h2>

                  {/* Accent bar under name */}
                  <div className="h-[2px] w-12 mb-5" style={{ backgroundColor: bike.accent }} />

                  {/* Tagline */}
                  <p className="text-base md:text-lg text-white/35 mb-7 italic font-light">
                    &ldquo;{bike.tagline}&rdquo;
                  </p>

                  {/* Key Stat */}
                  <div className="mb-9">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span
                        className="font-display text-[clamp(48px,7.5vw,96px)] leading-none"
                        style={{ color: bike.accent }}
                      >
                        {bike.stat.value}
                      </span>
                      <span className="text-2xl text-white/35 font-light">
                        {bike.stat.unit}
                      </span>
                    </div>
                    <p className="text-[9px] tracking-[0.45em] text-white/25 uppercase">
                      {bike.stat.label}
                    </p>
                  </div>

                  {/* CTA */}
                  <Link href={bike.href} className="inline-flex items-center gap-4 group">
                    <span
                      className="h-px w-10 group-hover:w-20 transition-all duration-300"
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

        {/* ── WATERMARK NUMBER — outlined stroke ── */}
        <div className="absolute bottom-0 right-4 md:right-14 lg:right-20 z-0 select-none pointer-events-none overflow-hidden h-[180px] md:h-[240px]">
          {bikes.map((bike, i) => (
            <span
              key={bike.id}
              className="absolute bottom-0 right-0 font-display text-[clamp(120px,16vw,200px)] leading-none transition-opacity duration-500"
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

        {/* ── BOTTOM PROGRESS + BIKE LABEL ── */}
        <div className="absolute bottom-6 left-0 right-0 z-20">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 flex items-center gap-5">
            <div className="flex items-center gap-1.5 flex-1">
              {bikes.map((bike, i) => (
                <button
                  key={bike.id}
                  onClick={() => goTo(i)}
                  aria-label={`Go to ${bike.name}`}
                  className="group relative h-8 flex items-center flex-1"
                >
                  <div
                    className="w-full transition-all duration-500"
                    style={{
                      height: i === activeIndex ? "2px" : "1px",
                      backgroundColor: i === activeIndex ? activeBike.accent : "rgba(255,255,255,0.12)",
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
            <span className="hidden md:block text-[9px] tracking-[0.35em] text-white/20 uppercase whitespace-nowrap">
              {activeBike.index} — {activeBike.name}
            </span>
          </div>
        </div>

        {/* ── LEFT NAV DOTS ── */}
        <div className="fixed left-6 md:left-10 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-start gap-4">
          {bikes.map((bike, i) => (
            <button
              key={bike.id}
              onClick={() => goTo(i)}
              aria-label={`Go to ${bike.name}`}
              className="group flex items-center gap-3"
            >
              <div
                className="rounded-full transition-all duration-500"
                style={{
                  width: i === activeIndex ? "6px" : "4px",
                  height: i === activeIndex ? "32px" : "12px",
                  backgroundColor: i === activeIndex ? activeBike.accent : "rgba(255,255,255,0.18)",
                }}
              />
              <span
                className={`text-[9px] tracking-[0.3em] uppercase whitespace-nowrap transition-all duration-300 ${
                  i === activeIndex ? "text-white" : "text-white/0 group-hover:text-white/35"
                }`}
              >
                {bike.name}
              </span>
            </button>
          ))}
        </div>

        {/* ── LEFT ACCENT LINE ── */}
        <div className="fixed left-5 md:left-9 top-0 bottom-0 z-[29] w-px hidden md:block"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(0,255,0,0.18), transparent)" }}
        />

      </div>
    </div>
  );
}
