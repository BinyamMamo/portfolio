import type { MetadataRoute } from 'next';

import { projects } from '@/content/projects';
import { site } from '@/content/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url },
    { url: `${site.url}/projects` },
    ...projects.map((project) => ({ url: `${site.url}/projects/${project.slug}` })),
  ];
}
