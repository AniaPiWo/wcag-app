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
};

export default nextConfig;
