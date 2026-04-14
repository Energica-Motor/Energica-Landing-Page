import HeroSection from "@/components/home/HeroSection";
import BikeShowcase from "@/components/home/BikeShowcase";
import TechStrip from "@/components/home/TechStrip";
import RacingMoment from "@/components/home/RacingMoment";
// import TestRideCTA from "@/components/home/TestRideCTA"; // hidden until test rides available

export default function HomePage() {
  return (
    <main className="bg-[#0A0A0A]">
      <div data-hero-wrapper className="relative h-[300vh]">
        <div className="sticky top-0 h-dvh overflow-hidden">
          <HeroSection />
        </div>
      </div>
      <BikeShowcase />
      <TechStrip />
      <RacingMoment />
      {/* <TestRideCTA /> */}
    </main>
  );
}
