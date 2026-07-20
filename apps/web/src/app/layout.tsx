import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import I18nWrapper from "@/components/I18nWrapper";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PlumbCore AI — The AI-Powered Plumber OS",
  description:
    "Run your entire plumbing business from one app. AI estimates, smart scheduling, automated invoicing, and inventory management — flat-rate pricing, no per-tech fees.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  keywords: [
    "plumbing",
    "field service",
    "CRM",
    "estimates",
    "invoicing",
    "AI",
    "plumber software",
    "plumbing business management",
    "HVAC software",
  ],
  authors: [{ name: "PlumbCore AI" }],
  openGraph: {
    title: "PlumbCore AI — The AI-Powered Plumber OS",
    description:
      "AI-powered plumbing business management. Photo estimates, smart scheduling, voice-to-invoice, inventory tracking. Start your free trial today.",
    url: "https://plumbcore-ai.vercel.app",
    siteName: "PlumbCore AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PlumbCore AI — The AI-Powered Plumber OS",
    description:
      "Run your entire plumbing business from one app. AI estimates, smart scheduling, automated invoicing.",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://plumbcore-ai.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <I18nWrapper>{children}</I18nWrapper>
        <Analytics />
      </body>
    </html>
  );
}
