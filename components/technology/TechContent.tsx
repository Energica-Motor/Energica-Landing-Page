"use client";

import { useRef, useState } from "react";
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
      return <circle key={i} cx={200 + Math.cos(a) * r} cy={200 + Math.sin(a) * r} r="3" fill="rgb(0,255,0)" className={cls} />;
    });

  return (
    <svg ref={ref} viewBox="0 0 400 400" className="w-full h-full" aria-hidden>
      <circle cx="200" cy="200" r="190" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
      <circle className="hr-ring-3" cx="200" cy="200" r="170" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="8 16" />
      <circle className="hr-ring-2" cx="200" cy="200" r="130" fill="none" stroke="rgba(0,255,0,0.12)" strokeWidth="1" strokeDasharray="4 8" />
      <circle className="hr-ring-1" cx="200" cy="200" r="90" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="2 6" />
      {nodes(170, 6, "hr-node")}
      {nodes(130, 8, "hr-node")}
      {nodes(90, 4, "hr-node")}
      <circle className="hr-pulse" cx="200" cy="200" r="30" fill="none" stroke="rgba(0,255,0,0.3)" strokeWidth="1" />
      <circle cx="200" cy="200" r="10" fill="rgb(0,255,0)" opacity="0.8" />
      <circle cx="200" cy="200" r="4" fill="white" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   SVG: Motor cross-section diagram
───────────────────────────────────────────────────────── */
function MotorDiagram() {
  const ref = useRef<SVGSVGElement>(null);
  useGSAP(() => {
    gsap.to(".md-rotor", { rotation: 360, transformOrigin: "200px 200px", duration: 12, ease: "none", repeat: -1 });
    gsap.from(".md-stator", {
      strokeDasharray: "0 1200", duration: 1.4, ease: "power2.out",
      scrollTrigger: { trigger: ref.current, start: "top 78%" },
    });
    gsap.from(".md-rotor", {
      opacity: 0, scale: 0.7, transformOrigin: "200px 200px", duration: 0.9, ease: "back.out(1.7)", delay: 0.4,
      scrollTrigger: { trigger: ref.current, start: "top 78%" },
    });
    const fields = ref.current?.querySelectorAll<SVGPathElement>(".md-field");
    fields?.forEach((p, i) => {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(p, { strokeDashoffset: 0, duration: 0.8, delay: 0.6 + i * 0.08, ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 78%" } });
    });
  }, { scope: ref });

  return (
    <svg ref={ref} viewBox="0 0 400 400" className="w-full max-w-[380px] mx-auto" aria-hidden>
      {/* Housing */}
      <circle cx="200" cy="200" r="182" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="28" />
      {/* Stator outline */}
      <circle className="md-stator" cx="200" cy="200" r="168" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
      {/* 12 stator teeth */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = ((i / 12) * 360 - 90) * (Math.PI / 180);
        const isCoil = i % 3 === 0;
        return (
          <line key={i}
            x1={200 + Math.cos(a) * 128} y1={200 + Math.sin(a) * 128}
            x2={200 + Math.cos(a) * 160} y2={200 + Math.sin(a) * 160}
            stroke={isCoil ? "rgb(0,255,0)" : "rgba(255,255,255,0.1)"}
            strokeWidth={isCoil ? "5" : "8"}
          />
        );
      })}
      {/* Air gap */}
      <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="14" />
      {/* Field arc lines */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const r1 = 113, r2 = 127;
        const mx = 200 + Math.cos(a + 0.3) * 140, my = 200 + Math.sin(a + 0.3) * 140;
        return (
          <path key={i} className="md-field"
            d={`M ${200 + Math.cos(a) * r1} ${200 + Math.sin(a) * r1} Q ${mx} ${my} ${200 + Math.cos(a + 0.6) * r2} ${200 + Math.sin(a + 0.6) * r2}`}
            fill="none" stroke={i % 2 === 0 ? "rgb(0,255,0)" : "rgba(139,184,212,0.5)"}
            strokeWidth="1.5" strokeLinecap="round" opacity="0.9"
          />
        );
      })}
      {/* Rotor (rotates) */}
      <g className="md-rotor">
        <circle cx="200" cy="200" r="108" fill="#0c0c0c" />
        <circle cx="200" cy="200" r="107" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        {/* 8 permanent magnets */}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          const mx = 200 + Math.cos(a) * 84, my = 200 + Math.sin(a) * 84;
          return (
            <rect key={i} x={mx - 10} y={my - 5} width="20" height="10" rx="2"
              fill={i % 2 === 0 ? "rgb(0,255,0)" : "#1a3a5c"} opacity="0.85"
              transform={`rotate(${(i / 8) * 360}, ${mx}, ${my})`} />
          );
        })}
        {/* Shaft */}
        <circle cx="200" cy="200" r="24" fill="#111" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <circle cx="200" cy="200" r="14" fill="#1a1a1a" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <circle cx="200" cy="200" r="5" fill="rgb(0,255,0)" />
      </g>
      {/* Labels */}
      <text x="200" y="20" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="8" letterSpacing="3" fontFamily="monospace">STATOR WINDING</text>
      <text x="200" y="390" textAnchor="middle" fill="rgba(0,255,0,0.5)" fontSize="8" letterSpacing="3" fontFamily="monospace">PMASynRM · 96% PEAK EFFICIENCY</text>
    </svg>
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
        fill: "rgb(0,255,0)",
        duration: 0.25,
        stagger: { each: 0.055, from: "end" },
        ease: "power1.out",
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
      });
    }
    const proxy = { n: 0 };
    const el = ref.current?.querySelector<SVGTextElement>(".bg-num");
    gsap.to(proxy, {
      n: 22.5, duration: 2.2, ease: "power2.out",
      onUpdate: () => { if (el) el.textContent = proxy.n.toFixed(1); },
      scrollTrigger: { trigger: ref.current, start: "top 75%", once: true },
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
        fill="rgba(0,255,0,0.7)" fontSize="9" letterSpacing="4" fontFamily="monospace">kWh TOTAL CAPACITY</text>
      <text x="190" y="252" textAnchor="middle"
        fill="rgba(255,255,255,0.15)" fontSize="8" letterSpacing="2" fontFamily="monospace">24 INDIVIDUALLY MONITORED CELLS</text>
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
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
      });
    }
    gsap.from(".cc-dot", {
      opacity: 0, scale: 0, transformOrigin: "center", duration: 0.5, delay: 2,
      ease: "back.out(2)",
      scrollTrigger: { trigger: ref.current, start: "top 75%" },
    });
    gsap.from(".cc-label", {
      opacity: 0, duration: 0.4, delay: 2.3,
      scrollTrigger: { trigger: ref.current, start: "top 75%" },
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
      <line x1="58" y1="124" x2="390" y2="124" stroke="rgba(0,255,0,0.2)" strokeWidth="1" strokeDasharray="4 4" />
      <text x="394" y="124" dominantBaseline="middle" fill="rgba(0,255,0,0.5)" fontSize="8" fontFamily="monospace">80%</text>
      {/* Charging curve: fast rise from 0→80%, then gentle taper */}
      <path className="cc-curve"
        d="M 58 244 C 100 243, 140 126, 180 124 S 280 124, 330 124 S 370 128, 390 136"
        fill="none" stroke="rgb(0,255,0)" strokeWidth="2.5" strokeLinecap="round" />
      {/* 80% endpoint */}
      <circle className="cc-dot" cx="330" cy="124" r="5" fill="rgb(0,255,0)" />
      <line x1="330" y1="124" x2="330" y2="244" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="2 4" />
      <text className="cc-label" x="330" y="260" textAnchor="middle"
        fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">≈40 min</text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   App section — right-side content (header + features)
───────────────────────────────────────────────────────── */
const appFeatures = [
  { icon: "⟳", label: "Real-time range prediction" },
  { icon: "◈", label: "Riding mode selector" },
  { icon: "⌁", label: "Live charging status" },
  { icon: "◉", label: "Trip & telemetry logs" },
  { icon: "◷", label: "Scheduled charging timer" },
];

function AppContent() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.from(".app-text", { y: 24, opacity: 0, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: ref.current, start: "top 78%" } });
    gsap.from(".app-feature", { x: 20, opacity: 0, stagger: 0.08, duration: 0.6, ease: "power3.out",
      scrollTrigger: { trigger: ref.current, start: "top 72%" } });
  }, { scope: ref });

  return (
    <div ref={ref} className="flex flex-col justify-center">
      {/* Section label */}
      <p className="app-text inline-flex items-center gap-3 mb-6">
        <span className="font-display text-5xl text-white/[0.06]">04</span>
        <span className="w-8 h-px bg-[rgb(0,255,0)]/40" />
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">Tech Pillar</span>
      </p>

      {/* Heading */}
      <h2 className="app-text font-display text-white leading-none mb-2"
          style={{ fontSize: "clamp(36px, 4.5vw, 64px)" }}>
        My Energica App
      </h2>
      <p className="app-text text-[10px] uppercase tracking-widest text-[rgb(0,255,0)]/70 mb-5">
        iOS &amp; Android · Bluetooth + 4G
      </p>
      <p className="app-text text-base text-white/50 leading-[1.8] max-w-lg mb-10">
        Your motorcycle in your pocket. The My Energica app connects via Bluetooth for local
        control and 4G for remote monitoring. Real-time range, state of charge, and trip data —
        plus remote diagnostics, scheduled charging, and OTA firmware updates.
      </p>

      {/* Feature list */}
      <div className="flex flex-col gap-3 mb-8">
        {appFeatures.map((f) => (
          <div key={f.label} className="app-feature flex items-center gap-4 py-3 border-b border-white/[0.05]">
            <span className="w-9 h-9 rounded border border-white/10 flex items-center justify-center text-[rgb(0,255,0)] text-sm flex-shrink-0">
              {f.icon}
            </span>
            <span className="text-sm text-white/60">{f.label}</span>
          </div>
        ))}
      </div>

      {/* Store buttons */}
      <div className="app-feature flex flex-wrap gap-3">
        <div className="px-5 py-2.5 border border-white/10 text-white/40 text-[10px] uppercase tracking-widest hover:border-white/30 hover:text-white/60 transition-colors duration-200 cursor-pointer">
          App Store
        </div>
        <div className="px-5 py-2.5 border border-white/10 text-white/40 text-[10px] uppercase tracking-widest hover:border-white/30 hover:text-white/60 transition-colors duration-200 cursor-pointer">
          Google Play
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   CSS: Phone app mockup (visual only)
───────────────────────────────────────────────────────── */
function PhoneMockup() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.from(ref.current, { y: 50, opacity: 0, duration: 1.1, ease: "power3.out",
      scrollTrigger: { trigger: ref.current, start: "top 80%" } });
  }, { scope: ref });

  return (
    <div ref={ref} className="flex justify-center lg:justify-end">
      <div className="relative w-[220px] h-[440px] sm:w-[240px] sm:h-[480px] rounded-[32px] border border-white/15 bg-[#0d0d0d] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
        {/* Status bar */}
        <div className="flex justify-between items-center px-4 pt-3.5 pb-2">
          <span className="text-[8px] text-white/35 font-mono">9:41</span>
          <div className="w-12 h-2.5 bg-white/10 rounded-full" />
          <span className="text-[8px] text-white/35 font-mono">■■■</span>
        </div>
        {/* App header */}
        <div className="px-4 pt-1 pb-3 border-b border-white/[0.06]">
          <p className="text-[7px] uppercase tracking-[0.3em] text-white/25 mb-0.5">MY ENERGICA</p>
          <p className="font-display text-white text-lg leading-none">Experia</p>
        </div>
        {/* Battery circle */}
        <div className="flex flex-col items-center py-5">
          <div className="relative w-20 h-20">
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgb(0,255,0)" strokeWidth="5"
                strokeDasharray="160" strokeDashoffset="40" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-display text-white text-xl leading-none">75%</p>
              <p className="text-[6px] text-white/25 tracking-widest">CHARGED</p>
            </div>
          </div>
          <p className="text-[8px] text-white/25 mt-1.5">315 km remaining</p>
        </div>
        {/* Modes */}
        <div className="px-3 mb-3">
          <div className="grid grid-cols-3 gap-1">
            {["URBAN", "ECO", "SPORT"].map((m, i) => (
              <div key={m} className={`py-1 text-center text-[6px] tracking-wider rounded ${i === 2 ? "bg-[rgb(0,255,0)] text-black" : "bg-white/[0.04] text-white/25"}`}>
                {m}
              </div>
            ))}
          </div>
        </div>
        {/* Metrics */}
        <div className="px-3 grid grid-cols-2 gap-1.5">
          {[["315 km", "RANGE"], ["0 km/h", "SPEED"], ["22°C", "BATTERY TEMP"], ["3h 40m", "CHARGE ETA"]].map(([val, lbl]) => (
            <div key={lbl} className="bg-white/[0.03] rounded p-2">
              <p className="font-display text-white text-sm leading-none">{val}</p>
              <p className="text-[5.5px] text-white/20 mt-0.5 tracking-widest">{lbl}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
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
        scrollTrigger: { trigger: ref.current, start: "top 75%" } });
    });
    gsap.from(".tg-label", { opacity: 0, duration: 0.5, delay: 1.8,
      scrollTrigger: { trigger: ref.current, start: "top 75%" } });
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
        fill="none" stroke="rgb(0,255,0)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Legend */}
      <g className="tg-label">
        <line x1="160" y1="238" x2="190" y2="238" stroke="rgb(0,255,0)" strokeWidth="2.5" />
        <text x="196" y="241" fill="rgba(0,255,0,0.8)" fontSize="9" fontFamily="monospace">ELECTRIC (LINEAR)</text>
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
  { num: "01", title: "Cornering ABS", sub: "Bosch 9.3MP", body: "Lean-angle sensitive braking that automatically adjusts ABS threshold based on bike inclination — up to 45° of lean without lockup." },
  { num: "02", title: "MSC Traction Control", sub: "Bosch Motorcycle Stability Control", body: "Wheel-spin detection via IMU and rear wheel speed sensor, with torque reduction applied in under 10 milliseconds." },
  { num: "03", title: "6 Riding Modes", sub: "Urban · Eco · Rain · Sport · Boost · Custom", body: "Each mode remaps throttle response, regenerative braking, and power ceiling. Custom mode lets riders define their own parameters on the TFT." },
  { num: "04", title: "5\" TFT Display", sub: "Full-colour, glare-resistant", body: "Sunlight-readable 5-inch display with Apple CarPlay connectivity via the My Energica app. Full navigation, call management, and music controls." },
  { num: "05", title: "4G Connectivity", sub: "Always-on telematics", body: "Cellular-connected telematics with theft alerts, remote diagnostics, and over-the-air firmware updates. Your dealer can run a diagnostic without you being present." },
  { num: "06", title: "CCS DC Charging", sub: "Level 3 — any public network", body: "The only electric motorcycle compatible with CCS Combo chargers. Plugs into every public fast charger in Europe and North America." },
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
        <div key={f.num} className="sf-card group p-6 border border-white/[0.06] bg-[#0f0f0f] hover:border-[rgb(0,255,0)]/30 transition-colors duration-300">
          <div className="flex items-start justify-between mb-4">
            <span className="font-display text-[rgb(0,255,0)]/30 text-4xl leading-none group-hover:text-[rgb(0,255,0)]/50 transition-colors duration-300">
              {f.num}
            </span>
          </div>
          <h3 className="font-display text-white text-xl mb-1">{f.title}</h3>
          <p className="text-[9px] uppercase tracking-widest text-[rgb(0,255,0)]/60 mb-3">{f.sub}</p>
          <p className="text-sm text-white/40 leading-relaxed">{f.body}</p>
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
      y: 36, opacity: 0, stagger: 0.1, duration: 0.8, ease: "power3.out",
      scrollTrigger: { trigger: ref.current, start: "top 78%" },
    });
  }, { scope: ref });

  const textCol = (
    <div className="ts-text flex flex-col justify-center gap-6">
      <div>
        <span className="inline-flex items-center gap-3 mb-6">
          <span className="font-display text-5xl text-white/[0.06]">{num}</span>
          <span className="w-8 h-px bg-[rgb(0,255,0)]/40" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">Tech Pillar</span>
        </span>
        <h2 className="font-display text-white leading-none mb-2" style={{ fontSize: "clamp(36px, 4.5vw, 64px)" }}>
          {title}
        </h2>
        <p className="text-[10px] uppercase tracking-widest text-[rgb(0,255,0)]/70 mb-5">{sub}</p>
        <p className="text-base text-white/50 leading-[1.8] max-w-lg">{body}</p>
      </div>
      {stats && (
        <div className="flex gap-8 pt-4 border-t border-white/[0.05]">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-3xl text-white">{s.value}</span>
                <span className="font-display text-sm text-[rgb(0,255,0)]">{s.unit}</span>
              </div>
              <p className="text-[9px] uppercase tracking-widest text-white/25 mt-0.5">{s.label}</p>
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
      <div className="max-w-[1600px] mx-auto px-[clamp(24px,4vw,64px)] py-[120px]">
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
      <div ref={heroRef} className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Rings — fills background */}
        <div aria-hidden className="absolute right-0 top-1/2 -translate-y-1/2 w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] opacity-60 pointer-events-none">
          <HeroRings />
        </div>

        <div className="relative z-10 max-w-[1600px] mx-auto px-[clamp(24px,4vw,64px)] py-[120px]">
          <p className="th-eyebrow inline-flex items-center gap-3 mb-8">
            <span className="w-6 h-px bg-[rgb(0,255,0)]" />
            <span className="text-[10px] uppercase tracking-[0.35em] text-white/35">Under the fairing</span>
          </p>
          <h1 className="th-h1 font-display text-white leading-none mb-8" style={{ fontSize: "clamp(60px, 11vw, 160px)" }}>
            <span className="block">OUR</span>
            <span className="block text-[rgb(0,255,0)]">TECHNOLOGY</span>
          </h1>
          <p className="th-body text-lg text-white/40 max-w-md leading-relaxed">
            Every Energica is built around proprietary technology — not repurposed automotive parts.
            From motor to BMS to software, we control every variable.
          </p>

          {/* Jump-links */}
          <div className="mt-12 flex flex-wrap gap-3">
            {["Motor", "Battery", "Charging", "App", "Ride By Wire", "Safety"].map((t) => (
              <span key={t} className="px-4 py-2 border border-white/10 text-[10px] uppercase tracking-widest text-white/40 hover:border-[rgb(0,255,0)]/40 hover:text-white/60 transition-colors duration-200 cursor-pointer">
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
        body="Energica's proprietary motor combines the efficiency of a permanent magnet design with the reliability of a reluctance motor. Maximum torque from zero RPM — no heat throttling, no brushes, no compromise. Peak efficiency exceeds 96%, meaning almost all stored energy reaches the rear wheel."
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
        sub="22.5 kWh lithium polymer — largest of any production electric motorcycle"
        body="Custom lithium polymer cells arranged in a structural aluminium pack. Each of the 24 cells is individually monitored by Energica's proprietary BMS — optimising charge rate, thermal management, and longevity simultaneously. The pack doubles as a stressed chassis member, reducing weight elsewhere."
        stats={[
          { value: "22.5", unit: "kWh", label: "Total Capacity" },
          { value: "420", unit: "km", label: "City Range" },
          { value: "3yr", unit: "", label: "Warranty" },
        ]}
        visual={<BatteryGrid />}
        flip
      />

      {/* ── 03 DC FAST CHARGING ─────────────────────────────── */}
      <TechSection
        num="03" title="DC Fast Charging"
        sub="CCS Combo Level 3 — compatible with every public fast-charge network"
        body="The only electric motorcycle fully compatible with DC fast-charge infrastructure. The chart shows a real CCS charging session — 0 to 80% in under 40 minutes, including the natural taper above 80% that protects cell longevity. On-board AC charger also supports Level 2 home charging."
        stats={[
          { value: "40", unit: "min", label: "0–80% DC Fast" },
          { value: "3.3", unit: "kW", label: "AC Home Rate" },
        ]}
        visual={<ChargingCurve />}
      />

      {/* ── 04 APP ──────────────────────────────────────────── */}
      <div className="border-t border-white/[0.04]">
        <div className="max-w-[1600px] mx-auto px-[clamp(24px,4vw,64px)] py-[120px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center">

            {/* LEFT — Phone mockup */}
            <PhoneMockup />

            {/* RIGHT — Header + features */}
            <AppContent />
          </div>
        </div>
      </div>

      {/* ── 05 RIDE BY WIRE ─────────────────────────────────── */}
      <TechSection
        num="05" title="Ride By Wire"
        sub="Linear, lag-free throttle response from 0 rpm"
        body="Because an electric motor delivers full torque at zero RPM, Energica's Ride By Wire system maintains perfectly linear throttle mapping — what you ask for is exactly what you get, at any speed. The graph compares electric delivery (green) against a typical internal combustion power curve. No powerband, no hesitation, no surprises."
        stats={[
          { value: "0", unit: "rpm", label: "Full Torque From" },
          { value: "<10", unit: "ms", label: "Throttle Response" },
        ]}
        visual={<ThrottleGraph />}
        flip
      />

      {/* ── 06 SAFETY ───────────────────────────────────────── */}
      <div className="border-t border-white/[0.04]">
        <div className="max-w-[1600px] mx-auto px-[clamp(24px,4vw,64px)] py-[120px]">
          <div className="mb-14">
            <p className="inline-flex items-center gap-3 mb-6">
              <span className="font-display text-5xl text-white/[0.06]">06</span>
              <span className="w-8 h-px bg-[rgb(0,255,0)]/40" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">Tech Pillar</span>
            </p>
            <h2 className="font-display text-white leading-none mb-2" style={{ fontSize: "clamp(36px, 4.5vw, 64px)" }}>
              Safety Suite
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-[rgb(0,255,0)]/70 mb-5">
              Co-developed with Bosch Motorsport
            </p>
            <p className="text-base text-white/50 leading-[1.8] max-w-2xl">
              An integrated safety package co-engineered with Bosch, drawing on the same technology used in MotoGP paddock machinery. Six systems working together to keep you on the road.
            </p>
          </div>
          <SafetyCards />
        </div>
      </div>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <div className="border-t border-white/[0.04] bg-[#080808]">
        <div className="max-w-[1600px] mx-auto px-[clamp(24px,4vw,64px)] py-[120px] flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h3 className="font-display text-white leading-none mb-2" style={{ fontSize: "clamp(32px, 4vw, 56px)" }}>
              Experience it for yourself.
            </h3>
            <p className="text-white/40 text-base">Book a free test ride at your nearest dealer.</p>
          </div>
          <div className="flex gap-4 flex-shrink-0">
            <Link href="/test-ride" className="px-8 py-4 bg-[rgb(0,255,0)] text-black font-display text-sm uppercase tracking-widest hover:bg-[rgb(0,220,0)] transition-colors duration-200">
              Book Test Ride
            </Link>
            <Link href="/models" className="px-8 py-4 border border-white/20 text-white font-display text-sm uppercase tracking-widest hover:border-white/50 transition-colors duration-200">
              View Models
            </Link>
          </div>
        </div>
      </div>

    </main>
  );
}
