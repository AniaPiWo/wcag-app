import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Konfiguracja dla API Routes
  experimental: {
    serverComponentsExternalPackages: ['playwright-core', 'playwright']
  },
  // Zwiększenie limitu czasu dla API Routes
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  // Wyłączenie minifikacji dla lepszego debugowania
  webpack: (config, { dev, isServer }) => {
    if (dev && isServer) {
      config.optimization.minimize = false;
    }
    return config;
  },
};

export default nextConfig;
