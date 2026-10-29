import TechContent from "@/components/technology/TechContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Technology | Energica Motor Company",
  description:
    "The engineering behind Energica electric motorcycles — HSM motors, 22.5 kWh battery, DC fast charging, and advanced safety electronics. Made in Italy.",
};

export default function TechnologyPage() {
  return <TechContent />;
}
