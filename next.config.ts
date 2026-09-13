import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // next dev would otherwise keep regenerating AGENTS.md and CLAUDE.md in the repo root.
  agentRules: false,
  // Native and font-loading packages used by the CV renderer and media processing.
  serverExternalPackages: ['@react-pdf/renderer', 'sharp'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
