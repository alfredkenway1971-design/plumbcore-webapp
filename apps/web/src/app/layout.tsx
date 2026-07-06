import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import I18nWrapper from "@/components/I18nWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PlumbCore AI — The AI-Powered Plumber OS",
  description:
    "Run your entire plumbing business from one app. AI estimates, smart scheduling, automated invoicing, and inventory management — flat-rate pricing, no per-tech fees.",
  keywords: [
    "plumbing",
    "field service",
    "CRM",
    "estimates",
    "invoicing",
    "AI",
    "plumber software",
  ],
  authors: [{ name: "PlumbCore AI" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <I18nWrapper>{children}</I18nWrapper>
      </body>
    </html>
  );
}
