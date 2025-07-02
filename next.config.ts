import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Konfiguracja dla zewnętrznych pakietów
  serverExternalPackages: ['playwright-core', 'playwright'],
  
  // Konfiguracja dla API Routes
  experimental: {},
  
  // Konfiguracja dla czcionek
  fontLoaders: {
    localFont: true,
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
