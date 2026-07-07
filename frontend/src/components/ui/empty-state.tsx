import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Button } from "./button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-gold/40 bg-gold/5">
        <Icon size={30} className="text-gold-600" strokeWidth={1.5} />
      </div>
      <h2 className="heading-md mb-2">{title}</h2>
      <p className="mb-8 max-w-sm text-sm text-muted">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button variant="gold">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
