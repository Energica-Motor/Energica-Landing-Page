import { models } from "./models";

export interface NavLink {
  label: string;
  href: string;
}

export interface MegaMenuItem {
  id: string;
  name: string;
  tagline: string;
  href: string;
  image: string;
}

export interface NavItem {
  label: string;
  href: string;
  hasMega?: boolean;
  megaItems?: MegaMenuItem[];
}

export const navItems: NavItem[] = [
  {
    label: "Models",
    href: "/models",
    hasMega: true,
    megaItems: models.map((m) => ({
      id: m.id,
      name: m.name,
      tagline: m.tagline,
      href: `/models/${m.id}`,
      image: m.heroImage,
    })),
  },
  {
    label: "Technology",
    href: "/technology",
  },
  {
    label: "Racing",
    href: "/racing",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

export const footerLinks = {
  models: models.map((m) => ({ label: m.name, href: `/models/${m.id}` })),
  company: [
    { label: "About Energica", href: "/about" },
    { label: "Racing", href: "/racing" },
    { label: "Press", href: "/press" },
    { label: "Careers", href: "/careers" },
  ],
  support: [
    { label: "Contact Us", href: "/contact" },
    { label: "Configurator", href: "/configurator" },
    { label: "Owners", href: "/owners" },
    { label: "Warranty", href: "/warranty" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Terms of Use", href: "/terms" },
  ],
};
