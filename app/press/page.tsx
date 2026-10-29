import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PrimaryButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Press & Media | Energica Motor Company",
  description: "Press releases, media kit, and media enquiries for Energica Motor Company.",
};

export default function PressPage() {
  return (
    <main className="bg-[#0a0a0a] text-white min-h-screen pt-32">
      <Container>
        <p className="inline-flex items-center gap-3 mb-6">
          <span className="w-6 h-px bg-[#CE2B37]" />
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/65">Press &amp; Media</span>
        </p>
        <h1
          className="font-display text-white leading-none mb-6"
          style={{ fontSize: "clamp(60px, 10vw, 140px)" }}
        >
          Press &amp; Media
        </h1>
        <p className="text-white/60 text-[length:var(--text-body)] max-w-[750px] leading-relaxed mb-[32px]">
          For media enquiries, press releases, or high-resolution assets, please contact us directly.
        </p>
        <PrimaryButton href="/contact">Contact Us</PrimaryButton>
      </Container>
    </main>
  );
}
