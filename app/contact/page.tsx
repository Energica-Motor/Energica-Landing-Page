import type { Metadata } from "next";
import ContactForm from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact — Energica Motor Company",
  description: "Get in touch with Energica. We'll connect you with the right person — whether you have a question about our bikes, want a demo, or are looking to purchase.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-32 pb-24">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,420px)_1fr] gap-16 lg:gap-20 items-start">

          {/* Left: Header + Info */}
          <div className="lg:sticky lg:top-32">
            <span className="mono-tag mb-5 inline-block">Get in touch</span>
            <h1 className="font-display text-[clamp(56px,7vw,110px)] text-white leading-[0.88] uppercase mb-8">
              Let&apos;s<br />
              <span className="text-[#78BE20]">Talk.</span>
            </h1>
            <p className="text-white/60 text-base max-w-[420px] leading-relaxed mb-12" style={{ fontFamily: "var(--font-ibm-sans)" }}>
              Tell us what you&apos;re interested in. We&apos;ll get back to you within 24 hours.
            </p>

            {/* Contact details */}
            <div className="space-y-6 border-t border-white/10 pt-10">
              <div>
                <p className="text-[11px] tracking-[0.3em] text-white/40 uppercase mb-2" style={{ fontFamily: "var(--font-ibm-mono)" }}>Email</p>
                <div className="space-y-1" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                  <p className="text-white/80 text-sm">info@energicamotor.com</p>
                  <p className="text-white/80 text-sm">service-eu@energicamotor.com</p>
                  <p className="text-white/80 text-sm">sales@energicamotor.com</p>
                </div>
              </div>
              <div>
                <p className="text-[11px] tracking-[0.3em] text-white/40 uppercase mb-2" style={{ fontFamily: "var(--font-ibm-mono)" }}>Headquarters</p>
                <div className="space-y-3" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                  <div>
                    <p className="text-white/80 text-sm leading-relaxed">
                      37 Via dell&apos;Artigianato<br />
                      41042 Fiorano (MO), Italy
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.2em] text-white/35 uppercase mb-0.5" style={{ fontFamily: "var(--font-ibm-mono)" }}>Corporate</p>
                    <p className="text-white/80 text-sm leading-relaxed">
                      10 Anson Road, 33-10C<br />
                      International Plaza<br />
                      079903 Singapore
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.2em] text-white/35 uppercase mb-0.5" style={{ fontFamily: "var(--font-ibm-mono)" }}>USA</p>
                    <p className="text-white/80 text-sm">San Francisco</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div>
            <ContactForm />
          </div>

        </div>
      </div>
    </main>
  );
}
