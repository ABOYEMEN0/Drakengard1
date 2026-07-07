import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  hrefLabel = "View all",
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-3 sm:mb-14",
        align === "center" ? "items-center text-center" : "items-start text-left",
        href && "sm:flex-row sm:items-end sm:justify-between sm:text-left",
        className
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && !href && "mx-auto")}>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="heading-lg text-balance">{title}</h2>
        {description && <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{description}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-gold-600 transition-colors hover:text-gold-700"
        >
          {hrefLabel}
          <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
