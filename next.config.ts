import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Konfiguracja dla zewnętrznych pakietów
  serverExternalPackages: ['playwright-core', 'playwright'],
  
  // Konfiguracja dla API Routes
  experimental: {},
};

export default nextConfig;
