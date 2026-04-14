"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";

export default function OwnersPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="bg-[#0a0a0a] text-white min-h-screen pt-32 pb-[120px]">
      <Container>
        <p className="inline-flex items-center gap-3 mb-6">
          <span className="w-6 h-px bg-[#78BE20]" />
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/65">Owners</span>
        </p>
        <h1
          className="font-display text-white leading-none mb-6"
          style={{ fontSize: "clamp(60px, 10vw, 140px)" }}
        >
          Owner<br />Portal.
        </h1>
        <p className="text-white/60 text-[length:var(--text-body)] max-w-[750px] leading-relaxed mb-[48px]">
          Manuals, software updates, and owner resources are being prepared.
          For urgent technical issues, use the form below to contact our support team directly.
        </p>

        {/* Community Videos */}
        <div className="mb-[80px]">
          <p className="inline-flex items-center gap-3 mb-6">
            <span className="w-6 h-px bg-[#78BE20]" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/65">From the Road</span>
          </p>
          <h2 className="font-display text-white text-[clamp(28px,4vw,48px)] leading-none uppercase mb-3">
            Community Rides
          </h2>
          <p className="text-white/55 text-sm max-w-[520px] leading-relaxed mb-10" style={{ fontFamily: "var(--font-ibm-sans)" }}>
            Real journeys from Energica owners around the world. No scripts — just the road.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[
              { id: "7tgEhL7jij8", title: "Mark's Ride — Europe" },
            ].map((video) => (
              <div key={video.id} className="group">
                <div className="relative aspect-video bg-[#111] overflow-hidden border border-white/[0.06] group-hover:border-[#78BE20]/30 transition-colors duration-300">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <p className="text-white/55 text-[11px] tracking-[0.15em] uppercase mt-3" style={{ fontFamily: "var(--font-ibm-mono)" }}>
                  {video.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-[640px]">
          <p className="inline-flex items-center gap-3 mb-8">
            <span className="w-6 h-px bg-[#78BE20]" />
            <span className="text-[10px] uppercase tracking-[0.35em] text-white/65 font-mono">
              Contact Support
            </span>
          </p>

          {submitted ? (
            <div className="border border-[#78BE20]/30 bg-[#78BE20]/5 p-8">
              <p className="font-display text-white text-2xl mb-2">Message Sent.</p>
              <p className="text-white/60 text-sm">
                Our team will respond within 2 business days.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                window.location.href =
                  `mailto:owners@energicamotor.com` +
                  `?subject=${encodeURIComponent(`[${data.get("subject")}] ${data.get("name")}`)}` +
                  `&body=${encodeURIComponent(data.get("message") as string)}`;
                setSubmitted(true);
              }}
              className="flex flex-col gap-5"
            >
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-[0.3em] text-white/55">
                  Name <span className="text-[#78BE20]">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Your full name"
                  className="bg-[#111] border border-white/[0.1] text-white text-sm px-4 py-3 focus:outline-none focus:border-[#78BE20]/60 placeholder:text-white/25 transition-colors duration-200"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-[0.3em] text-white/55">
                  Email <span className="text-[#78BE20]">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="bg-[#111] border border-white/[0.1] text-white text-sm px-4 py-3 focus:outline-none focus:border-[#78BE20]/60 placeholder:text-white/25 transition-colors duration-200"
                />
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-[0.3em] text-white/55">
                  Subject <span className="text-[#78BE20]">*</span>
                </label>
                <div className="relative">
                  <select
                    name="subject"
                    required
                    defaultValue=""
                    className="w-full appearance-none bg-[#111] border border-white/[0.1] text-white text-sm px-4 py-3 pr-8 focus:outline-none focus:border-[#78BE20]/60 transition-colors duration-200 cursor-pointer"
                  >
                    <option value="" disabled className="text-white/25">Select a subject</option>
                    <option value="Technical Issue" className="bg-[#111]">Technical Issue</option>
                    <option value="Warranty" className="bg-[#111]">Warranty</option>
                    <option value="General" className="bg-[#111]">General</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none text-[8px]">▾</span>
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-[0.3em] text-white/55">
                  Message <span className="text-[#78BE20]">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="Describe your issue in detail..."
                  className="bg-[#111] border border-white/[0.1] text-white text-sm px-4 py-3 focus:outline-none focus:border-[#78BE20]/60 placeholder:text-white/25 transition-colors duration-200 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-[#78BE20] text-black text-[11px] uppercase tracking-[0.2em] font-semibold px-8 py-4 hover:bg-[#8fd424] transition-colors duration-200"
                >
                  Send Message
                </button>
              </div>
            </form>
          )}
        </div>
      </Container>
    </main>
  );
}
