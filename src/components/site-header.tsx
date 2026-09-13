import { HeaderClient } from '@/components/header-client';
import { navigation } from '@/content/navigation';
import { site } from '@/content/site';
import { tech } from '@/lib/tech';

export function SiteHeader() {
  return (
    <HeaderClient
      name={site.name}
      nav={navigation}
      resumeHref={site.resume}
      github={{ href: 'https://github.com/BinyamMamo', logo: tech.github.logo }}
    />
  );
}
