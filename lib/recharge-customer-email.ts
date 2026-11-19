// Customer confirmation email after a ReCharge submission.
// Email-safe: table layout, inline styles, PNG logo (no SVG), Arial stack.

export const RECHARGE_FROM = process.env.RECHARGE_FROM || "Energica ReCharge <info@energicamotor.com>";
export const RECHARGE_REPLY_TO = process.env.RECHARGE_REPLY_TO || "info@energicamotor.com";

/** White wordmark with the tricolour line, 280px PNG shown at 140px. */
export const RECHARGE_LOGO_URL = "https://energicamotor.com/images/Logo/energica-wordmark-email@2x.png";

const FONT = "Arial, Helvetica, sans-serif";

export interface RechargeCustomerEmail {
  firstName: string;
  year: string | number;
  modelLabel: string;
  amount: string; // formatted, e.g. "€14,500"
  ref: string;
  logoUrl?: string;
}

export function rechargeCustomerSubject(ref: string) {
  return `Your Energica ReCharge offer — Ref ${ref}`;
}

export function rechargeCustomerHtml(p: RechargeCustomerEmail): string {
  const logo = p.logoUrl ?? RECHARGE_LOGO_URL;
  const preheader = `Your indicative offer: ${p.amount} · Ref ${p.ref}`;
  const row = (label: string, value: string, big = false) => `
                <tr>
                  <td style="padding: 6px 0; font-family: ${FONT}; font-size: 13px; color: #5E6368; width: 140px; vertical-align: ${big ? "middle" : "top"};">${label}</td>
                  <td style="padding: 6px 0; font-family: ${FONT}; font-size: ${big ? "28px" : "15px"}; line-height: ${big ? "34px" : "22px"}; font-weight: bold; color: #111111;">${value}</td>
                </tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${rechargeCustomerSubject(p.ref)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ECEDEE;">
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #ECEDEE; opacity: 0;">${preheader}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ECEDEE;">
    <tr>
      <td align="center" style="padding: 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%;">
          <tr>
            <td bgcolor="#0A0A0A" style="background-color: #0A0A0A; padding: 24px; border-bottom: 3px solid #78BE20;">
              <img src="${logo}" width="140" alt="ENERGICA" style="display: block; width: 140px; height: auto; border: 0; outline: none; text-decoration: none; color: #ffffff; font-family: ${FONT}; font-weight: bold; font-size: 18px;">
            </td>
          </tr>
          <tr>
            <td bgcolor="#F9F9F9" style="background-color: #F9F9F9; padding: 32px 24px;">
              <h1 style="margin: 0 0 20px; font-family: ${FONT}; font-size: 22px; line-height: 28px; font-weight: bold; color: #111111;">Thanks, ${p.firstName}.</h1>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFFFFF" style="background-color: #FFFFFF; border: 1px solid #DADCDE; border-left: 4px solid #78BE20;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${row("Bike", `${p.year} ${p.modelLabel}`)}${row("Indicative offer", p.amount, true)}${row("Reference", p.ref)}
                    </table>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; font-family: ${FONT}; font-size: 15px; line-height: 24px; color: #333333;">Our team will send a formal offer letter and collection slot options within 3 working days.</p>
              <p style="margin: 12px 0 0; font-family: ${FONT}; font-size: 13px; line-height: 20px; color: #5E6368;">Questions? Just reply to this email.</p>
              <p style="margin: 24px 0 0; font-family: ${FONT}; font-size: 13px; color: #888888;">Progress, Ridden.</p>
            </td>
          </tr>
          <tr>
            <td bgcolor="#0A0A0A" style="background-color: #0A0A0A; padding: 16px 24px; font-family: ${FONT}; font-size: 12px; line-height: 18px; color: #A3A7AC;">
              ENERGICA PTE. LTD. · <a href="https://energicamotor.com" style="color: #ffffff; text-decoration: none;">energicamotor.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
