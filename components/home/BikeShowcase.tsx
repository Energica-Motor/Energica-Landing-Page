"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "@/lib/gsap";

/* ── Data ──────────────────────────────────────────────────────── */
const bikes = [
  { id:"experia",    index:"01", name:"Experia",    tagline:"420 km. One charge.",              category:"Grand Tourer",   stat:{value:"420", unit:"km", label:"City Range"},   accent:"#78BE20", href:"/models/experia",     image:"/images/Pagina Experia/EXPERIA_Bormio Ice.webp"      },
  { id:"esseesse9",  index:"02", name:"EsseEsse9",  tagline:"200 Nm. Instant.",                 category:"Naked Sport",    stat:{value:"200", unit:"Nm", label:"Wheel Torque"}, accent:"#78BE20", href:"/models/esseesse9",   image:"/images/Pagina SS9/EsseEsse9 RS_Sunrise Red.webp"    },
  { id:"eva-ribelle",index:"03", name:"Eva Ribelle",tagline:"147 HP. Italian design.",          category:"Street Fighter", stat:{value:"147", unit:"HP", label:"Peak Power"},   accent:"#78BE20", href:"/models/eva-ribelle", image:"/images/Pagina Eva/EVA Ribelle RS_Stealth Grey.webp" },
  { id:"ego",        index:"04", name:"Ego",        tagline:"147 HP. MotoE-derived. Road legal.",category:"Supersport",   stat:{value:"2.6", unit:"s",  label:"0–100 km/h"},  accent:"#78BE20", href:"/models/ego",         image:"/images/Pagina EGO/EGO RS_Metal Black.webp"         },
];

/* ── Physics constants — tuned for "rubber band loads, then snaps" ─ */
const MAX_VISUAL = 28;    // px — max image drift (same as reference)
const THRESHOLD  = 160;   // accumulated deltaY before snap fires
const RESISTANCE = 2.6;   // asymptotic curve exponent

function calcOffset(raw: number): number {
  const sign  = raw < 0 ? -1 : 1;
  const abs   = Math.min(Math.abs(raw), THRESHOLD * 1.2);
  const norm  = abs / THRESHOLD;
  return sign * MAX_VISUAL * (1 - Math.exp(-norm * RESISTANCE));
}

