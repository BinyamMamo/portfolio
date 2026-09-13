import { HeaderClient } from '@/components/header-client';
import { RESUME_HREF } from '@/lib/constants';
import { buildNavigation } from '@/lib/navigation';
import { tech } from '@/lib/tech';
import { getNavigationContent, getProfile, getProjects, getSkillGroups } from '@/server/content';

export async function SiteHeader() {
  const [profile, projects, skills, navigation] = await Promise.all([
    getProfile(),
    getProjects(),
    getSkillGroups(),
    getNavigationContent(),
  ]);
  const github = profile.links.find((link) => link.icon === 'github');

  return (
    <HeaderClient
      nav={buildNavigation({ profile, projects, skills, navigation })}
      resumeHref={RESUME_HREF}
      github={github ? { href: github.url, icon: tech.github.logo.icon } : undefined}
    />
  );
}
