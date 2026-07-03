import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/en/dashboard",
        permanent: true,
      },
    ];
  },
  i18n: {
    locales: ["en", "fr", "es", "de"],
    defaultLocale: "en",
    localeDetection: false,
  },
};

export default nextConfig;