import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PrimaryButton } from "@/components/ui/Button";
import { models } from "@/data/models";

// The warranty as each model's spec table states it. "on vehicle X – on
// battery Y" is split into its two parts; anything else (Experia) is shown
// word for word across both columns.
const rows = models.map((m) => {
  const text = m.specs.battery.warranty ?? "";
  const split = text.match(/^on vehicle (.+?) – on battery (.+)$/);
  return { name: m.name, text, vehicle: split?.[1], battery: split?.[2] };
});

export const metadata: Metadata = {
  title: "Warranty | Energica Motor Company",
  description: "Energica Motor Company warranty information and coverage details for your electric motorcycle.",
};

export default function WarrantyPage() {
  return (
    <main className="bg-[#0a0a0a] text-white min-h-screen pt-32">
      <Container>
        <p className="inline-flex items-center gap-3 mb-6">
          <span className="w-6 h-px bg-[#CE2B37]" />
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/65">Warranty</span>
        </p>
        <h1
          className="font-display text-white leading-none mb-6"
          style={{ fontSize: "clamp(60px, 10vw, 140px)" }}
        >
          Warranty &amp;<br />Support.
        </h1>
        <p className="text-white/60 text-[length:var(--text-body)] max-w-[750px] leading-relaxed mb-10">
          Your Energica is covered by our comprehensive warranty programme.
        </p>

        <table className="w-full max-w-[900px] text-left border-collapse mb-6">
          <thead>
            <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.3em] text-white/60">
              <th scope="col" className="py-3 pr-6 font-normal">Model</th>
              <th scope="col" className="py-3 pr-6 font-normal">Vehicle</th>
              <th scope="col" className="py-3 font-normal">Battery</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-b border-white/[0.06] align-top">
                <th scope="row" className="py-4 pr-6 font-display text-xl text-white font-normal">{r.name}</th>
                {r.vehicle && r.battery ? (
                  <>
                    <td className="py-4 pr-6 text-white/75">{r.vehicle}</td>
                    <td className="py-4 text-white/75">{r.battery}</td>
                  </>
                ) : (
                  <td colSpan={2} className="py-4 text-white/75">{r.text}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-sm text-white/60 mb-[32px]">Confirm coverage for your region with your Energica dealer.</p>

        <div className="flex flex-wrap gap-4">
          <PrimaryButton href="/contact">Contact Support</PrimaryButton>
        </div>
      </Container>
    </main>
  );
}
