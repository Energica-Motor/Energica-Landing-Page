import type { Metadata } from "next";
import ContactForm from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact — Energica Motor Company",
  description: "Get in touch with Energica. We'll connect you with the right person — whether you have a question about our bikes, want a demo, or are looking to purchase.",
};

const WHATSAPP_NUMBER = "+390000000000"; // replace with real number
const EMAIL = "info@energicamotor.com";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-32 pb-24">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20">

        {/* Header */}
        <div className="mb-16">
          <span className="mono-tag mb-5 inline-block">Get in touch</span>
          <h1 className="font-display text-[clamp(40px,8vw,100px)] text-white leading-[0.88] uppercase mb-6">
            Let&apos;s<br />
            <span className="text-[#78BE20]">Talk.</span>
          </h1>
          <p className="text-white/60 text-base max-w-[520px] leading-relaxed" style={{ fontFamily: "var(--font-ibm-sans)" }}>
            Tell us what you&apos;re interested in. We&apos;ll put you in touch with the right person — whether that&apos;s a demo, a purchase enquiry, or a general question.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 lg:gap-24">

          {/* Left — direct contact options */}
          <div className="space-y-10">

            {/* WhatsApp */}
            <div>
              <p className="text-[11px] tracking-[0.3em] text-white/40 uppercase mb-4" style={{ fontFamily: "var(--font-ibm-mono)" }}>
                Fastest response
              </p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group border border-white/10 px-6 py-5 hover:border-[#78BE20] transition-colors duration-200"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#78BE20] shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="currentColor"/>
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.413A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.182a8.182 8.182 0 01-4.177-1.144l-.299-.178-3.095.879.84-3.239-.195-.315A8.182 8.182 0 1120.182 12 8.191 8.191 0 0112 20.182z" fill="currentColor"/>
                </svg>
                <div>
                  <p className="text-white text-sm font-medium group-hover:text-[#78BE20] transition-colors">WhatsApp us</p>
                  <p className="text-white/40 text-xs mt-0.5">{WHATSAPP_NUMBER}</p>
                </div>
                <svg className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[#78BE20]" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </a>
            </div>

            {/* Email */}
            <div>
              <p className="text-[11px] tracking-[0.3em] text-white/40 uppercase mb-4" style={{ fontFamily: "var(--font-ibm-mono)" }}>
                Email
              </p>
              <a
                href={`mailto:${EMAIL}`}
                className="flex items-center gap-4 group border border-white/10 px-6 py-5 hover:border-[#78BE20] transition-colors duration-200"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#78BE20] shrink-0">
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2 8l10 6 10-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <div>
                  <p className="text-white text-sm font-medium group-hover:text-[#78BE20] transition-colors">Send an email</p>
                  <p className="text-white/40 text-xs mt-0.5">{EMAIL}</p>
                </div>
                <svg className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[#78BE20]" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </a>
            </div>

            {/* What to expect */}
            <div className="border-t border-white/[0.06] pt-8">
              <p className="text-[11px] tracking-[0.3em] text-white/40 uppercase mb-5" style={{ fontFamily: "var(--font-ibm-mono)" }}>
                What happens next
              </p>
              <ol className="space-y-4">
                {[
                  "We review your enquiry within 24 hours.",
                  "We connect you directly with the right contact.",
                  "You get a personalised response — no auto-replies.",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="text-[#78BE20] text-[11px] font-mono mt-0.5 shrink-0">0{i + 1}</span>
                    <p className="text-white/55 text-sm leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Right — form */}
          <div>
            <p className="text-[11px] tracking-[0.3em] text-white/40 uppercase mb-8" style={{ fontFamily: "var(--font-ibm-mono)" }}>
              Or fill in the form
            </p>
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  );
}
