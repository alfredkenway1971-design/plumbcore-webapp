import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No redirects - let routes handle themselves
  // Public pages: /quote/[slug], /q/[token], /submit-quote/[slug], /
  // Protected pages: /dashboard/*, /jobs, /clients, etc.
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 768, 1080, 1920],
  },
};

export default nextConfig;
