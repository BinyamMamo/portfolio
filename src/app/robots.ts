import type { MetadataRoute } from 'next';

import { getProfile } from '@/server/content';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { siteUrl } = await getProfile();

  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/login', '/api/'] },
    sitemap: `${siteUrl.replace(/\/$/, '')}/sitemap.xml`,
  };
}
