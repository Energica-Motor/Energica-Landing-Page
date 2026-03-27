"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "@/lib/gsap";

/* ── Data ──────────────────────────────────────────────────────── */
const bikes = [
  { id:"experia",    index:"01", name:"Experia",    tagline:"420 km. One charge.",              category:"Grand Tourer",   stat:{value:"420", unit:"km", label:"City Range"},   accent:"#78BE20", href:"/models/experia",     image:"/images/Pagina Experia/EXPERIA_Bormio Ice.webp"      },
  { id:"esseesse9",  index:"02", name:"EsseEsse9",  tagline:"207 Nm. Instant.",                 category:"Naked Sport",    stat:{value:"207", unit:"Nm", label:"Wheel Torque"}, accent:"#78BE20", href:"/models/esseesse9",   image:"/images/Pagina SS9/EsseEsse9 RS_Sunrise Red.webp"    },
  { id:"eva-ribelle",index:"03", name:"Eva Ribelle",tagline:"147 HP. Italian design.",          category:"Street Fighter", stat:{value:"147", unit:"HP", label:"Peak Power"},   accent:"#78BE20", href:"/models/eva-ribelle", image:"/images/Pagina Eva/EVA Ribelle RS_Stealth Grey.webp" },
  { id:"ego",        index:"04", name:"Ego",        tagline:"169 HP. MotoE-derived. Road legal.",category:"Supersport",   stat:{value:"2.6", unit:"s",  label:"0–60 mph"},    accent:"#78BE20", href:"/models/ego",         image:"/images/Pagina EGO/EGO RS_Metal Black.webp"         },
];

/* ── Physics — identical to reference HTML ─────────────────────── */
const MAX_VISUAL = 28;
const THRESHOLD  = 160;
const RESISTANCE = 2.6;

function calcOffset(raw: number): number {
  const sign = raw < 0 ? -1 : 1;
  const abs  = Math.min(Math.abs(raw), THRESHOLD * 1.2);
  return sign * MAX_VISUAL * (1 - Math.exp(-(abs / THRESHOLD) * RESISTANCE));
}

/* ── CSS easing strings (matched to reference cubic-bezier) ──── */
const EASE_EXIT   = "transform 0.18s cubic-bezier(0.4,0,1,1), opacity 0.18s ease";
const EASE_ENTER  = "transform 0.52s cubic-bezier(0.16,1,0.3,1), opacity 0.28s ease";
const EASE_SPRING = "transform 0.42s cubic-bezier(0.22,1,0.36,1)";

