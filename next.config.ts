import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Konfiguracja dla zewnętrznych pakietów
  serverExternalPackages: ['playwright-core', 'playwright'],
  
  // Optymalizacje wydajności
  compress: true, // Kompresja gzip
  
  // Optymalizacja importów
  modularizeImports: {
    'react-icons': {
      transform: 'react-icons/{{member}}',
    },
  },
  
  // Optymalizacja obrazów
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  
  // Konfiguracja dla API Routes
  experimental: {
    optimizePackageImports: ['react-icons', 'framer-motion'],
  },
};

export default nextConfig;
