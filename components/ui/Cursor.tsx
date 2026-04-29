"use client";

import { useEffect, useRef } from "react";

/**
 * Advanced custom cursor:
 * - Dot: instant follow with magnetic pull to [data-magnetic] elements
 * - Ring: spring-lagged, velocity-scaled
 * - Label modes: via CustomEvent('cursormode', { detail: 'view'|'drag'|'explore'|'default' })
 * - Click burst: CSS keyframe (.cursor-burst in globals.css)
 * - Light section inversion: [data-cursor-light] sections flip color to #000
 * - Hidden on touch/coarse pointer devices
 */
export default function Cursor() {
  const dotRef   = useRef<HTMLDivElement>(null);
  const ringRef  = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Bail out on touch/coarse devices
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) return;

    const dot   = dotRef.current!;
    const ring  = ringRef.current!;
    const label = labelRef.current;
    if (!dotRef.current || !ringRef.current) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Show elements
    dot.style.display = "block";
    ring.style.display = "flex";

    // Hot-loop state (refs only — zero React re-renders)
    let mouseX = -200, mouseY = -200;
    let prevMouseX = -200, prevMouseY = -200;
    let ringX = -200, ringY = -200;
    let ringScale = 1;
    let magnetTarget: { el: HTMLElement; cx: number; cy: number } | null = null;
    let isLight = false;
    let lightCheckFrame = 0;
    let rafId: number;

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

    // ── Main RAF loop ───────────────────────────────────────
    function tick() {
      // Velocity
      const vx = mouseX - prevMouseX;
      const vy = mouseY - prevMouseY;
      const speed = Math.hypot(vx, vy);
      prevMouseX = mouseX;
      prevMouseY = mouseY;

      // Magnetic warp on dot position
      let dotX = mouseX;
      let dotY = mouseY;
      if (magnetTarget) {
        const { cx, cy } = magnetTarget;
        const dist = Math.hypot(mouseX - cx, mouseY - cy);
        const radius = 88;
        if (dist < radius) {
          const pull = 1 - dist / radius;
          dotX = cx + (mouseX - cx) * (1 - pull * 0.6);
          dotY = cy + (mouseY - cy) * (1 - pull * 0.6);
        }
      }
      dot.style.transform = `translate(${dotX - 4}px, ${dotY - 4}px)`;

      if (!reducedMotion) {
        // Ring spring lag
        ringX = lerp(ringX, mouseX, 0.12);
        ringY = lerp(ringY, mouseY, 0.12);

        // Velocity-based scale
        const targetScale = 1 + Math.min(speed * 0.011, 0.45);
        ringScale = lerp(ringScale, targetScale, 0.09);

        ring.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px) scale(${ringScale})`;
      } else {
        ring.style.transform = `translate(${mouseX - 20}px, ${mouseY - 20}px)`;
      }

      // Light section inversion — check every 12 frames for performance
      lightCheckFrame++;
      if (lightCheckFrame % 12 === 0) {
        const el = document.elementFromPoint(mouseX, mouseY) as HTMLElement | null;
        const shouldBeLight = !!el?.closest("[data-cursor-light]");
        if (shouldBeLight !== isLight) {
          isLight = shouldBeLight;
          const col = isLight ? "#000" : "";
          dot.style.background = col || "var(--cursor-dot-color, #fff)";
          ring.style.borderColor = col || "rgba(255,255,255,0.55)";
          if (label) label.style.color = col || "#fff";
        }
      }

      rafId = requestAnimationFrame(tick);
    }

    // ── Mouse tracking ──────────────────────────────────────
    const onMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
    window.addEventListener("mousemove", onMove, { passive: true });

    // ── Magnetic targets ────────────────────────────────────
    function registerMagnetic() {
      document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach(el => {
        el.addEventListener("mouseenter", () => {
          const r = el.getBoundingClientRect();
          magnetTarget = { el, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
          setRingSize(56);
        });
        el.addEventListener("mouseleave", () => {
          magnetTarget = null;
          resetRingSize();
        });
        el.addEventListener("mousemove", () => {
          if (magnetTarget?.el === el) {
            const r = el.getBoundingClientRect();
            magnetTarget.cx = r.left + r.width / 2;
            magnetTarget.cy = r.top + r.height / 2;
          }
        });
      });
    }

    // ── Cursor label / mode ─────────────────────────────────
    function setRingSize(size: number) {
      ring.style.width  = `${size}px`;
      ring.style.height = `${size}px`;
      ring.style.marginTop  = `${-size / 2}px`;
      ring.style.marginLeft = `${-size / 2}px`;
    }
    function resetRingSize() {
      ring.style.width  = "40px";
      ring.style.height = "40px";
      ring.style.marginTop  = "-20px";
      ring.style.marginLeft = "-20px";
    }

    const onCursorMode = (e: Event) => {
      const mode = (e as CustomEvent<string>).detail;
      if (!label) return;
      if (!mode || mode === "default") {
        label.style.opacity = "0";
        label.textContent = "";
        resetRingSize();
        ring.style.borderColor = "rgba(255,255,255,0.55)";
      } else {
        label.textContent = mode.toUpperCase();
        label.style.opacity = "1";
        setRingSize(64);
        ring.style.borderColor = "#78BE20";
      }
    };
    document.addEventListener("cursormode", onCursorMode);

    // ── [data-cursor-view] hover → VIEW label ───────────────
    function registerCursorView() {
      document.querySelectorAll<HTMLElement>("[data-cursor-view]").forEach(el => {
        el.addEventListener("mouseenter", () =>
          document.dispatchEvent(new CustomEvent("cursormode", { detail: "view" })));
        el.addEventListener("mouseleave", () =>
          document.dispatchEvent(new CustomEvent("cursormode", { detail: "default" })));
      });
    }

    registerMagnetic();
    registerCursorView();

    // ── Click burst ─────────────────────────────────────────
    const onPointerDown = () => {
      ring.classList.remove("cursor-burst");
      // Use requestAnimationFrame instead of offsetWidth forced reflow
      requestAnimationFrame(() => ring.classList.add("cursor-burst"));
    };
    const onPointerUp = () => {
      setTimeout(() => ring.classList.remove("cursor-burst"), 380);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);

    // ── MutationObserver — re-register on DOM changes ───────
    const observer = new MutationObserver(() => {
      registerMagnetic();
      registerCursorView();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("cursormode", onCursorMode);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Dot — instant follow */}
      <div
        ref={dotRef}
        suppressHydrationWarning
        aria-hidden="true"
        style={{
          display: "none",
          position: "fixed",
          top: 0, left: 0,
          width: 8, height: 8,
          borderRadius: "50%",
          background: "var(--cursor-dot-color, #fff)",
          pointerEvents: "none",
          zIndex: 99999,
          willChange: "transform",
          transform: "translate(-200px, -200px)",
        }}
      />

      {/* Ring — spring-lagged + label text */}
      <div
        ref={ringRef}
        suppressHydrationWarning
        aria-hidden="true"
        style={{
          display: "none",
          position: "fixed",
          top: 0, left: 0,
          width: 40, height: 40,
          marginTop: -20, marginLeft: -20,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.55)",
          pointerEvents: "none",
          zIndex: 99998,
          willChange: "transform",
          transform: "translate(-200px, -200px)",
          alignItems: "center",
          justifyContent: "center",
          transition: [
            "width 0.25s cubic-bezier(0.16,1,0.3,1)",
            "height 0.25s cubic-bezier(0.16,1,0.3,1)",
            "margin 0.25s cubic-bezier(0.16,1,0.3,1)",
            "border-color 0.2s ease",
          ].join(", "),
          color: "#fff",
        }}
      >
        <span
          ref={labelRef}
          suppressHydrationWarning
          style={{
            fontFamily: "var(--font-ibm-mono, 'IBM Plex Mono', monospace)",
            fontSize: 8,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            opacity: 0,
            transition: "opacity 0.2s ease",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
      </div>
    </>
  );
}
