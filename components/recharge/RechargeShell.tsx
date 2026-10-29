"use client";

import { useState, useRef, useEffect } from "react";
import Script from "next/script";
import { cn } from "@/lib/utils";

/* ─── Types ────────────────────────────────────────────── */
type Model = "ego" | "ribelle" | "ss9" | "experia" | "";
type Condition = "mint" | "good" | "acceptable" | "damaged" | "";
type YesNo = "yes" | "no" | null;

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | "dq";

interface Valuation {
  price: number;
  mileageBand: string;
  modelLabel: string;
  tier: "standard" | "repack";
}

const MODEL_OPTIONS: { value: Model; label: string }[] = [
  { value: "ego", label: "Ego / Ego+" },
  { value: "ribelle", label: "Eva Ribelle" },
  { value: "ss9", label: "EsseEsse9 / EsseEsse9+" },
  { value: "experia", label: "Experia" },
];

const YEAR_OPTIONS = Array.from({ length: 12 }, (_, i) => 2025 - i);

const PROCESS_STEPS = [
  {
    num: "01",
    name: "Fill the form",
    desc: "Six questions about your bike. No photos required at this stage.",
    time: "~90 seconds",
  },
  {
    num: "02",
    name: "Instant offer",
    desc: "Priced using Energica's official Valuation Tool. You see the number immediately.",
    time: "Real-time",
  },
  {
    num: "03",
    name: "We collect the bike",
    desc: "Transport from your address to our facility in Fiorano (MO). Collection is at our cost.",
    time: "Within 5 days",
  },
  {
    num: "04",
    name: "Evaluate and pay",
    desc: "Full inspection and diagnostic pull. Payment released the moment you accept.",
    time: "Same day as evaluation",
  },
];

const FAQS = [
  {
    q: "Is the offer binding?",
    a: "The instant number is indicative. It becomes final only after the bike is inspected at our facility. If what we find matches your declaration, the indicative price is the price you are paid. If it doesn't, we recalibrate and put a revised number to you. You are never obliged to accept it.",
  },
  {
    q: "Where does the inspection happen?",
    a: "On our premises. We collect the bike from the address you give us and transport it to 37 Via dell'Artigianato, 41042 Fiorano (MO), Italy. Intake inspection and the battery State-of-Health diagnostic are run there — not at the roadside. Collection is at our cost.",
  },
  {
    q: "What if the inspection changes the price?",
    a: "We tell you the revised number and why, with the diagnostic report attached. Accept it and payment is released the same day. Decline it and the bike goes back to your address at our cost, with nothing owed either way.",
  },
  {
    q: "Which bikes qualify?",
    a: "Model year 2019 or newer on the Ego, Eva Ribelle, and Experia platforms. Under 50,000 km — waived for bikes entering the Repack tier. No structural frame damage, flood damage, or salvage title history. All original safety equipment present: ABS module, traction-control unit, crash sensors.",
  },
  {
    q: "What if my battery is dead?",
    a: "We still buy it. Every state of health is accepted, including fully degraded and non-functional packs. Battery condition sets the refurbishment tier and the buyback price — not your eligibility. Dead packs enter the Repack tier and are replaced with a new or factory-reconditioned pack.",
  },
  {
    q: "How is the refurbishment tier decided?",
    a: "By battery State of Health measured at intake. Gold, at 85% or above, is a cosmetic refresh and firmware update. Silver, 70–84%, adds brake overhaul, suspension service, tyres, chain and sprocket, and cell balancing. Bronze, 50–69%, adds motor-controller service and partial module replacement. Below 50%, or dead, is Repack: full pack replacement with complete powertrain diagnostic and recalibration.",
  },
  {
    q: "Does my service history matter?",
    a: "It helps. A complete history with at least one annual service by an authorised dealer is preferred. It is not mandatory for Repack-tier bikes.",
  },
  {
    q: "When and how do I get paid?",
    a: "Bank transfer to the IBAN you provided, released once you accept the final price at evaluation. Italian AML rules require electronic transfer — we cannot pay in cash. Keys, charger, and registration documents must come with the bike at collection.",
  },
  {
    q: "Do you handle the registration transfer?",
    a: "Yes. You authorise us to file the PRA transfer when you sign at collection. Road tax and insurance move to us from that point. You do not need to visit any office.",
  },
  {
    q: "What if I have outstanding finance?",
    a: "We pay the lender directly to settle the loan and transfer the balance to you. The total equals the offer price. Provide the lender's name during the confirmation call.",
  },
  {
    q: "What happens to my bike afterwards?",
    a: "A 150-point technical inspection, battery State-of-Health diagnostic, mechanical and electrical reconditioning, cosmetic refresh, and firmware update at Modena. It is then certified and sold through an authorised Energica dealer with a 12-month / 15,000 km factory-backed warranty.",
  },
  {
    q: "What happens to my old battery pack?",
    a: "Packs pulled at Repack with residual capacity are routed to Energica's second-life energy-storage partnerships rather than scrapped. Each refurbished bike avoids roughly 2.8 tonnes CO₂e against a new manufacturing cycle.",
  },
  {
    q: "How long does the whole thing take?",
    a: "Enquiry to indicative offer: immediate. Offer to collection: within five days. Evaluation and payment follow at intake, and you are paid the day you accept the final number.",
  },
  {
    q: "Can I buy a ReCharge bike?",
    a: "Certified units are sold through the authorised Energica dealer network with a 12-month / 15,000 km factory warranty covering powertrain, battery pack, and electrical systems, a guaranteed minimum 78% State of Health at end of warranty, and a digital Battery Health Passport in the Energica app. Extended plans — ReCharge Care and ReCharge Care+ — are available at point of sale.",
  },
];

