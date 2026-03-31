"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/* ─── Types ────────────────────────────────────────────── */
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  model: string;
  dealer: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

/* ─── Validation ────────────────────────────────────────── */
function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.firstName.trim()) errors.firstName = "First name is required";
  if (!data.lastName.trim()) errors.lastName = "Last name is required";
  if (!data.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address";
  }
  if (!data.phone.trim()) errors.phone = "Phone number is required";
  if (!data.model) errors.model = "Please select a model";
  if (!data.dealer) errors.dealer = "Please select a dealer";
  return errors;
}

/* ─── Static data ───────────────────────────────────────── */
const MODELS = [
  { value: "experia", label: "Experia — Electric Tourer" },
  { value: "esseesse9", label: "EsseEsse9 — Naked" },
  { value: "eva-ribelle", label: "Eva Ribelle — Sport" },
  { value: "ego", label: "Ego — Track-derived" },
];

const DEALERS = [
  { group: "North America", options: ["New York, USA", "Los Angeles, USA", "Miami, USA", "Toronto, Canada"] },
  { group: "Europe", options: ["Milano, Italy", "München, Germany", "Paris, France", "London, UK", "Madrid, Spain", "Amsterdam, Netherlands"] },
  { group: "Asia Pacific", options: ["Tokyo, Japan", "Sydney, Australia"] },
];

/* ─── Field wrapper ─────────────────────────────────────── */
function Field({
  label, error, required = false, children,
}: {
  label: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] uppercase tracking-[0.25em] text-white/65">
        {label}
        {required && <span className="text-[#78BE20] ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-[10px] text-[#78BE20] flex items-center gap-1.5">
          <span>↑</span> {error}
        </p>
      )}
    </div>
  );
}

/* ─── Input/Select shared class builder ─────────────────── */
function fieldClass(hasError: boolean) {
  return cn(
    "w-full bg-[#0f0f0f] border text-white px-4 py-3.5 text-sm transition-colors duration-200",
    "placeholder:text-white/15 focus:outline-none",
    hasError
      ? "border-[#78BE20]/60 focus:border-[#78BE20]"
      : "border-white/[0.08] focus:border-[#78BE20]/60 hover:border-white/20"
  );
}

/* ─── Success overlay ───────────────────────────────────── */
function SuccessView({ email, onReset }: { email: string; onReset: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from(".sv-circle", { scale: 0, opacity: 0, duration: 0.5, ease: "back.out(1.7)" })
      .from(".sv-check", {
        strokeDashoffset: 60, duration: 0.6, ease: "power2.out",
      }, "-=0.1")
      .from(".sv-text > *", { y: 24, opacity: 0, stagger: 0.1, duration: 0.6, ease: "power3.out" }, "-=0.2");
  }, { scope: ref });

  return (
    <div ref={ref} className="flex flex-col items-center justify-center min-h-[560px] text-center px-4">
      {/* Animated checkmark */}
      <div className="mb-8">
        <svg viewBox="0 0 80 80" className="w-20 h-20 mx-auto">
          <circle className="sv-circle" cx="40" cy="40" r="36" fill="none" stroke="#78BE20" strokeWidth="2" />
          <path
            className="sv-check"
            d="M 22 40 L 35 53 L 58 27"
            fill="none" stroke="white" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ strokeDasharray: 60, strokeDashoffset: 60 }}
          />
        </svg>
      </div>

      <div className="sv-text flex flex-col items-center gap-4">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#78BE20]/90">Request received</p>
        <h2 className="font-display text-white leading-none" style={{ fontSize: "clamp(36px, 5vw, 64px)" }}>
          You&rsquo;re all set.
        </h2>
        <p className="text-base text-white/60 max-w-sm leading-relaxed">
          We&rsquo;ll confirm your test ride appointment within 24 hours.
          Check your inbox at{" "}
          <span className="text-white/60">{email}</span>.
        </p>
        <p className="text-sm text-white/65 mt-2">
          Your nearest dealer will reach out directly to confirm the time and location.
        </p>
        <button
          onClick={onReset}
          className="mt-8 text-[10px] uppercase tracking-widest text-white/65 hover:text-white transition-colors duration-200 border border-white/20 hover:border-white/50 px-6 py-3"
        >
          Submit Another Request
        </button>
      </div>
    </div>
  );
}

