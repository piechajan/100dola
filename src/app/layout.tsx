import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CookiesBanner from "@/components/CookiesBanner";
import MetaPixel from "@/components/analytics/MetaPixel";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://100dolamalaga.cz"),
  title: "100dola — Sport. Komunita. Malaga.",
  description:
    "Vybavíme tě na sport, dostaneme tvé kolo do Malagy a propojíme tě s komunitou lidí, kteří to myslí vážně.",
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
        <CookiesBanner />
        <MetaPixel />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
