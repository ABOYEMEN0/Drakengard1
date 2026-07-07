import type { Metadata } from "next";
import { FaqClient, FAQ_GROUPS } from "./faq-client";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about ordering, delivery, payments, freshness and returns at LEOR.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_GROUPS.flatMap((g) =>
      g.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      }))
    ),
  };

  return (
    <>
      <FaqClient />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
