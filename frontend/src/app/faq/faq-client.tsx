"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const FAQ_GROUPS = [
  {
    title: "Orders & Delivery",
    items: [
      {
        q: "How does ordering work?",
        a: "Add your selection to the bag and check out with your delivery details — no card required. We accept Cash on Delivery and bank transfer. After placing the order you'll be redirected to WhatsApp with a pre-filled confirmation message containing your order number; sending it confirms the order and our team takes it from there.",
      },
      {
        q: "How long does delivery take?",
        a: "Riyadh: 1–2 business days. Other major cities: 2–4 business days. Coffee is roasted to order, so your beans typically leave the roastery within 48 hours of roasting.",
      },
      {
        q: "Is delivery free?",
        a: "Delivery is complimentary on orders of 300 SAR and above. Below that, a flat 25 SAR applies anywhere in the Kingdom.",
      },
      {
        q: "Can I track my order?",
        a: "Yes — use the Track Order page with your LR- order number, or open the order inside your account to see a live status timeline from Pending to Delivered.",
      },
    ],
  },
  {
    title: "Payments",
    items: [
      {
        q: "Which payment methods do you accept?",
        a: "Cash on Delivery and bank transfer. Online card payment is coming soon; the platform is already built to add it without disruption.",
      },
      {
        q: "How does bank transfer work?",
        a: "Choose Bank Transfer at checkout and you'll receive our IBAN with your order confirmation. Send the transfer receipt via WhatsApp and we'll confirm your order, usually within the hour during business time.",
      },
      {
        q: "Will I receive an invoice?",
        a: "Every order automatically generates a numbered invoice (INV-…). You can view, print or download it as a PDF from your order confirmation or your account at any time.",
      },
    ],
  },
  {
    title: "Products & Freshness",
    items: [
      {
        q: "How fresh is the coffee?",
        a: "We roast to order in small batches — beans ship within 48 hours of roasting, and every bag carries its roast date. For best results, rest espresso roasts 7–10 days from that date.",
      },
      {
        q: "How should I store chocolate and nuts?",
        a: "Cool, dry and away from light: 16–18°C for chocolate (never the refrigerator, which dulls the shine and texture), and an airtight container for nuts, which keep beautifully for six weeks after opening.",
      },
      {
        q: "Do you make gift boxes for companies?",
        a: "Yes — corporate and bulk gifting is one of our favourite crafts, including hand-written cards in Arabic or English. Contact us and we'll compose something to your brief and budget.",
      },
    ],
  },
  {
    title: "Returns",
    items: [
      {
        q: "What is your return policy?",
        a: "Being perishable goods, opened food items can't be returned — but if anything arrives damaged or below the standard we promise, tell us within 48 hours with a photo and we'll replace it or refund you in full, no debate. Unopened accessories may be returned within 14 days.",
      },
    ],
  },
];

function FaqItem({ q, a, id }: { q: string; a: string; id: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line last:border-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-display text-lg font-medium text-navy">{q}</span>
        <ChevronDown
          size={18}
          className={cn("shrink-0 text-gold-600 transition-transform duration-300", open && "rotate-180")}
          aria-hidden
        />
      </button>
      <div
        id={`${id}-panel`}
        role="region"
        className={cn(
          "grid transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <p className="pb-6 pr-8 text-sm leading-relaxed text-muted">{a}</p>
        </div>
      </div>
    </div>
  );
}

export function FaqClient() {
  return (
    <div className="container-page py-14 sm:py-20">
      <div className="mb-12 text-center">
        <p className="eyebrow mb-3">Good to know</p>
        <h1 className="heading-xl">Frequently asked questions</h1>
      </div>
      <div className="mx-auto max-w-3xl space-y-10">
        {FAQ_GROUPS.map((group, gi) => (
          <section key={group.title} aria-label={group.title}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-luxe text-gold-600">
              {group.title}
            </h2>
            <div className="card-luxe px-6 sm:px-8">
              {group.items.map((item, i) => (
                <FaqItem key={item.q} q={item.q} a={item.a} id={`faq-${gi}-${i}`} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
