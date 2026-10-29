import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Layout container — the site's one width and gutter (.ds-container in
 * globals.css): 1280px of content, 16/24/32px gutters. Use as the inner
 * wrapper for every page section, the header and the footer.
 */
export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("ds-container", className)}>
      {children}
    </div>
  );
}
