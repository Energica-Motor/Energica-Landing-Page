import type { Metadata } from "next";
import RechargeShell from "@/components/recharge/RechargeShell";

export const metadata: Metadata = {
  title: "Energica ReCharge | Sell Your Electric Motorcycle",
  description:
    "Energica ReCharge — the factory-backed buyback programme for Energica electric motorcycles. Get an instant indicative offer, free collection, and payment on agreement.",
};

export default function RechargePage() {
  return <RechargeShell />;
}
