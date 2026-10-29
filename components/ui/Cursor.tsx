"use client";

import { useEffect, useRef } from "react";

/**
 * Advanced custom cursor:
 * - Dot: instant follow with magnetic pull to [data-magnetic] elements
 * - Ring: eases after the pointer (lerp 0.35), velocity-scaled; its loop
 *   runs only while catching up
 * - Label modes: via CustomEvent('cursormode', { detail: 'view'|'drag'|'explore'|'default' })
 * - Click burst: CSS keyframe (.cursor-burst in globals.css)
 * - Light section inversion: [data-cursor-light] sections flip color to #000
 * - Fine pointers only: off on touch devices and with reduced motion
 */
export default function Cursor() {
  const dotRef   = useRef<HTMLDivElement>(null);
  const ringRef  = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Fine pointers only (mouse, trackpad); off on touch and with reduced motion
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dot   = dotRef.current;
    const ring  = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring) return;

    // Show elements, and hide the native pointer while we're active
    dot.style.display = "block";
    ring.style.display = "flex";
    document.documentElement.classList.add("has-custom-cursor");

    // Hot-loop state (refs only — zero React re-renders)
    let mouseX = -200, mouseY = -200;
    let prevX = -200, prevY = -200;
    let ringX = -200, ringY = -200;
    let ringScale = 1;
    let magnetTarget: { el: HTMLElement; cx: number; cy: number } | null = null;
    let isLight = false;
    let rafId = 0;
    const RING_FOLLOW = 0.35; // share of the remaining distance per frame (was 0.12)

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

    // The dot is placed straight from the pointer event (no frame of lag)
    function placeDot() {
      let dotX = mouseX, dotY = mouseY;
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
      dot!.style.transform = `translate(${dotX - 4}px, ${dotY - 4}px)`;
    }

    // The ring eases after it; the loop runs only until it has caught up
    function tick() {
      const speed = Math.hypot(mouseX - prevX, mouseY - prevY);
      prevX = mouseX; prevY = mouseY;
      ringX = lerp(ringX, mouseX, RING_FOLLOW);
      ringY = lerp(ringY, mouseY, RING_FOLLOW);
      ringScale = lerp(ringScale, 1 + Math.min(speed * 0.011, 0.45), 0.2);
      ring!.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px) scale(${ringScale})`;
      const settled = Math.abs(ringX - mouseX) < 0.3 && Math.abs(ringY - mouseY) < 0.3 && Math.abs(ringScale - 1) < 0.005;
      rafId = settled ? 0 : requestAnimationFrame(tick);
    }

    // Light section inversion, checked on movement rather than every frame
    let lastLightCheck = 0;
    function checkLight(now: number) {
      if (now - lastLightCheck < 150) return;
      lastLightCheck = now;
      const el = document.elementFromPoint(mouseX, mouseY) as HTMLElement | null;
      const shouldBeLight = !!el?.closest("[data-cursor-light]");
      if (shouldBeLight !== isLight) {
        isLight = shouldBeLight;
        const col = isLight ? "#000" : "";
        dot!.style.background = col || "var(--cursor-dot-color, #fff)";
        ring!.style.borderColor = col || "rgba(255,255,255,0.55)";
        if (label) label.style.color = col || "#fff";
      }
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      mouseX = e.clientX; mouseY = e.clientY;
      placeDot();
      checkLight(e.timeStamp);
      if (!rafId) rafId = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // ── Ring size / label modes ─────────────────────────────
    function setRingSize(size: number) {
      ring!.style.width  = `${size}px`;
      ring!.style.height = `${size}px`;
      ring!.style.marginTop  = `${-size / 2}px`;
      ring!.style.marginLeft = `${-size / 2}px`;
    }
    function resetRingSize() { setRingSize(40); }

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

    // ── [data-magnetic] and [data-cursor-view] hovers, delegated ──
    // (one listener pair for the whole document instead of re-adding
    // listeners to every element on each DOM change)
    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null;
      const magnetic = t?.closest<HTMLElement>("[data-magnetic]");
      if (magnetic && magnetTarget?.el !== magnetic) {
        const r = magnetic.getBoundingClientRect();
        magnetTarget = { el: magnetic, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
        setRingSize(56);
      }
      const view = t?.closest("[data-cursor-view]");
      if (view && !(e.relatedTarget instanceof Node && view.contains(e.relatedTarget))) {
        document.dispatchEvent(new CustomEvent("cursormode", { detail: "view" }));
      }
    };
    const onOut = (e: PointerEvent) => {
      const t = e.target as Element | null;
      const to = e.relatedTarget instanceof Element ? e.relatedTarget : null;
      const magnetic = t?.closest<HTMLElement>("[data-magnetic]");
      if (magnetic && !(to && magnetic.contains(to))) { magnetTarget = null; resetRingSize(); }
      const view = t?.closest("[data-cursor-view]");
      if (view && !(to && view.contains(to))) {
        document.dispatchEvent(new CustomEvent("cursormode", { detail: "default" }));
      }
    };
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);

    // ── Click burst ─────────────────────────────────────────
    const onPointerDown = () => {
      ring.classList.remove("cursor-burst");
      requestAnimationFrame(() => ring.classList.add("cursor-burst"));
    };
    const onPointerUp = () => {
      setTimeout(() => ring.classList.remove("cursor-burst"), 380);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("cursormode", onCursorMode);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      dot.style.display = "none";
      ring.style.display = "none";
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
