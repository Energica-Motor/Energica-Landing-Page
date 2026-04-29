import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PrimaryButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Warranty | Energica Motor Company",
  description: "Energica Motor Company warranty information and coverage details for your electric motorcycle.",
};

export default function WarrantyPage() {
  return (
    <main className="bg-[#0a0a0a] text-white min-h-screen pt-32">
      <Container>
        <p className="inline-flex items-center gap-3 mb-6">
          <span className="w-6 h-px bg-[#78BE20]" />
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/65">Warranty</span>
        </p>
        <h1
          className="font-display text-white leading-none mb-6"
          style={{ fontSize: "clamp(60px, 10vw, 140px)" }}
        >
          Warranty &amp;<br />Support.
        </h1>
        <p className="text-white/60 text-[length:var(--text-body)] max-w-[750px] leading-relaxed mb-[32px]">
          Your Energica is covered by our comprehensive warranty programme. Full
          documentation is being updated — please contact your authorised dealer
          or our support team for current coverage details.
        </p>
        <div className="flex flex-wrap gap-4">
          <PrimaryButton href="/contact">Contact Support</PrimaryButton>
        </div>
      </Container>
    </main>
  );
}
