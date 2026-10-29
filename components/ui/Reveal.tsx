"use client";

import { useEffect, useRef, ElementType } from "react";
import { prefersReducedMotion } from "@/lib/motion";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;      // ms, at most 80 per sibling
  as?: ElementType;
}

export default function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    // Set hidden state after mount (avoids SSR mismatch)
    el.classList.add("will-reveal");

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.classList.add("is-revealed");
          }, delay);
          obs.disconnect();
        }
      },
      // Fires once the element's top is 15% into the viewport
      { rootMargin: "0px 0px -15% 0px" }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  return <Tag ref={ref} className={className}>{children}</Tag>;
}
