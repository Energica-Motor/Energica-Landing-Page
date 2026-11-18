import { LINEUP } from "@/lib/build-sheet/specs";
import TechContent from "@/components/technology/TechContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Technology | Energica Motor Company",
  description:
    `The engineering behind Energica electric motorcycles — PMASynRM motors, ${Math.max(...LINEUP.batteries)} kWh battery, DC fast charging, and advanced safety electronics. Made in Italy.`,
};

export default function TechnologyPage() {
  return <TechContent />;
}