function fmtEUR(n: number) {
  return `€${Math.round(n).toLocaleString("en-US")}`;
}

export default function RechargeShell() {
  const [step, setStep] = useState<Step>(1);
  const [dqReason, setDqReason] = useState<"answers" | "coverage">("answers");

  // Step 1
  const [model, setModel] = useState<Model>("");
  const [year, setYear] = useState<number | "">("");
  const [mileage, setMileage] = useState("");

  // Step 2
  const [condition, setCondition] = useState<Condition>("");
  const [battery, setBattery] = useState<YesNo>(null);
  const [accident, setAccident] = useState<YesNo>(null);
  const [modified, setModified] = useState<YesNo>(null);

  const [valuation, setValuation] = useState<Valuation | null>(null);
  const [calcMsg, setCalcMsg] = useState("Pulling valuation data");

  // Step 5
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [collectionAddress, setCollectionAddress] = useState("");
  const [honeypot, setHoneypot] = useState("");

  // Email verification
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifiedToken, setVerifiedToken] = useState("");
  const [codeToken, setCodeToken] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [sendingCode, setSendingCode] = useState(false);

  // Step 6
  const [iban, setIban] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [ref, setRef] = useState("");
  const turnstileToken = useRef("");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  function flash(field: string) {
    setErrors((e) => ({ ...e, [field]: true }));
    setTimeout(() => setErrors((e) => ({ ...e, [field]: false })), 1800);
  }

  function validateStep1() {
    if (!model) return flash("model"), false;
    if (!year) return flash("year"), false;
    const m = Number(mileage);
    if (!mileage || m < 0 || m > 500000) return flash("mileage"), false;
    return true;
  }

  function validateStep2() {
    if (!condition) return flash("condition"), false;
    if (!battery) return flash("battery"), false;
    if (!accident) return flash("accident"), false;
    if (!modified) return flash("modified"), false;
    return true;
  }

  function validateStep5() {
    if (!fullName.trim()) return flash("fullName"), false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return flash("email"), false;
    if (phone.trim().length < 7) return flash("phone"), false;
    if (collectionAddress.trim().length < 6) return flash("collectionAddress"), false;
    if (!emailVerified) return flash("verify"), false;
    return true;
  }

  function validateStep6() {
    const cleaned = iban.replace(/\s/g, "").toUpperCase();
    if (cleaned.length < 15 || !/^[A-Z]{2}\d{2}/.test(cleaned)) return flash("iban"), false;
    if (!accountHolder.trim()) return flash("accountHolder"), false;
    return true;
  }

  async function runCalculation() {
    setStep(3);
    const messages = [
      "Pulling valuation data",
      "Cross-checking VIN registry",
      "Modelling Standard / Repack tier",
      "Composing offer",
    ];
    let i = 0;
    setCalcMsg(messages[0]);
    const iv = setInterval(() => {
      i++;
      if (i < messages.length) setCalcMsg(messages[i]);
    }, 700);

    try {
      const res = await fetch("/api/recharge-valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          year,
          mileageKm: Number(mileage),
          condition,
          batteryOk: battery === "yes",
          accident: accident === "yes",
          modified: modified === "yes",
        }),
      });
      const data = await res.json();
      clearInterval(iv);

      setTimeout(() => {
        if (!res.ok || data.disqualified || !data.price) {
          setDqReason(data.error === "No coverage for this model/year" ? "coverage" : "answers");
          setStep("dq");
          return;
        }
        setValuation({
          price: data.price,
          mileageBand: data.mileageBand,
          modelLabel: data.modelLabel,
          tier: data.tier,
        });
        setStep(4);
      }, 1400);
    } catch {
      clearInterval(iv);
      setDqReason("answers");
      setStep("dq");
    }
  }

  async function sendCode() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return flash("email");
    setSendingCode(true);
    setCodeError("");
    try {
      const res = await fetch("/api/recharge-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, honeypot }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");
      setCodeToken(data.token);
      setCodeSent(true);
    } catch (e) {
      setCodeError(e instanceof Error ? e.message : "Failed to send code");
    } finally {
      setSendingCode(false);
    }
  }

  async function confirmCode() {
    setCodeError("");
    try {
      const res = await fetch("/api/recharge-verify/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, token: codeToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");
      setVerifiedToken(data.verifiedToken);
      setEmailVerified(true);
    } catch (e) {
      setCodeError(e instanceof Error ? e.message : "Invalid code");
    }
  }

  async function submitLead() {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/recharge-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model, year, mileageKm: Number(mileage), condition,
          batteryOk: battery === "yes",
          fullName, email, phone, collectionAddress,
          iban: iban.replace(/\s/g, "").toUpperCase(), accountHolder,
          verifiedToken, turnstileToken: turnstileToken.current, honeypot,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      setRef(data.ref);
      setStep(7);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function restart() {
    setStep(1);
    setBattery(null); setAccident(null); setModified(null); setCondition("");
    setValuation(null);
  }

  const totalSteps = 6;
  const progressPct = typeof step === "number" ? Math.min((step / totalSteps) * 100, 100) : 100;
  const progressLabel =
    step === 7 ? "Complete" : step === "dq" ? "Specialist review" : `Step ${Math.min(Number(step), totalSteps)} of ${totalSteps}`;

  const inputClass = (hasError: boolean) =>
    cn(
      "w-full bg-white/[0.03] border text-white px-4 py-3.5 text-sm transition-colors duration-150 rounded",
      "placeholder:text-white/25 focus:outline-none",
      hasError ? "border-[#78BE20]/70 shadow-[0_0_0_3px_rgba(120,190,32,0.1)]" : "border-white/[0.13] focus:border-[#78BE20]/60 hover:border-white/25"
    );

  return (
    <div className="bg-[#0d0d0d] text-[#f0f0ee] font-[var(--font-ibm-sans)]">
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />

      {/* HERO */}
      <header className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-14 sm:pb-20 border-b border-white/[0.07]">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/[0.13] rounded-sm font-[var(--font-ibm-mono)] text-[11px] tracking-[0.14em] uppercase text-white/40 mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-[#78BE20]" />
          Energica ReCharge — Certified Pre-Owned Programme
        </div>
        <h1 className="font-[var(--font-barlow)] font-bold uppercase leading-[0.96] tracking-tight text-[44px] sm:text-[64px] lg:text-[88px] max-w-[14ch] mb-8">
          Sell your<br />
          <span className="text-[#78BE20]">Energica.</span><br />
          Paid in days.
        </h1>
        <p className="max-w-[54ch] text-[17px] text-white/55 leading-relaxed font-light mb-11">
          The first factory-backed buyback for electric motorcycles. Six questions about your bike, an instant
          indicative offer. We collect the bike, inspect it at our Fiorano facility, and pay you on agreement.
        </p>
        <a
          href="#offer"
          className="btn-primary inline-flex items-center gap-2.5 font-[var(--font-barlow)] font-semibold text-[13px] tracking-[0.08em] uppercase px-6 py-4 rounded-sm"
        >
          Get your offer
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
        </a>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0 max-w-[640px] mt-16 pt-10 border-t border-white/[0.07]">
          <div className="sm:pr-8 sm:border-r border-white/[0.07] pb-6 sm:pb-0 border-b sm:border-b-0 border-white/[0.07]">
            <div className="font-[var(--font-barlow)] font-semibold text-[32px] sm:text-[40px] leading-none">~<span className="text-[#78BE20]">90</span>s</div>
            <div className="mt-2 font-[var(--font-ibm-mono)] text-[11px] uppercase tracking-[0.08em] text-white/40">To your indicative offer</div>
          </div>
          <div className="sm:px-8 sm:border-r border-white/[0.07] pb-6 sm:pb-0 border-b sm:border-b-0 border-white/[0.07]">
            <div className="font-[var(--font-barlow)] font-semibold text-[32px] sm:text-[40px] leading-none"><span className="text-[#78BE20]">Same</span> day</div>
            <div className="mt-2 font-[var(--font-ibm-mono)] text-[11px] uppercase tracking-[0.08em] text-white/40">Evaluation to payment</div>
          </div>
          <div className="sm:pl-8">
            <div className="font-[var(--font-barlow)] font-semibold text-[32px] sm:text-[40px] leading-none"><span className="text-[#78BE20]">€0</span></div>
            <div className="mt-2 font-[var(--font-ibm-mono)] text-[11px] uppercase tracking-[0.08em] text-white/40">Cost to you</div>
          </div>
        </div>
      </header>

      {/* PROCESS */}
      <section className="bg-[#141414] border-b border-white/[0.07] py-14 sm:py-18 px-5 sm:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="font-[var(--font-ibm-mono)] text-[11px] tracking-[0.16em] uppercase text-[#78BE20] mb-3">— How it works</div>
          <h2 className="font-[var(--font-barlow)] font-bold uppercase text-[28px] sm:text-[44px] leading-none mb-12">Four steps.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-white/[0.07] rounded-lg overflow-hidden">
            {PROCESS_STEPS.map((s, i) => (
              <div key={s.num} className={cn("p-7 hover:bg-[#1a1a1a] transition-colors", i < 3 && "lg:border-r border-white/[0.07]", i % 2 === 0 && "sm:border-r lg:border-r border-white/[0.07]", i >= 1 && "border-t sm:border-t-0 lg:border-t-0 border-white/[0.07]", i >= 2 && "sm:border-t lg:border-t-0 border-white/[0.07]")}>
                <div className="font-[var(--font-ibm-mono)] text-[11px] text-white/40 mb-5">{s.num}</div>
                <div className="font-[var(--font-barlow)] font-semibold text-[18px] uppercase tracking-wide mb-2.5">{s.name}</div>
                <div className="text-[13px] text-white/55 leading-relaxed">{s.desc}</div>
                <div className="mt-5 font-[var(--font-ibm-mono)] text-[11px] text-[#78BE20] uppercase tracking-[0.08em]">{s.time}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section id="offer" className="py-16 sm:py-24 px-5 sm:px-8">
        <div className="max-w-[680px] mx-auto">
          <div className="font-[var(--font-ibm-mono)] text-[11px] tracking-[0.16em] uppercase text-[#78BE20] mb-3">— Valuation</div>
          <h2 className="font-[var(--font-barlow)] font-bold uppercase text-[28px] sm:text-[44px] leading-none mb-10">Get your offer.</h2>

          <div ref={cardRef} className="bg-[#1a1a1a] border border-white/[0.13] rounded-xl overflow-hidden scroll-mt-6">
            {/* Progress */}
            <div className="px-6 sm:px-7 py-4.5 border-b border-white/[0.07] flex items-center gap-4">
              <div className="flex-1 h-0.5 bg-white/[0.06] rounded overflow-hidden">
                <div className="h-full bg-[#78BE20] transition-all duration-400" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="font-[var(--font-ibm-mono)] text-[11px] tracking-[0.12em] uppercase text-white/40 whitespace-nowrap">{progressLabel}</div>
            </div>

            {/* STEP 1 */}
            {step === 1 && (
              <div className="p-7 sm:p-9">
                <div className="font-[var(--font-ibm-mono)] text-[11px] tracking-[0.16em] uppercase text-[#78BE20] mb-3">— Bike details</div>
                <h2 className="font-[var(--font-barlow)] font-bold uppercase text-[24px] sm:text-[32px] leading-tight mb-2.5">
                  Which <span className="text-[#78BE20]">Energica</span> are you selling?
                </h2>
                <p className="text-[14px] text-white/55 leading-relaxed mb-8 max-w-[52ch] font-light">
                  Model, year, and mileage. We cross-check the VIN when the bike reaches our facility — no paperwork needed now.
                </p>

                <div className="mb-4">
                  <label className="block font-[var(--font-ibm-mono)] text-[11px] uppercase tracking-[0.12em] text-white/55 mb-2">Model</label>
                  <select className={inputClass(!!errors.model)} value={model} onChange={(e) => setModel(e.target.value as Model)}>
                    <option value="">Select model</option>
                    {MODEL_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-[var(--font-ibm-mono)] text-[11px] uppercase tracking-[0.12em] text-white/55 mb-2">Year</label>
                    <select className={inputClass(!!errors.year)} value={year} onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")}>
                      <option value="">Select year</option>
                      {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-[var(--font-ibm-mono)] text-[11px] uppercase tracking-[0.12em] text-white/55 mb-2">Mileage (km)</label>
                    <input type="number" inputMode="numeric" min={0} max={500000} className={inputClass(!!errors.mileage)} placeholder="e.g. 12500" value={mileage} onChange={(e) => setMileage(e.target.value)} />
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    className="btn-primary w-full inline-flex items-center justify-center gap-2.5 font-[var(--font-barlow)] font-semibold text-[13px] tracking-[0.08em] uppercase px-6 py-4 rounded-sm"
                    onClick={() => validateStep1() && setStep(2)}
                  >
                    Continue
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="p-7 sm:p-9">
                <div className="font-[var(--font-ibm-mono)] text-[11px] tracking-[0.16em] uppercase text-[#78BE20] mb-3">— Condition</div>
                <h2 className="font-[var(--font-barlow)] font-bold uppercase text-[24px] sm:text-[32px] leading-tight mb-2.5">
                  Three <span className="text-[#78BE20]">honest</span> answers.
                </h2>
                <p className="text-[14px] text-white/55 leading-relaxed mb-8 max-w-[52ch] font-light">
                  These drive the offer. An accurate declaration now keeps the offer firm at intake.
                </p>

                <div className="mb-5">
                  <label className="block font-[var(--font-ibm-mono)] text-[11px] uppercase tracking-[0.12em] text-white/55 mb-2">Overall condition</label>
                  <select className={inputClass(!!errors.condition)} value={condition} onChange={(e) => setCondition(e.target.value as Condition)}>
                    <option value="">Select grade</option>
                    <option value="mint">Mint — as-new, full service history</option>
                    <option value="good">Good — light use marks</option>
                    <option value="acceptable">Acceptable — visible wear</option>
                    <option value="damaged">Damaged — components to replace</option>
                  </select>
                </div>

                <ToggleQuestion
                  question="Does the battery charge and work?"
                  hint={'"No" means Repack tier — we still buy it.'}
                  value={battery}
                  onChange={setBattery}
                  yesIsGood
                  error={!!errors.battery}
                />
                <ToggleQuestion
                  question="Has the frame been crashed, cracked, welded, or repaired?"
                  hint="Standstill drops don't count if the frame is intact."
                  value={accident}
                  onChange={setAccident}
                  yesIsGood={false}
                  warning="Frame damage disqualifies the bike from this programme."
                  error={!!errors.accident}
                />
                <ToggleQuestion
                  question="Any modifications to battery, motor, ECU, or charging system?"
                  hint="Bar-ends, mirrors, and cosmetic parts are fine."
                  value={modified}
                  onChange={setModified}
                  yesIsGood={false}
                  warning="Powertrain modifications disqualify the bike."
                  error={!!errors.modified}
                />

                <div className="mt-8 flex gap-2.5">
                  <button type="button" className="border border-white/[0.13] text-white/60 hover:text-white hover:border-white/30 font-[var(--font-barlow)] font-semibold text-[13px] tracking-[0.08em] uppercase px-5 py-4 rounded-sm transition-colors" onClick={() => setStep(1)}>Back</button>
                  <button
                    type="button"
                    className="btn-primary flex-1 inline-flex items-center justify-center gap-2.5 font-[var(--font-barlow)] font-semibold text-[13px] tracking-[0.08em] uppercase px-6 py-4 rounded-sm"
                    onClick={() => {
                      if (!validateStep2()) return;
                      if (accident === "yes" || modified === "yes") { setDqReason("answers"); setStep("dq"); return; }
                      runCalculation();
                    }}
                  >
                    Get my offer
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 — calculating */}
            {step === 3 && (
              <div className="text-center py-18 px-9">
                <div className="w-10 h-10 mx-auto mb-7 border border-white/[0.13] border-t-[#78BE20] rounded-full animate-spin" />
                <div className="font-[var(--font-ibm-mono)] text-[13px] tracking-[0.08em] uppercase text-white/55">{calcMsg}</div>
              </div>
            )}

            {/* STEP 4 — offer reveal */}
            {step === 4 && valuation && (
              <div className="text-center py-12 px-7 sm:px-9">
                <div className="font-[var(--font-ibm-mono)] text-[11px] tracking-[0.18em] uppercase text-[#78BE20] mb-5">
                  — Indicative offer · {valuation.tier === "standard" ? "Standard" : "Repack"} tier
                </div>
                <div className="font-[var(--font-barlow)] font-bold text-[56px] sm:text-[88px] leading-[0.95] tracking-tight my-2">
                  <span className="text-[0.42em] font-semibold text-[#78BE20] align-top mr-1">€</span>
                  {valuation.price.toLocaleString("en-US")}
                </div>
                <div className="text-[13px] text-white/40 font-light mb-9">Final price confirmed after inspection at our Fiorano facility.</div>

                <div className="bg-white/[0.02] border border-white/[0.07] rounded-sm p-5 sm:p-6 text-left mb-7">
                  <Row label="Bike" value={`${year} ${valuation.modelLabel}`} />
                  <Row label="Mileage" value={`${Number(mileage).toLocaleString("en-US")} km · band ${valuation.mileageBand}`} />
                  <Row label="Condition grade" value={condition} />
                  <Row label="Battery tier" value={valuation.tier === "standard" ? "Standard" : "Repack"} />
                  <div className="flex justify-between pt-3 text-[14px] font-medium">
                    <span>Indicative offer</span>
                    <span className="font-[var(--font-ibm-mono)]">{fmtEUR(valuation.price)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <button type="button" className="btn-primary inline-flex items-center justify-center gap-2.5 font-[var(--font-barlow)] font-semibold text-[13px] tracking-[0.08em] uppercase px-6 py-4 rounded-sm" onClick={() => setStep(5)}>
                    Accept &amp; continue
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                  </button>
                  <button type="button" className="text-white/40 hover:text-white/70 text-[13px] font-[var(--font-barlow)] uppercase tracking-[0.08em] py-2" onClick={restart}>Recalculate</button>
                </div>
                <div className="font-[var(--font-ibm-mono)] text-[11px] text-white/30 mt-5">Quote valid 14 days · No obligation to accept</div>
              </div>
            )}

            {/* STEP 5 — contact + verify */}
            {step === 5 && (
              <div className="p-7 sm:p-9">
                <div className="font-[var(--font-ibm-mono)] text-[11px] tracking-[0.16em] uppercase text-[#78BE20] mb-3">— Lock it in</div>
                <h2 className="font-[var(--font-barlow)] font-bold uppercase text-[24px] sm:text-[32px] leading-tight mb-2.5">
                  Where do we <span className="text-[#78BE20]">reach you</span>?
                </h2>
                <p className="text-[14px] text-white/55 leading-relaxed mb-8 max-w-[52ch] font-light">
                  We verify your email, then book a collection slot at the address you give us.
                </p>

                {/* honeypot — hidden from real users */}
                <input type="text" name="company" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" />

                <div className="mb-4">
                  <label className="block font-[var(--font-ibm-mono)] text-[11px] uppercase tracking-[0.12em] text-white/55 mb-2">Full name</label>
                  <input type="text" className={inputClass(!!errors.fullName)} placeholder="As on your ID" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block font-[var(--font-ibm-mono)] text-[11px] uppercase tracking-[0.12em] text-white/55 mb-2">Email</label>
                    <div className="flex gap-2">
                      <input type="email" className={inputClass(!!errors.email)} placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setEmailVerified(false); setCodeSent(false); }} disabled={emailVerified} />
                    </div>
                  </div>
                  <div>
                    <label className="block font-[var(--font-ibm-mono)] text-[11px] uppercase tracking-[0.12em] text-white/55 mb-2">Phone</label>
                    <input type="tel" className={inputClass(!!errors.phone)} placeholder="+39 …" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>

                {/* Email verification block */}
                <div className={cn("mb-5 rounded-sm border p-4", emailVerified ? "border-[#78BE20]/30 bg-[#78BE20]/[0.06]" : errors.verify ? "border-[#78BE20]/70" : "border-white/[0.13] bg-white/[0.02]")}>
                  {emailVerified ? (
                    <div className="flex items-center gap-2 text-[13px] text-[#78BE20]">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                      Email verified
                    </div>
                  ) : !codeSent ? (
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <span className="text-[13px] text-white/55">Verify your email to prevent spam submissions.</span>
                      <button type="button" disabled={sendingCode} className="font-[var(--font-barlow)] font-semibold text-[12px] uppercase tracking-[0.08em] border border-[#78BE20]/40 text-[#78BE20] hover:bg-[#78BE20]/10 px-4 py-2 rounded-sm disabled:opacity-50" onClick={sendCode}>
                        {sendingCode ? "Sending…" : "Send code"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <input type="text" inputMode="numeric" maxLength={6} placeholder="6-digit code" className="bg-white/[0.03] border border-white/[0.13] rounded px-3 py-2 text-sm w-32 font-[var(--font-ibm-mono)] tracking-widest" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
                      <button type="button" className="btn-primary font-[var(--font-barlow)] font-semibold text-[12px] uppercase tracking-[0.08em] px-4 py-2 rounded-sm" onClick={confirmCode}>Verify</button>
                      <button type="button" className="text-[12px] text-white/40 hover:text-white/70" onClick={sendCode} disabled={sendingCode}>Resend</button>
                      {codeError && <span className="text-[12px] text-[#78BE20] w-full">{codeError}</span>}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block font-[var(--font-ibm-mono)] text-[11px] uppercase tracking-[0.12em] text-white/55 mb-2">Collection address</label>
                  <input type="text" className={inputClass(!!errors.collectionAddress)} placeholder="Street and number, postcode, city" value={collectionAddress} onChange={(e) => setCollectionAddress(e.target.value)} />
                  <a
                    href={collectionAddress.trim() ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(collectionAddress.trim())}` : undefined}
                    target="_blank"
                    rel="noopener"
                    className={cn(
                      "inline-flex items-center gap-1.5 mt-2.5 font-[var(--font-ibm-mono)] text-[11px] uppercase tracking-[0.04em] text-[#78BE20] border-b border-transparent hover:border-[#78BE20] transition-colors",
                      !collectionAddress.trim() && "pointer-events-none opacity-40"
                    )}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    Verify this address on Google Maps
                  </a>
                </div>

                <div className="mb-2 rounded-sm border border-white/[0.07] bg-[#141414] p-4">
                  <div className="font-[var(--font-ibm-mono)] text-[10px] uppercase tracking-[0.14em] text-white/40 mb-1.5">Where the bike goes</div>
                  <div className="font-[var(--font-barlow)] text-[15px] font-medium">Energica ReCharge · 37 Via dell'Artigianato, 41042 Fiorano (MO), Italy</div>
                  <div className="mt-3.5 rounded-sm overflow-hidden border border-white/[0.13]">
                    <iframe
                      className="block w-full h-[180px] sm:h-[220px] border-0"
                      style={{ filter: "invert(90%) hue-rotate(180deg) contrast(88%) saturate(70%)" }}
                      src="https://www.google.com/maps?q=37+Via+dell%27Artigianato,+41042+Fiorano+Modenese+MO,+Italy&output=embed"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Energica ReCharge facility, Fiorano (MO)"
                    />
                  </div>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=37+Via+dell%27Artigianato,+41042+Fiorano+Modenese+MO,+Italy"
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1.5 mt-3 font-[var(--font-ibm-mono)] text-[11px] uppercase tracking-[0.04em] text-[#78BE20] border-b border-transparent hover:border-[#78BE20] transition-colors"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    Open in Google Maps
                  </a>
                  <p className="mt-3 text-[13px] text-white/50 leading-relaxed">We collect from your address and transport the bike here. Inspection happens on our premises — not at the roadside.</p>
                </div>

                <div className="mt-8 flex gap-2.5">
                  <button type="button" className="border border-white/[0.13] text-white/60 hover:text-white hover:border-white/30 font-[var(--font-barlow)] font-semibold text-[13px] tracking-[0.08em] uppercase px-5 py-4 rounded-sm transition-colors" onClick={() => setStep(4)}>Back</button>
                  <button
                    type="button"
                    className="btn-primary flex-1 inline-flex items-center justify-center gap-2.5 font-[var(--font-barlow)] font-semibold text-[13px] tracking-[0.08em] uppercase px-6 py-4 rounded-sm"
                    onClick={() => validateStep5() && setStep(6)}
                  >
                    Continue
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6 — IBAN */}
            {step === 6 && (
              <div className="p-7 sm:p-9">
                <div className="font-[var(--font-ibm-mono)] text-[11px] tracking-[0.16em] uppercase text-[#78BE20] mb-3">— Payment</div>
                <h2 className="font-[var(--font-barlow)] font-bold uppercase text-[24px] sm:text-[32px] leading-tight mb-2.5">
                  Where does the <span className="text-[#78BE20]">transfer</span> land?
                </h2>
                <p className="text-[14px] text-white/55 leading-relaxed mb-8 max-w-[52ch] font-light">
                  Payment is released to this account once you accept the final price at evaluation.
                </p>

                <div className="mb-4">
                  <label className="block font-[var(--font-ibm-mono)] text-[11px] uppercase tracking-[0.12em] text-white/55 mb-2">IBAN</label>
                  <input type="text" className={cn(inputClass(!!errors.iban), "font-[var(--font-ibm-mono)] tracking-wider uppercase")} placeholder="IT60 X054 2811 1010 0000 0123 456" maxLength={34} value={iban} onChange={(e) => setIban(e.target.value)} />
                </div>
                <div className="mb-6">
                  <label className="block font-[var(--font-ibm-mono)] text-[11px] uppercase tracking-[0.12em] text-white/55 mb-2">Account holder name</label>
                  <input type="text" className={inputClass(!!errors.accountHolder)} placeholder="Must match the seller" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} />
                </div>

                <div className="flex items-start gap-3 p-4 bg-[#78BE20]/[0.08] border border-[#78BE20]/25 rounded-sm text-[13px] text-white/55 leading-relaxed mb-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#78BE20] shrink-0 mt-0.5"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                  Your IBAN is used only to release payment once you accept the final price. Italian AML rules require electronic transfer — we cannot pay in cash.
                </div>

                <div className="my-5 flex justify-center">
                  {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
                    <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} data-callback="onRechargeTurnstile" />
                  ) : null}
                </div>
                <Script id="recharge-turnstile-cb" strategy="lazyOnload">
                  {`window.onRechargeTurnstile = function(token){ window.__rechargeTurnstileToken = token; };`}
                </Script>

                {submitError && <div className="text-[13px] text-[#78BE20] mb-4">{submitError}</div>}

                <div className="mt-2 flex gap-2.5">
                  <button type="button" className="border border-white/[0.13] text-white/60 hover:text-white hover:border-white/30 font-[var(--font-barlow)] font-semibold text-[13px] tracking-[0.08em] uppercase px-5 py-4 rounded-sm transition-colors" onClick={() => setStep(5)}>Back</button>
                  <button
                    type="button"
                    disabled={submitting}
                    className="btn-primary flex-1 inline-flex items-center justify-center gap-2.5 font-[var(--font-barlow)] font-semibold text-[13px] tracking-[0.08em] uppercase px-6 py-4 rounded-sm"
                    onClick={() => {
                      if (!validateStep6()) return;
                      turnstileToken.current = (typeof window !== "undefined" && (window as unknown as { __rechargeTurnstileToken?: string }).__rechargeTurnstileToken) || "";
                      submitLead();
                    }}
                  >
                    {submitting ? "Submitting…" : "Confirm offer"}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 7 — confirmation */}
            {step === 7 && (
              <div className="text-center py-12 px-7 sm:px-9">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#78BE20] grid place-items-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div className="font-[var(--font-ibm-mono)] text-[11px] tracking-[0.16em] uppercase text-[#78BE20] mb-3">— Confirmed</div>
                <h2 className="font-[var(--font-barlow)] font-bold uppercase text-[24px] sm:text-[32px] leading-tight mb-3">
                  Offer locked.<br /><span className="text-[#78BE20]">Ref: {ref}</span>
                </h2>
                <p className="text-[14px] text-white/55 mb-8 max-w-[52ch] mx-auto">
                  Confirmation sent to <strong className="text-white font-medium">{email}</strong>. What happens next:
                </p>
                <div className="text-left border border-white/[0.07] rounded-sm overflow-hidden">
                  <NextStep num={1} title="Within 60 minutes" text="Formal offer letter and collection slot options sent by email." />
                  <NextStep num={2} title="Within 5 days" text="We collect the bike from your address and transport it to Fiorano. No cost to you." />
                  <NextStep num={3} title="At evaluation" text="Full inspection on our premises. Payment released the same day you accept." />
                </div>
                <TrustRow className="mt-7 pt-5 border-t border-white/[0.07]" />
              </div>
            )}

            {/* DISQUALIFIED */}
            {step === "dq" && (
              <div className="text-center py-14 px-7 sm:px-9">
                <div className="w-13 h-13 mx-auto mb-6 rounded-full bg-[#d4931a]/10 border border-[#d4931a]/25 grid place-items-center font-[var(--font-barlow)] font-bold text-[22px] text-[#d4931a]">!</div>
                <div className="font-[var(--font-ibm-mono)] text-[11px] tracking-[0.16em] uppercase text-[#78BE20] mb-3">— Outside automated programme</div>
                <h2 className="font-[var(--font-barlow)] font-bold uppercase text-[24px] sm:text-[32px] leading-tight mb-3">Needs a specialist review.</h2>
                <p className="text-[14px] text-white/55 max-w-[46ch] mx-auto mb-8 leading-relaxed">
                  {dqReason === "coverage"
                    ? "That model and year sit outside the automated valuation table. A specialist values these directly."
                    : "Frame damage, powertrain modifications, and certain salvage histories require human assessment — that doesn't always mean a hard no."}
                </p>
                <div className="flex flex-col gap-2.5 max-w-[260px] mx-auto">
                  <button type="button" className="btn-primary font-[var(--font-barlow)] font-semibold text-[13px] tracking-[0.08em] uppercase px-6 py-4 rounded-sm" onClick={() => setStep(5)}>Speak to a specialist</button>
                  <button type="button" className="border border-white/[0.13] text-white/60 hover:text-white font-[var(--font-barlow)] font-semibold text-[13px] tracking-[0.08em] uppercase px-6 py-4 rounded-sm transition-colors" onClick={restart}>Start over</button>
                </div>
              </div>
            )}
          </div>

          <TrustRow className="mt-6" />
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#141414] border-y border-white/[0.07] py-16 sm:py-24 px-5 sm:px-8">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-9 lg:gap-16">
          <div>
            <div className="font-[var(--font-ibm-mono)] text-[11px] tracking-[0.16em] uppercase text-[#78BE20] mb-3">— Questions</div>
            <h2 className="font-[var(--font-barlow)] font-bold uppercase text-[28px] sm:text-[44px] leading-none">FAQ.</h2>
          </div>
          <div>
            {FAQS.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 text-[13px] border-b border-white/[0.07] text-white/55 font-light">
      <span>{label}</span>
      <span className="font-[var(--font-ibm-mono)] text-white/70">{value}</span>
    </div>
  );
}

function NextStep({ num, title, text }: { num: number; title: string; text: string }) {
  return (
    <div className="flex gap-4 p-5 border-b border-white/[0.07] last:border-b-0">
      <div className="shrink-0 w-6.5 h-6.5 rounded-full bg-[#78BE20]/10 text-[#78BE20] grid place-items-center font-[var(--font-ibm-mono)] text-[11px]">{num}</div>
      <div className="text-[13px] leading-relaxed font-light">
        <strong className="text-white font-medium block">{title}</strong>
        <span className="text-white/50">{text}</span>
      </div>
    </div>
  );
}

function TrustRow({ className }: { className?: string }) {
  const items = ["All battery conditions accepted", "Collection at our cost", "No obligation to accept"];
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-6 font-[var(--font-ibm-mono)] text-[11px] tracking-[0.08em] uppercase text-white/40", className)}>
      {items.map((t) => (
        <div key={t} className="flex items-center gap-2">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#78BE20" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          {t}
        </div>
      ))}
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.07] first:border-t">
      <button type="button" className="flex justify-between items-center w-full py-5 text-[14px] text-left text-white/55 hover:text-white transition-colors gap-4" onClick={() => setOpen((o) => !o)}>
        {q}
        <span className={cn("shrink-0 transition-transform", open && "rotate-45")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#78BE20" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
        </span>
      </button>
      {open && <div className="pb-5 text-[13px] text-white/45 leading-relaxed max-w-[58ch] font-light">{a}</div>}
    </div>
  );
}

function ToggleQuestion({
  question, hint, value, onChange, yesIsGood, warning, error,
}: {
  question: string; hint: string; value: YesNo; onChange: (v: YesNo) => void;
  yesIsGood: boolean; warning?: string; error?: boolean;
}) {
  const showWarning = warning && ((yesIsGood && value === "no") || (!yesIsGood && value === "yes"));
  return (
    <div className={cn("bg-white/[0.02] border rounded-sm p-4.5 mb-3 transition-colors", showWarning ? "border-[#78BE20]/35" : error ? "border-[#78BE20]/70" : "border-white/[0.07]")}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="text-[14px] flex-1 min-w-[200px]">
          {question}
          <span className="block text-[12px] font-light text-white/35 mt-0.5">{hint}</span>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onChange("yes")}
            className={cn(
              "px-5 py-2 rounded-sm border font-[var(--font-ibm-mono)] text-[12px] font-medium uppercase tracking-[0.08em] transition-colors min-h-11 min-w-14",
              value === "yes"
                ? yesIsGood ? "bg-[#78BE20] text-black border-[#78BE20]" : "bg-[#78BE20] text-black border-[#78BE20]"
                : "text-white/55 border-white/[0.13] hover:text-white hover:border-white/30"
            )}
          >Yes</button>
          <button
            type="button"
            onClick={() => onChange("no")}
            className={cn(
              "px-5 py-2 rounded-sm border font-[var(--font-ibm-mono)] text-[12px] font-medium uppercase tracking-[0.08em] transition-colors min-h-11 min-w-14",
              value === "no" ? "bg-[#78BE20] text-black border-[#78BE20]" : "text-white/55 border-white/[0.13] hover:text-white hover:border-white/30"
            )}
          >No</button>
        </div>
      </div>
      {showWarning && (
        <div className="mt-3 px-3.5 py-2.5 bg-[#78BE20]/10 border-l-2 border-[#78BE20] text-[12px] text-white/60 leading-relaxed rounded-r-sm">
          {warning} If unsure, our technicians assess it at intake.
        </div>
      )}
    </div>
  );
}