/* ── Component ─────────────────────────────────────────────────── */
export default function BikeShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  const sectionRef     = useRef<HTMLDivElement>(null);
  const imgWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const snapLineRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const pullFillRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs       = useRef<(HTMLDivElement | null)[]>([]);
  const statusRef      = useRef<HTMLDivElement | null>(null);

  // Mutable state refs for the event handler (no stale closures)
  const currentRef     = useRef(0);
  const lockedRef      = useRef(false);
  const transRef       = useRef(false);
  const pullYRef       = useRef(0);
  const snapToRef      = useRef<((target: number) => void) | null>(null);

  /* ── Initial visibility ──────────────────────────────────────── */
  useEffect(() => {
    // Images: only bike 0 visible
    imgWrapperRefs.current.forEach((el, i) => {
      if (el) gsap.set(el, { opacity: i === 0 ? 1 : 0, y: 0 });
    });
    // Text: only slide 0 visible
    textRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.set(el, { opacity: i === 0 ? 1 : 0, y: 0 });
      gsap.set(Array.from(el.children), { opacity: i === 0 ? 1 : 0, y: 0 });
    });
  }, []);

  /* ── Core scroll engine ──────────────────────────────────────── */
  useEffect(() => {
    const section = sectionRef.current!;
    if (!section) return;

    let releaseTimer: ReturnType<typeof setTimeout> | null = null;

    // ── Apply rubber-band drift to current image + fill bar ──────
    function applyDrift(raw: number) {
      const w = imgWrapperRefs.current[currentRef.current];
      if (w) gsap.set(w, { y: calcOffset(raw) });

      const fill = pullFillRefs.current[currentRef.current];
      if (fill) {
        const pct = Math.min(Math.abs(raw) / THRESHOLD, 1) * 100;
        fill.style.height  = pct + "%";
        fill.style.opacity = pct > 4 ? "1" : "0";
        if (raw < 0) { fill.style.top = "0"; fill.style.bottom = "auto"; }
        else         { fill.style.bottom = "0"; fill.style.top = "auto"; }
      }
    }

    // ── Spring image + fill back to neutral ─────────────────────
    function resetDrift(idx: number) {
      const w = imgWrapperRefs.current[idx];
      if (w) gsap.to(w, { y: 0, duration: 0.42, ease: "power3.out" });
      const fill = pullFillRefs.current[idx];
      if (fill) { fill.style.height = "0"; fill.style.opacity = "0"; }
    }

    // ── Green snap line — sweeps left→right on snap ──────────────
    function fireSnapLine(idx: number) {
      const line = snapLineRefs.current[idx];
      if (!line) return;
      gsap.set(line,  { scaleX: 0, opacity: 1, transformOrigin: "left" });
      gsap.to(line, {
        scaleX: 1, duration: 0.22, ease: "power2.inOut",
        onComplete: () => { gsap.to(line, { opacity: 0, duration: 0.28 }); },
      });
    }

    // ── Animate text block out ──────────────────────────────────
    function exitText(idx: number, dir: number) {
      const el = textRefs.current[idx];
      if (!el) return;
      gsap.killTweensOf(el);
      gsap.to(el, { y: dir * -22, opacity: 0, duration: 0.18, ease: "power2.in" });
    }

    // ── Animate text block in ───────────────────────────────────
    function enterText(idx: number, dir: number) {
      const el = textRefs.current[idx];
      if (!el) return;
      const kids = Array.from(el.children) as HTMLElement[];
      gsap.killTweensOf(el);
      gsap.killTweensOf(kids);
      gsap.set(el,   { y: dir * 30, opacity: 0 });
      gsap.set(kids, { y: 12, opacity: 0 });
      gsap.to(el,   { y: 0, opacity: 1, duration: 0.52, ease: "expo.out", delay: 0.05 });
      gsap.to(kids, { y: 0, opacity: 1, duration: 0.40, stagger: 0.04, ease: "power2.out", delay: 0.1 });
    }

    // ── Reset text state silently ────────────────────────────────
    function resetText(idx: number) {
      const el = textRefs.current[idx];
      if (!el) return;
      gsap.set(el, { y: 0, opacity: 0 });
      gsap.set(Array.from(el.children), { y: 0, opacity: 0 });
    }

    // ── Status label ─────────────────────────────────────────────
    function showStatus(msg: string) {
      const el = statusRef.current;
      if (!el) return;
      el.textContent = msg;
      gsap.to(el, { opacity: 1, duration: 0.3 });
    }
    function hideStatus() {
      const el = statusRef.current;
      if (!el) return;
      gsap.to(el, { opacity: 0, duration: 0.4 });
    }

    // ── Main snap function ───────────────────────────────────────
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

      // ── Phase 1: Exit (image + text + snap line) ─────────────
      if (fromW) {
        gsap.to(fromW, { y: dir * -40, opacity: 0, duration: 0.18, ease: "power2.in" });
      }
      exitText(from, dir);
      fireSnapLine(from);

      // ── Phase 2: Enter (190ms later) ─────────────────────────
      setTimeout(() => {
        currentRef.current = target;
        setActiveIndex(target);

        // Position new image off-screen and spring it home
        if (toW) {
          gsap.set(toW, { y: dir * 44, opacity: 0 });
          // Double-rAF ensures the set() is painted before the tween starts
          requestAnimationFrame(() => requestAnimationFrame(() => {
            gsap.to(toW, { y: 0, opacity: 1, duration: 0.52, ease: "expo.out" });
          }));
        }

        enterText(target, dir);

        // Restore old wrapper (hidden but y:0 for next use)
        setTimeout(() => {
          if (fromW) gsap.set(fromW, { y: 0, opacity: 0 });
          resetText(from);
        }, 120);

        // Cleanup after full animation
        setTimeout(() => {
          transRef.current = false;
          pullYRef.current  = 0;
          resetDrift(target);

          // Release lock when landing at first or last bike
          if (target === 0 || target === bikes.length - 1) {
            setTimeout(() => {
              lockedRef.current = false;
              const lenis = (window as any).__lenis;
              if (lenis) lenis.start();
              hideStatus();
            }, 380);
          }
        }, 570);
      }, 190);
    }

    // Expose for dot-nav
    snapToRef.current = snapTo;

    // ── Lock / Unlock ────────────────────────────────────────────
    function lock() {
      if (lockedRef.current) return;
      lockedRef.current = true;
      pullYRef.current  = 0;
      const lenis = (window as any).__lenis;
      if (lenis) lenis.stop();
      window.scrollTo({ top: sectionRef.current!.offsetTop, behavior: "instant" as ScrollBehavior });
      showStatus("↕ SCROLL CAPTURED");
    }

    function unlock() {
      lockedRef.current = false;
      pullYRef.current  = 0;
      resetDrift(currentRef.current);
      const lenis = (window as any).__lenis;
      if (lenis) lenis.start();
      hideStatus();
    }

    // ── Wheel handler ────────────────────────────────────────────
    function onWheel(e: WheelEvent) {
      const rect = section.getBoundingClientRect();
      const down = e.deltaY > 0;
      const up   = e.deltaY < 0;

      // Gate: approaching from above (scroll down)
      if (!lockedRef.current && down && rect.top > 0 && rect.top <= window.innerHeight) {
        e.preventDefault();
        lock();
        return;
      }
      // Gate: approaching from below (scroll up) — only fires when section top is above fold
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

      // Snap to prev
      if (pullYRef.current < -THRESHOLD && currentRef.current > 0) {
        snapTo(currentRef.current - 1);
        return;
      }
      // Snap to next
      if (pullYRef.current > THRESHOLD && currentRef.current < bikes.length - 1) {
        snapTo(currentRef.current + 1);
        return;
      }
      // At boundary with enough pull → release
      if ((pullYRef.current < -THRESHOLD && currentRef.current === 0) ||
          (pullYRef.current > THRESHOLD  && currentRef.current === bikes.length - 1)) {
        unlock();
        return;
      }

      // Spring back after scroll pause
      if (releaseTimer) clearTimeout(releaseTimer);
      releaseTimer = setTimeout(() => {
        if (!transRef.current) { pullYRef.current = 0; resetDrift(currentRef.current); }
      }, 180);
    }

    // ── Touch support ─────────────────────────────────────────────
    let touchStartY = 0;
    let touching    = false;

    function onTouchStart(e: TouchEvent) {
      const rect = section.getBoundingClientRect();
      if (!lockedRef.current && rect.top >= 0 && rect.top < 40) {
        lockedRef.current = true;
        const lenis = (window as any).__lenis;
        if (lenis) lenis.stop();
      }
      if (!lockedRef.current) return;
      touchStartY = e.touches[0].clientY;
      touching = true; pullYRef.current = 0;
    }

    function onTouchMove(e: TouchEvent) {
      if (!lockedRef.current || !touching || transRef.current) return;
      e.preventDefault();
      pullYRef.current = (touchStartY - e.touches[0].clientY) * 1.2;
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

    // Cleanup unlock if section leaves viewport
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (!e.isIntersecting && lockedRef.current) unlock(); });
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
      const lenis = (window as any).__lenis;
      if (lenis && lockedRef.current) lenis.start();
    };
  }, []);

  /* ── Dot navigation ──────────────────────────────────────────── */
  const goTo = (i: number) => {
    const section = sectionRef.current;
    if (!section) return;
    if (!lockedRef.current) {
      lockedRef.current = true;
      const lenis = (window as any).__lenis;
      if (lenis) lenis.stop();
      window.scrollTo({ top: section.offsetTop, behavior: "instant" as ScrollBehavior });
    }
    snapToRef.current?.(i);
  };

  const activeBike = bikes[activeIndex];

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <section ref={sectionRef} className="relative h-screen overflow-hidden bg-[#0A0A0A]">

      {/* ── Status indicator ─────────────────────────────────────── */}
      <div
        ref={statusRef}
        className="absolute top-[72px] right-6 md:right-14 z-30 pointer-events-none"
        style={{
          fontFamily: "var(--font-ibm-mono)",
          fontSize: "9px",
          letterSpacing: "0.35em",
          color: "rgba(120,190,32,0.55)",
          opacity: 0,
          textTransform: "uppercase",
        }}
      />

      {/* ── IMAGE FRAME (desktop) ─────────────────────────────────── */}
      <div
        className="absolute hidden md:block"
        style={{ right: "2%", top: "50%", transform: "translateY(-50%)", width: "62%", height: "78%", zIndex: 1 }}
      >
        {/* Atmospheric glow */}
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 65% at 58% 55%, rgba(120,190,32,0.10) 0%, rgba(120,190,32,0.03) 50%, transparent 75%)", pointerEvents:"none" }} />
        {/* Bottom fade */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"22%", background:"linear-gradient(to top, #0A0A0A 0%, rgba(10,10,10,0.5) 60%, transparent 100%)", zIndex:3, pointerEvents:"none" }} />
        {/* Top fade */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"12%", background:"linear-gradient(to bottom, #0A0A0A 0%, transparent 100%)", zIndex:3, pointerEvents:"none" }} />

        {bikes.map((bike, i) => (
          <div
            key={bike.id}
            ref={el => { imgWrapperRefs.current[i] = el; }}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: i === activeIndex ? 2 : 0,
              willChange: "transform, opacity",
              pointerEvents: i === activeIndex ? "auto" : "none",
            }}
            data-cursor-view
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bike.image}
              alt={bike.name}
              style={{ width:"100%", height:"100%", objectFit:"contain", objectPosition:"center bottom", display:"block", filter:"brightness(0.9) contrast(1.05)", userSelect:"none", pointerEvents:"none" }}
            />

            {/* Green snap line — sweeps on transition */}
            <div
              ref={el => { snapLineRefs.current[i] = el; }}
              style={{
                position: "absolute",
                bottom: 0, left: 0, right: 0,
                height: "2px",
                background: "#78BE20",
                opacity: 0,
                transform: "scaleX(0)",
                transformOrigin: "left",
                pointerEvents: "none",
                zIndex: 10,
              }}
            />

            {/* Pull-fill track — right edge, rubber band load indicator */}
            <div
              style={{
                position: "absolute",
                right: -12, top: 0, bottom: 0,
                width: "2px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "1px",
                zIndex: 10,
                overflow: "hidden",
              }}
            >
              <div
                ref={el => { pullFillRefs.current[i] = el; }}
                style={{
                  position: "absolute",
                  left: 0, right: 0,
                  height: "0%",
                  background: "#78BE20",
                  borderRadius: "1px",
                  opacity: 0,
                  transition: "opacity 0.1s",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── IMAGE FRAME (mobile) ──────────────────────────────────── */}
      <div className="absolute inset-0 md:hidden" style={{ zIndex: 1 }}>
        {bikes.map((bike, i) => (
          <div
            key={bike.id}
            ref={el => { if (!imgWrapperRefs.current[i]) imgWrapperRefs.current[i] = el; }}
            style={{ position:"absolute", inset:0, zIndex: i === activeIndex ? 2 : 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bike.image} alt={bike.name} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain", objectPosition:"center 55%" }} />
          </div>
        ))}
        <div className="pointer-events-none" style={{ position:"absolute", inset:0, background:"linear-gradient(to top, #0A0A0A 40%, rgba(10,10,10,0.5) 65%, transparent)", zIndex:2 }} />
      </div>

      {/* ── Left gradient ────────────────────────────────────────── */}
      <div
        className="absolute inset-0 hidden md:block pointer-events-none z-[2]"
        style={{ background:"linear-gradient(to right, #0A0A0A 32%, rgba(10,10,10,0.88) 44%, rgba(10,10,10,0.15) 58%, transparent 100%)" }}
      />

      {/* ── Top label ────────────────────────────────────────────── */}
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
          <div className="relative md:max-w-[44%]" style={{ height:"clamp(320px,50vh,490px)" }}>
            {bikes.map((bike, i) => (
              <div
                key={bike.id}
                ref={el => { textRefs.current[i] = el; }}
                className="absolute top-0 left-0 w-full"
                aria-hidden={i !== activeIndex}
              >
                <div className="flex items-center gap-3 mb-5 md:mb-6">
                  <span style={{ fontFamily:"var(--font-ibm-mono)", fontSize:"11px", letterSpacing:"0.45em", color:"rgba(255,255,255,0.55)" }}>{bike.index}</span>
                  <div className="w-5 h-px bg-white/40" />
                  <span className="mono-tag">{bike.category}</span>
                </div>

                <h2 className="font-display text-[clamp(44px,9vw,124px)] text-white leading-[0.88] uppercase tracking-tight mb-3">
                  {bike.name}
                </h2>

                <div className="h-[2px] w-12 mb-4 md:mb-5" style={{ backgroundColor: bike.accent }} />

                <p className="text-sm md:text-base text-white/65 mb-5 md:mb-7 font-light leading-relaxed tracking-wide" style={{ fontFamily:"var(--font-ibm-sans)" }}>
                  {bike.tagline}
                </p>

                <div className="mb-7 md:mb-9">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-display text-[clamp(42px,7vw,92px)] leading-none" style={{ color:bike.accent }}>{bike.stat.value}</span>
                    <span className="text-xl md:text-2xl text-white/60 font-light">{bike.stat.unit}</span>
                  </div>
                  <p className="text-[11px] tracking-[0.4em] text-white/50 uppercase" style={{ fontFamily:"var(--font-ibm-mono)" }}>{bike.stat.label}</p>
                </div>

                <Link href={bike.href} className="inline-flex items-center gap-3 group">
                  <span className="h-px w-8 group-hover:w-16 transition-all duration-300" style={{ backgroundColor:bike.accent }} />
                  <span className="text-[11px] tracking-[0.3em] text-white uppercase group-hover:text-white/50 transition-colors duration-200">
                    Discover {bike.name}
                  </span>
                  <span className="text-xs opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200" style={{ color:bike.accent }}>→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Ghost index watermark ─────────────────────────────────── */}
      <div className="absolute bottom-0 right-3 md:right-14 lg:right-20 z-0 select-none pointer-events-none overflow-hidden h-[160px] md:h-[220px]">
        {bikes.map((bike, i) => (
          <span
            key={bike.id}
            className="absolute bottom-0 right-0 font-display text-[clamp(110px,15vw,190px)] leading-none"
            style={{
              color: "transparent",
              WebkitTextStroke: `1px rgba(120,190,32,0.12)`,
              opacity: i === activeIndex ? 1 : 0,
              transition: "opacity 0.35s ease",
            }}
          >
            {bike.index}
          </span>
        ))}
      </div>

      {/* ── Left nav dots ────────────────────────────────────────── */}
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
                backgroundColor: i === activeIndex ? activeBike.accent : "rgba(255,255,255,0.30)",
              }}
            />
            <span className={`hidden xl:block text-[9px] tracking-[0.3em] uppercase whitespace-nowrap transition-all duration-200 ${i === activeIndex ? "text-white" : "text-white/0 group-hover:text-white/35"}`}>
              {bike.name}
            </span>
          </button>
        ))}
      </div>

      {/* ── Left accent line ─────────────────────────────────────── */}
      <div
        className="absolute left-5 md:left-9 top-0 bottom-0 z-[29] w-px hidden md:block"
        style={{ background:"linear-gradient(to bottom, transparent, rgba(120,190,32,0.18), transparent)" }}
      />

    </section>
  );
}
