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
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
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
