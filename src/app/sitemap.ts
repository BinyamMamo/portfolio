import type { MetadataRoute } from 'next';

import { getProfile, getProjects } from '@/server/content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [profile, projects] = await Promise.all([getProfile(), getProjects()]);
  const base = profile.siteUrl.replace(/\/$/, '');

  return [
    { url: base },
    { url: `${base}/projects` },
    ...projects.map((project) => ({ url: `${base}/projects/${project.slug}` })),
  ];
}
