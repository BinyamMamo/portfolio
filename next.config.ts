import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // next dev would otherwise keep regenerating AGENTS.md and CLAUDE.md in the repo root.
  agentRules: false,
  // Native and font-loading packages used by the CV renderer and media processing.
  serverExternalPackages: ['@react-pdf/renderer', 'sharp'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // /p/<slug> is a short alias for a project page, so a printed CV link stays readable.
  // A rewrite rather than a redirect, so /projects/<slug> remains the one canonical URL.
  async rewrites() {
    return [{ source: '/p/:slug', destination: '/projects/:slug' }];
  },
};

export default nextConfig;
