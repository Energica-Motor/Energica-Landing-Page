import { cn } from "@/lib/utils";
import { Counter } from "@/components/ui/Counter";

interface StatCounterProps {
  value: number;
  unit?: string;
  label: string;
  decimals?: number;
  className?: string;
}

export function StatCounter({
  value,
  unit = "",
  label,
  decimals = 0,
  className,
}: StatCounterProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-end gap-1">
        <Counter value={value} decimals={decimals} className="font-display text-5xl md:text-6xl text-white tabular-nums" />
        {unit && (
          <span className="font-display text-2xl text-[#78BE20] mb-1">
            {unit}
          </span>
        )}
      </div>
      <p className="text-xs uppercase tracking-widest text-white/60">{label}</p>
    </div>
  );
}
