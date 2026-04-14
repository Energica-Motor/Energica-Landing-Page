import HeroSection from "@/components/home/HeroSection";
import BikeShowcase from "@/components/home/BikeShowcase";
import TechStrip from "@/components/home/TechStrip";
import RacingMoment from "@/components/home/RacingMoment";
// import TestRideCTA from "@/components/home/TestRideCTA"; // hidden until test rides available

export default function HomePage() {
  return (
    <main className="bg-[#0A0A0A]">
      {/* Tall wrapper keeps the hero pinned for ~1.5× viewport of scroll
          before the BikeShowcase scrolls into view. GSAP ScrollTrigger
          in HeroSection uses data-hero-wrapper to scrub animations. */}
      <div data-hero-wrapper className="relative h-[250vh]">
        <div className="sticky top-0 h-screen">
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
