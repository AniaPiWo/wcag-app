import type { NextConfig } from "next";

// 🚀 PERFORMANCE: Bundle analyzer
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

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
    // 🚀 PERFORMANCE: Włącz turbo mode dla szybszego buildu
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // 🚀 PERFORMANCE: Webpack optimizations
  webpack: (config, { dev }) => {
    // Optymalizacje tylko dla produkcji
    if (!dev) {
      // Tree shaking dla dużych bibliotek
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Chunk splitting dla lepszego cache'owania
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          wcag: {
            test: /[\\/]src[\\/]lib[\\/]wcag_checklist[\\/]/,
            name: 'wcag-checklist',
            chunks: 'all',
            priority: 10,
          },
        },
      };
    }
    
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
