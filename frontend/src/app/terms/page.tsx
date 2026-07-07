import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms governing purchases and use of the LEOR platform.",
  alternates: { canonical: "/terms" },
};

const SECTIONS: LegalSection[] = [
  {
    id: "agreement",
    title: "The Agreement",
    paragraphs: [
      "These terms govern your use of leor.sa and any purchase from LEOR (“we”, “us”). By placing an order you accept them. If you do not agree, please do not use the site.",
    ],
  },
  {
    id: "orders",
    title: "Orders & Confirmation",
    paragraphs: [
      "Every order receives a unique order number (format LR-YYYYNNNNN) and a corresponding invoice (INV-YYYYNNNNN). An order is considered placed when submitted at checkout, and confirmed when our team acknowledges it — normally after you send the pre-prepared WhatsApp confirmation message.",
      "We may decline or cancel an order where stock is unavailable, details cannot be verified, or an obvious pricing error occurred; in such cases anything already paid is refunded in full.",
    ],
  },
  {
    id: "prices",
    title: "Prices & Payment",
    paragraphs: [
      "All prices are in Saudi Riyals (SAR) and include VAT where applicable. Two payment methods are available:",
    ],
    bullets: [
      "Cash on Delivery — pay the courier upon receipt.",
      "Bank Transfer — transfer to the IBAN provided at checkout and send the receipt via WhatsApp; orders are prepared after the transfer is verified.",
    ],
  },
  {
    id: "delivery",
    title: "Delivery",
    paragraphs: [
      "We deliver across Saudi Arabia. Standard delivery is 1–2 business days within Riyadh and 2–4 business days elsewhere. Delivery is free for orders of 300 SAR or more; otherwise a 25 SAR fee applies.",
      "Delivery times are estimates, not guarantees. Perishable products should be received promptly; we are not responsible for deterioration caused by an unattended delivery arranged at your request.",
    ],
  },
  {
    id: "returns",
    title: "Returns & Refunds",
    paragraphs: [
      "Food products are perishable and cannot be returned once opened. If an item arrives damaged, incorrect or below standard, notify us within 48 hours with a photograph and we will replace it or refund it in full.",
      "Unopened, unused accessories may be returned within 14 days of delivery in their original packaging; delivery fees for returns of convenience are borne by the customer.",
    ],
  },
  {
    id: "coupons",
    title: "Coupons & Offers",
    paragraphs: [
      "Discount codes apply per the conditions stated with each code (minimum order value, validity window, usage limits), cannot be combined unless stated, and hold no cash value. We may withdraw a code at any time for abuse.",
    ],
  },
  {
    id: "accounts",
    title: "Accounts",
    paragraphs: [
      "You are responsible for the accuracy of your account details and the confidentiality of your password. We may suspend accounts used fraudulently or abusively.",
    ],
  },
  {
    id: "ip",
    title: "Intellectual Property",
    paragraphs: [
      "The LEOR name, logo, imagery, text and design are our property or licensed to us. You may not reproduce them for commercial purposes without written consent.",
    ],
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    paragraphs: [
      "To the maximum extent permitted by law, our liability for any claim related to an order is limited to the amount paid for that order. Nothing in these terms excludes liability that cannot be excluded under Saudi law.",
    ],
  },
  {
    id: "law",
    title: "Governing Law",
    paragraphs: [
      "These terms are governed by the laws of the Kingdom of Saudi Arabia. Disputes are subject to the exclusive jurisdiction of the competent courts of Riyadh.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="1 July 2026"
      intro="Plain terms for a considered experience — what you can expect from LEOR, and what we ask of you."
      sections={SECTIONS}
    />
  );
}
