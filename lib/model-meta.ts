// Meta description, Open Graph and schema.org text for each model page.
// Wording is the existing copy; every figure comes from lib/build-sheet/specs.ts.
import type { Metadata } from "next";
import type { ModelId } from "@/lib/build-sheet/catalog";
import { SPECS, displayName, schemaSpecs } from "@/lib/build-sheet/specs";

const s1 = (v: number) => v.toFixed(1);

const COPY: Record<ModelId, { meta: string; schema: string }> = (() => {
  const g = SPECS.ego, e = SPECS.eva_ribelle, s = SPECS.essesse9, x = SPECS.experia;
  return {
    ego: {
      meta: `Track tested. Street legal. MotoE-derived ${g.peakHp} HP in a road-legal superbike.`,
      schema: `MotoE-derived electric superbike. Track tested, street legal. ${g.peakHp} HP, 0–100 km/h in ${s1(g.accel)} seconds (RS ${s1(g.accelRs!)}). Made in Modena, Italy.`,
    },
    eva_ribelle: {
      meta: `The rebel electric motorcycle. Italian design, ${e.peakHp} HP, and ${e.topSpeedKmh} km/h of attitude.`,
      schema: `Electric naked motorcycle with Italian design. ${e.peakHp} HP, ${e.topSpeedKmh} km/h top speed. EMCE motor from MotoE. Made in Modena, Italy.`,
    },
    essesse9: {
      meta: `The naked electric champion. ${s.peakHp} HP, 0–100 in ${s1(s.accel)} seconds, ${s.topSpeedKmh} km/h top speed.`,
      schema: `Naked electric streetfighter. ${s.peakHp} HP, ${s.torqueNm} Nm from 0 rpm, 0–100 km/h in ${s1(s.accel)} seconds. EMCE motor architecture from MotoE. Made in Modena, Italy.`,
    },
    experia: {
      meta: `Europe's first electric green tourer. ${x.range.city} km city range, ${x.peakHp} HP, CCS DC fast charging. Made in Italy.`,
      schema: `Europe's first electric touring motorcycle. ${x.battery.maxKwh} kWh battery, ${x.range.city} km city range, ${x.peakHp} HP, CCS DC fast charging. Made in Modena, Italy.`,
    },
  };
})();

export function modelMetadata(m: ModelId): Metadata {
  const title = `${displayName(m)} | Energica Motor Company`;
  const description = COPY[m].meta;
  return { title, description, openGraph: { title, description } };
}

export const modelSchema = (m: ModelId) => ({ description: COPY[m].schema, specs: schemaSpecs(m) });
