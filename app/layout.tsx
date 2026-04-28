import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import Cursor from "@/components/ui/Cursor";
import GrainOverlay from "@/components/ui/GrainOverlay";
import LoadingScreen from "@/components/ui/LoadingScreen";
import SmoothScroll from "@/components/ui/SmoothScroll";
import PageTransition from "@/components/ui/PageTransition";

const barlowCondensed = Barlow_Condensed({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-ibm-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-ibm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://energicamotor.com"),
  title: {
    default: "ENERGICA — Progress, Ridden.",
    template: "%s | ENERGICA",
  },
  description:
    "Energica Motor Company. Built in Modena. Proven in MotoE. Four seasons, one supplier. Electric motorcycles for riders who demand precision.",
  keywords: [
    "electric motorcycle",
    "electric superbike",
    "Energica",
    "Italian motorcycle",
    "MotoE",
    "Modena",
    "performance electric",
  ],
  openGraph: {
    title: "ENERGICA — Progress, Ridden.",
    description:
      "Built in Modena. Proven in MotoE. Four seasons, one supplier.",
    siteName: "Energica Motor Company",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://energicamotor.com/#organization",
                  "name": "Energica Motor Company",
                  "legalName": "Energica Motor Company S.p.A.",
                  "url": "https://energicamotor.com",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://energicamotor.com/images/Logo/energica-logo@2x.png"
                  },
                  "description": "Italian high-performance electric motorcycle manufacturer. Founded 2009 in Modena, Italy. Exclusive MotoE World Cup supplier for 4 seasons.",
                  "foundingDate": "2009",
                  "foundingLocation": "Modena, Italy",
                  "slogan": "Progress, Ridden.",
                  "address": [
                    {
                      "@type": "PostalAddress",
                      "addressLocality": "Fiorano Modenese",
                      "addressRegion": "MO",
                      "postalCode": "41042",
                      "streetAddress": "37 Via dell'Artigianato",
                      "addressCountry": "IT"
                    }
                  ],
                  "contactPoint": [
                    { "@type": "ContactPoint", "email": "info@energicamotor.com", "contactType": "customer support" },
                    { "@type": "ContactPoint", "email": "sales@energicamotor.com", "contactType": "sales" },
                    { "@type": "ContactPoint", "email": "service-eu@energicamotor.com", "contactType": "technical support" }
                  ],
                  "sameAs": [
                    "https://www.instagram.com/energicamotorcompany/",
                    "https://www.youtube.com/@ENERGICAMOTORCOMPANY",
                    "https://www.facebook.com/EnergicaMotorCompany/",
                    "https://www.linkedin.com/company/energica-motor-company/",
                    "https://en.wikipedia.org/wiki/Energica_Motor_Company"
                  ]
                },
                {
                  "@type": "WebSite",
                  "@id": "https://energicamotor.com/#website",
                  "url": "https://energicamotor.com",
                  "name": "Energica Motor Company",
                  "publisher": { "@id": "https://energicamotor.com/#organization" },
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://energicamotor.com/models?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body className="antialiased">
        {/* Loading overlay — renders until window.load fires */}
        <LoadingScreen />

        {/* Lenis smooth scroll + GSAP ScrollTrigger sync */}
        <SmoothScroll />

        {/* Cinematic grain texture overlay */}
        <GrainOverlay />

        <Cursor />
        <Navigation />

        {/* Page-level fade/y transitions on route changes */}
        <PageTransition>{children}</PageTransition>

        <Footer />
      </body>
    </html>
  );
}
