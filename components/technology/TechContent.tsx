"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────
   SVG: Animated hero rings
───────────────────────────────────────────────────────── */
function HeroRings() {
  const ref = useRef<SVGSVGElement>(null);
  useGSAP(() => {
    gsap.to(".hr-ring-1", { rotation: 360, transformOrigin: "200px 200px", duration: 18, ease: "none", repeat: -1 });
    gsap.to(".hr-ring-2", { rotation: -360, transformOrigin: "200px 200px", duration: 28, ease: "none", repeat: -1 });
    gsap.to(".hr-ring-3", { rotation: 360, transformOrigin: "200px 200px", duration: 40, ease: "none", repeat: -1 });
    gsap.to(".hr-pulse", { scale: 1.15, transformOrigin: "200px 200px", duration: 1.8, ease: "sine.inOut", repeat: -1, yoyo: true });
    // Set nodes to 0 opacity first so they don't flash as scattered red dots on load
    gsap.set(".hr-node", { opacity: 0 });
    gsap.to(".hr-node", { opacity: 0.15, duration: 1.2, stagger: { each: 0.4, repeat: -1, yoyo: true }, ease: "sine.inOut", delay: 0.5 });
  }, { scope: ref });

  const nodes = (r: number, count: number, cls: string) =>
    Array.from({ length: count }).map((_, i) => {
      const a = (i / count) * Math.PI * 2;
      return <circle key={i} cx={200 + Math.cos(a) * r} cy={200 + Math.sin(a) * r} r="3" fill="#78BE20" className={cls} />;
    });

  return (
    <svg ref={ref} viewBox="0 0 400 400" className="w-full h-full" aria-hidden>
      <circle cx="200" cy="200" r="190" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
      <circle className="hr-ring-3" cx="200" cy="200" r="170" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="8 16" />
      <circle className="hr-ring-2" cx="200" cy="200" r="130" fill="none" stroke="rgba(120, 190, 32, 0.12)" strokeWidth="1" strokeDasharray="4 8" />
      <circle className="hr-ring-1" cx="200" cy="200" r="90" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="2 6" />
      {nodes(170, 6, "hr-node")}
      {nodes(130, 8, "hr-node")}
      {nodes(90, 4, "hr-node")}
      <circle className="hr-pulse" cx="200" cy="200" r="30" fill="none" stroke="rgba(120, 190, 32, 0.3)" strokeWidth="1" />
      <circle cx="200" cy="200" r="10" fill="#78BE20" opacity="0.8" />
      <circle cx="200" cy="200" r="4" fill="white" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   SVG: Motor cross-section diagram (PMASynRM — 3D + interactive)
───────────────────────────────────────────────────────── */
function MotorDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef       = useRef<SVGSVGElement>(null);
  const rotorTween   = useRef<gsap.core.Tween | null>(null);
  // Smooth 3D tilt state (no re-renders — all via RAF)
  const tilt = useRef({ cx: 0, cy: 0, tx: 0, ty: 0 });
  const rafId = useRef(0);

  // Pre-round to 4dp — keeps SSR and client attribute strings identical
  const R4 = (v: number) => Math.round(v * 1e4) / 1e4;
  const CX = 200, CY = 200;

  // ── 24 stator slots (copper windings) ─────────────────────
  const SLOT_INNER_R = 122, SLOT_OUTER_R = 162;
  const SLOT_IH = (5.5 * Math.PI) / 180;
  const SLOT_OH = (4.5 * Math.PI) / 180;
  const slots = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
    const iLx = R4(CX + Math.cos(a - SLOT_IH) * SLOT_INNER_R);
    const iLy = R4(CY + Math.sin(a - SLOT_IH) * SLOT_INNER_R);
    const iRx = R4(CX + Math.cos(a + SLOT_IH) * SLOT_INNER_R);
    const iRy = R4(CY + Math.sin(a + SLOT_IH) * SLOT_INNER_R);
    const oRx = R4(CX + Math.cos(a + SLOT_OH) * SLOT_OUTER_R);
    const oRy = R4(CY + Math.sin(a + SLOT_OH) * SLOT_OUTER_R);
    const oLx = R4(CX + Math.cos(a - SLOT_OH) * SLOT_OUTER_R);
    const oLy = R4(CY + Math.sin(a - SLOT_OH) * SLOT_OUTER_R);
    const d = `M ${iLx} ${iLy} A ${SLOT_INNER_R} ${SLOT_INNER_R} 0 0 1 ${iRx} ${iRy} L ${oRx} ${oRy} A ${SLOT_OUTER_R} ${SLOT_OUTER_R} 0 0 0 ${oLx} ${oLy} Z`;
    const phase = i % 3;
    const fill = phase === 0 ? "#78BE20" : phase === 1 ? "rgba(120,190,32,0.35)" : "rgba(255,255,255,0.05)";
    return { i, d, fill };
  });

  // ── 8 arc-shaped permanent magnets ────────────────────────
  const MAG_INNER_R = 88, MAG_OUTER_R = 100;
  const MAG_H = (9 * Math.PI) / 180;
  const magnets = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const iLx = R4(CX + Math.cos(a - MAG_H) * MAG_INNER_R);
    const iLy = R4(CY + Math.sin(a - MAG_H) * MAG_INNER_R);
    const iRx = R4(CX + Math.cos(a + MAG_H) * MAG_INNER_R);
    const iRy = R4(CY + Math.sin(a + MAG_H) * MAG_INNER_R);
    const oRx = R4(CX + Math.cos(a + MAG_H) * MAG_OUTER_R);
    const oRy = R4(CY + Math.sin(a + MAG_H) * MAG_OUTER_R);
    const oLx = R4(CX + Math.cos(a - MAG_H) * MAG_OUTER_R);
    const oLy = R4(CY + Math.sin(a - MAG_H) * MAG_OUTER_R);
    const d = `M ${iLx} ${iLy} A ${MAG_INNER_R} ${MAG_INNER_R} 0 0 1 ${iRx} ${iRy} L ${oRx} ${oRy} A ${MAG_OUTER_R} ${MAG_OUTER_R} 0 0 0 ${oLx} ${oLy} Z`;
    const mid = (MAG_INNER_R + MAG_OUTER_R) / 2;
    return { i, d, fill: i % 2 === 0 ? "#78BE20" : "#8B1A1A", isNorth: i % 2 === 0,
      lx: R4(CX + Math.cos(a) * mid), ly: R4(CY + Math.sin(a) * mid) };
  });

  // ── 8 flux barriers (PMASynRM reluctance cutouts) ─────────
  const BAR_INNER_R = 64, BAR_OUTER_R = 84;
  const BAR_H = (8 * Math.PI) / 180;
  const barriers = Array.from({ length: 8 }, (_, i) => {
    const a = ((i + 0.5) / 8) * Math.PI * 2 - Math.PI / 2;
    const iLx = R4(CX + Math.cos(a - BAR_H) * BAR_INNER_R);
    const iLy = R4(CY + Math.sin(a - BAR_H) * BAR_INNER_R);
    const iRx = R4(CX + Math.cos(a + BAR_H) * BAR_INNER_R);
    const iRy = R4(CY + Math.sin(a + BAR_H) * BAR_INNER_R);
    const oRx = R4(CX + Math.cos(a + BAR_H * 1.3) * BAR_OUTER_R);
    const oRy = R4(CY + Math.sin(a + BAR_H * 1.3) * BAR_OUTER_R);
    const oLx = R4(CX + Math.cos(a - BAR_H * 1.3) * BAR_OUTER_R);
    const oLy = R4(CY + Math.sin(a - BAR_H * 1.3) * BAR_OUTER_R);
    const d = `M ${iLx} ${iLy} A ${BAR_INNER_R} ${BAR_INNER_R} 0 0 1 ${iRx} ${iRy} L ${oRx} ${oRy} A ${BAR_OUTER_R} ${BAR_OUTER_R} 0 0 0 ${oLx} ${oLy} Z`;
    return { i, d };
  });

  // ── 8 flux arcs (spin with rotor) ─────────────────────────
  const fluxArcs = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    const x1 = R4(CX + Math.cos(a) * 112);
    const y1 = R4(CY + Math.sin(a) * 112);
    const mx = R4(CX + Math.cos(a + 0.35) * 130);
    const my = R4(CY + Math.sin(a + 0.35) * 130);
    const x2 = R4(CX + Math.cos(a + 0.65) * 116);
    const y2 = R4(CY + Math.sin(a + 0.65) * 116);
    return { i, d: `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}` };
  });

  // ── GSAP animations ───────────────────────────────────────
  useGSAP(() => {
    rotorTween.current = gsap.to(".md-rotor", {
      rotation: 360, svgOrigin: "200 200", duration: 6, ease: "none", repeat: -1,
    });
    gsap.from(".md-stator", {
      strokeDasharray: "0 1200", duration: 1.4, ease: "power2.out",
      scrollTrigger: { trigger: svgRef.current, start: "top 60%" },
    });
    gsap.from(".md-rotor", {
      opacity: 0, scale: 0.7, svgOrigin: "200 200",
      duration: 0.9, ease: "back.out(1.7)", delay: 0.4,
      scrollTrigger: { trigger: svgRef.current, start: "top 60%" },
    });
    gsap.from(".md-slot", {
      opacity: 0, duration: 0.35, stagger: 0.018, ease: "power2.out",
      scrollTrigger: { trigger: svgRef.current, start: "top 60%" },
    });
    const fluxEls = svgRef.current?.querySelectorAll<SVGPathElement>(".md-flux");
    fluxEls?.forEach((p, i) => {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(p, {
        strokeDashoffset: 0, duration: 0.8, delay: 0.6 + i * 0.08, ease: "power2.out",
        scrollTrigger: { trigger: svgRef.current, start: "top 60%" },
      });
    });
  }, { scope: svgRef });

  // ── 3D tilt + hover speed-up (RAF loop, no re-renders) ────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      tilt.current.tx = ((e.clientY - top  - height / 2) / (height / 2)) * -14;
      tilt.current.ty = ((e.clientX - left - width  / 2) / (width  / 2)) *  14;
    };
    const onEnter = () => {
      rotorTween.current?.timeScale(2.5);
      gsap.to(el, { filter: "drop-shadow(0 0 24px rgba(120,190,32,0.4))", duration: 0.45 });
    };
    const onLeave = () => {
      rotorTween.current?.timeScale(1);
      tilt.current.tx = 0; tilt.current.ty = 0;
      gsap.to(el, { filter: "none", duration: 0.7 });
    };

    const loop = () => {
      const L = 0.08; // lerp factor
      tilt.current.cx += (tilt.current.tx - tilt.current.cx) * L;
      tilt.current.cy += (tilt.current.ty - tilt.current.cy) * L;
      el.style.transform =
        `perspective(700px) rotateX(${tilt.current.cy}deg) rotateY(${tilt.current.cx}deg)`;
      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);

    el.addEventListener("mousemove",  onMove);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(rafId.current);
      el.removeEventListener("mousemove",  onMove);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full max-w-[380px] mx-auto cursor-pointer"
      style={{ transformStyle: "preserve-3d" }}>
      <svg ref={svgRef} viewBox="0 0 400 400" className="w-full" aria-hidden>
        <defs>
          {/* Off-centre gradient simulates a top-left light source */}
          <radialGradient id="gHousing" cx="35%" cy="30%">
            <stop offset="0%"   stopColor="#2c2c2a" />
            <stop offset="55%"  stopColor="#181816" />
            <stop offset="100%" stopColor="#0a0a09" />
          </radialGradient>
          <radialGradient id="gRotor" cx="40%" cy="35%">
            <stop offset="0%"   stopColor="#222220" />
            <stop offset="100%" stopColor="#080808" />
          </radialGradient>
          {/* Glow filter for magnets + centre dot */}
          <filter id="fGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── Housing shell + depth edges ── */}
        <circle cx="200" cy="200" r="182" fill="url(#gHousing)" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
        {/* Specular rim highlight (top-left arc) */}
        <path d="M 76 100 A 162 162 0 0 1 260 42"
          fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Shadow edge (bottom-right arc) */}
        <path d="M 324 300 A 162 162 0 0 1 140 358"
          fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="3" strokeLinecap="round" />

        {/* ── Stator back-iron ring ── */}
        <circle className="md-stator" cx="200" cy="200" r="145" fill="none"
          stroke="rgba(44,47,52,0.96)" strokeWidth="48" />
        <circle cx="200" cy="200" r="168" fill="none" stroke="rgba(255,255,255,0.1)"  strokeWidth="1" />
        <circle cx="200" cy="200" r="122" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        {/* Partial highlight arc on stator (depth illusion) */}
        <circle cx="200" cy="200" r="145" fill="none"
          stroke="rgba(255,255,255,0.05)" strokeWidth="46"
          strokeDasharray="210 740" strokeDashoffset="60" />

        {/* ── 24 copper winding slots ── */}
        {slots.map(({ i, d, fill }) => (
          <path key={i} className="md-slot" d={d} fill={fill} />
        ))}

        {/* ── Air gap ── */}
        <circle cx="200" cy="200" r="118"   fill="none" stroke="rgba(0,0,0,0.97)"   strokeWidth="9" />
        <circle cx="200" cy="200" r="113.5" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

        {/* ── Rotor group (spins) ── */}
        <g className="md-rotor">
          <circle cx="200" cy="200" r="110" fill="url(#gRotor)" />
          <circle cx="200" cy="200" r="109" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          {/* Rotor specular highlight */}
          <ellipse cx="178" cy="162" rx="30" ry="13" fill="rgba(255,255,255,0.05)" />

          {/* Flux barriers */}
          {barriers.map(({ i, d }) => (
            <path key={i} d={d} fill="rgba(0,0,0,0.93)" stroke="rgba(255,255,255,0.09)" strokeWidth="0.5" />
          ))}

          {/* Arc magnets with glow + N/S labels */}
          {magnets.map(({ i, d, fill, isNorth, lx, ly }) => (
            <g key={i} filter="url(#fGlow)">
              <path d={d} fill={fill} opacity="0.92" />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                fill="white" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                {isNorth ? "N" : "S"}
              </text>
            </g>
          ))}

          {/* Flux arcs */}
          {fluxArcs.map(({ i, d }) => (
            <path key={i} className="md-flux" d={d}
              fill="none" stroke="rgba(120,190,32,0.5)" strokeWidth="1.5" strokeLinecap="round" />
          ))}

          {/* Bearing + shaft + keyway */}
          <circle cx="200" cy="200" r="27" fill="#0e0e0e" stroke="rgba(255,255,255,0.24)" strokeWidth="2" />
          <circle cx="200" cy="200" r="19" fill="#1c1c1c" stroke="rgba(255,255,255,0.1)"  strokeWidth="1" />
          <line x1="200" y1="183" x2="200" y2="217" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          <line x1="183" y1="200" x2="217" y2="200" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="5" fill="#78BE20" filter="url(#fGlow)" />
        </g>

        {/* ── Annotations — dark pill backgrounds for readability ── */}
        <rect x="122" y="4"   width="156" height="14" rx="3" fill="rgba(0,0,0,0.6)" />
        <text x="200" y="14" textAnchor="middle" fill="rgba(255,255,255,0.78)"
          fontSize="7.5" letterSpacing="2.5" fontFamily="monospace">STATOR LAMINATIONS</text>
        <line x1="200" y1="19" x2="200" y2="31" stroke="rgba(255,255,255,0.22)" strokeWidth="0.5" />

        <rect x="311" y="142" width="80" height="26" rx="3" fill="rgba(0,0,0,0.6)" />
        <text x="351" y="153" textAnchor="middle" fill="rgba(255,255,255,0.78)"
          fontSize="7.5" letterSpacing="1.5" fontFamily="monospace">COPPER</text>
        <text x="351" y="163" textAnchor="middle" fill="rgba(255,255,255,0.78)"
          fontSize="7.5" letterSpacing="1.5" fontFamily="monospace">WINDINGS</text>
        <line x1="311" y1="155" x2="299" y2="161" stroke="rgba(255,255,255,0.22)" strokeWidth="0.5" />

        <rect x="9" y="142" width="74" height="26" rx="3" fill="rgba(0,0,0,0.6)" />
        <text x="46" y="153" textAnchor="middle" fill="rgba(255,255,255,0.78)"
          fontSize="7.5" letterSpacing="1.5" fontFamily="monospace">FLUX</text>
        <text x="46" y="163" textAnchor="middle" fill="rgba(255,255,255,0.78)"
          fontSize="7.5" letterSpacing="1.5" fontFamily="monospace">BARRIERS</text>
        <line x1="83" y1="155" x2="95" y2="161" stroke="rgba(255,255,255,0.22)" strokeWidth="0.5" />

        <rect x="88" y="385" width="224" height="13" rx="3" fill="rgba(0,0,0,0.6)" />
        <text x="200" y="394" textAnchor="middle" fill="rgba(120,190,32,0.92)"
          fontSize="7.5" letterSpacing="2" fontFamily="monospace">PMASynRM · 96% PEAK EFFICIENCY</text>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   SVG: Battery cell grid
