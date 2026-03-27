"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { navItems, type MegaMenuItem } from "@/data/navigation";
import { cn } from "@/lib/utils";

/* ── Logo ─────────────────────────────────────────────────── */
function EnergicaLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/images/Logo/energica-logo-horizontal.webp"
      alt="Energica Motor Company"
      width={160}
      height={32}
      className={className}
      priority
    />
  );
}

/* ── Hamburger Icon ───────────────────────────────────────── */
function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div className="w-6 h-5 flex flex-col justify-between cursor-none">
      <span
        className={cn(
          "block h-px w-full bg-white transition-all duration-300 origin-center",
          open && "rotate-45 translate-y-[10px]"
        )}
      />
      <span
        className={cn(
          "block h-px w-full bg-white transition-all duration-300",
          open && "opacity-0 scale-x-0"
        )}
      />
      <span
        className={cn(
          "block h-px w-full bg-white transition-all duration-300 origin-center",
          open && "-rotate-45 -translate-y-[10px]"
        )}
      />
    </div>
  );
}

/* ── Mega Menu ────────────────────────────────────────────── */
function MegaMenu({
  items,
  visible,
}: {
  items: MegaMenuItem[];
  visible: boolean;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      className={cn(
        "absolute top-full left-0 w-full bg-[#0d0d0d]/98 border-b border-white/10 nav-blur",
        "transition-all duration-300",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 -translate-y-2 pointer-events-none"
      )}
      style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      <div className="max-w-[1600px] mx-auto px-[clamp(24px,4vw,64px)] py-10">
        <div className="grid grid-cols-4 gap-6">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group relative flex flex-col gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors duration-200"
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Bike image — 3D tilt on hover */}
              <div
                className="relative w-full aspect-[16/9] rounded overflow-hidden bg-[#111] bike-glint"
                style={{ perspective: "800px", transformStyle: "preserve-3d" }}
                onMouseMove={(e) => {
                  const el = e.currentTarget;
                  const r = el.getBoundingClientRect();
                  const nx = (e.clientX - r.left) / r.width - 0.5;
                  const ny = (e.clientY - r.top)  / r.height - 0.5;
                  el.style.transform = `rotateY(${nx * 12}deg) rotateX(${-ny * 8}deg)`;
                  el.style.setProperty("--glint-x", `${(nx + 0.5) * 100}%`);
                  el.style.setProperty("--glint-y", `${(ny + 0.5) * 100}%`);
                  el.style.setProperty("--glint-opacity", "1");
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "rotateY(0deg) rotateX(0deg)";
                  el.style.setProperty("--glint-opacity", "0");
                }}
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 50vw, 20vw"
                />
                {/* Green accent line on hover */}
                <div
                  className={cn(
                    "absolute bottom-0 left-0 h-[2px] bg-[#78BE20] transition-all duration-300",
                    hovered === item.id ? "w-full" : "w-0"
                  )}
                />
              </div>

              <div>
                <p className="font-display text-xl text-white group-hover:text-[#78BE20] transition-colors duration-200">
                  {item.name}
                </p>
                <p className="text-sm text-white/40 mt-0.5 font-light">
                  {item.tagline}
                </p>
              </div>

              {/* Arrow indicator */}
              <span
                className={cn(
                  "absolute top-4 right-4 text-[#78BE20] text-xs transition-all duration-200",
                  hovered === item.id
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2"
                )}
              >
                →
              </span>
            </Link>
          ))}
        </div>

        {/* Footer strip */}
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
          <p className="text-xs text-white/30 uppercase tracking-widest">
            Energica Motor Company — Modena, Italy
          </p>
          <Link
            href="/models"
            className="text-xs text-white/50 hover:text-white transition-colors flex items-center gap-2"
          >
            View all models <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Mobile Overlay ───────────────────────────────────────── */
function MobileOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const mobileLinks = [
    { label: "Models", href: "/models" },
    { label: "Technology", href: "/technology" },
    { label: "Racing", href: "/racing" },
    { label: "Dealers", href: "/dealers" },
  ];

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 bg-[#0a0a0a] flex flex-col justify-center px-8",
        "transition-all duration-500",
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      )}
      style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      <nav className="flex flex-col gap-2">
        {mobileLinks.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={cn(
              "font-display text-6xl text-white hover:text-[#78BE20] transition-all duration-300",
              "border-b border-white/5 pb-4",
              "transform transition-all duration-500",
              open ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
            )}
            style={{
              transitionDelay: open ? `${i * 60}ms` : "0ms",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div
        className={cn(
          "mt-12 flex flex-col gap-4 transition-all duration-500",
          open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
        style={{
          transitionDelay: open ? "300ms" : "0ms",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <Link
          href="/dealers"
          onClick={onClose}
          className="block text-center py-4 border border-[#78BE20] text-white font-display text-lg tracking-widest hover:bg-[#78BE20] hover:text-black transition-colors duration-200"
        >
          FIND A DEALER
        </Link>
        <Link
          href="/test-ride"
          onClick={onClose}
          className="block text-center py-4 bg-[#78BE20] text-black font-display text-lg tracking-widest hover:bg-[#5a9018] transition-colors duration-200"
        >
          RESERVE A TEST RIDE
        </Link>
      </div>

      <p className="absolute bottom-8 left-8 text-xs text-white/20 uppercase tracking-widest">
        © 2024 Energica Motor Company
      </p>
    </div>
  );
}

/* ── Split nav link — per-character hover lift ───────────── */
function SplitLabel({ label }: { label: string }) {
  return (
    <span className="nav-split-link inline-flex" aria-label={label}>
      {label.split("").map((char, i) => (
        <span
          key={i}
          className="nav-char"
          style={{ transitionDelay: `${i * 18}ms` }}
          aria-hidden="true"
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

/* ── Main Navigation ──────────────────────────────────────── */
export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const megaTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);

  /* Scroll detection */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Close mega menu on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* Lock body scroll when mobile menu open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleModelsEnter = useCallback(() => {
    if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current);
    setMegaOpen(true);
  }, []);

  const handleModelsLeave = useCallback(() => {
    megaTimeoutRef.current = setTimeout(() => setMegaOpen(false), 150);
  }, []);

  const modelsItem = navItems.find((i) => i.hasMega);

  return (
    <>
      <header
        ref={navRef}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-[#0a0a0a]/95 nav-blur border-b border-white/5"
            : "bg-transparent"
        )}
        style={{ transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)" }}
      >
        <div className="max-w-[1600px] mx-auto px-[clamp(24px,4vw,64px)] h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="relative z-50 flex-shrink-0">
            <EnergicaLogo className="h-8 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) =>
              item.hasMega ? (
                <button
                  key={item.label}
                  onMouseEnter={handleModelsEnter}
                  onMouseLeave={handleModelsLeave}
                  onClick={() => setMegaOpen((v) => !v)}
                  className={cn(
                    "text-xs uppercase tracking-[0.2em] transition-colors duration-200 flex items-center gap-1 cursor-none",
                    megaOpen ? "text-[#78BE20]" : "text-white/60 hover:text-white"
                  )}
                  style={{ fontFamily: "var(--font-ibm-mono)" }}
                >
                  <SplitLabel label={item.label} />
                  <span
                    className={cn(
                      "text-xs transition-transform duration-200 ml-0.5",
                      megaOpen ? "rotate-180" : "rotate-0"
                    )}
                  >
                    ▾
                  </span>
                </button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-xs uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors duration-200"
                  style={{ fontFamily: "var(--font-ibm-mono)" }}
                >
                  <SplitLabel label={item.label} />
                </Link>
              )
            )}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/dealers"
              data-magnetic
              className="px-4 py-2 text-xs uppercase tracking-[0.15em] border border-[#78BE20] text-white hover:bg-[#78BE20] hover:text-black transition-all duration-200"
              style={{ fontFamily: "var(--font-ibm-mono)" }}
            >
              Find a Dealer
            </Link>
            <Link
              href="/test-ride"
              data-magnetic
              className="px-4 py-2 text-xs uppercase tracking-[0.15em] bg-[#78BE20] text-black hover:bg-[#5a9018] transition-all duration-200 btn-electric"
              style={{ fontFamily: "var(--font-ibm-mono)" }}
            >
              Reserve a Test Ride
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden relative z-50 cursor-none"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <HamburgerIcon open={mobileOpen} />
          </button>
        </div>

        {/* Mega Menu */}
        {modelsItem?.megaItems && (
          <div
            onMouseEnter={handleModelsEnter}
            onMouseLeave={handleModelsLeave}
          >
            <MegaMenu items={modelsItem.megaItems} visible={megaOpen} />
          </div>
        )}
      </header>

      {/* Mobile Overlay */}
      <MobileOverlay
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </>
  );
}
