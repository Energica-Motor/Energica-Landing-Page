"use client";

import { usePathname } from "next/navigation";
import Navigation from "./Navigation";
import Footer from "./Footer";

interface Props {
  children: React.ReactNode;
  loadingScreen: React.ReactNode;
  smoothScroll: React.ReactNode;
  grainOverlay: React.ReactNode;
  cursor: React.ReactNode;
}

export default function SiteChrome({
  children,
  loadingScreen,
  smoothScroll,
  grainOverlay,
  cursor,
}: Props) {
  const pathname = usePathname();
  const isConfigurator = pathname.startsWith("/configurator");

  // On the configurator page: show nav + footer for navigation continuity,
  // but skip the heavy landing page effects (smooth scroll, grain, cursor, loading screen).
  if (isConfigurator) {
    return (
      <>
        <Navigation alwaysDark />
        {children}
        <Footer />
      </>
    );
  }

  return (
    <>
      {loadingScreen}
      {smoothScroll}
      {grainOverlay}
      {cursor}
      <Navigation />
      {children}
      <Footer />
    </>
  );
}
