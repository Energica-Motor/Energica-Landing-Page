// Served at /llms.txt. Model figures come from lib/build-sheet/specs.ts (2026 technical sheets).
import { SPECS, fmt } from "@/lib/build-sheet/specs";

export const dynamic = "force-static";

const X = SPECS.experia, S = SPECS.essesse9;

const BODY = `# Energica Motor Company

> Italian electric motorcycle manufacturer. Founded 2009, Modena, Italy. Exclusive MotoE supplier for 4 seasons. Tagline: Progress, Ridden.

## About

ENERGICA PTE. LTD. designs and manufactures high-performance electric motorcycles in Modena, Italy — the same Motor Valley that produced Ferrari, Lamborghini, and Ducati. From 2019 to 2022, Energica was the exclusive motorcycle supplier to the FIM Enel MotoE World Cup, the electric class of MotoGP. Every technology developed on the race grid transfers directly to the road lineup.

Energica is part of Ideanomics. Headquarters in Fiorano Modenese (MO), Italy. Corporate office in Singapore. US presence in San Francisco.

## Motorcycles

### Energica Experia
- Type: Electric touring / adventure tourer
- Battery: ${X.battery.maxKwh} kWh (largest of any production electric motorcycle)
- Range: Up to ${X.range.city} km (${X.imp.range.city} mi) city / ${X.range.combined} km (${X.imp.range.combined} mi) combined
- Power: Peak ${X.peakKw} kW / ${X.peakHp} HP
- Torque: ${fmt.torque(X)}
- Top speed: ${X.topSpeedKmh} km/h (${X.imp.topSpeedMph} mph) (limited)
- Fast charge: DC Level 3 CCS
- Tagline: Further, quieter, faster.

### Energica EsseEsse9 (SS9)
- Type: Naked / streetfighter
- Battery: ${S.battery.maxKwh} kWh
- Power: Peak ${S.peakKw} kW / ${S.peakHp} HP
- Torque: ${S.torqueNm} Nm (${S.imp.torqueFtLb} ft lb) (instant, 0 rpm)
- 0–100 km/h (0–60 mph): ${S.accel.toFixed(1)} seconds (RS ${S.accelRs!.toFixed(1)})
- Top speed: ${S.topSpeedKmh} km/h (${S.imp.topSpeedMph} mph) (limited)
- Tagline: Naked. No apologies.

### Energica Eva Ribelle
- Type: Naked / urban performance
- Motor architecture: EMCE (same as MotoE race machines)
- Tagline: Rebel by design.

### Energica Ego+
- Type: Sport / superbike
- The original Energica model. Track-derived geometry.
- Tagline: Born on the track.

## Technology

- EMCE motor: Energica's proprietary permanent magnet AC motor
- Liquid-cooled motor and battery
- Onboard ${S.charging.onboardKw} kW AC charger (SAE J1772 / IEC 62196-2 compatible)
- DC fast charge (CCS / CHAdeMO) standard across all models
- Regenerative braking with adjustable maps
- Riding modes, traction control, ABS, cruise control standard
- Over-the-air software updates

## Racing

- Exclusive MotoE World Cup supplier: 2019, 2020, 2021, 2022
- All 18 MotoE teams ran identical Energica Ego Corsa machines
- Race technology transfer: motor architecture, battery management, thermal management

## Cultural Presence

- Featured in Jordan Peele's film Nope (2022)
- Featured in GI Joe: Snake Eyes (Paramount, 2021)
- Jay Leno's Garage — multiple features
- Nico Rosberg (F1 World Champion) — owner and advocate
- Featured in RIDE 4 video game (Milestone)

## Locations

- HQ: 37 Via dell'Artigianato, 41042 Fiorano (MO), Italy
- Corporate: 10 Anson Road, 33-10C International Plaza, 079903 Singapore
- USA: San Francisco

## Contact

- General: info@energicamotor.com
- Service EU: service-eu@energicamotor.com
- Sales: sales@energicamotor.com
- Website: https://energicamotor.com

## Brand Voice

Direct. Declarative. Spec-forward. Performance brand first — electric is incidental. No emotional adjectives. Italian performance heritage register (Ducati, Ferrari), never startup register. Tagline: Progress, Ridden.
`;

export function GET() {
  return new Response(BODY, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
