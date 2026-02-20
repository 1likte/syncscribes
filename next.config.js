const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    // Add your production image domains here
    domains: process.env.NODE_ENV === 'production'
      ? (process.env.NEXT_PUBLIC_IMAGE_DOMAINS?.split(',') || [])
      : ['localhost'],
    remotePatterns: process.env.NEXT_PUBLIC_IMAGE_DOMAINS
      ? process.env.NEXT_PUBLIC_IMAGE_DOMAINS.split(',').map(domain => ({
        protocol: 'https',
        hostname: domain.trim(),
      }))
      : [],
  },
  // Production optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  transpilePackages: ['pdfjs-dist', 'react-pdf'],
  experimental: {
    esmExternals: 'loose',
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    config.resolve.alias['pdfjs-dist'] = path.join(__dirname, 'node_modules/pdfjs-dist');
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
  // pdfjs-dist should be transpiled, not externalized (already handled by transpilePackages)
  // Security headers (only in production)
  async headers() {
    if (process.env.NODE_ENV !== 'production') {
      return []
    }

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.stripe.com https://cdnjs.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com",
              "connect-src 'self' https://*.stripe.com https://i.pravatar.cc https://cdnjs.cloudflare.com",
              "frame-src 'self' https://*.stripe.com",
              "media-src 'self'",
              "worker-src 'self' blob: https://cdnjs.cloudflare.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; ')
          }
        ]
      }
    ]
  },
}

module.exports = nextConfig