───────────────────────────────────────────────────────── */
function BatteryGrid() {
  const ref = useRef<SVGSVGElement>(null);
  useGSAP(() => {
    const cells = ref.current?.querySelectorAll<SVGRectElement>(".bg-cell");
    if (cells) {
      gsap.set(cells, { fill: "#111111" });
      gsap.to(cells, {
        fill: "#78BE20",
        duration: 0.25,
        stagger: { each: 0.055, from: "end" },
        ease: "power1.out",
        scrollTrigger: { trigger: ref.current, start: "top 50%" },
      });
    }
    const proxy = { n: 0 };
    const el = ref.current?.querySelector<SVGTextElement>(".bg-num");
    gsap.to(proxy, {
      n: 22.5, duration: 2.2, ease: "power2.out",
      onUpdate: () => { if (el) el.textContent = proxy.n.toFixed(1); },
      scrollTrigger: { trigger: ref.current, start: "top 50%", once: true },
    });
  }, { scope: ref });

  const cols = 6, rows = 4, cw = 44, ch = 30, gap = 6;
  const gw = cols * cw + (cols - 1) * gap;
  const sx = (380 - gw) / 2;

  return (
    <svg ref={ref} viewBox="0 0 380 280" className="w-full max-w-sm mx-auto" aria-hidden>
      <rect x="12" y="28" width="356" height="224" rx="8" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <rect x="342" y="18" width="28" height="12" rx="3" fill="rgba(255,255,255,0.05)" />
      <text x="190" y="20" textAnchor="middle" fill="rgba(255,255,255,0.1)" fontSize="7" letterSpacing="3" fontFamily="monospace">LITHIUM POLYMER BATTERY PACK</text>
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => (
          <rect key={`${r}-${c}`} className="bg-cell"
            x={sx + c * (cw + gap)} y={52 + r * (ch + gap)}
            width={cw} height={ch} rx="3"
            fill="#111" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        ))
      )}
      <text className="bg-num" x="190" y="215" textAnchor="middle"
        fill="white" fontSize="40" fontFamily="monospace" fontWeight="700">0.0</text>
      <text x="190" y="234" textAnchor="middle"
        fill="rgba(120, 190, 32, 0.7)" fontSize="9" letterSpacing="4" fontFamily="monospace">kWh TOTAL CAPACITY</text>
      <text x="190" y="252" textAnchor="middle"
        fill="rgba(255,255,255,0.15)" fontSize="8" letterSpacing="2" fontFamily="monospace">84 INDIVIDUALLY MONITORED CELLS</text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   SVG: DC charging curve
