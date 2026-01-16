import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Required for static HTML export to Xserver
  trailingSlash: true, // Ensures /page/ instead of /page for static hosting
  images: {
    unoptimized: true, // Required for static export (no Next.js image server)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        port: '',
        pathname: '/images/I/**',
      },
    ],
  },
};

export default nextConfig;

// Restart trigger: 2026-01-14 00:20

