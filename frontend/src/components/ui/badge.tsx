import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const styles = {
  gold: "bg-gold/15 text-gold-700 border border-gold/40",
  navy: "bg-navy text-ivory",
  outline: "border border-line text-muted",
  success: "bg-success/10 text-success border border-success/30",
  danger: "bg-[#FBE4E2] text-[#B42318]",
  sale: "bg-[#B42318] text-white",
} as const;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof styles;
}

export function Badge({ className, variant = "gold", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wider2",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}

/** Order-status pill driven by ORDER_STATUS_META colors. */
export function StatusBadge({ color, bg, label }: { color: string; bg: string; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider2"
      style={{ color, backgroundColor: bg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
