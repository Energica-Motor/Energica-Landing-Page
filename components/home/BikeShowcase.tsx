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

// ── Rubber-band physics constants ──────────────────────────────
const MAX_VISUAL = 26;   // px — max image drift
const THRESHOLD  = 155;  // accumulated deltaY to trigger snap
const RESISTANCE = 2.5;  // asymptotic curve exponent

function calcOffset(raw: number): number {
  const sign  = raw < 0 ? -1 : 1;
  const abs   = Math.min(Math.abs(raw), THRESHOLD * 1.2);
  const norm  = abs / THRESHOLD;
  return sign * MAX_VISUAL * (1 - Math.exp(-norm * RESISTANCE));
}

export default function BikeShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  const sectionRef     = useRef<HTMLDivElement>(null);
  const imgWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs       = useRef<(HTMLDivElement | null)[]>([]);

  // Stable mutable refs for event-handler state (avoids stale closures)
  const currentRef  = useRef(0);
  const lockedRef   = useRef(false);
  const transRef    = useRef(false);
  const pullYRef    = useRef(0);
  const prevIdxRef  = useRef(0);

  // Exposed snapTo ref so dot-nav can call it
  const snapToRef = useRef<((target: number) => void) | null>(null);

  /* ── Initial text visibility ───────────────────────────────── */
  useEffect(() => {
    textRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.set(el, { opacity: i === 0 ? 1 : 0, y: 0 });
      gsap.set(Array.from(el.children), { opacity: i === 0 ? 1 : 0, y: 0 });
    });
  }, []);

  /* ── Text stagger animation on active change ───────────────── */
  useEffect(() => {
    const prev = prevIdxRef.current;
    const next = activeIndex;
    if (prev === next) return;
    const dir = next > prev ? 1 : -1;
    prevIdxRef.current = next;

    const prevTxt = textRefs.current[prev];
    const nextTxt = textRefs.current[next];

    if (prevTxt) {
      gsap.killTweensOf(prevTxt);
      gsap.to(prevTxt, { y: dir * -28, opacity: 0, duration: 0.22, ease: "power3.in" });
    }
    if (nextTxt) {
      const kids = Array.from(nextTxt.children);
      gsap.set(nextTxt, { y: dir * 36, opacity: 0 });
      gsap.set(kids, { y: 16, opacity: 0 });
      gsap.to(nextTxt, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out", delay: 0.08 });
      gsap.to(kids, { y: 0, opacity: 1, stagger: 0.04, duration: 0.32, ease: "power2.out", delay: 0.12 });
    }
  }, [activeIndex]);

  /* ── Rubber-band wheel + Lenis integration ─────────────────── */
  useEffect(() => {
    const section = sectionRef.current!;
    if (!section) return;

    let releaseTimer: ReturnType<typeof setTimeout> | null = null;

    function applyDrift(raw: number) {
      const w = imgWrapperRefs.current[currentRef.current];
      if (w) gsap.set(w, { y: calcOffset(raw) });
    }

    function resetDrift(idx: number) {
      const w = imgWrapperRefs.current[idx];
      if (w) gsap.to(w, { y: 0, duration: 0.42, ease: "power3.out" });
    }

    function snapTo(target: number) {
      if (transRef.current) return;
      if (target === currentRef.current || target < 0 || target >= bikes.length) {
        pullYRef.current = 0;
        resetDrift(currentRef.current);
        return;
      }

      transRef.current = true;
      const from  = currentRef.current;
      const dir   = target > from ? 1 : -1;
      const fromW = imgWrapperRefs.current[from];
      const toW   = imgWrapperRefs.current[target];

      // Phase 1 — exit current image
      if (fromW) gsap.to(fromW, { y: dir * -48, opacity: 0, duration: 0.2, ease: "power2.in" });

      setTimeout(() => {
        // Phase 2 — enter new image
        currentRef.current = target;
        setActiveIndex(target);

        if (toW) {
          gsap.set(toW, { y: dir * 48, opacity: 0.15 });
          gsap.to(toW, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" });
        }

        // Restore old wrapper quietly
        setTimeout(() => {
          if (fromW) gsap.set(fromW, { y: 0, opacity: 0 });
          resetDrift(target);
          transRef.current = false;
          pullYRef.current  = 0;

          // Release scroll lock when reaching first or last bike
          const atBoundary = target === 0 || target === bikes.length - 1;
          if (atBoundary) {
            setTimeout(() => {
              lockedRef.current = false;
              const lenis = (window as any).__lenis;
              if (lenis) lenis.start();
            }, 320);
          }
        }, 580);
      }, 215);
    }

    // Expose snapTo for dot-nav
    snapToRef.current = snapTo;

    function lock() {
      if (lockedRef.current) return;
      lockedRef.current = true;
      pullYRef.current  = 0;
      const lenis = (window as any).__lenis;
      if (lenis) lenis.stop();
      window.scrollTo({ top: sectionRef.current!.offsetTop, behavior: "instant" as ScrollBehavior });
    }

    function unlock() {
      lockedRef.current = false;
      pullYRef.current  = 0;
      resetDrift(currentRef.current);
      const lenis = (window as any).__lenis;
      if (lenis) lenis.start();
    }

    function onWheel(e: WheelEvent) {
      const rect = section.getBoundingClientRect();
      const down = e.deltaY > 0;
      const up   = e.deltaY < 0;

      // Gate: intercept as section approaches — stop momentum before blasting past
      if (!lockedRef.current && down && rect.top > 0 && rect.top <= window.innerHeight) {
        e.preventDefault();
        lock();
        return;
      }
      if (!lockedRef.current && up && rect.top < 0 && rect.bottom > 0) {
        e.preventDefault();
        lock();
        return;
      }
      if (!lockedRef.current) return;

      e.preventDefault();
      if (transRef.current) return;

      pullYRef.current += e.deltaY;
      pullYRef.current = Math.max(-THRESHOLD * 1.1, Math.min(THRESHOLD * 1.1, pullYRef.current));
      applyDrift(pullYRef.current);

      if (pullYRef.current < -THRESHOLD && currentRef.current > 0) {
        snapTo(currentRef.current - 1);
        return;
      }
      if (pullYRef.current > THRESHOLD && currentRef.current < bikes.length - 1) {
        snapTo(currentRef.current + 1);
        return;
      }

      // At boundary — release lock so user can scroll past the section
      if ((pullYRef.current < -THRESHOLD && currentRef.current === 0) ||
          (pullYRef.current > THRESHOLD  && currentRef.current === bikes.length - 1)) {
        unlock();
        return;
      }

      // Spring back after scroll stops
      if (releaseTimer) clearTimeout(releaseTimer);
      releaseTimer = setTimeout(() => {
        if (!transRef.current) {
          pullYRef.current = 0;
          resetDrift(currentRef.current);
        }
      }, 180);
    }

    // Touch support
    let touchStartY = 0;
    let touching    = false;

    function onTouchStart(e: TouchEvent) {
      const rect = section.getBoundingClientRect();
      if (!lockedRef.current && rect.top >= 0 && rect.top <= window.innerHeight * 0.1) {
        lockedRef.current = true;
        const lenis = (window as any).__lenis;
        if (lenis) lenis.stop();
      }
      if (!lockedRef.current) return;
      touchStartY      = e.touches[0].clientY;
      touching         = true;
      pullYRef.current = 0;
    }

    function onTouchMove(e: TouchEvent) {
      if (!lockedRef.current || !touching || transRef.current) return;
      e.preventDefault();
      pullYRef.current = (touchStartY - e.touches[0].clientY) * 1.1;
      pullYRef.current = Math.max(-THRESHOLD * 1.1, Math.min(THRESHOLD * 1.1, pullYRef.current));
      applyDrift(pullYRef.current);
      if (pullYRef.current < -THRESHOLD && currentRef.current > 0) { touching = false; snapTo(currentRef.current - 1); }
      else if (pullYRef.current > THRESHOLD && currentRef.current < bikes.length - 1) { touching = false; snapTo(currentRef.current + 1); }
    }

    function onTouchEnd() {
      if (!lockedRef.current) return;
      touching = false;
      if (!transRef.current) { pullYRef.current = 0; resetDrift(currentRef.current); }
    }

    // Release lock if section scrolls out of view programmatically
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (!entry.isIntersecting && lockedRef.current) unlock(); });
    }, { threshold: 0 });
    io.observe(section);

    window.addEventListener("wheel",      onWheel,      { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true  });
    window.addEventListener("touchmove",  onTouchMove,  { passive: false });
    window.addEventListener("touchend",   onTouchEnd,   { passive: true  });

    return () => {
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove",  onTouchMove);
      window.removeEventListener("touchend",   onTouchEnd);
      io.disconnect();
      if (releaseTimer) clearTimeout(releaseTimer);
      // Always restore Lenis on unmount
      const lenis = (window as any).__lenis;
      if (lenis && lockedRef.current) lenis.start();
    };
  }, []); // all state via refs — safe with empty deps

  /* ── Dot navigation ────────────────────────────────────────── */
  const goTo = (i: number) => {
    const section = sectionRef.current;
    if (!section) return;
    if (!lockedRef.current) {
      lockedRef.current = true;
      const lenis = (window as any).__lenis;
      if (lenis) lenis.stop();
      window.scrollTo({ top: sectionRef.current!.offsetTop, behavior: "instant" as ScrollBehavior });
    }
    snapToRef.current?.(i);
  };

  const activeBike = bikes[activeIndex];

  return (
    <section
      ref={sectionRef}
      className="relative h-screen overflow-hidden bg-[#0A0A0A]"
    >

      {/* ── FIXED IMAGE FRAME — right side ──────────────────────── */}
      <div
        className="absolute hidden md:block"
        style={{ right: "2%", top: "50%", transform: "translateY(-50%)", width: "62%", height: "78%", zIndex: 1 }}
      >
        {/* Atmospheric glow */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 65% at 58% 55%, rgba(120,190,32,0.11) 0%, rgba(120,190,32,0.03) 50%, transparent 75%)", pointerEvents: "none" }} />
        {/* Bottom fade */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "22%", background: "linear-gradient(to top, #0A0A0A 0%, rgba(10,10,10,0.5) 60%, transparent 100%)", zIndex: 3, pointerEvents: "none" }} />
        {/* Top fade */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "12%", background: "linear-gradient(to bottom, #0A0A0A 0%, transparent 100%)", zIndex: 3, pointerEvents: "none" }} />

        {bikes.map((bike, i) => (
          <div
            key={bike.id}
            /* img-wrapper — rubber-band drift applied via GSAP y */
            ref={el => { imgWrapperRefs.current[i] = el; }}
            style={{
              position:      "absolute",
              inset:         0,
              opacity:       i === 0 ? 1 : 0,
              zIndex:        i === activeIndex ? 2 : 0,
              willChange:    "transform, opacity",
              pointerEvents: i === activeIndex ? "auto" : "none",
            }}
            data-cursor-view
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bike.image}
              alt={bike.name}
              style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center bottom", display: "block", filter: "brightness(0.9) contrast(1.05)" }}
            />
          </div>
        ))}
      </div>

      {/* ── MOBILE: full-width image ─────────────────────────────── */}
      <div className="absolute inset-0 md:hidden" style={{ zIndex: 1 }}>
        {bikes.map((bike, i) => (
          <div
            key={bike.id}
            ref={el => { if (!imgWrapperRefs.current[i]) imgWrapperRefs.current[i] = el; }}
            style={{ position: "absolute", inset: 0, opacity: i === 0 ? 1 : 0, zIndex: i === activeIndex ? 2 : 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bike.image} alt={bike.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", objectPosition: "center 55%" }} />
          </div>
        ))}
        <div className="pointer-events-none" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0A0A0A 40%, rgba(10,10,10,0.5) 65%, transparent)", zIndex: 2 }} />
      </div>

      {/* ── Left gradient (desktop) ──────────────────────────────── */}
      <div
        className="absolute inset-0 hidden md:block pointer-events-none z-[2]"
        style={{ background: "linear-gradient(to right, #0A0A0A 32%, rgba(10,10,10,0.88) 44%, rgba(10,10,10,0.15) 58%, transparent 100%)" }}
      />

      {/* ── TOP LABEL ────────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-20 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 pt-14">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <p className="text-[10px] tracking-[0.45em] text-white/50 uppercase">The Lineup</p>
          <Link href="/models" className="text-[10px] tracking-[0.3em] text-white/50 uppercase hover:text-white transition-colors duration-200">
            View all →
          </Link>
        </div>
      </div>

      {/* ── TEXT BLOCKS ──────────────────────────────────────────── */}
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
                  <span style={{ fontFamily: "var(--font-ibm-mono)", fontSize: "11px", letterSpacing: "0.45em", color: "rgba(255,255,255,0.55)" }}>{bike.index}</span>
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
                    <span className="font-display text-[clamp(42px,7vw,92px)] leading-none" style={{ color: bike.accent }}>{bike.stat.value}</span>
                    <span className="text-xl md:text-2xl text-white/60 font-light">{bike.stat.unit}</span>
                  </div>
                  <p className="text-[11px] tracking-[0.4em] text-white/50 uppercase" style={{ fontFamily: "var(--font-ibm-mono)" }}>{bike.stat.label}</p>
                </div>

                <Link href={bike.href} className="inline-flex items-center gap-3 group">
                  <span className="h-px w-8 group-hover:w-16 transition-all duration-300" style={{ backgroundColor: bike.accent }} />
                  <span className="text-[11px] tracking-[0.3em] text-white uppercase group-hover:text-white/50 transition-colors duration-200">
                    Discover {bike.name}
                  </span>
                  <span className="text-xs opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200" style={{ color: bike.accent }}>→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WATERMARK ────────────────────────────────────────────── */}
      <div className="absolute bottom-0 right-3 md:right-14 lg:right-20 z-0 select-none pointer-events-none overflow-hidden h-[160px] md:h-[220px]">
        {bikes.map((bike, i) => (
          <span key={bike.id} className="absolute bottom-0 right-0 font-display text-[clamp(110px,15vw,190px)] leading-none transition-opacity duration-400" style={{ color: "transparent", WebkitTextStroke: `1px ${bike.accent}`, opacity: i === activeIndex ? 0.07 : 0 }}>
            {bike.index}
          </span>
        ))}
      </div>

      {/* ── LEFT NAV DOTS ────────────────────────────────────────── */}
      <div className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-start gap-4">
        {bikes.map((bike, i) => (
          <button key={bike.id} onClick={() => goTo(i)} aria-label={`Go to ${bike.name}`} className="group flex items-center gap-3">
            <div
              className="rounded-full transition-all duration-300"
              style={{
                width:           i === activeIndex ? "6px"  : "4px",
                height:          i === activeIndex ? "32px" : "12px",
                backgroundColor: i === activeIndex ? activeBike.accent : "rgba(255,255,255,0.35)",
              }}
            />
            <span className={`text-[9px] tracking-[0.3em] uppercase whitespace-nowrap transition-all duration-200 ${i === activeIndex ? "text-white" : "text-white/0 group-hover:text-white/35"}`}>
              {bike.name}
            </span>
          </button>
        ))}
      </div>

      {/* ── LEFT ACCENT LINE ─────────────────────────────────────── */}
      <div
        className="absolute left-5 md:left-9 top-0 bottom-0 z-[29] w-px hidden md:block"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(120,190,32,0.18), transparent)" }}
      />

      {/* ── SCROLL HINT (first load) ─────────────────────────────── */}
      <div className="absolute bottom-6 right-6 md:right-14 z-20 flex items-center gap-2 select-none pointer-events-none">
        <span className="text-[9px] tracking-[0.4em] text-white/30 uppercase" style={{ fontFamily: "var(--font-ibm-mono)", writingMode: "vertical-rl" }}>
          Scroll
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-[#78BE20]/40" />
      </div>

    </section>
  );
}