/* ─────────────────────────────────────────────────────────────── */
export default function BikeShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  const sectionRef     = useRef<HTMLDivElement>(null);
  const imgWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const snapLineRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const pullFillRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs       = useRef<(HTMLDivElement | null)[]>([]);
  const statusRef      = useRef<HTMLSpanElement | null>(null);

  const currentRef = useRef(0);
  const lockedRef  = useRef(false);
  const transRef   = useRef(false);
  const pullYRef   = useRef(0);
  const snapFnRef  = useRef<((target: number) => void) | null>(null);

  /* ── Initial state — direct DOM, no GSAP overhead ───────────── */
  useEffect(() => {
    imgWrapperRefs.current.forEach((el, i) => {
      if (!el) return;
      el.style.opacity   = i === 0 ? "1" : "0";
      el.style.transform = "translateY(0)";
    });
    textRefs.current.forEach((el, i) => {
      if (!el) return;
      el.style.opacity   = i === 0 ? "1" : "0";
      el.style.transform = "translateY(0)";
      Array.from(el.children).forEach(c => {
        (c as HTMLElement).style.opacity   = i === 0 ? "1" : "0";
        (c as HTMLElement).style.transform = "translateY(0)";
      });
    });
  }, []);

  /* ── Scroll engine ───────────────────────────────────────────── */
  useEffect(() => {
    const section = sectionRef.current!;
    if (!section) return;
    let releaseTimer: ReturnType<typeof setTimeout> | null = null;

    /* Image helpers — pure CSS transitions, zero JS per frame ──── */

    function imgSet(el: HTMLDivElement, y: number, opacity: number, transition = "none") {
      el.style.transition = transition;
      el.style.transform  = `translateY(${y}px)`;
      el.style.opacity    = String(opacity);
    }

    function applyDrift(raw: number) {
      const w = imgWrapperRefs.current[currentRef.current];
      if (w) {
        w.style.transition = "none";
        w.style.transform  = `translateY(${calcOffset(raw)}px)`;
      }
      const fill = pullFillRefs.current[currentRef.current];
      if (fill) {
        const pct = Math.min(Math.abs(raw) / THRESHOLD, 1) * 100;
        fill.style.height  = pct + "%";
        fill.style.opacity = pct > 4 ? "1" : "0";
        fill.style.top     = raw < 0 ? "0"    : "auto";
        fill.style.bottom  = raw >= 0 ? "0"   : "auto";
      }
    }

    function resetDrift(idx: number) {
      const w = imgWrapperRefs.current[idx];
      if (w) {
        w.style.transition = EASE_SPRING;
        w.style.transform  = "translateY(0)";
      }
      const fill = pullFillRefs.current[idx];
      if (fill) { fill.style.height = "0"; fill.style.opacity = "0"; }
    }

    /* Snap line — CSS transition, compositor-thread ─────────────  */
    function fireSnapLine(idx: number) {
      const line = snapLineRefs.current[idx];
      if (!line) return;
      line.style.transition  = "none";
      line.style.transform   = "scaleX(0)";
      line.style.opacity     = "1";
      line.style.transformOrigin = "left";
      requestAnimationFrame(() => requestAnimationFrame(() => {
        line.style.transition = "transform 0.22s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease 0.22s";
        line.style.transform  = "scaleX(1)";
        line.style.opacity    = "0";
      }));
    }

    /* Text — GSAP for stagger complexity ────────────────────────  */
    function exitText(idx: number, dir: number) {
      const el = textRefs.current[idx];
      if (!el) return;
      gsap.killTweensOf([el, ...Array.from(el.children)]);
      gsap.to(el, { y: dir * -22, opacity: 0, duration: 0.18, ease: "power2.in" });
    }

    function enterText(idx: number, dir: number) {
      const el = textRefs.current[idx];
      if (!el) return;
      const kids = Array.from(el.children) as HTMLElement[];
      gsap.killTweensOf([el, ...kids]);
      gsap.set(el,   { y: dir * 28, opacity: 0 });
      gsap.set(kids, { y: 10, opacity: 0 });
      gsap.to(el,   { y: 0, opacity: 1, duration: 0.52, ease: "expo.out", delay: 0.04 });
      gsap.to(kids, { y: 0, opacity: 1, duration: 0.38, stagger: 0.04, ease: "power2.out", delay: 0.09 });
    }

    function resetText(idx: number) {
      const el = textRefs.current[idx];
      if (!el) return;
      gsap.set(el, { y: 0, opacity: 0 });
      gsap.set(Array.from(el.children), { y: 0, opacity: 0 });
    }

    /* Status ─────────────────────────────────────────────────────  */
    function setStatus(visible: boolean) {
      const el = statusRef.current;
      if (!el) return;
      el.style.transition = `opacity ${visible ? "0.25" : "0.35"}s`;
      el.style.opacity    = visible ? "1" : "0";
    }

    /* ── SNAP ────────────────────────────────────────────────────  */
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

      /* Phase 1 — exit current (180ms) */
      if (fromW) imgSet(fromW, dir * -40, 0, EASE_EXIT);
      exitText(from, dir);
      fireSnapLine(from);

      /* Phase 2 — enter new (190ms after) */
      setTimeout(() => {
        currentRef.current = target;
        setActiveIndex(target);

        /* Position new image off-screen — no transition */
        if (toW) {
          imgSet(toW, dir * 44, 0);
          /* Double-rAF: ensure browser paints the starting position
             before the spring transition begins — same as reference */
          requestAnimationFrame(() => requestAnimationFrame(() => {
            toW.style.transition = EASE_ENTER;
            toW.style.transform  = "translateY(0)";
            toW.style.opacity    = "1";
          }));
        }

        enterText(target, dir);

        /* Restore old wrapper silently after enter has started */
        setTimeout(() => {
          if (fromW) imgSet(fromW, 0, 0);
          resetText(from);
        }, 110);

        /* Cleanup */
        setTimeout(() => {
          transRef.current = false;
          pullYRef.current = 0;
          resetDrift(target);

          if (target === 0 || target === bikes.length - 1) {
            setTimeout(() => {
              lockedRef.current = false;
              const lenis = (window as any).__lenis;
              if (lenis) lenis.start();
              setStatus(false);
            }, 360);
          }
        }, 560);
      }, 190);
    }

    snapFnRef.current = snapTo;

    /* ── Lock / Unlock ───────────────────────────────────────────  */
    function lock() {
      if (lockedRef.current) return;
      lockedRef.current = true;
      pullYRef.current  = 0;
      const lenis = (window as any).__lenis;
      if (lenis) lenis.stop();
      /* Snap page to section top — stops any in-flight momentum */
      window.scrollTo({ top: section.offsetTop, behavior: "instant" as ScrollBehavior });
      setStatus(true);
    }

    function unlock() {
      lockedRef.current = false;
      pullYRef.current  = 0;
      resetDrift(currentRef.current);
      const lenis = (window as any).__lenis;
      if (lenis) lenis.start();
      setStatus(false);
    }

    /* ── Wheel ───────────────────────────────────────────────────
       capture:true fires OUR handler BEFORE Lenis — prevents Lenis
       from starting a smooth-scroll animation toward a target that
       we're about to intercept. Eliminates the "lurch" on capture. */
    function onWheel(e: WheelEvent) {
      const rect = section.getBoundingClientRect();
      const down = e.deltaY > 0;
      const up   = e.deltaY < 0;

      /* Gate: section approaching from above */
      if (!lockedRef.current && down && rect.top > 0 && rect.top <= window.innerHeight) {
        e.preventDefault();
        lock();
        return;
      }
      /* Gate: section partially above fold, scrolling up */
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
        snapTo(currentRef.current - 1); return;
      }
      if (pullYRef.current > THRESHOLD && currentRef.current < bikes.length - 1) {
        snapTo(currentRef.current + 1); return;
      }
      /* Boundary — release */
      if ((pullYRef.current < -THRESHOLD && currentRef.current === 0) ||
          (pullYRef.current > THRESHOLD  && currentRef.current === bikes.length - 1)) {
        unlock(); return;
      }
      /* Spring back on pause */
      if (releaseTimer) clearTimeout(releaseTimer);
      releaseTimer = setTimeout(() => {
        if (!transRef.current) { pullYRef.current = 0; resetDrift(currentRef.current); }
      }, 180);
    }

    /* ── Touch ───────────────────────────────────────────────────  */
    let touchStartY = 0, touching = false;

    function onTouchStart(e: TouchEvent) {
      const rect = section.getBoundingClientRect();
      if (!lockedRef.current && rect.top >= 0 && rect.top < 40) {
        lockedRef.current = true;
        const lenis = (window as any).__lenis;
        if (lenis) lenis.stop();
      }
      if (!lockedRef.current) return;
      touchStartY = e.touches[0].clientY; touching = true; pullYRef.current = 0;
    }
    function onTouchMove(e: TouchEvent) {
      if (!lockedRef.current || !touching || transRef.current) return;
      e.preventDefault();
      pullYRef.current = Math.max(-THRESHOLD * 1.1, Math.min(THRESHOLD * 1.1,
        (touchStartY - e.touches[0].clientY) * 1.2));
      applyDrift(pullYRef.current);
      if (pullYRef.current < -THRESHOLD && currentRef.current > 0)                  { touching = false; snapTo(currentRef.current - 1); }
      else if (pullYRef.current > THRESHOLD && currentRef.current < bikes.length - 1) { touching = false; snapTo(currentRef.current + 1); }
    }
    function onTouchEnd() {
      if (!lockedRef.current) return;
      touching = false;
      if (!transRef.current) { pullYRef.current = 0; resetDrift(currentRef.current); }
    }

    /* Cleanup unlock if section leaves viewport (e.g. programmatic scroll) */
    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting && lockedRef.current) unlock();
    }, { threshold: 0 });
    io.observe(section);

    /* capture:true — runs before Lenis's bubble-phase listener */
    window.addEventListener("wheel",      onWheel,      { passive: false, capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true  });
    window.addEventListener("touchmove",  onTouchMove,  { passive: false });
    window.addEventListener("touchend",   onTouchEnd,   { passive: true  });

    return () => {
      window.removeEventListener("wheel",      onWheel,      { capture: true });
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove",  onTouchMove);
      window.removeEventListener("touchend",   onTouchEnd);
      io.disconnect();
      if (releaseTimer) clearTimeout(releaseTimer);
      const lenis = (window as any).__lenis;
      if (lenis && lockedRef.current) lenis.start();
    };
  }, []);

  /* ── Dot nav ─────────────────────────────────────────────────── */
  const goTo = (i: number) => {
    if (!lockedRef.current) {
      lockedRef.current = true;
      const lenis = (window as any).__lenis;
      if (lenis) lenis.stop();
      window.scrollTo({ top: sectionRef.current!.offsetTop, behavior: "instant" as ScrollBehavior });
    }
    snapFnRef.current?.(i);
  };

  const activeBike = bikes[activeIndex];

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <section ref={sectionRef} className="relative h-screen overflow-hidden bg-[#0A0A0A]">

      {/* ── Lock status ──────────────────────────────────────────── */}
      <span
        ref={statusRef}
        className="absolute top-[72px] right-6 md:right-14 z-30 pointer-events-none select-none"
        style={{
          fontFamily: "var(--font-ibm-mono)",
          fontSize: "9px",
          letterSpacing: "0.35em",
          color: "rgba(120,190,32,0.55)",
          opacity: 0,
          textTransform: "uppercase",
          transition: "opacity 0.3s",
        }}
      >
        ↕ SCROLL CAPTURED
      </span>

      {/* ── Image frame (desktop) ────────────────────────────────── */}
      <div
        className="absolute hidden md:block"
        style={{ right:"2%", top:"50%", transform:"translateY(-50%)", width:"62%", height:"78%", zIndex:1 }}
      >
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 65% at 58% 55%, rgba(120,190,32,0.10) 0%, rgba(120,190,32,0.03) 50%, transparent 75%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"22%", background:"linear-gradient(to top, #0A0A0A 0%, rgba(10,10,10,0.5) 60%, transparent 100%)", zIndex:3, pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"12%", background:"linear-gradient(to bottom, #0A0A0A 0%, transparent 100%)", zIndex:3, pointerEvents:"none" }} />

        {bikes.map((bike, i) => (
          <div
            key={bike.id}
            ref={el => { imgWrapperRefs.current[i] = el; }}
            style={{
              position: "absolute", inset: 0,
              willChange: "transform, opacity",
              zIndex: i === activeIndex ? 2 : 0,
              pointerEvents: i === activeIndex ? "auto" : "none",
            }}
            data-cursor-view
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bike.image} alt={bike.name}
              style={{ width:"100%", height:"100%", objectFit:"contain", objectPosition:"center bottom", display:"block", filter:"brightness(0.9) contrast(1.05)", userSelect:"none", pointerEvents:"none" }}
            />

            {/* Snap line */}
            <div
              ref={el => { snapLineRefs.current[i] = el; }}
              style={{ position:"absolute", bottom:0, left:0, right:0, height:"2px", background:"#78BE20", opacity:0, transform:"scaleX(0)", transformOrigin:"left", pointerEvents:"none", zIndex:10 }}
            />

            {/* Pull-fill track */}
            <div style={{ position:"absolute", right:-12, top:0, bottom:0, width:"2px", background:"rgba(255,255,255,0.05)", borderRadius:"1px", zIndex:10, overflow:"hidden" }}>
              <div
                ref={el => { pullFillRefs.current[i] = el; }}
                style={{ position:"absolute", left:0, right:0, height:"0%", background:"#78BE20", borderRadius:"1px", opacity:0, transition:"opacity 0.1s" }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Image frame (mobile) ─────────────────────────────────── */}
      <div className="absolute inset-0 md:hidden" style={{ zIndex:1 }}>
        {bikes.map((bike, i) => (
          <div
            key={bike.id}
            ref={el => { if (!imgWrapperRefs.current[i]) imgWrapperRefs.current[i] = el; }}
            style={{ position:"absolute", inset:0, willChange:"transform, opacity", zIndex: i === activeIndex ? 2 : 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bike.image} alt={bike.name} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain", objectPosition:"center 55%" }} />
          </div>
        ))}
        <div className="pointer-events-none" style={{ position:"absolute", inset:0, background:"linear-gradient(to top, #0A0A0A 40%, rgba(10,10,10,0.5) 65%, transparent)", zIndex:2 }} />
      </div>

      {/* Left gradient */}
      <div className="absolute inset-0 hidden md:block pointer-events-none z-[2]" style={{ background:"linear-gradient(to right, #0A0A0A 32%, rgba(10,10,10,0.88) 44%, rgba(10,10,10,0.15) 58%, transparent 100%)" }} />

      {/* Top label */}
      <div className="absolute top-0 left-0 right-0 z-20 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 pt-14">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <p className="text-[10px] tracking-[0.45em] text-white/50 uppercase">The Lineup</p>
          <Link href="/models" className="text-[10px] tracking-[0.3em] text-white/50 uppercase hover:text-white transition-colors duration-200">View all →</Link>
        </div>
      </div>

      {/* Text blocks */}
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
                <h2 className="font-display text-[clamp(44px,9vw,124px)] text-white leading-[0.88] uppercase tracking-tight mb-3">{bike.name}</h2>
                <div className="h-[2px] w-12 mb-4 md:mb-5" style={{ backgroundColor:bike.accent }} />
                <p className="text-sm md:text-base text-white/65 mb-5 md:mb-7 font-light leading-relaxed tracking-wide" style={{ fontFamily:"var(--font-ibm-sans)" }}>{bike.tagline}</p>
                <div className="mb-7 md:mb-9">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-display text-[clamp(42px,7vw,92px)] leading-none" style={{ color:bike.accent }}>{bike.stat.value}</span>
                    <span className="text-xl md:text-2xl text-white/60 font-light">{bike.stat.unit}</span>
                  </div>
                  <p className="text-[11px] tracking-[0.4em] text-white/50 uppercase" style={{ fontFamily:"var(--font-ibm-mono)" }}>{bike.stat.label}</p>
                </div>
                <Link href={bike.href} className="inline-flex items-center gap-3 group">
                  <span className="h-px w-8 group-hover:w-16 transition-all duration-300" style={{ backgroundColor:bike.accent }} />
                  <span className="text-[11px] tracking-[0.3em] text-white uppercase group-hover:text-white/50 transition-colors duration-200">Discover {bike.name}</span>
                  <span className="text-xs opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200" style={{ color:bike.accent }}>→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ghost watermark */}
      <div className="absolute bottom-0 right-3 md:right-14 lg:right-20 z-0 select-none pointer-events-none overflow-hidden h-[160px] md:h-[220px]">
        {bikes.map((bike, i) => (
          <span key={bike.id} className="absolute bottom-0 right-0 font-display text-[clamp(110px,15vw,190px)] leading-none"
            style={{ color:"transparent", WebkitTextStroke:"1px rgba(120,190,32,0.12)", opacity: i === activeIndex ? 1 : 0, transition:"opacity 0.35s ease" }}>
            {bike.index}
          </span>
        ))}
      </div>

      {/* Left nav dots */}
      <div className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-start gap-4">
        {bikes.map((bike, i) => (
          <button key={bike.id} onClick={() => goTo(i)} aria-label={`Go to ${bike.name}`} className="group flex items-center gap-3">
            <div className="rounded-full transition-all duration-300"
              style={{ width: i === activeIndex ? "6px" : "4px", height: i === activeIndex ? "32px" : "12px", backgroundColor: i === activeIndex ? activeBike.accent : "rgba(255,255,255,0.30)" }} />
            <span className={`hidden xl:block text-[9px] tracking-[0.3em] uppercase whitespace-nowrap transition-all duration-200 ${i === activeIndex ? "text-white" : "text-white/0 group-hover:text-white/35"}`}>
              {bike.name}
            </span>
          </button>
        ))}
      </div>

      {/* Left accent line */}
      <div className="absolute left-5 md:left-9 top-0 bottom-0 z-[29] w-px hidden md:block"
        style={{ background:"linear-gradient(to bottom, transparent, rgba(120,190,32,0.18), transparent)" }} />

    </section>
  );
}
