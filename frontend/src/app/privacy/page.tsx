import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How LEOR collects, uses and protects your personal information.",
  alternates: { canonical: "/privacy" },
};

const SECTIONS: LegalSection[] = [
  {
    id: "data-we-collect",
    title: "Information We Collect",
    paragraphs: [
      "We collect only what we need to serve you well. When you place an order or create an account, we collect your name, mobile number, delivery address (city, district and street details), and — optionally — your email address.",
      "We also collect order history, wishlist selections and, where you consent, your communication preferences. Technical data such as device type and pages visited is collected in aggregate to improve the experience.",
    ],
  },
  {
    id: "how-we-use",
    title: "How We Use Your Information",
    paragraphs: ["Your information is used exclusively to:"],
    bullets: [
      "Process, deliver and track your orders, and generate your invoices.",
      "Contact you about your order via WhatsApp, phone or email.",
      "Maintain your account, addresses and wishlist.",
      "Send offers and the newsletter — only if you have opted in.",
      "Prevent fraud and meet legal obligations in the Kingdom of Saudi Arabia.",
    ],
  },
  {
    id: "whatsapp",
    title: "WhatsApp Communication",
    paragraphs: [
      "Order confirmation at LEOR happens over WhatsApp. When you place an order, we prepare a message containing your order number, items and delivery details, which is sent from your own WhatsApp account to ours. WhatsApp's own privacy policy (Meta Platforms) applies to that transmission. We use your WhatsApp number only for order-related communication unless you ask otherwise.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies & Local Storage",
    paragraphs: [
      "We use strictly necessary cookies and browser local storage to keep your bag, wishlist and session working between visits. We do not sell advertising or use third-party tracking cookies. You can clear these at any time from your browser settings; your bag will simply start fresh.",
    ],
  },
  {
    id: "sharing",
    title: "Sharing Your Information",
    paragraphs: [
      "We never sell your personal data. We share it only with the delivery partners who bring your order to your door (name, phone and address only), payment verification for bank transfers, and authorities where the law requires it.",
    ],
  },
  {
    id: "security",
    title: "Security",
    paragraphs: [
      "Passwords are stored encrypted (bcrypt), connections are protected by HTTPS, and access to customer data inside LEOR is role-restricted and logged. No system is perfectly secure, but we treat your data with the same restraint we apply to everything else.",
    ],
  },
  {
    id: "retention",
    title: "Data Retention",
    paragraphs: [
      "Order and invoice records are retained as required by Saudi commercial regulations. Account data is kept while your account is active; you may request deletion at any time and we will remove everything not legally required to be kept.",
    ],
  },
  {
    id: "rights",
    title: "Your Rights",
    paragraphs: [
      "In line with the Saudi Personal Data Protection Law (PDPL), you may request access to, correction of, or deletion of your personal data, withdraw marketing consent, and ask how your data is processed. Write to care@leor.sa and we will respond within 30 days.",
    ],
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    paragraphs: [
      "If we change this policy materially, we will post the new version here and update the date above. Continued use of the site after changes constitutes acceptance.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="1 July 2026"
      intro="LEOR (“we”, “us”) respects your privacy. This policy explains what we collect, why, and the choices you have. It applies to leor.sa and all LEOR ordering channels."
      sections={SECTIONS}
    />
  );
}
