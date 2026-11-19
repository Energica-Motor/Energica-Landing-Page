import { describe, expect, it } from "vitest";
import { RECHARGE_FROM, RECHARGE_REPLY_TO, rechargeCustomerHtml, rechargeCustomerSubject } from "@/lib/recharge-customer-email";

describe("ReCharge customer email", () => {
  const html = rechargeCustomerHtml({ firstName: "Ana", year: 2023, modelLabel: "Experia", amount: "€14,500", ref: "ER-12345" });
  it("sender, subject and wording", () => {
    expect(RECHARGE_FROM).toBe("Energica ReCharge <info@energicamotor.com>");
    expect(RECHARGE_REPLY_TO).toBe("info@energicamotor.com");
    expect(rechargeCustomerSubject("ER-12345")).toBe("Your Energica ReCharge offer — Ref ER-12345");
    expect(html).toContain("Your indicative offer: €14,500 · Ref ER-12345");
    expect(html).toContain("Thanks, Ana.");
    expect(html).toContain("within 3 working days.");
    expect(html).toContain("Questions? Just reply to this email.");
  });
  it("email-safe logo and dark-mode meta", () => {
    expect(html).toMatch(/energicamotor\.com\/images\/Logo\/energica-wordmark-email@2x\.png" width="140" alt="ENERGICA"/);
    expect(html).not.toMatch(/\.svg/);
    expect(html).toContain('name="color-scheme" content="light dark"');
    expect(html).toContain('name="supported-color-schemes" content="light dark"');
  });
});
