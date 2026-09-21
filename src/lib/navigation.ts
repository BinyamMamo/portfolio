import { RESUME_HREF } from '@/lib/constants';
import { linkLogos } from '@/lib/links';
import type { NavEntry, NavLink, NavLinkGroup } from '@/lib/nav';
import type { NavigationContent, Profile, Project, SkillGroup } from '@/lib/schemas';
import { getTech } from '@/lib/tech';

interface NavigationInput {
  profile: Profile;
  projects: Project[];
  skills: SkillGroup[];
  navigation: NavigationContent;
}

const projectLink = (project: Project): NavLink => ({
  label: project.name,
  href: `/projects/${project.slug}`,
  description: project.tagline,
  preview: project.cover
    ? {
        image: project.cover.kind === 'video' ? project.cover.poster : project.cover.src,
        eyebrow: project.client?.name ?? project.category,
        summary: project.summary,
      }
    : undefined,
});

/** Builds the top bar, including the Projects, Skills and Contact mega menus, from stored content. */
export function buildNavigation({ profile, projects, skills, navigation }: NavigationInput): NavEntry[] {
  const bySlug = new Map(projects.map((project) => [project.slug, project]));

  const projectGroups: NavLinkGroup[] = navigation.projectGroups
    .map((group) => ({
      title: group.title,
      items: group.slugs.flatMap((slug) => {
        const project = bySlug.get(slug);
        return project ? [projectLink(project)] : [];
      }),
    }))
    .filter((group) => group.items.length > 0);

  // Client work always leads; everything else is reachable from "All projects".
  const clientProjects = projects.filter((project) => project.kind === 'client');
  if (clientProjects.length > 0) {
    projectGroups.unshift({ title: 'Client work', items: clientProjects.slice(0, 5).map(projectLink) });
  }

  const featured = navigation.featured ? bySlug.get(navigation.featured.slug) : undefined;
  const featuredCover = featured?.cover;
  const skillCount = skills.reduce((total, group) => total + group.items.length, 0);
  const github = profile.links.find((link) => link.icon === 'github');
  const profileLink = (link: Profile['links'][number]): NavLink => ({
    label: link.label,
    href: link.url,
    description: link.handle,
    logo: linkLogos[link.icon],
    icon: linkLogos[link.icon] ? undefined : 'globe',
    external: true,
  });

  return [
    {
      label: 'Projects',
      href: '/projects',
      expandOnMobile: true,
      groups: projectGroups,
      featured:
        featured && featuredCover && navigation.featured
          ? {
              eyebrow: navigation.featured.eyebrow,
              label: featured.name,
              href: `/projects/${featured.slug}`,
              description: featured.tagline,
              image: featuredCover.kind === 'video' ? featuredCover.poster : featuredCover.src,
            }
          : undefined,
      footer: {
        label: 'All projects',
        href: '/projects',
        description: `${projects.length} projects, ${clientProjects.length} of them for clients`,
      },
    },
    {
      label: 'Skills',
      href: '/#skills',
      expandOnMobile: false,
      groups: skills.map((group) => ({
        title: group.title,
        items: group.items.map((id) => {
          const { name, logo } = getTech(id);
          return { label: name, href: '/#skills', logo };
        }),
      })),
      footer: {
        label: 'Skills section',
        href: '/#skills',
        description: `${skillCount} technologies across ${skills.length} areas`,
      },
    },
    { label: 'Experience', href: '/#experience' },
    { label: 'Education', href: '/#education' },
    {
      label: 'Contact',
      href: '/#contact',
      expandOnMobile: true,
      groups: [
        {
          title: 'Get in touch',
          items: [
            { label: 'Email', href: `mailto:${profile.email}`, description: profile.email, icon: 'mail', external: true },
            ...profile.links.filter((link) => link !== github).map(profileLink),
          ],
        },
        {
          title: 'Profile',
          items: [
            ...(github ? [profileLink(github)] : []),
            { label: 'Resume', href: RESUME_HREF, description: 'PDF', icon: 'file', external: true },
          ],
        },
      ],
      footer: {
        label: 'Contact section',
        href: '/#contact',
        description: profile.location ? `Based in ${profile.location}` : undefined,
      },
    },
  ];
}
