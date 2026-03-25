import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SecondaryButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Configurator | Energica Motor Company",
  description: "Build and personalise your Energica motorcycle. Choose your model, colour, and options.",
};

export default function ConfiguratorPage() {
  return (
    <main className="bg-[#0a0a0a] text-white min-h-screen flex items-center">

      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(120,190,32,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(120,190,32,0.04) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Ghost text */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
        <span
          className="font-display leading-none text-white/[0.03]"
          style={{ fontSize: "clamp(120px, 25vw, 360px)" }}
        >
          CONFIG
        </span>
      </div>

      <Container className="relative z-10 py-32">

        <p className="inline-flex items-center gap-3 mb-8">
          <span className="w-6 h-px bg-[#78BE20]" />
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/65">
            Energica Configurator
          </span>
        </p>

        <h1
          className="font-display text-white leading-none mb-4"
          style={{ fontSize: "clamp(56px, 10vw, 140px)" }}
        >
          Loading<br />
          <span className="text-[#78BE20]">Soon.</span>
        </h1>

        <div className="w-10 h-[2px] bg-[#78BE20] mb-8" />

        <p className="text-white/60 text-base max-w-[540px] leading-relaxed mb-4">
          Build your Energica, your way. Choose your model, colour, and riding
          configuration — all in one place.
        </p>
        <p className="text-white/40 text-sm max-w-[540px] leading-relaxed mb-12">
          The configurator is currently in development. In the meantime, our
          dealers can walk you through every option in person.
        </p>

        <div className="flex flex-wrap gap-4">
          <SecondaryButton href="/dealers">Find a Dealer</SecondaryButton>
          <SecondaryButton href="/models">Explore Models</SecondaryButton>
        </div>

      </Container>
    </main>
  );
}
