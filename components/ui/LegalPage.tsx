import Link from "next/link";
import { Container } from "@/components/ui/Container";

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface LegalPageProps {
  category: string;
  title: string;
  lastUpdated: string;
  sections: Section[];
  relatedLinks: { label: string; href: string }[];
}

export default function LegalPage({ category, title, lastUpdated, sections, relatedLinks }: LegalPageProps) {
  return (
    <main className="bg-[#0a0a0a] text-white min-h-screen pt-28 pb-32">
      <Container>

        {/* Header */}
        <div className="border-b border-white/[0.06] pb-10 mb-12">
          <p className="inline-flex items-center gap-3 mb-6">
            <span className="w-6 h-px bg-[#CE2B37]" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/65">{category}</span>
          </p>
          <h1
            className="font-display text-white leading-none mb-4"
            style={{ fontSize: "clamp(52px, 8vw, 110px)" }}
          >
            {title}
          </h1>
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/40" style={{ fontFamily: "var(--font-ibm-mono)" }}>
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-12 lg:gap-16 items-start">

          {/* Sticky sidebar — section index + related links */}
          <aside className="hidden lg:block">
            <div className="sticky top-32">
              <p className="text-[9px] uppercase tracking-[0.35em] text-white/35 mb-4">Contents</p>
              <nav className="flex flex-col gap-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="text-[11px] text-white/45 hover:text-white/80 transition-colors duration-200 py-1 leading-snug"
                    style={{ fontFamily: "var(--font-ibm-sans)" }}
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
              {relatedLinks.length > 0 && (
                <>
                  <div className="mt-8 pt-8 border-t border-white/[0.06]">
                    <p className="text-[9px] uppercase tracking-[0.35em] text-white/35 mb-4">Also</p>
                    <div className="flex flex-col gap-2">
                      {relatedLinks.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          className="text-[11px] text-[#78BE20]/70 hover:text-[#78BE20] transition-colors duration-200"
                          style={{ fontFamily: "var(--font-ibm-sans)" }}
                        >
                          {l.label} →
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </aside>

          {/* Main content */}
          <article className="max-w-[750px]">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className={i > 0 ? "mt-12 pt-12 border-t border-white/[0.05]" : ""}>
                <h2 className="font-display text-white text-2xl md:text-3xl mb-4 leading-snug">{s.title}</h2>
                <div className="prose-legal">{s.content}</div>
              </section>
            ))}

            {/* Mobile related links */}
            <div className="mt-14 pt-10 border-t border-white/[0.06] flex flex-wrap gap-4 lg:hidden">
              {relatedLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-xs text-[#78BE20]/70 hover:text-[#78BE20] transition-colors"
                  style={{ fontFamily: "var(--font-ibm-mono)" }}
                >
                  {l.label} →
                </Link>
              ))}
            </div>

            <div className="mt-14 pt-10 border-t border-white/[0.06]">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/35 mb-3" style={{ fontFamily: "var(--font-ibm-mono)" }}>Contact</p>
              <p className="text-sm text-white/60 leading-relaxed" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                Energica Motor Company S.p.A.<br />
                Via Cesare della Chiesa 44, 41122 Modena, Italy<br />
                <a href="mailto:privacy@energicamotor.com" className="text-[#78BE20] hover:text-[#78BE20]/80 transition-colors">privacy@energicamotor.com</a>
              </p>
            </div>
          </article>

        </div>
      </Container>
    </main>
  );
}
