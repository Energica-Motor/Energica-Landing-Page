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

  const stickyRef   = useRef<HTMLDivElement>(null);
  const activeRef   = useRef(0);
  const imageRefs   = useRef<(HTMLDivElement | null)[]>([]);  // outer wrapper — transition target
  const parallaxRefs = useRef<(HTMLDivElement | null)[]>([]); // inner div — mouse parallax target
  const textRefs    = useRef<(HTMLDivElement | null)[]>([]);

  /* ── Initial GSAP state ─────────────────────────────────── */
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

  /* ── Transition: kill any running tween then start new one ─ */
  const runTransition = (nextIdx: number, prevIdx: number) => {
    const dir     = nextIdx > prevIdx ? 1 : -1;
    const prevImg = imageRefs.current[prevIdx];
    const nextImg = imageRefs.current[nextIdx];
    const prevTxt = textRefs.current[prevIdx];
    const nextTxt = textRefs.current[nextIdx];

    /* Kill any in-flight tweens so the new transition starts immediately */
    [prevImg, nextImg, prevTxt, nextTxt].forEach(el => el && gsap.killTweensOf(el));
    if (prevTxt) gsap.killTweensOf(Array.from(prevTxt.children));
    if (nextTxt) gsap.killTweensOf(Array.from(nextTxt.children));

    /* Also reset parallax on the incoming bike's inner div */
    const nextPar = parallaxRefs.current[nextIdx];
    if (nextPar) gsap.set(nextPar, { x: 0, y: 0 });

    const tl = gsap.timeline();

    /* Image out → scale-down + slide */
    if (prevImg) tl.to(prevImg, { x: dir * -80, scale: 0.88, opacity: 0, duration: 0.28, ease: "power3.in" }, 0);
    /* Image in  → from opposite side */
    if (nextImg) {
      gsap.set(nextImg, { x: dir * 100, scale: 1.07, opacity: 0 });
      tl.to(nextImg, { x: 0, scale: 1, opacity: 1, duration: 0.55, ease: "expo.out" }, 0.03);
    }

    /* Text out */
    if (prevTxt) tl.to(prevTxt, { y: dir * -40, opacity: 0, duration: 0.2, ease: "power3.in" }, 0);
    /* Text in — parent then children stagger */
    if (nextTxt) {
      const kids = Array.from(nextTxt.children);
      gsap.set(nextTxt, { y: dir * 50, opacity: 0 });
      gsap.set(kids, { y: 22, opacity: 0 });
      tl.to(nextTxt, { y: 0, opacity: 1, duration: 0.42, ease: "power3.out" }, 0.08);
      tl.to(kids,    { y: 0, opacity: 1, stagger: 0.045, duration: 0.35, ease: "power2.out" }, 0.12);
    }
  };

  /* ── ScrollTrigger: pin + snap ──────────────────────────── */
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
        snapTo: 1 / (bikes.length - 1),
        duration: { min: 0.12, max: 0.22 },   // fast snap
        delay: 0,
        ease: "power3.inOut",
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

  /* ── Mouse parallax (desktop only) — inner div, no conflict ─ */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 28;
      const y = (e.clientY / window.innerHeight - 0.5) * 14;
      parallaxRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.to(el, {
          x: i === activeRef.current ? x : 0,
          y: i === activeRef.current ? y : 0,
          duration: i === activeRef.current ? 1.1 : 0.6,
          ease: "power2.out",
          overwrite: true,
        });
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  /* ── Dot/progress navigation ─────────────────────────────── */
  const goTo = (i: number) => {
    const sticky = stickyRef.current;
    if (!sticky) return;
    const targetY = sticky.offsetTop + i * window.innerHeight;
    const lenis = (window as any).__lenis;
    if (lenis) lenis.scrollTo(targetY, { duration: 0.55 });
    else window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  const activeBike = bikes[activeIndex];

  return (
    <div className="bg-[#0A0A0A]">
      <div ref={stickyRef} className="relative h-screen overflow-hidden bg-[#0A0A0A]">

        {/* ── BIKE IMAGES ── */}
        {bikes.map((bike, i) => (
          <div
            key={bike.id}
            ref={el => { imageRefs.current[i] = el; }}
            className="absolute inset-y-0 right-0 w-full md:w-[70%]"
            style={{ opacity: 0 }}
          >
            {/* Separate inner div for mouse parallax — no transform conflict */}
            <div
              ref={el => { parallaxRefs.current[i] = el; }}
              className="absolute inset-0"
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
          </div>
        ))}

        {/* ── Gradients ── */}
        <div
          className="absolute inset-0 hidden md:block pointer-events-none z-[1]"
          style={{ background: "linear-gradient(to right, #0A0A0A 30%, rgba(10,10,10,0.65) 52%, transparent)" }}
        />
        <div
          className="absolute inset-0 md:hidden pointer-events-none z-[1]"
          style={{ background: "linear-gradient(to top, #0A0A0A 38%, rgba(10,10,10,0.55) 62%, transparent)" }}
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

        {/* ── TEXT BLOCKS ── */}
        <div className="absolute inset-0 z-10 flex md:items-center items-end pb-20 md:pb-0">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 w-full">
            <div className="relative md:max-w-[46%]" style={{ height: "clamp(320px, 50vh, 490px)" }}>
              {bikes.map((bike, i) => (
                <div
                  key={bike.id}
                  ref={el => { textRefs.current[i] = el; }}
                  className="absolute top-0 left-0 w-full"
                  style={{ opacity: 0 }}
                  aria-hidden={i !== activeIndex}
                >
                  {/* Index + Category */}
                  <div className="flex items-center gap-3 mb-4 md:mb-5">
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
                  <h2 className="font-display text-[clamp(44px,9vw,124px)] text-white leading-[0.88] uppercase tracking-tight mb-3">
                    {bike.name}
                  </h2>

                  {/* Accent bar */}
                  <div className="h-[2px] w-12 mb-4 md:mb-5" style={{ backgroundColor: bike.accent }} />

                  {/* Tagline */}
                  <p className="text-sm md:text-lg text-white/35 mb-5 md:mb-7 italic font-light leading-snug">
                    &ldquo;{bike.tagline}&rdquo;
                  </p>

                  {/* Stat */}
                  <div className="mb-7 md:mb-9">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span
                        className="font-display text-[clamp(42px,7vw,92px)] leading-none"
                        style={{ color: bike.accent }}
                      >
                        {bike.stat.value}
                      </span>
                      <span className="text-xl md:text-2xl text-white/35 font-light">
                        {bike.stat.unit}
                      </span>
                    </div>
                    <p className="text-[9px] tracking-[0.45em] text-white/25 uppercase">
                      {bike.stat.label}
                    </p>
                  </div>

                  {/* CTA */}
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
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-colors duration-300"
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
                className="rounded-full transition-all duration-300"
                style={{
                  width:  i === activeIndex ? "6px"  : "4px",
                  height: i === activeIndex ? "32px" : "12px",
                  backgroundColor: i === activeIndex ? activeBike.accent : "rgba(255,255,255,0.18)",
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
          className="fixed left-5 md:left-9 top-0 bottom-0 z-[29] w-px hidden md:block"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(0,255,0,0.18), transparent)" }}
        />

      </div>
    </div>
  );
}
