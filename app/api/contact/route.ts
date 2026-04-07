import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, model, message } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Log the enquiry (replace with email service like Resend/Nodemailer in production)
    console.log("[contact-enquiry]", { firstName, lastName, email, phone, model, message });

    // TODO: send email via your preferred service
    // e.g. await resend.emails.send({ from: "...", to: "info@energicamotor.com", ... })

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
