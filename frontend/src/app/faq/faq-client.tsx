"use client";

import { FAQ_GROUPS } from "./faq-data";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";



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
