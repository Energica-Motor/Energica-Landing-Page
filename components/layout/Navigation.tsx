"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { navItems, type MegaMenuItem } from "@/data/navigation";
import { CurrentYear } from "@/components/ui/CurrentYear";
import { COMPANY_LEGAL_NAME } from "@/lib/company";
import { cn } from "@/lib/utils";

/* ── Logo ─────────────────────────────────────────────────── */
// Header uses the wordmark with the Italian tricolore line (no icon).
// Other placements (footer, loading screen, emails) keep the standard logo.
function EnergicaLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/images/Logo/energica-wordmark-tricolore-white.webp"
      alt="Energica Motor Company"
      width={180}
      height={24}
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
// Built from the same navItems as the desktop header (plus its mobile-only
// entries), so the two lists can't drift apart. While open it behaves as a
// modal: Escape closes it and Tab stays between its links and the menu button.
function MobileOverlay({
  open,
  onClose,
  toggleRef,
}: {
  open: boolean;
  onClose: () => void;
  toggleRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const pathname = usePathname() ?? "";
  const panelRef = useRef<HTMLDivElement>(null);
  const [modelsOpen, setModelsOpen] = useState(false);
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    if (!open) return;
    const focusables = () => [
      ...(toggleRef.current ? [toggleRef.current] : []),
      ...(panelRef.current?.querySelectorAll<HTMLElement>("a[href], button") ?? []),
    ];
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      const i = items.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i === items.length - 1 || i < 0 ? 0 : i + 1);
      e.preventDefault();
      items[next]?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, toggleRef]);

  const itemClass = (current: boolean) =>
    cn(
      "font-display text-5xl sm:text-6xl transition-all duration-300 text-left",
      current ? "text-[#78BE20]" : "text-white hover:text-[#78BE20]",
      "transform transition-all duration-500",
      open ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
    );
  const itemStyle = (i: number) => ({
    transitionDelay: open ? `${i * 60}ms` : "0ms",
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
  });

  return (
    <div
      id="mobile-menu"
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      inert={!open}
      className={cn(
        "fixed inset-0 z-40 bg-[#0a0a0a] overflow-y-auto",
        "transition-all duration-500",
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      )}
      style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      <div className="relative min-h-full flex flex-col justify-center px-8 pt-28 pb-20">
        <nav aria-label="Main" className="flex flex-col gap-1">
          {navItems.map((item, i) =>
            item.hasMega && item.megaItems ? (
              <div key={item.href} className="border-b border-white/5 pb-3">
                <button
                  type="button"
                  aria-expanded={modelsOpen}
                  aria-controls="mobile-menu-models"
                  onClick={() => setModelsOpen((v) => !v)}
                  className={cn(itemClass(isCurrent(item.href)), "flex w-full items-center justify-between")}
                  style={itemStyle(i)}
                >
                  {item.label}
                  <span aria-hidden="true" className={cn("text-2xl transition-transform duration-200", modelsOpen ? "rotate-180" : "rotate-0")}>▾</span>
                </button>
                {modelsOpen && (
                  <ul id="mobile-menu-models" className="mt-3 flex flex-col gap-2 pl-1">
                    {item.megaItems.map((m) => (
                      <li key={m.href}>
                        <Link
                          href={m.href}
                          onClick={onClose}
                          aria-current={isCurrent(m.href) ? "page" : undefined}
                          className={cn(
                            "font-display text-2xl transition-colors duration-200",
                            isCurrent(m.href) ? "text-[#78BE20]" : "text-white/70 hover:text-white"
                          )}
                        >
                          {m.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={isCurrent(item.href) ? "page" : undefined}
                className={cn(itemClass(isCurrent(item.href)), "border-b border-white/5 pb-3")}
                style={itemStyle(i)}
              >
                {item.label}
              </Link>
            )
          )}
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
            href="/contact"
            onClick={onClose}
            className="btn-primary block text-center py-4 font-display text-lg tracking-widest"
          >
            CONTACT US
          </Link>
        </div>

        <p className="absolute bottom-8 left-8 text-xs text-white/20 uppercase tracking-widest">
          © <CurrentYear /> {COMPANY_LEGAL_NAME} — Modena, Italy
        </p>
      </div>
    </div>
  );
}

/* ── Split nav link — per-character hover lift ───────────── */
// The word is read once from a visually hidden copy; the animated letters
// are hidden from assistive tech so it isn't spelt out.
function SplitLabel({ label }: { label: string }) {
  return (
    <span className="nav-split-link inline-flex">
      <span className="sr-only">{label}</span>
      <span className="inline-flex" aria-hidden="true">
        {label.split("").map((char, i) => (
          <span
            key={i}
            className="nav-char"
            style={{ transitionDelay: `${i * 18}ms` }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
    </span>
  );
}

/* ── Main Navigation ──────────────────────────────────────── */
export default function Navigation({ alwaysDark = false }: { alwaysDark?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const megaTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

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
          scrolled || alwaysDark
            ? "bg-[#0a0a0a]/95 nav-blur border-b border-white/5"
            : "bg-transparent"
        )}
        style={{ transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)" }}
      >
        <div className="max-w-[1600px] mx-auto px-[clamp(24px,4vw,64px)] h-20 md:h-24 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="relative z-50 flex-shrink-0">
            <EnergicaLogo className="h-auto w-[150px] md:w-[180px]" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.filter((item) => !item.mobileOnly).map((item) =>
              item.hasMega ? (
                <button
                  key={item.label}
                  aria-expanded={megaOpen}
                  onMouseEnter={handleModelsEnter}
                  onMouseLeave={handleModelsLeave}
                  onClick={() => setMegaOpen((v) => !v)}
                  className={cn(
                    "text-sm uppercase tracking-[0.2em] transition-colors duration-200 flex items-center gap-1 cursor-none",
                    megaOpen ? "text-[#78BE20]" : "text-white/60 hover:text-white"
                  )}
                  style={{ fontFamily: "var(--font-ibm-mono)" }}
                >
                  <SplitLabel label={item.label} />
                  <span
                    aria-hidden="true"
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
                  className="text-sm uppercase tracking-[0.2em] text-white/60 hover:text-[#78BE20] transition-colors duration-200"
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
              href="/contact"
              data-magnetic
              className="btn-primary px-5 py-2.5 text-sm uppercase tracking-[0.15em]"
              style={{ fontFamily: "var(--font-ibm-mono)" }}
            >
              Contact Us
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            ref={menuButtonRef}
            className="lg:hidden relative z-50 cursor-none"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
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
        onClose={closeMobile}
        toggleRef={menuButtonRef}
      />
    </>
  );
}
