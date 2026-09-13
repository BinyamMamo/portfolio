import { getProject, type Project, projects } from '@/content/projects';
import { site } from '@/content/site';
import { skillGroups } from '@/content/skills';
import type { NavEntry, NavLink } from '@/lib/nav';
import { getTech } from '@/lib/tech';

function requireProject(slug: string): Project {
  const project = getProject(slug);
  if (!project) throw new Error(`Unknown project slug in navigation: ${slug}`);
  return project;
}

function projectLink(slug: string): NavLink {
  const project = requireProject(slug);
  return { label: project.name, href: `/projects/${project.slug}`, description: project.tagline };
}

const projectGroups = [
  { title: 'AI and computer vision', slugs: ['visionaid', 'certiscan', 'labaid', 'manim-generator'] },
  { title: 'Web platforms', slugs: ['funkey', 'peersphere', 'mindwave'] },
  { title: 'Simulations and games', slugs: ['birthday-paradox', 'chess-turtle'] },
];

const featured = requireProject('funkey');
const featuredCover = featured.cover;
const skillCount = skillGroups.reduce((total, group) => total + group.items.length, 0);
const github = site.socials.find((social) => social.label === 'GitHub');

export const navigation: NavEntry[] = [
  {
    label: 'Projects',
    href: '/projects',
    expandOnMobile: true,
    groups: projectGroups.map((group) => ({ title: group.title, items: group.slugs.map(projectLink) })),
    featured: featuredCover && {
      eyebrow: 'Top 5 at ALX',
      label: featured.name,
      href: `/projects/${featured.slug}`,
      description: featured.tagline,
      image: featuredCover.kind === 'video' ? featuredCover.poster : featuredCover.src,
    },
    footer: {
      label: 'All projects',
      href: '/projects',
      description: `${projects.length} projects across web, AI and desktop`,
    },
  },
  {
    label: 'Skills',
    href: '/#skills',
    expandOnMobile: false,
    groups: skillGroups.map((group) => ({
      title: group.title,
      items: group.items.map((id) => {
        const { name, logo } = getTech(id);
        return { label: name, href: '/#skills', logo };
      }),
    })),
    footer: {
      label: 'Skills section',
      href: '/#skills',
      description: `${skillCount} technologies across languages, backend, data, frontend and infrastructure`,
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
          { label: 'Email', href: `mailto:${site.email}`, description: site.email, icon: 'mail', external: true },
          ...site.socials
            .filter((social) => social !== github)
            .map((social) => ({
              label: social.label,
              href: social.href,
              description: social.handle,
              logo: social.logo,
              external: true,
            })),
        ],
      },
      {
        title: 'Profile',
        items: [
          ...(github
            ? [{ label: github.label, href: github.href, description: github.handle, logo: github.logo, external: true }]
            : []),
          { label: 'Resume', href: site.resume, description: 'One-page PDF', icon: 'file', external: true },
        ],
      },
    ],
    footer: { label: 'Contact section', href: '/#contact', description: `Based in ${site.location}` },
  },
];
