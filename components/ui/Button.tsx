import { cn } from "@/lib/utils";
import Link from "next/link";
import { type ComponentPropsWithRef } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "gold";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

type ButtonAsButton = ButtonBaseProps &
  ComponentPropsWithRef<"button"> & { href?: never };

type ButtonAsLink = ButtonBaseProps & { href: string; className?: string; children?: React.ReactNode };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#78BE20] text-black hover:bg-[#5a9018] active:scale-[0.97] btn-electric",
  secondary:
    "border border-white/20 text-white hover:border-white/50 active:scale-[0.97]",
  outline:
    "border border-[#78BE20] text-[#78BE20] hover:bg-[#78BE20] hover:text-black active:scale-[0.97]",
  ghost:
    "text-white/70 hover:text-white hover:bg-white/5 active:scale-[0.97]",
  gold:
    "bg-[#C9A84C] text-[#0a0a0a] hover:bg-[#b8963d] font-bold active:scale-[0.97] btn-electric",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs tracking-[0.15em]",
  md: "px-6 py-3 text-sm tracking-[0.15em]",
  lg: "px-8 py-4 text-sm tracking-[0.2em]",
};

const base =
  "inline-flex items-center justify-center font-display uppercase transition-all duration-200 cursor-none select-none";

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    className,
    ...rest
  } = props;

  const classes = cn(base, variants[variant], sizes[size], className);

  if ("href" in props && props.href) {
    const { href, variant: _v, size: _s, className: _cls, children, ...linkRest } = props as ButtonAsLink & { children?: React.ReactNode };
    return (
      <Link href={href} className={classes} {...(linkRest as object)}>
        {children}
      </Link>
    );
  }

  return <button className={classes} {...(rest as ComponentPropsWithRef<"button">)} />;
}

/* ── Convenience named exports ───────────────────────────── */
/** Solid green primary action button — use for the main CTA on any section. */
export function PrimaryButton(props: Omit<ButtonProps, "variant">) {
  return <Button variant="primary" size="lg" {...(props as ButtonProps)} />;
}

/** White-bordered secondary action button — use for supplementary CTAs. */
export function SecondaryButton(props: Omit<ButtonProps, "variant">) {
  return <Button variant="secondary" size="lg" {...(props as ButtonProps)} />;
}
