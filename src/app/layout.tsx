import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CookiesBanner from "@/components/CookiesBanner";
import IsaacTestPopup from "@/components/IsaacTestPopup";
import MetaPixel from "@/components/analytics/MetaPixel";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import MicrosoftClarity from "@/components/analytics/MicrosoftClarity";
import AttributionTracker from "@/components/analytics/AttributionTracker";
import JsonLd from "@/components/JsonLd";
import { organizationSchema, storeSchema, websiteSchema } from "@/lib/schema-org";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com"),
  title: {
    default: "100dola sport Šternberk — kola, běh, ski · servis · Malaga",
    template: "%s · 100dola",
  },
  description:
    "Sportovní obchod ve Šternberku — silniční, gravel a horská kola, běžecké vybavení, lyže a skialpy. Servis kol, bikefit, testovací jízdy ISAAC. Přeprava kol do Malagy.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    siteName: "100dola",
    title: "100dola sport Šternberk — kola, běh, ski · servis · Malaga",
    description:
      "Sportovní obchod ve Šternberku — kola, běh, lyže, skialpy. Servis, bikefit, testovací jízdy. Přeprava kol do Malagy.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "100dola sport Šternberk — kola, běh, ski",
    description:
      "Sportovní obchod ve Šternberku — kola, běh, lyže, skialpy. Servis, bikefit, přeprava kol do Malagy.",
  },
  verification: {
    other: {
      "facebook-domain-verification": "2iygdzydbmasl364hh1qfhn11yjzi5",
      // Bing Webmaster fallback — pokud import z GSC selže, nastavit
      // BING_SITE_VERIFICATION env var (hodnota z Bing Webmaster → Add a site → HTML meta tag).
      ...(process.env.BING_SITE_VERIFICATION
        ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
        : {}),
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-inter)]">
        {children}
        <IsaacTestPopup />
        <CookiesBanner />
        <MetaPixel />
        <GoogleAnalytics />
        <MicrosoftClarity />
        <AttributionTracker />
        <SpeedInsights />
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <JsonLd data={storeSchema()} />
      </body>
    </html>
  );
}
