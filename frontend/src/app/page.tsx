import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Leaf, Quote, Truck } from "lucide-react";
import {
  CATEGORIES,
  PRODUCTS,
  REVIEWS,
  getBestSellers,
  getNewArrivals,
  getOnSaleProducts,
  getProductsByCategory,
} from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { ProductCard } from "@/components/product/product-card";

export const metadata: Metadata = {
  title: "LEOR — Premium Coffee, Chocolate & Gourmet Boutique",
  alternates: { canonical: "/" },
};

function CollectionRow({
  eyebrow,
  title,
  description,
  category,
  reverse,
}: {
  eyebrow: string;
  title: string;
  description: string;
  category: string;
  reverse?: boolean;
}) {
  const items = getProductsByCategory(category).slice(0, 3);
  const cat = CATEGORIES.find((c) => c.slug === category)!;
  return (
    <section className="container-page py-14 sm:py-20" aria-label={title}>
      <div className={`grid items-stretch gap-6 lg:grid-cols-5 ${reverse ? "" : ""}`}>
        <Reveal className={`lg:col-span-2 ${reverse ? "lg:order-last" : ""}`}>
          <Link
            href={`/shop?category=${category}`}
            className="group relative block h-full min-h-[380px] overflow-hidden rounded-card shadow-card"
          >
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <p className="eyebrow mb-2 text-gold-300">{eyebrow}</p>
              <h3 className="mb-2 font-display text-3xl font-medium text-ivory">{title}</h3>
              <p className="mb-4 max-w-xs text-sm leading-relaxed text-ivory/75">{description}</p>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-gold transition-colors group-hover:text-gold-300">
                Explore the collection
                <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </Reveal>
        <Stagger className="grid gap-6 sm:grid-cols-3 lg:col-span-3">
          {items.map((p) => (
            <StaggerItem key={p.id}>
              <ProductCard product={p} className="h-full" />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export default function HomePage() {
  const bestSellers = getBestSellers().slice(0, 4);
  const latest = getNewArrivals().slice(0, 4);
  const offers = getOnSaleProducts().slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy" aria-label="Welcome to LEOR">
        <Image
          src="/images/hero.svg"
          alt=""
          fill
          priority
          className="object-cover opacity-90"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/90 via-navy-800/60 to-transparent" />
        <div className="container-page relative flex min-h-[78vh] flex-col justify-center py-24">
          <div className="max-w-xl animate-fade-up">
            <p className="eyebrow mb-5 text-gold">Maison Gourmande · Est. Riyadh</p>
            <h1 className="mb-6 font-display text-5xl font-medium leading-[1.08] text-ivory sm:text-6xl lg:text-7xl">
              The quiet luxury of exceptional taste
            </h1>
            <p className="mb-10 max-w-md text-base leading-relaxed text-ivory/75 sm:text-lg">
              Single-origin coffee, bean-to-bar chocolate and gourmet
              indulgences — sourced with obsession, finished with restraint.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="inline-flex h-13 items-center rounded-button bg-gold px-8 py-4 text-sm font-medium tracking-wide text-navy shadow-gold transition-all duration-300 hover:bg-gold-300"
              >
                Shop the Collection
              </Link>
              <Link
                href="/shop?category=gift-boxes"
                className="inline-flex h-13 items-center rounded-button border border-ivory/30 px-8 py-4 text-sm font-medium tracking-wide text-ivory transition-all duration-300 hover:border-gold hover:text-gold"
              >
                Gift Boxes
              </Link>
            </div>
          </div>
        </div>
        <div className="relative border-t border-ivory/10 bg-navy-900/60 backdrop-blur">
          <div className="container-page grid grid-cols-1 gap-4 py-5 text-ivory/80 sm:grid-cols-3">
            {[
              { icon: Truck, text: "Free delivery over 300 SAR" },
              { icon: Award, text: "Small-batch, roasted to order" },
              { icon: Leaf, text: "Directly & ethically sourced" },
            ].map(({ icon: Icon, text }) => (
              <p key={text} className="flex items-center justify-center gap-2.5 text-xs tracking-wider2 sm:text-sm">
                <Icon size={16} className="text-gold" aria-hidden /> {text}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container-page py-16 sm:py-24" aria-label="Featured categories">
        <SectionHeading
          eyebrow="The Maison"
          title="Curated by category"
          description="Six houses of craft, each held to the same standard: nothing ordinary."
        />
        <Stagger className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-6">
          {CATEGORIES.map((cat) => (
            <StaggerItem key={cat.id}>
              <Link
                href={`/shop?category=${cat.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-card shadow-soft transition-shadow duration-300 hover:shadow-lift"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-center">
                  <h3 className="font-display text-lg font-medium text-ivory">{cat.name}</h3>
                  <p className="text-[11px] uppercase tracking-wider2 text-gold-300">
                    {cat.productCount} products
                  </p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Best Sellers */}
      <section className="bg-cream py-16 sm:py-24" aria-label="Best sellers">
        <div className="container-page">
          <SectionHeading
            eyebrow="Most Loved"
            title="Best sellers"
            href="/shop?sort=bestselling"
            align="left"
          />
          <Stagger className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {bestSellers.map((p) => (
              <StaggerItem key={p.id}>
                <ProductCard product={p} className="h-full" />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Latest Products */}
      <section className="container-page py-16 sm:py-24" aria-label="Latest arrivals">
        <SectionHeading
          eyebrow="Just Arrived"
          title="Latest additions"
          href="/shop?sort=newest"
          align="left"
        />
        <Stagger className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {latest.map((p) => (
            <StaggerItem key={p.id}>
              <ProductCard product={p} className="h-full" />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Special Offers */}
      <section className="bg-navy py-16 sm:py-24" aria-label="Special offers">
        <div className="container-page">
          <div className="mb-10 flex flex-col gap-3 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow mb-3 text-gold">Private Offers</p>
              <h2 className="font-display text-3xl font-medium text-ivory sm:text-4xl">
                Seasonal indulgences, considered prices
              </h2>
            </div>
            <Link
              href="/shop?sale=true"
              className="group inline-flex items-center gap-2 text-sm font-medium text-gold hover:text-gold-300"
            >
              All offers
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
          <Stagger className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {offers.map((p) => (
              <StaggerItem key={p.id}>
                <ProductCard product={p} className="h-full" />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Collections */}
      <CollectionRow
        eyebrow="The Roastery"
        title="Coffee Collection"
        description="From Yirgacheffe florals to our signature espresso — roasted to order, never to stock."
        category="coffee"
      />
      <CollectionRow
        eyebrow="The Atelier"
        title="Chocolate Collection"
        description="Bean-to-bar couverture and hand-piped pralinés from rare cacao origins."
        category="chocolate"
        reverse
      />
      <CollectionRow
        eyebrow="The Pantry"
        title="Nuts Collection"
        description="Slow-roasted, honey-lacquered, oak-smoked — seasoned with precision."
        category="nuts"
      />

      {/* Customer Reviews */}
      <section className="bg-cream py-16 sm:py-24" aria-label="Customer reviews">
        <div className="container-page">
          <SectionHeading
            eyebrow="Word of Mouth"
            title="From our customers"
            description="Unedited words from people who take taste seriously."
          />
          <Stagger className="grid gap-6 md:grid-cols-3">
            {REVIEWS.slice(0, 3).map((r) => (
              <StaggerItem key={r.id}>
                <figure className="card-luxe flex h-full flex-col p-8">
                  <Quote size={26} className="mb-5 text-gold" aria-hidden />
                  <Rating value={r.rating} className="mb-4" />
                  <blockquote className="flex-1 text-sm leading-relaxed text-ink">
                    “{r.body}”
                  </blockquote>
                  <figcaption className="mt-6 flex items-center justify-between border-t border-line pt-4">
                    <span className="font-display text-base font-medium text-navy">{r.author}</span>
                    {r.verified && <Badge variant="success">Verified</Badge>}
                  </figcaption>
                </figure>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Instagram Gallery */}
      <section className="container-page py-16 sm:py-24" aria-label="Instagram gallery">
        <SectionHeading
          eyebrow="@leor.sa"
          title="Life at the maison"
          description="Behind the counter, inside the roastery — follow along."
        />
        <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <StaggerItem key={n}>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`LEOR on Instagram, photo ${n}`}
                className="group relative block aspect-square overflow-hidden rounded-card"
              >
                <Image
                  src={`/images/instagram/${n}.svg`}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-navy/0 transition-colors duration-300 group-hover:bg-navy/30" />
              </a>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: PRODUCTS.slice(0, 8).map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `https://leor.sa/product/${p.slug}`,
              name: p.name,
            })),
          }),
        }}
      />
    </>
  );
}
