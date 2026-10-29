"use client";

// One timing for every scroll reveal and number counter on the site.
// Content is always in the server HTML at its final state: reveals only add
// their hidden start state once JS runs, counters render the real value and
// only count when fully in view. With reduced motion nothing moves.
import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";

export const REVEAL = {
  start: "top 85%", // element is about 15% into the viewport
  duration: 0.45,
  stagger: 0.08, // the most allowed between siblings
  ease: "power2.out",
} as const;

export const COUNT_MS = 900;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type RevealVars = Omit<gsap.TweenVars, "scrollTrigger"> & {
  trigger?: gsap.DOMTarget; // defaults to the targets themselves
  scroll?: boolean; // false for an entrance on load (heroes, forms)
};

/**
 * Fades targets in from opacity 0 (plus any offset given, e.g. y: 20) when
 * they're 15% into view, and clears the inline styles afterwards so they
 * always end at full opacity. A no-op with reduced motion.
 */
export function reveal(targets: gsap.TweenTarget, { trigger, scroll = true, stagger, duration, delay, ...vars }: RevealVars = {}) {
  if (prefersReducedMotion()) return null;
  return gsap.from(targets, {
    opacity: 0,
    ease: REVEAL.ease,
    clearProps: "opacity,transform", // callers animating transform elsewhere pass "opacity"
    ...vars,
    duration: Math.min(Number(duration ?? REVEAL.duration), 0.5),
    stagger: typeof stagger === "number" ? Math.min(stagger, REVEAL.stagger) : stagger,
    delay: Math.min(Number(delay ?? 0), 0.5),
    ...(scroll ? { scrollTrigger: { trigger: (trigger ?? targets) as gsap.DOMTarget, start: REVEAL.start, once: true } } : {}),
  });
}

export const formatCount = (n: number, decimals: number) => n.toFixed(decimals);

/**
 * Counts the element's text from 0 up to `value` once the element is fully
 * in view, landing exactly on `value`. The element must already render the
 * final value (formatCount) so that is what no-JS visitors, crawlers and
 * reduced-motion visitors see.
 */
export function useCountUp(ref: RefObject<Element | null>, value: number, decimals = 0) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
    const final = formatCount(value, decimals);
    let raf = 0;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / COUNT_MS, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = t < 1 ? formatCount(eased * value, decimals) : final;
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 1 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = final;
    };
  }, [ref, value, decimals]);
}
