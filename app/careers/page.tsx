import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PrimaryButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Careers | Energica Motor Company",
  description: "Join the team building the world's most advanced electric motorcycles. Open positions at Energica Motor Company, Modena, Italy.",
};

export default function CareersPage() {
  return (
    <main className="bg-[#0a0a0a] text-white min-h-screen pt-32">
      <Container>
        <p className="inline-flex items-center gap-3 mb-6">
          <span className="w-6 h-px bg-[#CE2B37]" />
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/65">Careers</span>
        </p>
        <h1
          className="font-display text-white leading-none mb-6"
          style={{ fontSize: "clamp(60px, 10vw, 140px)" }}
        >
          Careers
        </h1>
        <p className="text-white/60 text-[length:var(--text-body)] max-w-[750px] leading-relaxed mb-[32px]">
          We&rsquo;re always looking for passionate engineers, designers, and riders to join
          our team in Modena, Italy.
        </p>
        <PrimaryButton href="/contact">Contact Us</PrimaryButton>
      </Container>
    </main>
  );
}
