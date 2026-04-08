"use client";

import { useState, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  model: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.firstName.trim()) errors.firstName = "First name is required";
  if (!data.lastName.trim()) errors.lastName = "Last name is required";
  if (!data.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address";
  }
  return errors;
}

const MODELS = [
  { value: "experia",     label: "Experia — Electric Tourer" },
  { value: "esseesse9",  label: "EsseEsse9 — Naked Sport" },
  { value: "eva-ribelle",label: "Eva Ribelle — Street Fighter" },
  { value: "ego",        label: "Ego — Supersport" },
  { value: "general",    label: "General enquiry" },
];

const labelClass = "block text-[11px] tracking-[0.3em] text-white/50 uppercase mb-2";
const fieldClass = (err: boolean) =>
  cn(
    "w-full bg-white/[0.04] border text-white text-sm px-4 py-3 rounded-none outline-none transition-colors",
    err ? "border-[#E30613]" : "border-white/10 focus:border-[#78BE20]"
  );

export default function ContactForm() {
  const formRef   = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const [data, setData]       = useState<FormData>({ firstName: "", lastName: "", email: "", phone: "", model: "", message: "" });
  const [errors, setErrors]   = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  useGSAP(() => {
    if (!formRef.current) return;
    gsap.from(formRef.current.querySelectorAll(".field-row"), {
      y: 20, opacity: 0, duration: 0.5, stagger: 0.07, ease: "power2.out",
    });
  }, []);

  const update = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setData(d => ({ ...d, [key]: e.target.value }));
    if (errors[key]) setErrors(er => ({ ...er, [key]: undefined }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(data);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
      if (formRef.current && successRef.current) {
        gsap.to(formRef.current, { opacity: 0, y: -10, duration: 0.3, onComplete: () => {
          formRef.current!.style.display = "none";
          gsap.fromTo(successRef.current!, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 });
        }});
      }
    } catch {
      alert("Something went wrong. Please try again or email us directly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      {/* Success state */}
      <div ref={successRef} className="opacity-0 absolute inset-0 flex flex-col items-center justify-center text-center py-16 pointer-events-none">
        <div className="w-12 h-12 rounded-full border border-[#78BE20] flex items-center justify-center mx-auto mb-6">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10l4 4 8-8" stroke="#78BE20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="font-display text-2xl text-white uppercase tracking-wide mb-3">Message Received</p>
        <p className="text-sm text-white/55 max-w-xs mx-auto leading-relaxed">
          We&apos;ll be in touch within 24 hours and connect you with the right person.
        </p>
      </div>

      <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-5">
        {/* Name row */}
        <div className="field-row grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>First name *</label>
            <input type="text" value={data.firstName} onChange={update("firstName")} className={fieldClass(!!errors.firstName)} placeholder="Marco" />
            {errors.firstName && <p className="text-[#E30613] text-xs mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className={labelClass}>Last name *</label>
            <input type="text" value={data.lastName} onChange={update("lastName")} className={fieldClass(!!errors.lastName)} placeholder="Rossi" />
            {errors.lastName && <p className="text-[#E30613] text-xs mt-1">{errors.lastName}</p>}
          </div>
        </div>

        {/* Email */}
        <div className="field-row">
          <label className={labelClass}>Email *</label>
          <input type="email" value={data.email} onChange={update("email")} className={fieldClass(!!errors.email)} placeholder="marco@example.com" />
          {errors.email && <p className="text-[#E30613] text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div className="field-row">
          <label className={labelClass}>Phone</label>
          <input type="tel" value={data.phone} onChange={update("phone")} className={fieldClass(false)} placeholder="+39 02 000 0000" />
        </div>

        {/* Model */}
        <div className="field-row">
          <label className={labelClass}>Model of interest</label>
          <div className="relative">
            <select value={data.model} onChange={update("model")} className={cn(fieldClass(false), "appearance-none pr-10")}>
              <option value="">Select a model</option>
              {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="7" viewBox="0 0 12 7" fill="none">
              <path d="M1 1l5 5 5-5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Message */}
        <div className="field-row">
          <label className={labelClass}>Message</label>
          <textarea value={data.message} onChange={update("message")} rows={4} className={cn(fieldClass(false), "resize-none")} placeholder="Tell us what you're looking for..." />
        </div>

        <div className="field-row pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#78BE20] text-black text-[11px] tracking-[0.3em] uppercase font-medium py-4 hover:bg-white transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Enquiry"}
          </button>
        </div>
      </form>
    </div>
  );
}