/* ─── Main form component ───────────────────────────────── */
export default function TestRideForm() {
  const [data, setData] = useState<FormData>({
    firstName: "", lastName: "", email: "", phone: "",
    model: "", dealer: "", message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Animate x/y position only — no opacity changes so content is always visible
    gsap.from(".tr-left", { x: -40, duration: 1, ease: "power3.out", delay: 0.1 });
    gsap.from(".tr-field", { y: 24, stagger: 0.07, duration: 0.6, ease: "power3.out", delay: 0.05 });
  }, { scope: formRef });

  const update =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(data);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Scroll to first error
      const firstErrEl = document.querySelector<HTMLElement>("[data-error]");
      firstErrEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setLoading(true);
    // Simulate async submit (wire up to API later)
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  const reset = () => {
    setSubmitted(false);
    setData({ firstName: "", lastName: "", email: "", phone: "", model: "", dealer: "", message: "" });
    setErrors({});
  };

  return (
    <>
    {/* Mobile hero image — shown above form on mobile, hidden on lg+ */}
    <div className="relative h-[35vh] lg:hidden overflow-hidden">
      <Image
        src="/images/Pagina%20Experia/Experia_MM_0218.jpg"
        alt="Energica test ride"
        fill
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 to-transparent" />
    </div>
    <div ref={formRef} className="grid lg:grid-cols-2 min-h-screen">

      {/* ── LEFT: Brand image panel ──────────────────────── */}
      <div className="tr-left relative hidden lg:flex flex-col justify-end overflow-hidden bg-[#080808]">
        <Image
          src="/images/Pagina%20Experia/Experia_MM_0218.jpg"
          alt="Energica Experia test ride"
          fill
          priority
          className="object-cover object-center"
          sizes="50vw"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />

        {/* Bottom text */}
        <div className="relative z-10 p-10 pb-14">
          <p className="inline-flex items-center gap-3 mb-4">
            <span className="w-6 h-px bg-[#78BE20]" />
            <span className="text-[10px] uppercase tracking-[0.35em] text-white/65">Free · No Commitment</span>
          </p>
          <h2 className="font-display text-white leading-none mb-3" style={{ fontSize: "clamp(40px, 4vw, 64px)" }}>
            Feel the<br />
            <span className="text-[#78BE20]">difference.</span>
          </h2>
          <p className="text-sm text-white/60 max-w-xs leading-relaxed">
            Words can&rsquo;t describe what it feels like to ride an Energica.
            That&rsquo;s why we offer free test rides at all authorised dealers worldwide.
          </p>

          {/* Mini stats */}
          <div className="flex gap-6 mt-8">
            {[["Free", "No cost"], ["24h", "Confirmation"], ["200+", "Locations"]].map(([val, lbl]) => (
              <div key={lbl}>
                <p className="font-display text-xl text-white">{val}</p>
                <p className="text-[9px] uppercase tracking-widest text-white/65">{lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form panel ───────────────────────────── */}
      <div className="flex flex-col justify-center bg-[#0a0a0a] pt-8 pb-16 px-6 sm:px-8 md:px-12 lg:pt-28 lg:px-16">
        {submitted ? (
          <SuccessView email={data.email} onReset={reset} />
        ) : (
          <>
            <div className="tr-field mb-10">
              <p className="inline-flex items-center gap-3 mb-4">
                <span className="w-6 h-px bg-[#78BE20]" />
                <span className="text-[10px] uppercase tracking-[0.35em] text-white/60">Book a Test Ride</span>
              </p>
              <h1 className="font-display text-white leading-none" style={{ fontSize: "clamp(42px, 5vw, 80px)" }}>
                Request a<br />
                <span className="text-[#78BE20]">Test Ride</span>
              </h1>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 max-w-lg">
              {/* Name row */}
              <div className="tr-field grid md:grid-cols-2 gap-4">
                <Field label="First Name" required error={errors.firstName}>
                  <input
                    type="text" autoComplete="given-name"
                    className={fieldClass(!!errors.firstName)}
                    value={data.firstName} onChange={update("firstName")}
                    placeholder="Marco"
                    {...(errors.firstName ? { "data-error": true } : {})}
                  />
                </Field>
                <Field label="Last Name" required error={errors.lastName}>
                  <input
                    type="text" autoComplete="family-name"
                    className={fieldClass(!!errors.lastName)}
                    value={data.lastName} onChange={update("lastName")}
                    placeholder="Rossi"
                  />
                </Field>
              </div>

              {/* Contact row */}
              <div className="tr-field grid md:grid-cols-2 gap-4">
                <Field label="Email" required error={errors.email}>
                  <input
                    type="email" autoComplete="email"
                    className={fieldClass(!!errors.email)}
                    value={data.email} onChange={update("email")}
                    placeholder="marco@example.com"
                  />
                </Field>
                <Field label="Phone" required error={errors.phone}>
                  <input
                    type="tel" autoComplete="tel"
                    className={fieldClass(!!errors.phone)}
                    value={data.phone} onChange={update("phone")}
                    placeholder="+1 555 000 0000"
                  />
                </Field>
              </div>

              {/* Model */}
              <div className="tr-field">
                <Field label="Model of Interest" required error={errors.model}>
                  <div className="relative">
                    <select
                      className={cn(fieldClass(!!errors.model), "appearance-none pr-10")}
                      value={data.model} onChange={update("model")}
                    >
                      <option value="">Select a model</option>
                      {MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/65 pointer-events-none text-xs">▾</span>
                  </div>
                </Field>
              </div>

              {/* Dealer */}
              <div className="tr-field">
                <Field label="Preferred Dealer" required error={errors.dealer}>
                  <div className="relative">
                    <select
                      className={cn(fieldClass(!!errors.dealer), "appearance-none pr-10")}
                      value={data.dealer} onChange={update("dealer")}
                    >
                      <option value="">Select a dealer</option>
                      {DEALERS.map((grp) => (
                        <optgroup key={grp.group} label={grp.group}>
                          {grp.options.map((d) => <option key={d} value={d}>{d}</option>)}
                        </optgroup>
                      ))}
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/65 pointer-events-none text-xs">▾</span>
                  </div>
                </Field>
              </div>

              {/* Message */}
              <div className="tr-field">
                <Field label="Message (optional)">
                  <textarea
                    rows={4}
                    className={cn(fieldClass(false), "resize-none")}
                    value={data.message} onChange={update("message")}
                    placeholder="Riding experience, licence type, preferred date — anything useful..."
                  />
                </Field>
              </div>

              {/* Submit */}
              <div className="tr-field">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#78BE20] text-black font-display text-sm uppercase tracking-widest hover:bg-[#5a9018] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Request Test Ride →"
                  )}
                </button>
                <p className="text-[9px] uppercase tracking-widest text-white/60 text-center mt-3">
                  Free · No commitment · Response within 24 hours
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
    </>
  );
}
