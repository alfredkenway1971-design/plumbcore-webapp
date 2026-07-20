import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 768, 1080, 1920],
  },
};

export default nextConfig;
