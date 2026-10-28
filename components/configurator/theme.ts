// Design tokens for the configurator. Every colour, font and recurring size
// used by the configurator UI comes from here.

export const COLOR = {
  dark: "#0F1012",
  paper: "#F2F2F0",
  white: "#FFFFFF",
  text: "#141517",
  secondary: "#4A4E52",
  label: "#5E6266",
  onDark: "#A3A7AC",
  onDarkText: "#E6E7E8",
  rule: "#D3D5D7",
  strongRule: "#141517",
  darkRule: "#2A2D30",
  darkBorder: "#4A4E52",
  indicator: "#8A8E92",
  swatchBorder: "#C9CBCD",
  green: "#78BE20", // fills and accents only
  greenText: "#3F6B10", // green text on light backgrounds
  error: "#B3261E",
} as const;

// next/font variables from app/layout.tsx, with the family names as fallback
export const FONT = {
  display: "var(--font-barlow), 'Barlow Condensed', sans-serif",
  body: "var(--font-ibm-sans), 'IBM Plex Sans', sans-serif",
  mono: "var(--font-ibm-mono), 'IBM Plex Mono', monospace",
} as const;

export const SIZE = {
  touch: 44, // minimum touch target
  modelBarH: 64,
  panelW: 420,
  stackBelow: 1000, // px: panel stacks under the stage below this width
  disabledOpacity: 0.45,
} as const;

export const BORDER = {
  selected: `1.5px solid ${COLOR.text}`,
  idle: `1px solid ${COLOR.rule}`,
} as const;

/** Mono label style: uppercase IBM Plex Mono with wide tracking. */
export const monoLabel = (size: number, tracking = 0.14, color: string = COLOR.label) => ({
  fontFamily: FONT.mono,
  fontSize: `${size}px`,
  letterSpacing: `${tracking}em`,
  textTransform: "uppercase" as const,
  color,
});
