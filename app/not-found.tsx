import Link from "next/link";
import type { Metadata } from "next";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "404 — Page Not Found | Energica",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-center px-8 pt-20">

      {/* Error label */}
      <p className="text-[10px] uppercase tracking-[0.4em] text-[#78BE20]/60 mb-6">
        Error 404
      </p>

      {/* Giant 404 */}
      <h1
        className="font-display text-white/[0.20] leading-none select-none"
        style={{ fontSize: "clamp(120px, 30vw, 320px)" }}
        aria-hidden="true"
      >
        404
      </h1>

      {/* Copy */}
      <div className="-mt-8 mb-10">
        <p
          className="font-display text-white leading-none mb-4"
          style={{ fontSize: "clamp(32px, 5vw, 64px)" }}
        >
          Road Not Found
        </p>
        <p className="text-white/65 text-sm max-w-xs mx-auto leading-relaxed">
          This page doesn&rsquo;t exist. Let&rsquo;s get you back on track.
        </p>
      </div>

      {/* Navigation CTAs */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <PrimaryButton href="/">Back Home</PrimaryButton>
        <SecondaryButton href="/models">Our Models</SecondaryButton>
        <SecondaryButton href="/contact">Contact Us</SecondaryButton>
      </div>

      {/* Red decorative line */}
      <div className="mt-16 w-16 h-px bg-[#78BE20]/30" />
    </main>
  );
}
