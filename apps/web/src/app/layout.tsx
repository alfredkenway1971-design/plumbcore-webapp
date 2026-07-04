import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { I18nProvider } from "@/components/i18n-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PlumbCore AI — Smart Plumbing Operations",
  description:
    "AI-powered business operating system for plumbing companies. Estimates, diagnostics, scheduling, and CRM.",
  keywords: [
    "plumbing",
    "field service",
    "CRM",
    "estimates",
    "invoicing",
    "AI",
  ],
  authors: [{ name: "PlumbCore AI" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ transition: 'background-color 0.3s ease, color 0.3s ease' }}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('plumbcore-theme') || 'dark';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex transition-colors duration-300">
        <QueryProvider>
          <I18nProvider>{children}</I18nProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
