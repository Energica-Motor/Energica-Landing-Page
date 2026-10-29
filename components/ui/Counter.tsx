"use client";

import { useRef } from "react";
import { formatCount, useCountUp } from "@/lib/motion";

/**
 * A number that renders its real value in the HTML and counts up to it once
 * fully in view (lib/motion). Units, "+" signs and labels stay with the caller.
 */
export function Counter({ value, decimals = 0, className }: { value: number; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useCountUp(ref, value, decimals);
  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {formatCount(value, decimals)}
    </span>
  );
}
