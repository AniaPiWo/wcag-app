import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Konfiguracja dla zewnętrznych pakietów
  serverExternalPackages: ['playwright-core', 'playwright'],
  
  // Konfiguracja dla API Routes
  experimental: {
    optimizePackageImports: ['framer-motion', 'react-icons'],
  },
  
  // Optymalizacje wydajności
  compress: true,
  poweredByHeader: false,
  
  // Optymalizacja obrazów
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
