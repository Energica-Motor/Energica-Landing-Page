import { cn } from "@/lib/utils";

type AsProp = "section" | "div" | "article" | "aside";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  /** HTML element to render — defaults to "section" */
  as?: AsProp;
}

/**
 * Section wrapper — standardised 120px top/bottom padding.
 * Wrap every major page section with this for consistent vertical rhythm.
 */
export function SectionWrapper({ children, className, as = "section" }: SectionWrapperProps) {
  const Tag = as as React.ElementType;
  return (
    <Tag className={cn("ds-section", className)}>
      {children}
    </Tag>
  );
}
