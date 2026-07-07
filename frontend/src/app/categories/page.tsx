import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/lib/data";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Explore the six houses of LEOR — coffee, chocolate, nuts, accessories, gift boxes and seasonal limited editions.",
  alternates: { canonical: "/categories" },
};

export default function CategoriesPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <Breadcrumbs items={[{ label: "Categories" }]} />

      <Reveal>
        <div className="mb-12 max-w-2xl">
          <p className="eyebrow mb-3">The Maison</p>
          <h1 className="heading-lg text-balance">Six houses of craft</h1>
          <span className="gold-rule my-5" aria-hidden />
          <p className="text-sm leading-relaxed text-muted sm:text-base">
            Each category is a discipline of its own — sourced with obsession,
            finished with restraint, held to a single standard: nothing ordinary.
          </p>
        </div>
      </Reveal>

      <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <StaggerItem key={cat.id}>
            <Link
              href={`/shop?category=${cat.slug}`}
              className="group relative block aspect-[4/5] overflow-hidden rounded-card shadow-soft transition-shadow duration-300 hover:shadow-lift"
              aria-label={`Shop ${cat.name}`}
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7">
                <p className="mb-1 text-xs uppercase tracking-wider2 text-gold-300">
                  {cat.productCount} products · {cat.nameAr}
                </p>
                <h2 className="mb-2 font-display text-3xl font-medium text-ivory">{cat.name}</h2>
                <p className="mb-4 max-w-xs text-sm leading-relaxed text-ivory/75">
                  {cat.description}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-gold transition-colors group-hover:text-gold-300">
                  Explore the collection
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
