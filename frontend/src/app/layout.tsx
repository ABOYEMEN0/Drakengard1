import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://leor.sa"),
  title: {
    default: "LEOR — Premium Coffee, Chocolate & Gourmet Boutique",
    template: "%s | LEOR",
  },
  description:
    "LEOR is a luxury gourmet maison: single-origin coffee, bean-to-bar chocolate, premium nuts, brewing accessories and curated gift boxes, delivered across Saudi Arabia.",
  keywords: ["premium coffee", "luxury chocolate", "gourmet nuts", "gift boxes", "Saudi Arabia"],
  openGraph: {
    type: "website",
    siteName: "LEOR",
    title: "LEOR — Premium Coffee, Chocolate & Gourmet Boutique",
    description:
      "Single-origin coffee, bean-to-bar chocolate and curated gourmet gifts. Minimal luxury, delivered.",
    images: [{ url: "/images/hero.svg", width: 1600, height: 900, alt: "LEOR" }],
  },
  icons: { icon: "/favicon.svg" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LEOR",
    url: "https://leor.sa",
    logo: "https://leor.sa/logo.svg",
    sameAs: ["https://instagram.com/leor.sa"],
  };

  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} ${plexArabic.variable}`}>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-button focus:bg-navy focus:px-4 focus:py-2 focus:text-ivory"
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <Toaster />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </body>
    </html>
  );
}
