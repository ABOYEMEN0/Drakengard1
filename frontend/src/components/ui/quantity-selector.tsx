"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const btn =
    "flex items-center justify-center text-navy transition-colors hover:bg-navy/5 disabled:opacity-30 disabled:pointer-events-none" +
    (size === "sm" ? " h-8 w-8" : " h-11 w-11");
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-button border border-line bg-white",
        className
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        className={btn}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus size={14} />
      </button>
      <span
        className={cn(
          "min-w-10 text-center text-sm font-medium tabular-nums",
          size === "sm" && "min-w-8 text-xs"
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        className={btn}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
