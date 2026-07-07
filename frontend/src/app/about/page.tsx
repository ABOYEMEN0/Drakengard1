import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Award, Feather, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "The story of LEOR — a Riyadh maison of single-origin coffee, bean-to-bar chocolate and gourmet craft.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    icon: Globe2,
    title: "Sourcing",
    body: "We buy directly from growers we know by name — estates in Ethiopia, valleys in Madagascar, terraces in Yemen — and pay for quality, not volume.",
  },
  {
    icon: Feather,
    title: "Craft",
    body: "Small batches, roasted and tempered by hand. Every lot is cupped, every praliné piped, every box tied by someone who cares how it arrives.",
  },
  {
    icon: Award,
    title: "Restraint",
    body: "Luxury is what you leave out. No shortcuts, no fillers, no noise — only the essential, finished properly.",
  },
];

const STATS = [
  { value: "24", label: "Single-origin lots" },
  { value: "11", label: "Artisan partners" },
  { value: "17", label: "Cities served" },
  { value: "48h", label: "Roast-to-door" },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-navy py-24 sm:py-32">
        <Image src="/images/hero.svg" alt="" fill className="object-cover opacity-40" aria-hidden />
        <div className="container-page relative text-center">
          <p className="eyebrow mb-4 text-gold">Our Story</p>
          <h1 className="mx-auto max-w-3xl font-display text-4xl font-medium leading-tight text-ivory sm:text-6xl">
            The pursuit of the exceptional
          </h1>
        </div>
      </section>

      <section className="container-page py-16 sm:py-24">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="gold-rule mb-8" aria-hidden />
          <p className="mb-6 font-display text-2xl leading-relaxed text-navy sm:text-3xl">
            LEOR began with a simple refusal: that everyday pleasures should be ordinary.
          </p>
          <p className="mb-5 text-base leading-relaxed text-muted">
            Founded in Riyadh, LEOR is a maison gourmande — part roastery, part chocolate
            atelier, part pantry of rare things. We travel for the season&apos;s best lots,
            bring them home, and finish them with the patience they deserve. Coffee roasted
            to order and never to stock. Chocolate stone-ground over three days. Nuts
            seasoned with a restraint that borders on stubbornness.
          </p>
          <p className="text-base leading-relaxed text-muted">
            What we make is meant to be given — to a guest, to a partner, to yourself at the
            end of a long day. Navy for depth, gold for warmth: the colours of how we work.
          </p>
        </Reveal>
      </section>

      <section className="bg-cream py-16 sm:py-24" aria-label="Our values">
        <div className="container-page">
          <Stagger className="grid gap-6 md:grid-cols-3">
            {VALUES.map((v) => (
              <StaggerItem key={v.title}>
                <div className="card-luxe h-full p-8 text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-gold/5">
                    <v.icon size={26} className="text-gold-600" strokeWidth={1.5} />
                  </div>
                  <h2 className="heading-md mb-3">{v.title}</h2>
                  <p className="text-sm leading-relaxed text-muted">{v.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="container-page py-16 sm:py-24" aria-label="LEOR in numbers">
        <div className="grid grid-cols-2 gap-8 rounded-card bg-navy p-10 sm:grid-cols-4 sm:p-14">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-4xl font-medium text-gold sm:text-5xl">{s.value}</p>
              <p className="mt-2 text-xs uppercase tracking-wider2 text-ivory/70">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-20 text-center">
        <Reveal>
          <h2 className="heading-lg mb-4">Taste the difference restraint makes</h2>
          <p className="mx-auto mb-8 max-w-md text-sm text-muted">
            Begin with a tasting box, or go straight to the lot everyone asks about.
          </p>
          <Link href="/shop">
            <Button variant="gold" size="lg">Shop the Collection</Button>
          </Link>
        </Reveal>
      </section>
    </>
  );
}
