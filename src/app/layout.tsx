import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CookiesBanner from "@/components/CookiesBanner";
import IsaacTestPopup from "@/components/IsaacTestPopup";
import MetaPixel from "@/components/analytics/MetaPixel";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import JsonLd from "@/components/JsonLd";
import { organizationSchema, storeSchema, websiteSchema } from "@/lib/schema-org";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com"),
  title: {
    default: "100dola — Sport. Komunita. Malaga.",
    template: "%s · 100dola",
  },
  description:
    "Vybavíme tě na sport, dostaneme tvé kolo do Malagy a propojíme tě s komunitou lidí, kteří to myslí vážně.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    siteName: "100dola",
    title: "100dola — Sport. Komunita. Malaga.",
    description:
      "Vybavíme tě na sport, dostaneme tvé kolo do Malagy a propojíme tě s komunitou lidí, kteří to myslí vážně.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "100dola — Sport. Komunita. Malaga.",
    description:
      "Sport. Komunita. Malaga. Jeden ekosystém pro aktivní lidi.",
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
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <JsonLd data={storeSchema()} />
      </body>
    </html>
  );
}
