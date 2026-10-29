"use client";

import { useEffect, useRef } from "react";

/**
 * The current year for copyright lines. Pages are prerendered, so the HTML
 * carries the build year; the browser writes today's year once mounted, so
 * the line never stays on the year the site was last deployed.
 */
export function CurrentYear() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.textContent = String(new Date().getFullYear());
  }, []);
  return (
    <span ref={ref} suppressHydrationWarning>
      {new Date().getFullYear()}
    </span>
  );
}
