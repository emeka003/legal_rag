import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude pdf-parse from server bundle - it tries to load test files
  serverExternalPackages: ['pdf-parse'],
  
  // Configure Turbopack
  turbopack: {
    root: process.cwd(),
  },
  
  // Output standalone for Docker
  output: 'standalone',
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
