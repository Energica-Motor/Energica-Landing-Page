import Link from "next/link";
import Image from "next/image";
import { footerLinks } from "@/data/navigation";
import { Container } from "@/components/ui/Container";

const SOCIAL = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/energicamotorcompany/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@ENERGICAMOTORCOMPANY",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/EnergicaMotorCompany/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/energica-motor-company/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
];

const COUNTRIES = [
  "International (EN)",
  "Italia (IT)",
  "Deutschland (DE)",
  "France (FR)",
  "United Kingdom (EN)",
  "España (ES)",
  "United States (EN)",
  "日本 (JP)",
  "Australia (EN)",
];

export default function Footer() {
  return (
    <footer className="border-t-2 border-[#78BE20] bg-[#080808]">

      {/* ── Top section ─────────────────────────────────────── */}
      <Container className="pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12 lg:gap-16">

          {/* ── Brand column ──────────────────────────────────── */}
          <div>
            {/* Logo */}
            <Link href="/" className="block mb-6 w-fit">
              <Image
                src="/images/Logo/energica-logo-horizontal.webp"
                alt="Energica Motor Company"
                width={160}
                height={48}
                className="object-contain opacity-90 hover:opacity-100 transition-opacity duration-200"
              />
            </Link>

            {/* Tagline */}
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#78BE20]/85 mb-3">
              Progress, Ridden.
            </p>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              The world&rsquo;s most advanced electric motorcycles, engineered in Modena, Italy since 2009.
            </p>

            {/* Social icons */}
            <div className="flex gap-2 mt-6">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 border border-white/[0.12] flex items-center justify-center text-white/50 hover:border-[#78BE20]/60 hover:text-[#78BE20] transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── Models ────────────────────────────────────────── */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-white/50 mb-5">Models</h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.models.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Company ───────────────────────────────────────── */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-white/50 mb-5">Company</h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Support ───────────────────────────────────────── */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-white/50 mb-5">Support</h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Newsletter nudge */}
            <div className="mt-8 pt-6 border-t border-white/[0.05]">
              <p className="text-[10px] uppercase tracking-widest text-white/50 mb-3">
                Stay Updated
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-xs text-[#78BE20]/90 hover:text-[#78BE20] transition-colors duration-200"
              >
                Get in touch →
              </Link>
            </div>
          </div>
        </div>
      </Container>

      {/* ── Divider ─────────────────────────────────────────── */}
      <Container>
        <div className="h-px bg-white/[0.04]" />
      </Container>

      {/* ── Bottom bar ──────────────────────────────────────── */}
      <Container className="py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

          {/* Copyright + legal */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-[10px] text-white/45">
              © {new Date().getFullYear()} ENERGICA PTE LTD — Modena, Italy
            </p>
            <div className="hidden sm:block w-px h-3 bg-white/10" />
            <div className="flex flex-wrap gap-4">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[10px] text-white/45 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Country / language selector */}
          <div className="relative flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-widest text-white/45">Region</span>
            <div className="relative">
              <select
                defaultValue="International (EN)"
                className="appearance-none bg-transparent border border-white/[0.15] text-white/60 text-[10px] px-3 py-1.5 pr-6 focus:outline-none focus:border-[#78BE20]/60 hover:border-white/30 transition-colors duration-200 cursor-pointer"
                aria-label="Select region"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c} className="bg-[#111] text-white">
                    {c}
                  </option>
                ))}
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none text-[8px]">▾</span>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
