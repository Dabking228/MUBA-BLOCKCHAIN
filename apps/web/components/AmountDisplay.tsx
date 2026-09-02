import { cn } from "@/lib/utils";
import { mistToSui } from "@/lib/format";

export function AmountDisplay({
  mist,
  className,
  size = "md",
  maxFractionDigits = 4,
  showUnit = true,
}: {
  mist: bigint | string | number;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  maxFractionDigits?: number;
  showUnit?: boolean;
}) {
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-3xl",
  } as const;

  return (
    <span className={cn("font-semibold tabular-nums text-foreground", sizes[size], className)}>
      {mistToSui(mist, maxFractionDigits)}
      {showUnit && <span className="ml-1 text-muted font-normal">SUI</span>}
    </span>
  );
}