───────────────────────────────────────────────────────── */
function ChargingCurve() {
  const ref = useRef<SVGSVGElement>(null);
  useGSAP(() => {
    const curve = ref.current?.querySelector<SVGPathElement>(".cc-curve");
    if (curve) {
      const len = curve.getTotalLength();
      gsap.set(curve, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(curve, {
        strokeDashoffset: 0, duration: 2.2, ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 50%" },
      });
    }
    gsap.from(".cc-dot", {
      opacity: 0, scale: 0, transformOrigin: "center", duration: 0.5, delay: 2,
      ease: "back.out(2)",
      scrollTrigger: { trigger: ref.current, start: "top 50%" },
    });
    gsap.from(".cc-label", {
      opacity: 0, duration: 0.4, delay: 2.3,
      scrollTrigger: { trigger: ref.current, start: "top 50%" },
    });
  }, { scope: ref });

  return (
    <svg ref={ref} viewBox="0 0 420 300" className="w-full max-w-sm mx-auto" aria-hidden>
      {/* Y-axis grid */}
      {[100, 80, 60, 40, 20, 0].map((pct, i) => (
        <g key={pct}>
          <line x1="58" y1={44 + i * 40} x2="390" y2={44 + i * 40} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <text x="50" y={44 + i * 40} textAnchor="end" dominantBaseline="middle"
            fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="monospace">{pct}%</text>
        </g>
      ))}
      {/* X-axis labels */}
      {[0, 10, 20, 30, 40].map((min, i) => (
        <text key={min} x={58 + i * 83} y="270" textAnchor="middle"
          fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="monospace">{min}m</text>
      ))}
      {/* Axes */}
      <line x1="58" y1="44" x2="58" y2="244" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <line x1="58" y1="244" x2="390" y2="244" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      {/* Axis labels */}
      <text x="224" y="288" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="8" letterSpacing="3" fontFamily="monospace">TIME</text>
      <text x="14" y="144" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="8" letterSpacing="3" fontFamily="monospace" transform="rotate(-90,14,144)">SOC</text>
      {/* 80% reference */}
      <line x1="58" y1="84" x2="390" y2="84" stroke="rgba(120, 190, 32, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
      <text x="394" y="84" dominantBaseline="middle" fill="rgba(120, 190, 32, 0.5)" fontSize="8" fontFamily="monospace">80%</text>
      {/* Charging curve: fast rise from 0→80%, then gentle taper */}
      <path className="cc-curve"
        d="M 58 244 C 100 243, 140 86, 180 84 S 280 84, 330 84 S 370 88, 390 96"
        fill="none" stroke="#78BE20" strokeWidth="2.5" strokeLinecap="round" />
      {/* 80% endpoint */}
      <circle className="cc-dot" cx="330" cy="84" r="5" fill="#78BE20" />
      <line x1="330" y1="84" x2="330" y2="244" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="2 4" />
      <text className="cc-label" x="330" y="260" textAnchor="middle"
        fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">≈40 min</text>
    </svg>
  );
}


/* ─────────────────────────────────────────────────────────
   SVG: Throttle response graph
───────────────────────────────────────────────────────── */
function ThrottleGraph() {
  const ref = useRef<SVGSVGElement>(null);
  useGSAP(() => {
    [".tg-electric", ".tg-ice"].forEach((sel, i) => {
      const el = ref.current?.querySelector<SVGPathElement>(sel);
      if (!el) return;
      const len = el.getTotalLength();
      gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(el, { strokeDashoffset: 0, duration: 1.6, delay: i * 0.4, ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 50%" } });
    });
    gsap.from(".tg-label", { opacity: 0, duration: 0.5, delay: 1.8,
      scrollTrigger: { trigger: ref.current, start: "top 50%" } });
  }, { scope: ref });

  return (
    <svg ref={ref} viewBox="0 0 380 280" className="w-full max-w-sm mx-auto" aria-hidden>
      {/* Grid */}
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="50" y1={50 + i * 46} x2="360" y2={50 + i * 46}
          stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      ))}
      {/* Axes */}
      <line x1="50" y1="50" x2="50" y2="188" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <line x1="50" y1="188" x2="360" y2="188" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      {/* Labels */}
      <text x="205" y="210" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="8" letterSpacing="3" fontFamily="monospace">THROTTLE INPUT →</text>
      <text x="16" y="119" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="8" letterSpacing="3" fontFamily="monospace" transform="rotate(-90,16,119)">POWER OUTPUT</text>
      {/* Axis ticks */}
      <text x="50" y="202" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="8" fontFamily="monospace">0</text>
      <text x="360" y="202" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="8" fontFamily="monospace">100%</text>
      {/* ICE curve (dashed) */}
      <path className="tg-ice"
        d="M 50 188 C 120 185, 180 100, 240 80 S 320 55, 360 65"
        fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2"
        strokeLinecap="round" strokeDasharray="5 4" />
      {/* Electric line (perfectly linear) */}
      <path className="tg-electric"
        d="M 50 188 L 360 50"
        fill="none" stroke="#78BE20" strokeWidth="2.5" strokeLinecap="round" />
      {/* Legend */}
      <g className="tg-label">
        <line x1="160" y1="238" x2="190" y2="238" stroke="#78BE20" strokeWidth="2.5" />
        <text x="196" y="241" fill="rgba(120, 190, 32, 0.8)" fontSize="9" fontFamily="monospace">ELECTRIC (LINEAR)</text>
        <line x1="160" y1="256" x2="190" y2="256" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="5 4" />
        <text x="196" y="259" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="monospace">ICE (VARIABLE)</text>
      </g>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   Safety feature cards
───────────────────────────────────────────────────────── */
const SAFETY_FEATURES = [
  { num: "01", title: "Cornering ABS", sub: "Lean-angle sensitive braking", body: "Lean-angle sensitive braking that automatically adjusts ABS threshold based on bike inclination — up to 45° of lean without lockup." },
  { num: "02", title: "MSC Traction Control", sub: "Energica Integrated", body: "Six intervention levels using IMU lean-angle data and rear wheel speed sensing to modulate torque delivery and prevent wheel spin." },
  { num: "03", title: "4 Riding Modes", sub: "Urban · Eco · Rain · Sport", body: "Each mode remaps throttle response, regenerative braking intensity, and power ceiling. Four regenerative braking maps let riders tune energy recovery independently." },
  { num: "04", title: "5\" TFT Display", sub: "Full-colour, glare-resistant", body: "Sunlight-readable 5-inch display with real-time ride data, warning lights, and GPS at a glance." },
  { num: "05", title: "CCS DC Charging", sub: "Level 3 — any public network", body: "Electric motorcycle compatible with CCS Combo chargers. Plugs into every public fast charger in Europe and North America." },
];

function SafetyCards() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.from(".sf-card", {
      y: 40, opacity: 0, stagger: 0.08, duration: 0.7, ease: "power3.out",
      scrollTrigger: { trigger: ref.current, start: "top 80%" },
    });
  }, { scope: ref });

  return (
    <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {SAFETY_FEATURES.map((f) => (
        <div key={f.num} className="sf-card group p-6 border border-white/[0.06] bg-[#0f0f0f] hover:border-[#78BE20]/30 transition-colors duration-300">
          <div className="flex items-start justify-between mb-4">
            <span className="font-display text-[#78BE20]/30 text-4xl leading-none group-hover:text-[#78BE20]/50 transition-colors duration-300">
              {f.num}
            </span>
          </div>
          <h3 className="font-display text-white text-xl mb-1">{f.title}</h3>
          <p className="text-[9px] uppercase tracking-widest text-[#78BE20]/60 mb-3">{f.sub}</p>
          <p className="text-sm text-white/60 leading-relaxed">{f.body}</p>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Section wrapper with number, title, text column
───────────────────────────────────────────────────────── */
function TechSection({
  num, title, sub, body, stats, visual, flip = false, children,
}: {
  num: string; title: string; sub: string; body: string;
  stats?: { value: string; unit: string; label: string }[];
  visual?: React.ReactNode; flip?: boolean;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.from(".ts-text > *", {
      y: 36, stagger: 0.1, duration: 0.8, ease: "power3.out",
      scrollTrigger: { trigger: ref.current, start: "top 65%" },
    });
  }, { scope: ref });

  const textCol = (
    <div className="ts-text flex flex-col justify-center gap-6">
      <div>
        <span className="inline-flex items-center gap-3 mb-6">
          <span className="font-display text-5xl text-white/[0.20]">{num}</span>
          <span className="w-8 h-px bg-[#78BE20]/40" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/60">Tech Pillar</span>
        </span>
        <h2 className="font-display text-white leading-none mb-2" style={{ fontSize: "clamp(36px, 4.5vw, 64px)" }}>
          {title}
        </h2>
        <p className="text-[10px] uppercase tracking-widest text-[#78BE20]/70 mb-5">{sub}</p>
        <p className="text-base text-white/65 leading-[1.8] max-w-lg">{body}</p>
      </div>
      {stats && (
        <div className="flex gap-8 pt-4 border-t border-white/[0.05]">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-3xl text-white">{s.value}</span>
                <span className="font-display text-sm text-[#78BE20]">{s.unit}</span>
              </div>
              <p className="text-[9px] uppercase tracking-widest text-white/60 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}
      {children}
    </div>
  );

  const visualCol = visual ? (
    <div className="flex items-center justify-center">{visual}</div>
  ) : null;

  return (
    <div ref={ref} className="border-t border-white/[0.04]">
      <div className="max-w-[1600px] mx-auto px-[clamp(24px,4vw,64px)] py-[60px] md:py-[120px]">
        <div className={`grid lg:grid-cols-2 gap-16 lg:gap-24 items-center ${flip ? "lg:[&>*:first-child]:order-last" : ""}`}>
          {flip ? <>{visualCol}{textCol}</> : <>{textCol}{visualCol}</>}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main export
───────────────────────────────────────────────────────── */
export default function TechContent() {
  const heroRef = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.1 });
    tl.from(".th-eyebrow", { y: 20, opacity: 0, duration: 0.6, ease: "power3.out" })
      .from(".th-h1 span", { y: 80, opacity: 0, stagger: 0.12, duration: 1, ease: "power3.out" }, "-=0.3")
      .from(".th-body", { y: 30, opacity: 0, duration: 0.6, ease: "power3.out" }, "-=0.4");
  }, { scope: heroRef });

  return (
    <main className="bg-[#0a0a0a] overflow-x-hidden">

      {/* ── HERO ───────────────────────────────────────────── */}
      <div ref={heroRef} className="relative h-screen flex items-center overflow-hidden">
        {/* Rings — fills background */}
        <div aria-hidden className="absolute right-[-5vw] top-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-[640px] max-h-[640px] opacity-45 pointer-events-none">
          <HeroRings />
        </div>

        <div className="relative z-10 max-w-[1600px] mx-auto px-[clamp(24px,4vw,64px)] w-full">
          <p className="th-eyebrow inline-flex items-center gap-3 mb-6">
            <span className="w-6 h-px bg-[#78BE20]" />
            <span className="text-[10px] uppercase tracking-[0.35em] text-white/65">Under the fairing</span>
          </p>
          <h1 className="th-h1 font-display text-white leading-[0.9] mb-6" style={{ fontSize: "clamp(48px, 8vw, 120px)" }}>
            <span className="block">OUR</span>
            <span className="block text-[#78BE20]">TECHNOLOGY</span>
          </h1>
          <p className="th-body text-base text-white/60 max-w-[480px] leading-relaxed mb-8">
            From motor to BMS to software, we control every variable.
          </p>

          {/* Jump-links */}
          <div className="flex flex-wrap gap-3">
            {["Motor", "Battery", "Charging", "Ride By Wire", "Safety"].map((t) => (
              <span key={t} className="px-4 py-2 border border-white/10 text-[10px] uppercase tracking-widest text-white/60 hover:border-[#78BE20]/40 hover:text-white/60 transition-colors duration-200 cursor-pointer">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 01 MOTOR ────────────────────────────────────────── */}
      <TechSection
        num="01" title="PMASynRM Motor"
        sub="Permanent Magnet Assisted Synchronous Reluctance Motor"
        body="Energica's proprietary motor combines the efficiency of a permanent magnet design with the reliability of a reluctance motor. Maximum torque from a standstill — no heat throttling, no brushes, no compromise. Peak efficiency exceeds 96%, meaning almost all stored energy reaches the rear wheel."
        stats={[
          { value: "145", unit: "HP", label: "Peak Power" },
          { value: "96", unit: "%", label: "Peak Efficiency" },
          { value: "215", unit: "Nm", label: "Wheel Torque" },
        ]}
        visual={<MotorDiagram />}
      />

      {/* ── 02 BATTERY ──────────────────────────────────────── */}
      <TechSection
        num="02" title="Battery System"
        sub="21.5 / 22.5 kWh lithium polymer — custom-built for Energica platforms"
        body="Custom lithium polymer cells arranged in a structural aluminium pack. Each of the 84 cells is individually monitored by the BMS — optimising charge rate, thermal management, and longevity simultaneously. The pack doubles as a stressed chassis member, reducing weight elsewhere."
        stats={[
          { value: "21.5 / 22.5", unit: "kWh", label: "Total Capacity" },
          { value: "420", unit: "km", label: "City Range" },
        ]}
        visual={<BatteryGrid />}
        flip
      />

      {/* ── 03 DC FAST CHARGING ─────────────────────────────── */}
      <TechSection
        num="03" title="DC Fast Charging"
        sub="CCS Combo Level 3 — compatible with every public fast-charge network"
        body="Electric motorcycle fully compatible with DC fast-charge infrastructure. The chart shows a real CCS charging session — 0 to 80% in under 40 minutes, including the natural taper above 80% that protects cell longevity. On-board AC charger also supports Level 2 home charging."
        stats={[
          { value: "40", unit: "min", label: "0–80% DC Fast" },
          { value: "3.3", unit: "kW", label: "AC Home Rate" },
        ]}
        visual={<ChargingCurve />}
      />

      {/* ── 04 RIDE BY WIRE ─────────────────────────────────── */}
      <TechSection
        num="04" title="Ride By Wire"
        sub="Linear, lag-free throttle response from 0 rpm"
        body="Because an electric motor delivers full torque from the first revolution, Energica's Ride By Wire system maintains perfectly linear throttle mapping — what you ask for is exactly what you get, at any speed. The graph compares electric delivery (green) against a typical internal combustion power curve. No powerband, no hesitation, no surprises."
        stats={[
          { value: "0", unit: "rpm", label: "Full Torque From" },
          { value: "<10", unit: "ms", label: "Throttle Response" },
        ]}
        visual={<ThrottleGraph />}
        flip
      />

      {/* ── 05 SAFETY ───────────────────────────────────────── */}
      <div className="border-t border-white/[0.04]">
        <div className="max-w-[1600px] mx-auto px-[clamp(24px,4vw,64px)] py-[60px] md:py-[120px]">
          <div className="mb-14">
            <p className="inline-flex items-center gap-3 mb-6">
              <span className="font-display text-5xl text-white/[0.20]">05</span>
              <span className="w-8 h-px bg-[#78BE20]/40" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/60">Tech Pillar</span>
            </p>
            <h2 className="font-display text-white leading-none mb-2" style={{ fontSize: "clamp(36px, 4.5vw, 64px)" }}>
              Safety Suite
            </h2>
            <p className="text-base text-white/65 leading-[1.8] max-w-2xl">
              An integrated safety system combining IMU-based lean sensing, cornering ABS, and adaptive traction control. Five features working together.
            </p>
          </div>
          <SafetyCards />
        </div>
      </div>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <div className="border-t border-white/[0.04] bg-[#080808]">
        <div className="max-w-[1600px] mx-auto px-[clamp(24px,4vw,64px)] py-[60px] md:py-[120px] flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h3 className="font-display text-white leading-none mb-2" style={{ fontSize: "clamp(32px, 4vw, 56px)" }}>
              Ride one. 200+ locations worldwide.
            </h3>
            <p className="text-white/60 text-base">Book a free test ride at your nearest dealer.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-shrink-0">
            <Link href="/test-ride" className="px-8 py-4 bg-[#78BE20] text-black font-display text-sm uppercase tracking-widest hover:bg-[#5a9018] transition-colors duration-200 text-center">
              Reserve a Test Ride
            </Link>
            <Link href="/models" className="px-8 py-4 border border-white/20 text-white font-display text-sm uppercase tracking-widest hover:border-white/50 transition-colors duration-200 text-center">
              View Models
            </Link>
          </div>
        </div>
      </div>

    </main>
  );
}
