import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
        <li>
          <Link href="/" className="transition-colors hover:text-gold-600">
            Home
          </Link>
        </li>
        {items.map((item, i) => (
          <Fragment key={i}>
            <ChevronRight size={12} className="text-line" aria-hidden />
            <li aria-current={i === items.length - 1 ? "page" : undefined}>
              {item.href ? (
                <Link href={item.href} className="transition-colors hover:text-gold-600">
                  {item.label}
                </Link>
              ) : (
                <span className="text-navy">{item.label}</span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
