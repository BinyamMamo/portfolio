import { HeaderClient } from '@/components/header-client';
import { navigation } from '@/content/navigation';
import { site } from '@/content/site';
import { tech } from '@/lib/tech';

export function SiteHeader() {
  return (
    <HeaderClient
      nav={navigation}
      resumeHref={site.resume}
      github={{ href: 'https://github.com/BinyamMamo', icon: tech.github.logo.icon }}
    />
  );
}
